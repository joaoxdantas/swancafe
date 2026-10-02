import React, { useState, useEffect, useRef, useCallback } from 'react';
import { subscribeOrderById, syncMarkOrderScanned, syncCompleteOrder } from '../firebase';
import { OrderItem } from '../types';
import { sounds } from '../utils/helpers';
import {
  Bell,
  CheckCircle2,
  Clock,
  Flame,
  Volume2,
  VolumeX,
  Smartphone,
  ShoppingBag,
  Coffee,
  Zap,
  Info,
} from 'lucide-react';

interface CustomerBuzzerViewProps {
  orderId: string;
  initialBuzzerNumber?: string;
  onExit?: () => void;
}

export const CustomerBuzzerView: React.FC<CustomerBuzzerViewProps> = ({
  orderId,
  initialBuzzerNumber,
  onExit,
}) => {
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isAlerting, setIsAlerting] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [vibrationTested, setVibrationTested] = useState(false);

  const vibrationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check hardware and browser capabilities
  const hasVibrationSupport =
    typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  const isIos =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent || '') ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  // Helper to trigger device vibration safely across browser environments
  const triggerVibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe catch for browsers that block background vibration
      }
    }
  }, []);

  // Auto-unlock audio and vibration on initial user touch/tap anywhere on screen
  const triggerAudioUnlock = useCallback(() => {
    sounds.unlock();
    triggerVibrate(60);
  }, [triggerVibrate]);

  useEffect(() => {
    const handleGesture = () => {
      triggerAudioUnlock();
    };

    window.addEventListener('pointerdown', handleGesture, { passive: true });
    window.addEventListener('touchstart', handleGesture, { passive: true });
    window.addEventListener('click', handleGesture, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('click', handleGesture);
    };
  }, [triggerAudioUnlock]);

  // 1. Mark order as scanned immediately in Firestore
  useEffect(() => {
    if (!orderId) return;
    syncMarkOrderScanned(orderId).catch((err) => {
      console.warn('Could not record scan timestamp:', err);
    });
  }, [orderId]);

  // 2. Real-time subscription to order document
  useEffect(() => {
    if (!orderId) return;
    const unsubscribe = subscribeOrderById(
      orderId,
      (updatedOrder) => {
        setLoading(false);
        if (updatedOrder) {
          setOrder(updatedOrder);
          if (updatedOrder.completedAt) {
            setIsCompleted(true);
          }
        }
      },
      (err) => {
        console.error('Error fetching order for buzzer:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [orderId]);

  const buzzerNumber = order?.buzzerNumber || initialBuzzerNumber || '200';
  const stage = order?.stage || 'queue';

  // 3. Multi-modal alert when stage becomes 'delivered'
  useEffect(() => {
    const shouldAlert = stage === 'delivered' && !isCompleted;
    setIsAlerting(shouldAlert);

    if (shouldAlert) {
      // Sound Alarm
      if (isSoundOn) {
        sounds.unlock().finally(() => {
          sounds.startBuzzerLoop();
        });
      }

      // Strong rhythmic phone vibration loop [600ms buzz, 200ms pause, 600ms buzz, 200ms pause, 1000ms buzz]
      triggerVibrate([600, 200, 600, 200, 1000]);
      vibrationIntervalRef.current = setInterval(() => {
        triggerVibrate([600, 200, 600, 200, 1000]);
      }, 2600);

      // High-contrast screen flashing strobe
      flashIntervalRef.current = setInterval(() => {
        setIsFlashing((prev) => !prev);
      }, 350);
    } else {
      sounds.stopBuzzerLoop();
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
        vibrationIntervalRef.current = null;
      }
      if (flashIntervalRef.current) {
        clearInterval(flashIntervalRef.current);
        flashIntervalRef.current = null;
      }
      setIsFlashing(false);
    }

    return () => {
      sounds.stopBuzzerLoop();
      if (vibrationIntervalRef.current) clearInterval(vibrationIntervalRef.current);
      if (flashIntervalRef.current) clearInterval(flashIntervalRef.current);
    };
  }, [stage, isCompleted, isSoundOn, triggerVibrate]);

  // Sound On / Sound Off Toggle Handler with tactile vibration and instant preview chime
  const handleToggleSound = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextState = !isSoundOn;
    setIsSoundOn(nextState);

    if (nextState) {
      // 1. Tactile vibration feedback
      triggerVibrate([200, 100, 200]);
      // 2. Unlock Web Audio & play preview chime
      await sounds.unlock();
      sounds.playBell();
      // 3. If already alerting, start buzzer loop immediately
      if (isAlerting) {
        sounds.startBuzzerLoop();
      }
    } else {
      sounds.stopBuzzerLoop();
    }
  };

  // Explicit test button for testing both vibration and audio
  const handleTestVibrationAndSound = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVibrationTested(true);
    triggerVibrate([400, 150, 400, 150, 600]);
    await sounds.unlock();
    sounds.playBuzzerAlarm();
  };

  const handleCollected = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sounds.stopBuzzerLoop();
    if (vibrationIntervalRef.current) clearInterval(vibrationIntervalRef.current);
    if (flashIntervalRef.current) clearInterval(flashIntervalRef.current);
    setIsAlerting(false);
    setIsFlashing(false);
    setIsCompleted(true);
    triggerVibrate(120);
    sounds.playPop();

    if (orderId) {
      try {
        await syncCompleteOrder(orderId);
      } catch (err) {
        console.warn('Error completing order:', err);
      }
    }
  };

  return (
    <div
      onClick={triggerAudioUnlock}
      className={`min-h-screen w-full flex flex-col justify-between transition-colors duration-200 select-none ${
        isAlerting
          ? isFlashing
            ? 'bg-amber-400 text-stone-950'
            : 'bg-stone-950 text-amber-400'
          : 'bg-stone-900 text-stone-100'
      }`}
    >
      {/* Top Header Bar */}
      <header className="px-5 py-4 border-b border-stone-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-sm">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">Australian Cafe & Kitchen</h1>
            <p className="text-[11px] text-stone-400">Digital Buzzer · Real-Time Order</p>
          </div>
        </div>

        {/* Clean "Sound On" / "Sound Off" Toggle Button */}
        <button
          type="button"
          onClick={handleToggleSound}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
            isSoundOn
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70 hover:bg-emerald-900/80'
              : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:bg-stone-750 hover:text-stone-300'
          }`}
          title="Toggle sound notifications"
        >
          {isSoundOn ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Sound On</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-stone-400" />
              <span>Sound Off</span>
            </>
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto w-full">
        {/* State A: Completed */}
        {isCompleted ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">Order Collected!</h2>
              <p className="text-sm text-stone-400">
                Thanks for dining with us! Enjoy your meal and have a brilliant day.
              </p>
            </div>
            <div className="pt-4 p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60 text-stone-300 text-xs font-mono">
              Buzzer #{buzzerNumber} · Closed
            </div>
          </div>
        ) : isAlerting ? (
          /* State B: Order Ready - Flashing Alert & Vibration! */
          <div
            onClick={(e) => {
              // Tapping anywhere on the flashing alert forces sound unlock, playback, and strong vibration
              triggerVibrate([600, 200, 600, 200, 1000]);
              sounds.unlock().then(() => {
                if (isSoundOn) sounds.startBuzzerLoop();
              });
            }}
            className="space-y-6 w-full animate-in zoom-in-90 duration-150 cursor-pointer"
          >
            <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-60" />
              <div className="relative w-24 h-24 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-2xl">
                <Bell className="w-12 h-12 animate-bounce" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-amber-400 text-stone-950">
                READY FOR COLLECTION!
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                YOUR ORDER IS READY!
              </h2>
              <p className="text-sm opacity-90 font-medium">
                Please proceed to the cafe counter with your buzzer number.
              </p>
            </div>

            {/* Giant Buzzer Number Badge */}
            <div className="py-5 px-6 rounded-3xl bg-black/60 border-2 border-amber-400 text-amber-400 font-mono font-black text-6xl tracking-widest shadow-2xl">
              #{buzzerNumber}
            </div>

            {/* Tap Screen to Vibrate / Sound Callout */}
            <div className="py-2.5 px-4 rounded-xl bg-amber-400/20 text-stone-900 dark:text-amber-200 border border-amber-400/40 text-xs font-bold flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 animate-bounce" />
              <span>Tap screen anytime to trigger vibration & sound</span>
            </div>

            {/* Collected Button */}
            <button
              type="button"
              onClick={handleCollected}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>I Have Collected My Order</span>
            </button>
          </div>
        ) : (
          /* State C: In Queue or In Oven */
          <div className="space-y-5 w-full">
            {/* Buzzer Number Display */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-stone-400 font-bold">
                Your Digital Buzzer Number
              </span>
              <div className="py-4 px-6 rounded-3xl bg-stone-950 text-amber-400 border border-stone-800 font-mono font-black text-6xl tracking-widest shadow-inner inline-block min-w-[200px]">
                #{buzzerNumber}
              </div>
            </div>

            {/* Tap to Test Vibration & Sound Card */}
            <div
              onClick={handleTestVibrationAndSound}
              className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-300">
                    {vibrationTested ? 'Sound & Vibrate Tested ✓' : 'Tap to Test Vibration & Sound'}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {isIos
                      ? 'iPhone: Loud chime & strobe (iOS restricts web vibration)'
                      : hasVibrationSupport
                      ? 'Tests your phone motor vibration and alert chime'
                      : 'Tests your phone alert chime'}
                  </div>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-black shrink-0 shadow-xs">
                Test
              </span>
            </div>

            {/* Device vibration information note if on iOS */}
            {isIos && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-800/40 border border-stone-700/50 text-[11px] text-stone-400 text-left">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>iPhone Notice:</strong> Apple disables the browser Vibration API on iOS. High-decibel audio alarms and full-screen strobing are fully active!
                </span>
              </div>
            )}

            {/* Kitchen Status Stepper */}
            <div className="w-full bg-stone-950/70 border border-stone-800 rounded-2xl p-4 text-left space-y-4">
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                <span>Kitchen Status</span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Sync
                </span>
              </div>

              {/* Step 1: Queue */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                    stage === 'queue'
                      ? 'bg-amber-500 text-stone-950 font-black ring-4 ring-amber-500/20'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {stage !== 'queue' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${stage === 'queue' ? 'text-amber-400' : 'text-white'}`}>
                    1. Order in Queue
                  </h4>
                  <p className="text-xs text-stone-400">
                    Order confirmed. Baristas & kitchen have your ticket.
                  </p>
                </div>
              </div>

              {/* Step 2: Oven / Prep */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                    stage === 'oven'
                      ? 'bg-orange-500 text-white ring-4 ring-orange-500/30 animate-pulse'
                      : stage === 'delivered'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-800 text-stone-500'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4
                    className={`text-sm font-bold ${
                      stage === 'oven'
                        ? 'text-orange-400 font-black'
                        : stage === 'delivered'
                        ? 'text-white'
                        : 'text-stone-400'
                    }`}
                  >
                    2. In the Oven / Preparing {stage === 'oven' && '🔥'}
                  </h4>
                  <p className="text-xs text-stone-400">
                    {stage === 'oven'
                      ? 'Your order is currently being prepared and baked!'
                      : 'Freshly baking, grilling, and brewing your order.'}
                  </p>
                </div>
              </div>

              {/* Step 3: Ready */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-stone-800 text-stone-500 flex items-center justify-center shrink-0 text-xs font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-400">3. Ready for Collection</h4>
                  <p className="text-xs text-stone-500">
                    Your phone will vibrate, flash, and ring when ready.
                  </p>
                </div>
              </div>
            </div>

            {/* Items summary */}
            {order?.items && order.items.length > 0 && (
              <div className="w-full bg-stone-950/40 border border-stone-800/80 rounded-xl p-3 text-left">
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                  <span>Order Items ({order.items.reduce((s, it) => s + it.quantity, 0)})</span>
                </div>
                <div className="space-y-1">
                  {order.items.map((it, idx) => (
                    <div
                      key={`${it.cardId}-${idx}`}
                      className="flex items-center justify-between text-xs text-stone-300 py-0.5 border-b border-stone-800/40 last:border-none"
                    >
                      <span className="font-medium truncate">{it.cardName}</span>
                      <span className="font-mono font-bold text-amber-400 shrink-0 ml-2">
                        {it.quantity}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instruction footnote */}
            <div className="flex items-center justify-center gap-2 text-xs text-stone-400 bg-stone-800/40 py-2.5 px-4 rounded-xl border border-stone-700/40">
              <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Keep this page open on your phone while waiting.</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-5 py-3 border-t border-stone-800/60 text-center text-[11px] text-stone-500">
        Australian Cafe Self-Service Kiosk & Digital Buzzer · Single-use patron ticket
      </footer>
    </div>
  );
};
