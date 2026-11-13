export const SNAPSHOT_VERSION = 1;

export type SnapKind = 'FRAME' | 'SECTION' | 'RECTANGLE' | 'ELLIPSE' | 'TEXT' | 'SVG';
export type Sizing = 'FIXED' | 'HUG' | 'FILL';
export type Json = Record<string, unknown>;

export interface SnapSegment {
  start: number;
  end: number;
  font: { family: string; style: string };
  size: number;
  fills: Json[];
  lineHeight: Json;
  letterSpacing: Json;
  textCase: string;
  decoration: string;
}

export interface SnapOutline {
  svg: string;
  ox: number;
  oy: number;
}

export interface SnapNode {
  t: SnapKind;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  opacity?: number;
  rotation?: number;
  blendMode?: string;
  positioning?: 'AUTO' | 'ABSOLUTE';
  sizingH?: Sizing;
  sizingV?: Sizing;
  grow?: number;
  constraints?: Json;
  fills?: Json[];
  strokes?: Json[];
  strokeAlign?: string;
  strokeWeight?: number | [number, number, number, number];
  dash?: number[];
  effects?: Json[];
  radius?: number | [number, number, number, number];
  smoothing?: number;
  clip?: boolean;
  grids?: Json[];
  layout?: Layout;
  arc?: Json;
  svg?: string;
  ox?: number;
  oy?: number;
  text?: SnapText;
  kids?: SnapNode[];
}

export interface Layout {
  mode: 'HORIZONTAL' | 'VERTICAL';
  padding: [number, number, number, number];
  gap: number;
  counterGap?: number;
  wrap?: boolean;
  justify: string;
  align: string;
  primarySizing: 'FIXED' | 'AUTO';
  counterSizing: 'FIXED' | 'AUTO';
  strokesInLayout?: boolean;
  reverseZ?: boolean;
}

export interface SnapText {
  chars: string;
  segments: SnapSegment[];
  alignH: string;
  alignV: string;
  autoResize: string;
  maxLines?: number | null;
  truncation?: string;
  outline?: SnapOutline;
}

export interface ImageRef {
  key: string;
  kind: 'hash' | 'node';
  hash?: string;
  nodeId?: string;
}

export interface Snapshot {
  version: number;
  name: string;
  createdAt: string;
  source: { file: string | null; ids: string[] };
  roots: SnapNode[];
  images: Record<string, string>;
  fonts: string[];
  outlined: number;
}

export interface Measured {
  w: number;
  h: number;
  kids?: Measured[];
}

export interface SizeMismatch {
  path: string;
  want: [number, number];
  got: [number, number];
}

export function cleanPaints(paints: unknown): Json[] {
  if (!Array.isArray(paints)) return [];
  return paints.map((p) => {
    const copy = JSON.parse(JSON.stringify(p)) as Json;
    delete copy.boundVariables;
    return copy;
  });
}

export function cleanEffects(effects: unknown): Json[] {
  return cleanPaints(effects);
}

export function imageKeysOf(node: SnapNode, into: Set<string> = new Set()): Set<string> {
  for (const p of node.fills ?? []) if (p.type === 'IMAGE' && typeof p.imageHash === 'string') into.add(p.imageHash);
  for (const k of node.kids ?? []) imageKeysOf(k, into);
  return into;
}

export function shellOf(node: SnapNode): SnapNode {
  const { kids: _kids, ...rest } = node;
  return { ...rest, kids: [] };
}

export function countNodes(node: SnapNode): number {
  return 1 + (node.kids ?? []).reduce((sum, k) => sum + countNodes(k), 0);
}

export function fixedAxes(node: SnapNode): { width: boolean; height: boolean } {
  const l = node.layout;
  if (!l) return { width: true, height: true };
  const horizontal = l.mode === 'HORIZONTAL';
  const primaryFixed = l.primarySizing === 'FIXED';
  const counterFixed = l.counterSizing === 'FIXED';
  return {
    width: horizontal ? primaryFixed : counterFixed,
    height: horizontal ? counterFixed : primaryFixed,
  };
}

export function fitPadding(fixed: number, actual: number, start: number, end: number): [number, number] {
  if (actual <= fixed + 0.5) return [start, end];
  const content = Math.max(0, actual - start - end);
  const room = Math.max(0, fixed - content);
  const total = start + end;
  if (total <= 0) return [start, end];
  const scale = room / total;
  return [Math.floor(start * scale * 100) / 100, Math.floor(end * scale * 100) / 100];
}

export function measureDiff(node: SnapNode, built: Measured, tolerance = 1, path = node.name): SizeMismatch[] {
  const out: SizeMismatch[] = [];
  if (Math.abs(built.w - node.w) > tolerance || Math.abs(built.h - node.h) > tolerance) {
    out.push({ path, want: [round(node.w), round(node.h)], got: [round(built.w), round(built.h)] });
  }
  const kids = node.kids ?? [];
  const got = built.kids ?? [];
  kids.forEach((k, i) => {
    if (got[i]) out.push(...measureDiff(k, got[i], tolerance, `${path}/${k.name}`));
  });
  return out;
}

export function fontsOf(node: SnapNode, into: Set<string> = new Set()): Set<string> {
  for (const s of node.text?.segments ?? []) into.add(`${s.font.family}|${s.font.style}`);
  for (const k of node.kids ?? []) fontsOf(k, into);
  return into;
}

export function missingFonts(used: Iterable<string>, available: { family: string; styles: string[] }[]): string[] {
  const have = new Set<string>();
  for (const f of available) for (const s of f.styles) have.add(`${f.family}|${s}`);
  return [...new Set(used)].filter((f) => !have.has(f)).sort();
}

export function snapshotFileName(name: string): string {
  const base = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${base || 'snapshot'}.json`;
}

export function batches<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export function pickImages(keys: Iterable<string>, images: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of keys) if (images[k]) out[k] = images[k];
  return out;
}

function round(v: number): number {
  return Math.round(v * 100) / 100;
}

const norm = (s: string) => s.toLowerCase().replace(/[\s_-]+/g, '');

const WEIGHTS: [RegExp, string][] = [
  [/extralight|ultralight/, 'extralight'],
  [/semibold|demibold/, 'semibold'],
  [/extrabold|ultrabold/, 'extrabold'],
  [/thin|hairline/, 'thin'],
  [/light/, 'light'],
  [/medium/, 'medium'],
  [/black|heavy/, 'black'],
  [/bold/, 'bold'],
];

export function fallbackFontStyle(style: string, available: string[]): string {
  const wanted = norm(style);
  const exact = available.find((s) => norm(s) === wanted);
  if (exact) return exact;
  const italic = wanted.includes('italic') || wanted.includes('oblique');
  const weight = WEIGHTS.find(([re]) => re.test(wanted))?.[1] ?? 'regular';
  const target = weight === 'regular' ? (italic ? 'italic' : 'regular') : `${weight}${italic ? 'italic' : ''}`;
  const find = (n: string) => available.find((s) => norm(s) === n);
  return find(target) ?? find(weight) ?? find('regular') ?? available[0] ?? 'Regular';
}
