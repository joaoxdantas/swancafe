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
  Radio,
  Zap,
  PackageCheck,
} from 'lucide-react';
import { sounds } from '../utils/helpers';

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

  // Optional auto-simulation to demonstrate real-time updates
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

  const queueOrders = filteredOrders.filter((o) => o.stage === 'queue');
  const ovenOrders = filteredOrders.filter((o) => o.stage === 'oven');
  const deliveredOrders = filteredOrders.filter((o) => o.stage === 'delivered');

  const handleMoveToOven = (orderId: string) => {
    sounds.playOvenStart();
    onUpdateStage(orderId, 'oven');
  };

  const handleMoveToDelivered = (orderId: string) => {
    sounds.playDelivered();
    onUpdateStage(orderId, 'delivered');
  };

  const handleMoveBackToQueue = (orderId: string) => {
    sounds.playPop();
    onUpdateStage(orderId, 'queue');
  };

  const getOrderItems = (order: OrderItem) => {
    const defaultPalette = {
      bg: 'bg-orange-50/60',
      border: 'border-orange-200',
      text: 'text-orange-700',
      badge: 'bg-orange-100 text-orange-800',
      pillBg: 'bg-orange-500',
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
    // Fallback if older single-item record exists
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Real-Time Kitchen Tracking
            </h2>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Buzzer numbers and item initials are shown prominently for immediate kitchen recognition.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Simulation Toggle */}
          <button
            type="button"
            onClick={() => setAutoSimulate(!autoSimulate)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              autoSimulate
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Automatically progresses orders through stages for demo"
          >
            <Zap className={`w-3.5 h-3.5 ${autoSimulate ? 'text-amber-600 fill-amber-600' : 'text-slate-400'}`} />
            <span>{autoSimulate ? 'Auto-Flow ON' : 'Auto-Flow'}</span>
          </button>

          {deliveredOrders.length > 0 && (
            <button
              type="button"
              onClick={onClearDelivered}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Clear Delivered</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search by Buzzer number or item..."
            className="w-full pl-9 pr-4 py-2 bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          Active Buzzers: <strong className="text-slate-800">{queueOrders.length + ovenOrders.length}</strong> | Total tracked: <strong className="text-slate-800">{orders.length}</strong>
        </div>
      </div>

      {/* 3 STAGES COLUMNS: QUEUE, OVEN, DELIVERED */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* STAGE 1: QUEUE */}
        <div className="flex flex-col bg-slate-100/60 rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
          {/* Stage Header */}
          <div className="px-4 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">1. Queue</h3>
                <p className="text-[11px] text-slate-400">Waiting for preparation</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
              {queueOrders.length}
            </span>
          </div>

          {/* Cards in Queue */}
          <div className="p-3 space-y-3 flex-1 min-h-[380px] overflow-y-auto max-h-[70vh]">
            {queueOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-400 mb-2">
                  <Clock className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-xs font-medium text-slate-600">Queue is empty</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
                  Pick cards from the Cards tab to send a buzzer order here.
                </p>
                <button
                  type="button"
                  onClick={onGoToCardsTab}
                  className="mt-3 text-xs font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Go to Cards</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              queueOrders.map((order) => {
                const bNum = cleanBuzzer(order.buzzerNumber);
                const items = getOrderItems(order);

                return (
                  <div
                    key={order.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-2xs transition-all flex flex-col justify-between gap-3.5 group"
                  >
                    {/* Top row: Queue stage header (No timer) */}
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200 uppercase tracking-wider">
                        <Clock className="w-3 h-3 text-sky-600" />
                        Queue
                      </span>
                    </div>

                    {/* ITEMS: Quantity number before initials with same size, smaller item name, no quantity word */}
                    <div className="space-y-2">
                      {items.map((it, idx) => (
                        <div
                          key={`${it.cardId}-${idx}`}
                          className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border ${it.colorScheme.border} ${it.colorScheme.bg} shadow-2xs transition-all`}
                        >
                          {/* Number before Initials (same size) */}
                          <div
                            className={`px-3 py-2 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center font-mono font-black shrink-0 shadow-2xs gap-1.5 ${
                              it.initials.length <= 2
                                ? 'text-2xl'
                                : it.initials.length <= 4
                                ? 'text-lg sm:text-xl tracking-tight'
                                : 'text-sm sm:text-base tracking-tighter'
                            } ${it.colorScheme.text}`}
                          >
                            <span>{it.quantity}</span>
                            <span>{it.initials}</span>
                          </div>

                          {/* Smaller long name */}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-700 truncate leading-snug" title={it.cardName}>
                              {it.cardName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/60 rounded-md px-2.5 py-1.5 italic">
                        Note: {order.notes}
                      </p>
                    )}

                    {/* BUZZER NUMBER: AT THE BOTTOM OF THE CARD CENTRED LIKE A TITLE */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col items-center justify-center text-center">
                      <div className="w-full flex flex-col items-center justify-center py-2 px-4 bg-slate-900 text-white rounded-xl shadow-xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                          BUZZER
                        </span>
                        <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-amber-400 leading-tight">
                          {bNum}
                        </span>
                      </div>
                    </div>

                    {/* Stage Transition Action */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => onRemoveOrder(order.id)}
                        title="Cancel order"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveToOven(order.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Move to Oven</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* STAGE 2: OVEN */}
        <div className="flex flex-col bg-slate-100/60 rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
          {/* Stage Header */}
          <div className="px-4 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                <Flame className="w-4 h-4 text-orange-600 fill-orange-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">2. Oven</h3>
                <p className="text-[11px] text-slate-400">Baking &amp; cooking in progress</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
              {ovenOrders.length}
            </span>
          </div>

          {/* Cards in Oven */}
          <div className="p-3 space-y-3 flex-1 min-h-[380px] overflow-y-auto max-h-[70vh]">
            {ovenOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-400 mb-2">
                  <Flame className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-xs font-medium text-slate-600">Oven is empty</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
                  Advance an order from Queue when cooking begins.
                </p>
              </div>
            ) : (
              ovenOrders.map((order) => {
                const bNum = cleanBuzzer(order.buzzerNumber);
                const items = getOrderItems(order);

                return (
                  <div
                    key={order.id}
                    className="p-4 bg-white rounded-2xl border border-orange-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3.5 relative overflow-hidden ring-1 ring-orange-200/60"
                  >
                    {/* Glowing animated bar for oven */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 animate-pulse" />

                    {/* Top row: Oven stage header (No timer) */}
                    <div className="flex items-center justify-between text-xs pt-0.5 pb-1 border-b border-orange-100">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200 uppercase tracking-wider">
                        <Flame className="w-3.5 h-3.5 fill-orange-500 animate-bounce" />
                        Oven
                      </span>
                    </div>

                    {/* ITEMS: Quantity number before initials with same size, smaller item name, no quantity word */}
                    <div className="space-y-2">
                      {items.map((it, idx) => (
                        <div
                          key={`${it.cardId}-${idx}`}
                          className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border ${it.colorScheme.border} ${it.colorScheme.bg} shadow-2xs transition-all`}
                        >
                          {/* Number before Initials (same size) */}
                          <div
                            className={`px-3 py-2 rounded-xl bg-white border border-orange-200 flex items-center justify-center font-mono font-black shrink-0 shadow-2xs gap-1.5 ${
                              it.initials.length <= 2
                                ? 'text-2xl'
                                : it.initials.length <= 4
                                ? 'text-lg sm:text-xl tracking-tight'
                                : 'text-sm sm:text-base tracking-tighter'
                            } ${it.colorScheme.text}`}
                          >
                            <span>{it.quantity}</span>
                            <span>{it.initials}</span>
                          </div>

                          {/* Smaller long name */}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-700 truncate leading-snug" title={it.cardName}>
                              {it.cardName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/60 rounded-md px-2.5 py-1.5 italic">
                        Note: {order.notes}
                      </p>
                    )}

                    {/* BUZZER NUMBER: AT THE BOTTOM OF THE CARD CENTRED LIKE A TITLE */}
                    <div className="pt-2 border-t border-orange-100 flex flex-col items-center justify-center text-center">
                      <div className="w-full flex flex-col items-center justify-center py-2 px-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-xs border border-slate-700">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                          BUZZER
                        </span>
                        <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-amber-400 leading-tight">
                          {bNum}
                        </span>
                      </div>
                    </div>

                    {/* Stage Transition Action */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleMoveBackToQueue(order.id)}
                        title="Return to Queue"
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 text-xs transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span className="text-[11px]">Back</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveToDelivered(order.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Deliver</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* STAGE 3: DELIVERED */}
        <div className="flex flex-col bg-slate-100/60 rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
          {/* Stage Header */}
          <div className="px-4 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">3. Delivered</h3>
                <p className="text-[11px] text-slate-400">Ready &amp; collected buzzers</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {deliveredOrders.length}
            </span>
          </div>

          {/* Cards in Delivered */}
          <div className="p-3 space-y-3 flex-1 min-h-[380px] overflow-y-auto max-h-[70vh]">
            {deliveredOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-400 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-xs font-medium text-slate-600">No delivered orders yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
                  Completed orders from the oven will appear here.
                </p>
              </div>
            ) : (
              deliveredOrders.map((order) => {
                const bNum = cleanBuzzer(order.buzzerNumber);
                const items = getOrderItems(order);

                return (
                  <div
                    key={order.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs transition-all flex flex-col justify-between gap-3.5 group"
                  >
                    {/* Top Row: Delivered stage header (No timer) */}
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 uppercase tracking-wider">
                        <PackageCheck className="w-3.5 h-3.5" />
                        Delivered
                      </span>
                    </div>

                    {/* ITEMS: Quantity number before initials with same size, smaller item name, no quantity word */}
                    <div className="space-y-2">
                      {items.map((it, idx) => (
                        <div
                          key={`${it.cardId}-${idx}`}
                          className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border ${it.colorScheme.border} ${it.colorScheme.bg} shadow-2xs opacity-95 transition-all`}
                        >
                          {/* Number before Initials (same size) */}
                          <div
                            className={`px-3 py-2 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center font-mono font-black shrink-0 shadow-2xs gap-1.5 ${
                              it.initials.length <= 2
                                ? 'text-2xl'
                                : it.initials.length <= 4
                                ? 'text-lg sm:text-xl tracking-tight'
                                : 'text-sm sm:text-base tracking-tighter'
                            } ${it.colorScheme.text}`}
                          >
                            <span>{it.quantity}</span>
                            <span>{it.initials}</span>
                          </div>

                          {/* Smaller long name */}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-700 truncate leading-snug" title={it.cardName}>
                              {it.cardName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200/80 rounded-md px-2.5 py-1.5 text-xs">
                        Note: {order.notes}
                      </p>
                    )}

                    {/* BUZZER NUMBER: AT THE BOTTOM OF THE CARD CENTRED LIKE A TITLE */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col items-center justify-center text-center">
                      <div className="w-full flex flex-col items-center justify-center py-2 px-4 bg-slate-100 text-slate-900 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                          BUZZER
                        </span>
                        <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-800 leading-tight">
                          {bNum}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleMoveToOven(order.id)}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-orange-600 text-xs transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span className="text-[11px]">Re-heat in Oven</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveOrder(order.id)}
                        title="Remove record"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
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
