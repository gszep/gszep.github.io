import { framePoint } from './frame-assembly.mjs?v=20261030-servo-fit';
import { layoutPoint, resamplePath } from './servo-layout.mjs?v=20261028-load';

export function mountedBatteryPose(assembly){
  return {origin:[-39.5,31,7],target:framePoint(assembly.parameters.battery_mount.centre_mm,assembly),matrix:[[0,-1,0],[-1,0,0],[0,0,-1]]};
}

export function remountBatteryPoint(point,layout,assembly){
  const old=layout.poses.battery,d=point.map((v,i)=>v-old.target[i]);
  const native=old.origin.map((v,k)=>v+old.matrix.reduce((sum,row,i)=>sum+row[k]*d[i],0));
  return layoutPoint(native,mountedBatteryPose(assembly));
}

export function batteryInsertionPose(assembly,insert){
  const m=assembly.parameters.battery_mount,u=Math.max(0,Math.min(1,(insert-.9)/.1));
  return {pivot:mountedBatteryPose(assembly).target,offset:[0,0,-m.insertion_travel_mm*(1-insert)],rotation:m.insertion_roll_deg*Math.PI/180*(1-u*u*(3-2*u)),rotationAxis:[0,-1,0]};
}

export function insertedBatteryPoint(point,assembly,insert){
  const p=batteryInsertionPose(assembly,insert),v=point.map((x,i)=>x-p.pivot[i]),c=Math.cos(p.rotation),s=Math.sin(p.rotation);
  return [c*v[0]-s*v[2],v[1],s*v[0]+c*v[2]].map((x,i)=>x+p.pivot[i]+p.offset[i]);
}

function roundPath(controls){
  const points=[controls[0]];
  for(let i=1;i<controls.length-1;i++){
    const p=controls[i],a=controls[i-1],b=controls[i+1],before=Math.hypot(...p.map((v,k)=>v-a[k])),after=Math.hypot(...p.map((v,k)=>v-b[k]));
    const r=Math.min(1.2,before/3,after/3),start=p.map((v,k)=>v+(a[k]-v)*r/before),end=p.map((v,k)=>v+(b[k]-v)*r/after);
    points.push(start);for(let j=1;j<=8;j++){const t=j/8,u=1-t;points.push(p.map((v,k)=>u*u*start[k]+2*u*t*v+t*t*end[k]));}
  }
  points.push(controls.at(-1));return resamplePath(points);
}

export function frameBatteryLead(lead,connected,assembly,layout,insert=1,plug=1){
  const mount=assembly.parameters.battery_mount,entry=assembly.head_fit.battery_entry;
  const toBody=p=>[-p[1],p[0],p[2]+assembly.pcb_seat_z_mm];
  const start=toBody(insertedBatteryPoint(remountBatteryPoint(lead.points[0],layout,assembly),assembly,insert)),end=toBody(connected.points.at(-1));
  const i=lead.id.endsWith('positive')?0:1,x=entry.centre_x_mm+(i? .9:-.9),z=mount.centre_mm[2],laneZ=start[2]+(i?-1.8:1.8);
  const fore=mount.centre_mm[0]+mount.envelope_mm[0]/2+.9;
  end[2]+=6*(1-plug);
  const controls=[start,[fore,start[1],start[2]],[fore,start[1],laneZ],[fore,-17,laneZ],
    [x,-20,(laneZ+z)/2],[x,-24,z],[x,-30.6,z],[x,-30.6,entry.wire_z_mm],
    [x,-26,entry.wire_z_mm],[x,-26,13],[x,-23,13],
    [x,-23,end[2]+(i?7.5:10)],[end[0],end[1],end[2]+(i?7.5:10)],end];
  return {points:roundPath(controls).map(p=>framePoint(p,assembly)),start:framePoint(start,assembly),end:framePoint(end,assembly),channelX:x};
}
