import React, { useState, useEffect } from 'react';
import { MapPin, X, CheckCircle2, AlertTriangle, RefreshCw, Store } from 'lucide-react';
import { validarCobertura } from '../services/api';

export default function CoberturaModal({
  isOpen,
  onClose,
  tiendas = [],
  tiendaActual,
  onSelectTienda,
  customerDraft,
  onSaveCustomerDraft
}) {
  const [direccion, setDireccion] = useState(customerDraft?.direccion || '');
  const [municipio, setMunicipio] = useState(
    customerDraft?.municipio || tiendaActual?.municipio || 'Medellin'
  );
  const [barrio, setBarrio] = useState(customerDraft?.barrio || '');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (customerDraft?.direccion && !direccion) setDireccion(customerDraft.direccion);
      if (customerDraft?.municipio) setMunicipio(customerDraft.municipio);
      if (customerDraft?.barrio && !barrio) setBarrio(customerDraft.barrio);
    }
  }, [isOpen, customerDraft]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!direccion.trim()) {
      setError('Por favor ingresa una dirección para validar la cobertura.');
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const res = await validarCobertura({
        direccion: direccion.trim(),
        municipio: municipio.trim() || 'Medellin',
        barrio: barrio.trim() || undefined
      });
      setResultado(res);

      if (res.cobertura && res.tiendaDisponible && res.idTienda) {
        const tiendaEncontrada = tiendas.find(t => t.idtienda === res.idTienda);
        if (tiendaEncontrada && onSelectTienda) {
          onSelectTienda(tiendaEncontrada);
        }
        if (onSaveCustomerDraft) {
          onSaveCustomerDraft({
            ...(customerDraft || {}),
            direccion: direccion.trim(),
            municipio: municipio.trim() || 'Medellin',
            barrio: barrio.trim()
          });
        }
      }
    } catch (err) {
      setError(err.message || 'No pudimos consultar la cobertura en este momento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-sheet modal-sheet--md"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Validar cobertura de domicilio"
      >
        <div className="modal-sheet-header">
          <div>
            <span className="eyebrow-label">Cobertura en tiempo real</span>
            <h2 className="modal-sheet-title">Verifica tu dirección de entrega</h2>
          </div>
          <button type="button" className="icon-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-fields-grid" style={{ marginTop: '0.75rem' }}>
          <div className="form-field form-field--full">
            <label htmlFor="cov-dir">Dirección de entrega *</label>
            <input
              id="cov-dir"
              type="text"
              required
              placeholder="Ej: Carrera 45 # 70-10"
              value={direccion}
              onChange={e => {
                setDireccion(e.target.value);
                if (resultado) setResultado(null);
                if (error) setError(null);
              }}
            />
          </div>

          <div className="form-field">
            <label htmlFor="cov-mun">Municipio</label>
            <input
              id="cov-mun"
              type="text"
              placeholder="Ej: Medellín, Bello, Envigado"
              value={municipio}
              onChange={e => setMunicipio(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="cov-barrio">Barrio (opcional)</label>
            <input
              id="cov-barrio"
              type="text"
              placeholder="Ej: Manrique, Laureles"
              value={barrio}
              onChange={e => setBarrio(e.target.value)}
            />
          </div>

          <div className="form-field form-field--full" style={{ marginTop: '0.25rem' }}>
            <button
              type="submit"
              disabled={loading || !direccion.trim()}
              className="btn-primary-pill btn-full"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin-icon" />
                  <span>Consultando cobertura...</span>
                </>
              ) : (
                <>
                  <MapPin size={16} />
                  <span>Verificar cobertura</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="info-banner info-banner--error" style={{ marginTop: '1rem' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {resultado && (
          <div
            className={`info-banner ${
              resultado.cobertura && resultado.tiendaDisponible
                ? 'info-banner--success'
                : 'info-banner--amber'
            }`}
            style={{ marginTop: '1rem', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              {resultado.cobertura && resultado.tiendaDisponible ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertTriangle size={18} />
              )}
              <span>
                {resultado.cobertura
                  ? resultado.tiendaDisponible
                    ? `¡Cobertura confirmada! Sede asignada: ${resultado.nombreTienda}`
                    : `Sede ${resultado.nombreTienda || 'asignada'} cerrada temporalmente`
                  : 'Sin cobertura de domicilio en esta dirección'}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.92 }}>
              {resultado.mensaje}
            </p>

            {resultado.cobertura && resultado.tiendaDisponible && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                <Store size={14} />
                <span>
                  ID Tienda asignada: <strong>{resultado.idTienda}</strong> · La sede ha sido seleccionada para tu pedido.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
