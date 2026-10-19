# Session takeaways — apple-design-iphone-duo

Distilled from **6 sessions** (WWDC / Tech Talks) — the reasoning behind the standards.

## Build a great camera experience for iPhone Duo - Tech Talks - Videos - Apple Developer
`techtalk` · https://developer.apple.com/videos/play/tech-talks/111465/
- **Structure:** Build a great camera experience for iPhone Duo - Tech Talks - Videos - Apple Developer
- **Takeaways:**
  - Use the new AVCaptureDeviceDirectionCoordinator API to manage the transition.
  - Take advantage of this extra space by offsetting the preview, so you can group controls in the remaining space.
  - Use the videoGravity property on AVCaptureVideoPreviewLayer to determine how to lay out your preview within the layer bounds.
  - Use dynamicAspectRatio on AVCaptureDevice to select a landscape aspect ratio on the inner display.
  - Use the iOS 27.1 SDK to take full advantage of iPhone Duo.
  - But you can do even more by responding to camera direction changes.
  - It's also important to note that depth is only supported when accessing individual cameras.
  - For example, you could be looking at the inner display, but be streaming from the outer front camera.
  - If you flip the device while it's open, you can take a selfie with the back cameras.
  - If you flip the device while it's open, you can move a camera app to the outer display.

## Design for iPhone Duo - Tech Talks - Videos - Apple Developer
`techtalk` · https://developer.apple.com/videos/play/tech-talks/111466/
- **Structure:** Design for iPhone Duo - Tech Talks - Videos - Apple Developer
- **Takeaways:**
  - Avoid fixed widths, breakpoints, or any metrics tied to a specific screen.
  - Don't limit functionality to one pose or another.
  - Use these components whenever possible to get the same fold avoidance behavior in your app.
  - This new 50/50 split divides the display into two halves that work independently, so you can easily keep a task on one side while using the other half.
  - And when a video is playing in picture-in-picture, you can now pin it to the top of the screen to keep watching it.
  - You can also mix both approaches, a full-width background image or header with scrollable foreground content that's inset.
  - Just to make sure every interactive element lives inside that scrollable area so nothing gets covered up.
  - Just to make sure your hierarchy doesn't change between the outer and inner displays.
  - Following this example from Music, you can have a vertically stacked layout that rearranges itself into a two-column layout when there's more horizontal space.
  - And a third option for apps with tab bars: You can present your tab bar as a sidebar on the inner display.
- **Specs:**
  - Instead, focus on two size classes: compact width on the outer display and regular width on the inner display.

## Leverage multiple displays and scenes on iPhone Duo - Tech Talks - Videos - Apple Developer
`techtalk` · https://developer.apple.com/videos/play/tech-talks/111464/
- **Structure:** Leverage multiple displays and scenes on iPhone Duo - Tech Talks - Videos - Apple Developer
- **Takeaways:**
  - Make sure you handle errors when requesting new scenes.
  - Use UIWindowSceneActivationAction, which automatically hides when new windows aren't available.
  - Update your app to support split view multitasking, use the Hinge API to build impressive interactions and effects,
  - I'll make sure to add an else condition, so the pitch bend is reset when the app is not reading the hinge angle.

## Prepare your app for iPhone Duo - Tech Talks - Videos - Apple Developer
`techtalk` · https://developer.apple.com/videos/play/tech-talks/111461/
- **Structure:** Prepare your app for iPhone Duo - Tech Talks - Videos - Apple Developer
- **Takeaways:**
  - Choose the iPhone Duo simulator to run your app in Device Hub.
  - Use the control buttons at the bottom of the screen to open, close, rotate, or fold iPhone Duo.
  - Align your interactive or visible foreground content to the safe area, while background content may extend past the safe area.
  - Make sure to account for, and test, asymmetrical safe areas and layout margins.
  - They avoid making assumptions about display sizes or device capabilities based on user interface idioms.
  - As with Idiom, avoid checking interface orientation for layout decisions.
  - On a device with two displays, avoid referencing the main screen in your code.
  - To make sure your UI fits the corners of the screen perfectly, use Concentricity APIs introduced in iOS 26.
  - On the inner display, you can opt into a sidebar with richer navigation.
  - They automatically avoid system UI like the status bar and hardware features like the camera.

## Raise the bar with iPhone Duo - Tech Talks - Videos - Apple Developer
`techtalk` · https://developer.apple.com/videos/play/tech-talks/111462/
- **Structure:** Raise the bar with iPhone Duo - Tech Talks - Videos - Apple Developer
- **Takeaways:**
  - Reserve the top for primary navigation controls, like back or close, followed by prominent actions, such as done.
  - Keep control placement consistent so people don't have to relearn where actions live as they use iPhone Duo.
  - Consider if any metric should be adjusted for the vertical representation.
  - Make sure your custom view content stays legible regardless.
  - Use the toolbarCompressionBehavior API to configure your app's preference for each view.
  - Use visibilityPriority APIs in SwiftUI and UIKit to configure this priority.
  - Use the toolbarVerticalBehavior and preferredVerticalBarBehavior APIs to disable this.
  - Update any custom items so they're ready to be placed vertically.
  - And remember, these are the same components, just adapted to a different layout.
  - Now that you understand the principles behind it, here are a few things to keep in mind when designing and implementing great bar experiences on iPhone Duo.

## Strike a pose with adaptive layouts on iPhone Duo - Tech Talks - Videos - Apple Developer
`techtalk` · https://developer.apple.com/videos/play/tech-talks/111463/
- **Structure:** Strike a pose with adaptive layouts on iPhone Duo - Tech Talks - Videos - Apple Developer
- **Takeaways:**
  - Take a look at this photo spread across the two pages.
  - Keep content, functionality, and layouts available so people can access the full experience regardless of how they're using iPhone Duo.
  - Think of them as smaller frames in your view's bounds.
  - Let me show you how I can use these new APIs in my app.
  - Consider whether you can make it a two-column layout, or what displacement pattern makes sense in that use case.
  - If its viewfinder is central to your experience, keep important content and controls clear of that area.
  - call displacement, which adjusts the frame of the existing elements based on the available space, keeping important content visible, reachable, and unobstructed even when the device is partially
  - Once you've chosen where something should move, consider how it adapts to its new surroundings.
  - You can query the frame property of a reserved region to incorporate it into your own layout.
  - By default, only active ones will be returned, but you can query for inactive ones using the includeInactive query option on the reservedRegion method.
