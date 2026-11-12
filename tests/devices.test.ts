import { describe, expect, it } from 'vitest';
import { DEVICES, deviceFrame, safeAreaGrids, systemBarNodes } from '../src/shared/devices';
import { toLayoutGrid } from '../src/shared/grids';
import { TreeNode, UpdateProps } from '../src/shared/schemas';

describe('device presets', () => {
  it('has mobile, tablet and the two duo displays', () => {
    expect(Object.keys(DEVICES)).toEqual(['mobile', 'tablet', 'duo-outer', 'duo-inner']);
    expect(DEVICES.mobile).toMatchObject({ width: 393, height: 852, grid: 'mobile' });
    expect(DEVICES.tablet).toMatchObject({ width: 834, height: 1194, grid: 'tablet' });
  });

  it('returns nothing without a device', () => {
    expect(deviceFrame({})).toBeUndefined();
  });

  it('sizes the frame, clips it and adds grid plus safe-area rows', () => {
    const frame = deviceFrame({ device: 'mobile' });
    expect(frame).toMatchObject({ width: 393, height: 852, clip: true });
    expect(frame?.layoutGrids).toHaveLength(3);
    expect(frame?.layoutGrids?.[0]).toMatchObject({ pattern: 'COLUMNS', count: 4 });
    expect(frame?.layoutGrids?.slice(1)).toEqual(safeAreaGrids(DEVICES.mobile));
  });

  it('swaps width and height in landscape', () => {
    expect(deviceFrame({ device: 'tablet', orientation: 'landscape' })).toMatchObject({ width: 1194, height: 834 });
  });

  it('drops the safe area on request and keeps explicit grids and clip', () => {
    expect(deviceFrame({ device: 'tablet', safeArea: false })?.layoutGrids).toHaveLength(1);
    const custom = deviceFrame({ device: 'mobile', layoutGrids: { preset: 'baseline' }, clip: false });
    expect(custom?.layoutGrids).toBeUndefined();
    expect(custom?.clip).toBe(false);
  });

  it('builds valid Figma grids for the safe-area bands', () => {
    const [top, bottom] = safeAreaGrids(DEVICES.mobile).map(toLayoutGrid);
    expect(top).toMatchObject({ pattern: 'ROWS', alignment: 'MIN', sectionSize: 59, count: 1 });
    expect(bottom).toMatchObject({ pattern: 'ROWS', alignment: 'MAX', sectionSize: 34, count: 1 });
  });

  it('rejects unknown devices', () => {
    expect(() => deviceFrame({ device: 'watch' as never })).toThrow(/Unknown device/);
  });

  it('accepts device keys in render_tree and update_nodes, and grid gutters', () => {
    expect(TreeNode.safeParse({ type: 'frame', device: 'tablet', orientation: 'landscape', safeArea: false }).success).toBe(true);
    expect(TreeNode.safeParse({ type: 'frame', device: 'watch' }).success).toBe(false);
    expect(UpdateProps.safeParse({ device: 'mobile' }).success).toBe(true);
    expect(TreeNode.safeParse({ type: 'frame', layoutGrids: [{ pattern: 'COLUMNS', count: 4, gutter: 16, margin: 16 }] }).success).toBe(true);
  });
});

describe('system bars', () => {
  it('adds a locked status bar and home indicator sized to the frame', () => {
    const frame = deviceFrame({ device: 'mobile' })!;
    const [status, home] = systemBarNodes({ device: 'mobile' }, frame);
    expect(status).toMatchObject({ name: 'overlay/status-bar', width: 393, height: 59, locked: true, absolute: true });
    expect(home).toMatchObject({ name: 'overlay/home-indicator', width: 134, height: 5, x: 130, y: 839 });
    expect(TreeNode.safeParse(status).success).toBe(true);
    expect(TreeNode.safeParse(home).success).toBe(true);
  });

  it('follows landscape and can be turned off', () => {
    const frame = deviceFrame({ device: 'tablet', orientation: 'landscape' })!;
    const [status, home] = systemBarNodes({ device: 'tablet' }, frame);
    expect(status).toMatchObject({ width: 1194, height: 24 });
    expect(home).toMatchObject({ x: 437, y: 823 });
    expect(systemBarNodes({ device: 'mobile', systemBars: false }, frame)).toEqual([]);
    expect(systemBarNodes({}, frame)).toEqual([]);
  });
});

describe('duo foldable', () => {
  it('sizes outer and inner with fixed height, radius and a right rail', () => {
    const outer = deviceFrame({ device: 'duo-outer', orientation: 'landscape' })!;
    expect(outer).toMatchObject({ width: 466, height: 678, radius: [0, 40, 40, 0], fixedHeight: true });
    expect(outer.layoutGrids?.[0]).toMatchObject({ pattern: 'COLUMNS', alignment: 'MAX', size: 84 });
    const inner = deviceFrame({ device: 'duo-inner' })!;
    expect(inner).toMatchObject({ width: 951, height: 669, radius: 36 });
    expect(inner.layoutGrids?.at(-1)).toMatchObject({ alignment: 'MIN', size: 27, margin: 462 });
  });

  it('adds the system rail and the hinge', () => {
    const outer = deviceFrame({ device: 'duo-outer' })!;
    const [chrome] = systemBarNodes({ device: 'duo-outer' }, outer);
    expect(chrome).toMatchObject({ name: 'overlay/system-chrome', x: 382, width: 84, height: 169 });
    expect((chrome.children as unknown[]).length).toBe(2);
    const inner = deviceFrame({ device: 'duo-inner' })!;
    const [hinge, innerChrome] = systemBarNodes({ device: 'duo-inner' }, inner);
    expect(hinge).toMatchObject({ name: 'overlay/hinge', x: 462, width: 27, height: 669 });
    expect(innerChrome).toMatchObject({ x: 867, height: 119 });
    for (const n of [chrome, hinge, innerChrome]) expect(TreeNode.safeParse(n).success).toBe(true);
  });
});
