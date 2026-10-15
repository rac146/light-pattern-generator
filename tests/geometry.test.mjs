// Node's built-in runner: no packages and no ESP/toolchain builds.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { engineModules } from '../scripts/source-modules.mjs';
import { tabbiedPresetSource } from '../scripts/tabbied-presets.mjs';
import { tabbiedCoverageSource } from '../scripts/tabbied-presets.mjs';

const root = new URL('../', import.meta.url);
const sources = await Promise.all(engineModules.map(name =>
  readFile(new URL(`src/${name}.js`, root), 'utf8')));
const context = vm.createContext({ TextEncoder });
vm.runInContext(sources.join('\n') +
  '\nglobalThis.engine = { G: PanelGeometry, P: PatternGenerator, M: MeshBuilder, shapes: TabbiedShapes };', context);
const { G, P, M, shapes } = context.engine;
const settings = changes => ({ ...P.DEFAULTS, ...changes });

test('checked-in Tabbied geometry matches conversion of the pinned upstream definitions', async () => {
  assert.equal(await readFile(new URL('src/patterns/tabbied-presets.js', root), 'utf8'), tabbiedPresetSource());
  assert.equal(await readFile(new URL('TABBIED_COVERAGE.json', root), 'utf8'), await tabbiedCoverageSource());
});

test('all reviewed Tabbied designs regenerate deterministically without relaxing print spacing', () => {
  assert.equal(P.families[1].designs.length, 70);
  for (const design of P.families[1].designs) {
    const config = settings({style: design.id, density: 100, seed: 'catalog-seed'});
    const first = P.generate(config);
    assert.ok(first.holes.length > 0, design.id);
    assert.ok(!first.densityLimited, design.id);
    assert.deepEqual(first.holes, P.generate(config).holes);
    assert.deepEqual(first.holes, P.generate({...config,slitWidth:8,minSlitLength:1000,complexity:1}).holes);
    assert.equal(P.generate({...config,density:0}).holes.length, 0);
  }
});

test('curve chords stay within their tolerance and ring centers remain connected to solid bridges', () => {
  for (const size of [10, 30, 150]) {
    const radius = 0.5;
    const points = shapes.arc(0.5,0.5,radius,0,Math.PI*2,size);
    for (let i=1; i<points.length; i++) {
      const midX = (points[i-1][0]+points[i][0])/2;
      const midY = (points[i-1][1]+points[i][1])/2;
      const chordError = size*(radius-Math.hypot(midX-0.5,midY-0.5));
      assert.ok(chordError <= shapes.CURVE_ERROR_MM+1e-9);
    }
  }
  for (const style of ['tabbied:annulus','tabbied:casing']) {
    const pattern = P.generate(settings({style,density:100,patternSize:30}));
    assert.equal(pattern.holes.length, 48, 'Two open halves per tile');
    // No cut reaches any of the tile centers; the shared clearance tests above
    // verify that each pair of halves leaves material between them.
    for (const x of [25,55,85,115,145,175]) {
      for (const y of [35,65,95,125]) {
        assert.ok(pattern.holes.every(hole => !G.pointInPolygon({x,y},hole)));
      }
    }
  }
});

