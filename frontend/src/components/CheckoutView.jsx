import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Bike,
  Store,
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  Phone,
  Lock,
  Tag,
  RefreshCw,
  ShoppingBag,
  QrCode
} from 'lucide-react';
import { crearPedido, validarCobertura } from '../services/api';
import { formatCOP, BUSINESS_RULES, estimatePuntos } from '../utils/format';

export default function CheckoutView({
  cart,
  setCart,
  onUpdateQty,
  onRemoveItem,
  tiendas = [],
  tiendaActual,
  onSelectTienda,
  onOpenSedesModal,
  tipoEntrega,
  onChangeTipoEntrega,
  cotizacion,
  quoting,
  customerDraft,
  onSaveCustomerDraft,
  onBackToMenu
}) {
  const [nombre, setNombre] = useState(customerDraft?.nombre || '');
  const [telefono, setTelefono] = useState(customerDraft?.telefono || '');
  const [correo, setCorreo] = useState(customerDraft?.correo || '');
  const [direccion, setDireccion] = useState(customerDraft?.direccion || '');
  const [detallesDir, setDetallesDir] = useState(customerDraft?.detallesDir || '');
  const [barrio, setBarrio] = useState(customerDraft?.barrio || '');
  const [municipio, setMunicipio] = useState(
    customerDraft?.municipio || tiendaActual?.municipio || 'Medellin'
  );
  const [guardarDatosLocal, setGuardarDatosLocal] = useState(true);

  const [formaPago, setFormaPago] = useState('WOMPI');
  const [wompiCanal, setWompiCanal] = useState('TARJETA'); // Visual sub-selector: TARJETA | PSE | NEQUI
  const [pagaCon, setPagaCon] = useState('');
  const [autorizacionDatos, setAutorizacionDatos] = useState(false);

  const [cuponInput, setCuponInput] = useState('');
  const [cuponInfoMsg, setCuponInfoMsg] = useState('');

  const [orderToken, setOrderToken] = useState(
    () => `order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pedidoExitoso, setPedidoExitoso] = useState(null);
  const [coberturaEstado, setCoberturaEstado] = useState(null);

  const aplicarTiendaCobertura = (res) => {
    if (!res?.cobertura || !res?.idTienda || !onSelectTienda) return;
    const encontrada = tiendas.find(t => t.idtienda === res.idTienda);
    if (encontrada && encontrada.idtienda !== tiendaActual?.idtienda) {
      onSelectTienda(encontrada);
    }
  };

  const handleValidarCobertura = async () => {
    if (!direccion.trim()) {
      setCoberturaEstado({ error: 'Ingresa primero tu dirección de entrega en el formulario para validar la cobertura.' });
      return;
    }
    setCoberturaEstado({ loading: true, error: null, resultado: null });
    try {
      const res = await validarCobertura({
        direccion: direccion.trim(),
        municipio: municipio.trim() || tiendaActual?.municipio || 'Medellin',
        barrio: barrio.trim() || undefined
      });
      setCoberturaEstado({ loading: false, resultado: res, error: null });
      aplicarTiendaCobertura(res);
    } catch (err) {
      setCoberturaEstado({
        loading: false,
        resultado: null,
        error: err.message || 'No fue posible validar la cobertura en este momento.'
      });
    }
  };

  useEffect(() => {
    if (tiendaActual?.municipio && !customerDraft?.municipio) {
      setMunicipio(tiendaActual.municipio);
    }
  }, [tiendaActual, customerDraft]);

  // Regenerar token si cambia la composición del carrito (idempotencia por intento de orden)
  useEffect(() => {
    setOrderToken(`order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
  }, [cart, tipoEntrega, tiendaActual?.idtienda]);

  const subtotalFallback = cart.reduce((sum, item) => sum + item.precioCalculado * item.cantidad, 0);
  const subtotal = cotizacion?.subtotalProductos ?? subtotalFallback;
  const costoDomicilio =
    cotizacion?.valorDomicilio ?? (tipoEntrega === 'RECOGER' ? 0 : BUSINESS_RULES.COSTO_DOMICILIO);
  const descuento = cotizacion?.descuento ?? 0;
  const total = cotizacion?.total ?? Math.max(0, subtotal + costoDomicilio - descuento);

  const pedidoMinimo = cotizacion?.pedidoMinimo ?? BUSINESS_RULES.PEDIDO_MINIMO_DOMICILIO;
  const cumpleMinimo =
    tipoEntrega === 'RECOGER' || (cotizacion ? cotizacion.cumplePedidoMinimo : subtotal >= pedidoMinimo);
  const faltanteMinimo = Math.max(0, pedidoMinimo - subtotal);

  const permiteDomicilio = tiendaActual?.permiteDomicilio !== false;
  const permiteRecoger = tiendaActual?.permiteRecoger !== false;
  const tiendaBloqueada = Boolean(tiendaActual?.bloqueada);
  const errorServidor = cotizacion?.error === true;
  const quoteInvalida = cotizacion && cotizacion.valido === false && (cumpleMinimo || errorServidor);
  const sinCobertura =
    tipoEntrega === 'DOMICILIO' &&
    Boolean(coberturaEstado?.resultado) &&
    !coberturaEstado.resultado.cobertura;
  const tiendaCoberturaCerrada =
    tipoEntrega === 'DOMICILIO' &&
    Boolean(coberturaEstado?.resultado?.cobertura) &&
    !coberturaEstado.resultado.tiendaDisponible;

  const handleCheckCupon = () => {
    if (!cuponInput.trim()) return;
    setCuponInfoMsg(
      'La validación atómica de códigos promocionales estará disponible al conectar el Microservicio de Cupones (RF-5). No se ha aplicado ningún descuento.'
    );
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Tu carrito está vacío.');
      return;
    }
    if (!tiendaActual) {
      setErrorMsg('Selecciona una sede para continuar.');
      return;
    }
    if (tiendaBloqueada) {
      setErrorMsg('La sede seleccionada está cerrada temporalmente. Cambia de sede para continuar.');
      return;
    }
    if (!cumpleMinimo) {
      setErrorMsg(
        `El pedido mínimo para domicilio es ${formatCOP(pedidoMinimo)}. Te faltan ${formatCOP(faltanteMinimo)}.`
      );
      return;
    }
    if (!nombre.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }
    const cleanPhone = telefono.replace(/\D/g, '');
    if (cleanPhone.length < 7) {
      setErrorMsg('Por favor ingresa un número de celular o teléfono válido (mínimo 7 dígitos).');
      return;
    }
    if (tipoEntrega === 'DOMICILIO' && !direccion.trim()) {
      setErrorMsg('La dirección de entrega es obligatoria para pedidos a domicilio.');
      return;
    }
    if (formaPago === 'EFECTIVO' && pagaCon && Number(pagaCon) < total) {
      setErrorMsg(`El monto "Con cuánto pagas" debe ser mayor o igual al total (${formatCOP(total)}).`);
      return;
    }
    if (!autorizacionDatos) {
      setErrorMsg(
        'Debes aceptar la autorización de tratamiento de datos personales (Ley 1581 de 2012) para confirmar tu pedido.'
      );
      return;
    }

    let idTiendaFinal = tiendaActual.idtienda;
    if (tipoEntrega === 'DOMICILIO') {
      let resultadoCob = coberturaEstado?.resultado;
      if (!resultadoCob) {
        setCoberturaEstado({ loading: true, error: null, resultado: null });
        try {
          resultadoCob = await validarCobertura({
            direccion: direccion.trim(),
            municipio: municipio.trim() || tiendaActual?.municipio || 'Medellin',
            barrio: barrio.trim() || undefined
          });
          setCoberturaEstado({ loading: false, resultado: resultadoCob, error: null });
          aplicarTiendaCobertura(resultadoCob);
        } catch (err) {
          setCoberturaEstado({
            loading: false,
            resultado: null,
            error: err.message || 'No fue posible validar la cobertura en este momento.'
          });
          setErrorMsg(err.message || 'No fue posible validar la cobertura de tu dirección.');
          return;
        }
      }

      if (!resultadoCob.cobertura) {
        setErrorMsg(
          resultadoCob.mensaje ||
            'Tu dirección no cuenta con cobertura de domicilio. Puedes seleccionar "Recoger en Sede".'
        );
        return;
      }
      if (!resultadoCob.tiendaDisponible) {
        setErrorMsg(
          `La sede ${resultadoCob.nombreTienda || 'asignada'} que cubre tu sector no se encuentra disponible temporalmente.`
        );
        return;
      }
      if (resultadoCob.idTienda) {
        idTiendaFinal = resultadoCob.idTienda;
      }
    }

    if (guardarDatosLocal) {
      onSaveCustomerDraft({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
        direccion: direccion.trim(),
        detallesDir: detallesDir.trim(),
        barrio: barrio.trim(),
        municipio: municipio.trim()
      });
    }

    setSubmitting(true);
    try {
      const itemsPayload = cart.map(item => ({
        idproducto: item.idproducto,
        cantidad: item.cantidad,
        esMitadMitad: Boolean(item.esMitadMitad),
        idespecialidad1: item.idespecialidad1 || null,
        idespecialidad2: item.esMitadMitad ? (item.idespecialidad2 || null) : null,
        idadiciones: item.idadiciones || [],
        modificadores: item.modificadores || [],
        observaciones: item.observaciones || ''
      }));

      const payload = {
        orderToken,
        idtienda: idTiendaFinal,
        tipoEntrega,
        clienteNombre: nombre.trim(),
        clienteTelefono: telefono.trim(),
        clienteCorreo: correo.trim() || null,
        autorizacionDatos,
        direccionTexto:
          tipoEntrega === 'RECOGER'
            ? `Recoge en tienda (${tiendaActual?.nombre || 'Sede'})`
            : direccion.trim(),
        direccionDetalles: detallesDir.trim(),
        barrio: barrio.trim(),
        municipio: municipio.trim() || tiendaActual?.municipio || 'Medellin',
        formaPago,
        pagaCon: formaPago === 'EFECTIVO' && pagaCon ? parseFloat(pagaCon) : null,
        items: itemsPayload
      };

      const res = await crearPedido(payload);
      setPedidoExitoso(res);
      setCart([]);
      setOrderToken(`order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (pedidoExitoso) {
    return (
      <div className="container section-block checkout-success-wrap">
        <div className="checkout-success-card">
          <div className="success-icon-circle">
            <CheckCircle2 size={42} />
          </div>
          <span className="eyebrow-label">Confirmación Oficial del Servidor</span>
          <h1>¡Tu pedido #{pedidoExitoso.idpedido} fue registrado!</h1>
          <p className="success-lead">{pedidoExitoso.mensaje}</p>

          <div className="success-receipt-box">
            <div>
              <span>Número de Orden</span>
              <strong>#{pedidoExitoso.idpedido}</strong>
            </div>
            <div>
              <span>Sede que atiende</span>
              <strong>{pedidoExitoso.nombreTienda}</strong>
            </div>
            <div>
              <span>Estado</span>
              <strong className="text-success">{pedidoExitoso.estado}</strong>
            </div>
            <div>
              <span>Forma de pago</span>
              <strong>{pedidoExitoso.formaPago}</strong>
            </div>
            <div>
              <span>Tiempo estimado</span>
              <strong>~{pedidoExitoso.tiempoEstimadoMinutos || 40} minutos</strong>
            </div>
            <div className="receipt-total-row">
              <span>Total verificado</span>
              <strong>{formatCOP(pedidoExitoso.total)}</strong>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary-pill btn-lg"
            onClick={() => {
              setPedidoExitoso(null);
              onBackToMenu();
            }}
          >
            <span>Volver al Menú Principal</span>
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container section-block">
        <div className="empty-catalog-card">
          <ShoppingBag size={36} className="text-primary" />
          <h2>Tu carrito está vacío</h2>
          <p>Agrega al menos una pizza o acompañamiento antes de pasar al Checkout Express.</p>
          <button type="button" className="btn-primary-pill" onClick={onBackToMenu}>
            Explorar el Menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container configurator-breadcrumb-bar">
        <button type="button" className="back-link-btn" onClick={onBackToMenu}>
          <ChevronLeft size={18} />
          <span>Seguir agregando productos</span>
        </button>
        <div className="checkout-secure-pill">
          <Lock size={14} />
          <span>Checkout Express · Cálculo verificado en servidor</span>
        </div>
      </div>

      <form className="container checkout-grid" onSubmit={handleSubmitOrder} noValidate>
        {/* Columna Izquierda: 3 Pasos Express */}
        <div className="checkout-form-col">
          {errorMsg && (
            <div className="info-banner info-banner--error">
              <AlertTriangle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Paso 1: Tipo de Entrega */}
          <section className="step-card">
            <div className="step-header">
              <span className="step-number">1</span>
              <div>
                <h3>Tipo de Entrega y Sede</h3>
                <p>Elige si deseas envío a domicilio o recoger sin costo de envío</p>
              </div>
            </div>

            <div className="delivery-cards-grid">
              <button
                type="button"
                disabled={!permiteDomicilio}
                className={`delivery-mode-card ${tipoEntrega === 'DOMICILIO' ? 'is-selected' : ''}`}
                onClick={() => onChangeTipoEntrega('DOMICILIO')}
              >
                <div className="delivery-card-icon">
                  <Bike size={22} />
                </div>
                <div className="delivery-card-copy">
                  <strong>Domicilio Express</strong>
                  <span>Envío {formatCOP(BUSINESS_RULES.COSTO_DOMICILIO)} · Mín. {formatCOP(BUSINESS_RULES.PEDIDO_MINIMO_DOMICILIO)}</span>
                </div>
              </button>

              <button
                type="button"
                disabled={!permiteRecoger}
                className={`delivery-mode-card ${tipoEntrega === 'RECOGER' ? 'is-selected' : ''}`}
                onClick={() => onChangeTipoEntrega('RECOGER')}
              >
                <div className="delivery-card-icon">
                  <Store size={22} />
                </div>
                <div className="delivery-card-copy">
                  <strong>Recoger en Sede</strong>
                  <span>$0 de domicilio · Sin monto mínimo</span>
                </div>
              </button>
            </div>

            <div className="checkout-sede-strip">
              <div className="checkout-sede-left">
                <MapPin size={17} className="text-primary" />
                <div>
                  <strong>Despacha Sede {tiendaActual?.nombre || 'Principal'}</strong>
                  <span>
                    {tiendaActual?.direccion || 'Dirección de sede'} ·{' '}
                    <Clock size={12} style={{ display: 'inline', verticalAlign: '-2px' }} /> ~
                    {tiendaActual?.tiempoEntregaMinutos || 40} min
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-link-subtle"
                title="Validar cobertura"
                onClick={handleValidarCobertura}
                disabled={coberturaEstado?.loading}
              >
                {coberturaEstado?.loading ? 'Validando...' : 'Validar cobertura'}
              </button>
            </div>
          </section>

          {/* Paso 2: Datos de Contacto y Llegada */}
          <section className="step-card">
            <div className="step-header">
              <span className="step-number">2</span>
              <div>
                <h3>Datos de Contacto y Llegada</h3>
                <p>Usaremos tu número para confirmar el envío y emitir tu comprobante</p>
              </div>
            </div>

            <div className="form-fields-grid">
              <div className="form-field">
                <label htmlFor="chk-nombre">Nombre Completo *</label>
                <input
                  id="chk-nombre"
                  type="text"
                  required
                  placeholder="Tu nombre y apellido"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="chk-tel">Celular / WhatsApp *</label>
                <input
                  id="chk-tel"
                  type="tel"
                  required
                  placeholder="3001234567"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                />
              </div>

              <div className="form-field form-field--full">
                <label htmlFor="chk-correo">Correo Electrónico (para comprobante)</label>
                <input
                  id="chk-correo"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                />
              </div>

              {tipoEntrega === 'DOMICILIO' && (
                <>
                  <div className="form-field form-field--full">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label htmlFor="chk-dir">Dirección de Entrega *</label>
                      <button
                        type="button"
                        className="btn-link-subtle"
                        onClick={handleValidarCobertura}
                        disabled={coberturaEstado?.loading || !direccion.trim()}
                        style={{ fontSize: '0.82rem', padding: '0 4px', cursor: 'pointer' }}
                      >
                        {coberturaEstado?.loading ? 'Validando...' : 'Validar cobertura'}
                      </button>
                    </div>
                    <input
                      id="chk-dir"
                      type="text"
                      required
                      placeholder="Ej: Carrera 45 # 70-10"
                      value={direccion}
                      onChange={e => {
                        setDireccion(e.target.value);
                        if (coberturaEstado) setCoberturaEstado(null);
                      }}
                    />
                    {coberturaEstado?.resultado && (
                      <div
                        className={`info-banner ${
                          coberturaEstado.resultado.cobertura && coberturaEstado.resultado.tiendaDisponible
                            ? 'info-banner--success'
                            : 'info-banner--amber'
                        }`}
                        style={{ marginTop: '0.5rem' }}
                      >
                        {coberturaEstado.resultado.cobertura && coberturaEstado.resultado.tiendaDisponible ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <AlertTriangle size={16} />
                        )}
                        <span>
                          {coberturaEstado.resultado.cobertura
                            ? coberturaEstado.resultado.tiendaDisponible
                              ? `Cobertura confirmada: tu pedido será despachado por la Sede ${coberturaEstado.resultado.nombreTienda}.`
                              : `La sede ${coberturaEstado.resultado.nombreTienda || 'asignada'} que cubre tu zona se encuentra cerrada temporalmente.`
                            : coberturaEstado.resultado.mensaje ||
                              'Tu dirección no cuenta con cobertura para domicilio. Puedes elegir "Recoger en Sede".'}
                        </span>
                      </div>
                    )}
                    {coberturaEstado?.error && (
                      <div className="info-banner info-banner--error" style={{ marginTop: '0.5rem' }}>
                        <AlertTriangle size={16} />
                        <span>{coberturaEstado.error}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="chk-barrio">Barrio</label>
                    <input
                      id="chk-barrio"
                      type="text"
                      placeholder="Ej: El Poblado / Laureles"
                      value={barrio}
                      onChange={e => setBarrio(e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="chk-mun">Municipio</label>
                    <input
                      id="chk-mun"
                      type="text"
                      placeholder="Medellín"
                      value={municipio}
                      onChange={e => setMunicipio(e.target.value)}
                    />
                  </div>

                  <div className="form-field form-field--full">
                    <label htmlFor="chk-detalles">Detalles adicionales (Torre, Apto, Portería)</label>
                    <input
                      id="chk-detalles"
                      type="text"
                      placeholder="Torre 2 Apto 301, dejar en portería..."
                      value={detallesDir}
                      onChange={e => setDetallesDir(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <label className="save-draft-check">
              <input
                type="checkbox"
                checked={guardarDatosLocal}
                onChange={e => setGuardarDatosLocal(e.target.checked)}
              />
              <span>Recordar mis datos en este navegador para futuros pedidos</span>
            </label>
          </section>

          {/* Paso 3: Método de Pago */}
          <section className="step-card">
            <div className="step-header">
              <span className="step-number">3</span>
              <div>
                <h3>Método de Pago</h3>
                <p>Selecciona cómo deseas pagar tu pedido al confirmar</p>
              </div>
            </div>

            <div className="payment-methods-stack">
              {/* WOMPI (Tarjeta / PSE / Nequi) */}
              <div className={`payment-option-box ${formaPago === 'WOMPI' ? 'is-selected' : ''}`}>
                <label className="payment-radio-header">
                  <input
                    type="radio"
                    name="formaPago"
                    value="WOMPI"
                    checked={formaPago === 'WOMPI'}
                    onChange={() => setFormaPago('WOMPI')}
                  />
                  <CreditCard size={19} className="text-primary" />
                  <div>
                    <strong>Pago en Línea Wompi</strong>
                    <span>Tarjeta Crédito/Débito, PSE o Nequi / Bancolombia</span>
                  </div>
                </label>

                {formaPago === 'WOMPI' && (
                  <div className="wompi-subpanel">
                    <div className="wompi-channels-row">
                      {[
                        { id: 'TARJETA', label: 'Tarjeta', icon: <CreditCard size={14} /> },
                        { id: 'PSE', label: 'PSE Bancos', icon: <ShieldCheck size={14} /> },
                        { id: 'NEQUI', label: 'Nequi / QR', icon: <QrCode size={14} /> }
                      ].map(ch => (
                        <button
                          key={ch.id}
                          type="button"
                          className={`wompi-channel-chip ${wompiCanal === ch.id ? 'is-active' : ''}`}
                          onClick={() => setWompiCanal(ch.id)}
                        >
                          {ch.icon}
                          <span>{ch.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="wompi-hint">
                      El pedido se registrará con estado <strong>PENDIENTE_PAGO</strong> para pago digital mediante Wompi ({wompiCanal}).
                    </p>
                  </div>
                )}
              </div>

              {/* EFECTIVO */}
              <div className={`payment-option-box ${formaPago === 'EFECTIVO' ? 'is-selected' : ''}`}>
                <label className="payment-radio-header">
                  <input
                    type="radio"
                    name="formaPago"
                    value="EFECTIVO"
                    checked={formaPago === 'EFECTIVO'}
                    onChange={() => setFormaPago('EFECTIVO')}
                  />
                  <Banknote size={19} className="text-success" />
                  <div>
                    <strong>
                      {tipoEntrega === 'RECOGER' ? 'Efectivo al recoger en tienda' : 'Efectivo contra entrega'}
                    </strong>
                    <span>Paga directamente al recibir tu pedido</span>
                  </div>
                </label>

                {formaPago === 'EFECTIVO' && (
                  <div className="cash-subpanel">
                    <label htmlFor="chk-pagacon">¿Con cuánto vas a pagar? (opcional, para llevar cambio)</label>
                    <input
                      id="chk-pagacon"
                      type="number"
                      min={total}
                      placeholder={`Ej: ${Math.ceil(total / 10000) * 10000}`}
                      value={pagaCon}
                      onChange={e => setPagaCon(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* DATAFONO */}
              <div className={`payment-option-box ${formaPago === 'DATAFONO' ? 'is-selected' : ''}`}>
                <label className="payment-radio-header">
                  <input
                    type="radio"
                    name="formaPago"
                    value="DATAFONO"
                    checked={formaPago === 'DATAFONO'}
                    onChange={() => setFormaPago('DATAFONO')}
                  />
                  <Smartphone size={19} className="text-secondary" />
                  <div>
                    <strong>
                      {tipoEntrega === 'RECOGER' ? 'Datáfono en sede' : 'Datáfono a domicilio'}
                    </strong>
                    <span>Tarjeta débito o crédito presencial con el domiciliario o en caja</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Soporte telefónico / WhatsApp */}
            <div className="whatsapp-support-strip">
              <Phone size={17} />
              <span>
                ¿Necesitas ayuda con tu dirección o pedido especial? Llámanos al{' '}
                <a href="tel:6044444553">
                  <strong>{BUSINESS_RULES.HOTLINE_PRIMARY}</strong>
                </a>
              </span>
            </div>

            {/* Ley 1581 obligatoria */}
            <label className="ley1581-box">
              <input
                type="checkbox"
                checked={autorizacionDatos}
                onChange={e => setAutorizacionDatos(e.target.checked)}
              />
              <span>
                Autorizo el tratamiento de mis datos personales de acuerdo con la{' '}
                <strong>Ley 1581 de 2012</strong> y la política de Pizza Americana exclusivamente para la entrega y confirmación de mi pedido. *
              </span>
            </label>
          </section>
        </div>

        {/* Columna Derecha: Tu Pedido + Confirmación */}
        <aside className="checkout-summary-col">
          <div className="checkout-summary-card">
            <div className="cart-card-header">
              <h3>Tu Pedido ({cart.reduce((s, i) => s + i.cantidad, 0)})</h3>
              {quoting && (
                <span className="quoting-pill">
                  <RefreshCw size={13} className="spin-icon" /> Verificando
                </span>
              )}
            </div>

            <div className="checkout-items-list">
              {cart.map((item, idx) => (
                <div key={`${item.idproducto}-${idx}`} className="checkout-item-row">
                  <div className="checkout-item-info">
                    <strong>{item.descripcion}</strong>
                    {item.resumenExtras && <span className="cart-item-meta">{item.resumenExtras}</span>}
                    {item.observaciones && (
                      <span className="cart-item-note">Nota: &ldquo;{item.observaciones}&rdquo;</span>
                    )}
                    <div className="checkout-item-controls">
                      <div className="qty-stepper">
                        <button type="button" onClick={() => onUpdateQty(idx, item.cantidad - 1)}>
                          <Minus size={12} />
                        </button>
                        <span>{item.cantidad}</span>
                        <button type="button" onClick={() => onUpdateQty(idx, item.cantidad + 1)}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() => onRemoveItem(idx)}
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <strong className="checkout-item-price">
                    {formatCOP(item.precioCalculado * item.cantidad)}
                  </strong>
                </div>
              ))}
            </div>

            {/* Caja de Cupón (RF-5 futuro) */}
            <div className="coupon-preview-box">
              <label htmlFor="chk-cupon">
                <Tag size={14} /> Cupón promocional (Próximo módulo RF-5)
              </label>
              <div className="coupon-input-row">
                <input
                  id="chk-cupon"
                  type="text"
                  placeholder="Ingresa un código..."
                  value={cuponInput}
                  onChange={e => setCuponInput(e.target.value)}
                />
                <button type="button" onClick={handleCheckCupon}>
                  Aplicar
                </button>
              </div>
              {cuponInfoMsg && <p className="coupon-info-msg">{cuponInfoMsg}</p>}
            </div>

            {/* Desglose financiero */}
            <div className="checkout-totals-box">
              <div className="summary-row">
                <span>Subtotal productos</span>
                <span>{formatCOP(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>{tipoEntrega === 'RECOGER' ? 'Recoger en sede' : 'Domicilio'}</span>
                <span>{tipoEntrega === 'RECOGER' ? '$0' : formatCOP(costoDomicilio)}</span>
              </div>
              {descuento > 0 && (
                <div className="summary-row summary-row--discount">
                  <span>Descuento</span>
                  <span>-{formatCOP(descuento)}</span>
                </div>
              )}
              <div className="summary-total-row">
                <span>Total a pagar</span>
                <span className="summary-total-amount">{formatCOP(total)}</span>
              </div>
              <div className="checkout-points-hint">
                Proyección informativa: +{estimatePuntos(total)} Puntos Pizza
              </div>
            </div>

            {!cumpleMinimo && (
              <div className="info-banner info-banner--amber">
                <AlertTriangle size={16} />
                <span>
                  Te faltan <strong>{formatCOP(faltanteMinimo)}</strong> para cumplir el pedido mínimo de domicilio ({formatCOP(pedidoMinimo)}).
                </span>
              </div>
            )}

            {quoteInvalida && (
              <div className="info-banner info-banner--error">
                <AlertTriangle size={16} />
                <span>{cotizacion.mensaje}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={
                submitting ||
                coberturaEstado?.loading ||
                !tiendaActual ||
                !cumpleMinimo ||
                tiendaBloqueada ||
                quoteInvalida ||
                sinCobertura ||
                tiendaCoberturaCerrada
              }
              className="btn-primary-pill btn-lg btn-full"
            >
              {submitting ? 'Confirmando pedido...' : `Confirmar y Pagar · ${formatCOP(total)}`}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}

