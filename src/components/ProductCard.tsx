import React from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const { addToCart } = useCart();

  const isAvailable = product.disponible ?? product.isAvailable ?? true;
  const nom = product.nom || product.name || 'Produit';
  const description = product.description || '';
  const prix = product.prix ?? product.price ?? 0;
  const photoUrl = product.photoUrl || product.image || '';
  const badge = product.badge;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    addToCart(product, 1);
  };

  const handleCardClick = () => {
    if (!isAvailable) return;
    if (onSelect) {
      onSelect(product);
    } else {
      addToCart(product, 1);
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={handleCardClick}
      className={`flex flex-col rounded-2xl bg-[#141417] overflow-hidden group transition-all duration-300 border ${
        !isAvailable
          ? 'opacity-60 grayscale border-[#2a2622] cursor-not-allowed pointer-events-none sm:pointer-events-auto'
          : 'border-[#2a2622] hover:border-[#F5B82E]/60 hover:shadow-xl hover:shadow-black/40 cursor-pointer'
      }`}
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] sm:h-52 bg-[#18181c] overflow-hidden">
        <img
          alt={nom}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isAvailable ? 'group-hover:scale-105' : ''
          }`}
          src={photoUrl}
          loading="lazy"
        />

        {/* Badge (e.g. Top Choix, Best-Seller) */}
        {badge && isAvailable && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider bg-[#E63B2E] text-white shadow-md">
            {badge}
          </span>
        )}

        {/* Indisponible Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-[#0c0c0e]/85 flex items-center justify-center p-3">
            <span className="px-3 py-1.5 rounded-lg bg-[#2d1210] border border-[#E63B2E]/60 text-[#ff8c82] font-black text-xs uppercase tracking-wider shadow-lg">
              Indisponible
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-5 flex flex-col flex-grow justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg text-white font-extrabold tracking-tight line-clamp-1 group-hover:text-[#F5B82E] transition-colors">
            {nom}
          </h3>
          <p className="text-[11px] sm:text-xs text-[#B8AFA3] leading-relaxed line-clamp-2 mt-1">
            {description}
          </p>
        </div>

        <div className="pt-2.5 border-t border-[#24211e] flex items-center justify-between gap-2">
          {/* Price in prominent Yellow */}
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8c8378] block">Prix</span>
            <div className="text-base sm:text-xl font-black text-[#F5B82E] tracking-tight whitespace-nowrap">
              {prix.toLocaleString('fr-DZ')} <span className="text-xs font-bold text-[#F5B82E]">DA</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            id={`btn-add-cart-${product.id}`}
            onClick={handleAdd}
            disabled={!isAvailable}
            className={`h-9 sm:h-10 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              isAvailable
                ? 'bg-[#E63B2E] hover:bg-[#c92e22] text-white shadow-md shadow-[#E63B2E]/20 active:scale-95'
                : 'bg-[#222126] text-[#716a62] cursor-not-allowed border border-[#333]'
            }`}
          >
            {isAvailable ? (
              <>
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">add_shopping_cart</span>
                <span className="hidden xs:inline sm:inline">Ajouter au panier</span>
                <span className="inline xs:hidden sm:hidden">Ajouter</span>
              </>
            ) : (
              <span>Indisponible</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
