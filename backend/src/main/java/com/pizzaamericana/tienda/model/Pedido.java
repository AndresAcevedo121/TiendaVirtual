package com.pizzaamericana.tienda.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.sql.Time;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedido")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idpedido;

    @Column(name = "order_token", nullable = false, unique = true, length = 64)
    private String orderToken;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idtienda", nullable = false)
    private Tienda tienda;

    @Column(nullable = false, length = 20)
    private String canal = "TIENDA_VIRTUAL";

    @Column(name = "tipo_entrega", nullable = false, length = 20)
    private String tipoEntrega = "DOMICILIO"; // DOMICILIO, RECOGER

    @Column(nullable = false, length = 20)
    private String estado = "RECIBIDO";

    @Column(name = "cliente_nombre", nullable = false, length = 150)
    private String clienteNombre;

    @Column(name = "cliente_telefono", nullable = false, length = 20)
    private String clienteTelefono;

    @Column(name = "cliente_correo", length = 150)
    private String clienteCorreo;

    @Column(name = "autorizacion_datos", nullable = false)
    private Boolean autorizacionDatos = false;

    @Column(name = "direccion_texto", nullable = false)
    private String direccionTexto;

    @Column(name = "direccion_detalles")
    private String direccionDetalles;

    private String barrio;

    @Column(nullable = false, length = 100)
    private String municipio;

    private BigDecimal latitud;
    private BigDecimal longitud;

    @Column(name = "subtotal_productos", nullable = false)
    private BigDecimal subtotalProductos = BigDecimal.ZERO;

    @Column(name = "valor_domicilio", nullable = false)
    private BigDecimal valorDomicilio = BigDecimal.valueOf(5000);

    @Column(nullable = false)
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "forma_pago", nullable = false, length = 20)
    private String formaPago = "WOMPI";

    @Column(name = "paga_con")
    private BigDecimal pagaCon;

    @Column(name = "wompi_transaction_id")
    private String wompiTransactionId;

    @Column(name = "es_programado", nullable = false)
    private Boolean esProgramado = false;

    @Column(name = "hora_programada")
    private Time horaProgramada;

    @Column(name = "turno_envio")
    private String turnoEnvio;

    @Column(name = "enviado_pos", nullable = false)
    private Boolean enviadoPos = false;

    @Column(name = "numero_pos_ticket")
    private Integer numeroPosTicket;

    @Column(name = "fecha_creacion", insertable = false, updatable = false)
    private Timestamp fechaCreacion;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PedidoDetalle> detalles = new ArrayList<>();

    public Pedido() {}

    public Integer getIdpedido() { return idpedido; }
    public void setIdpedido(Integer idpedido) { this.idpedido = idpedido; }

    public String getOrderToken() { return orderToken; }
    public void setOrderToken(String orderToken) { this.orderToken = orderToken; }

    public Tienda getTienda() { return tienda; }
    public void setTienda(Tienda tienda) { this.tienda = tienda; }

    public String getCanal() { return canal; }
    public void setCanal(String canal) { this.canal = canal; }

    public String getTipoEntrega() { return tipoEntrega; }
    public void setTipoEntrega(String tipoEntrega) { this.tipoEntrega = tipoEntrega; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

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

    public BigDecimal getSubtotalProductos() { return subtotalProductos; }
    public void setSubtotalProductos(BigDecimal subtotalProductos) { this.subtotalProductos = subtotalProductos; }

    public BigDecimal getValorDomicilio() { return valorDomicilio; }
    public void setValorDomicilio(BigDecimal valorDomicilio) { this.valorDomicilio = valorDomicilio; }

    public BigDecimal getDescuento() { return descuento; }
    public void setDescuento(BigDecimal descuento) { this.descuento = descuento; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getFormaPago() { return formaPago; }
    public void setFormaPago(String formaPago) { this.formaPago = formaPago; }

    public BigDecimal getPagaCon() { return pagaCon; }
    public void setPagaCon(BigDecimal pagaCon) { this.pagaCon = pagaCon; }

    public String getWompiTransactionId() { return wompiTransactionId; }
    public void setWompiTransactionId(String wompiTransactionId) { this.wompiTransactionId = wompiTransactionId; }

    public Boolean getEsProgramado() { return esProgramado; }
    public void setEsProgramado(Boolean esProgramado) { this.esProgramado = esProgramado; }

    public Time getHoraProgramada() { return horaProgramada; }
    public void setHoraProgramada(Time horaProgramada) { this.horaProgramada = horaProgramada; }

    public String getTurnoEnvio() { return turnoEnvio; }
    public void setTurnoEnvio(String turnoEnvio) { this.turnoEnvio = turnoEnvio; }

    public Boolean getEnviadoPos() { return enviadoPos; }
    public void setEnviadoPos(Boolean enviadoPos) { this.enviadoPos = enviadoPos; }

    public Integer getNumeroPosTicket() { return numeroPosTicket; }
    public void setNumeroPosTicket(Integer numeroPosTicket) { this.numeroPosTicket = numeroPosTicket; }

    public Timestamp getFechaCreacion() { return fechaCreacion; }

    public List<PedidoDetalle> getDetalles() { return detalles; }
    public void setDetalles(List<PedidoDetalle> detalles) { this.detalles = detalles; }

    public void addDetalle(PedidoDetalle detalle) {
        detalles.add(detalle);
        detalle.setPedido(this);
    }
}

