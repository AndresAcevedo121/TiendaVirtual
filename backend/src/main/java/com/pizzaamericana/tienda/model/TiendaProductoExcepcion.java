package com.pizzaamericana.tienda.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "tienda_producto_excepcion")
@IdClass(TiendaProductoExcepcion.TiendaProductoId.class)
public class TiendaProductoExcepcion {

    @Id
    private Integer idtienda;

    @Id
    private Integer idproducto;

    @Column(nullable = false)
    private Boolean disponible = true;

    @Column(name = "precio_sobrescrito")
    private BigDecimal precioSobrescrito;

    private String motivo;

    public TiendaProductoExcepcion() {}

    public Integer getIdtienda() { return idtienda; }
    public void setIdtienda(Integer idtienda) { this.idtienda = idtienda; }

    public Integer getIdproducto() { return idproducto; }
    public void setIdproducto(Integer idproducto) { this.idproducto = idproducto; }

    public Boolean getDisponible() { return disponible; }
    public void setDisponible(Boolean disponible) { this.disponible = disponible; }

    public BigDecimal getPrecioSobrescrito() { return precioSobrescrito; }
    public void setPrecioSobrescrito(BigDecimal precioSobrescrito) { this.precioSobrescrito = precioSobrescrito; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public static class TiendaProductoId implements Serializable {
        private Integer idtienda;
        private Integer idproducto;

        public TiendaProductoId() {}
        public TiendaProductoId(Integer idtienda, Integer idproducto) {
            this.idtienda = idtienda;
            this.idproducto = idproducto;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            TiendaProductoId that = (TiendaProductoId) o;
            return Objects.equals(idtienda, that.idtienda) && Objects.equals(idproducto, that.idproducto);
        }

        @Override
        public int hashCode() {
            return Objects.hash(idtienda, idproducto);
        }
    }
}

