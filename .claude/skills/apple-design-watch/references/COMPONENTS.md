# Component knowledge — apple-design-watch

Each entry covers one interface element/concept, distilled from the corresponding HIG page (read in a real browser).

## Complication

**Purpose:** A complication displays timely, relevant information on the watch face, where people can view it each time they raise their wrist.

**Structure:** Complications | Apple Developer Documentation · Anh nghien cuu

**Principles:**
- Prefer using WidgetKit to develop complications for watchOS 9 and later.
- Support all complication families when possible.
- Consider creating multiple complications for each family.
- Make sure you help people prevent potentially sensitive information from being visible to others.
- Choose a ring or gauge style based on the data you need to display.
- Make sure images look good in tinted mode.
- Use line weights that suit the size and complexity of the image.
- Provide a set of static placeholder images for each complication you support.
- Note that complication image sizes vary per layout (and per legacy template) and the size of a placeholder image may not match the size of the actual image you supply for that complication.
- Use the following values for guidance as you create images for an extra-large circular complication.
- Use the following values to create no-content placeholder images for your circular-family complications.
- Use the following values to create no-content placeholder images for your corner-family complications.

**Avoid:**
- Avoid using color as the only way to communicate important information.

**Specs:**
- 42x42 pt (84x84 px @2x)
- 44.5x44.5 pt (89x89 px @2x)
- 47x47 pt (94x94 px @2x)
- 50x50 pt (100x100 px @2x)
- 27x27 pt (54x54 px @2x)
- 28.5x28.5 pt (57x57 px @2x)
- 31x31 pt (62x62 px @2x)
- 32x32 pt (64x64 px @2x)

**Accessibility:**
- The graph uses high-contrast white and red for the primary content and a lower-contrast gray for the graph lines and labels, making the data easy to understand at a glance.

## Notification

**Purpose:** A notification gives people timely, high-value information they can understand at a glance.

**Structure:** Notifications | Apple Developer Documentation · Anh nghien cuu

**Principles:**
- Provide concise, informative notifications.
- Use an alert — not a notification — to display an error message.
- Prefer brief titles that people can read at a glance, especially on Apple Watch, where space is limited.
- Use title-style capitalization and no ending punctuation.
- Use complete sentences, sentence case, and proper punctuation, and don’t truncate your message — the system does this automatically when necessary.
- Provide generically descriptive text to display when notification previews aren’t available.
- Use sentence-style capitalization for this text.
- Consider providing a sound to supplement your notifications.
- Provide beneficial actions that make sense in the context of your notification.
- Prefer actions that let people perform common, time-saving tasks that eliminate the need to open your app.
- Provide a simple, recognizable interface icon for each notification action.
- Use a badge only to show people how many unread notifications they have.

**Avoid:**
- Avoid sending multiple notifications for the same thing, even if someone hasn’t responded.
- Avoid sending a notification that tells people to perform specific tasks within your app.
- Avoid including sensitive, personal, or confidential information in a notification.
- Avoid including your app name or icon.
- Avoid providing an action that merely opens your app.
- Avoid creating a custom image or component that mimics the appearance or behavior of a badge.

**Specs:**
- If you want to match the background color of other system notifications, use white with 18% opacity; otherwise, you can use a custom color, such as a color within your brand’s palette.

## Digital Crown

**Purpose:** The Digital Crown is an important hardware input for Apple Vision Pro and Apple Watch.

**Structure:** Digital Crown | Apple Developer Documentation · Anh nghien cuu

**Principles:**
- List, tab, and scroll views are vertically oriented, allowing people to use the Digital Crown to easily move between the important elements of your app’s interface.
- Consider using the Digital Crown to inspect data in contexts where navigation isn’t necessary.
- Provide visual feedback in response to Digital Crown interactions.
- Update your interface to match the speed with which people turn the Digital Crown.
- Use the default haptic feedback when it makes sense in your app.

**Avoid:**
- Avoid updating content at a rate that makes it difficult for people to select values.

**Accessibility:**
- Open Accessibility settings

## Action button

**Purpose:** The Action button gives people quick access to their favorite features on supported iPhone and Apple Watch models.

**Structure:** Action button | Apple Developer Documentation · Anh nghien cuu

**Principles:**
- Support the Action button with a set of your app’s essential functions.
- Keep labels as short as possible, with a maximum of three words.
- Prefer letting the system show people how to use the Action button with your app.
- Let people use your actions without leaving their current context.
- Consider offering a secondary function that supports or advances the primary action people choose.
- Consider carefully before you offer more than one secondary function, because doing so can increase people’s cognitive load and make your app seem harder to use.
- Prefer using subsequent button presses to support additional functionality rather than to stop or conclude a function.

**Avoid:**
- Avoid creating content that repeats the guidance offered in Settings for the Action button, or other usage tips the system provides.

## Haptics

**Purpose:** Playing haptics can engage people’s sense of touch and bring their familiarity with the physical world into your app or game.

**Structure:** Playing haptics | Apple Developer Documentation · Anh nghien cuu

**Principles:**
- Use system-provided haptic patterns according to their documented meanings.
- Use haptics consistently throughout your app or game.
- Prefer using haptics to complement other feedback in your app or game.
- Let people turn off or mute haptics, and make sure people can still enjoy your app or game without them.
- Ensure that haptic vibrations don’t disrupt experiences involving device features like the camera, gyroscope, or microphone.
- Use standard UI components — like toggles, sliders, and pickers — that play Apple-designed system haptics by default.

## Always-On

**Purpose:** On devices that include the Always On display, the system can continue to display an app’s interface when people suspend their interactions with the device.

**Structure:** Always On | Apple Developer Documentation · Anh nghien cuu

**Principles:**
- Keep other types of personal information glanceable when it makes sense.
- Keep important content legible and dim nonessential content.
- Note that unnecessary changes during Always On can be especially distracting on iPhone, because people often put their device face up on a surface, making motion on the screen visible even when they’re not looking directly at it.

**Avoid:**
- Avoid making distracting interface changes when Always On begins or ends and throughout the Always On experience.

## Watch face

**Purpose:** A watch face is a view that people choose as their primary view in watchOS.

**Structure:** Watch faces | Apple Developer Documentation · Anh nghien cuu

**Principles:**
- Display a preview of each watch face you share.
- Aim to offer shareable watch faces for all Apple Watch devices.

## Layout

**Purpose:** - Layout is the **structure** that helps people understand content as soon as they open the app; the familiar relationship between

**Structure:** HIG — Layout · TL;DR · Visual hierarchy · Adaptability · Size classes · Guides & safe area · Platform considerations · macOS · tvOS · visionOS

**Specs:**

**Accessibility:**
- - Support **Dynamic Type**: side-by-side views may need to stack vertically, and table rows grow taller so text isn't clipped.
- - Text size changes (Dynamic Type)
- - **Dynamic Type**: a horizontal row may need to stack vertically; row containers grow taller; a single-line row may become multi-line.
- - [ ] Enable Dynamic Type and test at the largest text size.
