export function AboutSection() {
  return (
    <section className="w-full py-16 bg-[#0c0c0e] border-b border-[#2a2622]" id="notre-histoire">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Image Collage */}
          <div className="lg:col-span-6 relative">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-7 rounded-2xl overflow-hidden border border-[#2a2622] shadow-xl bg-[#141417] h-80 sm:h-96">
                <img
                  alt="Façade Smash'art Hydra Enseigne Néon"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwDDwtAvx4VPcFp8UEMOIr35dvztrE12pxosqBCNNGbeu7SxFlK_jrbltTq4xWdPX6JRBSAYO9BholU-uK1xo780h-so94apvIwHcWGjrAkZqO0mizXKFsVZxJ3StHSnIf0I11kY8mIRYsjzMVHmdqM0jHgPPCNfrsDzm0r8bW_W51jxvKpbSHf19r1K1yzhC1jj4qW5esrVx6c_WFV2ZPLMw1Ti-jiJGDcfDteL9rjmrXM2e9-f0b-bpBN3uDXxON2_A"
                  loading="lazy"
                />
              </div>
              <div className="col-span-5 flex flex-col gap-4">
                <div className="rounded-2xl overflow-hidden border border-[#2a2622] shadow-xl bg-[#141417] h-48 sm:h-56">
                  <img
                    alt="Brioche artisanale Smash'art"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAw5dzUca_7QgKQLmHXVhl1CozVMdoZ7I1faP691SBqZh2NVsioUkAg_yLntLhv6EkYIbVj37epEOVZQy6_pMEyuPwPXF0Us19_zwgGijAv0HZ4Pn0Dcp025bR3M3DRgEjGB5OzSDB-hTCEBldtnzK0k3viIHK04Bm9dCSjofcj3tBmCl4NuO-Mq5VkYDCuZ66fD9uNpmOO8CBibN2e62cGHJO3OGITY6GLnK9e5gKJKpEdocWUNIlk7nB2SfQU40Ac2ho"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 rounded-2xl bg-[#141417] border border-[#2a2622] flex flex-col justify-center">
                  <span className="text-[#F5B82E] font-display text-2xl">100% FRAIS</span>
                  <span className="text-xs text-[#B8AFA3] font-medium">
                    Buns dorés de Brioch'art Hydra
                  </span>
                </div>
              </div>
            </div>

            {/* Floater badge */}
            <div className="absolute -bottom-4 left-6 bg-[#E63B2E] text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 border border-white/20">
              <span className="material-symbols-outlined text-[18px]">handshake</span>
              <span className="font-headline uppercase tracking-wider text-xs font-bold">
                Partenariat Exclusif Brioch'art
              </span>
            </div>
          </div>

          {/* Story Text */}
          <div className="lg:col-span-6 flex flex-col items-start pt-6 lg:pt-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#2b1816] text-[#E63B2E] text-xs font-headline uppercase tracking-wider font-bold mb-3 border border-[#E63B2E]/30">
              <span>Notre Histoire & Savoir-Faire</span>
            </div>
            <h2 className="text-3xl sm:text-4xl text-white font-extrabold tracking-tight mb-4">
              Quand la haute boulangerie rencontre le vrai smash brut
            </h2>
            <p className="text-base text-[#B8AFA3] leading-relaxed mb-4">
              Installé au 6 Boulevard Saïd Hamdine, au sein même de la célèbre boulangerie-pâtisserie{' '}
              <strong className="text-white">Brioch'art Hydra</strong>, Smash'art est né d'une
              passion commune pour le goût authentique.
            </p>
            <p className="text-sm text-[#B8AFA3] leading-relaxed mb-6">
              Pas de burgers standard décongelés : ici, chaque bun est pétri chaque matin avec du pur
              beurre de ferme, toasté minute sur plancha puis garni de bœuf frais d'exception pressé
              à haute température pour développer cette dentelle ultra-croustillante que tout le
              quartier s'arrache.
            </p>
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="p-4 rounded-xl bg-[#141417] border border-[#2a2622]">
                <div className="font-display text-3xl text-[#E63B2E]">+260°C</div>
                <div className="font-headline uppercase text-sm text-white mt-1 font-bold">
                  Fonte ardente
                </div>
                <div className="text-xs text-[#B8AFA3]">Caramélisation et croûte dentelée</div>
              </div>
              <div className="p-4 rounded-xl bg-[#141417] border border-[#2a2622]">
                <div className="font-display text-3xl text-[#F5B82E]">0 Surgelé</div>
                <div className="font-headline uppercase text-sm text-white mt-1 font-bold">
                  Viande fraîche locale
                </div>
                <div className="text-xs text-[#B8AFA3]">Approvisionnement bœuf d'Algérie</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
