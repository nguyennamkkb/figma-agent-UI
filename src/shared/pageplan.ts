
export interface PageRef {
  id: string;
  name: string;
}

export const COVER_PAGE = '🏠 Cover';
export const FOUNDATIONS_PAGE = '01 · Foundations';
export const COMPONENTS_PAGE = '02 · Components';
export const TEMPLATES_PAGE = '03 · Templates';
export const ASSETS_PAGE = '04 · Assets';
export const SCREENS_PAGE = '05 · Screens & Flows';
export const EXPLORE_PAGE = '06 · Explore (WIP)';

export const MASTER_PAGES = [COVER_PAGE, FOUNDATIONS_PAGE, COMPONENTS_PAGE, TEMPLATES_PAGE, ASSETS_PAGE, SCREENS_PAGE, EXPLORE_PAGE];

const LEGACY_EXPLORE_PAGES = ['🧪 Explore'];

export function findExplorePage<T extends { name: string }>(pages: readonly T[]): T | undefined {
  return (
    pages.find((p) => p.name === EXPLORE_PAGE) ??
    pages.find((p) => LEGACY_EXPLORE_PAGES.includes(p.name)) ??
    pages.find((p) => /explore/i.test(p.name))
  );
}

export interface ManagePagesInput {
  template?: boolean;
  create?: string[];
  rename?: { page: string; to: string }[];
  delete?: string[];
  order?: string[];
}

export type PageOp =
  | { op: 'create'; name: string }
  | { op: 'rename'; id: string; from: string; to: string }
  | { op: 'delete'; id: string; name: string }
  | { op: 'order'; ids: string[] };

export interface PagePlan {
  ops: PageOp[];
  skipped: { what: string; reason: string }[];
  problems: string[];
}

const find = (pages: PageRef[], ref: string): PageRef | undefined =>
  pages.find((p) => p.id === ref) ?? pages.find((p) => p.name === ref);

export const PENDING_PREFIX = 'pending:';

export function resolvePageIds(ids: readonly string[], created: readonly PageRef[]): string[] {
  return ids.map((id) => {
    if (!id.startsWith(PENDING_PREFIX)) return id;
    const name = id.slice(PENDING_PREFIX.length);
    return created.find((c) => c.name === name)?.id ?? id;
  });
}

export function planPages(existing: PageRef[], input: ManagePagesInput): PagePlan {
  const plan: PagePlan = { ops: [], skipped: [], problems: [] };
  let current = existing.map((p) => ({ ...p }));

  const wantsCreate = [...(input.template ? MASTER_PAGES : []), ...(input.create ?? [])];
  for (const name of wantsCreate) {
    if (current.some((p) => p.name === name)) {
      plan.skipped.push({ what: `create ${name}`, reason: 'page đã tồn tại' });
      continue;
    }
    plan.ops.push({ op: 'create', name });
    current.push({ id: `${PENDING_PREFIX}${name}`, name });
  }

  for (const r of input.rename ?? []) {
    const hit = find(current, r.page);
    if (!hit) {
      plan.problems.push(`rename: không tìm thấy page "${r.page}"`);
      continue;
    }
    if (current.some((p) => p.name === r.to && p.id !== hit.id)) {
      plan.problems.push(`rename: tên "${r.to}" đã bị page khác dùng`);
      continue;
    }
    plan.ops.push({ op: 'rename', id: hit.id, from: hit.name, to: r.to });
    hit.name = r.to;
  }

  const toDelete: PageRef[] = [];
  for (const ref of input.delete ?? []) {
    const hit = find(current, ref);
    if (!hit) {
      plan.problems.push(`delete: không tìm thấy page "${ref}"`);
      continue;
    }
    toDelete.push(hit);
  }
  for (const hit of toDelete) {
    if (current.length <= 1) {
      plan.problems.push(`delete: phải giữ lại ít nhất 1 page (bỏ qua "${hit.name}")`);
      continue;
    }
    plan.ops.push({ op: 'delete', id: hit.id, name: hit.name });
    current = current.filter((p) => p.id !== hit.id);
  }

  if (input.order?.length) {
    const wanted: string[] = [];
    for (const ref of input.order) {
      const hit = find(current, ref);
      if (!hit) {
        plan.problems.push(`order: không tìm thấy page "${ref}"`);
        continue;
      }
      if (!wanted.includes(hit.id)) wanted.push(hit.id);
    }
    const rest = current.filter((p) => !wanted.includes(p.id)).map((p) => p.id);
    if (wanted.length) plan.ops.push({ op: 'order', ids: [...wanted, ...rest] });
  }

  return plan;
}
