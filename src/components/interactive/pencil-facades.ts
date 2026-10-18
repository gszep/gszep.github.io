export type DrawingPoint = { x: number; y: number };
export type FacadeMode = 'loose' | 'contained' | 'planar';

/** Conservative footprint test for a convex projected face, in drawing units.
 * Testing the centre alone lets a wide ribbon or its dry fibres cross a crease.
 * Edge-on / collapsed faces intentionally receive no shading strokes.
 */
export function insideFace(p: DrawingPoint, polygon: DrawingPoint[], inset: number): boolean {
  if (polygon.length < 3) return false;
  let side = 0, area = 0;
  for (let i=0; i<polygon.length; i++) {
    const a=polygon[i], b=polygon[(i+1)%polygon.length];
    const dx=b.x-a.x, dy=b.y-a.y, length=Math.hypot(dx,dy);
    area += a.x*b.y-b.x*a.y;
    if (length < .00001) continue;
    const cross=dx*(p.y-a.y)-dy*(p.x-a.x);
    if (Math.abs(cross)/length < Math.max(0,inset)) return false;
    if (Math.abs(cross) > .00001) {
      const next=Math.sign(cross);
      if (side && side !== next) return false;
      side=next;
    }
  }
  return Math.abs(area) > .01;
}

/** A short sweep in a face's drawing direction. It has a shallow hand bow,
 * but no edge sensors or accumulating angular drift that would curl it around
 * a silhouette. Truncate before the pressure footprint reaches a crease.
 */
export function planarStroke(start: DrawingPoint, heading: number, length: number,
  bow: number, phase: number, polygon: DrawingPoint[], inset: number): DrawingPoint[] {
  const path: DrawingPoint[]=[];
  const dx=Math.cos(heading), dy=Math.sin(heading);
  const steps=Math.max(3,Math.ceil(length/2.5));
  for (let i=0;i<=steps;i++) {
    const t=i/steps;
    const offset=Math.sin(t*Math.PI)*bow + Math.sin(t*Math.PI*3+phase)*.25;
    const p={x:start.x+dx*t*length-dy*offset,y:start.y+dy*t*length+dx*offset};
    if (!insideFace(p,polygon,inset)) break;
    path.push(p);
  }
  return path.length >= 3 ? path : [];
}
