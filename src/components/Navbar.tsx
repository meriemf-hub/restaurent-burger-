import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { RestaurantSettings } from '../types';

interface NavbarProps {
  settings: RestaurantSettings;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenCustomerOrders: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export function Navbar({
  settings,
  onOpenAuth,
  onOpenAdmin,
  onOpenCustomerOrders,
  activeSection,
  onNavigate,
}: NavbarProps) {
  const { itemCount, openCart } = useCart();
  const { currentUser, isAdmin, logOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0c0c0e]/95 backdrop-blur-xl border-b border-[#2a2622]">
      {/* Top Announcement Bar */}
      <div className="bg-[#141417] border-b border-[#2a2622]/60 hidden sm:block py-1.5 text-xs text-[#B8AFA3] font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3d1310] border border-[#E63B2E]/30 text-[#ff8c82] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#E63B2E] animate-pulse"></span>
              <span>{settings.announcement || 'Ouvert 7j/7 · Hydra'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#B8AFA3]">
              <span className="material-symbols-outlined text-[15px] text-[#E63B2E]">
                location_on
              </span>
              <span>{settings.address || "6 Bd Saïd Hamdine, Hydra (Brioch'art)"}</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="inline-flex items-center gap-1.5 text-[#F5B82E]">
              <span className="material-symbols-outlined text-[16px]">payments</span>
              <span className="text-[#B8AFA3]">Paiement en espèces à la livraison</span>
            </div>
            <a
              className="flex items-center gap-1.5 text-[#F5B82E] font-bold hover:underline"
              href={`tel:${settings.phone.replace(/\s+/g, '')}`}
            >
              <span className="material-symbols-outlined text-[16px] text-[#E63B2E]">call</span>
              <span>{settings.phone || '0556 39 10 34'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <button
            onClick={() => onNavigate('accueil')}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <img
              alt="Smash'art Logo Hydra"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida/AEtjO1W2tHAbgB6ITvLzyWan2BnvIecf5prl5S5ua8_0ez5aEwmRODWhxCRKORcaPU2JdSrbbhcxEuwfMFvTmr5jFgjvHbrQ2WeEGjxdOluWQlaAOkfhbip550R_jQUpryuJvjWWtceiH7-Zqp-18y1uhIk9zASB-TtRlFlK9NBIocnsP7xoux3WhgDQ_dSp2yUsYPKxFSJFYKi0MM7yWSlDOReW8Ijcy8kSLJA2XtC-esXzspVfWhlmQ1en-MEs"
            />
          </button>
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate('accueil')}
              className={`px-3.5 py-2 rounded-lg font-bold tracking-normal text-sm transition-colors cursor-pointer ${
                activeSection === 'accueil'
                  ? 'bg-[#E63B2E] text-white shadow-md shadow-[#E63B2E]/20'
                  : 'text-[#B8AFA3] hover:text-[#F5EFE6] hover:bg-[#1a1a1e]'
              }`}
            >
              Accueil
            </button>
            <button
              onClick={() => onNavigate('menu')}
              className={`px-3.5 py-2 rounded-lg font-medium tracking-normal text-sm transition-colors cursor-pointer ${
                activeSection === 'menu'
                  ? 'bg-[#E63B2E] text-white'
                  : 'text-[#B8AFA3] hover:text-[#F5EFE6] hover:bg-[#1a1a1e]'
              }`}
            >
              Notre Menu
            </button>
            <button
              onClick={() => onNavigate('comment-commander')}
              className="px-3.5 py-2 rounded-lg text-[#B8AFA3] hover:text-[#F5EFE6] hover:bg-[#1a1a1e] font-medium tracking-normal text-sm transition-colors cursor-pointer"
            >
              Comment commander
            </button>
            <button
              onClick={() => onNavigate('a-propos')}
              className="px-3.5 py-2 rounded-lg text-[#B8AFA3] hover:text-[#F5EFE6] hover:bg-[#1a1a1e] font-medium tracking-normal text-sm transition-colors cursor-pointer"
            >
              À propos
            </button>
            {currentUser && (
              <button
                onClick={onOpenCustomerOrders}
                className="px-3.5 py-2 rounded-lg text-[#F5B82E] hover:bg-[#1a1a1e] font-medium tracking-normal text-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                Mes Commandes
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <a
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1a1a1e] border border-[#2a2622] text-[#F5EFE6] hover:border-[#F5B82E] transition-colors"
            href={`tel:${settings.phone.replace(/\s+/g, '')}`}
          >
            <span className="material-symbols-outlined text-[18px] text-[#F5B82E]">call</span>
            <span className="font-headline tracking-wider text-sm font-semibold">
              {settings.phone || '0556 39 10 34'}
            </span>
          </a>

          {/* Admin / Account Trigger */}
          {isAdmin ? (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2a2211] border border-[#F5B82E]/50 text-[#F5B82E] hover:bg-[#F5B82E] hover:text-[#141417] transition-all text-xs font-bold cursor-pointer"
              title="Accéder au panneau d'administration"
            >
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              <span className="hidden sm:inline">Admin</span>
            </button>
          ) : (
            <button
              onClick={currentUser ? onOpenCustomerOrders : onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a1a1e] border border-[#2a2622] text-[#B8AFA3] hover:text-white hover:border-[#2a2622]/90 transition-colors text-xs font-medium cursor-pointer"
              title={currentUser ? 'Mon compte / Commandes' : 'Connexion / Admin'}
            >
              <span className="material-symbols-outlined text-[18px] text-[#F5B82E]">
                {currentUser ? 'account_circle' : 'login'}
              </span>
              <span className="hidden sm:inline">
                {currentUser ? (currentUser.displayName || 'Mon Compte') : 'Connexion'}
              </span>
            </button>
          )}

          {/* Cart Trigger */}
          <button
            onClick={openCart}
            id="cart-button"
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#E63B2E] hover:bg-[#c92e22] text-white transition-all shadow-lg shadow-[#E63B2E]/20 tracking-normal text-sm font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            <span className="hidden sm:inline font-semibold">Panier</span>
            <span className="px-2 py-0.5 rounded-full bg-[#F5B82E] text-[#141417] text-xs font-black">
              {itemCount}
            </span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#1a1a1e] border border-[#2a2622] text-[#F5EFE6]"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#141417] border-b border-[#2a2622] px-4 py-4 space-y-2">
          <button
            onClick={() => {
              onNavigate('accueil');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3.5 py-2.5 rounded-lg bg-[#E63B2E] text-white font-bold text-sm"
          >
            Accueil
          </button>
          <button
            onClick={() => {
              onNavigate('menu');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3.5 py-2.5 rounded-lg text-[#F5EFE6] hover:bg-[#1a1a1e] font-medium text-sm"
          >
            Notre Menu
          </button>
          <button
            onClick={() => {
              onNavigate('comment-commander');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3.5 py-2.5 rounded-lg text-[#F5EFE6] hover:bg-[#1a1a1e] font-medium text-sm"
          >
            Comment commander
          </button>
          <button
            onClick={() => {
              onNavigate('a-propos');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3.5 py-2.5 rounded-lg text-[#F5EFE6] hover:bg-[#1a1a1e] font-medium text-sm"
          >
            À propos & Accès
          </button>
          <button
            onClick={() => {
              onOpenCustomerOrders();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3.5 py-2.5 rounded-lg text-[#F5B82E] hover:bg-[#1a1a1e] font-medium text-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            Suivre mes commandes
          </button>
          {isAdmin ? (
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-lg bg-[#2a2211] text-[#F5B82E] font-bold text-sm flex items-center gap-2 border border-[#F5B82E]/40"
            >
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              Tableau de bord Admin
            </button>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-[#B8AFA3] hover:bg-[#1a1a1e] font-medium text-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              Connexion / Espace Admin
            </button>
          )}
          {currentUser && (
            <button
              onClick={() => {
                logOut();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 rounded-lg text-[#ff8c82] hover:bg-[#3d1310] text-xs font-semibold"
            >
              Déconnexion ({currentUser.email || 'Invité'})
            </button>
          )}
        </div>
      )}
    </header>
  );
}
