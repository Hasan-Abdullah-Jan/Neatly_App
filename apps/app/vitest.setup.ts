import { expect } from 'vitest';

export {};

declare module 'vitest' {
  interface Assertion<T> {
    toBeAccessible(): void;
  }
}
