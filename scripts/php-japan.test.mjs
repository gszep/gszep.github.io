import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { japanResponses, japanReleaseReference } from '../src/components/interactive/php-japan-evidence.ts';

test('source-aligned intervals distinguish approximate times, unknown ends and scheduled release', () => {
  assert.equal(japanReleaseReference.type, 'scheduled-not-observed');
  assert.equal(japanReleaseReference.minute, 300);
  assert.deepEqual(japanResponses.map(row => [row.id, row.start, row.end, row.approximate, row.zoneExplicit]), [
    ['pixiv',60,330,false,true], ['asken',290,925,true,false], ['sakura',270,null,false,false],
  ]);
  assert.equal(japanResponses[0].end-japanResponses[0].start, 270);
  assert.equal(japanResponses[1].end-japanResponses[1].start, 635);
  assert.deepEqual(japanResponses.map(row => japanReleaseReference.minute-row.start), [240,10,30]);
  assert.ok(japanResponses[0].start<japanResponses[1].start && japanResponses[0].end<japanResponses[1].end);
});
for (const lang of ['en','ja']) test(`${lang}: built article has original Japan figures, source targets and no benchmark centrepiece`, () => {
  const html=readFileSync(new URL(`../dist/${lang}/blog/measured-responses-to-cybersecurity-warnings/index.html`,import.meta.url),'utf8');
  assert.ok(html.includes(`japan-title-${lang}`));
  assert.ok(html.includes('containment-map'));
  assert.ok(!html.includes('<repair-evidence') && !html.includes('class="repair-evidence"'));
  assert.equal((html.match(/class="window /g) ?? []).length,2);
  for (const [,id] of html.matchAll(/href="#(ref-\d+)"/g)) assert.ok(html.includes(`id="${id}"`),id);
  assert.ok(html.includes(lang==='en' ? 'scheduled public release' : '公開の予定'));
  assert.ok(html.includes(lang==='en' ? 'assumed to be JST' : 'JSTと仮定'));
});
