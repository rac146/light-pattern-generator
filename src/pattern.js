/**
 * Deterministic random paths → constant-width polygonal cutouts.
 *
 * Every cutout is a simple polygon, entirely inside the frame. Cutouts never
 * touch or overlap, so the remaining plate is connected to its outer frame.
 * No rasterization is involved: diagonal edges stay straight in the STL.
 */
const PatternGenerator = (() => {
  const G = PanelGeometry;
  const FRAME_MM = 12.7; // Automatic half-inch frame; never a required setting.
  const LIMITS = {
    length: [40, 500], width: [40, 500], thickness: [0.6, 20],
    slitWidth: [0.6, 8], minSlitLength: [0, 1000], density: [0, 100], complexity: [1, 8]
  };
  const DEFAULTS = {
    length: 200, width: 160, thickness: 3, slitWidth: 1.6, minSlitLength: 30,
    density: 50, complexity: 5, style: 'circuit', seed: 'neon-01',
    units: 'mm', color: 'cyan'
  };
  // Counterclockwise compass directions. Even indexes are orthogonal.
  const DIRECTIONS = [
    [1, 0], [1, 1], [0, 1], [-1, 1],
    [-1, 0], [-1, -1], [0, -1], [1, -1]
  ];

  function validate(settings) {
    for (const [name, [min, max]] of Object.entries(LIMITS)) {
      if (typeof settings[name] !== 'number' || !Number.isFinite(settings[name]) ||
          settings[name] < min || settings[name] > max) {
        const label = name === 'minSlitLength' ? 'Minimum slit length' : name;
        throw new Error(`${label} must be between ${min} and ${max}${
          ['density', 'complexity'].includes(name) ? '' : ' mm'}.`);
      }
    }
    if (!Number.isInteger(settings.complexity)) throw new Error('Bends must be a whole number.');
    if (!['circuit', 'lightning', 'mixed'].includes(settings.style)) {
      throw new Error('Choose a supported pattern style.');
    }
    if (typeof settings.seed !== 'string' || !settings.seed.trim() || settings.seed.length > 64) {
      throw new Error('Enter a seed containing 1–64 characters.');
    }
    if (settings.units !== 'mm' && settings.units !== 'in') throw new Error('Choose mm or inches.');
    return settings;
  }

  // FNV-1a hashes any seed string; Mulberry32 supplies portable 32-bit randomness.
  // Do not use Math.random() here: a saved seed must recreate the same geometry.
  function seededRandom(seed) {
    let state = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      state = Math.imul(state ^ seed.charCodeAt(i), 16777619);
    }
    return function random() {
      state = (state + 0x6D2B79F5) | 0;
      let value = Math.imul(state ^ (state >>> 15), 1 | state);
      value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pathSegments(path) {
    return path.slice(1).map((b, i) => ({ a: path[i], b }));
  }

  function pathLength(path) {
    // Measure along the centerline, including every bend, rather than taking
    // the straight-line distance between the two ends.
    return pathSegments(path).reduce((total, { a, b }) =>
      total + Math.hypot(b.x - a.x, b.y - a.y), 0);
  }

  function offsetPath(path, width) {
    const halfWidth = width / 2;
    const normals = pathSegments(path).map(({ a, b }) => {
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      return { x: -(b.y - a.y) / length, y: (b.x - a.x) / length };
    });

    function side(sign) {
      return path.map((p, i) => {
        const before = normals[Math.max(0, i - 1)];
        const after = normals[Math.min(normals.length - 1, i)];
        // Intersection of the two offset lines: a sharp, mitered join.
        // Turns are limited to 90°, keeping the corner extension bounded.
        const factor = sign * halfWidth / (1 + before.x * after.x + before.y * after.y);
        return G.point(p.x + (before.x + after.x) * factor,
                       p.y + (before.y + after.y) * factor);
      });
    }

    const polygon = side(1).concat(side(-1).reverse());
    return G.signedArea(polygon) < 0 ? polygon : polygon.reverse();
  }

  function canAddSegment(path, end, occupiedSegments, clearance) {
    const start = path[path.length - 1];
    const candidateBounds = G.bounds([start, end]);
    // Skip only the immediately preceding segment, which shares this endpoint.
    const otherSegments = occupiedSegments.concat(pathSegments(path).slice(0, -1));
    return otherSegments.every(({ a, b }) =>
      !G.boundsOverlap(candidateBounds, G.bounds([a, b]), clearance) ||
      G.segmentDistanceSquared(start, end, a, b) >= clearance * clearance);
  }

  function generate(settings) {
    validate(settings);
    const random = seededRandom(settings.seed);
    const integer = (min, max) => min + Math.floor(random() * (max - min + 1));
    const pick = values => values[integer(0, values.length - 1)];
    const minimumWeb = Math.max(2.4, settings.slitWidth);
    const miterRadius = settings.slitWidth / Math.sqrt(2);
    const clearance = 2 * miterRadius + minimumWeb + 0.05;
    const margin = FRAME_MM + miterRadius + 0.01;
    const availableX = settings.length - 2 * margin;
    const availableY = settings.width - 2 * margin;
    const gridStep = Math.max(clearance * 1.35, Math.min(availableX, availableY) / 12);
    const columns = Math.floor(availableX / gridStep);
    const rows = Math.floor(availableY / gridStep);
    const originX = (settings.length - columns * gridStep) / 2;
    const originY = (settings.width - rows * gridStep) / 2;
    const usableArea = (settings.length - 2 * FRAME_MM) * (settings.width - 2 * FRAME_MM);
    const targetArea = usableArea * (0.025 + settings.density * 0.0011);
    const paths = [];
    const holes = [];
    const occupiedSegments = [];
    let openArea = 0;

    for (let attempt = 0; attempt < 700 && openArea < targetArea && holes.length < 90; attempt++) {
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
      if (!G.isSimplePolygon(hole)) continue;
      if (hole.some(p => p.x < FRAME_MM || p.x > settings.length - FRAME_MM ||
                         p.y < FRAME_MM || p.y > settings.width - FRAME_MM)) continue;
      if (!holes.every(other => G.polygonsHaveClearance(hole, other, minimumWeb))) continue;

      paths.push(path);
      holes.push(hole);
      occupiedSegments.push(...pathSegments(path));
      openArea += Math.abs(G.signedArea(hole));
    }

    return {
      settings: { ...settings }, paths, holes, openArea, minimumWeb,
      openPercent: 100 * openArea / (settings.length * settings.width),
      densityLimited: openArea < targetArea * 0.85,
      volume: (settings.length * settings.width - openArea) * settings.thickness
    };
  }

  return { DEFAULTS, LIMITS, FRAME_MM, validate, seededRandom, pathLength, offsetPath, generate };
})();
