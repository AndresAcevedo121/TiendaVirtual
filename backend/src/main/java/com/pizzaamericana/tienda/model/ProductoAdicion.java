package com.pizzaamericana.tienda.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "producto_adicion")
public class ProductoAdicion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idproductoAdicion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idproducto_tamano", nullable = false)
    private Producto tamano;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idproducto_adicion_item", nullable = false)
    private Producto adicionItem;

    @Column(name = "precio_adicion", nullable = false)
    private BigDecimal precioAdicion = BigDecimal.ZERO;

    public ProductoAdicion() {}

    public Integer getIdproductoAdicion() { return idproductoAdicion; }
    public void setIdproductoAdicion(Integer idproductoAdicion) { this.idproductoAdicion = idproductoAdicion; }

    public Producto getTamano() { return tamano; }
    public void setTamano(Producto tamano) { this.tamano = tamano; }

    public Producto getAdicionItem() { return adicionItem; }
    public void setAdicionItem(Producto adicionItem) { this.adicionItem = adicionItem; }

    public BigDecimal getPrecioAdicion() { return precioAdicion; }
    public void setPrecioAdicion(BigDecimal precioAdicion) { this.precioAdicion = precioAdicion; }
}

