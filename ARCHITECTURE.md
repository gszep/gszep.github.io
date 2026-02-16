# Website Architecture

Technical blueprint for gszep.com -- an AI-native personal website with Distill-style interactive blog posts.

## Design Principles

1. **Accessibility**: Text loads instantly on slow connections. Heavy media loads lazily. Zero unnecessary JavaScript on content pages.

2. **Discoverability**: Every page is real HTML with real content. Crawlers, AI agents, RSS readers, and `curl` see full content without executing JavaScript.

3. **AI editability**: The site is managed by AI agents. The codebase uses formats and frameworks with the largest LLM training corpus. Adding content requires creating a single file.

4. **Interactive publishing**: Support Distill.pub-quality interactive demos and WebGPU simulations embedded in blog posts. Client-side computation only (GitHub Pages hosting).

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|----------|
| Static site generator | Astro 5.x (pinned) | Island architecture: static HTML by default, selective JS hydration |
| Content format | MDX | Markdown with components -- LLMs' strongest format |
| Interactive components | Vanilla TypeScript | WebGPU simulations: canvas + shaders + TS |
| Complex UI | React (escape hatch) | Only for demos needing complex reactive state |
| Styling | Tailwind CSS | Utility-first CSS that LLMs generate reliably |
| Math | KaTeX | LaTeX equations in blog posts |
| Media | MP4 video | Autoplay/loop replaces GIF at ~96% smaller size |
| Deployment | GitHub Pages | Static output via GitHub Actions |
| Sitemap | @astrojs/sitemap | Auto-generated sitemap.xml for crawler discoverability |

### Framework Constraints

- **Pin Astro to 5.x** -- do not upgrade until LLM training data catches up
- **No Svelte** -- LLMs mix Svelte 4 and 5 syntax
- **No exotic Astro features** -- no middleware, no SSR, no view transitions
- **Minimal Content Collections config** -- simple frontmatter schemas only
- **`.astro` files for layout only** -- no complex logic

## Directory Structure

```
gszep.github.io/
+-- src/
|   +-- content/
|   |   +-- blog/                    # All posts as MDX (unified collection)
|   |   |   +-- fault-tolerance.mdx
|   |   |   +-- designing-immune-receptors.mdx
|   |   |   +-- brutalism-and-pencil-shaders.mdx
|   |   |   +-- exploring-high-dimensional-point-clouds.mdx
|   |   |   +-- interactive-dynamical-systems.mdx
|   |   +-- config.ts                # Content collection schema
|   |
|   +-- components/
|   |   +-- ui/                      # Static layout components
|   |   |   +-- Nav.astro
|   |   |   +-- Footer.astro
|   |   |   +-- ProjectCard.astro    # Blog post card (img + video support)
|   |   |   +-- CitationCard.astro
|   |   +-- interactive/             # Client-side islands (WebGPU sims)
|   |   |   +-- HeroSimulation.astro # Game of Life hero overlay
|   |   |   +-- webgpu/              # Shared WebGPU utilities + simulations
|   |   |       +-- utils.ts
|   |   |       +-- GameOfLife.ts
|   |   |       +-- game-of-life.compute.wgsl
|   |   |       +-- game-of-life.render.wgsl
|   |
|   +-- layouts/
|   |   +-- Base.astro               # HTML shell, meta, fonts, staging gate
|   |   +-- Page.astro               # Generic page (Nav + Footer)
|   |   +-- Post.astro               # Blog post layout (dark Distill theme)
|   |
|   +-- pages/
|   |   +-- index.astro              # Homepage (Blog + Publications + Contact)
|   |   +-- blog/
|   |       +-- index.astro          # Blog listing
|   |       +-- [...slug].astro      # Dynamic blog routes (uses Post layout)
|   |
|   +-- styles/
|   |   +-- post.css                 # Distill-inspired article typography
|   |
|   +-- data/
|       +-- site.json                # Site metadata
|       +-- citations.json           # Publications data (11 entries)
|
+-- public/
|   +-- images/                      # Static assets (MP4, PNG, JPG)
|
+-- .github/workflows/
|   +-- deploy.yml                   # main -> GitHub Pages (gszep.com)
|   +-- sync-staging.yml             # staging -> staging.gszep.com
|
+-- CLAUDE.md                        # AI agent instructions
+-- ARCHITECTURE.md                  # This file
+-- .amplifier/AGENTS.md             # Amplifier agent instructions
+-- astro.config.mjs
+-- tailwind.config.mjs
+-- tsconfig.json
+-- package.json
```

## Deployment Architecture

```
staging branch --> sync-staging.yml --> build --> push dist/ --> staging.gszep.github.io --> staging.gszep.com
main branch    --> deploy.yml       --> build --> actions/deploy-pages     --> gszep.com
```

- **Production** (`main`): Uses GitHub's native `actions/deploy-pages` with `build_type: workflow`
- **Staging** (`staging`): Builds Astro, pushes pre-built `dist/` to a separate deploy repo via SSH deploy key
- Staging deploy repo serves static files via GitHub Pages with `build_type: legacy`
- A `.nojekyll` file is added to `dist/` to prevent GitHub's Jekyll processing

## Content Patterns

### Blog Post (MDX)

A blog post is a single MDX file. The site automatically picks it up via Content Collections.

```mdx
---
title: "Post Title"
date: 2026-02-20
description: "A short description"
image: "/images/thumbnail.mp4"
tags: ["optimization", "deep-learning"]
order: 1
---

Markdown content here. Use standard HTML for figures:

<figure>
  <video autoplay loop muted playsinline src="/images/demo.mp4"></video>
  <figcaption>Description of the demo</figcaption>
</figure>
```

