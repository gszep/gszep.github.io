import { GPU_RIGID_WGSL } from './gpu-rigid-shader.mjs?v=20261103-wave-support';
import { createRobotShowcase,seededShowcaseRandom } from './robot-showcase.mjs?v=20261104-two-eyes';
const DT=.004,ITERATIONS=6,MAX_STEPS=64,BODY_FLOATS=32,BODY_BYTES=BODY_FLOATS*4;
const HISTORY_STRIDE=9*BODY_BYTES+32,HISTORY_STEPS=4;
const rotate=(q,v)=>{const c=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],u=q.slice(1),first=c(u,v),second=c(u,first.map((x,i)=>x+q[0]*v[i]));return v.map((x,i)=>x+2*second[i]);};

export async function createGpuRigid(device,partBuffer,mesh,{rig,showcase,floorHulls,seed}){
  if(rig.names.length!==9)throw Error('GPU showcase expects nine rigid bodies');
  let planner=createRobotShowcase(showcase,seededShowcaseRandom(seed));
  const shader=device.createShaderModule({code:GPU_RIGID_WGSL});
  const errors=(await shader.getCompilationInfo()).messages.filter(m=>m.type==='error');if(errors.length)throw Error(errors.map(m=>m.message).join('\n'));
  const make=(data,usage)=>{const b=device.createBuffer({size:Math.max(16,data.byteLength),usage,mappedAtCreation:true});new Uint8Array(b.getMappedRange()).set(new Uint8Array(data.buffer??data,data.byteOffset??0,data.byteLength));b.unmap();return b;};
  const parent=rig.parents;
  const centers=rig.names.map(n=>rig.bounds[n][0].map((v,i)=>(v+rig.bounds[n][1][i])/2));
  for(const p of rig.proxies.filter(p=>p.type==='mesh')){
    const record=floorHulls.shapes[p.name],bytes=new TextEncoder().encode(JSON.stringify(p.vertices.flat().map(v=>Math.round(v*1e6))));
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
    if(!record||record.source_sha256!==hash)throw Error('Regenerate GPU floor hull for '+p.name);
    p.floorVertices=record.indices.map(i=>p.vertices[i]);
  }
  const colliderList=rig.proxies.map(p=>{
    let center,size;
    if(p.type==='box'){center=p.pos;size=p.size;}
    else{const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const v of p.vertices)for(let i=0;i<3;i++){lo[i]=Math.min(lo[i],v[i]);hi[i]=Math.max(hi[i],v[i]);}center=lo.map((v,i)=>(v+hi[i])/2);size=lo.map((v,i)=>(hi[i]-v)/2);}
    const body=rig.names.indexOf(p.body);return {name:p.name,body,center:center.map((v,i)=>v-centers[body][i]),size,floorVertices:p.floorVertices?.map(v=>v.map((x,i)=>x-centers[body][i]))};
  }).sort((a,b)=>a.body-b.body);
  function recordBuffer(count,stride){const raw=new ArrayBuffer(count*stride);return {raw,f:new Float32Array(raw),u:new Uint32Array(raw)};}
  const configs=recordBuffer(9,64);
  rig.names.forEach((name,i)=>{
    const o=i*16,[lo,hi]=rig.bounds[name],size=lo.map((v,k)=>hi[k]-v),mass=rig.massesKg[name];
    configs.f.set([...centers[i],1/mass],o);
    configs.f.set([...size.map((_,k)=>12/(mass*(size[(k+1)%3]**2+size[(k+2)%3]**2))),Math.hypot(...size)/2],o+4);
    configs.f.set(rig.origins[name].map((v,k)=>v/1000+(k===2?rig.initialHeightM:0)),o+8);
    configs.f[o+11]=rig.dynamics.floorFriction[0];
    configs.u.set([parent[i]+1,colliderList.findIndex(c=>c.body===i),colliderList.filter(c=>c.body===i).length,0],o+12);
  });
  const jointData=recordBuffer(8,80);
  for(let b=1;b<9;b++){
    const a=parent[b],name=rig.names[b],o=(b-1)*20;
    jointData.u.set([a,b,showcase.jointOrder.indexOf(name),0],o);
    jointData.f.set(rig.origins[name].map((v,k)=>(v-rig.origins[rig.names[a]][k])/1000-centers[a][k]),o+4);
    jointData.f[o+7]=rig.jointLimits[name][0];
    jointData.f.set(centers[b].map(v=>-v),o+8);jointData.f[o+11]=rig.jointLimits[name][1];
    jointData.f.set(rig.axes[name],o+12);jointData.f.set([rig.dynamics.motorKp,rig.dynamics.angularDamping,rig.dynamics.maxMotorTorque,rig.scales[name]],o+16);
  }
  const boxData=recordBuffer(colliderList.length*4+colliderList.reduce((n,c)=>n+(c.floorVertices?.length??0),0),16);let vertexRow=colliderList.length*4;
  colliderList.forEach((c,i)=>{const o=i*16;boxData.u[o]=c.body;boxData.f.set(c.center,o+4);boxData.f.set(c.size,o+8);boxData.u.set([vertexRow,c.floorVertices?.length??0],o+12);for(const p of c.floorVertices??[]){boxData.f.set(p,vertexRow*4);vertexRow++;}});
  const linkData=new Uint32Array(mesh.parts.flatMap((p,i)=>p.kind?.startsWith('sim-')?[i,p.simulationBody<0?0xffffffff:p.simulationBody]:[]));
  const state=make(new Float32Array(9*BODY_FLOATS),GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST),meta=make(new Uint32Array(8),GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST);
  const config=make(configs.raw,GPUBufferUsage.STORAGE),joints=make(jointData.raw,GPUBufferUsage.STORAGE),boxes=make(boxData.raw,GPUBufferUsage.STORAGE),links=make(linkData,GPUBufferUsage.STORAGE);
  const uniform=make(new Float32Array(8),GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST);
  const layout=device.createBindGroupLayout({entries:Array.from({length:9},(_,binding)=>({binding,visibility:GPUShaderStage.COMPUTE,buffer:{type:binding===5?'uniform':[0,6,7].includes(binding)?'storage':'read-only-storage'}}))});
  const pipelineLayout=device.createPipelineLayout({bindGroupLayouts:[layout]});
  const step=device.createComputePipeline({layout:pipelineLayout,compute:{module:shader,entryPoint:'step'}}),transforms=device.createComputePipeline({layout:pipelineLayout,compute:{module:shader,entryPoint:'transforms'}});
  let probe,probeResolve;
  let program,bindGroup,capacity=0,programEnd=0,programCount=0,goal=0,submitted=0,epoch=1,encodedEpoch=0,dropHeight=0,motors=1,lastInspection=null;
  const waiters=[];
  let history=null,historySteps=null,historyLast=-1,historyCount=0,replaySlot=-1;
  function setHistory(durationMs,{once=false}={}){
    if(once!==planner.once){planner=createRobotShowcase(showcase,seededShowcaseRandom(seed),{once});programEnd=-Infinity;updateProgram(0);}
    if(history){const old=history;device.queue.onSubmittedWorkDone().then(()=>old.destroy());}
    history=durationMs?device.createBuffer({size:(Math.ceil(durationMs/(DT*1000*HISTORY_STEPS))+2)*HISTORY_STRIDE,usage:GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}):null;
    historySteps=history?new Int32Array(history.size/HISTORY_STRIDE).fill(-1):null;historyLast=-1;historyCount=0;replaySlot=-1;
    epoch++;submitted=0;goal=0;
  }
  function restore(encoder,slot){
    encoder.copyBufferToBuffer(history,slot*HISTORY_STRIDE,state,0,9*BODY_BYTES);
    encoder.copyBufferToBuffer(history,slot*HISTORY_STRIDE+9*BODY_BYTES,meta,0,32);
  }
  const stats={engine:'webgpu-rigid',bodies:9,joints:8,geoms:colliderList.length+1,actuators:8,timestep:DT,iterations:ITERATIONS,seed,gravity:[0,0,-9.81],collision:'actual convex floor supports; conservative OBB self contacts; adjacent bodies excluded',solver:'compliant torque-limited angular motors, rigid hinges, passive angular damping and persistent Coulomb floor friction; not MuJoCo',resident:true};
  function updateProgram(until){
    if(until<programEnd)return;
    const segments=planner.commands(until+10000),data=new Float32Array(segments.length*20);
    segments.forEach((s,i)=>{const o=i*20;data.set([s.start/1000,s.end/1000,0,0],o);for(const [key,at] of [['from',4],['to',12]])data.set(showcase.jointOrder.map(n=>(s[key][n]-90)*Math.PI/180*rig.scales[n]),o+at);});
    if(data.byteLength>capacity){const old=program;capacity=Math.max(65536,2**Math.ceil(Math.log2(data.byteLength)));program=device.createBuffer({size:capacity,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});if(old)device.queue.onSubmittedWorkDone().then(()=>old.destroy());
      const buffers=[state,config,joints,boxes,program,uniform,meta,partBuffer,links];bindGroup=device.createBindGroup({layout,entries:buffers.map((buffer,binding)=>({binding,resource:{buffer}}))});
    }
    device.queue.writeBuffer(program,0,data);programCount=segments.length;programEnd=segments.at(-1).end;
  }
  updateProgram(0);
  function advance(timeMs){
    const next=Math.max(0,Math.floor((timeMs+1e-6)/(DT*1000)));replaySlot=-1;
    if(history&&next<=historyLast){
      for(let i=Math.min(historySteps.length-1,Math.floor(next/HISTORY_STEPS));i>=0;i--)if(historySteps[i]>=0&&historySteps[i]<=next){replaySlot=i;break;}
    }
    if(!history&&(next<submitted||motors===0)){epoch++;submitted=0;dropHeight=0;motors=1;}
    goal=replaySlot>=0?historySteps[replaySlot]:next;updateProgram(timeMs);
  }
  function encode(encoder,timestampWrites){
    let from=encodedEpoch===epoch?submitted:0;
    if(replaySlot>=0){restore(encoder,replaySlot);from=goal;}
    else if(history&&historyLast>from){restore(encoder,Math.floor(historyLast/HISTORY_STEPS));from=historyLast;}
    const target=Math.min(goal,from+MAX_STEPS);
    const data=recordBuffer(1,32);data.u.set([target,programCount,linkData.length/2,epoch]);data.f.set([DT,dropHeight,motors,ITERATIONS],4);device.queue.writeBuffer(uniform,0,data.raw);
    const pass=encoder.beginComputePass(timestampWrites?{timestampWrites}:{});pass.setBindGroup(0,bindGroup);pass.setPipeline(step);
    if(replaySlot<0)for(let n=0;n<Math.max(1,Math.ceil((target-from)/32));n++)pass.dispatchWorkgroups(1);
    pass.setPipeline(transforms);pass.dispatchWorkgroups(Math.ceil(linkData.length/2/32));pass.end();submitted=target;encodedEpoch=epoch;
    if(history&&replaySlot<0){
      const slot=Math.floor(target/HISTORY_STEPS);
      encoder.copyBufferToBuffer(state,0,history,slot*HISTORY_STRIDE,9*BODY_BYTES);
      encoder.copyBufferToBuffer(meta,0,history,slot*HISTORY_STRIDE+9*BODY_BYTES,32);
      if(historySteps[slot]<0)historyCount++;historySteps[slot]=target;historyLast=Math.max(historyLast,target);
    }
    return {steps:target-from,simulatedMs:(target-from)*DT*1000};
  }
  function afterSubmit(){if(waiters.length&&submitted===goal&&encodedEpoch===epoch){const pending=waiters.splice(0);device.queue.onSubmittedWorkDone().then(()=>pending.forEach(w=>w.resolve()),e=>pending.forEach(w=>w.reject(e)));}}
  function settled(){if(submitted===goal&&encodedEpoch===epoch)return device.queue.onSubmittedWorkDone();return new Promise((resolve,reject)=>waiters.push({resolve,reject}));}
  async function inspect(){
    const read=device.createBuffer({size:9*BODY_BYTES+32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});const e=device.createCommandEncoder();e.copyBufferToBuffer(state,0,read,0,9*BODY_BYTES);e.copyBufferToBuffer(meta,0,read,9*BODY_BYTES,32);device.queue.submit([e.finish()]);await read.mapAsync(GPUMapMode.READ);
    const raw=read.getMappedRange(),f=new Float32Array(raw.slice(0,9*BODY_BYTES)),u=new Uint32Array(raw.slice(9*BODY_BYTES));const poses=[];
    for(let i=0;i<9;i++){const q=Array.from(f.slice(i*BODY_FLOATS+4,i*BODY_FLOATS+8)),r=rotate(q,centers[i]);poses.push(...Array.from(f.slice(i*BODY_FLOATS,i*BODY_FLOATS+3),(v,k)=>v-r[k]),...q);}
    const jointDegrees={},anchorErrorsMm={},motorTorquesNm={};
    const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    for(let b=1;b<9;b++){
      const a=parent[b],name=rig.names[b],qa=poses.slice(a*7+3,a*7+7),qb=poses.slice(b*7+3,b*7+7),av=qa.slice(1).map(v=>-v),bv=qb.slice(1),cv=cross(av,bv);
      const rel=[qa[0]*qb[0]-av.reduce((s,v,i)=>s+v*bv[i],0),...bv.map((v,i)=>qa[0]*v+qb[0]*av[i]+cv[i])];
      let angle=2*Math.atan2(rel.slice(1).reduce((s,v,i)=>s+v*rig.axes[name][i],0),rel[0]);if(angle>Math.PI)angle-=2*Math.PI;if(angle< -Math.PI)angle+=2*Math.PI;
      jointDegrees[name]=90+angle/rig.scales[name]*180/Math.PI;
      const anchor=rotate(qa,rig.origins[name].map((v,i)=>(v-rig.origins[rig.names[a]][i])/1000));
      anchorErrorsMm[name]=1000*Math.hypot(...anchor.map((v,i)=>v+poses[a*7+i]-poses[b*7+i]));motorTorquesNm[name]=f[b*BODY_FLOATS+15];
    }
    let lowest=Infinity;const floorSupports=[];
    for(const box of colliderList){const o=box.body*BODY_FLOATS,q=Array.from(f.slice(o+4,o+8));let low;
      if(box.floorVertices)low=f[o+2]+Math.min(...box.floorVertices.map(v=>rotate(q,v)[2]));
      else{const c=rotate(q,box.center),axes=[[1,0,0],[0,1,0],[0,0,1]].map(v=>rotate(q,v));low=f[o+2]+c[2]-axes.reduce((sum,v,k)=>sum+Math.abs(v[2])*box.size[k],0);}
      lowest=Math.min(lowest,low);floorSupports.push({body:rig.names[box.body],name:box.name,heightMm:low*1000});
    }
    const floorAnchors=rig.names.map((body,i)=>({body,active:f[i*BODY_FLOATS+31]>0,world:Array.from(f.slice(i*BODY_FLOATS+28,i*BODY_FLOATS+31))}));
    lastInspection={poses,time:u[0]*DT,steps:u[0],ncon:u[2],floorContactBodies:u[2],selfContactPairs:u[3],states:Array.from(f),jointDegrees,anchorErrorsMm,motorTorquesNm,floorSupports,floorAnchors,maxFloorPenetrationMm:Math.max(0,-lowest*1000),model:stats};read.unmap();read.destroy();return lastInspection;
  }
  async function testContacts(){
    probe??=device.createComputePipeline({layout:pipelineLayout,compute:{module:shader,entryPoint:'probe'}});
    const results=[];
    for(const [x,angle] of [[.015,0],[.03,0],[.022,Math.PI/4]]){
      const bodies=new Float32Array(9*BODY_FLOATS);for(let i=0;i<9;i++)bodies[i*BODY_FLOATS+4]=1;bodies[BODY_FLOATS]=x;bodies.set([Math.cos(angle/2),0,0,Math.sin(angle/2)],BODY_FLOATS+4);
      const bx=recordBuffer(2,64);bx.u[16]=1;bx.f.set([.01,.01,.01],8);bx.f.set([.01,.01,.01],24);
      const stateTest=make(bodies,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC),boxTest=make(bx.raw,GPUBufferUsage.STORAGE),read=device.createBuffer({size:16,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});
      const buffers=[stateTest,config,joints,boxTest,program,uniform,meta,partBuffer,links],group=device.createBindGroup({layout,entries:buffers.map((buffer,binding)=>({binding,resource:{buffer}}))});
      const encoder=device.createCommandEncoder(),pass=encoder.beginComputePass();pass.setPipeline(probe);pass.setBindGroup(0,group);pass.dispatchWorkgroups(1);pass.end();encoder.copyBufferToBuffer(stateTest,32,read,0,16);device.queue.submit([encoder.finish()]);await read.mapAsync(GPUMapMode.READ);results.push({x,angle,contact:Array.from(new Float32Array(read.getMappedRange()))});read.unmap();read.destroy();stateTest.destroy();boxTest.destroy();
    }
    probeResolve??=device.createComputePipeline({layout:pipelineLayout,compute:{module:shader,entryPoint:'probeResolve'}});
    const fixture=new Float32Array(9*BODY_FLOATS),fixtureCfg=recordBuffer(9,64);fixtureCfg.f.set(configs.f);
    for(let i=0;i<9;i++){fixture[i*BODY_FLOATS]=i<2?i*.015:100+i;fixture[i*BODY_FLOATS+2]=.1;fixture[i*BODY_FLOATS+4]=1;fixtureCfg.u.set([0,i<2?i:0,i<2?1:0,0],i*16+12);}
    const bx=recordBuffer(2,64);bx.u[16]=1;bx.f.set([.01,.01,.01],8);bx.f.set([.01,.01,.01],24);
    const stateTest=make(fixture,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC),boxTest=make(bx.raw,GPUBufferUsage.STORAGE),configTest=make(fixtureCfg.raw,GPUBufferUsage.STORAGE),read=device.createBuffer({size:32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});
    const buffers=[stateTest,configTest,joints,boxTest,program,uniform,meta,partBuffer,links],group=device.createBindGroup({layout,entries:buffers.map((buffer,binding)=>({binding,resource:{buffer}}))});
    const encoder=device.createCommandEncoder(),pass=encoder.beginComputePass();pass.setPipeline(probeResolve);pass.setBindGroup(0,group);pass.dispatchWorkgroups(1);pass.end();encoder.copyBufferToBuffer(stateTest,0,read,0,16);encoder.copyBufferToBuffer(stateTest,BODY_BYTES,read,16,16);device.queue.submit([encoder.finish()]);await read.mapAsync(GPUMapMode.READ);
    const points=Array.from(new Float32Array(read.getMappedRange())),ma=rig.massesKg[rig.names[0]],mb=rig.massesKg[rig.names[1]];
    results.push({kind:'response',separation:points[4]-points[0],massMomentError:Math.abs(points[0]*ma+points[4]*mb-.015*mb)});read.unmap();for(const b of [read,stateTest,boxTest,configTest])b.destroy();
    return results;
  }
  return {gpu:true,advance,encode,afterSubmit,setHistory,suspend(){},settled,testContacts,inspect:async()=>{await settled();return inspect();},
    get pending(){return submitted!==goal||encodedEpoch!==epoch;},
    get frame(){const time=Math.min(goal,(encodedEpoch===epoch?submitted:0)+MAX_STEPS)*DT;return {time,playback:planner.frame(time*1000),poses:null};},
    snapshot(){return {time:submitted*DT,submittedSteps:submitted,goalMs:goal*DT*1000,busy:submitted!==goal||encodedEpoch!==epoch,model:stats,gpuResident:true,lastInspection,history:history?{bytes:history.size,samples:historyCount,replaying:replaySlot>=0}:null};},
    async testDrop(height,seconds){epoch++;submitted=0;goal=Math.round(seconds/DT);dropHeight=height;motors=0;do{const e=device.createCommandEncoder();encode(e);device.queue.submit([e.finish()]);await device.queue.onSubmittedWorkDone();}while(submitted<goal);return inspect();},
    destroy(){for(const b of [state,meta,config,joints,boxes,links,uniform,program,history])b?.destroy();},
  };
}
