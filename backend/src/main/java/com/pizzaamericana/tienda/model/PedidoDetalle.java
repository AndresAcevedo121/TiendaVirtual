package com.pizzaamericana.tienda.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedido_detalle")
public class PedidoDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer iddetalle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idpedido", nullable = false)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idproducto", nullable = false)
    private Producto producto;

    @Column(name = "nombre_producto", nullable = false, length = 150)
    private String nombreProducto;

    @Column(nullable = false)
    private BigDecimal cantidad = BigDecimal.ONE;

    @Column(name = "precio_unitario", nullable = false)
    private BigDecimal precioUnitario;

    @Column(name = "total_linea", nullable = false)
    private BigDecimal totalLinea;

    @Column(name = "es_mitad_mitad", nullable = false)
    private Boolean esMitadMitad = false;

    @Column(name = "idespecialidad1")
    private Integer idespecialidad1;

    @Column(name = "nombre_especialidad1", length = 100)
    private String nombreEspecialidad1;

    @Column(name = "idespecialidad2")
    private Integer idespecialidad2;

    @Column(name = "nombre_especialidad2", length = 100)
    private String nombreEspecialidad2;

    private String observaciones;

    @OneToMany(mappedBy = "detalle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PedidoDetalleModificador> modificadores = new ArrayList<>();

    public PedidoDetalle() {}

    public Integer getIddetalle() { return iddetalle; }
    public void setIddetalle(Integer iddetalle) { this.iddetalle = iddetalle; }

    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }

    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }

    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }

    public BigDecimal getCantidad() { return cantidad; }
    public void setCantidad(BigDecimal cantidad) { this.cantidad = cantidad; }

    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }

    public BigDecimal getTotalLinea() { return totalLinea; }
    public void setTotalLinea(BigDecimal totalLinea) { this.totalLinea = totalLinea; }

    public Boolean getEsMitadMitad() { return esMitadMitad; }
    public void setEsMitadMitad(Boolean esMitadMitad) { this.esMitadMitad = esMitadMitad; }

    public Integer getIdespecialidad1() { return idespecialidad1; }
    public void setIdespecialidad1(Integer idespecialidad1) { this.idespecialidad1 = idespecialidad1; }

    public String getNombreEspecialidad1() { return nombreEspecialidad1; }
    public void setNombreEspecialidad1(String nombreEspecialidad1) { this.nombreEspecialidad1 = nombreEspecialidad1; }

    public Integer getIdespecialidad2() { return idespecialidad2; }
    public void setIdespecialidad2(Integer idespecialidad2) { this.idespecialidad2 = idespecialidad2; }

    public String getNombreEspecialidad2() { return nombreEspecialidad2; }
    public void setNombreEspecialidad2(String nombreEspecialidad2) { this.nombreEspecialidad2 = nombreEspecialidad2; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public List<PedidoDetalleModificador> getModificadores() { return modificadores; }
    public void setModificadores(List<PedidoDetalleModificador> modificadores) { this.modificadores = modificadores; }

    public void addModificador(PedidoDetalleModificador mod) {
        modificadores.add(mod);
        mod.setDetalle(this);
    }
}

