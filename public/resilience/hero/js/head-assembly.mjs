// View coordinates: +Y is robot rear; body coordinates are X front, Y left, Z up.
const clamp=x=>Math.max(0,Math.min(1,x));
export function lidSlideOffset(assembly,progress){
  const b=assembly.parts['head-lid'].bounds_mm,travel=b[1][0]-b[0][0]+14;
  return [0,travel*(1-clamp(progress)),0];
}
