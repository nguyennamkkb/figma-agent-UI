import { GRID_PRESETS, type GridSpec } from './grids';

export type DeviceName = 'mobile' | 'tablet' | 'duo-outer' | 'duo-inner';
export type Orientation = 'portrait' | 'landscape';

export interface DeviceSpec {
  width: number;
  height: number;
  grid?: keyof typeof GRID_PRESETS;
  safeArea: { top: number; bottom: number };
  homeIndicator?: { width: number; height: number; bottom: number };
  radius?: number | [number, number, number, number];
  rail?: { width: number; chromeHeight: number; camera: boolean; contentMargin: number };
  hinge?: { x: number; width: number };
  fixedHeight?: boolean;
  basis: string;
}

export const DEVICES: Record<DeviceName, DeviceSpec> = {
  mobile: { width: 393, height: 852, grid: 'mobile', safeArea: { top: 59, bottom: 34 }, homeIndicator: { width: 134, height: 5, bottom: 8 }, basis: 'iPhone 6.1" (393×852 pt), shared with Android compact' },
  tablet: { width: 834, height: 1194, grid: 'tablet', safeArea: { top: 24, bottom: 20 }, homeIndicator: { width: 320, height: 5, bottom: 6 }, basis: 'iPad 11" (834×1194 pt), Android medium/expanded width' },
  'duo-outer': {
    width: 466,
    height: 678,
    safeArea: { top: 0, bottom: 0 },
    radius: [0, 40, 40, 0],
    rail: { width: 84, chromeHeight: 169, camera: true, contentMargin: 20 },
    fixedHeight: true,
    basis: 'Duo foldable, outer display folded (Duo System variables)',
  },
  'duo-inner': {
    width: 951,
    height: 669,
    safeArea: { top: 0, bottom: 0 },
    radius: 36,
    rail: { width: 84, chromeHeight: 119, camera: false, contentMargin: 20 },
    hinge: { x: 462, width: 27 },
    fixedHeight: true,
    basis: 'Duo foldable, inner display unfolded (Duo System variables)',
  },
};

export const HINGE_COLOR = '#FF3B3014';

export const SAFE_AREA_COLOR = '#FF8A0026';
export const MARGIN_COLOR = '#3B82F61A';
export const HINGE_GRID_COLOR = '#FF3B3033';

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
  radius?: number | [number, number, number, number];
  fixedHeight: boolean;
  layoutGrids?: GridSpec[];
}

export function safeAreaGrids(spec: DeviceSpec): GridSpec[] {
  if (spec.rail) {
    const grids: GridSpec[] = [
      { pattern: 'COLUMNS', count: 1, alignment: 'MAX', size: spec.rail.width, margin: 0, gutter: 0, color: SAFE_AREA_COLOR },
      { pattern: 'COLUMNS', count: 1, alignment: 'MIN', size: spec.rail.contentMargin, margin: 0, gutter: 0, color: MARGIN_COLOR },
      { pattern: 'COLUMNS', count: 1, alignment: 'MAX', size: spec.rail.contentMargin, margin: spec.rail.width, gutter: 0, color: MARGIN_COLOR },
    ];
    if (spec.hinge) grids.push({ pattern: 'COLUMNS', count: 1, alignment: 'MIN', size: spec.hinge.width, margin: spec.hinge.x, gutter: 0, color: HINGE_GRID_COLOR });
    return grids;
  }
  return [
    { pattern: 'ROWS', count: 1, alignment: 'MIN', size: spec.safeArea.top, margin: 0, gutter: 0, color: SAFE_AREA_COLOR },
    { pattern: 'ROWS', count: 1, alignment: 'MAX', size: spec.safeArea.bottom, margin: 0, gutter: 0, color: SAFE_AREA_COLOR },
  ];
}

