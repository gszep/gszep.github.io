export type Vec3 = [number, number, number];
export type HorseSettings = { speed: number; gravity: number; goofy: number };
export type HorseState = {
  time: number; phase: number; height: number; velocity: number;
  pitch: number; spin: number; contacts: number;
};
export type HorseBlock = { id: number; center: Vec3; size: Vec3; angle: number };
export const HORSE_STEP = 1/120;
const TAU = Math.PI*2;
const clamp = (x:number,a:number,b:number) => Math.max(a,Math.min(b,x));

export function createHorse(): HorseState {
  return {time:0,phase:0,height:1.65,velocity:0,pitch:0,spin:0,contacts:0};
}

// A stylized transverse four-beat order: hind pair, then front pair, with a
// flight window. These are motor targets, not a measured equine gait.
const legs = [
  {x:-1.03,z:.42,offset:0,bend:-1}, {x:-1.03,z:-.42,offset:.12,bend:-1},
  {x:1.02,z:.42,offset:.40,bend:1}, {x:1.02,z:-.42,offset:.53,bend:1},
];

function legTarget(phase:number, index:number, goofy:number): Vec3 {
  const leg=legs[index];
  const cycle=((phase/TAU-leg.offset)%1+1)%1;
  const stance=.25;
  const swing=clamp((cycle-stance)/(1-stance),0,1);
  const stride=.48+goofy*.22;
  const x=cycle<stance ? stride*(1-2*cycle/stance) : stride*(-1+2*swing);
  const lift=cycle<stance ? 0 : Math.sin(Math.PI*swing)*(.58+goofy*.27);
  return [leg.x+x,-1.65+lift,leg.z];
}

function pitchPoint(p:Vec3, angle:number): Vec3 {
  return [p[0]*Math.cos(angle)-p[1]*Math.sin(angle),p[0]*Math.sin(angle)+p[1]*Math.cos(angle),p[2]];
}

/** Small, motor-driven toy dynamics: semi-implicit fixed steps, gravity,
 * spring/damper hoof contacts and a pitch inertia. Inspired by APS's separation
 * of actuator commands, integration and visual geometry; not a MuJoCo port. */
export function stepHorse(state:HorseState, settings:HorseSettings, dt=HORSE_STEP) {
  const oldPhase=state.phase;
  state.phase=(state.phase+dt*TAU*1.25*settings.speed)%TAU;
  state.time+=dt;
  let force=0, torque=0, contacts=0;
  for (let i=0;i<4;i++) {
    const old=pitchPoint(legTarget(oldPhase,i,settings.goofy),state.pitch);
    const foot=pitchPoint(legTarget(state.phase,i,settings.goofy),state.pitch);
    const ground=state.height+foot[1]-.125;
    const velocity=state.velocity+.25*(foot[1]-old[1])/dt+state.spin*foot[0];
    if (ground<0) {
      const reaction=clamp(-ground*600-velocity*20,0,120);
      force+=reaction; torque+=foot[0]*reaction;
      if (reaction>1) contacts++;
    }
  }
  const mass=8, inertia=6;
  state.velocity+=(force/mass-settings.gravity)*dt;
  state.height+=state.velocity*dt;
  // A modest attitude controller stands in for the horse's balance reflex.
  const targetPitch=Math.sin(state.phase-.6)*settings.goofy*.045;
  state.spin+=(torque-300*(state.pitch-targetPitch)-55*state.spin)/inertia*dt;
  state.pitch+=state.spin*dt;
  if (Math.abs(state.pitch)>.45) { state.pitch=clamp(state.pitch,-.45,.45); state.spin*=.3; }
  // Torso floor guard for extreme control settings and deliberate silly hops.
  if (state.height<.72) { state.height=.72; state.velocity=Math.max(0,-state.velocity*.12); }
  // Bound penetration of the compliant contacts (a positional solver guard,
  // not a prescribed height animation). This also handles a motor moving fast
  // enough to cross the floor between fixed steps.
  let penetration=0;
  for(let i=0;i<4;i++) {
    const foot=pitchPoint(legTarget(state.phase,i,settings.goofy),state.pitch);
    penetration=Math.max(penetration,.125-state.height-foot[1]);
  }
  if(penetration>.065) {state.height+=penetration-.065;state.velocity=Math.max(state.velocity,-.8);}
  state.contacts=contacts;
}

export function hopHorse(state:HorseState) { state.velocity=clamp(state.velocity+2.7,0,4.3); }

export function horseBlocks(state:HorseState, settings:HorseSettings): HorseBlock[] {
  const blocks:HorseBlock[]=[];
  const local=(p:Vec3):Vec3=>{
    const q=pitchPoint(p,state.pitch); return [q[0],q[1]+state.height,q[2]];
  };
  const box=(id:number,center:Vec3,size:Vec3,angle=0)=>blocks.push({id,center:local(center),size,angle:angle+state.pitch});
  const beam=(id:number,a:Vec3,b:Vec3,width:number,depth:number)=>{
    const len=Math.hypot(b[0]-a[0],b[1]-a[1]);
    box(id,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],[len,width,depth],Math.atan2(b[1]-a[1],b[0]-a[0]));
  };
  box(0,[0,0,0],[2.85,.82,1.0]);
  const nod=Math.sin(state.phase-1)*(.025+settings.goofy*.11);
  const neckBase:Vec3=[1.0,.3,0], poll:Vec3=[1.55+nod,1.76,0];
  beam(1,neckBase,poll,.49,.62);
  beam(2,poll,[2.28+nod,1.36+nod,0],.59,.65);
  box(3,[2.36+nod,1.32+nod,0],[.46,.40,.68],-.12+nod);
  box(4,[1.40+nod,2.06,.24],[.17,.43,.18],-.12+nod);
  box(5,[1.40+nod,2.06,-.24],[.17,.43,.18],-.12+nod);
  for (let i=0;i<4;i++) {
    const leg=legs[i], hip:Vec3=[leg.x,-.31,leg.z];
    const target=legTarget(state.phase,i,settings.goofy);
    const dx=target[0]-hip[0], dy=target[1]-hip[1];
    const length=Math.max(.01,Math.hypot(dx,dy));
    const reach=Math.min(length,1.58);
    const foot:Vec3=[hip[0]+dx/length*reach,hip[1]+dy/length*reach,leg.z];
    const bend=Math.sqrt(Math.max(0,.80*.80-reach*reach/4))*leg.bend;
    const knee:Vec3=[(hip[0]+foot[0])/2-dy/length*bend,(hip[1]+foot[1])/2+dx/length*bend,leg.z];
    beam(10+i*3,hip,knee,.22,.25);
    beam(11+i*3,knee,foot,.19,.23);
    box(12+i*3,[foot[0]+.04,foot[1]-.035,leg.z],[.34,.18,.30],.08*Math.sin(state.phase+i));
  }
  const swish=Math.sin(state.phase+.4)*(.10+settings.goofy*.18);
  beam(30,[-1.40,.22,0],[-1.78,.02+swish,0],.11,.13);
  beam(31,[-1.78,.02+swish,0],[-1.89,-.49+swish,.06],.10,.12);
  return blocks;
}
