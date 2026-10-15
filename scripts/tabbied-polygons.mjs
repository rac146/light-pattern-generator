// Convert the reviewed subset of static percentage polygons. This deliberately
// rejects other CSS geometry rather than silently dropping unsupported parts.
export function polygonDefinition(definition) {
  const style = definition.code.style;
  const matches = [...style.matchAll(/(?:^|[;\s])clip-path:\s*polygon\(([^)]+)\)/g)];
  if (matches.length !== 1) throw new Error(`Review a converter for ${definition.slug}: expected one polygon.`);
  const polygon = matches[0][1].split(',').map(pair => pair.trim().split(/\s+/).map(token => {
    if (token === '0') return 0;
    if (!/^\d+(\.\d+)?%$/.test(token)) throw new Error(`Unsupported coordinate: ${token}`);
    const value = Number(token.slice(0, -1)) / 100;
    if (value < 0 || value > 1) throw new Error('Polygon must fit its tile.');
    return value;
  }));
  if (polygon.some(pair => pair.length !== 2)) throw new Error('Expected coordinate pairs.');
  const transforms = [...style.matchAll(/(?:^|[;\s])transform:\s*([^;]+);/g)];
  if (!transforms.length) return { polygon, orientation: 'fixed', turns: [0] };
  if (transforms.length !== 1) throw new Error(`Review transforms for ${definition.slug}.`);
  const transform = transforms[0][1];
  if (transform === 'rotate(@calc(@i % 4 * 90)deg)') {
    return { polygon, orientation: 'cycle', turns: [0, 1, 2, 3] };
  }
  const choices = transform === 'rotate(@var(--rot))' ?
    style.match(/--rot:\s*@(?:pick|p)\(([^)]+)\)/)?.[1] :
    transform.match(/^rotate\(@pick\(([^)]+)\)\)$/)?.[1];
  if (!choices) throw new Error(`Review rotation for ${definition.slug}.`);
  const turns = choices.split(',').map(token => {
    if (!/^\s*(0|90|180|270)deg\s*$/.test(token)) throw new Error('Expected quarter turns.');
    return Number(token.trim().slice(0, -3)) / 90;
  });
  return { polygon, orientation: 'random', turns };
}
