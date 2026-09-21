import { useCart } from '../context/CartContext';
import { Product, RestaurantSettings } from '../types';

interface HeroSectionProps {
  settings: RestaurantSettings;
  featuredProduct?: Product;
  onSelectProduct: (product: Product) => void;
  onExploreMenu: () => void;
}

export function HeroSection({
  settings,
  featuredProduct,
  onSelectProduct,
  onExploreMenu,
}: HeroSectionProps) {
  const { addToCart } = useCart();

  const handleHeroBurgerClick = () => {
    if (featuredProduct) {
      onSelectProduct(featuredProduct);
    } else {
      onExploreMenu();
    }
  };

  const handleQuickAddHero = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (featuredProduct) {
      addToCart(featuredProduct, 1);
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#0c0c0e] border-b border-[#2a2622] pt-12 pb-16 lg:pt-16 lg:pb-24">
      {/* Dark griddle glow & embers */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#E63B2E]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#F5B82E]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Live Badges Row */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3d1310] border border-[#E63B2E]/40 text-[#ff8c82] text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#E63B2E] animate-ping"></span>
            <span>{settings.announcement || 'Ouvert 7j/7'}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a1a1e] border border-[#2a2622] text-[#F5EFE6] text-xs font-medium">
            <span className="material-symbols-outlined text-[16px] text-[#E63B2E]">
              storefront
            </span>
            <span>Situé dans Brioch'art · 6 Bd Saïd Hamdine</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a1a1e] border border-[#2a2622] text-xs font-semibold text-[#F5B82E]">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Bœuf 100% Frais d'Algérie</span>
          </div>
        </div>

        {/* Hero Headline & Burger Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#2c1d1a] text-[#F5B82E] font-headline text-xs tracking-widest uppercase font-bold mb-4 border border-[#F5B82E]/20">
              <span className="material-symbols-outlined text-[15px] text-[#E63B2E]">
                local_fire_department
              </span>
              SMASHÉ. CROUSTILLANT. JUTEUX.
            </div>
            <h1 className="text-white font-extrabold tracking-tight text-4xl sm:text-6xl lg:text-7xl mb-6 leading-[1.05]">
              L'art du vrai
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63B2E] via-[#ff6a52] to-[#F5B82E]">
                Smash Burger
              </span>
              <br />
              à Hydra.
            </h1>
            <p className="font-body text-base sm:text-lg text-[#B8AFA3] max-w-xl leading-relaxed mb-8">
              Bœuf frais d'Algérie écrasé ultra-fin sur plancha brûlante à +260°C. Dentelle
              croustillante caramélisée, double cheddar fondu dégoulinant et buns briochés pur
              beurre pétris sur place par{' '}
              <strong className="text-[#F5EFE6]">Brioch'art</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <button
                onClick={onExploreMenu}
                id="hero-order-now-btn"
                className="h-14 px-8 rounded-xl bg-[#E63B2E] hover:bg-[#c92e22] text-white text-base tracking-normal font-bold flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 shadow-xl shadow-[#E63B2E]/30 w-full sm:w-auto cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">lunch_dining</span>
                <span>Commander maintenant</span>
              </button>
              <button
                onClick={onExploreMenu}
                className="h-14 px-7 rounded-xl bg-[#1a1a1e] border border-[#2a2622] hover:border-[#F5B82E] text-[#F5EFE6] text-base tracking-normal font-semibold flex items-center justify-center gap-2 transition-all w-full sm:w-auto cursor-pointer"
              >
                <span>Découvrir la carte</span>
                <span className="material-symbols-outlined text-[20px] text-[#F5B82E]">
                  arrow_downward
                </span>
              </button>
            </div>
            <div className="mt-8 pt-6 border-t border-[#2a2622] flex flex-wrap items-center gap-5 text-[#B8AFA3] text-xs sm:text-sm">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#F5B82E]">moped</span>
                Livraison rapide Hydra & Grand Alger
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2a2622]"></span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#E63B2E]">payments</span>
                Règlement cash à la livraison
              </span>
            </div>
          </div>

          {/* Hero Burger Image Showcase with Griddle Vignette */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none group cursor-pointer" onClick={handleHeroBurgerClick}>
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#E63B2E]/30 via-[#F5B82E]/20 to-transparent blur-2xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#2a2622] bg-[#141417] shadow-2xl">
                <img
                  alt="Smash'art Burger Hydra"
                  className="w-full h-[420px] lg:h-[460px] object-cover filter contrast-[1.05] group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0V9lUfyaLG-8MyjnT67Eb7ArxuIr8N325Vxz3ZselPzcIWP4dTm_YMEhZnqlI--CyqV9q6OIUX4FiJrMXNGKBmHEHPrH6cxEezzxvGCgd7nW_wGRsDVAz543QmfTsU0Q5Adw7OpO31K1SDif8rh8T-3n4KubM5QOihgiGy_bjdFPCb4MXZK3s6Lbb_MF9Dmr_A-dvcZyHpxLaakSlCnX0REdsyIGHZb_7VbeeIMDTGCzB7CmplLA-URrE-K5V5cwhj_M"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/30 to-transparent"></div>
                <div className="absolute bottom-0 inset-x-0 p-5 flex items-end justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded bg-[#E63B2E] text-white text-[12px] font-bold mb-1.5">
                      Best-Seller Hydra
                    </span>
                    <div className="text-2xl text-white font-bold tracking-tight">
                      Triple Smash'Art
                    </div>
                    <div className="text-xs text-[#B8AFA3] font-medium">
                      Triple bœuf smashé · Triple cheddar fondu
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[11px] font-semibold text-[#B8AFA3]">
                      Prix Spécial
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-[#F5B82E] tracking-tight">
                        1 100 <span className="text-sm text-[#F5B82E] font-bold">DA</span>
                      </span>
                      {featuredProduct && (
                        <button
                          onClick={handleQuickAddHero}
                          className="w-9 h-9 rounded-lg bg-[#E63B2E] hover:bg-[#c92e22] text-white flex items-center justify-center transition-transform hover:scale-110 shadow"
                          title="Ajouter au panier"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Sticker Badge */}
              <div className="absolute -top-3 -right-3 rotate-6 bg-[#F5B82E] text-[#141417] px-3.5 py-2 rounded-xl shadow-xl tracking-normal text-xs font-bold flex items-center gap-1.5 border border-white/20">
                <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
                <span>Cuisson Minute +260°C</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
