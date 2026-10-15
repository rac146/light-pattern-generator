/** Original Circuit, Lightning and Mixed algorithms. Keep random call order
 * stable: existing saved seeds must continue to reproduce their designs. */
const SimplePatterns = (() => {
  const G = PanelGeometry;
  const { seededRandom, pathSegments, pathLength, offsetPath } = PatternTools;
  // Counterclockwise compass directions. Even indexes are orthogonal.
  const DIRECTIONS = [
    [1, 0], [1, 1], [0, 1], [-1, 1],
    [-1, 0], [-1, -1], [0, -1], [1, -1]
  ];

  function canAddSegment(path, end, occupiedSegments, clearance) {
    const start = path[path.length - 1];
    const candidateBounds = G.bounds([start, end]);
    // Skip only the immediately preceding segment, which shares this endpoint.
    const otherSegments = occupiedSegments.concat(pathSegments(path).slice(0, -1));
    return otherSegments.every(({ a, b }) =>
      !G.boundsOverlap(candidateBounds, G.bounds([a, b]), clearance) ||
      G.segmentDistanceSquared(start, end, a, b) >= clearance * clearance);
  }

  function generate(settings, cuts) {
    const random = seededRandom(settings.seed);
    const integer = (min, max) => min + Math.floor(random() * (max - min + 1));
    const pick = values => values[integer(0, values.length - 1)];
    const minimumWeb = cuts.minimumWeb;
    const miterRadius = settings.slitWidth / Math.sqrt(2);
    const clearance = 2 * miterRadius + minimumWeb + 0.05;
    const border = settings.borderWidth;
    // Leave room for the full slit outline, including its mitered corners.
    // Border width measures solid material from the edge to the cutout itself.
    const margin = border + miterRadius + 0.01;
    const availableX = Math.max(0, settings.length - 2 * margin);
    const availableY = Math.max(0, settings.width - 2 * margin);
    const hasPatternSpace = availableX > 0 && availableY > 0;
    const gridStep = Math.max(clearance * 1.35, Math.min(availableX, availableY) / 12);
    const columns = Math.floor(availableX / gridStep);
    const rows = Math.floor(availableY / gridStep);
    const originX = (settings.length - columns * gridStep) / 2;
    const originY = (settings.width - rows * gridStep) / 2;
    const usableArea = (settings.length - 2 * border) * (settings.width - 2 * border);
    const targetArea = usableArea * (0.025 + settings.density * 0.0011);
    const holes = cuts.holes;
    const occupiedSegments = [];
    let openArea = 0;

    for (let attempt = 0; hasPatternSpace && attempt < 700 && openArea < targetArea && holes.length < 90; attempt++) {
      const style = settings.style === 'mixed' ? pick(['circuit', 'lightning']) : settings.style;
      let direction = pick(style === 'circuit' ? [0, 2, 4, 6] : [1, 3, 5, 7]);
      let column = integer(0, columns);
      let row = integer(0, rows);
      const path = [G.point(originX + column * gridStep, originY + row * gridStep)];
      const wantedSegments = integer(2, settings.complexity + 2);

      for (let segment = 0; segment < wantedSegments; segment++) {
        let added = false;
        for (let trial = 0; trial < 10; trial++) {
          const turn = segment === 0 ? 0 :
            style === 'circuit' ? pick([-2, 2]) : pick([-2, -1, 1, 2]);
          const nextDirection = (direction + turn + 8) % 8;
          const [dx, dy] = DIRECTIONS[nextDirection];
          const steps = integer(1, 3);
          const nextColumn = column + dx * steps;
          const nextRow = row + dy * steps;
          if (nextColumn < 0 || nextColumn > columns || nextRow < 0 || nextRow > rows) continue;
          const end = G.point(originX + nextColumn * gridStep, originY + nextRow * gridStep);
          if (!canAddSegment(path, end, occupiedSegments, clearance)) continue;
          path.push(end);
          column = nextColumn;
          row = nextRow;
          direction = nextDirection;
          added = true;
          break;
        }
        if (!added) break;
      }

      if (path.length < 2) continue;
      // A path can stop early when it runs into the frame or another slit.
      // Reject that entire candidate before it claims any space in the panel.
      // Never shorten this threshold just to fill the requested density.
      if (pathLength(path) < settings.minSlitLength) continue;
      const hole = offsetPath(path, settings.slitWidth);
      if (!cuts.add(hole, path)) continue;

      occupiedSegments.push(...pathSegments(path));
      openArea += Math.abs(G.signedArea(hole));
    }

    return { densityLimited: openArea < targetArea * 0.85 };
  }

  return {
    id: 'simple', label: 'Original lines', controls: 'lines',
    designs: [
      { id: 'circuit', label: 'Circuit · square turns' },
      { id: 'lightning', label: 'Lightning · angled turns' },
      { id: 'mixed', label: 'Mixed · a bit of both' }
    ],
    generate
  };
})();
