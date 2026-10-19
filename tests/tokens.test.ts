import { describe, expect, it } from 'vitest';
import {
  dtcgTypeToVariable,
  encodeValue,
  flattenDtcg,
  fromDtcg,
  parseColor,
  planVariables,
  type DtcgTree,
} from '../src/shared/tokens';

describe('colour parsing (figma-master GĐ2)', () => {
  it('reads #RRGGBB, #RGB and #RRGGBBAA', () => {
    expect(parseColor('#3B82F6')).toMatchObject({ r: 59 / 255, g: 130 / 255, b: 246 / 255, a: 1 });
    expect(parseColor('#fff')).toMatchObject({ r: 1, g: 1, b: 1, a: 1 });
    expect(parseColor('#00000080').a).toBeCloseTo(128 / 255, 3);
  });

  it('rejects anything else', () => {
    for (const bad of ['blue', '#12345', 'rgb(1,2,3)', '']) expect(() => parseColor(bad)).toThrow(/Invalid color/);
  });
});

describe('value encoding', () => {
  it('enforces the declared type', () => {
    expect(encodeValue('COLOR', '#FFFFFF')).toMatchObject({ r: 1, g: 1, b: 1 });
    expect(encodeValue('FLOAT', 16)).toBe(16);
    expect(encodeValue('STRING', 'Inter')).toBe('Inter');
    expect(encodeValue('BOOLEAN', true)).toBe(true);
    expect(() => encodeValue('FLOAT', '16px' as unknown as number)).toThrow(/FLOAT/);
    expect(() => encodeValue('COLOR', 16 as unknown as string)).toThrow(/COLOR/);
  });

  it('passes aliases through and rejects empty targets', () => {
    expect(encodeValue('COLOR', { alias: 'color/blue/600' })).toEqual({ alias: 'color/blue/600' });
    expect(() => encodeValue('COLOR', { alias: '  ' })).toThrow(/Alias/);
  });
});

describe('planVariables', () => {
  const base = {
    collection: 'Primitives',
    variables: [
      { name: 'color/blue/600', type: 'COLOR' as const, scopes: [], values: { Value: '#2563EB' } },
    ],
  };

  it('defaults to a single "Value" mode and accepts a primitive', () => {
    const plan = planVariables(base);
    expect(plan.problems).toEqual([]);
    expect(plan.modes).toEqual(['Value']);
    expect(plan.variables).toHaveLength(1);
  });

  it('requires a value for every declared mode (silent fallback is a bug)', () => {
    const plan = planVariables({ ...base, modes: ['Light', 'Dark'] });
    expect(plan.problems.some((p) => p.includes('thiếu value cho mode'))).toBe(true);
  });

  it('rejects values for undeclared modes and duplicate names', () => {
    const undeclared = planVariables({ ...base, variables: [{ ...base.variables[0], values: { Nope: '#fff' } }] });
    expect(undeclared.problems.some((p) => p.includes('không khai báo'))).toBe(true);

    const dup = planVariables(base, ['color/blue/600']);
    expect(dup.problems.some((p) => p.includes('đã tồn tại'))).toBe(true);
  });

  it('warns about multi-mode plans (the account may allow one mode)', () => {
    const plan = planVariables({
      collection: 'Semantic',
      modes: ['Light', 'Dark'],
      variables: [
        { name: 'color/text/primary', type: 'COLOR', values: { Light: { alias: 'color/gray/900' }, Dark: { alias: 'color/gray/50' } } },
      ],
    });
    expect(plan.problems).toEqual([]);
    expect(plan.warnings.join(' ')).toMatch(/addMode/);
  });

  it('rejects an invalid type instead of writing it', () => {
    const plan = planVariables({ ...base, variables: [{ ...base.variables[0], type: 'DATE' as never }] });
    expect(plan.problems.some((p) => p.includes('không hợp lệ'))).toBe(true);
  });
});

describe('DTCG tokens (check_tokens.py format)', () => {
  const tree: DtcgTree = {
    primitives: {
      color: {
        blue: { 600: { $type: 'color', $value: '#2563EB' } },
        white: { $type: 'color', $value: '#FFFFFF' },
      },
      space: { 4: { $type: 'dimension', $value: '16px' } },
    },
    semantic: {
      bg: {
        default: {
          $type: 'color',
          $value: '{primitives.color.white}',
          $extensions: { modes: { light: '{primitives.color.white}' } },
        },
      },
    },
  };

  it('flattens nested groups into slash paths', () => {
    const flat = flattenDtcg(tree);
    expect(flat.map((t) => t.path)).toContain('primitives/color/blue/600');
    expect(flat.map((t) => t.path)).toContain('semantic/bg/default');
    expect(flat.every((t) => !t.path.startsWith('$'))).toBe(true);
  });

  it('maps DTCG aliases and dimensions to DSL values', () => {
    expect(fromDtcg('color', '{primitives.color.blue.600}')).toEqual({ alias: 'primitives/color/blue/600' });
    expect(fromDtcg('dimension', '16px')).toBe(16);
    expect(fromDtcg('color', '#FFFFFF')).toBe('#FFFFFF');
    expect(dtcgTypeToVariable('dimension')).toBe('FLOAT');
    expect(() => dtcgTypeToVariable('duration')).toThrow(/chưa hỗ trợ/);
  });
});
