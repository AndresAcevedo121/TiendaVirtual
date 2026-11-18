import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  Check,
  Plus,
  Minus,
  Sparkles,
  ChefHat,
  UtensilsCrossed,
  ShoppingBag,
  Info
} from 'lucide-react';
import { SplitPizzaVisualizer } from './ProductArtwork';
import { formatCOP, estimatePuntos } from '../utils/format';

const QUICK_NOTES = [
  'Bien doradita',
  'Cortar en cuadros',
  'Orégano extra',
  'Poco queso'
];

export default function PizzaConfigurator({
  initialPizza,
  availablePizzaSizes = [],
  onBack,
  onAddToCart
}) {
  const [selectedProductId, setSelectedProductId] = useState(initialPizza?.idproducto);

  const currentPizza = useMemo(() => {
    return (
      availablePizzaSizes.find(p => p.idproducto === selectedProductId) ||
      initialPizza
    );
  }, [availablePizzaSizes, selectedProductId, initialPizza]);

  const especialidades = currentPizza?.especialidades || [];
  const adiciones = currentPizza?.adiciones || [];

  const [esMitadMitad, setEsMitadMitad] = useState(false);
  const [esp1, setEsp1] = useState(especialidades[0]?.idespecialidad || null);
  const [esp2, setEsp2] = useState(especialidades[1]?.idespecialidad || especialidades[0]?.idespecialidad || null);
  const [adicionesSeleccionadas, setAdicionesSeleccionadas] = useState([]);
  const [modificadores, setModificadores] = useState({});
  const [observaciones, setObservaciones] = useState('');
  const [cantidad, setCantidad] = useState(1);

  if (!currentPizza) return null;

  const esp1Obj = especialidades.find(e => e.idespecialidad === esp1) || especialidades[0];
  const esp2Obj = especialidades.find(e => e.idespecialidad === esp2) || especialidades[1] || especialidades[0];

  // Clasificar si el backend trae adiciones de borde/masa vs toppings regulares
  const borderAdiciones = adiciones.filter(a => /borde|masa|orilla/i.test(a.nombre || ''));
  const regularAdiciones = adiciones.filter(a => !/borde|masa|orilla/i.test(a.nombre || ''));
  const hasBorderSelected = borderAdiciones.some(a => adicionesSeleccionadas.includes(a.id));

  // Fórmula exacta POS / Backend (RF-1.5 / Skill 01)
  let recargoSabores = 0;
  if (esMitadMitad && currentPizza.permiteMitadMitad) {
    const r1 = esp1Obj ? (esp1Obj.recargoMitad || 0) : 0;
    const r2 = esp2Obj ? (esp2Obj.recargoMitad || 0) : 0;
    recargoSabores = r1 + r2;
  } else {
    recargoSabores = esp1Obj ? (esp1Obj.recargoCompleta || 0) : 0;
  }

  const totalAdiciones = adicionesSeleccionadas.reduce((sum, idAdic) => {
    const found = adiciones.find(a => a.id === idAdic);
    return sum + (found ? Number(found.precio || 0) : 0);
  }, 0);

  const precioUnitario = Number(currentPizza.precioBase || 0) + Number(recargoSabores) + totalAdiciones;
  const precioTotal = precioUnitario * cantidad;
  const puntosEst = estimatePuntos(precioTotal);

  const handleSwitchSize = (sizeProd) => {
    setSelectedProductId(sizeProd.idproducto);
    if (!sizeProd.permiteMitadMitad) {
      setEsMitadMitad(false);
    }
    const nextEsps = sizeProd.especialidades || [];
    if (nextEsps.length > 0 && !nextEsps.some(e => e.idespecialidad === esp1)) {
      setEsp1(nextEsps[0].idespecialidad);
    }
    if (nextEsps.length > 1 && !nextEsps.some(e => e.idespecialidad === esp2)) {
      setEsp2(nextEsps[1].idespecialidad);
    }
    const nextAdicIds = new Set((sizeProd.adiciones || []).map(a => a.id));
    setAdicionesSeleccionadas(prev => prev.filter(id => nextAdicIds.has(id)));
  };

  const toggleAdicion = (id) => {
    setAdicionesSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectBorderOption = (borderIdOrNull) => {
    const borderIds = new Set(borderAdiciones.map(b => b.id));
    setAdicionesSeleccionadas(prev => {
      const withoutBorders = prev.filter(id => !borderIds.has(id));
      return borderIdOrNull ? [...withoutBorders, borderIdOrNull] : withoutBorders;
    });
  };

  const toggleModificador = (ingrediente, tipo, mitadKey) => {
    const key = `${mitadKey}_${ingrediente.id}_${tipo}`;
    setModificadores(prev => {
      const copy = { ...prev };
      if (copy[key]) {
        delete copy[key];
      } else {
        copy[key] = {
          tipo,
          nombreIngrediente: ingrediente.nombre,
          mitad: mitadKey
        };
      }
      return copy;
    });
  };

  const toggleQuickNote = (note) => {
    setObservaciones(prev => {
      const parts = prev
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (parts.includes(note)) {
        return parts.filter(p => p !== note).join(', ');
      }
      return [...parts, note].join(', ');
    });
  };

  const handleConfirm = () => {
    const modsList = Object.values(modificadores).filter(m =>
      esMitadMitad ? true : m.mitad === 'COMPLETA'
    );

    const activeMitadMitad = Boolean(esMitadMitad && currentPizza.permiteMitadMitad);
    let descripcion = currentPizza.nombre;
    if (activeMitadMitad && esp1Obj && esp2Obj) {
      descripcion += ` (1/2 ${esp1Obj.nombre} + 1/2 ${esp2Obj.nombre})`;
    } else if (esp1Obj) {
      descripcion += ` (${esp1Obj.nombre})`;
    }

    const extrasNames = adiciones
      .filter(a => adicionesSeleccionadas.includes(a.id))
      .map(a => `+ ${a.nombre}`);
    const modsSummary = modsList.map(
      m => `${m.tipo === 'SIN' ? 'Sin' : 'Con'} ${m.nombreIngrediente}`
    );
    const resumenExtras = [...extrasNames, ...modsSummary].join(' · ');

    onAddToCart({
      idproducto: currentPizza.idproducto,
      nombre: currentPizza.nombre,
      descripcion,
      resumenExtras,
      cantidad,
      precioCalculado: precioUnitario,
      esMitadMitad: activeMitadMitad,
      idespecialidad1: esp1Obj?.idespecialidad || esp1,
      idespecialidad2: activeMitadMitad ? (esp2Obj?.idespecialidad || esp2) : null,
      idadiciones: adicionesSeleccionadas,
      modificadores: modsList,
      observaciones: observaciones.trim()
    });
  };

  return (
    <div className="configurator-page">
      {/* Breadcrumb */}
      <div className="container configurator-breadcrumb-bar">
        <button type="button" className="back-link-btn" onClick={onBack}>
          <ChevronLeft size={18} />
          <span>Volver al Menú</span>
        </button>
        <div className="breadcrumb-trail hide-sm">
          <span>Menú</span>
          <span>/</span>
          <span>Pizzas</span>
          <span>/</span>
          <strong>{currentPizza.nombre}</strong>
        </div>
      </div>

      {/* Cuerpo principal 2 columnas */}
      <div className="container configurator-grid">
        {/* Columna izquierda sticky: Preview visual de la pizza */}
        <aside className="configurator-preview-col">
          <div className="preview-sticky-card">
            <div className="preview-card-header">
              <span className="eyebrow-label">Vista previa interactiva</span>
              <h2>{currentPizza.nombre}</h2>
              <p>
                {esMitadMitad && currentPizza.permiteMitadMitad
                  ? `Mitad ${esp1Obj?.nombre || ''} / Mitad ${esp2Obj?.nombre || ''}`
                  : `Especialidad completa: ${esp1Obj?.nombre || 'Clásica'}`}
              </p>
            </div>

            <SplitPizzaVisualizer
              esMitadMitad={Boolean(esMitadMitad && currentPizza.permiteMitadMitad)}
              esp1Nombre={esp1Obj?.nombre}
              esp2Nombre={esp2Obj?.nombre}
              tamanoCodigo={currentPizza.tamanoCodigo}
              porciones={currentPizza.porciones}
              bordeDestacado={hasBorderSelected}
            />

            <div className="preview-breakdown">
              <div className="preview-line">
                <span>Base ({currentPizza.tamanoCodigo})</span>
                <strong>{formatCOP(currentPizza.precioBase)}</strong>
              </div>
              <div className="preview-line">
                <span>Recargo especialidad</span>
                <strong>{recargoSabores > 0 ? `+${formatCOP(recargoSabores)}` : 'Incluido'}</strong>
              </div>
              {totalAdiciones > 0 && (
                <div className="preview-line">
                  <span>Adiciones ({adicionesSeleccionadas.length})</span>
                  <strong>+{formatCOP(totalAdiciones)}</strong>
                </div>
              )}
              <div className="preview-line preview-line--total">
                <span>Valor unitario</span>
                <strong>{formatCOP(precioUnitario)}</strong>
              </div>
            </div>
          </div>
        </aside>

        {/* Columna derecha: Pasos 1 a 5 */}
        <div className="configurator-steps-col">
          {/* Paso 1: Tamaño */}
          <section className="step-card">
            <div className="step-header">
              <span className="step-number">1</span>
              <div>
                <h3>Elige el Tamaño</h3>
                <p>Selecciona el tamaño disponible en la sede actual</p>
              </div>
            </div>

            <div className="sizes-grid">
              {(availablePizzaSizes.length > 0 ? availablePizzaSizes : [currentPizza]).map(sz => {
                const isSelected = sz.idproducto === currentPizza.idproducto;
                return (
                  <button
                    key={sz.idproducto}
                    type="button"
                    className={`size-option-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleSwitchSize(sz)}
                  >
                    <div className="size-option-head">
                      <span className="size-code-pill">{sz.tamanoCodigo || 'PZ'}</span>
                      {isSelected && <Check size={16} className="text-primary" />}
                    </div>
                    <strong className="size-name">{sz.nombre}</strong>
                    <span className="size-slices">{sz.porciones || 4} porciones</span>
                    <span className="size-price">{formatCOP(sz.precioBase)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Paso 2: Mitad y Mitad + Sabores */}
          <section className="step-card">
            <div className="step-header">
              <span className="step-number">2</span>
              <div>
                <h3>¿Deseas tu pizza en 2 sabores?</h3>
                <p>
                  {currentPizza.permiteMitadMitad
                    ? 'Combina dos especialidades (recargo proporcional por mitad)'
                    : 'Este tamaño individual es de un solo sabor'}
                </p>
              </div>
            </div>

            {currentPizza.permiteMitadMitad && (
              <div className="split-toggle-grid">
                <button
                  type="button"
                  className={`split-choice-btn ${!esMitadMitad ? 'is-active' : ''}`}
                  onClick={() => setEsMitadMitad(false)}
                >
                  <span className="split-choice-title">1 Solo Sabor</span>
                  <span className="split-choice-sub">Toda la pizza de una especialidad</span>
                </button>
                <button
                  type="button"
                  className={`split-choice-btn ${esMitadMitad ? 'is-active' : ''}`}
                  onClick={() => setEsMitadMitad(true)}
                >
                  <span className="split-choice-title">Mitad y Mitad (1/2 + 1/2)</span>
                  <span className="split-choice-sub">Dos especialidades en la misma pizza</span>
                </button>
              </div>
            )}

            {/* Mitad 1 / Especialidad única */}
            <div className="flavors-subsection">
              <h4 className="subsection-label">
                {esMitadMitad && currentPizza.permiteMitadMitad
                  ? 'Elige el sabor de la Mitad 1'
                  : 'Elige tu especialidad'}
              </h4>
              <div className="flavors-grid">
                {especialidades.map(esp => {
                  const active = (esp1Obj?.idespecialidad || esp1) === esp.idespecialidad;
                  const extra = esMitadMitad && currentPizza.permiteMitadMitad
                    ? Number(esp.recargoMitad || 0)
                    : Number(esp.recargoCompleta || 0);
                  return (
                    <button
                      key={esp.idespecialidad}
                      type="button"
                      className={`flavor-pill-card ${active ? 'is-selected' : ''}`}
                      onClick={() => setEsp1(esp.idespecialidad)}
                    >
                      <div className="flavor-card-top">
                        <strong>{esp.nombre}</strong>
                        {active && <Check size={15} className="text-primary" />}
                      </div>
                      <span className={`flavor-surcharge ${extra > 0 ? 'has-cost' : ''}`}>
                        {extra > 0 ? `+${formatCOP(extra)}` : 'Sin recargo'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mitad 2 */}
            {esMitadMitad && currentPizza.permiteMitadMitad && (
              <div className="flavors-subsection">
                <h4 className="subsection-label">Elige el sabor de la Mitad 2</h4>
                <div className="flavors-grid">
                  {especialidades.map(esp => {
                    const active = (esp2Obj?.idespecialidad || esp2) === esp.idespecialidad;
                    const extra = Number(esp.recargoMitad || 0);
                    return (
                      <button
                        key={esp.idespecialidad}
                        type="button"
                        className={`flavor-pill-card is-half2 ${active ? 'is-selected' : ''}`}
                        onClick={() => setEsp2(esp.idespecialidad)}
                      >
                        <div className="flavor-card-top">
                          <strong>{esp.nombre}</strong>
                          {active && <Check size={15} className="text-secondary" />}
                        </div>
                        <span className={`flavor-surcharge ${extra > 0 ? 'has-cost' : ''}`}>
                          {extra > 0 ? `+${formatCOP(extra)}` : 'Sin recargo'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Paso 3: Masa, Borde y Personalización de Ingredientes CON/SIN */}
          <section className="step-card">
            <div className="step-header">
              <span className="step-number">3</span>
              <div>
                <h3>Borde, Masa e Ingredientes (Con / Sin)</h3>
                <p>Ajusta los ingredientes de cada especialidad sin costo en retiros</p>
              </div>
            </div>

            {/* Tipo de Borde / Masa */}
            <div className="crust-options-grid">
              <button
                type="button"
                className={`crust-card ${!hasBorderSelected ? 'is-selected' : ''}`}
                onClick={() => selectBorderOption(null)}
              >
                <div>
                  <strong>Masa Tradicional Artesanal</strong>
                  <span>Crujiente por fuera, suave por dentro</span>
                </div>
                <span className="crust-price">Incluida</span>
              </button>

              {borderAdiciones.length > 0 ? (
                borderAdiciones.map(b => {
                  const selected = adicionesSeleccionadas.includes(b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      className={`crust-card ${selected ? 'is-selected' : ''}`}
                      onClick={() => selectBorderOption(b.id)}
                    >
                      <div>
                        <strong>{b.nombre}</strong>
                        <span>Opción del catálogo de la sede</span>
                      </div>
                      <span className="crust-price">+{formatCOP(b.precio)}</span>
                    </button>
                  );
                })
              ) : (
                <div className="crust-card is-info-only">
                  <div>
                    <strong>Bordes Rellenos (Queso / Bocadillo)</strong>
                    <span>Se habilitarán al publicar los SKUs de bordes en el catálogo POS</span>
                  </div>
                  <span className="status-badge status-badge--neutral">Próximamente</span>
                </div>
              )}
            </div>

            {/* Modificadores CON / SIN Mitad 1 */}
            {esp1Obj && (esp1Obj.ingredientesSin?.length > 0 || esp1Obj.ingredientesCon?.length > 0) && (
              <div className="modifiers-group">
                <h4 className="subsection-label">
                  Personalizar {esMitadMitad && currentPizza.permiteMitadMitad ? `Mitad 1 (${esp1Obj.nombre})` : esp1Obj.nombre}
                </h4>
                <div className="modifiers-pills-wrap">
                  {esp1Obj.ingredientesSin?.map(ing => {
                    const mitadKey = esMitadMitad && currentPizza.permiteMitadMitad ? 'MITAD_1' : 'COMPLETA';
                    const key = `${mitadKey}_${ing.id}_SIN`;
                    const active = Boolean(modificadores[key]);
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`mod-pill mod-pill--sin ${active ? 'is-active' : ''}`}
                        onClick={() => toggleModificador(ing, 'SIN', mitadKey)}
                      >
                        {active ? `✓ Sin ${ing.nombre}` : `- Quitar ${ing.nombre}`}
                      </button>
                    );
                  })}
                  {esp1Obj.ingredientesCon?.map(ing => {
                    const mitadKey = esMitadMitad && currentPizza.permiteMitadMitad ? 'MITAD_1' : 'COMPLETA';
                    const key = `${mitadKey}_${ing.id}_CON`;
                    const active = Boolean(modificadores[key]);
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`mod-pill mod-pill--con ${active ? 'is-active' : ''}`}
                        onClick={() => toggleModificador(ing, 'CON', mitadKey)}
                      >
                        {active ? `✓ Con ${ing.nombre}` : `+ Con ${ing.nombre}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modificadores CON / SIN Mitad 2 */}
            {esMitadMitad &&
              currentPizza.permiteMitadMitad &&
              esp2Obj &&
              (esp2Obj.ingredientesSin?.length > 0 || esp2Obj.ingredientesCon?.length > 0) && (
                <div className="modifiers-group">
                  <h4 className="subsection-label">Personalizar Mitad 2 ({esp2Obj.nombre})</h4>
                  <div className="modifiers-pills-wrap">
                    {esp2Obj.ingredientesSin?.map(ing => {
                      const key = `MITAD_2_${ing.id}_SIN`;
                      const active = Boolean(modificadores[key]);
                      return (
                        <button
                          key={key}
                          type="button"
                          className={`mod-pill mod-pill--sin ${active ? 'is-active' : ''}`}
                          onClick={() => toggleModificador(ing, 'SIN', 'MITAD_2')}
                        >
                          {active ? `✓ Sin ${ing.nombre}` : `- Quitar ${ing.nombre}`}
                        </button>
                      );
                    })}
                    {esp2Obj.ingredientesCon?.map(ing => {
                      const key = `MITAD_2_${ing.id}_CON`;
                      const active = Boolean(modificadores[key]);
                      return (
                        <button
                          key={key}
                          type="button"
                          className={`mod-pill mod-pill--con ${active ? 'is-active' : ''}`}
                          onClick={() => toggleModificador(ing, 'CON', 'MITAD_2')}
                        >
                          {active ? `✓ Con ${ing.nombre}` : `+ Con ${ing.nombre}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
          </section>

          {/* Paso 4: Adiciones Extra */}
          {regularAdiciones.length > 0 && (
            <section className="step-card">
              <div className="step-header">
                <span className="step-number">4</span>
                <div>
                  <h3>Toppings e Ingredientes Extra</h3>
                  <p>Agrega porciones extra validadas para el tamaño seleccionado</p>
                </div>
              </div>

              <div className="toppings-grid">
                {regularAdiciones.map(adic => {
                  const checked = adicionesSeleccionadas.includes(adic.id);
                  return (
                    <label key={adic.id} className={`topping-card ${checked ? 'is-checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAdicion(adic.id)}
                      />
                      <span className="topping-name">{adic.nombre}</span>
                      <span className="topping-price">+{formatCOP(adic.precio)}</span>
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          {/* Paso 5: Instrucciones para la Cocina */}
          <section className="step-card">
            <div className="step-header">
              <span className="step-number">{regularAdiciones.length > 0 ? '5' : '4'}</span>
              <div>
                <h3>Instrucciones para la Cocina</h3>
                <p>Las indicaciones se imprimen directo en la comanda de la sede</p>
              </div>
            </div>

            <div className="quick-notes-row">
              {QUICK_NOTES.map(note => {
                const isSelected = observaciones.includes(note);
                return (
                  <button
                    key={note}
                    type="button"
                    className={`quick-note-chip ${isSelected ? 'is-active' : ''}`}
                    onClick={() => toggleQuickNote(note)}
                  >
                    <UtensilsCrossed size={13} />
                    <span>{note}</span>
                  </button>
                );
              })}
            </div>

            <textarea
              rows={2}
              className="kitchen-textarea"
              placeholder="Ej: Por favor bien doradita y sin orégano encima..."
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
            />
          </section>
        </div>
      </div>

      {/* Barra inferior sticky */}
      <div className="configurator-sticky-bar">
        <div className="container configurator-bar-inner">
          <div className="config-qty-group">
            <span className="config-bar-label hide-sm">Cantidad</span>
            <div className="qty-stepper qty-stepper--dark">
              <button type="button" onClick={() => setCantidad(Math.max(1, cantidad - 1))} aria-label="Menos">
                <Minus size={16} />
              </button>
              <span>{cantidad}</span>
              <button type="button" onClick={() => setCantidad(cantidad + 1)} aria-label="Más">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="config-bar-summary">
            <div className="config-bar-total">
              <span>Total configurado</span>
              <strong>{formatCOP(precioTotal)}</strong>
            </div>
            <span className="config-points-pill hide-sm" title="Estimación informativa para próximo módulo de fidelización">
              <Sparkles size={13} /> +{puntosEst} Puntos est.
            </span>
          </div>

          <button type="button" className="btn-primary-pill btn-lg" onClick={handleConfirm}>
            <ShoppingBag size={18} />
            <span>Agregar al Pedido</span>
          </button>
        </div>
      </div>
    </div>
  );
}

