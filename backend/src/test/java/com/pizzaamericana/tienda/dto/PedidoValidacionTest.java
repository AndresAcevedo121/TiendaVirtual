package com.pizzaamericana.tienda.dto;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.Set;

import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

/** Pruebas de las correcciones 3 y 7 (validaciones del pedido). Sin base de datos. */
class PedidoValidacionTest {

    private final Validator validador = Validation.buildDefaultValidatorFactory().getValidator();

    private static PedidoDTO.CreacionRequest pedidoValido() {
        PedidoDTO.CreacionRequest r = new PedidoDTO.CreacionRequest();
        r.setOrderToken("order_123");
        r.setIdtienda(1);
        r.setClienteNombre("Ana");
        r.setClienteTelefono("3001234567");
        r.setAutorizacionDatos(true);
        r.setItems(new ArrayList<>());
        return r;
    }

    private boolean fallaEn(PedidoDTO.CreacionRequest r, String campo) {
        Set<ConstraintViolation<PedidoDTO.CreacionRequest>> v = validador.validate(r);
        return v.stream().anyMatch(x -> x.getPropertyPath().toString().equals(campo));
    }

    @Test
    void unPedidoCorrectoNoTieneErrores() {
        assertTrue(validador.validate(pedidoValido()).isEmpty());
    }

    @Test
    void sinAutorizacionDeDatosElPedidoSeRechaza() {
        PedidoDTO.CreacionRequest r = pedidoValido();
        r.setAutorizacionDatos(false);
        assertTrue(fallaEn(r, "autorizacionDatos"));
    }

    @Test
    void laAutorizacionNulaTambienSeRechaza() {
        PedidoDTO.CreacionRequest r = pedidoValido();
        r.setAutorizacionDatos(null);
        assertTrue(fallaEn(r, "autorizacionDatos"));
    }

    @Test
    void unOrderTokenDeMasDe64CaracteresSeRechaza() {
        PedidoDTO.CreacionRequest r = pedidoValido();
        r.setOrderToken("x".repeat(65));
        assertTrue(fallaEn(r, "orderToken"));
    }

    @Test
    void unOrderTokenDe64CaracteresSeAcepta() {
        PedidoDTO.CreacionRequest r = pedidoValido();
        r.setOrderToken("x".repeat(64));
        assertTrue(validador.validate(r).isEmpty());
    }
}
