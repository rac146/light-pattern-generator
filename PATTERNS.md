# Pattern modules

The user still opens just `index.html`. Development is split into small files;
`scripts/build.mjs` assembles them without minifying them or fetching anything.

## Flow

```text
Form settings → registry → family generator → shared cutout checks
                                             ↓
                                    polygons in millimeters
                                             ↓
                                      preview + STL mesh
```

`src/pattern.js` owns settings validation, the registry, printing constraints,
and result statistics. It never implements a particular pattern algorithm.
`src/pattern-tools.js` provides seeded randomness and path-outline math.
The preview and mesher only read validated polygons; neither needs a branch
for each new family.

Each family provides this small interface:

```js
{
  id: 'family-name',
  label: 'Name shown in the selector',
  controls: 'lines', // or 'tiles'
  designs: [{ id: 'family:design', label: 'Design name', description: '…' }],
  generate(settings, cuts) {
    cuts.add(polygon);       // filled cutout, coordinates in millimeters
    cuts.add(outline, path); // optional centerline: enforces minimum slit length
    return { densityLimited: false, notice: '' };
  }
}
```

`cuts.add()` rejects nonfinite coordinates, nonsimple polygons, edge cuts,
overlap, nesting, and insufficient gaps. It snaps accepted coordinates and
ensures clockwise hole winding. A closed polygon here means a **filled hole**;
cutting the stroke of a closed loop would leave a detached island and needs
a different, reviewed conversion. All accepted holes remain separate, wholly
inside a positive frame.

To add a family, add its file to `scripts/source-modules.mjs` before `pattern`,
then register it in `PatternGenerator.families`. The selector builds its options
from the registry. Add controls in `app.js` and the template only if the new
family needs a new kind of parameter. Keep DOM and download code in the UI,
not in the generator. Test seed reproducibility, borders, spacing, connected
watertight meshes, and the exported STL.

## Original lines

`src/patterns/simple.js` keeps Circuit, angled Lightning, and Mixed. Their IDs,
random call order, and geometry are preserved. Reference geometry hashes from
the previous HTML guard saved designs against accidental changes.

Slit width, minimum **whole centerline** length, and bends apply to these styles.
Density targets an amount of open area and can be limited by spacing.

## Realistic lightning

`src/patterns/realistic-lightning.js` is a separate seeded line generator.
Unevenly spaced vertices alternate across the main bolt's direction to make
sharp, irregular zigzags rather than the original eight-direction grid.
Bends controls the number of vertices and forks. Density targets light-opening
area, reaching 8% of the usable interior at 100%, subject to spacing and minimum
length. Bolts vary in length and position to fill the panel; zero density leaves
a solid plate. Minimum slit length applies to each main centerline, including bends.

Forks use 60% of the main slit width, with a 0.6 mm floor. Each fork replaces
a short interval on a main outline edge with its own contour, forming a single
simple branching hole without a polygon union library. There are no closed
loops or detached small branch slits. Whole candidate outlines pass through
the same border and spacing checks; forks that do not fit are removed before
trying the main bolt alone. Coordinates are rounded to 0.001 mm for STL.

This uses a small native algorithm; Tabbied 0.10.0 has no realistic lightning
preset. The existing line algorithms and Tabbied adapters remain independent.

## Tabbied adapter

`src/patterns/tabbied.js` currently supports **70 reviewed designs**: 50 static
polygon designs plus 20 recipes for curves, multiple shapes, bridged rings,
and path-like tiles. Search and category groups keep the selector manageable.
The **official Tabbied 0.10.0 definitions** are pinned, unmodified, in
`vendor/tabbied/0.10.0/`. Their MIT notice and archive integrity are retained;
the notice is also embedded in the standalone HTML.

`scripts/tabbied-reviewed.mjs` lists the approved designs.
`scripts/tabbied-polygons.mjs` converts static percentage polygons;
`scripts/tabbied-recipes.mjs` describes the extended conversions.
`src/patterns/tabbied-shapes.js` turns those recipes into actual polygons.
`scripts/tabbied-presets.mjs` assembles them during the build and writes
`src/patterns/tabbied-presets.js`, which should not be edited by hand.
The adapter scales the shapes into square tiles, applies the design's
quarter-turn choices, and submits filled cutouts to the common checks.
Gap between tile bounds is at least 2.4 mm, so neighboring shapes stay separate.

This is a **geometry adaptation of the upstream presets**, not the full
Tabbied/css-doodle renderer or its random-seed implementation. Our seeded tile
occupancy and layout are controlled in millimeters. Colors, transitions, and
cross-tile joining are not imported. No npm runtime dependency is installed.
This is why the app remains deterministic, synchronous, and offline, and why
the original tiled artwork may differ from its printable adaptation.

Pattern size sets the tile pitch, not a constant slit width. Density is the
probability a tile is occupied; 100% fills every complete tile, while 0% leaves
a solid panel. Line-specific controls are hidden and preserved. Up to 144 tiles
are allowed, with up to four cutouts per tile. Large panels with fine tiles
automatically increase tile size; multi-part designs also set a minimum pitch
to maintain spacing. The UI reports increases. Border, thickness, seed, and
units are shared.

Curves use a maximum 0.04 mm chord error and 0.001 mm coordinate rounding to
avoid almost-identical scan rows collapsing in Float32 STL coordinates.
Ring patterns such as Annulus and Casing are split into two cutouts, leaving
solid bridges that keep the center attached. Curl, Truchet Rings, Anabranch,
Maze, and Circuit keep gaps between tiles instead of closed connected networks.
These changes are described in the selector.

`TABBIED_COVERAGE.json` records all 382 catalog entries, their support status,
and the converter used. It is generated at build time and is documentation;
the full catalog is not shipped in the HTML. The remaining 312 entries require
explicit recipes and qualification. This is not a claim that all patterns can
be represented faithfully as through-cuts.

## Adding more Tabbied designs

1. Review the published preset, license, dependency maintenance, and actual
   geometry. A native SVG export flag alone does not establish printability.
2. Import the selected definition from an integrity-verified npm archive using
   `scripts/import-tabbied.mjs`. Its shared reviewed list intentionally limits the imported set.
3. Add the definition to `scripts/tabbied-reviewed.mjs` and add its converter
   or recipe. Do not edit generated presets or the coverage JSON. Existing
   recipes cover static polygons, rounded shapes, arc bands, bridged rings,
   and selected multi-part or path-like tiles. General strokes, clipping,
   layout fields, arbitrary masks/gradients, and overlaps still need support.
4. Choose the meaning of each control and preserve the design's identity.
   Don't silently reinterpret every pattern as a line.
5. Verify geometry and STL at several seeds, densities, sizes, and borders.
   Enable the new selection only after those checks pass.

Do not feed arbitrary SVG or CSS through a permissive parser. A broad SVG
adapter would need stroke expansion, curve flattening with a defined tolerance,
transform composition, clipping/union handling, and deliberate material bridges
for closed line networks. Keep that work within the Tabbied module/converters,
not in the shared STL exporter. Supporting all 382 designs will require several
such conversion strategies; it is not a safe one-line catalog import.
