# AI-First Personal Website

A personal portfolio website managed entirely by AI agents. The site is an Astro 5 static site with MDX content, deployed to GitHub Pages with a staging/production workflow.

Live at [gszep.com](https://gszep.com) | Staging at [staging.gszep.com](https://staging.gszep.com)

## Architecture Overview

```
                AI Agent (Claude Code / Amplifier)
                         |
                    edits code
                         |
                         v
    +-----------------------------------------+
    |          Source Repo (this repo)         |
    |   staging branch -----> main branch      |
    |       |                    |             |
    +-------|--------------------|-----------  +
            |                    |
     GitHub Action          GitHub Action
     (build + push)         (build + deploy)
            |                    |
            v                    v
    staging.gszep.com       gszep.com
    (preview site)          (production)
```

### How It Works

1. An AI agent (Claude Code or Amplifier) makes changes directly to the codebase
2. Changes are committed and pushed to the `staging` branch
3. A GitHub Action builds the Astro site and deploys to staging.gszep.com
4. The human reviews the staging site and approves
5. The staging branch is merged to `main`, triggering production deploy

The AI agent never merges to production without explicit human approval.

## AI Agent Configuration

The repo includes configuration files that give AI agents the context they need:

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Instructions for Claude Code (project rules, structure, workflow) |
| `.amplifier/AGENTS.md` | Instructions for Amplifier (quick reference, same rules) |
| `ARCHITECTURE.md` | Technical blueprint (design decisions, patterns, constraints) |

These files are automatically loaded by the respective AI tools at the start of each session.

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Framework | Astro 5.x | Island architecture, static HTML default, file-based routing |
| Content | MDX | Markdown with components -- LLMs' strongest format |
| Styling | Tailwind CSS | Utility classes that LLMs generate reliably |
| Math | KaTeX | LaTeX equations in blog posts |
| Media | MP4 video | Autoplay/loop replaces GIF at ~96% smaller file size |
| Deploy | GitHub Pages | Static hosting via GitHub Actions |

### Key Constraints

- **Astro pinned to 5.x** -- don't upgrade until LLM training data catches up
- **No Svelte** -- LLMs mix Svelte 4/5 syntax
- **No SSR, middleware, or view transitions** -- static output only
- **React as escape hatch** -- only for complex interactive state

## Implementing This for Your Own Site

### 1. Scaffold the project

```bash
npm create astro@latest my-site
cd my-site
npx astro add mdx tailwind react
```

### 2. Add AI agent instructions

Create a `CLAUDE.md` (or equivalent) at the repo root. Include:
- Project structure and key file locations
- Deployment workflow (staging-first)
- Content editing patterns
- Framework constraints and rules

The more specific and structured this file is, the better the AI performs.

### 3. Set up staging/production branches

```bash
git checkout -b staging
git push -u origin staging
```

Configure two GitHub Actions workflows:
- **staging**: On push to `staging`, build and deploy to a preview URL
- **production**: On push to `main`, build and deploy to production

### 4. Content as MDX files

Define a content collection in `src/content/config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
    order: z.number().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { blog };
```

Each blog post is a single `.mdx` file. No routing config needed.

### 5. Use MP4 instead of GIF

Convert animated content to MP4 for massive size savings:

```bash
ffmpeg -i animation.gif -movflags faststart -pix_fmt yuv420p \
  -vf 'scale=trunc(iw/2)*2:trunc(ih/2)*2' -c:v libx264 -crf 23 animation.mp4
```

Embed with autoplay to match GIF behavior:

```html
<video autoplay loop muted playsinline src="/images/animation.mp4"></video>
```

## Development

```bash
npm install               # Install dependencies
npm run dev               # Dev server at localhost:4321
npm run build             # Production build
```

## License

Content and code in this repository are under the project license. See [LICENSE](LICENSE) for details.
