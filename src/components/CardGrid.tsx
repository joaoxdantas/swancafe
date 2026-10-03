import React, { useState, useMemo } from 'react';
import { CardItem, OrderItemLine } from '../types';
import {
  Plus,
  SlidersHorizontal,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowDownAZ,
  ArrowUpZA,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import { getCategoryColorScheme, getCategoryBarcode, sounds } from '../utils/helpers';
import { CategoryItemIcon } from './CategoryItemIcon';

interface CardItemViewProps {
  card: CardItem;
  draftQuantity: number;
  onSelect: (card: CardItem) => void;
  categoryColors?: Record<string, string>;
  categoryBarcodes?: Record<string, string>;
  compact?: boolean;
}

export const CardItemView: React.FC<CardItemViewProps> = ({
  card,
  draftQuantity,
  onSelect,
  categoryColors,
  categoryBarcodes,
  compact = false,
}) => {
  const isCardActive = card.isActive !== false;
  const initials = card.initials || '??';

  // The outline and color scheme comes from the card's category / group
  const colorScheme = getCategoryColorScheme(card.category, categoryColors);
  const barcodeData = getCategoryBarcode(card.category, categoryBarcodes);

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
      className={`group relative flex flex-col justify-between ${
        compact
          ? 'p-2.5 sm:p-3 rounded-xl border-2 min-h-[110px] sm:min-h-[120px]'
          : 'p-3.5 sm:p-4 rounded-xl border-2 min-h-[135px] sm:min-h-[145px]'
      } transition-all duration-200 select-none text-left overflow-hidden ${
        !isCardActive
          ? 'opacity-40 grayscale cursor-not-allowed border-stone-300 dark:border-stone-750 bg-stone-50 dark:bg-stone-850/50'
          : draftQuantity > 0
          ? `${colorScheme.border} bg-white dark:bg-stone-850 ring-3 ${colorScheme.ring} shadow-sm cursor-pointer`
          : `${colorScheme.border} bg-white dark:bg-stone-850 hover:shadow-md hover:scale-[1.01] cursor-pointer`
      }`}
    >
      {/* Soft background tint in top area */}
      <div
        className={`absolute -top-10 -right-10 w-20 h-20 rounded-full ${colorScheme.bg} opacity-40 dark:opacity-20 pointer-events-none group-hover:scale-125 transition-transform duration-300`}
      />

      {/* Top Header: Draft quantity counter & Item Reference Number */}
      <div className="flex items-center justify-between z-10 w-full min-h-[20px] gap-1">
        {draftQuantity > 0 ? (
          <span className="flex items-center px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-600 dark:bg-amber-500 text-white shadow-2xs animate-in zoom-in-50">
            x{draftQuantity}
          </span>
        ) : (
          <span
            className="text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded tracking-wider truncate max-w-[110px]"
            title={`Reference Barcode: ${barcodeData.code} (${card.category || 'Item'})`}
          >
            Ref {barcodeData.code}
          </span>
        )}

        {!isCardActive ? (
          <span className="text-[10px] font-bold text-stone-500 bg-stone-200 dark:bg-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-full">
            Off
          </span>
        ) : draftQuantity > 0 ? (
          <span
            className="text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded tracking-wider"
            title={`Reference Barcode: ${barcodeData.code}`}
          >
            Ref {barcodeData.code}
          </span>
        ) : null}
      </div>

      {/* Center: 1:1 Fixed-Proportion Icon on left side of initials, Centered */}
      <div className="my-auto py-1 z-10 flex items-center justify-center gap-2 sm:gap-2.5">
        <CategoryItemIcon
          category={card.category}
          imageUrl={card.imageUrl}
          itemName={card.name}
          colorScheme={colorScheme}
          compact={compact}
        />
        <div
          className={`font-black tracking-tight ${colorScheme.text} group-hover:scale-105 transition-transform duration-200 drop-shadow-xs font-mono text-center leading-none ${
            compact
              ? initials.length <= 2
                ? 'text-xl sm:text-2xl'
                : initials.length <= 4
                ? 'text-base sm:text-lg tracking-tight'
                : 'text-xs sm:text-sm tracking-tighter'
              : initials.length <= 2
              ? 'text-2xl sm:text-3xl'
              : initials.length <= 4
              ? 'text-lg sm:text-xl tracking-tight'
              : 'text-sm sm:text-base tracking-tighter'
          }`}
        >
          {initials}
        </div>
      </div>

      {/* Bottom: Item Name + Plus Button */}
      <div className="z-10 pt-1.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-1.5">
        <span
          className="text-xs font-bold text-stone-800 dark:text-white truncate"
          title={card.name}
        >
          {card.name}
        </span>
        <div
          className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} rounded-full flex items-center justify-center transition-all shrink-0 ${
            draftQuantity > 0
              ? 'bg-amber-500 text-stone-950 shadow-2xs'
              : 'bg-stone-100 dark:bg-stone-750 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-white group-hover:bg-stone-200 dark:group-hover:bg-stone-700'
          }`}
        >
          <Plus className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </div>
      </div>
    </div>
  );
};

interface CardGridProps {
  cards: CardItem[];
  categories: string[];
  categoryColors?: Record<string, string>;
  categoryBarcodes?: Record<string, string>;
  draftItems: OrderItemLine[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onSelectCard: (card: CardItem) => void;
  onNavigateToMenuEdit: () => void;
  compact?: boolean;
}

export type SortMode = 'default' | 'az' | 'za' | 'group';

export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  categories,
  categoryColors,
  categoryBarcodes,
  draftItems,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onSelectCard,
  onNavigateToMenuEdit,
  compact = false,
}) => {
  const [showInactive, setShowInactive] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [groupByType, setGroupByType] = useState<boolean>(true);

  const allCategoryTabs = ['All', ...categories];

  const totalCardsCount = cards.length;
  const activeCards = cards.filter((c) => c.isActive !== false);
  const inactiveCardsCount = totalCardsCount - activeCards.length;

  const cardsToFilter = showInactive ? cards : activeCards;

  // Filter and Sort Cards
  const processedCards = useMemo(() => {
    let result = cardsToFilter.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.initials.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Apply sorting
    if (sortMode === 'az') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    } else if (sortMode === 'za') {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: 'base' }));
    } else if (sortMode === 'group') {
      result = [...result].sort((a, b) => {
        const catA = a.category || 'General';
        const catB = b.category || 'General';
        const comp = catA.localeCompare(catB);
        return comp !== 0 ? comp : a.name.localeCompare(b.name);
      });
    }

    return result;
  }, [cardsToFilter, searchQuery, selectedCategory, sortMode]);

  // Group items by category / type
  const groupedCategories = useMemo(() => {
    if (!groupByType || selectedCategory !== 'All') return null;

    const baseCategories =
      sortMode === 'az'
        ? [...categories].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
        : sortMode === 'za'
        ? [...categories].sort((a, b) => b.localeCompare(a, undefined, { sensitivity: 'base' }))
        : categories;

    // Build map for each category that has matching items
    const groups: { category: string; cards: CardItem[] }[] = [];
    const usedIds = new Set<string>();

    baseCategories.forEach((cat) => {
      const itemsInCat = processedCards.filter((c) => c.category === cat);
      if (itemsInCat.length > 0) {
        groups.push({ category: cat, cards: itemsInCat });
        itemsInCat.forEach((c) => usedIds.add(c.id));
      }
    });

    // Catch any items without defined category
    const remaining = processedCards.filter((c) => !usedIds.has(c.id));
    if (remaining.length > 0) {
      groups.push({ category: 'Other Items', cards: remaining });
    }

    return groups;
  }, [groupByType, selectedCategory, categories, processedCards, sortMode]);

  const getDraftQty = (cardId: string) => {
    const found = draftItems.find((it) => it.cardId === cardId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="space-y-5">
      {/* Action Header & Tools Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/80 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight">
            Menu Cards
          </h2>
          <span className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md">
            {processedCards.length}
          </span>
        </div>

        {/* Organization & Reorder Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Group by Type Toggle */}
          {selectedCategory === 'All' && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setGroupByType(!groupByType);
              }}
              title={groupByType ? 'View continuous grid' : 'Group by category'}
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

          {/* Sort: A-Z / Z-A / Default */}
          <div className="flex items-center bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-0.5">
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setSortMode('default');
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                sortMode === 'default'
                  ? 'bg-stone-100 dark:bg-stone-700 text-stone-900 dark:text-white'
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

          {/* Toggle Inactive Cards */}
          {inactiveCardsCount > 0 && (
            <button
              type="button"
              onClick={() => setShowInactive(!showInactive)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                showInactive
                  ? 'bg-stone-800 dark:bg-stone-700 text-white border-stone-800 dark:border-stone-600'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
              }`}
            >
              {showInactive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showInactive ? 'Hide Inactive' : `Inactive (${inactiveCardsCount})`}</span>
            </button>
          )}

          {/* Switch to Menu Edit */}
          <button
            type="button"
            onClick={onNavigateToMenuEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Edit Categories</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar & Category Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs sm:max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-3.5 pr-8 py-2 bg-white dark:bg-stone-800 text-sm border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 placeholder:text-stone-400 dark:placeholder:text-stone-500 text-stone-900 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Categories list */}
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
                      ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-950 shadow-xs'
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
        )}
      </div>

      {/* RENDER MODE 1: GROUPED BY TYPE */}
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

                  {/* Group's Cards Grid */}
                  <div
                    className={
                      compact
                        ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3'
                        : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4'
                    }
                  >
                    {grp.cards.map((card) => (
                      <CardItemView
                        key={card.id}
                        card={card}
                        draftQuantity={getDraftQty(card.id)}
                        onSelect={onSelectCard}
                        categoryColors={categoryColors}
                        categoryBarcodes={categoryBarcodes}
                        compact={compact}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-stone-850 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-8">
            <p className="text-stone-500 dark:text-stone-300 text-sm">
              No menu items found.
            </p>
          </div>
        )
      ) : (
        /* RENDER MODE 2: FLAT GRID */
        processedCards.length > 0 ? (
          <div
            className={
              compact
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3'
                : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4'
            }
          >
            {processedCards.map((card) => (
              <CardItemView
                key={card.id}
                card={card}
                draftQuantity={getDraftQty(card.id)}
                onSelect={onSelectCard}
                categoryColors={categoryColors}
                categoryBarcodes={categoryBarcodes}
                compact={compact}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-stone-850 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-8">
            <p className="text-stone-500 dark:text-stone-300 text-sm">
              No menu items found.
            </p>
          </div>
        )
      )}
    </div>
  );
};
