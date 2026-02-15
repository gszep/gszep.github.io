# Website Architecture Plan

Implementation plan for rewriting gszep.com as an AI-native personal website with Distill-style interactive blog posts.

## Design Requirements

### Core Priorities

1. **Accessibility**: Text-based articles must load instantly on slow phones/connections. Heavy simulations and videos load only when the reader scrolls to them. Zero unnecessary JavaScript on content pages.

2. **Discoverability**: Every page must be a real HTML file with real content — no client-side rendering required. Crawlers, AI agents, RSS readers, and `curl` must see full content without executing JavaScript.

3. **AI editability**: The site is managed by an AI agent via a Slack bot. The codebase must be structured so an LLM can reliably create, edit, and navigate content and components. Prioritize formats and frameworks with the largest LLM training corpus.

4. **Interactive publishing**: Support Distill.pub-quality interactive demos and WebGPU simulations embedded in blog posts. Client-side computation only (GitHub Pages hosting, no server).

5. **Frequent blogging**: Adding a new blog post should require creating a single MDX file. No routing config, no manifest updates, no build pipeline changes.

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|----------|
| Static site generator | **Astro 5.x** (pinned) | Island architecture: static HTML by default, selective JS hydration. File-based routing. Content Collections for blog management. |
| Content format | **MDX** | Markdown (LLMs' strongest format) with embedded components. Each blog post is one `.mdx` file. |
| Interactive components | **Vanilla TypeScript** | WebGPU simulations are canvas + shaders + TS. No framework wrapper needed. Most AI-reliable option. |
| Complex interactive UI | **React** (escape hatch) | Only when a demo needs complex reactive state (interdependent controls, dynamic UI). React has the largest LLM training corpus. |
| Styling | **Tailwind CSS** | Utility-first CSS. LLMs generate it reliably. |
| Math | **KaTeX** | LaTeX equations in blog posts. |
| Deployment | **GitHub Pages** via GitHub Actions | Static output, no server costs. |

### Framework Constraints

- **Pin Astro to 5.x** — do not upgrade to v6 until it stabilizes and LLM training data catches up. Astro's Content Collections API has changed significantly across versions.
- **No Svelte** — LLMs consistently mix Svelte 4 and Svelte 5 (runes) syntax. Well-documented community problem.
- **No exotic Astro features** — no middleware, no SSR, no view transitions, no hybrid rendering. Use Astro only as a static shell.
- **Minimal Content Collections config** — simple frontmatter schemas, nothing fancy. Target ~20 lines of schema config total.
- **`.astro` files for layout only** — these are effectively HTML templates with a JS frontmatter block. No complex logic.

## Directory Structure

```
gszep.github.io/
├── src/
│   ├── content/                 # All content lives here (AI edits these)
│   │   ├── blog/                # Blog posts as MDX files
│   │   │   ├── growing-ca.mdx
│   │   │   └── momentum.mdx
│   │   ├── projects/            # Project pages as MDX
│   │   │   ├── immune-receptors.mdx
│   │   │   └── dynamical-systems.mdx
│   │   └── config.ts            # Content collection schemas
│   │
│   ├── components/              # Reusable components
│   │   ├── interactive/         # Client-side islands
│   │   │   ├── FluidSim.ts      # Vanilla TS WebGPU simulation class
│   │   │   ├── FluidSim.astro   # Astro wrapper (canvas + controls + script)
│   │   │   ├── GameOfLife.ts
│   │   │   ├── GameOfLife.astro
│   │   │   └── webgpu/          # Shared WebGPU utilities
│   │   │       ├── utils.ts     # Canvas setup, texture management
│   │   │       └── shaders/     # Shared WGSL shader code
│   │   ├── ui/                  # Static layout components (.astro)
│   │   │   ├── Nav.astro
│   │   │   ├── Footer.astro
│   │   │   ├── ProjectCard.astro
│   │   │   └── CitationCard.astro
│   │   └── blog/                # Blog-specific components
│   │       ├── Figure.astro     # Captioned figures
│   │       ├── Equation.astro   # KaTeX math blocks
│   │       ├── Aside.astro      # Margin notes (Distill-style)
│   │       └── CodeBlock.astro  # Syntax-highlighted code
│   │
│   ├── layouts/
│   │   ├── Base.astro           # HTML shell, meta, fonts, Tailwind
│   │   ├── Page.astro           # Generic page
│   │   └── Post.astro           # Blog post (Distill-inspired typography)
│   │
│   ├── pages/
│   │   ├── index.astro          # Homepage
│   │   ├── blog/
│   │   │   ├── index.astro      # Blog listing
│   │   │   └── [...slug].astro  # Dynamic blog routes from content
│   │   └── projects/
│   │       ├── index.astro      # Projects listing
│   │       └── [...slug].astro  # Dynamic project routes
│   │
│   ├── styles/
│   │   └── post.css             # Distill-inspired article typography
│   │
│   └── data/
│       └── citations.json       # Publications data
│
├── public/                      # Static assets served as-is
│   ├── images/
│   ├── fonts/
│   └── favicon.svg
│
├── slack-bot/                   # Slack bot (unchanged)
├── astro.config.mjs             # Astro config
├── tailwind.config.mjs          # Tailwind config
├── tsconfig.json
├── package.json
├── CLAUDE.md                    # AI agent instructions
├── ARCHITECTURE.md              # This file
└── .amplifier/AGENTS.md
```

## Content Patterns

### Blog Post (MDX)

A blog post is a single MDX file. The AI creates this file and the site automatically picks it up.

```mdx
---
title: "Understanding Momentum in Gradient Descent"
date: 2026-02-20
description: "An interactive exploration of why momentum works"
tags: ["optimization", "deep-learning"]
hero: "/images/blog/momentum-hero.png"
---

import Equation from '../../components/blog/Equation.astro'
import Aside from '../../components/blog/Aside.astro'
import MomentumSim from '../../components/interactive/MomentumSim.astro'

Gradient descent with momentum accelerates convergence by accumulating
a velocity vector in directions of persistent gradient.

<Equation>
  v_t = \beta v_{t-1} + \nabla L(\theta_t)
</Equation>

<Aside>
  The momentum coefficient is typically set to 0.9.
  Try adjusting it in the simulation below.
</Aside>

## Interactive Demo

Drag the starting point and observe how momentum affects the trajectory:

<MomentumSim />
```

### Interactive Simulation Component

Each simulation is two files: a vanilla TypeScript class (logic) and an Astro wrapper (DOM).

**Logic** (`src/components/interactive/FluidSim.ts`):
```typescript
export class FluidSim {
  private device!: GPUDevice;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  async init() {
    const adapter = await navigator.gpu.requestAdapter();
    this.device = await adapter!.requestDevice();
    // setup pipelines, bind groups
  }

  setParam(key: string, value: number) { /* update uniforms */ }

  start() {
    const frame = () => {
      // compute pass + render pass
      requestAnimationFrame(frame);
    };
    frame();
  }
}
```

**Wrapper** (`src/components/interactive/FluidSim.astro`):
```astro
---
interface Props {
  width?: number;
  height?: number;
}
const { width = 800, height = 600 } = Astro.props;
---
<div class="sim-container">
  <canvas id="fluid-canvas" width={width} height={height}></canvas>
  <label>
    Viscosity
    <input type="range" id="viscosity" min="0" max="1" step="0.01" value="0.1" />
  </label>
  <noscript>Interactive simulation requires JavaScript.</noscript>
</div>

<script>
  import { FluidSim } from './FluidSim';

  const canvas = document.getElementById('fluid-canvas') as HTMLCanvasElement;
  if (navigator.gpu) {
    const sim = new FluidSim(canvas);
    await sim.init();
    sim.start();

    document.getElementById('viscosity')!.addEventListener('input', (e) => {
      sim.setParam('viscosity', parseFloat((e.target as HTMLInputElement).value));
    });
  } else {
    // Fallback: show static image or message
    canvas.parentElement!.innerHTML = '<p>WebGPU is not supported in your browser. <a href="https://caniuse.com/webgpu">Check compatibility.</a></p>';
  }
</script>
```

Astro automatically makes this an island — the `<script>` tag is bundled and loaded only on pages that use this component.

## Migration from Jekyll

### Content to Migrate

| Source | Destination | Notes |
|--------|------------|-------|
| `_data/projects.yml` (5 entries) | `src/content/projects/*.mdx` | Convert each project to an MDX page |
| `_data/citations.csv` (11 publications) | `src/data/citations.json` | Convert CSV to JSON |
| `projects/*.md` (6 detail pages) | `src/content/projects/*.mdx` | Merge with project data |
| `art/muscle/` (WebGL bundle) | `src/components/interactive/` | Wrap as Astro component |
| `art/thread-panic/` (WebGPU bundle) | `src/components/interactive/` | Wrap as Astro component |
| `assets/images/` (~30 files) | `public/images/` | Optimize large GIFs (see below) |
| `_config.yml` site metadata | `astro.config.mjs` + `src/data/site.json` | |
| `_includes/showcase.html` hero data | `src/pages/index.astro` | |
| `_sass/` + `assets/css/` | `src/styles/` + Tailwind | Rewrite with Tailwind |

### Image Optimization Required

These files are committed to git and should be addressed:

| File | Size | Action |
|------|------|--------|
| `flowatlas.gif` | 88 MB | Convert to MP4/WebM video, lazy-load |
| `double-exclusive-reporter.gif` | 63 MB | Convert to MP4/WebM video, lazy-load |
| `limit-cycle.gif` | 14 MB | Convert to MP4/WebM video or optimize |
| Build artifacts in `assets/images/_site/` | Unknown | Delete (accidentally committed) |
| Build artifacts in `assets/images/.jekyll-cache/` | Unknown | Delete (accidentally committed) |

### Files to Delete After Migration

- `Gemfile`, `Gemfile.lock`, `.ruby-version` (Ruby/Jekyll)
- `_config.yml` (Jekyll config)
- `_includes/`, `_layouts/`, `_sass/` (Jekyll templates)
- `_data/` (migrated to new locations)
- `projects/` (migrated to `src/content/projects/`)
- `assets/` (migrated to `public/` and `src/styles/`)
- `index.md`, `blog.md`, `404.md`, `test-page.md`, `search.json` (Jekyll pages)

### Files to Keep

- `slack-bot/` (Slack bot, unchanged)
- `CLAUDE.md` (AI instructions, update for new structure)
- `.amplifier/AGENTS.md` (Amplifier config, update for new structure)
- `.github/workflows/sync-staging.yml` (update for Astro build)
- `CNAME` (custom domain)

## Deployment Changes

### GitHub Actions Update

The `sync-staging.yml` workflow needs to:

1. Install Node.js and dependencies (`npm ci`)
2. Build the Astro site (`npm run build`) — outputs to `dist/`
3. Rewrite CNAME for staging
4. Strip bot infrastructure
5. Push `dist/` contents to the deploy repo

Production (`main` branch) needs a similar workflow since GitHub Pages' built-in Jekyll builder won't work for Astro. Add a `.github/workflows/deploy.yml` that builds and deploys to GitHub Pages using `actions/deploy-pages`.

## Distill-Inspired Typography

The blog post layout should implement Distill's content-width system:

- **`.l-body`**: Main text column (~700px, comfortable reading width)
- **`.l-page`**: Wider than body for large figures (~900px)
- **`.l-screen`**: Full viewport width for immersive simulations
- **Margin notes**: Side annotations that collapse into inline notes on mobile

This is implemented in `src/styles/post.css` and the `Post.astro` layout.

## WebGPU Strategy

- **Browser support**: ~78% global coverage (Chrome, Edge, Safari 26+, Chrome Android, iOS Safari 26+). Firefox still behind a flag.
- **Fallback**: Detect `navigator.gpu`, show static image or Canvas 2D fallback for unsupported browsers.
- **Shared utilities**: Adapt `webgpu-template` patterns (canvas setup, texture management, shader imports) into `src/components/interactive/webgpu/`.
- **Shaders**: WGSL files in `src/components/interactive/webgpu/shaders/`, imported as raw strings via Vite's `?raw` suffix.

## Implementation Order

1. **Scaffold Astro project** — `npm create astro`, configure MDX + Tailwind + React integrations, pin versions
2. **Layouts and base components** — Base.astro, Nav, Footer, homepage skeleton
3. **Content Collections setup** — Blog and project schemas, one example post
4. **Blog infrastructure** — Post layout with Distill-inspired typography, listing page, MDX components (Equation, Figure, Aside)
5. **Migrate homepage content** — Hero, projects grid, publications list
6. **Migrate existing projects** — Convert 6 project pages to MDX
7. **Migrate publications** — Convert citations.csv to JSON, render with CitationCard
8. **Interactive demo infrastructure** — WebGPU utilities, one example simulation
9. **Migrate existing art** — Wrap muscle and thread-panic as Astro components
10. **Image optimization** — Convert large GIFs to video, clean up artifacts
11. **Deployment** — Update GitHub Actions for Astro build
12. **Cleanup** — Remove Jekyll files, update CLAUDE.md and AGENTS.md
