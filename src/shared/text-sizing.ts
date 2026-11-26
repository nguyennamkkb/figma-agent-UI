export type SizingMode = 'FIXED' | 'HUG' | 'FILL';
export type TextAutoResizeMode = 'WIDTH_AND_HEIGHT' | 'HEIGHT';

export function sizesThroughLayout(isText: boolean, parentHasAutoLayout: boolean): boolean {
  return !isText || parentHasAutoLayout;
}

export function textAutoResizeFor(
  hugsWidth: boolean,
  heightMode: SizingMode | undefined,
  hasExplicitHeight: boolean,
): TextAutoResizeMode | undefined {
  if (hugsWidth) return 'WIDTH_AND_HEIGHT';
  if (heightMode !== 'FIXED' && !hasExplicitHeight) return 'HEIGHT';
  return undefined;
}
