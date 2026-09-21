export function MarqueeStrip() {
  const items = [
    "Smash'art Hydra",
    "Pur bœuf frais smashé",
    "Brioches Brioch'art dorées",
    "Croustillant & juteux",
    "Livraison Grand Alger",
    "Paiement en espèces à la livraison",
    "Smash'art Hydra",
    "Pur bœuf frais smashé",
    "Brioches Brioch'art dorées",
    "Croustillant & juteux",
    "Livraison Grand Alger",
    "Paiement en espèces à la livraison",
  ];

  return (
    <div className="w-full bg-[#E63B2E] overflow-hidden py-3 border-y border-[#ff5a4d]">
      <div className="animate-marquee whitespace-nowrap text-white font-bold text-sm tracking-wider uppercase flex items-center select-none">
        {items.map((item, idx) => (
          <span key={idx} className="flex items-center">
            <span className="mx-4">{item}</span>
            <span className="text-[#F5B82E]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
