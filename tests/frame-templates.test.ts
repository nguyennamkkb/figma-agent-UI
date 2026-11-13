import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TreeNode } from '../src/shared/schemas';

const dir = join(__dirname, '..', '.claude', 'skills', 'figma-ui-flow', 'assets', 'frames');
const files = readdirSync(dir).filter((f) => f.endsWith('.render-tree.json'));

describe('frame templates', () => {
  it('ships mobile, tablet and the duo displays', () => {
    expect(files).toEqual(expect.arrayContaining(['mobile.render-tree.json', 'tablet.render-tree.json', 'duo-outer.render-tree.json', 'duo-inner.render-tree.json']));
  });

  it.each(files)('%s is a valid render_tree frame', (file) => {
    const tree = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    const parsed = TreeNode.safeParse(tree);
    expect(parsed.success, parsed.success ? '' : JSON.stringify(parsed.error.issues.slice(0, 3))).toBe(true);
    expect(tree.type).toBe('frame');
  });
});

type Spec = { type: string; name?: string; text?: string; children?: Spec[] };
const asset = (name: string): Spec => JSON.parse(readFileSync(join(dir, '..', name), 'utf8'));
const byName = (node: Spec, name: string): Spec | undefined =>
  node.name === name ? node : (node.children ?? []).map((c) => byName(c, name)).find(Boolean);

describe('flow page templates', () => {
  it.each(['flow.render-tree.json', 'flow-section.render-tree.json'])('%s is a valid render_tree section with a numbered title bar', (file) => {
    const tree = asset(file);
    expect(TreeNode.safeParse(tree).success).toBe(true);
    expect(tree.type).toBe('section');
    expect(byName(tree, 'Number')).toBeDefined();
    expect(byName(tree, 'Name')).toBeDefined();
  });

  it('names flow sections FL-NN · <Flow>', () => {
    expect(asset('flow-section.render-tree.json').name).toMatch(/^FL-NN · /);
  });

  it('ships a valid reviewer note frame', () => {
    const note = asset('note.render-tree.json');
    expect(TreeNode.safeParse(note).success).toBe(true);
    expect(note.name).toMatch(/^Note · /);
  });
});

describe('text flow template', () => {
  const tree = asset('flow.render-tree.json');

  it('writes one FL-NN.Exx FROM @id --[nav: action]--> TO @id edge per line', () => {
    const text = byName(tree, 'flow/text')?.text ?? '';
    const edges = text.split('\n').filter((line) => /^FL-\d{2}\.E\d{2} /.test(line));
    expect(edges.length).toBeGreaterThan(0);
    for (const line of edges) expect(line).toMatch(/^FL-\d{2}\.E\d{2} {2}(ENTRY:\S+|SCR-\d{2}( @\S+)?) --\[(replace|push|pop|modal|modal-full|dismiss)(: .+)?\]--> SCR-\d{2}( .+)? @\S+$/);
  });
});
