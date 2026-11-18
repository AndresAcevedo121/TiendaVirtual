package com.pizzaamericana.tienda.service;

import com.pizzaamericana.tienda.dto.CotizacionDTO;
import com.pizzaamericana.tienda.model.*;
import com.pizzaamericana.tienda.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class CotizacionService {

    @Autowired
    private TiendaRepository tiendaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private EspecialidadTamanoRepository especialidadTamanoRepository;

    @Autowired
    private TiendaProductoExcepcionRepository excepcionRepository;

    @Value("${pizzaamericana.tienda.costo-domicilio:5000.00}")
    private BigDecimal costoDomicilioBase;

    @Value("${pizzaamericana.tienda.pedido-minimo:17000.00}")
    private BigDecimal pedidoMinimo;

    public CotizacionDTO.Response cotizarPedido(CotizacionDTO.Request request) {
        Tienda tienda = tiendaRepository.findById(request.getIdtienda())
                .orElseThrow(() -> new IllegalArgumentException("La tienda " + request.getIdtienda() + " no existe."));

        if (Boolean.TRUE.equals(tienda.getBloqueada())) {
            CotizacionDTO.Response err = new CotizacionDTO.Response();
            err.setValido(false);
            err.setMensaje("La tienda " + tienda.getNombre() + " no está recibiendo pedidos temporalmente por alta demanda.");
            return err;
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        List<CotizacionDTO.ItemResponse> itemsCotizados = new ArrayList<>();

        if (request.getItems() == null || request.getItems().isEmpty()) {
            CotizacionDTO.Response err = new CotizacionDTO.Response();
            err.setValido(false);
            err.setMensaje("El pedido no contiene productos.");
            return err;
        }

        for (CotizacionDTO.ItemRequest itemReq : request.getItems()) {
            Producto producto = productoRepository.findById(itemReq.getIdproducto())
                    .orElseThrow(() -> new IllegalArgumentException("El producto con ID " + itemReq.getIdproducto() + " no existe."));

            // Verificar si el producto está bloqueado en esta tienda
            Optional<TiendaProductoExcepcion> exc = excepcionRepository.findByIdtiendaAndIdproducto(tienda.getIdtienda(), producto.getIdproducto());
            if (exc.isPresent() && Boolean.FALSE.equals(exc.get().getDisponible())) {
                CotizacionDTO.Response err = new CotizacionDTO.Response();
                err.setValido(false);
                err.setMensaje("El producto '" + producto.getNombre() + "' se encuentra agotado en la tienda " + tienda.getNombre());
                return err;
            }

            Integer cantReq = itemReq.getCantidad();
            int cantidad = (cantReq != null && cantReq > 0) ? cantReq : 1;
            BigDecimal precioBase = exc.isPresent() && exc.get().getPrecioSobrescrito() != null
                    ? exc.get().getPrecioSobrescrito()
                    : producto.getPrecioBase();

            BigDecimal recargoEspecialidad = BigDecimal.ZERO;
            StringBuilder descBuilder = new StringBuilder(producto.getNombre());

            if ("P".equals(producto.getTipoProducto())) {
                // Cálculo para Pizza Padre (Skill 01)
                if (Boolean.TRUE.equals(itemReq.getEsMitadMitad())) {
                    if (itemReq.getIdespecialidad1() == null || itemReq.getIdespecialidad2() == null) {
                        throw new IllegalArgumentException("Una pizza mitad y mitad requiere dos especialidades seleccionadas.");
                    }
                    Producto esp1 = productoRepository.findById(itemReq.getIdespecialidad1())
                            .orElseThrow(() -> new IllegalArgumentException("Especialidad 1 no encontrada."));
                    Producto esp2 = productoRepository.findById(itemReq.getIdespecialidad2())
                            .orElseThrow(() -> new IllegalArgumentException("Especialidad 2 no encontrada."));

                    BigDecimal r1 = obtenerRecargoTamano(producto.getIdproducto(), esp1.getIdproducto());
                    BigDecimal r2 = obtenerRecargoTamano(producto.getIdproducto(), esp2.getIdproducto());

                    // Fórmula: r1/2 + r2/2
                    BigDecimal mitad1 = r1.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
                    BigDecimal mitad2 = r2.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
                    recargoEspecialidad = mitad1.add(mitad2);

                    descBuilder.append(" (Mitad ").append(esp1.getNombre()).append(" / Mitad ").append(esp2.getNombre()).append(")");
                } else {
                    if (itemReq.getIdespecialidad1() != null) {
                        Producto esp1 = productoRepository.findById(itemReq.getIdespecialidad1())
                                .orElseThrow(() -> new IllegalArgumentException("Especialidad no encontrada."));
                        recargoEspecialidad = obtenerRecargoTamano(producto.getIdproducto(), esp1.getIdproducto());
                        descBuilder.append(" (").append(esp1.getNombre()).append(")");
                    }
                }

                // Sumar adiciones
                if (itemReq.getIdadiciones() != null) {
                    for (Integer idAdicion : itemReq.getIdadiciones()) {
                        Producto adicion = productoRepository.findById(idAdicion)
                                .orElseThrow(() -> new IllegalArgumentException("Adición no encontrada: " + idAdicion));
                        recargoEspecialidad = recargoEspecialidad.add(adicion.getPrecioBase());
                        descBuilder.append(" [+").append(adicion.getNombre()).append("]");
                    }
                }
            }

            BigDecimal precioUnitario = precioBase.add(recargoEspecialidad);
            BigDecimal totalLinea = precioUnitario.multiply(BigDecimal.valueOf(cantidad));
            subtotal = subtotal.add(totalLinea);

            CotizacionDTO.ItemResponse itemRes = new CotizacionDTO.ItemResponse();
            itemRes.setIdproducto(producto.getIdproducto());
            itemRes.setDescripcion(descBuilder.toString());
            itemRes.setCantidad(cantidad);
            itemRes.setPrecioUnitario(precioUnitario);
            itemRes.setTotalLinea(totalLinea);
            itemsCotizados.add(itemRes);
        }

        BigDecimal envio = "RECOGER".equalsIgnoreCase(request.getTipoEntrega()) ? BigDecimal.ZERO : costoDomicilioBase;
        BigDecimal descuento = BigDecimal.ZERO;
        BigDecimal total = subtotal.add(envio).subtract(descuento);

        boolean cumpleMinimo = "RECOGER".equalsIgnoreCase(request.getTipoEntrega()) || subtotal.compareTo(pedidoMinimo) >= 0;

        CotizacionDTO.Response res = new CotizacionDTO.Response();
        res.setValido(cumpleMinimo);
        res.setMensaje(cumpleMinimo ? "Cotización exitosa." : "El pedido mínimo para domicilio es de $" + pedidoMinimo + ". Te faltan $" + pedidoMinimo.subtract(subtotal));
        res.setItems(itemsCotizados);
        res.setSubtotalProductos(subtotal);
        res.setValorDomicilio(envio);
        res.setDescuento(descuento);
        res.setTotal(total);
        res.setCumplePedidoMinimo(cumpleMinimo);
        res.setPedidoMinimo(pedidoMinimo);

        return res;
    }

    private BigDecimal obtenerRecargoTamano(Integer idTamano, Integer idEspecialidad) {
        return especialidadTamanoRepository.findByTamanoIdproducto(idTamano).stream()
                .filter(et -> et.getEspecialidad().getIdproducto().equals(idEspecialidad))
                .findFirst()
                .map(EspecialidadTamano::getRecargo)
                .orElse(BigDecimal.ZERO);
    }
}

