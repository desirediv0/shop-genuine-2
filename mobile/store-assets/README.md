# Store assets — Shop Genuine

Everything Google Play asks for, except the things only you can supply.

| File | Play Console field | Spec | Status |
|---|---|---|---|
| `play-icon-512.png` | App icon | 512×512, 32-bit PNG with alpha, ≤1024 KB | ready — full logo (2026-11-03) |
| `play-feature-graphic-1024x500.png` | Feature graphic | 1024×500, no alpha | ready |
| `screenshots/01-06*.png` | Phone screenshots | 1080×1920, min 2, max 8 | ready (6, live data, new design) |
| `play-listing.md` | Name, short + full description | 30 / 80 / 4000 chars | ready (Grocery + Cosmetics, COD) |
| `data-safety.md` | Data safety form | — | drafted from the code |
| `privacy-policy.md` | Privacy policy URL | must be a live URL | **needs hosting + your details** |

## Regenerating the screenshots

Retaken 2026-11-05 against **production** with the release build. Captions
sit above each capture on the app's "All stores" colour mesh:

    # release APK installed on the emulator, captures saved as <raw-dir>/sc-*.png
    python3 scripts/compose-screenshots.py <raw-dir> store-assets/screenshots \
      "sc-home=Every Genuine store in one app" "sc-product=Genuine products, honest prices" \
      "sc-deals=Real discounts, shown upfront" "sc-categories=Browse every category" \
      "sc-cart=See what you save on every order" "sc-search=Search the whole catalogue"

`compose-screenshots.py` exists because **raw captures are rejected**: Play
refuses any image whose longest side is more than twice the shortest, and this
phone is 1344×2992 (2.23). The script trims the status and gesture bars and
places each capture, scaled and rounded, below its caption on 1080×1920.

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
