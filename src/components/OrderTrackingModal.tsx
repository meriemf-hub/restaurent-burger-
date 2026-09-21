import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { onCustomerOrdersSnapshot, normalizeOrder } from '../services/firestoreService';
import { Order, OrderStatus } from '../types';

interface OrderTrackingModalProps {
  initialOrderId?: string | null;
  onClose: () => void;
}

const STATUS_STEPS: Array<{ key: string; label: string; icon: string; desc: string }> = [
  {
    key: 'received',
    label: 'Reçue',
    icon: 'receipt',
    desc: 'Commande enregistrée par notre équipe',
  },
  {
    key: 'preparing',
    label: 'Sur le grill',
    icon: 'local_fire_department',
    desc: 'Bœuf smashé minute sur fonte ardente à +260°C',
  },
  {
    key: 'ready',
    label: 'Prête',
    icon: 'inventory_2',
    desc: 'Emballée avec soin dans nos boîtes thermo-isolantes',
  },
  {
    key: 'out_for_delivery',
    label: 'En livraison',
    icon: 'moped',
    desc: 'Le coursier est en route vers votre adresse',
  },
  {
    key: 'delivered',
    label: 'Livrée',
    icon: 'task_alt',
    desc: 'Bon appétit ! Paiement réglé en espèces',
  },
];

