/**
 * Release tooling for the mobile app. RELEASING.md explains when to use which.
 *
 *   npm run release:check                    what can be shipped, and how
 *   npm run build:apk                        test APK on the preview lane
 *   npm run build:store                      store build (EAS) on the production lane
 *   npm run update:preview -- "message"      over-the-air update to test phones
 *   npm run update:production -- "message"   over-the-air update to customers
 *   npm run rollback:production              undo the latest update (see below)
 *   npm run rollback:production -- --to-built-in
 *
 * The one rule it enforces: an over-the-air update only carries JavaScript, so
 * it must only reach builds whose native code it was written against. Each
 * build records a fingerprint of the native side (expo prebuild config, native
 * modules, plugins) in release-fingerprints.json, keyed by app version. An
 * update is refused if the native side has changed since that build — that
 * change needs a new store release instead. Shipping it anyway would crash the
 * app on launch for every customer who received it.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RECORD_FILE = path.join(ROOT, 'release-fingerprints.json');
const LANES = ['preview', 'production'];
// Pinned: `@latest` once changed under us (it began requiring --environment)
// and broke publishing. Bump deliberately, then rerun a preview update.
const EAS = ['--yes', 'eas-cli@25.3.0'];

/* -------------------------------- helpers -------------------------------- */

function die(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
}

const appVersion = () => readJson('app.json').expo.version;

/** The build-profile env for a lane, so updates bundle exactly like builds. */
function laneEnv(lane) {
  const env = readJson('eas.json').build?.[lane]?.env ?? {};
  if (!env.EXPO_PUBLIC_API_URL) die(`eas.json has no EXPO_PUBLIC_API_URL for "${lane}".`);
  return env;
}

