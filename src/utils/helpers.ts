import { CardItem } from '../types';

export const COLOR_PALETTES = [
  {
    bg: 'bg-orange-50/60',
    border: 'border-orange-200',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-800',
    pillBg: 'bg-orange-500',
  },
  {
    bg: 'bg-amber-50/60',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800',
    pillBg: 'bg-amber-500',
  },
  {
    bg: 'bg-emerald-50/60',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800',
    pillBg: 'bg-emerald-500',
  },
  {
    bg: 'bg-sky-50/60',
    border: 'border-sky-200',
    text: 'text-sky-700',
    badge: 'bg-sky-100 text-sky-800',
    pillBg: 'bg-sky-500',
  },
  {
    bg: 'bg-indigo-50/60',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-800',
    pillBg: 'bg-indigo-500',
  },
  {
    bg: 'bg-rose-50/60',
    border: 'border-rose-200',
    text: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-800',
    pillBg: 'bg-rose-500',
  },
  {
    bg: 'bg-violet-50/60',
    border: 'border-violet-200',
    text: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-800',
    pillBg: 'bg-violet-500',
  },
  {
    bg: 'bg-teal-50/60',
    border: 'border-teal-200',
    text: 'text-teal-700',
    badge: 'bg-teal-100 text-teal-800',
    pillBg: 'bg-teal-500',
  },
];

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
  'Pizza',
  'Sides',
  'Salad',
  'Pasta',
  'Drinks',
  'Dessert',
  'Special',
];

export const INITIAL_CARDS: CardItem[] = [
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
