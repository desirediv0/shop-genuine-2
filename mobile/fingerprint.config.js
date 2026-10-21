// What counts as "native code" when deciding whether an over-the-air update is
// safe (see RELEASING.md and scripts/release.mjs). Anything left in can only
// cause a false alarm — a refused update — never a crash; anything wrongly
// excluded could let a JS update reach a store build it does not match.
const { SourceSkips } = require('@expo/fingerprint');

module.exports = {
  // npm scripts and .gitignore change often and never reach the native build.
  sourceSkips: SourceSkips.PackageJsonScriptsAll | SourceSkips.GitIgnore,
};
