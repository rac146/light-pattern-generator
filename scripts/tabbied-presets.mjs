// Offline build-time conversion of explicit, pinned, reviewed Tabbied designs.
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { polygonSlugs, extendedSlugs } from './tabbied-reviewed.mjs';
import { polygonDefinition } from './tabbied-polygons.mjs';
import { reviewedRecipe } from './tabbied-recipes.mjs';

const vendor = new URL('../vendor/tabbied/0.10.0/', import.meta.url);
const provenance = JSON.parse(await readFile(new URL('provenance.json', vendor), 'utf8'));
async function definition(slug) {
  const name = `${slug}.mjs`;
  const source = await readFile(new URL(name, vendor), 'utf8');
  if (createHash('sha256').update(source).digest('hex') !== provenance.files[name]) {
    throw new Error(`Upstream definition ${slug} was modified. Review and update provenance explicitly.`);
  }
  return (await import(new URL(name, vendor).href)).default;
}

const originalDescriptions = {
  hilbert: 'U-shaped cutouts turn through four orientations in a tiled field.',
  switchback: 'Bold L-shaped cutouts turn in random directions, with solid gaps between tiles.',
  spark: 'Pointed spark cutouts repeat across the panel.'
};
const polygons = await Promise.all(polygonSlugs.map(async slug => {
  const upstream = await definition(slug);
  return { id: `tabbied:${slug}`, slug, label: upstream.name, category: 'Polygons', kind: 'polygon',
    description: originalDescriptions[slug] || `${upstream.name} shapes repeat in separate tiles with solid gaps.`,
    ...polygonDefinition(upstream) };
}));
const extended = await Promise.all(extendedSlugs.map(async slug => {
  const upstream = await definition(slug);
  return { id: `tabbied:${slug}`, slug, label: upstream.name, ...reviewedRecipe(upstream) };
}));
const designs = [...polygons, ...extended];
// Keep the original three in their familiar positions, then group alphabetically.
const favorites = ['hilbert', 'switchback', 'spark'];
designs.sort((a,b) => {
  const ai = favorites.indexOf(a.slug), bi = favorites.indexOf(b.slug);
  if (ai >= 0 || bi >= 0) return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  return a.category.localeCompare(b.category, 'en') || a.label.localeCompare(b.label, 'en');
});

export function tabbiedPresetSource() {
  return '// Generated from pinned MIT Tabbied definitions; edit scripts/tabbied-*.mjs, not this file.\n' +
    `const TabbiedPresets = ${JSON.stringify({ version: '0.10.0', designs }, null, 2)};\n`;
}

export async function tabbiedCoverageSource() {
  const catalog = JSON.parse(await readFile(new URL('catalog.json', vendor), 'utf8'));
  const included = new Map(designs.map(d => [d.slug, d]));
  const entries = catalog.designs.map(d => ({ slug: d.slug, name: d.name,
    status: included.has(d.slug) ? 'supported' : 'not-yet-converted',
    converter: included.get(d.slug)?.kind || null,
    reason: included.has(d.slug) ? '' : 'Needs an explicit recipe and geometry/STL qualification.' }));
  return JSON.stringify({ version: '0.10.0', total: catalog.count,
    supported: designs.length, designs: entries }, null, 2) + '\n';
}
