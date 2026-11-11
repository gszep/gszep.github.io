import { LEG_PAIRS } from './leg-assembly.mjs?v=20261030-servo-fit';
const ease=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};

// CAD X-front/Y-left/Z-up -> established viewer X-left/Y-back/Z-up.
export const framePoint=(point,assembly)=>[point[1],-point[0],point[2]-assembly.pcb_seat_z_mm];

export function frameMountOffset(id,joints,assembly,progress=1){
  const pair=LEG_PAIRS.find(p=>p.hip===id||p.foot===id);
  if(!pair)throw Error('Unknown leg joint '+id);
  const hip=joints[pair.hip],target=hip.frameMountTarget??assembly.hip_shaft_xy_mm[pair.hip];
  const planar=ease(progress*2),vertical=ease(progress*2-1);
  return [(target[1]-hip.pivot[0])*planar,(-target[0]-hip.pivot[1])*planar,
    (assembly.servo_flange_seat_z_mm-assembly.pcb_seat_z_mm-hip.mountFlangeZ)*vertical];
}
