import { RestaurantSettings } from '../types';

interface LocationMapSectionProps {
  settings: RestaurantSettings;
}

export function LocationMapSection({ settings }: LocationMapSectionProps) {
  return (
    <section className="w-full py-16 bg-[#101013] border-b border-[#2a2622]" id="a-propos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <span className="text-[#E63B2E] font-headline uppercase text-xs tracking-widest font-bold block mb-1">
              Points de Repère & Accès
            </span>
            <h2 className="font-display uppercase text-4xl sm:text-5xl text-white tracking-tight">
              Nous Trouver à Hydra
            </h2>
          </div>
          <span className="text-xs text-[#B8AFA3]">
            Comptoir sur place & hub de livraison rapide
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact and Info Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-6 rounded-2xl bg-[#141417] border border-[#2a2622] flex flex-col gap-5">
              <div>
                <div className="font-headline uppercase text-xl text-white font-bold mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#E63B2E]">storefront</span>
                  {settings.restaurantName || "Smash'art @ Brioch'art"}
                </div>
                <p className="text-sm text-[#B8AFA3]">
                  {settings.address || '6 Boulevard Saïd Hamdine, Hydra 16000, Alger'}
                </p>
              </div>

              {/* Clarification badges */}
              <div className="flex flex-col gap-2.5">
                <div className="p-3 rounded-xl bg-[#18181c] border border-[#2a2622] flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#E63B2E] text-[20px] mt-0.5">
                    restaurant
                  </span>
                  <div>
                    <div className="font-headline uppercase text-xs font-bold text-white">
                      Sur place & À emporter
                    </div>
                    <div className="text-xs text-[#B8AFA3]">
                      Commandez directement au comptoir dans la boutique Brioch'art, Bd Saïd Hamdine.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#18181c] border border-[#2a2622] flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#F5B82E] text-[20px] mt-0.5">
                    moped
                  </span>
                  <div>
                    <div className="font-headline uppercase text-xs font-bold text-white">
                      Commande en Ligne Spéciale Livraison
                    </div>
                    <div className="text-xs text-[#B8AFA3]">
                      Ce site web expédie vos commandes à domicile avec règlement en cash à l'arrivée.
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  className="flex-1 h-12 rounded-xl bg-[#E63B2E] hover:bg-[#c92e22] text-white font-headline uppercase tracking-wider text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#E63B2E]/20"
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                >
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  <span>{settings.phone || '0556 39 10 34'}</span>
                </a>
                <a
                  className="flex-1 h-12 rounded-xl bg-[#1a1a1e] border border-[#2a2622] hover:border-[#F5B82E] text-[#F5EFE6] font-headline uppercase tracking-wider text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  href="https://maps.google.com/?q=P2XQ%2BMP+Hydra"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#F5B82E]">
                    near_me
                  </span>
                  <span>P2XQ+MP Hydra</span>
                </a>
              </div>
            </div>

            {/* Hours card */}
            <div className="p-4 rounded-2xl bg-[#141417] border border-[#2a2622] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#18181c] border border-[#2a2622] flex items-center justify-center text-[#F5B82E]">
                  <span className="material-symbols-outlined text-[20px]">schedule</span>
                </div>
                <div>
                  <div className="font-headline uppercase text-xs font-bold text-white">
                    Horaires d'expédition
                  </div>
                  <div className="text-xs text-[#B8AFA3]">
                    {settings.openingHours || '11h30 - 00h00 (Ven: 16h00 - 01h00)'}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#3d1310] text-[#ff8c82] text-xs font-bold border border-[#E63B2E]/30">
                {settings.announcement || 'Ouvre à 11h30'}
              </span>
            </div>
          </div>

          {/* Dark Map Graphic Container */}
          <div className="lg:col-span-7">
            <div className="w-full h-full min-h-[360px] rounded-2xl overflow-hidden border border-[#2a2622] relative bg-[#141417]">
              {/* Dark Map Background Visual */}
              <div
                className="w-full h-full min-h-[360px] bg-cover bg-center filter grayscale contrast-125 brightness-75"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCcGn5QFyxYZLc99SHQwD9wAdc1oucirDcK3TmKL0kk-WwiL4iMF2QUPeVHgsCtX-5daPolUhYqQ3UNqSvp-yaYyZTj-tFZOgmYcHtYgVb2DUDhdrsOB7klqJ0C4pO1h-rKr41nOtnTLuiBCJVXXC-aYX8AJoP4BjA2gvipsEanMk887WiSbXxbpHz8FYC9HD4-Ajr20kfyVGn_K7gYfQPG7rsou9-IDIjdE_TYHvQ2kjLDYhQB9n43Fw")',
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-[#0c0c0e]/60 pointer-events-none"></div>

              {/* Map Pin Box Card */}
              <div className="absolute top-5 left-5 right-5 sm:right-auto sm:max-w-xs bg-[#141417]/95 backdrop-blur-md p-4 rounded-xl border border-[#2a2622] shadow-2xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="material-symbols-outlined text-[#E63B2E] text-[22px]">
                    location_on
                  </span>
                  <span className="font-headline uppercase text-sm font-bold text-white">
                    Smash'art @ Brioch'art
                  </span>
                </div>
                <p className="text-xs text-[#B8AFA3] leading-relaxed mb-3">
                  6 Boulevard Saïd Hamdine, Hydra. Accès facile pour coursiers et retraits rapides.
                </p>
                <a
                  className="text-[#F5B82E] font-headline uppercase tracking-wider text-xs font-bold flex items-center gap-1 hover:underline"
                  href="https://maps.google.com/?q=P2XQ%2BMP+Hydra"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span>Ouvrir sur Google Maps</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
