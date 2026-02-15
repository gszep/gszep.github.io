# Grisha Szep - Personal Portfolio

Personal portfolio website. Astro 5 static site with MDX content, deployed to GitHub Pages.

## How This Site Is Managed

This website is managed through a Slack channel. A Slack bot relays messages
to Claude Code, who edits the repo, builds, commits, and pushes changes.
The workflow:

1. Messages are posted in the Slack channel (text, images, links)
2. The Slack bot forwards messages to a Claude Code session running in this repo
3. Claude makes the changes, runs `npm run build` to verify, commits, and pushes to `staging`
4. A GitHub Action builds the Astro site and syncs to a deploy repo: https://staging.gszep.com
5. Changes are reviewed on the staging site
6. When ready, run `/approve` in Slack to create and merge a PR from `staging` to `main`
7. Production deploys automatically: https://gszep.com

This is a single-repo model:
- **`staging` branch** (you are here) -- bot works here, synced to staging.gszep.com
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
  content/                 # All content (AI edits these)
    blog/                  # Blog posts as MDX files
    projects/              # Project pages as MDX
    config.ts              # Content collection schemas
  components/
    interactive/           # Client-side islands (WebGPU, simulations)
    ui/                    # Static layout components (.astro)
    blog/                  # Blog-specific components (Equation, Figure, Aside)
  layouts/
    Base.astro             # HTML shell, meta, fonts, Tailwind
    Page.astro             # Generic page
    Post.astro             # Blog post (Distill-inspired typography)
  pages/
    index.astro            # Homepage
    blog/                  # Blog listing + dynamic routes
    projects/              # Projects listing + dynamic routes
  styles/
    post.css               # Distill-inspired article typography
  data/
    site.json              # Site metadata
    citations.json         # Publications data
public/
  images/                  # Static image assets
slack-bot/                 # Slack bot (unchanged)
astro.config.mjs           # Astro config
tailwind.config.mjs        # Tailwind config
tsconfig.json              # TypeScript config
package.json               # Node dependencies
```

## Content Editing

Most requests are content updates. Key files:

| File | What it controls |
|------|-----------------|
| `src/content/projects/*.mdx` | Project pages |
| `src/content/blog/*.mdx` | Blog posts |
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
tags: ["tag1", "tag2"]
---

Your markdown content here. You can import components:

import Equation from '../../components/blog/Equation.astro'

<Equation>E = mc^2</Equation>
```

No routing config or manifest changes needed.

## Staging Password Gate

The staging site at staging.gszep.com has a client-side password gate.
The password is `preview`. It uses sessionStorage so it persists within
a browser tab. Production (gszep.com) and localhost are not affected.

The gate is implemented in `src/layouts/Base.astro`.

## After Making Changes (MANDATORY)

Always commit and push after finishing edits:

1. Run `npm run build` to verify the build passes
2. Stage and commit with a descriptive message
3. Run `git push origin staging`
4. Tell the team changes will be live at https://staging.gszep.com in ~2 minutes

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
