/**
 * UI wiring. Model values stay in millimeters; inches are display-only.
 * This file deliberately uses plain DOM APIs and named functions.
 */
(() => {
  const P = PatternGenerator;
  const $ = id => document.getElementById(id);
  const dimensionNames = ['length', 'width', 'thickness', 'slitWidth'];
  const form = $('settings-form');
  const preview = new PanelPreview.Preview($('preview'));
  let settings = { ...P.DEFAULTS };
  let pattern = null;
  let mesh = null;
  let pendingUpdate = null;
  let canExport = false;

  function displayNumber(value) {
    const converted = settings.units === 'in' ? value / 25.4 : value;
    // More digits prevent repeated unit switches from rounding model values.
    return Number(converted.toFixed(settings.units === 'in' ? 4 : 3));
  }

  function updateUnitButtons() {
    for (const button of document.querySelectorAll('[data-unit]')) {
      button.setAttribute('aria-pressed', String(button.dataset.unit === settings.units));
    }
    document.querySelectorAll('.unit-label').forEach(label => { label.textContent = settings.units; });
  }

  function writeDimensions() {
    for (const name of dimensionNames) {
      const input = $(name);
      input.value = displayNumber(settings[name]);
      // Validate exact mm values ourselves. Decimal inch limits require rounding.
      input.step = 'any';
      const [min, max] = P.LIMITS[name];
      input.title = settings.units === 'in' ?
        `${(min / 25.4).toFixed(3)}–${(max / 25.4).toFixed(3)} inches` : `${min}–${max} mm`;
    }
    updateUnitButtons();
  }

  function writeForm() {
    writeDimensions();
    for (const name of ['style', 'density', 'complexity', 'seed']) $(name).value = settings[name];
    updateRangeLabels();
    updateColor(settings.color);
  }

  function updateRangeLabels() {
    $('density-value').value = `${$('density').value}%`;
    $('complexity-value').value = $('complexity').value;
  }

  function readForm() {
    const next = { ...settings };
    for (const name of dimensionNames) {
      const displayed = Number($(name).value);
      // Preserve precise mm values when an input is simply displaying inches.
      next[name] = $(name).value.trim() === '' ? NaN :
        displayed === displayNumber(settings[name]) ? settings[name] :
        PanelGeometry.snap(displayed * (settings.units === 'in' ? 25.4 : 1));
    }
    next.style = $('style').value;
    next.density = Number($('density').value);
    next.complexity = Number($('complexity').value);
    next.seed = $('seed').value.trim();
    return next;
  }

  function showStatus(message, isError = false) {
    $('status').textContent = message;
    $('status').classList.toggle('error', isError);
  }

  function markInvalidInputs(next) {
    for (const name of dimensionNames) {
      const [min, max] = P.LIMITS[name];
      $(name).setAttribute('aria-invalid', String(!Number.isFinite(next[name]) || next[name] < min || next[name] > max));
    }
    $('seed').setAttribute('aria-invalid', String(!next.seed.trim()));
  }

  function updateStats() {
    const s = pattern.settings;
    $('size-stat').textContent = `${[s.length, s.width, s.thickness].map(displayNumber).join(' × ')} ${settings.units}`;
    $('opening-stat').textContent = `${pattern.openPercent.toFixed(1)}% open`;
    $('paths-stat').textContent = String(pattern.holes.length);
  }

  function rememberSettings() {
    try { localStorage.setItem('light-pattern-settings-v1', JSON.stringify(settings)); }
    catch { /* File URLs/private browsing may disable storage. Save/load still works. */ }
  }

  function regenerate() {
    clearTimeout(pendingUpdate);
    pendingUpdate = null;
    const next = readForm();
    markInvalidInputs(next);
    try {
      P.validate(next);
      const generated = P.generate(next);
      const generatedMesh = MeshBuilder.build(generated);
      settings = next;
      pattern = generated;
      mesh = generatedMesh;
      preview.update(pattern, mesh);
      canExport = true;
      $('export-stl').disabled = false;
      updateStats();
      rememberSettings();
      if (pattern.holes.length === 0) {
        showStatus('No slits fit these dimensions. Enlarge the panel or reduce the slit width.');
      } else if (pattern.densityLimited) {
        showStatus('Spacing limits the density for this size. Try narrower slits or a larger panel for more lines.');
      } else {
        showStatus('');
      }
      return true;
    } catch (error) {
      canExport = false;
      $('export-stl').disabled = true;
      showStatus(`${error.message} The preview shows the last valid panel.`, true);
      return false;
    }
  }

  function scheduleRegenerate() {
    updateRangeLabels();
    canExport = false;
    $('export-stl').disabled = true;
    clearTimeout(pendingUpdate);
    pendingUpdate = setTimeout(regenerate, 160);
  }

  function setUnits(units) {
    // Commit edits in the old units first, then only change the display.
    if (!regenerate()) return;
    settings.units = units;
    pattern.settings.units = units;
    writeDimensions();
    updateStats();
    preview.scheduleDraw();
    rememberSettings();
  }

  function updateColor(color) {
    if (!Object.hasOwn(PanelPreview.COLORS, color)) return;
    settings.color = color;
    preview.color = color;
    for (const button of document.querySelectorAll('[data-color]')) {
      button.setAttribute('aria-pressed', String(button.dataset.color === color));
    }
    preview.scheduleDraw();
  }

  function fileName(extension) {
    const seed = settings.seed.replace(/[^a-z0-9_-]/gi, '-').slice(0, 32) || 'pattern';
    return `light-panel-${seed}.${extension}`;
  }

  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  function exportSTL() {
    if (!regenerate() || !canExport) return;
    download(new Blob([MeshBuilder.binarySTL(mesh)], { type: 'application/octet-stream' }), fileName('stl'));
    showStatus(`Downloaded STL · ${mesh.triangleCount.toLocaleString()} triangles · millimeters. Open it in your slicer to check bed fit.`);
  }

  function saveSettings() {
    if (!regenerate()) return;
    download(new Blob([JSON.stringify({
      format: 'light-pattern-generator', version: 1, settings
    }, null, 2) + '\n'], { type: 'application/json' }), fileName('json'));
  }

  function checkedSettings(candidate) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      throw new Error('The settings file must contain a settings object.');
    }
    // Pick known properties instead of copying arbitrary imported keys.
    const next = Object.fromEntries(Object.keys(P.DEFAULTS).map(key =>
      [key, candidate[key] === undefined ? P.DEFAULTS[key] : candidate[key]]));
    P.validate(next);
    if (!Object.hasOwn(PanelPreview.COLORS, next.color)) throw new Error('Choose a supported light color.');
    return next;
  }

  async function loadSettings(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 65536) throw new Error('Settings files must be smaller than 64 KB.');
      const saved = JSON.parse(await file.text());
      if (saved.format !== 'light-pattern-generator' || saved.version !== 1) {
        throw new Error('This is not a supported Light Pattern settings file.');
      }
      settings = checkedSettings(saved.settings);
      writeForm();
      regenerate();
    } catch (error) {
      showStatus(`Could not load settings: ${error.message}`, true);
    } finally {
      event.target.value = '';
    }
  }

  function restoreLastSession() {
    try {
      const saved = localStorage.getItem('light-pattern-settings-v1');
      if (saved) settings = checkedSettings(JSON.parse(saved));
    } catch { /* Corrupt or unavailable storage: use the defaults. */ }
  }

  form.addEventListener('input', scheduleRegenerate);
  form.addEventListener('change', regenerate);
  form.addEventListener('submit', event => { event.preventDefault(); regenerate(); });
  $('shuffle').addEventListener('click', () => {
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    $('seed').value = `glow-${bytes[0].toString(36)}`;
    regenerate();
  });
  $('reset').addEventListener('click', () => {
    settings = { ...P.DEFAULTS };
    writeForm();
    regenerate();
  });
  for (const button of document.querySelectorAll('[data-unit]')) {
    button.addEventListener('click', () => setUnits(button.dataset.unit));
  }
  for (const button of document.querySelectorAll('[data-view]')) {
    button.addEventListener('click', () => {
      const mode = button.dataset.view;
      preview.setMode(mode);
      document.querySelectorAll('[data-view]').forEach(item =>
        item.setAttribute('aria-pressed', String(item === button)));
      $('reset-view').hidden = mode !== '3d';
      $('preview-caption').textContent = mode === '3d' ? 'Drag to rotate · scroll to zoom' :
        mode === 'light' ? 'Backlit preview · color is illustrative' : 'Solid panel · slits cut all the way through';
      $('preview-stage').style.touchAction = mode === '3d' ? 'none' : 'auto';
    });
  }
  for (const button of document.querySelectorAll('[data-color]')) {
    button.addEventListener('click', () => { updateColor(button.dataset.color); rememberSettings(); });
  }
  $('reset-view').addEventListener('click', () => preview.resetView());
  $('export-stl').addEventListener('click', exportSTL);
  $('save-settings').addEventListener('click', saveSettings);
  $('load-settings').addEventListener('click', () => $('settings-file').click());
  $('settings-file').addEventListener('change', loadSettings);

  restoreLastSession();
  writeForm();
  regenerate();
})();
