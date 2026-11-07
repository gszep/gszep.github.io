import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { outcomes } from '../src/components/interactive/recovery-outcomes.ts';

const article = lang => readFileSync(new URL(`../src/content/blog/${lang}/measured-responses-to-cybersecurity-warnings.mdx`, import.meta.url), 'utf8');
const en = article('en'), ja = article('ja');
const urls = text => [...text.matchAll(/href="(https?:[^\"]+)"/g)].map(m => m[1].replaceAll('&amp;', '&')).sort();

test('the two editions keep only the current narrative and matching primary links', () => {
  for (const text of [en, ja]) {
    assert.match(text, /date: 2026-10-24/);
    assert.match(text, /image: "\/images\/recovery-city\.jpg"/);
    assert.match(text, /imagePosition: "50% 50%"/);
    assert.match(text, /draft: false/);
    assert.doesNotMatch(text, /<\/?(?:details|summary)\b|IncidentResponseHero|JapanResponseAnalysis|JapanContainmentMap|PhpResponseTimeline|Original PHP and Japan reconstruction/);
    assert.equal((text.match(/id="recovery-outcomes-hero"/g) || []).length, 1);
    assert.equal((text.match(/id="ref-\d+"/g) || []).length, 14);
    for (const [, id] of text.matchAll(/href="#(ref-\d+)"/g)) assert(text.includes(`id="${id}"`), id);
    assert.doesNotMatch(text, /tail\w*\.ts\.net|henkaku@|Supporting documentation for purchasing card usage|operator-monitor-consultation|\/Users\//);
  }
  assert.deepEqual(urls(en), urls(ja));
});

test('generated cover is optimized and used by both listing cards and sharing metadata', () => {
  const image = new URL('../public/images/recovery-city.jpg', import.meta.url);
  assert(statSync(image).size > 1000 && statSync(image).size < 150_000);
  assert.equal(readFileSync(image).subarray(0, 2).toString('hex'), 'ffd8');
  for (const lang of ['en', 'ja']) {
    const listing = readFileSync(new URL(`../dist/${lang}/blog/index.html`, import.meta.url), 'utf8');
    const post = readFileSync(new URL(`../dist/${lang}/blog/measured-responses-to-cybersecurity-warnings/index.html`, import.meta.url), 'utf8');
    assert(listing.includes('src="/images/recovery-city.jpg"'));
    assert.match(post, /property="og:image"[^>]+recovery-city\.jpg/);
  }
});

test('selected function illustrations are not presented as an incident success rate', () => {
  assert.equal(outcomes.length, 8);
  assert.match(en, /twelve provider–function pairs/);
  assert.match(en, /eight selected functions, not eight incidents/);
  assert.match(en, /separate from the pilot roster/);
  assert.doesNotMatch(en, /How the sample was chosen|nineteen-case|nineteen-incident heatmap/);
});

test('outcomes remain scoped, dated and distinct from documentation', () => {
  assert.match(en, /4 November, at 11:29 JST/);
  assert.doesNotMatch(en, /A full row is not a successful recovery|The PHP row combines/);
  assert.match(en, /nine lacked adequate evidence/i);
  assert.match(en, /None of the twelve had an independently verified present function state/);
  assert.match(en, /not evidence that PHP caused no disruption/);
  assert.match(en, /first archived error is not the start/);
  assert.match(outcomes.find(row => row.id === 'ffxiv-backup').detail.en, /not the start of the backup restriction/);
});

test('Binance is an attributed initial account, not a PHP or restoration claim', () => {
  const section = en.split('## Stopping a service does not settle containment')[1].split('\n## ')[0];
  assert.match(section, /initial account/);
  assert.match(section, /not an independent forensic finding/);
  assert.match(section, /does not establish a PHP connection/);
  assert.match(section, /time when normal customer withdrawal service was restored/);
  assert.doesNotMatch(section, /13:40|14:56|\$|6\.34|Lazarus|FBI|fully recovered|funds are safe/i);
  assert.match(ja, /独立した調査の結論ではありません/);
});

test('built pages contain the revised narrative and all reference targets', () => {
  for (const lang of ['en', 'ja']) {
    const html = readFileSync(new URL(`../dist/${lang}/blog/measured-responses-to-cybersecurity-warnings/index.html`, import.meta.url), 'utf8');
    assert(html.includes('FabCafe') && html.includes('Binance'));
    assert.equal((html.match(/data-outcome=/g) || []).length, 8);
    assert.doesNotMatch(html, /<\/?(?:details|summary)\b|data-heatmap-row=|data-maintenance=|data-japan-detail/);
    for (const [, id] of html.matchAll(/href="#(ref-\d+)"/g)) assert(html.includes(`id="${id}"`), id);
    assert(html.includes(lang === 'en' ? 'Different functions, different recovery states' : '機能ごとに異なる、利用再開の状況'));
    for (const row of outcomes) assert(html.includes(`id="recovery-source-${row.id}"`));
  }
});
