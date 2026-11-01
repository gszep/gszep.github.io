import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { transform } from '@astrojs/compiler';
import { transform as transpile } from 'esbuild';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { incidents, events, jobs, counts, rules, originLabels, screened, excluded } from '../src/components/interactive/incident-response-evidence.ts';

const root = new URL('../', import.meta.url);
const component = await readFile(new URL('src/components/interactive/IncidentResponseHero.astro', root), 'utf8');
const dataSource = await readFile(new URL('src/components/interactive/incident-response-evidence.ts', root), 'utf8');
const expected = ['shellshock-2014', 'drown-2016', 'krack-2017', 'meltdown-spectre-2018', 'openssl-2022', 'wannacry-2017', 'notpetya-2017', 'exchange-proxylogon-2021', 'citrixbleed-2023', 'diginotar-2011', 'solarwinds-2020', 'codecov-2021', 'ua-parser-js-2021', '3cx-2023', 'php-2026', 'emudhra-2026', 'log4shell-2021', 'xz-2024', 'heartbleed-2014'];

test('19 unique qualifying episodes; MOVEit is the twentieth screened, not a dot', () => {
  assert.equal(screened, 20);
  assert.equal(incidents.length, 19);
  assert.equal(new Set(incidents.map(c => c.id)).size, 19);
  assert.deepEqual(incidents.map(c => c.id), expected);
  assert.equal(excluded.id, 'moveit-2023');
  assert(!incidents.some(c => c.id === excluded.id));
  assert.equal(incidents.filter(c => /meltdown|spectre/.test(c.id)).length, 1);
});

