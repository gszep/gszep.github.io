import { getCollection } from 'astro:content';
import type { Locale } from '../i18n/utils';

export async function getPostsByLocale(locale: Locale, includeDrafts = false) {
  const posts = await getCollection('blog', ({ slug, data }) =>
    slug.startsWith(`${locale}/`) && (includeDrafts || !data.draft)
  );
  posts.sort((a, b) => a.data.order - b.data.order);
  return posts;
}

export function stripLocalePrefix(slug: string): string {
  return slug.replace(/^(en|ja)\//, '');
}
