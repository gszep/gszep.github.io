import type { DrawingPoint } from './pencil-facades';

export function pencilRandom(seed: number) {
  let state = seed | 0;
  return () => {
    state = Math.imul(state ^ (state >>> 16), 0x21f0aaad);
    state = Math.imul(state ^ (state >>> 15), 0x735a2d97);
    state ^= state >>> 15;
    return (state >>> 0) / 4294967296;
  };
}

/** The drawing study's pressure ribbon and dry graphite filaments, shared with
 * the horse. Stable seeds keep the paper marks from randomly boiling each frame. */
export function graphiteStroke(ctx: CanvasRenderingContext2D, path: DrawingPoint[],
  weight: number, opacity: number, seed: number, tooth: number) {
  if (path.length < 3) return;
  const r = pencilRandom(seed);
  const sides: DrawingPoint[][] = [[], []];
  path.forEach((p, i) => {
    const before = path[Math.max(0, i-1)], after = path[Math.min(path.length-1, i+1)];
    const len = Math.max(.01, Math.hypot(after.x-before.x, after.y-before.y));
    const envelope = .12+.88*Math.pow(Math.sin(Math.PI*i/(path.length-1)), .65);
    const radius = weight*envelope*(.65+r()*.3);
    const nx = -(after.y-before.y)/len*radius, ny = (after.x-before.x)/len*radius;
    sides[0].push({x:p.x+nx, y:p.y+ny}); sides[1].push({x:p.x-nx, y:p.y-ny});
  });
  ctx.beginPath();
  [...sides[0], ...sides[1].reverse()].forEach((p,i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y));
  ctx.closePath(); ctx.fillStyle = `rgba(42,42,36,${opacity*.34})`; ctx.fill();
  const fibers = 3+Math.ceil(weight*.8);
  for (let f=0; f<fibers; f++) {
    const ox = (r()-.5)*weight, oy = (r()-.5)*weight;
    ctx.beginPath(); let drawing = false;
    for (let j=0; j<path.length; j++) {
      const p = path[j], envelope = Math.sin(Math.PI*j/(path.length-1));
      if (r()<tooth*.07 || (envelope<.3 && r()<.2)) { drawing=false; continue; }
      const x = p.x+ox+(r()-.5)*.9, y = p.y+oy+(r()-.5)*.9;
      if (drawing) ctx.lineTo(x,y); else ctx.moveTo(x,y);
      drawing = true;
    }
    ctx.lineWidth = (.35+r()*.65)*(1+weight*.2);
    ctx.strokeStyle = `rgba(35,36,30,${opacity*(.3+r()*.35)})`; ctx.stroke();
  }
}
