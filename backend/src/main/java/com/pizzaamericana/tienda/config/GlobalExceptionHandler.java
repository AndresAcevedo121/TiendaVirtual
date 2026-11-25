package com.pizzaamericana.tienda.config;

import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.pizzaamericana.tienda.exception.NegocioException;
import com.pizzaamericana.tienda.exception.ServicioCoberturaException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** Errores de validación de los DTOs: se dice qué campo falló, nunca detalles internos. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String detalles = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        String campos = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getField)
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Datos inválidos o faltantes (" + campos + "): " + detalles));
    }

    /** Reglas de negocio: su mensaje está escrito para el cliente. */
    @ExceptionHandler(NegocioException.class)
    public ResponseEntity<Map<String, String>> handleNegocio(NegocioException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
    }

    /** El servicio de cobertura no respondió: el cliente ve un mensaje simple; el detalle ya quedó en el log. */
    @ExceptionHandler(ServicioCoberturaException.class)
    public ResponseEntity<Map<String, String>> handleCobertura(ServicioCoberturaException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("message", "No pudimos validar tu dirección, intenta de nuevo."));
    }

    /** JSON mal formado o tipos incorrectos: mensaje genérico, sin el detalle del parser. */
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<Map<String, String>> handleSolicitudInvalida(Exception ex) {
        log.warn("Solicitud inválida: {}", ex.getClass().getSimpleName());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Solicitud inválida."));
    }

    /** Cualquier otro error: el cliente ve un mensaje simple; el detalle queda solo en el log. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleInesperado(Exception ex) {
        log.error("Error inesperado", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Ocurrió un error, intenta de nuevo."));
    }
}

