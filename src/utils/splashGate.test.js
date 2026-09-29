import { gateDoorPoints, gateTravel, pointsToSvgPath } from './splashGate';

const CUT = { aspect: 1.25, path: [[0.5, 0], [0.5, 0.9], [0.4, 1]] };
const SCREEN = { width: 400, height: 800, crownWidth: 200, cut: CUT };

describe('gateDoorPoints', () => {
  it('runs the left door edge straight down to the crown, along the cut, then straight to the bottom', () => {
    const points = gateDoorPoints({ ...SCREEN, side: 'left' });
    // Crown is 200 x 160, centred: x 100..300, y 320..480.
    expect(points).toEqual([
      [0, 0],
      [200, 0],
      [200, 320],
      [200, 464],
      [180, 480],
      [180, 800],
      [0, 800],
    ]);
  });

  it('gives the right door the same edge, closed off on the right', () => {
    const left = gateDoorPoints({ ...SCREEN, side: 'left' });
    const right = gateDoorPoints({ ...SCREEN, side: 'right' });
    expect(right.slice(1, -1)).toEqual(left.slice(1, -1));
    expect(right[0]).toEqual([400, 0]);
    expect(right[right.length - 1]).toEqual([400, 800]);
  });

  it('follows a cut that turns back on itself', () => {
    const hook = { aspect: 1, path: [[0.5, 0], [0.2, 0.5], [0.8, 0.4], [0.5, 1]] };
    const points = gateDoorPoints({ ...SCREEN, cut: hook, side: 'left' });
    expect(points.map(([x]) => x)).toEqual([0, 200, 200, 140, 260, 200, 200, 0]);
  });

  it('returns no shape for an unusable screen size', () => {
    expect(gateDoorPoints({ ...SCREEN, side: 'left', width: 0 })).toEqual([]);
    expect(gateDoorPoints({ ...SCREEN, side: 'left', crownWidth: NaN })).toEqual([]);
  });
});

describe('pointsToSvgPath', () => {
  it('builds a closed path', () => {
    expect(pointsToSvgPath([[0, 0], [10, 0], [10, 5]])).toBe('M0 0L10 0L10 5Z');
  });

  it('is empty without points', () => {
    expect(pointsToSvgPath([])).toBe('');
  });
});

describe('gateTravel', () => {
  it('moves each door far enough that its furthest point clears the screen', () => {
    // Left door reaches 0.3 of the crown past centre (x 260); right door 0.1 before it (x 180).
    const cut = { aspect: 1, path: [[0.5, 0], [0.8, 0.5], [0.4, 1]] };
    expect(gateTravel({ width: 400, crownWidth: 200, cut, margin: 10 })).toBe(270);
  });

  it('is at least half the screen for a straight cut', () => {
    expect(gateTravel({ width: 400, crownWidth: 200, cut: CUT, margin: 0 })).toBe(220);
  });
});
