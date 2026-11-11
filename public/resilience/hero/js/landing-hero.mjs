// Presentation timing only. The dance uses the existing rigid-body simulator.
import { seededShowcaseRandom } from './robot-showcase.mjs?v=20261104-two-eyes';
const smooth = x => { const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t); };
const settle = (elapsed,[start,duration]) => 1-smooth((elapsed-start)/duration);
const add=(...vectors)=>vectors.reduce((a,b)=>a.map((v,k)=>v+b[k]),[0,0,0]);
const scale=(v,s)=>v.map(x=>x*s);

// [start, duration] in ms, ordered like the build guide. One deliberate
// exception: the PCB is seated before the legs arrive, so it never passes
// through their leads (the guide mounts legs, then spacers and PCB).
export const HERO_SEQUENCE = {
  carrierHeaders:[300,700],   // Steps 2–5: headers, sockets and jumpers on the carrier.
  converterPins:[900,500],    // Steps 6–8: pins into the converter.
  converterTape:[1400,300],   // Step 10: tape under the converter.
  converterSeat:[1700,600],   // Steps 11–13: seat the converter on the carrier.
  hubPins:[1500,500],         // Steps 14–16: double spacers, solder the hub headers.
  undersideWires:[2000,500],  // Steps 17–18: power and signal routes.
  hubSeat:[2500,500],         // Step 19: seat the servo hub.
  s3Pins:[2600,400],          // Steps 20–21: S3 headers.
  s3Seat:[3000,500],          // Step 22: seat the S3.
  spacers:[2900,600],         // Step 34: spacers on the frame.
  pcb:[3500,900],             // Step 34: PCB onto the spacers.
  servosIntoCasts:[4000,900], // Steps 32–33: servos into the printed legs.
  legs:[5000,1300],           // Step 34: legs into the frame.
  servoLeads:[7000,600],      // Step 30: servo leads onto the hub.
  battery:[6800,900],         // Step 34: battery from below.
  bottomCover:[7600,800],     // Step 34: bottom cover.
  headShell:[8300,1000],      // Step 35: head shell.
  oled:[9300,700],            // Step 35: OLED into the head.
  switch:[10000,500],          // Step 35: switch through the rear wall.
  lidDrop:[10400,300],        // Step 35: lid behind the head...
  lidSlide:[10700,300],       // ...slides from the rear to the front.
};
export const HERO_ASSEMBLY_MS = 11000;
// The sequence above is authored over 11 s and played in 4.5 s, the same pace
// as the prompted reassembly.
export const HERO_BUILD_MS = 4500;
export function heroTimeline(clock, end) {
  const phase=clock>=0?clock%(2*end):((clock%(2*end))+2*end)%(2*end);
  return {elapsed:phase<=end?phase:2*end-phase,direction:phase<end?1:-1};
}

export function danceFirstSeed(data, seed) {
  if (!data.presets.includes('dance')) return seed;
  while (data.presets[Math.floor(seededShowcaseRandom(seed)()*data.presets.length)] !== 'dance') seed=(seed+0x9e3779b9)>>>0;
  return seed;
}

// Which instruction subassembly an electronics part belongs to, and its role.
const MODULE_PINS=[
  ['converter',/^(pins|offcut|spacer|top_solder|converter_hole_fill)\./],
  ['hub',/^(hub\.male_pin|hub\.(Original|Donor)Spacer|HubHeaderSolder_)/],
  ['s3',/^s3\.(male_pin|top_solder|male_spacer)/],
];
export function electronicsRole(part) {
  const id=part.id||'',group=part.group||'';
  for (const [assembly,pattern] of MODULE_PINS) if (pattern.test(id)) return {assembly,role:'pins'};
  if (id==='tape'||group==='tape') return {assembly:'converter',role:'tape'};
  if (/^underside\.wire/.test(id)) return {assembly:'carrier',role:'wires'};
  if (/^(auxiliary\.|aux\.solder|jumper\.|hub\.socket_|SocketBottomSolder_|s3\.(socket_|bottom_solder)|carrier_hole_fill\.|bottom_solder\.)/.test(id)) return {assembly:'carrier',role:'headers'};
  if (['converter','hub','s3'].includes(group)) return {assembly:group,role:'module'};
  return {assembly:'carrier',role:'base'};
}
const MODULES={
  converter:{pins:'converterPins',tape:'converterTape',seat:'converterSeat',lift:42},
  hub:{pins:'hubPins',seat:'hubSeat',lift:52},
  s3:{pins:'s3Pins',seat:'s3Seat',lift:62},
};
const centre = bounds => bounds?[0,1,2].map(k=>(bounds[0][k]+bounds[1][k])/2):[0,0,0];