Frontmatter fields: title, description, date (required); image, tags, order, draft (optional).

Posts are sorted by `order` field (curated ordering, not chronological).

### Media Format

All animated content uses MP4 video instead of GIF:
- **Body content**: `<video autoplay loop muted playsinline src="..."></video>`
- **Thumbnails**: Set `image: "/images/thumbnail.mp4"` in frontmatter -- `ProjectCard.astro` auto-detects and renders `<video>`
- Conversion: `ffmpeg -i input.gif -movflags faststart -pix_fmt yuv420p -vf 'scale=trunc(iw/2)*2:trunc(ih/2)*2' -c:v libx264 -crf 23 output.mp4`

## Component Architecture

### Layout Components (`src/layouts/`)

- **Base.astro**: HTML shell with meta tags, Google Fonts (Poppins), Tailwind, theme detection script, staging password gate
- **Page.astro**: Wraps Base with Nav + Footer for generic pages
- **Post.astro**: Distill-inspired blog layout with title, description, date, tags, and separator

### UI Components (`src/components/ui/`)

- **Nav.astro**: Fixed top nav, responsive with mobile hamburger menu, theme toggle
- **Footer.astro**: Contact section with headshot, about text, social links
- **ThemeToggle.astro**: Sun/moon toggle for light/dark mode with localStorage persistence
- **ProjectCard.astro**: Blog post card with MP4/image support, hover scale effect
- **CitationCard.astro**: Publication renderer with author abbreviation logic

### Blog Content Pattern

Blog posts use **raw HTML** for figures, videos, and media. This is deliberate -- raw HTML tags (`<figure>`, `<img>`, `<video>`) are in every LLM's training corpus and require no import paths or component APIs to get right. Distill width classes can be applied directly:

```html
<figure class="l-body">...</figure>   <!-- 700px default -->
<figure class="l-page">...</figure>   <!-- 900px wider -->
<figure class="l-screen">...</figure> <!-- full viewport -->
```

If future posts need complex interactive behavior (KaTeX equations, margin notes), create focused components in `src/components/blog/` at that point with real requirements.

## Distill-Inspired Typography

The blog layout implements Distill's content-width system in `src/styles/post.css`:

- **`.l-body`**: Main text column (700px, comfortable reading width)
- **`.l-page`**: Wider figures (900px)
- **`.l-screen`**: Full viewport width for immersive content
- **Margin notes**: Side annotations that collapse on mobile

Post typography uses CSS custom properties (defined in `:root` and `.dark`) so all colors switch automatically with the theme. Figures without explicit width classes break out to page width (900px) for visual rhythm. Dual Shiki themes (`github-light`/`github-dark`) provide syntax highlighting that follows the active theme.

## Light/Dark Theme

The site supports light and dark modes with system preference detection:

1. **Detection**: Inline `<script>` in `<head>` checks `localStorage` then `prefers-color-scheme` before any render (no flash)
2. **Mechanism**: Tailwind `darkMode: 'class'` -- `.dark` class on `<html>` activates all `dark:` variants
3. **Toggle**: `ThemeToggle.astro` in the nav bar (sun/moon icons) persists choice to `localStorage`
4. **CSS custom properties**: `post.css` defines `--post-text`, `--post-heading`, `--post-link`, etc. with light defaults and `.dark` overrides
5. **Code blocks**: Shiki dual themes generate both light and dark inline styles; `.dark .astro-code` CSS activates the dark variables

## Staging Password Gate

The staging site has a client-side password gate (password: `preview`). Implemented in `Base.astro`, only active when hostname is `staging.gszep.com`. Production and localhost bypass it.

## Interactive Simulations (WebGPU)

The site supports WebGPU simulations embedded in pages. The first simulation is Conway's Game of Life running as an overlay on the homepage hero section.

### Architecture

- Each simulation: vanilla TypeScript class (logic) + Astro wrapper (DOM)
- Shared utilities in `src/components/interactive/webgpu/utils.ts`
- WGSL shaders imported as raw strings via Vite's `?raw` suffix (declared in `src/wgsl.d.ts`)
- WebGPU types via `@webgpu/types` dev dependency
- Silent fallback: if WebGPU is unsupported, canvas is removed and CSS fallback stays

### File Structure

```
src/components/interactive/
+-- webgpu/
|   +-- utils.ts                    # Shared: device init, canvas resize
|   +-- GameOfLife.ts               # Game of Life simulation class
|   +-- game-of-life.compute.wgsl   # Compute shader (B3/S23 rules)
|   +-- game-of-life.render.wgsl    # Render shader (fullscreen triangle)
+-- HeroSimulation.astro            # Astro wrapper for hero overlay
```

### How It Works

1. `HeroSimulation.astro` renders a `<canvas>` in the hero section
2. Client-side script initialises `GameOfLife` class on the canvas
3. If WebGPU is available: canvas replaces the CSS overlay, simulation runs
4. If WebGPU is unavailable: canvas is removed, original CSS overlay stays
5. Theme changes (light/dark) update simulation colours live via `MutationObserver`

### Adding New Simulations

To add a new WebGPU simulation:
1. Create a new TypeScript class in `src/components/interactive/webgpu/` importing from `utils.ts`
2. Write WGSL shaders as `.wgsl` files, import with `?raw` suffix
3. Create an Astro wrapper in `src/components/interactive/`
4. Use the wrapper in any page or MDX blog post

Browser support: ~78% global (Chrome, Edge, Safari 26+)
