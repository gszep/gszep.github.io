# grisha.log

Personal blog / lab notebook of a creative technologist. Astro 5 static site with MDX content, deployed to GitHub Pages. The vibe is casual stream-of-consciousness -- ideas, half-finished projects, interesting artifacts -- not a portfolio or CV.

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
    blog/
      en/                  # English MDX posts
      ja/                  # Japanese MDX posts (matching filenames)
    config.ts              # Content collection schema
  lib/
    posts.ts               # Shared post query helpers
  components/
    ui/                    # Static layout components (.astro)
      Nav.astro            # Navigation bar
      Footer.astro         # Footer / contact section
      ProjectCard.astro    # Blog post card (supports img and video)
      CitationCard.astro   # Publication card
    interactive/           # Client-side islands (future: WebGPU sims)
  layouts/
    Base.astro             # HTML shell, meta, fonts, staging password gate
    Page.astro             # Generic page (Nav + Footer)
    Post.astro             # Blog post layout (Distill theme)
  pages/
    index.astro            # EN Homepage (Blog + Publications + Contact)
    ja/
      index.astro          # JA Homepage
      blog/
        index.astro        # JA Blog listing
        [...slug].astro    # JA blog routes
    blog/
      index.astro          # EN Blog listing
      [...slug].astro      # EN blog routes
  styles/
    post.css               # Distill-inspired article typography
  data/
    site.json              # Site metadata
    citations.json         # Publications data
  i18n/
    utils.ts               # t(), getLangFromUrl(), localizedPath(), getSite()
    en.json                # English UI strings
    ja.json                # Japanese UI strings
scripts/
  check-i18n.mjs           # Build-time i18n validation
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
| `src/content/blog/en/*.mdx` | English blog posts |
| `src/content/blog/ja/*.mdx` | Japanese blog posts (matching filenames) |
| `src/data/citations.json` | Publications list |
| `src/data/site.json` | Site title, author info, social links (has en/ja keys) |
| `src/i18n/en.json` / `ja.json` | UI string translations |
| `src/pages/index.astro` | EN Homepage layout |
| `src/pages/ja/index.astro` | JA Homepage layout |

Images and videos go in `public/images/` and are referenced as `/images/filename.ext`.

## Adding a Blog Post

Create TWO MDX files with the same filename in `en/` and `ja/`:

```mdx
<!-- src/content/blog/en/my-post.mdx -->
---
title: "My Post Title"
date: 2026-02-20
description: "A short description"
image: "/images/thumbnail.mp4"
tags: ["tag1", "tag2"]
order: 1
---

English content here.
```

```mdx
<!-- src/content/blog/ja/my-post.mdx -->
---
title: "記事タイトル"
date: 2026-02-20
description: "短い説明"
image: "/images/thumbnail.mp4"
tags: ["tag1", "tag2"]
order: 1
---

Japanese content here.
```

Frontmatter fields: title, description, date (required); image, imagePosition, tags, order, draft (optional).

No routing config or manifest changes needed. The build-time check (`npm run check-i18n`) will catch missing translations or mismatched shared fields.

## i18n Content Rules (CRITICAL)

This site uses folder-per-language i18n. Locale is derived from folder structure, NOT frontmatter.

**Structure**: `src/content/blog/en/` and `src/content/blog/ja/` with matching filenames.

**Rules for content changes:**
1. Every EN post MUST have a JA counterpart with the same filename (and vice versa)
2. Shared fields MUST be identical across pairs: `date`, `image`, `imagePosition`, `order`, `draft`
3. Tags use English canonical keys in BOTH languages (e.g., `["art", "science"]`, not `["アート", "サイエンス"]`)
4. Only `title`, `description`, and body content are translated
5. Component imports in MDX use `../../../components/` (three levels up from `en/` or `ja/`)
6. Run `npm run check-i18n` to validate sync before committing
7. The build (`npm run build`) runs the i18n check automatically

**Page template pairs that must stay in sync:**
These page files are near-identical between EN and JA, differing only in `const lang` value and import path depth. When changing layout or structure in one, mirror the change to its counterpart:
- `src/pages/index.astro` <-> `src/pages/ja/index.astro`
- `src/pages/blog/index.astro` <-> `src/pages/ja/blog/index.astro`
- `src/pages/blog/[...slug].astro` <-> `src/pages/ja/blog/[...slug].astro`

Note: `check-i18n` only validates blog content pairs, NOT page templates. Template desync must be caught by reviewing both files.

**When editing a post:** Always edit BOTH `en/` and `ja/` versions. If changing a shared field (date, image, order), change it in both files.

**When creating a new post:** Create both `en/` and `ja/` files simultaneously. The build will fail if one is missing.

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
Production (gszep.com) and localhost are not affected.
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

## WebGPU Constraints

