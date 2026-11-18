package com.pizzaamericana.tienda.repository;

import com.pizzaamericana.tienda.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    Optional<Pedido> findByOrderToken(String orderToken);
}

