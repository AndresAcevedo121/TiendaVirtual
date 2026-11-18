package com.pizzaamericana.tienda.repository;

import com.pizzaamericana.tienda.model.TiendaProductoExcepcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TiendaProductoExcepcionRepository extends JpaRepository<TiendaProductoExcepcion, TiendaProductoExcepcion.TiendaProductoId> {
    List<TiendaProductoExcepcion> findByIdtienda(Integer idtienda);
    Optional<TiendaProductoExcepcion> findByIdtiendaAndIdproducto(Integer idtienda, Integer idproducto);
}