// Variant parts take the explode/assemble motion of the part they replace.
const SHELL_KINDS=['internal-frame','bottom-cover','head-cover','head-lid'];
export function heroProxy(part){
  const kind=part.kind;
  if (!kind.startsWith('variant-')&&!kind.startsWith('legs-')) return part;
  if (SHELL_KINDS.includes(kind.slice(8))) return {...part,kind:kind.slice(8)};
  if (kind==='variant-header2') return {...part,kind:'electronics',id:part.sourceId,heroRole:null};
  if (kind.startsWith('legs-')&&SHELL_KINDS.includes(kind.slice(5))) return {...part,kind:kind.slice(5)};
  if (kind==='legs-leg') return {...part,kind:part.sourceKind,joint:part.sourceJoint,sourceKind:part.sourceServoKind};
  if (kind==='legs-ribbon'||kind==='legs-shift'||kind==='legs-new-ribbon') return {...part,kind:part.batteryLead?'frame-battery-wire':'frame-harness',joint:part.sourceJoint??part.joint};
  if (kind==='legs-plug') return {...part,kind:'plug',joint:part.sourceJoint};
  if (kind==='variant-ribbon') return {...part,kind:'frame-harness'};
  // Battery leads of both designs explode with the battery, never with the head.
  if (kind==='variant-battery-wire'||kind==='variant-shift'||kind==='legs-battery-wire') return {...part,kind:'frame-battery-wire'};
  return {...part,kind:kind==='variant-oled1-wire'?'head-wire':'head-peripheral',carrier:false};
}
// Module-level directions, so a subassembly never splits by solid.
export function prepareHeroParts(parts) {
  const boxes=new Map(),grow=(key,b)=>{const box=boxes.get(key)??[[Infinity,Infinity,Infinity],[-Infinity,-Infinity,-Infinity]];for(let k=0;k<3;k++){box[0][k]=Math.min(box[0][k],b[0][k]);box[1][k]=Math.max(box[1][k],b[1][k]);}boxes.set(key,box);};
  for (const p of parts) if (p.kind==='electronics'&&p.bounds) {
    const {assembly,role}=electronicsRole(p);
    grow(role==='base'||role==='headers'||role==='wires'?p.group:assembly,p.bounds);
  }
  const axes=Object.fromEntries(parts.filter(p=>p.kind==='mounted-lower'&&p.axis).map(p=>[p.joint,p.axis]));
  for (const p of parts) {
    p.heroProxy=heroProxy(p);
    if (p.kind==='electronics') {const {assembly,role}=electronicsRole(p);p.heroRole=role;p.heroAssembly=assembly;p.heroCentre=centre(boxes.get(role==='base'||role==='headers'||role==='wires'?p.group:assembly));}
    if (p.joint&&axes[p.joint]) p.heroAxis=axes[p.joint];
    if (p.heroProxy!==p&&axes[p.heroProxy.joint]) p.heroProxy.heroAxis=axes[p.heroProxy.joint];
  }
  return parts;
}

const PCB_LIFT=72;
function electronicsOffset(part,elapsed) {
  const {assembly,role}=part.heroRole?{assembly:part.heroAssembly,role:part.heroRole}:electronicsRole(part);
  const [x,y]=part.heroCentre??centre(part.bounds),S=HERO_SEQUENCE;
  let local=[0,0,0];
  if (MODULES[assembly]) {
    const m=MODULES[assembly],seat=settle(elapsed,S[m.seat]);
    local=[x*.6*seat,y*.6*seat,m.lift*seat];
    if (role==='pins') local[2]-=14*settle(elapsed,S[m.pins]);
    if (role==='tape') local[2]-=26*settle(elapsed,S[m.tape]);
  } else if (role==='headers') local=[0,0,18*settle(elapsed,S.carrierHeaders)];
  else if (role==='wires') {const open=settle(elapsed,S.undersideWires);local=[x*.3*open,y*.3*open,-22*open];}
  return add(local,[0,0,PCB_LIFT*settle(elapsed,S.pcb)]);
}

function legOffset(joint) {
  const n=Number(joint.slice(1));
  return [joint.startsWith('L')?64:-64,n%2===1?-32:32,n>=3?-16:12];
}
const stagger=joint=>{const n=Number(joint.slice(1));return (joint.startsWith('R')?120:0)+(n%2===0?200:0)+(n>=3?150:0);};
const delayed=([start,duration],ms)=>[start+ms,duration];
// A servo slides out of its printed cast; the cast then carries it to the frame.
function servoOffset(part,elapsed) {
  const foot=Number(part.joint.slice(1))>=3;
  const away=foot?scale(part.heroAxis??[0,0,-1],-30):[0,0,-26];
  return scale(away,settle(elapsed,delayed(HERO_SEQUENCE.servosIntoCasts,stagger(part.joint))));
}
const legPose=(joint,elapsed)=>scale(legOffset(joint),settle(elapsed,delayed(HERO_SEQUENCE.legs,stagger(joint))));

