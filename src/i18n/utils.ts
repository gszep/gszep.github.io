import en from './en.json';
import ja from './ja.json';
import site from '../data/site.json';

export type Locale = 'en' | 'ja';

const dicts = { en, ja } as Record<string, Record<string, string>>;

export function t(lang: Locale, key: string): string {
  return dicts[lang]?.[key] ?? dicts.en[key] ?? key;
}

export function getSite(lang: Locale) {
  const localized = lang === 'ja' ? site.ja : site.en;
  return {
    url: site.url,
    heroImage: site.heroImage,
    title: localized.title,
    description: localized.description,
    author: {
      ...site.author,
      name: localized.authorName,
      intro: localized.authorIntro,
      about: localized.authorAbout,
    },
  };
}
