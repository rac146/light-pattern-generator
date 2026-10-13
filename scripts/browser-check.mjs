/**
 * Optional integration check using an already-installed Chromium browser.
 * Uses Chrome's debugging PIPE: no HTTP server or browser automation package.
 * Usage: node scripts/browser-check.mjs [path/to/chrome]
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { access, mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const artifacts = path.join(root, 'artifacts');
const candidates = process.argv[2] ? [process.argv[2]] : process.platform === 'darwin' ?
  ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'] : process.platform === 'win32' ?
  [path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Google/Chrome/Application/chrome.exe')] :
  ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
let executable;
for (const candidate of candidates) {
  try { await access(candidate); executable = candidate; break; } catch { /* Try next browser. */ }
}
assert.ok(executable, 'Install Chrome/Chromium or supply the path to an installed browser.');
await mkdir(artifacts, { recursive: true });
const downloads = path.join(artifacts, `downloads-${Date.now()}`);
await mkdir(downloads);
const browser = spawn(executable, [
  '--headless', '--disable-gpu', '--remote-debugging-pipe',
  `--user-data-dir=${path.join(artifacts, `browser-profile-${Date.now()}`)}`,
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-component-update', '--disable-sync', '--metrics-recording-only', 'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });

let stderr = '';
browser.stderr.on('data', data => { stderr = (stderr + data).slice(-3000); });
let sequence = 0;
let received = '';
const pending = new Map();
const events = [];
const errors = [];
const requests = [];

function send(method, params = {}, sessionId) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`Timed out: ${method}\n${stderr}`));
    }, 20000);
    pending.set(id, { resolve, reject, timeout });
    browser.stdio[3].write(JSON.stringify({ id, method, params, sessionId }) + '\0');
  });
}

browser.stdio[4].on('data', data => {
  received += data;
  let separator;
  while ((separator = received.indexOf('\0')) !== -1) {
    const message = JSON.parse(received.slice(0, separator));
    received = received.slice(separator + 1);
    if (message.id) {
      const request = pending.get(message.id);
      if (!request) continue;
      clearTimeout(request.timeout);
      pending.delete(message.id);
      if (message.error) request.reject(new Error(JSON.stringify(message.error)));
      else request.resolve(message.result);
    } else {
      events.push(message);
      if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
      if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url);
    }
  }
});

