import React, { useState } from 'react';
import { CardItem } from '../types';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  Power,
  Copy,
  PlusCircle,
  FolderPlus,
  Layers,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { sounds } from '../utils/helpers';

interface MenuEditTabProps {
  cards: CardItem[];
  categories: string[];
  onAddCategory: (categoryName: string) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
  onToggleCardActive: (cardId: string) => void;
  onEditCard: (card: CardItem) => void;
  onDeleteCard: (cardId: string) => void;
  onDuplicateCard: (card: CardItem) => void;
  onOpenAddModal: () => void;
}

export const MenuEditTab: React.FC<MenuEditTabProps> = ({
  cards,
  categories,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onToggleCardActive,
  onEditCard,
  onDeleteCard,
  onDuplicateCard,
  onOpenAddModal,
}) => {
  // Category management local state
  const [newCatInput, setNewCatInput] = useState('');
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [renamedCatInput, setRenamedCatInput] = useState('');

  // Filtering state for cards
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // In-app deletion confirmation states (replaces window.confirm)
  const [cardToDelete, setCardToDelete] = useState<CardItem | null>(null);
  const [catToDelete, setCatToDelete] = useState<string | null>(null);

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    sounds.playPop();
    onAddCategory(newCatInput.trim());
    setNewCatInput('');
  };

  const handleStartRename = (cat: string) => {
    try {
      sounds.playPop();
    } catch {
      // ignore
    }
    setEditingCatName(cat);
    setRenamedCatInput(cat || '');
  };

  const handleSaveRename = (oldName: string) => {
    const trimmed = (renamedCatInput || '').trim();
    if (!trimmed || trimmed === oldName) {
      setEditingCatName(null);
      return;
    }
    try {
      sounds.playPop();
    } catch {
      // ignore
    }
    onRenameCategory(oldName, trimmed);
    setEditingCatName(null);
  };

  const handleDeleteCat = (cat: string) => {
    setCatToDelete(cat);
  };

  const filteredCards = cards.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.initials.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || c.category === selectedCategory;
    const isAct = c.isActive !== false;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? isAct
        : !isAct;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeCount = cards.filter((c) => c.isActive !== false).length;
  const inactiveCount = cards.length - activeCount;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Intro Header */}
      <div className="pb-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Menu &amp; Category Manager
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Admin &amp; Edits
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Create or rename categories, edit cards, and turn items on/off so they can be reused without recreating them.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Item Card</span>
        </button>
      </div>

      {/* SECTION 1: CATEGORY MANAGEMENT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Menu Categories
              </h3>
              <p className="text-xs text-slate-500">
                Edit existing categories or add new ones for item cards.
              </p>
            </div>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategorySubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              placeholder="Add new category..."
              className="px-3.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!newCatInput.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Categories Chips / Editor List */}
        <div className="flex items-center gap-2 flex-wrap pt-2">
          {categories.map((cat) => {
            const itemCount = cards.filter((c) => c.category === cat).length;
            const isEditing = editingCatName === cat;

            return (
              <div
                key={cat}
                className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 transition-all"
              >
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      autoFocus
                      value={renamedCatInput}
                      onChange={(e) => setRenamedCatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(cat);
                        if (e.key === 'Escape') setEditingCatName(null);
                      }}
                      className="px-2 py-0.5 bg-white border border-indigo-400 rounded-md text-xs font-bold text-slate-900 focus:outline-none w-28"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveRename(cat)}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      title="Save rename"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCatName(null)}
                      className="p-1 text-slate-400 hover:bg-slate-200 rounded"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{cat}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-600 text-[10px] font-mono">
                      {itemCount}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleStartRename(cat)}
                      title="Rename category"
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCat(cat)}
                        title="Delete category"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: ITEM CARDS WITH ON/OFF TOGGLE & EDITING */}
      <div className="space-y-4">
        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items by name or initials..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Status Filter: All / Active / Off */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({cards.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Off / Saved ({inactiveCount})
            </button>
          </div>
        </div>

        {/* Category tabs filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards Grid with Quick On/Off Switch & Edit Controls */}
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map((card) => {
              const isCardActive = card.isActive !== false;
              const initials = card.initials || '??';
              const colorScheme = card.colorScheme || {
                bg: 'bg-orange-50/60',
                border: 'border-orange-200',
                text: 'text-orange-700',
                badge: 'bg-orange-100 text-orange-800',
                pillBg: 'bg-orange-500',
              };

              return (
                <div
                  key={card.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 bg-white shadow-2xs hover:shadow-xs flex flex-col justify-between gap-3 ${
                    isCardActive
                      ? `${colorScheme.border}`
                      : 'border-slate-200 bg-slate-50/60 opacity-75'
                  }`}
                >
                  {/* Top Bar: Category & Active/Off Toggle */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                        isCardActive
                          ? colorScheme.badge
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {card.category || 'General'}
                    </span>

                    {/* ON / OFF SWITCH */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold ${
                          isCardActive ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {isCardActive ? 'ON' : 'OFF'}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isCardActive}
                        onClick={() => {
                          sounds.playPop();
                          onToggleCardActive(card.id);
                        }}
                        title={
                          isCardActive
                            ? 'Turn OFF (hide from cards dispatch tab)'
                            : 'Turn ON (make available on cards tab)'
                        }
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isCardActive ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isCardActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Center: Big Initials and Small Name */}
                  <div className="flex items-center gap-3 py-1">
                    <div
                      className={`min-w-14 px-2 h-14 rounded-xl border ${colorScheme.border} ${colorScheme.bg} flex items-center justify-center font-mono font-black shrink-0 shadow-2xs ${
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
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {card.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {isCardActive
                          ? 'Available for ordering'
                          : 'Turned off (reusable anytime)'}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Edit, Duplicate, Delete */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditCard(card)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicateCard(card)}
                        title="Duplicate this card"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCardToDelete(card)}
                      title="Delete card"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-8">
            <p className="text-slate-500 text-sm">
              No cards found matching your search or filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setStatusFilter('all');
              }}
              className="mt-3 text-xs font-semibold text-orange-600 hover:text-orange-700 underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* IN-APP MODAL: CONFIRM DELETE CARD */}
      {cardToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setCardToDelete(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Delete &ldquo;{cardToDelete.name}&rdquo;?
              </h3>
              <p className="text-xs text-slate-500">
                This will permanently delete this card. You can also simply toggle it <strong>OFF</strong> if you want to reuse it later.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCardToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                Delete Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP MODAL: CONFIRM DELETE CATEGORY */}
      {catToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setCatToDelete(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Delete Category &ldquo;{catToDelete}&rdquo;?
              </h3>
              <p className="text-xs text-slate-500">
                {cards.filter((c) => c.category === catToDelete).length > 0
                  ? `Items in this category will be reassigned to "General".`
                  : 'This category will be removed.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCatToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
