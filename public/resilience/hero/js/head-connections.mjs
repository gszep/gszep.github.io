// Authored assembly illustration. View axes: +Y rear, +X robot-left, +Z up.
import { framePoint } from './frame-assembly.mjs?v=20261030-servo-fit';
import { layoutPoint, resamplePath } from './servo-layout.mjs?v=20261028-load';

function roundedRoute(controls){
  const points=[controls[0]];
  for(let i=1;i<controls.length-1;i++){
    const p=controls[i],a=controls[i-1],b=controls[i+1];
    const before=Math.hypot(...p.map((v,k)=>v-a[k])),after=Math.hypot(...p.map((v,k)=>v-b[k]));
    const r=Math.min(2,before/3,after/3);
    const start=p.map((v,k)=>v+(a[k]-v)*r/before),end=p.map((v,k)=>v+(b[k]-v)*r/after);
    points.push(start);
    for(let j=1;j<=8;j++){const t=j/8,u=1-t;points.push(p.map((v,k)=>u*u*start[k]+2*u*t*v+t*t*end[k]));}
  }
  points.push(controls.at(-1));return resamplePath(points);
}

export function headPeripheralPoses(assembly,layout){
  const w=assembly.head_fit.display_window,n=w.normal,c=framePoint(w.centre_mm,assembly);
  const s=assembly.head_fit.switch_opening,sc=framePoint(s.centre_mm,assembly),ny=-s.normal[0],nz=s.normal[2];
  return {
    board:layout.poses.board,
    oled:{origin:[40,85.5,43.04],target:[c[0],c[1]+.8*n[0],c[2]-.8*n[2]],matrix:[[1,0,0],[0,n[2],-n[0]],[0,n[0],n[2]]]},
    // Nominal wall plane between the reference toggle's two nuts. This poses
    // the existing illustration; it does not certify its bushing fits the bore.
    switch:{origin:[-25,70,17.25],target:sc,matrix:[[1,0,0],[0,nz,ny],[0,-ny,nz]]},
  };
}

export function headConnectionKind(id){
  return /^external\.(oled\.|i2c\.)/.test(id)?'oled':/^external\.(switch\.|power\.switch-)/.test(id)?'switch':null;
}

export function headConnectionRoute(lead,poses,layout,progress=1){
  const oled=lead.id.startsWith('external.i2c.'),kind=oled?'oled':'switch';
  const index=oled?Number(lead.id.split('.').at(-1))-12:lead.id.endsWith('-in')?0:1;
  const sourcePose=layout.poses[kind],old=oled?lead.points.at(-1):lead.points[0];
  // Invert the orthonormal bench pose to recover the native terminal endpoint.
  const d=old.map((v,i)=>v-sourcePose.target[i]);
  const native=sourcePose.origin.map((v,k)=>v+sourcePose.matrix.reduce((sum,row,i)=>sum+row[k]*d[i],0));
  const peripheral=layoutPoint(native,poses[kind]);
  const board=[...(oled?lead.points[0]:lead.points.at(-1))];
  const lift=6*(1-Math.max(0,Math.min(1,progress)));
  // The low longitudinal lanes pass UNDER the elevated right-hand fan-out.
  // Terminal approach rises only at the carrier socket, clear of the crossings.
  const lane=oled?-5-index*1.3:4+index*1.6,z=30;
  const controls=[peripheral,[peripheral[0],peripheral[1]+(oled?4:-4),peripheral[2]],
    [lane,oled?-19:21,z],[lane,oled?-9:-20,z],
    [board[0],board[1],z],[board[0],board[1],board[2]+lift]];
  return {kind,points:roundedRoute(controls),board,peripheral,radius:lead.radius,color:lead.color,lift};
}
