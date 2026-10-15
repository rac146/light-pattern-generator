// Explicitly reviewed upstream designs. Adding an entry requires geometry qualification.
export const polygonSlugs = [
  'abutment', 'angleoff', 'arris', 'battlement', 'bench',
  'bevelset', 'birdsmouth', 'bobbin', 'bracket', 'caltrop',
  'cascade', 'chamfer', 'clipcorner', 'cornerchip', 'cornercut',
  'dieblock', 'dogtooth', 'ell', 'gnomonwedge', 'gorge',
  'guernsey', 'gully', 'halving', 'hilbert', 'housing',
  'jerkinhead', 'larmier', 'lintel', 'louvre', 'merlon',
  'mitre', 'modillion', 'mutule', 'northstar', 'nosing',
  'notchblock', 'octagon', 'quoinwedge', 'rabbet', 'rafter',
  'rebate', 'skewback', 'snipcorner', 'spark', 'staple',
  'stylobate', 'switchback', 'tetro', 'ziggurat', 'ziggy',
];

export const extendedSlugs = [
  'radius', 'bowl', 'bauhaus', 'cavetto', 'apse', 'bight', 'bluff', 'bangle',
  'annulus', 'protractor', 'curl', 'truchetrings', 'anabranch',
  'weave', 'twohalf', 'strand', 'alcove', 'casing', 'maze', 'circuit',
];

export const reviewedSlugs = [...polygonSlugs, ...extendedSlugs];
