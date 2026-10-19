// Single source of truth for tool inputs and the render_tree DSL. The server
// validates with these schemas; the plugin only imports the inferred types.
import { z } from 'zod';

// ---------------------------------------------------------------- primitives

export const VarRef = z.strictObject({
  var: z
    .string()
    .describe('Local variable name ("color/primary"), "Collection/name", or a "VariableID:..." id'),
});
export const NumOrVar = z.union([z.number(), VarRef]);

const ColorString = z.string().describe('#RGB, #RRGGBB, #RRGGBBAA, rgb() or rgba()');
const ScaleMode = z.enum(['FILL', 'FIT', 'CROP', 'TILE']);

export const PaintInput = z.union([
  ColorString,
  VarRef,
  z.strictObject({ style: z.string().describe('Local paint style name') }),
  z.strictObject({
    gradient: z.enum(['LINEAR', 'RADIAL', 'ANGULAR', 'DIAMOND']),
    angle: z.number().optional().describe('CSS degrees for LINEAR; default 180 (top → bottom)'),
    stops: z.array(z.strictObject({ color: ColorString, position: z.number().min(0).max(1) })).min(2),
  }),
  z.strictObject({
    image: z.string().describe('http(s) URL, data: URI or absolute local file path (PNG/JPEG/GIF)'),
    scaleMode: ScaleMode.optional(),
  }),
  z.strictObject({ imageBase64: z.string(), scaleMode: ScaleMode.optional() }),
]);
export const Fill = z.union([PaintInput, z.array(PaintInput)]);

const Side4 = <T extends z.ZodType>(t: T) => z.union([t, z.tuple([t, t, t, t])]);

export const Stroke = z.strictObject({
  color: Fill,
  width: Side4(NumOrVar).optional().describe('Number, or [top, right, bottom, left]'),
  align: z.enum(['INSIDE', 'OUTSIDE', 'CENTER']).optional(),
  dash: z.array(z.number()).optional(),
});

export const Shadow = z.strictObject({
  type: z.enum(['DROP', 'INNER']).optional(),
  color: ColorString.optional().describe('Default #0000001A'),
  x: z.number().optional(),
  y: z.number().optional(),
  blur: z.number().optional(),
  spread: z.number().optional(),
});
export const Effects = z.union([
  z.enum(['none', 'sm', 'md', 'lg', 'xl']).describe('Shadow preset (Tailwind-like)'),
  z.strictObject({ style: z.string().describe('Local effect style name') }),
  z.array(
    z.union([
      Shadow,
      z.strictObject({ layerBlur: z.number() }),
      z.strictObject({ backgroundBlur: z.number().describe('Frosted glass') }),
    ]),
  ),
]);

const Sizing = z.enum(['FIXED', 'HUG', 'FILL']);

// ---------------------------------------------------------------- property groups

const baseProps = {
  name: z.string().optional(),
  x: z.number().optional().describe('Only for absolute children, non-auto-layout parents or the root'),
  y: z.number().optional(),
  width: NumOrVar.optional(),
  height: NumOrVar.optional(),
  widthMode: Sizing.optional().describe('FILL needs an auto-layout parent; HUG needs auto layout or text'),
  heightMode: Sizing.optional(),
  minWidth: NumOrVar.optional(),
  maxWidth: NumOrVar.optional(),
  minHeight: NumOrVar.optional(),
  maxHeight: NumOrVar.optional(),
  absolute: z.boolean().optional().describe('Absolute position inside an auto-layout parent'),
  opacity: NumOrVar.optional().describe('0..1'),
  visible: z.boolean().optional(),
  rotation: z.number().optional(),
  fill: Fill.optional(),
  stroke: Stroke.optional(),
  radius: Side4(NumOrVar).optional().describe('Number, or [topLeft, topRight, bottomRight, bottomLeft]'),
  effects: Effects.optional(),
};

