package com.pizzaamericana.tienda.repository;

import com.pizzaamericana.tienda.model.ProductoAdicion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoAdicionRepository extends JpaRepository<ProductoAdicion, Integer> {
    List<ProductoAdicion> findByTamanoIdproducto(Integer idproductoTamano);
}

