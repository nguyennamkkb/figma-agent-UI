# Always-On Display & Haptics — watchOS

> Synthesized from HIG *Always On*, *Playing haptics*, *Designing for watchOS* + related Tech Talks/WWDC sessions.
> Images: `assets/always-on.png`, `assets/action-button.png`.

## 1. Always-On — principles

- When the wrist goes down, the system **reduces luminance** and switches to a **dark color scheme**; on wrist raise, the UI returns to normal.
- **Never distract when Always-On starts/ends** or while the Always-On state persists.
- **Keep important content bright, dim the nonessential** (dim nonessential).
  - During sessions (workout/timer/Now Playing): keep the **primary metric** bright, hide secondary detail.
- **Avoid needless UI changes** — on iPhone it is even more jarring because the device often sits face-up/face-down on a table, where motion is easy to notice.
- API: **`isLuminanceReduced`** (Live Activity/Widget), **semantic** colors, avoid glaring elements.
- Image `assets/always-on.png`: glyph illustrating the **dimmed/off** state — content must be "readable but not glaring".

## 2. Always-On checklist

- [ ] The Always-On state shows the **primary information** and hides detail.
- [ ] No strong animation/color shifts when Always-On turns on/off.
- [ ] `isLuminanceReduced` is handled (especially Live Activity, gauges, bright backgrounds).
- [ ] Semantic colors used; contrast verified at low brightness.
- [ ] In-session metrics stay readable with the wrist down.

## 3. Haptics — principles

- Haptics is the **primary feedback channel** on the watch (sound off, hands busy, quick glances in many situations).
- Use for: **confirming** actions, **warning** about important events, keeping **rhythm** during workout sessions.
- **Match the buzz type to its meaning** (success ≠ warning ≠ failure) — users learn the meanings.
- **No gratuitous buzzing, no continuous buzzing** — it destroys signal value and annoys.
- Haptics **supplements**; it is never the only channel for understanding state (there must be a matching visual representation).

## 4. Haptics checklist

- [ ] Each feedback type has its own **consistent buzz pattern**.
- [ ] Buzz only when meaningful (confirmation/warning/major milestone).
- [ ] Matching visual representation exists (no haptics-only dependency).
- [ ] Workout sessions: rhythm/finish clearly felt through touch.
- [ ] Never use buzzing to replace important hidden information.

## 5. How it relates to interaction

- **Digital Crown** usually pairs with light haptic feedback at detents (helps users "feel" values).
- **Action button** (Ultra) and **double tap** need instant feedback so users trust the press registered.
- In Always-On, **don't** fire distracting haptics (except genuine warnings).
