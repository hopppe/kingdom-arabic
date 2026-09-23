const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The app reads Bible text from assets/bible/bible.db. Keep the raw JSON sources
// (and experimental mapping folders) out of Metro so they are never bundled or watched.
config.resolver.blockList = [
  /bible-translations\/.*/,
  /bible-maps-word-gemma3\/.*/,
  /bible-maps-word-haiku\/.*/,
  /old-ai-mappings\/.*/,
];

if (!config.resolver.assetExts.includes('db')) {
  config.resolver.assetExts.push('db');
}

module.exports = config;
