import React from 'react';
import { Layers, Activity, Volume2, VolumeX, Sparkles, SlidersHorizontal, Plus, Moon, Sun, Maximize2, Coffee } from 'lucide-react';
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
  onToggleFullScreen?: () => void;
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
  onToggleFullScreen,
}) => {
  const activeOrdersTotal = queueCount + ovenCount;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-lg shadow-sm shadow-amber-500/20 dark:shadow-amber-500/40">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white tracking-tight leading-tight">
                OrderFlow Cafe
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
          </div>
        </div>

        {/* 3 Tabs Switcher: Cards, Tracking, Menu Edit */}
        <nav className="flex items-center p-1 bg-stone-100 dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800">
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setActiveTab('cards');
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800/60'
            }`}
          >
            <Layers className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            <span>Menu Cards</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setActiveTab('tracking');
            }}
            className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
              activeTab === 'tracking'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Kitchen Tracking</span>
            {activeOrdersTotal > 0 && (
              <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-black rounded-full bg-amber-500 text-stone-950 shadow-xs">
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
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800/60'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span>Menu Editor</span>
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
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200/80 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 shadow-2xs"
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-stone-600" />
                <span className="hidden md:inline">Dark</span>
              </>
            )}
          </button>

          {activeTab === 'cards' && onToggleFullScreen && (
            <button
              type="button"
              onClick={onToggleFullScreen}
              title="Open Full Screen Mode"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/70 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300/80 dark:border-amber-700/60 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Full Screen</span>
            </button>
          )}

          {activeTab === 'menu-edit' && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Item</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}

          <button
            type="button"
            onClick={onQuickDemoOrder}
            title="Send quick demo order ticket"
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-900 hover:bg-stone-200/70 dark:hover:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-800 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Demo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              sounds.enabled = next;
              setSoundEnabled(next);
              if (next) sounds.playPop();
            }}
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
            className="p-2 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-900 rounded-lg border border-transparent hover:border-stone-200 dark:hover:border-stone-800 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-stone-600 dark:text-stone-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400 dark:text-stone-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
