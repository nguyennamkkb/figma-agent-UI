import { beforeAll, describe, expect, it } from 'vitest';
import { resolveFill } from '../src/plugin/paints';
import type { Resources } from '../src/plugin/resources';

const vars: Record<string, { id: string; name: string; resolvedType: string; variableCollectionId: string; valuesByMode: Record<string, unknown> }> = {
  'VariableID:1': { id: 'VariableID:1', name: 'amber/400', resolvedType: 'COLOR', variableCollectionId: 'prim', valuesByMode: { value: { r: 1, g: 0.71, b: 0.28, a: 1 } } },
  'VariableID:2': { id: 'VariableID:2', name: 'accent/primary', resolvedType: 'COLOR', variableCollectionId: 'sem', valuesByMode: { dark: { type: 'VARIABLE_ALIAS', id: 'VariableID:1' } } },
  'VariableID:3': { id: 'VariableID:3', name: 'space/4', resolvedType: 'FLOAT', variableCollectionId: 'sem', valuesByMode: { dark: 16 } },
};

beforeAll(() => {
  (globalThis as Record<string, unknown>).figma = {
    variables: {
      getVariableByIdAsync: async (id: string) => vars[id] ?? null,
      getVariableCollectionByIdAsync: async (id: string) => ({ id, defaultModeId: id === 'prim' ? 'value' : 'dark' }),
      setBoundVariableForPaint: (paint: object, field: string, v: { id: string }) => ({ ...paint, boundVariables: { [field]: { type: 'VARIABLE_ALIAS', id: v.id } } }),
    },
  };
});

const res = { variable: async (ref: string) => Object.values(vars).find((v) => v.name === ref)! } as unknown as Resources;

describe('resolveFill with a variable', () => {
  it('binds the variable and stores its resolved colour as the raw paint colour', async () => {
    const r = await resolveFill({ var: 'accent/primary' }, res);
    expect(r).toEqual({
      paints: [
        {
          type: 'SOLID',
          color: { r: 1, g: 0.71, b: 0.28 },
          opacity: 1,
          boundVariables: { color: { type: 'VARIABLE_ALIAS', id: 'VariableID:2' } },
        },
      ],
    });
  });

  it('refuses a non-colour variable with a clear message', async () => {
    await expect(resolveFill({ var: 'space/4' }, res)).rejects.toThrow(/space\/4.*FLOAT, not COLOR/);
  });
});
