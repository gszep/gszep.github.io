# Personal Portfolio Website

Astro 5 static site with MDX content, Tailwind CSS, and optional React islands.
See `CLAUDE.md` at the repo root for the full project context, workflow, and rules.

The Slack bot (`slack-bot/`) bridges a Slack channel to Claude Code sessions.
Messages are posted in Slack, Claude edits the repo and pushes to the
`staging` branch. A GitHub Action builds the Astro site and syncs to a deploy repo at
https://staging.gszep.com. The `/approve` command creates and merges a PR
from `staging` to `main`; production deploys automatically.

Always commit and push to staging after finishing edits. Never leave uncommitted work.

If you are working in this repo via Amplifier, follow the same rules as in `CLAUDE.md`.

## Quick Reference

- **Build**: `npm run build` (output to `dist/`)
- **Dev**: `npm run dev` (localhost:4321)
- **Content**: `src/content/blog/*.mdx` and `src/content/projects/*.mdx`
- **Images**: `public/images/` (referenced as `/images/filename.ext`)
- **Site data**: `src/data/site.json` and `src/data/citations.json`