test('four exact counts are recomputed from positive cells, not hand-drawn marks', () => {
  const actual = Object.fromEntries(jobs.map(j => [j, incidents.filter(c => c.codes[j] !== null).length]));
  assert.deepEqual(counts, actual);
  assert.deepEqual(counts, { scope: 18, revision: 11, help: 13, remaining: 13 });
  assert.match(component, /incidents\.map\(\(incident, index\) => <span/);
  assert.match(component, /incident\.codes\[job\] !== null/);
  assert.match(component, /counts\[job\]/);
});

test('every positive cell has bilingual interpretation and referenced public evidence', () => {
  const used = new Set();
  const primaryHosts = new Set(['ftp.gnu.org', 'access.redhat.com', 'www.openssl.org', 'drownattack.com', 'w1.fi', 'support.microsoft.com', 'blogs.technet.microsoft.com', 'www.nao.org.uk', 'www.microsoft.com', 'techcommunity.microsoft.com', 'www.cisa.gov', 'www.netscaler.com', 'blog.mozilla.org', 'bugzilla.mozilla.org', 'www.solarwinds.com', 'about.codecov.io', 'github.com', 'www.3cx.com', 'www.sakura.ad.jp', 'news.ycombinator.com', 'status.mayfirst.org', 'emudhra.com', 'support.apple.com', 'www.openwall.com', 'web.archive.org', 'logging.apache.org', 'cveawg.mitre.org', 'www.debian.org', 'www.mail-archive.com', 'blogs.akamai.com', 'jhalderm.com']);
  for (const incident of incidents) {
    assert.deepEqual(Object.keys(incident.codes), jobs);
    for (const entry of Object.values(incident.codes)) {
      if (entry === null) continue;
      assert(entry.note.en.length > 20 && entry.note.ja.length > 10);
      assert(entry.eventIds.length > 0);
      for (const id of entry.eventIds) {
        used.add(id);
        assert(events[id], id);
        const url = new URL(events[id].url);
        assert(['http:', 'https:'].includes(url.protocol));
        assert(primaryHosts.has(url.hostname), url.hostname);
        assert(originLabels[events[id].origin]);
        assert(!/moveit|operations-e2[5-9]|disclosure-e27/.test(id));
      }
    }
  }
  assert.deepEqual([...used].sort(), Object.keys(events).sort());
});

test('all rules and provenance states are bilingual; key safeguards remain explicit', () => {
  for (const value of [...Object.values(rules), ...Object.values(originLabels), excluded.reason]) {
    assert(value.en && value.ja);
    assert.match(value.ja, /[ぁ-んァ-ヶ一-龠]/);
  }
  for (const phrase of ['cases with explicit evidence in this collection', 'not evidence of absence', 'not a response-quality score', 'not prevalence', 'not independently preserved', '今回の収集で明確な記録', '実施されなかった証拠ではありません', '全体を代表する標本ではありません']) {
    assert((component + dataSource).includes(phrase), phrase);
  }
  assert(dataSource.includes('encouraging—not requiring'));
  assert(dataSource.includes('does not discredit removing JndiLookup'));
  assert(dataSource.includes('not preserved before-and-after'));
});

test('native keyboard details, static evidence, readable mobile and no hover-only content', () => {
  assert.equal((component.match(/<details\b/g) || []).length, 1);
  assert.match(component, /<summary>/);
  assert(!/<details[^>]*\bopen\b/.test(component));
  assert(!/<script\b|onmouseover|:hover|set:html/.test(component));
  assert.match(component, /role="region" aria-label=\{t\.matrix\} tabindex="0"/);
  assert.match(component, /scope="row"/);
  assert.match(component, /scope="col"/);
  assert.match(component, /focus-visible/);
  assert.match(component, /max-width: 350px/);
  assert.match(component, /grid-template-columns: 1fr/);
  assert.match(component, /entry\.note\[lang\]/);
  assert.match(component, /originLabels\[events\[eventId\]\.origin\]\[lang\]/);
  assert.match(component, /href=\{events\[eventId\]\.url\}/);
});

test('owner revision disposition requires explicit actor acknowledgement, not scope comparison', () => {
  assert.equal(incidents.find(c => c.id === 'emudhra-2026').codes.revision, null);
  assert.match(rules.revision.en, /explicitly acknowledges a change/);
  assert.match(rules.revision.en, /Differently scoped statements, narrower current wording/);
  assert.match(rules.revision.ja, /発信者自身/);
  assert.match(rules.revision.ja, /対象範囲の違う説明/);
  assert(!events['emudhra-2026-ev-leadership-note']);
  assert.match(incidents.find(c => c.id === 'xz-2024').codes.revision.note.en, /within one disclosure/);
  const help = incidents.find(c => c.id === 'log4shell-2021').codes.help;
  assert.deepEqual(help.eventIds, ['log4shell-2021-e13']);
  assert.equal(events['log4shell-2021-e13'].origin, 'current');
  assert.match(help.note.en, /not a first-availability time/);
});

test('compact graphic leaves figure ownership to MDX and moves explanations into details', () => {
  assert(!/<\/?figure\b|<\/?figcaption\b/.test(component));
  assert.match(component, /<div class="incident-hero" lang=\{lang\} role="group"/);
  assert.match(component, /<div class="hero-caption">/);
  assert(!/class="job-insight"|class="count-label"/.test(component));
  assert.match(component, /<p class="shared-label">\{t\.sharedLabel\}/);
  assert.match(component, /grid-template-columns: repeat\(10, 9px\)/);
  assert.match(component, /gap: 4px/);
  assert.match(component, /\.incident-hero \.job-count strong \{ color: var\(--accent\)/);
  assert.match(component, /aria-label=\{`\$\{t\.columns\[job\]\.title\}: \$\{counts\[job\]\}/);
});

test('public payload excludes private paths, raw data and forbidden outcome assertions', () => {
  const payload = component + dataSource;
  assert(!/\/Users\/|tail\w*\.ts\.net|research_notes|raw_collector_inputs|host_ip|bearer\s/i.test(payload));
  assert(!/39\.5|26\.8|secured hosts|20 of 80|all users protected|all hosts secured|correction rate/i.test(payload));
  assert(!/linear-gradient|radial-gradient|<img\b/.test(component));
});

test('Astro compiler accepts the complete component', async () => {
  const compiled = await transform(component, { filename: fileURLToPath(new URL('src/components/interactive/IncidentResponseHero.astro', root)) });
  assert(compiled.code.length > 100);
  assert.equal(compiled.diagnostics.filter(d => d.severity === 1).length, 0);
});

test('both locale renders expose 76 marks, 19 source rows and one initially closed keyboard control', async () => {
  const compiled = await transform(component, { filename: 'IncidentResponseHero.astro' });
  // A standalone, in-memory render: resolve imports without a dev server. Styles
  // are checked by the normal site build. Compiler metadata is build-time only.
  const source = compiled.code
    .replace(/from "astro\/runtime\/server\/index.js"/, `from ${JSON.stringify(import.meta.resolve('astro/runtime/server/index.js'))}`)
    .replace(/from '\.\/incident-response-evidence'/, `from ${JSON.stringify(new URL('src/components/interactive/incident-response-evidence.ts', root).href)}`)
    .replace(/^import "IncidentResponseHero\.astro\?[^\n]+\n/m, '')
    .replace(/,\s*createMetadata as \$\$createMetadata/, '')
    .replace(/^export const \$\$metadata = .*;$/m, '');
  const js = (await transpile(source, { loader: 'ts', format: 'esm' })).code;
  const { default: Component } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
  const container = await AstroContainer.create();
  for (const lang of ['en', 'ja']) {
    const html = await container.renderToString(Component, { props: { lang } });
    assert.equal((html.match(/data-position=/g) || []).length, 76);
    assert.equal((html.match(/<tr data-case=/g) || []).length, 19);
    assert.equal((html.match(/<section\b/g) || []).length, 4);
    assert.equal((html.match(/<details\b/g) || []).length, 1);
    assert.equal((html.match(/<summary\b/g) || []).length, 1);
    assert(!/<details[^>]*\bopen\b/.test(html));
    assert(!html.includes('undefined'));
    assert(html.includes(`lang="${lang}"`));
    assert(html.includes(lang === 'ja' ? '出典・分類基準と19事例の一覧' : 'Sources, coding rules and all 19 cases'));
    assert(html.includes(lang === 'ja' ? '残る仕事を示す' : 'Remaining work'));
    assert(!/<figure\b|<figcaption\b/.test(html));
    assert.equal((html.match(/class="shared-label/g) || []).length, 1);
    assert.equal((html.match(/<section[^>]+aria-label=/g) || []).length, 4);
    assert(html.includes('tabindex="0"'));
    for (const id of Object.keys(events)) assert(html.includes(id), `${lang}: ${id}`);
  }
});

// Supply the owner-reviewed aggregate at validation time. Never bundle it with the site.
test('all positive IDs and URLs match corrected reviewed records, never raw collectors', { skip: !process.env.INCIDENT_REVIEWED_AGGREGATE }, async () => {
  const aggregate = JSON.parse(await readFile(process.env.INCIDENT_REVIEWED_AGGREGATE, 'utf8'));
  const reviewed = new Map();
  for (const pack of [...Object.values(aggregate.new_lanes), aggregate.inherited_original_schema]) {
    const sources = new Map(pack.sources.map(s => [s.id ?? s.source_id, s]));
    for (const event of pack.events) reviewed.set(event.id ?? event.event_id, { event, source: sources.get(event.source_id) });
  }
  for (const incident of incidents) for (const entry of Object.values(incident.codes)) {
    if (!entry) continue;
    for (const id of entry.eventIds) {
      const record = reviewed.get(id);
      assert(record, id);
      assert.equal(record.event.case_id, incident.id, id);
      assert.equal(events[id].url, record.source.original_url ?? record.source.url, id);
      assert.notEqual(record.source.primary, false, id);
      const status = record.event.body_status ?? record.event.historical_body_status;
      const origin = /retrospective/.test(status) ? 'retrospective' : /current/.test(status) ? 'current' : 'historic';
      assert.equal(events[id].origin, origin, id);
    }
  }
  const eligible = aggregate.preview_cases.filter(c => c.minimum_status === 'accepted').map(c => c.case_id);
  assert.deepEqual(eligible.sort(), [...expected].sort());
});
