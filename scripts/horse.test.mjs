import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHorse, stepHorse, horseBlocks, hopHorse, HORSE_STEP } from '../src/components/interactive/horse-model.ts';

test('airborne body follows independently calculated fixed-step gravity',()=>{
  const state=createHorse();state.height=10;
  const settings={speed:1,gravity:9.8,goofy:.5},n=12;
  for(let i=0;i<n;i++)stepHorse(state,settings);
  const descent=settings.gravity*HORSE_STEP**2*n*(n+1)/2;
  assert.ok(Math.abs(state.height-(10-descent))<1e-10);
  assert.ok(Math.abs(state.velocity+settings.gravity*n*HORSE_STEP)<1e-10);
  assert.equal(state.contacts,0);
});

test('default gait alternates support and flight and bends all four legs',()=>{
  const state=createHorse(),settings={speed:1,gravity:9.8,goofy:.55};
  let air=0,support=0;const angles=new Map();
  for(let i=0;i<1200;i++){
    stepHorse(state,settings);
    state.contacts? support++ : air++;
    for(const block of horseBlocks(state,settings)){
      if([10,13,16,19].includes(block.id)){
        const range=angles.get(block.id)||[Infinity,-Infinity];
        range[0]=Math.min(range[0],block.angle);range[1]=Math.max(range[1],block.angle);angles.set(block.id,range);
      }
    }
  }
  assert.ok(air>30 && support>30);
  assert.equal(angles.size,4);
  for(const [low,high] of angles.values())assert.ok(high-low>.3);
});

test('control extremes remain finite and hoof penetration is bounded',()=>{
  for(const gravity of [2,9.8,16])for(const speed of [.45,1,2])for(const goofy of [0,1]){
    const state=createHorse(),settings={gravity,speed,goofy};
    for(let i=0;i<1200;i++){
      stepHorse(state,settings);
      assert.ok(Object.values(state).every(Number.isFinite));
      assert.ok(state.height>=.72 && state.height<6);
      for(const block of horseBlocks(state,settings).filter(b=>[12,15,18,21].includes(b.id))){
        const bottom=block.center[1]-Math.abs(Math.sin(block.angle))*block.size[0]/2-Math.abs(Math.cos(block.angle))*block.size[1]/2;
        assert.ok(bottom>-.15,`hoof penetrates floor: ${bottom}`);
      }
    }
  }
});

test('hop applies a bounded impulse, and reset reproduces the sketch',()=>{
  const a=createHorse(),b=createHorse(),settings={speed:1,gravity:9.8,goofy:.55};
  assert.deepEqual(horseBlocks(a,settings),horseBlocks(b,settings));
  hopHorse(a);assert.ok(a.velocity>0);
  for(let i=0;i<50;i++)hopHorse(a);
  assert.equal(a.velocity,4.3);
  for(let i=0;i<120;i++)stepHorse(a,settings);
  assert.ok(Number.isFinite(a.height));
  assert.deepEqual(createHorse(),b);
});
