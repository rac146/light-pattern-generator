/**
 * Shared 2D geometry. All model coordinates are millimeters.
 *
 * Snap coordinates to one millionth of a millimeter so independently computed
 * intersections become identical vertices, including in the STL export.
 */
const PanelGeometry = (() => {
  const EPSILON = 1e-7;
  const PRECISION = 1e6;

  function snap(value) {
    return Math.round(value * PRECISION) / PRECISION;
  }

  function point(x, y) {
    return { x: snap(x), y: snap(y) };
  }

  function samePoint(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  function cross(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  }

  function signedArea(polygon) {
    let area = 0;
    for (let i = 0; i < polygon.length; i++) {
      const a = polygon[i];
      const b = polygon[(i + 1) % polygon.length];
      area += a.x * b.y - b.x * a.y;
    }
    return area / 2;
  }

  function edges(polygon) {
    return polygon.map((a, i) => ({ a, b: polygon[(i + 1) % polygon.length] }));
  }

  function bounds(points) {
    return {
      minX: Math.min(...points.map(p => p.x)),
      maxX: Math.max(...points.map(p => p.x)),
      minY: Math.min(...points.map(p => p.y)),
      maxY: Math.max(...points.map(p => p.y))
    };
  }

  function boundsOverlap(a, b, clearance = 0) {
    return a.minX <= b.maxX + clearance && a.maxX + clearance >= b.minX &&
      a.minY <= b.maxY + clearance && a.maxY + clearance >= b.minY;
  }

  function segmentsIntersect(a, b, c, d) {
    if (!boundsOverlap(bounds([a, b]), bounds([c, d]))) return false;
    return cross(a, b, c) * cross(a, b, d) <= 0 &&
      cross(c, d, a) * cross(c, d, b) <= 0;
  }

  function pointSegmentDistanceSquared(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1,
      ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared));
    return (p.x - a.x - t * dx) ** 2 + (p.y - a.y - t * dy) ** 2;
  }

  function segmentDistanceSquared(a, b, c, d) {
    if (segmentsIntersect(a, b, c, d)) return 0;
    return Math.min(
      pointSegmentDistanceSquared(a, c, d),
      pointSegmentDistanceSquared(b, c, d),
      pointSegmentDistanceSquared(c, a, b),
      pointSegmentDistanceSquared(d, a, b)
    );
  }

  function pointInPolygon(p, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i];
      const b = polygon[j];
      if ((a.y > p.y) !== (b.y > p.y) &&
          p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) {
        inside = !inside;
      }
    }
    return inside;
  }

  function isSimplePolygon(polygon) {
    const segments = edges(polygon);
    for (let i = 0; i < segments.length; i++) {
      for (let j = i + 1; j < segments.length; j++) {
        // Neighboring edges intentionally meet at their common vertex.
        if (j === i + 1 || (i === 0 && j === segments.length - 1)) continue;
        if (segmentsIntersect(segments[i].a, segments[i].b,
                              segments[j].a, segments[j].b)) return false;
      }
    }
    return Math.abs(signedArea(polygon)) > EPSILON;
  }

  function polygonsHaveClearance(a, b, clearance) {
    if (!boundsOverlap(bounds(a), bounds(b), clearance)) return true;
    if (pointInPolygon(a[0], b) || pointInPolygon(b[0], a)) return false;
    for (const first of edges(a)) {
      for (const second of edges(b)) {
        if (segmentDistanceSquared(first.a, first.b, second.a, second.b) <
            clearance * clearance) return false;
      }
    }
    return true;
  }

  return {
    EPSILON, snap, point, samePoint, cross, signedArea, edges, bounds,
    boundsOverlap, segmentsIntersect, segmentDistanceSquared,
    pointInPolygon, isSimplePolygon, polygonsHaveClearance
  };
})();
