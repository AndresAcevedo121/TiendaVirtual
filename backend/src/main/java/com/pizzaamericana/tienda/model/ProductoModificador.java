package com.pizzaamericana.tienda.model;

import jakarta.persistence.*;

@Entity
@Table(name = "producto_modificador")
public class ProductoModificador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idproductoModificador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idproducto_especialidad", nullable = false)
    private Producto especialidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idproducto_modificador_item", nullable = false)
    private Producto modificadorItem;

    @Column(nullable = false, length = 10)
    private String tipo; // CON, SIN

    public ProductoModificador() {}

    public Integer getIdproductoModificador() { return idproductoModificador; }
    public void setIdproductoModificador(Integer idproductoModificador) { this.idproductoModificador = idproductoModificador; }

    public Producto getEspecialidad() { return especialidad; }
    public void setEspecialidad(Producto especialidad) { this.especialidad = especialidad; }

    public Producto getModificadorItem() { return modificadorItem; }
    public void setModificadorItem(Producto modificadorItem) { this.modificadorItem = modificadorItem; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
}

