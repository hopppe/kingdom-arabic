import { Dimensions, Platform } from 'react-native';
import { isTabletDevice } from '../utils/layout';

const screen = Dimensions.get('screen');

// Tablets use tab navigation; phones read in one screen and push the rest.
export const IS_TABLET = isTabletDevice({
  os: Platform.OS,
  isPad: Platform.isPad,
  width: screen.width,
  height: screen.height,
});

// Safe-area edges for Flashcards/Memorize. On phones they sit under a native
// header that already clears the status bar, so they skip the top edge.
export const pushedScreenEdges = (...edges) => (IS_TABLET ? ['top', ...edges] : edges);
