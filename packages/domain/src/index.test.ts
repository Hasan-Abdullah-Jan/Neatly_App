/**
 * Unit tests for @neatly/domain placeholder.
 */

import { describe, it, expect } from 'vitest';
import { domain } from './index';

describe('domain placeholder', () => {
  it('has version and level', () => {
    expect(domain.version).toBe('0.1.0');
    expect(domain.level).toBe(1);
  });
});
