/**
 * Watertight extrusion without dependencies or polygon-boolean libraries.
 *
 * Slice the panel into horizontal bands at every polygon vertex. Within each
 * band, the material consists of convex trapezoids, which are easy to mesh.
 * Split EVERY horizontal edge at the same row coordinates to avoid T-junctions
 * where bands meet. Apply the same splits to the hole walls and outer walls.
 *
 * Returned positions are an unindexed list of triangles, counterclockwise
 * when viewed from outside the solid. STL has no unit field; values are in mm.
 */
const MeshBuilder = (() => {
  const G = PanelGeometry;

  function uniqueSorted(values) {
    return [...new Set(values.map(G.snap))].sort((a, b) => a - b);
  }

  function xAtY(edge, y) {
    if (y === edge.a.y) return edge.a.x;
    if (y === edge.b.y) return edge.b.x;
    return G.snap(edge.a.x + (y - edge.a.y) *
      (edge.b.x - edge.a.x) / (edge.b.y - edge.a.y));
  }

  function build(pattern) {
    const { length, width, thickness } = pattern.settings;
    const outer = [G.point(0, 0), G.point(length, 0), G.point(length, width), G.point(0, width)];
    // Outer ring is CCW; each hole is CW. Material always lies left of an edge.
    const contours = [outer, ...pattern.holes];
    const edges = contours.flatMap(G.edges);
    const levels = uniqueSorted(contours.flatMap(polygon => polygon.map(p => p.y)));
    const rows = levels.map(y => ({
      y,
      xs: uniqueSorted(edges.flatMap(edge => {
        if (y < Math.min(edge.a.y, edge.b.y) || y > Math.max(edge.a.y, edge.b.y)) return [];
        return edge.a.y === edge.b.y ? [edge.a.x, edge.b.x] : [xAtY(edge, y)];
      }))
    }));
    const rowLookup = new Map(rows.map(row => [row.y, row]));
    const positions = [];

    function triangle(a, b, c) {
      positions.push(...a, ...b, ...c);
    }

    function horizontalPoints(row, left, right) {
      return row.xs.filter(x => x >= left && x <= right).map(x => G.point(x, row.y));
    }

    function cap(ring) {
      const cleaned = ring.filter((p, i) => i === 0 || !G.samePoint(p, ring[i - 1]));
      if (cleaned.length > 1 && G.samePoint(cleaned[0], cleaned[cleaned.length - 1])) cleaned.pop();
      if (cleaned.length < 3 || Math.abs(G.signedArea(cleaned)) < G.EPSILON) return;
      // A fan through an interior point preserves every collinear edge vertex.
      const center = G.point(
        cleaned.reduce((sum, p) => sum + p.x, 0) / cleaned.length,
        cleaned.reduce((sum, p) => sum + p.y, 0) / cleaned.length
      );
      for (let i = 0; i < cleaned.length; i++) {
        const a = cleaned[i];
        const b = cleaned[(i + 1) % cleaned.length];
        triangle([center.x, center.y, thickness], [a.x, a.y, thickness], [b.x, b.y, thickness]);
        triangle([center.x, center.y, 0], [b.x, b.y, 0], [a.x, a.y, 0]);
      }
    }

    for (let band = 0; band < rows.length - 1; band++) {
      const bottom = rows[band];
      const top = rows[band + 1];
      const middleY = (bottom.y + top.y) / 2;
      const crossings = edges
        .filter(edge => middleY > Math.min(edge.a.y, edge.b.y) &&
                        middleY < Math.max(edge.a.y, edge.b.y))
        .map(edge => ({ edge, x: xAtY(edge, middleY) }))
        .sort((a, b) => a.x - b.x);
      if (crossings.length % 2 !== 0) throw new Error('Invalid polygon crossings.');

      // Even/odd filling: material, hole, material, hole, …
      for (let i = 0; i < crossings.length; i += 2) {
        const left = crossings[i].edge;
        const right = crossings[i + 1].edge;
        const lower = horizontalPoints(bottom, xAtY(left, bottom.y), xAtY(right, bottom.y));
        const upper = horizontalPoints(top, xAtY(left, top.y), xAtY(right, top.y));
        cap(lower.concat(upper.reverse()));
      }
    }

    function wall(a, b) {
      if (G.samePoint(a, b)) return;
      triangle([a.x, a.y, 0], [b.x, b.y, 0], [b.x, b.y, thickness]);
      triangle([a.x, a.y, 0], [b.x, b.y, thickness], [a.x, a.y, thickness]);
    }

    for (const edge of edges) {
      let points;
      if (edge.a.y === edge.b.y) {
        points = horizontalPoints(rowLookup.get(edge.a.y),
          Math.min(edge.a.x, edge.b.x), Math.max(edge.a.x, edge.b.x));
        if (edge.a.x > edge.b.x) points.reverse();
      } else {
        points = levels
          .filter(y => y >= Math.min(edge.a.y, edge.b.y) && y <= Math.max(edge.a.y, edge.b.y))
          .map(y => G.point(xAtY(edge, y), y));
        if (edge.a.y > edge.b.y) points.reverse();
      }
      for (let i = 0; i < points.length - 1; i++) wall(points[i], points[i + 1]);
    }

    return { positions: new Float32Array(positions), triangleCount: positions.length / 9 };
  }

  function normalAt(positions, offset) {
    const ux = positions[offset + 3] - positions[offset];
    const uy = positions[offset + 4] - positions[offset + 1];
    const uz = positions[offset + 5] - positions[offset + 2];
    const vx = positions[offset + 6] - positions[offset];
    const vy = positions[offset + 7] - positions[offset + 1];
    const vz = positions[offset + 8] - positions[offset + 2];
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const magnitude = Math.hypot(nx, ny, nz);
    return magnitude === 0 ? [0, 0, 0] : [nx / magnitude, ny / magnitude, nz / magnitude];
  }

  function binarySTL(mesh) {
    const buffer = new ArrayBuffer(84 + mesh.triangleCount * 50);
    const view = new DataView(buffer);
    const header = new TextEncoder().encode('Light Pattern Generator | millimeters | offline');
    new Uint8Array(buffer, 0, header.length).set(header);
    view.setUint32(80, mesh.triangleCount, true);
    let offset = 84;
    for (let i = 0; i < mesh.positions.length; i += 9) {
      for (const value of normalAt(mesh.positions, i)) {
        view.setFloat32(offset, value, true);
        offset += 4;
      }
      for (let j = 0; j < 9; j++) {
        view.setFloat32(offset, mesh.positions[i + j], true);
        offset += 4;
      }
      view.setUint16(offset, 0, true);
      offset += 2;
    }
    return buffer;
  }

  return { build, binarySTL, normalAt };
})();
