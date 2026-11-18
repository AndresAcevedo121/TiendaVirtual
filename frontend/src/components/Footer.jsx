import React from 'react';
import { Pizza, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { BUSINESS_RULES } from '../utils/format';

export default function Footer({ onNavigate, tiendasCount }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand-col">
          <div className="footer-brand-logo">
            <span className="brand-emblem">
              <Pizza size={20} />
            </span>
            <strong>Pizza Americana</strong>
          </div>
          <p>
            Tradición artesanal en Medellín y el Área Metropolitana. Pizzas horneadas al instante con ingredientes frescos y cálculo transparente verificado en sede.
          </p>
        </div>

        <div>
          <h4>Explorar</h4>
          <ul>
            <li>
              <button type="button" onClick={() => onNavigate('menu')}>
                Menú Digital
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('promos')}>
                Promos e Insuperables
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('sedes')}>
                Sedes ({tiendasCount})
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('puntos')}>
                Puntos Pizza
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4>Atención &amp; Domicilios</h4>
          <ul className="footer-contact-list">
            <li>
              <Phone size={14} />
              <a href="tel:6044444553">{BUSINESS_RULES.HOTLINE_PRIMARY}</a>
            </li>
            <li>
              <Phone size={14} />
              <a href="tel:6044442525">{BUSINESS_RULES.HOTLINE_SECONDARY}</a>
            </li>
            <li>
              <MapPin size={14} />
              <span>Medellín, Bello, Envigado, Itagüí</span>
            </li>
          </ul>
        </div>

        <div>
          <h4>Compra Segura</h4>
          <div className="footer-legal-box">
            <ShieldCheck size={16} className="text-gold" />
            <span>
              Tratamiento de datos bajo la <strong>Ley 1581 de 2012</strong>. Pagos digitales procesados con Wompi, datáfono o efectivo contra entrega.
            </span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© {new Date().getFullYear()} Pizza Americana · Tienda Virtual</span>
          <span>Domicilio {`$${BUSINESS_RULES.COSTO_DOMICILIO.toLocaleString('es-CO')}`} · Pedido mínimo domicilio {`$${BUSINESS_RULES.PEDIDO_MINIMO_DOMICILIO.toLocaleString('es-CO')}`}</span>
        </div>
      </div>
    </footer>
  );
}

