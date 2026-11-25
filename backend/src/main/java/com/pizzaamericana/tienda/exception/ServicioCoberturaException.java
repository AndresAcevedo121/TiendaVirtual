package com.pizzaamericana.tienda.exception;

/**
 * El servicio de cobertura no pudo responder (llave inválida, demasiadas consultas, caído o con tiempo
 * agotado). Su mensaje es solo para el log: al cliente se le muestra un texto genérico.
 */
public class ServicioCoberturaException extends RuntimeException {

    public ServicioCoberturaException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
