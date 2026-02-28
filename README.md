# AI-First Personal Website

A personal blog / lab notebook managed entirely by AI agents. Astro 5 static site with MDX content, deployed to GitHub Pages.

Live at [gszep.com](https://gszep.com) | Staging at [staging.gszep.com](https://staging.gszep.com)

## How It Works

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
    +-------|--------------------|-------------+
            |                    |
     GitHub Action          GitHub Action
     (build + push)         (build + deploy)
            |                    |
            v                    v
    staging.gszep.com       gszep.com
    (preview site)          (production)
```

1. AI agent makes changes and pushes to `staging`
2. GitHub Action deploys to staging.gszep.com
3. Human reviews and approves
4. Merge to `main` triggers production deploy

The AI agent never merges to production without explicit human approval.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro 5.x |
| Content | MDX |
| Styling | Tailwind CSS |
| Math | KaTeX |
| Media | MP4 video (not GIF) |
| Deploy | GitHub Pages via GitHub Actions |

## Development

```bash
npm install               # Install dependencies
npm run dev               # Dev server at localhost:4321
npm run build             # Production build
```

AI agent instructions live in `CLAUDE.md`.

## License

Content and code in this repository are under the project license. See [LICENSE](LICENSE) for details.
