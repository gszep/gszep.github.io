// A worked example, never device telemetry or physical calibration.
export const EXAMPLE_SWAP = [2, 3];
import { STANDING_REFERENCE } from './servo-angle-guide.mjs?v=20261030-servo-fit';
export { STANDING_REFERENCE };
const clamp = x => Math.max(0, Math.min(1, x));
const SLOT = 2400;
const RUN = SLOT * 8;
export const DEMO_TIMING = {slot:SLOT,run:RUN,exampleLoop:RUN+2200,
  zeroStart:2000+RUN,hornStart:3000+RUN,returnStart:4400+RUN,fixDone:5200+RUN,loadRun:12600};
export function servoInstructionFrame(api, step, substep, elapsed, showcase=null) {
  const rows = api.joint_map;
  if (rows.length !== 8 || new Set(rows.map(r=>r.target_pca_channel)).size !== 8 ||
      rows.some(r=>!Number.isInteger(r.target_pca_channel)||r.target_pca_channel<0||r.target_pca_channel>7)) throw Error('Invalid CH0–7 reference map');
  const neutral = api.pulse.neutral_deg;
  const ids = rows.map(r=>r.name);
  const expected = Object.fromEntries(rows.map(r=>[r.name,r.target_pca_channel]));
  const byChannel = Object.fromEntries(rows.map(r=>[r.target_pca_channel,r.name]));
  const swapped = Object.fromEntries(rows.map(r=>[r.name,EXAMPLE_SWAP.includes(r.target_pca_channel) ? 5-r.target_pca_channel : r.target_pca_channel]));
  const wrongHorn = byChannel[3];
  const s = { selectedId:null, view:'all', neutralDeg:neutral, power:'off', channels:{...expected},guideStep:step,guideSubstep:substep,
     connectedIds:[...ids], activeIds:[], angles:Object.fromEntries(ids.map(id=>[id,neutral])),expectedAngles:Object.fromEntries(ids.map(id=>[id,neutral])),
    statuses:Object.fromEntries(ids.map(id=>[id,'idle'])), servosVisible:true,clockJumperVisible:false,clockProgress:0,hornsVisible:true, hornAttach:1,
    connectionProgress:1, usbProgress:1, batteryProgress:0, hornAttachById:{}, connectionProgressById:{},
    example:false, commandedChannel:null, correction:null, zeroGuideId:null,zeroCommand:0,neutralCommand:neutral,
    assemblyStage:0,upperProgress:1,lowerProgress:1,footAssemblyProgress:0,footGapOpening:0,ribbonFold:0,lowerPartsVisible:true,standingReference:false,standingProgress:0,frameMountProgress:0,spacersVisible:false,spacerProgress:0,pcbVisible:true,pcbProgress:1,routeView:false,coverVisible:false,coverProgress:0,headVisible:false,headProgress:0,headOnly:false,lidVisible:false,lidProgress:0,frameBatteryVisible:false,batteryInsertProgress:0,batteryConnectProgress:0 };
  const t = Math.max(0,elapsed);
  function sequence(time, map, orientationFault) {
    s.channels={...map};
    const current = Math.min(7,Math.floor(time/SLOT));
    for(let channel=0;channel<8;channel++) {
      const actual=ids.find(id=>map[id]===channel);
      if(time >= (channel+1)*SLOT)
        s.statuses[actual] = actual!==byChannel[channel] || (orientationFault&&actual===wrongHorn) ? 'incorrect' : 'success';
    }
    if(time<RUN) {
      s.commandedChannel=current;
      const actual=ids.find(id=>map[id]===current);
      s.activeIds=[actual];
      s.statuses[actual]='active';
      // Time-compressed illustration of the full bench sequence, not hardware timing.
      const targets=[0,neutral,180,neutral],from=[neutral,0,neutral,180];
      const pose=Math.min(3,Math.floor((time%SLOT)/(SLOT/4)));
      const fraction=clamp(((time%SLOT)%(SLOT/4))/400);
       s.angles[actual]=from[pose]+(targets[pose]-from[pose])*fraction;
       s.expectedAngles[byChannel[current]]=s.angles[actual];
    }
    if(orientationFault)s.angles[wrongHorn]+=25; // illustrative horn indexing error
  }
  if(step===29) {
    s.servosVisible=false;s.hornsVisible=false;s.connectedIds=[];
    s.clockJumperVisible=true;s.clockProgress=1;
    if(substep===0)s.clockProgress=clamp(t/1500);
    if(substep===1){s.power='usb';s.usbProgress=clamp(t/1200);}
    if(substep===2){s.clockProgress=1-clamp(t/1500);s.clockJumperVisible=t<1600;}
  } else if(step===30) {
    if(substep===0){s.hornsVisible=false;s.connectionProgress=clamp(t/1800);}
    else s.hornAttach=clamp(t/1200);
  } else if(step===31 && substep<4) {
    s.power='usb';
     if(substep===0)s.usbProgress=clamp(t/1500);
     if(substep===1){s.example=true;sequence(Math.min(t,RUN),expected,false);}
    if(substep===2){s.example=true;sequence(t%DEMO_TIMING.exampleLoop,swapped,true);}
    if(substep===3) {
      s.example=true;
      if(t<2000) {
        s.power='off';s.channels=t<1000?swapped:expected;s.correction='swap';
        for(const ch of EXAMPLE_SWAP)s.connectionProgressById[byChannel[ch]]=t<1000?1-t/1000:(t-1000)/1000;
        s.angles[wrongHorn]+=25;
      } else if(t<2000+RUN) {
        s.correction='zero';sequence(t-2000,expected,true);
      } else if(t<DEMO_TIMING.hornStart) {
        s.correction='zero';s.zeroGuideId=wrongHorn;s.commandedChannel=3;s.activeIds=[wrongHorn];
         s.angles[wrongHorn]=neutral*(1-clamp((t-DEMO_TIMING.zeroStart)/800))+25;
         s.expectedAngles[wrongHorn]=s.angles[wrongHorn]-25;
        for(const id of ids)s.statuses[id]=id===wrongHorn?'incorrect':'success';
      } else if(t<DEMO_TIMING.returnStart) {
        s.power='off';s.correction='horn';
        s.zeroGuideId=wrongHorn;const u=t-DEMO_TIMING.hornStart;
        s.hornAttachById[wrongHorn]=u<400?1-u/400:u<1000?0:clamp((u-1000)/400);
         s.angles[wrongHorn]=25*(1-clamp((u-400)/600));
         s.expectedAngles[wrongHorn]=0;
        for(const id of ids)s.statuses[id]=id===wrongHorn?'incorrect':'success';
      } else {
        s.correction='aligned';for(const id of ids)s.statuses[id]='success';
         s.angles[wrongHorn]=neutral*clamp((t-DEMO_TIMING.returnStart)/800);
         s.expectedAngles[wrongHorn]=s.angles[wrongHorn];
      }
    }
  } else if(step===31) {
    if(substep===4){s.usbProgress=1-clamp(t/1200);s.power=t<1300?'usb':'off';}
    if(substep===5)s.batteryProgress=clamp(t/1800);
    if(substep===6){
      s.power='battery';s.batteryProgress=1;s.example=true;s.loadTest=true;
      const targets=[60,120,60,120,60,120,neutral],stage=Math.min(6,Math.floor(t/1800));
      const from=stage?targets[stage-1]:neutral,value=from+(targets[stage]-from)*clamp((t-stage*1800)/1000);
       for(const id of ids){s.angles[id]=value;s.expectedAngles[id]=value;s.statuses[id]=t<DEMO_TIMING.loadRun?'active':'idle';}
      if(t<DEMO_TIMING.loadRun)s.activeIds=[...ids];
    }
    if(substep===7)s.batteryProgress=1-clamp(t/1800);
  } else if(step>=32 && step<=36) {
    s.assemblyStage=step===32?1:step>=34?3:2;
    if(step===32)s.upperProgress=substep===0?0:clamp(t/1800);
    if(step===33){
      s.footAssemblyProgress=substep===0?clamp(t/2200):1;
      s.lowerPartsVisible=substep>0;
      s.lowerProgress=substep<2?0:clamp(t/1800);
      const ease=x=>{const u=clamp(x);return u*u*(3-2*u);};
      if(substep===1){s.ribbonFold=ease(t/900);s.footGapOpening=1.4*s.ribbonFold;}
      if(substep===2){s.ribbonFold=1-ease((t-1800)/600);s.footGapOpening=1.4*(1-ease((t-2000)/500));}
    }
    if(step===33&&substep===3){
      const u=clamp(t/2200);s.standingProgress=u*u*(3-2*u);
      s.lowerProgress=1;s.standingReference=true;s.example=true;
      s.angles=Object.fromEntries(ids.map(id=>[id,neutral+(STANDING_REFERENCE[id]-neutral)*s.standingProgress]));s.expectedAngles={...s.angles};
    }
    if(step===34){
      s.servosVisible=substep>=1;s.spacersVisible=substep>=2;s.pcbVisible=substep>=3;s.routeView=substep===5;s.coverVisible=substep>=6;
      s.frameBatteryVisible=substep>=4;s.batteryInsertProgress=substep===4?clamp(t/1600):substep>4?1:0;
      s.batteryConnectProgress=substep===4?clamp((t-1800)/1000):substep>4?1:0;
      s.frameMountProgress=substep===1?clamp(t/1800):substep>1?1:0;
      s.spacerProgress=substep===2?clamp(t/1800):substep>2?1:0;
      s.pcbProgress=substep===3?clamp(t/1800):substep>3?1:0;
      s.coverProgress=substep===6?clamp(t/1800):substep>6?1:0;
    }
    if(step===35){
      s.frameBatteryVisible=true;s.batteryInsertProgress=s.batteryConnectProgress=1;
      s.frameMountProgress=1;s.spacersVisible=true;s.spacerProgress=1;
      s.pcbVisible=true;s.pcbProgress=1;s.coverVisible=true;s.coverProgress=1;
      s.headVisible=true;s.headProgress=substep===0?0:substep===1?clamp(t/2200):1;
      s.headOnly=substep===0;s.routeView=false;s.lidVisible=substep===4;
      s.oledVisible=substep>=2;s.switchVisible=substep>=3;
      s.oledProgress=substep>2?1:substep===2?clamp(t/2200):0;
      s.switchProgress=substep>3?1:substep===3?clamp(t/2200):0;
      s.lidProgress=substep===4?clamp(t/2200):0;
      if(s.headOnly){s.servosVisible=false;s.pcbVisible=false;s.spacersVisible=false;s.coverVisible=false;}
    }
    if(step===36){
      s.frameBatteryVisible=true;s.batteryInsertProgress=s.batteryConnectProgress=1;
      s.frameMountProgress=s.spacerProgress=s.pcbProgress=s.coverProgress=s.headProgress=s.lidProgress=1;
      s.spacersVisible=s.pcbVisible=s.coverVisible=s.headVisible=s.lidVisible=s.oledVisible=s.switchVisible=true;
      s.oledProgress=s.switchProgress=1;s.standingReference=true;s.standingProgress=clamp(t/2200);s.showcase=true;
      s.angles=showcase?.angles??Object.fromEntries(ids.map(id=>[id,neutral+(STANDING_REFERENCE[id]-neutral)*s.standingProgress]));
      s.expectedAngles={...s.angles};s.faceOn=showcase?.faceOn??t>=2200;s.face=showcase?.face??'stand';
      s.showcasePlayback=showcase;
    }
  }
  return s;
}
