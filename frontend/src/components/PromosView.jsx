import React, { useState, useMemo } from 'react';
import {
  Flame,
  Zap,
  Sparkles,
  ShieldCheck,
  Tag,
  CheckCircle2,
  SlidersHorizontal,
  Plus,
  Clock,
  ArrowRight,
  Layers
} from 'lucide-react';
import ProductArtwork from './ProductArtwork';
import { formatCOP, estimatePuntos } from '../utils/format';

const STITCH_COMBOS_PREVIEW = [
  {
    id: 'stitch-pareja',
    tag: 'Parejas',
    badge: 'Ahorro estimado $19.100',
    title: 'Combo Dúo Americano',
    desc: '2 Pizzas Medianas de 6 porciones + Gaseosa 1.5L para compartir.',
    personas: 'Para 2-3 personas',
    precioRef: 64900,
    precioAntes: 84000,
    incluye: ['2 Pizzas Medianas (6 porciones c/u)', 'Gaseosa 1.5 Litros', 'Personaliza ambos sabores']
  },
  {
    id: 'stitch-familiar',
    tag: 'Familiares',
    badge: 'Ahorro estimado $25.000',
    title: 'Combo Familiar Fiesta',
    desc: 'Pensado para reuniones en casa con entradas crujientes y bebida familiar.',
    personas: 'Para 5-6 personas',
    precioRef: 89900,
    precioAntes: 114900,
    incluye: ['2 Pizzas Grandes (8 porciones c/u)', 'Porción doble de Deditos de queso', 'Bebida familiar']
  },
  {
    id: 'stitch-2x1',
    tag: '2x1',
    badge: 'Campaña por vigencia',
    title: 'Martes 2x1 en Medianas',
    desc: 'Segunda pizza mediana sin costo adicional en referencias participantes.',
    personas: 'Vigencia configurable',
    precioRef: 42900,
    precioAntes: 85800,
    incluye: ['Aplica por franja horaria y sede', 'Control de acumulación y topes (RF-4)']
  }
];

