# Session takeaways — apple-design-ipad

Distills **4 sessions** (WWDC / Tech Talks) — the reasoning behind the conventions.

## Elevate your tab and sidebar experience in iPadOS - WWDC24 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2024/10147/
- **Structure:** Elevate your tab and sidebar experience in iPadOS - WWDC24 - Videos - Apple Developer
- **Takeaways:**
  - Use the defaultVisibility modifier to hide tabs from the sidebar or tab bar.
  - Make sure your app looks great with the new tab bar.
  - Make sure to comment below if you prefer tabs or spaces.
  - For example, in the Clock app, there are four distinct tabs in the tab bar: World Clock, Alarms,
  - First, I'll go over features in the new tab bar and sidebar, and what to consider when adopting them.
  - Finally, I'll cover how these features look on different platforms, and what you need to consider when building for a multi-platform experience.
  - Tab bars prefer filled glyphs, and sidebars prefer outlined glyphs.
  - For example, in the Music app, the Browse tab uses the square.grid.2x2 symbol, which is an outlined glyph.
  - You can customize the sidebar's header and footer; or, add swipe actions or context menus to tabs.
  - Additionally, you can show popovers from tabs, and they will be anchored to wherever the tab is shown.

## Elevate the design of your iPad app - WWDC25 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2025/208/
- **Structure:** Elevate the design of your iPad app - WWDC25 - Videos - Apple Developer
- **Takeaways:**
  - Let’s dive a bit deeper into how they appear on every window.
  - Make sure to keep the contents of your menu static, so that the menu bar is predictable and also aids in the discovery of new features each time people visit.
  - And finally, there is the new menu bar, that you can populate with everything that makes your app unique and powerful.
  - Tab bar’s fluidity lets people choose the navigation they prefer.
  - When adapting to size changes, make sure that any change in layout is non-destructive.
  - You can start doing this by drawing content below the toolbar using the new 'scroll edge effect'.
  - When content extends beyond its boundary like this, you can even tell which row has been scrolled, and by how much.
  - Any existing controls will shift to the right to make room and avoid occlusion.
  - When you wrap your toolbar around where window controls appear, you can avoid having to reserve a safe area.
  - Next, there’s an important change in how your app should handle opening new documents.

## Make your UIKit app more flexible - WWDC25 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2025/282/
- **Structure:** Make your UIKit app more flexible - WWDC25 - Videos - Apple Developer
- **Takeaways:**
  - Note, if your scene configuration specifies a storyboard, window creation happens automatically.
  - Use container view controllers to manage components of your UI.
  - You can query the previous UI state when a scene reconnects.
  - For example, a messaging app can have a dedicated compose scene for sending new messages.
  - In iOS 26, you can now mix SwiftUI and UIKit scene types in a single app.
  - For details on how to adopt UIScene life cycle, read the tech note: “Migrating to the UIKit scene-based life cycle.” Because scenes are so important, I will show you an example of them in practice.
  - For my app, it is important to pause the timer when the scene moves to the background.
  - There may be columns in your app that prefer displaying content at greater widths, or only require a fraction of the default width to remain functional.
  - You can customize the minimum, maximum, and preferred widths of each column using their associated split view controller properties.
  - For example, in the Music app on iPad, the Library tab group includes Artists, Albums, and more.
- **Specs:**
  - In this example, I specify a preferred minimum width of 500 points.

## Modernize your UIKit app - WWDC26 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2026/278/
- **Structure:** Modernize your UIKit app - WWDC26 - Videos - Apple Developer
- **Takeaways:**
  - Note that in contrast to the iPad, this is an app choice.
  - Avoid performing animations or presenting modal UI from sessionWillBegin.
  - Let's talk about what's on everyone's mind: agentic coding!
  - Use Xcode's intelligence features and ask an agent to make your app more adaptable.
  - Because of this, it is important that your app dynamically adjusts to any available scene size at
  - I will cover the most important steps and common issues you might encounter when making your app more adaptive: verifying your app is no longer using app lifecycle, and instead has adopted scene
  - It is important that you do not reference the main screen in your app.
  - It will adjust better when your view controller appears in other contexts, for example inside of a split view controller.
  - You should not consider interface orientation for any layout calculations.
  - Once you are satisfied with the results, make sure to test iPhone Mirroring and iPad with real devices.
