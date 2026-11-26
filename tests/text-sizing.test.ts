import { describe, expect, it } from 'vitest';
import { sizesThroughLayout, textAutoResizeFor } from '../src/shared/text-sizing';

describe('sizesThroughLayout', () => {
  it('uses layout sizing for every node inside auto layout', () => {
    expect(sizesThroughLayout(true, true)).toBe(true);
    expect(sizesThroughLayout(false, true)).toBe(true);
  });

  it('skips layout sizing for text outside auto layout', () => {
    expect(sizesThroughLayout(true, false)).toBe(false);
  });

  it('keeps layout sizing for frames outside auto layout', () => {
    expect(sizesThroughLayout(false, false)).toBe(true);
  });
});

describe('textAutoResizeFor', () => {
  it('grows both ways when the width hugs', () => {
    expect(textAutoResizeFor(true, 'HUG', false)).toBe('WIDTH_AND_HEIGHT');
  });

  it('wraps at a fixed width and grows in height', () => {
    expect(textAutoResizeFor(false, undefined, false)).toBe('HEIGHT');
    expect(textAutoResizeFor(false, 'HUG', false)).toBe('HEIGHT');
  });

  it('leaves the box alone when the height is fixed or given', () => {
    expect(textAutoResizeFor(false, 'FIXED', false)).toBeUndefined();
    expect(textAutoResizeFor(false, undefined, true)).toBeUndefined();
  });
});
