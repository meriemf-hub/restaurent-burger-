import { RestaurantSettings } from '../types';

interface FooterProps {
  settings: RestaurantSettings;
  onOpenAdmin: () => void;
}

export function Footer({ settings, onOpenAdmin }: FooterProps) {
  return (
    <footer className="w-full bg-[#08080a] border-t border-[#2a2622]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Ratings */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                alt="Smash'art Logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1W2tHAbgB6ITvLzyWan2BnvIecf5prl5S5ua8_0ez5aEwmRODWhxCRKORcaPU2JdSrbbhcxEuwfMFvTmr5jFgjvHbrQ2WeEGjxdOluWQlaAOkfhbip550R_jQUpryuJvjWWtceiH7-Zqp-18y1uhIk9zASB-TtRlFlK9NBIocnsP7xoux3WhgDQ_dSp2yUsYPKxFSJFYKi0MM7yWSlDOReW8Ijcy8kSLJA2XtC-esXzspVfWhlmQ1en-MEs"
              />
            </div>
            <p className="text-xs text-[#B8AFA3] leading-relaxed mb-4">
              Le vrai smash burger artisanal préparé minute sur plaque d'acier à +260°C. Bœuf frais
              d'Algérie, brioches dorées de Brioch'art Hydra.
            </p>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#141417] border border-[#2a2622]">
              <span
                className="material-symbols-outlined text-[#F5B82E] text-[22px]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                star
              </span>
              <div>
                <div className="font-headline uppercase text-xs font-bold text-white">
                  Google Rating 4,6 ★
                </div>
                <div className="text-xs text-[#B8AFA3]">50 avis clients vérifiés à Hydra</div>
              </div>
            </div>
          </div>

          {/* Col 2: Localisation */}
          <div>
            <h4 className="font-headline uppercase tracking-wider text-sm text-[#F5B82E] font-bold mb-3">
              Localisation & Contact
            </h4>
            <p className="text-xs text-[#B8AFA3] mb-2 leading-relaxed">
              6 Boulevard Saïd Hamdine
              <br />
              (Situé dans Brioch'art)
              <br />
              Hydra 16000, Alger
            </p>
            <a
              className="inline-flex items-center gap-1 text-[#E63B2E] hover:text-white text-xs font-semibold mb-3 transition-colors"
              href="https://maps.google.com/?q=P2XQ%2BMP+Hydra"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="material-symbols-outlined text-[15px]">near_me</span>
              <span>Plus Code : P2XQ+MP Hydra</span>
            </a>
            <p className="text-xs text-[#B8AFA3]">
              Téléphone :{' '}
              <a
                className="font-headline font-bold text-white hover:text-[#F5B82E] text-sm"
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
              >
                {settings.phone || '0556 39 10 34'}
              </a>
            </p>
          </div>

          {/* Col 3: Hours */}
          <div>
            <h4 className="font-headline uppercase tracking-wider text-sm text-[#F5B82E] font-bold mb-3">
              Horaires d'Ouverture
            </h4>
            <ul className="space-y-1.5 text-xs text-[#B8AFA3]">
              <li>
                Samedi - Jeudi : <span className="font-bold text-white">11h30 - 00h00</span>
              </li>
              <li>
                Vendredi : <span className="font-bold text-white">16h00 - 01h00</span>
              </li>
              <li className="pt-2">
                <span className="inline-block px-2 py-0.5 rounded bg-[#1a1a1e] border border-[#2a2622] text-[11px] text-[#F5B82E] font-medium uppercase tracking-wider">
                  Service continu 7j/7
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Services Badges */}
          <div>
            <h4 className="font-headline uppercase tracking-wider text-sm text-[#F5B82E] font-bold mb-3">
              Nos Services
            </h4>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#141417] border border-[#2a2622]">
                <span className="material-symbols-outlined text-[#E63B2E] text-[18px] mt-0.5">
                  storefront
                </span>
                <span className="text-xs text-[#F5EFE6]">
                  Sur place & À emporter chez Brioch'art Hydra
                </span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#141417] border border-[#2a2622]">
                <span className="material-symbols-outlined text-[#F5B82E] text-[18px] mt-0.5">
                  moped
                </span>
                <span className="text-xs text-[#F5EFE6]">
                  Livraison express à domicile sur Grand Alger
                </span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#141417] border border-[#2a2622]">
                <span className="material-symbols-outlined text-[#E63B2E] text-[18px] mt-0.5">
                  payments
                </span>
                <span className="text-xs text-[#F5EFE6]">
                  Paiement en espèces à la livraison (Dinars)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#2a2622] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#B8AFA3]">
          <div>© {new Date().getFullYear()} Smash'art Hydra - Alger. Tous droits réservés.</div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-[#F5B82E]">
              <span className="material-symbols-outlined text-[16px]">payments</span>
              Paiement cash à la livraison
            </span>
            <span>•</span>
            <span>Hydra 16000, Alger</span>
            <span>•</span>
            <button
              onClick={onOpenAdmin}
              className="text-[#6A635B] hover:text-[#B8AFA3] transition-colors cursor-pointer"
              title="Accès Administrateur"
            >
              Portail Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
