import { Category } from '../types';

interface CategoryNavProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function CategoryNav({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryNavProps) {
  const getCategoryIcon = (cat: Category) => {
    if (cat.iconName) return cat.iconName;
    const lower = cat.name.toLowerCase();
    if (lower.includes('beef') || lower.includes('burger')) return 'lunch_dining';
    if (lower.includes('chicken') || lower.includes('poulet')) return 'kebab_dining';
    if (lower.includes('frite') || lower.includes('side')) return 'cookie';
    if (lower.includes('sauce')) return 'soup_kitchen';
    if (lower.includes('boisson') || lower.includes('drink')) return 'local_drink';
    return 'restaurant';
  };

  return (
    <section className="w-full py-8 bg-[#101013] border-b border-[#2a2622]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm text-[#F5B82E] font-bold flex items-center gap-1.5 tracking-normal">
              <span className="material-symbols-outlined text-[16px]">restaurant_menu</span>
              La Carte Smash'art
            </h2>
            {selectedCategoryId && (
              <button
                onClick={() => onSelectCategory(null)}
                className="text-xs text-[#B8AFA3] hover:text-[#E63B2E] underline ml-2 cursor-pointer"
              >
                (Afficher tout)
              </button>
            )}
          </div>
          <span className="text-xs text-[#B8AFA3] font-medium hidden sm:inline">
            Viande 100% fraîche locale
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? null : cat.id)}
                className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center group cursor-pointer ${
                  isSelected
                    ? 'bg-[#1a1a1e] border-[#F5B82E] shadow-lg shadow-[#F5B82E]/10'
                    : 'bg-[#141417] hover:bg-[#1a1a1e] border-[#2a2622] hover:border-[#F5B82E]/60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${
                    cat.id === 'cat_chicken'
                      ? 'bg-[#2a2211] text-[#F5B82E]'
                      : cat.id === 'cat_beef' || cat.id === 'cat_sauces'
                      ? 'bg-[#2b1816] text-[#E63B2E]'
                      : 'bg-[#1a1a1e] text-[#F5B82E]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {getCategoryIcon(cat)}
                  </span>
                </div>
                <span className="font-headline uppercase text-sm tracking-wide text-white">
                  {cat.name}
                </span>
                <span className="text-xs text-[#B8AFA3] mt-0.5 line-clamp-1">
                  {cat.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