const frameProps = {
  layout: z.enum(['HORIZONTAL', 'VERTICAL', 'NONE']).optional().describe('Auto layout direction'),
  gap: z.union([NumOrVar, z.literal('AUTO')]).optional().describe('"AUTO" = space between'),
  counterGap: NumOrVar.optional().describe('Gap between wrapped rows'),
  wrap: z.boolean().optional(),
  padding: z
    .union([NumOrVar, z.tuple([NumOrVar, NumOrVar]), z.tuple([NumOrVar, NumOrVar, NumOrVar, NumOrVar])])
    .optional()
    .describe('All, [vertical, horizontal] or [top, right, bottom, left]'),
  paddingTop: NumOrVar.optional(),
  paddingRight: NumOrVar.optional(),
  paddingBottom: NumOrVar.optional(),
  paddingLeft: NumOrVar.optional(),
  justify: z.enum(['START', 'CENTER', 'END', 'SPACE_BETWEEN']).optional().describe('Primary axis'),
  align: z.enum(['START', 'CENTER', 'END', 'BASELINE']).optional().describe('Counter axis'),
  clip: z.boolean().optional(),
  variableModes: z.record(z.string(), z.string()).optional().describe('{ "Collection": "Mode" }, e.g. dark mode'),
};

const textProps = {
  text: z.string(),
  fontFamily: z.string().optional().describe('Default: render_tree defaultFont, else Inter'),
  fontStyle: z.string().optional().describe('Exact style, e.g. "Semi Bold"'),
  fontWeight: z.union([z.number(), z.string()]).optional().describe('100-900, mapped to a style'),
  fontSize: NumOrVar.optional(),
  color: Fill.optional().describe('Text fill (alias of fill)'),
  lineHeight: z.union([z.number(), z.string()]).optional().describe('px number, "150%" or "AUTO"'),
  letterSpacing: z.union([z.number(), z.string()]).optional().describe('px number or "-2%"'),
  textAlign: z.enum(['LEFT', 'CENTER', 'RIGHT', 'JUSTIFIED']).optional(),
  verticalAlign: z.enum(['TOP', 'CENTER', 'BOTTOM']).optional(),
  textCase: z.enum(['ORIGINAL', 'UPPER', 'LOWER', 'TITLE']).optional(),
  decoration: z.enum(['NONE', 'UNDERLINE', 'STRIKETHROUGH']).optional(),
  maxLines: z.number().int().positive().optional().describe('Truncate with ellipsis'),
  textStyle: z.string().optional().describe('Local text style name'),
};

const instanceProps = {
  component: z.string().describe('Component or component set: node id, published key, or local name'),
  variant: z.record(z.string(), z.string()).optional().describe('{ "Size": "Large" }'),
  properties: z
    .record(z.string(), z.union([z.string(), z.boolean()]))
    .optional()
    .describe('Component properties by name (the "#id" suffix is optional)'),
  texts: z.record(z.string(), z.string()).optional().describe('{ "text layer name": "new text" }'),
};

// ---------------------------------------------------------------- tree DSL

const FrameBase = z.strictObject({
  type: z.literal('frame'),
  ...baseProps,
  ...frameProps,
  component: z.boolean().optional().describe('Create a COMPONENT instead of a frame'),
  description: z.string().optional().describe('Component description'),
});
export const TextSpec = z.strictObject({ type: z.literal('text'), ...baseProps, ...textProps });
export const RectSpec = z.strictObject({ type: z.literal('rect'), ...baseProps });
export const EllipseSpec = z.strictObject({ type: z.literal('ellipse'), ...baseProps });
export const SvgSpec = z.strictObject({
  type: z.literal('svg'),
  ...baseProps,
  svg: z.string().describe('Full <svg> markup, e.g. a Lucide icon'),
  color: ColorString.optional().describe('Recolor every solid fill/stroke inside the SVG'),
});
export const ImageSpec = z.strictObject({
  type: z.literal('image'),
  ...baseProps,
  src: z.string().optional().describe('http(s) URL, data: URI or absolute local path'),
  imageBase64: z.string().optional(),
  scaleMode: ScaleMode.optional(),
});
export const InstanceSpec = z.strictObject({ type: z.literal('instance'), ...baseProps, ...instanceProps });

