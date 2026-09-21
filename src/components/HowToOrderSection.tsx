export function HowToOrderSection() {
  return (
    <section className="w-full py-16 bg-[#101013] border-y border-[#2a2622]" id="comment-commander">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-[#F5B82E] font-headline uppercase text-xs tracking-widest font-bold mb-2">
            <span className="material-symbols-outlined text-[16px]">moped</span>
            <span>Simple, Rapide, Sans Carte Bancaire</span>
          </div>
          <h2 className="text-3xl sm:text-4xl text-white font-extrabold tracking-tight mb-3">
            Comment commander chez Smash'art
          </h2>
          <p className="text-sm text-[#B8AFA3]">
            Du grill brûlant de Hydra jusqu'au pas de votre porte en 3 étapes sans friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-[#141417] border border-[#2a2622] flex flex-col justify-between hover:border-[#F5B82E]/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#E63B2E] text-white font-display text-2xl flex items-center justify-center shadow-lg shadow-[#E63B2E]/25">
                  01
                </div>
                <span className="material-symbols-outlined text-[#F5B82E] text-[30px]">
                  lunch_dining
                </span>
              </div>
              <h3 className="font-headline uppercase text-xl text-white mb-2 font-bold">
                Choisissez vos smash burgers & tenders
              </h3>
              <p className="text-xs sm:text-sm text-[#B8AFA3] leading-relaxed">
                Explorez nos créations au bœuf frais d'Alger ou poulet croustillant, nos frites
                maison et nos sauces signatures.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#2a2622] text-[#F5B82E] text-xs uppercase tracking-wider font-headline font-bold flex items-center gap-1">
              <span>Cuisson minute sur mesure</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-[#141417] border border-[#2a2622] flex flex-col justify-between hover:border-[#F5B82E]/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#F5B82E] text-[#141417] font-display text-2xl flex items-center justify-center font-black">
                  02
                </div>
                <span className="material-symbols-outlined text-[#E63B2E] text-[30px]">
                  location_on
                </span>
              </div>
              <h3 className="font-headline uppercase text-xl text-white mb-2 font-bold">
                Indiquez votre adresse à Alger
              </h3>
              <p className="text-xs sm:text-sm text-[#B8AFA3] leading-relaxed">
                Hydra, El Biar, Ben Aknoun, Sidi Yahia, Val d'Hydra et ensemble du Grand Alger. Vos
                burgers sont emballés sous cloche thermique.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#2a2622] text-[#E63B2E] text-xs uppercase tracking-wider font-headline font-bold flex items-center gap-1">
              <span>Livraison rapide dédiée</span>
              <span className="material-symbols-outlined text-[14px]">schedule</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-[#141417] border border-[#2a2622] flex flex-col justify-between hover:border-[#F5B82E]/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#2b2b32] text-white font-display text-2xl flex items-center justify-center border border-[#2a2622]">
                  03
                </div>
                <span className="material-symbols-outlined text-[#F5B82E] text-[30px]">
                  payments
                </span>
              </div>
              <h3 className="font-headline uppercase text-xl text-white mb-2 font-bold">
                Payez en espèces à la livraison
              </h3>
              <p className="text-xs sm:text-sm text-[#B8AFA3] leading-relaxed">
                Zéro paiement en ligne obligatoire. Réglez simplement en liquide en Dinars Algériens
                (DA) directement auprès de notre livreur.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#2a2622] text-[#F5EFE6] text-xs uppercase tracking-wider font-headline font-bold flex items-center gap-1">
              <span>Paiement cash en main</span>
              <span className="material-symbols-outlined text-[14px] text-[#F5B82E]">
                verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
