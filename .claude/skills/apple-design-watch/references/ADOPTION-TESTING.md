# Adoption & Testing — watchOS

> Distilled from WWDC26 *watchOS Group Lab*, WWDC25 *What's new in watchOS 26*
> + HIG *Designing for watchOS*.

## 1. Architecture & SDK

| Item | Action |
|---|---|
| **arm64** (Series 9+, Ultra 2, watchOS 26+) | Enable **Standard Architectures** for the Apple Watch target; watch `Float/Int` and pointer math; test on **both simulator and device** |
| Design system | Apps built for **watchOS 10+** pick up the new style automatically; **re-run and audit** custom UI to confirm it stays legible |
| Icon | Use **Icon Composer**; the watch icon appears in the app grid/list + notifications sent directly to the watch; the iOS icon appears in notifications forwarded from iPhone |
| Xcode | Use **Xcode 27**; install the beta, send feedback with logs if still slow |
| Graphics | **SceneKit deprecated** → migrate gradually to **SwiftUI Canvas** (GPU) |

## 2. Debugging & connectivity

- **Device Hub** (since watchOS 26/27): connects **watch ↔ Mac directly**, no proxy via iPhone ⇒ better reliability & throughput.
- Requires a network that allows device-to-device **peer-to-peer** (some corporate networks block it).
- Newer Apple Watches have **5 GHz** Wi-Fi ⇒ better throughput.
- **Still test across generations**: use real devices for critical paths, Device Hub for the wider configuration range.

## 3. Runtime constraints

- The system enforces a **strict watchdog timeout** and resource limits (few cores) — background work must be **light, compact, and justified**.
- Prefer: **Swift async**, URLSession, CloudKit… (familiar APIs still exist), but **don't hold long sessions**.
- Widgets have a **budget**; Live Activities have a **budget**; don't treat them like foreground apps.

## 4. First launch & offline

- First launch has **no warm-up time** ⇒ make sure users **see something useful immediately**, not a spinner.
- **Bundle the essentials**; load the rest in the background (background URL session).
- Design for **fully offline** (hiking, beach…): the disconnected state must have replacement content.
- Foundation Models (watchOS 27) **needs network** ⇒ always have a **fallback** (no cellular, quota, provider errors).

## 5. Test matrix

| Dimension | Values |
|---|---|
| Devices | Smallest Series ↔ Ultra; multiple screen sizes |
| Architecture | arm64 (device + simulator) |
| Display | light/dark · **Always-On** (wrist down) · **reduced luminance** |
| Accessibility | large text · **Reduce Transparency** · **Increase Contrast** · Reduce Motion |
| Connectivity | Wi-Fi · cellular · **no connection** · constrained connectivity (Live Activity) |
| Language | LTR · **RTL** · long strings (localization) |
| State | first launch offline · stale data · placeholder |
| Sessions | workout/timer/Now Playing under Always-On |

## 6. Adoption checklist

- [ ] Build **Standard Architectures** (arm64); test device + simulator.
- [ ] Audit custom UI after moving to the new design system (legible with system styles).
- [ ] Icons updated with Icon Composer.
- [ ] Use Device Hub; verify peer-to-peer networking; test the device range.
- [ ] Light background work; no held sessions; respect the watchdog.
- [ ] First launch: content immediately, background-loaded extras, offline state.
- [ ] Foundation Models: check availability + fallback.
- [ ] Run the section 5 matrix.