export function OrderTrackingModal({
  initialOrderId,
  onClose,
}: OrderTrackingModalProps) {
  const { currentUser } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialOrderId || null);
  const [singleOrder, setSingleOrder] = useState<Order | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  // Subscribe to customer's orders
  useEffect(() => {
    if (!currentUser) {
      return;
    }
    const unsub = onCustomerOrdersSnapshot(currentUser.uid, (orders) => {
      setCustomerOrders(orders);
      if (!selectedOrderId && orders.length > 0) {
        setSelectedOrderId(orders[0].id);
      }
    });
    return () => unsub();
  }, [currentUser]);

  // Subscribe to specific active order in real-time
  useEffect(() => {
    if (!selectedOrderId || !currentUser) {
      setSingleOrder(null);
      return;
    }
    const orderDocRef = doc(db, 'orders', selectedOrderId);
    const unsub = onSnapshot(
      orderDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSingleOrder(normalizeOrder(docSnap.id, docSnap.data()));
        }
      },
      (err) => {
        console.warn('Could not listen to order details:', err);
      }
    );
    return () => unsub();
  }, [selectedOrderId, currentUser]);

  const currentOrder = singleOrder || customerOrders.find((o) => o.id === selectedOrderId);

  const getStepIndex = (rawStatus?: OrderStatus) => {
    const s = (rawStatus || '').toLowerCase();
    if (s === 'refusée' || s === 'cancelled') return -1;
    if (s === 'nouvelle' || s === 'new') return 0;
    if (s === 'en préparation' || s === 'preparing' || s === 'confirmed') return 1;
    if (s === 'prête' || s === 'ready') return 2;
    if (s === 'en livraison' || s === 'out_for_delivery') return 3;
    if (s === 'livrée' || s === 'delivered') return 4;
    return 0;
  };

  const currentStatus = currentOrder?.statut || currentOrder?.status || 'Nouvelle';
  const isCancelled = (currentStatus || '').toLowerCase() === 'refusée' || (currentStatus || '').toLowerCase() === 'cancelled';
  const currentStepIndex = getStepIndex(currentStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#141417] border border-[#2a2622] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#101013] border-b border-[#2a2622] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E63B2E] text-white flex items-center justify-center shadow-md shadow-[#E63B2E]/25">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            </div>
            <div>
              <h3 className="font-headline uppercase text-lg text-white font-bold">
                Suivi de Commande en Direct
              </h3>
              <p className="text-xs text-[#B8AFA3]">
                Mise à jour en temps réel depuis les cuisines de Hydra
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a1a1e] text-[#B8AFA3] hover:text-white flex items-center justify-center border border-[#2a2622] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Order Selector (if multiple orders exist) */}
          {customerOrders.length > 1 && (
            <div>
              <label className="block text-xs font-semibold text-[#B8AFA3] mb-2">
                Sélectionner une commande :
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {customerOrders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => setSelectedOrderId(ord.id)}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-mono shrink-0 transition-colors cursor-pointer ${
                      selectedOrderId === ord.id
                        ? 'bg-[#E63B2E] text-white border-[#E63B2E]'
                        : 'bg-[#1a1a1e] text-[#B8AFA3] border-[#2a2622] hover:text-white'
                    }`}
                  >
                    {ord.numeroCommande || `#${ord.id.slice(0, 6).toUpperCase()}`} · {ord.total} DA
                  </button>
                ))}
              </div>
            </div>
          )}

          {!currentOrder ? (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-4xl text-[#B8AFA3] mb-2">
                receipt_long
              </span>
              <h4 className="text-base font-bold text-white mb-1">Aucune commande active trouvée</h4>
              <p className="text-xs text-[#B8AFA3] max-w-xs mx-auto">
                Lorsque vous passez commande, son état de préparation s'affiche ici instantanément.
              </p>
            </div>
          ) : (
            <>
              {/* Order Status Hero Banner */}
              <div className="p-4 rounded-xl bg-[#1a1a1e] border border-[#2a2622] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-[#F5B82E] font-bold">
                    COMMANDE {currentOrder.numeroCommande || `#${currentOrder.id.slice(0, 8).toUpperCase()}`}
                  </div>
                  <div className="font-headline uppercase text-lg text-white font-bold mt-0.5">
                    {isCancelled
                      ? 'Commande Refusée ou Annulée'
                      : STATUS_STEPS[currentStepIndex]?.label || currentStatus}
                  </div>
                  <div className="text-xs text-[#B8AFA3]">
                    {isCancelled
                      ? 'Cette commande ne peut être honorée actuellement.'
                      : STATUS_STEPS[currentStepIndex]?.desc}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#B8AFA3]">Total espèces :</div>
                  <div className="font-display text-xl text-[#F5B82E] font-black">
                    {currentOrder.total.toLocaleString('fr-DZ')} DA
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              {!isCancelled && (
                <div className="py-2">
                  <div className="relative">
                    {/* Line connecting steps */}
                    <div className="absolute top-5 left-6 right-6 h-0.5 bg-[#2a2622] -z-0">
                      <div
                        className="h-full bg-gradient-to-r from-[#E63B2E] via-[#ff8c42] to-[#F5B82E] transition-all duration-700"
                        style={{
                          width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                        }}
                      ></div>
                    </div>

                    <div className="relative z-10 grid grid-cols-5 gap-1 text-center">
                      {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;

                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                isCurrent
                                  ? 'bg-[#E63B2E] text-white ring-4 ring-[#E63B2E]/25 scale-110 shadow-lg shadow-[#E63B2E]/30'
                                  : isCompleted
                                  ? 'bg-[#2ecc71] text-white'
                                  : 'bg-[#1a1a1e] border border-[#2a2622] text-[#6A635B]'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {step.icon}
                              </span>
                            </div>
                            <span
                              className={`mt-2 text-[11px] font-headline uppercase font-bold truncate max-w-full ${
                                isCurrent
                                  ? 'text-[#F5B82E]'
                                  : isCompleted
                                  ? 'text-white'
                                  : 'text-[#6A635B]'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Info Box */}
              <div className="p-4 rounded-xl bg-[#101013] border border-[#2a2622] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#B8AFA3] block mb-0.5">Destinataire :</span>
                  <span className="text-white font-medium">
                    {currentOrder.nomClient || currentOrder.customerName} ({currentOrder.telephone || currentOrder.customerPhone})
                  </span>
                </div>
                <div>
                  <span className="text-[#B8AFA3] block mb-0.5">Adresse de livraison :</span>
                  <span className="text-white font-medium">
                    {currentOrder.adresse || currentOrder.deliveryAddress}, {currentOrder.commune}
                  </span>
                </div>
                {currentOrder.notes && (
                  <div className="sm:col-span-2 pt-1 border-t border-[#2a2622]/60">
                    <span className="text-[#B8AFA3] block mb-0.5">Note :</span>
                    <span className="text-[#F5EFE6] italic">{currentOrder.notes}</span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="font-headline uppercase text-xs tracking-wider text-[#B8AFA3] font-bold">
                  Articles commandés ({currentOrder.items.length})
                </div>
                <div className="divide-y divide-[#2a2622] bg-[#1a1a1e] rounded-xl border border-[#2a2622] p-3">
                  {currentOrder.items.map((item, idx) => {
                    const itName = item.nom || item.productName || 'Article';
                    const itQty = item.quantite || item.quantity || 1;
                    const itSubtotal = item.subtotal || ((item.prix || item.price || 0) * itQty);

                    return (
                      <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between text-xs">
                        <div>
                          <span className="text-[#F5B82E] font-bold mr-2">{itQty}x</span>
                          <span className="text-white font-medium">{itName}</span>
                          {item.isCombo && (
                            <span className="text-[11px] text-[#B8AFA3] block pl-6">
                              + Menu Frites & {item.comboDrink || 'Boisson'}
                            </span>
                          )}
                        </div>
                        <span className="font-display text-[#F5EFE6] font-semibold">
                          {itSubtotal.toLocaleString('fr-DZ')} DA
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Contact */}
        <div className="p-4 bg-[#101013] border-t border-[#2a2622] flex items-center justify-between text-xs">
          <span className="text-[#B8AFA3]">Besoin d'aide pour votre commande ?</span>
          <a
            href="tel:0556391034"
            className="flex items-center gap-1.5 text-[#F5B82E] font-bold hover:underline"
          >
            <span className="material-symbols-outlined text-[16px] text-[#E63B2E]">call</span>
            <span>Appeler le restaurant (0556 39 10 34)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
