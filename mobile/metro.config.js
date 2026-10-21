// Expo's default Metro config, plus the debug IDs Sentry uses to match a crash
// report to its source map. Without them, Hermes stack traces from a release
// build are bytecode offsets nobody can read.
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

module.exports = getSentryExpoConfig(__dirname);
