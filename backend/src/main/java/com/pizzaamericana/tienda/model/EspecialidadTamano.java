package com.pizzaamericana.tienda.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "especialidad_tamano")
public class EspecialidadTamano {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idespecialidadTamano;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idproducto_tamano", nullable = false)
    private Producto tamano;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idproducto_especialidad", nullable = false)
    private Producto especialidad;

    @Column(nullable = false)
    private BigDecimal recargo = BigDecimal.ZERO;

    public EspecialidadTamano() {}

    public Integer getIdespecialidadTamano() { return idespecialidadTamano; }
    public void setIdespecialidadTamano(Integer idespecialidadTamano) { this.idespecialidadTamano = idespecialidadTamano; }

    public Producto getTamano() { return tamano; }
    public void setTamano(Producto tamano) { this.tamano = tamano; }

    public Producto getEspecialidad() { return especialidad; }
    public void setEspecialidad(Producto especialidad) { this.especialidad = especialidad; }

    public BigDecimal getRecargo() { return recargo; }
    public void setRecargo(BigDecimal recargo) { this.recargo = recargo; }
}

