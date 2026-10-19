# Screen state lifecycle

> Sources: state-first design, NN/g (empty states), Carbon (loading pattern), industry practice.

## 1. Canonical state machine

```
idle     -> FETCH -> loading
loading  -> SUCCESS(empty data)      -> empty
loading  -> SUCCESS(data)            -> success
loading  -> SUCCESS(partial data)    -> partial
loading  -> ERROR(network)           -> offline
loading  -> ERROR(server)            -> error
conflict (collaboration)             -> conflict
```

> Use a **state machine / enum**, not overlapping boolean flags (`isLoading && !isError` goes wrong fast).

## 2. Each state

| State | Must have | Common mistake |
|---|---|---|
| **Idle** | Clear primary action | Treating a "blank form" as idle (it's **empty**) |
| **Loading** | **Skeleton matching the real layout**; shows **after ~200 ms**; cap **~5 s** then switch to progress/timeout | Spinner on a white screen; skeleton flickering on fast networks |
| **Empty** | Explains **why it's empty** + **CTA** + (optional) visual | "No data"; blank screen |
| **Error** | **Specific**, **actionable**, **recoverable** (Retry) | "Something went wrong"; dead end |
| **Partial** | Handles multi-source data with one source failing | Treated as success |
| **Offline** | Replacement content + re-sync later | Endless spinner |
| **Success** | Confirmation with **more than color** | Color change to green only |
| **Conflict** | Conflict resolution (collaboration) | Silent overwrite |

## 3. Skeleton — rules

- **Match the final layout** (same grid, same cell size, same estimated line count) ⇒ avoid layout shift.
- Show **after 200 ms** — avoids flashing on fast responses.
- **Cap ~5 s** — then switch to progress/timeout + retry.
- **Gentle pulse/shimmer**; don't stack a spinner on a skeleton (one signal is enough).
- Keep fixed parts **stable** (avatar, title); skeletonize the variable parts (body, list).
- A11y: skeleton blocks are **`aria-hidden`**, the switching container is **`aria-busy`**, with a **live region** announcing.

## 4. Empty state — anatomy & types

```
Visual (optional) · Header (state) · Explainer (why + benefit) · CTA
```

Always answer 3 questions: **what's happening · why · what next**.

| Type | Context | Design |
|---|---|---|
| **First-time (pending user action)** | User hasn't created anything yet | Introduce what this is, the benefit, CTA to create the first item |
| **No results** | Search/filter finds nothing | Suggest loosening filters, fixing keywords |
| **Cleared** | User deleted everything | Confirm + CTA/undo as needed |
| **Gated / paywall** | Upgrade/permission needed | State the value + upgrade path |

> An empty state is **free onboarding** — first-time users meet it before every other screen.

## 5. Error state — rules

- **Specific** beats generic; **actionable** beats dead-end; **recoverable** beats fatal.
- Field-level: say which field, what's wrong, how to fix; keep what the user already typed.
- Page-level: keep **navigation**, offer **Retry**, offer a contact/help path.
- Don't show raw error codes; log technical detail to monitoring.
- Announce via screen reader (live region).

## 6. Design priority

> **Design the "unhappy path" first** (loading/empty/error) ⇒ the happy path gets better, because these states
> impose the real constraints on layout and copy.

## 7. Checklist

- [ ] Has **idle · loading · empty · error** (+ partial/offline/conflict as needed).
- [ ] Skeleton matches layout, shows after 200 ms, causes no shift.
- [ ] Empty explains + CTA; doubles as onboarding.
- [ ] Error specific + recoverable; no dead ends; keeps entered data.
- [ ] Offline has replacement content.
- [ ] Uses a state machine, not overlapping booleans.
- [ ] States announced to screen readers.
