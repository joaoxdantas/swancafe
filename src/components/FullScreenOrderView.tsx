import React, { useState } from 'react';
import { CardItem, OrderItem, OrderItemLine } from '../types';
import { CardGrid } from './CardGrid';
import { BuzzerModal } from './BuzzerModal';
import { CategoryBarcode } from './CategoryBarcode';
import { CategoryItemIcon } from './CategoryItemIcon';
import {
  Send,
  Plus,
  Minus,
  Trash2,
  Minimize2,
  ShoppingBag,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Coffee,
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { sounds, getCategoryBarcode } from '../utils/helpers';

interface FullScreenOrderViewProps {
  cards: CardItem[];
  categories: string[];
  categoryColors?: Record<string, string>;
  categoryBarcodes?: Record<string, string>;
  draftItems: OrderItemLine[];
  onSelectCard: (card: CardItem) => void;
  onUpdateDraftQuantity: (cardId: string, delta: number) => void;
  onClearDraft: () => void;
  onSendOrder: (notes?: string, customBuzzer?: string, isDigital?: boolean, existingOrderId?: string) => void;
  onExitFullScreen: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onNavigateToMenuEdit: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  existingOrders: OrderItem[];
}

export const FullScreenOrderView: React.FC<FullScreenOrderViewProps> = ({
  cards,
  categories,
  categoryColors,
  categoryBarcodes,
  draftItems,
  onSelectCard,
  onUpdateDraftQuantity,
  onClearDraft,
  onSendOrder,
  onExitFullScreen,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onNavigateToMenuEdit,
  soundEnabled,
  setSoundEnabled,
  darkMode,
  setDarkMode,
  existingOrders,
}) => {
  const [notes, setNotes] = useState('');
  const [isBuzzerModalOpen, setIsBuzzerModalOpen] = useState(false);
  const [hiddenBarcodes, setHiddenBarcodes] = useState<Set<string>>(new Set());

  const totalItemsCount = draftItems.reduce((acc, it) => acc + it.quantity, 0);

  const handleOpenBuzzerModal = () => {
    if (draftItems.length === 0) return;
    sounds.playPop();
    setIsBuzzerModalOpen(true);
  };

  const handleConfirmBuzzer = (buzzerNumber: string, isDigital?: boolean, existingOrderId?: string) => {
    onSendOrder(notes.trim(), buzzerNumber, isDigital, existingOrderId);
    setNotes('');
    setHiddenBarcodes(new Set());
  };

  const toggleBarcodeVisibility = (cardId: string) => {
    sounds.playPop();
    setHiddenBarcodes((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const handleUnhideAllBarcodes = () => {
    sounds.playPop();
    setHiddenBarcodes(new Set());
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-50 dark:bg-stone-950 flex flex-col overflow-hidden text-stone-900 dark:text-stone-100 font-sans animate-in fade-in duration-150">
      {/* Top Header Bar */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-base shadow-sm shadow-amber-500/30">
            <Coffee className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-black tracking-tight text-stone-900 dark:text-white">
              Australian Cafe Kiosk
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              Full Screen (60/40 Split)
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              sounds.enabled = next;
              setSoundEnabled(next);
              if (next) sounds.playPop();
            }}
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
            className="p-2 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-stone-600 dark:text-stone-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setDarkMode(!darkMode);
            }}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600" />
            )}
          </button>

          {/* Exit Full Screen */}
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onExitFullScreen();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Full Screen</span>
          </button>
        </div>
      </header>

      {/* Main Dual-Column Workspace: 60% Left (Items Grid) / 40% Right (Order & Barcodes) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Interactive Cards Grid (60% width on desktop/kiosk) */}
        <div className="w-full lg:w-[60%] overflow-y-auto p-4 sm:p-5 lg:border-r border-stone-200 dark:border-stone-800">
          <CardGrid
            cards={cards}
            categories={categories}
            categoryColors={categoryColors}
            categoryBarcodes={categoryBarcodes}
            draftItems={draftItems}
            onSelectCard={onSelectCard}
            onNavigateToMenuEdit={onNavigateToMenuEdit}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>

        {/* Right Column: Dedicated Live Order & Barcode Scanning Column (40% width on desktop/kiosk) */}
        <div className="w-full lg:w-[40%] bg-white dark:bg-stone-900 flex flex-col shrink-0 border-t lg:border-t-0 border-stone-200 dark:border-stone-800 shadow-xl relative z-10 overflow-hidden">
          {/* Order Header */}
          <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3 bg-stone-50/50 dark:bg-stone-950/30">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Order Summary & Barcode Scanning
                </h3>
                <p className="text-xs text-stone-400">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in order · Scan barcodes to register items
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hiddenBarcodes.size > 0 && (
                <button
                  type="button"
                  onClick={handleUnhideAllBarcodes}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-300 dark:border-amber-800 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Unhide All ({hiddenBarcodes.size})</span>
                </button>
              )}

              {draftItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onClearDraft();
                    setHiddenBarcodes(new Set());
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Items List with Generous Spacing to Prevent Accidental Barcode Scans */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-32">
            {draftItems.length === 0 ? (
              <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-300 dark:text-stone-600 flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-stone-700 dark:text-stone-300">
                    No items in current order
                  </p>
                  <p className="text-xs text-stone-400 max-w-[300px]">
                    Select items from the menu on the left to generate their scannable barcodes.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {draftItems.map((item) => {
                    const barcodeData = getCategoryBarcode(
                      item.category || item.cardName,
                      categoryBarcodes
                    );
                    const isHidden = hiddenBarcodes.has(item.cardId);

                    return (
                      <div
                        key={item.cardId}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 shadow-sm ${
                          isHidden
                            ? 'bg-stone-50/70 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 opacity-90'
                            : 'bg-white dark:bg-stone-850 border-stone-300 dark:border-stone-700/80 shadow-md ring-1 ring-stone-200/50 dark:ring-stone-800'
                        }`}
                      >
                        {/* Top Row: Item Details & Quantity Steppers */}
                        <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <CategoryItemIcon
                              category={item.category}
                              imageUrl={item.imageUrl}
                              itemName={item.cardName}
                              compact
                              className="w-8 h-8 rounded-lg"
                            />
                            <span
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs border shrink-0 ${item.colorScheme.border} ${item.colorScheme.bg} ${item.colorScheme.text}`}
                            >
                              {item.initials}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm sm:text-base font-black text-stone-900 dark:text-white truncate">
                                {item.cardName}
                              </p>
                              <span className="text-xs text-stone-500 dark:text-stone-400">
                                {item.category || 'General'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            {/* Quantity Steppers */}
                            <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
                              <button
                                type="button"
                                onClick={() => onUpdateDraftQuantity(item.cardId, -1)}
                                className="w-7 h-7 rounded-lg bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-600 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                              >
                                {item.quantity === 1 ? (
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                ) : (
                                  <Minus className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <span className="w-7 text-center font-mono font-black text-sm text-stone-900 dark:text-white">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => onUpdateDraftQuantity(item.cardId, 1)}
                                className="w-7 h-7 rounded-lg bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-600 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Barcode Row with Eye Toggle mounted directly adjacent to barcode bars */}
                        <div className="pt-3">
                          {isHidden ? (
                            <div className="bg-white dark:bg-stone-850 rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 border border-emerald-300/80 dark:border-emerald-800/80 shadow-xs flex items-center justify-between gap-4 w-full animate-in fade-in duration-100">
                              <div className="flex items-center gap-2.5">
                                <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  <span>Scanned · Hidden</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleBarcodeVisibility(item.cardId)}
                                  className="px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-850 text-emerald-800 dark:text-emerald-200 flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95 text-xs font-bold"
                                  title="Show barcode again"
                                >
                                  <EyeOff className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                                  <span className="text-[10px] uppercase tracking-wider">Show</span>
                                </button>
                              </div>
                              <div className="flex items-center gap-3 shrink-0 opacity-60">
                                <div className="w-[1.5px] h-7 bg-slate-200 dark:bg-slate-700 shrink-0" />
                                <div className="text-right flex flex-col justify-center min-w-[70px]">
                                  <span className="text-xs font-black text-slate-800 dark:text-stone-300 uppercase leading-tight truncate max-w-[110px]">
                                    {barcodeData.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500 dark:text-stone-400 mt-0.5">
                                    {barcodeData.code}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <CategoryBarcode
                              categoryName={barcodeData.name}
                              barcodeNumber={barcodeData.code}
                              actionAfterBarcode={
                                <button
                                  type="button"
                                  onClick={() => toggleBarcodeVisibility(item.cardId)}
                                  className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                                  title="Hide barcode after scanning"
                                >
                                  <Eye className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                                    Hide
                                  </span>
                                </button>
                              }
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Observation Notes */}
                <div className="pt-2">
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Table notes / special requests (optional)..."
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 shadow-2xs"
                  />
                </div>
              </>
            )}
          </div>

          {/* FLOATING SEND BUTTON: ALWAYS VISIBLE AT BOTTOM */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-stone-900 dark:via-stone-900/95 dark:to-transparent pt-6 border-t border-stone-100 dark:border-stone-800/80">
            <button
              type="button"
              onClick={handleOpenBuzzerModal}
              disabled={draftItems.length === 0}
              className={`w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
                draftItems.length > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/30 hover:scale-[1.01] active:scale-98 ring-2 ring-amber-400/40'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed opacity-75'
              }`}
            >
              <Send className="w-5 h-5 text-stone-950" />
              <span>
                Send Order {totalItemsCount > 0 ? `(${totalItemsCount})` : ''}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* BUZZER MODAL: Digital (Mobile QR) & Physical Modes */}
      <BuzzerModal
        isOpen={isBuzzerModalOpen}
        onClose={() => setIsBuzzerModalOpen(false)}
        onConfirm={handleConfirmBuzzer}
        itemCount={totalItemsCount}
        existingOrders={existingOrders}
        draftOrderPayload={{
          items: draftItems,
          notes,
        }}
      />
    </div>
  );
};
