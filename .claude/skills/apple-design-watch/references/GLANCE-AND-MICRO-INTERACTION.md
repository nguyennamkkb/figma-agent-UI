# Glanceability and micro-interactions — watchOS

> Sources: Apple HIG *Designing for watchOS*, *Playing haptics*, *Digital Crown*, *Always On*, *Action button*.

## 1. Glanceability

- Prioritise **fast, glanceable, single-screen** interactions; keep navigation shallow; use the **Digital Crown** for scrolling and moving between screens; complications are entry points on the watch face; notifications let people act without opening the app.
- **Design unit:** one value or one state per surface. **Icon + number** is the basic unit (for example "AAPL 121.96"); stacked text at most 2–3 lines.
- Gauges: **closed** = ratio; **open + range** = interval (label min/max).
- **The few-seconds rule:** if it cannot be understood in about 3 seconds, the design is wrong. No paragraphs, tables, multiple columns or forms.
- Large/bold type for primary information; secondary text at least 11 pt.

## 2. Offline and context

- Content must be **useful without connectivity** (workouts, travel).
- Update by **context** (time, place, activity) instead of staying fixed.
- Show a **stale / last-updated** state whenever data may be old.

## 3. Feedback

- Every tap or Crown input gets an **instant** (< 100 ms) response: visual plus haptic.
- Feedback is **semantically consistent**: success, warning and error each have their own pattern.
- No silent waiting — the user always knows the input was received.

## 4. Haptics

| Principle | Detail |
|---|---|
| Right moment | Confirm actions, important warnings, workout milestones |
| Right type | Each feedback type keeps its own pattern so people learn it |
| No overuse | Continuous or gratuitous vibration loses meaning and annoys |
| Always a visual twin | Never depend on haptics alone |
| In Always On | Only genuine alerts may interrupt |

## 5. Digital Crown

- The primary **scroll / adjust** axis; precise and does not cover the screen.
- Add a **light haptic** at detents so values can be felt.
- **Always provide a touch alternative** (accessibility and differing habits).

## 6. Action button

- One core function, label ≤ 3 words.
- Let the system teach the gesture; do not repeat instructions.
- Instant feedback so people trust the press registered.

## 7. Always On / dimmed

- When the wrist drops: dim, keep **primary content**, fade secondary content.
- Avoid changes or animation as Always On toggles.
- During workouts, primary metrics stay legible when dimmed.

## 8. Checklist

- [ ] One idea per surface; understood in about 3 seconds.
- [ ] Large type, little text; labels ≤ 3 words.
- [ ] Gauge type matches the data; labelled when needed.
- [ ] Legible when tinted or dimmed; never color alone.
- [ ] Offline content exists; a stale state exists.
- [ ] Every tap gets feedback in < 100 ms; haptics have a visual twin.
- [ ] Crown has detent haptics and a touch alternative.
- [ ] Action button: one core function, label ≤ 3 words.
- [ ] Always On: correct dimming, nothing distracting.