export type FrameSpec = z.infer<typeof FrameBase> & { children?: TreeNode[] };
export type TextSpec = z.infer<typeof TextSpec>;
export type SvgSpec = z.infer<typeof SvgSpec>;
export type ImageSpec = z.infer<typeof ImageSpec>;
export type InstanceSpec = z.infer<typeof InstanceSpec>;
export type TreeNode =
  | FrameSpec
  | TextSpec
  | z.infer<typeof RectSpec>
  | z.infer<typeof EllipseSpec>
  | SvgSpec
  | ImageSpec
  | InstanceSpec;

// Recursive: declared through z.lazy with an explicit type to break the cycle.
export const TreeNode: z.ZodType<TreeNode> = z.lazy(() => TreeNodeUnion);
export const FrameSpec = FrameBase.extend({ children: z.array(TreeNode).optional() });
const TreeNodeUnion = z.discriminatedUnion('type', [
  FrameSpec,
  TextSpec,
  RectSpec,
  EllipseSpec,
  SvgSpec,
  ImageSpec,
  InstanceSpec,
]);

export type PaintInput = z.infer<typeof PaintInput>;
export type FillInput = z.infer<typeof Fill>;
export type NumOrVar = z.infer<typeof NumOrVar>;

// Every property the update tool can patch onto an existing node.
export const UpdateProps = z.strictObject({
  ...baseProps,
  ...frameProps,
  ...textProps,
  text: z.string().optional(),
  ...instanceProps,
  component: z.string().optional().describe('Instances only: swap to this component'),
  description: z.string().optional(),
});
export type UpdateProps = z.infer<typeof UpdateProps>;

// Union of every spec's properties, used internally by the plugin appliers.
export type AnyProps = Partial<UpdateProps> & {
  type?: TreeNode['type'];
  svg?: string;
  src?: string;
  imageBase64?: string;
  scaleMode?: z.infer<typeof ScaleMode>;
  children?: TreeNode[];
};

// ---------------------------------------------------------------- tool inputs

const NodeId = z.string().describe('Node id, e.g. "12:34"');

export const GetNodeInput = z.object({
  ids: z.array(NodeId).min(1),
  depth: z.number().int().min(0).max(12).default(2).describe('Child levels to include'),
  maxNodes: z.number().int().min(1).max(2000).default(300),
});
export const GetSelectionInput = z.object({
  depth: z.number().int().min(0).max(12).default(1),
  maxNodes: z.number().int().min(1).max(2000).default(300),
});
export const FindNodesInput = z.object({
  rootId: NodeId.optional().describe('Default: current page'),
  types: z.array(z.string()).optional().describe('e.g. ["FRAME","TEXT","INSTANCE"]'),
  name: z.string().optional().describe('Case-insensitive substring of the layer name'),
  text: z.string().optional().describe('Case-insensitive substring of text content'),
  limit: z.number().int().min(1).max(1000).default(50),
});
export const SetPageInput = z.object({
  page: z.string().describe('Page id or exact page name'),
});
export const DesignSystemInput = z.object({
  include: z
    .array(z.enum(['variables', 'styles', 'components', 'library']))
    .default(['variables', 'styles', 'components']),
  componentLimit: z.number().int().min(1).max(2000).default(200),
});
export const ListFontsInput = z.object({
  family: z.string().optional().describe('Filter families by case-insensitive substring'),
  limit: z.number().int().min(1).max(5000).default(200),
});
export const ScreenshotInput = z.object({
  id: NodeId.optional().describe('Default: first selected node'),
  scale: z.number().min(0.05).max(4).default(0.5),
  maxSize: z.number().int().min(64).max(4096).default(1024).describe('Longest side in px'),
});
export const RenderTreeInput = z.object({
  tree: TreeNode,
  parentId: NodeId.optional().describe('Append into this frame instead of the page'),
  index: z.number().int().min(0).optional().describe('Insert position inside parentId'),
  defaultFont: z.string().optional().describe('Font family for text nodes without fontFamily'),
  select: z.boolean().default(true).describe('Select and zoom to the result'),
});
export const UpdateNodesInput = z.object({
  updates: z.array(z.object({ id: NodeId, props: UpdateProps })).min(1),
});
export const DeleteNodesInput = z.object({ ids: z.array(NodeId).min(1) });
export const MoveNodesInput = z.object({
  ids: z.array(NodeId).min(1),
  parentId: NodeId.optional().describe('New parent frame/page; omit to keep the parent'),
  index: z.number().int().min(0).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
});
export const CloneNodeInput = z.object({
  id: NodeId,
  parentId: NodeId.optional(),
  index: z.number().int().min(0).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
});
export const SelectNodesInput = z.object({
  ids: z.array(NodeId),
  zoom: z.boolean().default(true),
});
export const ExecuteCodeInput = z.object({
  code: z
    .string()
    .describe('Body of an async function. Globals: figma, h (helpers). Use top-level await and `return`.'),
  timeoutMs: z.number().int().min(1000).max(300000).default(30000),
});

