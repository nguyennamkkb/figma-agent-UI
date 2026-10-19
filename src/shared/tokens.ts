// Token helpers for `create_variables` / `import_tokens` (figma-master Giai
// đoạn 2). Pure so the encoding and validation rules stay unit-testable.

export type VariableType = 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';

export type TokenValue = string | number | boolean | { alias: string };

export interface VariableSpec {
  name: string;
  type: VariableType;
  scopes?: string[];
  values: Record<string, TokenValue>;
}

export interface CreateVariablesInputShape {
  collection: string;
  modes?: string[];
  variables: VariableSpec[];
}

export interface VariablePlan {
  collection: string;
  modes: string[];
  variables: VariableSpec[];
  problems: string[];
  warnings: string[];
}

export function parseColor(input: string): { r: number; g: number; b: number; a: number } {
  const hex = input.trim().replace(/^#/, '');
  if (!/^([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex)) throw new Error(`Invalid color "${input}" — use #RGB, #RRGGBB or #RRGGBBAA`);
  let full = hex;
  if (hex.length === 3) full = hex.split('').map((c) => c + c).join('');
  if (full.length === 6) full += 'ff';
  return {
    r: parseInt(full.slice(0, 2), 16) / 255,
    g: parseInt(full.slice(2, 4), 16) / 255,
    b: parseInt(full.slice(4, 6), 16) / 255,
    a: parseInt(full.slice(6, 8), 16) / 255,
  };
}

export function encodeValue(type: VariableType, value: TokenValue): unknown {
  if (typeof value === 'object' && value !== null && 'alias' in value) {
    if (!value.alias.trim()) throw new Error('Alias cần tên variable đích');
    return value; // resolved by the plugin via createVariableAlias
  }
  switch (type) {
    case 'COLOR':
      if (typeof value !== 'string') throw new Error(`COLOR cần chuỗi hex, nhận ${typeof value}`);
      return parseColor(value);
    case 'FLOAT':
      if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`FLOAT cần số, nhận ${typeof value}`);
      return value;
    case 'STRING':
      if (typeof value !== 'string') throw new Error(`STRING cần chuỗi, nhận ${typeof value}`);
      return value;
    case 'BOOLEAN':
      if (typeof value !== 'boolean') throw new Error(`BOOLEAN cần true/false, nhận ${typeof value}`);
      return value;
  }
}

export const VARIABLE_TYPES: VariableType[] = ['COLOR', 'FLOAT', 'STRING', 'BOOLEAN'];

// Validates names, modes and alias targets before anything touches the file.
export function planVariables(input: CreateVariablesInputShape, existingNames: string[] = []): VariablePlan {
  const plan: VariablePlan = {
    collection: input.collection.trim(),
    modes: input.modes?.length ? [...input.modes] : ['Value'],
    variables: [],
    problems: [],
    warnings: [],
  };
  if (!plan.collection) plan.problems.push('collection: tên không được rỗng');
  if (new Set(plan.modes).size !== plan.modes.length) plan.problems.push('modes: tên mode bị trùng');

  const seen = new Set(existingNames);
  for (const v of input.variables) {
    if (!v.name.trim()) {
      plan.problems.push('variable: có mục tên rỗng');
      continue;
    }
    if (seen.has(v.name)) {
      plan.problems.push(`variable "${v.name}": đã tồn tại`);
      continue;
    }
    if (!VARIABLE_TYPES.includes(v.type)) {
      plan.problems.push(`variable "${v.name}": type "${v.type}" không hợp lệ`);
      continue;
    }
    const modeNames = Object.keys(v.values);
    for (const m of modeNames) {
      if (!plan.modes.includes(m)) plan.problems.push(`variable "${v.name}": value cho mode "${m}" không khai báo trong modes`);
    }
    const missing = plan.modes.filter((m) => !(m in v.values));
    if (missing.length) {
      // The master is explicit: a mode without a value silently falls back.
      plan.problems.push(`variable "${v.name}": thiếu value cho mode ${missing.join(', ')}`);
      continue;
    }
    for (const [mode, value] of Object.entries(v.values)) {
      try {
        encodeValue(v.type, value);
      } catch (e) {
        plan.problems.push(`variable "${v.name}" (${mode}): ${(e as Error).message}`);
      }
    }
    seen.add(v.name);
    plan.variables.push(v);
  }
  if (plan.modes.length > 1) {
    plan.warnings.push(
      `Cần ${plan.modes.length} modes; nếu file/gói chỉ cho 1 mode thì Figma sẽ từ chối \`addMode\` và chỉ mode "${plan.modes[0]}" được ghi.`,
    );
  }
  return plan;
}

// -- Design Tokens Community Group (DTCG) import/export ---------------------

export interface DtcgToken {
  $type?: string;
  $value: unknown;
  $extensions?: { modes?: Record<string, unknown> };
}

export type DtcgTree = { [key: string]: DtcgToken | DtcgTree };

const isToken = (v: unknown): v is DtcgToken =>
  !!v && typeof v === 'object' && '$value' in (v as Record<string, unknown>);

// Flattens { primitives: { color: { blue: { 600: { $value } } } } } into
// "primitives/color/blue/600" (Figma-style slash names).
export function flattenDtcg(tree: DtcgTree, prefix = ''): { path: string; token: DtcgToken }[] {
  const out: { path: string; token: DtcgToken }[] = [];
  for (const [key, value] of Object.entries(tree)) {
    if (key.startsWith('$')) continue;
    const path = prefix ? `${prefix}/${key}` : key;
    if (isToken(value)) out.push({ path, token: value });
    else out.push(...flattenDtcg(value as DtcgTree, path));
  }
  return out;
}

const DTCG_TYPE: Record<string, VariableType> = {
  color: 'COLOR',
  dimension: 'FLOAT',
  number: 'FLOAT',
  string: 'STRING',
  boolean: 'BOOLEAN',
};

// DTCG value → the DSL value. `{primitives.color.blue.600}` becomes an alias.
export function fromDtcg(type: string, value: unknown): TokenValue {
  if (typeof value === 'string' && /^\{[^}]+\}$/.test(value)) {
    return { alias: value.slice(1, -1).replace(/\./g, '/') };
  }
  const mapped = DTCG_TYPE[type];
  if (!mapped) throw new Error(`DTCG type "${type}" chưa hỗ trợ`);
  if (mapped === 'FLOAT' && typeof value === 'string') {
    const m = /^(-?[\d.]+)/.exec(value);
    if (!m) throw new Error(`Không đọc được số từ "${value}"`);
    return Number(m[1]);
  }
  return value as TokenValue;
}

export function dtcgTypeToVariable(type: string): VariableType {
  const mapped = DTCG_TYPE[type];
  if (!mapped) throw new Error(`DTCG type "${type}" chưa hỗ trợ`);
  return mapped;
}
