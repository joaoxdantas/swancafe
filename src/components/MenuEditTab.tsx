import React, { useState, useMemo } from 'react';
import { CardItem } from '../types';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  Copy,
  PlusCircle,
  ArrowDownAZ,
  ArrowUpZA,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import {
  sounds,
  CATEGORY_COLOR_OPTIONS,
  getCategoryColorScheme,
  getCategoryBarcode,
} from '../utils/helpers';

interface MenuEditTabProps {
  cards: CardItem[];
  categories: string[];
  categoryColors?: Record<string, string>;
  onAddCategory: (categoryName: string, color?: string) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
  onUpdateCategoryColor?: (categoryName: string, colorId: string) => void;
  onToggleCardActive: (cardId: string) => void;
  onEditCard: (card: CardItem) => void;
  onDeleteCard: (cardId: string) => void;
  onDuplicateCard: (card: CardItem) => void;
  onOpenAddModal: () => void;
}

export type SortMode = 'default' | 'az' | 'za';

export const MenuEditTab: React.FC<MenuEditTabProps> = ({
  cards,
  categories,
  categoryColors,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onUpdateCategoryColor,
  onToggleCardActive,
  onEditCard,
  onDeleteCard,
  onDuplicateCard,
  onOpenAddModal,
}) => {
  // Category management local state
  const [newCatInput, setNewCatInput] = useState('');
  const [newCatColor, setNewCatColor] = useState('emerald');
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [renamedCatInput, setRenamedCatInput] = useState('');
  const [activeColorPickerCat, setActiveColorPickerCat] = useState<string | null>(null);

  // Filtering & Reordering state for cards
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [groupByType, setGroupByType] = useState<boolean>(true);

  // In-app deletion confirmation states (replaces window.confirm)
  const [cardToDelete, setCardToDelete] = useState<CardItem | null>(null);
  const [catToDelete, setCatToDelete] = useState<string | null>(null);

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    sounds.playPop();
    onAddCategory(newCatInput.trim(), newCatColor);
    setNewCatInput('');
    setNewCatColor('orange');
  };

  const handleStartRename = (cat: string) => {
    sounds.playPop();
    setEditingCatName(cat);
    setRenamedCatInput(cat || '');
  };

  const handleSaveRename = (oldName: string) => {
    const trimmed = (renamedCatInput || '').trim();
    if (!trimmed || trimmed === oldName) {
      setEditingCatName(null);
      return;
    }
    sounds.playPop();
    onRenameCategory(oldName, trimmed);
    setEditingCatName(null);
  };

  const handlePickCategoryColor = (catName: string, colorId: string) => {
    sounds.playPop();
    if (onUpdateCategoryColor) {
      onUpdateCategoryColor(catName, colorId);
    }
    setActiveColorPickerCat(null);
  };

  const handleDeleteCat = (cat: string) => {
    sounds.playPop();
    setCatToDelete(cat);
  };

  // Filtered Cards
  const processedCards = useMemo(() => {
    let result = cards.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.initials.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || c.category === selectedCategory;
      const isCardActive = c.isActive !== false;
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? isCardActive
          : !isCardActive;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sorting
    if (sortMode === 'az') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    } else if (sortMode === 'za') {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: 'base' }));
    }

    return result;
  }, [cards, searchQuery, selectedCategory, statusFilter, sortMode]);

  // Grouped cards by Category
  const groupedCategories = useMemo(() => {
    if (!groupByType || selectedCategory !== 'All') return null;

    const baseCategories =
      sortMode === 'az'
        ? [...categories].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
        : sortMode === 'za'
        ? [...categories].sort((a, b) => b.localeCompare(a, undefined, { sensitivity: 'base' }))
        : categories;

    const groups: { category: string; cards: CardItem[] }[] = [];
    const usedIds = new Set<string>();

    baseCategories.forEach((cat) => {
      const itemsInCat = processedCards.filter((c) => c.category === cat);
      if (itemsInCat.length > 0) {
        groups.push({ category: cat, cards: itemsInCat });
        itemsInCat.forEach((c) => usedIds.add(c.id));
      }
    });

    const remaining = processedCards.filter((c) => !usedIds.has(c.id));
    if (remaining.length > 0) {
      groups.push({ category: 'Other Items', cards: remaining });
    }

    return groups;
  }, [groupByType, selectedCategory, categories, processedCards, sortMode]);

  const activeCount = cards.filter((c) => c.isActive !== false).length;
  const inactiveCount = cards.length - activeCount;

  const renderCardItem = (card: CardItem) => {
    const isCardActive = card.isActive !== false;
    const initials = card.initials || '??';
    const colorScheme = getCategoryColorScheme(card.category, categoryColors);

    return (
      <div
        key={card.id}
        className={`p-4 rounded-2xl border-2 transition-all duration-200 bg-white dark:bg-stone-850 shadow-sm hover:shadow-md flex flex-col justify-between gap-3 ${
          isCardActive
            ? `${colorScheme.border}`
            : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-850/50 opacity-60'
        }`}
      >
        {/* Top Bar: Group Name & Active/Off Toggle */}
        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
              isCardActive
                ? colorScheme.badge
                : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
            }`}
          >
            {card.category || 'General'}
          </span>

          {/* ON / OFF SWITCH */}
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold ${
                isCardActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400'
              }`}
            >
              {isCardActive ? 'ACTIVE' : 'OFF'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isCardActive}
              onClick={() => {
                sounds.playPop();
                onToggleCardActive(card.id);
              }}
              title={isCardActive ? 'Deactivate item' : 'Activate item'}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isCardActive ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isCardActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Card Main Info: Big Initials + Item Name */}
        <div className="flex items-center gap-3.5 my-1">
          <div
            className={`min-w-14 px-2 h-14 rounded-2xl border-2 ${colorScheme.border} bg-stone-50 dark:bg-stone-800 flex items-center justify-center font-mono font-black shrink-0 shadow-2xs ${
              initials.length <= 2
                ? 'text-2xl'
                : initials.length <= 4
                ? 'text-lg tracking-tight'
                : 'text-sm tracking-tighter'
            } ${colorScheme.text}`}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-stone-900 dark:text-white truncate">
              {card.name}
            </h4>
          </div>
        </div>

        {/* Actions: Edit, Duplicate, Delete */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEditCard(card)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => onDuplicateCard(card)}
              title="Duplicate item"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setCardToDelete(card)}
            title="Delete item"
            className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-stone-800">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight">
          Menu &amp; Categories Editor
        </h2>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Item</span>
        </button>
      </div>

      {/* SECTION 1: CATEGORY MANAGEMENT WITH GROUP COLOR PICKER */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
              <Tag className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              Categories &amp; Colors
            </h3>
          </div>

          {/* Add Category Form with Color Palette */}
          <form onSubmit={handleAddCategorySubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCatInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewCatInput(val);
                  if (val.toLowerCase().includes('salad') || val.toLowerCase().includes('green')) {
                    setNewCatColor('emerald');
                  }
                }}
                placeholder="Category name..."
                className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-stone-400 min-w-[170px]"
              />

              {/* Color Swatch Picker for New Category */}
              <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                {CATEGORY_COLOR_OPTIONS.slice(0, 6).map((colorOpt) => (
                  <button
                    key={colorOpt.id}
                    type="button"
                    title={colorOpt.name}
                    onClick={() => {
                      sounds.playPop();
                      setNewCatColor(colorOpt.id);
                    }}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                      newCatColor === colorOpt.id
                        ? 'ring-2 ring-stone-900 dark:ring-white scale-110 shadow-xs'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: colorOpt.hex }}
                  >
                    {newCatColor === colorOpt.id && (
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!newCatInput.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white bg-stone-900 dark:bg-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </form>
        </div>

        {/* Existing Categories List with Instant Color Customizer */}
        <div className="pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => {
              const itemCount = cards.filter((c) => c.category === cat).length;
              const isEditing = editingCatName === cat;
              const catScheme = getCategoryColorScheme(cat, categoryColors);
              const isColorPickerOpen = activeColorPickerCat === cat;

              return (
                <div key={cat} className="relative">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-all border-2 ${
                      catScheme.border
                    } ${
                      isEditing
                        ? 'bg-white dark:bg-stone-800 ring-2 ring-indigo-500'
                        : 'bg-white dark:bg-stone-850 text-stone-800 dark:text-stone-100'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          autoFocus
                          value={renamedCatInput}
                          onChange={(e) => setRenamedCatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(cat);
                            if (e.key === 'Escape') setEditingCatName(null);
                          }}
                          className="px-2 py-0.5 bg-stone-50 dark:bg-stone-700 border border-indigo-400 rounded-md text-xs font-bold text-stone-900 dark:text-white focus:outline-none w-28"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(cat)}
                          className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded cursor-pointer"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatName(null)}
                          className="p-1 text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 rounded cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playPop();
                            setActiveColorPickerCat(isColorPickerOpen ? null : cat);
                          }}
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs hover:scale-125 transition-transform cursor-pointer ring-1 ring-black/20 dark:ring-white/20"
                          style={{ backgroundColor: catScheme.hex }}
                          title={`Color: ${catScheme.name}`}
                        />

                        <span className="font-bold text-stone-800 dark:text-white">
                          {cat}
                        </span>

                        <span className="px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-[10px] font-mono">
                          {itemCount}
                        </span>

                        <span className="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-400 bg-stone-50 dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700" title="Code 128 Barcode Reference">
                          {getCategoryBarcode(cat).code}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleStartRename(cat)}
                          title="Rename"
                          className="p-1 text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        {categories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCat(cat)}
                            title="Delete"
                            className="p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/70 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Inline Color Palette Popover for this Category */}
                  {isColorPickerOpen && (
                    <div className="absolute left-0 top-full mt-1.5 z-30 p-2.5 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 flex items-center gap-1.5 animate-in zoom-in-95 duration-150">
                      {CATEGORY_COLOR_OPTIONS.map((c) => {
                        const isCurrent = (categoryColors?.[cat] || catScheme.id) === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handlePickCategoryColor(cat, c.id)}
                            title={c.name}
                            className={`w-6 h-6 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                              isCurrent
                                ? 'ring-2 ring-stone-900 dark:ring-white scale-110'
                                : 'hover:scale-115 opacity-80 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c.hex }}
                          >
                            {isCurrent && (
                              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            )}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setActiveColorPickerCat(null)}
                        className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded cursor-pointer ml-1"
                        title="Close"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: ITEM CARDS WITH ORGANIZATION & REORDER TOOLS */}
      <div className="space-y-4">
        {/* Filters, Search & Reorder Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-9 pr-4 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900 dark:text-white placeholder:text-stone-400"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Group by Type Toggle */}
            {selectedCategory === 'All' && (
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setGroupByType(!groupByType);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                  groupByType
                    ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-950 border-stone-900 dark:border-white shadow-2xs'
                    : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
                }`}
              >
                {groupByType ? <Layers className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
                <span>{groupByType ? 'Grouped by Category' : 'Flat Grid'}</span>
              </button>
            )}

            {/* Sort Controls: Default, A-Z, Z-A */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200/80 dark:border-stone-700 p-0.5">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setSortMode('default');
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  sortMode === 'default'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Default
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setSortMode(sortMode === 'az' ? 'za' : 'az');
                }}
                title={sortMode === 'az' ? 'Sort Z to A' : 'Sort A to Z'}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  sortMode === 'az' || sortMode === 'za'
                    ? 'bg-amber-500 text-stone-950 shadow-2xs font-bold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {sortMode === 'za' ? (
                  <>
                    <ArrowUpZA className="w-3.5 h-3.5" />
                    <span>Z-A</span>
                  </>
                ) : (
                  <>
                    <ArrowDownAZ className="w-3.5 h-3.5" />
                    <span>A-Z</span>
                  </>
                )}
              </button>
            </div>

            {/* Status Filter: All / Active / Off */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-xl border border-stone-200/80 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                All ({cards.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('inactive')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'inactive'
                    ? 'bg-stone-800 dark:bg-stone-600 text-white shadow-2xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Off ({inactiveCount})
              </button>
            </div>
          </div>
        </div>

        {/* Category tabs filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', ...categories].map((cat) => {
            const catScheme = cat === 'All' ? null : getCategoryColorScheme(cat, categoryColors);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-xs'
                    : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700'
                }`}
              >
                {catScheme && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: catScheme.hex }}
                  />
                )}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Cards Grid: Grouped by Category OR Flat Grid */}
        {groupedCategories ? (
          groupedCategories.length > 0 ? (
            <div className="space-y-6">
              {groupedCategories.map((grp) => {
                const catScheme = getCategoryColorScheme(grp.category, categoryColors);
                return (
                  <div key={grp.category} className="space-y-3">
                    {/* Category Type Header */}
                    <div className="flex items-center gap-2 pt-1 border-b border-stone-200/60 dark:border-stone-800 pb-1.5">
                      <span
                        className="w-3 h-3 rounded-full shadow-2xs shrink-0"
                        style={{ backgroundColor: catScheme.hex }}
                      />
                      <h3 className="text-sm font-bold tracking-wider uppercase text-stone-800 dark:text-stone-200">
                        {grp.category}
                      </h3>
                      <span className="text-xs font-mono font-semibold text-stone-400">
                        ({grp.cards.length})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {grp.cards.map((card) => renderCardItem(card))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-stone-850 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-8">
              <p className="text-stone-500 dark:text-stone-300 text-sm">
                No items found.
              </p>
            </div>
          )
        ) : processedCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedCards.map((card) => renderCardItem(card))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-stone-850 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-8">
            <p className="text-stone-500 dark:text-stone-300 text-sm">
              No items matched the selected filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setStatusFilter('all');
              }}
              className="mt-3 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* IN-APP MODAL: CONFIRM DELETE CARD */}
      {cardToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setCardToDelete(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-700 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Delete &ldquo;{cardToDelete.name}&rdquo;?
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCardToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  onDeleteCard(cardToDelete.id);
                  setCardToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP MODAL: CONFIRM DELETE CATEGORY */}
      {catToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setCatToDelete(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-700 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Delete Category &ldquo;{catToDelete}&rdquo;?
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCatToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  onDeleteCategory(catToDelete);
                  setCatToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
