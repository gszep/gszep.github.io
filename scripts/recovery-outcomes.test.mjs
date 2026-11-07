import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from '@astrojs/compiler';
import { transform as transpile } from 'esbuild';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { outcomes, states, evidenceLabels, copy } from '../src/components/interactive/recovery-outcomes.ts';
import { responses, minutesBetween } from '../src/components/interactive/php-warning-evidence.ts';

const root = new URL('../', import.meta.url);
const component = await readFile(new URL('src/components/interactive/RecoveryOutcomes.astro', root), 'utf8');
const sourcesComponent = await readFile(new URL('src/components/interactive/RecoveryOutcomeSources.astro', root), 'utf8');
const data = await readFile(new URL('src/components/interactive/recovery-outcomes.ts', root), 'utf8');
const row = id => outcomes.find(r => r.id === id);
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

test('eight unique provider–function rows across six organisations, not an incident cohort', () => {
  assert.deepEqual(outcomes.map(r => r.id), ['fabcafe-homepage', 'fabcafe-venues', 'ffxiv-login', 'ffxiv-backup', 'nicos-statements', 'kansai-web-information', 'docomo-voice', 'binance-withdrawals']);
  assert.equal(new Set(outcomes.map(r => r.id)).size, 8);
  assert.equal(new Set(outcomes.map(r => r.provider)).size, 6);
  assert.equal(new Set(outcomes.map(r => `${r.provider}:${r.function.en}`)).size, 8);
  assert.doesNotMatch(data, /eight incidents|8 incidents|country ranking|12-function cohort|19 incidents/i);
});

test('every row has public primary sources, an evidence class and a historical date', () => {
  const hosts = new Set(['fabcafe.com', 'ff14.game.naver.com', 'info.cr.mufg.jp', 'www.kansai-td.co.jp', 'www.docomo.ne.jp', 'www.binance.com']);
  for (const r of outcomes) {
    assert.match(r.date, /^2026-(10|11)-\d{2}$/);
    assert(evidenceLabels[r.evidence]);
    assert(states[r.state]);
    assert(r.sources.length);
    for (const s of r.sources) {
      const url = new URL(s.url);
      assert.equal(url.protocol, 'https:');
      assert(hosts.has(url.hostname));
      assert.equal(url.username, '');
      assert.equal(url.password, '');
      assert(s.label.en && s.label.ja);
    }
  }
  assert.equal(row('fabcafe-homepage').evidence, 'endpoint-observation');
  assert.equal(row('fabcafe-venues').evidence, 'operator-report');
  assert.equal(row('binance-withdrawals').evidence, 'operator-initial-account');
});

test('unknown function outcomes cannot inherit nearby broad restoration claims', () => {
  assert.equal(row('nicos-statements').state, 'not-established');
  assert.match(row('nicos-statements').detail.en, /Neither its interruption nor its restoration is established/);
  assert.match(row('nicos-statements').detail.en, /not a payment-outage/);
  assert.equal(row('binance-withdrawals').state, 'not-established');
  assert.equal(row('fabcafe-homepage').state, 'observed-unavailable');
  assert.equal(row('fabcafe-venues').state, 'reported-operating');
  assert.match(row('fabcafe-homepage').detail.en, /One homepage request/);
  assert.match(row('fabcafe-venues').detail.en, /not visits or attendance checks/);
});

