# App Store listing and answers — Shop Genuine (iOS)

Everything App Store Connect asks for, in the order it asks. Prepared 2026-11-17,
before the Apple Developer account exists. Keep it matching what the live app does:
Apple rejects listings that describe features the app doesn't have.

The text matches the Play listing (`play-listing.md`) so both stores say the same thing.

**Status (2026-11-24).** The app exists in App Store Connect: Apple ID **6838684428**,
account Rajat Gulia (team D524D3RR9K, Individual). Done on the 1.0.0 version page:
screenshots, promotional text, description, keywords, support and marketing URLs,
copyright, reviewer user name, notes and contact. Also done: subtitle, categories, content
rights, age rating (4+), privacy policy URL, the App Privacy answers below, price (Free),
availability (India only), and Mac / Vision Pro availability **off** (the app is only built
and tested for iPhone). Done by hand in App Store Connect: the reviewer **password**, and
**Publish** on App Privacy, which agrees that the answers are accurate.

**Submitted for review on 2026-11-24 at 5:43 PM IST** with build 1.0.0 (4) and **Manually
release this version** selected: after approval, the app goes live only when someone presses
**Release this version** in App Store Connect. Build 3 was rejected at upload (ITMS-90683, missing
NSPhotoLibraryUsageDescription), and build 4 fixes that. Rajat is the TestFlight tester (internal
group "Team (Expo)"). The first store build (1.0.0, build 3, EAS bec24d3a) was checked:
channel `production`, live API, push entitlement `production`, iPhone only.

---

## 1. New app (App Store Connect → Apps → + → New App)

| Field | Value |
|---|---|
| Platform | iOS |
| Name (limit 30) | `Shop Genuine` — if Apple says the name is taken, use `Shop Genuine: Grocery & More` |
| Primary language | English (U.S.) |
| Bundle ID | `com.shopgenuine.app` (EAS registers it with the first build) |
| SKU | `shopgenuine-ios` (internal only, never shown) |
| User access | Full access |

## 2. App information

| Field | Value |
|---|---|
| Subtitle (limit 30) | `Authentic grocery & cosmetics` |
| Category | Primary **Shopping**, secondary **Food & Drink** |
| Content rights | **Yes**, the app shows third-party content (brand product photos and names), and we have the rights to use it as a retailer |
| Age rating | **4+**, see section 6 |
| Privacy policy URL | `https://shopgenuine.online/privacy-policy` |

## 3. Pricing and availability

- Price: **Free**. The app has no in-app purchases: it sells physical goods, which
  Apple allows to be paid outside the App Store (guideline 3.1.3(e)).
- Availability: **India only**, the same as Google Play. Delivery is India only.

## 4. Version 1.0 page

**Screenshots.** App Store Connect now requires the **6.3"** size ("iPhone with Dynamic
Island (medium display)", 1206×2622) and uses it for every iPhone. Upload all six from
`store-assets/app-store-screenshots-6.3/` in this order. They are the 6.9" set
(`app-store-screenshots/`, 1320×2868, made by `scripts/compose-screenshots.py --apple`)
scaled down with Lanczos, with one edge column trimmed. The 6.9" set fits the optional
"large display" slot, but isn't uploaded, so there is only one set to keep current:

1. `01-home.png` — Every Genuine store in one app
2. `02-product.png` — Genuine products, honest prices
3. `03-category.png` — Groceries delivered across India
4. `04-categories.png` — Browse every category
5. `05-cart.png` — See what you save on every order
6. `06-search.png` — Search the whole catalogue

Apple scales this set for other iPhones, so no other sizes are needed. The app
is iPhone-only (`supportsTablet: false`), so no iPad screenshots are needed either.
They were taken on 2026-11-17 against the live shop, on an iPhone 17 Pro Max simulator.

**Promotional text** (limit 170; can be changed any time without a new version)

```
Authentic grocery and cosmetics from authorised distributors, with honest prices and Cash on Delivery across India.
```

**Description** (limit 4000)

```
Shop Genuine is an Indian marketplace for products you can trust. Every item is
sourced through authorised distributors and checked before it reaches you, so
what arrives is the real thing: not a lookalike, not expired stock.

TWO STORES, ONE APP

Switch between our Genuine stores and the whole app follows you. The
categories and the products all change with it:

• Genuine Grocery: everyday staples, atta, rice, oils, dals, dairy, snacks
• Genuine Cosmetics: skincare, fragrances and beauty

WHY SHOP GENUINE

• Authentic stock only, from authorised distributors
• Honest pricing, with the discount shown on every product
• Delivery across India
• Pay with Cash on Delivery

BUILT TO BE QUICK

• Search across the whole catalogue, or browse every category
• Add to your cart before you sign in; it carries over when you do
• Save anything to your wishlist for later
• Track every order from placed to delivered, with notifications at each step
• Save multiple delivery addresses and pick one at checkout
• Cancel an order yourself while it is still being prepared

YOUR ACCOUNT, YOUR CONTROL

Sign up with your email and a one-time code. You can reset your password,
manage your saved addresses, and delete your account from inside the app at any
time, with no email to support required.

Orders you have already placed are kept for invoicing and tax purposes as the
law requires, but your personal details are removed from them.

QUESTIONS

Email us any time and we will come back to you.
```

The "notifications at each step" line needs iOS push working in the store build (an
APNs key, set up with the first EAS build). Check it on a real iPhone before submitting.
If push isn't ready, remove that part of the line.

