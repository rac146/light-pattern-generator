# Pattern-generator candidates

Checked **October 13, 2026**. This is an evaluation shortlist, not a decision to
add dependencies. A recent publication alone does not demonstrate maintenance.

## Tabbied: strongest ready-made pattern catalog

- Package: [`tabbied`](https://www.npmjs.com/package/tabbied), **0.10.0**.
- Latest npm release: **October 12, 2026**. Twelve published versions since
  June 14, 2026, with releases spread over several months.
- The published archive contains **382 preset designs**. Circuit, Hilbert,
  Maze, and Switchback are relevant starting styles and advertise SVG support.
- Framework-independent browser API, seeded redraws, configurable grid and
  frequency, and native vector SVG export for supported designs.
- Runtime dependency: `css-doodle: ^0.51.0`. With a zero-major version, that
  range stays below 0.52.0; it does not automatically upgrade to current 0.57.x.
- Recent substantive work includes new designs and behavior fixes:
  [44 patterns added October 8](https://github.com/tabbied-design/tabbied/commit/24fd4edbc852abaa5330b69342710c239f10f102)
  and [grid-change behavior fixed October 10](https://github.com/tabbied-design/tabbied/commit/c6833b02e68b0641332f7dcdd5849a13c21c81bb).
- [CI on October 13](https://github.com/tabbied-design/tabbied/actions/runs/38356948323)
  passed package typechecking, build, unit tests, and Playwright browser tests.
- License: the **npm package and its pattern designs are MIT**. The overall
  repository has proprietary sections; its website/templates are not covered by
  the package license. The package archive includes its MIT notice.
- Track record: one listed npm maintainer, a young package and a small community
  (10 repository stars when checked). Current activity is promising, but not
  evidence of long-term support. Recent merged PRs demonstrate active work;
  outside-user support responsiveness remains insufficiently established.

### Fit for this project

Good for a gallery of complete visual styles, rather than writing every pattern
from scratch. The Circuit preset uses randomized cell borders and component
nodes; it does not implement our existing spaced, open-ended polylines.

Its SVG exporter reads a rendered browser DOM and emits paths, rectangles,
transforms, clips, and sometimes filters. This is vector artwork, not a list of
printable hole polygons. Adoption needs a prototype that:

1. Selects suitable vector-only presets and extracts their actual geometry.
2. Converts display pixels into model millimeters.
3. Resolves strokes, transforms, overlaps, and clipping into hole contours.
4. Removes closed cut loops or adds deliberate material bridges.
5. Enforces the border and minimum material gap, then checks the STL.
6. Bundles the selected designs, engine, and SVG exporter into one HTML file.

The default web-component distribution uses multiple chunks and dynamic
imports. It must be rebundled to preserve our single-file, offline requirement.
No browser/STL integration test of Tabbied was performed during this research;
the published API, catalog, relevant preset source, and export code were read.

Try the designs at [tabbied.com](https://tabbied.com).

## Mazely: strongest new candidate for angular path generation

- Package: [`mazely`](https://www.npmjs.com/package/mazely), **0.5.0**;
  the reusable engine is [`@mazely/core`](https://www.npmjs.com/package/@mazely/core).
- Latest npm release: **September 10, 2026**. Five releases since July 31, 2026.
- Twelve seeded generation algorithms, square/triangle/hexagon grids, masks,
  editable passages, and serializable geometry/topology data.
- `@mazely/core` has **no runtime dependencies** and no DOM/Canvas requirement.
- License: **MIT**, verified in the published core archive.
- Substantive recent development includes
  [triangle support August 30](https://github.com/wujue0115/mazely/commit/fcf797cb4e2d5bb56360dcd3e1e82b2a3d0a2990)
  and [hexagon support September 10](https://github.com/wujue0115/mazely/commit/72cf2640ebb41c2da00ad5f874ee912513a86287).
- [CI for the latest release](https://github.com/wujue0115/mazely/actions/runs/34495096889)
  passed lint, typechecking, tests, builds, and packaged-installation checks.
- Track record: one listed npm maintainer, three repository stars, and only a
  few months of history. External support responsiveness is not established.

### Fit and verification

Useful for circuit/labyrinth paths and several visibly different randomization
algorithms. It is a maze generator, not a general preset-art catalog. A maze
graph must be converted into selected paths; exporting every wall or passage
without adapting it could create unwanted crossings or detached material.

An isolated check ran the **published 0.5.0 core** with each of its twelve
generation algorithms on an 8×10 square grid using seed `neon-01`. For each:

- Repeated generation produced exactly the same serialized grid.
- The maze had 79 opened edges, as expected for an 80-cell spanning tree.
- A solved start-to-end path was scaled to millimeters and simplified.
- Our existing offset function produced a simple slit polygon.
- Our mesher generated a mesh with every edge incident to two triangles.

This validates the basic path-to-mesh route for those examples. It does not
verify a complete multi-path design, all grid topologies, browser integration,
or a physical print. The generator app was not modified to include the package.

Try the [documentation](https://mazely.dev) and [studio](https://studio.mazely.dev).

## css-doodle: maintained underlying engine

[`css-doodle`](https://www.npmjs.com/package/css-doodle), **0.57.1**, was published
**October 10, 2026**. It began in 2017 and has 218 published versions. Unlike a
project with no releases for years, it has current development:

- Recent fixes and new tiling features on October 10.
- [Passing CI](https://github.com/css-doodle/css-doodle/actions/runs/38051470539)
  including tests and build.
- A substantive user-reported custom-element issue received discussion and was
  [closed August 29, 2026](https://github.com/css-doodle/css-doodle/issues/143).
- MIT license, no runtime dependencies, about 6,060 repository stars when checked.

It generates patterns from CSS-like rules, randomness, shapes, and math. It is a
credible engine to evaluate if we want to author our own pattern definitions;
Tabbied adds a ready-made catalog on top. Its visual output still needs a
geometry adapter before it can become printer-ready cuts.

Explore the [playground](https://css-doodle.com/new/) and
[gallery](https://css-doodle.com/discover/).

## Candidates rejected or deferred

- **useinkjet 2.0.0**: closest on-paper API, including a Circuit preset, native
  SVG strings, and no dependencies. However, only one npm publication and all
  observed repository activity occurred on **March 12, 2026**. No ongoing
  maintenance is demonstrated; the package describes itself as experimental.
- **@johnmorrisdotca/meikyuu 3.1.1**: interesting seeded maze features, but npm
  history starts **October 2, 2026** and reaches three major versions by October
  7. Too little history to prioritize over the candidates above.
- Earlier suggestions **geopattern, patternomaly, trianglify, generate-maze**
  were withdrawn as recommendations. Their last npm publications are in
  2014, 2018, 2020, and 2021 respectively; no sufficient current-maintenance
  evidence was established.

## Recommendation

Prototype a small set of **Tabbied** presets if the goal is a broader pattern
gallery. Evaluate **Mazely's core** if the goal is richer angular path styles
while reusing our existing geometry and STL code. Neither is a verified
drop-in replacement for the full printable-panel generator.

Before adopting a dependency, recheck substantive maintenance, issue response,
test coverage, dependency health, license scope, bundle size, and the actual
offline browser integration. Pin evaluated versions and retain license notices.
No full vulnerability audit or cross-browser package qualification was done
during this research.
