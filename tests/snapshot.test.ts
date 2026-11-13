import { describe, expect, it } from 'vitest';
import {
  batches,
  cleanPaints,
  countNodes,
  fallbackFontStyle,
  fitPadding,
  fixedAxes,
  fontsOf,
  imageKeysOf,
  measureDiff,
  missingFonts,
  pickImages,
  shellOf,
  snapshotFileName,
  type SnapNode,
} from '../src/shared/snapshot';

const frame = (over: Partial<SnapNode> = {}): SnapNode => ({ t: 'FRAME', name: 'f', x: 0, y: 0, w: 100, h: 50, ...over });

describe('snapshot: paints', () => {
  it('drops variable bindings and keeps the resolved colour', () => {
    const out = cleanPaints([{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, boundVariables: { color: { id: 'v' } } }]);
    expect(out).toEqual([{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]);
    expect(cleanPaints(undefined)).toEqual([]);
  });

  it('collects image keys through the tree and picks only those images', () => {
    const tree = frame({
      fills: [{ type: 'IMAGE', imageHash: 'a' }],
      kids: [frame({ fills: [{ type: 'IMAGE', imageHash: 'b' }, { type: 'SOLID' }] }), frame()],
    });
    expect([...imageKeysOf(tree)].sort()).toEqual(['a', 'b']);
    expect(pickImages(['b', 'z'], { a: '1', b: '2' })).toEqual({ b: '2' });
  });
});

describe('snapshot: sizing', () => {
  it('reads which axes are fixed from the auto-layout sizing modes', () => {
    const layout = { mode: 'HORIZONTAL' as const, padding: [0, 0, 0, 0] as [number, number, number, number], gap: 0, justify: 'MIN', align: 'MIN' };
    expect(fixedAxes(frame())).toEqual({ width: true, height: true });
    expect(fixedAxes(frame({ layout: { ...layout, primarySizing: 'AUTO', counterSizing: 'FIXED' } }))).toEqual({ width: false, height: true });
    expect(fixedAxes(frame({ layout: { ...layout, mode: 'VERTICAL', primarySizing: 'FIXED', counterSizing: 'AUTO' } }))).toEqual({ width: false, height: true });
  });

  it('shrinks padding that a fixed size was hiding (badge 22 high with 290 padding)', () => {
    expect(fitPadding(22, 596, 290, 290)).toEqual([3, 3]);
    expect(fitPadding(40, 40, 12, 12)).toEqual([12, 12]);
    expect(fitPadding(10, 30, 0, 0)).toEqual([0, 0]);
  });
});

describe('snapshot: verification', () => {
  it('reports layers whose size differs beyond the tolerance, with their path', () => {
    const tree = frame({ name: 'IAP', kids: [frame({ name: 'Tag', w: 82, h: 22 }), frame({ name: 'Ok', w: 10, h: 10 })] });
    const built = { w: 100, h: 50, kids: [{ w: 82, h: 580 }, { w: 10.4, h: 10 }] };
    expect(measureDiff(tree, built)).toEqual([{ path: 'IAP/Tag', want: [82, 22], got: [82, 580] }]);
  });

  it('counts nodes and strips children for the root shell', () => {
    const tree = frame({ kids: [frame({ kids: [frame()] }), frame()] });
    expect(countNodes(tree)).toBe(4);
    expect(shellOf(tree).kids).toEqual([]);
    expect(tree.kids).toHaveLength(2);
  });
});

describe('snapshot: fonts and files', () => {
  it('lists fonts used by text segments and those the target lacks', () => {
    const text = (family: string, style: string): SnapNode => ({
      ...frame({ t: 'TEXT' }),
      text: {
        chars: 'a',
        alignH: 'LEFT',
        alignV: 'TOP',
        autoResize: 'WIDTH_AND_HEIGHT',
        segments: [{ start: 0, end: 1, font: { family, style }, size: 12, fills: [], lineHeight: {}, letterSpacing: {}, textCase: 'ORIGINAL', decoration: 'NONE' }],
      },
    });
    const used = fontsOf(frame({ kids: [text('BEAT TECH', 'Regular'), text('Lexend', 'Bold')] }));
    expect(missingFonts(used, [{ family: 'Lexend', styles: ['Bold', 'Regular'] }])).toEqual(['BEAT TECH|Regular']);
  });

  it('makes a safe file name and splits work into batches', () => {
    expect(snapshotFileName('IAP · Gốc / v2')).toBe('IAP-Goc-v2.json');
    expect(snapshotFileName('***')).toBe('snapshot.json');
    expect(batches([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe('snapshot: font fallback keeps the weight', () => {
  const inter = ['Thin', 'Light', 'Regular', 'Italic', 'Medium', 'Semi Bold', 'Bold', 'Bold Italic', 'Extra Bold', 'Black'];
  it('maps a missing style to the same weight of the fallback family', () => {
    expect(fallbackFontStyle('Semibold', inter)).toBe('Semi Bold');
    expect(fallbackFontStyle('SemiBold', inter)).toBe('Semi Bold');
    expect(fallbackFontStyle('Bold Oblique', inter)).toBe('Bold Italic');
    expect(fallbackFontStyle('Heavy', inter)).toBe('Black');
    expect(fallbackFontStyle('Regular', inter)).toBe('Regular');
    expect(fallbackFontStyle('Book', inter)).toBe('Regular');
    expect(fallbackFontStyle('ExtraLight', ['Regular', 'Light'])).toBe('Regular');
  });
});
