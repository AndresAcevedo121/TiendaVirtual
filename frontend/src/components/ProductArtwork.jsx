import React, { useState } from 'react';

function getSpecialtyPalette(name = '') {
  const n = name.toLowerCase();
  if (n.includes('hawa')) {
    return { accent: '#f59e0b', secondary: '#fb7185', style: 'hawaiana' };
  }
  if (n.includes('peper') || n.includes('pepper') || n.includes('piñar')) {
    return { accent: '#dc2626', secondary: '#fbbf24', style: 'pepperoni' };
  }
  if (n.includes('pollo') || n.includes('champi')) {
    return { accent: '#a16207', secondary: '#fef08a', style: 'pollo' };
  }
  if (n.includes('carni') || n.includes('tocino') || n.includes('americana')) {
    return { accent: '#991b1b', secondary: '#f97316', style: 'carnis' };
  }
  if (n.includes('queso')) {
    return { accent: '#eab308', secondary: '#fde047', style: 'quesos' };
  }
  if (n.includes('veg')) {
    return { accent: '#16a34a', secondary: '#dc2626', style: 'vegetariana' };
  }
  return { accent: '#b80015', secondary: '#ffb800', style: 'clasica' };
}

function renderToppings(style, clipId, offsetX = 0) {
  const dots = [
    { cx: 95 + offsetX, cy: 75, r: 9 },
    { cx: 130 + offsetX, cy: 110, r: 10 },
    { cx: 88 + offsetX, cy: 145, r: 9 },
    { cx: 120 + offsetX, cy: 180, r: 8 },
    { cx: 65 + offsetX, cy: 112, r: 9 },
    { cx: 158 + offsetX, cy: 82, r: 9 },
    { cx: 168 + offsetX, cy: 142, r: 10 },
    { cx: 150 + offsetX, cy: 192, r: 8 },
    { cx: 195 + offsetX, cy: 112, r: 9 },
    { cx: 198 + offsetX, cy: 168, r: 9 }
  ];

  return (
    <g clipPath={`url(#${clipId})`}>
      {dots.map((d, idx) => {
        if (style === 'hawaiana') {
          return idx % 2 === 0 ? (
            <polygon
              key={idx}
              points={`${d.cx},${d.cy - 8} ${d.cx + 8},${d.cy + 6} ${d.cx - 8},${d.cy + 6}`}
              fill="#facc15"
              stroke="#ca8a04"
              strokeWidth="1.2"
            />
          ) : (
            <rect
              key={idx}
              x={d.cx - 7}
              y={d.cy - 6}
              width="14"
              height="12"
              rx="3"
              fill="#fb7185"
              stroke="#e11d48"
              strokeWidth="1"
            />
          );
        }
        if (style === 'pollo') {
          return idx % 2 === 0 ? (
            <g key={idx} transform={`translate(${d.cx}, ${d.cy})`}>
              <path d="M-8,2 A8,8 0 0,1 8,2 Z" fill="#d6d3d1" stroke="#78716c" strokeWidth="1.2" />
              <rect x="-2.5" y="2" width="5" height="6" rx="1.5" fill="#d6d3d1" />
            </g>
          ) : (
            <rect
              key={idx}
              x={d.cx - 7}
              y={d.cy - 5}
              width="14"
              height="10"
              rx="4"
              fill="#eab308"
              opacity="0.9"
            />
          );
        }
        if (style === 'vegetariana') {
          return idx % 2 === 0 ? (
            <circle
              key={idx}
              cx={d.cx}
              cy={d.cy}
              r="7"
              fill="none"
              stroke="#16a34a"
              strokeWidth="3.5"
            />
          ) : (
            <circle
              key={idx}
              cx={d.cx}
              cy={d.cy}
              r="6"
              fill="#1f2937"
              stroke="#111827"
              strokeWidth="1"
            />
          );
        }
        if (style === 'quesos') {
          return (
            <circle
              key={idx}
              cx={d.cx}
              cy={d.cy}
              r={d.r}
              fill={idx % 2 === 0 ? '#fde047' : '#f59e0b'}
              opacity="0.85"
            />
          );
        }
        // pepperoni / carnis / clasica
        return (
          <g key={idx}>
            <circle
              cx={d.cx}
              cy={d.cy}
              r={d.r}
              fill={style === 'carnis' && idx % 2 === 1 ? '#7f1d1d' : '#dc2626'}
              stroke="#991b1b"
              strokeWidth="1.3"
            />
            <circle cx={d.cx - 2} cy={d.cy - 2} r="1.6" fill="#fca5a5" opacity="0.7" />
          </g>
        );
      })}
      {/* Hojas de albahaca decorativas */}
      <ellipse cx="106" cy="98" rx="6" ry="3" transform="rotate(-25 106 98)" fill="#15803d" />
      <ellipse cx="174" cy="134" rx="6" ry="3" transform="rotate(35 174 134)" fill="#15803d" />
      <ellipse cx="132" cy="166" rx="6" ry="3" transform="rotate(-15 132 166)" fill="#15803d" />
    </g>
  );
}

