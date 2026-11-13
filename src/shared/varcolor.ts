export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface VariableLike {
  id: string;
  name: string;
  resolvedType: string;
  variableCollectionId: string;
  valuesByMode: Record<string, unknown>;
}

export interface VariableLookup {
  variable(id: string): Promise<VariableLike | null>;
  defaultMode(collectionId: string): Promise<string | null>;
}

const MAX_ALIAS_DEPTH = 16;

function isAlias(v: unknown): v is { type: 'VARIABLE_ALIAS'; id: string } {
  return typeof v === 'object' && v !== null && (v as { type?: unknown }).type === 'VARIABLE_ALIAS';
}

function isColor(v: unknown): v is { r: number; g: number; b: number; a?: number } {
  return typeof v === 'object' && v !== null && typeof (v as { r?: unknown }).r === 'number';
}

export async function resolveVariableColor(start: VariableLike, lookup: VariableLookup): Promise<Rgba | null> {
  let current: VariableLike | null = start;
  const seen = new Set<string>();
  for (let depth = 0; current && depth < MAX_ALIAS_DEPTH; depth++) {
    if (seen.has(current.id)) return null;
    seen.add(current.id);
    const mode = await lookup.defaultMode(current.variableCollectionId);
    const value = (mode !== null && mode in current.valuesByMode ? current.valuesByMode[mode] : Object.values(current.valuesByMode)[0]) as unknown;
    if (isColor(value)) return { r: value.r, g: value.g, b: value.b, a: value.a ?? 1 };
    if (!isAlias(value)) return null;
    current = await lookup.variable(value.id);
  }
  return null;
}
