"""Build the two crown pieces that slam together on launch, sharp at phone resolution.

1. Sharpen: the source crown is small (471 x 377), so its outline is traced into
   polygons and redrawn crisply at TARGET_WIDTH; the smooth gold inside is upscaled
   underneath (colors bled past the edge first, so no dark fringe).
2. Split: the cut runs along seams already in the artwork: down the centre ridge of
   the top spike, around the hollow's left edges (the hollow and the small diamond
   stay whole on the right piece, the hollow a clean diamond), to the rising band, up its top
   edge, down the shading line where it meets the right arm, back along its bottom
   edge and down its lower edge. The band interlocks with the hollow, so the pieces
   pass over each other as the gate opens. The left piece reaches slightly past the
   cut and is drawn on top, so the joined crown shows no hairline when scaled.
3. The doors' edge is written to src/components/splash/crownCut.json. It follows the
   same seams but sits just inside the gold (the image cut sits in the dark), so a
   moving door never carries a rim of purple beside its gold.

    python3 scripts/splash/split_crown.py
"""

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter
from scipy import ndimage
from skimage import measure

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets" / "splash-crown.png"
OUT_LEFT = ROOT / "assets" / "splash-crown-left.png"
OUT_RIGHT = ROOT / "assets" / "splash-crown-right.png"
OUT_CUT = ROOT / "src" / "components" / "splash" / "crownCut.json"

TARGET_WIDTH = 1200  # ~3x the largest on-screen crown (340pt)
SUPERSAMPLE = 3  # outline is drawn this much larger, then downsampled for smooth edges
OUTLINE_TOLERANCE_PX = 1.2  # polygon simplification, in source pixels (the crown is all straight lines)
MIN_OUTLINE_AREA_PX = 40  # drop stray specks along the source's ragged bottom edge
EDGE_ALPHA = 0.6  # above the half-transparent strip along the source's bottom edge
OVERLAP_PX = 2  # left piece reaches this far past the cut (target px); it is drawn on top
BLEED_SIGMA = 1.2  # source pixels
EDGE_BAND_PX = 5  # source edge pixels too soft to upscale; rebuilt from the gold just inside
BEVEL_WIDTH_PX = 3  # crisp highlight along every edge, at target size
BEVEL_COLOR = (255, 236, 170)
BEVEL_OPACITY = 0.55

# The split, in source pixels. Each seam is a line along an edge in the artwork, with a
# unit normal pointing into the gold on the left piece's side (for the right arm, into the
# arm) and the measured offset along that normal where the gold's edge (alpha 0.6) sits.
SEAMS = {
    "hollow_upper_left": ((235.5, 152.5), (177.5, 217.5), (-0.75, -0.67), 0.15),
    "hollow_lower_left": ((177.5, 217.5), (217.5, 257.5), (-0.71, 0.71), 0.35),
    "band_top": ((230, 284.5), (295.5, 219), (0.71, 0.71), -2.3),
    "band_bottom": ((357, 287.5), (274, 287.5), (0, -1), 0.1),
    "band_lower": ((274, 287.5), (194, 369), (-0.71, -0.7), -0.05),
    "right_arm": ((236, 152), (295.5, 219), (0.75, -0.66), -0.55),
}
RIDGE_X = 236  # centre ridge of the top spike (gold on both sides)
FACET_DIRECTION = (357 - 295.5, 287.5 - 219)  # shading line between the band and the right arm
CROWN_BOTTOM_Y = 372
SOURCE_HEIGHT = 377
# Where the gate doors' edge sits: just inside the gold, so a door carries no purple rim.
DOOR_INSET = 0.6
# Where the image cut sits: in the dark, so each edge's bevel stays with its own piece.
IMAGE_INSET = -2.5


def seam_line(name, inset):
    """The seam moved to (edge + inset) along its normal: a point and a direction."""
    a, b, normal, edge = SEAMS[name]
    shift = np.array(normal) * (edge + inset)
    return np.array(a) + shift, np.array(b) - np.array(a)


