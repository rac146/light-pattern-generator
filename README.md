# Light Pattern Generator

Generate a rectangular 3D-printable panel with randomized through-slits for
backlighting. The app is a single, self-contained HTML file with no dependencies,
network requests, installation, or server.

## Use it

1. Open **index.html** in a current Chrome, Edge, Firefox, or Safari browser.
   Windows, macOS, and Linux are supported where the browser is available.
2. Set the panel length, width, thickness, border width, and slit width. Switch
   between mm and inches whenever you like; exported STL coordinates are always **mm**.
3. Choose Circuit, Lightning, or Mixed. Set the minimum slit length, adjust
   density and bends, or shuffle until you find a pattern you like.
4. Check Backlit, Cutouts, or the rotatable 3D model preview.
5. Download the STL and open it in your slicer. Print with the large flat face
   on the bed; the through-slits do not require supports.

A seed plus the same geometry settings reproduces the same pattern. Save a
settings JSON file to share or keep a design. Load it to restore the dimensions,
seed, and style. If browser storage is available, the app also remembers your
last settings. Moving the HTML or using another browser may reset that memory;
saved JSON files work independently of browser storage.

Minimum slit length defaults to **30 mm** (about 1.18 inches), measured along
the entire slit's centerline, including bends. It does not set a minimum for
each individual straight segment. Set it to **0** to allow any path length.
Settings saved by the earlier app still load: files without this field use 0
to reproduce their original design. Existing browser sessions without the field
adopt the new 30 mm default when the updated app opens.

Border width defaults to **6 mm** (about 0.24 inches), down from the original
12.7 mm (½ inch). It sets the minimum solid material between each cutout and
all four outside edges, including slit corners. Old settings files without a
border field keep their original 12.7 mm border; browser sessions without the
field adopt the new 6 mm default. Set 12.7 mm manually for the original margin.

The backlight colors only affect the preview. Use opaque filament for stronger
contrast, and check that the model fits your printer bed. Preview brightness
does not predict a real light source’s brightness.

## Geometry and practical limits

- The panel has a configurable solid border, defaulting to **6 mm**. Borders
  must be 1–200 mm and less than half the panel's shorter dimension. A positive
  frame keeps cutouts away from the exterior; thinner borders may be more flexible.
- Cutouts have a constant width, flat ends, and sharp, mitered bends.
- Shorter paths are discarded before becoming cutouts; the generator never
  relaxes the minimum length to fill an empty area.
- Paths never close, cross themselves, or touch another cutout. Each cutout
  becomes a simple polygon wholly inside the frame, so no disconnected solid
  islands are produced.
- Automatic material spacing is at least **2.4 mm**, increasing with slit width.
  This keeps nearby cuts apart; mechanical strength still depends on filament,
  layer adhesion, thickness, and the final size.
- Density is a target rather than a fixed open percentage. Spacing and minimum
  slit length can limit it on small or crowded panels. The UI reports the actual
  light opening percentage.
- Dimensions: 40–500 mm; thickness: 0.6–20 mm; slits: 0.6–8 mm.
  These are model limits, not a printer bed or nozzle profile.
- Minimum slit length: 0–1000 mm. A high minimum, a small panel, or very wide
  slits may leave no room for a pattern. The app reports this and allows exporting
  the resulting solid plate. Lower the minimum or allow more bends if needed.
- STL stores no units. Import as millimeters if your slicer asks.

## Edit the code

The source is plain, commented JavaScript with named functions and no framework.
The distributable `index.html` keeps that code readable too; it is not minified.

| File | Responsibility |
| --- | --- |
| `src/index.template.html` | Accessible controls and page structure |
| `src/styles.css` | Layout, appearance, responsive sizing |
| `src/geometry.js` | Shared 2D math and spacing checks |
| `src/pattern.js` | Seeded random paths and slit outlines |
| `src/mesh.js` | Watertight extrusion and binary STL writer |
| `src/preview.js` | Canvas backlit, cutout, and 3D views |
| `src/app.js` | Form events, unit conversion, settings, downloads |
| `scripts/build.mjs` | Inlines the source into the standalone HTML |

To change the app, edit `src/` and rebuild using **Node.js 20 or newer**:

```sh
npm run build
npm test
```

There is nothing to install: both commands use only Node’s built-in modules.
Node is not needed to open or use the generated HTML. The build can run from
any working directory with `node /path/to/scripts/build.mjs`.

The mesher divides the material into horizontal trapezoids at polygon vertices,
triangulates their flat faces, and adds exterior and hole walls. Shared edge
splits prevent T-junctions, including at diagonal and horizontal slits. Geometry
tests check edge incidence, triangle winding, one connected component, border,
spacing, solid volume, and the actual binary STL records.

An optional integration check uses an installed Chrome/Chromium browser and its
debugging pipe, also without a server or packages:

```sh
node scripts/browser-check.mjs
# Or supply the executable path:
node scripts/browser-check.mjs "/path/to/chrome"
```

It checks downloads, settings import, unit switching, input validation, 3D
interaction, narrow screens, absence of external app requests, and a copy of the
HTML running without companion files. It also compares the browser’s downloaded
STL byte for byte with Node’s output for the same seed. Screenshots, downloads,
and temporary browser profiles are written to the ignored `artifacts/` folder.

Current browsers provide all required APIs: Canvas 2D, Pointer Events,
ResizeObserver, file downloads, Blob, and typed arrays. No WebGL or GPU-specific
feature is required. JavaScript must be enabled. Opening the source template
directly does not run the app; open the built `index.html`.
