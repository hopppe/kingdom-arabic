const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The app reads Bible text from assets/bible/bible.db.gz. Keep the raw JSON sources
// (and experimental mapping folders) out of Metro so they are never bundled or watched.
config.resolver.blockList = [
  /bible-translations\/.*/,
  /bible-maps-word-gemma3\/.*/,
  /bible-maps-word-haiku\/.*/,
  /old-ai-mappings\/.*/,
];

// The Bible DB ships gzipped (assets/bible/bible.db.gz) and is unpacked on first launch.
for (const ext of ['db', 'gz']) {
  if (!config.resolver.assetExts.includes(ext)) {
    config.resolver.assetExts.push(ext);
  }
}

module.exports = config;