export function heroPartPose(part, elapsed) {
  const id=part.id||'',kind=part.kind,S=HERO_SEQUENCE;
  const head=[0,0,200*settle(elapsed,S.headShell)];
  if (kind.startsWith('mounted-') && part.joint) {
    const leg=legPose(part.joint,elapsed);
    if (kind==='mounted-servo'&&part.sourceKind==='servo') return {offset:add(leg,servoOffset(part,elapsed)),visible:true};
    if (kind==='mounted-upper') return {offset:add(leg,[0,0,14*settle(elapsed,delayed(S.servosIntoCasts,stagger(part.joint)))]),visible:true};
    return {offset:leg,visible:true};
  }
  // Factory servo leads stay on their servo, then plug into the hub last.
  if (kind==='frame-harness'||kind==='plug') {
    const joint=part.joint||'L1',servo={joint,heroAxis:part.heroAxis};
    return {offset:add(legPose(joint,elapsed),servoOffset(servo,elapsed),[0,0,18*settle(elapsed,S.servoLeads)]),visible:true};
  }
  if (kind==='electronics') return {offset:electronicsOffset(part,elapsed),visible:true};
  // The battery, its soldered leads and their connector move as one piece.
  if (kind.startsWith('frame-battery')) return {offset:[0,0,-52*settle(elapsed,S.battery)],visible:true};
  if (kind.startsWith('head-')||kind==='face') {
    if (kind==='head-lid') return {offset:[0,45*settle(elapsed,S.lidSlide),280*settle(elapsed,S.lidDrop)],visible:true};
    // The OLED, its header and jumper leads drop in through the open roof.
    if (/\.(oled|i2c)\./.test(id)||kind==='face') return {offset:add(head,[0,0,70*settle(elapsed,S.oled)]),visible:true};
    if (id.endsWith('.switch.body')) return {offset:add(head,[0,34*settle(elapsed,S.switch),0]),visible:true};
    // Unsoldered switch leads stay with the shell while the switch backs out.
    return {offset:head,visible:true};
  }
  if (kind==='pcb-spacer') return {offset:[0,0,32*settle(elapsed,S.spacers)],visible:true};
  if (kind==='bottom-cover') return {offset:[0,0,-95*settle(elapsed,S.bottomCover)],visible:true};
  return {offset:[0,0,0],visible:true};
}

export function heroCamera(elapsed, aspect, widen=0, grow=0, wide=0) {
  const close=smooth((elapsed-3000)/7500);
  // The lid lands last. Keep room for it while the camera straightens during
  // reassembly, then close the remaining distance as it drops into place.
  const lidRoom=(320+22*widen+34*grow)*smooth((elapsed-3000)/3000)*(1-smooth((elapsed-10400)/600))*wide;
  const radius=Math.max(255-120*close+20*wide*(1-close)+22*widen+34*grow,lidRoom);
  const sweep=wide*(1-close),yaw=-Math.PI*.68+.16*close;
  return {target:[Math.sin(yaw)*75*sweep,-26*grow-Math.cos(yaw)*75*sweep,150-90*close-35*sweep],yaw,pitch:.42+.14*close,
    roll:.4*sweep,
    dist:radius/Math.tan(13*Math.PI/180)*Math.max(1,1/Math.max(.3,aspect))*1.12*(1-.31*sweep)};
}

