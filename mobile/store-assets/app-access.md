# Play Console — App access (reviewer login)

Play Console → **Policy → App content → App access** → "All or some functionality is
restricted" → **Add new instructions**.

| Field | Value |
|---|---|
| Name | Reviewer account |
| Username / email | `demo1@shopgenuine.test` |
| Password | *(Akash has it; never commit it here — the repo is on GitHub)* |
| Any other information | the text below |

```
Browsing, search, categories and the cart work without an account.
Checkout, orders, saved addresses and account deletion need sign-in:
open the Account tab, tap Sign in, and use the credentials above.

Payment is Cash on Delivery only, so no card is needed. Test orders
placed with this account are cancelled and never delivered.

The app has two stores, Grocery and Cosmetics; switch between them
with the chips at the top of Home.
```

Checked on the live server 2026-11-05: the account signs in ("Demo User One",
customer), with no addresses, cart items or orders.

**Keep this account working.** Google signs in again when reviewing every update.
Reviewers sometimes test "Delete my account" — if they do, this login stops working
and the next review fails. Before each new store release, sign in once to check it,
and cancel any test orders reviewers placed (they show in the admin as normal COD
orders from "Demo User One").
