// Node's built-in runner: no packages and no ESP/toolchain builds.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const sources = await Promise.all(['geometry', 'pattern', 'mesh'].map(name =>
  readFile(new URL(`src/${name}.js`, root), 'utf8')));
const context = vm.createContext({ TextEncoder });
vm.runInContext(sources.join('\n') +
  '\nglobalThis.engine = { G: PanelGeometry, P: PatternGenerator, M: MeshBuilder };', context);
const { G, P, M } = context.engine;
const settings = changes => ({ ...P.DEFAULTS, ...changes });

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
  assert.equal(Math.min(...vertices.filter((_, i) => i % 3 === 0)), 0);
  // Binary STL coordinates are float32, so decimal dimensions round slightly.
  assert.ok(Math.abs(Math.max(...vertices.filter((_, i) => i % 3 === 0)) - pattern.settings.length) < 0.0001);
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
  for (const [style, count] of [['circuit', 15], ['lightning', 18], ['mixed', 16]]) {
    const legacy = P.generate(settings({ style, minSlitLength: 0 }));
    assert.equal(legacy.paths.length, count);
  }
  const legacy = P.generate(settings({ style: 'lightning', minSlitLength: 0 }));
  assert.ok(legacy.paths.some(path => P.pathLength(path) < 30));
  const filtered = P.generate(settings({ style: 'lightning', minSlitLength: 30 }));
  assert.ok(filtered.paths.every(path => P.pathLength(path) >= 30));
  assert.notDeepEqual(filtered.holes, legacy.holes);
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
          assert.ok(p.x >= P.FRAME_MM && p.x <= pattern.settings.length - P.FRAME_MM);
          assert.ok(p.y >= P.FRAME_MM && p.y <= pattern.settings.width - P.FRAME_MM);
        });
        pattern.holes.slice(i + 1).forEach(other => {
          assert.ok(G.polygonsHaveClearance(hole, other, pattern.minimumWeb));
        });
      });
    }
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
    { minSlitLength: Infinity }, { minSlitLength: '30' }
  ]) assert.throws(() => P.generate(settings(options)));
});
