// A finished-robot rendering and collision rig, derived from the guide's Rest
// geometry. PCB internals contribute to the torso mass, never separate joints.
// Guide basis: +X robot-left, +Y rear, +Z up. MJCF uses metres; render data mm.
import { frameMountOffset } from './frame-assembly.mjs?v=20261030-servo-fit';
import { STANDING_REFERENCE } from './servo-angle-guide.mjs?v=20261030-static-guides';
const FOOT_FOR={L1:'L3',L2:'L4',R1:'R3',R2:'R4'};

export function appendShowcaseRig({parts,positions,colors,indices,edges,begin,end,joints,mountedStates,assembly,wires=[]}){
  const original=[...parts],rest=mountedStates.rest,stand=mountedStates.stand;
  const names=['torso',...Object.keys(rest.mounts).flatMap(hip=>[hip,FOOT_FOR[hip]])];
  const parents=names.map(n=>n==='torso'?-1:FOOT_FOR[n]!==undefined?0:names.indexOf(Object.keys(FOOT_FOR).find(k=>FOOT_FOR[k]===n)));
  const offsets=Object.fromEntries(Object.keys(joints).map(id=>[id,frameMountOffset(id,joints,assembly,1)]));
  const origins={torso:[0,0,0]},axes={},scales={};
  for(const [hip,mount] of Object.entries(rest.mounts)){
    const foot=FOOT_FOR[hip],d=offsets[hip];
    origins[hip]=mount.hip.map((v,i)=>v+d[i]);origins[foot]=mount.foot.map((v,i)=>v+d[i]);
    axes[hip]=[0,0,1];axes[foot]=mount.axis;
    const goal=stand.mounts[hip],cross=mount.out[0]*goal.out[1]-mount.out[1]*goal.out[0],dot=mount.out[0]*goal.out[0]+mount.out[1]*goal.out[1];
    scales[hip]=Math.atan2(cross,dot)/((STANDING_REFERENCE[hip]-90)*Math.PI/180);
    scales[foot]=goal.bodyTurn/((STANDING_REFERENCE[foot]-90)*Math.PI/180);
  }
  const groups=Object.fromEntries(names.map(n=>[n,[]]));
  for(const p of original){
    let body;
    if(['head-cover','head-lid','internal-frame','bottom-cover'].includes(p.kind))body='torso';
    if(['head.external.oled.glass','head.external.switch.body'].includes(p.id))body='torso';
    if(p.pose==='rest'){
      if(p.kind==='mounted-upper')body=p.joint;
      if(p.kind==='mounted-lower')body=p.joint;
      if(p.kind==='mounted-servo'){
        const hip=Object.keys(rest.mounts).find(h=>h===p.joint||FOOT_FOR[h]===p.joint);
        body=joints[p.joint].role==='hip'?(['horn','hole'].includes(p.sourceKind)?hip:'torso'):(['horn','hole'].includes(p.sourceKind)?hip:p.joint);
      }
    }
    if(body)groups[body].push(p);
  }
  const placed=(p,v)=>p.kind.startsWith('mounted-')?v.map((x,i)=>x+offsets[p.joint][i]):v;
  function local(p,v,body){return placed(p,v).map((x,i)=>x-origins[body][i]);}
  function append(list,body,kind,id,extra={}){
    const batch=begin({id,kind,simulationBody:names.indexOf(body),pivot:[0,0,0],...extra});
    const shared=body==='torso'&&list.every(p=>!p.kind.startsWith('mounted-'));
    for(const p of list){
      const base=positions.length/3;
      if(!shared)for(let i=p.vertexStart;i<p.vertexStart+p.vertexCount;i++){positions.push(...local(p,positions.slice(i*3,i*3+3),body));colors.push(...colors.slice(i*3,i*3+3));}
      for(let i=p.indexStart;i<p.indexStart+p.indexCount;i++)indices.push(shared?indices[i]:base+indices[i]-p.vertexStart);
      for(let i=p.edgeStart*3;i<(p.edgeStart+p.edgeCount)*3;i+=3)edges.push(...local(p,edges.slice(i,i+3),body));
    }
    end(batch);
    if(shared){
      const solids=list.filter(p=>p.vertexCount);batch.sharedVertices=true;batch.sharedVertexCount=solids.reduce((n,p)=>n+p.vertexCount,0);
      batch.vertexStart=Math.min(...solids.map(p=>p.vertexStart));batch.vertexCount=Math.max(...solids.map(p=>p.vertexStart+p.vertexCount))-batch.vertexStart;
      batch.bounds=[[0,1,2].map(k=>Math.min(...solids.map(p=>p.bounds[0][k]))),[0,1,2].map(k=>Math.max(...solids.map(p=>p.bounds[1][k])))];
    }
    return batch;
  }
  const casing=groups.torso.filter(p=>['head-cover','head-lid'].includes(p.kind));
  const physicalBoundsMm=Object.fromEntries(names.map(name=>{
    const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
    for(const p of groups[name])for(const side of [0,1]){const v=local(p,p.bounds[side],name);for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],v[k]);hi[k]=Math.max(hi[k],v[k]);}}
    return [name,[lo,hi]];
  }));
  const batches=names.map(name=>append(name==='torso'?groups[name].filter(p=>!casing.includes(p)):groups[name],name,'sim-batch','simulation.'+name));
  append(casing,'torso','sim-casing','simulation.casing');
  const interior=original.filter(p=>p.kind==='electronics'||p.kind==='pcb-spacer'||['frame-battery','frame-battery-plug'].includes(p.kind)||p.kind==='head-peripheral'&&!['head.external.oled.glass','head.external.oled.screen','head.external.switch.body'].includes(p.id));
  const pcb=append(interior,'torso','sim-interior','simulation.carrier');
  for(const p of original.filter(p=>p.kind==='plug'))append([p],'torso','sim-plug','simulation.'+p.id,{sourceJoint:p.joint,channel:p.channel});
  // Keep the active screen dark in Line mode so its white pixels stay legible.
  append(original.filter(p=>p.id==='head.external.oled.screen'),'torso','sim-screen','simulation.screen').edgeCount=0;
  for(const p of original.filter(p=>p.kind==='face'))append([p],'torso','sim-face','simulation.'+p.id,{faceName:p.faceName});
  // Independent settled copies: assembly morphs must never move finale wires.
  // Foot leads blend from their moving servo to the torso-fixed frame route.
  for(const wire of wires){
    const g=wire.geometry,base=positions.length/3;
    const skin=wire.joint?{part:parts.indexOf(batches[names.indexOf(wire.joint)]),origin:origins[wire.joint]}:null;
    const p=begin({id:'simulation.wire.'+wire.id,kind:'sim-wire',sourceJoint:wire.sourceJoint,channel:wire.channel,simulationBody:0,pivot:[0,0,0],skin,wireNormals:g.normals,wireWeights:wire.weights});
    for(const v of g.positions)positions.push(v);for(const c of g.colors)colors.push(c);for(const i of g.indices)indices.push(base+i);end(p);
  }
  const floor=begin({id:'simulation.floor',kind:'sim-floor',simulationBody:-1,pivot:[0,0,0]});
  const base=positions.length/3;
  const perimeter=[[-150,-150,0],[150,-150,0],[150,150,0],[-150,150,0]];
  for(const p of perimeter){positions.push(...p);colors.push(242,242,236);}
  indices.push(base,base+1,base+2,base,base+2,base+3);
  for(let i=0;i<4;i++)edges.push(...perimeter[i].map((v,k)=>v+(k===2?.05:0)),...perimeter[(i+1)%4].map((v,k)=>v+(k===2?.05:0)));
  end(floor);
  const proxies=[];
  function hull(name,body,list){
    const unique=new Map();
    for(const p of list)for(let i=p.vertexStart;i<p.vertexStart+p.vertexCount;i++){
      const v=local(p,positions.slice(i*3,i*3+3),body).map(x=>Math.round(x*1000)/1e6);unique.set(v.join(' '),v);
    }
    if(unique.size>=4)proxies.push({name,body,vertices:[...unique.values()],type:'mesh'});
  }
  hull('shell','torso',groups.torso.filter(p=>['head-cover','head-lid'].includes(p.kind)));
  hull('frame','torso',groups.torso.filter(p=>['internal-frame','bottom-cover'].includes(p.kind)));
  for(const name of names.slice(1))hull(name+'-outer',name,groups[name]);
  for(const p of groups.torso.filter(p=>p.kind==='mounted-servo'&&p.sourceKind==='servo')){
    const lo=placed(p,p.bounds[0]).map(v=>v/1000),hi=placed(p,p.bounds[1]).map(v=>v/1000);
    proxies.push({name:p.joint+'-case',body:'torso',type:'box',pos:lo.map((v,i)=>(v+hi[i])/2),size:lo.map((v,i)=>(hi[i]-v)/2)});
  }
  const bounds=Object.fromEntries(names.map(n=>[n,physicalBoundsMm[n].map(v=>v.map(x=>x/1000))]));
  const lowest=Math.min(...names.map(n=>physicalBoundsMm[n][0][2]+origins[n][2]));
  return {names,parents,origins,axes,scales,proxies,bounds,initialHeightM:(-lowest+.2)/1000,
    dynamics:{motorKp:1.5,angularDamping:.03,maxMotorTorque:.176,floorFriction:[.8,.005,.0001],jointDamping:.002,armature:.000001},
    jointLimits:Object.fromEntries(names.slice(1).map(n=>[n,[-1.570796327,1.570796327]])),
    renderStats:batches.map(p=>({name:p.id,vertices:p.sharedVertexCount??p.vertexCount,triangles:p.indexCount/3,edgeVertices:p.edgeCount})),
    sourceStats:Object.fromEntries(Object.entries(groups).map(([name,list])=>[name,list.map(p=>({id:p.id,triangles:p.indexCount/3}))])),
    interior:{parts:interior.map(p=>p.id),triangles:pcb.indexCount/3,body:'torso',sharedVertices:pcb.sharedVertices,physicsRole:'visual only; mass already aggregated'},
    massesKg:Object.fromEntries(names.map(n=>[n,n==='torso'?.24:/[12]$/.test(n)?.008:.019])),
    scope:'Current guide geometry; 9 moving rigid bodies. Estimated aggregate masses/inertia and friction, not measured robot calibration. PCB components are rigid torso contents, with no individual collision shapes.'};
}

