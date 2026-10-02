import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Send,
  Radio,
  QrCode,
  Smartphone,
  CheckCircle2,
  RotateCcw,
  Copy,
  Check,
  Delete,
  Hash,
} from 'lucide-react';
import { sounds, generateDigitalBuzzerNumber } from '../utils/helpers';
import { OrderItem } from '../types';
import { syncSaveOrder, subscribeOrderById } from '../firebase';

interface BuzzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (buzzerNumber: string, isDigital?: boolean, existingOrderId?: string) => void;
  itemCount: number;
  existingOrders: OrderItem[];
  draftOrderPayload: {
    items: any[];
    notes?: string;
  };
}

export const BuzzerModal: React.FC<BuzzerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemCount,
  existingOrders,
  draftOrderPayload,
}) => {
  // Physical buzzer state
  const [physicalInput, setPhysicalInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Digital buzzer state
  const [digitalBuzzerNumber, setDigitalBuzzerNumber] = useState<string>('200');
  const [digitalOrderId, setDigitalOrderId] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isScanned, setIsScanned] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize reservation & QR code whenever modal opens
  useEffect(() => {
    if (!isOpen) {
      setIsScanned(false);
      return;
    }

    setPhysicalInput('');
    setIsScanned(false);

    // Generate unique 200-299 buzzer number
    const chosenNumber = generateDigitalBuzzerNumber(existingOrders);
    setDigitalBuzzerNumber(chosenNumber);

    const newOrderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setDigitalOrderId(newOrderId);

    // Build customer mobile URL
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const mobileUrl = `${origin}/?view=buzzer&orderId=${newOrderId}&buzzer=${chosenNumber}`;

    QRCode.toDataURL(mobileUrl, {
      width: 280,
      margin: 1,
      color: {
        dark: '#1c1917',
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
      });

    // Save pending digital order to Firestore
    const now = Date.now();
    const pendingOrder: OrderItem = {
      id: newOrderId,
      buzzerNumber: chosenNumber,
      isDigitalBuzzer: true,
      items: draftOrderPayload.items,
      notes: draftOrderPayload.notes || '',
      stage: 'queue',
      createdAt: now,
      queuedAt: now,
    };

    syncSaveOrder(pendingOrder).catch((err) => {
      console.warn('Error saving pending digital order:', err);
    });
  }, [isOpen]);

  // Real-time listener for customer mobile scan
  useEffect(() => {
    if (!isOpen || !digitalOrderId || isScanned) return;

    const unsubscribe = subscribeOrderById(digitalOrderId, (order) => {
      if (order && order.scannedAt && order.scannedAt > 0) {
        setIsScanned(true);
        sounds.playSend();
        const timer = setTimeout(() => {
          onConfirm(digitalBuzzerNumber, true, digitalOrderId);
          onClose();
        }, 1200);
        return () => clearTimeout(timer);
      }
    });

    return () => unsubscribe();
  }, [isOpen, digitalOrderId, isScanned, digitalBuzzerNumber, onConfirm, onClose]);

  if (!isOpen) return null;

  // Keypad button click handler for physical input
  const handleKeypadPress = (digit: string) => {
    sounds.playPop();
    if (physicalInput.length < 5) {
      setPhysicalInput((prev) => prev + digit);
    }
  };

  const handleKeypadBackspace = () => {
    sounds.playPop();
    setPhysicalInput((prev) => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    sounds.playPop();
    setPhysicalInput('');
  };

  // Submit physical buzzer order
  const handlePhysicalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = physicalInput.trim().replace(/#/g, '');
    const finalBuzzer = clean || '000';
    sounds.playSend();
    onConfirm(finalBuzzer, false);
    onClose();
  };

  // Manual fallback button for digital buzzer
  const handleManualDigitalComplete = () => {
    sounds.playSend();
    onConfirm(digitalBuzzerNumber, true, digitalOrderId);
    onClose();
  };

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const mobileUrl = `${origin}/?view=buzzer&orderId=${digitalOrderId}&buzzer=${digitalBuzzerNumber}`;
    navigator.clipboard.writeText(mobileUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white tracking-tight">
                Order Buzzer Selection
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {itemCount} item(s) in order · Choose how you want to be notified
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual-Side Screen Body (Physical Left, Digital Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-stone-800 relative">
          {/* OR Divider Badge for Desktop */}
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-700 text-stone-500 dark:text-stone-400 items-center justify-center text-xs font-black shadow-md">
            OR
          </div>

          {/* LEFT SIDE: Physical Buzzer Entry */}
          <div className="p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-white dark:bg-stone-900">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                <Smartphone className="w-4 h-4" />
                <span>Physical Token</span>
              </div>

              {/* Exact Prompt: "Grab a buzzer and type its number before sending your order" */}
              <div className="space-y-1">
                <h4 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white leading-snug">
                  Grab a buzzer and type its number before sending your order
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Pick a physical pager from the charging dock beside the screen.
                </p>
              </div>

              {/* Number Display Input */}
              <div className="relative mt-2">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-600">
                  <Hash className="w-6 h-6" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  readOnly
                  value={physicalInput || '000'}
                  placeholder="000"
                  className="w-full text-center py-3.5 pl-10 pr-4 bg-stone-900 dark:bg-stone-950 text-amber-400 font-mono font-black text-4xl tracking-widest rounded-2xl border-2 border-stone-700 focus:border-amber-400 focus:outline-none shadow-inner"
                />
              </div>

              {/* On-Screen Touch Keypad for Fast Kiosk Input */}
              <div className="grid grid-cols-3 gap-2 pt-1 max-w-[280px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="h-11 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-white font-mono font-bold text-lg active:scale-95 transition-all shadow-2xs cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleKeypadClear}
                  className="h-11 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-11 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-white font-mono font-bold text-lg active:scale-95 transition-all shadow-2xs cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  className="h-11 rounded-xl bg-stone-200/70 hover:bg-stone-300 dark:bg-stone-750 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                  title="Backspace"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Submit Physical Buzzer Button */}
            <button
              type="button"
              onClick={() => handlePhysicalSubmit()}
              className="w-full py-3.5 px-5 rounded-2xl bg-orange-600 hover:bg-orange-500 active:scale-98 text-white font-black text-sm sm:text-base shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Send Order with Buzzer #{physicalInput.trim() || '000'}</span>
            </button>
          </div>

          {/* RIGHT SIDE: Digital Buzzer QR Scan */}
          <div className="p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-stone-50/50 dark:bg-stone-950/40 text-center">
            {isScanned ? (
              <div className="py-12 space-y-4 my-auto animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    Phone Connected!
                  </h4>
                  <p className="text-sm text-stone-600 dark:text-stone-300">
                    Digital Buzzer <strong className="text-amber-500 font-mono text-base">#{digitalBuzzerNumber}</strong> assigned to customer phone.
                  </p>
                  <p className="text-xs text-stone-400">
                    Order submitted to kitchen. Resetting kiosk...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    <QrCode className="w-4 h-4" />
                    <span>Contactless Mobile</span>
                  </div>

                  {/* Exact Prompt: "...Or just scan the QR code and get a notification on your phone" */}
                  <div className="space-y-1">
                    <h4 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white leading-snug">
                      ...Or just scan the QR code and get a notification on your phone
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Point any phone camera at the code. No app install needed.
                    </p>
                  </div>

                  {/* QR Code Container */}
                  <div className="relative mx-auto w-52 h-52 sm:w-56 sm:h-56 p-3 bg-white rounded-2xl border-2 border-amber-400 shadow-xl flex items-center justify-center mt-2">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt={`Digital Buzzer QR #${digitalBuzzerNumber}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 text-xs gap-2">
                        <RotateCcw className="w-6 h-6 animate-spin text-amber-500" />
                        <span>Generating QR...</span>
                      </div>
                    )}

                    {/* Buzzer Number Tag */}
                    <div className="absolute -bottom-3 bg-stone-900 text-amber-400 font-mono font-black text-sm px-3.5 py-0.5 rounded-full border border-stone-700 shadow-md">
                      #{digitalBuzzerNumber}
                    </div>
                  </div>

                  {/* Live Scan Pulse Status */}
                  <div className="flex items-center justify-center gap-2 text-xs text-stone-500 dark:text-stone-400 pt-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-medium">
                      Auto-submits instantly when customer scans
                    </span>
                  </div>
                </div>

                {/* Direct completion & link helpers */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 py-3 px-3 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Copy direct mobile URL"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleManualDigitalComplete}
                    className="flex-[2] py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Send Order (Digital #{digitalBuzzerNumber})</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
