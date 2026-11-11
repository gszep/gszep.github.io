// Instructor-confirmed robot frame: +X left, -Y front, +Z physically up.
// The reference drawing's vertical foot lines mean DOWN, not physical up.
export const FOOT_DOWN_ANGLES={L3:0,L4:180,R3:180,R4:0};
export const STANDING_REFERENCE={R1:135,R2:45,L1:45,L2:135,R4:0,R3:180,L3:0,L4:180};
const HIP_MARKS={L1:[0,45,90],L2:[90,135,180],R1:[90,135,180],R2:[0,45,90]};
export const HORN_RAY_LENGTH_MM=16; // 2 mm beyond the nominal 14 mm horn tip.

export function angleDirection(id,degrees,out=[id.startsWith('L')?1:-1,0,0]){
  const a=(degrees-90)*Math.PI/180;
  if(id.endsWith('1')||id.endsWith('2'))return [out[0]*Math.cos(a)-out[1]*Math.sin(a),out[0]*Math.sin(a)+out[1]*Math.cos(a),0];
  const sign=FOOT_DOWN_ANGLES[id]===180?1:-1;
  return [out[0]*Math.cos(a),out[1]*Math.cos(a),-sign*Math.sin(a)];
}

// A loose horn turns about the upright shaft. Its neutral arm points inward;
// this is distinct from the assembled foot pointing outward at the same 90°.
export function footHornDirection(id,degrees){
  const inward=id.startsWith('L')?-1:1,a=(degrees-90)*Math.PI/180;
  return [inward*Math.cos(a),inward*Math.sin(a),0];
}

export function angleMarks(id){return HIP_MARKS[id]||[0,90,180];}

export function angleGuidePaths(guides){
  return guides.map(({id,angle,start,end,labelOffsetY=0})=>{
    const dx=end[0]-start[0],dy=end[1]-start[1],length=Math.hypot(dx,dy)||1;
    const x=end[0]+dx/length*7,y=end[1]+dy/length*7+labelOffsetY;
    return `<g class="servo-angle-guide" data-joint="${id}" data-angle="${angle}"><line x1="${start[0]}" y1="${start[1]}" x2="${end[0]}" y2="${end[1]}" class="angle-halo"/><line x1="${start[0]}" y1="${start[1]}" x2="${end[0]}" y2="${end[1]}" class="angle-ray"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${angle}°</text></g>`;
  }).join('');
}
