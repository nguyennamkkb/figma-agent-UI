# Touch targets

> Sources: WCAG 2.2 (W3C), Apple HIG, Material Design, Steven Hoober's mobile ergonomics research.
> Detailed evidence: [EVIDENCE.md](EVIDENCE.md).

## 1. Numbers to remember

| Standard | Size | Role |
|---|---|---|
| **WCAG 2.5.8 Target Size (Minimum) — AA** | **24×24 CSS px** (or equivalent spacing) | **Legal floor** |
| **WCAG 2.5.5 Target Size (Enhanced) — AAA** | **44×44 CSS px** | Enhanced goal |
| **Apple HIG** | **44×44 pt** | Size to build |
| **Material Design** | **48×48 dp** | Size to build |

> **Bottom line:** 24 px = the number you never go below · 44 pt / 48 dp = the number to build.

## 2. Touch area ≠ glyph

- The hit area is the **entire tappable region**, not the visible shape.
- A 16 px icon still passes if you **expand the hit area with padding**:
  - Web: `min-width/min-height: 44px` + `padding` (don't shrink the target).
  - iOS: `.contentShape(Rectangle())` + padding for custom shapes.
  - Android: `TouchDelegate` or `minWidth/minHeight = 48dp`.

## 3. Spacing for small targets

- WCAG 2.5.8 allows targets < 24 px **if** a 24 px circle around the center **does not touch** another target.
- The 24 px circle must sit **fully inside** the target (a 24 px circle doesn't fit inside a 24 px square ⇒
  round targets need to be slightly larger, or must have enough spacing).
- **Dense toolbars/actions** are the most common failure point.

## 4. Size by screen position (Hoober)

| Position | Minimum | Reason |
|---|---|---|
| **Top** edge | ~**11 mm** (≈ 68 iOS pt) | Thumb struggles to reach; poor approach angle |
| **Middle** | ~**7 mm** (≈ 44 iOS pt) | Most accurate zone |
| **Bottom** | ~**12 mm** (≈ 74 iOS pt) | Thumb approaches at a **flatter angle** ⇒ needs a larger area |

Conversion: one iOS point is about 0.16 mm on current iPhones, so millimetres convert to points at roughly × 6.2. These are hit-region sizes; the visible control may be smaller. None of them is below the 44 pt floor.

⇒ Placing the **primary action at the bottom** is both ergonomic and permissive... but don't use that as an excuse to shrink bottom targets.

## 5. Field-tested rules

1. Every control ≥ **44×44 pt / 48×48 dp**; absolute floor **24×24**.
2. Never shrink a target to look "pretty"; **grow the hit area with padding**.
3. Adjacent controls: leave enough gap so the 24 px circles don't overlap.
4. Controls at the top/middle edge: **increase size** above the minimum.
5. Verify with: DevTools bounding box · **thumb-tap test one-handed** · axe/Lighthouse.
6. Older adults / people with limited motor control benefit **disproportionately** from large targets.

## 6. Checklist

- [ ] Every target ≥ 24 px (goal 44/48).
- [ ] Small icons → padding/`contentShape`, never shrunk.
- [ ] 24 px circles between targets don't overlap.
- [ ] Top/middle/bottom-edge controls meet their positional thresholds.
- [ ] One-handed test (left + right) on a real device.
