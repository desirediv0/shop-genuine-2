# Play Console — Data safety answers

Play Console → **Policy → App content → Data safety**. These answers are derived
from what the app's code actually sends, not from guesswork: every endpoint in
`src/api/services.ts` and every permission in `app.json` was checked.

**Answer honestly.** Google cross-checks the declaration against observed network
traffic, and a mismatch gets the app suspended.

## Overview answers

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** — every connection is HTTPS: the API (`api.shopgenuine.online`), Expo's update and push services, and Sentry once crash reporting is on |
| Do you provide a way for users to request that their data is deleted? | **Yes** — in-app, Account → Delete my account |

## Data types to declare

| Data type | Collected | Shared | Optional? | Purpose |
|---|---|---|---|---|
| Name | Yes | No | Required | Account management, order fulfilment |
| Email address | Yes | No | Required | Account management, order updates |
| Phone number | Yes | No | Required | Order fulfilment, delivery contact |
| Address | Yes | No | Required | Order fulfilment (shipping) |
| Purchase history | Yes | No | Required | App functionality (order history) |
| Payment info | **No** | No | — | See the note below |
| App interactions | Yes | No | Required | App functionality (cart, wishlist) |
| Device or other IDs | Yes | No | Required | App functionality (app updates, push notifications) |
| Crash logs | Yes, once Sentry is on | No | Required | App functionality, Analytics |
| Diagnostics | Yes, once Sentry is on | No | Required | App functionality, Analytics |

### Why "Payment info" is No

Card and UPI details are entered inside Razorpay's own checkout sheet and go
straight to Razorpay. They never pass through this app or the Shop Genuine
server — the server only ever sees a Razorpay order id, payment id and
signature. Declaring payment info as collected would be inaccurate.

If that ever changes — for example if a card form is built into the app — this
answer must change with it.

### Why "Device or other IDs" is Required

Two identifiers leave the device:

- **The Expo push token**, minted only after the person grants the
  notification permission. On its own it would be optional.
- **The EAS Update installation id** (`EAS-Client-ID`), a random id sent with
  every update check to Expo's update service (`u.expo.dev`). It is not linked to
  the account, but it is sent on every launch, so the type as a whole is
  required.

Expo and Sentry process this data on Shop Genuine's behalf as service
providers, so under Play's definitions it is collected, not "shared".

### Crash logs and Diagnostics

`src/utils/monitoring.ts` only sends anything when the build carries
`EXPO_PUBLIC_SENTRY_DSN` (see RELEASING.md). **Until Sentry is switched on, leave
these two rows out.** When it is switched on, add them **before** the update that
enables it goes out. Reports contain the error, stack trace, app version, update id
and device model / OS version. `sendDefaultPii` is off, so they carry no IP
address, email or name.

## Account deletion URL

Use **https://api.shopgenuine.online/delete-account**.

Google requires a **web** link for deletion requests even though the app has its own
Delete button. The page is served by the API server (`server/controllers/pages.controller.js`),
not the website, so it doesn't depend on the website. It covers what Google checks:

- The app name, as on the listing.
- The steps: in the app (Account → Delete my account), or by email for someone who
  no longer has the app.
- What is deleted.
- What is kept, and for how long. An account with no orders is deleted outright. An
  account that has ordered is anonymised: email, name, phone and password are cleared,
  the account shows as "Deleted customer", and sign-in is disabled. The order rows
  survive, with the delivery address each order went to, because tax law requires
  invoices to be kept and orders in transit still have to arrive. Other saved
  addresses are deleted.

The email address comes from the server setting `SUPPORT_EMAIL`. It defaults to
`connect.genuinenutrition@gmail.com`, the address on the website's privacy policy.
