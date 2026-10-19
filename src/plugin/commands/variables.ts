// figma-master Giai đoạn 2 — variables in one call: collection, modes, values
// per mode, aliases and scopes. Validation happens in ../../shared/tokens.ts
// before anything is written.
import type { CreateVariablesInput } from '../../shared/schemas';
import { encodeValue, planVariables } from '../../shared/tokens';

export async function createVariables(p: CreateVariablesInput) {
  const existing = await figma.variables.getLocalVariablesAsync();
  const plan = planVariables(p, existing.map((v) => v.name));

  // Alias targets may live in this batch or already in the file.
  const known = new Set([...existing.map((v) => v.name), ...plan.variables.map((v) => v.name)]);
  for (const v of plan.variables) {
    for (const [mode, value] of Object.entries(v.values)) {
      if (typeof value === 'object' && value !== null && 'alias' in value && !known.has(value.alias)) {
        plan.problems.push(`variable "${v.name}" (${mode}): alias tới "${value.alias}" không tồn tại`);
      }
    }
  }
  if (plan.problems.length) throw new Error(plan.problems.join('\n'));

  let collection = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.name === plan.collection);
  if (!collection) collection = figma.variables.createVariableCollection(plan.collection);

  const warnings: string[] = [...plan.warnings];
  const modeIds: Record<string, string> = {};
  if (collection.modes[0].name !== plan.modes[0]) collection.renameMode(collection.modes[0].modeId, plan.modes[0]);
  modeIds[plan.modes[0]] = collection.modes[0].modeId;
  for (const mode of plan.modes.slice(1)) {
    try {
      modeIds[mode] = collection.addMode(mode);
    } catch (e) {
      warnings.push(`mode "${mode}" bị Figma từ chối (${e instanceof Error ? e.message : String(e)}) — chỉ mode "${plan.modes[0]}" được ghi.`);
    }
  }

  // Pass 1: create every variable so aliases can point at siblings.
  const byName = new Map(existing.map((v) => [v.name, v]));
  const created: { id: string; name: string; type: string }[] = [];
  for (const spec of plan.variables) {
    const variable = figma.variables.createVariable(spec.name, collection, spec.type);
    byName.set(spec.name, variable);
    created.push({ id: variable.id, name: variable.name, type: spec.type });
  }

  // Pass 2: values (and aliases), then scopes.
  let aliased = 0;
  for (const spec of plan.variables) {
    const variable = byName.get(spec.name)!;
    for (const [mode, value] of Object.entries(spec.values)) {
      const modeId = modeIds[mode];
      if (!modeId) continue;
      const encoded = encodeValue(spec.type, value);
      if (encoded && typeof encoded === 'object' && 'alias' in encoded) {
        const target = byName.get((encoded as { alias: string }).alias);
        if (!target) continue; // validated above; defensive
        variable.setValueForMode(modeId, figma.variables.createVariableAlias(target));
        aliased++;
      } else {
        variable.setValueForMode(modeId, encoded as VariableValue);
      }
    }
    if (spec.scopes) variable.scopes = spec.scopes as VariableScope[];
  }

  return {
    collection: { id: collection.id, name: collection.name, modes: collection.modes.map((m) => m.name) },
    created,
    aliased,
    warnings,
  };
}
