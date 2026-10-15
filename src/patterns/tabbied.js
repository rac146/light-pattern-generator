/** Tabbied adapter: normalized upstream polygons → spaced millimeter cutouts.
 * The reviewed definitions are converted at build time. We deliberately use
 * our own seeded tile layout, not Tabbied's CSS rendering or color randomness.
 * Only approved filled, simple polygons are accepted by this adapter.
 */
const TabbiedPatterns = (() => {
  const G = PanelGeometry;
  const MAX_TILES = 144;

  function tilePolygon(polygon, turn, x, y, size, curved) {
    return polygon.map(([u, v]) => {
      // Exact quarter turns avoid nearly-horizontal floating point edges.
      for (let i = 0; i < turn; i++) [u, v] = [1 - v, u];
      const px = x + u * size, py = y + v * size;
      // Curve symmetry can produce almost-equal scan rows. A 0.001 mm grid
      // stays far below our 0.04 mm chord tolerance and above Float32 spacing.
      return curved ? G.point(Math.round(px*1000)/1000, Math.round(py*1000)/1000) : G.point(px, py);
    });
  }

  function generate(settings, cuts) {
    const design = TabbiedPresets.designs.find(item => item.id === settings.style);
    const random = PatternTools.seededRandom(settings.seed);
    const insideX = settings.length - 2 * settings.borderWidth;
    const insideY = settings.width - 2 * settings.borderWidth;
    const gap = cuts.minimumWeb + 0.1;
    let cellSize = Math.min(Math.max(settings.patternSize, design.minCell || 0), insideX, insideY);
    let columns = Math.floor(insideX / cellSize);
    let rows = Math.floor(insideY / cellSize);
    // Bound the amount of geometry for the Canvas preview and STL mesher.
    while (columns * rows > MAX_TILES) {
      cellSize *= 1.02;
      columns = Math.floor(insideX / cellSize);
      rows = Math.floor(insideY / cellSize);
    }
    const size = cellSize - gap;
    if (size < 2) return { densityLimited: settings.density > 0 };
    const originX = (settings.length - columns * cellSize) / 2 + gap / 2;
    const originY = (settings.width - rows * cellSize) / 2 + gap / 2;
    let rejected = 0;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const index = row * columns + column + 1; // Upstream @i is one-based.
        const turn = design.orientation === 'cycle' ? index % 4 : design.orientation === 'fixed' ? 0 :
          design.turns[Math.floor(random() * design.turns.length)];
        // Density is occupied tiles, unlike the line module's area target.
        if (random() >= settings.density / 100) continue;
        const polygons = TabbiedShapes.shapes(design, { size, gap: gap/size, random, row, rows });
        for (const polygon of polygons) {
          const hole = tilePolygon(polygon, turn,
            originX + column * cellSize, originY + row * cellSize, size, design.kind !== 'polygon');
          if (!cuts.add(hole)) rejected++;
        }
      }
    }
    return {
      densityLimited: rejected > 0,
      notice: cellSize > settings.patternSize * 1.001 ?
        `For this panel, pattern size increased to ${cellSize.toFixed(1)} mm. Use a smaller panel for finer tiles.` : ''
    };
  }

  return {
    id: 'tabbied', label: 'Tabbied', controls: 'tiles',
    designs: TabbiedPresets.designs,
    generate
  };
})();
