import { GATHERING_UNLOCK_CODE, isGatheringUnlockCode } from './unlockCode';

describe('isGatheringUnlockCode', () => {
  it('accepts the code', () => {
    expect(isGatheringUnlockCode(GATHERING_UNLOCK_CODE)).toBe(true);
  });

  it('ignores case and surrounding spaces', () => {
    expect(isGatheringUnlockCode('  Gathering ')).toBe(true);
  });

  it('rejects other searches', () => {
    expect(isGatheringUnlockCode('gather')).toBe(false);
    expect(isGatheringUnlockCode('gatherings')).toBe(false);
    expect(isGatheringUnlockCode('gathering together')).toBe(false);
    expect(isGatheringUnlockCode('')).toBe(false);
  });

  it('rejects non-strings', () => {
    expect(isGatheringUnlockCode(undefined)).toBe(false);
    expect(isGatheringUnlockCode(null)).toBe(false);
  });
});
