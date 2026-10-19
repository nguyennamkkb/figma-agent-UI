# Compatibility, connectivity & iPhone ↔ watchOS sync

> Distilled from WWDC21 *There and back again: Data transfer on Apple Watch* (Anne Hitchcock),
> WWDC26 *watchOS Group Lab*, WWDC25 *What's new in watchOS 26*, WWDC24 *Bring your Live Activity to Apple Watch*.
> **First principle: choose the tool by** *data type → source/destination → whether there is a companion →
> when it must arrive*.

## 1. Compatibility

| Dimension | State | Design implication |
|---|---|---|
| **Paired iPhone** | Default | Can use WatchConnectivity; optimize with data preloaded on the phone |
| **Independent Watch App** (watchOS 6+) | No companion needed | Never **assume** a phone exists; every primary flow must run standalone |
| **Family Setup** (watchOS 7+) | Watch of a child/person without an iPhone | ❌ **Don't use WatchConnectivity** (no companion) → use iCloud/CloudKit/URLSession |
| **Cellular** | Series 3+ | Can reach the network on its own; design for Wi-Fi/cellular/offline alike |
| **arm64 architecture** | Series 9+, Ultra 2 (watchOS 26+) | Enable **Standard Architectures**; watch `Float/Int` & pointer math |
| **No Watch app** | iPhone app still "present" on the watch | Live Activity (automatic), controls from the iPhone app, forwarded notifications, lock screen widgets |
| **API newer than the OS** | watchOS 26/27 | **Availability check** + fallback (e.g. a configurable widget must check the version before returning an empty array) |
| **Foundation Models (27)** | Network-only | Check availability/entitlement; always have a fallback |

**Experience ladder:** complication/widget → notification → Live Activity → control → full app.
Don't force every use case into "an app"; many use cases only need **system experiences**.

## 2. Choosing the right tool for data sync

| Tool | Data type | Needs companion? | Family Setup | Delivery timing | Notes |
|---|---|---|---|---|---|
| **Keychain + iCloud Sync** | small, sensitive, rarely changing (token, preference) | Not needed | ✓ | When network/battery allow | `synchronizable=true`; can be turned off by the user; not available in every region |
| **Core Data + CloudKit** | structured data, DB | Not needed | ✓ | Not instant | Use **multiple configurations** to **trim** data for the watch |
| **WatchConnectivity** | data **only on one device**, optimizing the paired experience | **Required** | ✗ | Background: not instant | "Like sending a letter" |
| **URLSession (background)** | server calls, large downloads | Not needed | ✓ | Per system conditions | **Prefer** over foreground |
| **URLSession (foreground)** | very short work while the user interacts | Not needed | ✓ | Immediately | Timeout ~**2.5 minutes**; drains battery |
| **Sockets (HLS/WebSocket)** | streaming audio | Not needed | ✓ | During the audio session | Only within an active streaming audio session |

## 3. WatchConnectivity — details

### 3.1 Requirements & setup
- Only works when both devices are **within Bluetooth range or on the same Wi-Fi**.
- **Activate the session as early as possible** (app/extension delegate at finish launching) to receive data immediately.
- Session delegate callbacks run on a **non-main serial queue** → all UI updates must **hop back to main**.

### 3.2 Four mechanisms (+ 1 special)

| Mechanism | Nature | Reachability? | Use when |
|---|---|---|---|
| **applicationContext** | **one** dictionary, sent in background, newer **overwrites** older, ready when the app wakes | No | Frequently updated content where only the **latest value** matters |
| **transferUserInfo** | **queued** dictionaries, sent **in order**, cancellable | No | Event streams that must arrive complete and in order |
| **transferFile** | queued files, sent when conditions allow; lands in the **document inbox** | No | Images/assets/files |
| **sendMessage** | interactive, **with reply**, requires reachability | **Yes** | Immediate question–answer, instant commands |
| **transferCurrentComplicationUserInfo** | **prioritized** user info for complications, fastest within the **budget** | No | Updating complications from the phone |

### 3.3 Critical details (easy to get wrong)

- **The file inbox is deleted as soon as `didReceive file` returns** → you must **move/process synchronously** in the callback;
  handling the file asynchronously ⇒ **the file is gone**.
- **sendMessage**: keep messages **small**; **always include a reply handler**; the receiver must implement the correct variant
  of the delegate **with a reply handler**, otherwise it fails.
