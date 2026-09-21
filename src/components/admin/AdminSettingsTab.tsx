import { useState } from 'react';
import { RestaurantSettings } from '../../types';
import {
  updateRestaurantSettings,
  forceReseedDatabase,
} from '../../services/firestoreService';

interface AdminSettingsTabProps {
  settings: RestaurantSettings;
  onShowToast: (msg: string) => void;
}

export function AdminSettingsTab({
  settings,
  onShowToast,
}: AdminSettingsTabProps) {
  const [restaurantName, setRestaurantName] = useState(settings.restaurantName || "Smash'art @ Brioch'art");
  const [phone, setPhone] = useState(settings.phone || '0556 39 10 34');
  const [address, setAddress] = useState(
    settings.address || '6 Boulevard Saïd Hamdine, Hydra 16000, Alger'
  );
  const [deliveryFee, setDeliveryFee] = useState<number>(settings.deliveryFee || 200);
  const [openingHours, setOpeningHours] = useState(
    settings.openingHours || '11h30 - 00h00 (Ven: 16h00 - 01h00)'
  );
  const [isOpen, setIsOpen] = useState<boolean>(settings.isOpen !== false);
  const [announcement, setAnnouncement] = useState(
    settings.announcement || 'Fermé · Ouvre à 11h30'
  );
  const [saving, setSaving] = useState(false);
  const [reseeding, setReseeding] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateRestaurantSettings({
        restaurantName: restaurantName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        deliveryFee: Number(deliveryFee),
        openingHours: openingHours.trim(),
        isOpen,
        announcement: announcement.trim(),
      });
      onShowToast('Paramètres du restaurant mis à jour.');
    } catch (err) {
      console.error('Error updating settings:', err);
      alert('Erreur lors de la sauvegarde des paramètres.');
    } finally {
      setSaving(false);
    }
  };

  const handleForceReseed = async () => {
    if (
      confirm(
        'Voulez-vous recharger la carte et les produits par défaut de Smash’art Hydra dans Firestore ?'
      )
    ) {
      setReseeding(true);
      try {
        await forceReseedDatabase();
        onShowToast('Données et menu réinitialisés avec succès dans Firestore !');
      } catch (err) {
        console.error('Reseed error:', err);
        alert('Erreur lors de la réinitialisation.');
      } finally {
        setReseeding(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="font-headline uppercase text-xl text-white font-bold">
          Paramètres Généraux du Restaurant
        </h3>
        <p className="text-xs text-[#B8AFA3]">
          Configurez les coordonnées du comptoir Hydra, le tarif de livraison en Dinars et les
          horaires d'ouverture.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="p-6 rounded-2xl bg-[#141417] border border-[#2a2622] space-y-4">
          <h4 className="font-headline uppercase text-sm text-[#F5B82E] font-bold">
            Identité & Coordonnées
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                Nom de l'établissement
              </label>
              <input
                type="text"
                required
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F5B82E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                Numéro de téléphone
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F5B82E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
              Adresse physique à Alger
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F5B82E]"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#141417] border border-[#2a2622] space-y-4">
          <h4 className="font-headline uppercase text-sm text-[#F5B82E] font-bold">
            Livraison & Horaires
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                Frais de livraison forfaitaire (DA)
              </label>
              <input
                type="number"
                min={0}
                step={50}
                required
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F5B82E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                Horaires d'ouverture affichés
              </label>
              <input
                type="text"
                required
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F5B82E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
              Bannière d'alerte / annonce (ex: "Fermé · Ouvre à 11h30", "Ouvert non-stop")
            </label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F5B82E]"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)}
                className="rounded text-[#E63B2E] w-4 h-4"
              />
              <span className="text-sm font-semibold text-white">
                Restaurant actuellement ouvert pour prendre des commandes
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="h-12 px-8 rounded-xl bg-[#E63B2E] hover:bg-[#c92e22] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#E63B2E]/25 transition-all cursor-pointer"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </button>
        </div>
      </form>

      {/* Advanced Maintenance / Re-seed Card */}
      <div className="p-6 rounded-2xl bg-[#101013] border border-[#2a2622] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-headline uppercase text-sm text-[#ff8c82] font-bold">
            Maintenance & Données de Démonstration
          </h4>
          <p className="text-xs text-[#B8AFA3] mt-0.5">
            Recharger les recettes originales, images HD de burgers et catégories dans Firestore.
          </p>
        </div>
        <button
          type="button"
          onClick={handleForceReseed}
          disabled={reseeding}
          className="px-4 py-2.5 rounded-xl bg-[#1a1a1e] hover:bg-[#222227] border border-[#2a2622] text-xs font-semibold text-[#F5B82E] flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">sync</span>
          <span>{reseeding ? 'Rechargement...' : 'Réinitialiser le Menu'}</span>
        </button>
      </div>
    </div>
  );
}