test('FFXIV clocks derive from the existing data: 25h25 login, 3d15h18 extra backup', () => {
  const login = responses.find(r => r.id === 'ffxiv-login');
  const backup = responses.find(r => r.id === 'ffxiv-backup');
  assert.equal(login.incident, backup.incident);
  assert.equal(minutesBetween(login.start, login.end), 25 * 60 + 25);
  assert.equal(minutesBetween(login.end, backup.end), 3 * 1440 + 15 * 60 + 18);
  assert.equal(minutesBetween(backup.start, backup.end), 6763);
  assert.equal(login.end, '2026-10-23T02:50:00+09:00');
  assert.match(row('ffxiv-login').dated.en, /02:50.*KST assumed/);
  assert.match(row('ffxiv-backup').dated.en, /18:08.*KST assumed/);
  assert.match(row('ffxiv-login').access.en, /25h 25m/);
  assert.match(row('ffxiv-backup').access.en, /3d 15h 18m after login/);
  assert.match(row('ffxiv-backup').detail.en, /does not establish data loss/);
  for (const r of [login, backup]) assert.equal(row(r.id).sources[0].url, r.source);
});

test('Kansai web functions and DOCOMO scoped voice do not become national physical outages', () => {
  assert.match(row('kansai-web-information').detail.en, /sequentially suspended.*00:00/);
  assert.match(row('kansai-web-information').detail.en, /without an end hour/);
  assert.match(row('kansai-web-information').detail.en, /do not report electricity-supply interruption/);
  assert.match(row('docomo-voice').detail.en, /approximate 16:30–17:29 JST/);
  assert.match(row('docomo-voice').detail.en, /Hokkaido, Tohoku, Kanto, Hokuriku and Tokai/);
  assert.match(row('docomo-voice').detail.en, /not.*independently measured 59 minutes/);
  assert.match(row('docomo-voice').detail.en, /no PHP connection is established/);
  assert.match(row('docomo-voice').unresolved.en, /SMS not established/);
});

test('Binance preserves initial attribution and separates revocation from customer access', () => {
  const r = row('binance-withdrawals');
  assert.match(r.dated.en, /29 Oct event · 3 Nov account/);
  assert.match(r.detail.en, /reports a separate revocation procedure/);
  assert.match(r.detail.en, /does not establish when normal customer withdrawals resumed/);
  assert.match(r.detail.en, /not independent forensics, proof of security, or evidence of a PHP connection/);
  assert.doesNotMatch(JSON.stringify(r), /13:40|14:56|Lazarus|FBI|\$|losses of|funds are safe|fully recovered/i);
});

test('all UI and content are bilingual; no private material or obsolete chart machinery', () => {
  const strings = [...Object.values(copy), ...Object.values(states), ...Object.values(evidenceLabels)];
  for (const r of outcomes) strings.push(r.function, r.dated, r.action, r.access, r.unresolved, r.detail, ...r.sources.map(s => s.label));
  for (const value of strings) {
    assert(value.en.length > 0);
    assert.match(value.ja, /[ぁ-んァ-ヶ一-龠]/);
  }
  assert.doesNotMatch(component + sourcesComponent + data, /\/Users\/|research_notes|\.local\/|mailto:|henkaku@|operational.consultation|bearer\s|heatmap|data-coded|progressbar|<canvas|<script|innerHTML|set:html/i);
});

test('visible semantic rows and plain sources have no collapsible controls or scripts', () => {
  assert.match(component, /<div class="recovery-outcomes".*role="group" aria-label=/);
  for (const role of ['table', 'rowgroup', 'row', 'rowheader', 'columnheader', 'cell']) assert(component.includes(`role="${role}"`));
  assert.doesNotMatch(component + sourcesComponent, /<details\b|<summary\b|<figure|<figcaption|<button|tabindex="-1"|onmouseover|<script|aria-expanded|:hover/);
  assert.match(component, /source-link:focus-visible/);
  assert.match(component, /min-height: 70px/);
  assert.match(component, /minmax\(0, 1fr\) minmax\(0, 1.2fr\)/);
  assert.match(component, /overflow-wrap: anywhere/);
  assert.match(component, /state-mark.*aria-hidden="true"/);
  assert.match(component, /repeating-linear-gradient/);
  assert.match(sourcesComponent, /<ol>/);
  assert.match(sourcesComponent, /<h3>/);
});