export function SplitPizzaVisualizer({
  esMitadMitad,
  esp1Nombre = 'Clásica',
  esp2Nombre = 'Pepperoni',
  tamanoCodigo = 'MD',
  porciones = 6,
  bordeDestacado = false
}) {
  const p1 = getSpecialtyPalette(esp1Nombre);
  const p2 = getSpecialtyPalette(esp2Nombre || esp1Nombre);

  return (
    <div className="split-pizza-stage">
      <div className="split-pizza-glow" />
      <svg
        viewBox="0 0 260 260"
        className="split-pizza-svg"
        role="img"
        aria-label={esMitadMitad ? `Pizza mitad ${esp1Nombre} y mitad ${esp2Nombre}` : `Pizza ${esp1Nombre}`}
      >
        <defs>
          <radialGradient id="crustGrad" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f3b664" />
            <stop offset="75%" stopColor="#d9822b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
          <radialGradient id="cheeseGrad" cx="45%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="65%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
          <clipPath id="clipLeftHalf">
            <rect x="0" y="0" width="130" height="260" />
          </clipPath>
          <clipPath id="clipRightHalf">
            <rect x="130" y="0" width="130" height="260" />
          </clipPath>
          <clipPath id="clipWhole">
            <circle cx="130" cy="130" r="95" />
          </clipPath>
        </defs>

        {/* Sombra base */}
        <circle cx="132" cy="136" r="115" fill="rgba(17, 28, 45, 0.14)" />

        {/* Borde artesanal / Borde queso */}
        <circle
          cx="130"
          cy="130"
          r="114"
          fill="url(#crustGrad)"
          stroke={bordeDestacado ? '#fbbf24' : '#92400e'}
          strokeWidth={bordeDestacado ? '5' : '2'}
        />

        {/* Salsa de tomate */}
        <circle cx="130" cy="130" r="101" fill="#c81e1e" />

        {/* Queso mozzarella */}
        <circle cx="130" cy="130" r="96" fill="url(#cheeseGrad)" />

        {/* Toppings */}
        {esMitadMitad ? (
          <>
            {renderToppings(p1.style, 'clipLeftHalf')}
            {renderToppings(p2.style, 'clipRightHalf')}
            <line
              x1="130"
              y1="20"
              x2="130"
              y2="240"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              opacity="0.9"
            />
          </>
        ) : (
          renderToppings(p1.style, 'clipWhole')
        )}

        {/* Líneas sutiles de porciones */}
        {porciones >= 6 && (
          <g stroke="rgba(146, 64, 14, 0.22)" strokeWidth="1.2">
            <line x1="130" y1="32" x2="130" y2="228" />
            <line x1="32" y1="130" x2="228" y2="130" />
            <line x1="60" y1="60" x2="200" y2="200" />
            <line x1="200" y1="60" x2="60" y2="200" />
          </g>
        )}
      </svg>

      {esMitadMitad && (
        <div className="split-badges-row">
          <span className="split-half-pill split-half-pill--1">1/2 {esp1Nombre}</span>
          <span className="split-half-pill split-half-pill--2">2/2 {esp2Nombre}</span>
        </div>
      )}

      <div className="split-meta-pills">
        <span className="meta-pill meta-pill--navy">{porciones || 6} Porciones</span>
        <span className="meta-pill meta-pill--gold">Tamaño {tamanoCodigo || 'MD'}</span>
      </div>
    </div>
  );
}