export default function PromosView({ catalogo, tiendaActual, onSelectProduct, onNavigate }) {
  const [filter, setFilter] = useState('all');

  const { realPromoItems, shareableProducts } = useMemo(() => {
    const categorias = catalogo?.categorias || [];
    const promos = [];
    const shareable = [];

    categorias.forEach(cat => {
      const catName = (cat.nombre || '').toLowerCase();
      (cat.productos || []).forEach(prod => {
        if (prod.disponible === false) return;
        const pName = (prod.nombre || '').toLowerCase();
        const isPromo =
          /promo|combo|insuperable|2x1|oferta/i.test(catName) ||
          /promo|combo|2x1|pack/i.test(pName);

        if (isPromo) {
          promos.push({ ...prod, categoriaNombre: cat.nombre });
        } else if (
          prod.tipoProducto === 'P' &&
          (prod.porciones >= 8 || /grande|extragrande|familiar/i.test(pName))
        ) {
          shareable.push({ ...prod, categoriaNombre: cat.nombre });
        }
      });
    });

    return { realPromoItems: promos, shareableProducts: shareable };
  }, [catalogo]);

  const isStoreBlocked = Boolean(tiendaActual?.bloqueada) || catalogo?.disponible === false;

  return (
    <div className="promos-page">
      {/* Hero Oscuro Las Insuperables */}
      <section className="promos-hero">
        <div className="hero-glow hero-glow--right" />
        <div className="container promos-hero-grid">
          <div className="promos-hero-copy">
            <span className="hero-badge hero-badge--pulse">
              <Flame size={15} />
              <span>Edición Especial Medellín &amp; Valle de Aburrá</span>
            </span>
            <h1 className="promos-hero-title">
              Las Insuperables de{' '}
              <span className="hero-title-accent">Pizza Americana</span>
            </h1>
            <p className="promos-hero-subtitle">
              Más sabor crujiente para compartir en casa. Pizzas familiares configurables al instante y hoja de ruta lista para combos y promociones 2x1.
            </p>
            <div className="promos-benefits-row">
              <span>
                <Zap size={15} className="text-gold" /> Entrega ~{catalogo?.tiempoEstimadoMinutos || 40} min
              </span>
              <span>
                <Sparkles size={15} className="text-gold" /> Acumulación estimada Puntos Pizza
              </span>
              <span>
                <ShieldCheck size={15} className="text-gold" /> Precios validados en servidor
              </span>
            </div>
          </div>

          <div className="promos-hero-showcase">
            <div className="showcase-glass-frame">
              <span className="showcase-tag">
                <Tag size={14} /> ¡Sabor para compartir!
              </span>
              <div className="showcase-artwork-wrap">
                <ProductArtwork
                  producto={{ idproducto: 'promo-hero', nombre: 'Pizza Grande Pepperoni', tipoProducto: 'P' }}
                  categoriaNombre="Pizzas"
                />
              </div>
              <div className="showcase-price-box">
                <span>Pizzas grandes desde</span>
                <strong>{formatCOP(shareableProducts[0]?.precioBase || 48000)}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros Sticky */}
      <div className="sticky-categories-bar">
        <div className="container categories-bar-inner">
          <div className="category-chips-scroll">
            <button
              type="button"
              className={`category-chip ${filter === 'all' ? 'is-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todos los Destacados
            </button>
            <button
              type="button"
              className={`category-chip ${filter === 'compartir' ? 'is-active' : ''}`}
              onClick={() => setFilter('compartir')}
            >
              Pizzas para Compartir ({shareableProducts.length})
            </button>
            <button
              type="button"
              className={`category-chip ${filter === 'combos' ? 'is-active' : ''}`}
              onClick={() => setFilter('combos')}
            >
              Combos y 2x1 ({realPromoItems.length > 0 ? realPromoItems.length : STITCH_COMBOS_PREVIEW.length})
            </button>
          </div>
        </div>
      </div>

      {/* Catálogo Real de Pizzas Grandes / Promos del Backend */}
      {filter !== 'combos' && (
        <section className="container section-block">
          <div className="section-heading-row">
            <div>
              <span className="eyebrow-label">Disponibles hoy en {tiendaActual?.nombre || 'tu sede'}</span>
              <h2 className="section-title">
                {realPromoItems.length > 0 ? 'Promociones Activas de la Sede' : 'Opciones Familiares para Compartir'}
              </h2>
            </div>
            <button type="button" className="btn-soft-navy" onClick={() => onNavigate('menu')}>
              Ver Menú Completo
            </button>
          </div>

          <div className="promos-cards-grid">
            {(realPromoItems.length > 0 ? realPromoItems : shareableProducts).map(prod => (
              <article key={prod.idproducto} className="promo-product-card">
                <div className="promo-card-media">
                  <ProductArtwork producto={prod} categoriaNombre={prod.categoriaNombre} />
                  <span className="promo-floating-badge">
                    {prod.porciones ? `${prod.porciones} Porciones` : 'Disponible hoy'}
                  </span>
                </div>
                <div className="promo-card-content">
                  <div>
                    <h3>{prod.nombre}</h3>
                    <p>{prod.descripcion || 'Pizza familiar horneada al momento.'}</p>
                    <ul className="promo-checklist">
                      <li>
                        <CheckCircle2 size={15} className="text-success" />
                        <span>
                          {prod.permiteMitadMitad ? 'Permite combinar Mitad y Mitad' : 'Preparación tradicional'}
                        </span>
                      </li>
                      <li>
                        <CheckCircle2 size={15} className="text-success" />
                        <span>Compatible con modificadores Con / Sin y adiciones</span>
                      </li>
                    </ul>
                  </div>

                  <div className="promo-card-footer">
                    <div>
                      <span className="price-caption">Desde</span>
                      <span className="price-value">{formatCOP(prod.precioBase)}</span>
                    </div>
                    <span className="product-badge-points">+{estimatePuntos(prod.precioBase)} Pts est.</span>
                  </div>

                  <button
                    type="button"
                    disabled={isStoreBlocked}
                    className="btn-primary-pill btn-full"
                    onClick={() => onSelectProduct(prod)}
                  >
                    {prod.tipoProducto === 'P' ? (
                      <>
                        <SlidersHorizontal size={16} />
                        <span>Elegir Sabores y Agregar</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>Agregar al Pedido</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Tarjetas Preview de Combos y 2x1 (Módulo Microservicio Promociones RF-4) */}
      {filter !== 'compartir' && (
        <section className="container section-block">
          <div className="section-heading-row">
            <div>
              <span className="eyebrow-label">Arquitectura de Microservicios (RF-4)</span>
              <h2 className="section-title">Combos y Reglas 2x1 de Stitch</h2>
            </div>
            <span className="status-badge status-badge--gold">
              <Layers size={14} /> Requiere Microservicio de Promociones
            </span>
          </div>

          <div className="info-banner info-banner--navy">
            <Clock size={17} />
            <span>
              Los combos armados y descuentos 2x1 automáticos requieren publicar los SKUs de combo y el motor de vigencia/topes en el backend (RF-1.8 y RF-4). No simulamos ítems ficticios en tu pedido; mientras tanto puedes armar cada pizza con precio real desde el menú.
            </span>
          </div>

          <div className="promos-cards-grid">
            {STITCH_COMBOS_PREVIEW.map(combo => (
              <article key={combo.id} className="promo-product-card promo-product-card--preview">
                <div className="promo-card-media">
                  <ProductArtwork producto={{ idproducto: combo.id, nombre: combo.title, tipoProducto: 'P' }} />
                  <span className="promo-savings-pill">{combo.badge}</span>
                  <span className="promo-floating-badge">{combo.personas}</span>
                </div>
                <div className="promo-card-content">
                  <div>
                    <h3>{combo.title}</h3>
                    <p>{combo.desc}</p>
                    <ul className="promo-checklist">
                      {combo.incluye.map((line, i) => (
                        <li key={i}>
                          <CheckCircle2 size={15} className="text-success" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="promo-card-footer">
                    <div>
                      <span className="price-strike">{formatCOP(combo.precioAntes)}</span>
                      <span className="price-value">{formatCOP(combo.precioRef)}</span>
                    </div>
                    <span className="status-badge status-badge--neutral">Próximamente</span>
                  </div>

                  <button
                    type="button"
                    className="btn-soft-navy btn-full"
                    onClick={() => onNavigate('menu')}
                  >
                    <span>Armar con productos reales del menú</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Banner inferior Fidelización */}
      <section className="container section-block">
        <div className="points-promo-banner">
          <div>
            <span className="eyebrow-label">Programa de Fidelización</span>
            <h3>Acumula Puntos Pizza en tus pedidos</h3>
            <p>
              Conoce la proyección visual del módulo de fidelización basado en tu número telefónico (RF-6).
            </p>
          </div>
          <button type="button" className="btn-primary-pill" onClick={() => onNavigate('puntos')}>
            <Sparkles size={16} />
            <span>Explorar Puntos Pizza</span>
          </button>
        </div>
      </section>
    </div>
  );
}

