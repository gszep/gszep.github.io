// Finite stock target commands, not achieved poses. The two-second idle begins
// AFTER a command sequence finishes; MuJoCo determines actual body motion.
export const SHOWCASE_RISE_MS=2200,SHOWCASE_GAP_MS=2000;
export function seededShowcaseRandom(seed){let value=seed>>>0;return ()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};}
const smooth=x=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
const mix=(a,b,t)=>Object.fromEntries(Object.keys(a).map(k=>[k,a[k]+(b[k]-a[k])*t]));
// once: perform the first preset, then sit back down to Rest and stay there.
export function createRobotShowcase(data,random=Math.random,{once=false}={}){
  const pose=name=>Object.fromEntries(data.jointOrder.map((id,i)=>[id,data.sequences[name][0].degrees[i]]));
  const rest=pose('rest'),stand=pose('stand'),history=[];
  const compile=name=>{
    let previous={...stand},time=0;const segments=[];
    for(const step of data.sequences[name]){
      const target=Object.fromEntries(data.jointOrder.map((id,i)=>[id,step.degrees[i]<0?previous[id]:step.degrees[i]]));
      const distance=Math.max(...data.jointOrder.map(id=>Math.abs(target[id]-previous[id])));
      if(distance){const duration=Math.max(180,distance/180*650);segments.push({start:time,end:time+duration,from:previous,to:target});time+=duration;}
      if(step.waitMs){segments.push({start:time,end:time+step.waitMs,from:target,to:target});time+=step.waitMs;}
      previous=target;
    }
    if(data.jointOrder.some(id=>previous[id]!==stand[id])){segments.push({start:time,end:time+650,from:previous,to:stand});time+=650;}
    return {name,segments,duration:time};
  };
  const presets=data.presets.map(compile);
  function frame(elapsed){
    const t=Math.max(0,elapsed);
    if(t<SHOWCASE_RISE_MS)return {phase:'rise',name:null,angles:mix(rest,stand,smooth(t/SHOWCASE_RISE_MS)),face:null,faceOn:false,nextStartMs:SHOWCASE_RISE_MS+SHOWCASE_GAP_MS};
    let end=SHOWCASE_RISE_MS,index=0;
    while(true){
      if(once&&index===1){
        const local=t-end;
        return local<SHOWCASE_RISE_MS?{phase:'sit',name:null,angles:mix(stand,rest,smooth(local/SHOWCASE_RISE_MS)),face:'stand',faceOn:true,startMs:end,endMs:end+SHOWCASE_RISE_MS}:{phase:'rest',name:null,angles:{...rest},face:null,faceOn:false,startMs:end+SHOWCASE_RISE_MS};
      }
      const start=end+SHOWCASE_GAP_MS;
      if(t<start)return {phase:'idle',name:null,angles:{...stand},face:'stand',faceOn:true,finishedAtMs:end,nextStartMs:start,cycle:index};
      if(!history[index]){
        const choices=presets.filter(p=>p.name!==history[index-1]?.name);
        history.push(choices[Math.min(choices.length-1,Math.floor(random()*choices.length))]);
      }
      const preset=history[index];end=start+preset.duration;
      if(t<end){
        const local=t-start,segment=preset.segments.find(s=>local<s.end);
        return {phase:'animation',name:preset.name,angles:mix(segment.from,segment.to,smooth((local-segment.start)/(segment.end-segment.start))),face:preset.name,faceOn:true,startMs:start,endMs:end,nextStartMs:end+SHOWCASE_GAP_MS,cycle:index};
      }
      index++;
    }
  }
  function commands(until){
    frame(until);const result=[{start:0,end:SHOWCASE_RISE_MS,from:rest,to:stand},{start:SHOWCASE_RISE_MS,end:SHOWCASE_RISE_MS+SHOWCASE_GAP_MS,from:stand,to:stand}];
    let start=SHOWCASE_RISE_MS+SHOWCASE_GAP_MS;
    for(const preset of history){
      for(const segment of preset.segments)result.push({...segment,start:start+segment.start,end:start+segment.end});
      start+=preset.duration;
      if(once){result.push({start,end:start+SHOWCASE_RISE_MS,from:stand,to:rest},{start:start+SHOWCASE_RISE_MS,end:start+SHOWCASE_RISE_MS+1e7,from:rest,to:rest});break;}
      result.push({start,end:start+SHOWCASE_GAP_MS,from:stand,to:stand});start+=SHOWCASE_GAP_MS;
    }
    return result;
  }
  return {frame,commands,once,presets:presets.map(({name,duration})=>({name,duration}))};
}
