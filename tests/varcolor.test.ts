import { describe, expect, it } from 'vitest';
import { resolveVariableColor, type VariableLike, type VariableLookup } from '../src/shared/varcolor';

const amber = { r: 1, g: 0.71, b: 0.28, a: 1 };

function lookupOf(vars: VariableLike[], modes: Record<string, string>): VariableLookup {
  return {
    variable: async (id) => vars.find((v) => v.id === id) ?? null,
    defaultMode: async (c) => modes[c] ?? null,
  };
}

const v = (id: string, value: unknown, collection = 'semantic', mode = 'dark'): VariableLike => ({
  id,
  name: id,
  resolvedType: 'COLOR',
  variableCollectionId: collection,
  valuesByMode: { [mode]: value },
});

describe('resolveVariableColor', () => {
  it('returns the colour of a direct variable in the default mode', async () => {
    const primary = v('p', amber);
    expect(await resolveVariableColor(primary, lookupOf([primary], { semantic: 'dark' }))).toEqual(amber);
  });

  it('follows aliases across collections, keeping alpha', async () => {
    const prim = v('amber/400', { r: 1, g: 0.71, b: 0.28, a: 0.15 }, 'primitives', 'value');
    const soft = v('accent/soft', { type: 'VARIABLE_ALIAS', id: 'amber/400' });
    const out = await resolveVariableColor(soft, lookupOf([prim, soft], { semantic: 'dark', primitives: 'value' }));
    expect(out).toEqual({ r: 1, g: 0.71, b: 0.28, a: 0.15 });
  });

  it('defaults alpha to 1 and falls back to the first mode when the default is unknown', async () => {
    const x = v('x', { r: 0, g: 0, b: 1 }, 'c', 'm1');
    expect(await resolveVariableColor(x, lookupOf([x], {}))).toEqual({ r: 0, g: 0, b: 1, a: 1 });
  });

  it('gives up on alias cycles, missing targets and non-colour values', async () => {
    const a = v('a', { type: 'VARIABLE_ALIAS', id: 'b' });
    const b = v('b', { type: 'VARIABLE_ALIAS', id: 'a' });
    const modes = { semantic: 'dark' };
    expect(await resolveVariableColor(a, lookupOf([a, b], modes))).toBeNull();
    expect(await resolveVariableColor(v('m', { type: 'VARIABLE_ALIAS', id: 'gone' }), lookupOf([], modes))).toBeNull();
    expect(await resolveVariableColor(v('n', 16), lookupOf([], modes))).toBeNull();
  });
});
