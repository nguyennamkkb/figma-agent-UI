# Naming

| Object | Pattern | Example |
|---|---|---|
| Page | `<NN> - Ads` | `07 - Ads` |
| Version section | `<NN> · <Flow> <version>` | `07 · First Open V2.0.0` |
| Screen (row 1) | exactly the spec's `name` (as written in the flow) | `302a_NoAds - OB2a`, `C2B - OB2` |
| Screen with Native Full | doc name + ` - Native Full` | `C4 - OB4 - Native Full` |
| No-ads twin (row 2) | doc name + ` · No Ads` | `307 - OB6 · No Ads` |
| Screen without ads cloned in row 2 | same name as row 1 | `302b_NoAds - OB2b` |
| Ad layer in a screen | `Ad · <format>[ · <layout>]` | `Ad · Native · Header-Media-CTA`, `Ad · Inter` |
| Interstitial placeholder text | title `Inter Ads` (`Inter Ads · Show bù` for a fallback show), second line = screen name | `Inter Ads` / `102 - Inter Splash` |
| Background image | `<codes of the screens using it>_bg_<key>`; V1.x code first, then the newer flow's code | `302b_C3_bg_ob3`, `101_A1_bg_splash` |
| Other screen asset | `<codes>_<key>` | `308_gift` |
| Shared ad asset | `AST-4xx_<key>` | `AST-402_ad_media_16x9` |
| Arrow | `<from code> → <to code>`; row 2 `No Ads · <from> → <to>` | `No Ads · 202 → 301` |
| Row label | `Row label · Có quảng cáo` / `Row label · Không quảng cáo` | |
| Note | `Note · <title>` | `Note · Lệch tài liệu` |

Typos of the flow stay in the spec unless the user agrees to normalise them; record the decision in the spec's notes.
