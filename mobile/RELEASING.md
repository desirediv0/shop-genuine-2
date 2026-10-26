# Releasing the Shop Genuine app

How changes reach customers after the app is in the stores, and the commands that
ship them. Run every command from `mobile/`.

## What kind of change is it?

| Change | How it ships | Reaches customers |
|---|---|---|
| Products, prices, banners, home sections, coupons, stores, payment keys | Admin dashboard | Immediately |
| Server / API code | `git pull` + `pm2 restart shop-genuine-server` on the VPS | Immediately |
| App screens, text, logic — anything in `app/` or `src/` | Over-the-air update (`npm run update:*`) | Next launch downloads, the launch after runs it |
| Native: new native module, permission, Expo SDK upgrade, `app.json` plugin or config, icon, splash, app name | Store release (`npm run build:store`) | After store review |

**Server changes must stay backwards compatible.** Old app versions stay installed
for months. Never remove or rename a field the app reads. Add new fields, and only
retire old ones after `APP_MIN_VERSION_*` has moved past every version that used them.

## Lanes

Two update channels, matching the EAS build profiles in `eas.json`:

- **preview** — test phones. Local test APKs (`npm run build:apk`) listen here.
  `app.json` sets `expo-channel-name: preview` for local builds.
- **production** — customers. EAS writes this channel into store builds from the
  `production` profile.

Ship to preview first, check on a phone, then send the same change to production.

## Over-the-air updates

```sh
npm run release:check                         # what is allowed right now, and why
npm run update:preview -- "Fix checkout total"
npm run update:production -- "Fix checkout total"
```

An update carries JavaScript and assets only. It reaches every build with the same
`version` (runtime policy `appVersion` in `app.json`). `scripts/release.mjs` refuses
an update when:

- **the native side has changed** since that version was built. Each build records a
  fingerprint in `release-fingerprints.json` (commit it). An update written against
  different native code crashes on launch, so that change needs a store release;
- **no build on that lane runs this version**, so the update would reach nobody.

The update is bundled with the lane's `EXPO_PUBLIC_*` env from `eas.json`, so it talks
to the same API as the build.

The Account screen's footer shows what a phone runs:
`Version 1.0.0 · update 3f2a1c9e · preview`. "update …" is absent when the phone runs
the code that shipped inside the build.

### Rolling back a bad update

```sh
npm run rollback:production                  # republish the update before the latest
npm run rollback:production -- --to-built-in # drop all updates: run the code inside the store build
```

Phones pick up a rollback the same way they pick up any update, over their next two
launches. `--to-built-in` always works, because a build's own code always matches it.
Use it when there is nothing earlier to go back to, or when you're unsure which update
was good.

Two safety nets come for free:

- **Phones only move forward.** expo-updates loads an update only if it is newer than
  the code the phone runs, so a fresh build never picks up an older update. A rollback
  works because a republish counts as a new update.
- **Crash recovery.** If a new update crashes before the app finishes starting,
  expo-updates falls back to the last update that worked.

### Limits and tools

- **Expo plan:** the Free plan serves updates to **1,000 phones a month** (unique
  installs that download an update). The Starter plan ($19/month) covers 3,000, and
  pay-per-phone beyond that. Check *expo.dev → Billing* before a big release once the
  app passes about 800 users. Builds also draw on the plan's monthly build credits.
- **eas-cli is pinned** in `scripts/release.mjs` (`eas-cli@25.3.0`). `@latest` once
  started requiring `--environment` and broke publishing. To bump: change the version,
  then run `npm run update:preview` once before trusting it for production.
- **Expo login:** the scripts publish as whoever `npx eas-cli whoami` reports, which
  should be `desirediv`. If the login expires, run `npx eas-cli login`.

## Store releases

1. Bump `version` in `app.json`, e.g. `1.0.0` → `1.1.0`. Any native change needs a new
   version, and `build:store` refuses to rebuild a version that is already in the store
   with different native code. Build numbers (`versionCode` / `buildNumber`) are
   managed by EAS (`appVersionSource: remote`, `autoIncrement`).
2. `npm run build:store` — EAS production build (Android by default; pass `ios` or
   `all` once iOS is set up). The first build asks EAS to create the signing key; EAS
   keeps it.
3. `npx eas-cli@latest submit --platform android --latest` — uploads to the Play
   **internal** track as a draft (`eas.json` → `submit`). Promote it in the Play Console,
   preferably as a staged rollout (10% → 50% → 100%).
4. Once it is live, set `APP_LATEST_VERSION_ANDROID` on the server (see below) so
   older versions are invited to update. Raise `APP_MIN_VERSION_ANDROID` only when old
   versions must stop working.
5. Commit `release-fingerprints.json`.

## "Please update" — server settings

`GET /api/v2/public/app-version` reads these from `server/.env`. All are optional, and
unset means no requirement. Change them with `nano server/.env`, then
`pm2 restart shop-genuine-server`.

```sh
APP_LATEST_VERSION_ANDROID=1.1.0   # below this: a "new version available" prompt, dismissible
APP_MIN_VERSION_ANDROID=1.0.0      # below this: a blocking "Update required" screen
APP_STORE_URL_ANDROID=             # optional — defaults to the Play listing for com.shopgenuine.app
APP_LATEST_VERSION_IOS=
APP_MIN_VERSION_IOS=
APP_STORE_URL_IOS=                 # needed for iOS, once the App Store listing exists
APP_UPDATE_MESSAGE=                # optional text shown on both screens
```

The app checks on launch, and again when it returns to the foreground if the last
check is more than 30 minutes old. If the check fails (offline, server down,
endpoint missing), it shows nothing. A shopper is never
locked out because the policy could not be read. Logic: `src/components/UpdateGate.tsx`
and `src/utils/version.ts` (covered by `npm run test:units`).

## Crash reporting (Sentry)

Built in, but off until a DSN is provided. `src/utils/monitoring.ts` initialises Sentry
only in release builds that have `EXPO_PUBLIC_SENTRY_DSN`. It records crashes and
errors with the update id and channel as tags, but no personal data and no
performance tracing.

To switch it on:

1. Create a Sentry project (platform: React Native) and copy its DSN. In the project's
   **Settings → Security & Privacy**, turn on **Prevent Storing of IP Addresses**. The
   privacy policy promises crash reports carry no IP address.
2. Add `"EXPO_PUBLIC_SENTRY_DSN": "<dsn>"` to the `preview` and `production` env in
   `eas.json`. The DSN is JavaScript-only and `eas.json` is outside the fingerprint, so
   this ships as an over-the-air update. No store release is needed.
3. For readable stack traces, create a Sentry auth token and set `SENTRY_ORG`,
   `SENTRY_PROJECT` and `SENTRY_AUTH_TOKEN` as EAS environment variables (secret). Then
   remove `SENTRY_DISABLE_AUTO_UPLOAD` from `eas.json`, so store builds upload their
   source maps. For updates, export the same three variables before
   `npm run update:*`; the script then uploads that update's source maps.
4. Update the Play data-safety answers. See `store-assets/data-safety.md`.

The Sentry config plugin and Metro serializer (`metro.config.js`) are already in the
native build, so none of this changes native code.

## Checks before any release

```sh
npx tsc --noEmit
npm run test:units && npm run test:details
npm run test:contract     # needs the local server and database
npx expo export --platform android
```

Then run the change on the emulator, at phone width too:
`adb shell wm size 1080x2400 && adb shell wm density 480`. Undo with `wm size reset` and
`wm density reset`.
