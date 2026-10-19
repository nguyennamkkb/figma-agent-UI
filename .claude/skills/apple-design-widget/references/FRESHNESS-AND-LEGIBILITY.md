# Freshness, sizing and legibility

> Sources: Apple HIG *Widgets*, *Live Activities*; WWDC25 *What's new in widgets*; WWDC26 *WidgetKit foundations*.

## 1. Freshness

| Mechanism | When to use | Notes |
|---|---|---|
| Timeline + reload policy | Scheduled data | Give entries an expiration so a refresh is guaranteed |
| Reload from the app | New data is available | Reload the affected timeline immediately |
| Push (APNs) | Server-driven data | News, prices, scores |
| Phone → watch | Watch connectivity | Keeps both devices in sync |
| Relevance | Contextually right content | Time, place, activity |

**Budget:** watch-face complications refresh roughly every 15–20 minutes while in use; Smart Stack follows view frequency; Live Activities have their own budget. Never update continuously, and never leave data silently stale.

## 2. Sizing

- Families: `systemSmall`, `systemMedium`, `systemLarge`, `systemExtraLarge`, plus accessory `circular`, `rectangular`, `inline` (and `corner` on watchOS).
- A larger family **adds context along an axis** — it does not just enlarge the type.
- visionOS only: widget templates scale 75 %–125 %; design for both extremes.

## 3. Legibility

- Type ≥ 11 pt; primary information at medium weight or heavier.
- Build hierarchy with size, weight, line height and letter spacing; the primary value is the largest element, secondary content smaller and sparse.
- Margins are **concentric** with the corner radius: 16 pt standard, 11 pt when grouping content.

## 4. Rendering modes

- Use semantic colors so the widget follows light, dark and increased-contrast appearances.
- Tinted and accented rendering: mark accent content with `widgetAccentable`, choose `widgetAccentedRenderingMode` (for example primary, accent, desaturated) for images.
- Never communicate with color alone; check full-color, tinted, StandBy and dimmed Always On.

## 5. Placeholder and states

- The placeholder keeps the layout stable so nothing shifts when data arrives.
- Show a stale / last-updated state when data may be old.
- End Live Activities on time; never leave one orphaned.

## 6. Checklist

- [ ] The right update path is chosen and the budget respected.
- [ ] A stable placeholder and a stale state exist.
- [ ] Every supported family works without breaking.
- [ ] Type ≥ 11 pt with a clear hierarchy.
- [ ] Concentric margins.
- [ ] Readable in light, dark, tinted, StandBy and dimmed; never color alone.
