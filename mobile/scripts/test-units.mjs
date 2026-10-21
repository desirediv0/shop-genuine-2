/**
 * Unit checks for small pure helpers where a mistake is costly and silent:
 * the version comparison behind the "Update required" screen (a bug there
 * locks shoppers out, or never prompts them), and the price formatter (which
 * once showed ₹28 for a ₹27.90 charge).
 *
 *   npm run test:units
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);

function load(relPath) {
  const source = fs.readFileSync(new URL(relPath, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require);
  return mod.exports;
}

const { compareVersions, updateRequirement } = load('../src/utils/version.ts');
const { formatPrice } = load('../src/utils/format.ts');

let pass = 0;
let fail = 0;
function check(name, actual, expected) {
  if (actual === expected) {
    pass += 1;
    console.log(`  PASS  ${name}`);
  } else {
    fail += 1;
    console.log(`  FAIL  ${name} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// compareVersions
check('equal', compareVersions('1.0.0', '1.0.0'), 0);
check('missing parts count as zero', compareVersions('1.2', '1.2.0'), 0);
check('numeric, not alphabetical', compareVersions('1.10.0', '1.9.0'), 1);
check('older patch', compareVersions('1.0.1', '1.0.2'), -1);
check('major wins', compareVersions('2.0', '1.99.99'), 1);

// updateRequirement
check('no policy -> none', updateRequirement('1.0.0', null), 'none');
check('unknown installed version -> none', updateRequirement(null, { minVersion: '9.0.0' }), 'none');
check('empty policy -> none', updateRequirement('1.0.0', { minVersion: null, latestVersion: null }), 'none');
check('below minimum -> required', updateRequirement('1.0.0', { minVersion: '1.1.0' }), 'required');
check('at minimum -> none', updateRequirement('1.1.0', { minVersion: '1.1.0' }), 'none');
check(
  'above minimum, below latest -> available',
  updateRequirement('1.1.0', { minVersion: '1.0.0', latestVersion: '1.2.0' }),
  'available',
);
check('at latest -> none', updateRequirement('1.2.0', { latestVersion: '1.2.0' }), 'none');
check(
  'required beats available',
  updateRequirement('1.0.0', { minVersion: '1.1.0', latestVersion: '1.2.0' }),
  'required',
);
check('1.10 is not below 1.9', updateRequirement('1.10.0', { minVersion: '1.9.0' }), 'none');

// formatPrice
check('whole rupees', formatPrice(31), '₹31');
check('paise shown', formatPrice(31 - 3.1), '₹27.90');
check('string from Prisma Decimal', formatPrice('3.10'), '₹3.10');
check('Indian grouping', formatPrice(100000), '₹1,00,000');
check('sub-paisa noise rounds away', formatPrice(244.004), '₹244');
check('null is zero', formatPrice(null), '₹0');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
