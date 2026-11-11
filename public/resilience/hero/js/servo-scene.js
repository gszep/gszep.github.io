import { createRenderer } from './renderer.js?v=20261104-inspect';
import { fetchAsset } from './asset-cache.mjs?v=20261103-cache';
import { heroPartPose, prepareHeroParts, heroVariantPose, heroLegsPose, pupilFace, closedEyeFace } from './landing-hero.mjs?v=20261106-battery-lead';
import { isPhysicalColour } from './theme.js?v=20261011-peripherals';
import { sub, cross, normalize, perspective, lookAt, multiply, project } from './servo-scene-math.js?v=20261018-walkthrough';
import { sceneAnchors, CONDUCTORS } from './servo-scene-anchors.js?v=20261027-layout';
import { cableSweep, cablePoints, posePair } from './servo-cable-mesh.mjs?v=20261030-servo-fit';
import { layoutPoint, peripheralPose, batteryPlugPose, resamplePath, batteryLeadPoints } from './servo-layout.mjs?v=20261028-load';
import { angleDirection, angleMarks, footHornDirection, HORN_RAY_LENGTH_MM, STANDING_REFERENCE } from './servo-angle-guide.mjs?v=20261030-static-guides';
import { framePoint, frameMountOffset } from './frame-assembly.mjs?v=20261030-servo-fit';
import { rotateVector, standingLegMotion, articulatedLegMotion, flexFootPoint } from './leg-assembly.mjs?v=20261102-finale';
import { preserveLineColour, PRINTED_PLASTIC_RGB } from './servo-stage-style.mjs?v=20261102-line-wires';
import { frameRibbonRoute } from './frame-cable-routing.mjs?v=20261103-slit-routing';
import { frameSlitSkin } from './frame-slit-skin.mjs?v=20261103-slit-routing';
import { remountBatteryPoint,batteryInsertionPose,insertedBatteryPoint,frameBatteryLead } from './battery-assembly.mjs?v=20261103-battery';
import { lidSlideOffset } from './head-assembly.mjs?v=20261102-head-connect';
import { headPeripheralPoses, headConnectionKind, headConnectionRoute } from './head-connections.mjs?v=20261102-head-connect';
import { appendShowcaseRig,showcaseXml } from './showcase-rig.mjs?v=20261103-rest-contact';
import { createShowcasePhysics } from './showcase-physics.mjs?v=20261104-two-eyes';

const IDS = ['R1','R2','L1','L2','R4','R3','L3','L4'];
const FOV=26*Math.PI/180;
// Pair membership follows the canonical firmware joint_map.
// Robot frame: front -Y; camera from +Y puts front up and robot-left +X left.
const LEG_PAIRS=[{id:'frontLeft',hip:'L1',foot:'L3',point:[75,-87,5]},
  {id:'frontRight',hip:'R1',foot:'R3',point:[-75,-87,5]},
  {id:'rearLeft',hip:'L2',foot:'L4',point:[75,87,5]},
  {id:'rearRight',hip:'R2',foot:'R4',point:[-75,87,5]}];
const ASSUMPTIONS = {
  layout: 'Robot frame: front/OLED at screen top, USB/back at bottom, own L/R aligned with viewport L/R. Front hips L1/R1; rear hips L2/R2. Step 34 uses the revised internal-frame CAD and recorded PCB/servo mounting datums; purchased-servo fit and cable routing remain illustrative.',
  geometry: 'Lightweight casing, shaft and mounting features use measured datums from the supplied Assembly SERVO.stp. The original packed Adafruit body is replaced in this view; this is not a physical-fit measurement.',
  horn: 'Nominal 14 mm single-arm illustration with an empty centre hole. Shaft axis, tip height and screw-bore centre follow the supplied STEP; the horn outline remains illustrative.',
  motion: 'Command minus supplied neutral in degrees about reference Z; no measured direction, travel, calibration, torque or battery performance.',
  wires: 'Brown GND / red V+ / yellow PWM ribbons exit the low short face nearest the shaft. Hip leads use authored inner-side routing guides and emerge between front/rear legs before reaching the hub. Plugs land on reference CAD CH0–7 pins; null stays disconnected. Dimensions/routing are illustrative, not measured as-built geometry.',
  insertion: 'Hip/clock leads use offline base poses, with hip exits re-anchored to the measured casing. Foot leads use authored inner routes, folding and relaxation through the temporarily opened print. Frame routes follow the corner/side/midpoint channels. These are illustrations, not live contact physics or a fixed-length solve during assembly.',
  statuses: 'Green/red/active colours are caller-authored worked-example states, not sensed measurements, hardware verification or calibration results.',
  power: 'The battery stays disconnected during USB work. The final Step 31 substeps illustrate unplugging USB, seating the native battery plug with the switch off, battery-only motion, then switching off and unplugging. Cable deformation is an illustrative route transition, not a measured electrical or elastic result.',
};
const asset = name => new URL(`../assets/${name}`, import.meta.url);
const assetLoads=new Map();
function loadAsset(name){
  if(!assetLoads.has(name))assetLoads.set(name,fetchAsset(asset(name)).then(r=>{if(!r.ok)throw Error(`Asset ${r.status}`);return name.endsWith('.stl')?r.arrayBuffer():r.json();}).catch(error=>{assetLoads.delete(name);throw error;}));
  return assetLoads.get(name);
}
export async function preloadServoAssets(onLoaded=()=>{}){
  const batches=[['clock-cable.json','servo-cables.json','showcase.json','showcase-floor-hulls.json'],['servo-outlets.json','leg-mounts.json'],['internal-frame.json','internal-frame.stl','bottom-cover.stl','pcb-spacer.stl','head-cover.stl','head-lid.stl'],['variant-two-eyes.json','two-eyes-internal-frame.stl','two-eyes-bottom-cover.stl','two-eyes-head-cover.stl','two-eyes-head-lid.stl','variant-two-eyes-six-legs.json','two-eyes-six-legs-internal-frame.stl','two-eyes-six-legs-bottom-cover.stl','two-eyes-six-legs-head-cover.stl','two-eyes-six-legs-head-lid.stl'],['servo-reference.json']];
  const total=batches.flat().length;let completed=0;
  const load=async name=>{await loadAsset(name);await onLoaded(name,++completed,total);};
  for(const batch of batches)await Promise.all(batch.map(load));
  return {showcase:await loadAsset('showcase.json')};
}
let constructionSerial=0;
const centre = p => p.bbox[0].map((v,i)=>(v+p.bbox[1][i])/2);
const clampProgress=value=>Math.max(0,Math.min(1,value));
const PROGRESS_KEYS=['hornAttach','connectionProgress','usbProgress','batteryProgress','upperProgress','lowerProgress','footAssemblyProgress','ribbonFold','standingProgress','frameMountProgress','spacerProgress','pcbProgress','coverProgress','headProgress','lidProgress','oledProgress','switchProgress','batteryInsertProgress','batteryConnectProgress'];
const STATUS_COLORS={success:[0.10,0.65,0.28],incorrect:[0.86,0.12,0.12],active:[0.93,0.36,0.12]};

