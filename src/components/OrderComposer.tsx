import React, { useState } from 'react';
import { CardItem, OrderItemLine } from '../types';
import { Radio, Plus, Minus, Trash2, Send, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { sounds } from '../utils/helpers';

interface OrderComposerProps {
  draftItems: OrderItemLine[];
  onUpdateQuantity: (cardId: string, delta: number) => void;
  onClearDraft: () => void;
  buzzerNumber: string;
  setBuzzerNumber: (val: string) => void;
  onSendOrder: (notes?: string) => void;
  availableCards: CardItem[];
  onAddCardToDraft: (card: CardItem) => void;
}

export const OrderComposer: React.FC<OrderComposerProps> = ({
  draftItems,
  onUpdateQuantity,
  onClearDraft,
  buzzerNumber,
  setBuzzerNumber,
  onSendOrder,
}) => {
  const [notes, setNotes] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const totalItemsCount = draftItems.reduce((acc, it) => acc + it.quantity, 0);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (draftItems.length === 0) return;
    sounds.playSend();
    onSendOrder(notes.trim());
    setNotes('');
  };

  const quickBuzzers = ['1', '2', '3', '4', '5', '7', '10', '12', '14', '20'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden transition-all duration-200 mb-6">
      {/* Top Banner / Summary Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Buzzer Number Configuration */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Active Order for Buzzer
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-semibold text-slate-400">Buzzer</span>
              <input
                type="text"
                value={buzzerNumber}
                onChange={(e) => {
                  // Strip out any accidental # symbol
                  const clean = e.target.value.replace(/#/g, '');
                  setBuzzerNumber(clean);
                }}
                className="w-20 px-2.5 py-1 bg-slate-950 border border-slate-700 focus:border-orange-500 text-amber-400 font-mono font-black text-xl rounded-lg focus:outline-none text-center"
                placeholder="12"
              />
            </div>
          </div>
        </div>

        {/* Middle: Items Summary & Quick Buzzers */}
        <div className="flex-1 md:px-4 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Quick Buzzer:
            </span>
            {quickBuzzers.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBuzzerNumber(b)}
                className={`px-2 py-0.5 text-xs font-mono font-semibold rounded-md border transition-colors cursor-pointer ${
                  buzzerNumber === b
                    ? 'bg-amber-400 text-slate-900 border-amber-400 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-400 mt-1.5">
            {draftItems.length === 0
              ? 'Click cards below to add items to this buzzer order.'
              : `${draftItems.length} distinct item${draftItems.length > 1 ? 's' : ''} (${totalItemsCount} total)`}
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {draftItems.length > 0 && (
            <button
              type="button"
              onClick={onClearDraft}
              className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={handleSend}
            disabled={draftItems.length === 0 || !buzzerNumber.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send Buzzer {buzzerNumber.trim() || '—'} to Queue</span>
          </button>

          {draftItems.length > 0 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse items' : 'Expand items'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Order Items Tray */}
      {isExpanded && draftItems.length > 0 && (
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Items in this Buzzer Order
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Click cards below to add more, or use +/- controls
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {draftItems.map((item) => (
              <div
                key={item.cardId}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-2xs gap-3"
              >
                {/* Big Initials Badge */}
                <div
                  className={`min-w-13 px-1.5 h-12 rounded-xl border ${item.colorScheme.border} ${item.colorScheme.bg} flex items-center justify-center font-mono font-black shrink-0 ${
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
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {item.cardName}
                  </h4>
                  <span className="text-[11px] font-medium text-slate-500">
                    Qty: <strong className="text-slate-800">{item.quantity}</strong>
                  </span>
                </div>

                {/* Counter controls: - and + */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.cardId, -1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-700 hover:bg-slate-200/80 transition-colors shadow-2xs cursor-pointer"
                    title="Decrease"
                  >
                    {item.quantity === 1 ? (
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    ) : (
                      <Minus className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <span className="w-6 text-center font-mono font-bold text-xs text-slate-900">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.cardId, 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-700 hover:bg-slate-200/80 transition-colors shadow-2xs cursor-pointer"
                    title="Add another"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Kitchen notes input */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 shrink-0">
              Kitchen Notes:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Table 4, no onions, gluten free, rush"
              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 placeholder:text-slate-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};
