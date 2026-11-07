import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { japanResponses, japanReleaseReference } from '../src/components/interactive/php-japan-evidence.ts';
import { warning, responses, maintenance, offsetSeconds, minutesBetween, axisEndSeconds, latestEvent } from '../src/components/interactive/php-warning-evidence.ts';

// Source checks are independent of the build. Rendered checks consume its one immutable output.
const phase = process.env.PHP_CHECK_PHASE ?? 'all';
// Historical data arithmetic is retained below. The article no longer renders
// those figures: current presentation checks explicitly prevent their return.
function assertLeadHierarchy(markup, lang) {
  const firstFigure = markup.match(/<figure\b[^>]*>/)?.[0];
  assert.ok(firstFigure?.includes('id="recovery-outcomes-hero"'), `${lang}: current outcome figure must lead`);
  assert.equal((markup.match(/id="recovery-outcomes-hero"/g) ?? []).length,1);
  assert.doesNotMatch(markup, /<\/?(?:details|summary)\b|data-japan-detail|id="response-timeline"|id="japan-timeline"|id="japan-containment"|data-heatmap-row=/);
}
if (phase !== 'built') {

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
test('warning anchor, scheduled release and every restriction endpoint retain exact arithmetic', () => {
  assert.equal(warning.kind, 'public-maintainer-advance-warning');
  assert.equal(warning.at, '2026-10-20T19:33:47Z');
  assert.equal(warning.actualRelease, null);
  assert.equal(offsetSeconds(warning.scheduledRelease), 66373);
  const intervals = responses.filter(row => row.kind === 'reported-restriction');
  assert.deepEqual(intervals.map(row => [row.id, offsetSeconds(row.start), offsetSeconds(row.end), minutesBetween(row.start,row.end)]), [
    ['pixiv',51973,68173,270], ['asken',65773,103873,635],
    ['ffxiv-login',75073,166573,1525], ['ffxiv-backup',75073,480853,6763],
  ]);
  assert.deepEqual(intervals.map(row => row.zoneExplicit), [true,false,false,false]);
  assert.equal(intervals[1].approximate, true);
});
test('checkpoint reports cannot silently become duration bars or exact onset', () => {
  const row = responses.find(row => row.id === 'bamboohr');
  assert.equal(row.kind, 'reporting-checkpoints');
  assert.equal(row.start, null);
  assert.equal(row.end, null);
  assert.equal(row.durationMinutes, null);
  assert.deepEqual(row.events.map(e => offsetSeconds(e.at)), [58633,70153,73633,79033,80833]);
  assert.equal(minutesBetween(row.events[0].at,row.events.at(-1).at),370);
  assert.equal(minutesBetween(row.events[1].at,row.events.at(-1).at),178);
});
test('one FFXIV incident reaches backup restoration after login, never retrieval day', () => {
  const login = responses.find(row => row.id === 'ffxiv-login');
  const backup = responses.find(row => row.id === 'ffxiv-backup');
  assert.equal(login.incident,backup.incident);
  assert.equal(minutesBetween(login.end,backup.end),5238);
  assert.equal(Date.parse(latestEvent),Date.parse(backup.end));
  assert.equal(axisEndSeconds,480853);
  assert.ok(axisEndSeconds > offsetSeconds(login.end));
  assert.equal(axisEndSeconds,Math.max(...responses.flatMap(row => row.kind === 'reported-restriction' ? [offsetSeconds(row.end)] : row.events.map(e => offsetSeconds(e.at)))));
});
test('date-only notices remain day intervals and maintenance has separate semantics', () => {
  for (const row of responses.filter(row => row.notice?.kind === 'date-only')) {
    assert.equal(minutesBetween(row.notice.start,row.notice.endExclusive),1440);
    assert.equal(row.notice.at,undefined);
  }
  assert.deepEqual(maintenance.map(row => [minutesBetween(row.start,row.plannedEnd), minutesBetween(row.start,row.reportedEnd)]),[[240,205],[300,265]]);
  for (const row of maintenance) {
    assert.equal(row.matchedBaseline,false);
    assert.equal(row.kind,'reported-completed-maintenance');
    assert.equal(row.function,'game-and-launcher');
    assert.equal(row.completionWordingPublishedAt,null);
    assert.ok(Date.parse(row.pageCreated)<Date.parse(row.reportedEnd));
  }
});
test('bilingual sources render only the current outcome figure, without legacy disclosures', () => {
  for (const lang of ['en','ja']) {
    const source = readFileSync(new URL(`../src/content/blog/${lang}/measured-responses-to-cybersecurity-warnings.mdx`,import.meta.url),'utf8');
    assertLeadHierarchy(source,lang);
    assert.ok(source.includes(`<RecoveryOutcomes lang="${lang}" />`));
    assert.ok(source.includes(`<RecoveryOutcomeSources lang="${lang}" />`));
    assert.doesNotMatch(source, /IncidentResponseHero|PhpResponseTimeline|JapanResponseAnalysis|JapanContainmentMap/);
  }
});
test('public data and bilingual prose expose matching sources without private research exports', () => {
  for (const row of responses) for (const key of ['label','scope','uncertainty']) {
    assert.ok(row[key].en && row[key].ja, `${row.id}.${key}`);
  }
  const articles = ['en','ja'].map(lang => readFileSync(new URL(`../src/content/blog/${lang}/measured-responses-to-cybersecurity-warnings.mdx`,import.meta.url),'utf8'));
  const links = text => [...text.matchAll(/href="(https:[^"]+)"/g)].map(m => m[1]).sort();
  assert.deepEqual(links(articles[0]),links(articles[1]));
  const exported = JSON.stringify({ warning,responses,maintenance }) + articles.join('\n');
  assert.doesNotMatch(exported,/research_notes|Disclosure aligned article completion|\/Users\/|docs\.google\.com|drive\.google\.com|multi-incident-draft|TODO|working draft/i);
  for (const source of [warning.source,...responses.map(row => row.source),...maintenance.flatMap(row => [row.plan,row.completion])]) {
    assert.equal(new URL(source).protocol,'https:');
  }
});
}

if (phase !== 'source') for (const lang of ['en','ja']) test(`${lang}: built article excludes legacy charts and keeps visible sources`, () => {
  const html=readFileSync(new URL(`../dist/${lang}/blog/measured-responses-to-cybersecurity-warnings/index.html`,import.meta.url),'utf8');
  assertLeadHierarchy(html,lang);
  assert.equal((html.match(/data-outcome=/g) ?? []).length,8);
  for (const [,id] of html.matchAll(/href="#(ref-\d+)"/g)) assert.ok(html.includes(`id="${id}"`),id);
  assert.ok(html.includes('recovery-source-ffxiv-backup'));
  assert.ok(html.includes(lang==='en' ? 'not the start of the backup restriction' : '全停止期間ではありません'));
  assert.doesNotMatch(html,/research_notes|Disclosure aligned article completion|\/Users\/|docs\.google\.com|multi-incident-draft/);
});
