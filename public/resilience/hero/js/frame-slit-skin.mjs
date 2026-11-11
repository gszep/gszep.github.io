// Keep the frame entry fixed while a foot servo pulls its exterior ribbon.
import { framePoint } from './frame-assembly.mjs?v=20261030-servo-fit';

export function frameSlitSkin(route,assembly){
  const arc=[0];for(let i=1;i<route.points.length;i++)arc.push(arc[i-1]+Math.hypot(...route.points[i].map((v,k)=>v-route.points[i-1][k])));
  if(!route.landmarks.entry)return {weights:arc.map(()=>0),sideGuides:route.sideGuides,fixedIndex:0};
  const nearest=point=>route.points.reduce((best,p,i)=>Math.hypot(...p.map((v,k)=>v-point[k]))<Math.hypot(...route.points[best].map((v,k)=>v-point[k]))?i:best,0);
  const [outside,inside]=route.landmarks.entry.map(p=>nearest(framePoint(p,assembly)));
  const entry=route.landmarks.entry[0],wall=nearest(framePoint([assembly.source_frame_bounds_mm[entry[0]>0?1:0][0],entry[1],entry[2]],assembly));
  // Fully torso-fixed before crossing the end wall; use the channel's vertical
  // ribbon orientation at both ends of the slit, not only farther inside it.
  const side=route.sideGuides[1].side;
  const sideGuides=[...route.sideGuides,{index:outside,side},{index:wall,side},{index:inside,side}].sort((a,b)=>a.index-b.index);
  const weights=arc.map(d=>{const t=Math.min(1,d/arc[outside]);return 1-t*t*(3-2*t);});
  return {weights,sideGuides,fixedIndex:outside,wallIndex:wall,insideIndex:inside};
}
