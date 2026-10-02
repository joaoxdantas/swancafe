import React, { useState } from 'react';
import { CardItem, OrderItem, OrderItemLine } from '../types';
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
  onSendOrder: (notes?: string, customBuzzer?: string, isDigital?: boolean, existingOrderId?: string) => void;
  availableCards?: CardItem[];
  onAddCardToDraft?: (card: CardItem) => void;
  onToggleFullScreen?: () => void;
  existingOrders: OrderItem[];
}

export const OrderComposer: React.FC<OrderComposerProps> = ({
  draftItems,
  onUpdateQuantity,
  onClearDraft,
  onSendOrder,
  onToggleFullScreen,
  existingOrders,
}) => {
  const [notes, setNotes] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isBuzzerModalOpen, setIsBuzzerModalOpen] = useState(false);

  const totalItemsCount = draftItems.reduce((acc, it) => acc + it.quantity, 0);

  // Open Buzzer Popup modal when Send Order is clicked
  const handleOpenSendModal = () => {
    if (draftItems.length === 0) return;
    sounds.playPop();
    setIsBuzzerModalOpen(true);
  };

  const handleConfirmSend = (buzzerNumber: string, isDigital?: boolean, existingOrderId?: string) => {
    onSendOrder(notes.trim(), buzzerNumber, isDigital, existingOrderId);
    setNotes('');
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-md overflow-hidden transition-all duration-200 mb-6">
      {/* Top Banner: Floating Send Order button + Full Screen Button */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-transparent dark:border-stone-800">
        {/* Left: Active Order Status & Count */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold tracking-tight text-white">
              Active Order
            </span>
            {draftItems.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-600 text-white shadow-2xs">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
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
              title="Open in Full Screen (2-column layout)"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Full Screen</span>
            </button>
          )}

          {draftItems.length > 0 && (
            <button
              type="button"
              onClick={onClearDraft}
              className="px-3 py-2 text-xs font-bold text-stone-400 hover:text-rose-400 hover:bg-stone-800/80 rounded-xl transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}

          {/* THE SEND ORDER BUTTON: ALWAYS VISIBLE */}
          <button
            type="button"
            onClick={handleOpenSendModal}
            disabled={draftItems.length === 0}
            className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              draftItems.length > 0
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/30 active:scale-98 ring-2 ring-amber-400/40'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-60'
            }`}
          >
            <Send className="w-4 h-4 text-stone-950" />
            <span>Send Order {draftItems.length > 0 ? `(${totalItemsCount})` : ''}</span>
          </button>

          {/* Expand/Collapse Chevron */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Order Items List */}
      {isExpanded && draftItems.length > 0 && (
        <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {draftItems.map((item) => (
              <div
                key={item.cardId}
                className="p-2.5 sm:p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850 flex items-center justify-between gap-3 shadow-2xs"
              >
                {/* Initials & Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-black text-xs border shrink-0 ${item.colorScheme.border} ${item.colorScheme.bg} ${item.colorScheme.text}`}
                  >
                    {item.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white truncate">
                      {item.cardName}
                    </p>
                    <p className="text-[11px] text-stone-400 truncate">
                      {item.category || 'General'}
                    </p>
                  </div>
                </div>

                {/* Steppers */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.cardId, -1)}
                    className="w-7 h-7 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {item.quantity === 1 ? (
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    ) : (
                      <Minus className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <span className="w-6 text-center font-mono font-black text-xs sm:text-sm text-stone-900 dark:text-white">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.cardId, 1)}
                    className="w-7 h-7 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick notes input */}
          <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <label className="text-xs font-bold text-stone-600 dark:text-stone-300 shrink-0">
              Notes:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Table number, extra hot, oat milk, allergy notes..."
              className="flex-1 px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />
          </div>
        </div>
      )}

      {/* BUZZER MODAL: Digital (Mobile QR) & Physical Modes */}
      <BuzzerModal
        isOpen={isBuzzerModalOpen}
        onClose={() => setIsBuzzerModalOpen(false)}
        onConfirm={handleConfirmSend}
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
