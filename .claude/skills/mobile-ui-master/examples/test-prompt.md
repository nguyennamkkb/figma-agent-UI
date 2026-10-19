# Test prompt for mobile-ui-master

Use `mobile-ui-master` to design the following iOS mobile flow.

I will provide:
- one use-case document;
- one functional-requirement document;
- optional wireframe/reference image;
- current design-system tokens if available.

Your task:
1. Extract product truth and show a compact Use Case Lock.
2. Separate `LOCKED`, `FLEXIBLE`, and `UNKNOWN` facts. Do not derive layout from the use case yet.
3. Before choosing components, define the **First Glance**: what should win attention, what should be understood immediately, and what should not compete.
4. Define the intended **Scan Trace** and focal/supporting/peripheral attention hierarchy.
5. Internally explore at least 3 directions that differ in **mental model, attention flow, composition, or interaction** — not merely color/card styling.
6. Select one coherent direction. Explain the perceptual thesis and one memorable idea.
7. Only after selection, turn the idea into robust state/interaction and screen architecture.
8. Use HIG, accessibility, screen architecture, and design-system references as **critics of the proposed idea**, not as automatic layout generators.
9. Produce an implementation-ready iPhone spec and intentional iPad adaptation.
10. Include loading, empty, error, disabled, processing, and success states where applicable, including how attention changes in those states.
11. Finish with both **Use-case Fidelity** and **Perceptual Fidelity** gates plus engineering acceptance criteria.

Important:
- The goal is not to reproduce the wireframe.
- Treat the wireframe/reference image as evidence unless its layout is explicitly mandatory.
- Do not select `hero`, `grid`, `cards`, `F-pattern`, `Z-pattern`, etc. just because the screen resembles a known category.
- Think first; use patterns only as vocabulary after the attention model is understood.
