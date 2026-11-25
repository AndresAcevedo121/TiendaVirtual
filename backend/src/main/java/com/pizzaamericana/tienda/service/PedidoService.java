package com.pizzaamericana.tienda.service;

import com.pizzaamericana.tienda.dto.PedidoDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

/**
 * Punto de entrada para crear pedidos. NO es transaccional a proposito: la transaccion vive en
 * PedidoCreador. Asi, si dos peticiones con el mismo orderToken llegan casi a la vez y la base
 * rechaza la segunda (indice unico), aqui se atrapa el error y se devuelve el pedido ya creado.
 */
@Service
public class PedidoService {

    @Autowired
    private PedidoCreador pedidoCreador;

    public PedidoDTO.Response crearPedido(PedidoDTO.CreacionRequest request) {
        try {
            return pedidoCreador.crear(request);
        } catch (DataIntegrityViolationException ex) {
            // Otra peticion con el mismo orderToken gano la carrera: se devuelve ese pedido.
            // Si no existe un pedido con ese token, el error era otro y se relanza.
            return pedidoCreador.obtenerExistente(request.getOrderToken())
                    .orElseThrow(() -> ex);
        }
    }
}
