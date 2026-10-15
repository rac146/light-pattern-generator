/** Explicit geometric recipes for reviewed Tabbied masks and rounded shapes.
 * Curves become polygon edges with at most 0.04 mm chord error. Every recipe
 * returns filled, separate polygons; ring centers get deliberate solid bridges.
 * This is not a generic CSS/SVG renderer. Unsupported recipes fail visibly.
 */
const TabbiedShapes = (() => {
  const CURVE_ERROR_MM = 0.04;
  const TAU = Math.PI * 2;
  const rectangle = (x, y, width, height) => [[x,y],[x+width,y],[x+width,y+height],[x,y+height]];

  function clean(polygon) {
    // Exact duplicate endpoints create zero-length edges in the mesher.
    const points = polygon.map(([x,y]) => [Math.round(x*1e8)/1e8, Math.round(y*1e8)/1e8]);
    const result = points.filter((p,i) => i === 0 || p[0] !== points[i-1][0] || p[1] !== points[i-1][1]);
    if (result.length > 1 && result[0][0] === result.at(-1)[0] && result[0][1] === result.at(-1)[1]) result.pop();
    return result;
  }

  function arc(cx, cy, radius, from, to, size) {
    if (radius === 0) return [[cx,cy]];
    const radiusMM = radius * size;
    const step = 2 * Math.acos(Math.max(-1, Math.min(1, 1 - CURVE_ERROR_MM / radiusMM)));
    const count = Math.max(2, Math.ceil(Math.abs(to - from) / step));
    return Array.from({length: count+1}, (_,i) => {
      const angle = from + (to-from)*i/count;
      return [cx+radius*Math.cos(angle), cy+radius*Math.sin(angle)];
    });
  }

  function band(cx, cy, outer, inner, from, to, size) {
    return clean(arc(cx,cy,outer,from,to,size).concat(
      inner > 0 ? arc(cx,cy,inner,to,from,size) : [[cx,cy]]));
  }

  function rounded(box, corners, size) {
    const [x,y,w,h] = box;
    const radii = corners.map(r => r*Math.min(w,h));
    const factor = Math.min(1,
      ...[w/(radii[0]+radii[1]),h/(radii[1]+radii[2]),
          w/(radii[2]+radii[3]),h/(radii[3]+radii[0])]);
    const [tl,tr,br,bl] = radii.map(r=>r*factor);
    return clean([
      ...arc(x+w-tr,y+tr,tr,-Math.PI/2,0,size),
      ...arc(x+w-br,y+h-br,br,0,Math.PI/2,size),
      ...arc(x+bl,y+h-bl,bl,Math.PI/2,Math.PI,size),
      ...arc(x+tl,y+tl,tl,Math.PI,Math.PI*1.5,size)
    ]);
  }

  function choose(values, random, weights) {
    if (!weights) return values[Math.floor(random()*values.length)];
    const target = random();
    let total = 0;
    for (let i=0; i<values.length; i++) {
      total += weights[i];
      if (target < total) return values[i];
    }
    return values.at(-1);
  }

  function ringHalves(outer, inner, gap, size) {
    // A vertical strip remains solid, with two connections from center to frame.
    // asin uses the inner radius, the narrowest location of that material strip.
    const angle = Math.asin(Math.min(0.95, gap/(2*inner)));
    return [band(0.5,0.5,outer,inner,-Math.PI/2+angle,Math.PI/2-angle,size),
            band(0.5,0.5,outer,inner,Math.PI/2+angle,Math.PI*1.5-angle,size)];
  }

  function shapes(design, {size, gap, random, row, rows}) {
    switch (design.kind) {
      case 'polygon': return [design.polygon];
      case 'radius': {
        const choice = Math.floor(random()*5);
        if (choice === 4) return [clean(arc(0.5,0.5,0.5,0,TAU,size))];
        const centers = [[0,0],[1,0],[1,1],[0,1]];
        const angles = [[0,Math.PI/2],[Math.PI/2,Math.PI],[Math.PI,Math.PI*1.5],[Math.PI*1.5,TAU]];
        return [band(...centers[choice],1,0,...angles[choice],size)];
      }
      case 'rounded': return [rounded(design.box || [0,0,1,1], choose(design.corners,random,design.weights),size)];
      case 'apse': {
        const radius = 0.28*0.55; // CSS farthest-side at (55%,50%).
        return [clean([[0,0],[0.55,0],[0.55,0.5-radius],
          ...arc(0.55,0.5,radius,-Math.PI/2,Math.PI/2,size),[0.55,1],[0,1]])];
      }
      case 'bight': {
        const radius = 0.28*0.62;
        return [clean([[0,0],[1,0],[1,0.62],
          ...arc(0.5,0.62,radius,0,-Math.PI,size),[0,0.62]])];
      }
      case 'bluff': {
        const radius = 0.66;
        const angle = Math.asin(0.5/radius);
        return [clean([[0,0],...arc(0,0.5,radius,-angle,angle,size),[0,1]])];
      }
      case 'arc': return [band(0,0,design.outer,design.inner,0,Math.PI/2,size)];
      case 'annulus': {
        const inner = Math.max(0.46*(0.66-0.46*(row+1)/rows), gap/2+0.015);
        return ringHalves(0.46,inner,gap,size);
      }
      case 'protractor': return [band(0.5,0.5,0.5,0.18,-Math.PI/2,Math.PI/2,size)];
      case 'paired-arcs': {
        // At small pitches, keep a solid web between the two inner-facing arcs.
        const outer = Math.min(design.outer, (Math.SQRT2-gap)/2);
        if (outer <= design.inner+0.005) return [];
        return [band(0,0,outer,design.inner,0,Math.PI/2,size),
                band(1,1,outer,design.inner,Math.PI,Math.PI*1.5,size)];
      }
      case 'rectangles': return design.boxes.map(box=>rectangle(...box));
      case 'weave': {
        if (random() < 0.12) return [random()<0.5 ? rectangle(0,0,1,1) : clean(arc(0.5,0.5,0.5,0,TAU,size))];
        return [0,0.25,0.5,0.75].map(y=>rectangle(0,y,1,0.125));
      }
      case 'alcove': return [[[0,0],[0.14,0],[0.14,0.86],[0.86,0.86],[0.86,0],[1,0],[1,1],[0,1]]];
      case 'casing': {
        // Two C-like halves instead of a closed square cut that frees its center.
        const half = Math.max(gap/2,0.02);
        return [ [[0,0],[0.5-half,0],[0.5-half,0.14],[0.14,0.14],[0.14,0.86],
                  [0.5-half,0.86],[0.5-half,1],[0,1]],
                 [[0.5+half,0],[1,0],[1,1],[0.5+half,1],[0.5+half,0.86],[0.86,0.86],
                  [0.86,0.14],[0.5+half,0.14]] ];
      }
      case 'maze': {
        if (random()<0.08) return [clean(arc(0.5,0.5,0.208,0,TAU,size))];
        // Upstream default gradient half-thickness is 8% of a tile.
        return [[[0,0.16],[0.84,1],[1,1],[1,0.84],[0.16,0],[0,0]]];
      }
      case 'circuit': {
        const top=random()<0.65, left=random()<0.65;
        const t=0.07;
        const result=[];
        if (top&&left) result.push([[0,0],[1,0],[1,t],[t,t],[t,1],[0,1]]);
        else if(top) result.push(rectangle(0,0,1,t));
        else if(left) result.push(rectangle(0,0,t,1));
        const nodeStart = Math.max(0.18,t+gap);
        if(random()<0.16) result.push(rectangle(nodeStart+random()*(0.87-nodeStart),nodeStart+random()*(0.87-nodeStart),0.13,0.13));
        return result;
      }
      default: throw new Error(`Unsupported Tabbied recipe: ${design.kind}`);
    }
  }

  return { CURVE_ERROR_MM, shapes, arc, band, rounded, clean };
})();