// Step 29 builds only electronics/clock; Step 30 adds the posed peripherals and
// reference servos. Reuse loaded assembly bytes, never fetch body-preview assets.
async function buildMesh(assembly,mode,groupForPart) {
  const {manifest,binary}=assembly;
  const cableData=structuredClone(await loadAsset(mode==='clock'?'clock-cable.json':'servo-cables.json')),robot=mode!=='clock',PLACES=cableData.places||{};
  const outlets=robot?await loadAsset('servo-outlets.json'):null;
  const mounting=robot?await Promise.all([import('./leg-assembly.mjs?v=20261102-finale'),loadAsset('leg-mounts.json')]):null;
  const frameData=robot?await loadAsset('internal-frame.json'):null,variantData=robot?await loadAsset('variant-two-eyes.json'):null,legsData=robot?await loadAsset('variant-two-eyes-six-legs.json'):null;let heroVariant=null;const oledWires=[];
  const servoReference=robot?await loadAsset('servo-reference.json'):null;
  if(robot&&servoReference.dimensions.frameStepSha256!==frameData.assembly.parts['internal-frame'].step_sha256)throw Error('Servo/frame mounting datums need rebuilding');
  const view = (name,Type) => new Type(binary,manifest.buffers[name].byteOffset,manifest.buffers[name].length);
  const source = view('positions',Int16Array), sourceEdges = view('edges',Int16Array);
  const sourceIndices = view('indices',Uint16Array), sourceColors = view('colors',Uint8Array), q = manifest.quantum_mm;
  const positions=[], colors=[], indices=[], edges=[], parts=[], joints={},footStages={},stagingAnimations=[],standingAnimations=[],frameCables={},headConnections=[],headAnimations=[],frameAnimations=[],frameBatteryAnimations=[],supportPoints={},showcaseWires=[];
  const anchors=sceneAnchors(manifest,[-35,-25,0],robot?Math.PI/2:0),baseAnchors=sceneAnchors(manifest),connections={},cableAnimations=[],batteryAnimations=[],mountedAnimations=[],smoothNormals=[],mountedStates={};
  function begin(info) { const p={...info,group:info.group||(info.joint?`servo.${info.joint}`:info.id),vertexStart:positions.length/3,indexStart:indices.length,edgeStart:edges.length/3}; parts.push(p); return p; }
  function end(p) {
    p.indexCount=indices.length-p.indexStart;p.edgeCount=edges.length/3-p.edgeStart;p.vertexCount=positions.length/3-p.vertexStart;
    const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
    for(let i=p.vertexStart*3;i<(p.vertexStart+p.vertexCount)*3;i++) {const k=i%3;lo[k]=Math.min(lo[k],positions[i]);hi[k]=Math.max(hi[k],positions[i]);}
    p.bounds=[lo,hi];
  }
  function clonePart(sourcePart,transform,info){
    const base=positions.length/3,part=begin({...info,group:sourcePart.group,physical:sourcePart.physical});
    for(let i=sourcePart.vertexStart;i<sourcePart.vertexStart+sourcePart.vertexCount;i++){
      positions.push(...transform(positions.slice(i*3,i*3+3)));colors.push(...colors.slice(i*3,i*3+3));
    }
    for(let i=sourcePart.indexStart;i<sourcePart.indexStart+sourcePart.indexCount;i++)indices.push(base+indices[i]-sourcePart.vertexStart);
    for(let i=sourcePart.edgeStart*3;i<(sourcePart.edgeStart+sourcePart.edgeCount)*3;i+=3)edges.push(...transform(edges.slice(i,i+3)));
    end(part);return part;
  }
  function nativeLeg(id,transform,info){
    const p=manifest.parts.find(p=>p.id===`external.leg.${id}`);if(!p)throw Error('Missing native leg '+id);
    const base=positions.length/3,part=begin({...info,group:p.id});
    for(let i=p.vertices[0];i<p.vertices[0]+p.vertices[1];i++){
      positions.push(...transform([source[i*3]*q,source[i*3+1]*q,source[i*3+2]*q],p));colors.push(...PRINTED_PLASTIC_RGB);
    }
    for(let i=p.indices[0];i<p.indices[0]+p.indices[1];i++)indices.push(base+sourceIndices[i]);
    for(let i=p.edges[0]*3;i<(p.edges[0]+p.edges[1])*3;i+=3)edges.push(...transform([sourceEdges[i]*q,sourceEdges[i+1]*q,sourceEdges[i+2]*q],p));
    end(part);return part;
  }
  const templateBase=manifest.parts.find(p=>p.id===cableData.socketTemplate+'.housing');
  if(!templateBase)throw Error('Missing existing Dupont housing template');
  const socketOrigin=[...centre(templateBase).slice(0,2),templateBase.bbox[0][2]];
  function socket(seat,rotate=false) {
    // Reuse the OLED/carrier socket meshes, including inspection windows,
    // open pin bores, crimp terminals and ferrules; no replacement solid boxes.
    for(const suffix of ['housing','terminal']) {
      const p=manifest.parts.find(p=>p.id===cableData.socketTemplate+'.'+suffix);
      if(!p)throw Error('Missing socket '+suffix);
      const base=positions.length/3;
      const placed=point=>{const [x,y,z]=point.map((v,i)=>v-socketOrigin[i]);return (rotate?[-y,x,z]:[x,y,z]).map((v,i)=>v+seat[i]);};
      for(let i=p.vertices[0];i<p.vertices[0]+p.vertices[1];i++){
        positions.push(...placed([0,1,2].map(k=>source[i*3+k]*q)));
        colors.push(...sourceColors.subarray(i*3,i*3+3));
      }
      for(let i=p.indices[0];i<p.indices[0]+p.indices[1];i++)indices.push(base+sourceIndices[i]);
      for(let i=p.edges[0]*3;i<(p.edges[0]+p.edges[1])*3;i+=3)edges.push(...placed([0,1,2].map(k=>sourceEdges[i+k]*q)));
      for(let i=p.edges[0]*3;i<(p.edges[0]+p.edges[1])*3;i+=3)edges.push(...placed([0,1,2].map(k=>sourceEdges[i+k]*q)));
    }
  }
  function cable(key,info,ribbon) {
    const route=cableData.routes[key];if(!route)throw Error('Missing settled route '+key);
    const sweeps=route.states.map(s=>cableSweep(s.points,ribbon?CONDUCTORS.map(c=>c.rgb):[[243,204,46]],ribbon,ribbon?{...servoReference.dimensions.ribbonStyle,endSide:[-1,0,0],startTangent:joints[info.joint].factoryDirection,startSide:joints[info.joint].factorySide}:{}));
    const base=positions.length/3,geometry=sweeps[0],part=begin(info);
    positions.push(...geometry.positions);colors.push(...geometry.colors);
    for(const i of geometry.indices)indices.push(base+i);
    end(part);
    cableAnimations.push({key,part,route,sweeps,start:base,count:geometry.positions.length/3,lift:0});
    return part;
  }
  for(const p of manifest.parts) {
    const match = robot&&p.id.match(/^external\.servo\.([RL][1-4])\.body$/);
    const peripheral = robot?peripheralPose(p.id):/^(external\.(oled\.|i2c\.|switch\.|power\.switch-))/.test(p.id)?'bench':null;
    const electronics = p.chain.includes('AssembledElectronics') && !p.id.startsWith('offcut.') && !p.id.startsWith('converter.trimmer_offcut.');
    if(!match && !peripheral && !electronics) continue;
    const id=match?.[1], c=centre(p), offset=id ? [PLACES[id][0]-c[0],PLACES[id][1]-c[1],0] : [-35,-25,0];
    const outlet=id?outlets.parts[id]:null;
    if(outlet&&outlet.sourceSha256!==p.metadata.SHA256)throw Error('Servo outlet source changed');
    const omitTriangles=new Set(outlet?.removedTriangles||[]),omitEdges=new Set(outlet?.removedEdges||[]);
    const rearHip=['L2','R2'].includes(id);
    const placed=point=>robot&&!id?layoutPoint(point,cableData.layout.poses[peripheral||'board']):rearHip?[PLACES[id][0]-(point[0]-c[0]),PLACES[id][1]-(point[1]-c[1]),point[2]]:point.map((v,k)=>v+offset[k]);
    const part=begin({id:p.id,kind:id?'servo':peripheral==='batteryPlug'?'battery-plug':p.metadata?.CableKind==='cable'?'peripheral-cable':peripheral?'peripheral':'electronics',joint:id,physical:isPhysicalColour(p),wireColor:['cable','heatshrink'].includes(p.metadata?.CableKind)||/^(jumper\.(core|insulation)\.|underside\.wire\.)/.test(p.id),group:id?`servo.${id}`:groupForPart?.(p.id)||p.id,pivot:peripheral==='batteryPlug'?cableData.layout.poses.batteryPlug.target:[0,0,0]});
    if(id){
      const d=servoReference.dimensions,mesh=servoReference.mesh,base=positions.length/3,sign=rearHip?-1:1;
      const place=v=>[PLACES[id][0]+sign*v[0],PLACES[id][1]+sign*(v[1]-d.case.centerY),v[2]];
      for(let i=0;i<mesh.positions.length;i+=3)positions.push(...place(mesh.positions.slice(i,i+3)));
      for(const color of mesh.colors)colors.push(color);for(const i of mesh.indices)indices.push(base+i);
      for(let i=0;i<mesh.edges.length;i+=3)edges.push(...place(mesh.edges.slice(i,i+3)));
      const leg=LEG_PAIRS.find(pair=>pair.hip===id||pair.foot===id),frame=d.frameMounts[id];
      joints[id]={pivot:place([0,0,d.shaft.tipZ+.4]),bodyCenter:place([0,d.case.centerY,d.case.height/2]),sourceId:p.id,role:leg.hip===id?'hip':'foot',leg:leg.id,
        caseYaw:rearHip?Math.PI:0,hornYaw:id.startsWith('L')?0:Math.PI,shaftAxis:[0,0,1],factoryExit:place(d.outlet.position),mountFlangeZ:d.flange.bottom,
        frameMountTarget:frame?[frame.caseCenter[0]+(rearHip?-1:1)*d.case.centerY,frame.caseCenter[1]]:undefined,
        factoryDirection:d.outlet.direction.map((v,i)=>v*(i<2?sign:1)),factorySide:d.outlet.widthAxis.map((v,i)=>v*(i<2?sign:1)),
        modelSource:d.source.sha256,removedStubTriangles:omitTriangles.size,renderedBodyTriangles:mesh.indices.length/3};
      end(part);continue;
    }
    const base=positions.length/3, [start,count]=p.vertices;
    for(let i=start;i<start+count;i++) {
      positions.push(...placed([0,1,2].map(k=>source[i*3+k]*q)));
      colors.push(...sourceColors.subarray(i*3,i*3+3));
    }
    for(let i=p.indices[0];i<p.indices[0]+p.indices[1];i+=3)if(!omitTriangles.has((i-p.indices[0])/3))indices.push(base+sourceIndices[i],base+sourceIndices[i+1],base+sourceIndices[i+2]);
    for(let i=p.edges[0]*3;i<(p.edges[0]+p.edges[1])*3;i+=3)if(!omitEdges.has(Math.floor((i-p.edges[0]*3)/6)))edges.push(...placed([0,1,2].map(k=>sourceEdges[i+k]*q)));
    end(part);
  }
  if(robot&&IDS.some(id=>!joints[id])) throw new Error('Missing reference servo geometry');
  if(mounting){
    const [helpers,config]=mounting;
    for(const pair of helpers.LEG_PAIRS)for(const [key,route] of Object.entries(cableData.routes))if(key.startsWith(pair.hip+'.')){
      const j=joints[pair.hip];cableData.routes[key]={illustrative:true,states:route.states.map(s=>({lift:s.lift,points:helpers.reanchorCable(s.points,j.factoryExit,j.factoryDirection)}))};
    }
    for(const pair of helpers.LEG_PAIRS){
      const id=pair.foot,j=joints[id],stage=helpers.uprightFootPlacement(pair,joints,config);footStages[id]=stage;
      const part=parts.find(p=>p.kind==='servo'&&p.joint===id);
      for(let i=part.vertexStart*3;i<(part.vertexStart+part.vertexCount)*3;i+=3)positions.splice(i,3,...stage.point(positions.slice(i,i+3)));
      for(let i=part.edgeStart*3;i<(part.edgeStart+part.edgeCount)*3;i+=3)edges.splice(i,3,...stage.point(edges.slice(i,i+3)));
      part.bounds=[[Infinity,Infinity,Infinity],[-Infinity,-Infinity,-Infinity]];
      for(let i=part.vertexStart*3;i<(part.vertexStart+part.vertexCount)*3;i++){const k=i%3;part.bounds[0][k]=Math.min(part.bounds[0][k],positions[i]);part.bounds[1][k]=Math.max(part.bounds[1][k],positions[i]);}
      joints[id]={...j,pivot:stage.pivot,bodyCenter:stage.point(j.bodyCenter),factoryExit:stage.point(j.factoryExit),factoryDirection:stage.vector(j.factoryDirection),factorySide:stage.vector(j.factorySide),caseYaw:stage.angle,hornYaw:id.startsWith('L')?Math.PI:0};
      const hipRoute=Object.entries(cableData.routes).find(([key])=>key.startsWith(pair.hip+'.'))[1];
      for(const [key,route] of Object.entries(cableData.routes))if(key.startsWith(id+'.')){
        cableData.routes[key]={illustrative:true,states:route.states.map(s=>({points:resamplePath(helpers.routedFootCable(joints[id].factoryExit,joints[id].factoryDirection,hipRoute.states[0].points,joints[pair.hip].bodyCenter,s.points.at(-1),stage.mount.axis))}))};
      }
    }
  }

  // Small nominal geometry is appended in memory, never written to assembly.bin.
  function triangle(a,b,c,color) {const n=positions.length/3;positions.push(...a,...b,...c);colors.push(...color,...color,...color);indices.push(n,n+1,n+2);}
  function prism(poly,z,height,color) {
    const low=poly.map(p=>[...p,z]),high=poly.map(p=>[...p,z+height]);
    for(let i=1;i<poly.length-1;i++){triangle(high[0],high[i],high[i+1],color);triangle(low[0],low[i+1],low[i],color);}
    for(let i=0;i<poly.length;i++){const j=(i+1)%poly.length;triangle(low[i],low[j],high[j],color);triangle(low[i],high[j],high[i],color);edges.push(...high[i],...high[j]);}
  }
  const box=(x0,x1,y0,y1,z,height,color)=>prism([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],z,height,color);
  function tube(points,color,r=0.45) {
    for(let j=0;j<points.length-1;j++) {
      const a=points[j],b=points[j+1],axis=normalize(sub(b,a));
      const u=normalize(cross(axis,Math.abs(axis[2])<0.9?[0,0,1]:[0,1,0])),v=cross(axis,u);
      const ring=(p,i)=>p.map((x,k)=>x+r*(u[k]*Math.cos(i*Math.PI/4)+v[k]*Math.sin(i*Math.PI/4)));
      for(let i=0;i<8;i++){const a0=ring(a,i),a1=ring(a,i+1),b0=ring(b,i),b1=ring(b,i+1);triangle(a0,b0,b1,color);triangle(a0,b1,a1,color);}
    }
  }
  if(robot){
  const layout=begin({id:'layout.robot-footprint',kind:'layout',pivot:[0,0,0]});
  for(const x of [-38,38])for(let y=-35;y<35;y+=10)tube([[x,y,0],[x,Math.min(y+5,35),0]],[120,125,130],.3);
  for(const y of [-35,35])for(let x=-38;x<38;x+=10)tube([[x,y,0],[Math.min(x+5,38),y,0]],[120,125,130],.3);
  for(const pair of LEG_PAIRS){const a=PLACES[pair.hip],b=PLACES[pair.foot];tube([[a[0],a[1],0],[b[0],b[1],0]],[155,158,160],.3);}
  tube([[0,-82,0],[0,-106,0]],[60,65,70],.6);
  prism([[-4,-100],[0,-108],[4,-100]],0,.3,[60,65,70]);end(layout);

  for(const id of IDS) {
    const pivot=joints[id].pivot,[x,y,z]=pivot;
    const yaw=joints[id].hornYaw,oriented=([a,b])=>[x+a*Math.cos(yaw)-b*Math.sin(yaw),y+a*Math.sin(yaw)+b*Math.cos(yaw)];
    const corners=[[-3,-2],[-2,-3],[11,-2],[14,0],[11,2],[-2,3],[-3,2]];
    const outline=corners.flatMap((a,i)=>Array.from({length:6},(_,j)=>{
      const b=corners[(i+1)%corners.length],t=j/6;return a.map((v,k)=>v+(b[k]-v)*t);
    }));
    const outer=outline.map(oriented);
    const inner=outline.map(p=>{const radius=Math.hypot(...p),bore=servoReference.dimensions.shaft.boreRadius;return oriented([bore*p[0]/radius,bore*p[1]/radius]);});
    const quad=(a,b,c,d,color)=>{triangle(a,b,c,color);triangle(a,c,d,color);};
    const horn=begin({id:`horn.${id}`,kind:'horn',joint:id,pivot});
    // An annulus, not a solid plate with a raised dark screw dot: leave both
    // faces open at the centre. This polygonal hole is nominal illustration.
    for(let i=0;i<outer.length;i++) {
      const j=(i+1)%outer.length,color=[250,249,245];
      quad([...outer[i],z+1.5],[...outer[j],z+1.5],[...inner[j],z+1.5],[...inner[i],z+1.5],color);
      quad([...outer[j],z],[...outer[i],z],[...inner[i],z],[...inner[j],z],color);
      quad([...outer[i],z],[...outer[j],z],[...outer[j],z+1.5],[...outer[i],z+1.5],color);
      edges.push(...outer[i],z+1.5,...outer[j],z+1.5);
    }
    end(horn);
    // Shaded inner walls only; no cap, screw head or installed retaining screw.
    const hole=begin({id:`hole.${id}`,kind:'hole',joint:id,pivot});
    for(let i=0;i<inner.length;i++) {
      const j=(i+1)%inner.length;
      quad([...inner[j],z],[...inner[i],z],[...inner[i],z+1.5],[...inner[j],z+1.5],[170,166,160]);
      edges.push(...inner[i],z+1.5,...inner[j],z+1.5);
    }
    end(hole);
    for(const key of Object.keys(cableData.routes).filter(key=>key.startsWith(id+'.'))) {
      const channel=Number(key.split('.')[1]),header=anchors.channels[channel];
      const plugBaseZ=header.plugBaseZ,pinPoints=header.pins.map(p=>p.point);
      const wireEnds=pinPoints.map(p=>[p[0],p[1],plugBaseZ+14]);
      const wire=cable(key,{id:`harness.${id}.${channel}`,kind:'harness',joint:id,channel,pivot:[0,0,0]},true);
      const plug=begin({id:`plug.${id}.${channel}`,kind:'plug',joint:id,channel,pivot:[0,0,0]});
      for(const [px,py] of pinPoints)socket([px,py,plugBaseZ],true);
      // Join the three detailed cells into one 3-pin housing, without filling
      // their bores or inspection windows.
      for(const side of [-1,1]){
        const y=pinPoints[0][1]+side*1.2;
        box(pinPoints[2][0]-1.25,pinPoints[0][0]+1.25,y-.05,y+.05,plugBaseZ,14,[11,13,15]);
      }
      end(plug);
      connections[`${id}.${channel}`]={joint:id,channel,harnessPart:wire.id,plugPart:plug.id,
        sourceParts:header?header.pins.flatMap(p=>[p.part,...p.also]):[],
        conductors:CONDUCTORS.map((c,i)=>({signal:c.signal,color:c.color,
          sourcePart:header?.pins[i].part??null,also:header?.pins[i].also??[],
          headerPoint:header?[...pinPoints[i]]:null,
          socketPoint:[pinPoints[i][0],pinPoints[i][1],plugBaseZ],wireEnd:wireEnds[i]}))};
    }
  }
  for(const lead of cableData.peripherals){
    const options={radius:lead.radius,startTangent:lead.directions[0],endTangent:lead.directions[1].map(v=>-v)};
    const seated=cableData.batteryConnected.find(item=>item.id===lead.id.replace('external.power.','external.power.connected-'));
    const parked=seated?resamplePath(lead.points):lead.points;
    const geometry=cableSweep(parked,[lead.color],false,options);
    const base=positions.length/3,part=begin({id:lead.id,kind:'peripheral-cable',pivot:[0,0,0]});
    positions.push(...geometry.positions);colors.push(...geometry.colors);for(const i of geometry.indices)indices.push(base+i);end(part);
    smoothNormals.push({start:base,normals:geometry.normals});
    if(seated)batteryAnimations.push({id:lead.id,parked,connected:resamplePath(seated.points),color:lead.color,options,start:base,count:geometry.positions.length/3,progress:0});
  }
  if(mounting){
    const [helpers,config]=mounting;
    const originals=[...parts];
    for(const pose of ['rest','stand']){
      const standing=pose==='stand',state={joints:{},cables:{},mounts:{}};mountedStates[pose]=state;
      for(const pair of helpers.LEG_PAIRS){
        const mount=helpers.legPlacement(pair,joints,config,standing);
        state.mounts[pair.hip]={hip:mount.hip,foot:mount.foot,axis:mount.axis,shaftAxis:mount.shaftAxis,out:mount.out,bodyTurn:mount.bodyTurn,hornFixedTo:'upper',bodyCarriedBy:'foot'};
        if(!standing)nativeLeg(pair.hip,(p,part)=>mount.point(helpers.fromBench(p,part,config.parts[pair.hip])),
          {id:`mounted.${pose}.leg.${pair.hip}`,kind:'mounted-upper',joint:pair.hip,pose,pivot:[0,0,0],carry:true});
        if(!standing)nativeLeg(pair.foot,(p,part)=>mount.lower(helpers.fromBench(p,part,config.parts[pair.foot])),
          {id:`mounted.${pose}.leg.${pair.foot}`,kind:'mounted-lower',joint:pair.foot,pose,pivot:[0,0,0],axis:mount.axis});
        for(const id of [pair.hip,pair.foot]){
          const foot=id===pair.foot,stage=footStages[id],shaft=foot?stage.sourcePivot:joints[id].pivot;
          const bodyPoint=p=>foot?mount.footServoPoint(stage.unpoint(p),shaft):p;
          const hornPoint=p=>foot?stage.hornPoint(p,mount):mount.hipHornPoint(p);
          state.joints[id]={...joints[id],pivot:foot?mount.foot:shaft,bodyCenter:bodyPoint(joints[id].bodyCenter),
            factoryExit:bodyPoint(joints[id].factoryExit),factoryDirection:foot?mount.footServoVector(stage.unvector(joints[id].factoryDirection)):joints[id].factoryDirection,
            factorySide:foot?mount.footServoVector(stage.unvector(joints[id].factorySide)):joints[id].factorySide,shaftAxis:foot?mount.shaftAxis:[0,0,1]};
          if(!standing)for(const part of originals.filter(p=>p.joint===id&&['servo','horn','hole','grommet'].includes(p.kind))){
            clonePart(part,['horn','hole'].includes(part.kind)?hornPoint:bodyPoint,
              {id:`mounted.${pose}.${part.id}`,kind:'mounted-servo',sourceKind:part.kind,joint:id,pose,pivot:[0,0,0],carry:foot});
          }
          // Retain all taught plug assignments; the renderer selects the actual
          // illustrated map. Mounted cable routes are endpoint re-poses, not a
          // fresh elastic solve or a claim about purchased cable lengths.
          for(const entry of Object.values(connections).filter(c=>c.joint===id)){
            const key=`${id}.${entry.channel}`,route=cableData.routes[key];
            const direction=foot?mount.footServoVector(stage.unvector(joints[id].factoryDirection)):joints[id].factoryDirection;
            const side=foot?mount.footServoVector(stage.unvector(joints[id].factorySide)):joints[id].factorySide;
            const hipConnection=Object.values(connections).find(c=>c.joint===pair.hip);
            const hipRoute=cableData.routes[`${pair.hip}.${hipConnection.channel}`].states[0].points;
            const seated=foot?helpers.routedFootCable(state.joints[id].factoryExit,direction,hipRoute,joints[pair.hip].bodyCenter,route.states[0].points.at(-1),mount.axis):null;
            const points=foot?resamplePath(seated):helpers.reanchorCable(route.states[0].points,state.joints[id].factoryExit,direction);
            state.cables[key]=points;if(standing)continue;
            const options={...servoReference.dimensions.ribbonStyle,startTangent:direction,startSide:side,endSide:[-1,0,0]};
            const geometry=cableSweep(points,CONDUCTORS.map(c=>c.rgb),true,options);
            const base=positions.length/3,part=begin({id:`mounted.${pose}.harness.${key}`,kind:'mounted-harness',joint:id,channel:entry.channel,pose,pivot:[0,0,0]});
            positions.push(...geometry.positions);colors.push(...geometry.colors);for(const i of geometry.indices)indices.push(base+i);end(part);
            smoothNormals.push({start:base,normals:geometry.normals});state.cables[key]=points;
            const feedPoints=foot?resamplePath(helpers.routedFootCable(state.joints[id].factoryExit,direction,hipRoute,joints[pair.hip].bodyCenter,route.states[0].points.at(-1),mount.axis,1)):points;
            let feedSweeps;
            if(foot){
              const exit=state.joints[id].factoryExit;
              const closest=z=>feedPoints.reduce((best,p,i)=>Math.hypot(p[0]-exit[0],p[1]-exit[1],p[2]-exit[2]-z)<Math.hypot(feedPoints[best][0]-exit[0],feedPoints[best][1]-exit[1],feedPoints[best][2]-exit[2]-z)?i:best,0);
              const sideGuides=[{index:closest(2),side:mount.shaftAxis},{index:closest(9),side:mount.shaftAxis}];
              feedSweeps=[geometry,cableSweep(feedPoints,CONDUCTORS.map(c=>c.rgb),true,{...options,sideGuides})];
            }
            mountedAnimations.push({pose,joint:id,channel:entry.channel,points,feedPoints,feedSweeps,options,start:base,count:geometry.positions.length/3,lift:0,feed:0,root:[0,0,0]});
            if(foot)state.cables[key]={seated:points,feed:feedPoints};
            if(foot&&!standing){
              const upright=cableData.routes[key].states[0].points,opts={...servoReference.dimensions.ribbonStyle,startTangent:joints[id].factoryDirection,startSide:joints[id].factorySide,endSide:[-1,0,0]};
              const sweep=cableSweep(upright,CONDUCTORS.map(c=>c.rgb),true,opts),start=positions.length/3;
              const staged=begin({id:`staging.harness.${key}`,kind:'staging-harness',joint:id,channel:entry.channel,pivot:[0,0,0]});
              positions.push(...sweep.positions);colors.push(...sweep.colors);for(const i of sweep.indices)indices.push(start+i);end(staged);smoothNormals.push({start,normals:sweep.normals});
              stagingAnimations.push({joint:id,channel:entry.channel,points:upright,otherPoints:points,options:opts,start,count:sweep.positions.length/3,progress:0});
            }
          }
        }
      }
    }
    for(const a of mountedAnimations)if(footStages[a.joint])standingAnimations.push({...a,otherPoints:mountedStates.stand.cables[`${a.joint}.${a.channel}`],progress:NaN});
    for(const a of mountedAnimations){
      const j=mountedStates.rest.joints[a.joint],delta=frameMountOffset(a.joint,joints,frameData.assembly,1);
      const route=frameRibbonRoute(a.joint,j.factoryExit.map((v,i)=>v+delta[i]),a.points.at(-1),j.factoryDirection,j.factorySide,frameData.assembly);
      frameCables[`${a.joint}.${a.channel}`]=route;
      const slit=frameSlitSkin(route,frameData.assembly);
      const geometry=cableSweep(route.points,CONDUCTORS.map(c=>c.rgb),true,{...a.options,sideGuides:slit.sideGuides});
      const weights=slit.weights;
      const radial=geometry.positions.length/3/route.points.length;
      // cableSweep emits three conductor strips, then two four-column webs.
      const wireWeights=[];for(const columns of [(radial-8)/3,(radial-8)/3,(radial-8)/3,4,4])for(const w of weights)for(let j=0;j<columns;j++)wireWeights.push(w);
      showcaseWires.push({id:`servo.${a.joint}.${a.channel}`,sourceJoint:a.joint,channel:a.channel,joint:joints[a.joint].role==='foot'?a.joint:null,geometry,weights:wireWeights});
      const start=positions.length/3,part=begin({id:`frame.harness.${a.joint}.${a.channel}`,kind:'frame-harness',joint:a.joint,channel:a.channel,pivot:[0,0,0]});
      for(const v of geometry.positions)positions.push(v);for(const c of geometry.colors)colors.push(c);for(const i of geometry.indices)indices.push(start+i);end(part);
      smoothNormals.push({start,normals:geometry.normals});
      if(joints[a.joint].role==='foot')frameAnimations.push({joint:a.joint,channel:a.channel,points:route.points,options:{...a.options,sideGuides:slit.sideGuides},start,count:geometry.positions.length/3,geometry,key:'rest'});
    }
  }
  }
  const [ux,uy,uz]=baseAnchors.usb.point;
  const usbPlug=begin({id:'power.usb.plug',kind:'usb',pivot:[0,0,0]});
  // USB-C mouth is the +X face of the native silver shell. The tongue and boot
  // are nominal, visibly aimed at that opening rather than the PCB envelope.
  box(ux-2,ux+3,uy-3.2,uy+3.2,uz-1,2,[185,189,193]);
  box(ux+2,ux+9,uy-4,uy+4,uz-2,4,[53,57,64]);end(usbPlug);
  const usb=begin({id:'power.usb',kind:'usb',pivot:[0,0,0]});
  const usbEnd=[ux+40,uy+4,uz];
  tube([[ux+9,uy,uz],[ux+18,uy,uz],[ux+28,uy+4,uz],[usbEnd[0]-2,usbEnd[1],uz]],[75,81,90],1.2);end(usb);
  const usbBreak=begin({id:'power.usb.break',kind:'usb',pivot:[0,0,0]});
  // Double zigzag is a drawing break: cable continues to an offscreen computer.
  // It is not a cut-wire instruction, a second connector or a computer model.
  for(const shift of [0,1.8]) tube([[-1,-3],[1,-1],[-1,1],[1,3]].map(([x,y])=>[usbEnd[0]+x+shift,usbEnd[1]+y,uz+1.3]),[30,33,39],0.3);
  end(usbBreak);anchors.usb.breakPoint=robot?[-usbEnd[1],usbEnd[0],usbEnd[2]]:usbEnd;
  if(robot){
    for(let i=usbPlug.vertexStart*3;i<positions.length;i+=3){const x=positions[i],y=positions[i+1];positions[i]=-y;positions[i+1]=x;}
    for(let i=usbPlug.edgeStart*3;i<edges.length;i+=3){const x=edges[i],y=edges[i+1];edges[i]=-y;edges[i+1]=x;}
  }
  if(!robot){
  cable('clock',{id:'clock.jumper',kind:'clock',pivot:[0,0,0]},false);
  const clockEnds=[anchors.clock.output.point,anchors.clock.input.point];
  clockEnds.forEach(([x,y,z],i)=>{const plug=begin({id:`clock.plug.${i}`,kind:'clock-plug',pivot:[0,0,0]});socket([x,y,z-4]);end(plug);});
  }

  if(frameData)for(const [name,record] of Object.entries(frameData.geometry)){
    const buffer=await loadAsset(record.stl),data=new DataView(buffer),triangles=data.getUint32(80,true);
    if(buffer.byteLength!==84+triangles*50)throw Error('Invalid frame STL '+name);
    const origins=frameData.assembly.parts[name].assembly_origins_mm||[[0,0,0]];
    for(const [instance,origin] of origins.entries()){
    const place=p=>framePoint(p.map((v,i)=>v+origin[i]),frameData.assembly);
    const part=begin({id:`frame.${name}${origins.length>1?'.'+instance:''}`,kind:name,pivot:[0,0,0]});
    for(let i=0;i<triangles;i++)for(let j=0;j<3;j++){
      const at=84+i*50+12+j*12,p=place([0,1,2].map(k=>data.getFloat32(at+k*4,true)));
      indices.push(positions.length/3);positions.push(...p);colors.push(...PRINTED_PLASTIC_RGB);
    }
    for(let i=0;i<record.edges.length;i+=3)edges.push(...place(record.edges.slice(i,i+3)));
    end(part);
    }
  }
  if(frameData){
    const originals=[...parts];
    for(const p of originals.filter(p=>peripheralPose(p.id)==='battery'))clonePart(p,v=>remountBatteryPoint(v,cableData.layout,frameData.assembly),{id:'frame.battery.'+p.id,kind:'frame-battery',pivot:[0,0,0]});
    const plugOrigin=cableData.layout.poses.batteryPlug.target,plugTarget=cableData.batteryConnectedPoint;
    for(const p of originals.filter(p=>p.kind==='battery-plug'))clonePart(p,v=>[-(v[1]-plugOrigin[1])+plugTarget[0],v[0]-plugOrigin[0]+plugTarget[1],v[2]-plugOrigin[2]+plugTarget[2]],{id:'frame.battery-plug.'+p.id,kind:'frame-battery-plug',pivot:[0,0,0]});
    for(const lead of cableData.peripherals.filter(p=>['external.power.positive','external.power.negative'].includes(p.id))){
      const connected=cableData.batteryConnected.find(p=>p.id===lead.id.replace('external.power.','external.power.connected-'));
      const routes=[[0,0],[.9,0],[1,0],[1,1]].map(([insert,plug])=>frameBatteryLead(lead,connected,frameData.assembly,cableData.layout,insert,plug));
      const options={radius:lead.radius,startTangent:[0,-1,0],endTangent:[0,0,-1]},sweeps=routes.map(r=>cableSweep(r.points,[lead.color],false,options));
      const g=sweeps[0],start=positions.length/3,part=begin({id:'frame.battery-wire.'+lead.id,kind:'frame-battery-wire',physical:true,wireColor:true,pivot:[0,0,0]});
      for(const v of g.positions)positions.push(v);for(const c of g.colors)colors.push(c);for(const i of g.indices)indices.push(start+i);end(part);smoothNormals.push({start,normals:g.normals});
      const count=g.positions.length/3,radial=count/routes[0].points.length,rootWeights=Float32Array.from({length:count},(_,i)=>{const u=Math.min(1,Math.floor(i/radial)/16);return 1-u*u*(3-2*u);});
      frameBatteryAnimations.push({id:lead.id,lead,connected,routes,sweeps,start,count,rootWeights,key:null});
      showcaseWires.push({id:'battery.'+lead.id.split('.').at(-1),geometry:sweeps[3]});
    }
    const poses=headPeripheralPoses(frameData.assembly,cableData.layout);
    const showcase=await loadAsset('showcase.json');
    for(const [faceName,runs] of Object.entries({...showcase.faces,eye:pupilFace(),'eye-left':pupilFace(30),'eye-right':pupilFace(-30),'eye-closed':closedEyeFace()})){
      const part=begin({id:`face.${faceName}`,kind:'face',faceName,pivot:[0,0,0]});
      for(const [x,y,width] of runs){
        const base=positions.length/3;
        for(const [px,py] of [[x,y],[x+width,y],[x+width,y+1],[x,y+1]]){
          positions.push(...layoutPoint([30+px*20/128,91-py*11/64,43.08],poses.oled));colors.push(225,250,255);
        }
        indices.push(base,base+1,base+2,base,base+2,base+3);
      }
      end(part);
    }
    for(const original of [...parts]){
      const kind=headConnectionKind(original.id),poseName=peripheralPose(original.id);
      if(!kind||!poseName||original.kind==='peripheral-cable')continue;
      const old=cableData.layout.poses[poseName],next=poses[poseName];
      if(!next)continue;
      const transform=p=>{
        const d=p.map((v,i)=>v-old.target[i]);
        const native=old.origin.map((v,k)=>v+old.matrix.reduce((sum,row,i)=>sum+row[k]*d[i],0));
        return layoutPoint(native,next);
      };
      clonePart(original,transform,{id:`head.${original.id}`,kind:'head-peripheral',connection:kind,carrier:poseName==='board',pivot:[0,0,0]});
    }
    for(const lead of cableData.peripherals.filter(l=>headConnectionKind(l.id))){
      const route=headConnectionRoute(lead,poses,cableData.layout),open=headConnectionRoute(lead,poses,cableData.layout,0);
      const options={radius:lead.radius},sweeps=[open,route].map(r=>cableSweep(r.points,[lead.color],false,options));
      const start=positions.length/3,part=begin({id:`head.${lead.id}`,kind:'head-wire',connection:route.kind,physical:true,wireColor:true,pivot:[0,0,0]});
      positions.push(...sweeps[0].positions);colors.push(...sweeps[0].colors);for(const i of sweeps[0].indices)indices.push(start+i);end(part);
      smoothNormals.push({start,normals:sweeps[0].normals});
      headAnimations.push({kind:route.kind,sweeps,start,count:sweeps[0].positions.length/3,progress:NaN});
      headConnections.push({id:lead.id,...route});
      if(route.kind==='oled')oledWires.push({lead,route,closed:sweeps[1]});
      showcaseWires.push({id:lead.id,geometry:sweeps[1]});
    }
    if(variantData)heroVariant=await appendDesignVariant();
    const outline=begin({id:'frame.pcb-outline',kind:'route-guide',pivot:[0,0,0]});
    const [long,wide,thick]=frameData.assembly.pcb_size_mm,x=wide/2,y=long/2;
    for(const z of [0,thick]){const p=[[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]];for(let i=0;i<4;i++)edges.push(...p[i],...p[(i+1)%4]);}
    end(outline);
  }
  // The prompted two-eye design: real widened CAD shells, a second OLED with its
  // leads and a second display header. Shown only by the landing animation.
  async function appendDesignVariant(){
    const v=variantData.assembly.variant,base=frameData.assembly.head_fit.display_windows[0].centre_mm[1];
    const [right,left]=variantData.assembly.display_windows.map(w=>w.centre_mm[1]-base);
    for(const [name,record] of Object.entries(variantData.geometry)){
      const buffer=await loadAsset(record.stl),data=new DataView(buffer),triangles=data.getUint32(80,true);
      if(buffer.byteLength!==84+triangles*50)throw Error('Invalid variant STL '+name);
      const place=p=>framePoint(p,frameData.assembly),part=begin({id:`variant.${name}`,kind:'variant-'+name,pivot:[0,0,0]});
      for(let i=0;i<triangles;i++)for(let j=0;j<3;j++){
        const at=84+i*50+12+j*12;indices.push(positions.length/3);positions.push(...place([0,1,2].map(k=>data.getFloat32(at+k*4,true))));colors.push(...PRINTED_PLASTIC_RGB);
      }
      for(let i=0;i<record.edges.length;i+=3)edges.push(...place(record.edges.slice(i,i+3)));
      end(part);
    }
    const centre=p=>p.bounds[0].map((x,k)=>(x+p.bounds[1][k])/2),find=id=>parts.find(p=>p.id===id);
    // One carrier column (M→N), measured from the existing M14 and X14 pins.
    const column=centre(find('auxiliary.pin.X14')).map((x,k)=>(x-centre(find('auxiliary.pin.M14'))[k])/11);
    const shift=d=>p=>p.map((x,k)=>x+d[k]),originals=[...parts];
    for(const p of originals.filter(p=>p.kind==='face'||p.kind==='head-peripheral'&&p.connection==='oled'))
      clonePart(p,shift(p.carrier?column:[right,0,0]),{id:'variant.oled2.'+p.id,kind:'variant-oled2',faceName:p.faceName,connection:p.connection,carrier:p.carrier,pivot:[0,0,0]});
    for(const p of originals.filter(p=>/^(auxiliary\.pin\.M1[2-5]|aux\.solder\.M1[2-5]|auxiliary\.spacer\.M)$/.test(p.id)))
      clonePart(p,shift(column),{id:'variant.header2.'+p.id,sourceId:p.id,kind:'variant-header2',pivot:[0,0,0]});
    const body=parts.indexOf(find('head.external.oled.body')),body2=parts.indexOf(find('variant.oled2.head.external.oled.body'));
    for(const {lead,route,closed} of oledWires){
      const [a,b]=[route.points[0],route.points.at(-1)],[carrierEnd,oledEnd]=a[2]<b[2]?[a,b]:[b,a],count=closed.positions.length/3;
      const weights=Float32Array.from({length:count},(_,i)=>{const p=closed.positions.slice(i*3,i*3+3),dc=Math.hypot(...p.map((x,k)=>x-carrierEnd[k])),d=Math.hypot(...p.map((x,k)=>x-oledEnd[k])),u=dc/(dc+d);return u*u*(3-2*u);});
      for(const second of [false,true]){
        const start=positions.length/3,part=begin(second?{id:'variant.oled2.wire.'+lead.id,kind:'variant-oled2',physical:true,wireColor:true,pivot:[0,0,0],skin:{part:body2,origin:[0,0,0]},skinWeights:weights}:{id:'variant.oled1.wire.'+lead.id,kind:'variant-oled1-wire',physical:true,wireColor:true,pivot:[0,0,0],skin:{part:body,origin:[0,0,0]},skinWeights:weights});
        for(let i=0;i<count;i++){const w=weights[i];for(let k=0;k<3;k++)positions.push(closed.positions[i*3+k]+(second?column[k]*(1-w)+(k===0?right*w:0):0));}
        colors.push(...closed.colors);for(const i of closed.indices)indices.push(start+i);end(part);smoothNormals.push({start,normals:closed.normals});
      }
    }
    // Leads beyond the PCB edge follow the widened frame. Each cross-section is
    // weighted from its nearest centre-line point, so no ring is torn apart.
    const weigh=(positions,points,select)=>Float32Array.from({length:positions.length/3},(_,i)=>{
      let best=Infinity,near=points[0];
      for(const q of points){const d=(positions[i*3]-q[0])**2+(positions[i*3+1]-q[1])**2+(positions[i*3+2]-q[2])**2;if(d<best){best=d;near=q;}}
      const u=Math.max(0,Math.min(1,(Math.abs(near[0])-20)/8));return select(near)?u*u*(3-2*u):0;});
    for(const p of originals.filter(p=>p.kind==='frame-harness')){
      const servo=parts.indexOf(parts.find(q=>q.kind==='mounted-servo'&&q.sourceKind==='servo'&&q.pose==='rest'&&q.joint===p.joint));
      const clone=clonePart(p,x=>x,{id:'variant.ribbon.'+p.id,kind:'variant-ribbon',joint:p.joint,channel:p.channel,physical:true,wireColor:true,pivot:[0,0,0],skin:{part:servo,origin:[0,0,0]}});
      clone.skinWeights=weigh(positions.slice(clone.vertexStart*3,(clone.vertexStart+clone.vertexCount)*3),frameCables[`${p.joint}.${p.channel}`].points,()=>true);
    }
    // Geometry-free transform carriers for skinned battery leads (one per side).
    for(const side of [-1,1]){const helper=begin({id:'variant.shift.'+side,kind:'variant-shift',side,pivot:[0,0,0]});end(helper);helper.bounds=[[0,0,0],[0,0,0]];}
    const helpers=Object.fromEntries([-1,1].map(side=>[side,parts.findIndex(p=>p.id==='variant.shift.'+side)]));
    for(const a of frameBatteryAnimations){
      const g=a.sweeps[3],route=a.routes[3].points,side=Math.sign(route.reduce((m,q)=>Math.abs(q[0])>Math.abs(m[0])?q:m)[0])||-1;
      const start=positions.length/3,part=begin({id:'variant.battery-wire.'+a.id,kind:'variant-battery-wire',physical:true,wireColor:true,pivot:[0,0,0],skin:{part:helpers[side],origin:[0,0,0]}});
      positions.push(...g.positions);colors.push(...g.colors);for(const i of g.indices)indices.push(start+i);end(part);smoothNormals.push({start,normals:g.normals});
      part.skinWeights=weigh(g.positions,route,q=>Math.sign(q[0])===side);
    }
    const legs=legsData?await appendLegs({originals,weigh,find,centre}):null;
    return {plane:v.stretch_plane_y_mm,half:v.widen_mm/2,eye1:left,eye2:right,prompt:v.prompt,electronics:v.electronics,legs};
  }
  // Second prompt: the two-eye kit lengthened with a middle leg station (real
  // CAD), two more legs copied from the front pair and leads on hub CH8–11.
  async function appendLegs({originals,weigh,find,centre}){
    const m=legsData.assembly.variant.middle_legs,half=variantData.assembly.variant.widen_mm/2,L=m.lengthen_mm;
    const body=-m.body_plane_x_mm,head=-m.head_plane_x_mm,mid=[0,-m.bay_shift_mm,0];
    for(const [name,record] of Object.entries(legsData.geometry)){
      const buffer=await loadAsset(record.stl),data=new DataView(buffer),triangles=data.getUint32(80,true);
      if(buffer.byteLength!==84+triangles*50)throw Error('Invalid variant STL '+name);
      const place=p=>framePoint(p,frameData.assembly),part=begin({id:`legs.${name}`,kind:'legs-'+name,pivot:[0,0,0]});
      for(let i=0;i<triangles;i++)for(let j=0;j<3;j++){
        const at=84+i*50+12+j*12;indices.push(positions.length/3);positions.push(...place([0,1,2].map(k=>data.getFloat32(at+k*4,true))));colors.push(...PRINTED_PLASTIC_RGB);
      }
      for(let i=0;i<record.edges.length;i+=3)edges.push(...place(record.edges.slice(i,i+3)));
      end(part);
    }
    // Hub channel pins: CH0–7 are silkscreen-verified anchors; CH8–11 are the
    // next four columns along the same header row (board order, not read glyphs).
    const pin=id=>centre(find(id)),p0=pin(anchors.channels[0].pins[1].part),p7=pin(anchors.channels[7].pins[1].part);
    const row=p7.map((x,k)=>x-p0[k]),unit=row.map(x=>x/Math.hypot(...row));
    const used=new Set(anchors.channels.flatMap(c=>[c.part,...c.also].map(x=>+x.split('Feature')[1])));
    const extra=[];for(let n=115;n<147;n++){const id=`cad.Part__Feature${n}.pin.1`;if(!used.has(n)&&find(id)){const q=pin(id),t=q.reduce((sum,x,k)=>sum+(x-p7[k])*unit[k],0);if(t>.5)extra.push({n,t,q});}}
    extra.sort((a,b)=>a.t-b.t);const unique=[];for(const e of extra)if(!unique.some(u=>Math.abs(u.t-e.t)<.5))unique.push(e);
    if(unique.length<4)throw Error('Servo hub channels 8–11 not found');
    const hub=unique.slice(0,4),pins=hub.flatMap(({n})=>[0,1,2].map(r=>`cad.Part__Feature${n}.pin.${r}`));
    const channelPoint=c=>pin(anchors.channels[c].pins[1].part),mapping={L1:'L5',L3:'L6',R1:'R5',R3:'R6'};
    const helper=(id,info)=>{const h=begin({id,kind:'legs-shift',pivot:[0,0,0],...info});end(h);h.bounds=[[0,0,0],[0,0,0]];return parts.indexOf(h);};
    const lengthWeights=(pos,points)=>Float32Array.from({length:pos.length/3},(_,i)=>{
      let best=Infinity,near=points[0];
      for(const q of points){const d=(pos[i*3]-q[0])**2+(pos[i*3+1]-q[1])**2+(pos[i*3+2]-q[2])**2;if(d<best){best=d;near=q;}}
      const sx=Math.max(0,Math.min(1,(Math.abs(near[0])-20)/8)),sy=Math.max(0,Math.min(1,(body-near[1])/2));
      return sx*sx*(3-2*sx)*sy*sy*(3-2*sy);});
    // Existing leads with the two-eye widening baked in, then skinned to a
    // helper carrying the lengthening for everything ahead of the cut.
    for(const p of originals.filter(p=>p.kind==='frame-harness')){
      const points=frameCables[`${p.joint}.${p.channel}`].points,src=positions.slice(p.vertexStart*3,(p.vertexStart+p.vertexCount)*3);
      const wide=weigh(src,points,()=>true),baked=Array.from(src,(x,i)=>i%3===0?x+Math.sign(x)*half*wide[Math.floor(i/3)]:x);
      const index=helper('legs.shift.'+p.id,{joint:p.joint,sourceJoint:p.joint});
      const start=positions.length/3,part=begin({id:'legs.ribbon.'+p.id,kind:'legs-ribbon',joint:p.joint,channel:p.channel,physical:true,wireColor:true,pivot:[0,0,0],skin:{part:index,origin:[0,0,0]}});
      positions.push(...baked);colors.push(...colors.slice(p.vertexStart*3,(p.vertexStart+p.vertexCount)*3));
      for(let i=p.indexStart;i<p.indexStart+p.indexCount;i++)indices.push(start+indices[i]-p.vertexStart);end(part);
      part.skinWeights=lengthWeights(baked,points.map(q=>[q[0]+Math.sign(q[0])*half,q[1],q[2]]));
      const target=mapping[p.joint];
      if(target){
        // New lead for the middle leg: hub end on its new channel, servo end
        // at the middle station; each cross-section weighted as above.
        const channel=8+Object.keys(mapping).indexOf(p.joint),hubDelta=hub[channel-8].q.map((x,k)=>x-channelPoint(p.channel)[k]);
        const s2=positions.length/3,fresh=begin({id:`legs.new-ribbon.${target}`,kind:'legs-new-ribbon',joint:target,sourceJoint:p.joint,channel,physical:true,wireColor:true,pivot:[0,0,0]});
        for(let i=0;i<baked.length/3;i++){const w=wide[i];for(let k=0;k<3;k++)positions.push(baked[i*3+k]+w*mid[k]+(1-w)*hubDelta[k]);}
        colors.push(...colors.slice(p.vertexStart*3,(p.vertexStart+p.vertexCount)*3));
        for(let i=p.indexStart;i<p.indexStart+p.indexCount;i++)indices.push(s2+indices[i]-p.vertexStart);end(fresh);
        const plug=find(`plug.${p.joint}.${p.channel}`);
        if(plug)clonePart(plug,x=>x.map((v,k)=>v+hubDelta[k]),{id:`legs.plug.${target}`,kind:'legs-plug',joint:target,sourceJoint:p.joint,channel,pivot:[0,0,0]});
      }
    }
    for(const p of originals.filter(p=>p.kind.startsWith('mounted-')&&p.kind!=='mounted-harness'&&p.pose==='rest'&&mapping[p.joint])){
      const side=p.joint.startsWith('L')?1:-1;
      const clone=clonePart(p,x=>[x[0]+side*half,x[1]+mid[1],x[2]],{id:`legs.leg.${mapping[p.joint]}.${p.id}`,kind:'legs-leg',joint:mapping[p.joint],sourceJoint:p.joint,sourceKind:p.kind,sourceServoKind:p.sourceKind,pose:'rest',pivot:[0,0,0]});
      // The foot servo and foot turn together about the foot shaft to lift the new leg.
      const joint=mountedStates.rest.joints[p.joint];
      if(joint.role==='foot'&&(p.kind==='mounted-lower'||p.kind==='mounted-servo'&&!['horn','hole'].includes(p.sourceKind)))
        clone.raise={side:side>0?'L':'R',pivot:joint.pivot.map((x,k)=>x+[side*half,mid[1],0][k]),axis:joint.shaftAxis};
    }
    for(const p of parts.filter(p=>p.raise)){
      // Turn the way that lifts the foot's centre.
      const foot=parts.find(q=>q.raise&&q.kind==='legs-leg'&&q.sourceKind==='mounted-lower'&&q.raise.side===p.raise.side);
      const v=foot.bounds[0].map((x,k)=>(x+foot.bounds[1][k])/2-p.raise.pivot[k]),a=p.raise.axis;
      p.raise.sign=Math.sign(a[0]*v[1]-a[1]*v[0])||1;
    }
    // New foot leads follow their servo near its end, so lifting never detaches them.
    for(const lead of parts.filter(p=>p.kind==='legs-new-ribbon'&&/^[LR]6$/.test(p.joint))){
      const servo=parts.find(q=>q.kind==='legs-leg'&&q.joint===lead.joint&&q.sourceKind==='mounted-servo'&&q.sourceServoKind==='servo');
      const seat=frameMountOffset(servo.sourceJoint,joints,frameData.assembly,1),c=servo.bounds[0].map((x,k)=>(x+servo.bounds[1][k])/2+seat[k]);
      const pos=positions.slice(lead.vertexStart*3,(lead.vertexStart+lead.vertexCount)*3);
      lead.skin={part:parts.indexOf(servo),origin:[0,0,0],relative:true};
      lead.skinWeights=Float32Array.from({length:lead.vertexCount},(_,i)=>{const u=Math.max(0,Math.min(1,(45-Math.hypot(pos[i*3]-c[0],pos[i*3+1]-c[1],pos[i*3+2]-c[2]))/25));return u*u*(3-2*u);});
    }
    for(const a of frameBatteryAnimations){
      const g=a.sweeps[3],route=a.routes[3].points,side=Math.sign(route.reduce((m,q)=>Math.abs(q[0])>Math.abs(m[0])?q:m)[0])||-1;
      const wide=weigh(g.positions,route,q=>Math.sign(q[0])===side),baked=Array.from(g.positions,(x,i)=>i%3===0?x+side*half*wide[Math.floor(i/3)]:x);
      const index=helper('legs.shift.battery.'+a.id,{batteryLead:true});
      const start=positions.length/3,part=begin({id:'legs.battery-wire.'+a.id,kind:'legs-battery-wire',physical:true,wireColor:true,pivot:[0,0,0],skin:{part:index,origin:[0,0,0]}});
      positions.push(...baked);colors.push(...g.colors);for(const i of g.indices)indices.push(start+i);end(part);smoothNormals.push({start,normals:g.normals});
      part.skinWeights=lengthWeights(baked,route.map(q=>[q[0]+side*half,q[1],q[2]]));
    }
    return {body,head,length:L,pins,prompt:legsData.assembly.variant.prompt};
  }
  const simulationRig=frameData?appendShowcaseRig({parts,positions,colors,indices,edges,begin,end,joints,mountedStates,assembly:frameData.assembly,wires:showcaseWires}):null;
  const normals=new Float32Array(positions.length);
  // A small support envelope from actual print vertices keeps the visual robot
  // grounded while rising and posing. This is not a balance/contact simulation.
  for(const part of parts.filter(p=>p.kind==='mounted-lower'&&p.pose==='rest')){
    const points=[];
    for(let i=part.vertexStart;i<part.vertexStart+part.vertexCount;i++)points.push(positions.slice(i*3,i*3+3));
    const selected=new Map();
    for(const x of [-1,0,1])for(const y of [-1,0,1])for(const z of [-1,0,1]){
      if(!(x||y||z))continue;
      let best=points[0],score=Infinity;
      for(const p of points){const s=p[0]*x+p[1]*y+p[2]*z;if(s<score){score=s;best=p;}}
      selected.set(best.join(','),best);
    }
    supportPoints[part.joint]=[...selected.values()];
  }
  const sharedNormalRanges=new Map(parts.filter(p=>p.sharedVertices).map(p=>[p.indexStart,p.indexCount]));
  for(let i=0;i<indices.length;i+=3) {
    const shared=sharedNormalRanges.get(i);if(shared){i+=shared-3;continue;}
    const abc=indices.slice(i,i+3).map(k=>k*3),[a,b,c]=abc.map(k=>positions.slice(k,k+3));
    const n=cross(sub(b,a),sub(c,a));
    for(const k of abc) for(let j=0;j<3;j++) normals[k+j]+=n[j];
  }
  for(let i=0;i<normals.length;i+=3) normals.set(normalize(Array.from(normals.subarray(i,i+3))),i);
  for(const animation of cableAnimations)normals.set(animation.sweeps[0].normals,animation.start*3);
  for(const smooth of smoothNormals)normals.set(smooth.normals,smooth.start*3);
  const deformations=[];
  const register=(animation,description)=>{animation.gpuIndex=deformations.length;deformations.push({...description,start:animation.start,count:animation.count});};
  for(const a of cableAnimations)register(a,{kind:'morph',sweeps:a.sweeps});
  for(const a of mountedAnimations)register(a,a.feedSweeps?{kind:'morph',sweeps:a.feedSweeps}:{kind:'mounted',points:a.points,otherPoints:a.feedPoints,options:a.options});
  for(const a of batteryAnimations)register(a,{kind:'battery',points:a.parked,otherPoints:a.connected,options:a.options,ribbon:false,origin:cableData.layout.poses.batteryPlug.target});
  for(const a of stagingAnimations)register(a,{kind:'mounted',points:a.points,otherPoints:a.otherPoints,options:a.options});
  for(const a of standingAnimations)register(a,{kind:'standing',points:a.points,otherPoints:a.otherPoints,options:a.options});
  for(const a of headAnimations)register(a,{kind:'morph',sweeps:a.sweeps});
  for(const a of frameBatteryAnimations)register(a,{kind:'morph',sweeps:a.sweeps,rootWeights:a.rootWeights});
  const decorative=new Uint8Array(positions.length/3);
  for(const p of parts.filter(p=>p.kind==='sim-wire')){normals.set(p.wireNormals,p.vertexStart*3);if(p.skin)decorative.set(p.wireWeights.map(w=>Math.round(w*255)),p.vertexStart);}
  for(const p of parts.filter(p=>p.skinWeights))decorative.set(Array.from(p.skinWeights,w=>Math.round(w*255)),p.vertexStart);
  return {heroVariant,joints,parts,anchors,connections,cableAnimations,batteryAnimations,mountedAnimations,stagingAnimations,standingAnimations,footStages,cableData,mountedStates,frameData,frameCables,headConnections,headAnimations,frameAnimations,frameBatteryAnimations,supportPoints,simulationRig,mesh:{positions:new Float32Array(positions),normals,colors:new Uint8Array(colors),indices:new Uint32Array(indices),edges:new Float32Array(edges),decorative,parts,deformations}};
}