test('Astro compiler accepts both components', async () => {
  for (const [filename, content] of [['RecoveryOutcomes.astro', component], ['RecoveryOutcomeSources.astro', sourcesComponent]]) {
    const compiled = await transform(content, { filename });
    assert.equal(compiled.diagnostics.filter(d => d.severity === 1).length, 0);
  }
});

async function renderable(content, filename) {
  const compiled = await transform(content, { filename });
  const source = compiled.code
    .replace(/from "astro\/runtime\/server\/index.js"/, `from ${JSON.stringify(import.meta.resolve('astro/runtime/server/index.js'))}`)
    .replace(/from '\.\/recovery-outcomes'/, `from ${JSON.stringify(new URL('src/components/interactive/recovery-outcomes.ts', root).href)}`)
    .replace(/^import "RecoveryOutcome(?:s|Sources)\.astro\?[^\n]+\n/m, '')
    .replace(/,\s*createMetadata as \$\$createMetadata/, '')
    .replace(/^export const \$\$metadata = .*;$/m, '');
  const js = (await transpile(source, { loader: 'ts', format: 'esm' })).code;
  const { default: Component } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
  return Component;
}

test('both locale SSR pairs expose eight visible function rows and matching numbered source anchors', async () => {
  const Component = await renderable(component, 'RecoveryOutcomes.astro');
  const Sources = await renderable(sourcesComponent, 'RecoveryOutcomeSources.astro');
  const container = await AstroContainer.create();
  for (const lang of ['en', 'ja']) {
    const html = await container.renderToString(Component, { props: { lang } });
    const sourcesHtml = await container.renderToString(Sources, { props: { lang } });
    const combined = html + sourcesHtml;
    assert.equal((html.match(/data-outcome=/g) || []).length, 8);
    assert.equal((html.match(/role="rowheader"/g) || []).length, 8);
    assert.equal((html.match(/role="cell"/g) || []).length, 24);
    assert.equal((html.match(/role="columnheader"/g) || []).length, 4);
    assert.equal((html.match(/<a\b/g) || []).length, 8);
    assert.equal((sourcesHtml.match(/<a\b/g) || []).length, 9);
    assert.equal((sourcesHtml.match(/<ol\b/g) || []).length, 1);
    assert.equal((sourcesHtml.match(/data-source-outcome=/g) || []).length, 8);
    assert.doesNotMatch(combined, /<\/?details\b|<\/?summary\b|undefined|<figure\b|<script\b|<button\b|aria-expanded/);
    const ids = [...combined.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(anchors, outcomes.map(r => `recovery-source-${r.id}`));
    assert.deepEqual(ids, anchors);
    assert(html.includes(escape(copy.title[lang])));
    assert(sourcesHtml.includes(escape(copy.sourcesTitle[lang])));
    assert(html.includes(`lang="${lang}"`));
    assert(sourcesHtml.includes(`lang="${lang}"`));
    for (const [index, r] of outcomes.entries()) {
      const visibleRow = html.split(`data-outcome="${r.id}"`)[1].split('</div>')[0];
      const sourceRow = sourcesHtml.split(`data-source-outcome="${r.id}"`)[1].split('</ul>')[0];
      for (const text of [r.function[lang], r.action[lang], r.access[lang], r.unresolved[lang], r.dated[lang], states[r.state][lang]]) assert(visibleRow.includes(escape(text)), `${lang}: ${r.id}: ${text}`);
      assert(visibleRow.includes(`${copy.sourceLabel[lang]} ${index + 1}`));
      assert(sourceRow.includes(evidenceLabels[r.evidence][lang]));
      assert(sourceRow.includes(escape(r.detail[lang])));
      assert(sourceRow.includes(`datetime="${r.date}"`));
      const links = [...sourceRow.matchAll(/href="([^"]+)"/g)].map(m => m[1].replaceAll('&amp;', '&'));
      assert.deepEqual(links, r.sources.map(s => s.url));
    }
  }
});