// Design-change prompt: explode, highlight the diff, apply the real CAD
// variant, then reassemble. τ is milliseconds since the prompt appeared.
export const VARIANT_MS=14100;
// After the six-leg reassembly the robot lifts each new leg in turn and looks at it.
export const LEGS_MS=VARIANT_MS+2200;
export function inspectScript(t) {
  const left=span(t,12500,500)*(1-span(t,13900,500)),right=span(t,14000,500)*(1-span(t,15400,500));
  return {raise:{L:left,R:right},look:left-right};
}
export const PROMPT_COLOUR=[.97,.58,.1],LEGS_COLOUR=[.12,.56,.96];
const span=(t,start,duration)=>smooth((t-start)/duration);
export function variantScript(t) {
  return {
    typed:Math.max(0,Math.min(1,t/1500)),
    // The robot may finish its dance turned; it turns back while the prompt types.
    turn:1-span(t,100,1500),
    style:span(t,1200,600)*(1-span(t,7600,700)),
    assembly:t<4600?HERO_ASSEMBLY_MS*(1-span(t,1800,2000)):HERO_ASSEMBLY_MS*span(t,7600,4500),
    // The camera widens before parts fly apart and closes again as they land.
    camera:t<4600?HERO_ASSEMBLY_MS*(1-span(t,1000,1400)):HERO_ASSEMBLY_MS*span(t,7600,4500),
    highlight:span(t,3800,800)*(1-span(t,8000,1500)),
    active:t>=4600,
    widen:span(t,4600,1800),
    added:span(t,5400,1200),
    faces:t>=12300,
    // Two blinks once the new eyes are on.
    blink:t>=12650&&t<12800||t>=13050&&t<13200,
  };
}
// Total forward timeline: assembly, base physics (dance then sit), prompt.
export function heroPhase(elapsed,physicsMs) {
  // The base build is drawn in Line style and turns to colour as it completes.
  if (elapsed<HERO_BUILD_MS) return {kind:'assembly',assembly:elapsed*HERO_ASSEMBLY_MS/HERO_BUILD_MS,style:1-span(elapsed,HERO_BUILD_MS-900,800)};
  if (elapsed<HERO_BUILD_MS+physicsMs) return {kind:'physics',time:elapsed-HERO_BUILD_MS};
  const t=elapsed-HERO_BUILD_MS-physicsMs;
  if (t<VARIANT_MS) {const variant=variantScript(t);return {kind:'variant',assembly:variant.assembly,variant};}
  // The second prompt builds on the finished two-eye design.
  const legs=variantScript(t-VARIANT_MS),done=variantScript(VARIANT_MS);
  const inspect=inspectScript(t-VARIANT_MS);
  const variant={...done,highlight:0,turn:0,typed:1,style:legs.style,faces:legs.faces,blink:false,look:inspect.look};
  return {kind:'legs',assembly:legs.assembly,variant,legs:{...legs,...inspect}};
}

const SHELL=['internal-frame','bottom-cover','head-cover','head-lid'];
const OLED_HEADER=/^(auxiliary\.pin\.M1[2-5]|aux\.solder\.M1[2-5]|auxiliary\.spacer\.M)$/;
const S3_BUS=/^s3\.(male_pin|top_solder|socket_contact|socket_tail|bottom_solder)\.[DE]17$/;
// Parts the prompt changes or depends on: shells to widen, the display and its
// leads, the display header and the S3 SDA/SCL pins (D17/E17) on the shared bus.
export function inDesignDiff(part) {
  const id=part.id||'',kind=part.kind;
  // Re-routed leads keep their parts; only the changed or added parts glow.
  if (['variant-ribbon','variant-battery-wire','variant-shift'].includes(kind)) return false;
  return SHELL.includes(kind)||kind.startsWith('variant-')||kind==='face'||
    (kind==='head-peripheral'||kind==='head-wire')&&part.connection==='oled'||
    kind==='electronics'&&(OLED_HEADER.test(id)||S3_BUS.test(id));
}
const isOled1=part=>part.kind==='face'||part.kind==='head-peripheral'&&!part.carrier&&part.connection==='oled';

// Extra pose for the prompt phase on top of heroPartPose. v from variantScript;
// d={plane,half,eye1}: the variant's cut plane, half-widening and OLED shift.
export function heroVariantPose(part,v,d) {
  const kind=part.kind,out={};
  if (inDesignDiff(part)&&v.highlight>0) {out.tint=[...PROMPT_COLOUR,.85*v.highlight];out.edge=[...PROMPT_COLOUR,v.highlight];}
  const shift=d.half*v.widen;
  if (SHELL.includes(kind)) out.visible=!v.active;
  else if (kind.startsWith('variant-')&&SHELL.includes(kind.slice(8))) {out.visible=v.active;out.bend=[d.plane,d.half-shift,0,-1.5e6];}
  else if (kind==='variant-oled2'||kind==='variant-header2') {out.visible=v.active&&v.added>0&&(!part.faceName||v.faces&&part.faceName===eyeFace(v));out.arrive=1-v.added;}
  else if (kind==='variant-oled1-wire') out.visible=v.active;
  else if (kind==='head-wire'&&part.connection==='oled') out.visible=!v.active;
  if (isOled1(part)&&v.active) out.offset=[d.eye1*v.widen,0,0];
  if (kind==='face') out.visible=v.faces&&part.faceName===eyeFace(v);
  if (kind.startsWith('mounted-')&&part.joint&&v.active) out.offset=[(part.joint.startsWith('L')?1:-1)*shift,0,0];
  // Leads beyond the PCB edge follow the widened frame channels.
  // Lead clones are skinned to their servo (or a side helper), so leads stay whole.
  if (['frame-harness','frame-battery-wire'].includes(kind)) out.visible=!v.active;
  if (kind==='variant-ribbon'||kind==='variant-battery-wire') out.visible=v.active;
  if (kind==='variant-shift') {out.visible=v.active;out.offset=[part.side*shift,0,0];}  // No geometry; its transform must still upload.
  return out;
}

