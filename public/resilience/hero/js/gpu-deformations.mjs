// Authored guide deformations, NOT a physics/contact solver. Immutable seeds are
// uploaded once; compute writes the renderer's own interleaved vertex buffer.
// Only the six geometry words are written. Static colour/topology stay resident.
import { CABLE_STYLE } from './servo-cable-mesh.mjs?v=20261030-servo-fit';

export const DEFORMATION_WGSL = /* wgsl */ `
struct Params {
  range: vec4u, shape: vec4f,
  startTangent: vec4f, endTangent: vec4f, startSide: vec4f, endSide: vec4f,
  origin: vec4f, config: vec4u,
}
struct Command { motion: vec4f, destination: vec4f }
struct Frame { point: vec4f, tangent: vec4f, side: vec4f, up: vec4f }
@group(0) @binding(0) var<uniform> p: Params;
@group(0) @binding(1) var<storage, read> seed: array<vec4f>;
@group(0) @binding(2) var<storage, read_write> frames: array<Frame>;
@group(0) @binding(3) var<storage, read_write> vertices: array<u32>;
@group(0) @binding(4) var<storage, read> commands: array<Command>;
fn unit(v: vec3f) -> vec3f { return v / max(1e-12, length(v)); }
fn easeCurve(t: f32) -> f32 { return t*t*(3.0-2.0*t); }
fn rotateCommand(v: vec3f) -> vec3f {
  let command=commands[p.config.w];let q=command.motion.yzw;
  return v+2.0*cross(q,cross(q,v)+command.destination.w*v);
}
fn projected(a: vec3f, t: vec3f) -> vec3f {
  let v=a-t*dot(a,t);
  if(length(v)>1e-8){return unit(v);}
  return unit(cross(t,select(vec3f(0,1,0),vec3f(0,0,1),abs(t.z)<0.9)));
}
fn point(i: u32) -> vec3f {
  let n=p.range.z;
  let command=commands[p.config.w];
  let u=f32(i)/f32(n-1u);
  var result=mix(seed[i].xyz,seed[n+i].xyz,command.motion.x);
  if(p.range.w==1u){result+=(vec3f(0,0,command.motion.y)+command.destination.xyz)*(1.0-easeCurve(u));}
  else if(p.range.w==3u){result+=command.destination.xyz*(1.0-easeCurve(u));}
  else {
    let offset=seed[n-1u].xyz-p.origin.xyz;
    let c=cos(command.motion.w);let s=sin(command.motion.w);
    let end=vec3f(c*offset.x-s*offset.y,s*offset.x+c*offset.y,offset.z)+command.destination.xyz;
    let correction=end-mix(seed[n-1u].xyz,seed[2u*n-1u].xyz,command.motion.x);
    result+=correction*easeCurve(u);
  }
  return result;
}
fn storeVertex(i: u32, pos: vec3f, normal: vec3f) {
  let base=(p.range.x+i)*7u;
  vertices[base]=bitcast<u32>(pos.x);vertices[base+1u]=bitcast<u32>(pos.y);vertices[base+2u]=bitcast<u32>(pos.z);
  vertices[base+3u]=bitcast<u32>(normal.x);vertices[base+4u]=bitcast<u32>(normal.y);vertices[base+5u]=bitcast<u32>(normal.z);
}
// Parallel transport has a short prefix dependency. Run it once per ribbon,
// then parallelize the thousands of surface vertices; never repeat it per vertex.
@compute @workgroup_size(1) fn transport() {
  let n=p.range.z;
  let twist=commands[p.config.w].motion.z;
  var initial=p.startSide.xyz*cos(twist)+cross(p.startTangent.xyz,p.startSide.xyz)*sin(twist)+p.startTangent.xyz*dot(p.startTangent.xyz,p.startSide.xyz)*(1.0-cos(twist));
  var startTangent=p.startTangent.xyz;
  if(p.range.w==3u){initial=rotateCommand(p.startSide.xyz);startTangent=rotateCommand(startTangent);}
  var arc=0.0;var previous=point(0u);var side=projected(initial,startTangent);
  for(var i=0u;i<n;i++){
    let pos=point(i);
    var tangent=unit(point(min(i+1u,n-1u))-point(select(i-1u,0u,i==0u)));
    if(i==0u){tangent=startTangent;}
    if(i==n-1u){tangent=p.endTangent.xyz;}
    arc+=length(pos-previous);previous=pos;side=projected(side,tangent);
    frames[i].point=vec4f(pos,arc);frames[i].tangent=vec4f(tangent,0);frames[i].side=vec4f(side,0);
  }
  let last=frames[n-1u];let end=projected(p.endSide.xyz,last.tangent.xyz);
  let angle=atan2(dot(cross(last.side.xyz,end),last.tangent.xyz),dot(last.side.xyz,end));
  for(var i=0u;i<n;i++){
    let f=frames[i];let twist=angle*easeCurve(f.point.w/max(1e-12,arc));
    let s=f.side.xyz*cos(twist)+cross(f.tangent.xyz,f.side.xyz)*sin(twist);
    let fan=easeCurve(max(0.0,1.0-(arc-f.point.w)/p.shape.w));
    frames[i].side=vec4f(s,mix(p.shape.y,p.shape.z,fan));
    frames[i].up=vec4f(unit(cross(f.tangent.xyz,s)),1.0-fan);
  }
}
@compute @workgroup_size(64) fn sweep(@builtin(global_invocation_id) id: vec3u) {
  let i=id.x;if(i>=p.range.y){return;}
  let n=p.range.z;let radial=p.config.x;let ribbon=p.config.y==1u;
  let bodies=select(1u,3u,ribbon)*n*radial;
  if(i<bodies){
    let conductor=i/(n*radial);let station=(i/radial)%n;let j=i%radial;let f=frames[station];
    let a=f32(j)*6.283185307179586/f32(radial);
    let normal=f.side.xyz*cos(a)+f.up.xyz*sin(a);
    let center=f.point.xyz+f.side.xyz*select(0.0,(f32(conductor)-1.0)*f.side.w,ribbon);
    storeVertex(i,center+normal*p.shape.x,normal);
  }else{
    let k=i-bodies;let c=k/(n*4u);let station=(k/4u)%n;let j=k%4u;let f=frames[station];
    let sign=select(-1.0,1.0,j<2u);let halfWidth=f.side.w*0.5*f.up.w;
    let offset=(f32(c)-0.5)*f.side.w+select(halfWidth,-halfWidth,j==0u||j==3u);
    storeVertex(i,f.point.xyz+f.side.xyz*offset+f.up.xyz*sign*bitcast<f32>(p.config.z)*f.up.w,f.up.xyz*sign);
  }
}
@compute @workgroup_size(64) fn morph(@builtin(global_invocation_id) id: vec3u) {
  let i=id.x;if(i>=p.range.y){return;}
  let motion=commands[p.config.w].motion;
  let a=(u32(motion.x)*p.range.y+i)*2u;let b=a+p.range.y*2u;
  storeVertex(i,mix(seed[a].xyz,seed[b].xyz,motion.y)+commands[p.config.w].destination.xyz*seed[a].w,mix(seed[a+1u].xyz,seed[b+1u].xyz,motion.y));
}
`;