**Keywords** (limit 100, commas, no spaces; Apple already searches the app name, so
"shop" and "genuine" aren't repeated)

```
grocery,cosmetics,atta,rice,oil,dal,snacks,skincare,perfume,beauty,delivery,authentic,india
```

| Field | Value |
|---|---|
| Support URL | `https://shopgenuine.online/contact` |
| Marketing URL | `https://shopgenuine.online` |
| Copyright | `2026 Arvi Consumer Private Limited` |
| Version | 1.0.0 (from `app.json`) |

## 5. App Review information

| Field | Value |
|---|---|
| Sign-in required | Yes |
| User name | `demo1@shopgenuine.test` (the same reviewer account as Google Play) |
| Password | *(Akash has it; never commit it here)* |
| Contact | Rajat Gulia, +91 80532 10008 (the number on the website), founder.genuinenutrition@gmail.com |

**Notes.** Rewritten on 2026-11-25 after Apple's Guideline 2.1 "Information Needed" reply on build 4.
That reply asked for a screen recording on a real iPhone (launch, sign-up, sign-in, account deletion),
the app's purpose and audience, how to use it, the external services, regional differences and any
licences. Attach the recording under "Attachment" on the version page.

```
ABOUT THE APP
Shop Genuine is the shopping app of Arvi Consumer Private Limited, a retailer in India (https://shopgenuine.online). Customers browse and order packaged groceries and cosmetics, sourced through authorised distributors, and we deliver them to their address. Target audience: adult shoppers in India. The problem it solves: fake and expired products are common when buying online in India. Everything sold here comes from authorised distributors, at honest prices.

HOW TO USE THE APP
No setup or sample files are needed.
- Browsing, search, the cart and the two stores (Grocery and Cosmetics, switched with the chips at the top of Home) work without an account.
- Sign in: Account tab > Sign in, with the demo account above.
- Sign up: Account tab > Sign in > Create an account. A 6-digit code is emailed to verify the address.
- Checkout: Cart > Checkout > choose a delivery address > Cash on Delivery > Place order. No card is needed. Orders placed with the demo account are cancelled and never delivered.
- Orders: Account tab > Orders. An order can be cancelled while it is still being prepared.
- Account deletion: Account tab > Delete my account > enter the password > type DELETE > Delete forever.
The app sells physical goods only. It has no digital content, subscriptions or in-app purchases.

SCREEN RECORDING
Attached to this submission. Recorded on an iPhone running the latest iOS, starting from launching the app: browsing, search, cart, sign-up, sign-in, checkout and account deletion.

EXTERNAL SERVICES
- Our own server (api.shopgenuine.online): catalogue, accounts, carts and orders
- DigitalOcean Spaces: product images
- Brevo: verification codes and order emails
- Expo (expo.dev): order-status push notifications through Apple Push Notification service, and app updates
- Razorpay (payment gateway): built in but currently switched off, so Cash on Delivery is the only payment method
No AI services, analytics, advertising or tracking SDKs.

REGIONS
The app is available in India only and works the same everywhere in India. Prices are in Indian rupees and delivery is within India.

REGULATED INDUSTRY AND THIRD-PARTY MATERIAL
Shop Genuine is an online retail store for packaged groceries and cosmetics. It has no medical, financial, gambling, alcohol or tobacco features. Product names and images belong to their brands and are shown by us as a retailer of those products.
```

**Keep the reviewer account working.** Apple signs in on every update too. If a
reviewer deletes it, recreate it before the next submission.

## 6. Age rating questionnaire

Every content question (violence, sexual content, profanity, horror, drugs, alcohol,
tobacco, gambling, contests, medical information) → **None / No**.

| Question | Answer | Why |
|---|---|---|
| Unrestricted web access | No | The privacy policy link opens Safari; there is no in-app browser |
| User-generated content | No | Customers can't post reviews, messages or anything other users see |
| Messaging or chat | No | |
| Advertising | No | The app shows no ads |
| Parental controls / age assurance | No | |

Result: **4+**. If the Pharmacy store is switched back on, review "Medical or treatment
information" first.

## 7. App Privacy ("nutrition label")

Tracking: **No**. The app has no ads, no ad SDKs and no advertising ID, and it doesn't
share data with data brokers.

Data collected. Every type: **linked to the user**, **not used for tracking**, purpose
**App Functionality**.

| Category | Data type | What it is |
|---|---|---|
| Contact Info | Name | Account and delivery name |
| Contact Info | Email Address | Sign-in, order emails |
| Contact Info | Phone Number | Delivery contact |
| Contact Info | Physical Address | Delivery addresses |
| Purchases | Purchase History | Orders |
| Identifiers | User ID | The account's server ID, which orders and addresses hang off |
| Identifiers | Device ID | Push notification token, update install id |
| Usage Data | Product Interaction | Saved cart and wishlist |

Not collected:
- **Search history.** Search words are sent only to find products and are never
  stored, so under Apple's definition they aren't collected.
- **Payment info.** Razorpay's own sheet takes it; the app never sees it, and
  Razorpay is off anyway.
- **Location, contacts, photos, crash data and diagnostics.** Crash reporting is off. Add
  Crash Data and Other Diagnostic Data before switching Sentry on.

## 8. Other checks Apple makes

- **Sign in with Apple**: not required, because the app offers no third-party sign-in
  (only its own email and password).
- **Export compliance**: answered in the build (`ITSAppUsesNonExemptEncryption: false`),
  so App Store Connect won't ask.
- **Account deletion in the app** (guideline 5.1.1(v)): yes, Account → Delete my account.
- **Privacy manifest**: in `app.json` (UserDefaults CA92.1, FileTimestamp C617.1).
