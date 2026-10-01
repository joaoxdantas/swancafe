import { CardItem } from '../types';

export interface CategoryColorOption {
  id: string;
  name: string;
  hex: string;
  border: string;       // Outline border for all cards in this category
  ring: string;         // Ring focus/selection
  bg: string;           // Soft tint
  text: string;         // Text color
  badge: string;        // Badge styling
  pillBg: string;       // Solid color
}

export const CATEGORY_COLOR_OPTIONS: CategoryColorOption[] = [
  {
    id: 'orange',
    name: 'Laranja (Pizza)',
    hex: '#f97316',
    border: 'border-orange-500 dark:border-orange-500',
    ring: 'ring-orange-500/60',
    bg: 'bg-orange-50/80 dark:bg-orange-950/30',
    text: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300',
    pillBg: 'bg-orange-500',
  },
  {
    id: 'emerald',
    name: 'Verde (Salada)',
    hex: '#10b981',
    border: 'border-emerald-500 dark:border-emerald-400',
    ring: 'ring-emerald-500/60',
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
    pillBg: 'bg-emerald-500',
  },
  {
    id: 'amber',
    name: 'Amarelo / Âmbar',
    hex: '#f59e0b',
    border: 'border-amber-500 dark:border-amber-400',
    ring: 'ring-amber-500/60',
    bg: 'bg-amber-50/80 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
    pillBg: 'bg-amber-500',
  },
  {
    id: 'sky',
    name: 'Azul (Bebidas)',
    hex: '#0ea5e9',
    border: 'border-sky-500 dark:border-sky-400',
    ring: 'ring-sky-500/60',
    bg: 'bg-sky-50/80 dark:bg-sky-950/30',
    text: 'text-sky-600 dark:text-sky-400',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300',
    pillBg: 'bg-sky-500',
  },
  {
    id: 'indigo',
    name: 'Índigo (Massas)',
    hex: '#6366f1',
    border: 'border-indigo-500 dark:border-indigo-400',
    ring: 'ring-indigo-500/60',
    bg: 'bg-indigo-50/80 dark:bg-indigo-950/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300',
    pillBg: 'bg-indigo-500',
  },
  {
    id: 'rose',
    name: 'Vermelho / Rosa',
    hex: '#f43f5e',
    border: 'border-rose-500 dark:border-rose-400',
    ring: 'ring-rose-500/60',
    bg: 'bg-rose-50/80 dark:bg-rose-950/30',
    text: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300',
    pillBg: 'bg-rose-500',
  },
  {
    id: 'violet',
    name: 'Roxo / Sobremesa',
    hex: '#8b5cf6',
    border: 'border-violet-500 dark:border-violet-400',
    ring: 'ring-violet-500/60',
    bg: 'bg-violet-50/80 dark:bg-violet-950/30',
    text: 'text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-950/70 dark:text-violet-300',
    pillBg: 'bg-violet-500',
  },
  {
    id: 'teal',
    name: 'Verde-Água',
    hex: '#14b8a6',
    border: 'border-teal-500 dark:border-teal-400',
    ring: 'ring-teal-500/60',
    bg: 'bg-teal-50/80 dark:bg-teal-950/30',
    text: 'text-teal-600 dark:text-teal-400',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300',
    pillBg: 'bg-teal-500',
  },
];

export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  Pizza: 'orange',
  Salad: 'emerald', // Green for salad!
  Sides: 'amber',
  Pasta: 'indigo',
  Drinks: 'sky',
  Dessert: 'violet',
  Special: 'rose',
};

export function getCategoryColorScheme(
  categoryName?: string,
  categoryColors?: Record<string, string>
): CategoryColorOption {
  if (!categoryName) return CATEGORY_COLOR_OPTIONS[0];

  const colorId = categoryColors?.[categoryName];
  if (colorId) {
    const found = CATEGORY_COLOR_OPTIONS.find((c) => c.id === colorId);
    if (found) return found;
  }

  // Fallback smart defaults
  const lower = categoryName.toLowerCase();
  if (lower.includes('salad') || lower.includes('verde') || lower.includes('green') || lower.includes('salada')) {
    return CATEGORY_COLOR_OPTIONS[1]; // emerald / green
  }
  if (lower.includes('pizza') || lower.includes('burger')) {
    return CATEGORY_COLOR_OPTIONS[0]; // orange
  }
  if (lower.includes('drink') || lower.includes('bebida') || lower.includes('suco') || lower.includes('refrigerante')) {
    return CATEGORY_COLOR_OPTIONS[3]; // sky
  }
  if (lower.includes('pasta') || lower.includes('massa')) {
    return CATEGORY_COLOR_OPTIONS[4]; // indigo
  }
  if (lower.includes('side') || lower.includes('porç') || lower.includes('focaccia') || lower.includes('entrada')) {
    return CATEGORY_COLOR_OPTIONS[2]; // amber
  }
  if (lower.includes('dessert') || lower.includes('doce') || lower.includes('sobremesa')) {
    return CATEGORY_COLOR_OPTIONS[6]; // violet
  }
  if (lower.includes('special') || lower.includes('promo') || lower.includes('chef')) {
    return CATEGORY_COLOR_OPTIONS[5]; // rose
  }

  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CATEGORY_COLOR_OPTIONS.length;
  return CATEGORY_COLOR_OPTIONS[index];
}

export const COLOR_PALETTES = CATEGORY_COLOR_OPTIONS;

