import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://gszep.com',
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
  integrations: [
    mdx(),
    tailwind(),
    react(),
    sitemap(),
  ],
});
