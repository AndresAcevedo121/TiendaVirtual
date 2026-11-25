package com.pizzaamericana.tienda.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

import com.pizzaamericana.tienda.dto.CotizacionDTO;
import com.pizzaamericana.tienda.exception.NegocioException;
import com.pizzaamericana.tienda.model.EspecialidadTamano;
import com.pizzaamericana.tienda.model.Producto;
import com.pizzaamericana.tienda.model.ProductoAdicion;
import com.pizzaamericana.tienda.model.Tienda;
import com.pizzaamericana.tienda.repository.EspecialidadTamanoRepository;
import com.pizzaamericana.tienda.repository.ProductoAdicionRepository;
import com.pizzaamericana.tienda.repository.ProductoRepository;
import com.pizzaamericana.tienda.repository.TiendaProductoExcepcionRepository;
import com.pizzaamericana.tienda.repository.TiendaRepository;

/** Pruebas de la corrección 4 (solo se vende lo vendible). No usan base de datos: repositorios simulados. */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CotizacionServiceTest {

    @Mock TiendaRepository tiendaRepository;
    @Mock ProductoRepository productoRepository;
    @Mock EspecialidadTamanoRepository especialidadTamanoRepository;
    @Mock ProductoAdicionRepository productoAdicionRepository;
    @Mock TiendaProductoExcepcionRepository excepcionRepository;
    @InjectMocks CotizacionService servicio;

    private Tienda tienda;
    private Producto pizza;

    @BeforeEach
    public void preparar() {
        ReflectionTestUtils.setField(servicio, "costoDomicilioBase", new BigDecimal("5000.00"));
        ReflectionTestUtils.setField(servicio, "pedidoMinimo", new BigDecimal("17000.00"));

        tienda = new Tienda();
        tienda.setIdtienda(1);
        tienda.setNombre("Manrique");
        tienda.setActivo(true);
        tienda.setBloqueada(false);
        tienda.setPermiteDomicilio(true);
        tienda.setPermiteRecoger(true);
        when(tiendaRepository.findById(1)).thenReturn(Optional.of(tienda));

        pizza = producto(11, "Pizza Mediana", "P", "39000");
        pizza.setPermiteDividir(true);
        when(productoRepository.findById(11)).thenReturn(Optional.of(pizza));
        when(excepcionRepository.findByIdtiendaAndIdproducto(1, 11)).thenReturn(Optional.empty());
    }

    // ---------- Correccion 4: solo se vende lo vendible ----------

    @Test
    void unIngredienteSueltoNoSePuedePedirComoProducto() {
        Producto ingrediente = producto(202, "Piña", "A", "1000");
        when(productoRepository.findById(202)).thenReturn(Optional.of(ingrediente));
        assertNotNull(assertThrows(NegocioException.class, () -> servicio.cotizarPedido(pedido("RECOGER", item(202)))));
    }

    @Test
    void unProductoInactivoSeRechaza() {
        pizza.setActivo(false);
        assertNotNull(assertThrows(NegocioException.class, () -> servicio.cotizarPedido(pedido("RECOGER", item(11)))));
    }

    @Test
    void unProductoQueNoAplicaADomicilioSeRechazaSoloEnDomicilio() {
        pizza.setAplicaDomicilio(false);
        assertNotNull(assertThrows(NegocioException.class, () -> servicio.cotizarPedido(pedido("DOMICILIO", item(11)))));
        // Para recoger en tienda sí se puede
        assertEquals(new BigDecimal("39000"), servicio.cotizarPedido(pedido("RECOGER", item(11))).getTotal());
    }

    // ---------- Correccion 5: adiciones y especialidades ----------

    @Test
    void laAdicionSeCobraConElPrecioDeAdicionDelTamano() {
        Producto queso = producto(303, "Extra Queso", "A", "1");   // su precio base NO debe usarse
        when(productoAdicionRepository.findByTamanoIdproducto(11))
                .thenReturn(List.of(adicion(pizza, queso, "7000")));

        CotizacionDTO.ItemRequest it = item(11);
        it.setIdadiciones(List.of(303));
        CotizacionDTO.Response r = servicio.cotizarPedido(pedido("RECOGER", it));

        assertEquals(new BigDecimal("46000"), r.getTotal());   // 39000 + 7000
    }

    @Test
    void unaAdicionQueNoPerteneceAlTamanoSeRechaza() {
        when(productoAdicionRepository.findByTamanoIdproducto(11)).thenReturn(List.of());
        CotizacionDTO.ItemRequest it = item(11);
        it.setIdadiciones(List.of(303));
        assertNotNull(assertThrows(NegocioException.class, () -> servicio.cotizarPedido(pedido("RECOGER", it))));
    }

    @Test
    void unaEspecialidadSinRelacionConElTamanoSeRechazaEnVezDeCobrarCero() {
        Producto hawaiana = producto(101, "Hawaiana", "D", "0");
        when(productoRepository.findById(101)).thenReturn(Optional.of(hawaiana));
        when(especialidadTamanoRepository.findByTamanoIdproducto(11)).thenReturn(List.of());

        CotizacionDTO.ItemRequest it = item(11);
        it.setIdespecialidad1(101);
        assertNotNull(assertThrows(NegocioException.class, () -> servicio.cotizarPedido(pedido("RECOGER", it))));
    }

    @Test
    void laEspecialidadValidaSumaSuRecargo() {
        Producto peperoni = producto(105, "Peperoni", "D", "0");
        when(productoRepository.findById(105)).thenReturn(Optional.of(peperoni));
        when(especialidadTamanoRepository.findByTamanoIdproducto(11))
                .thenReturn(List.of(especialidad(pizza, peperoni, "3500")));

        CotizacionDTO.ItemRequest it = item(11);
        it.setIdespecialidad1(105);
        assertEquals(new BigDecimal("42500"), servicio.cotizarPedido(pedido("RECOGER", it)).getTotal());
    }

    @Test
    void mitadYMitadSoloSiElProductoLoPermite() {
        pizza.setPermiteDividir(false);
        CotizacionDTO.ItemRequest it = item(11);
        it.setEsMitadMitad(true);
        it.setIdespecialidad1(101);
        it.setIdespecialidad2(105);
        assertNotNull(assertThrows(NegocioException.class, () -> servicio.cotizarPedido(pedido("RECOGER", it))));
    }

    // ---------- Auxiliares ----------

    private static Producto producto(int id, String nombre, String tipo, String precio) {
        Producto p = new Producto();
        p.setIdproducto(id);
        p.setNombre(nombre);
        p.setTipoProducto(tipo);
        p.setPrecioBase(new BigDecimal(precio));
        p.setActivo(true);
        p.setAplicaDomicilio(true);
        return p;
    }

    private static ProductoAdicion adicion(Producto tamano, Producto item, String precio) {
        ProductoAdicion a = new ProductoAdicion();
        a.setTamano(tamano);
        a.setAdicionItem(item);
        a.setPrecioAdicion(new BigDecimal(precio));
        return a;
    }

    private static EspecialidadTamano especialidad(Producto tamano, Producto esp, String recargo) {
        EspecialidadTamano e = new EspecialidadTamano();
        e.setTamano(tamano);
        e.setEspecialidad(esp);
        e.setRecargo(new BigDecimal(recargo));
        return e;
    }

    private static CotizacionDTO.ItemRequest item(int idProducto) {
        CotizacionDTO.ItemRequest it = new CotizacionDTO.ItemRequest();
        it.setIdproducto(idProducto);
        it.setCantidad(1);
        return it;
    }

    private static CotizacionDTO.Request pedido(String tipoEntrega, CotizacionDTO.ItemRequest... items) {
        CotizacionDTO.Request r = new CotizacionDTO.Request();
        r.setIdtienda(1);
        r.setTipoEntrega(tipoEntrega);
        r.setItems(List.of(items));
        return r;
    }
}
