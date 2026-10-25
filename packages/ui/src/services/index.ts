/**
 * Sensory services barrel + React hook.
 */

import type { SensoryEvent, MotionPreset } from './types';
import { webSensory, MOTION_PRESETS } from './web';

export { webSensory, MOTION_PRESETS };
export type { SensoryEvent, MotionPreset };

export type { HapticsService, SoundService, MotionService, SensoryServices } from './types';

export { webHaptics } from './web';
export { webSound } from './web';
export { webMotion } from './web';

export { useGlassBudget } from './glassBudget';
export type { GlassBudgetState } from './glassBudget';

/**
 * useSensory — React hook to access sensory services in components.
 */
export function useSensory() {
  return {
    haptics: webSensory.haptics,
    sound: webSensory.sound,
    motion: webSensory.motion,
  };
}

/**
 * useMotion(preset) — hook returning motion preset config.
 */
export function useMotion(preset: MotionPreset) {
  return webSensory.motion.useMotion(preset);
}
