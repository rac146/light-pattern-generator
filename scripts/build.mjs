// This is a bundler, not a compiler: the exported HTML keeps the original,
// readable JavaScript and CSS. Node is needed only when editing the app.
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const modules = ['geometry', 'pattern', 'mesh', 'preview', 'app'];
const template = await readFile(new URL('src/index.template.html', root), 'utf8');
const styles = await readFile(new URL('src/styles.css', root), 'utf8');
const scripts = await Promise.all(modules.map(async (name) => {
  const source = await readFile(new URL(`src/${name}.js`, root), 'utf8');
  return `// ─── src/${name}.js ───\n${source}`;
}));

const html = template
  .replace('/* INLINE_STYLES */', () => styles)
  .replace('/* INLINE_SCRIPTS */', () => scripts.join('\n\n'));

await writeFile(new URL('index.html', root), html);
console.log('Built index.html — open it directly in your browser.');
