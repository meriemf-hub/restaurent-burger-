interface OrderConfirmationModalProps {
  orderId: string;
  onClose: () => void;
  onTrack: () => void;
}

export function OrderConfirmationModal({
  orderId,
  onClose,
  onTrack,
}: OrderConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md bg-[#141417] border border-[#2a2622] rounded-2xl p-6 text-center shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-full bg-[#1b3322] border-2 border-[#2ecc71] flex items-center justify-center mx-auto text-[#2ecc71] shadow-lg shadow-[#2ecc71]/20">
          <span className="material-symbols-outlined text-3xl">done_all</span>
        </div>

        <div>
          <span className="text-[#F5B82E] font-headline uppercase text-xs tracking-widest font-bold">
            Smash'art Hydra
          </span>
          <h3 className="font-display uppercase text-2xl sm:text-3xl text-white mt-1">
            Commande Reçue !
          </h3>
          <p className="text-xs text-[#B8AFA3] mt-2 leading-relaxed">
            Votre commande a été transmise aux fourneaux de Hydra. Nos cuisiniers préparent vos
            smash burgers minute sur fonte brûlante.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#1a1a1e] border border-[#2a2622] text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[#B8AFA3]">Numéro de commande :</span>
            <span className="font-mono text-[#F5B82E] font-bold">
              #{orderId.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B8AFA3]">Délai estimé :</span>
            <span className="text-white font-medium">30 - 45 min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B8AFA3]">Paiement :</span>
            <span className="text-[#F5B82E] font-bold">Espèces à la livraison</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={onTrack}
            className="w-full h-12 rounded-xl bg-[#E63B2E] hover:bg-[#c92e22] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#E63B2E]/25 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            <span>Suivre l'état de ma commande</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs text-[#B8AFA3] hover:text-white transition-colors cursor-pointer"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
