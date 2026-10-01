import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Radio } from 'lucide-react';
import { sounds } from '../utils/helpers';

interface BuzzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (buzzerNumber: string) => void;
  itemCount: number;
}

export const BuzzerModal: React.FC<BuzzerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemCount,
}) => {
  // MUST appear empty by default
  const [buzzerInput, setBuzzerInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setBuzzerInput('');
      // Small timeout to guarantee virtual keyboard focus on mobile/touch
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // If sent without typing, default is 000
    const clean = buzzerInput.trim().replace(/#/g, '');
    const finalBuzzer = clean || '000';
    sounds.playSend();
    onConfirm(finalBuzzer);
    setBuzzerInput('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const displayBuzzer = buzzerInput.trim() || '000';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-850 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Número do Buzzer
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Digite o número do buzzer
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-400">
              Caso envie sem digitar, o padrão é <strong className="text-slate-600 dark:text-slate-300">000</strong>
            </p>
          </div>

          {/* Numeric-only Input for Touchscreen Virtual Keyboard */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              autoFocus
              value={buzzerInput}
              onChange={(e) => {
                // Allow only digits
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length <= 6) {
                  setBuzzerInput(val);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="000"
              className="w-full text-center py-4 px-4 bg-slate-900 dark:bg-slate-950 text-amber-400 font-mono font-black text-5xl tracking-widest rounded-2xl border-2 border-slate-700 dark:border-slate-700 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-400/20 placeholder:text-slate-600 shadow-inner"
            />
          </div>

          {/* Quick Clear or Sample Presets */}
          {buzzerInput && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setBuzzerInput('');
                  inputRef.current?.focus();
                }}
                className="text-xs text-slate-400 hover:text-rose-500 font-semibold cursor-pointer underline"
              >
                Limpar número
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex-[2] py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-98 text-white font-black text-sm sm:text-base shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Enviar ({displayBuzzer})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
