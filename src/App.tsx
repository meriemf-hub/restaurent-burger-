import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import {
  Category,
  Product,
  Order,
  RestaurantSettings,
} from './types';
import {
  seedDatabaseIfNeeded,
  onCategoriesSnapshot,
  onProductsSnapshot,
  onSettingsSnapshot,
  onAdminOrdersSnapshot,
} from './services/firestoreService';
import { INITIAL_SETTINGS } from './lib/seedData';

// Public website components
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MarqueeStrip } from './components/MarqueeStrip';
import { CategoryNav } from './components/CategoryNav';
import { MenuSection } from './components/MenuSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { HowToOrderSection } from './components/HowToOrderSection';
import { AboutSection } from './components/AboutSection';
import { LocationMapSection } from './components/LocationMapSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';

// Admin Dashboard component
import { AdminDashboard } from './components/admin/AdminDashboard';

function MainApp() {
  const { isAdmin } = useAuth();
  const { toastMessage, showToast, activeTrackingOrderId, closeTracking, trackOrder } = useCart();

  // Firestore Real-time States
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings>(INITIAL_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<'client' | 'admin'>('client');
  const [activeSection, setActiveSection] = useState('accueil');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Modals
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'admin'>('login');
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [isCustomerOrdersOpen, setIsCustomerOrdersOpen] = useState(false);

  // Auto-seed and subscribe to Firestore
  useEffect(() => {
    let isMounted = true;

    async function init() {
      await seedDatabaseIfNeeded();
    }
    init();

    const unsubCategories = onCategoriesSnapshot((cats) => {
      if (isMounted) setCategories(cats);
    });

    const unsubProducts = onProductsSnapshot((prods) => {
      if (isMounted) {
        setProducts(prods);
        setIsLoading(false);
      }
    });

    const unsubSettings = onSettingsSnapshot((sett) => {
      if (isMounted) setSettings(sett);
    });

    return () => {
      isMounted = false;
      unsubCategories();
      unsubProducts();
      unsubSettings();
    };
  }, []);

  // Subscribe to live Admin Orders ONLY when authenticated as admin
  useEffect(() => {
    if (!isAdmin) {
      setOrders([]);
      return;
    }

    const unsubOrders = onAdminOrdersSnapshot((ords) => {
      setOrders(ords);
    });

    return () => {
      unsubOrders();
    };
  }, [isAdmin]);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    setViewMode('client');

    if (section === 'accueil') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'menu') {
      const el = document.getElementById('best-sellers') || document.getElementById('menu-commandes');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'comment-commander') {
      const el = document.getElementById('comment-commander');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'a-propos') {
      const el = document.getElementById('notre-histoire') || document.getElementById('a-propos');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register' | 'admin' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleOrderPlaced = (orderId: string) => {
    setConfirmedOrderId(orderId);
  };

  // Hero burger product for showcase
  const heroBurgerProduct =
    products.find((p) => p.name.includes("Triple Smash'Art") || p.id === 'prod_triple_smash') ||
    products[0];

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-[#F5EFE6] selection:bg-[#E63B2E] selection:text-white flex flex-col font-body antialiased">
      {viewMode === 'admin' && isAdmin ? (
        /* Admin Dashboard View */
        <AdminDashboard
          orders={orders}
          products={products}
          categories={categories}
          settings={settings}
          onExitAdmin={() => setViewMode('client')}
          onShowToast={showToast}
        />
      ) : (
        /* Customer Website View */
        <>
          <Navbar
            settings={settings}
            onOpenAuth={() => handleOpenAuth('login')}
            onOpenAdmin={() => {
              if (isAdmin) {
                setViewMode('admin');
              } else {
                handleOpenAuth('admin');
              }
            }}
            onOpenCustomerOrders={() => setIsCustomerOrdersOpen(true)}
            activeSection={activeSection}
            onNavigate={handleNavigate}
          />

          {/* Spacing for fixed navbar */}
          <div className="h-20 sm:h-28"></div>

          {/* Main Website Sections */}
          <main className="flex-1">
            <HeroSection
              settings={settings}
              featuredProduct={heroBurgerProduct}
              onSelectProduct={(p) => setSelectedProductForModal(p)}
              onExploreMenu={() => handleNavigate('menu')}
            />

            <MarqueeStrip />

            <CategoryNav
              categories={categories.filter((c) => c.isActive !== false)}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={(id) => setSelectedCategoryId(id)}
            />

            <MenuSection
              products={products}
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectProduct={(p) => setSelectedProductForModal(p)}
              isLoading={isLoading}
            />

            <HowToOrderSection />

            <AboutSection />

            <LocationMapSection settings={settings} />
          </main>

          <Footer
            settings={settings}
            onOpenAdmin={() => {
              if (isAdmin) {
                setViewMode('admin');
              } else {
                handleOpenAuth('admin');
              }
            }}
          />

          {/* Interactive Drawers & Overlays */}
          <CartDrawer settings={settings} />

          <CheckoutModal
            products={products}
            settings={settings}
            onOrderPlaced={handleOrderPlaced}
          />

          {/* Product Detail & Customizer Modal */}
          {selectedProductForModal && (
            <ProductDetailModal
              product={selectedProductForModal}
              onClose={() => setSelectedProductForModal(null)}
            />
          )}

          {/* Order Confirmation Modal */}
          {confirmedOrderId && (
            <OrderConfirmationModal
              orderId={confirmedOrderId}
              onClose={() => setConfirmedOrderId(null)}
              onTrack={() => {
                const id = confirmedOrderId;
                setConfirmedOrderId(null);
                trackOrder(id);
              }}
            />
          )}

          {/* Order Tracking Modal (Active or past orders) */}
          {(activeTrackingOrderId || isCustomerOrdersOpen) && (
            <OrderTrackingModal
              initialOrderId={activeTrackingOrderId}
              onClose={() => {
                closeTracking();
                setIsCustomerOrdersOpen(false);
              }}
            />
          )}

          {/* Auth / Admin Login Modal */}
          {isAuthModalOpen && (
            <AuthModal
              initialMode={authModalMode}
              onClose={() => setIsAuthModalOpen(false)}
              onSuccessAdmin={() => setViewMode('admin')}
            />
          )}
        </>
      )}

      {/* Floating Global Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
