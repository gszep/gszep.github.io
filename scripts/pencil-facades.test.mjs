// Node 22: node --experimental-strip-types --test scripts/pencil-facades.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { insideFace, planarStroke } from '../src/components/interactive/pencil-facades.ts';

const square=[{x:0,y:0},{x:100,y:0},{x:100,y:100},{x:0,y:100}];

test('brush footprint stays on its own face, in either winding',()=>{
  for (const polygon of [square,[...square].reverse()]) {
    assert.equal(insideFace({x:50,y:50},polygon,6),true);
    assert.equal(insideFace({x:3,y:50},polygon,6),false);
    assert.equal(insideFace({x:-10,y:50},polygon,0),false);
    assert.equal(insideFace({x:105,y:50},polygon,0),false);
    assert.equal(insideFace({x:6,y:50},polygon,6),true);
  }
});

test('stroke ends naturally before its brush crosses a crease',()=>{
  const path=planarStroke({x:60,y:50},0,80,2,0,square,7);
  assert.ok(path.length>=3);
  assert.ok(path.at(-1).x<=93);
  assert.ok(path.at(-1).x>=90);
  for (const p of path) assert.equal(insideFace(p,square,7),true);
  for (let i=1;i<path.length;i++) assert.ok(path[i].x>path[i-1].x,'no curling back');
});

test('edge-on faces and strokes with insufficient room are omitted',()=>{
  const collapsed=[{x:0,y:0},{x:50,y:0},{x:100,y:0}];
  assert.equal(insideFace({x:50,y:0},collapsed,0),false);
  assert.deepEqual(planarStroke({x:99,y:50},0,40,0,0,square,4),[]);
  const sliver=[{x:0,y:0},{x:100,y:20},{x:100,y:21},{x:0,y:1}];
  assert.equal(insideFace({x:50,y:10.5},sliver,2),false);
});

test('oblique faces keep strokes contained across directions and brush widths',()=>{
  const face=[{x:20,y:10},{x:120,y:35},{x:95,y:150},{x:5,y:85}];
  for (let angle=0;angle<Math.PI*2;angle+=.17) {
    for (const inset of [1,4,10]) {
      const path=planarStroke({x:60,y:70},angle,130,4,1.4,face,inset);
      assert.ok(path.length>=3);
      for (const p of path) assert.equal(insideFace(p,face,inset),true);
    }
  }
});
