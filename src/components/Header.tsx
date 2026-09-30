import React from 'react';
import { Layers, Activity, Volume2, VolumeX, Sparkles, SlidersHorizontal, Plus, Moon, Sun } from 'lucide-react';
import { sounds } from '../utils/helpers';

interface HeaderProps {
  activeTab: 'cards' | 'tracking' | 'menu-edit';
  setActiveTab: (tab: 'cards' | 'tracking' | 'menu-edit') => void;
  queueCount: number;
  ovenCount: number;
  onOpenAddModal: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onQuickDemoOrder: () => void;
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  queueCount,
  ovenCount,
  onOpenAddModal,
  soundEnabled,
  setSoundEnabled,
  onQuickDemoOrder,
  darkMode,
  setDarkMode,
}) => {
  const activeOrdersTotal = queueCount + ovenCount;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-orange-500/20 dark:shadow-orange-500/40">
            OF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                OrderFlow
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Clean Dispatch &amp; Kitchen Tracking
            </p>
          </div>
        </div>

        {/* 3 Tabs Switcher: Cards, Tracking, Menu Edit */}
        <nav className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setActiveTab('cards');
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Cards</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setActiveTab('tracking');
            }}
            className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
              activeTab === 'tracking'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-orange-500 dark:text-orange-400" />
            <span>Tracking</span>
            {activeOrdersTotal > 0 && (
              <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-black rounded-full bg-orange-500 dark:bg-orange-500 text-white shadow-xs">
                {activeOrdersTotal}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setActiveTab('menu-edit');
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
              activeTab === 'menu-edit'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span>Menu Edit</span>
          </button>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* DARK MODE TOGGLE */}
          <button
            type="button"
            onClick={() => {
              const next = !darkMode;
              setDarkMode(next);
              sounds.playPop();
            }}
            title={darkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            aria-label={darkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 shadow-2xs"
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span className="hidden md:inline">Escuro</span>
              </>
            )}
          </button>

          {activeTab === 'menu-edit' && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Item</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}

          <button
            type="button"
            onClick={onQuickDemoOrder}
            title="Enviar pedido de teste rápido"
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Teste</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              sounds.enabled = next;
              setSoundEnabled(next);
              if (next) sounds.playPop();
            }}
            title={soundEnabled ? 'Silenciar sons' : 'Ativar sons'}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