def cross(u, v):
    return u[0] * v[1] - u[1] * v[0]


def intersect(line1, line2):
    (p1, d1), (p2, d2) = line1, line2
    t = cross(p2 - p1, d2) / cross(d1, d2)
    return p1 + t * d1


def split_path(inset, arm_inset=None):
    """Top to bottom: ridge, around the hollow's left edges (the lower one carried across the dark gap), up the
    band's top edge, down the shading line, back along the band's bottom and down its lower edge.
    `arm_inset` (image cut only) steers into the band's peak along the right arm's edge."""
    ridge = (np.array([RIDGE_X, 0.0]), np.array([0.0, 1.0]))
    upper, lower = seam_line("hollow_upper_left", inset), seam_line("hollow_lower_left", inset)
    top, bottom = seam_line("band_top", inset), seam_line("band_bottom", inset)
    band_lower = seam_line("band_lower", inset)
    peak = intersect(seam_line("band_top", 0), seam_line("right_arm", 0))
    facet = (peak, np.array(FACET_DIRECTION, dtype=float))
    base = (np.array([0.0, CROWN_BOTTOM_Y]), np.array([1.0, 0.0]))

    into_peak = [intersect(top, facet)]
    if arm_inset is not None:
        into_peak = [intersect(top, seam_line("right_arm", arm_inset)), peak]
    points = [
        (RIDGE_X, 0),
        intersect(ridge, upper),
        intersect(upper, lower),
        # The hollow's lower-left edge carries straight on across the dark gap to the band,
        # so the hollow (on the right door) stays a clean diamond.
        intersect(lower, top),
        *into_peak,
        intersect(facet, bottom),
        intersect(bottom, band_lower),
    ]
    end = intersect(band_lower, base)
    points += [end, (end[0], SOURCE_HEIGHT)]
    return [(round(float(x), 2), round(float(y), 2)) for x, y in points]


CUT_PATH = split_path(IMAGE_INSET, arm_inset=IMAGE_INSET)
DOOR_PATH = split_path(DOOR_INSET)


def trace_outline(alpha):
    """Sub-pixel outline polygons (outer edges and holes) in source pixels, as (x, y)."""
    padded = np.pad(alpha, 1)
    contours = measure.find_contours(padded, EDGE_ALPHA)
    simplified = [measure.approximate_polygon(c, OUTLINE_TOLERANCE_PX) for c in contours]
    polygons = [[(x - 1, y - 1) for y, x in poly] for poly in simplified if len(poly) >= 3]
    return [poly for poly in polygons if polygon_area(poly) >= MIN_OUTLINE_AREA_PX]


def polygon_area(poly):
    xs, ys = np.array(poly).T
    return abs(np.dot(xs, np.roll(ys, 1)) - np.dot(ys, np.roll(xs, 1))) / 2


def render_mask(polygons, size, scale):
    """Even-odd fill (so holes stay open), drawn supersampled and scaled down."""
    big = (size[0] * SUPERSAMPLE, size[1] * SUPERSAMPLE)
    factor = scale * SUPERSAMPLE
    mask = Image.new("L", big, 0)
    for poly in polygons:
        layer = Image.new("L", big, 0)
        ImageDraw.Draw(layer).polygon([(x * factor, y * factor) for x, y in poly], fill=255)
        mask = ImageChops.logical_xor(mask.convert("1"), layer.convert("1")).convert("L")
    return mask.resize(size, Image.LANCZOS)


