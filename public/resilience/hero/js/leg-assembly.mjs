// Proper rigid placements of native, handed parts. Never mirror an STL or alter
// firmware signs to make the illustration look symmetric.
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const scale=(a,k)=>a.map(v=>v*k);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const yaw=(p,a)=>[p[0]*Math.cos(a)-p[1]*Math.sin(a),p[0]*Math.sin(a)+p[1]*Math.cos(a),p[2]];
const around=(p,origin,axis,a)=>{const v=sub(p,origin),c=Math.cos(a),s=Math.sin(a);return add(origin,add(add(scale(v,c),scale(cross(axis,v),s)),scale(axis,dot(axis,v)*(1-c))));};
export const rotateVector=(v,axis,angle)=>around(v,[0,0,0],axis,angle);
export function flexFootPoint(point,bend){const a=Math.sign(bend[0])*(point[0]-bend[1]),w=a< -5.5?1:point[2]<bend[3]-5.5?Math.max(0,Math.min(1,(35-a)/40.5)):0;return [point[0]-bend[0]*w*w,point[1],point[2]];}
const quaternion=(axis,angle)=>[...scale(axis,Math.sin(angle/2)),Math.cos(angle/2)];
const quaternionProduct=(a,b)=>[...add(add(scale(b.slice(0,3),a[3]),scale(a.slice(0,3),b[3])),cross(a.slice(0,3),b.slice(0,3))),a[3]*b[3]-dot(a.slice(0,3),b.slice(0,3))];
export const rotateQuaternion=(v,q)=>add(v,scale(cross(q.slice(0,3),add(cross(q.slice(0,3),v),scale(v,q[3]))),2));
function rotationRecord(q,pivot,offset=[0,0,0]){const length=Math.hypot(...q.slice(0,3));return {pivot,offset,rotation:length<1e-10?0:2*Math.atan2(length,q[3]),rotationAxis:length<1e-10?[0,0,1]:scale(q.slice(0,3),1/length)};}

// Move Rest geometry rigidly: the hip case stays fixed, the upper print and
// captured foot horn yaw together, and the foot body/print rotate about the horn.
export function standingLegMotion(rest,standing,progress){
  const t=Math.max(0,Math.min(1,progress));
  return articulatedLegMotion(rest,standing,t,t);
}
export function articulatedLegMotion(rest,standing,hipFraction,footFraction){
  const sweep=Math.atan2(cross(rest.out,standing.out)[2],dot(rest.out,standing.out))*hipFraction;
  const hipQuaternion=quaternion([0,0,1],sweep);
  const bodyQuaternion=quaternionProduct(hipQuaternion,quaternion(rest.axis,standing.bodyTurn*footFraction));
  const hipPoint=p=>add(rest.hip,rotateQuaternion(sub(p,rest.hip),hipQuaternion));
  const foot=hipPoint(rest.foot),offset=sub(foot,rest.foot);
  return {hip:rest.hip,foot,out:rotateQuaternion(rest.out,hipQuaternion),axis:rotateQuaternion(rest.axis,hipQuaternion),shaftAxis:rotateQuaternion(rest.shaftAxis,hipQuaternion),
    hipQuaternion,bodyQuaternion,hipPoint,bodyPoint:p=>add(foot,rotateQuaternion(sub(p,rest.foot),bodyQuaternion)),bodyVector:v=>rotateQuaternion(v,bodyQuaternion),
    hipTransform:rotationRecord(hipQuaternion,rest.hip),bodyTransform:rotationRecord(bodyQuaternion,rest.foot,offset)};
}
export const LEG_PAIRS=[{id:'frontLeft',hip:'L1',foot:'L3'},{id:'frontRight',hip:'R1',foot:'R3'},
  {id:'rearLeft',hip:'L2',foot:'L4'},{id:'rearRight',hip:'R2',foot:'R4'}];

export function fromBench(point,part,record){
  const [lo,hi]=record.bounds;
  const rotatedBounds=[[lo[2],lo[1],-hi[0]],[hi[2],hi[1],-lo[0]]];
  const offset=[0,1].map(k=>(part.bbox[0][k]+part.bbox[1][k]-rotatedBounds[0][k]-rotatedBounds[1][k])/2);
  const v=sub(point,[...offset,-rotatedBounds[0][2]]);
  return [-v[2],v[1],v[0]];
}

export function legPlacement(pair,joints,config,standing=false){
  const d=config.datums,sign=config.parts[pair.hip].lateralSign;
  const lateral=pair.hip.startsWith('L')?1:-1;
  const front=pair.id.startsWith('front');
  const sweep=standing?(front?-1:1)*lateral*Math.PI/4:0;
  const out=yaw([lateral,0,0],sweep),axis=scale(cross([0,0,1],out),sign);
  // The real horn fits the recess beneath the upper bracket, not the foot-axis
  // plane 22.584 mm below it. Keep the measured upper and foot datums distinct.
  const hip=joints[pair.hip].pivot,roof=add(hip,[0,0,1.5]);
  const origin=[d.hipAxisX,d.hipHornRecessRoof,sign*d.hipAxisLateral];
  const vector=v=>add(add(scale(axis,v[0]),[0,0,v[1]]),scale(out,sign*v[2]));
  const point=p=>add(roof,vector(sub(p,origin)));
  // The horn sits in the upper part's negative-X recess. Its output shaft
  // faces INTO that recess; the body extends away from it into the foot part.
  const foot=point([d.footHornRecessRoof+d.illustrativeHornThickness,d.footAxisHeight,sign*d.footAxisLateral]);
  const bodyTurn=standing?sign*Math.PI/2:0,shaftAxis=scale(axis,-1);
  const lower=p=>{const world=point(p);return standing?around(world,foot,axis,sign*Math.PI/2):world;};
  const bodyVector=v=>vector([-v[2],-sign*v[0],sign*v[1]]);
  const footServoPoint=(p,shaft)=>around(add(foot,bodyVector(sub(p,shaft))),foot,axis,bodyTurn);
  return {pair,hip,foot,out,axis,shaftAxis,bodyTurn,sweep,standing,point,vector,lower,
    hipHornPoint:p=>around(p,hip,[0,0,1],sweep),footServoPoint,
    footServoVector:v=>around(bodyVector(v),[0,0,0],axis,bodyTurn),
    footHornPoint:(p,shaft)=>{
      // Fixed to the hip recess, not driven with the moving servo housing.
      // Point the nominal arm into the recess; preserve a proper basis.
      const v=sub(p,shaft),long=scale(out,-1),side=cross(shaftAxis,long);
      return add(foot,add(add(scale(long,lateral*v[0]),scale(side,lateral*v[1])),scale(shaftAxis,v[2])));
    }};
}

