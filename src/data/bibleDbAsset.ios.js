// Which Bible database file ships in the app. Platform variants live in
// bibleDbAsset.ios.js / bibleDbAsset.android.js so each build bundles only one.
//
// iOS stores app files uncompressed, so it ships the gzip and unpacks it once.
export const BIBLE_DB_ASSET = { module: require('../../assets/bible/bible.db.gz'), compressed: true };
