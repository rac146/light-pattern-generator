/** Shared seeded randomness and open-path outline math, all in mm. */
const PatternTools = (() => {
  const G = PanelGeometry;
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


  return { seededRandom, pathSegments, pathLength, offsetPath };
})();