// figma-master Giai đoạn 7: one read-only call returns the QA report.
export const AuditInput = z.object({
  rootId: NodeId.optional().describe('Audit this subtree; default: the current page'),
  checks: z
    .array(z.enum(['names', 'tokens', 'layout', 'a11y', 'hygiene']))
    .optional()
    .describe('Groups to run; default: all of them'),
  limit: z.number().int().min(1).max(500).default(50).describe('Sample size per issue kind'),
  format: z.enum(['json', 'markdown']).default('json').describe('markdown = the skill QA report template'),
});

// figma-master Giai đoạn 2: variables in one call (collection, modes,
// aliases, scopes). Figma rejects addMode when the plan allows one mode only;
// that case is reported as a warning, not a failure.
export const CreateVariablesInput = z.object({
  collection: z.string().min(1).describe('Collection name; created when missing'),
  modes: z.array(z.string().min(1)).optional().describe('Mode names; the first is the default. Default: ["Default"]'),
  variables: z
    .array(
      z.strictObject({
        name: z.string().min(1).describe('Slash path, e.g. "color/blue/600" or "space/4"'),
        type: z.enum(['COLOR', 'FLOAT', 'STRING', 'BOOLEAN']),
        scopes: z.array(z.string()).optional().describe('e.g. ["FRAME_FILL","SHAPE_FILL"]; [] hides it from pickers (primitive)'),
        values: z
          .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.strictObject({ alias: z.string() })]))
          .describe('One value per mode name: hex/number/string/boolean, or { alias: "other/name" }'),
      }),
    )
    .min(1),
});

// figma-master Giai đoạn 1: the standard page skeleton and page maintenance.
export const ManagePagesInput = z.object({
  template: z.boolean().optional().describe('Create the missing pages of the 9-page master skeleton'),
  create: z.array(z.string().min(1)).optional(),
  rename: z.array(z.strictObject({ page: z.string(), to: z.string().min(1) })).optional(),
  delete: z.array(z.string()).optional(),
  order: z.array(z.string()).optional().describe('These pages first, in this order; the rest follow'),
  dryRun: z.boolean().default(false).describe('Return the plan without touching the file'),
});

export type GetNodeInput = z.infer<typeof GetNodeInput>;
export type GetSelectionInput = z.infer<typeof GetSelectionInput>;
export type FindNodesInput = z.infer<typeof FindNodesInput>;
export type SetPageInput = z.infer<typeof SetPageInput>;
export type DesignSystemInput = z.infer<typeof DesignSystemInput>;
export type ListFontsInput = z.infer<typeof ListFontsInput>;
export type ScreenshotInput = z.infer<typeof ScreenshotInput>;
export type RenderTreeInput = z.infer<typeof RenderTreeInput>;
export type UpdateNodesInput = z.infer<typeof UpdateNodesInput>;
export type DeleteNodesInput = z.infer<typeof DeleteNodesInput>;
export type MoveNodesInput = z.infer<typeof MoveNodesInput>;
export type CloneNodeInput = z.infer<typeof CloneNodeInput>;
export type SelectNodesInput = z.infer<typeof SelectNodesInput>;
export type ExecuteCodeInput = z.infer<typeof ExecuteCodeInput>;
export type AuditInput = z.infer<typeof AuditInput>;
export type ManagePagesInput = z.infer<typeof ManagePagesInput>;
export type CreateVariablesInput = z.infer<typeof CreateVariablesInput>;