- **read_write storage textures**: Only `r32float`, `r32sint`, and `r32uint` formats support `read_write` access. Multi-channel formats like `rgba32float` do NOT support `read_write`.
- **Storage buffers for multi-channel state**: Use `var<storage, read_write> state: array<vec4f>` instead. No format restrictions on storage buffers.
- **Shared utils**: `src/components/interactive/webgpu/utils.ts` provides `initWebGPU`, `resizeCanvas`, `createShader`, `fullscreenPass`.
- **Shader includes**: Use `#import name` in WGSL + `processShaderIncludes()` for shared code (e.g., fullscreen vertex shader).
- **WGSL raw imports**: Import `.wgsl` files with `?raw` suffix (declared in `src/wgsl.d.ts`).
- **WGSL type strictness**: `vec2i(u32_scalar)` fails. Use abstract-int literals (`vec2i(1)`) or explicit casts (`vec2i(i32(x))`). Vector-to-vector conversions like `vec2i(vec2u_value)` work fine.
- **Canvas alpha**: Use `alphaMode: "premultiplied"` on canvas context. Zero state = transparent canvas. Set the wrapper div `background` to control what shows through (white for clean slate, not black).

## WebGPU Compute: Workgroup Cache with Halo (Go-To Pattern)

This is our standard approach for GPU compute simulations that use stencil operations (laplacian, curl, finite differences). It eliminates inter-workgroup race conditions without ping-pong buffers or scratch+copy passes.

### Why not alternatives?

| Approach | Problem |
|----------|---------|
| **Single `read_write` buffer, no cache** | Visible block artifacts at 8x8 workgroup boundaries from inter-workgroup races |
| **Ping-pong (two buffers, alternate read/write)** | Complicates TypeScript with dual bind groups, alternation state, and doubles memory |
| **Scratch buffer + copyBufferToBuffer** | Extra buffer, extra copy per step, still two bind groups |
| **Workgroup cache with halo** | Single buffer, race-free stencils, faster (shared memory reads), clean TypeScript |

### How it works

1. Each 8x8 workgroup loads a `CACHE x CACHE` (e.g. 16x16) tile from global memory into `var<workgroup>` shared memory, including a `HALO`-cell border overlap with neighboring workgroups
2. `workgroupBarrier()` ensures all loads complete before any computation
3. Stencil operations (laplacian, curl, Jacobi) read from the cached tile -- race-free because each workgroup has a self-consistent snapshot
4. Operations that can exceed the cache (e.g. semi-Lagrangian advection with arbitrary displacement) fall back to global memory reads -- any residual races are smoothed by interpolation
5. Results write directly back to the single global `read_write` buffer
6. Only inner cells (excluding halo) are written; halo cells exist solely for neighbor lookups

### Constants (tunable per simulation)

```wgsl
const WG: u32 = 8u;                    // workgroup size
const TILE: u32 = 2u;                  // cells loaded per thread per axis
const HALO: u32 = 1u;                  // halo width (match stencil radius)
const CACHE: u32 = TILE * WG;          // 16 -- total cached tile size
const INNER: u32 = CACHE - 2u * HALO;  // 14 -- active cells per workgroup
```

- `HALO` must be >= the stencil radius (1 for standard 5-point laplacian)
- `TILE` controls how many cells each thread loads (2 is typical)
- Workgroup shared memory: `CACHE * CACHE * sizeof(element)` must fit in 16KB limit

### TypeScript dispatch

```typescript
const INNER = TILE * WG - 2 * HALO; // 14
cp.dispatchWorkgroups(Math.ceil(gw / INNER), Math.ceil(gh / INNER));
```

Note: dispatch uses `INNER` (not `WG`) because each workgroup only writes `INNER x INNER` active cells.

### Key constraint: `workgroupBarrier()` only synchronizes within a workgroup

There is NO inter-workgroup synchronization within a single compute dispatch in WebGPU. The cache pattern works because each workgroup operates on its own consistent snapshot loaded before the barrier. Writes to global memory from different workgroups may interleave, but since each cell is written by exactly one workgroup (the one whose inner region contains it), there are no write conflicts.

### Reference implementations

- **Navier-Stokes**: `src/components/interactive/webgpu/navier-stokes.compute.wgsl` + `NavierStokes.ts`
- **Lattice-Boltzmann** (external): `github.com/gszep/fluid-structure-interactive` -- `src/shaders/includes/cache.wgsl`

## Rules

1. Always read files before editing -- understand structure first
2. Run `npm run build` to validate before committing
3. Commit frequently with small, atomic changes
4. Always push to the `staging` branch
5. **Never merge to `main` without explicit user approval**
6. Images/videos go in `public/images/` -- referenced as `/images/filename.ext`
7. Use MP4 for animated content, not GIF
