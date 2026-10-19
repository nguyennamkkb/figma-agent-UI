# Navigation: sidebar ↔ tab bar — iPad

> Sources: WWDC24 10147 (*Elevate your tab and sidebar experience in iPadOS*),
> WWDC25 208/282.

## 1. Choosing a model

| Model | Use when | Notes |
|---|---|---|
| **Sidebar** | Many sub-views / deep hierarchy (Mail, Music) | **Flatten navigation**, surface structure at the top level |
| **Tab bar** | Few peer destinations, need **maximum content** | Compact, flexible; **start here** then scale up to a sidebar |
| **Split view** | Master–detail | Collapse columns when narrow |
| **Inspector** | Attributes of the selected item | Collapsed ⇒ **becomes a sheet** |

> **Start with a tab bar** when unsure: a tab bar **morphs into a sidebar** easily as the app grows.

## 2. Morph tab bar ↔ sidebar

- A sidebar can **morph into a tab bar** (and back) — users pick the style they prefer.
- A tab bar is **smaller** ⇒ content gets more room and feels more immersive.
- When the sidebar hides, it **animates into the tab bar**; users can still navigate immediately.
- **Adaptive:** rotating to portrait can morph the sidebar back to a tab bar; the essence is **width change** ⇒
  the app must reflow at **every width** (including floating windows).

## 3. Structure & components

- Define a **Tab** per top-level destination; group with **TabSection / UITabGroup**.
- Tab bar has 3 zones: **fixed** (not customizable) · **customizable** (drag & drop, add from sidebar) ·
  **pinned** (at the end, e.g. Search).
- **Search role** ⇒ tab gets default title/icon/pinned.
- Sidebar: customizable header/footer, **swipe actions**, **context menus**, **tab-anchored popovers**.
- Tabs can be **drop destinations** (dragging a photo into a collection…).

## 4. Customization

- Users **show/hide and reorder** tabs; changes **persist automatically**.
- API: `TabViewCustomization` + `AppStorage` (persist) + `customizationID`; `customizationBehavior`,
  `defaultVisibility`; UIKit: `allowsHiding`, `preferredPlacement`, `allowsReordering`,
  `displayOrderIdentifiers`.
- `sidebarOnly`: tab lives only in the sidebar, never on the tab bar.
- Delegate reports visibility/order changes (UIKit).
- **Tip:** key destinations (Watch Now, Library) should be **fixed**; leave the rest customizable.

## 5. Icons & labels

- **Tab bars prefer FILLED glyphs; sidebars prefer OUTLINE.**
- Declare symbols with the **outline** variant; the system picks filled when shown on a tab bar.
- Keep labels **consistent across iPhone/iPad**; **don't cram in too many tabs**.

## 6. iPad navigation checklist

- [ ] Picked the right sidebar/tab bar/split/inspector for the hierarchy depth.
- [ ] Tab ↔ sidebar morph works; selection/state preserved.
- [ ] Reflows at every width (portrait, floating windows); changes **don't break layout**.
- [ ] Sensible fixed/customizable/pinned tabs; search pinned.
- [ ] Customization persists; key destinations can't be hidden.
- [ ] Correct outline (sidebar) / filled (tab bar) icon convention.
- [ ] Sidebar has header/footer/swipe/context menus/popovers where needed.
- [ ] Drop onto tabs works (if drag & drop is a feature).
