// This is a bundler, not a compiler: the exported HTML keeps the original,
// readable JavaScript and CSS. Node is needed only when editing the app.
import { readFile, writeFile } from 'node:fs/promises';
import { appModules } from './source-modules.mjs';
import { tabbiedPresetSource, tabbiedCoverageSource } from './tabbied-presets.mjs';

const root = new URL('../', import.meta.url);
await writeFile(new URL('src/patterns/tabbied-presets.js', root), tabbiedPresetSource());
await writeFile(new URL('TABBIED_COVERAGE.json', root), await tabbiedCoverageSource());
const template = await readFile(new URL('src/index.template.html', root), 'utf8');
const styles = await readFile(new URL('src/styles.css', root), 'utf8');
const license = await readFile(new URL('vendor/tabbied/0.10.0/LICENSE', root), 'utf8');
const scripts = await Promise.all(appModules.map(async (name) => {
  const source = await readFile(new URL(`src/${name}.js`, root), 'utf8');
  return `// ─── src/${name}.js ───\n${source}`;
}));

const html = template
  .replace('<!-- THIRD_PARTY_LICENSES -->', () => `<!--\nTabbied 0.10.0 pattern definitions\n${license.trim()}\n-->`)
  .replace('/* INLINE_STYLES */', () => styles)
  .replace('/* INLINE_SCRIPTS */', () => scripts.join('\n\n'));

await writeFile(new URL('index.html', root), html);
console.log('Built index.html — open it directly in your browser.');
