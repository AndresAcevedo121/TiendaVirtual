package com.pizzaamericana.tienda.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

public class PedidoDTO {

    public static class CreacionRequest {
        @NotBlank
        private String orderToken; // UUID idempotente
        @NotNull
        private Integer idtienda;
        private String tipoEntrega = "DOMICILIO"; // DOMICILIO, RECOGER
        
        // Cliente (Ley 1581)
        @NotBlank
        private String clienteNombre;
        @NotBlank
        private String clienteTelefono;
        private String clienteCorreo;
        @NotNull
        private Boolean autorizacionDatos;
        
        // Dirección (Obligatoria solo si tipoEntrega == DOMICILIO, validada en servicio)
        private String direccionTexto;
        private String direccionDetalles;
        private String barrio;
        private String municipio;
        private BigDecimal latitud;
        private BigDecimal longitud;
        
        // Pago
        private String formaPago = "WOMPI"; // EFECTIVO, DATAFONO, WOMPI
        private BigDecimal pagaCon;
        
        // Items
        @NotNull
        private List<CotizacionDTO.ItemRequest> items;

        public String getOrderToken() { return orderToken; }
        public void setOrderToken(String orderToken) { this.orderToken = orderToken; }
        public Integer getIdtienda() { return idtienda; }
        public void setIdtienda(Integer idtienda) { this.idtienda = idtienda; }
        public String getTipoEntrega() { return tipoEntrega; }
        public void setTipoEntrega(String tipoEntrega) { this.tipoEntrega = tipoEntrega; }
        public String getClienteNombre() { return clienteNombre; }
        public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }
        public String getClienteTelefono() { return clienteTelefono; }
        public void setClienteTelefono(String clienteTelefono) { this.clienteTelefono = clienteTelefono; }
        public String getClienteCorreo() { return clienteCorreo; }
        public void setClienteCorreo(String clienteCorreo) { this.clienteCorreo = clienteCorreo; }
        public Boolean getAutorizacionDatos() { return autorizacionDatos; }
        public void setAutorizacionDatos(Boolean autorizacionDatos) { this.autorizacionDatos = autorizacionDatos; }
        public String getDireccionTexto() { return direccionTexto; }
        public void setDireccionTexto(String direccionTexto) { this.direccionTexto = direccionTexto; }
        public String getDireccionDetalles() { return direccionDetalles; }
        public void setDireccionDetalles(String direccionDetalles) { this.direccionDetalles = direccionDetalles; }
        public String getBarrio() { return barrio; }
        public void setBarrio(String barrio) { this.barrio = barrio; }
        public String getMunicipio() { return municipio; }
        public void setMunicipio(String municipio) { this.municipio = municipio; }
        public BigDecimal getLatitud() { return latitud; }
        public void setLatitud(BigDecimal latitud) { this.latitud = latitud; }
        public BigDecimal getLongitud() { return longitud; }
        public void setLongitud(BigDecimal longitud) { this.longitud = longitud; }
        public String getFormaPago() { return formaPago; }
        public void setFormaPago(String formaPago) { this.formaPago = formaPago; }
        public BigDecimal getPagaCon() { return pagaCon; }
        public void setPagaCon(BigDecimal pagaCon) { this.pagaCon = pagaCon; }
        public List<CotizacionDTO.ItemRequest> getItems() { return items; }
        public void setItems(List<CotizacionDTO.ItemRequest> items) { this.items = items; }
    }

    public static class Response {
        private Integer idpedido;
        private String orderToken;
        private Integer idtienda;
        private String nombreTienda;
        private String estado;
        private BigDecimal subtotal;
        private BigDecimal valorDomicilio;
        private BigDecimal total;
        private String formaPago;
        private Integer tiempoEstimadoMinutos;
        private Timestamp fechaCreacion;
        private String mensaje;

        public Integer getIdpedido() { return idpedido; }
        public void setIdpedido(Integer idpedido) { this.idpedido = idpedido; }
        public String getOrderToken() { return orderToken; }
        public void setOrderToken(String orderToken) { this.orderToken = orderToken; }
        public Integer getIdtienda() { return idtienda; }
        public void setIdtienda(Integer idtienda) { this.idtienda = idtienda; }
        public String getNombreTienda() { return nombreTienda; }
        public void setNombreTienda(String nombreTienda) { this.nombreTienda = nombreTienda; }
        public String getEstado() { return estado; }
        public void setEstado(String estado) { this.estado = estado; }
        public BigDecimal getSubtotal() { return subtotal; }
        public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
        public BigDecimal getValorDomicilio() { return valorDomicilio; }
        public void setValorDomicilio(BigDecimal valorDomicilio) { this.valorDomicilio = valorDomicilio; }
        public BigDecimal getTotal() { return total; }
        public void setTotal(BigDecimal total) { this.total = total; }
        public String getFormaPago() { return formaPago; }
        public void setFormaPago(String formaPago) { this.formaPago = formaPago; }
        public Integer getTiempoEstimadoMinutos() { return tiempoEstimadoMinutos; }
        public void setTiempoEstimadoMinutos(Integer tiempoEstimadoMinutos) { this.tiempoEstimadoMinutos = tiempoEstimadoMinutos; }
        public Timestamp getFechaCreacion() { return fechaCreacion; }
        public void setFechaCreacion(Timestamp fechaCreacion) { this.fechaCreacion = fechaCreacion; }
        public String getMensaje() { return mensaje; }
        public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    }
}

