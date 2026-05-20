import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES = ['en', 'ja'];
const COLLECTIONS = [
  { name: 'blog', dir: join(__dirname, '..', 'src', 'content', 'blog'), sharedFields: ['date', 'image', 'imagePosition', 'order'] },
  { name: 'talks', dir: join(__dirname, '..', 'src', 'content', 'talks'), sharedFields: ['date', 'order'] },
];

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
let totalFiles = 0;

for (const { name, dir, sharedFields } of COLLECTIONS) {
  const filesByLocale = {};
  for (const locale of LOCALES) {
    const localeDir = join(dir, locale);
    try {
      filesByLocale[locale] = new Set(readdirSync(localeDir).filter(f => f.endsWith('.mdx')));
    } catch {
      console.error(`ERROR: Missing locale directory: ${localeDir}`);
      process.exit(1);
    }
  }

  const allFiles = new Set([...filesByLocale.en, ...filesByLocale.ja]);
  totalFiles += allFiles.size;

  for (const file of allFiles) {
    for (const locale of LOCALES) {
      if (!filesByLocale[locale].has(file)) {
        console.error(`MISSING [${name}]: ${locale}/${file} -- no translation counterpart`);
        errors++;
      }
    }
  }

  for (const file of allFiles) {
    if (!filesByLocale.en.has(file) || !filesByLocale.ja.has(file)) continue;

    const enFm = parseFrontmatter(join(dir, 'en', file));
    const jaFm = parseFrontmatter(join(dir, 'ja', file));

    for (const field of sharedFields) {
      const enVal = enFm[field];
      const jaVal = jaFm[field];

      if (enVal === undefined && jaVal === undefined) continue;

      if (String(enVal) !== String(jaVal)) {
        console.error(`MISMATCH [${name}]: ${file} field "${field}" -- en: ${JSON.stringify(enVal)} vs ja: ${JSON.stringify(jaVal)}`);
        errors++;
      }
    }

    const enTags = enFm.tags;
    const jaTags = jaFm.tags;
    if (String(enTags) !== String(jaTags)) {
      console.warn(`TAGS MISMATCH [${name}]: ${file} -- en: ${enTags} vs ja: ${jaTags}`);
      warnings++;
    }

    const enContent = readFileSync(join(dir, 'en', file), 'utf-8');
    const jaContent = readFileSync(join(dir, 'ja', file), 'utf-8');

    const getBody = (s) => s.replace(/^---[\s\S]*?\n---\n?/, '');
    const enBody = getBody(enContent);
    const jaBody = getBody(jaContent);

    const structureChecks = [
      ['import', (s) => (s.match(/^import\s/gm) || []).length],
      ['<figure>', (s) => (s.match(/<figure/g) || []).length],
      ['<video>', (s) => (s.match(/<video/g) || []).length],
      ['<img>', (s) => (s.match(/<img/g) || []).length],
      ['---', (s) => (s.match(/^---$/gm) || []).length],
    ];

    for (const [label, counter] of structureChecks) {
      const enCount = counter(enBody);
      const jaCount = counter(jaBody);
      if (enCount !== jaCount) {
        console.warn(`STRUCTURE [${name}]: ${file} ${label} count differs -- en: ${enCount} vs ja: ${jaCount}`);
        warnings++;
      }
    }
  }
}

console.log(`i18n check: ${totalFiles} entries across ${COLLECTIONS.length} collections, ${errors} errors, ${warnings} warnings`);

if (errors > 0) {
  console.error('Fix the errors above before building.');
  process.exit(1);
}
