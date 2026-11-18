package com.pizzaamericana.tienda.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "producto")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idproducto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idcategoria")
    private Categoria categoria;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;

    @Column(name = "tipo_producto", nullable = false, length = 5)
    private String tipoProducto; // P, D, A, O, MC, MS

    @Column(name = "tamano_codigo", length = 10)
    private String tamanoCodigo; // PZ, MD, GD, XL

    @Column(nullable = false)
    private Integer porciones = 1;

    @Column(name = "precio_base", nullable = false)
    private BigDecimal precioBase = BigDecimal.ZERO;

    @Column(name = "recargo_especialidad", nullable = false)
    private BigDecimal recargoEspecialidad = BigDecimal.ZERO;

    @Column(name = "permite_dividir", nullable = false)
    private Boolean permiteDividir = false;

    @Column(name = "aplica_domicilio", nullable = false)
    private Boolean aplicaDomicilio = true;

    @Column(nullable = false)
    private Boolean activo = true;

    public Producto() {}

    public Integer getIdproducto() { return idproducto; }
    public void setIdproducto(Integer idproducto) { this.idproducto = idproducto; }

    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public String getTipoProducto() { return tipoProducto; }
    public void setTipoProducto(String tipoProducto) { this.tipoProducto = tipoProducto; }

    public String getTamanoCodigo() { return tamanoCodigo; }
    public void setTamanoCodigo(String tamanoCodigo) { this.tamanoCodigo = tamanoCodigo; }

    public Integer getPorciones() { return porciones; }
    public void setPorciones(Integer porciones) { this.porciones = porciones; }

    public BigDecimal getPrecioBase() { return precioBase; }
    public void setPrecioBase(BigDecimal precioBase) { this.precioBase = precioBase; }

    public BigDecimal getRecargoEspecialidad() { return recargoEspecialidad; }
    public void setRecargoEspecialidad(BigDecimal recargoEspecialidad) { this.recargoEspecialidad = recargoEspecialidad; }

    public Boolean getPermiteDividir() { return permiteDividir; }
    public void setPermiteDividir(Boolean permiteDividir) { this.permiteDividir = permiteDividir; }

    public Boolean getAplicaDomicilio() { return aplicaDomicilio; }
    public void setAplicaDomicilio(Boolean aplicaDomicilio) { this.aplicaDomicilio = aplicaDomicilio; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}