function inspectMesh(pattern) {
  const mesh = M.build(pattern);
  const vertices = mesh.positions;
  const edgeUses = new Map();
  const neighbors = new Map();
  let volume = 0;
  const vertexKey = offset => `${vertices[offset]},${vertices[offset + 1]},${vertices[offset + 2]}`;

  for (let i = 0; i < vertices.length; i += 9) {
    const a = Array.from(vertices.slice(i, i + 3));
    const b = Array.from(vertices.slice(i + 3, i + 6));
    const c = Array.from(vertices.slice(i + 6, i + 9));
    const u = b.map((value, index) => value - a[index]);
    const v = c.map((value, index) => value - a[index]);
    const area = Math.hypot(u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]);
    assert.ok(area > 0, `Degenerate triangle at ${i / 9}`);
    volume += (a[0] * (b[1] * c[2] - b[2] * c[1]) +
      a[1] * (b[2] * c[0] - b[0] * c[2]) +
      a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;
    const keys = [vertexKey(i), vertexKey(i + 3), vertexKey(i + 6)];
    for (let j = 0; j < 3; j++) {
      const from = keys[j];
      const to = keys[(j + 1) % 3];
      const ordered = from < to;
      const key = ordered ? `${from}|${to}` : `${to}|${from}`;
      const usage = edgeUses.get(key) || { count: 0, balance: 0 };
      usage.count++;
      usage.balance += ordered ? 1 : -1;
      edgeUses.set(key, usage);
      if (!neighbors.has(from)) neighbors.set(from, new Set());
      neighbors.get(from).add(to);
    }
  }

  for (const [edge, usage] of edgeUses) {
    assert.equal(usage.count, 2, `Non-manifold edge ${edge}`);
    assert.equal(usage.balance, 0, `Inconsistent winding on ${edge}`);
  }
  const visited = new Set();
  const pending = [neighbors.keys().next().value];
  while (pending.length) {
    const current = pending.pop();
    if (visited.has(current)) continue;
    visited.add(current);
    for (const neighbor of neighbors.get(current)) {
      if (!visited.has(neighbor)) pending.push(neighbor);
    }
  }
  assert.equal(visited.size, neighbors.size, 'Mesh must be one connected component');
  assert.ok(Math.abs(volume - pattern.volume) / pattern.volume < 1e-5,
    `Volume differs: mesh ${volume}, expected ${pattern.volume}`);
  let minX = Infinity, maxX = -Infinity;
  for (let i=0; i<vertices.length; i+=3) {
    minX = Math.min(minX, vertices[i]);
    maxX = Math.max(maxX, vertices[i]);
  }
  assert.equal(minX, 0);
  // Binary STL coordinates are float32, so decimal dimensions round slightly.
  assert.ok(Math.abs(maxX - pattern.settings.length) < 0.0001);
  return mesh;
}

test('same seed and settings reproduce exactly the same cutouts', () => {
  const first = P.generate(settings());
  const second = P.generate(settings());
  assert.deepEqual(first.holes, second.holes);
  assert.notDeepEqual(first.holes, P.generate(settings({ seed: 'another seed' })).holes);
});

test('minimum slit length applies to the whole centerline, including bends', () => {
  // The endpoints are only 5 mm apart, but the bent path is 65 mm long.
  const bent = [{ x: 0, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 5 }, { x: 0, y: 5 }];
  assert.equal(P.pathLength(bent), 65);
  assert.equal(P.pathLength([{ x: 0, y: 0 }, { x: 3, y: 4 }]), 5);

  for (const style of ['circuit', 'lightning', 'mixed']) {
    for (const minSlitLength of [30, 60, 120]) {
      for (let seed = 0; seed < 3; seed++) {
        const pattern = P.generate(settings({ style, minSlitLength, seed: `length-${seed}`, density: 100 }));
        assert.ok(pattern.paths.length > 0, `${style}, minimum ${minSlitLength}`);
        for (const path of pattern.paths) {
          // Independently measure the generated coordinates, including diagonals.
          const length = path.slice(1).reduce((total, p, i) =>
            total + Math.hypot(p.x - path[i].x, p.y - path[i].y), 0);
          assert.ok(length >= minSlitLength, `Slit ${length} mm is shorter than ${minSlitLength} mm`);
        }
      }
    }
  }
});

