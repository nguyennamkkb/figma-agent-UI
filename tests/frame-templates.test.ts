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
