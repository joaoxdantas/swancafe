import React, { useState } from 'react';
import { CardItem, OrderItemLine } from '../types';
import { BuzzerModal } from './BuzzerModal';
import {
  Send,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Maximize2,
} from 'lucide-react';
import { sounds } from '../utils/helpers';

interface OrderComposerProps {
  draftItems: OrderItemLine[];
  onUpdateQuantity: (cardId: string, delta: number) => void;
  onClearDraft: () => void;
  buzzerNumber: string;
  setBuzzerNumber: (val: string) => void;
  onSendOrder: (notes?: string, customBuzzer?: string) => void;
  availableCards?: CardItem[];
  onAddCardToDraft?: (card: CardItem) => void;
  onToggleFullScreen?: () => void;
}

export const OrderComposer: React.FC<OrderComposerProps> = ({
  draftItems,
  onUpdateQuantity,
  onClearDraft,
  onSendOrder,
  onToggleFullScreen,
}) => {
  const [notes, setNotes] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isBuzzerModalOpen, setIsBuzzerModalOpen] = useState(false);

  const totalItemsCount = draftItems.reduce((acc, it) => acc + it.quantity, 0);

  // Open Buzzer Popup modal when Send Order is clicked: Empty by default
  const handleOpenSendModal = () => {
    if (draftItems.length === 0) return;
    sounds.playPop();
    setIsBuzzerModalOpen(true);
  };

  const handleConfirmSend = (buzzerNumber: string) => {
    onSendOrder(notes.trim(), buzzerNumber);
    setNotes('');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-md overflow-hidden transition-all duration-200 mb-6">
      {/* Top Banner: Floating Send Order button + Full Screen Button */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-transparent dark:border-slate-700">
        {/* Left: Active Order Status & Count */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold tracking-tight text-white">
              Pedido Ativo
            </span>
            {draftItems.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-600 text-white shadow-2xs">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'itens'}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          {/* Full Screen Mode Button */}
          {onToggleFullScreen && (
            <button
              type="button"
              onClick={onToggleFullScreen}
              title="Abrir em Tela Cheia (Dividida em 2 colunas)"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Tela Cheia</span>
            </button>
          )}

          {draftItems.length > 0 && (
            <button
              type="button"
              onClick={onClearDraft}
              className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
            >
              Limpar
            </button>
          )}

          {/* THE SEND ORDER BUTTON: ALWAYS VISIBLE */}
          <button
            type="button"
            onClick={handleOpenSendModal}
            disabled={draftItems.length === 0}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm sm:text-base shadow-lg transition-all cursor-pointer ${
              draftItems.length > 0
                ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/30 hover:scale-[1.02] active:scale-95 ring-2 ring-orange-500/50'
                : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Enviar Pedido</span>
          </button>

          {draftItems.length > 0 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer bg-slate-800/60 hover:bg-slate-700"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Order Items Tray */}
      {isExpanded && draftItems.length > 0 && (
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {draftItems.map((item) => (
              <div
                key={item.cardId}
                className="flex items-center justify-between p-3 bg-slate-50/90 dark:bg-slate-750/90 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs gap-3"
              >
                {/* Big Initials Badge with Group Outline */}
                <div
                  className={`min-w-13 px-1.5 h-12 rounded-xl border-2 ${item.colorScheme.border} ${item.colorScheme.bg} flex items-center justify-center font-mono font-black shrink-0 ${
                    item.initials.length <= 2
                      ? 'text-xl'
                      : item.initials.length <= 4
                      ? 'text-sm font-bold tracking-tight'
                      : 'text-xs tracking-tighter'
                  } ${item.colorScheme.text}`}
                >
                  {item.initials}
                </div>

                {/* Small Name & Count */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {item.cardName}
                  </h4>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Qtd: <strong className="text-slate-800 dark:text-slate-200 font-bold">{item.quantity}</strong>
                  </span>
                </div>

                {/* Counter controls: - and + */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-600 shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.cardId, -1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-600 transition-colors shadow-2xs cursor-pointer"
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
                    onClick={() => onUpdateQuantity(item.cardId, 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-600 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick notes input */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
              Obs:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mesa, ponto, sem ingrediente..."
              className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 placeholder:text-slate-400 dark:placeholder:text-slate-400"
            />
          </div>
        </div>
      )}

      {/* CLEAN BUZZER MODAL: Touchscreen numeric only, empty by default, default 000 */}
      <BuzzerModal
        isOpen={isBuzzerModalOpen}
        onClose={() => setIsBuzzerModalOpen(false)}
        onConfirm={handleConfirmSend}
        itemCount={totalItemsCount}
      />
    </div>
  );
};
