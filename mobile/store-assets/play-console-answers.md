# Play Console — answers for Shop Genuine

App: **Shop Genuine**, `com.shopgenuine.app`, created 2026-11-05 in the Desire Div account
(8035388496617662284) and **live on Google Play since 2026-11-07**.

## Owner: moving to the client's account (2026-11-16)
The app is being transferred to the client's Play account **"genuine revolution(p)"**
(personal account, ID 6375082674629564543, owner Rajat Gulia, founder.arvigroup@gmail.com), so
the store shows the client as the developer instead of Desire Div.
- 2026-11-16: Desire Div sent the transfer request, and the client accepted it. Google completes it
  within 2 business days and notifies both accounts.
- Installs, reviews, the store listing and every App content answer below move with the app.
  Test groups and Desire Div's reports don't.
- After the transfer, manage the app from the client's account. Desire Div loses access.
- The client's account is a personal account created 2026-11-09. Google requires new personal
  accounts to run a closed test (12 testers, 14 days) before production releases, and doesn't say
  whether a transferred live app is exempt. If Play blocks a new store upload, run that test.
  Over-the-air updates are unaffected.
- The upload key (held by EAS) and Google's app-signing key both stay the same, so later builds
  upload as before.

Done in Play Console (2026-11-05/06, all saved): privacy policy, sign-in details, ads, content rating (Everyone / PEGI 3), target audience 18+, data safety, government/financial/health, advertising ID (No), Production countries (India only), and the production release 1.0.0 (versionCode 4). **Sent for review on 2026-11-06** (10 changes, full rollout, India; managed publishing off, so it goes live on approval). Also done earlier: app created; privacy policy URL; store listing
(name, short and full description, icon, feature graphic, 6 screenshots — saved as a
draft); category **Shopping**; contact email `connect.genuinenutrition@gmail.com`
and website `https://shopgenuine.online`; sign-in details name, email and reviewer
instructions.

Every answer below was checked against the app's code and the store build.
On the Dashboard, open **View tasks** under "Provide information about your app" to
reach each form. Press **Save** at the bottom of each one.

## 1. Sign in details (already open, half filled)
- Type the reviewer **password** in the Password box.
- Tick **"Sign in details in this declaration provide full access…"** — true: no paid or premium content.
- Press **Add**, then **Save**.

## 2. Store listing — AI asset declaration
Store listings → Default store listing → **Next** (Review step).
- The screenshot captions and layout were made with an AI tool (Claude), from real
  screenshots of the app. If the client's logo was also made with an AI image tool,
  that counts too. Choose **"Label assets as created or edited using AI"** and label
  the 6 screenshots (and the icon/feature graphic if the logo was AI-made).
- Press **Save**.

## 3. Ads
**No, my app does not contain ads.**

## 4. Content rating
- Email: the Desire Div email. Category: **All other app types** (Utility, Productivity, Communication, or Other).
- Violence, fear, sexuality, language, drugs, alcohol, tobacco, gambling, crude humour: **No** to all.
- Users interact or share content with each other (chat, posts, reviews): **No**.
- Shares the user's current location: **No**.
- Buys digital goods: **No**. (If asked about physical goods: **Yes** — it sells groceries and cosmetics.)
- Expected rating: **Everyone / PEGI 3 / IARC 3+**. Submit.

## 5. Target audience and content
- Target age group: **18 and over** only (the privacy policy says the app is not for under-18s).
- "Could your store listing unintentionally appeal to children?" **No**.

## 6. Data safety
**Overview**
- Collects or shares required user data: **Yes**
- All user data encrypted in transit: **Yes**
- Account creation: **Username, password, and other authentication** (email + password, plus a one-time email code at sign-up)
- Delete account URL: **https://shopgenuine.online/delete-account**
- Way to delete some data without deleting the account: optional — left unanswered (a Yes needs its own web page)

**Data types** — every one: Collected **Yes**, Shared **No**, Processed ephemerally **No**, **Required**

| Section | Type | Purposes |
|---|---|---|
| Personal info | Name | App functionality, Account management |
| Personal info | Email address | App functionality, Account management |
| Personal info | Phone number | App functionality (delivery contact) |
| Personal info | Address | App functionality (delivery) |
| Financial info | Purchase history | App functionality |
| App activity | App interactions | App functionality (cart, saved items) |
| Device or other IDs | Device or other IDs | App functionality (notifications, app updates) |
| App activity | In-app search history | App functionality — **processed ephemerally: Yes** (search words are sent to find products and never stored; not shown on the listing) |

Do **not** tick Payment info (Razorpay handles card/UPI; the app never sees it), Location,
Photos, Contacts, Crash logs or Diagnostics (crash reporting is off).

## 7. Other declarations
- Advertising ID: **No** (the build has no AD_ID permission)
- Government apps: **No**
- Financial features: **My app doesn't provide any financial features**
- Health: **My app doesn't have any health features**
- News app: **No**

## 8. Release (Production)
Test and release → **Production** → Create new release.
- Play App Signing: keep **Google-generated key** (the default).
- Upload: drag `mobile/ShopGenuine-1.0.0-play.aab` (about 84 MB, version 1.0.0, versionCode 4) into the box.
  (Claude cannot upload it: its browser upload limit is 10 MB.) Do not upload versionCode 3:
  its privacy link points at the API subdomain, which no longer serves pages.
- Release name: `1.0.0`. Release notes: `First release of Shop Genuine.`
- Countries / regions: **India** only — delivery is India only.
- Save → Next → fix anything Play lists → **Send for review** (Publishing overview).

**Before sending for review:** the Namecheap DNS fix must be done, so the privacy
policy at shopgenuine.online opens for Google's reviewers.

## Account-level
"Declare your trader status": the client's account has already declared itself a trader.
(Desire Div's own declaration, due February 2027, concerns its other apps only.)
