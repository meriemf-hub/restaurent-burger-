import { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus, RestaurantSettings } from '../../types';
import {
  updateOrderStatus,
  toggleRestaurantOpenStatus,
} from '../../services/firestoreService';
import { kitchenSound } from '../../utils/audioAlert';

interface AdminOrdersTabProps {
  orders: Order[];
  settings?: RestaurantSettings;
  onShowToast: (msg: string) => void;
}

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'Toutes' },
  { key: 'new', label: 'Nouvelles' },
  { key: 'preparing', label: 'En préparation' },
  { key: 'ready', label: 'Prêtes' },
  { key: 'out_for_delivery', label: 'En livraison' },
  { key: 'delivered', label: 'Livrées' },
  { key: 'cancelled', label: 'Refusées / Annulées' },
];

export function AdminOrdersTab({
  orders,
  settings,
  onShowToast,
}: AdminOrdersTabProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Kitchen Service & Wake Lock State
  const [isServiceActive, setIsServiceActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [wakeLockSupported, setWakeLockSupported] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = useRef<any>(null);

  // Check Wake Lock support
  useEffect(() => {
    if ('wakeLock' in navigator) {
      setWakeLockSupported(true);
    }
  }, []);

  // Compute orders needing action (status "Nouvelle" or "new")
  const newOrders = orders.filter(
    (o) => o.statut === 'Nouvelle' || o.statut === 'new' || o.status === 'new'
  );

  // Control repeating ringtone based on service activation & pending new orders
  useEffect(() => {
    if (isServiceActive && !isMuted && newOrders.length > 0) {
      kitchenSound.startRinging();
    } else {
      kitchenSound.stopRinging();
    }
  }, [isServiceActive, isMuted, newOrders.length]);

  // Handle Screen Wake Lock request
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        setWakeLockActive(true);
        wakeLockRef.current.addEventListener('release', () => {
          setWakeLockActive(false);
        });
      } catch (err: any) {
        console.warn('Wake Lock request failed:', err.message);
        setWakeLockActive(false);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
      setWakeLockActive(false);
    }
  };

  // Re-acquire Wake Lock when page regains visibility if service is active
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (isServiceActive && document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
      kitchenSound.stopRinging();
    };
  }, [isServiceActive]);

  // Start Kitchen Service
  const handleStartService = async () => {
    kitchenSound.init();
    await requestWakeLock();
    setIsServiceActive(true);
    kitchenSound.playKitchenBell();
    onShowToast('Service cuisine démarré ! Sonnerie active et écran maintenu allumé.');
  };

  // Stop Kitchen Service
  const handleStopService = () => {
    releaseWakeLock();
    kitchenSound.stopRinging();
    setIsServiceActive(false);
    onShowToast('Service cuisine arrêté.');
  };

  const handleToggleMute = () => {
    const muted = kitchenSound.toggleMute();
    setIsMuted(muted);
    onShowToast(muted ? 'Sonnerie coupée.' : 'Sonnerie réactivée.');
  };

  // Status updates
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      onShowToast(`Commande mise à jour : ${newStatus}`);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Erreur lors de la mise à jour du statut.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Open/Close Restaurant Toggle
  const handleToggleRestaurantOpen = async () => {
    const currentStatus = settings?.isOpen !== false;
    const nextStatus = !currentStatus;
    try {
      await toggleRestaurantOpenStatus(nextStatus);
      onShowToast(
        nextStatus
          ? 'Le restaurant est maintenant OUVERT aux commandes !'
          : 'Le restaurant est maintenant noté FERMÉ.'
      );
    } catch (err) {
      console.error('Error toggling restaurant open state:', err);
      alert('Erreur lors de la modification des horaires.');
    }
  };

  // Order filtering
  const filteredOrders = orders.filter((ord) => {
    const s = (ord.statut || ord.status || '').toLowerCase();
    let matchesFilter = true;

    if (activeFilter === 'new') {
      matchesFilter = s === 'nouvelle' || s === 'new';
    } else if (activeFilter === 'preparing') {
      matchesFilter = s === 'en préparation' || s === 'preparing' || s === 'confirmed';
    } else if (activeFilter === 'ready') {
      matchesFilter = s === 'prête' || s === 'ready';
    } else if (activeFilter === 'out_for_delivery') {
      matchesFilter = s === 'en livraison' || s === 'out_for_delivery';
    } else if (activeFilter === 'delivered') {
      matchesFilter = s === 'livrée' || s === 'delivered';
    } else if (activeFilter === 'cancelled') {
      matchesFilter = s === 'refusée' || s === 'cancelled';
    }

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (ord.numeroCommande && ord.numeroCommande.toLowerCase().includes(q)) ||
      ord.id.toLowerCase().includes(q) ||
      (ord.nomClient && ord.nomClient.toLowerCase().includes(q)) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
      (ord.telephone && ord.telephone.toLowerCase().includes(q)) ||
      (ord.customerPhone && ord.customerPhone.toLowerCase().includes(q)) ||
      (ord.adresse && ord.adresse.toLowerCase().includes(q)) ||
      (ord.commune && ord.commune.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (statut: OrderStatus) => {
    const s = (statut || '').toLowerCase();
    if (s === 'nouvelle' || s === 'new') {
      return (
        <span className="px-3 py-1 rounded-full bg-[#E63B2E] text-white text-xs font-black uppercase tracking-wider animate-pulse flex items-center gap-1.5 shadow-md shadow-[#E63B2E]/30">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          Nouvelle
        </span>
      );
    }
    if (s === 'en préparation' || s === 'preparing' || s === 'confirmed') {
      return (
        <span className="px-3 py-1 rounded-full bg-[#3d2110] border border-[#ff8c42]/60 text-[#ff8c42] text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
          En préparation
        </span>
      );
    }
    if (s === 'prête' || s === 'ready') {
      return (
        <span className="px-3 py-1 rounded-full bg-[#2a2211] border border-[#F5B82E]/60 text-[#F5B82E] text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">done</span>
          Prête au comptoir
        </span>
      );
    }
    if (s === 'en livraison' || s === 'out_for_delivery') {
      return (
        <span className="px-3 py-1 rounded-full bg-[#1b2b3a] border border-[#4ea8de]/60 text-[#4ea8de] text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">moped</span>
          En livraison
        </span>
      );
    }
    if (s === 'livrée' || s === 'delivered') {
      return (
        <span className="px-3 py-1 rounded-full bg-[#142d1f] border border-[#2ecc71]/60 text-[#2ecc71] text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">task_alt</span>
          Livrée & Encaissée
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full bg-[#2a2622] text-[#B8AFA3] text-xs font-bold uppercase tracking-wider">
        Refusée / Annulée
      </span>
    );
  };

  const isRestaurantOpen = settings?.isOpen !== false;

  return (
    <div className="space-y-6">
      {/* Top Controls: Démarrer le service & Ouvrir/Fermer Restaurant */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141417] border border-[#2a2622] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Service Control */}
        <div className="flex items-center gap-3">
          {!isServiceActive ? (
            <button
              id="btn-start-service"
              onClick={handleStartService}
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-[#E63B2E] to-[#c92e22] hover:from-[#c92e22] hover:to-[#a72318] text-white font-extrabold text-sm uppercase tracking-wide flex items-center gap-2.5 shadow-xl shadow-[#E63B2E]/30 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <span className="material-symbols-outlined text-[24px]">notifications_active</span>
              <span>Démarrer le service</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="h-12 px-4 rounded-xl bg-[#142d1f] border border-[#2ecc71]/50 text-[#2ecc71] flex items-center gap-2 text-xs font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2ecc71] animate-ping"></span>
                <span>Service actif · Sonnerie & Écran allumé</span>
                {wakeLockActive && (
                  <span className="text-[10px] bg-[#2ecc71]/20 px-1.5 py-0.5 rounded text-[#2ecc71]">
                    WakeLock OK
                  </span>
                )}
              </div>

              <button
                onClick={handleToggleMute}
                className={`h-12 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isMuted
                    ? 'bg-[#3d1310] border-[#E63B2E]/50 text-[#ff8c82]'
                    : 'bg-[#1a1a1e] border-[#2a2622] text-[#B8AFA3] hover:text-white'
                }`}
                title={isMuted ? 'Réactiver la sonnerie' : 'Couper la sonnerie'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isMuted ? 'volume_off' : 'volume_up'}
                </span>
                <span>{isMuted ? 'Son coupé' : 'Son activé'}</span>
              </button>

              <button
                onClick={handleStopService}
                className="h-12 px-3.5 rounded-xl bg-[#1a1a1e] hover:bg-[#222227] border border-[#2a2622] text-[#B8AFA3] hover:text-white text-xs font-semibold cursor-pointer"
              >
                Arrêter le service
              </button>
            </div>
          )}

          {/* New Orders Sound Indicator */}
          {newOrders.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#E63B2E]/20 border border-[#E63B2E]/40 text-[#ff8c82] text-xs font-black animate-pulse">
              <span className="material-symbols-outlined text-[18px]">ring_volume</span>
              <span>
                {newOrders.length} {newOrders.length > 1 ? 'commandes en attente !' : 'nouvelle commande !'}
              </span>
            </div>
          )}
        </div>

        {/* Open / Closed Restaurant Button */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-[#B8AFA3] block uppercase tracking-wider font-bold">
              Statut du restaurant
            </span>
            <span
              className={`text-xs font-extrabold uppercase ${
                isRestaurantOpen ? 'text-[#2ecc71]' : 'text-[#F5B82E]'
              }`}
            >
              {isRestaurantOpen ? 'Ouvert aux commandes' : 'Fermé actuellement'}
            </span>
          </div>

          <button
            id="btn-toggle-open"
            onClick={handleToggleRestaurantOpen}
            className={`h-11 px-4 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer ${
              isRestaurantOpen
                ? 'bg-[#142d1f] hover:bg-[#1a3827] text-[#2ecc71] border-[#2ecc71]/40 shadow-md shadow-[#2ecc71]/15'
                : 'bg-[#2a2211] hover:bg-[#3d3118] text-[#F5B82E] border-[#F5B82E]/40 shadow-md shadow-[#F5B82E]/15'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isRestaurantOpen ? 'lock_open' : 'lock'}
            </span>
            <span>{isRestaurantOpen ? 'Passer en FERMÉ' : 'Passer en OUVERT'}</span>
          </button>
        </div>
      </div>

      {/* Filters and search header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((filter) => {
            let count = 0;
            if (filter.key === 'all') count = orders.length;
            else if (filter.key === 'new') {
              count = orders.filter((o) => (o.statut || o.status) === 'Nouvelle' || (o.statut || o.status) === 'new').length;
            } else if (filter.key === 'preparing') {
              count = orders.filter((o) => ['en préparation', 'preparing', 'confirmed'].includes((o.statut || o.status || '').toLowerCase())).length;
            } else if (filter.key === 'ready') {
              count = orders.filter((o) => ['prête', 'ready'].includes((o.statut || o.status || '').toLowerCase())).length;
            } else if (filter.key === 'out_for_delivery') {
              count = orders.filter((o) => ['en livraison', 'out_for_delivery'].includes((o.statut || o.status || '').toLowerCase())).length;
            } else if (filter.key === 'delivered') {
              count = orders.filter((o) => ['livrée', 'delivered'].includes((o.statut || o.status || '').toLowerCase())).length;
            } else if (filter.key === 'cancelled') {
              count = orders.filter((o) => ['refusée', 'cancelled'].includes((o.statut || o.status || '').toLowerCase())).length;
            }

            const isActive = activeFilter === filter.key;

            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#E63B2E] text-white shadow-md shadow-[#E63B2E]/25'
                    : 'bg-[#141417] text-[#B8AFA3] border border-[#2a2622] hover:text-white'
                }`}
              >
                <span>{filter.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-black/30 text-white' : 'bg-[#1a1a1e] text-[#F5B82E]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#B8AFA3]">
            search
          </span>
          <input
            type="text"
            placeholder="Rechercher réf, nom, tél, adresse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 bg-[#141417] border border-[#2a2622] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#6A635B] focus:outline-none focus:border-[#F5B82E]"
          />
        </div>
      </div>

      {/* Orders Grid - Live Cards */}
      {filteredOrders.length === 0 ? (
        <div className="p-16 text-center text-[#B8AFA3] bg-[#141417] border border-[#2a2622] rounded-2xl">
          <span className="material-symbols-outlined text-5xl mb-3 text-[#6A635B]">
            receipt_long
          </span>
          <p className="text-base font-bold text-white">Aucune commande trouvée</p>
          <p className="text-xs mt-1 text-[#6A635B]">
            Les nouvelles commandes passées sur le site apparaîtront ici instantanément en temps réel (onSnapshot).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((ord) => {
            const rawStatus = (ord.statut || ord.status || 'Nouvelle');
            const statusKey = rawStatus.toLowerCase();
            const isNew = statusKey === 'nouvelle' || statusKey === 'new';
            const isPreparing = statusKey === 'en préparation' || statusKey === 'preparing' || statusKey === 'confirmed';
            const isReady = statusKey === 'prête' || statusKey === 'ready';
            const isOutForDelivery = statusKey === 'en livraison' || statusKey === 'out_for_delivery';
            const isDelivered = statusKey === 'livrée' || statusKey === 'delivered';
            const isCancelled = statusKey === 'refusée' || statusKey === 'cancelled';

            const refNum = ord.numeroCommande || `#${ord.id.slice(0, 8).toUpperCase()}`;
            const clientName = ord.nomClient || ord.customerName || 'Client';
            const clientPhone = ord.telephone || ord.customerPhone || '';
            const clientAddress = ord.adresse || ord.deliveryAddress || '';
            const clientCommune = ord.commune || 'Hydra';

            const timeStr = new Date(ord.createdAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={ord.id}
                id={`order-card-${ord.id}`}
                className={`rounded-2xl bg-[#141417] border transition-all flex flex-col justify-between overflow-hidden shadow-xl ${
                  isNew
                    ? 'border-[#E63B2E] ring-2 ring-[#E63B2E]/30 bg-gradient-to-b from-[#1c1212] to-[#141417]'
                    : isPreparing
                    ? 'border-[#ff8c42]/50'
                    : isReady
                    ? 'border-[#F5B82E]/50'
                    : isOutForDelivery
                    ? 'border-[#4ea8de]/50'
                    : 'border-[#2a2622]'
                }`}
              >
                {/* Card Top: Ref, Time, Status */}
                <div className="p-4 border-b border-[#2a2622] flex items-center justify-between gap-2 bg-[#101013]/60">
                  <div>
                    <span className="font-mono text-sm font-black text-[#F5B82E] block">
                      {refNum}
                    </span>
                    <span className="text-[11px] text-[#B8AFA3] flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[13px]">schedule</span>
                      {timeStr}
                    </span>
                  </div>
                  <div>{getStatusBadge(rawStatus)}</div>
                </div>

                {/* Card Body: Customer details */}
                <div className="p-4 space-y-3 flex-1">
                  <div className="p-3 rounded-xl bg-[#1a1a1e] border border-[#2a2622] space-y-2 text-xs">
                    {/* Customer name & Phone button */}
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-sm">{clientName}</span>
                      {clientPhone && (
                        <a
                          href={`tel:${clientPhone}`}
                          className="px-2.5 py-1 rounded-lg bg-[#2a2211] hover:bg-[#3d3118] text-[#F5B82E] border border-[#F5B82E]/40 font-bold flex items-center gap-1 text-[11px] transition-colors"
                          title="Appeler le client"
                        >
                          <span className="material-symbols-outlined text-[14px]">call</span>
                          <span>{clientPhone}</span>
                        </a>
                      )}
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-1.5 text-[#B8AFA3]">
                      <span className="material-symbols-outlined text-[16px] text-[#E63B2E] shrink-0 mt-0.5">
                        location_on
                      </span>
                      <span className="text-white text-xs leading-snug">
                        {clientAddress}, <span className="font-bold text-[#F5B82E]">{clientCommune}</span>
                      </span>
                    </div>

                    {/* Order Notes if present */}
                    {ord.notes && (
                      <div className="p-2 rounded bg-[#101013] border border-[#2a2622] text-[11px] text-[#F5EFE6] italic">
                        Note : {ord.notes}
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-headline uppercase font-bold text-[#B8AFA3] tracking-wider block">
                      Articles commandés ({ord.items.length})
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto divide-y divide-[#2a2622]/50 text-xs">
                      {ord.items.map((item, idx) => {
                        const itName = item.nom || item.productName || 'Burger';
                        const itQty = item.quantite || item.quantity || 1;
                        const itPrice = item.subtotal || (item.prix || item.price || 0) * itQty;

                        return (
                          <div key={idx} className="pt-1.5 first:pt-0 flex items-start justify-between">
                            <div className="min-w-0 pr-2">
                              <span className="font-black text-[#F5B82E] mr-1.5">{itQty}x</span>
                              <span className="text-white font-medium">{itName}</span>
                              {item.isCombo && (
                                <span className="text-[10px] text-[#B8AFA3] block pl-5">
                                  + Formule (Frites & {item.comboDrink || 'Boisson'})
                                </span>
                              )}
                            </div>
                            <span className="font-display text-[#F5EFE6] shrink-0 font-semibold">
                              {itPrice.toLocaleString('fr-DZ')} DA
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Total & Status Action Buttons */}
                <div className="p-4 border-t border-[#2a2622] bg-[#101013]/70 space-y-3">
                  {/* Total Cash display */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#B8AFA3] uppercase block font-bold">
                        Total espèces (avec livraison)
                      </span>
                      <span className="text-[11px] text-[#2ecc71] font-semibold">
                        Cash à la livraison
                      </span>
                    </div>
                    <span className="font-display text-2xl text-[#F5B82E] font-black">
                      {ord.total.toLocaleString('fr-DZ')} <span className="text-sm font-sans text-white">DA</span>
                    </span>
                  </div>

                  {/* Contextual Action Buttons */}
                  <div className="space-y-2 pt-1">
                    {/* Case 1: NEW ORDER -> Accepter (En préparation) OR Refuser */}
                    {isNew && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleStatusChange(ord.id, 'En préparation')}
                          disabled={updatingId === ord.id}
                          className="h-11 rounded-xl bg-[#2ecc71] hover:bg-[#27ae60] text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-lg shadow-[#2ecc71]/25 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          <span>Accepter</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(ord.id, 'Refusée')}
                          disabled={updatingId === ord.id}
                          className="h-11 rounded-xl bg-[#3d1310] hover:bg-[#521915] border border-[#E63B2E]/50 text-[#ff8c82] font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">cancel</span>
                          <span>Refuser</span>
                        </button>
                      </div>
                    )}

                    {/* Case 2: EN PRÉPARATION -> Prête */}
                    {isPreparing && (
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={() => handleStatusChange(ord.id, 'Prête')}
                          disabled={updatingId === ord.id}
                          className="h-11 rounded-xl bg-[#ff8c42] hover:bg-[#e07530] text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-lg shadow-[#ff8c42]/25 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">done_all</span>
                          <span>Marquer comme PRÊTE</span>
                        </button>
                      </div>
                    )}

                    {/* Case 3: PRÊTE -> En livraison */}
                    {isReady && (
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={() => handleStatusChange(ord.id, 'En livraison')}
                          disabled={updatingId === ord.id}
                          className="h-11 rounded-xl bg-[#4ea8de] hover:bg-[#3a93c7] text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-lg shadow-[#4ea8de]/25 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">moped</span>
                          <span>Confier au livreur (En livraison)</span>
                        </button>
                      </div>
                    )}

                    {/* Case 4: EN LIVRAISON -> Livrée */}
                    {isOutForDelivery && (
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={() => handleStatusChange(ord.id, 'Livrée')}
                          disabled={updatingId === ord.id}
                          className="h-11 rounded-xl bg-[#2ecc71] hover:bg-[#27ae60] text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-lg shadow-[#2ecc71]/25 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">task_alt</span>
                          <span>Marquer comme LIVRÉE & Encaissée</span>
                        </button>
                      </div>
                    )}

                    {/* Quick status selector dropdown for flexibility */}
                    <div className="flex items-center justify-between pt-1 text-[11px] text-[#B8AFA3]">
                      <span>Changer statut :</span>
                      <select
                        value={rawStatus}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                        className="bg-[#1a1a1e] border border-[#2a2622] text-xs text-white rounded-lg px-2 py-1 focus:outline-none focus:border-[#F5B82E]"
                      >
                        <option value="Nouvelle">Nouvelle</option>
                        <option value="En préparation">En préparation</option>
                        <option value="Prête">Prête</option>
                        <option value="En livraison">En livraison</option>
                        <option value="Livrée">Livrée</option>
                        <option value="Refusée">Refusée</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
