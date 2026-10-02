import React, { useState, useEffect } from 'react';
import { OrderItem, OrderStage } from '../types';
import {
  Clock,
  Flame,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Search,
  RotateCcw,
  Zap,
  Bell,
  Smartphone,
  Radio,
} from 'lucide-react';
import { sounds } from '../utils/helpers';
import { syncTriggerOrderBuzzer } from '../firebase';

interface TrackingBoardProps {
  orders: OrderItem[];
  onUpdateStage: (orderId: string, newStage: OrderStage) => void;
  onRemoveOrder: (orderId: string) => void;
  onClearDelivered: () => void;
  onGoToCardsTab: () => void;
}

export const TrackingBoard: React.FC<TrackingBoardProps> = ({
  orders,
  onUpdateStage,
  onRemoveOrder,
  onClearDelivered,
  onGoToCardsTab,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [autoSimulate, setAutoSimulate] = useState(false);

  // Optional auto-simulation to progress orders
  useEffect(() => {
    if (!autoSimulate) return;
    const simInterval = setInterval(() => {
      const now = Date.now();
      const queuedOrders = orders.filter((o) => o.stage === 'queue');
      const readyForOven = queuedOrders.find((o) => now - o.queuedAt > 8000);
      if (readyForOven) {
        sounds.playOvenStart();
        onUpdateStage(readyForOven.id, 'oven');
        return;
      }

      const ovenOrders = orders.filter((o) => o.stage === 'oven');
      const readyForDelivery = ovenOrders.find(
        (o) => o.ovenAt && now - o.ovenAt > 12000
      );
      if (readyForDelivery) {
        sounds.playDelivered();
        onUpdateStage(readyForDelivery.id, 'delivered');
        syncTriggerOrderBuzzer(readyForDelivery.id).catch(() => {});
        return;
      }
    }, 2000);

    return () => clearInterval(simInterval);
  }, [autoSimulate, orders, onUpdateStage]);

  const cleanBuzzer = (buzzer: string) => buzzer.replace(/#/g, '');

  const filteredOrders = orders.filter((o) => {
    const bNum = cleanBuzzer(o.buzzerNumber || '');
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase().replace(/#/g, '');
    const matchesBuzzer = bNum.toLowerCase().includes(q);
    const matchesItems = (o.items || []).some(
      (it) =>
        it.cardName.toLowerCase().includes(q) ||
        it.initials.toLowerCase().includes(q)
    );
    const matchesLegacy =
      (o.cardName && o.cardName.toLowerCase().includes(q)) ||
      (o.initials && o.initials.toLowerCase().includes(q));
    const matchesNotes = o.notes && o.notes.toLowerCase().includes(q);
    return matchesBuzzer || matchesItems || matchesLegacy || matchesNotes;
  });

  // FIFO Ordering
  const queueOrders = filteredOrders
    .filter((o) => o.stage === 'queue')
    .sort((a, b) => (a.queuedAt || a.createdAt) - (b.queuedAt || b.createdAt));

  const ovenOrders = filteredOrders
    .filter((o) => o.stage === 'oven')
    .sort((a, b) => (a.ovenAt || a.queuedAt || a.createdAt) - (b.ovenAt || b.queuedAt || b.createdAt));

  const deliveredOrders = filteredOrders
    .filter((o) => o.stage === 'delivered')
    .sort((a, b) => (a.deliveredAt || a.createdAt) - (b.deliveredAt || b.createdAt));

  const handleMoveToOven = (orderId: string) => {
    sounds.playOvenStart();
    onUpdateStage(orderId, 'oven');
  };

  const handleMoveToDelivered = (orderId: string) => {
    sounds.playDelivered();
    onUpdateStage(orderId, 'delivered');
    // Automatically trigger customer mobile buzzer via Firestore!
    syncTriggerOrderBuzzer(orderId).catch(() => {});
  };

  const handleManualRebuzz = (orderId: string) => {
    sounds.playBell();
    syncTriggerOrderBuzzer(orderId).catch(() => {});
  };

  const handleMoveBackToQueue = (orderId: string) => {
    sounds.playPop();
    onUpdateStage(orderId, 'queue');
  };

  const getOrderItems = (order: OrderItem) => {
    const defaultPalette = {
      bg: 'bg-amber-50/70 dark:bg-amber-950/20',
      border: 'border-amber-500 dark:border-amber-400',
      text: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
      pillBg: 'bg-amber-500',
    };

    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      return order.items.map((it) => ({
        ...it,
        initials: it.initials || '??',
        cardName: it.cardName || 'Item',
        quantity: typeof it.quantity === 'number' && it.quantity > 0 ? it.quantity : 1,
        colorScheme: it.colorScheme || order.colorScheme || defaultPalette,
      }));
    }
    return [
      {
        cardId: order.cardId || 'legacy',
        cardName: order.cardName || 'Order Item',
        initials: order.initials || '??',
        quantity: 1,
        colorScheme: order.colorScheme || defaultPalette,
      },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Stage Statistics & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight">
              Real-Time Kitchen Tracking
            </h2>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Sync
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Digital buzzer orders (200-299) automatically buzz customer phones when marked Ready.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setAutoSimulate(!autoSimulate)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              autoSimulate
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-600 font-bold'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
            }`}
            title="Auto-advance orders for demonstration"
          >
            <Zap className={`w-3.5 h-3.5 ${autoSimulate ? 'text-amber-600 dark:text-amber-400 fill-amber-500' : 'text-stone-400'}`} />
            <span>{autoSimulate ? 'Auto-Flow ON' : 'Auto-Flow'}</span>
          </button>

          {deliveredOrders.length > 0 && (
            <button
              type="button"
              onClick={onClearDelivered}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
              <span>Clear Collected</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search by Buzzer # or item name..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-stone-800 text-xs sm:text-sm border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-400"
          />
        </div>

        <div className="text-xs text-stone-500 dark:text-stone-400 font-medium hidden sm:block">
          Active Buzzers: <strong className="text-stone-800 dark:text-white font-bold">{queueOrders.length + ovenOrders.length}</strong> | Total Orders: <strong className="text-stone-800 dark:text-white font-bold">{orders.length}</strong>
        </div>
      </div>

      {/* Three Stage Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-start">
        {/* STAGE 1: QUEUE */}
        <div className="flex flex-col bg-stone-100/70 dark:bg-stone-900/50 rounded-2xl border border-stone-200/90 dark:border-stone-800 overflow-hidden shadow-2xs">
          {/* Stage Header */}
          <div className="px-4 py-3.5 bg-white dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-800 dark:text-white">1. Kitchen Queue</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {queueOrders.length}
            </span>
          </div>

          {/* Cards in Queue */}
          <div className="p-3 space-y-3 flex-1 min-h-[380px] overflow-y-auto max-h-[70vh]">
            {queueOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-stone-200/50 dark:bg-stone-800 flex items-center justify-center text-stone-400 mb-2">
                  <Clock className="w-5 h-5 text-stone-300 dark:text-stone-500" />
                </div>
                <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">Queue is empty</p>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 max-w-[180px]">
                  New orders sent from kiosk or barcodes will appear here.
                </p>
              </div>
            ) : (
              queueOrders.map((order) => {
                const bNum = cleanBuzzer(order.buzzerNumber);
                const items = getOrderItems(order);

                return (
                  <div
                    key={order.id}
                    className="p-2.5 sm:p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-2.5"
                  >
                    {/* Left: Buzzer Number & Type Badge */}
                    <div className="flex flex-col items-center justify-center min-w-[56px] px-2 py-1 bg-stone-900 dark:bg-stone-950 text-amber-400 rounded-lg border border-stone-700 shrink-0 shadow-2xs">
                      <div className="flex items-center gap-0.5">
                        {order.isDigitalBuzzer ? (
                          <Smartphone className="w-2.5 h-2.5 text-amber-300" />
                        ) : (
                          <Radio className="w-2.5 h-2.5 text-amber-300" />
                        )}
                        <span className="text-[8px] font-bold uppercase tracking-wider text-amber-300/80">
                          {order.isDigitalBuzzer ? 'DIGITAL' : 'BUZZER'}
                        </span>
                      </div>
                      <span className="text-xl sm:text-2xl font-black font-mono leading-none">
                        {bNum}
                      </span>
                    </div>

                    {/* Middle: Items */}
                    <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5">
                      {items.map((it, idx) => (
                        <span
                          key={`${it.cardId}-${idx}`}
                          title={it.cardName}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-mono font-black shadow-2xs ${it.colorScheme.border} ${it.colorScheme.bg} ${it.colorScheme.text}`}
                        >
                          <span className="opacity-80">{it.quantity}x</span>
                          <span>{it.initials}</span>
                        </span>
                      ))}
                      {order.notes && (
                        <span
                          className="text-[10px] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 truncate max-w-[130px]"
                          title={order.notes}
                        >
                          {order.notes}
                        </span>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveToOven(order.id)}
                        title="Start cooking in Oven / Grill"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cook</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveOrder(order.id)}
                        title="Cancel order"
                        className="p-1.5 text-stone-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* STAGE 2: OVEN / COOKING */}
        <div className="flex flex-col bg-stone-100/70 dark:bg-stone-900/50 rounded-2xl border border-stone-200/90 dark:border-stone-800 overflow-hidden shadow-2xs">
          {/* Stage Header */}
          <div className="px-4 py-3.5 bg-white dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 flex items-center justify-center font-bold text-xs">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-800 dark:text-white">2. In Oven / Cooking</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
              {ovenOrders.length}
            </span>
          </div>

          {/* Cards in Oven */}
          <div className="p-3 space-y-3 flex-1 min-h-[380px] overflow-y-auto max-h-[70vh]">
            {ovenOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-stone-200/50 dark:bg-stone-800 flex items-center justify-center text-stone-400 mb-2">
                  <Flame className="w-5 h-5 text-stone-300 dark:text-stone-500" />
                </div>
                <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">Oven / Grill idle</p>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 max-w-[180px]">
                  Advance tickets from the Queue when cooking starts.
                </p>
              </div>
            ) : (
              ovenOrders.map((order) => {
                const bNum = cleanBuzzer(order.buzzerNumber);
                const items = getOrderItems(order);

                return (
                  <div
                    key={order.id}
                    className="p-2.5 sm:p-3 bg-white dark:bg-stone-800 rounded-xl border border-orange-300 dark:border-orange-500/50 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-2.5 relative overflow-hidden"
                  >
                    {/* Glowing animated bar for cooking */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 animate-pulse" />

                    {/* Left: Compact Buzzer Number */}
                    <div className="flex flex-col items-center justify-center min-w-[56px] px-2 py-1 bg-stone-900 dark:bg-stone-950 text-amber-400 rounded-lg border border-stone-700 shrink-0 shadow-2xs">
                      <div className="flex items-center gap-0.5">
                        {order.isDigitalBuzzer ? (
                          <Smartphone className="w-2.5 h-2.5 text-amber-300" />
                        ) : (
                          <Radio className="w-2.5 h-2.5 text-amber-300" />
                        )}
                        <span className="text-[8px] font-bold uppercase tracking-wider text-amber-300/80">
                          {order.isDigitalBuzzer ? 'DIGITAL' : 'BUZZER'}
                        </span>
                      </div>
                      <span className="text-xl sm:text-2xl font-black font-mono leading-none">
                        {bNum}
                      </span>
                    </div>

                    {/* Middle: Items */}
                    <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5">
                      {items.map((it, idx) => (
                        <span
                          key={`${it.cardId}-${idx}`}
                          title={it.cardName}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-mono font-black shadow-2xs ${it.colorScheme.border} ${it.colorScheme.bg} ${it.colorScheme.text}`}
                        >
                          <span className="opacity-80">{it.quantity}x</span>
                          <span>{it.initials}</span>
                        </span>
                      ))}
                      {order.notes && (
                        <span
                          className="text-[10px] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 truncate max-w-[130px]"
                          title={order.notes}
                        >
                          {order.notes}
                        </span>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveBackToQueue(order.id)}
                        title="Return to Queue"
                        className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveToDelivered(order.id)}
                        title={order.isDigitalBuzzer ? "Mark Ready & Buzz Customer Phone" : "Mark Ready"}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ready</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* STAGE 3: READY FOR COLLECTION / DELIVERED */}
        <div className="flex flex-col bg-stone-100/70 dark:bg-stone-900/50 rounded-2xl border border-stone-200/90 dark:border-stone-800 overflow-hidden shadow-2xs">
          {/* Stage Header */}
          <div className="px-4 py-3.5 bg-white dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-800 dark:text-white">3. Ready for Collection</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {deliveredOrders.length}
            </span>
          </div>

          {/* Cards in Delivered */}
          <div className="p-3 space-y-3 flex-1 min-h-[380px] overflow-y-auto max-h-[70vh]">
            {deliveredOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-stone-200/50 dark:bg-stone-800 flex items-center justify-center text-stone-400 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-stone-300 dark:text-stone-500" />
                </div>
                <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">No ready orders</p>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 max-w-[180px]">
                  Orders ready for customer pickup will appear here.
                </p>
              </div>
            ) : (
              deliveredOrders.map((order) => {
                const bNum = cleanBuzzer(order.buzzerNumber);
                const items = getOrderItems(order);

                return (
                  <div
                    key={order.id}
                    className="p-2.5 sm:p-3 bg-white dark:bg-stone-800 rounded-xl border border-emerald-300 dark:border-emerald-800/60 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-2.5"
                  >
                    {/* Left: Compact Buzzer Badge */}
                    <div className="flex flex-col items-center justify-center min-w-[54px] px-2 py-1 bg-stone-100 dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 rounded-lg border border-stone-200 dark:border-stone-700 shrink-0">
                      <div className="flex items-center gap-0.5">
                        {order.isDigitalBuzzer ? (
                          <Smartphone className="w-2.5 h-2.5 text-emerald-500" />
                        ) : (
                          <Radio className="w-2.5 h-2.5 text-stone-400" />
                        )}
                        <span className="text-[8px] font-bold uppercase tracking-wider text-stone-400">
                          {order.isDigitalBuzzer ? 'DIGITAL' : 'BUZZER'}
                        </span>
                      </div>
                      <span className="text-xl sm:text-2xl font-black font-mono leading-none">
                        {bNum}
                      </span>
                    </div>

                    {/* Middle: Initials */}
                    <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5">
                      {items.map((it, idx) => (
                        <span
                          key={`${it.cardId}-${idx}`}
                          title={it.cardName}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-mono font-black shadow-2xs ${it.colorScheme.border} ${it.colorScheme.bg} ${it.colorScheme.text}`}
                        >
                          <span className="opacity-80">{it.quantity}x</span>
                          <span>{it.initials}</span>
                        </span>
                      ))}
                      {order.isDigitalBuzzer && (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          Phone Buzzed
                        </span>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {order.isDigitalBuzzer && (
                        <button
                          type="button"
                          onClick={() => handleManualRebuzz(order.id)}
                          title="Buzz customer phone again"
                          className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Bell className="w-3.5 h-3.5 animate-pulse" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleMoveToOven(order.id)}
                        title="Return to Oven"
                        className="p-1.5 text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveOrder(order.id)}
                        title="Dismiss order"
                        className="p-1.5 text-stone-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
