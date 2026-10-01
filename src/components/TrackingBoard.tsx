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

  // FIFO Ordering: Oldest order at the top (lowest timestamp), new orders inserted below.
  // When an order is promoted to next stage, orders below it shift up.
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
  };

  const handleMoveBackToQueue = (orderId: string) => {
    sounds.playPop();
    onUpdateStage(orderId, 'queue');
  };

  const getOrderItems = (order: OrderItem) => {
    const defaultPalette = {
      bg: 'bg-orange-50/70 dark:bg-orange-950/20',
      border: 'border-orange-500 dark:border-orange-400',
      text: 'text-orange-600 dark:text-orange-400',
      badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300',
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Real-Time Kitchen Tracking
            </h2>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setAutoSimulate(!autoSimulate)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              autoSimulate
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-600 font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title="Avança pedidos automaticamente para demonstração"
          >
            <Zap className={`w-3.5 h-3.5 ${autoSimulate ? 'text-amber-600 dark:text-amber-400 fill-amber-500' : 'text-slate-400'}`} />
            <span>{autoSimulate ? 'Auto-Flow ON' : 'Auto-Flow'}</span>
          </button>

          {deliveredOrders.length > 0 && (
            <button
              type="button"
              onClick={onClearDelivered}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Limpar Entregues</span>
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
            placeholder="Buscar por Buzzer ou item..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400"
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
          Buzzers Ativos: <strong className="text-slate-800 dark:text-white font-bold">{queueOrders.length + ovenOrders.length}</strong> | Total: <strong className="text-slate-800 dark:text-white font-bold">{orders.length}</strong>
        </div>
      </div>

      {/* 3 STAGES COLUMNS: QUEUE, OVEN, DELIVERED */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* STAGE 1: QUEUE */}
        <div className="flex flex-col bg-slate-100/70 dark:bg-slate-900/50 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
          {/* Stage Header */}
          <div className="px-4 py-3.5 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">1. Fila</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              {queueOrders.length}
            </span>
          </div>

          {/* Cards in Queue: Elevated 50% lighter dark background for high reading quality */}
          <div className="p-3 space-y-3 flex-1 min-h-[380px] overflow-y-auto max-h-[70vh]">
            {queueOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                  <Clock className="w-5 h-5 text-slate-300 dark:text-slate-500" />
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Fila vazia</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[180px]">
                  Selecione cards na aba Cards para enviar um pedido aqui.
                </p>
                <button
                  type="button"
                  onClick={onGoToCardsTab}
                  className="mt-3 text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Ir para Cards</span>
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
                    className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3.5 group"
                  >
                    {/* Top row: Queue stage header */}
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100 dark:border-slate-700">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 px-2.5 py-0.5 rounded-md border border-sky-200 dark:border-sky-800 uppercase tracking-wider">
                        <Clock className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                        Fila
                      </span>
                    </div>

                    {/* ITEMS: Outlined with group color */}
                    <div className="space-y-2">
                      {items.map((it, idx) => (
                        <div
                          key={`${it.cardId}-${idx}`}
                          className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border-2 ${it.colorScheme.border} bg-slate-50/90 dark:bg-slate-700/60 shadow-2xs transition-all`}
                        >
                          {/* Number before Initials (same size) */}
                          <div
                            className={`px-3 py-2 rounded-xl bg-white dark:bg-slate-700/90 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-mono font-black shrink-0 shadow-2xs gap-1.5 ${
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

                          {/* Item Name */}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-800 dark:text-white truncate leading-snug" title={it.cardName}>
                              {it.cardName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="text-[11px] text-amber-800 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 rounded-md px-2.5 py-1.5 italic">
                        Obs: {order.notes}
                      </p>
                    )}

                    {/* BUZZER NUMBER */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                      <div className="w-full flex flex-col items-center justify-center py-2 px-4 bg-slate-900 dark:bg-slate-900 text-white rounded-xl shadow-xs border border-transparent dark:border-slate-700">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
                        title="Cancelar pedido"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveToOven(order.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Para o Forno</span>
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
        <div className="flex flex-col bg-slate-100/70 dark:bg-slate-900/50 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
          {/* Stage Header */}
          <div className="px-4 py-3.5 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 flex items-center justify-center font-bold text-xs">
                <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400 fill-orange-500 animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">2. Forno</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
              {ovenOrders.length}
            </span>
          </div>

          {/* Cards in Oven */}
          <div className="p-3 space-y-3 flex-1 min-h-[380px] overflow-y-auto max-h-[70vh]">
            {ovenOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                  <Flame className="w-5 h-5 text-slate-300 dark:text-slate-500" />
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Forno livre</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[180px]">
                  Avance pedidos da Fila quando o preparo no forno iniciar.
                </p>
              </div>
            ) : (
              ovenOrders.map((order) => {
                const bNum = cleanBuzzer(order.buzzerNumber);
                const items = getOrderItems(order);

                return (
                  <div
                    key={order.id}
                    className="p-2.5 sm:p-3 bg-white dark:bg-slate-800 rounded-xl border border-orange-300 dark:border-orange-500/50 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-2.5 relative overflow-hidden"
                  >
                    {/* Glowing animated bar for oven */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 animate-pulse" />

                    {/* Left: Compact Buzzer Number */}
                    <div className="flex flex-col items-center justify-center min-w-[56px] px-2 py-1 bg-slate-900 dark:bg-slate-950 text-amber-400 rounded-lg border border-slate-700 shrink-0 shadow-2xs">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-amber-300/80">
                        BUZZER
                      </span>
                      <span className="text-xl sm:text-2xl font-black font-mono leading-none">
                        {bNum}
                      </span>
                    </div>

                    {/* Middle: Initials with quantities */}
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

                    {/* Right: Quick Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveBackToQueue(order.id)}
                        title="Voltar à Fila"
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveToDelivered(order.id)}
                        title="Marcar como Entregue"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Pronto</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* STAGE 3: DELIVERED */}
        <div className="flex flex-col bg-slate-100/70 dark:bg-slate-900/50 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
          {/* Stage Header */}
          <div className="px-4 py-3.5 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">3. Entregue</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {deliveredOrders.length}
            </span>
          </div>

          {/* Cards in Delivered */}
          <div className="p-3 space-y-3 flex-1 min-h-[380px] overflow-y-auto max-h-[70vh]">
            {deliveredOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-slate-300 dark:text-slate-500" />
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Nenhum pedido entregue</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[180px]">
                  Pedidos finalizados do forno aparecerão aqui.
                </p>
              </div>
            ) : (
              deliveredOrders.map((order) => {
                const bNum = cleanBuzzer(order.buzzerNumber);
                const items = getOrderItems(order);

                return (
                  <div
                    key={order.id}
                    className="p-2.5 sm:p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800/60 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-2.5"
                  >
                    {/* Left: Compact Buzzer Badge */}
                    <div className="flex flex-col items-center justify-center min-w-[54px] px-2 py-1 bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                        BUZZER
                      </span>
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
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveToOven(order.id)}
                        title="Voltar ao Forno"
                        className="p-1.5 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveOrder(order.id)}
                        title="Remover"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
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
