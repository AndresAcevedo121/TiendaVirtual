import React from 'react';
import {
  ShoppingCart,
  Bike,
  Store,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { formatCOP, BUSINESS_RULES } from '../utils/format';

export function CartPanelContent({
  cart,
  onUpdateQty,
  onRemoveItem,
  tipoEntrega,
  onChangeTipoEntrega,
  tiendaActual,
  cotizacion,
  quoting,
  onGoCheckout,
  onCloseDrawer
}) {
  const subtotalFallback = cart.reduce((sum, item) => sum + item.precioCalculado * item.cantidad, 0);
  const subtotal = cotizacion?.subtotalProductos ?? subtotalFallback;
  const costoDomicilio =
    cotizacion?.valorDomicilio ?? (tipoEntrega === 'RECOGER' ? 0 : BUSINESS_RULES.COSTO_DOMICILIO);
  const descuento = cotizacion?.descuento ?? 0;
  const total = cotizacion?.total ?? Math.max(0, subtotal + costoDomicilio - descuento);

  const pedidoMinimo = cotizacion?.pedidoMinimo ?? BUSINESS_RULES.PEDIDO_MINIMO_DOMICILIO;
  const cumpleMinimo =
    tipoEntrega === 'RECOGER' || (cotizacion ? cotizacion.cumplePedidoMinimo : subtotal >= pedidoMinimo);
  const faltante = Math.max(0, pedidoMinimo - subtotal);
  const progressPct = Math.min(100, Math.round((subtotal / pedidoMinimo) * 100));

  const permiteDomicilio = tiendaActual?.permiteDomicilio !== false;
  const permiteRecoger = tiendaActual?.permiteRecoger !== false;
  const tiendaBloqueada = Boolean(tiendaActual?.bloqueada);
  const quoteInvalida = cotizacion && cotizacion.valido === false && cumpleMinimo;

  return (
    <div className="cart-card-shell">
      {/* Encabezado */}
      <div className="cart-card-header">
        <div className="cart-title-wrap">
          <ShoppingCart size={20} className="text-primary" />
          <h3>Tu Carrito Activo</h3>
        </div>
        <div className="cart-header-right">
          <span className="cart-count-pill">
            {cart.reduce((s, i) => s + i.cantidad, 0)} ítem(s)
          </span>
          {onCloseDrawer && (
            <button type="button" className="icon-close-btn" onClick={onCloseDrawer} aria-label="Cerrar carrito">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Selector rápido Domicilio vs Recoger */}
      <div className="cart-delivery-toggle">
        <button
          type="button"
          disabled={!permiteDomicilio}
          className={tipoEntrega === 'DOMICILIO' ? 'is-active' : ''}
          onClick={() => onChangeTipoEntrega('DOMICILIO')}
        >
          <Bike size={15} />
          <span>Domicilio ({formatCOP(BUSINESS_RULES.COSTO_DOMICILIO)})</span>
        </button>
        <button
          type="button"
          disabled={!permiteRecoger}
          className={tipoEntrega === 'RECOGER' ? 'is-active' : ''}
          onClick={() => onChangeTipoEntrega('RECOGER')}
        >
          <Store size={15} />
          <span>Recoger ($0)</span>
        </button>
      </div>

      {/* Barra de pedido mínimo (Regla real backend) */}
      {tipoEntrega === 'DOMICILIO' ? (
        <div className={`min-order-box ${cumpleMinimo ? 'is-ok' : 'is-pending'}`}>
          <div className="min-order-top">
            <span className="min-order-label">
              {cumpleMinimo ? (
                <>
                  <CheckCircle2 size={15} className="text-success" /> Pedido mínimo alcanzado
                </>
              ) : (
                <>
                  <Bike size={15} className="text-primary" /> Pedido mínimo domicilio
                </>
              )}
            </span>
            <strong>
              {cumpleMinimo ? formatCOP(subtotal) : `Faltan ${formatCOP(faltante)}`}
            </strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="min-order-hint">
            Mínimo {formatCOP(pedidoMinimo)} en productos · Envío tarifa plana {formatCOP(BUSINESS_RULES.COSTO_DOMICILIO)}
          </p>
        </div>
      ) : (
        <div className="min-order-box is-ok">
          <div className="min-order-top">
            <span className="min-order-label">
              <Store size={15} className="text-success" /> Recoger en sede {tiendaActual?.nombre || ''}
            </span>
            <strong>$0 envío</strong>
          </div>
          <p className="min-order-hint">Sin monto mínimo. Listo en ~{tiendaActual?.tiempoEntregaMinutos || 30} min.</p>
        </div>
      )}

      {/* Lista de productos */}
      {cart.length === 0 ? (
        <div className="cart-empty-state">
          <div className="cart-empty-icon">
            <ShoppingBag size={28} />
          </div>
          <h4>Tu bolsa está vacía</h4>
          <p>Elige una pizza artesanal o un acompañamiento del menú para empezar.</p>
        </div>
      ) : (
        <>
          <div className="cart-items-scroll">
            {cart.map((item, idx) => (
              <div key={`${item.idproducto}-${idx}`} className="cart-item-row">
                <div className="cart-item-main">
                  <div className="cart-item-title">{item.descripcion}</div>
                  {item.resumenExtras && (
                    <p className="cart-item-meta">{item.resumenExtras}</p>
                  )}
                  {item.observaciones && (
                    <p className="cart-item-note">Nota: &ldquo;{item.observaciones}&rdquo;</p>
                  )}
                  <div className="cart-item-bottom">
                    <span className="cart-item-price">
                      {formatCOP(item.precioCalculado * item.cantidad)}
                    </span>
                    <div className="qty-stepper">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(idx, item.cantidad - 1)}
                        aria-label="Disminuir cantidad"
                      >
                        <Minus size={13} />
                      </button>
                      <span>{item.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(idx, item.cantidad + 1)}
                        aria-label="Aumentar cantidad"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="cart-remove-btn"
                  onClick={() => onRemoveItem(idx)}
                  title="Quitar del carrito"
                  aria-label="Eliminar ítem"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {quoteInvalida && (
            <div className="info-banner info-banner--error">
              <AlertTriangle size={15} />
              <span>{cotizacion.mensaje}</span>
            </div>
          )}

          {/* Totales */}
          <div className="cart-summary-footer">
            <div className="summary-row">
              <span>Subtotal productos</span>
              <span>{formatCOP(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>{tipoEntrega === 'RECOGER' ? 'Recoger en tienda' : 'Domicilio'}</span>
              <span>{tipoEntrega === 'RECOGER' ? '$0' : formatCOP(costoDomicilio)}</span>
            </div>
            {descuento > 0 && (
              <div className="summary-row summary-row--discount">
                <span>Descuento aplicado</span>
                <span>-{formatCOP(descuento)}</span>
              </div>
            )}
            <div className="summary-total-row">
              <span>Total estimado</span>
              <span className="summary-total-amount">
                {quoting && <RefreshCw size={14} className="spin-icon" />}
                {formatCOP(total)}
              </span>
            </div>

            <button
              type="button"
              className="btn-primary-pill btn-full"
              disabled={!cumpleMinimo || tiendaBloqueada || quoteInvalida}
              onClick={() => {
                if (onCloseDrawer) onCloseDrawer();
                onGoCheckout();
              }}
            >
              <span>
                {tiendaBloqueada
                  ? 'Sede cerrada temporalmente'
                  : !cumpleMinimo
                    ? `Mínimo ${formatCOP(pedidoMinimo)} para domicilio`
                    : 'Ir al Checkout Express'}
              </span>
              <ArrowRight size={17} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function LiveCartSidebar(props) {
  return (
    <aside className="desktop-cart-rail hide-mobile" aria-label="Carrito activo">
      <div className="sticky-cart-wrap">
        <CartPanelContent {...props} />
      </div>
    </aside>
  );
}

