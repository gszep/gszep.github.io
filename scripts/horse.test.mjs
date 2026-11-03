import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHorse, stepHorse, horseBlocks, hopHorse, HORSE_STEP, HORSE_MODES } from '../src/components/interactive/horse-model.ts';

const defaults={speed:1,gravity:9.8,goofy:.55,mode:'flail'};

test('gravity changes acceleration independently of the spring force',()=>{
  const earth=createHorse(),moon=createHorse();
  stepHorse(earth,{...defaults,speed:0,gravity:9.8});
  stepHorse(moon,{...defaults,speed:0,gravity:2});
  assert.equal(earth.springForce,moon.springForce);
  assert.ok(Math.abs(moon.velocity-earth.velocity-7.8*HORSE_STEP)<1e-10);
  assert.ok(Math.abs(moon.height-earth.height-7.8*HORSE_STEP**2)<1e-10);
});

test('compressed body spring supplies the calculated spring/damper force',()=>{
  const state=createHorse();state.height=1.45;state.velocity=-.2;
  const settings={...defaults,speed:0};
  const expectedForce=260*(1.98-1.45)-18*(-.2);
  stepHorse(state,settings);
  const velocity=-.2+(expectedForce/8-settings.gravity)*HORSE_STEP;
  assert.ok(Math.abs(state.springForce-expectedForce)<1e-10);
  assert.ok(Math.abs(state.velocity-velocity)<1e-10);
  assert.ok(Math.abs(state.height-(1.45+velocity*HORSE_STEP))<1e-10);
});

test('movement modes cannot affect the body spring, even when switched mid-bounce',()=>{
  const reference=createHorse(),other=createHorse();
  for(let i=0;i<2400;i++){
    stepHorse(reference,defaults);
    stepHorse(other,{...defaults,mode:HORSE_MODES[Math.floor(i/37)%3]});
    assert.deepEqual(other,reference);
  }
});

test('all control extremes stay finite and the body remains above the floor',()=>{
  for(const gravity of [2,9.8,16])for(const speed of [.45,1,2])for(const goofy of [0,1]){
    const state=createHorse(),settings={...defaults,gravity,speed,goofy};
    let low=Infinity,high=-Infinity;
    for(let i=0;i<2400;i++){
      stepHorse(state,settings);
      assert.ok(Object.values(state).every(Number.isFinite));
      assert.ok(Math.abs(state.springForce)<=400);
      low=Math.min(low,state.height);high=Math.max(high,state.height);
    }
    assert.ok(low>.6 && high<7,JSON.stringify({gravity,speed,goofy,low,high}));
    assert.ok(high-low>.08,'spring is visibly bouncing');
  }
});

test('modes have distinct poses; Naruto forelegs trail and paddles make full turns',()=>{
  const state=createHorse();state.phase=.8;
  const poses=HORSE_MODES.map(mode=>horseBlocks(state,{...defaults,mode}));
  assert.notDeepEqual(poses[0],poses[1]);assert.notDeepEqual(poses[1],poses[2]);
  let low=Infinity,high=-Infinity;
  for(let i=0;i<120;i++){
    state.phase=i/120*Math.PI*2;
    const naruto=horseBlocks(state,{...defaults,mode:'naruto'});
    const lean=naruto.find(b=>b.id===0).angle;
    for(const id of [16,19])assert.ok(Math.cos(naruto.find(b=>b.id===id).angle-lean)<-.85);
    const paddle=horseBlocks(state,{...defaults,mode:'paddle'});
    const angle=paddle.find(b=>b.id===10).angle;
    low=Math.min(low,angle);high=Math.max(high,angle);
    for(const mode of HORSE_MODES)for(const block of horseBlocks(state,{...defaults,mode})){
      assert.ok([...block.center,...block.size,block.angle].every(Number.isFinite));
    }
  }
  assert.ok(high-low>6,'paddle rotates, rather than swinging back and forth');
});

test('hop is bounded and reset reproduces the default drawing',()=>{
  const a=createHorse(),b=createHorse();
  assert.deepEqual(horseBlocks(a,defaults),horseBlocks(b,defaults));
  hopHorse(a);assert.ok(a.velocity>0);
  for(let i=0;i<50;i++)hopHorse(a);
  assert.equal(a.velocity,4.3);
  for(let i=0;i<120;i++)stepHorse(a,defaults);
  assert.ok(Number.isFinite(a.height));
  assert.deepEqual(createHorse(),b);
});
