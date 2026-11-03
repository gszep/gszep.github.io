export type Vec3 = [number, number, number];
export const HORSE_MODES = ['flail', 'naruto', 'paddle'] as const;
export type HorseMode = typeof HORSE_MODES[number];
export type HorseSettings = { speed: number; gravity: number; goofy: number; mode: HorseMode };
export type HorseState = {
  time: number; phase: number; height: number; velocity: number;
  springForce: number;
};
export type HorseBlock = { id: number; center: Vec3; size: Vec3; angle: number };
export const HORSE_STEP = 1/120;
const TAU = Math.PI*2;
const clamp = (x:number,a:number,b:number) => Math.max(a,Math.min(b,x));

export function createHorse(): HorseState {
  return {time:0,phase:0,height:1.65,velocity:0,springForce:0};
}

// Legs are visual appendages only. They never enter the body force calculation.
const legs = [
  {x:-1.03,z:.42}, {x:-1.03,z:-.42},
  {x:1.02,z:.42}, {x:1.02,z:-.42},
];

function pitchPoint(p:Vec3, angle:number): Vec3 {
  return [p[0]*Math.cos(angle)-p[1]*Math.sin(angle),p[0]*Math.sin(angle)+p[1]*Math.cos(angle),p[2]];
}

/** One invisible, powered spring under the main body. Gravity and this spring
 * are the only continuous forces. Its oscillating rest length keeps the bounce
 * going; the attached spring pushes when compressed and pulls when stretched.
 * Movement modes affect presentation only, not support, collisions or physics. */
export function stepHorse(state:HorseState, settings:HorseSettings, dt=HORSE_STEP) {
  state.phase=(state.phase+dt*TAU*1.25*settings.speed)%TAU;
  state.time+=dt;
  const mass=8, stiffness=260, damping=18;
  const restHeight=1.98+Math.sin(state.phase)*(.16+settings.goofy*.20);
  const compression=restHeight-state.height;
  state.springForce=clamp(stiffness*compression-damping*state.velocity,-400,400);
  state.velocity+=(state.springForce/mass-settings.gravity)*dt;
  state.height+=state.velocity*dt;
}

export function hopHorse(state:HorseState) { state.velocity=clamp(state.velocity+2.7,0,4.3); }

export function horseBlocks(state:HorseState, settings:HorseSettings): HorseBlock[] {
  const blocks:HorseBlock[]=[];
  const {phase}=state,{mode,goofy}=settings;
  // Lean and wobble belong to the performance, not the spring simulation.
  const pitch=mode==='naruto' ? -.18-goofy*.12+Math.sin(phase*2)*.025
    : Math.sin(phase)*(mode==='paddle' ? .025 : .025+goofy*.055);
  const local=(p:Vec3):Vec3=>{
    const q=pitchPoint(p,pitch); return [q[0],q[1]+state.height,q[2]];
  };
  const box=(id:number,center:Vec3,size:Vec3,angle=0)=>blocks.push({id,center:local(center),size,angle:angle+pitch});
  const beam=(id:number,a:Vec3,b:Vec3,width:number,depth:number)=>{
    const len=Math.hypot(b[0]-a[0],b[1]-a[1]);
    box(id,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],[len,width,depth],Math.atan2(b[1]-a[1],b[0]-a[0]));
  };
  box(0,[0,0,0],[2.85,.82,1.0]);
  const nod=Math.sin(state.phase-1)*(.025+settings.goofy*.11);
  const lean=mode==='naruto'?1:0;
  const neckBase:Vec3=[1.0,.3,0], poll:Vec3=[1.55+nod+lean*.40,1.76-lean*.38,0];
  beam(1,neckBase,poll,.49,.62);
  beam(2,poll,[2.28+nod+lean*.5,1.36+nod-lean*.38,0],.59,.65);
  box(3,[2.36+nod+lean*.5,1.32+nod-lean*.38,0],[.46,.40,.68],-.12+nod);
  box(4,[1.40+nod+lean*.4,2.06-lean*.38,.24],[.17,.43,.18],-.12+nod);
  box(5,[1.40+nod+lean*.4,2.06-lean*.38,-.24],[.17,.43,.18],-.12+nod);
  for (let i=0;i<4;i++) {
    const leg=legs[i], hip:Vec3=[leg.x,-.31,leg.z];
    let upper:number,lower:number;
    if(mode==='paddle') {
      upper=phase+i*Math.PI/2-Math.PI/2;
      lower=upper+Math.sin(phase+i)*.08;
    } else if(mode==='naruto' && i>=2) {
      upper=-Math.PI+.32+Math.sin(phase*3+i)*.07;
      lower=upper+.08+Math.sin(phase*3+i)*.10;
    } else if(mode==='naruto') {
      upper=-Math.PI/2+Math.sin(phase*2+i*Math.PI)*(.8+goofy*.3);
      lower=upper+.6+Math.sin(phase*2+i*Math.PI-1)*.65;
    } else {
      upper=-Math.PI/2+Math.sin(phase+i*1.7)*(.7+goofy*.8);
      lower=upper+Math.sin(phase*2+i*.9)*(.6+goofy*.8);
    }
    const knee:Vec3=[hip[0]+Math.cos(upper)*.70,hip[1]+Math.sin(upper)*.70,leg.z];
    const foot:Vec3=[knee[0]+Math.cos(lower)*.67,knee[1]+Math.sin(lower)*.67,leg.z];
    beam(10+i*3,hip,knee,.22,.25);
    beam(11+i*3,knee,foot,.19,.23);
    box(12+i*3,foot,mode==='paddle'?[.53,.16,.42]:[.34,.18,.30],lower+Math.PI/2);
  }
  const swish=Math.sin(state.phase+.4)*(.10+settings.goofy*.18);
  beam(30,[-1.40,.22,0],[-1.78,.02+swish,0],.11,.13);
  beam(31,[-1.78,.02+swish,0],[-1.89,-.49+swish,.06],.10,.12);
  return blocks;
}