export function showcaseXml(rig,order){
  const vec=a=>a.map(v=>Number(v.toPrecision(9))).join(' '),assets=[],geoms={};
  for(const p of rig.proxies){
    (geoms[p.body]??=[]).push(p.type==='mesh'?`<geom name="${p.name}" type="mesh" mesh="${p.name}"/>`:`<geom name="${p.name}" type="box" pos="${vec(p.pos)}" size="${vec(p.size)}"/>`);
    if(p.type==='mesh')assets.push(`<mesh name="${p.name}" maxhullvert="32" vertex="${vec(p.vertices.flat())}"/>`);
  }
  function body(name,parent){
    const origin=rig.origins[name],relative=origin.map((v,i)=>(v-(parent?rig.origins[parent][i]:0))/1000);
    const [lo,hi]=rig.bounds[name],size=lo.map((v,i)=>hi[i]-v),mass=rig.massesKg[name],center=lo.map((v,i)=>(v+hi[i])/2);
    const inertia=size.map((_,i)=>mass*(size[(i+1)%3]**2+size[(i+2)%3]**2)/12);
    const joint=name==='torso'?'<freejoint name="root"/>':`<joint name="${name}" axis="${vec(rig.axes[name])}" range="${rig.jointLimits[name].join(' ')}" damping="${rig.dynamics.jointDamping}" armature="${rig.dynamics.armature}"/>`;
    const index=rig.names.indexOf(name),children=rig.names.filter((_,i)=>rig.parents[i]===index);
    return `<body name="${name}" pos="${name==='torso'?'0 0 '+rig.initialHeightM:vec(relative)}">${joint}<inertial pos="${vec(center)}" mass="${mass}" diaginertia="${vec(inertia)}"/>${geoms[name].join('')}${children.map(n=>body(n,name)).join('')}</body>`;
  }
  const d=rig.dynamics;
  return `<mujoco model="sesame-v3-showcase"><compiler angle="radian" autolimits="true"/><option timestep="0.002" gravity="0 0 -9.81" integrator="implicitfast"/><default><geom mass="0" friction="${d.floorFriction.join(' ')}" condim="3"/></default><asset>${assets.join('')}</asset><worldbody><geom name="floor" type="plane" size="1 1 .01"/>${body('torso',null)}</worldbody><actuator>${order.map(n=>`<position name="${n}" joint="${n}" kp="${d.motorKp}" kv="${d.angularDamping}" forcerange="${-d.maxMotorTorque} ${d.maxMotorTorque}" ctrlrange="${rig.jointLimits[n].join(' ')}"/>`).join('')}</actuator></mujoco>`;
}
