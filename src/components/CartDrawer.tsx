import { useCart } from '../context/CartContext';
import { RestaurantSettings } from '../types';

interface CartDrawerProps {
  settings: RestaurantSettings;
}

export function CartDrawer({ settings }: CartDrawerProps) {
  const {
    items,
    isCartOpen,
    closeCart,
    openCheckout,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
  } = useCart();

  if (!isCartOpen) return null;

  const deliveryFee = items.length > 0 ? settings.deliveryFee || 200 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs transition-opacity animate-fade-in">
      <div
        className="w-full max-w-md bg-[#141417] border-l border-[#2a2622] h-full flex flex-col shadow-2xl animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#2a2622] flex items-center justify-between bg-[#101013]">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#E63B2E] text-[22px]">
              shopping_bag
            </span>
            <h3 className="font-headline uppercase text-lg text-white font-bold tracking-wide">
              Votre Panier ({items.reduce((s, i) => s + i.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 rounded-lg bg-[#1a1a1e] text-[#B8AFA3] hover:text-white flex items-center justify-center border border-[#2a2622] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#1a1a1e] border border-[#2a2622] flex items-center justify-center text-[#B8AFA3] mb-4">
                <span className="material-symbols-outlined text-3xl">shopping_basket</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">Votre panier est vide</h4>
              <p className="text-xs text-[#B8AFA3] max-w-xs mb-6 leading-relaxed">
                Ajoutez de vrais smash burgers préparés minute sur plancha brûlante pour commencer
                votre commande.
              </p>
              <button
                onClick={closeCart}
                className="px-5 py-2.5 rounded-xl bg-[#E63B2E] text-white text-xs font-bold shadow-md shadow-[#E63B2E]/20 hover:bg-[#c92e22] cursor-pointer"
              >
                Explorer la carte
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#1a1a1e] border border-[#2a2622] flex gap-3 relative group"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-[#141417] overflow-hidden shrink-0 border border-[#2a2622]">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-sm text-white truncate">{item.product.name}</h5>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#B8AFA3] hover:text-[#E63B2E] p-0.5 cursor-pointer"
                      title="Supprimer"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>

                  {item.isCombo && (
                    <div className="text-[11px] text-[#F5B82E] font-medium mt-0.5">
                      + Menu Frites & {item.comboDrink || 'Boisson'}
                    </div>
                  )}

                  {item.notes && (
                    <div className="text-[11px] text-[#B8AFA3] italic line-clamp-1 mt-0.5">
                      Note : {item.notes}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    {/* Stepper */}
                    <div className="flex items-center bg-[#141417] border border-[#2a2622] rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded bg-[#222227] text-white hover:bg-[#2b2b32] flex items-center justify-center cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">remove</span>
                      </button>
                      <span className="w-7 text-center font-display text-sm text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded bg-[#222227] text-white hover:bg-[#2b2b32] flex items-center justify-center cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                      </button>
                    </div>

                    <span className="font-display text-sm text-[#F5B82E]">
                      {item.subtotal.toLocaleString('fr-DZ')} DA
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout button */}
        {items.length > 0 && (
          <div className="p-5 bg-[#101013] border-t border-[#2a2622] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#B8AFA3]">
                <span>Sous-total articles</span>
                <span className="font-medium text-white">{subtotal.toLocaleString('fr-DZ')} DA</span>
              </div>
              <div className="flex justify-between text-[#B8AFA3]">
                <span className="flex items-center gap-1">
                  <span>Livraison Hydra & Alger</span>
                  <span className="text-[10px] text-[#F5B82E]">(Tarif fixe)</span>
                </span>
                <span className="font-medium text-white">{deliveryFee.toLocaleString('fr-DZ')} DA</span>
              </div>
              <div className="pt-2 border-t border-[#2a2622] flex justify-between text-base">
                <span className="font-headline uppercase font-bold text-white">
                  Total à régler
                </span>
                <span className="font-display text-xl text-[#F5B82E] font-black">
                  {total.toLocaleString('fr-DZ')} DA
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#2a2211] border border-[#F5B82E]/30 flex items-center gap-2 text-xs text-[#F5B82E]">
              <span className="material-symbols-outlined text-[18px]">payments</span>
              <span>Paiement en espèces à la livraison (Dinars DA)</span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={clearCart}
                className="px-3 py-3 rounded-xl bg-[#1a1a1e] border border-[#2a2622] text-[#B8AFA3] hover:text-[#ff8c82] hover:border-[#E63B2E]/40 text-xs font-semibold cursor-pointer"
                title="Vider le panier"
              >
                Vider
              </button>
              <button
                onClick={openCheckout}
                id="drawer-checkout-btn"
                className="flex-1 h-12 rounded-xl bg-[#E63B2E] hover:bg-[#c92e22] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E63B2E]/25 cursor-pointer"
              >
                <span>Commander ({total.toLocaleString('fr-DZ')} DA)</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
