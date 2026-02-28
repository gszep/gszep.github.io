/**
 * Build-time i18n validation script.
 * Ensures EN/JA content stays in sync.
 *
 * Checks:
 * 1. Every EN post has a JA counterpart (and vice versa)
 * 2. Shared fields (date, image, imagePosition, order) match between pairs
 * 3. Reports orphaned translations
 *
 * Usage: node scripts/check-i18n.mjs
 */

import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(__dirname, '..', 'src', 'content', 'blog');
const LOCALES = ['en', 'ja'];
const SHARED_FIELDS = ['date', 'image', 'imagePosition', 'order'];

function parseFrontmatter(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const fm = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    fm[key] = value.replace(/^["']|["']$/g, '');
  }
  return fm;
}

let errors = 0;
let warnings = 0;

// Collect files per locale
const filesByLocale = {};
for (const locale of LOCALES) {
  const dir = join(CONTENT_DIR, locale);
  try {
    filesByLocale[locale] = new Set(readdirSync(dir).filter(f => f.endsWith('.mdx')));
  } catch {
    console.error(`ERROR: Missing locale directory: ${dir}`);
    process.exit(1);
  }
}

// Check 1: Every file in each locale has a counterpart
const allFiles = new Set([...filesByLocale.en, ...filesByLocale.ja]);

for (const file of allFiles) {
  for (const locale of LOCALES) {
    if (!filesByLocale[locale].has(file)) {
      console.error(`MISSING: ${locale}/${file} -- no translation counterpart`);
      errors++;
    }
  }
}

// Check 2: Shared fields match between pairs
for (const file of allFiles) {
  if (!filesByLocale.en.has(file) || !filesByLocale.ja.has(file)) continue;

  const enFm = parseFrontmatter(join(CONTENT_DIR, 'en', file));
  const jaFm = parseFrontmatter(join(CONTENT_DIR, 'ja', file));

  for (const field of SHARED_FIELDS) {
    const enVal = enFm[field];
    const jaVal = jaFm[field];

    if (enVal === undefined && jaVal === undefined) continue;

    if (String(enVal) !== String(jaVal)) {
      console.error(`MISMATCH: ${file} field "${field}" -- en: ${JSON.stringify(enVal)} vs ja: ${JSON.stringify(jaVal)}`);
      errors++;
    }
  }

  // Check tags match (canonical EN keys in both)
  const enTags = enFm.tags;
  const jaTags = jaFm.tags;
  if (String(enTags) !== String(jaTags)) {
    console.warn(`TAGS MISMATCH: ${file} -- en: ${enTags} vs ja: ${jaTags}`);
    warnings++;
  }
}

// Summary
console.log(`i18n check: ${allFiles.size} posts, ${errors} errors, ${warnings} warnings`);

if (errors > 0) {
  console.error('Fix the errors above before building.');
  process.exit(1);
}
