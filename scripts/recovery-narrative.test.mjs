import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { incidents, counts } from '../src/components/interactive/incident-response-evidence.ts';

const article = lang => readFileSync(new URL(`../src/content/blog/${lang}/measured-responses-to-cybersecurity-warnings.mdx`, import.meta.url), 'utf8');
const en = article('en'), ja = article('ja');
const urls = text => [...text.matchAll(/href="(https?:[^\"]+)"/g)].map(m => m[1].replaceAll('&amp;', '&')).sort();

test('the two editions preserve metadata, chart controls and matching primary links', () => {
  for (const text of [en, ja]) {
    assert.match(text, /date: 2026-10-24/);
    assert.match(text, /draft: false/);
    assert.match(text, /<details data-japan-detail>/);
    assert.equal((text.match(/id="shared-response-hero"/g) || []).length, 1);
    assert.equal((text.match(/id="ref-\d+"/g) || []).length, 32);
    for (const [, id] of text.matchAll(/href="#(ref-\d+)"/g)) assert(text.includes(`id="${id}"`), id);
    assert.doesNotMatch(text, /tail\w*\.ts\.net|henkaku@|Supporting documentation for purchasing card usage|operator-monitor-consultation|\/Users\//);
  }
  assert.deepEqual(urls(en), urls(ja));
});

test('new examples do not silently enlarge either frozen study', () => {
  assert.equal(incidents.length, 19);
  assert(!incidents.some(row => /binance|fabcafe/i.test(row.id)));
  assert.deepEqual(counts, { scope: 18, revision: 11, help: 13, remaining: 13 });
  assert.match(en, /twelve provider–function pairs/);
  assert.match(en, /not additions to the nineteen-incident heatmap or the twelve-function pilot/);
  assert.match(en, /retained MOVEit 2023 pack/);
});

test('outcomes remain scoped, dated and distinct from documentation', () => {
  assert.match(en, /4 November, at 11:29 JST/);
  assert.match(en, /A full row is not a successful recovery/);
  assert.match(en, /nine lacked adequate evidence/i);
  assert.match(en, /None of the twelve had an independently verified present function state/);
  assert.match(en, /not evidence that PHP caused no disruption/);
  assert.match(en, /first archived error is not the start/);
  assert.match(en, /additional restriction, not its total duration/);
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
    assert.equal((html.match(/data-heatmap-row=/g) || []).length, 19);
    for (const [, id] of html.matchAll(/href="#(ref-\d+)"/g)) assert(html.includes(`id="${id}"`), id);
    assert(html.includes(lang === 'en' ? 'What the records cover' : '記録で確認できること'));
  }
});