async function waitFor(check, description) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const result = await check();
    if (result) return result;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for ${description}`);
}

try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const command = (method, params) => send(method, params, sessionId);
  await command('Page.enable');
  await command('Runtime.enable');
  await command('Network.enable');
  await command('Emulation.setDeviceMetricsOverride', {
    width: 1280, height: 1100, deviceScaleFactor: 1, mobile: false
  });
  await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads, eventsEnabled: true });

  async function evaluate(expression) {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  async function click(selector) {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  }
  async function screenshot(name) {
    // Allow the scheduled Canvas animation frame to finish.
    await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
    const { data } = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    await writeFile(path.join(artifacts, name), Buffer.from(data, 'base64'));
  }

  await command('Page.navigate', { url: new URL('../index.html', import.meta.url).href });
  await waitFor(() => evaluate(`document.querySelector('#paths-stat')?.textContent !== '—' && document.querySelector('#paths-stat')?.textContent`), 'initial pattern');
  assert.ok(await evaluate('Number(document.querySelector("#paths-stat").textContent) > 0'));
  assert.equal(await evaluate('document.querySelector("#export-stl").disabled'), false);
  await screenshot('desktop-backlit.png');

  await click('[data-unit="in"]');
  assert.equal(await evaluate('document.querySelector("#length").value'), '7.874');
  await click('[data-unit="mm"]');
  assert.equal(await evaluate('document.querySelector("#length").value'), '200');
  // Changing a unit display must not round the internal model dimensions.
  await evaluate(`document.querySelector('#length').value = '173.237'; document.querySelector('#length').dispatchEvent(new Event('change', {bubbles:true}))`);
  for (let i = 0; i < 5; i++) { await click('[data-unit="in"]'); await click('[data-unit="mm"]'); }
  assert.equal(await evaluate('document.querySelector("#length").value'), '173.237');
  await click('#reset');

  await evaluate(`document.querySelector('#length').value = '0'; document.querySelector('#length').dispatchEvent(new Event('change', {bubbles:true}))`);
  assert.equal(await evaluate('document.querySelector("#export-stl").disabled'), true);
  assert.ok(await evaluate('document.querySelector("#status").classList.contains("error")'));
  await click('#reset');

  const oldSeed = await evaluate('document.querySelector("#seed").value');
  await click('#shuffle');
  assert.notEqual(await evaluate('document.querySelector("#seed").value'), oldSeed);
  await click('#reset');
  for (const style of ['lightning', 'mixed', 'circuit']) {
    await evaluate(`document.querySelector('#style').value = '${style}'; document.querySelector('#style').dispatchEvent(new Event('change', {bubbles:true}))`);
    assert.ok(await evaluate('Number(document.querySelector("#paths-stat").textContent) > 0'));
    assert.equal(await evaluate('document.querySelector("#export-stl").disabled'), false);
  }

  await click('[data-view="3d"]');
  assert.equal(await evaluate('document.querySelector("#reset-view").hidden'), false);
  await screenshot('desktop-3d.png');
  const canvasRect = await evaluate(`(() => {
    const rect = document.querySelector('#preview').getBoundingClientRect();
    return {x: rect.x + rect.width / 2, y: rect.y + rect.height / 2};
  })()`);
  await command('Input.dispatchMouseEvent', { type: 'mousePressed', ...canvasRect, button: 'left', clickCount: 1 });
  await command('Input.dispatchMouseEvent', { type: 'mouseMoved', x: canvasRect.x + 40, y: canvasRect.y + 20, buttons: 1 });
  await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: canvasRect.x + 40, y: canvasRect.y + 20, button: 'left', clickCount: 1 });
  await command('Input.dispatchMouseEvent', { type: 'mouseWheel', ...canvasRect, deltaX: 0, deltaY: -100 });
  await click('#reset-view');
  await click('[data-view="solid"]');
  await screenshot('desktop-cutouts.png');
  await click('[data-view="light"]');

  await click('#export-stl');
  await waitFor(async () => (await readdir(downloads)).some(name => name.endsWith('.stl')), 'STL download');
  const stlName = (await readdir(downloads)).find(name => name.endsWith('.stl'));
  const stl = await readFile(path.join(downloads, stlName));
  const triangleCount = stl.readUInt32LE(80);
  assert.ok(triangleCount > 0);
  assert.equal(stl.length, 84 + 50 * triangleCount);
  // The browser and Node/V8 must serialize identical geometry for a saved seed.
  const engineSources = await Promise.all(['geometry', 'pattern', 'mesh'].map(name =>
    readFile(path.join(root, 'src', `${name}.js`), 'utf8')));
  const engineContext = vm.createContext({ TextEncoder });
  const expectedBuffer = vm.runInContext(engineSources.join('\n') +
    '\nMeshBuilder.binarySTL(MeshBuilder.build(PatternGenerator.generate(PatternGenerator.DEFAULTS)))', engineContext);
  assert.deepEqual(stl, Buffer.from(expectedBuffer), 'Browser and Node must produce identical STL bytes');

  await click('#save-settings');
  await waitFor(async () => (await readdir(downloads)).some(name => name.endsWith('.json')), 'settings download');
  const settingsName = (await readdir(downloads)).find(name => name.endsWith('.json'));
  const saved = JSON.parse(await readFile(path.join(downloads, settingsName), 'utf8'));
  assert.equal(saved.format, 'light-pattern-generator');
  assert.equal(saved.settings.length, 200);

  await evaluate(`document.querySelector('#length').value = '222'; document.querySelector('#length').dispatchEvent(new Event('change', {bubbles:true}))`);
  const { root: dom } = await command('DOM.getDocument');
  const { nodeId } = await command('DOM.querySelector', { nodeId: dom.nodeId, selector: '#settings-file' });
  await command('DOM.setFileInputFiles', { nodeId, files: [path.join(downloads, settingsName)] });
  await waitFor(() => evaluate('document.querySelector("#length").value === "200"'), 'settings import');

  await command('Emulation.setDeviceMetricsOverride', {
    width: 390, height: 844, deviceScaleFactor: 1, mobile: true
  });
  await screenshot('mobile-backlit.png');
  assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, 'No mobile horizontal overflow');

  // Move only the distributable HTML: no src folder or companion assets.
  const standalone = path.join(downloads, 'Standalone panel – offline.html');
  await writeFile(standalone, await readFile(path.join(root, 'index.html')));
  await command('Page.navigate', { url: pathToFileURL(standalone).href });
  await waitFor(() => evaluate('document.querySelector("#export-stl")?.disabled === false'), 'copied standalone HTML');
  assert.ok(await evaluate('Number(document.querySelector("#paths-stat").textContent) > 0'));
  assert.equal(errors.length, 0, `Browser exceptions: ${JSON.stringify(errors)}`);
  assert.ok(requests.every(url => url.startsWith('file:') || url.startsWith('data:')),
    `External app requests: ${JSON.stringify(requests)}`);
  console.log(`Browser checks passed. STL: ${triangleCount} triangles. No external app requests.`);
  console.log(`Screenshots and downloaded files: ${artifacts}`);
} finally {
  browser.kill();
  for (const request of pending.values()) clearTimeout(request.timeout);
}
