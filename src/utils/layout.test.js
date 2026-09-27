import {
  CONTENT_MAX_WIDTH,
  READER_MAX_WIDTH,
  READER_SIDE_BY_SIDE_MAX_WIDTH,
  WIDE_LAYOUT_MIN_WIDTH,
  getReaderLayout,
  isTabletDevice,
  isWideLayout,
} from './layout';

describe('isWideLayout', () => {
  it('is false for phone widths', () => {
    expect(isWideLayout(375)).toBe(false);
    expect(isWideLayout(430)).toBe(false);
  });

  it('is true from the tablet breakpoint up', () => {
    expect(isWideLayout(WIDE_LAYOUT_MIN_WIDTH)).toBe(true);
    expect(isWideLayout(820)).toBe(true);
    expect(isWideLayout(1366)).toBe(true);
  });

  it('treats invalid widths as narrow', () => {
    expect(isWideLayout(undefined)).toBe(false);
    expect(isWideLayout(NaN)).toBe(false);
    expect(isWideLayout(-1)).toBe(false);
  });
});

describe('getReaderLayout', () => {
  it('stacks translations on phones with no width cap', () => {
    expect(getReaderLayout(390, true)).toEqual({ sideBySide: false, maxWidth: undefined });
    expect(getReaderLayout(390, false)).toEqual({ sideBySide: false, maxWidth: undefined });
  });

  it('puts English beside Arabic on wide screens when translations are shown', () => {
    expect(getReaderLayout(1024, true)).toEqual({ sideBySide: true, maxWidth: READER_SIDE_BY_SIDE_MAX_WIDTH });
  });

  it('keeps Arabic-only lines readable on wide screens', () => {
    expect(getReaderLayout(1024, false)).toEqual({ sideBySide: false, maxWidth: READER_MAX_WIDTH });
  });
});

describe('width constants', () => {
  it('keep phones unconstrained', () => {
    expect(CONTENT_MAX_WIDTH).toBeGreaterThan(430);
    expect(READER_MAX_WIDTH).toBeGreaterThan(430);
  });
});

describe('isTabletDevice', () => {
  it('trusts the iPad flag on iOS', () => {
    expect(isTabletDevice({ os: 'ios', isPad: true, width: 320, height: 700 })).toBe(true);
    expect(isTabletDevice({ os: 'ios', isPad: false, width: 1000, height: 1000 })).toBe(false);
  });

  it('uses the shortest screen side elsewhere', () => {
    expect(isTabletDevice({ os: 'android', width: 800, height: 1280 })).toBe(true);
    expect(isTabletDevice({ os: 'android', width: 900, height: 412 })).toBe(false);
  });

  it('treats missing sizes as a phone', () => {
    expect(isTabletDevice({ os: 'android' })).toBe(false);
  });
});
