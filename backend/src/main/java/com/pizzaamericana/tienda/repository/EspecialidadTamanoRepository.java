package com.pizzaamericana.tienda.repository;

import com.pizzaamericana.tienda.model.EspecialidadTamano;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EspecialidadTamanoRepository extends JpaRepository<EspecialidadTamano, Integer> {
    List<EspecialidadTamano> findByTamanoIdproducto(Integer idproductoTamano);
}

