import React from 'react';
import {
  Pizza,
  Bike,
  Store,
  MapPin,
  ChevronDown,
  Search,
  ShoppingBag,
  User,
  Phone,
  Award,
  X
} from 'lucide-react';
import { formatCOP, BUSINESS_RULES } from '../utils/format';

export default function Header({
  activeView,
  onNavigate,
  tiendas,
  tiendaActual,
  onOpenSedesModal,
  onOpenCoberturaModal,
  tipoEntrega,
  onChangeTipoEntrega,
  searchQuery,
  onSearchChange,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenGuestProfile,
  hasGuestProfile
}) {
  const permiteDomicilio = tiendaActual?.permiteDomicilio !== false;
  const permiteRecoger = tiendaActual?.permiteRecoger !== false;

  const navItems = [
    { id: 'menu', label: 'Menú' },
    { id: 'promos', label: 'Promos' },
    { id: 'sedes', label: 'Sedes' },
    { id: 'puntos', label: 'Puntos' }
  ];

  return (
    <header className="site-header">
      {/* Barra superior institucional */}
      <div className="utility-bar">
        <div className="container utility-bar-inner">
          <div className="utility-left">
            <Phone size={13} />
            <span>
              Línea única de domicilios:{' '}
              <a href="tel:6044444553" className="utility-link">
                {BUSINESS_RULES.HOTLINE_PRIMARY}
              </a>{' '}
              /{' '}
              <a href="tel:6044442525" className="utility-link">
                {BUSINESS_RULES.HOTLINE_SECONDARY}
              </a>
            </span>
          </div>

          <div className="utility-right">
            <button
              type="button"
              className="utility-points-btn"
              onClick={() => onNavigate('puntos')}
              title="Ver programa Puntos Pizza (próximo módulo)"
            >
              <Award size={14} />
              <span>Puntos Pizza</span>
            </button>
            <span className="utility-sep hide-sm">|</span>
            <span className="hide-sm">Medellín y Área Metropolitana</span>
          </div>
        </div>
      </div>

      {/* Barra principal */}
      <div className="container main-header-inner">
        <div className="header-left-group">
          <button
            type="button"
            className="brand-btn"
            onClick={() => onNavigate('menu')}
            aria-label="Ir al menú principal de Pizza Americana"
          >
            <span className="brand-emblem">
              <Pizza size={22} />
            </span>
            <span className="brand-text">Pizza Americana</span>
          </button>

          {/* Toggle rápido Domicilio / Recoger */}
          <div className="delivery-pill-switch hide-tablet" role="group" aria-label="Tipo de entrega">
            <button
              type="button"
              disabled={!permiteDomicilio}
              className={`delivery-pill-btn ${tipoEntrega === 'DOMICILIO' ? 'is-active' : ''}`}
              onClick={() => onChangeTipoEntrega('DOMICILIO')}
            >
              <Bike size={15} />
              <span>Domicilio</span>
            </button>
            <button
              type="button"
              disabled={!permiteRecoger}
              className={`delivery-pill-btn ${tipoEntrega === 'RECOGER' ? 'is-active' : ''}`}
              onClick={() => onChangeTipoEntrega('RECOGER')}
            >
              <Store size={15} />
              <span>Recoger</span>
            </button>
          </div>

          {/* Botón Validar Cobertura */}
          <button
            type="button"
            className="sede-picker-btn"
            title="Validar cobertura"
            onClick={onOpenCoberturaModal}
          >
            <MapPin size={16} className="text-primary" />
            <span className="sede-picker-text">
              <strong>Validar cobertura</strong>
              {tiendaActual?.nombre && (
                <small style={{ display: 'block', fontSize: '0.72rem', opacity: 0.78 }}>
                  Sede: {tiendaActual.nombre}
                </small>
              )}
            </span>
          </button>
        </div>

        {/* Navegación central */}
        <nav className="main-nav hide-mobile" aria-label="Navegación principal">
          {navItems.map(item => {
            const isActive =
              activeView === item.id ||
              (activeView === 'configurator' && item.id === 'menu');
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-link-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Acciones derecha */}
        <div className="header-actions">
          <div className="search-box hide-sm">
            <Search size={16} className="search-icon" />
            <input
              type="search"
              className="search-input"
              placeholder="Buscar pizzas, bebidas..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (activeView !== 'menu' && e.target.value.trim()) {
                  onNavigate('menu');
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear"
                onClick={() => onSearchChange('')}
                aria-label="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="header-cart-btn"
            onClick={onOpenCart}
            aria-label="Abrir carrito de compras"
          >
            <ShoppingBag size={18} className="text-primary" />
            <span className="header-cart-total hide-sm">{formatCOP(cartTotal)}</span>
            <span className="header-cart-badge">{cartCount}</span>
          </button>

          <button
            type="button"
            className={`avatar-btn ${hasGuestProfile ? 'has-data' : ''}`}
            onClick={onOpenGuestProfile}
            title="Mis datos de entrega guardados"
            aria-label="Mis datos de entrega guardados"
          >
            <User size={17} />
          </button>
        </div>
      </div>

      {/* Subbarra móvil de navegación + modo entrega */}
      <div className="mobile-subbar show-mobile-only">
        <div className="mobile-nav-scroll">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`mobile-nav-chip ${activeView === item.id ? 'is-active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mobile-delivery-mini">
          <button
            type="button"
            className={tipoEntrega === 'DOMICILIO' ? 'is-active' : ''}
            onClick={() => permiteDomicilio && onChangeTipoEntrega('DOMICILIO')}
            disabled={!permiteDomicilio}
          >
            Domicilio
          </button>
          <button
            type="button"
            className={tipoEntrega === 'RECOGER' ? 'is-active' : ''}
            onClick={() => permiteRecoger && onChangeTipoEntrega('RECOGER')}
            disabled={!permiteRecoger}
          >
            Recoger
          </button>
        </div>
      </div>
    </header>
  );
}
