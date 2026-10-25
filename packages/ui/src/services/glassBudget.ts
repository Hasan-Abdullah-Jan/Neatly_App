/**
 * useGlassBudget — glass performance guard.
 *
 * Caps simultaneous backdrop-filter layers (three per screen), forbids nested
 * blur, and falls back to lite glass automatically when device memory is 4 GB
 * or less or frame rate stays under 45 fps for two seconds.
 */

import { useEffect, useState, useCallback } from 'react';

const MAX_BLUR_LAYERS = 3;
const FPS_THRESHOLD = 45;
const FPS_WINDOW_MS = 2000;

export interface GlassBudgetState {
  mode: 'liquid' | 'lite' | 'solid';
  blurLayerCount: number;
  nestedBlurForbidden: boolean;
}

export function useGlassBudget(): GlassBudgetState & {
  registerBlurLayer: () => void;
  unregisterBlurLayer: () => void;
  canUseBackdropFilter: boolean;
} {
  const [blurLayerCount, setBlurLayerCount] = useState(0);
  const [forcedMode, setForcedMode] = useState<'liquid' | 'lite' | 'solid'>(
    'liquid',
  );

  const canUseBackdropFilter = blurLayerCount < MAX_BLUR_LAYERS;

  const registerBlurLayer = useCallback(() => {
    setBlurLayerCount((c) => Math.min(c + 1, MAX_BLUR_LAYERS));
  }, []);

  const unregisterBlurLayer = useCallback(() => {
    setBlurLayerCount((c) => Math.max(c - 1, 0));
  }, []);

  useEffect(() => {
    // Device memory check
    const deviceMemory = (navigator as any).deviceMemory;
    if (deviceMemory !== undefined && deviceMemory <= 4) {
      setForcedMode('lite');
      return;
    }

    // Frame rate check: sample over 2 seconds
    let frameCount = 0;
    let lastTime = performance.now();
    let checked = false;

    const checkFrame = () => {
      if (checked) return;
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= FPS_WINDOW_MS) {
        const fps = (frameCount * 1000) / (now - lastTime);
        if (fps < FPS_THRESHOLD) {
          setForcedMode('lite');
        }
        checked = true;
      } else {
        requestAnimationFrame(checkFrame);
      }
    };

    requestAnimationFrame(checkFrame);
  }, []);

  const effectiveMode = forcedMode;

  return {
    mode: effectiveMode,
    blurLayerCount,
    nestedBlurForbidden: true,
    canUseBackdropFilter,
    registerBlurLayer,
    unregisterBlurLayer,
  };
}