// The loose foot servo is the upright version of its eventual mounted pose.
// Its long housing axis points outward; its low cable outlet points inward.
// Rotate the whole case/horn, then slide the horn into the printed hip recess.
export function uprightFootPlacement(pair,joints,config,clearance=18){
  const mount=legPlacement(pair,joints,config),sourcePivot=[...joints[pair.foot].pivot];
  const sign=config.parts[pair.hip].lateralSign,out=mount.out,angle=-Math.atan2(out[0],out[1]);
  const pivot=add(mount.foot,scale(mount.axis,clearance));pivot[2]=joints[pair.hip].pivot[2];
  const point=p=>add(pivot,yaw(sub(p,sourcePivot),angle));
  const unpoint=p=>add(sourcePivot,yaw(sub(p,pivot),-angle));
  const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{const t=clamp(x);return t*t*(3-2*t);};
  function pose(progress){
    const roll=ease(progress/.65),seat=ease((progress-.65)/.35),rotation=sign*Math.PI/2*roll;
    const at=add(mount.foot,scale(mount.axis,clearance*(1-seat)));at[2]=pivot[2]+(mount.foot[2]-pivot[2])*roll;
    return {pivot:at,rotation,rotationAxis:out,roll,seat,offset:sub(at,pivot),
      point:p=>add(at,rotateVector(sub(p,pivot),out,rotation)),
      vector:v=>rotateVector(v,out,rotation)};
  }
  function hornPoint(p,target){
    const v=sub(p,pivot),long=scale(out,-1),side=cross([0,0,1],long),endLong=scale(target.out,-1),endSide=cross(target.shaftAxis,endLong);
    return add(target.foot,add(add(scale(endLong,dot(v,long)),scale(endSide,dot(v,side))),scale(target.shaftAxis,v[2])));
  }
  return {sourcePivot,pivot,mount,sign,out,angle,point,unpoint,vector:v=>yaw(v,angle),unvector:v=>yaw(v,-angle),pose,hornPoint};
}

export function reanchorCable(points,exit,direction){
  const delta=sub(exit,points[0]);
  return points.map((p,i)=>{
    const u=i/(points.length-1),w=1-u*u*(3-2*u),warped=add(p,scale(delta,w));
    if(i<5){const distance=Math.hypot(...sub(p,points[0])),blend=1-i/5;return add(scale(warped,1-blend),scale(add(exit,scale(direction,distance)),blend));}
    return warped;
  });
}

// The seated foot lead joins the hip's INNER routing corridor. Reusing a loose
// bench curve by translation makes it climb beside the horn (the wrong path).
export function routedFootCable(exit,direction,hipPoints,hipCenter,end,axis,feed=0){
  const side=Math.sign(hipCenter[0]),corner=[hipCenter[0]-side*16,hipCenter[1]+Math.sign(hipCenter[1])*22,5];
  let index=0,best=Infinity;
  hipPoints.forEach((p,i)=>{const d=Math.hypot(...sub(p,corner));if(d<best){best=d;index=i;}});
  index=Math.min(index,hipPoints.length-3);
  const raw=hipPoints.slice(index),delta=sub(end,raw.at(-1));
  const tail=raw.map((p,i)=>{const u=i/(raw.length-1),s=u*u*(3-2*u);return add(add(p,[-side*4.5*(1-s),0,0]),scale(delta,s));});
  const tangent=sub(tail[1],tail[0]),length=Math.hypot(...tangent)||1;
  const bezier=(a,b,c,d)=>Array.from({length:33},(_,i)=>{const t=i/32,u=1-t;return a.map((v,k)=>u*u*u*v+3*u*u*t*b[k]+3*u*t*t*c[k]+t*t*t*d[k]);});
  const c1=add(exit,scale(direction,6)),c2=sub(tail[0],scale(tangent,8/length));
  let head=bezier(exit,c1,c2,tail[0]);
  if(feed){
    // Fold up the short casing face to the gap at the top of the C-shaped print. Once
    // the print has passed, the animation relaxes this fold into the seated path.
    const rise=add(add(exit,scale(direction,.9)),[0,0,10.5]);
    const escape=add(rise,scale(direction,3));
    head=[...bezier(exit,add(exit,scale(direction,1.2)),rise,escape).slice(0,-1),...bezier(escape,add(escape,scale(direction,8)),c2,tail[0])];
  }
  return [...head.slice(0,-1),...tail];
}
