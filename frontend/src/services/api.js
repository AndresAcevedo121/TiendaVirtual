const API_BASE = '/api/v1';

export async function fetchTiendas() {
  try {
    const res = await fetch(`${API_BASE}/tiendas`);
    if (!res.ok) throw new Error('Error al obtener tiendas');
    return await res.json();
  } catch (err) {
    console.warn('Backend no disponible, usando fallback local de tiendas:', err);
    return [
      { idtienda: 1, nombre: 'Manrique', direccion: 'Cra 45 #71-25', municipio: 'Medellín', telefono: '604 444 4553', tiempoEntregaMinutos: 40, activo: true, bloqueada: false, permiteDomicilio: true, permiteRecoger: true },
      { idtienda: 2, nombre: 'Bello', direccion: 'Calle 50 #49-18', municipio: 'Bello', telefono: '604 444 4553', tiempoEntregaMinutos: 45, activo: true, bloqueada: false, permiteDomicilio: true, permiteRecoger: true },
      { idtienda: 3, nombre: 'América', direccion: 'Cra 84 #44-12', municipio: 'Medellín', telefono: '604 444 4553', tiempoEntregaMinutos: 35, activo: true, bloqueada: false, permiteDomicilio: true, permiteRecoger: true },
      { idtienda: 4, nombre: 'Calasanz', direccion: 'Calle 53 #80-40', municipio: 'Medellín', telefono: '604 444 4553', tiempoEntregaMinutos: 40, activo: true, bloqueada: false, permiteDomicilio: true, permiteRecoger: true },
      { idtienda: 5, nombre: 'Itagüí', direccion: 'Cra 50 #51-32', municipio: 'Itagüí', telefono: '604 444 4553', tiempoEntregaMinutos: 45, activo: true, bloqueada: false, permiteDomicilio: true, permiteRecoger: true },
      { idtienda: 8, nombre: 'Envigado', direccion: 'Cra 38 #38A Sur-20', municipio: 'Envigado', telefono: '604 444 4553', tiempoEntregaMinutos: 45, activo: true, bloqueada: false, permiteDomicilio: true, permiteRecoger: true }
    ];
  }
}

export async function fetchCatalogo(idtienda = 1) {
  try {
    const res = await fetch(`${API_BASE}/catalogo?idtienda=${idtienda}`);
    if (!res.ok) throw new Error('Error al obtener catálogo');
    return await res.json();
  } catch (err) {
    console.warn('Backend no disponible, usando fallback local del menú:', err);
    return getFallbackCatalogo(idtienda);
  }
}

export async function cotizarPedido(cotizacionRequest) {
  try {
    const res = await fetch(`${API_BASE}/pedidos/cotizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cotizacionRequest)
    });
    if (res.status >= 400 && res.status < 500) {
      const errorData = await res.json().catch(() => ({}));
      return {
        ...calcularCotizacionFallback(cotizacionRequest),
        valido: false,
        mensaje: errorData.message || errorData.mensaje || 'No se pudo validar el pedido en el servidor.'
      };
    }
    if (!res.ok) throw new Error('Error en cotización');
    return await res.json();
  } catch (err) {
    console.warn('Backend no disponible, calculando precio localmente con la fórmula POS:', err);
    return calcularCotizacionFallback(cotizacionRequest);
  }
}

export async function crearPedido(pedidoRequest) {
  const res = await fetch(`${API_BASE}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pedidoRequest)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const detail = errorData.detalles ? ` (${Object.values(errorData.detalles).join(', ')})` : '';
    throw new Error((errorData.message || errorData.mensaje || errorData.error || 'Error al procesar el pedido') + detail);
  }
  return await res.json();
}

