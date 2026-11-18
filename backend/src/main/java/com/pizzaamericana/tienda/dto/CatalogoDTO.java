
package com.pizzaamericana.tienda.dto;

import java.math.BigDecimal;
import java.util.List;

public class CatalogoDTO {

    public static class MenuTiendaResponse {
        private Integer idtienda;
        private String nombreTienda;
        private Boolean disponible;
        private Integer tiempoEstimadoMinutos;
        private List<CategoriaResponse> categorias;

        public Integer getIdtienda() { return idtienda; }
        public void setIdtienda(Integer idtienda) { this.idtienda = idtienda; }
        public String getNombreTienda() { return nombreTienda; }
        public void setNombreTienda(String nombreTienda) { this.nombreTienda = nombreTienda; }
        public Boolean getDisponible() { return disponible; }
        public void setDisponible(Boolean disponible) { this.disponible = disponible; }
        public Integer getTiempoEstimadoMinutos() { return tiempoEstimadoMinutos; }
        public void setTiempoEstimadoMinutos(Integer tiempoEstimadoMinutos) { this.tiempoEstimadoMinutos = tiempoEstimadoMinutos; }
        public List<CategoriaResponse> getCategorias() { return categorias; }
        public void setCategorias(List<CategoriaResponse> categorias) { this.categorias = categorias; }
    }

    public static class CategoriaResponse {
        private Integer idcategoria;
        private String nombre;
        private String descripcion;
        private String icono;
        private List<ProductoResponse> productos;

        public Integer getIdcategoria() { return idcategoria; }
        public void setIdcategoria(Integer idcategoria) { this.idcategoria = idcategoria; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getDescripcion() { return descripcion; }
        public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
        public String getIcono() { return icono; }
        public void setIcono(String icono) { this.icono = icono; }
        public List<ProductoResponse> getProductos() { return productos; }
        public void setProductos(List<ProductoResponse> productos) { this.productos = productos; }
    }

    public static class ProductoResponse {
        private Integer idproducto;
        private String nombre;
        private String descripcion;
        private String imagenUrl;
        private String tipoProducto; // P, D, A, O
        private String tamanoCodigo;
        private Integer porciones;
        private BigDecimal precioBase;
        private Boolean permiteMitadMitad;
        private Boolean disponible;
        private List<EspecialidadResponse> especialidades;
        private List<AdicionResponse> adiciones;

        public Integer getIdproducto() { return idproducto; }
        public void setIdproducto(Integer idproducto) { this.idproducto = idproducto; }
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
        public Boolean getPermiteMitadMitad() { return permiteMitadMitad; }
        public void setPermiteMitadMitad(Boolean permiteMitadMitad) { this.permiteMitadMitad = permiteMitadMitad; }
        public Boolean getDisponible() { return disponible; }
        public void setDisponible(Boolean disponible) { this.disponible = disponible; }
        public List<EspecialidadResponse> getEspecialidades() { return especialidades; }
        public void setEspecialidades(List<EspecialidadResponse> especialidades) { this.especialidades = especialidades; }
        public List<AdicionResponse> getAdiciones() { return adiciones; }
        public void setAdiciones(List<AdicionResponse> adiciones) { this.adiciones = adiciones; }
    }

    public static class EspecialidadResponse {
        private Integer idespecialidad;
        private String nombre;
        private String descripcion;
        private BigDecimal recargoCompleta;
        private BigDecimal recargoMitad;
        private List<ModificadorItemResponse> ingredientesSin;
        private List<ModificadorItemResponse> ingredientesCon;

        public Integer getIdespecialidad() { return idespecialidad; }
        public void setIdespecialidad(Integer idespecialidad) { this.idespecialidad = idespecialidad; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getDescripcion() { return descripcion; }
        public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
        public BigDecimal getRecargoCompleta() { return recargoCompleta; }
        public void setRecargoCompleta(BigDecimal recargoCompleta) { this.recargoCompleta = recargoCompleta; }
        public BigDecimal getRecargoMitad() { return recargoMitad; }
        public void setRecargoMitad(BigDecimal recargoMitad) { this.recargoMitad = recargoMitad; }
        public List<ModificadorItemResponse> getIngredientesSin() { return ingredientesSin; }
        public void setIngredientesSin(List<ModificadorItemResponse> ingredientesSin) { this.ingredientesSin = ingredientesSin; }
        public List<ModificadorItemResponse> getIngredientesCon() { return ingredientesCon; }
        public void setIngredientesCon(List<ModificadorItemResponse> ingredientesCon) { this.ingredientesCon = ingredientesCon; }
    }

    public static class ModificadorItemResponse {
        private Integer id;
        private String nombre;

        public ModificadorItemResponse() {}
        public ModificadorItemResponse(Integer id, String nombre) {
            this.id = id;
            this.nombre = nombre;
        }

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
    }

    public static class AdicionResponse {
        private Integer id;
        private String nombre;
        private BigDecimal precio;

        public AdicionResponse() {}
        public AdicionResponse(Integer id, String nombre, BigDecimal precio) {
            this.id = id;
            this.nombre = nombre;
            this.precio = precio;
        }

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public BigDecimal getPrecio() { return precio; }
        public void setPrecio(BigDecimal precio) { this.precio = precio; }
    }
}

