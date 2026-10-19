# Live Activities on Apple Watch

> Distilled from WWDC24 *Bring your Live Activity to Apple Watch*, *Design Live Activities for Apple Watch*,
> WWDC25 *What's new in watchOS 26* (+ *What's new in widgets*).

## 1. How they appear

- Since **iOS 18 / watchOS 11**, an iOS app's Live Activity **appears automatically in the Smart Stack** — even
  **without a Watch app**.
- Defaults to **compact leading/trailing** (the Dynamic Island views) + app title.
- **Alerting updates:** on the watch face → the system **opens the Smart Stack automatically**, shows the alert, then shows
  the Live Activity. App foreground → **banner** at the bottom with compact views.
- Tapping a Live Activity ⇒ **full-screen presentation** + option to open the app on iPhone.

## 2. Customizing for watch

| Task | How |
|---|---|
| Enable the small family | `supplementalActivityFamilies(.small)` on `WidgetConfiguration` |
| Know whether you're on watch or iOS | Read the **`activityFamily`** environment: `.small` = Smart Stack · `.medium` = iOS Lock Screen |
| Watch-only layout | Write a new layout when `activityFamily == .small` (Lock Screen content is often **truncated** on watch) |
| Open the Watch app on tap | Info.plist **“Supports Launch for Live Activity Attribute Types”**: empty = all activities; or list each `ActivityAttributes` |
| Preview | Xcode Previews for Live Activities; Canvas Device Settings → **All Variants** or **Content Smart Stack** |

## 3. Updates, budget, connectivity

- Updates **sync automatically** to watch — **no separate push token needed**.
- They're **budgeted** (like iOS); over-budget updates may **not appear while the wrist is down**,
  but raising your wrist shows the **latest** info.
- Watch supports **high-frequency updates** on request.
- **Limited connectivity:** Start / End / alerting updates are **prioritized**; the system shows a
  **“last connected”** notice in the Smart Stack so users know data may be stale.
- Local updates via ActivityKit on iOS **also** sync to watch and **count against the budget**.

## 4. Always-On Display

- The system auto-switches to a **dark color scheme** + **reduced luminance** when the wrist drops.
- Use **`isLuminanceReduced`** to drop/dim bright elements (e.g. re-tint gauges for readability).
- For a light look: set `preferredColorScheme(.light)` — Always-On still uses dark + reduced luminance.
- Use **semantic colors** (primary…) to adapt to the color scheme automatically.

## 5. Content design (lessons)

- Compact views must be **timely, relevant, information-rich** — they're what appears first.
- **Alert selectively:** don't alert every change. Sports example: basketball alerts per **quarter**, soccer
  alerts per **goal**.
- **End on time:** when the activity finishes, disappear (don't linger 5 hours after delivery).
- Separate **alerts** (need to know now) from **silent updates** (passive tracking).

## 6. Live Activity on watch checklist

- [ ] Enable `supplementalActivityFamilies(.small)` and **design a dedicated layout** for `.small`.
- [ ] Compact leading/trailing views are useful (not just repeating content).
- [ ] `isLuminanceReduced` handled correctly; semantic colors; readable in Always-On.
- [ ] Stay within budget; accept delayed updates while the wrist is down.
- [ ] Handle limited connectivity (start/end/alerts prioritized) + “last connected” state.
- [ ] Selective alerts; end when the activity finishes.
- [ ] (With a Watch app) configure the launch key scoped to the right `ActivityAttributes`.
