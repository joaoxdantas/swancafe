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
  Copy,
  PlusCircle,
  Palette,
  CheckCircle,
} from 'lucide-react';
import {
  sounds,
  CATEGORY_COLOR_OPTIONS,
  getCategoryColorScheme,
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
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Grupos &amp; Cardápio
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Edição &amp; Configuração
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Defina o nome e a cor de contorno de cada grupo. Todos os itens do grupo receberão automaticamente aquela cor.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Novo Card</span>
        </button>
      </div>

      {/* SECTION 1: CATEGORY MANAGEMENT WITH GROUP COLOR PICKER */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Grupos / Categorias &amp; Cores de Contorno
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A cor escolhida para o grupo contornará todos os itens pertencentes a ele.
              </p>
            </div>
          </div>

          {/* Add Category Form with Color Palette */}
          <form onSubmit={handleAddCategorySubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCatInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewCatInput(val);
                  // Auto-suggest green if user types 'salada' or 'verde'
                  if (val.toLowerCase().includes('salad') || val.toLowerCase().includes('verde')) {
                    setNewCatColor('emerald');
                  }
                }}
                placeholder="Ex: Saladas, Bebidas, Pizzas..."
                className="px-3.5 py-2 bg-slate-50 dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-400 min-w-[190px]"
              />

              {/* Color Swatch Picker for New Category */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-700/80 rounded-xl border border-slate-200 dark:border-slate-600">
                {CATEGORY_COLOR_OPTIONS.slice(0, 6).map((colorOpt) => (
                  <button
                    key={colorOpt.id}
                    type="button"
                    title={colorOpt.name}
                    onClick={() => {
                      sounds.playPop();
                      setNewCatColor(colorOpt.id);
                    }}
                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                      newCatColor === colorOpt.id
                        ? 'ring-2 ring-slate-900 dark:ring-white scale-110 shadow-xs'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: colorOpt.hex }}
                  >
                    {newCatColor === colorOpt.id && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!newCatInput.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Grupo</span>
            </button>
          </form>
        </div>

        {/* Existing Categories List with Instant Color Customizer */}
        <div className="pt-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2 flex items-center justify-between">
            <span>Grupos Ativos ({categories.length})</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
              Clique no círculo de cor para alterar a cor do grupo
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {categories.map((cat) => {
              const itemCount = cards.filter((c) => c.category === cat).length;
              const isEditing = editingCatName === cat;
              const catScheme = getCategoryColorScheme(cat, categoryColors);
              const isColorPickerOpen = activeColorPickerCat === cat;

              return (
                <div key={cat} className="relative">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-all border-2 ${
                      catScheme.border
                    } ${
                      isEditing
                        ? 'bg-white dark:bg-slate-800 ring-2 ring-indigo-500'
                        : 'bg-white dark:bg-slate-750/90 text-slate-800 dark:text-slate-100'
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
                          className="px-2 py-0.5 bg-slate-50 dark:bg-slate-700 border border-indigo-400 rounded-md text-xs font-bold text-slate-900 dark:text-white focus:outline-none w-28"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(cat)}
                          className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded cursor-pointer"
                          title="Salvar nome"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatName(null)}
                          className="p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded cursor-pointer"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Interactive Color Swatch button */}
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playPop();
                            setActiveColorPickerCat(isColorPickerOpen ? null : cat);
                          }}
                          className="w-4 h-4 rounded-full shrink-0 shadow-2xs hover:scale-125 transition-transform cursor-pointer ring-1 ring-black/20 dark:ring-white/20"
                          style={{ backgroundColor: catScheme.hex }}
                          title={`Alterar cor do grupo ${cat} (Atual: ${catScheme.name})`}
                        />

                        <span className="font-bold text-slate-800 dark:text-white">
                          {cat}
                        </span>

                        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-mono">
                          {itemCount}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleStartRename(cat)}
                          title="Renomear grupo"
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        {categories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCat(cat)}
                            title="Excluir grupo"
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/70 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Inline Color Palette Popover for this Category */}
                  {isColorPickerOpen && (
                    <div className="absolute left-0 top-full mt-1.5 z-30 p-2.5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 animate-in zoom-in-95 duration-150">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mr-1">
                        Cor:
                      </span>
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
                                ? 'ring-2 ring-slate-900 dark:ring-white scale-110'
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
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer ml-1"
                        title="Fechar"
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

      {/* SECTION 2: ITEM CARDS WITH ON/OFF TOGGLE & EDITING */}
      <div className="space-y-4">
        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar item por nome ou iniciais..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400"
            />
          </div>

          {/* Status Filter: All / Active / Off */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/70 p-1 rounded-xl border border-slate-200/80 dark:border-slate-600">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos ({cards.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Ativos ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-slate-800 dark:bg-slate-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Desativados ({inactiveCount})
            </button>
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
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
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

        {/* Cards Grid with Quick On/Off Switch & Edit Controls */}
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map((card) => {
              const isCardActive = card.isActive !== false;
              const initials = card.initials || '??';
              const colorScheme = getCategoryColorScheme(card.category, categoryColors);

              return (
                <div
                  key={card.id}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md flex flex-col justify-between gap-3 ${
                    isCardActive
                      ? `${colorScheme.border}`
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60'
                  }`}
                >
                  {/* Top Bar: Group Name & Active/Off Toggle */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                        isCardActive
                          ? colorScheme.badge
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {card.category || 'General'}
                    </span>

                    {/* ON / OFF SWITCH */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold ${
                          isCardActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {isCardActive ? 'ATIVO' : 'DESLIGADO'}
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
                            ? 'Desativar (ocultar da aba de cards)'
                            : 'Ativar (tornar visível para pedidos)'
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isCardActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
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
                      className={`min-w-14 px-2 h-14 rounded-2xl border-2 ${colorScheme.border} bg-slate-50 dark:bg-slate-700/60 flex items-center justify-center font-mono font-black shrink-0 shadow-2xs ${
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
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {card.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                        {isCardActive
                          ? 'Disponível para pedidos'
                          : 'Desativado (reutilizável a qualquer momento)'}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Edit, Duplicate, Delete */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditCard(card)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicateCard(card)}
                        title="Duplicar este card"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCardToDelete(card)}
                      title="Excluir card"
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-8">
            <p className="text-slate-500 dark:text-slate-300 text-sm">
              Nenhum card encontrado para a busca ou filtro selecionado.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setStatusFilter('all');
              }}
              className="mt-3 text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 underline cursor-pointer"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* IN-APP MODAL: CONFIRM DELETE CARD */}
      {cardToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setCardToDelete(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Excluir &ldquo;{cardToDelete.name}&rdquo;?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Isso removerá permanentemente este card. Você também pode apenas <strong>DESATIVÁ-LO</strong> para reutilizar quando desejar.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCardToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
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
                Excluir Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP MODAL: CONFIRM DELETE CATEGORY */}
      {catToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setCatToDelete(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Excluir Grupo &ldquo;{catToDelete}&rdquo;?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {cards.filter((c) => c.category === catToDelete).length > 0
                  ? `Os itens desse grupo serão transferidos para "General".`
                  : 'Este grupo será removido.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCatToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
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
                Excluir Grupo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
