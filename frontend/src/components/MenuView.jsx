import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Clock,
  Flame,
  Sparkles,
  Plus,
  SlidersHorizontal,
  Search,
  AlertTriangle,
  Bike,
  Store,
  ChevronRight,
  Tag
} from 'lucide-react';
import ProductArtwork from './ProductArtwork';
import LiveCartSidebar from './LiveCartSidebar';
import { formatCOP, BUSINESS_RULES, estimatePuntos } from '../utils/format';

export default function MenuView({
  catalogo,
  tiendaActual,
  onOpenSedesModal,
  onSelectProduct,
  onNavigate,
  searchQuery,
  onSearchChange,
  cart,
  onUpdateQty,
  onRemoveItem,
  tipoEntrega,
  onChangeTipoEntrega,
  cotizacion,
  quoting
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');

  const categorias = catalogo?.categorias || [];

  const filteredCategorias = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return categorias
      .filter(cat => selectedCategoryId === 'ALL' || cat.idcategoria === selectedCategoryId)
      .map(cat => {
        const productos = (cat.productos || []).filter(prod => {
          if (prod.disponible === false) return false;
          if (!q) return true;
          return (
            (prod.nombre || '').toLowerCase().includes(q) ||
            (prod.descripcion || '').toLowerCase().includes(q) ||
            (cat.nombre || '').toLowerCase().includes(q)
          );
        });
        return { ...cat, productos };
      })
      .filter(cat => cat.productos.length > 0);
  }, [categorias, selectedCategoryId, searchQuery]);

  const totalProductosCount = useMemo(
    () => categorias.reduce((sum, c) => sum + (c.productos?.length || 0), 0),
    [categorias]
  );

  const isStoreBlocked = Boolean(tiendaActual?.bloqueada) || catalogo?.disponible === false;

  return (
    <div className="menu-page">
      {/* Tarjeta de Sede Activa */}
      <section className="container section-top-gap">
        <div className="active-store-card">
          <div className="active-store-info">
            <div className={`store-pulse-dot ${isStoreBlocked ? 'is-closed' : ''}`} />
            <div>
              <div className="active-store-heading">
                <span className="eyebrow-label">Sede que atiende tu pedido</span>
                <span className={`status-badge ${isStoreBlocked ? 'status-badge--error' : 'status-badge--success'}`}>
                  {isStoreBlocked ? 'Temporalmente cerrada' : 'Recibiendo pedidos'}
                </span>
              </div>
              <h2 className="active-store-name">
                Pizza Americana — {catalogo?.nombreTienda || tiendaActual?.nombre || 'Sede Principal'}
              </h2>
              <p className="active-store-meta">
                <span>
                  <MapPin size={14} /> {tiendaActual?.direccion || 'Cobertura Metropolitana'}
                </span>
                <span>
                  <Clock size={14} /> Tiempo estimado: ~{catalogo?.tiempoEstimadoMinutos || tiendaActual?.tiempoEntregaMinutos || 40} min
                </span>
                <span>
                  {tipoEntrega === 'RECOGER' ? (
                    <>
                      <Store size={14} /> Modo Recoger ($0 envío)
                    </>
                  ) : (
                    <>
                      <Bike size={14} /> Domicilio {formatCOP(BUSINESS_RULES.COSTO_DOMICILIO)} · Mín. {formatCOP(BUSINESS_RULES.PEDIDO_MINIMO_DOMICILIO)}
                    </>
                  )}
                </span>
              </p>
            </div>
          </div>

          <button type="button" className="btn-soft-navy" title="Validar cobertura">
            <MapPin size={15} />
            <span>Validar cobertura</span>
          </button>
        </div>
      </section>

      {/* Hero Banner Agile Americana */}
      <section className="container hero-wrap">
        <div className="hero-banner">
          <div className="hero-glow hero-glow--left" />
          <div className="hero-glow hero-glow--right" />

          <div className="hero-content">
            <span className="hero-badge">
              <Flame size={15} />
              <span>Horneadas al instante · Masa artesanal</span>
            </span>
            <h1 className="hero-title">
              Pide tus pizzas favoritas{' '}
              <span className="hero-title-accent">Mitad y Mitad</span> en minutos
            </h1>
            <p className="hero-subtitle">
              Elige tu tamaño, combina hasta dos especialidades y personaliza ingredientes con precios verificados en vivo desde nuestra cocina.
            </p>
            <div className="hero-actions">
              <a href="#catalogo-menu" className="btn-hero-gold">
                <span>Explorar el Menú</span>
                <ChevronRight size={17} />
              </a>
              <button type="button" className="btn-hero-glass" onClick={() => onNavigate('promos')}>
                <Tag size={16} />
                <span>Ver Promos y Combos</span>
              </button>
            </div>
          </div>

          <div className="hero-visual hide-tablet">
            <div className="hero-visual-card">
              <div className="hero-visual-badge">
                <Sparkles size={14} />
                <span>Combinación Estrella</span>
              </div>
              <div className="hero-visual-art">
                <ProductArtwork
                  producto={{ idproducto: 'hero', nombre: 'Pepperoni y Hawaiana', tipoProducto: 'P' }}
                  categoriaNombre="Pizzas"
                />
              </div>
              <div className="hero-visual-footer">
                <div>
                  <span className="hero-visual-label">Desde</span>
                  <strong>{formatCOP(21000)}</strong>
                </div>
                <span className="hero-visual-pill">4 a 12 porciones</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Barra Sticky de Categorías */}
      <div className="sticky-categories-bar" id="catalogo-menu">
        <div className="container categories-bar-inner">
          <div className="category-chips-scroll">
            <button
              type="button"
              className={`category-chip ${selectedCategoryId === 'ALL' ? 'is-active' : ''}`}
              onClick={() => setSelectedCategoryId('ALL')}
            >
              <span>Todas ({totalProductosCount})</span>
            </button>
            {categorias.map(cat => (
              <button
                key={cat.idcategoria}
                type="button"
                className={`category-chip ${selectedCategoryId === cat.idcategoria ? 'is-active' : ''}`}
                onClick={() => setSelectedCategoryId(cat.idcategoria)}
              >
                <span>{cat.nombre}</span>
                <span className="chip-count">{cat.productos?.length || 0}</span>
              </button>
            ))}
          </div>

          {searchQuery && (
            <div className="search-active-pill">
              <Search size={14} />
              <span>Filtro: &ldquo;{searchQuery}&rdquo;</span>
              <button type="button" onClick={() => onSearchChange('')}>
                Limpiar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Layout Principal 2 Columnas: Catálogo (izq) + Carrito Vivo (der) */}
      <section className="container catalog-layout">
        <div className="catalog-main-col">
          {!catalogo ? (
            <div className="empty-catalog-card">
              <p>Cargando catálogo de la sede seleccionada...</p>
            </div>
          ) : isStoreBlocked ? (
            <div className="info-banner info-banner--error">
              <AlertTriangle size={18} />
              <span>
                Esta sede está cerrada temporalmente por alta demanda. Puedes seleccionar otra sede disponible arriba.
              </span>
            </div>
          ) : null}

          {filteredCategorias.length === 0 && catalogo ? (
            <div className="empty-catalog-card">
              <Search size={32} className="text-muted" />
              <h3>No encontramos productos con &ldquo;{searchQuery}&rdquo;</h3>
              <p>Prueba buscando otra categoría o limpia el filtro de búsqueda.</p>
              <button
                type="button"
                className="btn-soft-navy"
                onClick={() => {
                  onSearchChange('');
                  setSelectedCategoryId('ALL');
                }}
              >
                Ver todo el menú
              </button>
            </div>
          ) : (
            filteredCategorias.map(cat => (
              <div key={cat.idcategoria} className="category-section">
                <div className="category-section-header">
                  <div>
                    <h2 className="section-title">{cat.nombre}</h2>
                    {cat.descripcion && <p className="section-subtitle">{cat.descripcion}</p>}
                  </div>
                  <span className="section-count-pill">
                    {cat.productos.length} {cat.productos.length === 1 ? 'opción' : 'opciones'}
                  </span>
                </div>

                <div className="products-grid-stitch">
                  {cat.productos.map(prod => {
                    const isPizza = prod.tipoProducto === 'P';
                    const pts = estimatePuntos(prod.precioBase);
                    return (
                      <article key={prod.idproducto} className="stitch-product-card">
                        <div className="product-media-box">
                          <ProductArtwork producto={prod} categoriaNombre={cat.nombre} />

                          <div className="product-badges-top">
                            {isPizza ? (
                              <span className="product-badge-dark">
                                {prod.tamanoCodigo} · {prod.porciones} Porciones
                              </span>
                            ) : (
                              <span className="product-badge-dark">{cat.nombre}</span>
                            )}
                            <span className="product-badge-points" title="Puntos estimados (próximo módulo fidelización)">
                              +{pts} Pts est.
                            </span>
                          </div>

                          {isPizza && prod.permiteMitadMitad && (
                            <span className="product-badge-split">Mitad y Mitad</span>
                          )}
                        </div>

                        <div className="product-card-body">
                          <div className="product-card-text">
                            <h3 className="product-card-title">{prod.nombre}</h3>
                            <p className="product-card-desc">
                              {prod.descripcion || 'Preparado al instante con ingredientes frescos seleccionados.'}
                            </p>
                          </div>

                          <div className="product-card-footer">
                            <div>
                              <span className="price-caption">
                                {isPizza ? 'Desde' : 'Precio'}
                              </span>
                              <span className="price-value">{formatCOP(prod.precioBase)}</span>
                            </div>

                            <button
                              type="button"
                              disabled={isStoreBlocked}
                              className={`btn-card-action ${isPizza ? 'is-config' : 'is-direct'}`}
                              onClick={() => onSelectProduct(prod)}
                            >
                              {isPizza ? (
                                <>
                                  <SlidersHorizontal size={15} />
                                  <span>Personalizar</span>
                                </>
                              ) : (
                                <>
                                  <Plus size={16} />
                                  <span>Agregar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Columna derecha persistente: Tu Carrito Activo */}
        <LiveCartSidebar
          cart={cart}
          onUpdateQty={onUpdateQty}
          onRemoveItem={onRemoveItem}
          tipoEntrega={tipoEntrega}
          onChangeTipoEntrega={onChangeTipoEntrega}
          tiendaActual={tiendaActual}
          cotizacion={cotizacion}
          quoting={quoting}
          onGoCheckout={() => onNavigate('checkout')}
        />
      </section>
    </div>
  );
}

