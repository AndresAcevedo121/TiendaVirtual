export function formatCOP(value) {
  const num = Number(value || 0);
  return `$${Math.round(num).toLocaleString('es-CO')}`;
}

export function estimatePuntos(totalCop) {
  const num = Number(totalCop || 0);
  if (num <= 0) return 0;
  return Math.max(5, Math.round(num / 1000));
}

export const STORAGE_KEYS = {
  CART: 'pa_tienda_cart_v1',
  DELIVERY_MODE: 'pa_tienda_entrega_v1',
  STORE_ID: 'pa_tienda_sede_v1',
  CUSTOMER_DRAFT: 'pa_tienda_cliente_v1'
};

export const BUSINESS_RULES = {
  COSTO_DOMICILIO: 5000,
  PEDIDO_MINIMO_DOMICILIO: 17000,
  HOTLINE_PRIMARY: '604 444 4553',
  HOTLINE_SECONDARY: '444 2525'
};

