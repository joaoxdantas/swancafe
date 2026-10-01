import React, { useState, useEffect } from 'react';
import { CardItem } from '../types';
import { X, Sparkles, Trash2, Edit3, Plus, Tag } from 'lucide-react';
import { getInitials, getCategoryColorScheme, getCategoryBarcode, sounds } from '../utils/helpers';
import { CategoryBarcode } from './CategoryBarcode';

interface CardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardToEdit: CardItem | null; // null means adding a new card
  categories: string[];
  categoryColors?: Record<string, string>;
  onSaveCard: (cardData: Omit<CardItem, 'id' | 'createdAt'> & { id?: string }) => void;
  onDeleteCard?: (id: string) => void;
  onAddNewCategory?: (newCat: string, color?: string) => void;
}

export const CardEditModal: React.FC<CardEditModalProps> = ({
  isOpen,
  onClose,
  cardToEdit,
  categories,
  categoryColors,
  onSaveCard,
  onDeleteCard,
  onAddNewCategory,
}) => {
  const isEditing = Boolean(cardToEdit);
  const safeCategories =
    Array.isArray(categories) && categories.length > 0 ? categories : ['General'];

  const [name, setName] = useState('');
  const [customInitials, setCustomInitials] = useState('');
  const [category, setCategory] = useState(safeCategories[0] || 'General');
  const [isActive, setIsActive] = useState(true);
  const [newCatInput, setNewCatInput] = useState('');
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (cardToEdit) {
        setName(cardToEdit.name || '');
        setCustomInitials(cardToEdit.initials || '');
        setCategory(cardToEdit.category || safeCategories[0] || 'General');
        setIsActive(cardToEdit.isActive !== false);
      } else {
        setName('');
        setCustomInitials('');
        setCategory(safeCategories[0] || 'General');
        setIsActive(true);
      }
      setIsAddingNewCat(false);
      setNewCatInput('');
      setConfirmDelete(false);
    }
  }, [isOpen, cardToEdit, safeCategories]);

  if (!isOpen) return null;

  const computedInitials = (
    (customInitials || '').trim() || getInitials(name || 'ITEM')
  ).toUpperCase();

  // The card's color scheme is strictly determined by its group/category
  const activePalette = getCategoryColorScheme(category, categoryColors);

  const handleCreateCategory = () => {
    if (!newCatInput.trim()) return;
    const catName = newCatInput.trim();
    if (onAddNewCategory) {
      onAddNewCategory(catName);
    }
    setCategory(catName);
    setIsAddingNewCat(false);
    setNewCatInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    sounds.playPop();
    onSaveCard({
      ...(cardToEdit ? { id: cardToEdit.id } : {}),
      name: name.trim(),
      initials: computedInitials,
      category: category.trim() || 'General',
      isActive,
      colorScheme: activePalette,
    });

    onClose();
  };

  const handleDelete = () => {
    if (!cardToEdit || !onDeleteCard) return;
    sounds.playPop();
    onDeleteCard(cardToEdit.id);
    onClose();
  };

  const sampleSuggestions = [
    'Buffalo Chicken',
    'Vegan Supreme',
    'Smoked Sausage',
    'Truffle Carbonara',
    'Tiramisu Dolce',
    'Espresso Tonic',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isEditing
                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  : 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
              }`}
            >
              {isEditing ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Edit Card' : 'Add New Card'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Card Preview */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-850 border-y border-slate-200/80 dark:border-slate-700">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Pré-visualização do Card</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isActive
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isActive ? 'Ativo no Menu' : 'Desativado'}
            </span>
          </div>

          <div
            className={`relative p-5 rounded-2xl border-2 ${activePalette.border} bg-white dark:bg-slate-800 shadow-sm overflow-hidden flex flex-col justify-between min-h-[145px] ${
              !isActive ? 'opacity-60 grayscale-30' : ''
            }`}
          >
            {/* Soft decorative background tint */}
            <div
              className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${activePalette.bg} opacity-70 dark:opacity-30 pointer-events-none`}
            />

            {/* Top row: Status indicator or spacer */}
            <div className="flex items-center justify-between z-10 min-h-[18px]">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400">
                Grupo: {category}
              </span>
            </div>

            {/* BIG INITIALS in Group Text Color */}
            <div className="my-2 z-10 flex flex-col items-center justify-center">
              <div
                className={`font-black tracking-tight ${activePalette.text} font-mono text-center ${
                  computedInitials.length <= 2
                    ? 'text-4xl'
                    : computedInitials.length <= 4
                    ? 'text-3xl'
                    : 'text-2xl tracking-tighter'
                }`}
              >
                {computedInitials}
              </div>
            </div>

            {/* SMALL NAME ON CARD */}
            <div className="z-10 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 truncate text-left">
              {name.trim() || 'Item Name'}
            </div>
          </div>

          {/* Reference Barcode Card (Code 128) */}
          <div className="mt-3">
            <CategoryBarcode
              categoryName={category}
              barcodeNumber={getCategoryBarcode(category).code}
            />
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Active / Inactive On-Off Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {isActive ? 'Item Ativo (Visível)' : 'Item Desativado (Oculto)'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => {
                sounds.playPop();
                setIsActive(!isActive);
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nome do Card
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Salada Caesar, Margherita..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
            {!isEditing && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Sugestões:
                </span>
                {sampleSuggestions.slice(0, 3).map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => setName(sugg)}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors cursor-pointer"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Iniciais Grandes <span className="font-normal text-slate-400">(até 4 letras)</span>
              </label>
              <input
                type="text"
                maxLength={8}
                value={customInitials}
                onChange={(e) => setCustomInitials(e.target.value.toUpperCase())}
                placeholder={getInitials(name || 'ITEM')}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600 rounded-xl font-mono text-center font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Grupo / Categoria
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer"
                >
                  {isAddingNewCat ? 'Selecionar' : '+ Novo'}
                </button>
              </div>

              {isAddingNewCat ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    placeholder="Novo grupo..."
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-700/60 border border-indigo-300 dark:border-indigo-600 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={!newCatInput.trim()}
                    className="px-2 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  {safeCategories.map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Group Color Contour Indicator (Defined by Category) */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700">
            <span
              className="w-4 h-4 rounded-full shrink-0 shadow-2xs border border-white/20"
              style={{ backgroundColor: activePalette.hex }}
            />
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>Cor do Grupo:</span>
                <span className={activePalette.text}>{activePalette.name}</span>
              </span>
              <span className="text-xs font-medium text-slate-400">
                {category}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-2.5">
            {isEditing && onDeleteCard ? (
              confirmDelete ? (
                <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Confirmar Exclusão
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover Card</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isEditing ? 'Salvar Alterações' : 'Adicionar Card'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
