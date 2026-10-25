/**
 * Sensory service types.
 *
 * Event vocabulary: select, toggle, confirm, complete, error, milestone,
 * open, close.
 */

export type SensoryEvent =
  | 'select'
  | 'toggle'
  | 'confirm'
  | 'complete'
  | 'error'
  | 'milestone'
  | 'open'
  | 'close';

export type MotionPreset = 'soft' | 'snappy' | 'settle';

export interface HapticsService {
  play: (event: SensoryEvent) => void;
  isSupported: () => boolean;
}

export interface SoundService {
  play: (event: SensoryEvent) => void;
  setEnabled: (enabled: boolean) => void;
  isEnabled: () => boolean;
}

export interface MotionService {
  useMotion: (preset: MotionPreset) => {
    duration: number;
    easing: string;
    spring: Record<string, number>;
  };
}

export interface SensoryServices {
  haptics: HapticsService;
  sound: SoundService;
  motion: MotionService;
}

export const sensoryEventLabels: Record<SensoryEvent, string> = {
  select: 'select',
  toggle: 'toggle',
  confirm: 'confirm',
  complete: 'complete',
  error: 'error',
  milestone: 'milestone',
  open: 'open',
  close: 'close',
};
