import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, CheckCircle2, ArrowRight, Pizza } from 'lucide-react';
import Header from './components/Header';
import MenuView from './components/MenuView';
import PizzaConfigurator from './components/PizzaConfigurator';
import PromosView from './components/PromosView';
import SedesView from './components/SedesView';
import PuntosView from './components/PuntosView';
import CheckoutView from './components/CheckoutView';
import SedesModal from './components/SedesModal';
import GuestProfileModal from './components/GuestProfileModal';
import CoberturaModal from './components/CoberturaModal';
import Footer from './components/Footer';
import { CartPanelContent } from './components/LiveCartSidebar';
import { fetchTiendas, fetchCatalogo, cotizarPedido } from './services/api';
import { formatCOP, STORAGE_KEYS, BUSINESS_RULES } from './utils/format';

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [tiendas, setTiendas] = useState([]);
  const [tiendaActual, setTiendaActual] = useState(null);
  const [catalogo, setCatalogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  const [activeView, setActiveView] = useState('menu'); // menu | configurator | promos | sedes | puntos | checkout
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [isSedesModalOpen, setIsSedesModalOpen] = useState(false);
  const [isCoberturaModalOpen, setIsCoberturaModalOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  const [cart, setCart] = useState(() => readStorage(STORAGE_KEYS.CART, []));
  const [tipoEntrega, setTipoEntrega] = useState(() =>
    readStorage(STORAGE_KEYS.DELIVERY_MODE, 'DOMICILIO')
  );
  const [customerDraft, setCustomerDraft] = useState(() =>
    readStorage(STORAGE_KEYS.CUSTOMER_DRAFT, null)
  );

  const [cotizacion, setCotizacion] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Persistir carrito, tipoEntrega y datos de cliente en navegador (RF-3.1)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {
      // ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DELIVERY_MODE, JSON.stringify(tipoEntrega));
    } catch {
      // ignore
    }
  }, [tipoEntrega]);

  useEffect(() => {
    if (tiendaActual?.idtienda) {
      try {
        localStorage.setItem(STORAGE_KEYS.STORE_ID, JSON.stringify(tiendaActual.idtienda));
      } catch {
        // ignore
      }
    }
  }, [tiendaActual]);

  const handleSaveCustomerDraft = (draft) => {
    setCustomerDraft(draft);
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_DRAFT, JSON.stringify(draft));
    } catch {
      // ignore
    }
  };

  const handleClearCustomerDraft = () => {
    setCustomerDraft(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.CUSTOMER_DRAFT);
    } catch {
      // ignore
    }
  };

  // 1. Cargar lista de sedes al iniciar
  useEffect(() => {
    let active = true;
    async function loadInitialData() {
      try {
        const tiendasData = await fetchTiendas();
        if (!active) return;
        setErrorCarga(null);
        setTiendas(tiendasData);
        if (tiendasData.length > 0) {
          const savedStoreId = readStorage(STORAGE_KEYS.STORE_ID, null);
          const preferred =
            tiendasData.find(t => t.idtienda === savedStoreId && !t.bloqueada) ||
            tiendasData.find(t => !t.bloqueada) ||
            tiendasData[0];
          setTiendaActual(preferred);
        }
      } catch (err) {
        console.error('Error cargando tiendas:', err);
        if (active) setErrorCarga(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadInitialData();
    return () => {
      active = false;
    };
  }, []);

  // 2. Cargar catálogo de la sede activa (RF-1.1 / RF-3.2)
  useEffect(() => {
    if (!tiendaActual) return;
    let active = true;
    async function loadMenu() {
      try {
        const cat = await fetchCatalogo(tiendaActual.idtienda);
        if (active) {
          setCatalogo(cat);
          setErrorCarga(null);
        }
      } catch (err) {
        console.error('Error cargando catálogo:', err);
        if (active) {
          setCatalogo(null);
          setErrorCarga(err.message);
        }
      }
    }
    loadMenu();

    // Ajustar modo entrega si la nueva tienda solo soporta una modalidad
    if (tiendaActual.permiteDomicilio === false && tipoEntrega === 'DOMICILIO') {
      setTipoEntrega('RECOGER');
    } else if (tiendaActual.permiteRecoger === false && tipoEntrega === 'RECOGER') {
      setTipoEntrega('DOMICILIO');
    }

    return () => {
      active = false;
    };
  }, [tiendaActual]);

  // 3. Cotización en vivo con el servidor cada vez que cambia carrito, entrega o sede (RF-3.3)
  useEffect(() => {
    if (!tiendaActual || cart.length === 0) {
      setCotizacion(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setQuoting(true);
      try {
        const req = {
          idtienda: tiendaActual.idtienda,
          tipoEntrega,
          items: cart.map(item => ({
            idproducto: item.idproducto,
            cantidad: item.cantidad,
            precioCalculado: item.precioCalculado,
            descripcion: item.descripcion,
            esMitadMitad: Boolean(item.esMitadMitad),
            idespecialidad1: item.idespecialidad1 || null,
            idespecialidad2: item.esMitadMitad ? (item.idespecialidad2 || null) : null,
            idadiciones: item.idadiciones || [],
            modificadores: item.modificadores || [],
            observaciones: item.observaciones || ''
          }))
        };
        const res = await cotizarPedido(req);
        if (!cancelled) setCotizacion(res);
      } catch (err) {
        console.error('Error cotizando pedido:', err);
        // Sin respuesta del servidor no hay precio: se marca el error para bloquear el pedido
        if (!cancelled) setCotizacion({ valido: false, error: true, mensaje: err.message });
      } finally {
        if (!cancelled) setQuoting(false);
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cart, tipoEntrega, tiendaActual]);

  const availablePizzaSizes = useMemo(() => {
    if (!catalogo?.categorias) return [];
    const pizzas = [];
    catalogo.categorias.forEach(cat => {
      (cat.productos || []).forEach(p => {
        if (p.tipoProducto === 'P' && p.disponible !== false) {
          pizzas.push(p);
        }
      });
    });
    return pizzas;
  }, [catalogo]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(prev => (prev === msg ? '' : prev));
    }, 2800);
  };

  const navigateTo = (view) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (newItem) => {
    setCart(prev => {
      // Si es exactamente el mismo producto directo sin personalización, agrupar cantidad
      const isSimple =
        !newItem.esMitadMitad &&
        !newItem.idespecialidad1 &&
        (!newItem.idadiciones || newItem.idadiciones.length === 0) &&
        (!newItem.modificadores || newItem.modificadores.length === 0) &&
        !newItem.observaciones;

      if (isSimple) {
        const existingIdx = prev.findIndex(
          i =>
            i.idproducto === newItem.idproducto &&
            !i.esMitadMitad &&
            !i.idespecialidad1 &&
            (!i.idadiciones || i.idadiciones.length === 0) &&
            (!i.modificadores || i.modificadores.length === 0) &&
            !i.observaciones
        );
        if (existingIdx >= 0) {
          return prev.map((item, idx) =>
            idx === existingIdx ? { ...item, cantidad: item.cantidad + (newItem.cantidad || 1) } : item
          );
        }
      }
      return [...prev, newItem];
    });
    showToast(`Agregado: ${newItem.descripcion}`);
  };

  const handleSelectProduct = (product) => {
    if (product.tipoProducto === 'P') {
      setSelectedPizza(product);
      navigateTo('configurator');
    } else {
      handleAddToCart({
        idproducto: product.idproducto,
        nombre: product.nombre,
        descripcion: product.nombre,
        cantidad: 1,
        precioCalculado: product.precioBase,
        esMitadMitad: false,
        observaciones: ''
      });
    }
  };

  const handleUpdateQty = (index, nextQty) => {
    if (nextQty <= 0) {
      setCart(prev => prev.filter((_, idx) => idx !== index));
      return;
    }
    setCart(prev =>
      prev.map((item, idx) => (idx === index ? { ...item, cantidad: nextQty } : item))
    );
  };

  const handleRemoveItem = (index) => {
    setCart(prev => prev.filter((_, idx) => idx !== index));
  };

  // Bloquear scroll del fondo cuando está abierto un modal o el drawer del carrito
  useEffect(() => {
    const hasOverlayOpen = isSedesModalOpen || isMobileCartOpen || isGuestModalOpen;
    if (!hasOverlayOpen) return undefined;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSedesModalOpen(false);
        setIsMobileCartOpen(false);
        setIsGuestModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.paddingRight = prevBodyPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSedesModalOpen, isMobileCartOpen, isGuestModalOpen]);

  const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);
  const subtotalFallback = cart.reduce((sum, item) => sum + item.precioCalculado * item.cantidad, 0);
  const cartTotal =
    cart.length === 0
      ? 0
      : cotizacion?.total ??
        subtotalFallback + (tipoEntrega === 'RECOGER' ? 0 : BUSINESS_RULES.COSTO_DOMICILIO);

  if (loading) {
    return (
      <div className="splash-loader">
        <div className="splash-spinner">
          <Pizza size={34} />
        </div>
        <h2>Pizza Americana</h2>
        <p>Cargando sedes y catálogo en vivo...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {errorCarga && (
        <div className="info-banner info-banner--error" role="alert">
          {errorCarga}
        </div>
      )}
      <Header
        activeView={activeView}
        onNavigate={navigateTo}
        tiendas={tiendas}
        tiendaActual={tiendaActual}
        onOpenSedesModal={() => setIsSedesModalOpen(true)}
        onOpenCoberturaModal={() => setIsCoberturaModalOpen(true)}
        tipoEntrega={tipoEntrega}
        onChangeTipoEntrega={setTipoEntrega}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => {
          if (window.innerWidth >= 1024 && activeView === 'menu' && cart.length > 0) {
            navigateTo('checkout');
          } else {
            setIsMobileCartOpen(true);
          }
        }}
        onOpenGuestProfile={() => setIsGuestModalOpen(true)}
        hasGuestProfile={Boolean(customerDraft?.nombre)}
      />

      <main className="main-workspace">
        {activeView === 'menu' && (
          <MenuView
            catalogo={catalogo}
            tiendaActual={tiendaActual}
            onOpenSedesModal={() => setIsSedesModalOpen(true)}
            onSelectProduct={handleSelectProduct}
            onNavigate={navigateTo}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            cart={cart}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            tipoEntrega={tipoEntrega}
            onChangeTipoEntrega={setTipoEntrega}
            cotizacion={cotizacion}
            quoting={quoting}
          />
        )}

        {activeView === 'configurator' && selectedPizza && (
          <PizzaConfigurator
            key={selectedPizza.idproducto}
            initialPizza={selectedPizza}
            availablePizzaSizes={availablePizzaSizes}
            onBack={() => navigateTo('menu')}
            onAddToCart={(configuredItem) => {
              handleAddToCart(configuredItem);
              navigateTo('menu');
            }}
          />
        )}

        {activeView === 'promos' && (
          <PromosView
            catalogo={catalogo}
            tiendaActual={tiendaActual}
            onSelectProduct={handleSelectProduct}
            onNavigate={navigateTo}
          />
        )}

        {activeView === 'sedes' && (
          <SedesView
            tiendas={tiendas}
            tiendaActual={tiendaActual}
            onSelectTienda={setTiendaActual}
            onNavigateMenu={() => navigateTo('menu')}
          />
        )}

        {activeView === 'puntos' && (
          <PuntosView cartTotal={cartTotal} onNavigate={navigateTo} />
        )}

        {activeView === 'checkout' && (
          <CheckoutView
            cart={cart}
            setCart={setCart}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            tiendas={tiendas}
            tiendaActual={tiendaActual}
            onSelectTienda={setTiendaActual}
            onOpenSedesModal={() => setIsSedesModalOpen(true)}
            tipoEntrega={tipoEntrega}
            onChangeTipoEntrega={setTipoEntrega}
            cotizacion={cotizacion}
            quoting={quoting}
            customerDraft={customerDraft}
            onSaveCustomerDraft={handleSaveCustomerDraft}
            onBackToMenu={() => navigateTo('menu')}
          />
        )}
      </main>

      <Footer onNavigate={navigateTo} tiendasCount={tiendas.length} />

      {/* Drawer móvil / modal rápido del carrito */}
      {isMobileCartOpen && (
        <div className="drawer-backdrop" onClick={() => setIsMobileCartOpen(false)}>
          <div className="drawer-sheet" onClick={e => e.stopPropagation()}>
            <CartPanelContent
              cart={cart}
              onUpdateQty={handleUpdateQty}
              onRemoveItem={handleRemoveItem}
              tipoEntrega={tipoEntrega}
              onChangeTipoEntrega={setTipoEntrega}
              tiendaActual={tiendaActual}
              cotizacion={cotizacion}
              quoting={quoting}
              onGoCheckout={() => navigateTo('checkout')}
              onCloseDrawer={() => setIsMobileCartOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Barra sticky móvil inferior */}
      {cartCount > 0 && activeView !== 'checkout' && activeView !== 'configurator' && (
        <div className="mobile-bottom-cart-bar show-mobile-only">
          <button
            type="button"
            className="mobile-bottom-cart-btn"
            onClick={() => setIsMobileCartOpen(true)}
          >
            <div className="mobile-bottom-left">
              <ShoppingBag size={18} />
              <span>
                Ver Pedido ({cartCount} {cartCount === 1 ? 'ítem' : 'ítems'})
              </span>
            </div>
            <div className="mobile-bottom-right">
              <strong>{formatCOP(cartTotal)}</strong>
              <ArrowRight size={16} />
            </div>
          </button>
        </div>
      )}

      {/* Toast confirmación agregado */}
      {toastMsg && (
        <div className="toast-floating" role="status" aria-live="polite">
          <CheckCircle2 size={18} className="text-success" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Modales */}
      <SedesModal
        isOpen={isSedesModalOpen}
        onClose={() => setIsSedesModalOpen(false)}
        tiendas={tiendas}
        tiendaActual={tiendaActual}
        onSelectTienda={setTiendaActual}
        hasCartItems={cart.length > 0}
      />

      <GuestProfileModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        customerDraft={customerDraft}
        onSave={handleSaveCustomerDraft}
        onClear={handleClearCustomerDraft}
      />

      <CoberturaModal
        isOpen={isCoberturaModalOpen}
        onClose={() => setIsCoberturaModalOpen(false)}
        tiendas={tiendas}
        tiendaActual={tiendaActual}
        onSelectTienda={setTiendaActual}
        customerDraft={customerDraft}
        onSaveCustomerDraft={handleSaveCustomerDraft}
      />
    </div>
  );
}