test('zero minimum retains legacy seeded designs and short slits', () => {
  // Reference counts for the original app's default seed/settings.
  // Hashes were captured from the prior standalone HTML, before the refactor.
  const hashes = {
    circuit: 'e7d6d64bad6ae983d976cf28c9ce1e223635a9f1b0d89b006faf15d45fe43a42',
    lightning: '5eb33e0c03e6b5c649e62d5183b17a076bd509d3165e8d973697af127f4de0ea',
    mixed: 'ab8cd9e338547555e2973ea6202ede53eabf98f0f52c2aa9a1d3fd0915a7e830'
  };
  for (const [style, count] of [['circuit', 15], ['lightning', 18], ['mixed', 16]]) {
    const legacy = P.generate(settings({ style, minSlitLength: 0, borderWidth: 12.7 }));
    assert.equal(legacy.paths.length, count);
    assert.equal(createHash('sha256').update(JSON.stringify(legacy.holes)).digest('hex'), hashes[style]);
  }
  const legacy = P.generate(settings({ style: 'lightning', minSlitLength: 0, borderWidth: 12.7 }));
  assert.ok(legacy.paths.some(path => P.pathLength(path) < 30));
  const filtered = P.generate(settings({ style: 'lightning', minSlitLength: 30, borderWidth: 12.7 }));
  assert.ok(filtered.paths.every(path => P.pathLength(path) >= 30));
  assert.notDeepEqual(filtered.holes, legacy.holes);
});

test('Tabbied styles are seeded, use independent controls, and respect tile density', () => {
  for (const style of ['tabbied:hilbert', 'tabbied:switchback', 'tabbied:spark']) {
    const first = P.generate(settings({ style }));
    assert.ok(first.holes.length > 0);
    assert.deepEqual(first.holes, P.generate(settings({ style })).holes);
    assert.notDeepEqual(first.holes, P.generate(settings({ style, seed: 'another seed' })).holes);
    // Line-only parameters must not silently change a tiled design.
    assert.deepEqual(first.holes, P.generate(settings({
      style, slitWidth: 8, minSlitLength: 1000, complexity: 1
    })).holes);
    assert.equal(P.generate(settings({ style, density: 0 })).holes.length, 0);
    const full = P.generate(settings({ style, density: 100 }));
    assert.equal(full.holes.length, 24); // 6 × 4 complete tiles inside the default border.
    assert.ok(!full.densityLimited);
    assert.notDeepEqual(full.holes, P.generate(settings({ style, density: 100, patternSize: 50 })).holes);
  }
});

test('Tabbied cutouts keep borders, material spacing, and watertight connected meshes', () => {
  for (const { id: style } of P.families[1].designs) {
    for (const changes of [
      { seed: 'tile-1', density: 100 },
      { seed: 'tile-2', borderWidth: 1, patternSize: 15, density: 80 },
      { length: 173.237, width: 109.731, patternSize: 22.375, borderWidth: 4.375, density: 100 },
      { length: 500, width: 500, patternSize: 10, density: 100, thickness: 20 },
      { length: 500, width: 40, patternSize: 150, density: 100 },
      { length: 40, width: 500, patternSize: 10, density: 100 },
      { length: 40, width: 40, patternSize: 10, density: 100, thickness: 0.6 },
      { length: 40, width: 40, borderWidth: 19 }
    ]) {
      const pattern = P.generate(settings({ style, ...changes }));
      assert.ok(pattern.holes.length <= 576);
      for (const [i, hole] of pattern.holes.entries()) {
        assert.ok(G.isSimplePolygon(hole));
        assert.ok(G.signedArea(hole) < 0);
        for (const p of hole) {
          assert.ok(p.x >= pattern.settings.borderWidth && p.x <= pattern.settings.length - pattern.settings.borderWidth);
          assert.ok(p.y >= pattern.settings.borderWidth && p.y <= pattern.settings.width - pattern.settings.borderWidth);
        }
        for (const other of pattern.holes.slice(i + 1)) {
          assert.ok(G.polygonsHaveClearance(hole, other, 2.4));
        }
      }
      try { inspectMesh(pattern); }
      catch(error) { throw new Error(`${style}, ${JSON.stringify(changes)}: ${error.message}`, {cause: error}); }
    }
  }
});

