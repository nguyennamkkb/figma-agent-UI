# Adoption & Testing — iPhone Duo

> Distilled from Tech Talk *Prepare your app for iPhone Duo* (+ *Design for*, *Strike a pose*).

## 1. Three SDK levels (deciding what the app looks like)

| SDK | Experience on Duo |
|---|---|
| **Before iOS 27** | App **still runs**. When closed: uses the area left of the status bar + camera. When open: familiar size & ratio. |
| **iOS 27 SDK** | App **extends left** of the status-bar area on the inner display (thanks to iPhone resizing support). |
| **iOS 27.1 SDK** | **Full screen**: app extends edge to edge; **navigation/toolbar stack vertically under the status bar** — the full Duo experience. |

⇒ For vertical bars + all new behavior: **build with SDK 27.1**.

## 2. Test setup

1. Install **Xcode 27.1**.
2. Pick the **iPhone Duo simulator**.
3. Run in **Device Hub**.
4. Use the **control buttons at the bottom of the display** to **open / close / rotate / fold**.
5. Use the **App Resizability skill** (formerly the modernization skill) — now supporting **SwiftUI** and Duo —
   to audit resize best practices.

## 3. Code rules (avoiding design "smells")

| Do | Don't | Why |
|---|---|---|
| Size class (environment / trait collection) | Check **interface orientation** | The inner display **ignores** orientation |
| Environment / trait / scene bounds | Reference the **main screen** | Ambiguous on a two-display device; will be deprecated |
| Layout margins + safe area insets | **Fixed widths**, breakpoints, per-display metrics | The app appears at countless sizes |
| `ConcentricRectangle` / `UICornerConfiguration` | Hand-roll corner radii | Duo display shapes are new; the iOS 26+ APIs already account for them |
| Standard bars in a navigation container | Standalone `UIToolbar`/`UINavigationBar` | Standalone bars are **excluded** from axis switching |
| Background/artwork past the safe area | Only draw inside the safe area | `ignoresSafeArea` (SwiftUI) / bounds (UIKit) |
| Handle **each edge** separately | Assume both insets are equal | Safe areas & margins on Duo are **asymmetric** |

## 4. Test matrix

| Test axis | Values |
|---|---|
| Pose | closed · open portrait · open landscape · partially folded (book) · propped/tent |
| Display | outer · inner |
| Orientation | portrait · landscape |
| Multitasking | full · split left · split right · PiP pinned to top |
| Reserved regions | fold active/inactive · inner camera active/inactive |
| Language | LTR · **RTL** (bar stays on the same physical edge) |
| Accessibility | largest Dynamic Type · Reduce Transparency · Reduce Motion |
| State | open/fold **mid-session** (media, form, scroll, selection) |
| Multi-window | create a scene on **inner**; request a scene on **outer** (must fail gracefully) |
| Camera | virtual front camera · individual cameras · switching on open/fold · rotation |

## 5. Common integration mistakes

| Mistake | Why it's wrong |
|---|---|
| Not rebuilding with SDK 27.1 yet expecting vertical bars | The new behavior is tied to the SDK |
| Using `UIScreen.main` | Will be deprecated; wrong when the app is on the other display |
| Checking orientation to pick a layout | Inner ignores orientation |
| Hand-rolled standalone toolbar | The system won't switch its axis |
| Assuming symmetric insets | Duo is asymmetric (controls hug one edge) |
| Requesting a new window on outer | Outer **cannot** create new windows |
| Not resetting state when hinge is nil | Leaves "ghost" values with no hinge present |

## 6. Adoption checklist

- [ ] Build with **SDK 27.1**; run Device Hub; exercise **all 6 poses**.
- [ ] Run the **App Resizability skill**; clear every warning.
- [ ] No more `UIScreen.main`, orientation checks, fixed widths.
- [ ] Safe area/margins handled **per edge**; backgrounds extend correctly.
- [ ] Bars in standard containers; check toolbar/tab-bar compression in outer landscape.
- [ ] Cover matrix §4 (minimum: 6 poses × 2 orientations × 2 multitasking sides × RTL).
- [ ] Verify camera active/inactive and display switching.
