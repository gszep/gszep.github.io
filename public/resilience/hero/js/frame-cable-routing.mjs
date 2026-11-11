// Authored routes through the printed frame's existing corner slits, side
// channels and midpoint outlets. Body coordinates: X front, Y left, Z up.
import { framePoint } from './frame-assembly.mjs?v=20261030-servo-fit';
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]);
const mul=(v,k)=>v.map(x=>x*k),length=v=>Math.hypot(...v),unit=v=>mul(v,1/Math.max(1e-12,length(v)));
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);

function roundedPath(controls,radius=()=>1){
  const points=[controls[0]],at=[0];
  const line=end=>{const start=points.at(-1),n=Math.max(1,Math.ceil(length(sub(end,start))/.8));for(let i=1;i<=n;i++)points.push(mix(start,end,i/n));};
  for(let i=1;i<controls.length-1;i++){
    const p=controls[i],incoming=sub(p,controls[i-1]),outgoing=sub(controls[i+1],p),r=Math.min(radius(i),length(incoming)/3,length(outgoing)/3);
    const a=sub(p,mul(unit(incoming),r)),b=add(p,mul(unit(outgoing),r));line(a);at[i]=points.length-1;
    for(let j=1;j<=8;j++){const t=j/8,u=1-t;points.push(a.map((v,k)=>u*u*v+2*u*t*p[k]+t*t*b[k]));}
  }
  line(controls.at(-1));at[controls.length-1]=points.length-1;
  return {points,at};
}

