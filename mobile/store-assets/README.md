# Store assets — Shop Genuine

Everything Google Play asks for, except the things only you can supply.

| File | Play Console field | Spec | Status |
|---|---|---|---|
| `play-icon-512.png` | App icon | 512×512, 32-bit PNG with alpha, ≤1024 KB | ready (214 KB) |
| `play-feature-graphic-1024x500.png` | Feature graphic | 1024×500, no alpha | ready |
| `screenshots/01-05*.png` | Phone screenshots | 1080×1920, min 2, max 8 | ready (5) |
| `play-listing.md` | Name, short + full description | 30 / 80 / 4000 chars | drafted |
| `data-safety.md` | Data safety form | — | drafted from the code |
| `privacy-policy.md` | Privacy policy URL | must be a live URL | **needs hosting + your details** |

## Regenerating the screenshots

They were captured against the **local** server, because production only has one
product and a one-product store photographs badly. Once the catalogue is live on
the server you can retake them against production.

    # local API + emulator running, app installed
    python3 scripts/compose-screenshots.py <raw-dir> store-assets/screenshots \
      sc-home sc-search sc-added sc-cart sc-stores

`compose-screenshots.py` exists because **raw captures are rejected**: Play
refuses any image whose longest side is more than twice the shortest, and this
phone is 1344×2992 (2.23). The script trims the status and gesture bars, then
centres each capture on 1080×1920 in the app's own background colour.

## Still outstanding — only you can do these

1. **Host the privacy policy** and fill in every `[PLACEHOLDER]`, including the
   Grievance Officer that Indian law requires. Play will not accept the
   submission without a working URL.
2. **A Google Play Console account** — $25 one-off, and identity verification
   can take several days. Worth starting before anything else.
3. **A public support email** for the listing. It is shown to everyone, so use a
   support address rather than a personal one.
4. **Confirm the data-safety answers** match reality before submitting. Google
   compares the declaration against observed traffic and suspends apps that
   disagree.
