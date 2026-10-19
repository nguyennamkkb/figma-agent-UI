# Design specs — consolidated

Extracted from 36 sources read. Use as tokens/checks while designing.

| # | Spec | Source |
|---|---|---|
| 1 | In general, it works well to add about 12 points of padding around elements that include a bezel. | Accessibility / Apple Developer Document |
| 2 | For elements without a bezel, about 24 points of padding works well around the element’s visible edges. | Accessibility / Apple Developer Document |
| 3 | As a general rule, a button needs a hit region of at least 44x44 pt — in visionOS, 60x60 pt — to ensure that people can select it easily, whether they use a fingertip, a pointer, their eyes, or a remote. | Buttons / Apple Developer Documentation |
| 4 | (visionOS only) Button centers at least 60 pts apart; 4 pts of padding around buttons of 60 pts or larger. | Buttons / Apple Developer Documentation |
| 8 | If the underlying content is bright, consider adding a dark dimming layer of 35% opacity. | Materials / Apple Developer Documentatio |
| 9 | In particular, you want to avoid showing an oscillation that has a frequency of around 0.2 Hz because people can be very sensitive to this frequency. | Motion / Apple Developer Documentation |
| 10 | The height of a tab bar is 68 points, and its top edge is 46 points from the top of the screen; you can’t change either of these values. | Tab bars / Apple Developer Documentation |
| 11 | Point size based on image resolution of 144 ppi for @2x and 216 ppi for @3x designs. | Typography / Apple Developer Documentati |
| 12 | Point size based on image resolution of 144 ppi for @2x designs. | Typography / Apple Developer Documentati |
| 13 | Point size based on image resolution of 72 ppi for @1x and 144 ppi for @2x designs. | Typography / Apple Developer Documentati |
| 14 | centered in the regular width on iPad. | Build a UIKit app with the new design -  |
| 15 | Second, provide customization. | Principles of inclusive app design - WWD |
| 16 | Use the ticks closure to specify their location, like I’m doing here for ticks at 60% and 90%. | Build a SwiftUI app with the new design  |
