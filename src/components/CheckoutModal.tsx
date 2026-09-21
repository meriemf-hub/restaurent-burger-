import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Product, RestaurantSettings } from '../types';
import { createOrder } from '../services/firestoreService';

interface CheckoutModalProps {
  products: Product[];
  settings: RestaurantSettings;
  onOrderPlaced: (orderId: string) => void;
}

const ALGIERS_COMMUNES = [
  'Hydra (Zone Restaurant)',
  'Sidi Yahia / Paradou',
  'El Biar',
  'Ben Aknoun',
  'Val d’Hydra',
  'Kouba / Jolie Vue',
  'Bir Mourad Raïs',
  'Dely Ibrahim',
  'Alger-Centre',
  'El Mouradia',
  'Belouizdad / Mohamed Belouizdad',
  'Cheraga',
  'Autre commune Grand Alger',
];

export function CheckoutModal({
  products,
  settings,
  onOrderPlaced,
}: CheckoutModalProps) {
  const {
    items,
    isCheckoutOpen,
    closeCheckout,
    clearCart,
    subtotal,
    showToast,
  } = useCart();
  const { currentUser, userProfile, signInAsGuest } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [commune, setCommune] = useState(ALGIERS_COMMUNES[0]);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-fill user profile info if logged in
  useEffect(() => {
    if (userProfile) {
      if (userProfile.name && !name) setName(userProfile.name);
      if (userProfile.phone && !phone) setPhone(userProfile.phone);
    }
  }, [userProfile]);

  if (!isCheckoutOpen) return null;

  const deliveryFee = settings.deliveryFee || 200;
  const total = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Veuillez indiquer votre nom complet.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setErrorMessage('Veuillez renseigner un numéro de téléphone valide pour la livraison.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Veuillez renseigner votre adresse exacte de livraison à Alger.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('Votre panier est vide.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure customer has auth uid (guest or signed-in)
      let customerUid = currentUser?.uid;
      let idToken: string | undefined = undefined;
      if (currentUser) {
        try {
          idToken = await currentUser.getIdToken();
        } catch {}
      } else {
        try {
          const guestUser = await signInAsGuest();
          customerUid = guestUser.uid;
          idToken = await guestUser.getIdToken();
        } catch (authErr) {
          customerUid = localStorage.getItem('smashart_guest_uid') || `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
          localStorage.setItem('smashart_guest_uid', customerUid);
        }
      }

      const orderPayload = {
        customerId: customerUid,
        nomClient: name.trim(),
        telephone: phone.trim(),
        adresse: address.trim(),
        commune,
        notes: notes.trim(),
        items: items.map((item) => ({
          productId: item.product.id,
          quantite: item.quantity,
          isCombo: item.isCombo,
          comboDrink: item.comboDrink,
        })),
      };

      // Server-authoritative order creation via trusted backend API
      const { id } = await createOrder(orderPayload, undefined, undefined, idToken);

      clearCart();
      closeCheckout();
      showToast('Commande transmise avec succès aux fourneaux de Hydra !');
      onOrderPlaced(id);
    } catch (err: any) {
      console.error('Failed to submit order:', err);
      setErrorMessage(
        err?.message || 'Une erreur est survenue lors de la création de votre commande.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#141417] border border-[#2a2622] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#101013] border-b border-[#2a2622] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E63B2E] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">moped</span>
            </div>
            <div>
              <h3 className="font-headline uppercase text-lg text-white font-bold">
                Finaliser Votre Commande
              </h3>
              <p className="text-xs text-[#B8AFA3]">
                Paiement en espèces à la livraison · Livré depuis Hydra
              </p>
            </div>
          </div>
          <button
            onClick={closeCheckout}
            className="w-8 h-8 rounded-lg bg-[#1a1a1e] text-[#B8AFA3] hover:text-white flex items-center justify-center border border-[#2a2622] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmitOrder} className="overflow-y-auto p-6 space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-[#3d1310] border border-[#E63B2E]/50 text-[#ff8c82] text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Customer Coordinates */}
          <div className="space-y-4">
            <h4 className="font-headline uppercase text-xs tracking-wider text-[#F5B82E] font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">person</span>
              Vos Coordonnées de Livraison
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                  Nom & Prénom <span className="text-[#E63B2E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Karim Benali"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6A635B] focus:outline-none focus:border-[#F5B82E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                  Numéro de téléphone <span className="text-[#E63B2E]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex : 0550 12 34 56"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6A635B] focus:outline-none focus:border-[#F5B82E]"
                />
                <span className="text-[10px] text-[#B8AFA3] mt-0.5 block">
                  Le livreur vous appellera à son arrivée.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                  Commune / Quartier <span className="text-[#E63B2E]">*</span>
                </label>
                <select
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F5B82E]"
                >
                  {ALGIERS_COMMUNES.map((c) => (
                    <option key={c} value={c} className="bg-[#141417] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                  Adresse exacte & Repère <span className="text-[#E63B2E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rue, Bâtiment, Étage, Numéro de porte..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6A635B] focus:outline-none focus:border-[#F5B82E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                Remarques pour la cuisine ou le livreur (optionnel)
              </label>
              <textarea
                rows={2}
                placeholder="Ex : Appeler en arrivant au portail noir, prévoir la monnaie sur 2000 DA..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#6A635B] focus:outline-none focus:border-[#F5B82E] resize-none"
              />
            </div>
          </div>

          {/* Payment Method - Cash On Delivery Badge */}
          <div className="p-4 rounded-xl bg-[#2a2211] border border-[#F5B82E]/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#F5B82E] text-[22px]">
                  payments
                </span>
                <span className="font-headline uppercase text-sm font-bold text-white">
                  Mode de règlement : Paiement en espèces à la livraison
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#F5B82E] text-[#141417] text-[10px] font-black uppercase">
                100% Cash
              </span>
            </div>
            <p className="text-xs text-[#B8AFA3] leading-relaxed">
              Aucun prépaiement par carte bancaire. Vous remettez le montant exact en espèces en Dinars
              Algériens (DA) directement au coursier à réception de votre repas chaud.
            </p>
          </div>

          {/* Order Summary Recap */}
          <div className="p-4 rounded-xl bg-[#101013] border border-[#2a2622] space-y-2.5">
            <div className="font-headline uppercase text-xs tracking-wider text-[#B8AFA3] font-bold">
              Récapitulatif de la commande ({items.length} article{items.length > 1 ? 's' : ''})
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 divide-y divide-[#2a2622]/50 pr-1">
              {items.map((item) => (
                <div key={item.id} className="pt-1.5 flex justify-between text-xs">
                  <div className="text-white truncate max-w-[75%]">
                    <span className="text-[#F5B82E] font-bold mr-1.5">{item.quantity}x</span>
                    <span>{item.product.name}</span>
                    {item.isCombo && (
                      <span className="text-[10px] text-[#B8AFA3] block pl-5">
                        Formule Menu (Frites + {item.comboDrink})
                      </span>
                    )}
                  </div>
                  <span className="font-display text-white shrink-0">
                    {item.subtotal.toLocaleString('fr-DZ')} DA
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#2a2622] space-y-1 text-xs">
              <div className="flex justify-between text-[#B8AFA3]">
                <span>Sous-total articles</span>
                <span className="text-white">{subtotal.toLocaleString('fr-DZ')} DA</span>
              </div>
              <div className="flex justify-between text-[#B8AFA3]">
                <span>Frais de livraison</span>
                <span className="text-white">{deliveryFee.toLocaleString('fr-DZ')} DA</span>
              </div>
              <div className="pt-2 border-t border-[#2a2622] flex justify-between text-sm">
                <span className="font-headline uppercase font-bold text-white">
                  Total en espèces à la porte
                </span>
                <span className="font-display text-xl text-[#F5B82E] font-bold">
                  {total.toLocaleString('fr-DZ')} DA
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={closeCheckout}
              disabled={isSubmitting}
              className="px-4 py-3 rounded-xl bg-[#1a1a1e] text-[#B8AFA3] hover:text-white border border-[#2a2622] text-xs font-semibold cursor-pointer"
            >
              Modifier mon panier
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              id="confirm-order-btn"
              className="flex-1 h-12 rounded-xl bg-[#E63B2E] hover:bg-[#c92e22] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#E63B2E]/30 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">
                    progress_activity
                  </span>
                  <span>Validation de la commande...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span>Confirmer la commande ({total.toLocaleString('fr-DZ')} DA)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
