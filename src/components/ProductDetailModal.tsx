import { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

const DRINK_OPTIONS = [
  'Coca-Cola Original 24cl',
  'Sprite Citron-Lime 24cl',
  'Fanta Orange 24cl',
  'Eau Minérale Ifri 50cl',
];

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isCombo, setIsCombo] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState(DRINK_OPTIONS[0]);
  const [notes, setNotes] = useState('');

  const comboAddon = isCombo ? 300 : 0;
  const unitPrice = product.price + comboAddon;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    addToCart(product, quantity, isCombo, isCombo ? selectedDrink : undefined, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#141417] border border-[#2a2622] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-64 sm:h-72 w-full bg-[#18181c] shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141417] via-transparent to-black/40"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0c0c0e]/80 text-[#F5EFE6] hover:text-white flex items-center justify-center border border-[#2a2622] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          {/* Badge */}
          {product.badge && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-md bg-[#E63B2E] text-white text-xs font-bold shadow">
              {product.badge}
            </span>
          )}

          {/* Price overlay */}
          <div className="absolute bottom-3 right-4 bg-[#0c0c0e]/90 px-3.5 py-1.5 rounded-xl border border-[#F5B82E]/40 text-right">
            <span className="text-xs text-[#B8AFA3] block">Prix unitaire</span>
            <span className="font-display text-2xl text-[#F5B82E]">
              {unitPrice.toLocaleString('fr-DZ')} DA
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">{product.name}</h3>
            <p className="text-sm text-[#B8AFA3] leading-relaxed mt-2">
              {product.description}
            </p>
          </div>

          {/* Combo option (if allowed for burger/item) */}
          {product.comboAvailable !== false && (
            <div
              onClick={() => setIsCombo(!isCombo)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-3 ${
                isCombo
                  ? 'bg-[#2a2211] border-[#F5B82E] shadow-md shadow-[#F5B82E]/10'
                  : 'bg-[#1a1a1e] border-[#2a2622] hover:border-[#F5B82E]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${
                      isCombo
                        ? 'bg-[#E63B2E] border-[#E63B2E] text-white'
                        : 'border-[#2a2622] bg-[#141417]'
                    }`}
                  >
                    {isCombo && (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    )}
                  </div>
                  <div>
                    <div className="font-headline uppercase text-sm font-bold text-white">
                      + Formule Menu Frites & Boisson
                    </div>
                    <div className="text-xs text-[#B8AFA3]">
                      Frites dorées croustillantes + 1 canette fraîche au choix
                    </div>
                  </div>
                </div>
                <span className="font-display text-lg text-[#F5B82E]">+300 DA</span>
              </div>

              {isCombo && (
                <div
                  className="pt-3 border-t border-[#F5B82E]/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="block text-xs font-semibold text-[#B8AFA3] mb-1.5">
                    Choisissez votre boisson :
                  </label>
                  <select
                    value={selectedDrink}
                    onChange={(e) => setSelectedDrink(e.target.value)}
                    className="w-full bg-[#141417] border border-[#2a2622] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F5B82E]"
                  >
                    {DRINK_OPTIONS.map((drink) => (
                      <option key={drink} value={drink} className="bg-[#141417] text-white">
                        {drink}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#B8AFA3] mb-1.5">
              Instructions spéciales (optionnel) :
            </label>
            <input
              type="text"
              placeholder="Ex : Sans oignons, sauce à part..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6A635B] focus:outline-none focus:border-[#E63B2E]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#101013] border-t border-[#2a2622] flex items-center justify-between gap-4 shrink-0">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-[#1a1a1e] border border-[#2a2622] rounded-xl p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 rounded-lg bg-[#222227] text-white hover:bg-[#2b2b32] flex items-center justify-center cursor-pointer disabled:opacity-40"
              disabled={quantity <= 1}
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <span className="w-10 text-center font-display text-lg text-white font-bold">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 rounded-lg bg-[#222227] text-white hover:bg-[#2b2b32] flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAdd}
            id="modal-add-to-cart-btn"
            className="flex-1 h-12 rounded-xl bg-[#E63B2E] hover:bg-[#c92e22] text-white font-bold text-sm flex items-center justify-between px-5 transition-all shadow-lg shadow-[#E63B2E]/25 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              Ajouter
            </span>
            <span className="font-display text-base tracking-wide">
              {totalPrice.toLocaleString('fr-DZ')} DA
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
