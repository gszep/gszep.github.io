# grisha.log

Personal blog / lab notebook. Astro 5 static site with MDX, deployed to GitHub Pages.

## Deployment

All work happens on `staging`. Never push directly to `main`.

1. Switch to `staging` branch
2. Make changes, run `npm run build` to verify
3. Commit and push to `staging` (deploys to staging.gszep.com)
4. Only merge to `main` with explicit user approval (deploys to gszep.com)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro 5.x |
| Content | MDX |
| Styling | Tailwind CSS |
| Math | KaTeX |
| Media | MP4 video (not GIF) |
| Deploy | GitHub Pages via GitHub Actions |
| Domains | staging.gszep.com / gszep.com |

## Project Structure

```
src/
  content/blog/{en,ja}/    # MDX posts (matching filenames per locale)
  content/config.ts
  lib/posts.ts             # getPostsByLocale(), stripLocalePrefix()
  components/
    ui/                    # Layout components (.astro)
    interactive/           # WebGPU simulations
  layouts/
    Base.astro             # HTML shell, meta tags, hreflang, staging gate
    Page.astro             # Generic page wrapper with <main>
    Post.astro             # Blog post with JSON-LD, article meta tags
  pages/
    index.astro
    ja/{index,blog/}.astro
    blog/{index,[...slug]}.astro
  styles/post.css
  data/{site,citations}.json
  i18n/{utils.ts,en.json,ja.json}
scripts/check-i18n.mjs
public/
  robots.txt
  images/
```

## Content Editing

| File | Controls |
|------|----------|
| `src/content/blog/en/*.mdx` | English blog posts |
| `src/content/blog/ja/*.mdx` | Japanese blog posts |
| `src/data/citations.json` | Publications |
| `src/data/site.json` | Site metadata (en/ja keys) |
| `src/i18n/{en,ja}.json` | UI strings |
| `src/pages/index.astro` | EN homepage |
| `src/pages/ja/index.astro` | JA homepage |

Assets go in `public/images/`, referenced as `/images/filename.ext`.

## Adding a Blog Post

Create matching files in `en/` and `ja/`:

```mdx
---
title: "Post Title"
date: 2026-02-20
description: "Short description"
image: "/images/thumbnail.mp4"
tags: ["tag1", "tag2"]
order: 1
---
```

Required fields: title, description, date. Optional: image, imagePosition, tags, order, draft.

## i18n Rules

Folder-per-language: `en/` and `ja/` with matching filenames. Locale derived from folder structure.

1. Every post must have a counterpart in the other locale
2. Shared fields identical across pairs: `date`, `image`, `imagePosition`, `order`, `draft`
3. Tags use English keys in both languages
4. Only `title`, `description`, and body content differ
5. Component imports: `../../../components/` (three levels up)
6. `npm run build` validates i18n automatically

Page template pairs (differ only in `const lang` and import depth):
- `src/pages/index.astro` <-> `src/pages/ja/index.astro`
- `src/pages/blog/index.astro` <-> `src/pages/ja/blog/index.astro`
- `src/pages/blog/[...slug].astro` <-> `src/pages/ja/blog/[...slug].astro`

## Media

MP4 for animation, not GIF.
- Blog posts: `<video autoplay loop muted playsinline src="/images/file.mp4"></video>`
- Frontmatter: `image: "/images/thumbnail.mp4"` (ProjectCard auto-detects)

## Blog Post Layout

Distill.pub-inspired: white background, 700px text column, figures break to 900px, `github-light` syntax highlighting.

## SEO & LLM Navigability

- `robots.txt` in `public/` with sitemap reference
- `@astrojs/sitemap` generates `sitemap-index.xml` with hreflang variants
- `Base.astro` outputs canonical URL, hreflang alternates, Open Graph, Twitter cards
- `Post.astro` adds `og:type=article`, `article:published_time`, `article:tag`, JSON-LD `BlogPosting`
- i18n utilities in `src/i18n/utils.ts`: `canonicalUrl(lang, path)`, `alternateUrl(lang, path)`

## Staging Password Gate

staging.gszep.com has a client-side password gate (in `Base.astro`). Production and localhost unaffected.

## Development

```bash
npm run dev       # localhost:4321
npm run build     # Production build (validates i18n)
npm run preview   # Preview build
```

## Constraints

- Pin Astro 5.x, no Svelte
- No middleware, SSR, or view transitions
- `.astro` for layout only
- Read files before editing
- Build before committing
- Push to `staging`, never directly to `main`
