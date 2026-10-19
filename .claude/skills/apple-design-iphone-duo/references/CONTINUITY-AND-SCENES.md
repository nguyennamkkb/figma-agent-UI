# Continuity, Multitasking, Scenes, Hinge & Camera — iPhone Duo

> Distilled from Tech Talks *Leverage multiple displays and scenes*, *Build a great camera experience*,
> *Design for iPhone Duo*, *Prepare your app* + HIG.

## 1. Continuity — rule #1

**One single experience, adapting to display size and pose.**

- Keep **functionality** and **state** identical across both displays.
- Keep the **information hierarchy**; only add **one more level** on the inner display when it makes sense.
  *Mail example:* closed → either the list **or** the content; open → **both side by side**.
- **Never tie functionality to one pose** — users fold/unfold constantly; the experience must stay **predictable and
  consistent** inside and out.
- The app may **scale** on the inner display (including Split View multitasking).
- In PiP: video can **pin to the top**; the current app compresses vertically; if partially folded, the video
  **expands to half the display** ⇒ the app must adapt **in real time**.
- **State that must survive every fold/unfold**: typed text in
  fields, keyboard focus, scroll position, media playback position, selection and navigation path.
- **The two layouts complement each other:** what the outer display shows stays on the inner display, which adds
  context (an item's image + description outside → the same plus specs and reviews inside), never a different set.

## 2. Multitasking

- **Every app joins** multitasking; two apps may sit **side-by-side 50/50**.
- Two layouts: **side-by-side** and **video + app**; the app handles them **identically**.
- If it already resizes on iPad / iPhone Mirroring ⇒ already ready.
- **Controls at the outer edge** of each app (left app → controls left).
- Drag an app by its **home indicator** to form a split view.

## 3. Multiple scenes (several UI instances)

- iPhone Duo is the **first iPhone to support multiple UI instances of an app**.
- If the app supports it on iPad → it **will also support** it on Duo.
- **Key difference:**
  - iPad: a new window may be created **at any time**.
  - Duo: the **outer display CANNOT create new windows** — only the **inner** one can.
- ⇒ **Handle new-scene request errors**; use `UIWindowSceneActivationAction` (auto-hides when unavailable).

## 4. Scene accessories (content on several displays at once)

- Lets an app **attach secondary content** to the main UI, shown on the **other display**.
- The system controls **availability dynamically**: on by default, may be **revoked at any time**.
- **Track availability changes** (observation tracking / `onAvailabilityChange`) to keep the UI in sync.
- **`CameraCaptureAccessory`** (new, for camera apps): attaches secondary UI on the **outer display** while the main UI
  sits on the **inner** one.
  - Available when the app is **full screen on inner** with an active **camera session**.
  - Register on the **same view** as the camera UI ⇒ the accessory **only shows while the camera view shows**.
  - Uses: teleprompter, a display for the photo subject, group video calls.

## 5. Hinge

- API: `onHingeChange` (SwiftUI) / `UIHingeInteraction` (UIKit).
- High-level states: **closed · partially open · fully open**, plus a **continuous angle**.
- `nil` on devices with no hinge ⇒ **check existence** and **reset state** when unreadable.
- **Use for interaction/effects** (e.g. pitch-bend like a whammy bar), **NEVER for layout** —
  layout uses **arrangements + reserved regions**.
- Observed data is **live** (real time).

## 6. Camera (two front cameras)

| | Outer ultrawide | Inner ultrawide (under-display) |
|---|---|---|
| Position | Outer face | Behind the inner display |
| Max | **4K @ 120fps** | **1080p @ 60fps** |
| Depth | Only when accessing an **individual camera** | Only when accessing an **individual camera** |

- **Virtual Front Camera** (a new `AVCaptureDevice`): auto-switches between outer/inner cameras per pose;
  **only the features common** to both ⇒ max **1080p60**, **no depth**.
- For full capability: use a dedicated **device type** per camera, and **switch yourself** on open/fold via
  **`AVCaptureDeviceDirectionCoordinator`**.
- **Direction coordinator:** built from (the app's UIView, device types to watch, change handler).
  - It reports which camera **faces the user** on each display.
  - **Main-actor safe**; returns a sendable `AVCaptureDeviceDescriptor` ⇒ **never call AVFoundation
    directly in the handler**; hand the descriptor to the camera actor.
  - Each **display gets its own coordinator** (reporting for its own view).
  - Handler: **reconfigure the session** to the camera now facing the user; consider **mirroring the preview**
    when a rear camera faces the user (for a natural selfie feel); update UI on camera change.
- **Rotation coordinator:** keeps preview/capture **always correctly oriented**; on Duo it updates when the app
  **switches displays**. After adopting → **turn off camera-sensor-orientation compensation** for performance.
- **Preview polish:** when using a rear camera's full field-of-view on inner, there is **spare room around the
  preview** → you may **offset** the preview and group controls into the remainder, or let the preview **fill**
  the display (`videoGravity`). With the front ultrawide (square sensor) → `dynamicAspectRatio` picks
  a landscape ratio on inner that **fills** the display.

## 7. Continuity/scenes checklist

- [ ] Functionality + state preserved on open/fold (no restart).
- [ ] Only **one more** hierarchy level on the inner display.
- [ ] 2-way Split View: controls at outer edges; PiP pinned to top → app compresses vertically.
- [ ] New-scene errors handled; use `UIWindowSceneActivationAction`; windows created on inner only.
- [ ] Scene accessories: track dynamic availability; register on the right view.
- [ ] Hinge: effects only; reset on nil.
- [ ] Camera: virtual vs individual devices; direction + rotation coordinators; correct mirroring;
      test camera active/inactive (reserved-region impact).
