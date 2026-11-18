package com.pizzaamericana.tienda.repository;

import com.pizzaamericana.tienda.model.ProductoModificador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoModificadorRepository extends JpaRepository<ProductoModificador, Integer> {
    List<ProductoModificador> findByEspecialidadIdproducto(Integer idproductoEspecialidad);
}

