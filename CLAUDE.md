# Grisha Szep - Personal Portfolio

Personal portfolio website. Astro 5 static site with MDX content, deployed to GitHub Pages.

## Deployment Workflow (CRITICAL)

**All work happens on the `staging` branch. Never push directly to `main`.**

1. Switch to `staging` branch before making changes
2. Make changes, run `npm run build` to verify
3. Commit and push to `staging`
4. Changes deploy to staging.gszep.com automatically (~2 minutes)
5. **ONLY merge `staging` to `main` when the user gives explicit approval**
6. Merging to `main` triggers production deploy to gszep.com

**Rules:**
- Always commit and push to `staging` after finishing edits
- Never leave uncommitted work
- Never merge to `main` without explicit user approval
- Never push directly to `main`
- If the build fails, fix it before moving on

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro 5.x (pinned) |
| Content | MDX (Markdown + components) |
| Styling | Tailwind CSS |
| Math | KaTeX |
| Media | MP4 video with autoplay/loop/muted (not GIF) |
| Deploy | GitHub Pages via GitHub Actions |
| Domains | staging.gszep.com (staging), gszep.com (production) |

## Project Structure

```
src/
  content/
    blog/                  # All content as MDX files (unified collection)
    config.ts              # Content collection schema
  components/
    ui/                    # Static layout components (.astro)
      Nav.astro            # Navigation bar
      Footer.astro         # Footer / contact section
      ProjectCard.astro    # Blog post card (supports img and video)
      CitationCard.astro   # Publication card
    blog/                  # Blog-specific components
      Equation.astro       # KaTeX math blocks
      Figure.astro         # Captioned figures (body/page/screen widths)
      Aside.astro          # Margin notes (Distill-style)
      CodeBlock.astro      # Syntax-highlighted code
    interactive/           # Client-side islands (future: WebGPU sims)
  layouts/
    Base.astro             # HTML shell, meta, fonts, staging password gate
    Page.astro             # Generic page (Nav + Footer)
    Post.astro             # Blog post layout (currently unused)
  pages/
    index.astro            # Homepage (Blog + Publications + Contact)
    blog/
      index.astro          # Blog listing
      [...slug].astro      # Dynamic blog routes (inline layout)
  styles/
    post.css               # Distill-inspired article typography
  data/
    site.json              # Site metadata
    citations.json         # Publications data
public/
  images/                  # Static assets (MP4, PNG, JPG)
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

Images and videos go in `public/images/` and are referenced as `/images/filename.ext`.

## Adding a Blog Post

Create a single MDX file in `src/content/blog/`:

```mdx
---
title: "My Post Title"
date: 2026-02-20
description: "A short description"
image: "/images/thumbnail.mp4"
tags: ["tag1", "tag2"]
order: 1
---

Your markdown content here.
```

Frontmatter fields: title, description, date (required); image, tags, hero, order, draft (optional).

No routing config or manifest changes needed.

## Media Format

Animated content uses MP4 video, not GIF. This reduces file sizes by ~96%.

- **In blog posts**: Use `<video autoplay loop muted playsinline src="/images/file.mp4"></video>`
- **In frontmatter**: Set `image: "/images/thumbnail.mp4"` -- ProjectCard auto-detects MP4 and renders `<video>`
- **Static images**: Use standard `<img>` tags with PNG/JPG

## Blog Post Layout

Blog posts use a Distill.pub-inspired editorial layout (inline in `[...slug].astro`):
- White background with dark text
- 700px text column for optimal readability
- Figures break wider than text (up to 900px)
- Centered figcaptions with muted color
- `github-light` syntax highlighting for code blocks

## Staging Password Gate

The staging site at staging.gszep.com has a client-side password gate.
The password is `preview`. Production (gszep.com) and localhost are not affected.
The gate is implemented in `src/layouts/Base.astro`.

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
2. Run `npm run build` to validate before committing
3. Commit frequently with small, atomic changes
4. Always push to the `staging` branch
5. **Never merge to `main` without explicit user approval**
6. Images/videos go in `public/images/` -- referenced as `/images/filename.ext`
7. Use MP4 for animated content, not GIF