export async function createGpuDeformations(device, vertexBuffer, descriptions) {
  if(!descriptions.length)return {update:null,encode(){}};
  const module=device.createShaderModule({code:DEFORMATION_WGSL});
  const errors=(await module.getCompilationInfo()).messages.filter(m=>m.type==='error');
  if(errors.length)throw Error(errors.map(m=>m.message).join('\n'));
  const layout=device.createBindGroupLayout({entries:[
    {binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:'uniform'}},
    {binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:'read-only-storage'}},
    {binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:'storage'}},
    {binding:3,visibility:GPUShaderStage.COMPUTE,buffer:{type:'storage'}},
    {binding:4,visibility:GPUShaderStage.COMPUTE,buffer:{type:'read-only-storage'}},
  ]});
  const pipelineLayout=device.createPipelineLayout({bindGroupLayouts:[layout]});
  const pipelines=Object.fromEntries(await Promise.all(['transport','sweep','morph'].map(async entryPoint=>[entryPoint,await device.createComputePipelineAsync({layout:pipelineLayout,compute:{module,entryPoint}})])));
  const commands=new Float32Array(descriptions.length*8);
  const commandBuffer=device.createBuffer({size:commands.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});
  const jobs=descriptions.map((d,index)=>{
    const data=new ArrayBuffer(128),f=new Float32Array(data),u=new Uint32Array(data);
    const style={...CABLE_STYLE,...d.options},ribbon=d.ribbon!==false,n=d.points?.length||0;
    u.set([d.start,d.count,n,d.kind==='morph'?0:d.kind==='mounted'?1:d.kind==='standing'?3:2]);
    f.set([style.radius,style.pitch,style.terminalPitch,style.fanoutMm],4);
    f.set(style.startTangent||(ribbon?[0,1,0]:[0,0,1]),8);f.set(style.endTangent||[0,0,-1],12);
    f.set(style.startSide||[1,0,0],16);f.set(style.endSide||(ribbon?[0,1,0]:[1,0,0]),20);
    f.set(d.origin||[0,0,0],24);u.set([style.radial,ribbon?1:0,0,index],28);f[30]=style.webHalfThickness;
    const seeds=d.kind==='morph'?new Float32Array(d.count*8*d.sweeps.length):new Float32Array(n*8);
    if(d.kind==='morph')d.sweeps.forEach((s,k)=>{for(let i=0;i<d.count;i++){seeds.set(s.positions.subarray(i*3,i*3+3),(k*d.count+i)*8);seeds[(k*d.count+i)*8+3]=d.rootWeights?.[i]??0;seeds.set(s.normals.subarray(i*3,i*3+3),(k*d.count+i)*8+4);}});
    else [...d.points,...d.otherPoints].forEach((p,i)=>seeds.set(p,i*4));
    const seedBuffer=device.createBuffer({size:seeds.byteLength,usage:GPUBufferUsage.STORAGE,mappedAtCreation:true});new Float32Array(seedBuffer.getMappedRange()).set(seeds);seedBuffer.unmap();
    const params=device.createBuffer({size:128,usage:GPUBufferUsage.UNIFORM,mappedAtCreation:true});new Uint8Array(params.getMappedRange()).set(new Uint8Array(data));params.unmap();
    const frames=device.createBuffer({size:Math.max(64,n*64),usage:GPUBufferUsage.STORAGE});
    const group=device.createBindGroup({layout,entries:[params,seedBuffer,frames,vertexBuffer,commandBuffer].map((buffer,binding)=>({binding,resource:{buffer}}))});
    return {d,index,group,dirty:false};
  });
  return {
    update(index,motion,target=[0,0,0]){
      const offset=index*8;commands.fill(0,offset,offset+8);commands.set(motion,offset);commands.set(target,offset+4);jobs[index].dirty=true;
    },
    encode(encoder){
      const dirty=jobs.filter(j=>j.dirty);if(!dirty.length)return;
      const start=dirty[0].index*8,end=(dirty.at(-1).index+1)*8;
      device.queue.writeBuffer(commandBuffer,start*4,commands,start,end-start);
      const pass=encoder.beginComputePass();
      for(const job of dirty){
        pass.setBindGroup(0,job.group);
        if(job.d.kind==='morph')pass.setPipeline(pipelines.morph);
        else {pass.setPipeline(pipelines.transport);pass.dispatchWorkgroups(1);pass.setPipeline(pipelines.sweep);}
        pass.dispatchWorkgroups(Math.ceil(job.d.count/64));job.dirty=false;
      }
      pass.end();
    },
  };
}
