import { cp, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Pinned source snapshot. This commit reconciles the latest hosted designer edits.
const SOURCE_COMMIT = '275e53b863b5bda8d8fae07359cae3bb4e01e532';
const here = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.resolve(here, '../../decks');
const outputRoot = path.resolve(here, '../public');

const files = [
  'decks/rewild-open-projector/deck.json',
  'decks/rewild-open-projector/slides/age-of-empires.html',
  'decks/rewild-open-projector/slides/aps.html',
  'decks/rewild-open-projector/slides/chi.html',
  'decks/rewild-open-projector/slides/decks.html',
  'decks/rewild-open-projector/slides/ecosystem.html',
  'decks/rewild-open-projector/slides/jam.html',
  'decks/rewild-open-projector/slides/kotoma.html',
  'decks/rewild-open-projector/slides/mosaic-live.html',
  'decks/rewild-open-projector/slides/mosaic.html',
  'decks/rewild-open-projector/slides/room-check.html',
  'decks/rewild-open-projector/slides/secret-tunnel-live.html',
  'decks/rewild-open-projector/slides/secret-tunnel.html',
  'decks/rewild-open-projector/slides/spectrum.html',
  'decks/rewild-open-projector/slides/title.html',
  'decks/rewild-open-projector/slides/rewild.css',
  'decks/rewild-open-projector/slides/sim.js',
  'decks/rewild-open-projector/slides/i18n/en.js',
  'decks/rewild-open-projector/slides/assets/aps-sandbox.png',
  'decks/rewild-open-projector/slides/assets/aps-student-work.jpg',
  'decks/rewild-open-projector/slides/assets/decks-live.png',
  'decks/rewild-open-projector/slides/assets/jam.png',
  'decks/rewild-open-projector/slides/assets/kotoma-matrix.gif',
  'decks/rewild-open-projector/slides/assets/mosaic-hero.png',
  'decks/rewild-open-projector/slides/assets/mosaic.png',
  'decks/rewild-open-projector/slides/assets/secret-tunnel-hero.jpg',
  'decks/rewild-open-projector/slides/assets/secret-tunnel.png',
  'decks/rewild-open-projector/slides/assets/sesame-cover.png',
  'themes/chibatech/GUIDANCE.md',
  'themes/chibatech/chrome.css',
  'themes/chibatech/guidance.json',
  'themes/chibatech/theme.css',
  'themes/chibatech/tokens.css',
  'engine/i18n.js',
];

const actualCommit = execFileSync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (actualCommit !== SOURCE_COMMIT) {
  throw new Error(`Expected decks source at ${SOURCE_COMMIT}, found ${actualCommit}`);
}
if (execFileSync('git', ['-C', sourceRoot, 'status', '--porcelain'], { encoding: 'utf8' }).trim()) {
  throw new Error('The decks source has uncommitted changes; refusing to create an ambiguous snapshot.');
}

for (const directory of ['decks/rewild-open-projector', 'themes/chibatech', 'engine']) {
  await rm(path.join(outputRoot, directory), { recursive: true, force: true });
}
for (const file of files) {
  const destination = path.join(outputRoot, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(sourceRoot, file), destination);
}
console.log(`Imported ${files.length} Rewild talk files from decks@${SOURCE_COMMIT}.`);
