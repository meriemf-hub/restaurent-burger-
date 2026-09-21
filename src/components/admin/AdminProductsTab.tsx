import React, { useState, useRef } from 'react';
import { Product, Category } from '../../types';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  quickUpdateProductPrice,
  uploadProductPhoto,
} from '../../services/firestoreService';

interface AdminProductsTabProps {
  products: Product[];
  categories: Category[];
  onShowToast: (msg: string) => void;
}

export function AdminProductsTab({
  products,
  categories,
  onShowToast,
}: AdminProductsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [quickPriceVal, setQuickPriceVal] = useState<number>(0);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [prix, setPrix] = useState<number>(850);
  const [categorieId, setCategorieId] = useState(categories[0]?.id || 'cat_smash');
  const [photoUrl, setPhotoUrl] = useState('');
  const [badge, setBadge] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [ordre, setOrdre] = useState(1);

  const openAddModal = () => {
    setEditingProduct(null);
    setNom('');
    setDescription('');
    setPrix(850);
    setCategorieId(categories[0]?.id || 'cat_smash');
    setPhotoUrl(
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB0V9lUfyaLG-8MyjnT67Eb7ArxuIr8N325Vxz3ZselPzcIWP4dTm_YMEhZnqlI--CyqV9q6OIUX4FiJrMXNGKBmHEHPrH6cxEezzxvGCgd7nW_wGRsDVAz543QmfTsU0Q5Adw7OpO31K1SDif8rh8T-3n4KubM5QOihgiGy_bjdFPCb4MXZK3s6Lbb_MF9Dmr_A-dvcZyHpxLaakSlCnX0REdsyIGHZb_7VbeeIMDTGCzB7CmplLA-URrE-K5V5cwhj_M'
    );
    setBadge('');
    setDisponible(true);
    setOrdre(products.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setNom(p.nom || p.name || '');
    setDescription(p.description || '');
    setPrix(p.prix ?? p.price ?? 850);
    setCategorieId(p.categorieId || p.categoryId || categories[0]?.id || '');
    setPhotoUrl(p.photoUrl || p.image || '');
    setBadge(p.badge || '');
    setDisponible(p.disponible ?? p.isAvailable ?? true);
    setOrdre(p.ordre ?? p.order ?? 1);
    setIsModalOpen(true);
  };

  // Handle File Upload to Firebase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La photo ne doit pas dépasser 5 Mo.');
      return;
    }

    setUploadingImage(true);
    try {
      const downloadUrl = await uploadProductPhoto(file);
      setPhotoUrl(downloadUrl);
      onShowToast('Photo importée avec succès !');
    } catch (err: any) {
      console.error('Photo upload error:', err);
      alert('Erreur lors du téléversement de la photo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || prix <= 0) return;

    setSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          nom: nom.trim(),
          description: description.trim(),
          prix: Number(prix),
          categorieId,
          photoUrl: photoUrl.trim(),
          badge: badge.trim() || undefined,
          disponible,
          ordre: Number(ordre),
        });
        onShowToast(`Produit "${nom}" mis à jour avec succès.`);
      } else {
        await createProduct({
          nom: nom.trim(),
          description: description.trim(),
          prix: Number(prix),
          categorieId,
          photoUrl: photoUrl.trim(),
          badge: badge.trim() || undefined,
          disponible,
          ordre: Number(ordre),
        });
        onShowToast(`Nouveau produit "${nom}" ajouté au menu.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save product:', err);
      alert('Erreur lors de la sauvegarde du produit.');
    } finally {
      setSaving(false);
    }
  };

  // One-click availability toggle
  const handleToggleAvailability = async (p: Product) => {
    const currentVal = p.disponible ?? p.isAvailable ?? true;
    const newVal = !currentVal;
    try {
      await toggleProductAvailability(p.id, newVal);
      onShowToast(
        `"${p.nom || p.name}" est maintenant marqué comme ${newVal ? 'DISPONIBLE' : 'INDISPONIBLE'}.`
      );
    } catch (err) {
      console.error('Error toggling availability:', err);
      alert('Erreur lors du changement de disponibilité.');
    }
  };

  // Quick price update
  const handleStartQuickPrice = (p: Product) => {
    setEditingPriceId(p.id);
    setQuickPriceVal(p.prix ?? p.price ?? 0);
  };

  const handleSaveQuickPrice = async (productId: string) => {
    if (quickPriceVal <= 0) return;
    try {
      await quickUpdateProductPrice(productId, quickPriceVal);
      onShowToast(`Nouveau prix : ${quickPriceVal} DA enregistré.`);
      setEditingPriceId(null);
    } catch (err) {
      console.error('Error updating price:', err);
      alert('Erreur lors du changement de prix.');
    }
  };

  const handleDelete = async (p: Product) => {
    const nomProd = p.nom || p.name;
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement "${nomProd}" du menu ?`)) {
      try {
        await deleteProduct(p.id);
        onShowToast(`Produit "${nomProd}" supprimé.`);
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Erreur lors de la suppression.');
      }
    }
  };

  const filteredProducts = selectedCategoryFilter === 'all'
    ? products
    : products.filter((p) => (p.categorieId || p.categoryId) === selectedCategoryFilter);

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-headline uppercase text-xl text-white font-bold flex items-center gap-2">
            <span>Gestion de la Carte & des Produits</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E63B2E] text-white text-xs font-mono">
              {products.length}
            </span>
          </h3>
          <p className="text-xs text-[#B8AFA3] mt-0.5">
            Ajoutez, modifiez, supprimez vos plats. Uploadez des photos et gérez prix & disponibilités en 1 clic.
          </p>
        </div>

        <button
          id="btn-add-product"
          onClick={openAddModal}
          className="h-11 px-4 rounded-xl bg-[#E63B2E] hover:bg-[#c92e22] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#E63B2E]/25 cursor-pointer whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Ajouter un produit</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategoryFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedCategoryFilter === 'all'
              ? 'bg-[#E63B2E] text-white'
              : 'bg-[#141417] text-[#B8AFA3] border border-[#2a2622] hover:text-white'
          }`}
        >
          Toutes les catégories ({products.length})
        </button>
        {categories.map((cat) => {
          const count = products.filter((p) => (p.categorieId || p.categoryId) === cat.id).length;
          const isSelected = selectedCategoryFilter === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#E63B2E] text-white'
                  : 'bg-[#141417] text-[#B8AFA3] border border-[#2a2622] hover:text-white'
              }`}
            >
              <span>{cat.nom || cat.name}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((prod) => {
          const isAvailable = prod.disponible ?? prod.isAvailable ?? true;
          const prodName = prod.nom || prod.name || 'Produit';
          const prodPrice = prod.prix ?? prod.price ?? 0;
          const prodCat = categories.find((c) => c.id === (prod.categorieId || prod.categoryId))?.nom || 'Général';
          const isEditingPrice = editingPriceId === prod.id;

          return (
            <div
              key={prod.id}
              id={`admin-product-${prod.id}`}
              className={`p-4 rounded-2xl bg-[#141417] border transition-all flex flex-col justify-between gap-3 group ${
                isAvailable ? 'border-[#2a2622]' : 'border-[#4a1c18] bg-[#161214]'
              }`}
            >
              <div className="flex gap-3">
                {/* Photo with status tag */}
                <div className="w-20 h-20 rounded-xl bg-[#1a1a1e] overflow-hidden shrink-0 border border-[#2a2622] relative">
                  <img
                    src={prod.photoUrl || prod.image}
                    alt={prodName}
                    className={`w-full h-full object-cover ${!isAvailable ? 'grayscale opacity-60' : ''}`}
                  />
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-[9px] text-[#ff8c82] font-black uppercase text-center px-1">
                      Indisponible
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-[#1a1a1e] text-[10px] text-[#B8AFA3] font-semibold border border-[#2a2622]">
                      {prodCat}
                    </span>
                    {prod.badge && (
                      <span className="px-2 py-0.5 rounded bg-[#2b1816] text-[10px] text-[#E63B2E] font-bold border border-[#E63B2E]/30">
                        {prod.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm text-white truncate mt-1">{prodName}</h4>
                  <p className="text-xs text-[#B8AFA3] line-clamp-2 mt-0.5 leading-relaxed">
                    {prod.description}
                  </p>
                </div>
              </div>

              {/* Price & Quick Price Editor */}
              <div className="pt-3 border-t border-[#2a2622] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {isEditingPrice ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={50}
                        step={10}
                        value={quickPriceVal}
                        onChange={(e) => setQuickPriceVal(Number(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveQuickPrice(prod.id);
                          if (e.key === 'Escape') setEditingPriceId(null);
                        }}
                        autoFocus
                        className="w-20 bg-[#1e1e24] border border-[#F5B82E] rounded px-2 py-0.5 text-xs text-white font-bold"
                      />
                      <span className="text-[10px] text-[#F5B82E] font-bold">DA</span>
                      <button
                        onClick={() => handleSaveQuickPrice(prod.id)}
                        className="p-1 rounded bg-[#2ecc71] text-white hover:bg-[#27ae60] cursor-pointer"
                        title="Valider le nouveau prix"
                      >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      </button>
                      <button
                        onClick={() => setEditingPriceId(null)}
                        className="p-1 rounded bg-[#333] text-[#B8AFA3] hover:text-white cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => handleStartQuickPrice(prod)}
                      className="cursor-pointer group/price flex items-center gap-1.5"
                      title="Cliquer pour modifier le prix rapidement"
                    >
                      <span className="font-display text-lg text-[#F5B82E] font-black group-hover/price:underline">
                        {prodPrice.toLocaleString('fr-DZ')} DA
                      </span>
                      <span className="material-symbols-outlined text-[14px] text-[#6A635B] group-hover/price:text-[#F5B82E]">
                        edit
                      </span>
                    </div>
                  )}
                </div>

                {/* Availability Toggle & Actions */}
                <div className="flex items-center gap-1.5">
                  {/* 1-Click availability toggle */}
                  <button
                    onClick={() => handleToggleAvailability(prod)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                      isAvailable
                        ? 'bg-[#142d1f] text-[#2ecc71] border-[#2ecc71]/40 hover:bg-[#1a3827]'
                        : 'bg-[#3d1310] text-[#ff8c82] border-[#E63B2E]/40 hover:bg-[#4d1915]'
                    }`}
                    title="Activer/désactiver la disponibilité d'un clic"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isAvailable ? 'check_circle' : 'do_not_disturb_on'}
                    </span>
                    <span>{isAvailable ? 'En stock' : 'Épuisé'}</span>
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(prod)}
                    className="p-1.5 rounded-lg bg-[#1a1a1e] text-[#F5EFE6] hover:text-[#F5B82E] border border-[#2a2622] cursor-pointer"
                    title="Modifier la fiche complète"
                  >
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(prod)}
                    className="p-1.5 rounded-lg bg-[#1a1a1e] text-[#B8AFA3] hover:text-[#ff8c82] border border-[#2a2622] cursor-pointer"
                    title="Supprimer"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal with Firebase Storage Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-lg bg-[#141417] border border-[#2a2622] rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2a2622] pb-3">
              <h4 className="font-headline uppercase text-lg text-white font-bold">
                {editingProduct ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#1a1a1e] text-[#B8AFA3] hover:text-white flex items-center justify-center border border-[#2a2622] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                  Nom du produit <span className="text-[#E63B2E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Truffle Melt Smash Burger"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6A635B] focus:outline-none focus:border-[#F5B82E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                    Prix en Dinars Algériens (DA) <span className="text-[#E63B2E]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={50}
                    step={10}
                    value={prix}
                    onChange={(e) => setPrix(Number(e.target.value))}
                    className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-[#F5B82E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                    Catégorie <span className="text-[#E63B2E]">*</span>
                  </label>
                  <select
                    value={categorieId}
                    onChange={(e) => setCategorieId(e.target.value)}
                    className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F5B82E]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#141417]">
                        {c.nom || c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photo Upload with Firebase Storage */}
              <div className="space-y-2 p-3.5 rounded-xl bg-[#1a1a1e] border border-[#2a2622]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#F5B82E] text-[16px]">
                      cloud_upload
                    </span>
                    Photo du Produit (Firebase Storage)
                  </label>
                  {uploadingImage && (
                    <span className="text-[10px] text-[#F5B82E] animate-pulse">
                      Téléversement en cours...
                    </span>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex items-center gap-3">
                  {photoUrl ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#2a2622] shrink-0">
                      <img src={photoUrl} alt="Aperçu" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#141417] border border-dashed border-[#2a2622] flex items-center justify-center shrink-0 text-[#6A635B]">
                      <span className="material-symbols-outlined text-2xl">image</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="px-3 py-1.5 rounded-lg bg-[#2a2211] text-[#F5B82E] border border-[#F5B82E]/40 hover:bg-[#3d3118] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">upload</span>
                      <span>Uploader depuis l'appareil</span>
                    </button>
                    <input
                      type="url"
                      placeholder="Ou coller une URL d'image..."
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full bg-[#141417] border border-[#2a2622] rounded-lg px-2.5 py-1 text-[11px] text-white placeholder-[#6A635B] focus:outline-none focus:border-[#F5B82E]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                  Description & Ingrédients
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex : Double steak bœuf frais smashé, cheddar coulant, sauce signature..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#6A635B] focus:outline-none focus:border-[#F5B82E] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                    Badge (optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Top Choix Hydra"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#6A635B] focus:outline-none focus:border-[#F5B82E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={ordre}
                    onChange={(e) => setOrdre(Number(e.target.value))}
                    className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#F5B82E]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                  <input
                    type="checkbox"
                    checked={disponible}
                    onChange={(e) => setDisponible(e.target.checked)}
                    className="rounded text-[#E63B2E] w-4 h-4"
                  />
                  <span className="font-bold">Disponible immédiatement à la commande</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#2a2622] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#1a1a1e] text-[#B8AFA3] hover:text-white border border-[#2a2622] text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-5 py-2.5 rounded-xl bg-[#E63B2E] hover:bg-[#c92e22] text-white text-xs font-bold shadow-md shadow-[#E63B2E]/25 cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : editingProduct ? 'Mettre à jour' : 'Ajouter le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
