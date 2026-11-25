package com.pizzaamericana.tienda.exception;

/**
 * Error de regla de negocio cuyo mensaje es seguro mostrarle al cliente.
 * Nunca se le pone aquí información interna (tablas, consultas, trazas).
 */
public class NegocioException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public NegocioException(String mensaje) {
        super(mensaje);
    }
}
