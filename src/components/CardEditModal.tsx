import React, { useState, useEffect, useRef } from 'react';
import { CardItem } from '../types';
import { X, Sparkles, Trash2, Edit3, Plus, Upload, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { getInitials, getCategoryColorScheme, getCategoryBarcode, sounds } from '../utils/helpers';
import { CategoryBarcode } from './CategoryBarcode';
import { CategoryItemIcon } from './CategoryItemIcon';

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
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [newCatInput, setNewCatInput] = useState('');
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (cardToEdit) {
        setName(cardToEdit.name || '');
        setCustomInitials(cardToEdit.initials || '');
        setCategory(cardToEdit.category || safeCategories[0] || 'General');
        setImageUrl(cardToEdit.imageUrl || '');
        setIsActive(cardToEdit.isActive !== false);
      } else {
        setName('');
        setCustomInitials('');
        setCategory(safeCategories[0] || 'General');
        setImageUrl('');
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        sounds.playPop();
      }
    };
    reader.readAsDataURL(file);
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
      imageUrl: imageUrl.trim() || undefined,
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
    'Aussie Meat Pie',
    'Flat White',
    'Avocado Toast',
    'Sausage Roll',
    'Egg & Bacon Wrap',
    'Ham Cheese Croissant',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-850 rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 dark:border-stone-750 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-750 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isEditing
                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}
            >
              {isEditing ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              {isEditing ? 'Edit Menu Card' : 'Add New Menu Card'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-750 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Card Preview */}
        <div className="px-6 py-3.5 bg-stone-50 dark:bg-stone-900 border-y border-stone-200/80 dark:border-stone-750">
          <div className="text-[11px] font-bold text-stone-400 dark:text-stone-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Card Live Preview</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isActive
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
              }`}
            >
              {isActive ? 'Active on Menu' : 'Deactivated'}
            </span>
          </div>

          <div
            className={`relative p-4 sm:p-5 rounded-2xl border-2 ${activePalette.border} bg-white dark:bg-stone-850 shadow-sm overflow-hidden flex flex-col justify-between min-h-[140px] ${
              !isActive ? 'opacity-60 grayscale-30' : ''
            }`}
          >
            {/* Soft decorative background tint */}
            <div
              className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${activePalette.bg} opacity-70 dark:opacity-30 pointer-events-none`}
            />

            {/* Top row */}
            <div className="flex items-center justify-between z-10 min-h-[18px]">
              <span className="text-[10px] font-bold text-stone-400 dark:text-stone-400">
                Category: {category}
              </span>
            </div>

            {/* CENTER: 1:1 FIXED PROPORTION ICON + INITIALS SIDE-BY-SIDE */}
            <div className="my-2 z-10 flex items-center justify-center gap-3">
              <CategoryItemIcon
                category={category}
                imageUrl={imageUrl}
                itemName={name}
                colorScheme={activePalette}
              />
              <div
                className={`font-black tracking-tight ${activePalette.text} font-mono text-center leading-none ${
                  computedInitials.length <= 2
                    ? 'text-3xl sm:text-4xl'
                    : computedInitials.length <= 4
                    ? 'text-2xl sm:text-3xl'
                    : 'text-xl tracking-tighter'
                }`}
              >
                {computedInitials}
              </div>
            </div>

            {/* SMALL NAME ON CARD */}
            <div className="z-10 pt-2 border-t border-stone-100 dark:border-stone-750 text-xs font-bold text-stone-800 dark:text-stone-100 truncate text-left">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[55vh] overflow-y-auto">
          {/* Active / Inactive On-Off Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-750">
            <span className="text-xs font-bold text-stone-800 dark:text-stone-100">
              {isActive ? 'Active Item (Visible)' : 'Deactivated Item (Hidden)'}
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
                isActive ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-600'
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
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Item Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aussie Meat Pie, Flat White..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            />
            {!isEditing && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Suggestions:
                </span>
                {sampleSuggestions.slice(0, 3).map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => setName(sugg)}
                    className="text-[11px] px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-md transition-colors cursor-pointer"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 1:1 Item Icon & Image Management */}
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                <span>1:1 Item Icon / Image</span>
              </label>
              <span className="text-[10px] text-stone-400 font-medium">
                1:1 Fixed Square Ratio
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* 1:1 Preview */}
              <div className="w-12 h-12 rounded-xl border border-stone-300 dark:border-stone-600 overflow-hidden bg-white dark:bg-stone-900 shrink-0 flex items-center justify-center shadow-2xs">
                <CategoryItemIcon
                  category={category}
                  imageUrl={imageUrl}
                  itemName={name}
                  colorScheme={activePalette}
                />
              </div>

              {/* URL or Upload Actions */}
              <div className="flex-1 space-y-2 min-w-0">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL (https://...)"
                  className="w-full px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Image</span>
                  </button>

                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        sounds.playPop();
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Revert to Category Drawing</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-stone-400 leading-tight">
              {imageUrl
                ? 'Custom image active. Renders with a fixed 1:1 ratio.'
                : 'Using generic category vector drawing. You can upload a photo or paste a URL anytime.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Display Initials <span className="font-normal text-stone-400">(up to 4 chars)</span>
              </label>
              <input
                type="text"
                maxLength={8}
                value={customInitials}
                onChange={(e) => setCustomInitials(e.target.value.toUpperCase())}
                placeholder={getInitials(name || 'ITEM')}
                className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl font-mono text-center font-bold text-stone-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer"
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
                    className="w-full px-2 py-1.5 bg-white dark:bg-stone-800 border border-indigo-300 dark:border-indigo-600 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  {safeCategories.map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-stone-850 text-stone-900 dark:text-white">
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Group Color Contour Indicator */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-750">
            <span
              className="w-4 h-4 rounded-full shrink-0 shadow-2xs border border-white/20"
              style={{ backgroundColor: activePalette.hex }}
            />
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                <span>Category Color:</span>
                <span className={activePalette.text}>{activePalette.name}</span>
              </span>
              <span className="text-xs font-medium text-stone-400">
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
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Card</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-5 py-2.5 text-sm font-bold text-white bg-stone-900 dark:bg-white dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors cursor-pointer"
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
