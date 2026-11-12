# Platform mapping — one style, iOS and Android

The **brand layer** is shared by both platforms and lives in one token set: colour, type personality (brand font or pairing), shape and radius, material (grain, gradient, imagery), signature move, motion character.

The **platform layer** follows each platform's conventions:

| | iOS | Android |
|---|---|---|
| Base frame | 393 × 852 pt (also check 375, 440) | 412 × 915 dp (also check 360 × 800, 600+ foldable) |
| Minimum touch target | 44 × 44 pt | 48 × 48 dp |
| System font | SF Pro (Text/Display), Dynamic Type | Roboto / Google Sans, font scale up to 200% |
| Top of screen | Nav bar, large title, back chevron + label | Top app bar, back arrow; system back gesture/button |
| Main navigation | Tab bar (3–5) | Navigation bar (3–5) or navigation drawer |
| Primary action | Button in content or nav bar | Button, or FAB when one action dominates |
| Sheets | Sheet with detents, grabber | Modal / standard bottom sheet with drag handle |
| Alerts | Alert (centred, 1–3 actions), action sheet | Dialog, snackbar for undo-able feedback |
| Selection | Switch, segmented control, picker | Switch, segmented button, chips, menus |
| Depth | Shadow, blur materials | Tonal elevation (surface tint), shadow for low levels |
| Touch feedback | Highlight / dim | Ripple |
| Safe areas | Status bar, Dynamic Island, home indicator | Status bar, gesture bar / 3-button nav |
| Icons | SF Symbols style | Material Symbols style |

## Rules

- **Both platforms:** design the primary platform first (the one with more users). Redraw on the other platform only the screens whose patterns differ (navigation, sheets, dialogs, pickers), in an `Adaptive · Android` (or `Adaptive · iOS`) Section on `05 · Screens & Flows`, frames named `SCR-NN · <Screen> · <State> · Android`. Screens built only from shared components are not redrawn.
- **Fonts:** a brand font is used on both; without one, the pairing is `SF Pro` on iOS and `Roboto` on Android with the same scale roles (`display`, `title`, `headline`, `body`, `callout`, `caption`). Text styles bind to the same role names on both.
- **Sizes:** tokens are unitless numbers; they read as pt on iOS and dp on Android (1 pt ≈ 1 dp in design).
- **Glass and blur:** native on iOS; on Android prefer a translucent surface or tonal surface with the same colour role — the principle (layered, light) is kept, the material adapts.
- **Bold directions** may push colour, type and shape; they may not replace the platform's back navigation, main navigation pattern, or system gestures.
