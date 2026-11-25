package com.pizzaamericana.tienda.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import com.pizzaamericana.tienda.dto.PedidoDTO;

/** Prueba de la correccion 7: dos peticiones con el mismo orderToken no producen un error 500. */
@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock
    private PedidoCreador pedidoCreador;

    @InjectMocks
    private PedidoService servicio;

    private static PedidoDTO.CreacionRequest peticion(String token) {
        PedidoDTO.CreacionRequest r = new PedidoDTO.CreacionRequest();
        r.setOrderToken(token);
        return r;
    }

    @Test
    void siElTokenYaExisteSeDevuelveElPedidoYaCreado() {
        PedidoDTO.Response yaCreado = new PedidoDTO.Response();
        yaCreado.setIdpedido(77);
        when(pedidoCreador.crear(any())).thenThrow(new DataIntegrityViolationException("duplicado"));
        when(pedidoCreador.obtenerExistente("t-1")).thenReturn(Optional.of(yaCreado));

        PedidoDTO.Response r = servicio.crearPedido(peticion("t-1"));

        assertSame(yaCreado, r);
        assertEquals(77, r.getIdpedido());
    }

    @Test
    void unErrorDeIntegridadQueNoEsUnTokenRepetidoSeRelanza() {
        when(pedidoCreador.crear(any())).thenThrow(new DataIntegrityViolationException("otra restriccion"));
        when(pedidoCreador.obtenerExistente("t-2")).thenReturn(Optional.empty());

        assertNotNull(assertThrows(DataIntegrityViolationException.class, () -> servicio.crearPedido(peticion("t-2"))));
    }

    @Test
    void sinConflictoSeDevuelveElPedidoNuevo() {
        PedidoDTO.Response nuevo = new PedidoDTO.Response();
        when(pedidoCreador.crear(any())).thenReturn(nuevo);

        assertSame(nuevo, servicio.crearPedido(peticion("t-3")));
    }
}
