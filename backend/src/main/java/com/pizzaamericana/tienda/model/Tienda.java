package com.pizzaamericana.tienda.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tienda")
public class Tienda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idtienda;

    @Column(nullable = false, length = 100)
    private String nombre;

    private String direccion;
    private String municipio;
    private String telefono;

    private BigDecimal latitud;
    private BigDecimal longitud;

    @Column(name = "tiempo_entrega_minutos", nullable = false)
    private Integer tiempoEntregaMinutos = 40;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(nullable = false)
    private Boolean bloqueada = false;

    @Column(name = "motivo_bloqueo")
    private String motivoBloqueo;

    @Column(name = "permite_domicilio", nullable = false)
    private Boolean permiteDomicilio = true;

    @Column(name = "permite_recoger", nullable = false)
    private Boolean permiteRecoger = true;

    public Tienda() {}

    public Integer getIdtienda() { return idtienda; }
    public void setIdtienda(Integer idtienda) { this.idtienda = idtienda; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getMunicipio() { return municipio; }
    public void setMunicipio(String municipio) { this.municipio = municipio; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public BigDecimal getLatitud() { return latitud; }
    public void setLatitud(BigDecimal latitud) { this.latitud = latitud; }

    public BigDecimal getLongitud() { return longitud; }
    public void setLongitud(BigDecimal longitud) { this.longitud = longitud; }

    public Integer getTiempoEntregaMinutos() { return tiempoEntregaMinutos; }
    public void setTiempoEntregaMinutos(Integer tiempoEntregaMinutos) { this.tiempoEntregaMinutos = tiempoEntregaMinutos; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public Boolean getBloqueada() { return bloqueada; }
    public void setBloqueada(Boolean bloqueada) { this.bloqueada = bloqueada; }

    public String getMotivoBloqueo() { return motivoBloqueo; }
    public void setMotivoBloqueo(String motivoBloqueo) { this.motivoBloqueo = motivoBloqueo; }

    public Boolean getPermiteDomicilio() { return permiteDomicilio; }
    public void setPermiteDomicilio(Boolean permiteDomicilio) { this.permiteDomicilio = permiteDomicilio; }

    public Boolean getPermiteRecoger() { return permiteRecoger; }
    public void setPermiteRecoger(Boolean permiteRecoger) { this.permiteRecoger = permiteRecoger; }
}

