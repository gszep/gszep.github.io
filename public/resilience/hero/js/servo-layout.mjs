export function layoutPoint(point,pose) {
  const local=point.map((v,i)=>v-pose.origin[i]);
  return pose.matrix.map((row,i)=>row.reduce((sum,v,k)=>sum+v*local[k],pose.target[i]));
}
export function layoutVector(vector,pose) {
  return pose.matrix.map(row=>row.reduce((sum,v,k)=>sum+v*vector[k],0));
}
export function peripheralPose(id) {
  if(id.startsWith('external.oled.'))return 'oled';
  if(id==='external.switch.body')return 'switch';
  if(id.startsWith('external.battery.')&&!id.includes('.balance.'))return 'battery';
  if(id.startsWith('external.power.jst.unplugged'))return 'batteryPlug';
  if(id.startsWith('external.i2c.')&&id.includes('.oled.'))return 'oled';
  if((id.startsWith('external.i2c.')&&id.includes('.carrier.'))||id.includes('.dupont.'))return 'board';
  if(id.startsWith('external.power.switch-')&&id.endsWith('.solder'))return 'switch';
  return null;
}

const clamp=value=>Math.max(0,Math.min(1,value));
const smooth=value=>{const t=clamp(value);return t*t*(3-2*t);};
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
export function batteryPlugPose(progress,parked,connected) {
  const p=clamp(progress),raised=[parked[0],parked[1],36],above=[connected[0],connected[1],36];
  const point=p<.35?mix(parked,raised,smooth(p/.35)):p<.7?mix(raised,above,smooth((p-.35)/.35)):mix(above,connected,smooth((p-.7)/.3));
  return {point,rotation:Math.PI/2*smooth((p-.35)/.35),progress:p};
}
export function resamplePath(points,count=129) {
  const arc=[0];for(let i=1;i<points.length;i++)arc.push(arc.at(-1)+Math.hypot(...points[i].map((v,k)=>v-points[i-1][k])));
  let j=0;
  return Array.from({length:count},(_,i)=>{const at=arc.at(-1)*i/(count-1);while(j<arc.length-2&&arc[j+1]<at)j++;return mix(points[j],points[j+1],(at-arc[j])/Math.max(1e-9,arc[j+1]-arc[j]));});
}
export function batteryLeadPoints(parked,connected,pose,plugOrigin) {
  const offset=parked.at(-1).map((v,k)=>v-plugOrigin[k]),c=Math.cos(pose.rotation),s=Math.sin(pose.rotation);
  const end=[c*offset[0]-s*offset[1],s*offset[0]+c*offset[1],offset[2]].map((v,k)=>v+pose.point[k]);
  const correction=end.map((v,k)=>v-(parked.at(-1)[k]+pose.progress*(connected.at(-1)[k]-parked.at(-1)[k])));
  return parked.map((point,i)=>mix(point,connected[i],pose.progress).map((v,k)=>v+correction[k]*smooth(i/(parked.length-1))));
}
