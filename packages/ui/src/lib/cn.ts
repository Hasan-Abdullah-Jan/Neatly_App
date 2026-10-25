/**
 * Shared component utilities.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Checks whether a component is using a hard-coded animation duration instead
 * of a CSS variable token. Used in unit tests to enforce token usage.
 * Returns true if a hard-coded duration (e.g. `0.3s`, `300ms`, `1s`) is found
 * in inline style or computed transition/animation properties.
 */
const HARD_CODED_DURATION = /(^|[^0-9.-])(\d*\.?\d+)(s|ms)/;

export function hasHardCodedDuration(element: HTMLElement): boolean {
  const style = getComputedStyle(element);
  const props = [
    style.transitionDuration,
    style.animationDuration,
    element.style.transitionDuration,
    element.style.animationDuration,
  ];
  return props.some((v) => v && HARD_CODED_DURATION.test(v));
}
