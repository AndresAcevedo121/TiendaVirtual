package com.pizzaamericana.tienda.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pizzaamericana.tienda.client.CoberturaClient;
import com.pizzaamericana.tienda.dto.CoberturaDTO;

import jakarta.validation.Valid;

/** Endpoint que usa el botón "Validar cobertura" del frontend. El navegador nunca llama al servicio directo. */
@RestController
@RequestMapping("/api/v1/cobertura")
public class CoberturaController {

    @Autowired
    private CoberturaClient coberturaClient;

    @PostMapping("/validar")
    public ResponseEntity<CoberturaDTO.Resultado> validar(@Valid @RequestBody CoberturaDTO.Solicitud solicitud) {
        CoberturaDTO.Respuesta r = coberturaClient.consultar(solicitud);
        Integer idTienda = r.tienda() != null ? r.tienda().id() : null;
        String nombreTienda = r.tienda() != null ? r.tienda().nombre() : null;
        boolean disponible = r.tienda() != null && "DISPONIBLE".equals(r.tienda().estado());
        return ResponseEntity.ok(new CoberturaDTO.Resultado(r.estado(), r.cobertura(), r.mensaje(), idTienda, nombreTienda, disponible));
    }
}
