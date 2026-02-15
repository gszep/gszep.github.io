# Grisha Szep - Personal Portfolio

Personal portfolio website. Astro 5 static site with MDX content, deployed to GitHub Pages.

## How This Site Is Managed

This website is managed directly through Claude Code.

1. Changes are made on the `staging` branch
2. Run `npm run build` to verify, commit, and push to `staging`
3. A GitHub Action builds the Astro site and syncs to staging.gszep.com
4. When ready, merge `staging` to `main` for production deploy to gszep.com

This is a single-repo model:
- **`staging` branch** -- work happens here, synced to staging.gszep.com
- **`main` branch** -- production, deploys to gszep.com via GitHub Pages

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro 5.x (pinned) |
| Content | MDX (Markdown + components) |
| Interactive | Vanilla TypeScript + WebGPU |
| Complex UI | React (escape hatch only) |
| Styling | Tailwind CSS |
| Math | KaTeX |
| Deploy | GitHub Pages via GitHub Actions |
| Domain | staging.gszep.com (staging), gszep.com (production) |

## Project Structure

```
src/
  content/
    blog/                  # All content as MDX files (unified collection)
    config.ts              # Content collection schema
  components/
    interactive/           # Client-side islands (WebGPU, simulations)
    ui/                    # Static layout components (.astro)
    blog/                  # Blog-specific components (Equation, Figure, Aside)
  layouts/
    Base.astro             # HTML shell, meta, fonts, Tailwind
    Page.astro             # Generic page
    Post.astro             # Blog post layout
  pages/
    index.astro            # Homepage (Blog + Publications sections)
    blog/                  # Blog listing + dynamic routes
  styles/
    post.css               # Distill-inspired article typography
  data/
    site.json              # Site metadata
    citations.json         # Publications data
public/
  images/                  # Static image assets
astro.config.mjs           # Astro config
tailwind.config.mjs        # Tailwind config
tsconfig.json              # TypeScript config
package.json               # Node dependencies
```

## Content Editing

Most requests are content updates. Key files:

| File | What it controls |
|------|-----------------|
| `src/content/blog/*.mdx` | Blog posts (unified -- art, science, projects) |
| `src/data/citations.json` | Publications list |
| `src/data/site.json` | Site title, author info, social links |
| `src/pages/index.astro` | Homepage layout |
| `src/components/ui/Nav.astro` | Navigation bar |
| `src/components/ui/Footer.astro` | Footer content |

Images go in `public/images/` and are referenced as `/images/filename.ext`.

## Adding a Blog Post

Create a single MDX file in `src/content/blog/`:

```mdx
---
title: "My Post Title"
date: 2026-02-20
description: "A short description"
image: "/images/thumbnail.png"
tags: ["tag1", "tag2"]
order: 1
---

Your markdown content here.
```

Frontmatter fields: title, description, date (required); image, tags, hero, order, draft (optional).

No routing config or manifest changes needed.

## Blog Post Layout

Blog posts use a Distill.pub-inspired editorial layout:
- White background with dark text
- 700px text column (`l-body`) for optimal readability
- Figures break wider than text (up to 900px)
- Centered figcaptions with muted color
- `github-light` syntax highlighting for code blocks

## Staging Password Gate

The staging site at staging.gszep.com has a client-side password gate.
The password is `preview`. Production (gszep.com) and localhost are not affected.
The gate is implemented in `src/layouts/Base.astro`.

## After Making Changes (MANDATORY)

Always commit and push after finishing edits:

1. Run `npm run build` to verify the build passes
2. Stage and commit with a descriptive message
3. Run `git push origin staging`
4. Changes will be live at https://staging.gszep.com in ~2 minutes

Never leave uncommitted work. If the build fails, fix it before moving on.

## Development Commands

```bash
npm install               # Install dependencies
npm run dev               # Dev server at http://localhost:4321
npm run build             # Production build (output to dist/)
npm run preview           # Preview production build
```

## Framework Constraints

- **Pin Astro to 5.x** -- do not upgrade to v6 until it stabilizes
- **No Svelte** -- LLMs mix Svelte 4 and 5 syntax
- **No exotic Astro features** -- no middleware, no SSR, no view transitions
- **Minimal Content Collections config** -- simple frontmatter schemas only
- **`.astro` files for layout only** -- no complex logic

## Rules

1. Always read files before editing -- understand structure first
2. Run `npm run build` to validate before pushing
3. Commit frequently with small, atomic changes
4. Always push to the `staging` branch -- never push directly to `main`
5. Images go in `public/images/` -- referenced as `/images/filename.ext`
