// Width-based layout rules. Tablets (and wide split-screen windows) get
// side-by-side translations and capped line lengths; phones are unchanged.

// Narrowest window (dp) treated as a tablet layout. iPad mini portrait is 744.
export const WIDE_LAYOUT_MIN_WIDTH = 700;

// Max width for list/card screens (Flashcards, Memorize, Progress) on tablets.
export const CONTENT_MAX_WIDTH = 680;

// Arabic-only reading column: long enough to feel like a page, short enough to scan.
export const READER_MAX_WIDTH = 760;

// English + Arabic columns together.
export const READER_SIDE_BY_SIDE_MAX_WIDTH = 1180;

export const isWideLayout = (width) => Number.isFinite(width) && width >= WIDE_LAYOUT_MIN_WIDTH;

export const getReaderLayout = (width, showTranslations) => {
  if (!isWideLayout(width)) return { sideBySide: false, maxWidth: undefined };
  return showTranslations
    ? { sideBySide: true, maxWidth: READER_SIDE_BY_SIDE_MAX_WIDTH }
    : { sideBySide: false, maxWidth: READER_MAX_WIDTH };
};

// Shortest screen side (dp) from which a non-iOS device counts as a tablet.
const TABLET_MIN_SHORT_SIDE = 600;

// Tablets get tab navigation; phones get a single reader with pushed screens.
// Decided per device (not window) so the navigation doesn't swap mid-session.
export const isTabletDevice = ({ os, isPad, width, height }) => {
  if (os === 'ios') return Boolean(isPad);
  const shortSide = Math.min(width, height);
  return Number.isFinite(shortSide) && shortSide >= TABLET_MIN_SHORT_SIDE;
};