export function getInitials(name: string): string {
  if (!name || !name.trim()) return '????';
  const clean = name.trim().toUpperCase();
  const words = clean.split(/[\s\-_]+/).filter(Boolean);

  if (words.length === 1) {
    // If only one word, return up to 4 characters (e.g. PEPP, MARG, FOCA)
    return words[0].slice(0, Math.min(4, words[0].length));
  }

  if (words.length === 2) {
    // If 2 words, take first 2 letters of each word to form a 4-letter code (e.g. "MA" + "PI" = "MAPI")
    const p1 = words[0].slice(0, 2);
    const p2 = words[1].slice(0, 2);
    return (p1 + p2).slice(0, 4);
  }

  if (words.length >= 4) {
    // If 4 or more words, take first letter of first 4 words
    return words.slice(0, 4).map((w) => w[0]).join('');
  }

  // 3 words: take first letters plus extra letter to make at least 3-4 chars
  if (words.length === 3) {
    return (words[0][0] + words[1][0] + words[2].slice(0, 2)).slice(0, 4);
  }

  return clean.slice(0, 4);
}

export function getColorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTES.length;
  return COLOR_PALETTES[index];
}

export const DEFAULT_CATEGORIES = [
  'Lunch',
  'Pizza',
  'Sides',
  'Salad',
  'Pasta',
  'Drinks',
  'Dessert',
  'Special',
];

// Barcodes matching the reference sheet (Botanicca Shadowbook & Reference Spec)
export const DEFAULT_CATEGORY_BARCODES: Record<string, string> = {
  Lunch: '1796938',
  LUNCH: '1796938',
  Almoço: '1796938',
  Salad: '0986216',
  Salada: '0986216',
  Pizza: '0342515',
  Pizzas: '0342515',
  PIZZA: '0342515',
  Sides: '0342512',
  Acompanhamentos: '0342512',
  Pasta: '0402497',
  Massas: '0402497',
  Drinks: '9120446',
  Bebidas: '9120446',
  Dessert: '0342890',
  Sobremesas: '0342890',
  Special: '0338447',
  Especiais: '0338447',
  General: '0338453',
};

export function getCategoryBarcode(
  categoryName?: string,
  categoryBarcodes?: Record<string, string>
): { name: string; code: string } {
  const name = (categoryName || 'General').trim();
  if (categoryBarcodes && categoryBarcodes[name]) {
    return { name, code: categoryBarcodes[name] };
  }
  if (DEFAULT_CATEGORY_BARCODES[name]) {
    return { name, code: DEFAULT_CATEGORY_BARCODES[name] };
  }
  // Try case-insensitive matching
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(DEFAULT_CATEGORY_BARCODES)) {
    if (key.toLowerCase() === lower) {
      return { name, code: val };
    }
  }
  // Deterministic 7-digit barcode number generator for any custom category
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const positive = (Math.abs(hash) % 9000000) + 1000000;
  return { name, code: `0${positive}`.slice(-7) };
}

export const INITIAL_CARDS: CardItem[] = [
  {
    id: 'card-0',
    name: 'Executive Lunch',
    initials: 'LNCH',
    category: 'Lunch',
    isActive: true,
    colorScheme: COLOR_PALETTES[3], // sky
    createdAt: Date.now() - 3700000,
  },
  {
    id: 'card-1',
    name: 'Margherita Classic',
    initials: 'MC',
    category: 'Pizza',
    isActive: true,
    colorScheme: COLOR_PALETTES[0], // orange
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'card-2',
    name: 'Pepperoni Supreme',
    initials: 'PS',
    category: 'Pizza',
    isActive: true,
    colorScheme: COLOR_PALETTES[5], // rose
    createdAt: Date.now() - 3500000,
  },
  {
    id: 'card-3',
    name: 'Quattro Formaggi',
    initials: 'QF',
    category: 'Pizza',
    isActive: true,
    colorScheme: COLOR_PALETTES[1], // amber
    createdAt: Date.now() - 3400000,
  },
  {
    id: 'card-4',
    name: 'Truffle Mushroom',
    initials: 'TM',
    category: 'Pizza',
    isActive: false, // demonstrates an off item that can be turned on!
    colorScheme: COLOR_PALETTES[4], // indigo
    createdAt: Date.now() - 3300000,
  },
  {
    id: 'card-5',
    name: 'Garlic Focaccia',
    initials: 'GF',
    category: 'Sides',
    isActive: true,
    colorScheme: COLOR_PALETTES[2], // emerald
    createdAt: Date.now() - 3200000,
  },
  {
    id: 'card-6',
    name: 'Caesar Salad',
    initials: 'CS',
    category: 'Salad',
    isActive: true,
    colorScheme: COLOR_PALETTES[7], // teal
    createdAt: Date.now() - 3100000,
  },
];

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

// Sound effects using Web Audio API (graceful fallback, zero external files)
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  playPop() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio might be blocked by browser policy until user gesture
    }
  }

  playSend() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // ignore
    }
  }

  playOvenStart() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(392, now); // G4
      osc.frequency.setValueAtTime(587.33, now + 0.08); // D5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.2);
    } catch {
      // ignore
    }
  }

  playDelivered() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // 2-tone pleasant bell
      const freqs = [523.25, 659.25, 783.99]; // C - E - G chord
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.35);
      });
    } catch {
      // ignore
    }
  }

  playBell() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [880, 1174.66].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.14, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.4);
      });
    } catch {
      // ignore
    }
  }
}

export const sounds = new SoundManager();
