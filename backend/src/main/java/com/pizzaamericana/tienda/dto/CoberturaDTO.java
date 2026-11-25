package com.pizzaamericana.tienda.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Datos del servicio de cobertura de servicios-pizzaamericana.
 * Siguen el contrato docs/contratos/cobertura-v1.yaml.
 */
public final class CoberturaDTO {

    private CoberturaDTO() {
    }

    /** Lo que manda el navegador a este backend. Mismos límites que valida el servicio de cobertura. */
    public record Solicitud(
            @NotBlank
            @Size(min = 5, max = 150)
            @Pattern(regexp = "^[\\p{L}\\p{N} #\\-.,/°º]*$", message = "La dirección tiene caracteres no permitidos")
            String direccion,
            @Size(max = 60)
            @Pattern(regexp = "^[\\p{L} .\\-]*$", message = "El municipio tiene caracteres no permitidos")
            String municipio,
            @Size(max = 80)
            @Pattern(regexp = "^[\\p{L}\\p{N} #\\-.,/°º]*$", message = "El barrio tiene caracteres no permitidos")
            String barrio) {
    }

    /** Respuesta del servicio de cobertura (se ignoran los campos que no se usan). */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Respuesta(String estado, boolean cobertura, String mensaje, Tienda tienda, Ubicacion ubicacion) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Tienda(Integer id, String nombre, String estado) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Ubicacion(Double latitud, Double longitud, String direccionEncontrada) {
    }

    /**
     * Lo que este backend le devuelve al navegador: estado de cobertura, mensaje y datos públicos
     * de la tienda asignada (id, nombre y disponibilidad) sin exponer coordenadas.
     */
    public record Resultado(String estado, boolean cobertura, String mensaje, Integer idTienda, String nombreTienda, boolean tiendaDisponible) {
    }
}
