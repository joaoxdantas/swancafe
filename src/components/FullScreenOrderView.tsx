import React, { useState } from 'react';
import { CardItem, OrderItemLine } from '../types';
import { CardGrid } from './CardGrid';
import { BuzzerModal } from './BuzzerModal';
import { CategoryBarcode } from './CategoryBarcode';
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
  X,
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
  onSendOrder: (notes?: string, customBuzzer?: string) => void;
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
}) => {
  const [notes, setNotes] = useState('');
  const [isBuzzerModalOpen, setIsBuzzerModalOpen] = useState(false);

  const totalItemsCount = draftItems.reduce((acc, it) => acc + it.quantity, 0);

  const handleOpenBuzzerModal = () => {
    if (draftItems.length === 0) return;
    sounds.playPop();
    setIsBuzzerModalOpen(true);
  };

  const handleConfirmBuzzer = (buzzerNumber: string) => {
    onSendOrder(notes.trim(), buzzerNumber);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 font-sans animate-in fade-in duration-150">
      {/* Top Header Bar */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-orange-500/30">
            OF
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              OrderFlow
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
              Tela Cheia
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
            title={soundEnabled ? 'Silenciar sons' : 'Ativar sons'}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !darkMode;
              setDarkMode(next);
              sounds.playPop();
            }}
            title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Exit Full Screen Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onExitFullScreen();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xs transition-colors cursor-pointer"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Sair Tela Cheia</span>
          </button>
        </div>
      </header>

      {/* Main 2-Column Split Layout: Exactly 60% Left for Cards, 40% Right for Order Comanda */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN (60%): Cards Menu Grid (Scrollable, Compact Cards) */}
        <div className="w-[60%] h-full overflow-y-auto p-3 sm:p-4 md:p-5 border-r border-slate-200 dark:border-slate-800 shrink-0">
          <CardGrid
            cards={cards}
            categories={categories}
            categoryColors={categoryColors}
            draftItems={draftItems}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onSelectCard={onSelectCard}
            onNavigateToMenuEdit={onNavigateToMenuEdit}
            compact={true}
          />
        </div>

        {/* RIGHT COLUMN (40%): Items receiving the clicked order + Floating Send Button */}
        <div className="w-[40%] h-full flex flex-col bg-white dark:bg-slate-900 shadow-xl relative shrink-0">
          {/* Right Column Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-850">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pedido Atual
              </h3>
              {totalItemsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-orange-600 text-white shadow-2xs">
                  {totalItemsCount}
                </span>
              )}
            </div>

            {draftItems.length > 0 && (
              <button
                type="button"
                onClick={onClearDraft}
                className="text-xs font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Middle: Scrollable list of clicked items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-28">
            {draftItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500 space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Nenhum item selecionado
                </p>
                <p className="text-xs max-w-[220px]">
                  Clique nos cards à esquerda para adicionar ao pedido.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {draftItems.map((item) => {
                    const itemCategory = item.category || cards.find((c) => c.id === item.cardId)?.category || 'General';
                    const barcodeData = getCategoryBarcode(itemCategory, categoryBarcodes);

                    return (
                      <div
                        key={item.cardId}
                        className="p-3 bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2.5"
                      >
                        {/* Item Row */}
                        <div className="flex items-center justify-between gap-3">
                          {/* Initials badge with group border */}
                          <div
                            className={`min-w-12 px-1.5 h-11 rounded-xl border-2 ${item.colorScheme.border} ${item.colorScheme.bg} flex items-center justify-center font-mono font-black shrink-0 ${
                              item.initials.length <= 2
                                ? 'text-lg'
                                : item.initials.length <= 4
                                ? 'text-sm'
                                : 'text-xs'
                            } ${item.colorScheme.text}`}
                          >
                            {item.initials}
                          </div>

                          {/* Card name */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {item.cardName}
                            </h4>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              Qtd: <strong className="text-slate-800 dark:text-slate-200">{item.quantity}</strong>
                            </span>
                          </div>

                          {/* Counter Controls: - and + */}
                          <div className="flex items-center gap-1 bg-white dark:bg-slate-700/80 p-1 rounded-xl border border-slate-200 dark:border-slate-600 shrink-0">
                            <button
                              type="button"
                              onClick={() => onUpdateDraftQuantity(item.cardId, -1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors shadow-2xs cursor-pointer"
                            >
                              {item.quantity === 1 ? (
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              ) : (
                                <Minus className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <span className="w-6 text-center font-mono font-bold text-xs text-slate-900 dark:text-white">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => onUpdateDraftQuantity(item.cardId, 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors shadow-2xs cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Category Barcode Below Item (Reference Sheet Style) */}
                        <CategoryBarcode
                          categoryName={barcodeData.name}
                          barcodeNumber={barcodeData.code}
                        />
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
                    placeholder="Observação do pedido (opcional)..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* FLOATING SEND BUTTON: ALWAYS VISIBLE AT BOTTOM */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 dark:to-transparent pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={handleOpenBuzzerModal}
              disabled={draftItems.length === 0}
              className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
                draftItems.length > 0
                  ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/30 hover:scale-[1.01] active:scale-98 ring-2 ring-orange-500/40'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-75'
              }`}
            >
              <Send className="w-5 h-5" />
              <span>
                Enviar Pedido {totalItemsCount > 0 ? `(${totalItemsCount})` : ''}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* BUZZER MODAL: Numeric-only on touchscreen, defaults to 000 if empty */}
      <BuzzerModal
        isOpen={isBuzzerModalOpen}
        onClose={() => setIsBuzzerModalOpen(false)}
        onConfirm={handleConfirmBuzzer}
        itemCount={totalItemsCount}
      />
    </div>
  );
};