/** Parent owns translated labels, persistent simulation warning, command limits,
 * keyboard-accessible joint controls and all animation timing. onStatus receives
 * {status:'ready',backend}; snapshot().joints supplies CSS-pixel label anchors.
 * onFrame(snapshot) runs after each render, including the initial render before
 * this promise resolves. Use its argument for initial labels. connectedIds:null
 * keeps the offline mapped-wire overview; [] disconnects all without erasing maps.
 * Caller supplies all assembly progress (0..1), horn visibility and illustrative
 * statuses. Per-joint hornAttachById / connectionProgressById override globals;
 * {} or null clears those overrides. There are no playback timers in this module.
 * No device access and no target-channel fallback occurs anywhere in this module.
 */
export async function createServoScene(canvas,{onSelect,onStatus,onFrame,prefer='webgpu',assembly,mode='robot',groupForPart,showcaseSeed=1}={}) {
  const instance=++constructionSerial;
  const {heroVariant,mesh,parts,joints,anchors,connections,cableAnimations,batteryAnimations,mountedAnimations,stagingAnimations,standingAnimations,footStages,cableData,mountedStates,frameData,frameCables,headConnections,headAnimations,frameAnimations,frameBatteryAnimations,supportPoints,simulationRig}=await buildMesh(assembly,mode,groupForPart);prepareHeroParts(parts);
  const sceneIds=Object.keys(joints);
  if(simulationRig&&new URLSearchParams(location.search).get('physics')!=='mujoco')mesh.rigidPhysics={rig:simulationRig,showcase:await loadAsset('showcase.json'),floorHulls:await loadAsset('showcase-floor-hulls.json'),seed:showcaseSeed};
  const renderer=await createRenderer(canvas,mesh,{prefer});
  let inspectShowcase=new URLSearchParams(location.search).get('inside')==='1';
  let physics;
  const simulationParts=parts.map((p,i)=>({p,i})).filter(({p})=>p.kind.startsWith('sim-'));
  const simulationPoses=parts.map(()=>({visible:false}));
  let state={selectedId:null,angles:{},expectedAngles:{},channels:Object.fromEntries(IDS.map(id=>[id,null])),connectedIds:null,activeIds:[],power:'off',neutralDeg:90,view:'all',
    servosVisible:mode!=='clock',clockJumperVisible:false,clockProgress:1,zeroGuideId:null,
    hornsVisible:true,hornAttach:1,hornAttachById:{},connectionProgress:1,connectionProgressById:{},usbProgress:1,batteryProgress:0,statuses:{},
    assemblyStage:0,upperProgress:1,lowerProgress:1,footAssemblyProgress:0,footGapOpening:0,ribbonFold:0,lowerPartsVisible:true,standingReference:false,standingProgress:0,frameMountProgress:0,spacersVisible:false,spacerProgress:0,pcbVisible:true,pcbProgress:1,routeView:false,coverVisible:false,coverProgress:0,headVisible:false,headProgress:0,headOnly:false,lidVisible:false,lidProgress:0,frameBatteryVisible:false,batteryInsertProgress:0,batteryConnectProgress:0,guideStep:mode==='clock'?29:30,guideSubstep:0};
  let destroyed=false, raf=0, viewProj, drag=null, lastFrame,renderEnabled=true,hoveredGroup=null,cameraTween=null,manualCamera=false;
  let appearance={style:0,accent:[.93,.36,.12],ink:[.12,.13,.16],lineSurface:[.96,.96,.95],lightTint:[1,1,1]};
  const camera={yaw:-Math.PI/2,pitch:1.04,dist:420,pan:[0,0,0]};
  const oldTouchAction=canvas.style.touchAction;
  canvas.style.touchAction='none';
  const ownedTabIndex=!canvas.hasAttribute('tabindex');
  if(ownedTabIndex) canvas.tabIndex=0;
  const events=new AbortController();
  const listen=(name,fn,options={})=>canvas.addEventListener(name,fn,{...options,signal:events.signal});
  const schedule=()=>{if(!destroyed&&renderEnabled&&!raf) raf=requestAnimationFrame(draw);};
  const connectedChannel=id=>state.connectedIds===null||state.connectedIds.includes(id)?state.channels[id]:null;
  const hubPins=new Set(anchors.channels.flatMap(c=>c.pins.flatMap(p=>[p.part,...p.also])));
  const hornLift=id=>18*(1-(state.hornAttachById[id]??state.hornAttach));
  const connectionProgress=id=>state.connectionProgressById[id]??state.connectionProgress;
  const cableLift=id=>12*(1-connectionProgress(id));
  const jointStatus=id=>state.statuses[id]??(state.activeIds.includes(id)||state.selectedId===id?'active':'idle');
  const batteryPose=()=>mode!=='clock'?batteryPlugPose(state.batteryProgress,cableData.layout.poses.batteryPlug.target,cableData.batteryConnectedPoint):null;
  let standingCache=null,standingCacheProgress=-1,wasStanding=false;
  function standingState(){
    const key=state.showcase?JSON.stringify(state.angles):state.standingProgress;
    if(standingCacheProgress===key)return standingCache;
    const rest=mountedStates.rest,goal=mountedStates.stand,rigs={},posed={...rest.joints},mounts={};
    for(const pair of LEG_PAIRS){
      const rig=state.showcase?articulatedLegMotion(rest.mounts[pair.hip],goal.mounts[pair.hip],(state.angles[pair.hip]-90)/(STANDING_REFERENCE[pair.hip]-90),(state.angles[pair.foot]-90)/(STANDING_REFERENCE[pair.foot]-90)):standingLegMotion(rest.mounts[pair.hip],goal.mounts[pair.hip],state.standingProgress);rigs[pair.hip]=rig;
      mounts[pair.hip]={...rest.mounts[pair.hip],...rig};const j=rest.joints[pair.foot];
      posed[pair.foot]={...j,pivot:rig.foot,bodyCenter:rig.bodyPoint(j.bodyCenter),factoryExit:rig.bodyPoint(j.factoryExit),factoryDirection:rig.bodyVector(j.factoryDirection),factorySide:rig.bodyVector(j.factorySide),shaftAxis:rig.shaftAxis};
    }
    standingCacheProgress=key;standingCache={rigs,joints:posed,mounts,cables:rest.cables};return standingCache;
  }
  const mounted=()=>state.assemblyStage?(state.standingReference?standingState():mountedStates.rest):null;
  const standingRig=id=>standingState().rigs[LEG_PAIRS.find(p=>p.hip===id||p.foot===id).hip];
  function standingPartPose(part){
    if(!state.standingReference||!part.kind.startsWith('mounted-')||part.kind==='mounted-harness')return null;
    if(part.kind==='mounted-servo'&&joints[part.joint].role==='hip'&&part.sourceKind==='servo')return null;
    const rig=standingRig(part.joint),body=part.kind==='mounted-lower'||(part.kind==='mounted-servo'&&joints[part.joint].role==='foot'&&!['horn','hole'].includes(part.sourceKind));
    const pose=body?rig.bodyTransform:rig.hipTransform;
    return state.assemblyStage>=3?{...pose,offset:pose.offset.map((v,i)=>v+frameOffset(part.joint)[i])}:pose;
  }
  const stagedFoot=id=>!!footStages[id]&&state.assemblyStage>0&&state.assemblyStage<3&&!state.standingReference;
  const stagedCable=()=>state.assemblyStage===1||(state.guideStep===33&&state.guideSubstep===0);
  const footPose=id=>footStages[id].pose(state.footAssemblyProgress);
  const frameOffset=id=>state.assemblyStage>=3?frameMountOffset(id,joints,frameData.assembly,state.frameMountProgress):[0,0,0];
  function showcaseLift(){
    if(!state.showcase)return 0;
    let rest=Infinity,posed=Infinity;
    for(const [id,points] of Object.entries(supportPoints)){
      const rig=standingRig(id),d=frameOffset(id);
      for(const p of points){rest=Math.min(rest,p[2]+d[2]);posed=Math.min(posed,rig.bodyPoint(p)[2]+d[2]);}
    }
    return rest-posed;
  }
  function frameStandingPoints(a){
    const rig=standingRig(a.joint),d=frameOffset(a.joint),actual=rig.bodyPoint(a.points[0].map((v,i)=>v-d[i])).map((v,i)=>v+d[i]);
    const delta=actual.map((v,i)=>v-a.points[0][i]);
    return a.points.map((p,i)=>{const u=Math.min(1,i/(a.points.length-1)/.25),w=1-u*u*(3-2*u);return p.map((v,k)=>v+delta[k]*w);});
  }
  function displayedFrameCable(id,channel){
    const a=state.showcase&&frameAnimations.find(a=>a.joint===id&&a.channel===channel);
    const points=a?frameStandingPoints(a):frameCables[`${id}.${channel}`].points,lift=showcaseLift();
    return state.showcase?points.map(p=>[p[0],p[1],p[2]+lift]):points;
  }
  const displayedJoints=()=>{
    const source=mounted()?.joints||joints;
    if(state.assemblyStage>=3){const lift=showcaseLift();return Object.fromEntries(Object.entries(source).map(([id,j])=>{const d=frameOffset(id).map((v,i)=>v+(i===2?lift:0));return [id,{...j,pivot:j.pivot.map((v,i)=>v+d[i]),factoryExit:j.factoryExit.map((v,i)=>v+d[i]),bodyCenter:j.bodyCenter.map((v,i)=>v+d[i])}];}));}
    return Object.fromEntries(Object.entries(source).map(([id,j])=>{if(!stagedFoot(id))return [id,j];const p=footPose(id),base=joints[id];return [id,{...base,pivot:p.pivot,bodyCenter:p.point(base.bodyCenter),factoryExit:p.point(base.factoryExit),shaftAxis:p.vector([0,0,1]),factorySide:p.vector(base.factorySide)}];}));
  };
  function stagingCableState(a){
    const progress=state.footAssemblyProgress,pose=footPose(a.joint),actual=pose.point(joints[a.joint].factoryExit);
    const root=actual.map((v,i)=>v-(a.points[0][i]+progress*(a.otherPoints[0][i]-a.points[0][i])));
    return {progress,root,twist:-pose.rotation,options:{...a.options,startSide:rotateVector(a.options.startSide,a.options.startTangent,-pose.rotation)}};
  }
  function stagingCablePoints(a){const {progress,root}=stagingCableState(a);return a.points.map((p,i)=>{const u=i/(a.points.length-1),w=1-u*u*(3-2*u);return p.map((v,k)=>v+progress*(a.otherPoints[i][k]-v)+root[k]*w);});}
  function standingCableState(a){
    const progress=state.standingProgress,rig=standingRig(a.joint),actual=rig.bodyPoint(a.points[0]);
    return {progress,quaternion:rig.bodyQuaternion,root:actual.map((v,i)=>v-(a.points[0][i]+progress*(a.otherPoints[0][i]-a.points[0][i]))),
      options:{...a.options,startTangent:rig.bodyVector(a.options.startTangent),startSide:rig.bodyVector(a.options.startSide)}};
  }
  function standingCablePoints(a){const s=standingCableState(a);return a.points.map((p,i)=>{const u=i/(a.points.length-1),w=1-u*u*(3-2*u);return p.map((v,k)=>v+s.progress*(a.otherPoints[i][k]-v)+s.root[k]*w);});}
  const carryCable=(data,id)=>{const points=Array.isArray(data)?data:data.seated,feed=state.ribbonFold,root=frameOffset(id);return points.map((p,i)=>{const u=i/(points.length-1),lift=state.assemblyStage&&joints[id].role==='foot'?18*(1-state.upperProgress):0;return p.map((v,k)=>v+(data.feed?feed*(data.feed[i][k]-v):0)+((k===2?lift:0)+root[k])*(1-u*u*(3-2*u)));});};
  const baseTarget=()=>state.hero?[0,0,60]:state.showcase&&physics?(physics.gpu?[0,0,60]:[physics.frame.poses[0]*1000,physics.frame.poses[1]*1000,physics.frame.poses[2]*1000+10]):state.view==='single'?[...displayedJoints()[state.selectedId??sceneIds[0]].pivot.slice(0,2),17]:state.headVisible?[0,0,25]:state.servosVisible?[0,15,10]:[0,0,16];
  const cameraFactor=()=>{const aspect=Math.max(1,canvas.clientWidth)/Math.max(1,canvas.clientHeight),single=state.view==='single';const baseline=state.headOnly?280:single?110:state.servosVisible?(state.assemblyStage?470:400):180,extent=state.headOnly?60:single?23:state.servosVisible?(state.assemblyStage?165:130):50;return Math.max(1,(extent/(Math.tan(FOV/2)*aspect)+(single||state.headOnly?25:80))/baseline);};
  const cameraView=()=>({yaw:camera.yaw,pitch:camera.pitch,dist:camera.dist*cameraFactor(),target:baseTarget().map((v,i)=>v+camera.pan[i]),manual:manualCamera});
  function setCameraView(view){camera.yaw=view.yaw;camera.pitch=view.pitch;camera.roll=view.roll??0;camera.dist=view.dist/cameraFactor();camera.pan=view.target.map((v,i)=>v-baseTarget()[i]);if(typeof view.manual==='boolean')manualCamera=view.manual;schedule();}
  function moveCamera(goal,animate=true){
    hoveredGroup=null;
    if(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const from=cameraView();let yaw=goal.yaw;while(yaw-from.yaw>Math.PI)yaw-=Math.PI*2;while(yaw-from.yaw< -Math.PI)yaw+=Math.PI*2;cameraTween={from,goal:{...goal,yaw},start:performance.now()};schedule();}
    else {cameraTween=null;setCameraView(goal);}
  }
  function projectedArrows(){
    const pairs=[],step=state.guideStep,sub=state.guideSubstep,shown=displayedJoints();
    const vertical=(point,lift=22)=>pairs.push({start:point.map((v,i)=>v+(i===2?lift:0)),end:point});
    if(step===29&&sub!==1)for(const end of [anchors.clock.output,anchors.clock.input]){const p=end.point;if(sub===0)vertical(p);else pairs.push({start:p,end:p.map((v,i)=>v+(i===2?22:0))});}
    if(step===30)for(const j of Object.values(shown))vertical(sub===0?j.bodyCenter:j.pivot);
    if(step===31&&(sub===0||sub===4)){const a=anchors.usb.point,b=a.map((v,i)=>v+anchors.usb.approach[i]*25);pairs.push(sub===0?{start:b,end:a}:{start:a,end:b});}
    if(step===31&&(sub===5||sub===7)){const a=cableData.batteryConnectedPoint,b=a.map((v,i)=>v+(i===2?24:0));pairs.push(sub===5?{start:b,end:a}:{start:a,end:b});}
    if(step===32&&sub===1)for(const m of Object.values(mounted()?.mounts||{}))vertical(m.hip);
    if(step===33&&sub===2)for(const pair of LEG_PAIRS){const m=mounted()?.mounts[pair.hip],p=shown[pair.foot]?.bodyCenter;if(m&&p)pairs.push({start:p.map((v,i)=>v+m.axis[i]*24),end:p});}
    if(step===33&&sub===1){const p=shown.L3?.factoryExit;if(p)pairs.push({start:p,end:p.map((v,i)=>v+(i===2?12:0))});}
    if(step===34&&sub===1)for(const pair of LEG_PAIRS){const d=frameMountOffset(pair.hip,joints,frameData.assembly,1);vertical(joints[pair.hip].pivot.map((v,i)=>v+d[i]));}
    if(step===34&&sub===2)for(const origin of frameData.assembly.parts['pcb-spacer'].assembly_origins_mm)vertical(framePoint(origin,frameData.assembly),22);
    if(step===34&&sub===3)vertical([0,0,0],35);
    if(step===34&&sub===4)vertical(framePoint(frameData.assembly.parameters.battery_mount.centre_mm,frameData.assembly),-30);
    if(step===34&&sub===5)for(const side of [-1,1]){const a=frameData.assembly,layout=a.channel_layout,x=side*((layout?.side_offset_mm??a.parameters.widening_mm/2)+22),y=-(layout?.midpoint_x_mm??.31923);pairs.push({start:[x,y,-12],end:[x,y,8]});}
    if(step===34&&sub===6)vertical([0,0,frameData.assembly.parts['bottom-cover'].bounds_mm[0][2]-frameData.assembly.pcb_seat_z_mm],-25);
    if(step===35&&sub===1)vertical([0,0,frameData.assembly.servo_flange_seat_z_mm-frameData.assembly.pcb_seat_z_mm],42);
    if(step===35&&[2,3].includes(sub))for(const c of headConnections.filter(c=>c.kind===(sub===2?'oled':'switch')))vertical(c.board,6);
    if(step===35&&sub===4){const a=frameData.assembly,b=a.parts['head-lid'].bounds_mm,c=framePoint([(b[0][0]+b[1][0])/2,(b[0][1]+b[1][1])/2,b[1][2]],a);pairs.push({start:[c[0],c[1]+55,c[2]+2],end:[c[0],c[1]+10,c[2]+2]});}
    return pairs.map(a=>{const start=project(a.start,viewProj,canvas.clientWidth,canvas.clientHeight),end=project(a.end,viewProj,canvas.clientWidth,canvas.clientHeight);return start.depth>0&&end.depth>0?{start:[start.x,start.y],end:[end.x,end.y]}:null;}).filter(Boolean);
  }
  function projectedAngleGuides(){
    if(state.guideStep<30||state.guideStep>=34||state.standingReference||!state.servosVisible||!viewProj)return [];
    const guides=[],shown=displayedJoints();
    for(const pair of LEG_PAIRS){
      for(const id of [pair.hip,pair.foot]){
        // Fixed references only: the physical horn is the moving indicator.
        const marks=angleMarks(id);
        for(const angle of marks){
        const foot=id===pair.foot,out=foot?(mounted()?.mounts[pair.hip].out||footStages[id].out):undefined;
        const hornReference=foot&&!state.standingReference&&state.assemblyStage<3;
        let direction=hornReference?footHornDirection(id,angle):angleDirection(id,angle,out);const origin=shown[id].pivot;
        if(hornReference&&state.assemblyStage)direction=footPose(id).vector(direction);
        const endpoint=origin.map((v,i)=>v+direction[i]*HORN_RAY_LENGTH_MM);
        const start=project(origin,viewProj,canvas.clientWidth,canvas.clientHeight),end=project(endpoint,viewProj,canvas.clientWidth,canvas.clientHeight);
        const other=project(shown[foot?pair.hip:pair.foot].pivot,viewProj,canvas.clientWidth,canvas.clientHeight),gap=start.y-other.y;
        const labelOffsetY=angle===90&&Math.abs(gap)<16?(Math.sign(gap)||(foot?1:-1))*8:0;
        if(start.depth>0&&end.depth>0)guides.push({id,angle,reference:hornReference?'horn':'leg',direction,labelOffsetY,start:[start.x,start.y],end:[end.x,end.y]});
        }
      }
    }
    return guides;
  }
  // One resolution across the hero handoff: resizing reallocates the canvas.
  const showcasePixelRatio=()=>canvas.clientWidth<700?1.25:2;
  function drawSimulation(){
    const frame=physics.frame,transforms=simulationRig.names.map((_,i)=>{
      if(physics.gpu)return {offset:[0,0,0],rotation:0,rotationAxis:[0,0,1]};
      const at=i*7,q=Array.from(frame.poses.slice(at+3,at+7)),length=Math.hypot(...q.slice(1));
      // Like the GPU solver, the landing keeps the torso centred in plan.
      const centre=state.hero?[frame.poses[0],frame.poses[1],0]:[0,0,0];
      return {offset:Array.from(frame.poses.slice(at,at+3),(v,k)=>(v-centre[k])*1000),rotation:length<1e-10?0:2*Math.atan2(length,q[0]),rotationAxis:length<1e-10?[0,0,1]:q.slice(1).map(v=>v/length)};
    });
    for(const {p,i} of simulationParts){
      const pose=p.simulationBody<0?{offset:[0,0,0],rotation:0,rotationAxis:[0,0,1]}:transforms[p.simulationBody];
      simulationPoses[i]={...pose,visible:(p.kind!=='sim-face'||frame.playback.faceOn&&p.faceName===frame.playback.face)&&(!p.sourceJoint||connectedChannel(p.sourceJoint)===p.channel),
        edgeOnly:p.kind==='sim-casing'&&inspectShowcase,
        scale:1,pivot:[0,0,0],tint:p.kind==='sim-floor'?[.95,.95,.925,1]:[0,0,0,0],unlit:p.kind==='sim-floor',preserveColor:p.kind==='sim-face'||p.kind==='sim-screen'&&frame.playback.faceOn,edge:p.kind==='sim-floor'?[0,0,0,1]:[...appearance.ink,.45],bend:p.skin?[...p.skin.origin,-10000-p.skin.part]:[0,0,0,0]};
    }
    const target=baseTarget().map((v,i)=>v+camera.pan[i]),d=camera.dist*cameraFactor(),cp=Math.cos(camera.pitch);
    const eye=[target[0]+d*cp*Math.cos(camera.yaw),target[1]+d*cp*Math.sin(camera.yaw),target[2]+d*Math.sin(camera.pitch)];
    for(const {p,i} of simulationParts)if(p.kind==='sim-floor')simulationPoses[i].visible=!state.hero&&eye[2]>0;
    // Resolve the OLED's 0.04 mm surface layers even when zoomed out. A fixed
    // 1 mm near plane wastes depth precision at the robot's viewing distance.
    viewProj=multiply(perspective(FOV,Math.max(1,canvas.clientWidth)/Math.max(1,canvas.clientHeight),Math.max(1,camera.dist*.02),4000,renderer.backend==='WebGPU'),lookAt(eye,target,[0,0,1]));
    lastFrame={viewProj,eye,parts:simulationPoses,gpuRigid:!!physics.gpu,maxPixelRatio:showcasePixelRatio(),light:[-.4,-.6,1],style:appearance.style,lineSurface:appearance.lineSurface,lightTint:appearance.lightTint,clear:[.965,.96,.95]};
    renderer.render(lastFrame);onFrame?.(snapshot(false));if(cameraTween||physics.gpu&&physics.pending)schedule();
  }
  function draw() {
    raf=0;if(destroyed||!renderEnabled)return;
    if(cameraTween){const tw=cameraTween,u=Math.min(1,(performance.now()-tw.start)/650),t=u*u*(3-2*u);setCameraView({yaw:tw.from.yaw+(tw.goal.yaw-tw.from.yaw)*t,pitch:tw.from.pitch+(tw.goal.pitch-tw.from.pitch)*t,dist:tw.from.dist+(tw.goal.dist-tw.from.dist)*t,target:tw.from.target.map((v,i)=>v+(tw.goal.target[i]-v)*t)});if(u===1)cameraTween=null;}
    if(state.showcase){if(physics)drawSimulation();return;}
    const battery=batteryPose(),installedBattery=frameData?batteryInsertionPose(frameData.assembly,state.batteryInsertProgress):null;
    if(wasStanding!==state.standingReference){for(const a of mountedAnimations)if(footStages[a.joint])a.lift=NaN;for(const a of standingAnimations)a.progress=NaN;wasStanding=state.standingReference;}
    if(state.standingReference)for(const a of standingAnimations){
      if(connectedChannel(a.joint)!==a.channel||a.progress===state.standingProgress)continue;
      const s=standingCableState(a),q=s.quaternion;
      if(renderer.deform)renderer.deform(a.gpuIndex,[s.progress,q[0],q[1],q[2]],[...s.root,q[3]]);
      else {const geometry=cableSweep(standingCablePoints(a),CONDUCTORS.map(c=>c.rgb),true,s.options);mesh.positions.set(geometry.positions,a.start*3);mesh.normals.set(geometry.normals,a.start*3);renderer.updateVertices(a.start,a.count);}
      a.progress=s.progress;
    }
    for(const a of stagingAnimations){
      if(!stagedCable()||connectedChannel(a.joint)!==a.channel||a.progress===state.footAssemblyProgress)continue;
      const s=stagingCableState(a);
      if(renderer.deform)renderer.deform(a.gpuIndex,[s.progress,0,s.twist,0],s.root);
      else {const geometry=cableSweep(stagingCablePoints(a),CONDUCTORS.map(c=>c.rgb),true,s.options);mesh.positions.set(geometry.positions,a.start*3);mesh.normals.set(geometry.normals,a.start*3);renderer.updateVertices(a.start,a.count);}
      a.progress=s.progress;
    }
    for(const animation of mountedAnimations){
      if(state.assemblyStage>=3)continue;
      if(stagedCable()&&footStages[animation.joint])continue;
      if(state.standingReference&&footStages[animation.joint])continue;
      const foot=joints[animation.joint].role==='foot',lift=foot?18*(1-state.upperProgress):0;
      const feed=foot?state.ribbonFold:0,root=frameOffset(animation.joint);
      if(!state.assemblyStage||connectedChannel(animation.joint)!==animation.channel||(lift===animation.lift&&feed===animation.feed&&root.every((v,i)=>v===animation.root[i])))continue;
      if(renderer.deform){renderer.deform(animation.gpuIndex,animation.feedSweeps?[0,feed,0,0]:[feed,lift,0,0],root);animation.lift=lift;animation.feed=feed;animation.root=root;continue;}
      if(animation.feedSweeps){
        const [a,b]=animation.feedSweeps,offset=animation.start*3;
        for(let i=0;i<a.positions.length;i++){mesh.positions[offset+i]=a.positions[i]+feed*(b.positions[i]-a.positions[i]);mesh.normals[offset+i]=a.normals[i]+feed*(b.normals[i]-a.normals[i]);}
        renderer.updateVertices(animation.start,animation.count);animation.lift=lift;animation.feed=feed;animation.root=root;continue;
      }
      const geometry=cableSweep(carryCable({seated:animation.points,feed:animation.feedPoints},animation.joint),CONDUCTORS.map(c=>c.rgb),true,animation.options);
      mesh.positions.set(geometry.positions,animation.start*3);mesh.normals.set(geometry.normals,animation.start*3);
      renderer.updateVertices(animation.start,animation.count);animation.lift=lift;animation.feed=feed;animation.root=root;
    }
    for(const animation of batteryAnimations){
      if(animation.progress===state.batteryProgress)continue;
      if(renderer.deform){renderer.deform(animation.gpuIndex,[state.batteryProgress,0,0,battery.rotation],battery.point);animation.progress=state.batteryProgress;continue;}
      const points=batteryLeadPoints(animation.parked,animation.connected,battery,cableData.layout.poses.batteryPlug.target);
      const geometry=cableSweep(points,[animation.color],false,animation.options);
      mesh.positions.set(geometry.positions,animation.start*3);mesh.normals.set(geometry.normals,animation.start*3);
      renderer.updateVertices(animation.start,animation.count);animation.progress=state.batteryProgress;
    }
    for(const animation of cableAnimations){
      const clock=animation.key==='clock';
      if(clock?!state.clockJumperVisible:(!state.servosVisible||state.assemblyStage||connectedChannel(animation.part.joint)!==animation.part.channel))continue;
      const lift=clock?12*(1-state.clockProgress):cableLift(animation.part.joint);
      if(Math.abs(animation.lift-lift)<1e-6)continue;
      const {fraction}=posePair(animation.route,lift),index=lift<=6?0:1;
      if(renderer.deform){renderer.deform(animation.gpuIndex,[index,fraction,0,0]);animation.lift=lift;continue;}
      const a=animation.sweeps[index],b=animation.sweeps[index+1],offset=animation.start*3;
      for(let i=0;i<a.positions.length;i++){
        mesh.positions[offset+i]=a.positions[i]+fraction*(b.positions[i]-a.positions[i]);
        mesh.normals[offset+i]=a.normals[i]+fraction*(b.normals[i]-a.normals[i]);
      }
      renderer.updateVertices(animation.start,animation.count);animation.lift=lift;
    }
    for(const a of frameAnimations){
      if(state.showcase&&connectedChannel(a.joint)!==a.channel)continue;
      const key=state.showcase?JSON.stringify([state.angles,connectedChannel(a.joint)]):'rest';
      if(a.key===key)continue;
      let geometry=a.geometry;
      if(state.showcase){
        const rig=standingRig(a.joint),sideGuides=a.options.sideGuides.map((g,i)=>i?g:{...g,side:rig.bodyVector(g.side)});
        geometry=cableSweep(frameStandingPoints(a),CONDUCTORS.map(c=>c.rgb),true,{...a.options,startTangent:rig.bodyVector(a.options.startTangent),startSide:rig.bodyVector(a.options.startSide),sideGuides});
      }
      mesh.positions.set(geometry.positions,a.start*3);mesh.normals.set(geometry.normals,a.start*3);renderer.updateVertices(a.start,a.count);a.key=key;
    }
    for(const a of frameBatteryAnimations){
      const insert=state.batteryInsertProgress,plug=state.batteryConnectProgress,key=insert+':'+plug;if(a.key===key)continue;
      const index=insert<.9?0:insert<1?1:2,fraction=index===0?insert/.9:index===1?(insert-.9)/.1:plug;
      const actual=insertedBatteryPoint(remountBatteryPoint(a.lead.points[0],cableData.layout,frameData.assembly),frameData.assembly,insert);
      const correction=actual.map((v,k)=>v-(a.routes[index].start[k]+fraction*(a.routes[index+1].start[k]-a.routes[index].start[k])));
      if(renderer.deform)renderer.deform(a.gpuIndex,[index,fraction,0,0],correction);
      else{const first=a.sweeps[index],last=a.sweeps[index+1];for(let i=0;i<first.positions.length;i++){mesh.positions[a.start*3+i]=first.positions[i]+fraction*(last.positions[i]-first.positions[i])+correction[i%3]*a.rootWeights[Math.floor(i/3)];mesh.normals[a.start*3+i]=first.normals[i]+fraction*(last.normals[i]-first.normals[i]);}renderer.updateVertices(a.start,a.count);}
      a.key=key;
    }
    for(const a of headAnimations){
      const progress=state[`${a.kind}Progress`]??0;
      if(progress===a.progress)continue;
      if(renderer.deform)renderer.deform(a.gpuIndex,[0,progress,0,0]);
      else{
        const [open,closed]=a.sweeps,offset=a.start*3;
        for(let i=0;i<open.positions.length;i++){
          mesh.positions[offset+i]=open.positions[i]+progress*(closed.positions[i]-open.positions[i]);
          mesh.normals[offset+i]=open.normals[i]+progress*(closed.normals[i]-open.normals[i]);
        }
        renderer.updateVertices(a.start,a.count);
      }
      a.progress=progress;
    }
    // Preserve orbit/zoom while automatically fitting the layout's width when
    // the containing panel becomes narrow. camera.dist is the zoom baseline.
    const aspect=Math.max(1,canvas.clientWidth)/Math.max(1,canvas.clientHeight);
    const single=state.view==='single',focus=state.selectedId??IDS[0];
    const target=baseTarget().map((v,i)=>v+camera.pan[i]);
    const baseline=single?110:state.servosVisible?(state.assemblyStage?470:400):180,extent=single?23:state.servosVisible?(state.assemblyStage?165:130):50;
    const d=camera.dist*cameraFactor(),cp=Math.cos(camera.pitch);
    const eye=[target[0]+d*cp*Math.cos(camera.yaw),target[1]+d*cp*Math.sin(camera.yaw),target[2]+d*Math.sin(camera.pitch)];
    const roll=state.hero?(camera.roll??0):0;
    const up=[-Math.cos(camera.yaw)*Math.sin(camera.pitch)*Math.cos(roll)-Math.sin(camera.yaw)*Math.sin(roll),-Math.sin(camera.yaw)*Math.sin(camera.pitch)*Math.cos(roll)+Math.cos(camera.yaw)*Math.sin(roll),cp*Math.cos(roll)];
    // Full-height portrait heroes pull farther back than an instruction panel.
    // Keep the complete explosion inside the frustum at that distance too.
    viewProj=multiply(perspective(FOV,aspect,Math.max(1,camera.dist*.02),state.hero?Math.max(2500,d*4):2500,renderer.backend==='WebGPU'),lookAt(eye,target,up));
    const poses=parts.map(p=>{
      const horn=['horn','hole'].includes(p.kind),lead=['harness','plug'].includes(p.kind);
      const statusColor=p.kind==='servo'?STATUS_COLORS[jointStatus(p.joint)]:null;
      const emphasized=(state.guideStep===30&&(state.guideSubstep===0?p.kind==='servo':['horn','hole'].includes(p.kind)))||(state.guideStep===32&&p.kind==='mounted-upper')||(state.guideStep===33&&((state.guideSubstep===0&&p.kind==='servo'&&footStages[p.joint])||(state.guideSubstep===2&&p.kind==='mounted-lower')));
      const hover=hoveredGroup&&p.group===hoveredGroup,accent=appearance.accent;
      const preserveColor=preserveLineColour(p);
      const stagedBody=stagedFoot(p.joint)&&['servo','horn','hole'].includes(p.kind),pose=p.kind==='frame-battery'?installedBattery:stagedBody?{...footPose(p.joint),pivot:footStages[p.joint].pivot}:standingPartPose(p);
      const mountedPart=p.kind.startsWith('mounted-'),activePose='rest',frameStage=state.assemblyStage>=3;
      let inView=p.kind==='head-cover'?frameStage&&state.headVisible:p.kind==='head-lid'?frameStage&&state.lidVisible:p.kind==='internal-frame'?frameStage:p.kind==='pcb-spacer'?frameStage&&state.spacersVisible:p.kind==='bottom-cover'?frameStage&&state.coverVisible:mountedPart?!!state.assemblyStage&&p.pose===activePose&&(p.kind!=='mounted-lower'||state.assemblyStage>=2)&&(p.kind!=='mounted-harness'||connectedChannel(p.joint)===p.channel):
        state.assemblyStage&&['servo','horn','hole','grommet','harness'].includes(p.kind)?false:
        (!state.servosVisible&&p.joint)?false:single?(['servo','horn','hole'].includes(p.kind)&&p.joint===focus):
        p.kind==='layout'?state.servosVisible:
        p.kind==='zero-guide'?state.zeroGuideId===p.joint:['clock','clock-plug'].includes(p.kind)?state.clockJumperVisible:p.kind==='battery'?state.power==='battery':p.kind==='usb'?state.power==='usb':lead?connectedChannel(p.joint)===p.channel:true;
      if(p.kind==='staging-harness')inView=stagedCable()&&connectedChannel(p.joint)===p.channel;
      if(p.kind==='frame-harness')inView=frameStage&&state.pcbVisible&&state.pcbProgress===1&&connectedChannel(p.joint)===p.channel;
      if(p.kind==='route-guide')inView=state.routeView;
      if(stagedBody)inView=true;
      if(p.kind==='mounted-servo'&&stagedFoot(p.joint))inView=false;
      if(p.kind==='mounted-harness'&&footStages[p.joint]&&stagedCable())inView=false;
      if(p.kind==='mounted-lower'&&!state.lowerPartsVisible)inView=false;
      if(frameStage){
        if(mountedPart)inView&&=state.servosVisible&&p.kind!=='mounted-harness';
        else if(p.kind==='electronics'||p.kind==='plug')inView&&=state.pcbVisible;
        else if(!['internal-frame','bottom-cover','pcb-spacer','head-cover','head-lid','frame-harness','route-guide','head-peripheral','head-wire','face'].includes(p.kind))inView=false;
      }
      if(p.kind==='face')inView=state.showcase&&state.faceOn&&p.faceName===state.face;
      if(p.kind.startsWith('frame-battery'))inView=frameStage&&state.frameBatteryVisible;
      if(p.kind.startsWith('sim-'))inView=false;
      if(p.connection)inView=frameStage&&state.headVisible&&!!state[`${p.connection}Visible`];
      // Landing design-prompt parts only; last, so no guide rule can show them.
      if(p.kind.startsWith('variant-')||p.kind.startsWith('legs-'))inView=false;
      if(state.routeView&&p.kind==='electronics'&&p.id!=='servo_hub.body'&&!hubPins.has(p.id)&&!p.wireColor)inView=false;
      if(state.headOnly)inView=p.kind==='head-cover'&&state.headVisible;
      return {visible:inView&&(!horn||state.hornsVisible),
        edgeOnly:state.routeView&&['internal-frame','pcb-spacer','head-cover','head-lid','electronics','plug'].includes(p.kind),
        offset:p.kind==='frame-battery-plug'?[0,0,6*(1-state.batteryConnectProgress)]:p.kind==='head-peripheral'&&p.carrier?[0,0,6*(1-(state[`${p.connection}Progress`]??0))]:pose?pose.offset:frameStage&&p.kind==='head-lid'?lidSlideOffset(frameData.assembly,state.lidProgress):frameStage&&p.kind==='head-cover'?[0,0,42*(1-state.headProgress)]:frameStage&&p.kind==='pcb-spacer'?[0,0,22*(1-state.spacerProgress)]:frameStage&&p.kind==='bottom-cover'?[0,0,-35*(1-state.coverProgress)]:frameStage&&(p.kind==='electronics'||p.kind==='plug')?[0,0,35*(1-state.pcbProgress)]:frameStage&&mountedPart&&p.kind!=='mounted-harness'?frameOffset(p.joint):mountedPart&&p.carry?[0,0,18*(1-state.upperProgress)]:p.kind==='mounted-lower'?p.axis.map(v=>v*24*(1-state.lowerProgress)):horn?[0,0,hornLift(p.joint)]:p.kind==='battery-plug'?battery.point.map((v,i)=>v-p.pivot[i]):p.kind==='plug'?[0,0,cableLift(p.joint)]:p.kind==='usb'?anchors.usb.approach.map(v=>v*12*(1-state.usbProgress)):p.kind==='clock-plug'?[0,0,12*(1-state.clockProgress)]:[0,0,0],
        scale:1,pivot:pose?pose.pivot:p.pivot,rotation:pose?.rotation,rotationAxis:pose?.rotationAxis,rotationZ:horn?((state.angles[p.joint]??state.neutralDeg)-state.neutralDeg)*Math.PI/180:p.kind==='battery-plug'?battery.rotation:0,
        tint:p.id==='head.external.oled.screen'&&state.faceOn?[.005,.008,.012,1]:statusColor?[...statusColor,jointStatus(p.joint)==='active'?0.32:0.82]:preserveColor?[0,0,0,0]:hover?[...accent,.32]:emphasized?[...accent,.12]:[0,0,0,0],
        preserveColor,
        bend:p.kind==='mounted-lower'&&state.footGapOpening?[(p.joint.startsWith('L')?1:-1)*state.footGapOpening,...mountedStates.rest.joints[p.joint].pivot]:[0,0,0,0],
        edge:hover||emphasized?[...accent,.95]:statusColor?[...statusColor,1]:[...appearance.ink,['harness','clock'].includes(p.kind)?0:0.45]};
    });
    if(state.showcase){const lift=showcaseLift();for(const p of poses)p.offset[2]+=lift;}
    if(state.hero?.assembly){
      const v=heroVariant&&state.hero.variant,l=heroVariant?.legs&&state.hero.legs,lift=simulationRig.initialHeightM*1000;
      for(let i=0;i<parts.length;i++){
        const p=parts[i],pose=heroPartPose(p.heroProxy??p,state.hero.elapsed),extra=v?heroVariantPose(p,v,heroVariant):{};
        // Spread the explosion along the wide frame; connected skins follow
        // their owning parts. Fully seated parts retain their original pose.
        const sweep=.7*pose.offset[2]*(state.hero.wide??0);
        pose.offset[0]+=Math.sin(-Math.PI*.68)*sweep;
        pose.offset[1]-=Math.cos(-Math.PI*.68)*sweep;
        if(l){
          // The second prompt overrides visibility, colour and stretch; offsets add.
          const more=heroLegsPose(p,l,heroVariant.legs);
          if('visible' in more)extra.visible=more.visible;
          if(more.tint){extra.tint=more.tint;extra.edge=more.edge;}
          if(more.bend)extra.bend=more.bend;
          if('arrive' in more)extra.arrive=more.arrive;
          if(more.offset)extra.offset=(extra.offset??[0,0,0]).map((x,k)=>x+more.offset[k]);
        }
        if(p.kind.startsWith('variant-')||p.kind.startsWith('legs-')||p.kind==='face')poses[i].visible=!!extra.visible;
        else poses[i].visible&&=pose.visible&&extra.visible!==false;
        const arrive=extra.arrive?(p.kind==='variant-header2'?[0,0,28]:p.kind==='legs-leg'?[(p.joint.startsWith('L')?1:-1)*45,0,20]:p.kind.startsWith('legs-')?[0,0,30]:[-25,-30,45]).map(x=>x*extra.arrive):[0,0,0];
        // Copied legs keep their source's rest layout; seat them like the source leg.
        const seat=p.kind==='legs-leg'?frameOffset(p.sourceJoint):[0,0,0];
        poses[i].offset=poses[i].offset.map((x,k)=>x+pose.offset[k]+(k===2?lift:0)+(extra.offset?.[k]??0)+arrive[k]+seat[k]);
        if(extra.tint){poses[i].tint=extra.tint;poses[i].edge=extra.edge;}
        if(extra.bend)poses[i].bend=extra.bend;
        if(p.skin&&poses[i].visible)poses[i].bend=[...p.skin.origin,-10000-p.skin.part];
        if(p.raise&&l){poses[i].pivot=p.raise.pivot;poses[i].rotation=l.raise[p.raise.side]*.9*p.raise.sign;poses[i].rotationAxis=p.raise.axis;}
      }
      // Relative skins carry their partner's motion only, not its rest layout.
      for(let i=0;i<parts.length;i++){const s=parts[i].skin;if(s?.relative&&poses[i].visible)poses[i].bend=[...poses[s.part].offset.map((x,k)=>x-poses[i].offset[k]),-10000-s.part];}
    }
    lastFrame={viewProj,eye,parts:poses,maxPixelRatio:state.hero?showcasePixelRatio():2,light:[-0.4,-0.6,camera.pitch<0?-1:1],style:appearance.style,lineSurface:appearance.lineSurface,lightTint:appearance.lightTint,clear:[0.965,0.96,0.95]};
    if(state.hero&&Number.isFinite(state.hero.style))lastFrame.style=state.hero.style;
    renderer.render(lastFrame);
    onFrame?.(snapshot(false));
  }
  function fit(animate=true){manualCamera=false;const distance=(state.view==='single'?110:state.servosVisible?(state.assemblyStage?470:400):180)*cameraFactor();moveCamera({yaw:state.servosVisible?Math.PI/2:-Math.PI/2,pitch:state.servosVisible?1.15:1.04,dist:distance,target:baseTarget()},animate);}
  function focusPoint(point,distance=180,yaw=camera.yaw,pitch=camera.pitch){if(manualCamera)return;moveCamera({yaw,pitch,dist:distance,target:point});}
  function flip(){manualCamera=true;moveCamera({...cameraView(),pitch:-camera.pitch||-.8});}
  function pan(dx,dy){
    const unit=camera.dist*.7/Math.max(1,canvas.clientHeight),right=[-Math.sin(camera.yaw),Math.cos(camera.yaw),0];
    const up=[-Math.cos(camera.yaw)*Math.sin(camera.pitch),-Math.sin(camera.yaw)*Math.sin(camera.pitch),Math.cos(camera.pitch)];
    camera.pan=camera.pan.map((v,i)=>v+unit*(-dx*right[i]+dy*up[i]));
  }
  function zoom(factor,x=null,y=null){
    manualCamera=true;cameraTween=null;
    const before=camera.dist,next=Math.max(12,Math.min(1400,before*factor)),ratio=next/before;
    if(x!==null&&y!==null)pan((x-canvas.clientWidth/2)*(ratio-1),(y-canvas.clientHeight/2)*(ratio-1));
    camera.dist=next;schedule();
  }
  function setState(next={}) {
    if(destroyed)return;
    if(!!next.hero!==!!state.hero)physics?.setHistory?.(next.hero?next.hero.duration:0,{once:!!next.hero});
    state.hero=next.hero??null;
    state.showcase=!!next.showcase;state.faceOn=!!next.faceOn;state.face=next.face??null;
    if(state.showcase&&physics)physics.advance(next.simulationElapsed??0);else physics?.suspend();
    if('neutralDeg' in next&&Number.isFinite(next.neutralDeg))state.neutralDeg=next.neutralDeg;
    if('selectedId' in next)state.selectedId=IDS.includes(next.selectedId)?next.selectedId:null;
    if(next.angles)state.angles=Object.fromEntries(IDS.filter(id=>Number.isFinite(next.angles[id])).map(id=>[id,next.angles[id]]));
    if(next.expectedAngles)state.expectedAngles=Object.fromEntries(IDS.filter(id=>Number.isFinite(next.expectedAngles[id])).map(id=>[id,next.expectedAngles[id]]));
    if(next.channels)state.channels=Object.fromEntries(IDS.map(id=>[id,Number.isInteger(next.channels[id])&&next.channels[id]>=0&&next.channels[id]<=7?next.channels[id]:null]));
    if(next.connectedIds===null)state.connectedIds=null;
    else if(Array.isArray(next.connectedIds))state.connectedIds=IDS.filter(id=>next.connectedIds.includes(id));
    if(next.activeIds)state.activeIds=IDS.filter(id=>next.activeIds.includes(id));
    if(typeof next.hornsVisible==='boolean')state.hornsVisible=next.hornsVisible;
    if(typeof next.headOnly==='boolean'&&next.headOnly!==state.headOnly){const previous=cameraView();state.headOnly=next.headOnly;setCameraView(previous);}
    if(typeof next.servosVisible==='boolean'&&next.servosVisible!==state.servosVisible){const previous=cameraView();state.servosVisible=next.servosVisible;if(manualCamera)setCameraView(previous);else fit();}
    for(const key of ['pcbVisible','coverVisible','spacersVisible','headVisible','lidVisible','oledVisible','switchVisible','lowerPartsVisible','routeView','frameBatteryVisible'])state[key]=typeof next[key]==='boolean'?next[key]:['oledVisible','switchVisible'].includes(key)?false:state[key];
    if(Number.isInteger(next.assemblyStage)&&next.assemblyStage!==state.assemblyStage){
      const oldView=cameraView();state.assemblyStage=next.assemblyStage;setCameraView(oldView);
    }
    if(typeof next.standingReference==='boolean')state.standingReference=next.standingReference;
    for(const key of ['guideStep','guideSubstep'])if(Number.isInteger(next[key]))state[key]=next[key];
    if(typeof next.clockJumperVisible==='boolean')state.clockJumperVisible=next.clockJumperVisible;
    if('zeroGuideId' in next)state.zeroGuideId=IDS.includes(next.zeroGuideId)?next.zeroGuideId:null;
    if(Number.isFinite(next.clockProgress))state.clockProgress=clampProgress(next.clockProgress);
    if(Number.isFinite(next.footGapOpening))state.footGapOpening=Math.max(0,next.footGapOpening);
    for(const key of PROGRESS_KEYS)if(Number.isFinite(next[key]))state[key]=clampProgress(next[key]);
    for(const key of ['hornAttachById','connectionProgressById']) {
      if(next[key]===null)state[key]={};
      else if(next[key]&&typeof next[key]==='object')state[key]=Object.fromEntries(IDS.filter(id=>Number.isFinite(next[key][id])).map(id=>[id,clampProgress(next[key][id])]));
    }
    if(next.statuses===null)state.statuses={};
    else if(next.statuses&&typeof next.statuses==='object')state.statuses=Object.fromEntries(IDS.filter(id=>['success','incorrect','active','idle'].includes(next.statuses[id])).map(id=>[id,next.statuses[id]]));
    if(['usb','battery','off'].includes(next.power))state.power=next.power;
    if(['single','all'].includes(next.view)&&state.view!==next.view){state.view=next.view;fit();}
    schedule();
  }
  function snapshot(includeGeometry=true){
    if(state.showcase&&physics)return {backend:renderer.backend,mode,instance,destroyed,...structuredClone(state),inside:inspectShowcase,camera:{...camera},cameraView:cameraView(),cameraMoving:!!cameraTween,style:appearance.style,arrows:[],angleGuides:[],simulation:physics.snapshot(),visibleParts:simulationParts.filter(({i})=>simulationPoses[i].visible).map(({p})=>p.id),lineColourParts:simulationParts.filter(({i})=>simulationPoses[i].visible&&simulationPoses[i].preserveColor).map(({p})=>p.id),bodyLift:physics.gpu?null:physics.frame.poses[2]*1000};
    return {backend:renderer.backend,mode,instance,destroyed,...structuredClone(state),assumptions:{...ASSUMPTIONS},camera:{...camera},cameraView:cameraView(),cameraMoving:!!cameraTween,hoveredGroup,style:appearance.style,arrows:viewProj?projectedArrows():[],angleGuides:projectedAngleGuides(),
    bodyLift:showcaseLift(),
    lidOffset:frameData?lidSlideOffset(frameData.assembly,state.lidProgress):null,
    headConnections:includeGeometry?headConnections:headConnections.map(({id,kind,board,peripheral})=>({id,kind,board,peripheral})),
    assembly:mounted()?{stage:state.assemblyStage,pose:state.standingReference?(state.standingProgress===1?'stand':'standing-transition'):'rest',mounts:Object.fromEntries(Object.entries(mounted().mounts).map(([id,m])=>[id,{hip:m.hip,foot:m.foot,axis:m.axis,shaftAxis:m.shaftAxis,out:m.out,hornFixedTo:m.hornFixedTo,bodyCarriedBy:m.bodyCarriedBy}]))}:null,
    frameAssembly:state.assemblyStage>=3?{source:frameData.source,pcbSeatZ:frameData.assembly.pcb_seat_z_mm,flangeSeatZ:frameData.assembly.servo_flange_seat_z_mm,offsets:Object.fromEntries(sceneIds.map(id=>[id,frameOffset(id)]))}:null,
    frameBattery:frameData?{...batteryInsertionPose(frameData.assembly,state.batteryInsertProgress),entry:frameData.assembly.head_fit.battery_entry,leads:frameBatteryAnimations.map(a=>({id:a.id,start:insertedBatteryPoint(remountBatteryPoint(a.lead.points[0],cableData.layout,frameData.assembly),frameData.assembly,state.batteryInsertProgress),end:a.routes[3].end.map((v,k)=>v+(k===2?6*(1-state.batteryConnectProgress):0))}))}:null,
    battery:mode!=='clock'?{...batteryPose(),connected:state.batteryProgress===1,powered:state.power==='battery',target:cableData.batteryConnectedPoint,
      leads:includeGeometry?batteryAnimations.map(a=>({id:a.id,points:batteryLeadPoints(a.parked,a.connected,batteryPose(),cableData.layout.poses.batteryPlug.target)})):[]}:null,
    joints:Object.fromEntries(sceneIds.map(id=>[id,{...structuredClone(displayedJoints()[id]),visible:state.servosVisible&&(state.view==='all'||id===(state.selectedId??IDS[0])),status:jointStatus(id),hornsVisible:state.hornsVisible,
      expectedAngle:state.expectedAngles[id]??state.neutralDeg,
      hornPoint:displayedJoints()[id].pivot.map((v,i)=>v+(i===2?hornLift(id):0)),
      zeroScreen:viewProj&&state.zeroGuideId===id?project(joints[id].pivot.map((v,i)=>v+(i===1?(id.startsWith('L')?-25:25):0)),viewProj,canvas.clientWidth,canvas.clientHeight):null,
      rotationZ:((state.angles[id]??state.neutralDeg)-state.neutralDeg)*Math.PI/180,screen:viewProj?project(displayedJoints()[id].pivot,viewProj,canvas.clientWidth,canvas.clientHeight):null}])),
    visibleParts:lastFrame?parts.filter((_,i)=>lastFrame.parts[i].visible).map(p=>p.id):[],
    lineColourParts:includeGeometry&&lastFrame?parts.filter((_,i)=>lastFrame.parts[i].visible&&lastFrame.parts[i].preserveColor).map(p=>p.id):[],
    channelAnchors:anchors.channels.map(anchor=>({...structuredClone(anchor),screen:viewProj?project(anchor.point,viewProj,canvas.clientWidth,canvas.clientHeight):null})),
    clock:{visible:state.clockJumperVisible,progress:state.clockProgress,evidence:anchors.clock.evidence,
      cablePoints:includeGeometry&&cableData.routes.clock?cablePoints(cableData.routes.clock,12*(1-state.clockProgress)):[],socketTemplate:cableData.socketTemplate,
      endpoints:[anchors.clock.output,anchors.clock.input].map(p=>({...p,screen:viewProj?project(p.point,viewProj,canvas.clientWidth,canvas.clientHeight):null}))},
    layout:{visible:state.servosVisible&&state.view==='all',front:viewProj?project([0,-112,0],viewProj,canvas.clientWidth,canvas.clientHeight):null,
      landmarks:mode!=='clock'?Object.fromEntries(Object.entries({usb:anchors.usb.point,oled:cableData.layout.poses.oled.target,battery:cableData.layout.poses.battery.target,switch:cableData.layout.poses.switch.target}).map(([id,point])=>[id,{point,screen:viewProj?project(point,viewProj,canvas.clientWidth,canvas.clientHeight):null}])):{},
      legs:LEG_PAIRS.map(pair=>({...pair,screen:viewProj?project(pair.point,viewProj,canvas.clientWidth,canvas.clientHeight):null}))},
    connections:includeGeometry?sceneIds.map(id=>{
      const channel=connectedChannel(id),progress=channel===null?0:connectionProgress(id),lift=channel===null?0:cableLift(id);
      if(channel===null)return {joint:id,assignedChannel:null,connected:false,visible:false,conductors:[]};
      const connection=structuredClone(connections[`${id}.${channel}`]);
      if(!connection)throw Error(`No settled cable for illustrated mapping ${id}.${channel}`);
      return {...connection,assignedChannel:state.channels[id],progress,connected:channel!==null&&progress===1,visible:state.servosVisible&&state.view==='all',
        ribbon:true,socketTemplate:cableData.socketTemplate,routeLandmarks:state.assemblyStage>=3?frameCables[`${id}.${channel}`].landmarks:null,cablePoints:state.assemblyStage>=3?displayedFrameCable(id,channel):state.standingReference&&footStages[id]?standingCablePoints(standingAnimations.find(a=>a.joint===id&&a.channel===channel)):stagedCable()&&footStages[id]?stagingCablePoints(stagingAnimations.find(a=>a.joint===id&&a.channel===channel)):mounted()?carryCable(mounted().cables[`${id}.${channel}`],id):cablePoints(cableData.routes[`${id}.${channel}`],lift),
        conductors:connection.conductors.map(c=>({...c,currentSocketPoint:c.socketPoint.map((v,i)=>v+(i===2?lift+showcaseLift():0)),currentWireEnd:c.wireEnd.map((v,i)=>v+(i===2?lift+showcaseLift():0))}))};
    }):[],
    usb:{...structuredClone(anchors.usb),visible:state.power==='usb'&&state.view==='all',progress:state.usbProgress,
      matingPoint:anchors.usb.point.map((v,i)=>v+anchors.usb.approach[i]*12*(1-state.usbProgress)),
      currentBreakPoint:anchors.usb.breakPoint.map((v,i)=>v+anchors.usb.approach[i]*12*(1-state.usbProgress))},
    anchorEvidence:structuredClone(anchors.evidence)};}
  const touches=new Map();let pinch=null;
  function pickGroup(x,y){
    if(!lastFrame)return null;let best=null,depth=Infinity;
    parts.forEach((p,i)=>{
      const s=lastFrame.parts[i];if(!s.visible||!p.vertexCount||['layout','zero-guide','harness','mounted-harness','staging-harness','frame-harness','peripheral-cable','clock'].includes(p.kind))return;
      const screens=[];for(const a of [0,1])for(const b of [0,1])for(const c of [0,1]){
        const vertex=flexFootPoint([p.bounds[a][0],p.bounds[b][1],p.bounds[c][2]],s.bend??[0,0,0,0]);
        const v=vertex.map((v,k)=>(v-s.pivot[k])*s.scale),angle=s.rotation??s.rotationZ??0;
        const w=rotateVector(v,s.rotationAxis??[0,0,1],angle).map((v,k)=>v+s.pivot[k]+s.offset[k]);
        screens.push(project(w,viewProj,canvas.clientWidth,canvas.clientHeight));
      }
      if(screens.some(p=>p.depth<=0))return;
      const lo=[Math.min(...screens.map(p=>p.x)),Math.min(...screens.map(p=>p.y))],hi=[Math.max(...screens.map(p=>p.x)),Math.max(...screens.map(p=>p.y))],d=Math.min(...screens.map(p=>p.depth));
      if(x>=lo[0]&&x<=hi[0]&&y>=lo[1]&&y<=hi[1]&&d<depth){best=p.group;depth=d;}
    });return best;
  }
  const pinchState=()=>{const [a,b]=[...touches.values()];return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,d:Math.hypot(a.x-b.x,a.y-b.y)};};
  listen('pointerdown',e=>{
    if(e.pointerType!=='touch'&&e.button!==0&&e.button!==2)return;
    manualCamera=true;cameraTween=null;
    canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);
    if(e.pointerType==='touch'){touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size===2){pinch=pinchState();drag=null;return;}}
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false,pan:e.button===2||e.shiftKey};
  });
  listen('pointermove',e=>{
    if(touches.has(e.pointerId))touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(touches.size>=2){const next=pinchState(),rect=canvas.getBoundingClientRect();if(pinch){zoom(pinch.d/Math.max(1,next.d),next.x-rect.left,next.y-rect.top);pan(next.x-pinch.x,next.y-pinch.y);}pinch=next;return;}
    if(!drag||drag.id!==e.pointerId){const r=canvas.getBoundingClientRect(),group=pickGroup(e.clientX-r.left,e.clientY-r.top);if(group!==hoveredGroup){hoveredGroup=group;schedule();}return;}
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved ||= Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>5;
    if(drag.moved){if(drag.pan)pan(dx,dy);else{camera.yaw-=dx*.007;camera.pitch=Math.max(-1.5,Math.min(1.5,camera.pitch+dy*.007));}schedule();}drag.x=e.clientX;drag.y=e.clientY;
  });
  const release=e=>{
    touches.delete(e.pointerId);pinch=null;
    if(drag?.id===e.pointerId&&!drag.moved&&!drag.pan&&viewProj){const rect=canvas.getBoundingClientRect();const hits=sceneIds.map(id=>{const p=project(displayedJoints()[id].bodyCenter,viewProj,rect.width,rect.height);return{id,d:Math.hypot(p.x-(e.clientX-rect.left),p.y-(e.clientY-rect.top))};}).sort((a,b)=>a.d-b.d);if(hits[0]?.d<42)onSelect?.(hits[0].id);}
    drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
  };
  listen('pointerup',release);listen('pointercancel',release);listen('lostpointercapture',e=>{touches.delete(e.pointerId);pinch=null;drag=null;});
  listen('contextmenu',e=>e.preventDefault());
  listen('pointerleave',()=>{hoveredGroup=null;schedule();});
  listen('wheel',e=>{e.preventDefault();const rect=canvas.getBoundingClientRect();zoom(Math.exp(Math.max(-500,Math.min(500,e.deltaY))*.0015),e.clientX-rect.left,e.clientY-rect.top);},{passive:false});
  listen('keydown',e=>{if(['+','='].includes(e.key)){e.preventDefault();zoom(.8);}else if(e.key==='-'){e.preventDefault();zoom(1.25);}else if(e.key==='Home'){e.preventDefault();fit();}else if(onSelect&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const n=IDS.indexOf(state.selectedId);onSelect(IDS[(n+(['ArrowLeft','ArrowUp'].includes(e.key)?7:1)+8)%8]);}});
  const resize=new ResizeObserver(schedule);resize.observe(canvas);
  if(simulationRig)physics=renderer.gpuPhysics??await createShowcasePhysics(simulationRig,await loadAsset('showcase.json'),showcaseSeed,()=>{if(state.showcase)schedule();});
  fit(false);cancelAnimationFrame(raf);draw();onStatus?.({status:'ready',backend:renderer.backend});
  return {setState,fit,zoom,flip,focusPoint,cameraView,setCameraView,snapshot,
    setHeroCamera(view){if(!manualCamera){cameraTween=null;setCameraView(view);}},
    setInterior(value){inspectShowcase=!!value;schedule();},
    waitForSimulation(){if(state.showcase&&physics){if(physics.gpu){cancelAnimationFrame(raf);raf=0;draw();}return physics.settled();}return Promise.resolve();},
    async inspectPhysics(){if(physics?.gpu){cancelAnimationFrame(raf);raf=0;draw();return physics.inspect();}await physics?.settled();return physics?.snapshot();},
    testGpuDrop(height,seconds){return physics?.gpu?physics.testDrop(height,seconds):null;},
    testGpuContacts(){return physics?.gpu?physics.testContacts():null;},
    simulationModel(includeWires=false){return simulationRig?{rig:simulationRig,xml:showcaseXml(simulationRig,IDS),...(includeWires?{wires:parts.filter(p=>p.kind==='sim-wire'&&p.sourceJoint&&connectedChannel(p.sourceJoint)===p.channel).map(p=>({joint:p.sourceJoint,body:p.skin?parts[p.skin.part].simulationBody:0,origin:p.skin?.origin??[0,0,0],positions:Array.from(mesh.positions.slice(p.vertexStart*3,(p.vertexStart+p.vertexCount)*3)),weights:Array.from(mesh.decorative.slice(p.vertexStart,p.vertexStart+p.vertexCount),v=>p.skin?v/255:0)}))}:{})}:null;},
    setAppearance(value){appearance={...appearance,...value};schedule();},
    setVisible(value){if(value===renderEnabled)return;renderEnabled=value;if(value){cancelAnimationFrame(raf);raf=0;draw();}else{cancelAnimationFrame(raf);raf=0;cameraTween=null;renderer.releaseTargets?.();}},
    destroy(){if(destroyed)return;destroyed=true;if(!physics?.gpu)physics?.destroy();cancelAnimationFrame(raf);resize.disconnect();events.abort();canvas.style.touchAction=oldTouchAction;if(ownedTabIndex)canvas.removeAttribute('tabindex');renderer.destroy?.();}};
}
