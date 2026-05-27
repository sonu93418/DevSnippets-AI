// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

// Ensure .native.js extensions are properly resolved
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
