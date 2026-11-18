package com.pizzaamericana.tienda.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "pedido_detalle_modificador")
public class PedidoDetalleModificador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer iditemModificador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "iddetalle", nullable = false)
    private PedidoDetalle detalle;

    @Column(nullable = false, length = 10)
    private String tipo; // CON, SIN, ADICION

    @Column(name = "nombre_ingrediente", nullable = false, length = 100)
    private String nombreIngrediente;

    @Column(nullable = false, length = 20)
    private String mitad = "COMPLETA"; // COMPLETA, MITAD_1, MITAD_2

    @Column(name = "precio_extra", nullable = false)
    private BigDecimal precioExtra = BigDecimal.ZERO;

    public PedidoDetalleModificador() {}

    public Integer getIditemModificador() { return iditemModificador; }
    public void setIditemModificador(Integer iditemModificador) { this.iditemModificador = iditemModificador; }

    public PedidoDetalle getDetalle() { return detalle; }
    public void setDetalle(PedidoDetalle detalle) { this.detalle = detalle; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getNombreIngrediente() { return nombreIngrediente; }
    public void setNombreIngrediente(String nombreIngrediente) { this.nombreIngrediente = nombreIngrediente; }

    public String getMitad() { return mitad; }
    public void setMitad(String mitad) { this.mitad = mitad; }

    public BigDecimal getPrecioExtra() { return precioExtra; }
    public void setPrecioExtra(BigDecimal precioExtra) { this.precioExtra = precioExtra; }
}

