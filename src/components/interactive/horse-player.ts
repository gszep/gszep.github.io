import { createHorse, stepHorse, hopHorse, HORSE_STEP, type HorseSettings, type HorseMode } from './horse-model';
import { HorseDrawing } from './horse-drawing';

export function initHorse(root:HTMLElement) {
  const canvas=root.querySelector('canvas')!;
  const play=root.querySelector<HTMLButtonElement>('[data-play]')!;
  const speed=root.querySelector<HTMLInputElement>('[data-speed]')!;
  const gravity=root.querySelector<HTMLInputElement>('[data-gravity]')!;
  const goofy=root.querySelector<HTMLInputElement>('[data-goofy]')!;
  const shading=root.querySelector<HTMLInputElement>('[data-shading]')!;
  const status=root.querySelector<HTMLElement>('[data-status]')!;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const modeButtons=[...root.querySelectorAll<HTMLButtonElement>('[data-mode]')];
  let mode:HorseMode='flail';
  let state=createHorse(),yaw=-.58,elevation=.18;
  let running=!reduced.matches,visible=false,frame=0,last=0,accumulator=0;
  let drag:{id:number;x:number;y:number}|null=null;
  let drawing:HorseDrawing;
  const settings=():HorseSettings=>({speed:Number(speed.value),gravity:Number(gravity.value),goofy:Number(goofy.value)/100,mode});
  const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;accumulator=0;};
  const request=()=>{if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(tick);};
  function setRunning(value:boolean){
    running=value;play.textContent=value?'Pause':'Go!';play.setAttribute('aria-pressed',String(value));last=0;request();
  }
  function tick(now:number){
    frame=0;
    if(!visible||document.hidden)return;
    if(running&&last&&now-last<1000/24){request();return;}
    const elapsed=last?Math.min(.06,(now-last)/1000):0;last=now;
    const s=settings();
    if(running){
      accumulator+=elapsed;
      let steps=0;
      while(accumulator>=HORSE_STEP&&steps<8){stepHorse(state,s);accumulator-=HORSE_STEP;steps++;}
    }else accumulator=0;
    drawing.draw(state,s,yaw,elevation,shading.checked);
    root.dataset.ready='';
    root.querySelector('[data-bounce]')!.textContent=state.time===0?'ready to boing':state.springForce>1?'spring pushing':state.springForce< -1?'spring pulling':'boing';
    if(running)request();else last=0;
  }
  function resize(){
    const rect=canvas.getBoundingClientRect();
    const dpr=Math.min(devicePixelRatio||1,1.5,Math.sqrt(1_100_000/Math.max(1,rect.width*rect.height)));
    const width=Math.max(1,Math.round(rect.width*dpr)),height=Math.max(1,Math.round(rect.height*dpr));
    if(canvas.width!==width||canvas.height!==height){
      canvas.width=width;canvas.height=height;
      // Resizing clears an opaque canvas to black. Repaint the current pose in
      // the same callback rather than exposing a blank frame until the next tick.
      drawing.draw(state,settings(),yaw,elevation,shading.checked);
      root.dataset.ready='';
    }
    request();
  }
  function update(){
    root.querySelector<HTMLOutputElement>('[data-speed-label]')!.value=`${Number(speed.value).toFixed(2)}×`;
    root.querySelector<HTMLOutputElement>('[data-gravity-label]')!.value=Number(gravity.value).toFixed(1);
    root.querySelector<HTMLOutputElement>('[data-goofy-label]')!.value=`${goofy.value}%`;
    request();
  }
  function hop(){hopHorse(state);setRunning(true);}
  function selectMode(next:HorseMode){
    mode=next;root.dataset.moveMode=mode;
    modeButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
    root.querySelector('[data-mode-note]')!.textContent={
      flail:'One invisible body spring. Four completely unhelpful legs.',
      naruto:'Lean forward. Front legs swept back. Hind legs doing their best.',
      paddle:'Four rotating paddles. Same spring. Questionable nautical credentials.',
    }[mode];
    request();
  }
  modeButtons.forEach(button=>button.addEventListener('click',()=>selectMode(button.dataset.mode as HorseMode)));
  play.addEventListener('click',()=>setRunning(!running));
  root.querySelector('[data-hop]')!.addEventListener('click',hop);
  root.querySelector('[data-reset]')!.addEventListener('click',()=>{
    state=createHorse();yaw=-.58;elevation=.18;accumulator=0;
    [speed,gravity,goofy].forEach(input=>input.value=input.defaultValue);shading.checked=true;
    selectMode('flail');
    update();setRunning(!reduced.matches);
  });
  [speed,gravity,goofy,shading].forEach(input=>input.addEventListener('input',update));
  canvas.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button!==0)return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    yaw+=(event.clientX-drag.x)*.008;
    elevation=Math.max(-.08,Math.min(.65,elevation+(event.clientY-drag.y)*.004));
    drag.x=event.clientX;drag.y=event.clientY;request();
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,event=>{
    if(drag?.id===(event as PointerEvent).pointerId)drag=null;
  });
  canvas.addEventListener('keydown',event=>{
    if(![' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','h','H'].includes(event.key))return;
    event.preventDefault();
    if(event.key===' ')setRunning(!running);
    if(event.key.toLowerCase()==='h')hop();
    if(event.key==='ArrowLeft')yaw-=.12;
    if(event.key==='ArrowRight')yaw+=.12;
    if(event.key==='ArrowUp')elevation=Math.min(.65,elevation+.06);
    if(event.key==='ArrowDown')elevation=Math.max(-.08,elevation-.06);
    if(event.key==='Home'){yaw=-.58;elevation=.18;}
    request();
  });
  try { drawing=new HorseDrawing(canvas); }
  catch(error){status.textContent='The live drawing could not start. The still sketch is shown instead.';console.warn(error);return;}
  root.querySelector('fieldset')!.disabled=false;status.hidden=true;
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)request();else stop();});
  observer.observe(canvas);
  const resizer=new ResizeObserver(resize);resizer.observe(canvas);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():request());
  reduced.addEventListener('change',()=>{if(reduced.matches)setRunning(false);});
  addEventListener('pagehide',event=>{stop();if(!event.persisted){observer.disconnect();resizer.disconnect();}});
  addEventListener('pageshow',request);
  selectMode(mode);update();setRunning(running);
}
