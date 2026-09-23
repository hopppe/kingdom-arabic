// Android keeps assets compressed inside the APK already, so the plain database
// costs no more to ship than a gzip, and copying it out is a fast native copy
// (no JS decompression on first launch).
export const BIBLE_DB_ASSET = { module: require('../../assets/bible/bible.db'), compressed: false };
