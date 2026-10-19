# Section-by-section knowledge — apple-design-iphone-duo

Each entry is an interface section/concept distilled from the corresponding HIG page (read via a real browser).

## Adaptive layout & poses

**Purpose:** Introduces the fundamental concepts of designing for iPhone Duo, including device poses, dynamic layouts across dual displays, and toolbars and tab bars on the vertical axis.

**Structure:** Designing for iPhone Duo | Apple Developer Documentation · Research screenshot

**Principles:**
- Use size classes, layout margins, and safe area insets to lay out controls and content.
- Keep functionality and the state of elements the same between displays.
- Maintain your app’s information hierarchy, but show an additional level of hierarchy on the larger inner display if it makes sense for your content.
- Maintain the same functionality across device poses.
- Provide access to the same controls and content regardless of how someone holds or views the device.
- Make your game playable in every device pose.
- Prefer changing the aspect ratio over letterboxing or pillarboxing in games; if you can’t avoid letterboxing or pillarboxing, add artwork to the padding area to help the experience feel full screen.
- Adapt your layout when the device folds.
- Prefer a layout container that adapts automatically, like the split view in Notes that adjusts the width of each pane to stay clearly visible as the device folds.
- Use the ReservedRegion API to keep important elements clear of the center if the system doesn’t move them automatically.
- Consider an arrangement view when your layout already resembles one.
- Keep navigation outside of arrangement views.

**Avoid:**
- Avoid fixed widths and display-specific dependencies.
- Avoid extreme layout changes as people fold the device.

**Specs:**
- A compact width layout for the outer display and a regular width layout for the inner display give you the fundamentals for every pose.

**Accessibility:**
- In navigation-focused experiences, move toolbar items into the overflow menu so the tab bar and primary destinations remain accessible.

## Hardware specs

**Purpose:** Choose a different country or region to see content for your location and shop online.

**Structure:** iPhone Duo - Technical Specifications - Apple · Research screenshot

**Principles:**
- Support for display of multiple languages and characters simultaneously
- Take 8MP still photos while recording 4K video
- Use of these features is subject to the Apple Intelligence Terms and Conditions.
- Use of an eSIM requires a carrier that supports eSIM and a wireless service plan.

**Avoid:**

**Specs:**
- 1878‑by‑2670-pixel resolution at 430 ppi
- 1398‑by‑2034-pixel resolution at 460 ppi
- ProMotion technology with adaptive refresh rates up to 120Hz
- 1000 nits max brightness (typical); 1600 nits peak brightness (HDR); 3000 nits peak brightness (outdoor); 1 nit minimum brightness
- When measured as a standard rectangular shape, the screens are 7.58 and 5.36 inches diagonally (actual viewable area is less).
- Also enables 12MP optical-quality 2x Telephoto: 52 mm, ƒ/1.6 aperture, sensor‑shift optical image stabilization, Hybrid Focus Pixels
- 2x optical‑quality zoom in, 2x optical zoom out; 4x optical‑quality zoom range
- Digital zoom up to 10x

**Accessibility:**
- 2,000,000:1 contrast ratio (typical)
- Built-in accessibility features supporting vision, mobility, hearing, speech, and cognitive needs help you get the most out of your iPhone — in the ways that work best for you.

## Product page

**Purpose:** Choose a different country or region to see content for your location and shop online.

**Structure:** iPhone Duo - Apple · Research screenshot

**Principles:**
- Use StandBy just about anywhere, even when you aren’t charging iPhone Duo.
- Include the people around you in group calls with Duo FaceTime.
- Use Smart Take so you can be part of the moment, not stuck photographing it.
- Add extended reach to your compositions without sacrificing detail.
- Choose two‑hour delivery from an Apple Store, free delivery, or easy pickup options.
- Let us help you find what you need and answer all of your questions, one on one, at an Apple Store or online.
- Use the Apple Store app to get a more personal way to shop.
- Use of these features is subject to the Apple Intelligence Terms and Conditions.
- Use of an eSIM requires a carrier that supports eSIM and a wireless service plan.

**Avoid:**

**Specs:**
- 50% larger display than iPhone 18 Pro Max
- 2x optical-quality zoom.
- 20% faster 6‑core CPU
- Made with 35% recycled material by weight.
- Manufactured with 60% renewable electricity.
- Ships in 100% fiber-based packaging.

**Accessibility:**
- Innovation that’s accessible by design.
- Learn more about accessibility
