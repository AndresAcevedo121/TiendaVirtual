package com.pizzaamericana.tienda.service;

import com.pizzaamericana.tienda.dto.CotizacionDTO;
import com.pizzaamericana.tienda.dto.PedidoDTO;
import com.pizzaamericana.tienda.exception.NegocioException;
import com.pizzaamericana.tienda.model.*;
import com.pizzaamericana.tienda.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Hace el trabajo de crear el pedido DENTRO de una transaccion.
 * Va en una clase aparte para que PedidoService pueda atrapar el error de "token repetido"
 * FUERA de esa transaccion (una transaccion que fallo ya no se puede reutilizar).
 */
@Component
public class PedidoCreador {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private TiendaRepository tiendaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CotizacionService cotizacionService;

    @Transactional
    public PedidoDTO.Response crear(PedidoDTO.CreacionRequest request) {
        // 1. REGLA DE IDEMPOTENCIA (Skill 04): Si el token ya existe, devolver la orden ya creada
        Optional<Pedido> pedidoExistente = pedidoRepository.findByOrderToken(request.getOrderToken());
        if (pedidoExistente.isPresent()) {
            return mapearResponse(pedidoExistente.get(), "Pedido existente retornado por idempotencia.");
        }

        // 2. Cotizar y validar precios estrictamente en el servidor (RF-3.3)
        CotizacionDTO.Request cotRequest = new CotizacionDTO.Request();
        cotRequest.setIdtienda(request.getIdtienda());
        cotRequest.setTipoEntrega(request.getTipoEntrega());
        cotRequest.setItems(request.getItems());

        CotizacionDTO.Response cotizacion = cotizacionService.cotizarPedido(cotRequest);
        if (!Boolean.TRUE.equals(cotizacion.getValido())) {
            throw new NegocioException("Error al validar el pedido: " + cotizacion.getMensaje());
        }

        Tienda tienda = tiendaRepository.findById(request.getIdtienda())
                .orElseThrow(() -> new NegocioException("Tienda no encontrada."));

        // 3. Crear encabezado de pedido
        Pedido pedido = new Pedido();
        pedido.setOrderToken(request.getOrderToken());
        pedido.setTienda(tienda);
        pedido.setCanal("TIENDA_VIRTUAL");
        pedido.setTipoEntrega(request.getTipoEntrega());
        pedido.setEstado("WOMPI".equalsIgnoreCase(request.getFormaPago()) ? "PENDIENTE_PAGO" : "RECIBIDO");

        // Datos del cliente
        pedido.setClienteNombre(request.getClienteNombre());
        pedido.setClienteTelefono(request.getClienteTelefono());
        pedido.setClienteCorreo(request.getClienteCorreo());
        pedido.setAutorizacionDatos(request.getAutorizacionDatos());

        // Dirección según tipo de entrega (DOMICILIO vs RECOGER)
        String direccionFinal = request.getDireccionTexto();
        if ("RECOGER".equalsIgnoreCase(request.getTipoEntrega())) {
            if (direccionFinal == null || direccionFinal.trim().isEmpty()) {
                direccionFinal = "Recoge en tienda (" + tienda.getNombre() + ")";
            }
        } else {
            if (direccionFinal == null || direccionFinal.trim().isEmpty()) {
                throw new NegocioException("La dirección de entrega es obligatoria para pedidos a domicilio.");
            }
        }

        String municipioFinal = request.getMunicipio();
        if (municipioFinal == null || municipioFinal.trim().isEmpty()) {
            municipioFinal = tienda.getMunicipio() != null ? tienda.getMunicipio() : "Medellín";
        }

        pedido.setDireccionTexto(direccionFinal);
        pedido.setDireccionDetalles(request.getDireccionDetalles());
        pedido.setBarrio(request.getBarrio());
        pedido.setMunicipio(municipioFinal);
        pedido.setLatitud(request.getLatitud());
        pedido.setLongitud(request.getLongitud());

        // Valores monetarios validados
        pedido.setSubtotalProductos(cotizacion.getSubtotalProductos());
        pedido.setValorDomicilio(cotizacion.getValorDomicilio());
        pedido.setDescuento(cotizacion.getDescuento());
        pedido.setTotal(cotizacion.getTotal());

        // Pago
        pedido.setFormaPago(request.getFormaPago());
        pedido.setPagaCon(request.getPagaCon());

        // 4. Crear detalles del pedido
        for (int i = 0; i < request.getItems().size(); i++) {
            CotizacionDTO.ItemRequest itemReq = request.getItems().get(i);
            CotizacionDTO.ItemResponse itemCot = cotizacion.getItems().get(i);

            Producto producto = productoRepository.findById(itemReq.getIdproducto())
                    .orElseThrow(() -> new NegocioException("Producto no encontrado."));

            PedidoDetalle detalle = new PedidoDetalle();
            detalle.setProducto(producto);
            detalle.setNombreProducto(itemCot.getDescripcion());
            detalle.setCantidad(BigDecimal.valueOf(itemCot.getCantidad()));
            detalle.setPrecioUnitario(itemCot.getPrecioUnitario());
            detalle.setTotalLinea(itemCot.getTotalLinea());
            detalle.setObservaciones(itemReq.getObservaciones());

            if (Boolean.TRUE.equals(itemReq.getEsMitadMitad())) {
                detalle.setEsMitadMitad(true);
                detalle.setIdespecialidad1(itemReq.getIdespecialidad1());
                detalle.setIdespecialidad2(itemReq.getIdespecialidad2());
            }

            // Modificadores
            if (itemReq.getModificadores() != null) {
                for (CotizacionDTO.ModificadorRequest modReq : itemReq.getModificadores()) {
                    PedidoDetalleModificador mod = new PedidoDetalleModificador();
                    mod.setTipo(modReq.getTipo());
                    mod.setNombreIngrediente(modReq.getNombreIngrediente());
                    mod.setMitad(modReq.getMitad() != null ? modReq.getMitad() : "COMPLETA");
                    mod.setPrecioExtra(BigDecimal.ZERO);
                    detalle.addModificador(mod);
                }
            }

            pedido.addDetalle(detalle);
        }

        Pedido guardado = pedidoRepository.save(pedido);
        return mapearResponse(guardado, "Pedido creado exitosamente con cálculo verificado en servidor.");
    }

    /** Busca un pedido ya creado con ese token, en una transaccion nueva y de solo lectura. */
    @Transactional(readOnly = true)
    public Optional<PedidoDTO.Response> obtenerExistente(String orderToken) {
        return pedidoRepository.findByOrderToken(orderToken)
                .map(p -> mapearResponse(p, "Pedido existente retornado por idempotencia."));
    }

    private PedidoDTO.Response mapearResponse(Pedido p, String mensaje) {
        PedidoDTO.Response res = new PedidoDTO.Response();
        res.setIdpedido(p.getIdpedido());
        res.setOrderToken(p.getOrderToken());
        res.setIdtienda(p.getTienda().getIdtienda());
        res.setNombreTienda(p.getTienda().getNombre());
        res.setEstado(p.getEstado());
        res.setSubtotal(p.getSubtotalProductos());
        res.setValorDomicilio(p.getValorDomicilio());
        res.setTotal(p.getTotal());
        res.setFormaPago(p.getFormaPago());
        res.setTiempoEstimadoMinutos(p.getTienda().getTiempoEntregaMinutos());
        res.setFechaCreacion(p.getFechaCreacion());
        res.setMensaje(mensaje);
        return res;
    }
}
