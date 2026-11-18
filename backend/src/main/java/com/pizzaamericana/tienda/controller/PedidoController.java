package com.pizzaamericana.tienda.controller;

import com.pizzaamericana.tienda.dto.CotizacionDTO;
import com.pizzaamericana.tienda.dto.PedidoDTO;
import com.pizzaamericana.tienda.service.CotizacionService;
import com.pizzaamericana.tienda.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/pedidos")
public class PedidoController {

    @Autowired
    private CotizacionService cotizacionService;

    @Autowired
    private PedidoService pedidoService;

    @PostMapping("/cotizar")
    public ResponseEntity<CotizacionDTO.Response> cotizar(@Valid @RequestBody CotizacionDTO.Request request) {
        return ResponseEntity.ok(cotizacionService.cotizarPedido(request));
    }

    @PostMapping
    public ResponseEntity<PedidoDTO.Response> crearPedido(@Valid @RequestBody PedidoDTO.CreacionRequest request) {
        return ResponseEntity.ok(pedidoService.crearPedido(request));
    }
}

