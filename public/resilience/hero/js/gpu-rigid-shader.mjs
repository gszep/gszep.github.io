// Project-local GPU rigid-body solver. Float32, position-projected hinges and
// conservative OBB contacts; this is not a GPU build of MuJoCo.
export const GPU_RIGID_WGSL=/* wgsl */`
struct Body { p:vec4f, q:vec4f, v:vec4f, w:vec4f, oldP:vec4f, oldQ:vec4f, contactLocal:vec4f, contactWorld:vec4f }
struct Config { comMass:vec4f, inverseI:vec4f, origin:vec4f, info:vec4u }
struct Joint { ids:vec4u, a:vec4f, b:vec4f, axis:vec4f, motor:vec4f }
struct Box { ids:vec4u, center:vec4f, halfSize:vec4f, floorRange:vec4u }
struct Segment { times:vec4f, fromA:vec4f, fromB:vec4f, toA:vec4f, toB:vec4f }
struct Params { range:vec4u, options:vec4f }
struct Part { offset:vec4f, pivot:vec4f, tint:vec4f, edge:vec4f, options:vec4f, bend:vec4f }
@group(0) @binding(0) var<storage,read_write> stored:array<Body>;
@group(0) @binding(1) var<storage,read> cfg:array<Config>;
@group(0) @binding(2) var<storage,read> joints:array<Joint>;
@group(0) @binding(3) var<storage,read> collisionData:array<vec4f>;
@group(0) @binding(4) var<storage,read> program:array<Segment>;
@group(0) @binding(5) var<uniform> params:Params;
@group(0) @binding(6) var<storage,read_write> clock:array<u32>;
@group(0) @binding(7) var<storage,read_write> parts:array<Part>;
@group(0) @binding(8) var<storage,read> links:array<vec2u>;
var<workgroup> s:array<Body,9>;
var<workgroup> dp:array<vec4f,9>;
var<workgroup> dr:array<vec4f,9>;
var<workgroup> floorPoint:array<vec4f,9>;
var<workgroup> floorLambda:array<f32,9>;
var<workgroup> resetNow:u32;
var<workgroup> stepBase:u32;
var<workgroup> motorLambda:array<f32,8>;
var<workgroup> motorTarget:array<f32,8>;
var<workgroup> touchMask:array<u32,9>;
var<workgroup> tangentLambda:array<vec2f,9>;
var<workgroup> sliding:array<u32,9>;
fn unit(v:vec3f)->vec3f{return v/max(length(v),1e-12);}
fn conj(q:vec4f)->vec4f{return vec4f(q.x,-q.yzw);}
fn mul(a:vec4f,b:vec4f)->vec4f{return vec4f(a.x*b.x-dot(a.yzw,b.yzw),a.x*b.yzw+b.x*a.yzw+cross(a.yzw,b.yzw));}
fn rotate(q:vec4f,v:vec3f)->vec3f{return v+2.0*cross(q.yzw,cross(q.yzw,v)+q.x*v);}
fn turn(q:vec4f,d:vec3f)->vec4f{
 let l=length(d);if(l<1e-12){return q;}let a=min(l,.3);
 return normalize(mul(vec4f(cos(a*.5),d/l*sin(a*.5)),q));
}
fn inverse(i:u32,v:vec3f)->vec3f{return rotate(s[i].q,cfg[i].inverseI.xyz*rotate(conj(s[i].q),v));}
fn angularWeight(i:u32,n:vec3f)->f32{return dot(n,inverse(i,n));}
fn twist(j:Joint)->f32{
 let q=mul(conj(s[j.ids.x].q),s[j.ids.y].q);
 var a=2.0*atan2(dot(q.yzw,j.axis.xyz),q.x);
 if(a>3.14159265){a-=6.2831853;}if(a< -3.14159265){a+=6.2831853;}return a;
}
fn command(index:u32,time:f32)->f32{
 var cursor=clock[4];
 while(cursor+1u<params.range.y&&time>=program[cursor].times.y){cursor++;}
 clock[4]=cursor;let seg=program[cursor];
 let t=clamp((time-seg.times.x)/max(.000001,seg.times.y-seg.times.x),0.0,1.0);let e=t*t*(3.0-2.0*t);
 if(index<4u){return mix(seg.fromA[index],seg.toA[index],e);}return mix(seg.fromB[index-4u],seg.toB[index-4u],e);
}
fn anchors(j:Joint){
 let a=j.ids.x;let b=j.ids.y;let ra=rotate(s[a].q,j.a.xyz);let rb=rotate(s[b].q,j.b.xyz);
 let c=s[b].p.xyz+rb-s[a].p.xyz-ra;let distance=length(c);if(distance<1e-9){return;}let n=c/distance;
 let ga=cross(ra,n);let gb=cross(rb,n);
 let weight=cfg[a].comMass.w+cfg[b].comMass.w+angularWeight(a,ga)+angularWeight(b,gb);
 let impulse= -distance/max(weight,1e-9);
 s[a].p+=vec4f(-n*cfg[a].comMass.w*impulse,0);s[b].p+=vec4f(n*cfg[b].comMass.w*impulse,0);
 s[a].q=turn(s[a].q,-inverse(a,ga)*impulse);s[b].q=turn(s[b].q,inverse(b,gb)*impulse);
}
fn hinge(j:Joint){
 let a=j.ids.x;let b=j.ids.y;let aa=rotate(s[a].q,j.axis.xyz);let ab=rotate(s[b].q,j.axis.xyz);
 let c=cross(aa,ab);let len=length(c);
 if(len>1e-8){let n=c/len;let angle=atan2(len,dot(aa,ab));let impulse=angle/max(angularWeight(a,n)+angularWeight(b,n),1e-9);
 s[a].q=turn(s[a].q,inverse(a,n)*impulse);s[b].q=turn(s[b].q,-inverse(b,n)*impulse);}
 let angle=twist(j);let error=clamp(angle,j.a.w,j.b.w)-angle;
 if(abs(error)>1e-7){let n=rotate(s[a].q,j.axis.xyz);let impulse=error/max(angularWeight(a,n)+angularWeight(b,n),1e-9);
 s[a].q=turn(s[a].q,-inverse(a,n)*impulse);s[b].q=turn(s[b].q,inverse(b,n)*impulse);}
}
fn motor(k:u32){
 let j=joints[k];let a=j.ids.x;let b=j.ids.y;let axis=rotate(s[a].q,j.axis.xyz);let dt=params.options.x;
 let compliance=1.0/(j.motor.x*dt*dt);let weight=angularWeight(a,axis)+angularWeight(b,axis);
 let change=(motorTarget[k]-twist(j)-compliance*motorLambda[k])/(weight+compliance);
 let limit=j.motor.z*dt*dt;let next=clamp(motorLambda[k]+change,-limit,limit);let impulse=next-motorLambda[k];motorLambda[k]=next;
 s[a].q=turn(s[a].q,-inverse(a,axis)*impulse);s[b].q=turn(s[b].q,inverse(b,axis)*impulse);
}
fn center(box:Box)->vec3f{return s[box.ids.x].p.xyz+rotate(s[box.ids.x].q,box.center.xyz);}
fn getBox(i:u32)->Box{return Box(bitcast<vec4u>(collisionData[i*4u]),collisionData[i*4u+1u],collisionData[i*4u+2u],bitcast<vec4u>(collisionData[i*4u+3u]));}
fn support(box:Box,n:vec3f)->vec3f{
 let q=s[box.ids.x].q;let local=rotate(conj(q),n);var signs=sign(local);
 if(abs(local.x)<1e-6){signs.x=0;}if(abs(local.y)<1e-6){signs.y=0;}if(abs(local.z)<1e-6){signs.z=0;}
 return center(box)+rotate(q,box.halfSize.xyz*signs);
}
fn floorSupport(box:Box)->vec3f{
 let broad=support(box,vec3f(0,0,-1));if(broad.z>=0||box.floorRange.y==0u){return broad;}
 let q=s[box.ids.x].q;let direction=rotate(conj(q),vec3f(0,0,-1));var best= -1e10;var sum=vec3f(0);var count=0.0;
 for(var k=0u;k<box.floorRange.y;k++){
  let v=collisionData[box.floorRange.x+k].xyz;let d=dot(v,direction);
  if(d>best+1e-7){best=d;sum=v;count=1;}else if(abs(d-best)<=1e-7){sum+=v;count+=1;}
 }
 return s[box.ids.x].p.xyz+rotate(q,sum/max(1.0,count));
}
fn overlap(a:Box,b:Box)->vec4f{
 let qa=s[a.ids.x].q;let qb=s[b.ids.x].q;
 var ax=array<vec3f,3>(rotate(qa,vec3f(1,0,0)),rotate(qa,vec3f(0,1,0)),rotate(qa,vec3f(0,0,1)));
 var bx=array<vec3f,3>(rotate(qb,vec3f(1,0,0)),rotate(qb,vec3f(0,1,0)),rotate(qb,vec3f(0,0,1)));
 let delta=center(b)-center(a);var smallest=1e6;var normal=vec3f(0);
 for(var k=0u;k<15u;k++){
  var n=vec3f(0);if(k<3u){n=ax[k];}else if(k<6u){n=bx[k-3u];}else{n=cross(ax[(k-6u)/3u],bx[(k-6u)%3u]);}
  let len=length(n);if(len<1e-6){continue;}n/=len;
  var ra=0.0;var rb=0.0;for(var m=0u;m<3u;m++){ra+=a.halfSize[m]*abs(dot(ax[m],n));rb+=b.halfSize[m]*abs(dot(bx[m],n));}
  let depth=ra+rb-abs(dot(delta,n));if(depth<=0){return vec4f(0);}
  if(depth<smallest){smallest=depth;normal=select(-n,n,dot(delta,n)>=0);}
 }
 return vec4f(normal,smallest);
}
fn contacts(i:u32){
 var p=vec3f(0);var r=vec3f(0);var low=vec3f(0,0,1e6);var mask=0u;
 let first=cfg[i].info.y;let count=cfg[i].info.z;
 for(var k=first;k<first+count;k++){let v=floorSupport(getBox(k));if(v.z<low.z){low=v;}}
 if(low.z<0){
  let n=vec3f(0,0,1);let arm=low-s[i].p.xyz;let g=cross(arm,n);
  let lambda= -low.z/max(cfg[i].comMass.w+angularWeight(i,g),1e-9);
  p+=n*cfg[i].comMass.w*lambda;r+=inverse(i,g)*lambda;floorLambda[i]+=lambda;floorPoint[i]=vec4f(low,1);
 }
 // Persistent, force-limited static friction. A contact can roll or lift away;
 // there is no world-yaw lock and no constraint on an airborne foot.
 sliding[i]=0u;
 if(floorLambda[i]>0){
  var mapped=s[i].p.xyz+rotate(s[i].q,s[i].contactLocal.xyz);
  if(s[i].contactWorld.w==0||mapped.z>5e-5){
   s[i].contactLocal=vec4f(rotate(conj(s[i].q),low-s[i].p.xyz),0);s[i].contactWorld=vec4f(low.xy,0,1);mapped=low;tangentLambda[i]=vec2f(0);
  }
  let error=mapped.xy-s[i].contactWorld.xy;let distance=length(error);
  if(distance>1e-9){
   let n=vec3f(error/distance,0);let arm=mapped-s[i].p.xyz;let g=cross(arm,n);
   let change= -error/max(cfg[i].comMass.w+angularWeight(i,g),1e-9);
   let trial=tangentLambda[i]+change;let limit=cfg[i].origin.w*floorLambda[i];let norm=length(trial);
   let next=trial*min(1.0,limit/max(norm,1e-12));let delta=vec3f(next-tangentLambda[i],0);tangentLambda[i]=next;
   p+=cfg[i].comMass.w*delta;r+=inverse(i,cross(arm,delta));sliding[i]=select(0u,1u,norm>limit+1e-10);
  }
 }
 for(var other=0u;other<9u;other++){
  if(other==i||cfg[i].info.x==other+1u||cfg[other].info.x==i+1u){continue;}
  if(distance(s[i].p.xyz,s[other].p.xyz)>cfg[i].inverseI.w+cfg[other].inverseI.w){continue;}
  let ai=min(i,other);let bi=max(i,other);var best=vec4f(0);var point=vec3f(0);
  for(var ca=cfg[ai].info.y;ca<cfg[ai].info.y+cfg[ai].info.z;ca++){
   for(var cb=cfg[bi].info.y;cb<cfg[bi].info.y+cfg[bi].info.z;cb++){
    let ba=getBox(ca);let bb=getBox(cb);let hit=overlap(ba,bb);if(hit.w>best.w){best=hit;point=(support(ba,hit.xyz)+support(bb,-hit.xyz))*.5;}
   }
  }
  if(best.w<=0){continue;}mask|=1u<<other;let n=best.xyz;
  let ga=cross(point-s[ai].p.xyz,n);let gb=cross(point-s[bi].p.xyz,n);
  let weight=cfg[ai].comMass.w+cfg[bi].comMass.w+angularWeight(ai,ga)+angularWeight(bi,gb);
  let lambda=best.w/max(weight,1e-9);let direction=select(1.0,-1.0,i==ai);
  p+=direction*n*cfg[i].comMass.w*lambda;r+=direction*inverse(i,cross(point-s[i].p.xyz,n))*lambda;
 }
 dp[i]=vec4f(p*min(1.0,.01/max(length(p),1e-12)),0);dr[i]=vec4f(r,0);touchMask[i]=mask;
}
@compute @workgroup_size(16) fn step(@builtin(local_invocation_index) id:u32){
 if(id==0u){resetNow=select(0u,1u,clock[1]!=params.range.w);if(resetNow==1u){clock[0]=0u;clock[1]=params.range.w;clock[2]=0u;clock[3]=0u;clock[4]=0u;}}
 workgroupBarrier();
 if(id<9u){
  if(resetNow==1u){let extra=select(0.0,params.options.y-cfg[0].origin.z,params.options.y>0);
   s[id].p=vec4f(cfg[id].origin.xyz+cfg[id].comMass.xyz+vec3f(0,0,extra),0);s[id].q=vec4f(1,0,0,0);s[id].v=vec4f(0);s[id].w=vec4f(0);s[id].contactLocal=vec4f(0);s[id].contactWorld=vec4f(0);
  }else{s[id]=stored[id];}
 }
 workgroupBarrier();
 if(id==0u){stepBase=clock[0];}workgroupBarrier();
 let base=workgroupUniformLoad(&stepBase);let count=min(32u,params.range.x-min(params.range.x,base));
 let dt=params.options.x;
 for(var substep=0u;substep<count;substep++){
  if(id<9u){s[id].oldP=s[id].p;s[id].oldQ=s[id].q;s[id].v+=vec4f(0,0,-9.81*dt,0);floorLambda[id]=0;floorPoint[id]=vec4f(0);tangentLambda[id]=vec2f(0);sliding[id]=0u;}
  workgroupBarrier();
  if(id==0u){for(var k=0u;k<8u;k++){motorLambda[k]=0;motorTarget[k]=command(joints[k].ids.z,f32(clock[0])*dt);}}
  workgroupBarrier();
  if(id<9u){s[id].p+=vec4f(s[id].v.xyz*dt,0);s[id].q=turn(s[id].q,s[id].w.xyz*dt);}
  workgroupBarrier();
  for(var iteration=0u;iteration<u32(params.options.w);iteration++){
   if(id==0u){for(var k=0u;k<8u;k++){anchors(joints[k]);hinge(joints[k]);if(params.options.z>0){motor(k);}}}
   workgroupBarrier();
   if(id<9u){contacts(id);}
   workgroupBarrier();
   if(id<9u){s[id].p+=dp[id];s[id].q=turn(s[id].q,dr[id].xyz);}
   workgroupBarrier();
  }
  if(id<9u){
   s[id].v=vec4f((s[id].p.xyz-s[id].oldP.xyz)/dt,0);
   var q=mul(s[id].q,conj(s[id].oldQ));if(q.x<0){q= -q;}let len=length(q.yzw);
   s[id].w=vec4f(q.yzw*(2.0*atan2(len,q.x)/max(len*dt,1e-12)),0);
   if(floorPoint[id].w>0){
    let arm=floorPoint[id].xyz-s[id].p.xyz;let velocity=s[id].v.xyz+cross(s[id].w.xyz,arm);
    let tangent=vec3f(velocity.xy,0);let speed=length(tangent);
    if(speed>1e-8){let n=tangent/speed;let g=cross(arm,n);let remaining=max(0.0,cfg[id].origin.w*floorLambda[id]-length(tangentLambda[id]));let impulse=min(speed/max(cfg[id].comMass.w+angularWeight(id,g),1e-9),remaining/dt);
     s[id].v-=vec4f(n*cfg[id].comMass.w*impulse,0);s[id].w-=vec4f(inverse(id,g)*impulse,0);
    }
    if(sliding[id]>0u){let point=s[id].p.xyz+rotate(s[id].q,s[id].contactLocal.xyz);s[id].contactWorld=vec4f(point.xy,0,1);}
   }else{s[id].contactWorld.w=0;}
  }
  workgroupBarrier();
  if(id==0u&&params.options.z>0){for(var k=0u;k<8u;k++){
   let j=joints[k];let a=j.ids.x;let b=j.ids.y;let axis=rotate(s[a].q,j.axis.xyz);let weight=angularWeight(a,axis)+angularWeight(b,axis);
   let impulse= -j.motor.y*dt*dot(s[b].w.xyz-s[a].w.xyz,axis)/(1.0+j.motor.y*dt*weight);
   s[a].w-=vec4f(inverse(a,axis)*impulse,0);s[b].w+=vec4f(inverse(b,axis)*impulse,0);
  }}
  workgroupBarrier();
  if(id==0u){
   for(var k=0u;k<8u;k++){let b=joints[k].ids.y;s[b].w=vec4f(s[b].w.xyz,motorLambda[k]/(dt*dt));}
   clock[0]++;clock[2]=0u;clock[3]=0u;for(var k=0u;k<9u;k++){if(floorPoint[k].w>0){clock[2]++;}clock[3]+=countOneBits(touchMask[k]);}clock[3]/=2u;
  }
  workgroupBarrier();
 }
 if(id<9u){stored[id]=s[id];}
}
@compute @workgroup_size(32) fn transforms(@builtin(global_invocation_id) invocation:vec3u){
 let i=invocation.x;if(i>=params.range.z){return;}let link=links[i];let index=link.x;
 let root=stored[0].p.xyz-rotate(stored[0].q,cfg[0].comMass.xyz);var pos=vec3f(-root.xy,0);var q=vec4f(1,0,0,0);
 if(link.y<9u){let body=stored[link.y];q=body.q;pos+=body.p.xyz-rotate(q,cfg[link.y].comMass.xyz);}
 let len=length(q.yzw);var axis=vec3f(0,0,1);var angle=0.0;if(len>1e-9){axis=q.yzw/len;angle=2.0*atan2(len,q.x);}
 parts[index].offset=vec4f(pos*1000.0,1);parts[index].pivot=vec4f(0,0,0,angle);parts[index].options=vec4f(parts[index].options.x,axis);
}
// Independent diagnostic kernel: exercises the exact SAT used by contacts.
@compute @workgroup_size(16) fn probe(@builtin(local_invocation_index) id:u32){
 if(id<9u){s[id]=stored[id];}workgroupBarrier();
 if(id==0u){stored[0].v=overlap(getBox(0u),getBox(1u));}
}
@compute @workgroup_size(16) fn probeResolve(@builtin(local_invocation_index) id:u32){
 if(id<9u){s[id]=stored[id];}workgroupBarrier();
 if(id<2u){contacts(id);}workgroupBarrier();
 if(id<2u){s[id].p+=dp[id];s[id].q=turn(s[id].q,dr[id].xyz);}workgroupBarrier();
 if(id<9u){stored[id]=s[id];}
}
`;
