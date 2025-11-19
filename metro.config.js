const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude experimental Bible mapping directories from the bundle
config.resolver.blockList = [
  /bible-maps-word-gemma3\/.*/,
  /bible-maps-word-haiku\/.*/,
];

module.exports = config;
