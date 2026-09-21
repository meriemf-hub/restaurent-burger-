import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Order, Product, Category, RestaurantSettings } from '../../types';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import { AdminSettingsTab } from './AdminSettingsTab';

interface AdminDashboardProps {
  orders: Order[];
  products: Product[];
  categories: Category[];
  settings: RestaurantSettings;
  onExitAdmin: () => void;
  onShowToast: (msg: string) => void;
}

export function AdminDashboard({
  orders,
  products,
  categories,
  settings,
  onExitAdmin,
  onShowToast,
}: AdminDashboardProps) {
  const { currentUser, logOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories' | 'settings'>(
    'orders'
  );

  // Calculate live statistics
  const totalSales = orders
    .filter((o) => {
      const s = (o.statut || o.status || '').toLowerCase();
      return s !== 'refusée' && s !== 'cancelled';
    })
    .reduce((sum, o) => sum + o.total, 0);

  const newOrdersCount = orders.filter((o) => {
    const s = (o.statut || o.status || '').toLowerCase();
    return s === 'nouvelle' || s === 'new';
  }).length;

  const inPrepCount = orders.filter((o) => {
    const s = (o.statut || o.status || '').toLowerCase();
    return s === 'en préparation' || s === 'preparing' || s === 'confirmed';
  }).length;

  const outForDeliveryCount = orders.filter((o) => {
    const s = (o.statut || o.status || '').toLowerCase();
    return s === 'en livraison' || s === 'out_for_delivery';
  }).length;

  const deliveredCount = orders.filter((o) => {
    const s = (o.statut || o.status || '').toLowerCase();
    return s === 'livrée' || s === 'delivered';
  }).length;

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-[#F5EFE6] flex flex-col">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-[#141417]/95 backdrop-blur-md border-b border-[#2a2622]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2ecc71] animate-pulse"></span>
              <h1 className="font-headline uppercase text-lg text-white font-black tracking-wide">
                Smash'art Hydra · Admin
              </h1>
            </div>
            <span className="hidden sm:inline px-2.5 py-0.5 rounded-full bg-[#2a2211] text-[#F5B82E] border border-[#F5B82E]/30 text-xs font-semibold">
              Comptoir & Plancha
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-[#B8AFA3]">
              <span className="material-symbols-outlined text-[16px] text-[#F5B82E]">
                account_circle
              </span>
              <span>{currentUser?.email || 'Admin'}</span>
            </div>

            <button
              onClick={onExitAdmin}
              className="h-9 px-3.5 rounded-xl bg-[#1a1a1e] hover:bg-[#222227] border border-[#2a2622] text-[#F5EFE6] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Voir le Site Client</span>
            </button>

            <button
              onClick={logOut}
              className="h-9 px-3 rounded-xl bg-[#3d1310] hover:bg-[#521915] border border-[#E63B2E]/40 text-[#ff8c82] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Déconnexion"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Metrics Dashboard Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Revenue */}
          <div className="p-4 rounded-2xl bg-[#141417] border border-[#2a2622]">
            <span className="text-[11px] font-semibold text-[#B8AFA3] block">Chiffre d'Affaires</span>
            <div className="font-display text-2xl text-[#F5B82E] mt-1">
              {totalSales.toLocaleString('fr-DZ')}{' '}
              <span className="text-xs font-sans text-white font-bold">DA</span>
            </div>
            <span className="text-[10px] text-[#B8AFA3]">Espèces perçues & en cours</span>
          </div>

          {/* Total Orders */}
          <div className="p-4 rounded-2xl bg-[#141417] border border-[#2a2622]">
            <span className="text-[11px] font-semibold text-[#B8AFA3] block">Total Commandes</span>
            <div className="font-display text-2xl text-white mt-1">{orders.length}</div>
            <span className="text-[10px] text-[#B8AFA3]">Historique complet</span>
          </div>

          {/* New Orders (Alert) */}
          <div className="p-4 rounded-2xl bg-[#141417] border border-[#2a2622]">
            <span className="text-[11px] font-semibold text-[#B8AFA3] block">Nouvelles</span>
            <div className="font-display text-2xl text-[#E63B2E] mt-1 flex items-center gap-1.5">
              <span>{newOrdersCount}</span>
              {newOrdersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#E63B2E] animate-ping"></span>
              )}
            </div>
            <span className="text-[10px] text-[#ff8c82]">À traiter immédiatement</span>
          </div>

          {/* In Preparation */}
          <div className="p-4 rounded-2xl bg-[#141417] border border-[#2a2622]">
            <span className="text-[11px] font-semibold text-[#B8AFA3] block">Sur le Grill</span>
            <div className="font-display text-2xl text-[#ff8c42] mt-1">{inPrepCount}</div>
            <span className="text-[10px] text-[#B8AFA3]">Cuisson minute +260°C</span>
          </div>

          {/* In Delivery */}
          <div className="p-4 rounded-2xl bg-[#141417] border border-[#2a2622]">
            <span className="text-[11px] font-semibold text-[#B8AFA3] block">En Livraison</span>
            <div className="font-display text-2xl text-[#4ea8de] mt-1">{outForDeliveryCount}</div>
            <span className="text-[10px] text-[#B8AFA3]">Coursiers en route</span>
          </div>

          {/* Delivered */}
          <div className="p-4 rounded-2xl bg-[#141417] border border-[#2a2622]">
            <span className="text-[11px] font-semibold text-[#B8AFA3] block">Livrées</span>
            <div className="font-display text-2xl text-[#2ecc71] mt-1">{deliveredCount}</div>
            <span className="text-[10px] text-[#B8AFA3]">Commandes terminées</span>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#2a2622] pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl font-headline uppercase text-xs tracking-wider font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'orders'
                ? 'bg-[#E63B2E] text-white shadow-md shadow-[#E63B2E]/20'
                : 'bg-[#141417] text-[#B8AFA3] hover:text-white border border-[#2a2622]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Commandes & Livraisons</span>
            {newOrdersCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white text-[#E63B2E] text-[10px] font-black">
                {newOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl font-headline uppercase text-xs tracking-wider font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'products'
                ? 'bg-[#E63B2E] text-white shadow-md shadow-[#E63B2E]/20'
                : 'bg-[#141417] text-[#B8AFA3] hover:text-white border border-[#2a2622]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">lunch_dining</span>
            <span>Carte & Produits ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl font-headline uppercase text-xs tracking-wider font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'categories'
                ? 'bg-[#E63B2E] text-white shadow-md shadow-[#E63B2E]/20'
                : 'bg-[#141417] text-[#B8AFA3] hover:text-white border border-[#2a2622]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">category</span>
            <span>Catégories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl font-headline uppercase text-xs tracking-wider font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'settings'
                ? 'bg-[#E63B2E] text-white shadow-md shadow-[#E63B2E]/20'
                : 'bg-[#141417] text-[#B8AFA3] hover:text-white border border-[#2a2622]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span>Paramètres Restaurant</span>
          </button>
        </div>

        {/* Tab View Content */}
        {activeTab === 'orders' && (
          <AdminOrdersTab orders={orders} settings={settings} onShowToast={onShowToast} />
        )}
        {activeTab === 'products' && (
          <AdminProductsTab
            products={products}
            categories={categories}
            onShowToast={onShowToast}
          />
        )}
        {activeTab === 'categories' && (
          <AdminCategoriesTab categories={categories} onShowToast={onShowToast} />
        )}
        {activeTab === 'settings' && (
          <AdminSettingsTab settings={settings} onShowToast={onShowToast} />
        )}
      </main>
    </div>
  );
}
