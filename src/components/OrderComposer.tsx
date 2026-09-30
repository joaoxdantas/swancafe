import React, { useState, useEffect } from 'react';
import { CardItem, OrderItemLine } from '../types';
import {
  Send,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Delete,
  X,
  Radio,
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
  const [isBuzzerModalOpen, setIsBuzzerModalOpen] = useState(false);
  const [modalBuzzerInput, setModalBuzzerInput] = useState('');

  const totalItemsCount = draftItems.reduce((acc, it) => acc + it.quantity, 0);

  // Open Buzzer Popup modal when Send Order is clicked
  const handleOpenSendModal = () => {
    if (draftItems.length === 0) return;
    sounds.playPop();
    // Pre-fill with current suggested buzzer or start empty so 000 is clean default
    setModalBuzzerInput(buzzerNumber.trim() ? buzzerNumber.replace(/#/g, '') : '');
    setIsBuzzerModalOpen(true);
  };

  // Confirm sending order
  const handleConfirmSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (draftItems.length === 0) return;

    // Default to '000' if sent without a number
    const finalBuzzer = modalBuzzerInput.trim().replace(/#/g, '') || '000';
    sounds.playSend();
    onSendOrder(notes.trim(), finalBuzzer);

    setNotes('');
    setIsBuzzerModalOpen(false);
    setModalBuzzerInput('');
  };

  // Keyboard Numpad Handlers
  const handleKeypadPress = (digit: string) => {
    sounds.playPop();
    setModalBuzzerInput((prev) => {
      if (prev.length >= 6) return prev;
      return prev + digit;
    });
  };

  const handleKeypadBackspace = () => {
    sounds.playPop();
    setModalBuzzerInput((prev) => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    sounds.playPop();
    setModalBuzzerInput('');
  };

  // Physical keyboard listener when modal is open
  useEffect(() => {
    if (!isBuzzerModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in notes input
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        if (e.key === 'Enter') {
          handleConfirmSend();
        }
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKeypadBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsBuzzerModalOpen(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirmSend();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBuzzerModalOpen, modalBuzzerInput, notes, draftItems]);

  const quickShortcuts = ['000', '1', '2', '3', '4', '5', '7', '10', '12', '14'];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-md overflow-hidden transition-all duration-200 mb-6">
      {/* Top Banner: Streamlined to just a prominent "Send Order" (Enviar Pedido) button */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-transparent dark:border-slate-700">
        {/* Left: Active Order Status & Info */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Pedido Ativo
              </span>
              {draftItems.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-orange-600 text-white shadow-2xs">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'itens'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {draftItems.length === 0
                ? 'Toque nos cards do cardápio abaixo para montar o pedido.'
                : `${draftItems.length} tipo(s) de item selecionado(s). Clique em "Enviar Pedido".`}
            </p>
          </div>
        </div>

        {/* Right: Just the "Send Order" Button + Quick Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          {draftItems.length > 0 && (
            <button
              type="button"
              onClick={onClearDraft}
              className="px-3.5 py-2.5 text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
              title="Limpar todos os itens"
            >
              Limpar
            </button>
          )}

          {/* THE SEND ORDER BUTTON */}
          <button
            type="button"
            onClick={handleOpenSendModal}
            disabled={draftItems.length === 0}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm sm:text-base shadow-lg transition-all cursor-pointer ${
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
              className="p-2.5 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer bg-slate-800/60 hover:bg-slate-700"
              title={isExpanded ? 'Recolher itens' : 'Expandir itens'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Order Items Tray */}
      {isExpanded && draftItems.length > 0 && (
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Itens no Pedido
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Ajuste quantidades com +/- ou remova com a lixeira
            </span>
          </div>

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
                    title="Diminuir"
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
                    title="Aumentar"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick notes input preview */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
              Observações da Cozinha:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Mesa 4, sem cebola, ponto da massa..."
              className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 placeholder:text-slate-400 dark:placeholder:text-slate-400"
            />
          </div>
        </div>
      )}

      {/* POPUP MODAL: BUZZER NUMBER WITH ON-SCREEN NUMBERS KEYBOARD */}
      {isBuzzerModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsBuzzerModalOpen(false)}
        >
          <div
            className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-700/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Número do Buzzer
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Se enviar sem número, o padrão será <strong>000</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBuzzerModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Order Items Summary Chip List */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                  Itens ({totalItemsCount}):
                </span>
                {draftItems.map((it) => (
                  <span
                    key={it.cardId}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 shrink-0"
                  >
                    <span>{it.quantity}x</span>
                    <span className={it.colorScheme.text}>{it.initials}</span>
                  </span>
                ))}
              </div>

              {/* Big LCD Buzzer Number Display */}
              <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-4 border border-slate-800 dark:border-slate-700 text-center relative shadow-inner">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-0.5">
                  BUZZER SELECIONADO
                </span>
                <div className="min-h-[56px] flex items-center justify-center">
                  {modalBuzzerInput ? (
                    <span className="text-5xl font-mono font-black tracking-widest text-amber-400 drop-shadow-xs">
                      {modalBuzzerInput}
                    </span>
                  ) : (
                    <span className="text-4xl font-mono font-bold tracking-widest text-slate-500 flex items-center gap-2">
                      <span>000</span>
                      <span className="text-xs font-sans font-normal text-slate-400 px-2 py-0.5 rounded-md bg-slate-800">
                        padrão
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Presets Row */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Atalhos Rápidos:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {quickShortcuts.map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => {
                        sounds.playPop();
                        setModalBuzzerInput(sc === '000' ? '' : sc);
                      }}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                        (sc === '000' && !modalBuzzerInput) || modalBuzzerInput === sc
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-xs font-black scale-105'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
              </div>

              {/* ON-SCREEN NUMBERS KEYBOARD (Touch Numpad 3x4) */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="h-13 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-700/90 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 text-slate-900 dark:text-white font-mono font-bold text-2xl border border-slate-200 dark:border-slate-600 shadow-2xs transition-all flex items-center justify-center cursor-pointer select-none"
                  >
                    {digit}
                  </button>
                ))}

                {/* Bottom Row: Clear (C), 0, Backspace */}
                <button
                  type="button"
                  onClick={handleKeypadClear}
                  className="h-13 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-700/60 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 dark:hover:text-rose-400 active:scale-95 text-slate-500 dark:text-slate-400 font-mono font-bold text-lg border border-slate-200 dark:border-slate-600 shadow-2xs transition-all flex items-center justify-center cursor-pointer select-none"
                  title="Limpar número"
                >
                  Limpar
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-13 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-700/90 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 text-slate-900 dark:text-white font-mono font-bold text-2xl border border-slate-200 dark:border-slate-600 shadow-2xs transition-all flex items-center justify-center cursor-pointer select-none"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  className="h-13 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-600 shadow-2xs transition-all flex items-center justify-center cursor-pointer select-none"
                  title="Apagar dígito"
                >
                  <Delete className="w-6 h-6" />
                </button>
              </div>

              {/* Kitchen Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Observações da Cozinha (opcional):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Mesa 4, bem passado, sem cebola..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBuzzerModalOpen(false)}
                  className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmSend()}
                  className="flex-1 py-3.5 px-5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm sm:text-base shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    Enviar Pedido ({modalBuzzerInput.trim() || '000'})
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
