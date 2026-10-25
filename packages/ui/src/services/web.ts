/**
 * Web implementation of sensory services.
 *
 * - Haptics: Vibration API with pattern per event; light and on by default.
 * - Sound: Web Audio API soft tones; OFF by default; both obey Settings.
 * - Motion: returns motion preset config from tokens.
 */

import type {
  SensoryEvent,
  MotionPreset,
  HapticsService,
  SoundService,
  MotionService,
} from './types';

// Motion presets from tokens (mirrored so the service is pure + testable)
export const MOTION_PRESETS: Record<
  MotionPreset,
  { duration: number; easing: string; spring: Record<string, number> }
> = {
  soft: {
    duration: 320,
    easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
    spring: { stiffness: 260, damping: 20 },
  },
  snappy: {
    duration: 280,
    easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
    spring: { stiffness: 420, damping: 28 },
  },
  settle: {
    duration: 360,
    easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
    spring: { stiffness: 500, damping: 32 },
  },
};

// Vibration patterns per event (milliseconds)
const VIBRATION_PATTERNS: Record<SensoryEvent, number[]> = {
  select: [5],
  toggle: [8],
  confirm: [15],
  complete: [30],
  error: [10, 20, 10],
  milestone: [20, 40, 20],
  open: [10],
  close: [10],
};

// Audio oscillator context (lazy-initialized)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (audioCtx) return audioCtx;
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext;
  if (!Ctor) return null;
  audioCtx = new Ctor();
  return audioCtx;
}

function playTone(frequency: number, durationMs: number, type: OscillatorType = 'sine'): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  setTimeout(() => osc.stop(), durationMs);
}

const SOUND_NOTES: Record<SensoryEvent, { frequency: number; duration: number; type: OscillatorType }> = {
  select: { frequency: 600, duration: 30, type: 'sine' },
  toggle: { frequency: 700, duration: 30, type: 'sine' },
  confirm: { frequency: 900, duration: 60, type: 'sine' },
  complete: { frequency: 1100, duration: 100, type: 'sine' },
  error: { frequency: 200, duration: 150, type: 'sawtooth' },
  milestone: { frequency: 1300, duration: 200, type: 'sine' },
  open: { frequency: 800, duration: 50, type: 'sine' },
  close: { frequency: 600, duration: 50, type: 'sine' },
};

/** Persisted settings keys. */
const SETTINGS_KEY_HAPTICS = 'neatly:sensory:haptics';
const SETTINGS_KEY_SOUND = 'neatly:sensory:sound';

function getStoredBool(key: string, def: boolean): boolean {
  if (typeof localStorage === 'undefined') return def;
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? def : JSON.parse(raw);
  } catch {
    return def;
  }
}

function setStoredBool(key: string, value: boolean): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

let hapticsEnabled = getStoredBool(SETTINGS_KEY_HAPTICS, true);
let soundEnabled = getStoredBool(SETTINGS_KEY_SOUND, false);

/** Haptics — Vibration API. Light and on by default. */
export const webHaptics: HapticsService = {
  play: (event) => {
    if (!hapticsEnabled) return;
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
    const pattern = VIBRATION_PATTERNS[event];
    try {
      navigator.vibrate(pattern);
    } catch {
      /* vibration not supported/blocked */
    }
  },
  isSupported: () => {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  },
};

/** Sound — Web Audio API. Off by default. */
export const webSound: SoundService = {
  play: (event) => {
    if (!soundEnabled) return;
    const note = SOUND_NOTES[event];
    playTone(note.frequency, note.duration, note.type);
  },
  setEnabled: (enabled) => {
    soundEnabled = enabled;
    setStoredBool(SETTINGS_KEY_SOUND, enabled);
  },
  isEnabled: () => soundEnabled,
};

/** Motion — returns preset config. */
export const webMotion: MotionService = {
  useMotion: (preset) => MOTION_PRESETS[preset],
};

export const webSensory = {
  haptics: webHaptics,
  sound: webSound,
  motion: webMotion,
};
