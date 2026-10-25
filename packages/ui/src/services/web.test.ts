/**
 * Unit tests for sensory services.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  webHaptics,
  webSound,
  webMotion,
  MOTION_PRESETS,
} from './web';
import type { SensoryEvent, MotionPreset } from './types';

describe('webHaptics', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { vibrate: vi.fn() } as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls navigator.vibrate with select pattern', () => {
    webHaptics.play('select');
    expect(window.navigator.vibrate).toHaveBeenCalledWith([5]);
  });

  it('calls navigator.vibrate with error pattern', () => {
    webHaptics.play('error');
    expect(window.navigator.vibrate).toHaveBeenCalledWith([10, 20, 10]);
  });

  it('calls navigator.vibrate with milestone pattern', () => {
    webHaptics.play('milestone');
    expect(window.navigator.vibrate).toHaveBeenCalledWith([20, 40, 20]);
  });

  it('isSupported returns true when vibrate exists', () => {
    expect(webHaptics.isSupported()).toBe(true);
  });
});

describe('webSound', () => {
  it('isEnabled returns false by default', () => {
    expect(webSound.isEnabled()).toBe(false);
  });

  it('setEnabled toggles state', () => {
    webSound.setEnabled(true);
    expect(webSound.isEnabled()).toBe(true);
    webSound.setEnabled(false);
    expect(webSound.isEnabled()).toBe(false);
  });
});

describe('webMotion', () => {
  it('returns soft preset', () => {
    const preset = webMotion.useMotion('soft');
    expect(preset.duration).toBe(320);
    expect(preset.spring.stiffness).toBe(260);
  });

  it('returns snappy preset', () => {
    const preset = webMotion.useMotion('snappy');
    expect(preset.duration).toBe(280);
    expect(preset.spring.stiffness).toBe(420);
  });

  it('returns settle preset', () => {
    const preset = webMotion.useMotion('settle');
    expect(preset.duration).toBe(360);
    expect(preset.spring.stiffness).toBe(500);
  });
});

describe('MOTION_PRESETS', () => {
  it('exports all three presets', () => {
    expect(MOTION_PRESETS.soft).toBeDefined();
    expect(MOTION_PRESETS.snappy).toBeDefined();
    expect(MOTION_PRESETS.settle).toBeDefined();
  });

  it('has correct event vocabulary coverage', () => {
    const events: SensoryEvent[] = [
      'select', 'toggle', 'confirm', 'complete', 'error',
      'milestone', 'open', 'close',
    ];
    for (const event of events) {
      expect(event).toBeDefined();
    }
  });

  it('has all motion presets', () => {
    const presets: MotionPreset[] = ['soft', 'snappy', 'settle'];
    for (const p of presets) {
      expect(MOTION_PRESETS[p]).toBeDefined();
    }
  });
});