export function deviceFrame(p: DeviceInput): DeviceFrame | undefined {
  if (p.device === undefined) return undefined;
  const spec = DEVICES[p.device];
  if (!spec) throw new Error(`Unknown device "${String(p.device)}". Use ${Object.keys(DEVICES).join(' or ')}.`);
  const landscape = p.orientation === 'landscape' && !spec.rail;
  const frame: DeviceFrame = {
    width: landscape ? spec.height : spec.width,
    height: landscape ? spec.width : spec.height,
    clip: p.clip ?? true,
    radius: spec.radius,
    fixedHeight: spec.fixedHeight === true,
  };
  if (p.layoutGrids === undefined) {
    frame.layoutGrids = [...(spec.grid ? GRID_PRESETS[spec.grid] : []), ...(p.safeArea === false ? [] : safeAreaGrids(spec))];
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
  if (spec.rail) return railNodes(spec, frame);
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
  const indicator = spec.homeIndicator ?? { width: 134, height: 5, bottom: 8 };
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

export const STATUS_RING_SVG =
  "<svg width='46' height='47' viewBox='0 0 46 47' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M23.0002 0.00814819C27.3778 0.00818461 31.6646 1.25724 35.3568 3.60904C39.049 5.96099 41.9934 9.31828 43.8439 13.2856C45.6945 17.253 46.3749 21.6663 45.8042 26.0067C45.2334 30.347 43.435 34.4344 40.6218 37.7885C40.1394 38.3632 39.2825 38.4381 38.7075 37.9559C38.1327 37.4735 38.0579 36.6166 38.5401 36.0416C41.0207 33.084 42.6055 29.4796 43.1089 25.6524C43.6121 21.825 43.0122 17.9327 41.3804 14.4342C39.7486 10.936 37.1524 7.97601 33.8968 5.9021C30.641 3.82819 26.8604 2.72596 23.0002 2.72592C19.1399 2.72596 15.3594 3.82814 12.1036 5.9021C8.84779 7.97608 6.25079 10.9358 4.61898 14.4342C2.98717 17.9327 2.38828 21.825 2.89153 25.6524C3.39485 29.4796 4.97967 33.084 7.46029 36.0416C7.94252 36.6166 7.86762 37.4735 7.29285 37.9559C6.71775 38.4381 5.85987 38.3635 5.37754 37.7885C2.56443 34.4344 0.766962 30.3469 0.196215 26.0067C-0.37448 21.6663 0.30593 17.253 2.15644 13.2856C4.00696 9.31832 6.95142 5.96099 10.6436 3.60904C14.3357 1.2573 18.6227 0.00818613 23.0002 0.00814819Z' fill='black'/><circle cx='12.8401' cy='42.1077' r='1.98636' fill='black'/><circle cx='17.7647' cy='43.9981' r='1.98636' fill='black'/><circle cx='23' cy='44.641' r='1.98636' fill='black'/><circle cx='28.2354' cy='43.9981' r='1.98636' fill='black'/><circle cx='33.1597' cy='42.1077' r='1.98636' fill='black'/><path d='M23.0005 25.4076C24.1674 25.4076 25.2903 25.8568 26.1351 26.6617C26.3739 26.8894 26.3841 27.2678 26.1586 27.5086L23.439 30.4083C23.3254 30.5295 23.1666 30.5988 23.0005 30.5989C22.8344 30.5988 22.6757 30.5295 22.562 30.4083L19.8424 27.5086C19.6167 27.2677 19.6269 26.8894 19.8659 26.6617C20.7108 25.8568 21.8336 25.4076 23.0005 25.4076Z' fill='black'/><path d='M23.0005 20.1472C24.2386 20.1472 25.4651 20.3921 26.6088 20.8662C27.7525 21.3405 28.7928 22.0363 29.6677 22.9125C30.2666 23.5131 30.2654 24.4858 29.6651 25.0853C29.0646 25.6845 28.0919 25.684 27.4923 25.084C26.9029 24.4937 26.2022 24.0255 25.4317 23.7059C24.6611 23.3864 23.8347 23.2218 23.0005 23.2217C22.1663 23.2218 21.3399 23.3864 20.5693 23.7059C19.7988 24.0254 19.0981 24.4937 18.5087 25.084C17.9091 25.6841 16.9364 25.6844 16.3359 25.0853C15.7353 24.4856 15.735 23.513 16.3346 22.9125C17.2096 22.0362 18.2484 21.3405 19.3922 20.8662C20.536 20.392 21.7623 20.1472 23.0005 20.1472Z' fill='black'/><path d='M23.0005 14.3556C24.9623 14.3557 26.9048 14.7475 28.7138 15.5066C30.5228 16.2658 32.1626 17.3782 33.537 18.7782C34.1315 19.3838 34.1229 20.3565 33.5174 20.951C32.9118 21.5453 31.9391 21.5369 31.3446 20.9315C30.2563 19.8229 28.9574 18.9423 27.5249 18.3411C26.0925 17.74 24.554 17.4303 23.0005 17.4302C21.4469 17.4302 19.9074 17.7399 18.4748 18.3411C17.0424 18.9423 15.7433 19.8229 14.6551 20.9315C14.0605 21.5367 13.0878 21.5454 12.4823 20.951C11.8772 20.3565 11.8685 19.3838 12.4627 18.7782C13.8371 17.3782 15.4769 16.2659 17.2859 15.5066C19.0951 14.7474 21.0385 14.3557 23.0005 14.3556Z' fill='black'/></svg>";

function railNodes(spec: DeviceSpec, frame: DeviceFrame): Record<string, unknown>[] {
  const rail = spec.rail!;
  const chrome = {
    type: 'frame',
    name: 'overlay/system-chrome',
    absolute: true,
    locked: true,
    x: frame.width - rail.width,
    y: 0,
    width: rail.width,
    height: rail.chromeHeight,
    widthMode: 'FIXED',
    heightMode: 'FIXED',
    layout: 'VERTICAL',
    padding: [rail.camera ? 26.5 : 24, 24, 0, 12],
    gap: rail.camera ? 10.5 : 11,
    align: 'CENTER',
    children: [
      ...(rail.camera ? [{ type: 'ellipse', name: 'Front Camera', width: 37, height: 37, fill: '#000000' }] : []),
      {
        type: 'frame',
        name: 'Time and Status',
        width: 48,
        height: 86,
        widthMode: 'FIXED',
        heightMode: 'FIXED',
        layout: 'VERTICAL',
        padding: [11, 0, 4, 0],
        gap: 6,
        align: 'CENTER',
        children: [
          { type: 'text', name: 'Time', text: '9:41', fontFamily: 'Inter', fontWeight: 700, fontSize: 16, lineHeight: 19, letterSpacing: -0.43, textAlign: 'CENTER', width: 48, color: '#000000' },
          { type: 'svg', name: 'Status Indicator', svg: STATUS_RING_SVG },
        ],
      },
    ],
  };
  if (!spec.hinge) return [chrome];
  const hinge = {
    type: 'rect',
    name: 'overlay/hinge',
    absolute: true,
    locked: true,
    x: spec.hinge.x,
    y: 0,
    width: spec.hinge.width,
    height: frame.height,
    fill: HINGE_COLOR,
  };
  return [hinge, chrome];
}
