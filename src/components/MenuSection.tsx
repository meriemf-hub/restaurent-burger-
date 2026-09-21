import { useState } from 'react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';

interface MenuSectionProps {
  products: Product[];
  categories: Category[];
  selectedCategoryId?: string | null;
  onSelectProduct?: (product: Product) => void;
  isLoading: boolean;
}

export function MenuSection({
  products,
  categories,
  onSelectProduct,
  isLoading,
}: MenuSectionProps) {
  const [activeTab, setActiveTab] = useState<string>('all');

  // Filter products by selected category
  const filteredProducts = activeTab === 'all'
    ? products
    : products.filter((p) => (p.categorieId || p.categoryId) === activeTab);

  return (
    <section className="w-full py-12 sm:py-16 bg-[#0c0c0e]" id="notre-menu">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63B2E]/15 border border-[#E63B2E]/30 text-[#E63B2E] text-xs font-black uppercase tracking-widest mb-3">
            <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
            <span>Artisanal & Cuit Minute</span>
          </div>
          <h2 className="text-3xl sm:text-5xl text-white font-black tracking-tight font-display uppercase">
            Notre Menu
          </h2>
          <p className="text-sm sm:text-base text-[#B8AFA3] mt-2 font-normal">
            Bœuf frais d'Algérie smashé à haute température sur fonte, poulet croustillant et frites fraîches maison.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2 pb-4 mb-8 sm:mb-12">
          <button
            id="tab-category-all"
            onClick={() => setActiveTab('all')}
            className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#E63B2E] text-white shadow-lg shadow-[#E63B2E]/25 scale-105'
                : 'bg-[#141417] text-[#B8AFA3] border border-[#2a2622] hover:text-white hover:border-[#F5B82E]/50'
            }`}
          >
            Tous ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter(
              (p) => (p.categorieId || p.categoryId) === cat.id
            ).length;
            const isCurrent = activeTab === cat.id;

            return (
              <button
                key={cat.id}
                id={`tab-category-${cat.id}`}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  isCurrent
                    ? 'bg-[#E63B2E] text-white shadow-lg shadow-[#E63B2E]/25 scale-105'
                    : 'bg-[#141417] text-[#B8AFA3] border border-[#2a2622] hover:text-white hover:border-[#F5B82E]/50'
                }`}
              >
                <span>{cat.nom || cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isCurrent ? 'bg-black/25 text-white' : 'bg-[#222126] text-[#8c8378]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading Skeletons: 2 cols on mobile, 3 on tablet, 4 on desktop */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-[#141417] border border-[#2a2622] animate-pulse overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] sm:h-52 bg-[#1b1b20]" />
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-5 bg-[#222128] rounded w-3/4" />
                    <div className="h-3 bg-[#1e1e24] rounded w-full" />
                    <div className="h-3 bg-[#1e1e24] rounded w-2/3" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-6 bg-[#222128] rounded w-16" />
                    <div className="h-9 bg-[#2a2122] rounded-xl w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Products Grid: 2 columns mobile, 3 tablet, 4 desktop */
          <div
            id="products-grid"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
