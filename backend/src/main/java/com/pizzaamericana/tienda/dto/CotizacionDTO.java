package com.pizzaamericana.tienda.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public class CotizacionDTO {

    public static class Request {
        @NotNull
        private Integer idtienda;
        private String tipoEntrega = "DOMICILIO"; // DOMICILIO, RECOGER
        private List<ItemRequest> items;

        public Integer getIdtienda() { return idtienda; }
        public void setIdtienda(Integer idtienda) { this.idtienda = idtienda; }
        public String getTipoEntrega() { return tipoEntrega; }
        public void setTipoEntrega(String tipoEntrega) { this.tipoEntrega = tipoEntrega; }
        public List<ItemRequest> getItems() { return items; }
        public void setItems(List<ItemRequest> items) { this.items = items; }
    }

    public static class ItemRequest {
        @NotNull
        private Integer idproducto; // ID del producto padre (P) u otro (O)
        private Integer cantidad = 1;
        private Boolean esMitadMitad = false;
        private Integer idespecialidad1;
        private Integer idespecialidad2;
        private List<Integer> idadiciones;
        private List<ModificadorRequest> modificadores;
        private String observaciones;

        public Integer getIdproducto() { return idproducto; }
        public void setIdproducto(Integer idproducto) { this.idproducto = idproducto; }
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
        public Boolean getEsMitadMitad() { return esMitadMitad; }
        public void setEsMitadMitad(Boolean esMitadMitad) { this.esMitadMitad = esMitadMitad; }
        public Integer getIdespecialidad1() { return idespecialidad1; }
        public void setIdespecialidad1(Integer idespecialidad1) { this.idespecialidad1 = idespecialidad1; }
        public Integer getIdespecialidad2() { return idespecialidad2; }
        public void setIdespecialidad2(Integer idespecialidad2) { this.idespecialidad2 = idespecialidad2; }
        public List<Integer> getIdadiciones() { return idadiciones; }
        public void setIdadiciones(List<Integer> idadiciones) { this.idadiciones = idadiciones; }
        public List<ModificadorRequest> getModificadores() { return modificadores; }
        public void setModificadores(List<ModificadorRequest> modificadores) { this.modificadores = modificadores; }
        public String getObservaciones() { return observaciones; }
        public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    }

    public static class ModificadorRequest {
        private String tipo; // CON, SIN
        private String nombreIngrediente;
        private String mitad = "COMPLETA"; // COMPLETA, MITAD_1, MITAD_2

        public String getTipo() { return tipo; }
        public void setTipo(String tipo) { this.tipo = tipo; }
        public String getNombreIngrediente() { return nombreIngrediente; }
        public void setNombreIngrediente(String nombreIngrediente) { this.nombreIngrediente = nombreIngrediente; }
        public String getMitad() { return mitad; }
        public void setMitad(String mitad) { this.mitad = mitad; }
    }

    public static class Response {
        private Boolean valido;
        private String mensaje;
        private List<ItemResponse> items;
        private BigDecimal subtotalProductos;
        private BigDecimal valorDomicilio;
        private BigDecimal descuento;
        private BigDecimal total;
        private Boolean cumplePedidoMinimo;
        private BigDecimal pedidoMinimo = BigDecimal.valueOf(17000);

        public Boolean getValido() { return valido; }
        public void setValido(Boolean valido) { this.valido = valido; }
        public String getMensaje() { return mensaje; }
        public void setMensaje(String mensaje) { this.mensaje = mensaje; }
        public List<ItemResponse> getItems() { return items; }
        public void setItems(List<ItemResponse> items) { this.items = items; }
        public BigDecimal getSubtotalProductos() { return subtotalProductos; }
        public void setSubtotalProductos(BigDecimal subtotalProductos) { this.subtotalProductos = subtotalProductos; }
        public BigDecimal getValorDomicilio() { return valorDomicilio; }
        public void setValorDomicilio(BigDecimal valorDomicilio) { this.valorDomicilio = valorDomicilio; }
        public BigDecimal getDescuento() { return descuento; }
        public void setDescuento(BigDecimal descuento) { this.descuento = descuento; }
        public BigDecimal getTotal() { return total; }
        public void setTotal(BigDecimal total) { this.total = total; }
        public Boolean getCumplePedidoMinimo() { return cumplePedidoMinimo; }
        public void setCumplePedidoMinimo(Boolean cumplePedidoMinimo) { this.cumplePedidoMinimo = cumplePedidoMinimo; }
        public BigDecimal getPedidoMinimo() { return pedidoMinimo; }
        public void setPedidoMinimo(BigDecimal pedidoMinimo) { this.pedidoMinimo = pedidoMinimo; }
    }

    public static class ItemResponse {
        private Integer idproducto;
        private String descripcion;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal totalLinea;

        public Integer getIdproducto() { return idproducto; }
        public void setIdproducto(Integer idproducto) { this.idproducto = idproducto; }
        public String getDescripcion() { return descripcion; }
        public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
        public BigDecimal getPrecioUnitario() { return precioUnitario; }
        public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
        public BigDecimal getTotalLinea() { return totalLinea; }
        public void setTotalLinea(BigDecimal totalLinea) { this.totalLinea = totalLinea; }
    }
}

