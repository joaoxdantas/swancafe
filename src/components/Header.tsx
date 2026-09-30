import React from 'react';
import { Layers, Activity, Volume2, VolumeX, Sparkles, SlidersHorizontal, Plus } from 'lucide-react';
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
}) => {
  const activeOrdersTotal = queueCount + ovenCount;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-orange-500/20">
            OF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight leading-tight">
                OrderFlow
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Cloud Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Clean Dispatch &amp; Kitchen Tracking
            </p>
          </div>
        </div>

        {/* 3 Tabs Switcher: Cards, Tracking, Menu Edit */}
        <nav className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setActiveTab('cards');
            }}
            className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>Cards</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setActiveTab('tracking');
            }}
            className={`relative flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
              activeTab === 'tracking'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Activity className="w-4 h-4 text-orange-500" />
            <span>Tracking</span>
            {activeOrdersTotal > 0 && (
              <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold rounded-full bg-orange-500 text-white shadow-xs">
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
            className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
              activeTab === 'menu-edit'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
            <span>Menu Edit</span>
          </button>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
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
            title="Send quick test order"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Test</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              sounds.enabled = next;
              setSoundEnabled(next);
              if (next) sounds.playPop();
            }}
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-slate-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
