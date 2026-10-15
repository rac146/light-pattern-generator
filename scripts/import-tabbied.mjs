// Import only the reviewed definitions from an official npm archive.
// No installation or network access is needed. Usage:
// node scripts/import-tabbied.mjs /path/to/tabbied-0.10.0.tgz /path/to/npm-metadata.json
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { reviewedSlugs as slugs } from './tabbied-reviewed.mjs';

const version = '0.10.0';
const [archive, metadataPath] = process.argv.slice(2);
if (!archive || !metadataPath) throw new Error('Supply the npm archive and registry metadata paths.');
const metadata = JSON.parse(await readFile(metadataPath, 'utf8')).versions[version];
const archiveBytes = await readFile(archive);
const integrity = `sha512-${createHash('sha512').update(archiveBytes).digest('base64')}`;
if (integrity !== metadata?.dist.integrity) throw new Error('Archive does not match npm integrity.');

const destination = new URL(`../vendor/tabbied/${version}/`, import.meta.url);
await mkdir(destination, { recursive: true });
const extract = name => execFileSync('tar', ['-xOf', archive, `package/${name}`], {
  encoding: 'utf8', maxBuffer: 8 * 1024 * 1024
});
const files = {};
for (const slug of slugs) {
  const source = extract(`dist/patterns/${slug}.js`);
  await writeFile(new URL(`${slug}.mjs`, destination), source);
  files[`${slug}.mjs`] = createHash('sha256').update(source).digest('hex');
}
await writeFile(new URL('LICENSE', destination), extract('LICENSE'));
await writeFile(new URL('catalog.json', destination), extract('catalog.json'));
await writeFile(new URL('provenance.json', destination), JSON.stringify({
  package: 'tabbied', version, license: metadata.license, archive: metadata.dist.tarball,
  integrity, files,
  note: 'Unmodified published definitions; .js renamed .mjs for Node imports. Only these designs are included.'
}, null, 2) + '\n');
console.log(`Imported ${slugs.length} reviewed Tabbied ${version} definitions and MIT notice.`);
