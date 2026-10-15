// Hand-reviewed adapters for upstream masks, rounded boxes and multiple shapes.
// Geometry stays declarative here; src/patterns/tabbied-shapes.js implements it.
const quarterTurns = { orientation: 'random', turns: [0, 1, 2, 3] };
const halfTurns = { orientation: 'random', turns: [0, 1] };
const fixed = { orientation: 'fixed', turns: [0] };
export const extendedRecipes = {
  radius: { ...fixed, kind: 'radius', category: 'Curves',
    description: 'Quarter discs and circles fill separate tiles with solid gaps.' },
  bowl: { ...quarterTurns, kind: 'rounded', category: 'Curves', box: [0.06, 0.06, 0.88, 0.88],
    corners: [[0, 0, 0.5, 0.5]], description: 'Bowl-shaped cutouts with rounded lower corners turn across the panel.' },
  bauhaus: { ...fixed, kind: 'rounded', category: 'Curves',
    corners: [[0.5,0.5,0.5,0.5],[0.5,0.5,0,0],[0,0,0.5,0.5],[0.5,0,0,0.5],[0,0.5,0.5,0],[0,0,0,0],[0.5,0,0.5,0],[0,0.5,0,0.5]],
    description: 'Circles, rounded blocks and leaf-like shapes mix in a geometric field.' },
  cavetto: { ...quarterTurns, kind: 'rounded', category: 'Curves',
    corners: [[0,0,0,1],[0,0,0.5,0.5]], weights: [0.7,0.3],
    description: 'Single curved corners mix with bowls, rotated within separate tiles.' },
  apse: { ...halfTurns, kind: 'apse', category: 'Curves',
    description: 'Rectangular bodies end in a semicircular extension.' },
  bight: { ...quarterTurns, kind: 'bight', category: 'Curves',
    description: 'Broad blocks have a curved bay removed from one edge.' },
  bluff: { ...halfTurns, kind: 'bluff', category: 'Curves',
    description: 'Rounded bulges project from the edge of each tile.' },
  bangle: { ...quarterTurns, kind: 'arc', category: 'Curves', outer: 0.58 * Math.SQRT2, inner: 0.44 * Math.SQRT2,
    description: 'Quarter-ring arcs turn around tile corners, separated by material bridges.' },
  annulus: { ...fixed, kind: 'annulus', category: 'Curves', minCell: 14,
    description: 'Rings thicken down the panel. Two solid bridges hold each center in place.' },
  protractor: { ...quarterTurns, kind: 'protractor', category: 'Curves',
    description: 'Half-ring cutouts leave a solid opening to their center.' },
  curl: { ...halfTurns, kind: 'paired-arcs', category: 'Paths', outer: 0.58, inner: 0.42, minCell: 14,
    description: 'Paired quarter arcs suggest winding paths. Solid gaps keep loops from detaching material.' },
  truchetrings: { ...quarterTurns, kind: 'paired-arcs', category: 'Paths', outer: 0.54, inner: 0.46, minCell: 14,
    description: 'Thin paired arcs turn across the grid, with solid bridges between tiles.' },
  anabranch: { ...halfTurns, kind: 'paired-arcs', category: 'Paths', outer: 0.6, inner: 0.4, minCell: 14,
    description: 'Broad paired arcs form winding channels with solid gaps between tiles.' },
  weave: { ...halfTurns, kind: 'weave', category: 'Multi-part', minCell: 23,
    description: 'Alternating stripe tiles mix with occasional round or square patches.' },
  twohalf: { ...halfTurns, kind: 'rectangles', category: 'Multi-part', minCell: 24,
    boxes: [[0,0,0.44,1],[0.56,0,0.44,1]], description: 'Two broad blocks share each tile, separated by a solid channel.' },
  strand: { ...quarterTurns, kind: 'rectangles', category: 'Multi-part', minCell: 20,
    boxes: [[0,0,1,0.3],[0,0.46,1,0.12]], description: 'A broad band and a narrow band share each tile.' },
  alcove: { ...quarterTurns, kind: 'alcove', category: 'Multi-part',
    description: 'Three bands join into a U-shaped opening in each tile.' },
  casing: { ...quarterTurns, kind: 'casing', category: 'Multi-part',
    description: 'Square frames have two deliberate breaks to keep their centers attached.' },
  maze: { ...halfTurns, kind: 'maze', category: 'Paths',
    description: 'Diagonal maze strokes and occasional round nodes have solid gaps between tiles.' },
  circuit: { ...fixed, kind: 'circuit', category: 'Paths', minCell: 18,
    description: 'Random horizontal and vertical traces meet at corners, with occasional component nodes and solid gaps.' }
};

// Guard the features each recipe was written for. The complete upstream files
// are also integrity-pinned; a package upgrade requires re-reviewing recipes.
export function reviewedRecipe(definition) {
  const recipe = extendedRecipes[definition.slug];
  if (!recipe) throw new Error(`No recipe for ${definition.slug}.`);
  const style = definition.code.style;
  const expected = {
    radius: 'circle(50% at 50% 50%)', bowl: 'border-radius: 0 0 999px 999px',
    bauhaus: "'100% 0% 100% 0%'", cavetto: 'border-radius: 0 0 0 100%',
    apse: 'at 55% 50%', bight: 'mask-composite: intersect', bluff: '#000 66%',
    bangle: '#000 44% 58%', annulus: '66 - 46 * @y / @Y', protractor: '0 180deg',
    curl: 'calc(42% - 0.5px)', truchetrings: 'border: 2px solid', anabranch: '@var(--qa)',
    weave: '12.5% 25%', twohalf: 'width: 44%', strand: '46% 58%',
    alcove: '#000 0 14%', casing: '#000 0 14%', maze: '${strokeWidth}', circuit: 'border-top: 2px'
  }[definition.slug];
  if (!style.includes(expected)) throw new Error(`Upstream ${definition.slug} changed: review its recipe.`);
  return recipe;
}
