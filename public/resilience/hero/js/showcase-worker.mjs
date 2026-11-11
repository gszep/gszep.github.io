// Single-robot MuJoCo CPU/WASM physics. No renderer or detailed visual meshes.
import loadMuJoCo from '../vendor/mujoco-3.10.0/mujoco.js';
import { createRobotShowcase,seededShowcaseRandom } from './robot-showcase.mjs?v=20261104-two-eyes';
let mj,model,data,rig,show,order,bodyIds,targets,jointAddresses,steps=0,computeMs=0;
const numbers=(v,n)=>ArrayBuffer.isView(v)?Array.from(v).slice(0,n):Array.from({length:n},(_,i)=>v.get(i));
const scalar=(v,i,x)=>ArrayBuffer.isView(v)?v[i]=x:v.set(i,x);
function reset(){mj.mj_resetData(model,data);steps=0;computeMs=0;mj.mj_forward(model,data);}
function frame(){
  mj.mj_forward(model,data);
  const pos=numbers(data.xpos,model.nbody*3),quat=numbers(data.xquat,model.nbody*4);
  const poses=new Float32Array(bodyIds.flatMap(i=>[...pos.slice(i*3,i*3+3),...quat.slice(i*4,i*4+4)]));
  const time=data.time,playback=show.frame(time*1000);
  const qpos=numbers(data.qpos,model.nq);
  const jointDegrees=Object.fromEntries(order.map((name,i)=>[name,90+qpos[jointAddresses[i]]/rig.scales[name]*180/Math.PI]));
  return {poses,time,playback,ncon:data.ncon,jointDegrees,qpos,qvel:numbers(data.qvel,model.nv),ctrl:numbers(data.ctrl,model.nu),steps,computeMs};
}
self.onmessage=async({data:message})=>{
  try{
    if(message.type==='init'){
      rig=message.rig;order=message.showcase.jointOrder;show=createRobotShowcase(message.showcase,seededShowcaseRandom(message.seed));
      mj=await loadMuJoCo();const vfs=new mj.MjVFS();model=mj.MjModel.from_xml_string(message.xml,vfs);vfs.delete();data=new mj.MjData(model);
      bodyIds=rig.names.map(n=>mj.mj_name2id(model,mj.mjtObj.mjOBJ_BODY.value,n));
      targets=order.map(n=>mj.mj_name2id(model,mj.mjtObj.mjOBJ_ACTUATOR.value,n));reset();
      const addresses=numbers(model.jnt_qposadr,model.njnt);
      jointAddresses=order.map(n=>addresses[mj.mj_name2id(model,mj.mjtObj.mjOBJ_JOINT.value,n)]);
      const state=frame();postMessage({type:'ready',...state,model:{engine:'mujoco-wasm',version:mj.mj_versionString(),bodies:model.nbody-1,joints:model.njnt-1,geoms:model.ngeom,actuators:model.nu,timestep:model.opt.timestep,gravity:numbers(model.opt.gravity,3),rigScope:rig.scope}},[state.poses.buffer]);
    }else if(message.type==='planner'){
      show=createRobotShowcase(message.showcase,seededShowcaseRandom(message.seed),{once:message.once});
    }else if(message.type==='advance'){
      const goal=Math.max(0,message.timeMs/1000);
      if(message.reset||goal+1e-6<data.time)reset();
      const start=performance.now();
      while(data.time+model.opt.timestep<=goal+1e-9){
        const command=show.frame(data.time*1000);
        for(let i=0;i<order.length;i++)scalar(data.ctrl,targets[i],(command.angles[order[i]]-90)*Math.PI/180*rig.scales[order[i]]);
        mj.mj_step(model,data);steps++;
      }
      computeMs+=performance.now()-start;
      const state=frame();postMessage({type:'frame',...state},[state.poses.buffer]);
    }else if(message.type==='drop'){
      // Offline/browser regression hook: release actuators and verify gravity.
      reset();scalar(data.qpos,2,message.heightM);mj.mj_forward(model,data);
      for(let i=0;i<model.nu;i++){scalar(model.actuator_gainprm,i*10,0);scalar(model.actuator_biasprm,i*10+1,0);scalar(model.actuator_biasprm,i*10+2,0);}
      for(let i=0;i<Math.round(message.seconds/model.opt.timestep);i++)mj.mj_step(model,data);
      const state=frame();postMessage({type:'drop-result',...state},[state.poses.buffer]);
    }
  }catch(error){postMessage({type:'error',error:String(error?.stack??error)});}
};
