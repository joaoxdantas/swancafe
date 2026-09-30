import React, { useState } from 'react';
import { CardItem, OrderItemLine } from '../types';
import { Plus, SlidersHorizontal, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { getCategoryColorScheme } from '../utils/helpers';

interface CardItemViewProps {
  card: CardItem;
  draftQuantity: number;
  onSelect: (card: CardItem) => void;
  categoryColors?: Record<string, string>;
}

export const CardItemView: React.FC<CardItemViewProps> = ({
  card,
  draftQuantity,
  onSelect,
  categoryColors,
}) => {
  const isCardActive = card.isActive !== false;
  const initials = card.initials || '??';

  // The outline and color scheme comes from the card's category / group
  const colorScheme = getCategoryColorScheme(card.category, categoryColors);

  return (
    <div
      onClick={() => isCardActive && onSelect(card)}
      role="button"
      tabIndex={isCardActive ? 0 : -1}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && isCardActive) {
          e.preventDefault();
          onSelect(card);
        }
      }}
      className={`group relative flex flex-col justify-between p-5 rounded-2xl border-2 transition-all duration-200 select-none text-left overflow-hidden min-h-[175px] ${
        !isCardActive
          ? 'opacity-40 grayscale cursor-not-allowed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
          : draftQuantity > 0
          ? `${colorScheme.border} bg-white dark:bg-slate-800 ring-4 ${colorScheme.ring} shadow-md cursor-pointer`
          : `${colorScheme.border} bg-white dark:bg-slate-800 hover:shadow-lg hover:scale-[1.01] cursor-pointer`
      }`}
    >
      {/* Soft background tint in top area */}
      <div
        className={`absolute -top-12 -right-12 w-28 h-28 rounded-full ${colorScheme.bg} opacity-50 dark:opacity-20 pointer-events-none group-hover:scale-125 transition-transform duration-300`}
      />

      {/* Top Header: Category tag is intentionally REMOVED per user brief. Only shows draft quantity or off state */}
      <div className="flex items-center justify-between z-10 w-full min-h-[22px]">
        {draftQuantity > 0 ? (
          <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-600 dark:bg-orange-500 text-white shadow-2xs animate-in zoom-in-50">
            x{draftQuantity} no pedido
          </span>
        ) : (
          <span />
        )}

        {!isCardActive && (
          <span className="text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
            Desativado
          </span>
        )}
      </div>

      {/* Center: BIG INITIALS with Group Text Color */}
      <div className="my-auto py-2 z-10 flex flex-col items-center justify-center">
        <div
          className={`font-black tracking-tight ${colorScheme.text} group-hover:scale-105 transition-transform duration-200 drop-shadow-xs font-mono text-center ${
            initials.length <= 2
              ? 'text-4xl sm:text-5xl'
              : initials.length <= 4
              ? 'text-2xl sm:text-3xl tracking-tight'
              : 'text-xl sm:text-2xl tracking-tighter'
          }`}
        >
          {initials}
        </div>
      </div>

      {/* Bottom: Item Name + Plus Button */}
      <div className="z-10 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
        <span
          className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate"
          title={card.name}
        >
          {card.name}
        </span>
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
            draftQuantity > 0
              ? 'bg-orange-500 text-white shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white group-hover:bg-slate-200 dark:group-hover:bg-slate-600'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

interface CardGridProps {
  cards: CardItem[];
  categories: string[];
  categoryColors?: Record<string, string>;
  draftItems: OrderItemLine[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onSelectCard: (card: CardItem) => void;
  onNavigateToMenuEdit: () => void;
}

export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  categories,
  categoryColors,
  draftItems,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onSelectCard,
  onNavigateToMenuEdit,
}) => {
  const [showInactive, setShowInactive] = useState(false);

  const allCategoryTabs = ['All', ...categories];

  const totalCardsCount = cards.length;
  const activeCards = cards.filter((c) => c.isActive !== false);
  const inactiveCardsCount = totalCardsCount - activeCards.length;

  const cardsToFilter = showInactive ? cards : activeCards;

  const filteredCards = cardsToFilter.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.initials.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDraftQty = (cardId: string) => {
    const found = draftItems.find((it) => it.cardId === cardId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="space-y-6">
      {/* Intro Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Order Cards
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            O contorno de cada card reflete a cor do seu grupo. Toque para adicionar ao pedido ativo.
          </p>
        </div>

        {/* Action to switch to Menu Edit tab */}
        <div className="flex items-center gap-2 flex-wrap">
          {inactiveCardsCount > 0 && (
            <button
              type="button"
              onClick={() => setShowInactive(!showInactive)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                showInactive
                  ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {showInactive ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Ocultar Desativados</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ver Desativados ({inactiveCardsCount})</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onNavigateToMenuEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:border-indigo-300 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Editar Grupos &amp; Cores</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou iniciais..."
            className="w-full pl-3.5 pr-8 py-2 bg-white dark:bg-slate-800 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 placeholder:text-slate-400 dark:placeholder:text-slate-400 text-slate-900 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Categories pill list */}
        {allCategoryTabs.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {allCategoryTabs.map((cat) => {
              const catScheme = cat === 'All' ? null : getCategoryColorScheme(cat, categoryColors);

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
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
        )}
      </div>

      {/* Grid of Cards */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCards.map((card) => (
            <CardItemView
              key={card.id}
              card={card}
              draftQuantity={getDraftQty(card.id)}
              onSelect={onSelectCard}
              categoryColors={categoryColors}
            />
          ))}

          {/* Quick shortcut to Menu Edit */}
          <button
            type="button"
            onClick={onNavigateToMenuEdit}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 group min-h-[175px] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 group-hover:border-indigo-300 dark:group-hover:border-indigo-500 group-hover:scale-110 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-all shadow-2xs mb-2">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
              Grupos &amp; Cores
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
              Definir cor de cada grupo
            </span>
          </button>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-8">
          <p className="text-slate-500 dark:text-slate-300 text-sm">
            {cardsToFilter.length === 0
              ? 'Nenhum card ativo. Todos os cards podem estar desativados.'
              : `Nenhum card encontrado para "${searchQuery}"`}
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 underline cursor-pointer"
              >
                Limpar busca
              </button>
            )}
            <button
              type="button"
              onClick={onNavigateToMenuEdit}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 underline cursor-pointer"
            >
              Abrir Edição de Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
