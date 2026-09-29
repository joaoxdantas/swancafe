import React, { useState } from 'react';
import { CardItem, OrderItemLine } from '../types';
import { Plus, SlidersHorizontal, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface CardItemViewProps {
  card: CardItem;
  draftQuantity: number;
  onSelect: (card: CardItem) => void;
}

export const CardItemView: React.FC<CardItemViewProps> = ({
  card,
  draftQuantity,
  onSelect,
}) => {
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
      onClick={() => isCardActive && onSelect(card)}
      role="button"
      tabIndex={isCardActive ? 0 : -1}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && isCardActive) {
          e.preventDefault();
          onSelect(card);
        }
      }}
      className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 select-none text-left overflow-hidden min-h-[175px] ${
        !isCardActive
          ? 'opacity-50 grayscale cursor-not-allowed border-slate-200 bg-slate-50'
          : draftQuantity > 0
          ? `${colorScheme.border} bg-white ring-2 ring-orange-500/60 shadow-sm cursor-pointer hover:shadow-md`
          : `${colorScheme.border} bg-white hover:border-slate-400 hover:shadow-md cursor-pointer`
      }`}
    >
      {/* Light soft background tint in top area */}
      <div
        className={`absolute -top-12 -right-12 w-28 h-28 rounded-full ${colorScheme.bg} opacity-60 pointer-events-none group-hover:scale-125 transition-transform duration-300`}
      />

      {/* Top Header: Category Tag & Draft Count Badge */}
      <div className="flex items-center justify-between z-10 w-full">
        <div className="flex items-center gap-1.5 flex-wrap">
          {card.category ? (
            <span
              className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                isCardActive ? colorScheme.badge : 'bg-slate-200 text-slate-500'
              }`}
            >
              {card.category}
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400">Card</span>
          )}

          {/* Draft Quantity Tag */}
          {draftQuantity > 0 && (
            <span className="flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-600 text-white shadow-2xs animate-in zoom-in-50">
              x{draftQuantity} in order
            </span>
          )}
        </div>

        {!isCardActive && (
          <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
            Turned Off
          </span>
        )}
      </div>

      {/* Center: BIG INITIALS */}
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

      {/* Bottom: SMALL NAME ON THE CARD */}
      <div className="z-10 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <span
          className="text-xs sm:text-sm font-semibold text-slate-800 truncate"
          title={card.name}
        >
          {card.name}
        </span>
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
            draftQuantity > 0
              ? 'bg-orange-500 text-white shadow-2xs'
              : 'bg-slate-50 border border-slate-200 text-slate-400 group-hover:text-slate-900 group-hover:border-slate-300 group-hover:bg-slate-100'
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Order Cards
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Tap cards to add multiple items to the active buzzer order above.
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
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {showInactive ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide Off Items</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Show Off ({inactiveCardsCount})</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onNavigateToMenuEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-indigo-200 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 hover:border-indigo-300 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Menu Edit &amp; Categories</span>
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
            placeholder="Search cards by name or initials..."
            className="w-full pl-3.5 pr-8 py-2 bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 placeholder:text-slate-400 text-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Categories pill list */}
        {allCategoryTabs.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {allCategoryTabs.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
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
            />
          ))}

          {/* Quick shortcut to Menu Edit */}
          <button
            type="button"
            onClick={onNavigateToMenuEdit}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-300 transition-all duration-200 group min-h-[175px] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 group-hover:border-indigo-300 group-hover:scale-110 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all shadow-2xs mb-2">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-700">
              Manage in Menu Edit
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Categories, edits &amp; on/off
            </span>
          </button>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-8">
          <p className="text-slate-500 text-sm">
            {cardsToFilter.length === 0
              ? 'No active cards. All cards might be turned off in Menu Edit.'
              : `No cards found matching "${searchQuery}"`}
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs font-medium text-orange-600 hover:text-orange-700 underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
            <button
              type="button"
              onClick={onNavigateToMenuEdit}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
            >
              Open Menu Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
