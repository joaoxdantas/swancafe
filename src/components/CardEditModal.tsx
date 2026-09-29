import React, { useState, useEffect } from 'react';
import { CardItem } from '../types';
import { X, Sparkles, Trash2, Edit3, Plus, Tag } from 'lucide-react';
import { getInitials, COLOR_PALETTES, sounds } from '../utils/helpers';

interface CardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardToEdit: CardItem | null; // null means adding a new card
  categories: string[];
  onSaveCard: (cardData: Omit<CardItem, 'id' | 'createdAt'> & { id?: string }) => void;
  onDeleteCard?: (id: string) => void;
  onAddNewCategory?: (newCat: string) => void;
}

export const CardEditModal: React.FC<CardEditModalProps> = ({
  isOpen,
  onClose,
  cardToEdit,
  categories,
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
  const [selectedPaletteIdx, setSelectedPaletteIdx] = useState(0);
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
        const targetColor = cardToEdit.colorScheme?.text;
        const matchIdx = targetColor
          ? COLOR_PALETTES.findIndex((p) => p && p.text === targetColor)
          : -1;
        setSelectedPaletteIdx(matchIdx !== -1 ? matchIdx : 0);
      } else {
        setName('');
        setCustomInitials('');
        setCategory(safeCategories[0] || 'General');
        setIsActive(true);
        setSelectedPaletteIdx(0);
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

  const activePalette =
    COLOR_PALETTES[selectedPaletteIdx] ||
    COLOR_PALETTES[0] || {
      bg: 'bg-orange-50/60',
      border: 'border-orange-200',
      text: 'text-orange-700',
      badge: 'bg-orange-100 text-orange-800',
      pillBg: 'bg-orange-500',
    };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isEditing
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-orange-100 text-orange-700'
              }`}
            >
              {isEditing ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {isEditing ? 'Edit Card' : 'Add New Card'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Card Preview */}
        <div className="px-6 py-3 bg-slate-50 border-y border-slate-200/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Card Preview (Big Initials + Small Name)</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
            }`}>
              {isActive ? 'Active in Menu' : 'Turned Off (Saved for reuse)'}
            </span>
          </div>

          <div
            className={`relative p-5 rounded-2xl border ${activePalette.border} bg-white shadow-2xs overflow-hidden flex flex-col justify-between min-h-[145px] ${
              !isActive ? 'opacity-60 grayscale-30' : ''
            }`}
          >
            <div
              className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${activePalette.bg} opacity-70 pointer-events-none`}
            />

            <div className="flex items-center justify-between z-10">
              <span
                className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full ${activePalette.badge}`}
              >
                {category || 'ITEM'}
              </span>
            </div>

            {/* BIG INITIALS */}
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
            <div className="z-10 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-800 truncate text-left">
              {name.trim() || 'Item Name'}
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Active / Inactive On-Off Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">
                Menu Item Status (Turn On/Off)
              </p>
              <p className="text-[11px] text-slate-500">
                {isActive
                  ? 'Turned ON: Visible on Cards tab for dispatch'
                  : 'Turned OFF: Hidden from dispatch but saved for reuse'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => {
                sounds.playPop();
                setIsActive(!isActive);
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isActive ? 'bg-emerald-500' : 'bg-slate-300'
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Card Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Margherita Supreme"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
            {!isEditing && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Ideas:
                </span>
                {sampleSuggestions.slice(0, 3).map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => setName(sugg)}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Big Initials / Code <span className="font-normal text-slate-400">(4+ chars supported)</span>
              </label>
              <input
                type="text"
                maxLength={8}
                value={customInitials}
                onChange={(e) => setCustomInitials(e.target.value.toUpperCase())}
                placeholder={getInitials(name || 'ITEM')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-center font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  {isAddingNewCat ? 'Select' : '+ New'}
                </button>
              </div>

              {isAddingNewCat ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    placeholder="New category..."
                    className="w-full px-2 py-1.5 bg-white border border-indigo-300 rounded-lg text-xs text-slate-900 focus:outline-none"
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
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  {safeCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Card Color Accent
            </label>
            <div className="flex items-center gap-2">
              {COLOR_PALETTES.map((pal, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPaletteIdx(idx)}
                  className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                    pal.border
                  } ${pal.bg} ${
                    selectedPaletteIdx === idx
                      ? 'ring-2 ring-slate-900 ring-offset-2 scale-110'
                      : 'hover:scale-105'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${pal.pillBg}`} />
                </button>
              ))}
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
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Card</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isEditing ? 'Save Changes' : 'Add Card'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
