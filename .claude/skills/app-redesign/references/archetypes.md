# Archetypes, mandatory states, diagnosis

## 1. Archetypes

`analyze.py` assigns one per family from the frame name and its texts; correct it by hand when wrong. Redesign the archetype once (master), clone it for every screen of that type.

| Archetype | Typical screens | Code |
|---|---|---|
| splash | splash, app open | SCR |
| language | first-open language, settings language | SCR |
| onboarding | OB pages, setting up / all set | SCR |
| paywall | IAP, subscription, premium | SCR |
| coin-purchase | coin / credit packs | SCR |
| home | tabs, discover, dashboard | SCR |
| template-detail | template / preset preview with Try now | SCR |
| tutorial | coach marks, "1 of 2" steps | SCR |
| picker | photo / file picker | SCR |
| crop | crop, rotate, ratio | SCR |
| setup | upload slots, options, Generate | SCR |
| processing | generating, swapping, removing, % progress | FBK |
| result | result, downloading, saved, share | SCR |
| report | report content steps | SCR |
| editor | photo editor, change background, filters | SCR |
| settings | settings list, rate, feedback | SCR |
| dialog | permission, confirm, error, no internet, discard | FBK |
| ad | native full, interstitial, app open | FBK |

## 2. Mandatory states (check the baseline; propose missing ones in the plan, never add silently)

| Archetype | States a complete flow has |
|---|---|
| home | default, loading (skeleton), empty/offline if data is remote |
| picker | default, selected (count), permission denied |
| setup | empty, filled, validation toast (e.g. "please upload an image"), disabled CTA with reason, ready (cost on CTA) |
| processing | in progress (%), time-out / error dialog, cancel confirm |
| result | default, downloading, saved toast, share sheet, regenerate confirm |
| paywall | default plan selected, other plan, restore, purchase failed |
| language | default, selected (check enabled) |
| dialog | one frame per trigger |
| any with ads | with ad, no-ads variant (ads-board rules) |

## 3. Diagnosis checklist (for `plan.md` §3)

- Junk and duplicates: test/wiring sections, seeds, stray images, identical frames (`analysis.md` → Duplicates).
- Names: repeated frame names, default names (`Frame 12`), no codes.
- Flat screens (image only, `flat: true`): rebuild needed, content read from the picture.
- Design system: 0 variables / few styles / components detached; hex colours everywhere (`audit_design`).
- CTA: hand-built buttons (`localCtas`), gradient in dialogs, destructive in accent, several primaries.
- Copy: typos ("Regenrate"), inconsistent casing, placeholder copy left in ("Title", "Label", lorem).
- States missing per §2; flows without links (no connectors or prototype).
- Ads: placements per screen, ad screens without a no-ads twin.
