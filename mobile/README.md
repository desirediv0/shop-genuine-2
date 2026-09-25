# Shop Genuine — Mobile App

Expo (SDK 57) app for the Shop Genuine marketplace. It talks to the existing
backend in `../server` through `/api/v2` — the namespace `server/routes/v2.index.js`
mounts for mobile, which reuses the same controllers as the website.

No backend endpoints were written for this app. Everything it calls already existed.

## Running it

```bash
npm install
npm start          # then press a (Android) / i (iOS)
```

The backend must be running:

```bash
cd ../server && npm start   # port 4000
```

### Pointing the app at the API

`src/api/config.ts` resolves the host automatically in development by reading the
machine that serves the Metro bundle, so a physical device works over LAN without
configuration. Override it when you need to:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.5:4000 npm start
```

| Target | URL |
| --- | --- |
| iOS simulator | `http://localhost:4000` |
| Android emulator | `http://10.0.2.2:4000` |
| Physical device | `http://<LAN-ip>:4000` |
| Production | `https://api.shopgenuine.online` |

## Checks

```bash
npm run typecheck      # tsc --noEmit
npm run test:contract  # hits the live API, asserts response shapes match src/types
npx expo-doctor        # config + native dependency sanity
```

None of these catch runtime crashes. **Run the app on a device or emulator
before calling a change done** — three real bugs here (a launch crash, a blank
cart thumbnail, clipped filter chips) passed typecheck and bundled cleanly, and
only showed up on screen.

```bash
~/Library/Android/sdk/emulator/emulator -avd <your-avd> &
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000 npx expo start --android
```

`test:contract` needs the server running and `psql` access to `shop_genuine` (it
reads OTPs out of the database the way a user would read them from email). It
registers a throwaway user and places a real COD order each run, then deletes
the account it created. 44 assertions covering catalogue, auth, token
lifetimes, cart, checkout, orders, push registration and account deletion.

## Layout

```
app/                      expo-router routes
  (tabs)/                 home, search, cart, wishlist, account
  auth/                   login, register, OTP verify, forgot password
  product/[slug].tsx      detail, variant picker, related products
  category/[slug].tsx     category listing, infinite scroll
  orders/                 list + detail with cancel
  checkout.tsx            address, coupon, payment, place order
  addresses.tsx           address book

src/
  api/       config, axios client with token refresh, service layer, token store
  components/ Button, Input, ProductCard, AddressForm, StatusPill, states
  context/   Auth, Cart, Toast
  theme/     design tokens mirrored from the web storefront
  types/     response types, verified against live API
  utils/     price/date formatting, guest cart, Razorpay bridge
```

## How auth works

The backend accepts `Authorization: Bearer` and returns both tokens in the
response body, so the app never needs cookies.

- Tokens live in `expo-secure-store` (keychain/keystore), not AsyncStorage.
- `src/api/client.ts` retries a 401 once after refreshing, and refreshes
  single-flight so ten parallel 401s cause one refresh, not ten.
- Verifying the signup OTP also signs the user in — the backend returns tokens
  from `/users/verify-otp`, so there is no second login step.
- The backend does not store refresh tokens, so logout cannot revoke them
  server-side. Secure storage is what limits exposure.

## Guest cart

`/cart` requires a token (`server/routes/cart.routes.js` applies `verifyJWTToken`
to every route), so browsing shoppers get a local cart in AsyncStorage. On
sign-in, `CartContext` pushes each line to the server cart and clears the local
copy — the same approach the web storefront takes. Lines that fail (out of stock)
are skipped rather than blocking the merge.

## Payments

- **Cash on Delivery** works out of the box.
- **Razorpay** needs a native module that cannot run in Expo Go. `src/utils/razorpay.ts`
  loads it lazily and reports availability, so checkout falls back to COD with a
  clear message instead of crashing.

To enable card/UPI:

```bash
npx expo install react-native-razorpay
npx expo prebuild
eas build --profile development --platform android
```

Checkout always creates the order server-side first, then hands the returned
order id to the SDK, then calls `/payment/verify`. The client never decides the
amount — `server/controllers/payment.controller.js` recalculates the cart,
shipping and discount before creating the Razorpay order.

## Building for the stores

```bash
npm i -g eas-cli && eas login
eas build:configure
eas build --profile preview --platform android     # APK for testing
eas build --profile production --platform all      # AAB + IPA
eas submit --profile production --platform android
```

Before the first production build, fill in `eas.json` → `submit.production.ios`
with your App Store Connect app id and Apple team id, and replace the placeholder
icons in `assets/`.

## Push notifications

Order updates are pushed through Expo's service, which fronts both APNs and FCM,
so no Firebase or Apple push credentials are needed for basic sends.

- The app registers its Expo token after sign-in and on every cold start
  (`src/utils/pushRegistration.ts`); the server upserts on the token, so repeat
  calls are harmless.
- Sign-out detaches the device, so the next person to use a shared phone does not
  receive the previous user's orders.
- Tapping an order notification opens that order
  (`src/hooks/useNotificationRouting.ts`), from both background and cold start.
- The server sends on order placement, admin status changes, and cancellation.
  Sends are best-effort and can never fail an order — proved by
  `push-resilience-test.mjs`.
- Tokens Expo reports as `DeviceNotRegistered` are deactivated automatically, so
  uninstalled apps are not retried forever.

Push needs a physical device and a real build. `POST /api/v2/notifications/test`
sends a test push to your own devices.

**expo-notifications must never be imported at module scope.** Expo Go on Android
dropped remote push in SDK 53 and its shim throws during module initialisation —
which a `try/catch` around `require()` cannot contain, so the app dies on launch
before rendering anything. `src/utils/pushRegistration.ts` therefore checks
`Constants.executionEnvironment === 'storeClient'` and skips loading the module
entirely in Expo Go. Reach expo-notifications only through that file.

## Account deletion

`POST /api/v2/users/delete-account` deletes the account in one authenticated
call, so the flow completes in the app as App Review requires. The older
emailed-link flow still exists and is unchanged.

Deletion re-authenticates (password, or typing DELETE for password-less OAuth
accounts) so an unlocked phone is not enough to wipe an account. Behaviour then
depends on whether the account ever transacted:

- **No orders** — the row is deleted outright and cascades clean up the rest.
- **Has orders** — personal data is deleted and the user row is anonymised
  (no name, phone or password; a non-routable `@deleted.invalid` address;
  deactivated). Orders are financial records that have to be retained for tax
  and accounting, so they survive with the personal data stripped out.

Either way the account cannot be signed into again.

## Known gaps

- **Sign in with Apple** is required by App Review if Google sign-in ships. The
  app offers email/password only, so this is not blocking today.
- **Web is not a target.** This builds for the App Store and Play Store only;
  `react-native-web` is not installed.
