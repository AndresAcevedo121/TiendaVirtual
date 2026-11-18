package com.pizzaamericana.tienda.controller;

import com.pizzaamericana.tienda.model.Tienda;
import com.pizzaamericana.tienda.repository.TiendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tiendas")
public class TiendaController {

    @Autowired
    private TiendaRepository tiendaRepository;

    @GetMapping
    public ResponseEntity<List<Tienda>> listarTiendasActivas() {
        return ResponseEntity.ok(tiendaRepository.findByActivoTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tienda> obtenerTienda(@PathVariable Integer id) {
        return tiendaRepository.findByIdtiendaAndActivoTrue(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

