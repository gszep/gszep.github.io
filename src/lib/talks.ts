import { getCollection } from 'astro:content';
import type { Locale } from '../i18n/utils';

export async function getTalksByLocale(locale: Locale, includeDrafts = false) {
  const talks = await getCollection('talks', ({ slug, data }) =>
    slug.startsWith(`${locale}/`) && (includeDrafts || !data.draft)
  );
  talks.sort((a, b) => a.data.order - b.data.order);
  return talks;
}

export { stripLocalePrefix } from './posts';