export function frameRibbonRoute(id,start,end,startDirection,startSide,assembly){
  const side=id.startsWith('L')?1:-1,foot=Number(id[1])>2,front=['1','3'].includes(id[1]),sign=front?1:-1;
  const toBody=p=>[-p[1],p[0],p[2]+assembly.pcb_seat_z_mm],vector=v=>[-v[1],v[0],v[2]];
  const root=toBody(start),finish=toBody(end),direction=vector(startDirection),initialSide=vector(startSide);
  const layout=assembly.channel_layout,half=layout?.side_offset_mm??assembly.parameters.widening_mm/2,mid=layout?.midpoint_x_mm??.31923;
  const lane=side*(layout?(foot?layout.foot_lane_y_mm:layout.hip_lane_y_mm):half+(foot?16.0025:17.4525));
  const order=front?(foot?0:1):(foot?2:3),riseY=side*(half+21.5+order*1.5);
  // Two edge-on ribbons occupy each side channel. Stagger the outer (hip)
  // ribbon lower so the pair can turn/twist into the vertical outlet together.
  const z=foot?-6.1:-7.6,verticalSign=Math.sign(initialSide[2])||(front?1:-1);
  const controls=[root,add(root,mul(direction,2))];
  if(foot){
    const outer=front?assembly.source_frame_bounds_mm[1][0]:assembly.source_frame_bounds_mm[0][0];
    // Native end-wall slits are 2 mm inboard of the longitudinal foot lane.
    // Stay low through the aperture, then turn out into the side channel.
    const slitY=side*(half+13.45),slitZ=z-1.3;
    controls.push([outer+sign*4,slitY,slitZ],[sign*39.5,slitY,slitZ],[sign*37,lane,slitZ],[sign*32,lane,slitZ]);
  }else controls.push([root[0]+sign*2,side*(half+19.5),z]);
  controls.push([sign*28,lane,z],[sign*20,lane,z]);const channelIndex=controls.length-1;
  controls.push([mid+sign*8.5,lane,z],[mid+sign*4.3,side*(half+(foot?18.4:19.85)),z]);const channelExit=controls.length-1;
  const entry=assembly.head_cable_entry;
  if(entry){
    const config=assembly.parameters.head_cover.cable_entry;
    const x=entry.centre_x_mm+(2.5-Number(id[1]))*config.pitch_x_mm,inside=side*config.inner_y_mm;
    controls.push([mid,riseY,z],[mid,riseY,z+4]);const riseStart=controls.length-1;
    controls.push([mid,riseY,assembly.servo_flange_seat_z_mm+2]);const deckExit=controls.length-1;
    controls.push([x,riseY,config.z_mm]);const outsideIndex=controls.length-1;
    controls.push([x,side*config.inner_low_y_mm,config.z_mm]);const insideIndex=controls.length-1;
    controls.push([x,side*config.inner_low_y_mm,config.low_rise_z_mm]);const lowRiseIndex=controls.length-1;
    controls.push([x,inside,config.upper_rise_z_mm]);const highRiseIndex=controls.length-1;
    // Two interleaved levels fit below the low roof. Within each hand the
    // lower-entry slots follow header order, so the upper fan-out stays ordered.
    const top=finish[2]+3.0+(Number(id[1])%2)*1.6;
    controls.push([x,inside,top]);const upperIndex=controls.length-1;
    controls.push([finish[0],finish[1],top],finish);
    const sampled=roundedPath(controls,i=>i>=outsideIndex?2:1),toView=v=>[v[1],-v[0],v[2]];
    const across=toView([sign*verticalSign,0,0]);
    const guides=[{index:0,side:startSide},{index:sampled.at[channelIndex],side:toView([0,0,verticalSign])},
      {index:sampled.at[channelExit],side:toView([0,0,verticalSign])},{index:sampled.at[riseStart],side:across},
      {index:sampled.at[deckExit],side:across},
      {index:sampled.at[outsideIndex],side:across},{index:sampled.at[insideIndex],side:across},
      {index:sampled.at[lowRiseIndex],side:across},{index:sampled.at[highRiseIndex],side:across},
      {index:sampled.at[upperIndex],side:across},{index:sampled.at[upperIndex+1],side:[-1,0,0]},
      {index:sampled.points.length-1,side:[-1,0,0]}];
    return {points:sampled.points.map(p=>framePoint(p,assembly)),sideGuides:guides,
      landmarks:{entry:foot?[controls[2],controls[3]]:null,channel:[sign*20,lane,z],riser:[mid,riseY,assembly.servo_flange_seat_z_mm+2],
        headEntry:[x,side*Math.abs(entry.side_y_mm[side>0?1:0]),config.z_mm],insideRiser:[x,inside,top],hand:id[0],order},
      assumptions:'Native lower side entries; internal authored ribbon routing, not live contact or measured cable length'};
  }
  controls.push([mid,riseY,z],[mid,riseY,z+4]);const riseStart=controls.length-1;
  controls.push([mid,riseY,assembly.pcb_seat_z_mm+5]);const riseEnd=controls.length-1;
  const top=finish[2]+6+order*1.8;
  controls.push([mid,riseY,top]);const bendIndex=controls.length-1;
  // Enter the head at the midpoint side notch before fanning out to the hub.
  controls.push([mid,finish[1],top],[finish[0],finish[1],top],finish);
  const sampled=roundedPath(controls,i=>i>=bendIndex?6:1),toView=v=>[v[1],-v[0],v[2]];
  const guides=[{index:0,side:startSide},{index:sampled.at[channelIndex],side:toView([0,0,verticalSign])},{index:sampled.at[channelExit],side:toView([0,0,verticalSign])},
    {index:sampled.at[riseStart],side:toView([sign*verticalSign,0,0])},{index:sampled.at[riseEnd],side:toView([sign*verticalSign,0,0])},
    {index:sampled.at[bendIndex],side:toView([sign*verticalSign,0,0])},
    {index:sampled.at[bendIndex+1],side:toView([sign*verticalSign,0,0])},{index:sampled.points.length-1,side:[-1,0,0]}];
  return {points:sampled.points.map(p=>framePoint(p,assembly)),sideGuides:guides,
    landmarks:{entry:foot?[controls[2],controls[3]]:null,channel:[sign*20,lane,z],riser:[mid,riseY,assembly.pcb_seat_z_mm+5],hand:id[0],order},
    assumptions:'Reference-frame channel dimensions; authored static routing, not live contact or measured cable length'};
}
