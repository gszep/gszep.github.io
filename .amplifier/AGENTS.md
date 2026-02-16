# Personal Portfolio Website

Astro 5 static site with MDX content, Tailwind CSS, and optional React islands.
See `CLAUDE.md` at the repo root for the full project context, workflow, and rules.

## Deployment Workflow (CRITICAL)

- **Always work on the `staging` branch**
- Commit and push to `staging` after finishing edits
- Changes deploy to staging.gszep.com automatically
- **NEVER merge `staging` to `main` without explicit user approval**
- Merging to `main` triggers production deploy to gszep.com

If you are working in this repo via Amplifier, follow the same rules as in `CLAUDE.md`.

## Quick Reference

- **Build**: `npm run build` (output to `dist/`)
- **Dev**: `npm run dev` (localhost:4321)
- **Content**: `src/content/blog/*.mdx` (unified collection)
- **Media**: `public/images/` -- use MP4 for animations, PNG/JPG for stills
- **Site data**: `src/data/site.json` and `src/data/citations.json`
- **Animated content**: `<video autoplay loop muted playsinline src="/images/file.mp4">`
