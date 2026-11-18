package com.pizzaamericana.tienda.repository;

import com.pizzaamericana.tienda.model.Tienda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TiendaRepository extends JpaRepository<Tienda, Integer> {
    List<Tienda> findByActivoTrue();
    Optional<Tienda> findByIdtiendaAndActivoTrue(Integer idtienda);
}