def bleed_colors(rgba):
    """Rebuild the soft edge band and the transparent area from the solid gold inside.

    The band gets a smooth local average (not a single nearest pixel, which speckles);
    anything further out takes the nearest filled color, so upscaling has no fringe.
    """
    # True distance, so diagonal edges lose as much as straight ones.
    solid = ndimage.distance_transform_edt(rgba[..., 3] >= 250) > EDGE_BAND_PX
    weight = ndimage.gaussian_filter(solid.astype(float), BLEED_SIGMA)
    rgb = rgba[..., :3].astype(float)
    averaged = np.stack(
        [ndimage.gaussian_filter(rgb[..., c] * solid, BLEED_SIGMA) for c in range(3)], axis=-1
    ) / np.maximum(weight, 1e-6)[..., None]
    filled = np.where(solid[..., None], rgb, averaged)
    known = solid | (weight > 0.05)
    _, (iy, ix) = ndimage.distance_transform_edt(~known, return_indices=True)
    return np.clip(filled[iy, ix], 0, 255).astype(np.uint8)


def render_bevel(polygons, size, scale):
    """A thin stroke along every outline, drawn supersampled like the mask."""
    big = (size[0] * SUPERSAMPLE, size[1] * SUPERSAMPLE)
    factor = scale * SUPERSAMPLE
    stroke = Image.new("L", big, 0)
    draw = ImageDraw.Draw(stroke)
    for poly in polygons:
        points = [(x * factor, y * factor) for x, y in poly]
        draw.line([*points, points[0]], fill=255, width=BEVEL_WIDTH_PX * SUPERSAMPLE * 2, joint="curve")
    return stroke.resize(size, Image.LANCZOS)


def sharp_crown():
    source = np.asarray(Image.open(SOURCE).convert("RGBA"))
    scale = TARGET_WIDTH / source.shape[1]
    size = (TARGET_WIDTH, round(source.shape[0] * scale))
    polygons = trace_outline(source[..., 3] / 255)
    colors = np.asarray(Image.fromarray(bleed_colors(source)).resize(size, Image.LANCZOS)).astype(float)
    # The stroke is centred on the outline; the mask keeps only its inner half.
    bevel = np.asarray(render_bevel(polygons, size, scale))[..., None] / 255 * BEVEL_OPACITY
    colors = colors * (1 - bevel) + np.array(BEVEL_COLOR) * bevel
    crown = Image.fromarray(np.clip(colors, 0, 255).astype(np.uint8)).convert("RGBA")
    crown.putalpha(render_mask(polygons, size, scale))
    return crown, scale


def cut_masks(size, scale):
    width, height = size
    path = [(x * scale, y * scale) for x, y in CUT_PATH]
    path = [(path[0][0], -1), *path[1:], (path[-1][0], height + 1)]
    left = Image.new("L", size, 0)
    ImageDraw.Draw(left).polygon([(-1, -1), *path, (-1, height + 1)], fill=255)
    right = Image.fromarray(255 - np.asarray(left))
    # Only the left piece grows: where the cut crosses gold (spike ridge, band shading line)
    # it covers the seam; along dark edges it picks up nothing, so no slivers show when apart.
    return left.filter(ImageFilter.MaxFilter(OVERLAP_PX * 2 + 1)), right


def with_mask(image, mask):
    rgba = np.asarray(image).copy()
    rgba[..., 3] = (rgba[..., 3].astype(np.uint16) * np.asarray(mask) // 255).astype(np.uint8)
    return Image.fromarray(rgba)


def write_cut(source_size):
    """The door edge, normalised to the crown, for the app's gate doors."""
    width, height = source_size
    points = [[round(x / width, 5), round(y / height, 5)] for x, y in DOOR_PATH]
    OUT_CUT.write_text(json.dumps({"aspect": round(width / height, 5), "path": points}, indent=2) + "\n")


def main():
    crown, scale = sharp_crown()
    left, right = cut_masks(crown.size, scale)
    with_mask(crown, left).save(OUT_LEFT, optimize=True)
    with_mask(crown, right).save(OUT_RIGHT, optimize=True)
    write_cut(Image.open(SOURCE).size)
    print(f"Wrote {OUT_LEFT.name}, {OUT_RIGHT.name} ({crown.size[0]}x{crown.size[1]}) and {OUT_CUT.name}")


if __name__ == "__main__":
    main()