function readRecords() {
  try {
    return JSON.parse(fs.readFileSync(RECORD_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeRecords(records) {
  fs.writeFileSync(RECORD_FILE, `${JSON.stringify(records, null, 2)}\n`);
}

async function fingerprint() {
  const { createFingerprintAsync } = require('@expo/fingerprint');
  return createFingerprintAsync(ROOT);
}

function describeChanges(before, after) {
  const { diffFingerprints } = require('@expo/fingerprint');
  const label = (s) => s?.filePath ?? s?.id ?? '?';
  return diffFingerprints(before, after)
    // Ignored paths (generated android/ and ios/, eas.json) stay listed with a
    // null hash and never affect the result — leave them out of the report.
    .filter((d) => (d.afterSource ?? d.addedSource ?? d.removedSource)?.hash != null || d.beforeSource?.hash != null)
    .map((d) => {
      if (d.op === 'changed') return `  changed  ${label(d.afterSource)}`;
      if (d.op === 'added') return `  added    ${label(d.addedSource)}`;
      return `  removed  ${label(d.removedSource)}`;
    })
    .join('\n');
}

function nextMinor(version) {
  const [major = 0, minor = 0] = version.split('.').map((n) => parseInt(n, 10) || 0);
  return `${major}.${minor + 1}.0`;
}

function run(command, args, extraEnv = {}) {
  console.log(`\n$ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
  });
  if (result.status !== 0) die(`"${command} ${args.join(' ')}" failed.`);
}

/**
 * A version that is already in the store must never be rebuilt with different
 * native code: phones running it would start accepting updates written for
 * code they do not have.
 */
async function assertBuildAllowed() {
  const version = appVersion();
  const fp = await fingerprint();
  const prev = readRecords()[version];
  if (prev?.builds?.production && prev.hash !== fp.hash) {
    die(
      `Version ${version} is already in the store, and the native code has changed since:\n` +
        `${describeChanges(prev.fingerprint, fp)}\n\n` +
        `Change "version" in app.json (for example to ${nextMinor(version)}) and build again.`,
    );
  }
  return { version, fp, prev };
}

function recordBuild(lane, { version, fp, prev }) {
  const records = readRecords();
  const sameNative = prev?.hash === fp.hash;
  if (prev && !sameNative) {
    console.warn(
      `\n! The native code of ${version} changed since its last ${Object.keys(prev.builds ?? {}).join('/')} build.` +
        `\n  Phones with that older build must install this one before they receive updates.`,
    );
  }
  records[version] = {
    hash: fp.hash,
    builds: { ...(sameNative ? prev.builds : {}), [lane]: new Date().toISOString() },
    fingerprint: fp,
  };
  writeRecords(records);
  console.log(`\n✓ Recorded the ${lane} build of ${version} in release-fingerprints.json — commit it.`);
}

/* -------------------------------- commands ------------------------------- */

async function check() {
  const version = appVersion();
  const fp = await fingerprint();
  const rec = readRecords()[version];
  console.log(`App version:      ${version}`);
  console.log(`Native fingerprint: ${fp.hash}`);
  if (!rec) {
    console.log(`\nNo build of ${version} recorded yet. Build first: npm run build:apk / npm run build:store.`);
    return;
  }
  const changed = rec.hash !== fp.hash;
  for (const lane of LANES) {
    const built = rec.builds?.[lane];
    let verdict;
    if (!built) verdict = `no ${lane} build of ${version} yet`;
    else if (changed) verdict = 'native code changed — needs a new build, not an update';
    else verdict = 'over-the-air updates allowed';
    console.log(`  ${lane.padEnd(10)} ${verdict}${built ? ` (built ${built.slice(0, 10)})` : ''}`);
  }
  if (changed) console.log(`\nNative changes since the ${version} build:\n${describeChanges(rec.fingerprint, fp)}`);
}

async function buildApk() {
  const state = await assertBuildAllowed();
  const env = laneEnv('preview');
  const apk = path.join(ROOT, 'android/app/build/outputs/apk/release/app-release.apk');
  const out = path.join(ROOT, `ShopGenuine-${state.version}-test-arm64.apk`);

  // Keep android/ in step with app.json and the plugins (update URL, runtime
  // version, channel) — it is generated, and gitignored.
  run('npx', ['expo', 'prebuild', '--platform', 'android', '--no-install'], env);
  // Gradle reuses a stale JS bundle when only env vars changed.
  fs.rmSync(path.join(ROOT, 'android/app/build/generated/assets/react/release'), {
    recursive: true,
    force: true,
  });
  run('./android/gradlew', ['-p', 'android', 'assembleRelease', '-PreactNativeArchitectures=arm64-v8a'], env);

  const unzip = spawnSync('unzip', ['-p', apk, 'assets/index.android.bundle'], { maxBuffer: 1 << 30 });
  const bundle = unzip.stdout?.toString('latin1') ?? '';
  if (!bundle.includes(new URL(env.EXPO_PUBLIC_API_URL).host)) die('The APK bundle does not contain the API host.');
  if (/10\.0\.2\.2|localhost:4000/.test(bundle)) die('The APK bundle points at a local server.');

  fs.copyFileSync(apk, out);
  console.log(`\n✓ ${path.relative(ROOT, out)} — talks to ${env.EXPO_PUBLIC_API_URL}, preview lane.`);
  recordBuild('preview', state);
}

async function buildStore() {
  const platform = process.argv[3] ?? 'android';
  const state = await assertBuildAllowed();
  // Interactive on purpose: the first build asks to create the signing key,
  // which EAS then keeps. eas.json's production profile sets the channel and env.
  run('npx', [...EAS, 'build', '--profile', 'production', '--platform', platform]);
  recordBuild('production', state);
  console.log('\nNext: npx eas-cli@latest submit --platform android --latest  (see RELEASING.md)');
}

async function update() {
  const lane = process.argv[3];
  const message = process.argv.slice(4).join(' ').trim();
  if (!LANES.includes(lane)) die(`Lane must be one of: ${LANES.join(', ')}.`);
  if (!message) die(`Describe the update: npm run update:${lane} -- "Fix checkout total"`);

  const version = appVersion();
  const rec = readRecords()[version];
  if (!rec?.builds?.[lane]) {
    die(
      `No ${lane} build runs version ${version}, so this update would reach nobody.\n` +
        (lane === 'production'
          ? '  Publish the store build first: npm run build:store'
          : '  Build a test APK first: npm run build:apk'),
    );
  }
  const fp = await fingerprint();
  if (fp.hash !== rec.hash) {
    // Before the store release, a version can simply be rebuilt; after it, the
    // native change has to go out as a new version.
    const next = rec.builds?.production
      ? `Version ${version} is already in the store, so this needs a store release:\n` +
        `  1. change "version" in app.json (for example to ${nextMinor(version)})\n` +
        `  2. npm run build:store, then submit it (and npm run build:apk for test phones)\n` +
        `  3. once it is live, raise APP_MIN_VERSION_* on the server if old versions must stop`
      : `Version ${version} is not in the store yet, so rebuild it instead: npm run build:apk`;
    die(
      `The native code has changed since the ${version} ${lane} build:\n` +
        `${describeChanges(rec.fingerprint, fp)}\n\n` +
        `Over-the-air updates cannot carry native changes. ${next}`,
    );
  }

  run('npx', ['tsc', '--noEmit']);
  // Only EXPO_PUBLIC_* reach the JavaScript bundle.
  const env = Object.fromEntries(
    Object.entries(laneEnv(lane)).filter(([key]) => key.startsWith('EXPO_PUBLIC_')),
  );
  // --environment loads any EAS-hosted variables for the same-named environment
  // (EAS names them development / preview / production, like our lanes).
  run(
    'npx',
    [...EAS, 'update', '--channel', lane, '--environment', lane, '--message', message, '--non-interactive'],
    env,
  );

  if (process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT) {
    run('npx', ['sentry-expo-upload-sourcemaps', 'dist']);
  } else {
    console.log('\n(Sentry not configured — crash reports for this update will not have readable stack traces.)');
  }
  console.log(`\n✓ Published to ${lane}. Phones download it on next launch and run it the launch after.`);
}

/**
 * Undo a bad update. By default, republishes the update before the latest one
 * on the lane, so phones move back to it the same way they get any update. With
 * --to-built-in, phones drop every update and run the code that shipped inside
 * the store build — always compatible, and the fallback when there is nothing
 * earlier to go back to.
 */
async function rollback() {
  const lane = process.argv[3];
  const toBuiltIn = process.argv.includes('--to-built-in');
  if (!LANES.includes(lane)) die(`Lane must be one of: ${LANES.join(', ')}.`);
  const version = appVersion();

  if (toBuiltIn) {
    run('npx', [
      ...EAS, 'update:roll-back-to-embedded',
      '--branch', lane, '--runtime-version', version,
      '--message', 'Roll back to the code inside the app', '--non-interactive',
    ]);
    console.log(`\n✓ ${lane} phones on ${version} will return to their built-in code over their next two launches.`);
    return;
  }

  const list = spawnSync('npx', [...EAS, 'update:list', '--branch', lane, '--json', '--non-interactive'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1 << 26,
  });
  if (list.status !== 0) die(`Could not list the ${lane} updates:\n${list.stderr}`);
  const updates = (JSON.parse(list.stdout).currentPage ?? []).filter((u) => u.runtimeVersion === version);
  const [latest, ...older] = updates;
  const previous = older.find((u) => !u.isRollBackToEmbedded);
  if (!latest) die(`Nothing has been published to ${lane} for version ${version}.`);
  if (!previous) {
    die(`There is no earlier ${lane} update for ${version} to go back to.\n` +
      `  To return phones to the code inside the app: npm run rollback:${lane} -- --to-built-in`);
  }

  console.log(`Latest ${lane} update:  ${latest.message}`);
  console.log(`Rolling back to:        ${previous.message}`);
  run('npx', [
    ...EAS, 'update:republish', '--group', previous.group,
    '--message', `Roll back to ${previous.group.slice(0, 8)}`, '--non-interactive',
  ]);
  console.log(`\n✓ ${lane} phones will move back over their next two launches.`);
}

/* --------------------------------- main ---------------------------------- */

const commands = { check, apk: buildApk, store: buildStore, update, rollback };
const command = commands[process.argv[2]];
if (!command) die(`Usage: node scripts/release.mjs <${Object.keys(commands).join('|')}>`);
await command();
