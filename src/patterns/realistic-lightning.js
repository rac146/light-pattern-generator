/** Jagged, branching bolts. All forks join the main slit into one open tree:
 * no closed loops, polygon-union dependency, or disconnected solid islands.
 */
const RealisticLightning = (() => {
  const G = PanelGeometry;
  const { seededRandom, pathLength, offsetPath } = PatternTools;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  // Match the curve adapter's precision so nearby mesh rows survive STL float32.
  const rounded = p => G.point(Math.round(p.x * 1000) / 1000, Math.round(p.y * 1000) / 1000);

  function jaggedPath(start, end, segments, random) {
    const dx = end.x - start.x, dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    const normal = { x: -dy / length, y: dx / length };
    const weights = Array.from({ length: segments }, () => 0.75 + random() * 0.5);
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    const amplitude = length / segments * (0.18 + random() * 0.12);
    const path = [start];
    let progress = 0;
    let sign = random() < 0.5 ? -1 : 1;
    for (let i = 0; i < segments - 1; i++) {
      progress += weights[i] / total;
      // Unequal spacing and alternating kicks give rigid, irregular zigzags.
      // The bounded displacement keeps adjacent turns below 90° for offsetPath.
      const kick = sign * amplitude * (0.5 + random() * 0.5);
      path.push(G.point(start.x + dx * progress + normal.x * kick,
                        start.y + dy * progress + normal.y * kick));
      sign *= -1;
    }
    path.push(end);
    return path;
  }

  function lineIntersection(a, b, c, d) {
    const u = { x: b.x - a.x, y: b.y - a.y };
    const v = { x: d.x - c.x, y: d.y - c.y };
    const determinant = u.x * v.y - u.y * v.x;
    if (Math.abs(determinant) < G.EPSILON) return null;
    const t = ((c.x - a.x) * v.y - (c.y - a.y) * v.x) / determinant;
    return G.point(a.x + t * u.x, a.y + t * u.y);
  }

  function graftBranch(outline, edgeIndex, path, width) {
    const a = outline[edgeIndex], b = outline[(edgeIndex + 1) % outline.length];
    const branch = offsetPath(path, width);
    // Extend both sides of the branch to the parent edge. Replacing this small
    // interval with the branch contour joins the cuts without a general union.
    branch[0] = lineIntersection(a, b, branch[0], branch[1]);
    branch[branch.length - 1] = lineIntersection(a, b, branch.at(-1), branch.at(-2));
    if (!branch[0] || !branch.at(-1)) return null;
    const dx = b.x - a.x, dy = b.y - a.y, squaredLength = dx * dx + dy * dy;
    const position = p => ((p.x - a.x) * dx + (p.y - a.y) * dy) / squaredLength;
    const from = position(branch[0]), to = position(branch.at(-1));
    if (from <= 0.05 || to >= 0.95 || from >= to) return null;
    const result = [...outline.slice(0, edgeIndex + 1), ...branch, ...outline.slice(edgeIndex + 1)].map(rounded);
    return G.isSimplePolygon(result) ? result : null;
  }

  function makeBranches(outline, mainLength, settings, random) {
    const variants = [outline];
    const branchWidth = Math.max(0.6, settings.slitWidth * 0.6);
    const wanted = 1 + Math.floor(settings.complexity / 2);
    // Attach each fork to a different original side edge, away from the end caps.
    const edges = G.edges(outline).filter(({ a, b }) =>
      Math.hypot(b.x - a.x, b.y - a.y) > settings.slitWidth * 4);
    for (let attempt = 0; attempt < wanted * 8 && variants.length <= wanted; attempt++) {
      const { a, b } = edges[Math.floor(random() * edges.length)] || {};
      if (!a) break;
      const current = variants.at(-1);
      const edgeIndex = current.findIndex((p, i) => G.samePoint(p, a) && G.samePoint(current[(i + 1) % current.length], b));
      if (edgeIndex < 0) continue; // This parent edge already has a fork.
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      const tangent = { x: (b.x - a.x) / length, y: (b.y - a.y) / length };
      // Clockwise outlines contain the hole on their right; branch to the left.
      const outward = { x: -tangent.y, y: tangent.x };
      const along = 0.35 + random() * 0.3;
      const start = G.point(a.x + (b.x - a.x) * along, a.y + (b.y - a.y) * along);
      const reach = mainLength * (0.12 + random() * 0.14);
      const drift = random() < 0.5 ? -0.8 : 0.8;
      const end = G.point(start.x + reach * (outward.x + tangent.x * drift),
                          start.y + reach * (outward.y + tangent.y * drift));
      const path = jaggedPath(start, end, 3 + Math.floor(settings.complexity / 2), random);
      const branched = graftBranch(current, edgeIndex, path, branchWidth);
      if (branched) variants.push(branched);
    }
    return variants;
  }

  function generate(settings, cuts) {
    const random = seededRandom(settings.seed);
    const margin = settings.borderWidth + settings.slitWidth * 1.5 + 0.01;
    const availableX = settings.length - 2 * margin, availableY = settings.width - 2 * margin;
    // Density targets light-opening area, not a fixed bolt count. Mix lengths
    // and positions so additional bolts fill spaces throughout the panel.
    const usableArea = (settings.length - 2 * settings.borderWidth) * (settings.width - 2 * settings.borderWidth);
    const targetArea = usableArea * 0.08 * settings.density / 100;
    let openArea = 0;
    for (let attempt = 0; availableX > 0 && availableY > 0 && attempt < 800 && openArea < targetArea && cuts.holes.length < 90; attempt++) {
      const sideways = random() < 0.25;
      const across = sideways ? availableY : availableX;
      const down = sideways ? availableX : availableY;
      const toPanel = (x, y) => G.point(margin + (sideways ? y : x), margin + (sideways ? x : y));
      const span = down * (0.22 + random() * 0.66);
      const startY = (down - span) * random();
      const startX = across * (0.04 + random() * 0.92);
      const endX = clamp(startX + Math.min(across, span) * (random() - 0.5) * 0.7, across * 0.04, across * 0.96);
      const start = toPanel(startX, startY);
      const end = toPanel(endX, startY + span);
      const path = jaggedPath(start, end, 4 + settings.complexity + Math.floor(random() * 3), random);
      const mainLength = pathLength(path);
      if (mainLength < settings.minSlitLength) continue;
      const outline = offsetPath(path, settings.slitWidth).map(rounded);
      // A fork only enlarges its parent hole. Skip expensive branch construction
      // when the main bolt already conflicts with an accepted cutout.
      if (!cuts.holes.every(other => G.polygonsHaveClearance(outline, other, cuts.minimumWeb))) continue;
      const variants = makeBranches(outline, mainLength, settings, random);
      // Prefer the full tree, then remove the latest forks if they hit the frame
      // or another bolt. Every variant goes through the shared printing checks.
      for (const variant of variants.reverse()) {
        if (cuts.add(variant, path)) {
          openArea += Math.abs(G.signedArea(variant));
          break;
        }
      }
    }
    return { densityLimited: openArea < targetArea * 0.85 };
  }

  return {
    id: 'realistic-lightning', label: 'Branching lightning', controls: 'lines',
    designs: [{ id: 'realistic-lightning', label: 'Realistic lightning',
      description: 'Sharp, irregular bolts with thinner connected forks. Bends adds detail; minimum length measures the main bolt.',
      densityHint: 'Higher density fills more of the panel with bolts and connected forks.' }],
    generate
  };
})();
