export function ComboBanner() {
  return (
    <div className="mt-8 p-5 rounded-2xl bg-[#141417] border border-[#2a2622] flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#F5B82E] text-[#141417] flex items-center justify-center font-display text-2xl font-black shrink-0">
          +
        </div>
        <div>
          <div className="font-headline uppercase text-lg text-white font-bold">
            Formule Menu : Frites Croustillantes + Boisson
          </div>
          <p className="text-xs text-[#B8AFA3]">
            Ajoutez des frites dorées et une canette fraîche 24cl à n'importe quel burger de la carte.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-display text-3xl text-[#F5B82E]">
          300 <span className="text-sm font-sans font-bold">DA</span>
        </span>
        <span className="px-3 py-1 rounded bg-[#1a1a1e] border border-[#2a2622] text-xs text-[#B8AFA3] uppercase tracking-wider">
          Option au choix
        </span>
      </div>
    </div>
  );
}
