// Shapes of the two launch-gate doors. Their inner edge follows the cut through the
// crown (scripts/splash/split_crown.py → crownCut.json): straight down to the crown,
// along the crown's own lines, then straight on to the bottom of the screen.

const round = (value) => Math.round(value * 100) / 100;

/**
 * Door outline in screen points, for a crown `crownWidth` wide centred on the screen.
 * `cut.path` is normalised to the crown ([0..1, 0..1], top to bottom). It may turn back
 * on itself (the crown's pieces interlock); the outline stays a simple polygon as long
 * as the cut doesn't cross itself.
 */
export function gateDoorPoints({ side, width, height, crownWidth, cut }) {
  const valid = [width, height, crownWidth].every((n) => Number.isFinite(n) && n > 0);
  if (!valid || !cut?.path?.length) return [];

  const crownHeight = crownWidth / cut.aspect;
  const left = (width - crownWidth) / 2;
  const top = (height - crownHeight) / 2;
  const outerX = side === 'left' ? 0 : width;

  const edge = cut.path.map(([nx, ny]) => [round(left + nx * crownWidth), round(top + ny * crownHeight)]);
  const [firstX] = edge[0];
  const [lastX] = edge[edge.length - 1];
  return [[outerX, 0], [firstX, 0], ...edge, [lastX, height], [outerX, height]];
}

export function pointsToSvgPath(points) {
  if (!points.length) return '';
  return `${points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join('')}Z`;
}

/**
 * How far each door must slide outward (points) to be fully off screen, including the
 * parts of the crown that reach past the middle. Doors start and end this far out.
 */
export function gateTravel({ width, crownWidth, cut, margin = 0 }) {
  const xs = cut.path.map(([nx]) => nx);
  const reach = Math.max(Math.max(...xs) - 0.5, 0.5 - Math.min(...xs), 0) * crownWidth;
  return width / 2 + reach + margin;
}
