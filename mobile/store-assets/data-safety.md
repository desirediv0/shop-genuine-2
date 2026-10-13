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
| Is all of the user data collected by your app encrypted in transit? | **Yes** — the app talks to `https://api.shopgenuine.online` only |
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
| Device or other IDs | Yes | No | Optional | Push notifications |

### Why "Payment info" is No

Card and UPI details are entered inside Razorpay's own checkout sheet and go
straight to Razorpay. They never pass through this app or the Shop Genuine
server — the server only ever sees a Razorpay order id, payment id and
signature. Declaring payment info as collected would be inaccurate.

If that ever changes — for example if a card form is built into the app — this
answer must change with it.

### Why "Device or other IDs" is Optional

The Expo push token is only minted after the person grants the notification
permission, and the app works fully without it.

## Account deletion URL

Google requires a **web** URL for deletion requests even when the app offers it
in-app. Point it at a page on shopgenuine.online that explains both routes:
deleting from inside the app, and emailing support.

Note what deletion actually does, because the policy must match the behaviour:
an account with no orders is deleted outright, while an account that has ordered
is anonymised — email, name and phone are cleared and the login is disabled, but
the order rows survive because invoices have to be retained. Say this plainly on
the page.
