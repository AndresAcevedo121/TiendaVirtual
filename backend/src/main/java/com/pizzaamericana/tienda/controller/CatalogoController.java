package com.pizzaamericana.tienda.controller;

import com.pizzaamericana.tienda.dto.CatalogoDTO;
import com.pizzaamericana.tienda.service.CatalogoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/catalogo")
public class CatalogoController {

    @Autowired
    private CatalogoService catalogoService;

    @GetMapping
    public ResponseEntity<CatalogoDTO.MenuTiendaResponse> obtenerCatalogoPorTienda(
            @RequestParam(defaultValue = "1") Integer idtienda) {
        return ResponseEntity.ok(catalogoService.obtenerMenuPorTienda(idtienda));
    }
}

