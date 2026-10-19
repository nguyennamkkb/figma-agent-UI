# Feedback & timing

> Sources: Nielsen (response time limits, from Miller 1968), mobile performance practice.

## 1. Three response thresholds

| Threshold | Psychological meaning | Corresponding design |
|---|---|---|
| **0.1 s** | Feels **instant**, "direct manipulation" | No indicator needed — just show the result (highlight, haptic, pressed state) |
| **1 s** | Keeps the **train of thought** unbroken; the user **notices** the delay | Start needing a "working" indicator |
| **10 s** | Keeps **attention** on the task | Needs a **determinate progress + cancel**; past 10 s the user switches away |

## 2. Rules for applying on mobile

- **< 100 ms:** respond instantly to every tap (visual + haptic) — never leave the user wondering "did it register?".
- **100 ms – 1 s:** no spinner needed, but if it **could** exceed 1 s, show an indicator.
- **> 1 s:** skeleton/spinner; **> 10 s:** determinate progress + cancel + estimate.
- **Occlusion:** keep feedback **in place** (inline) instead of blocking the whole screen for small tasks.
- **Semantic consistency:** same action type ⇒ same feedback type (vibration/sound/visual).

## 3. Loading & perceived speed

- **First load:** show the first interactive content in **< 5 s** (long-term goal ~2 s, mid-range device on 3G).
- **> 3 s** ⇒ abandonment risk rises sharply (industry data: ~40% leave past 3 s).
- **Feels fast:** skeleton + progressive loading + showing available content first.
- **Not too fast:** changes that are too abrupt get missed ⇒ include a short animation or a minimum stable state.

## 4. Animation & frame budget

- Per-frame budget **16 ms** (60 fps); ~6 ms logic processing ⇒ ~**10 ms/frame** for render.
- UI transitions **~150–300 ms** for small changes, up to **~400 ms** for full-screen transitions; ease-out on enter, ease-in on exit.
- Every motion must **have a purpose** (explaining a state change), never decoration.
- Respect **Reduce Motion**.

## 5. Control states while waiting

- **Button loading:** keep the **label** + spinner; disabled but **not hidden**; prevents double-submit.
- Re-enable when done **or** on error (to allow retry).
- Long tasks: offer **cancel**; if it can't be cancelled, explain why.

## 6. Checklist

- [ ] Every tap gets feedback in **< 100 ms**.
- [ ] Operations > 1 s have an indicator; > 10 s have progress + cancel.
- [ ] No white screen/indeterminate spinner for work of known duration.
- [ ] Loading buttons keep their label; prevent double-submit.
- [ ] Animations ~150–300 ms (≤ ~400 ms full-screen), purposeful; 60 fps.
- [ ] Respect Reduce Motion.