export default function ProductArtwork({ producto, categoriaNombre = '' }) {
  const [imgError, setImgError] = useState(false);

  if (producto?.imagenUrl && !imgError) {
    return (
      <img
        src={producto.imagenUrl}
        alt={producto.nombre}
        className="product-card-img"
        onError={() => setImgError(true)}
        loading="lazy"
      />
    );
  }

  const lowerName = (producto?.nombre || '').toLowerCase();
  const lowerCat = categoriaNombre.toLowerCase();

  // Bebidas
  if (lowerCat.includes('bebida') || lowerName.includes('gaseosa') || lowerName.includes('jugo') || lowerName.includes('agua')) {
    return (
      <div className="artwork-canvas artwork-canvas--drink">
        <svg viewBox="0 0 180 135" className="artwork-svg" aria-hidden="true">
          <defs>
            <linearGradient id="sodaBottle" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e21b24" />
              <stop offset="100%" stopColor="#93000e" />
            </linearGradient>
          </defs>
          <circle cx="90" cy="68" r="52" fill="rgba(28, 50, 110, 0.08)" />
          <rect x="66" y="22" width="48" height="92" rx="14" fill="url(#sodaBottle)" />
          <rect x="78" y="13" width="24" height="11" rx="3" fill="#1C326E" />
          <rect x="66" y="48" width="48" height="28" fill="#ffffff" opacity="0.92" />
          <rect x="74" y="56" width="32" height="5" rx="2.5" fill="#b80015" />
          <rect x="78" y="64" width="24" height="4" rx="2" fill="#1C326E" />
          <circle cx="122" cy="40" r="5" fill="#ffba20" opacity="0.8" />
          <circle cx="54" cy="92" r="4" fill="#60a5fa" opacity="0.7" />
        </svg>
      </div>
    );
  }

  // Entradas / Acompañamientos (Deditos, Alitas, Lasagna)
  if (producto?.tipoProducto !== 'P') {
    const isAlitas = lowerName.includes('alita');
    return (
      <div className="artwork-canvas artwork-canvas--side">
        <svg viewBox="0 0 180 135" className="artwork-svg" aria-hidden="true">
          <circle cx="90" cy="70" r="54" fill="rgba(255, 184, 0, 0.14)" />
          <ellipse cx="90" cy="92" rx="58" ry="18" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
          {isAlitas ? (
            <g>
              <ellipse cx="70" cy="68" rx="18" ry="11" transform="rotate(-20 70 68)" fill="#b45309" />
              <ellipse cx="95" cy="60" rx="19" ry="11" transform="rotate(10 95 60)" fill="#9a3412" />
              <ellipse cx="114" cy="74" rx="17" ry="10" transform="rotate(28 114 74)" fill="#c2410c" />
            </g>
          ) : (
            <g>
              <rect x="52" y="42" width="16" height="44" rx="7" transform="rotate(-12 52 42)" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
              <rect x="76" y="38" width="16" height="46" rx="7" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
              <rect x="100" y="42" width="16" height="44" rx="7" transform="rotate(12 100 42)" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
              <circle cx="125" cy="78" r="11" fill="#be123c" stroke="#ffffff" strokeWidth="2" />
            </g>
          )}
        </svg>
      </div>
    );
  }

  // Pizzas
  const p = getSpecialtyPalette(producto?.nombre);
  return (
    <div className="artwork-canvas artwork-canvas--pizza">
      <svg viewBox="0 0 180 135" className="artwork-svg" aria-hidden="true">
        <defs>
          <radialGradient id={`cardPizza-${producto?.idproducto || 'x'}`} cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>
        </defs>
        <circle cx="92" cy="72" r="53" fill="rgba(17, 28, 45, 0.1)" />
        <circle cx="90" cy="68" r="52" fill="#d97706" />
        <circle cx="90" cy="68" r="45" fill="#b80015" />
        <circle cx="90" cy="68" r="42" fill={`url(#cardPizza-${producto?.idproducto || 'x'})`} />
        <circle cx="72" cy="54" r="6" fill={p.accent} />
        <circle cx="105" cy="50" r="6.5" fill={p.accent} />
        <circle cx="88" cy="72" r="6" fill={p.secondary} />
        <circle cx="68" cy="80" r="5.5" fill={p.accent} />
        <circle cx="110" cy="82" r="6" fill={p.accent} />
        <circle cx="92" cy="94" r="5" fill={p.secondary} />
        <ellipse cx="78" cy="66" rx="4" ry="2" transform="rotate(-25 78 66)" fill="#15803d" />
        <ellipse cx="102" cy="68" rx="4" ry="2" transform="rotate(30 102 68)" fill="#15803d" />
      </svg>
    </div>
  );
}