test('shared cutout checks reject crossings, nesting, edge cuts, and undersized paths', () => {
  const cuts = P.createCutouts(settings(), 2.4);
  const rectangle = (x, y, size) => [
    { x, y }, { x: x + size, y }, { x: x + size, y: y + size }, { x, y: y + size }
  ];
  assert.equal(cuts.add(rectangle(20, 20, 20)), true);
  assert.equal(cuts.add(rectangle(25, 25, 5)), false, 'Nested cuts would detach material');
  assert.equal(cuts.add(rectangle(35, 20, 20)), false, 'Overlapping cuts need a reviewed union converter');
  assert.equal(cuts.add(rectangle(42, 20, 10)), false, 'Gap is smaller than minimum web');
  assert.equal(cuts.add(rectangle(44, 20, 10)), true);
  assert.equal(cuts.add(rectangle(0, 0, 10)), false, 'Border applies to every generator');
  assert.equal(cuts.add([{ x: 70, y: 20 }, { x: 90, y: 40 }, { x: 90, y: 20 }, { x: 70, y: 40 }]), false);
  assert.equal(cuts.add(rectangle(100, 20, 10), [{ x: 100, y: 20 }, { x: 105, y: 20 }]), false);
  assert.equal(cuts.holes.length, 2);
});

test('high minimum preserves connectivity and never falls back to short slits', () => {
  for (const style of ['circuit', 'lightning', 'mixed']) {
    inspectMesh(P.generate(settings({ style, minSlitLength: 100, density: 100 })));
    const impossible = P.generate(settings({
      style, length: 40, width: 40, minSlitLength: 1000, density: 100
    }));
    assert.equal(impossible.paths.length, 0);
    assert.equal(impossible.holes.length, 0);
    assert.equal(impossible.openArea, 0);
    assert.ok(impossible.densityLimited);
    inspectMesh(impossible);
  }
});

test('cutouts are simple, framed, and maintain the minimum material gap', () => {
  for (const style of ['circuit', 'lightning', 'mixed']) {
    for (let seed = 0; seed < 8; seed++) {
      const pattern = P.generate(settings({ style, seed: `gap-${seed}`, density: 100 }));
      assert.ok(pattern.holes.length > 0);
      pattern.holes.forEach((hole, i) => {
        assert.ok(G.isSimplePolygon(hole));
        assert.ok(G.signedArea(hole) < 0, 'Hole winding must be clockwise');
        hole.forEach(p => {
          assert.ok(p.x >= pattern.settings.borderWidth && p.x <= pattern.settings.length - pattern.settings.borderWidth);
          assert.ok(p.y >= pattern.settings.borderWidth && p.y <= pattern.settings.width - pattern.settings.borderWidth);
        });
        pattern.holes.slice(i + 1).forEach(other => {
          assert.ok(G.polygonsHaveClearance(hole, other, pattern.minimumWeb));
        });
      });
    }
  }
});

test('configurable borders contain the complete cutouts and keep the mesh connected', () => {
  for (const style of ['circuit', 'lightning', 'mixed']) {
    for (const borderWidth of [1, 6, 12.7, 30]) {
      const pattern = P.generate(settings({ style, borderWidth, density: 100, seed: 'border-check' }));
      assert.ok(pattern.holes.length > 0);
      for (const hole of pattern.holes) {
        for (const p of hole) {
          assert.ok(p.x >= borderWidth && p.x <= pattern.settings.length - borderWidth);
          assert.ok(p.y >= borderWidth && p.y <= pattern.settings.width - borderWidth);
        }
      }
      inspectMesh(pattern);
    }
  }
  const closer = P.generate(settings({ borderWidth: 1 }));
  assert.ok(closer.holes.some(hole => hole.some(p =>
    Math.min(p.x, p.y, closer.settings.length - p.x, closer.settings.width - p.y) < 12.7)),
  'Reducing the border should allow cutouts inside the old half-inch margin');
  assert.notDeepEqual(closer.holes, P.generate(settings({ borderWidth: 12.7 })).holes);
});

