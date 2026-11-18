import React from 'react';
import { Award, Sparkles, Info, ArrowRight, Gift, CheckCircle2 } from 'lucide-react';
import { formatCOP, estimatePuntos } from '../utils/format';

export default function PuntosView({ cartTotal = 0, onNavigate }) {
  const projectedOrderPts = estimatePuntos(cartTotal);

  return (
    <div className="container section-block puntos-page">
      <div className="info-banner info-banner--navy">
        <Info size={18} />
        <span>
          <strong>Vista previa funcional (RF-6 Fidelización):</strong> Esta sección implementa el diseño completo de Stitch para <strong>Puntos Pizza</strong>. Para consultar saldo real por teléfono y redimir premios se requiere habilitar el microservicio de Fidelización / CRM en el backend (no se muestran saldos ni redenciones simuladas).
        </span>
      </div>

      <div className="puntos-hero-card">
        <div className="puntos-gauge-col">
          <div className="donut-wrap">
            <svg className="donut-svg" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="12" />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#966b00"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="314.15"
                strokeDashoffset={projectedOrderPts > 0 ? '95' : '210'}
              />
            </svg>
            <div className="donut-center">
              <strong>+{projectedOrderPts}</strong>
              <span>Pts est. hoy</span>
            </div>
          </div>

          <div className="puntos-cart-projection">
            {cartTotal > 0 ? (
              <span>
                Tu carrito actual ({formatCOP(cartTotal)}) proyecta <strong>+{projectedOrderPts} Puntos Pizza</strong> cuando el módulo esté conectado.
              </span>
            ) : (
              <span>Agrega productos al carrito para ver los puntos proyectados de tu orden.</span>
            )}
          </div>
        </div>

        <div className="puntos-info-col">
          <span className="eyebrow-label">
            <Sparkles size={14} /> Programa Exclusivo de Clientes
          </span>
          <h1>Puntos Pizza Americana</h1>
          <p className="puntos-desc">
            Pensado bajo los requisitos del negocio (RF-6): inscripción automática con tu número de celular en el mismo flujo de compra, acumulación equivalente al POS y redención directa en catálogo.
          </p>

          <div className="rewards-bento-grid">
            <div className="reward-tier-card">
              <span className="tier-pts">60 Pts</span>
              <strong>Gaseosa 1.5L</strong>
              <span>Acompañamiento canjeable</span>
            </div>
            <div className="reward-tier-card">
              <span className="tier-pts">110 Pts</span>
              <strong>Deditos de Queso</strong>
              <span>Porción de 6 unidades</span>
            </div>
            <div className="reward-tier-card">
              <span className="tier-pts">180 Pts</span>
              <strong>Pizza Mediana</strong>
              <span>Especialidad tradicional</span>
            </div>
          </div>

          <div className="puntos-rules-list">
            <span>
              <CheckCircle2 size={15} className="text-success" /> Sin formularios largos: vinculado al teléfono del pedido
            </span>
            <span>
              <Gift size={15} className="text-primary" /> Acreditación tras entrega efectiva (RF-6.5)
            </span>
          </div>

          <div className="puntos-actions">
            <button type="button" className="btn-primary-pill" onClick={() => onNavigate('menu')}>
              <span>Ir al Menú a Pedir</span>
              <ArrowRight size={16} />
            </button>
            <button type="button" className="btn-soft-navy" onClick={() => onNavigate('promos')}>
              <Award size={16} />
              <span>Ver Promociones</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

