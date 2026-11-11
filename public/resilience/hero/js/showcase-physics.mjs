import { showcaseXml } from './showcase-rig.mjs?v=20261103-rest-contact';

export async function createShowcasePhysics(rig,showcase,seed,onFrame){
  const worker=new Worker(new URL('./showcase-worker.mjs?v=20261104-two-eyes',import.meta.url),{type:'module'});
  let latest,metadata,busy=false,goal=0,active=false,error=null,history=null,replaying=false,run=0,sentRun=0,needsReset=false,plannerOnce=false;const waiters=[];
  function cachedFrame(){
    if(!history||sentRun!==run||!history.length||goal>history.at(-1).time*1000+1e-6)return false;
    for(let i=history.length-1;i>=0;i--)if(history[i].time*1000<=goal+1e-6){latest=history[i];replaying=true;return true;}
    return false;
  }
  function flush(){if(error){for(const w of waiters.splice(0))w.reject(Error(error));}else if(latest&&!busy&&(replaying||Math.abs(goal-latest.time*1000)<2)){for(const w of waiters.splice(0))w.resolve();}}
  const ready=new Promise((resolve,reject)=>{
    worker.onerror=e=>{error=e.message;flush();reject(Error(error));};
    worker.onmessage=({data})=>{
      if(data.type==='error'){error=data.error;busy=false;flush();reject(Error(error));console.error(error);return;}
      if(data.type==='ready'){latest=data;metadata=data.model;resolve();return;}
      if(data.type==='frame'){
        latest=data;busy=false;
        // Replies still in flight from before the hero began are not history.
        if(history&&sentRun===run&&(!history.length||data.time>history.at(-1).time))history.push(data);
        cachedFrame();onFrame?.();
        if((active||needsReset)&&!replaying&&(sentRun!==run||Math.abs(goal-data.time*1000)>=2))send();
        flush();
      }
    };
  });
  function send(){if(busy||!latest||error)return;busy=true;sentRun=run;worker.postMessage({type:'advance',timeMs:goal,reset:needsReset});needsReset=false;}
  worker.postMessage({type:'init',rig,showcase,seed,xml:showcaseXml(rig,showcase.jointOrder)});await ready;
  return {
    advance(timeMs){active=true;goal=Math.max(0,timeMs);replaying=false;if(!cachedFrame()&&Math.abs(goal-latest.time*1000)>=2)send();flush();},
    // Recording starts from a fresh worker run, so replay never mixes runs.
    setHistory(durationMs,{once=false}={}){if(once!==plannerOnce){plannerOnce=once;worker.postMessage({type:'planner',showcase,seed,once});}history=durationMs?[]:null;replaying=false;run++;needsReset=!!history;if(history){goal=0;send();}},
    suspend(){active=false;},
    settled(){return new Promise((resolve,reject)=>{waiters.push({resolve,reject});flush();});},
    snapshot(){return {...latest,poses:Array.from(latest.poses),model:metadata,goalMs:goal,busy,error,history:history?{samples:history.length,replaying}:null};},
    get frame(){return latest;},destroy(){active=false;worker.terminate();},
  };
}
