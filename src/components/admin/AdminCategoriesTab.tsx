import { useState } from 'react';
import { Category } from '../../types';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/firestoreService';

interface AdminCategoriesTabProps {
  categories: Category[];
  onShowToast: (msg: string) => void;
}

export function AdminCategoriesTab({
  categories,
  onShowToast,
}: AdminCategoriesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [nom, setNom] = useState('');
  const [ordre, setOrdre] = useState(1);
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingCategory(null);
    setNom('');
    setOrdre(categories.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setNom(cat.nom || cat.name || '');
    setOrdre(cat.ordre ?? cat.order ?? 1);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    setSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          nom: nom.trim(),
          name: nom.trim(),
          ordre: Number(ordre),
          order: Number(ordre),
        });
        onShowToast(`Catégorie "${nom}" mise à jour.`);
      } else {
        await createCategory({
          nom: nom.trim(),
          ordre: Number(ordre),
        });
        onShowToast(`Nouvelle catégorie "${nom}" créée.`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Erreur lors de la sauvegarde de la catégorie.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const catNom = cat.nom || cat.name;
    if (confirm(`Supprimer définitivement la catégorie "${catNom}" ?`)) {
      try {
        await deleteCategory(cat.id);
        onShowToast(`Catégorie "${catNom}" supprimée.`);
      } catch (err) {
        console.error('Error deleting category:', err);
        alert('Erreur lors de la suppression de la catégorie.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-headline uppercase text-xl text-white font-bold flex items-center gap-2">
            <span>Catégories du Menu</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E63B2E] text-white text-xs font-mono">
              {categories.length}
            </span>
          </h3>
          <p className="text-xs text-[#B8AFA3] mt-0.5">
            Gérez l'agencement et l'ordre d'affichage des onglets du menu client (Smash Burgers, Tenders, Frites & Extras, Boissons, Formules...).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="h-11 px-4 rounded-xl bg-[#E63B2E] hover:bg-[#c92e22] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#E63B2E]/25 cursor-pointer whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Ajouter une catégorie</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const catNom = cat.nom || cat.name || 'Catégorie';
          const catOrdre = cat.ordre ?? cat.order ?? 1;

          return (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-[#141417] border border-[#2a2622] flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#1a1a1e] border border-[#2a2622] flex items-center justify-center text-[#F5B82E]">
                  <span className="material-symbols-outlined text-[24px]">
                    {cat.iconName || 'restaurant_menu'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-headline uppercase text-sm font-extrabold text-white">
                      {catNom}
                    </h4>
                    <span className="px-2 py-0.5 rounded bg-[#1a1a1e] border border-[#2a2622] text-[10px] text-[#F5B82E] font-mono">
                      Position #{catOrdre}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6A635B] font-mono mt-0.5">ID: {cat.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-2 rounded-lg bg-[#1a1a1e] text-[#F5EFE6] hover:text-[#F5B82E] border border-[#2a2622] cursor-pointer"
                  title="Modifier"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>

                <button
                  onClick={() => handleDelete(cat)}
                  className="p-2 rounded-lg bg-[#1a1a1e] text-[#B8AFA3] hover:text-[#ff8c82] border border-[#2a2622] cursor-pointer"
                  title="Supprimer"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-md bg-[#141417] border border-[#2a2622] rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2a2622] pb-3">
              <h4 className="font-headline uppercase text-lg text-white font-bold">
                {editingCategory ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#1a1a1e] text-[#B8AFA3] hover:text-white flex items-center justify-center border border-[#2a2622] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                  Nom de la catégorie <span className="text-[#E63B2E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Smash Burgers, Tenders, Frites & Extras..."
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6A635B] focus:outline-none focus:border-[#F5B82E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8AFA3] mb-1">
                  Ordre d'affichage (position)
                </label>
                <input
                  type="number"
                  min={1}
                  value={ordre}
                  onChange={(e) => setOrdre(Number(e.target.value))}
                  className="w-full bg-[#1a1a1e] border border-[#2a2622] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F5B82E]"
                />
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
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#E63B2E] hover:bg-[#c92e22] text-white text-xs font-bold shadow-md shadow-[#E63B2E]/25 cursor-pointer"
                >
                  {saving ? 'Enregistrement...' : editingCategory ? 'Mettre à jour' : 'Ajouter la catégorie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