// Fallback de catálogo basado exactamente en la Skill 01
function getFallbackCatalogo(idtienda) {
  return {
    idtienda: idtienda,
    nombreTienda: 'Tienda Seleccionada',
    disponible: true,
    tiempoEstimadoMinutos: 40,
    categorias: [
      {
        idcategoria: 1,
        nombre: 'Pizzas',
        descripcion: 'Nuestras deliciosas pizzas artesanales',
        productos: [
          {
            idproducto: 10,
            nombre: 'Pizza Pizzeta (Individual)',
            descripcion: '4 porciones crujientes.',
            precioBase: 21000,
            tipoProducto: 'P',
            tamanoCodigo: 'PZ',
            porciones: 4,
            permiteMitadMitad: false,
            especialidades: getFallbackEspecialidades(),
            adiciones: getFallbackAdiciones()
          },
          {
            idproducto: 11,
            nombre: 'Pizza Mediana',
            descripcion: '6 porciones. Ideal para 2 personas.',
            precioBase: 39000,
            tipoProducto: 'P',
            tamanoCodigo: 'MD',
            porciones: 6,
            permiteMitadMitad: true,
            especialidades: getFallbackEspecialidades(),
            adiciones: getFallbackAdiciones()
          },
          {
            idproducto: 12,
            nombre: 'Pizza Grande',
            descripcion: '8 porciones familiares tradicionales.',
            precioBase: 48000,
            tipoProducto: 'P',
            tamanoCodigo: 'GD',
            porciones: 8,
            permiteMitadMitad: true,
            especialidades: getFallbackEspecialidades(),
            adiciones: getFallbackAdiciones()
          },
          {
            idproducto: 13,
            nombre: 'Pizza Extragrande',
            descripcion: '12 porciones gigantes.',
            precioBase: 57000,
            tipoProducto: 'P',
            tamanoCodigo: 'XL',
            porciones: 12,
            permiteMitadMitad: true,
            especialidades: getFallbackEspecialidades(),
            adiciones: getFallbackAdiciones()
          }
        ]
      },
      {
        idcategoria: 2,
        nombre: 'Entradas',
        descripcion: 'Deditos y acompañamientos',
        productos: [
          {
            idproducto: 401,
            nombre: 'Deditos Americanos x 6',
            descripcion: 'Deditos horneados con salsa de arequipe o mora.',
            precioBase: 14900,
            tipoProducto: 'O',
            permiteMitadMitad: false
          },
          {
            idproducto: 402,
            nombre: 'Alitas BBQ x 8',
            descripcion: 'Alitas bañadas en salsa BBQ artesanal.',
            precioBase: 18900,
            tipoProducto: 'O',
            permiteMitadMitad: false
          }
        ]
      },
      {
        idcategoria: 4,
        nombre: 'Bebidas',
        descripcion: 'Gaseosas refrescantes',
        productos: [
          {
            idproducto: 404,
            nombre: 'Gaseosa 1.5 L (Manzana)',
            descripcion: 'Botella familiar Postobón Manzana.',
            precioBase: 8500,
            tipoProducto: 'O',
            permiteMitadMitad: false
          },
          {
            idproducto: 406,
            nombre: 'Gaseosa 400 ml Personal',
            descripcion: 'Botella personal varios sabores.',
            precioBase: 4500,
            tipoProducto: 'O',
            permiteMitadMitad: false
          }
        ]
      }
    ]
  };
}

function getFallbackEspecialidades() {
  return [
    {
      idespecialidad: 101,
      nombre: 'Hawaiana',
      recargoCompleta: 0,
      recargoMitad: 0,
      ingredientesSin: [{ id: 202, nombre: 'Piña' }, { id: 203, nombre: 'Jamón' }],
      ingredientesCon: [{ id: 251, nombre: 'Tocineta' }]
    },
    {
      idespecialidad: 102,
      nombre: 'Pollo Champiñón',
      recargoCompleta: 0,
      recargoMitad: 0,
      ingredientesSin: [{ id: 201, nombre: 'Cebolla' }],
      ingredientesCon: [{ id: 252, nombre: 'Maíz' }]
    },
    {
      idespecialidad: 103,
      nombre: 'Carnis',
      recargoCompleta: 0,
      recargoMitad: 0,
      ingredientesSin: [{ id: 203, nombre: 'Jamón' }],
      ingredientesCon: []
    },
    {
      idespecialidad: 105,
      nombre: 'Peperoni y Queso',
      recargoCompleta: 3500,
      recargoMitad: 1750,
      ingredientesSin: [{ id: 204, nombre: 'Queso' }],
      ingredientesCon: [{ id: 251, nombre: 'Tocineta' }]
    },
    {
      idespecialidad: 106,
      nombre: 'Pollo BBQ',
      recargoCompleta: 3500,
      recargoMitad: 1750,
      ingredientesSin: [],
      ingredientesCon: []
    },
    {
      idespecialidad: 107,
      nombre: 'Piñaronni',
      recargoCompleta: 3500,
      recargoMitad: 1750,
      ingredientesSin: [{ id: 202, nombre: 'Piña' }],
      ingredientesCon: []
    }
  ];
}

function getFallbackAdiciones() {
  return [
    { id: 301, nombre: 'Adición Maíz Tierno', precio: 6000 },
    { id: 302, nombre: 'Adición Tocineta', precio: 7000 },
    { id: 303, nombre: 'Adición Extra Queso', precio: 7000 }
  ];
}

function calcularCotizacionFallback(req) {
  let subtotal = 0;
  const items = (req.items || []).map(item => {
    let precioUnitario = item.precioCalculado || 39000;
    let totalLinea = precioUnitario * (item.cantidad || 1);
    subtotal += totalLinea;
    return {
      idproducto: item.idproducto,
      descripcion: item.descripcion || 'Producto',
      cantidad: item.cantidad || 1,
      precioUnitario,
      totalLinea
    };
  });

  const envio = req.tipoEntrega === 'RECOGER' ? 0 : 5000;
  const total = subtotal + envio;
  const cumpleMinimo = req.tipoEntrega === 'RECOGER' || subtotal >= 17000;

  return {
    valido: cumpleMinimo,
    mensaje: cumpleMinimo ? 'Cotización exitosa' : `El pedido mínimo para domicilio es $17.000. Te faltan $${(17000 - subtotal).toLocaleString('es-CO')}`,
    items,
    subtotalProductos: subtotal,
    valorDomicilio: envio,
    descuento: 0,
    total,
    cumplePedidoMinimo: cumpleMinimo,
    pedidoMinimo: 17000
  };
}

