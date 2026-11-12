import { GRID_PRESETS, type GridSpec } from './grids';

export type DeviceName = 'mobile' | 'tablet';
export type Orientation = 'portrait' | 'landscape';

export interface DeviceSpec {
  width: number;
  height: number;
  grid: keyof typeof GRID_PRESETS;
  safeArea: { top: number; bottom: number };
  homeIndicator: { width: number; height: number; bottom: number };
  basis: string;
}

export const DEVICES: Record<DeviceName, DeviceSpec> = {
  mobile: { width: 393, height: 852, grid: 'mobile', safeArea: { top: 59, bottom: 34 }, homeIndicator: { width: 134, height: 5, bottom: 8 }, basis: 'iPhone 6.1" (393×852 pt), shared with Android compact' },
  tablet: { width: 834, height: 1194, grid: 'tablet', safeArea: { top: 24, bottom: 20 }, homeIndicator: { width: 320, height: 5, bottom: 6 }, basis: 'iPad 11" (834×1194 pt), Android medium/expanded width' },
};

export const SAFE_AREA_COLOR = '#FF8A0026';

export interface DeviceInput {
  device?: DeviceName;
  orientation?: Orientation;
  safeArea?: boolean;
  systemBars?: boolean;
  width?: unknown;
  height?: unknown;
  clip?: boolean;
  layoutGrids?: unknown;
}

export interface DeviceFrame {
  width: number;
  height: number;
  clip: boolean;
  layoutGrids?: GridSpec[];
}

export function safeAreaGrids(spec: DeviceSpec): GridSpec[] {
  return [
    { pattern: 'ROWS', count: 1, alignment: 'MIN', size: spec.safeArea.top, margin: 0, gutter: 0, color: SAFE_AREA_COLOR },
    { pattern: 'ROWS', count: 1, alignment: 'MAX', size: spec.safeArea.bottom, margin: 0, gutter: 0, color: SAFE_AREA_COLOR },
  ];
}

export function deviceFrame(p: DeviceInput): DeviceFrame | undefined {
  if (p.device === undefined) return undefined;
  const spec = DEVICES[p.device];
  if (!spec) throw new Error(`Unknown device "${String(p.device)}". Use ${Object.keys(DEVICES).join(' or ')}.`);
  const landscape = p.orientation === 'landscape';
  const frame: DeviceFrame = {
    width: landscape ? spec.height : spec.width,
    height: landscape ? spec.width : spec.height,
    clip: p.clip ?? true,
  };
  if (p.layoutGrids === undefined) {
    frame.layoutGrids = [...GRID_PRESETS[spec.grid], ...(p.safeArea === false ? [] : safeAreaGrids(spec))];
  }
  return frame;
}

export const STATUS_ICONS_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="68" height="13" viewBox="0 0 68 13" fill="none">' +
  '<rect x="0" y="8" width="3" height="4" rx="1" fill="#000"/><rect x="5" y="6" width="3" height="6" rx="1" fill="#000"/>' +
  '<rect x="10" y="3.5" width="3" height="8.5" rx="1" fill="#000"/><rect x="15" y="1" width="3" height="11" rx="1" fill="#000"/>' +
  '<path d="M30.5 3.2a9 9 0 0 1 6 2.3l1.2-1.3a10.8 10.8 0 0 0-14.4 0l1.2 1.3a9 9 0 0 1 6-2.3Zm0 3.4a5.6 5.6 0 0 1 3.7 1.4l1.2-1.3a7.4 7.4 0 0 0-9.8 0l1.2 1.3a5.6 5.6 0 0 1 3.7-1.4Zm0 3.3c.7 0 1.3.2 1.8.6l-1.8 2-1.8-2c.5-.4 1.1-.6 1.8-.6Z" fill="#000"/>' +
  '<rect x="41.5" y="0.5" width="23" height="12" rx="3.5" stroke="#000" stroke-opacity="0.35"/>' +
  '<rect x="43" y="2" width="20" height="9" rx="2" fill="#000"/><path d="M66 4.5v4a2 2 0 0 0 0-4Z" fill="#000" fill-opacity="0.4"/></svg>';

export function systemBarNodes(p: DeviceInput, frame: DeviceFrame): Record<string, unknown>[] {
  if (p.device === undefined || p.systemBars === false) return [];
  const spec = DEVICES[p.device];
  const top = spec.safeArea.top;
  const statusBar = {
    type: 'frame',
    name: 'overlay/status-bar',
    absolute: true,
    locked: true,
    x: 0,
    y: 0,
    width: frame.width,
    height: top,
    layout: 'HORIZONTAL',
    justify: 'SPACE_BETWEEN',
    align: 'CENTER',
    padding: [0, p.device === 'mobile' ? 32 : 24],
    children: [
      { type: 'text', name: 'time', text: '9:41', fontFamily: 'Inter', fontWeight: 600, fontSize: p.device === 'mobile' ? 17 : 15, color: '#000000' },
      { type: 'svg', name: 'icon/status', svg: STATUS_ICONS_SVG },
    ],
  };
  const indicator = spec.homeIndicator;
  const homeIndicator = {
    type: 'rect',
    name: 'overlay/home-indicator',
    absolute: true,
    locked: true,
    x: Math.round((frame.width - indicator.width) / 2),
    y: frame.height - indicator.bottom - indicator.height,
    width: indicator.width,
    height: indicator.height,
    radius: 100,
    fill: '#000000',
  };
  return [statusBar, homeIndicator];
}
