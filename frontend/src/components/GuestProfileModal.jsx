import React, { useState } from 'react';
import { User, X, Trash2, CheckCircle2, Info } from 'lucide-react';

export default function GuestProfileModal({ isOpen, onClose, customerDraft, onSave, onClear }) {
  const [nombre, setNombre] = useState(customerDraft?.nombre || '');
  const [telefono, setTelefono] = useState(customerDraft?.telefono || '');
  const [correo, setCorreo] = useState(customerDraft?.correo || '');
  const [direccion, setDireccion] = useState(customerDraft?.direccion || '');
  const [barrio, setBarrio] = useState(customerDraft?.barrio || '');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSave({
      ...customerDraft,
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      correo: correo.trim(),
      direccion: direccion.trim(),
      barrio: barrio.trim()
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet modal-sheet--sm" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Datos rápidos de entrega">
        <div className="modal-sheet-header">
          <div className="profile-header-title">
            <User size={20} className="text-primary" />
            <div>
              <span className="eyebrow-label">Autocompletado local</span>
              <h2 className="modal-sheet-title">Mis Datos de Entrega</h2>
            </div>
          </div>
          <button type="button" className="icon-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="info-banner info-banner--navy">
          <Info size={16} />
          <span>
            Estos datos se guardan solo en tu navegador para agilizar el checkout (el módulo de cuentas y login en servidor se agregará en una fase posterior).
          </span>
        </div>

        <form onSubmit={handleSave} className="guest-profile-form">
          <div className="form-field">
            <label>Nombre completo</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" />
          </div>
          <div className="form-field">
            <label>Celular / WhatsApp</label>
            <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="3001234567" />
          </div>
          <div className="form-field">
            <label>Correo electrónico</label>
            <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" />
          </div>
          <div className="form-field">
            <label>Dirección habitual</label>
            <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Calle 10 # 20-30" />
          </div>
          <div className="form-field">
            <label>Barrio</label>
            <input type="text" value={barrio} onChange={e => setBarrio(e.target.value)} placeholder="Barrio" />
          </div>

          <div className="guest-profile-actions">
            <button type="submit" className="btn-primary-pill">
              <CheckCircle2 size={16} />
              <span>Guardar en este equipo</span>
            </button>
            <button
              type="button"
              className="btn-soft-danger"
              onClick={() => {
                onClear();
                onClose();
              }}
            >
              <Trash2 size={15} />
              <span>Borrar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