// Which eye raster the displays show: open, closed, or glancing to one side
// (look > 0 is robot-left).
export function eyeFace(v) {
  if (v.blink) return 'eye-closed';
  return (v.look??0)>.5?'eye-left':(v.look??0)<-.5?'eye-right':'eye';
}
// A closed eye: a thick downward arc, as [x, y, width] runs.
export function closedEyeFace() {
  const runs=[];
  for (let y=0;y<64;y++) {
    let start=null;
    for (let x=0;x<=128;x++) {
      const r=Math.hypot(x+.5-64,(y+.5-14)*1.1),on=x<128&&y>=26&&Math.abs(r-28)<=3;
      if (on&&start===null) start=x;
      if (!on&&start!==null) {runs.push([start,y,x-start]);start=null;}
    }
  }
  return runs;
}
// One eye per display: a large white pupil with two dark catch-lights, as
// [x, y, width] runs on the 128 × 64 OLED raster used by the stock faces.
// dx shifts the whole eye along the raster for a sideways glance.
export function pupilFace(dx=0) {
  const runs=[],inside=(x,y,cx,cy,r)=>(x-cx)**2+((y-cy)*1.1)**2<=r*r;
  for (let y=0;y<64;y++) {
    let start=null;
    for (let x=0;x<=128;x++) {
      const u=x+.5-dx,on=x<128&&inside(u,y+.5,64,32,29)&&!inside(u,y+.5,53,20,8)&&!inside(u,y+.5,75,43,4);
      if (on&&start===null) start=x;
      if (!on&&start!==null) {runs.push([start,y,x-start]);start=null;}
    }
  }
  return runs;
}

// Second prompt, on top of two eyes: "Add two more legs". d={body,head,length,
// pins}: guide-Y cut planes, added length and servo hub CH8–11 pin ids.
const LEGS_NEW=['legs-leg','legs-new-ribbon','legs-plug'];
const FRONT=joint=>/^[LR][13]$/.test(joint||'');
export function inLegsDiff(part,d) {
  const kind=part.kind;
  return kind.startsWith('legs-')&&SHELL.includes(kind.slice(5))||kind.startsWith('variant-')&&SHELL.includes(kind.slice(8))||
    LEGS_NEW.includes(kind)||['variant-battery-wire','legs-battery-wire'].includes(kind)||kind==='electronics'&&d.pins.includes(part.id);
}
export function heroLegsPose(part,l,d) {
  const kind=part.kind,out={},grow=d.length*l.widen;
  if (inLegsDiff(part,d)&&l.highlight>0) {out.tint=[...LEGS_COLOUR,.85*l.highlight];out.edge=[...LEGS_COLOUR,l.highlight];}
  if (kind.startsWith('variant-')&&SHELL.includes(kind.slice(8))) out.visible=!l.active;
  else if (kind.startsWith('legs-')&&SHELL.includes(kind.slice(5))) {
    const plane=['head-cover','head-lid'].includes(kind.slice(5))?d.head:d.body;
    out.visible=l.active;out.bend=[1000,d.length-grow,plane+1000,-2e6-1];
  }
  else if (['variant-ribbon','variant-battery-wire'].includes(kind)) out.visible=!l.active;
  else if (['legs-ribbon','legs-battery-wire'].includes(kind)) out.visible=l.active;
  else if (kind==='legs-shift') {out.visible=l.active;out.offset=[0,-grow,0];}
  else if (LEGS_NEW.includes(kind)) {out.visible=l.active&&l.added>0;out.arrive=1-l.added;}
  // Everything ahead of the cut moves forward: front legs, displays and faces.
  const ahead=kind.startsWith('mounted-')&&FRONT(part.joint)||kind==='face'||
    (kind==='head-peripheral'||kind==='variant-oled2')&&part.connection==='oled'&&!part.carrier||kind==='variant-oled2'&&part.faceName;
  if (ahead&&l.active) out.offset=[0,-grow,0];
  return out;
}