test('large borders handle small interiors and reject borders that consume the panel', () => {
  const tight = P.generate(settings({ length: 40, width: 40, borderWidth: 19, slitWidth: 8 }));
  assert.equal(tight.holes.length, 0);
  assert.ok(tight.densityLimited);
  assert.equal(tight.volume, 40 * 40 * 3);
  inspectMesh(tight);
  inspectMesh(P.generate(settings({ length: 500, width: 500, borderWidth: 200 })));
  for (const borderWidth of [20, 21, 100]) {
    assert.throws(() => P.generate(settings({ length: 40, width: 100, borderWidth })),
      /less than half/);
  }
});

test('STLs are watertight, consistently wound, and connected for all styles', () => {
  for (const style of ['circuit', 'lightning', 'mixed']) {
    for (let seed = 0; seed < 6; seed++) {
      inspectMesh(P.generate(settings({ style, seed: `mesh-${seed}`, density: 80 })));
    }
  }
});

test('extreme dimensions and slit widths produce valid meshes', () => {
  for (const options of [
    { length: 40, width: 40, slitWidth: 8 },
    { length: 500, width: 40, slitWidth: 0.6, style: 'lightning' },
    { length: 40, width: 500, slitWidth: 1.6, style: 'mixed' },
    { length: 500, width: 500, thickness: 20, density: 100, complexity: 8 },
    { length: 40, width: 40, thickness: 0.6, slitWidth: 0.6 },
    { length: 173.237, width: 109.731, style: 'lightning' }
  ]) inspectMesh(P.generate(settings(options)));
});

test('horizontal, diagonal, and shared-row holes mesh without T-junctions', () => {
  const holes = [
    [{ x: 20, y: 20 }, { x: 20, y: 25 }, { x: 70, y: 25 }, { x: 70, y: 20 }],
    [{ x: 80, y: 20 }, { x: 70, y: 40 }, { x: 80, y: 60 }, { x: 90, y: 40 }]
  ];
  const config = settings({ length: 100, width: 100 });
  inspectMesh({ settings: config, holes,
    volume: (10000 - holes.reduce((area, hole) => area + Math.abs(G.signedArea(hole)), 0)) * 3 });
});

test('binary STL records the correct dimensions, normals, and triangle count', () => {
  const pattern = P.generate(settings());
  const mesh = inspectMesh(pattern);
  const buffer = M.binarySTL(mesh);
  const view = new DataView(buffer);
  assert.equal(buffer.byteLength, 84 + mesh.triangleCount * 50);
  assert.equal(view.getUint32(80, true), mesh.triangleCount);
  for (let i = 0; i < mesh.triangleCount; i++) {
    const record = 84 + i * 50;
    const normal = [0, 1, 2].map(j => view.getFloat32(record + j * 4, true));
    assert.ok(Math.abs(Math.hypot(...normal) - 1) < 1e-6);
    for (let j = 0; j < 9; j++) {
      assert.equal(view.getFloat32(record + 12 + j * 4, true), mesh.positions[i * 9 + j]);
    }
  }
});

test('invalid and untrusted settings are rejected', () => {
  for (const options of [
    { length: NaN }, { width: 0 }, { thickness: Infinity }, { slitWidth: -1 },
    { length: '200' }, { seed: '' }, { seed: 'x'.repeat(65) },
    { style: '<script>' }, { density: 101 }, { complexity: 2.5 }, { units: 'cm' },
    { minSlitLength: -1 }, { minSlitLength: 1001 }, { minSlitLength: NaN },
    { minSlitLength: Infinity }, { minSlitLength: '30' },
    { borderWidth: 0 }, { borderWidth: -1 }, { borderWidth: 201 },
    { borderWidth: NaN }, { borderWidth: Infinity }, { borderWidth: '6' },
    { patternSize: 0 }, { patternSize: 151 }, { patternSize: NaN }, { style: 'tabbied:unknown' }
  ]) assert.throws(() => P.generate(settings(options)));
});
