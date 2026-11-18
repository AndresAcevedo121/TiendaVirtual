import React, { useState, useMemo } from 'react';
import { MapPin, Clock, Phone, Bike, Store, CheckCircle2, Search, AlertTriangle } from 'lucide-react';

export default function SedesView({ tiendas, tiendaActual, onSelectTienda, onNavigateMenu }) {
  const [municipioFilter, setMunicipioFilter] = useState('ALL');
  const [query, setQuery] = useState('');

  const municipios = useMemo(() => {
    const set = new Set();
    tiendas.forEach(t => {
      if (t.municipio) set.add(t.municipio);
    });
    return Array.from(set);
  }, [tiendas]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tiendas.filter(t => {
      if (municipioFilter !== 'ALL' && t.municipio !== municipioFilter) return false;
      if (!q) return true;
      return (
        (t.nombre || '').toLowerCase().includes(q) ||
        (t.direccion || '').toLowerCase().includes(q) ||
        (t.municipio || '').toLowerCase().includes(q)
      );
    });
  }, [tiendas, municipioFilter, query]);

  return (
    <div className="container section-block sedes-page">
      <div className="page-hero-header">
        <div>
          <span className="eyebrow-label">Red de Puntos de Venta (GET /api/v1/tiendas)</span>
          <h1 className="page-title">Nuestras Sedes en Medellín y el Valle de Aburrá</h1>
          <p className="page-subtitle">
            Consulta los puntos de venta de Pizza Americana en el área metropolitana, horarios de atención y tiempos estimados.
          </p>
        </div>

        <div className="sedes-search-input">
          <Search size={16} className="text-muted" />
          <input
            type="search"
            placeholder="Buscar sede o dirección..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {municipios.length > 0 && (
        <div className="category-chips-scroll sedes-filter-row">
          <button
            type="button"
            className={`category-chip ${municipioFilter === 'ALL' ? 'is-active' : ''}`}
            onClick={() => setMunicipioFilter('ALL')}
          >
            Todos los municipios ({tiendas.length})
          </button>
          {municipios.map(m => (
            <button
              key={m}
              type="button"
              className={`category-chip ${municipioFilter === m ? 'is-active' : ''}`}
              onClick={() => setMunicipioFilter(m)}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      <div className="sedes-directory-grid">
        {filtered.map(sede => {
          const isSelected = tiendaActual?.idtienda === sede.idtienda;
          const isBlocked = Boolean(sede.bloqueada);

          return (
            <article key={sede.idtienda} className={`sede-directory-card ${isSelected ? 'is-selected' : ''}`}>
              <div className="sede-card-top">
                <div className="sede-card-badge-row">
                  <span className="sede-city-chip">{sede.municipio || 'Valle de Aburrá'}</span>
                  {isBlocked ? (
                    <span className="status-badge status-badge--error">
                      <AlertTriangle size={13} /> Cerrada temporalmente
                    </span>
                  ) : isSelected ? (
                    <span className="status-badge status-badge--success">
                      <CheckCircle2 size={13} /> Sede Activa
                    </span>
                  ) : (
                    <span className="status-badge status-badge--neutral">Abierta</span>
                  )}
                </div>
                <h3>Pizza Americana {sede.nombre}</h3>
                <p className="sede-address-line">
                  <MapPin size={15} className="text-primary" />
                  <span>{sede.direccion || 'Dirección registrada en punto de venta'}</span>
                </p>
              </div>

              <div className="sede-specs-box">
                <div>
                  <Clock size={15} />
                  <span>Tiempo estimado: <strong>~{sede.tiempoEntregaMinutos || 40} min</strong></span>
                </div>
                <div>
                  <Phone size={15} />
                  <span>Línea: <strong>{sede.telefono || '604 444 4553'}</strong></span>
                </div>
                <div className="sede-modes-row">
                  {sede.permiteDomicilio !== false && (
                    <span className="mode-pill">
                      <Bike size={14} /> Domicilio
                    </span>
                  )}
                  {sede.permiteRecoger !== false && (
                    <span className="mode-pill">
                      <Store size={14} /> Recoger en tienda
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                disabled={isBlocked}
                className="btn-soft-navy btn-full"
                onClick={onNavigateMenu}
              >
                {isBlocked ? 'No disponible temporalmente' : 'Ver Menú'}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