- **transferCurrentComplicationUserInfo** out of budget ⇒ automatically falls back to the regular `transferUserInfo` queue;
  there is an API to check the remaining budget.
- **Asymmetric reachability:** the WatchKit extension is only reachable in the **foreground** or high-priority background
  sessions (long-lived); an iOS app **can be woken in the background** to receive messages ⇒ **iOS is reachable
  far more often**. Never design assuming the watch is always reachable.
- **Don't use WatchConnectivity for Family Setup** (no companion).

### 3.4 Widget/complication sync (new)
- **APNs push updates** (watchOS 26) — the server pushes widget updates.
- **Watch Connectivity widget updates** (watchOS 27) — pushed from iPhone to watch ⇒ keeps iOS ↔ watch in sync.
- **Live Activity** syncs to the watch **automatically** (no separate token needed); still counts against the **budget**.

## 4. Background execution & budgets

| Item | Value / rule |
|---|---|
| Background refresh (with a complication on the active watch face) | Max **4 tasks/hour** ⇒ space them **≥ 15 minutes** apart |
| Background URLSession | Configure `background(withIdentifier:)`, `sendsLaunchEvents = true`; for large data set `isDiscretionary = true` |
| Handling tasks | `WKExtensionDelegate.handle(_ backgroundTasks:)` → **always mark the task completed** as soon as done (otherwise the app is terminated for exceeding background limits) |
| Foreground URLSession | Timeout ~**2.5 minutes**; only for very short tasks |
| Widget budget | Watch face ~**15–20 minutes** while active; Smart Stack by viewing frequency |
| Live Activity | Has its own budget; high-frequency on request; updates pause with wrist down but raising the wrist shows the latest |
| Principle | **Always ask "can this be done in the background?"** before using foreground |

## 5. Syncing UI/state between the two apps (in practice)

1. **Single source of truth:** pick the "right" home for each data type (phone, watch, or cloud) — avoid two parallel sources drifting apart.
2. **No redundant fetching:** if the phone already has fresh data, push it to the watch via **applicationContext/userInfo** so the watch **launches with data ready** (feels fast, saves battery/network).
3. **Sync only what the watch needs:** use Core Data **multiple configurations** to trim; the watch is not a copy of the phone.
4. **Pick the mechanism by data semantics:** *latest* → applicationContext; *complete & ordered* → userInfo; *file* → transferFile; *immediate Q&A* → sendMessage.
5. **Handle UI on the main queue** (delegates aren't on main).
6. **End states:** widgets/complications/Live Activities have **stale/placeholder** states; offline still shows content.

## 6. Failure modes

| Mistake | Why it's wrong |
|---|---|
| Assuming the watch is always reachable | Reachability is asymmetric; the watch is usually not reachable |
| Using WatchConnectivity for Family Setup | No companion ⇒ never works |
| Handling the inbox file asynchronously | The file is deleted when the callback returns |
| sendMessage without a reply handler / missing delegate variant | Send/receive failure |
| Syncing a whole large DB to the watch | Watch runs out of space/battery; poor experience |
| Two state sources (phone + watch computing independently) | Data drift, hard to debug |
| Using foreground URLSession for long work | 2.5-minute timeout ⇒ failure |
| Forgetting to mark background tasks completed | App terminated for exceeding background limits |
| Scheduling background refreshes close together (< 15 minutes) | Rescheduled, slower |
| Updating UI directly in a delegate callback | Wrong queue ⇒ crash/no update |
| No fallback when a new API/complication is missing | Breaks on older devices/OS |

## 7. Compatibility & sync checklist

- [ ] Determine whether the app has a companion / is independent / Family Setup; **don't** use WC for Family Setup.
- [ ] Pick the tool per the §2 table; record the source of truth for each data type.
- [ ] Activate the WC session early; handle UI on the main queue.
- [ ] applicationContext for "latest"; userInfo for streams; process files **synchronously** in the callback.
- [ ] Small sendMessage + reply handler + correct delegate variant.
- [ ] Complication: `transferCurrentComplicationUserInfo` + budget check; fallback when exhausted.
- [ ] Widget: pick the update path (timeline / APNs 26 / Watch Connectivity 27) + respect the budget.
- [ ] Background: background URLSession + `sendsLaunchEvents`; task completed; refresh ≥ 15 minutes & ≤ 4/hour.
- [ ] Trim data with Core Data configurations; the watch only receives what it needs.
- [ ] Availability check + fallback for watchOS 26/27 APIs; test on real devices + Device Hub; test **without the debugger attached**.
