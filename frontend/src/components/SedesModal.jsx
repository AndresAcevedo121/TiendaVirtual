import React, { useState } from 'react';
import { MapPin, Clock, Bike, Store, X, CheckCircle2, AlertTriangle, Search } from 'lucide-react';

export default function SedesModal({ isOpen, onClose, tiendas, tiendaActual, onSelectTienda, hasCartItems }) {
  const [filter, setFilter] = useState('');

  if (!isOpen) return null;

  const filtered = tiendas.filter(t => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return (
      (t.nombre || '').toLowerCase().includes(q) ||
      (t.municipio || '').toLowerCase().includes(q) ||
      (t.direccion || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet modal-sheet--md" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Seleccionar sede">
        <div className="modal-sheet-header">
          <div>
            <span className="eyebrow-label">Cobertura Valle de Aburrá</span>
            <h2 className="modal-sheet-title">Elige tu sede de Pizza Americana</h2>
          </div>
          <button type="button" className="icon-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {hasCartItems && (
          <div className="info-banner info-banner--amber">
            <AlertTriangle size={16} />
            <span>
              Al cambiar de sede se actualizará el catálogo y los precios de tu carrito según la disponibilidad de la nueva tienda.
            </span>
          </div>
        )}

        <div className="modal-search-wrap">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            placeholder="Filtrar por barrio, sede o municipio..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>

        <div className="sedes-modal-grid">
          {filtered.map(sede => {
            const isSelected = tiendaActual?.idtienda === sede.idtienda;
            const isBlocked = Boolean(sede.bloqueada);
            return (
              <button
                key={sede.idtienda}
                type="button"
                disabled={isBlocked}
                className={`sede-option-card ${isSelected ? 'is-selected' : ''} ${isBlocked ? 'is-blocked' : ''}`}
                onClick={() => {
                  onSelectTienda(sede);
                  onClose();
                }}
              >
                <div className="sede-option-top">
                  <div className="sede-option-title">
                    <MapPin size={17} className="text-primary" />
                    <strong>{sede.nombre}</strong>
                  </div>
                  {isBlocked ? (
                    <span className="status-badge status-badge--error">Cerrada temporalmente</span>
                  ) : isSelected ? (
                    <span className="status-badge status-badge--success">
                      <CheckCircle2 size={13} /> Activa
                    </span>
                  ) : (
                    <span className="status-badge status-badge--neutral">Disponible</span>
                  )}
                </div>

                <p className="sede-option-address">
                  {sede.direccion || 'Sede oficial Pizza Americana'}
                  {sede.municipio ? ` · ${sede.municipio}` : ''}
                </p>

                <div className="sede-option-meta">
                  <span>
                    <Clock size={13} /> ~{sede.tiempoEntregaMinutos || 40} min
                  </span>
                  {sede.permiteDomicilio !== false && (
                    <span>
                      <Bike size={13} /> Domicilio
                    </span>
                  )}
                  {sede.permiteRecoger !== false && (
                    <span>
                      <Store size={13} /> Recoger
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <p className="empty-inline-msg">No encontramos sedes con ese criterio.</p>
          )}
        </div>
      </div>
    </div>
  );
}

