/** Pattern registry and shared printing rules. Generators only propose holes;
 * every family passes through the same border, spacing and simplicity checks.
 * Preview and mesh code consume this result without knowing the generator.
 */
const PatternGenerator = (() => {
  const G = PanelGeometry;
  const LEGACY_BORDER_MM = 12.7;
  const LIMITS = {
    length: [40, 500], width: [40, 500], thickness: [0.6, 20], borderWidth: [1, 200],
    slitWidth: [0.6, 8], minSlitLength: [0, 1000], patternSize: [10, 150],
    density: [0, 100], complexity: [1, 8]
  };
  const DEFAULTS = {
    length: 200, width: 160, thickness: 3, borderWidth: 6, slitWidth: 1.6, minSlitLength: 30,
    patternSize: 30, density: 50, complexity: 5, style: 'circuit', seed: 'neon-01',
    units: 'mm', color: 'cyan'
  };
  const families = [SimplePatterns, TabbiedPatterns];
  const registry = new Map(families.flatMap(family =>
    family.designs.map(design => [design.id, { ...design, family }])));
  const getDesign = style => registry.get(style);

  function validate(settings) {
    for (const [name, [min, max]] of Object.entries(LIMITS)) {
      if (typeof settings[name] !== 'number' || !Number.isFinite(settings[name]) ||
          settings[name] < min || settings[name] > max) {
        const label = { minSlitLength: 'Minimum slit length', borderWidth: 'Border width',
          patternSize: 'Pattern size' }[name] || name;
        throw new Error(`${label} must be between ${min} and ${max}${
          ['density', 'complexity'].includes(name) ? '' : ' mm'}.`);
      }
    }
    if (settings.borderWidth * 2 >= Math.min(settings.length, settings.width)) {
      throw new Error('Border width must be less than half the panel’s shorter dimension.');
    }
    if (!Number.isInteger(settings.complexity)) throw new Error('Bends must be a whole number.');
    if (!getDesign(settings.style)) throw new Error('Choose a supported pattern style.');
    if (typeof settings.seed !== 'string' || !settings.seed.trim() || settings.seed.length > 64) {
      throw new Error('Enter a seed containing 1–64 characters.');
    }
    if (settings.units !== 'mm' && settings.units !== 'in') throw new Error('Choose mm or inches.');
    return settings;
  }

  function createCutouts(settings, minimumWeb) {
    const holes = [];
    const paths = [];
    const border = settings.borderWidth;
    function add(polygon, path = null) {
      if (path && PatternTools.pathLength(path) < settings.minSlitLength) return false;
      if (polygon.length < 3 || polygon.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) return false;
      const hole = polygon.map(p => G.point(p.x, p.y));
      if (!G.isSimplePolygon(hole)) return false;
      if (hole.some(p => p.x < border || p.x > settings.length - border ||
                         p.y < border || p.y > settings.width - border)) return false;
      if (!holes.every(other => G.polygonsHaveClearance(hole, other, minimumWeb))) return false;
      if (G.signedArea(hole) > 0) hole.reverse();
      holes.push(hole);
      if (path) paths.push(path);
      return true;
    }
    return { holes, paths, minimumWeb, add };
  }

  function generate(settings) {
    validate(settings);
    const family = getDesign(settings.style).family;
    const minimumWeb = family.controls === 'lines' ? Math.max(2.4, settings.slitWidth) : 2.4;
    const cuts = createCutouts(settings, minimumWeb);
    const details = family.generate(settings, cuts);
    const openArea = cuts.holes.reduce((total, hole) => total + Math.abs(G.signedArea(hole)), 0);
    return {
      settings: { ...settings }, holes: cuts.holes, paths: cuts.paths, minimumWeb, openArea,
      openPercent: 100 * openArea / (settings.length * settings.width),
      densityLimited: Boolean(details.densityLimited), notice: details.notice || '',
      volume: (settings.length * settings.width - openArea) * settings.thickness
    };
  }

  return {
    DEFAULTS, LIMITS, LEGACY_BORDER_MM, families, getDesign, validate, generate,
    createCutouts, ...PatternTools
  };
})();
