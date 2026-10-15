// One ordered list for the offline bundle and Node geometry checks.
export const engineModules = [
  'geometry', 'pattern-tools', 'patterns/simple', 'patterns/tabbied-presets',
  'patterns/tabbied-shapes', 'patterns/tabbied', 'pattern', 'mesh'
];
export const appModules = [...engineModules, 'preview', 'app'];
