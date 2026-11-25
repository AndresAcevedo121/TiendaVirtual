const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';

// Mensajes para el cliente: simples, sin detalles tecnicos.
const MSG_SIN_CONEXION = 'No pudimos conectar con el servidor. Intenta de nuevo en un momento.';

/** Llama al servidor. Si no hay conexion, lanza un error con un mensaje simple. */
async function llamar(url, opciones) {
  try {
    return await fetch(url, opciones);
  } catch {
    throw new Error(MSG_SIN_CONEXION);
  }
}

export async function fetchTiendas() {
  const res = await llamar(`${API_BASE}/tiendas`);
  if (!res.ok) throw new Error('No pudimos cargar las tiendas. Intenta de nuevo.');
  return res.json();
}

export async function fetchCatalogo(idtienda) {
  if (!idtienda) throw new Error('Selecciona una tienda para ver el menú.');
  const res = await llamar(`${API_BASE}/catalogo?idtienda=${encodeURIComponent(idtienda)}`);
  if (!res.ok) throw new Error('No pudimos cargar el menú. Intenta de nuevo.');
  return res.json();
}

/**
 * Pide al servidor el total del pedido. El precio SIEMPRE lo calcula el servidor.
 * - Respuesta 4xx (regla de negocio): se devuelve { valido: false, mensaje } con el mensaje del servidor.
 * - Cualquier otro fallo: se lanza un error y NO se inventa ningun precio.
 */
export async function cotizarPedido(cotizacionRequest) {
  const res = await llamar(`${API_BASE}/pedidos/cotizar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cotizacionRequest)
  });
  if (res.status >= 400 && res.status < 500) {
    const errorData = await res.json().catch(() => ({}));
    return {
      valido: false,
      mensaje: errorData.message || errorData.mensaje || 'No se pudo validar el pedido.'
    };
  }
  if (!res.ok) throw new Error('No pudimos calcular el total. Intenta de nuevo.');
  return res.json();
}

export async function crearPedido(pedidoRequest) {
  const res = await llamar(`${API_BASE}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pedidoRequest)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || errorData.mensaje || 'No pudimos procesar el pedido. Intenta de nuevo.'
    );
  }
  return res.json();
}

export async function validarCobertura({ direccion, municipio, barrio }) {
  const res = await llamar(`${API_BASE}/cobertura/validar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ direccion, municipio, barrio })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || errorData.mensaje || 'No pudimos validar tu dirección. Intenta de nuevo.'
    );
  }
  return res.json();
}

