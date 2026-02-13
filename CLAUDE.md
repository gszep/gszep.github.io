# Grisha Szep - Personal Portfolio

Personal portfolio website. Jekyll static site deployed to GitHub Pages.

## How This Site Is Managed

This website is managed through a Slack channel. A Slack bot relays messages
to Claude Code, who edits the repo, builds, commits, and pushes changes.
The workflow:

1. Messages are posted in the Slack channel (text, images, links)
2. The Slack bot forwards messages to a Claude Code session running in this repo
3. Claude makes the changes, runs `bundle exec jekyll build` to verify, commits, and pushes to `staging`
4. A GitHub Action syncs the staging branch to a deploy repo: https://staging.gszep.com
5. Changes are reviewed on the staging site
6. When ready, run `/approve` in Slack to create and merge a PR from `staging` to `main`
7. Production deploys automatically: https://gszep.com

This is a single-repo model:
- **`staging` branch** (you are here) -- bot works here, synced to staging.gszep.com
- **`main` branch** -- production, deploys to gszep.com via GitHub Pages

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Jekyll 4 (Ruby) |
| Styling | Bulma CSS 0.8.2 (CDN), custom SCSS |
| Icons | FontAwesome |
| Search | simple-jekyll-search (client-side) |
| Deploy | GitHub Pages via GitHub Actions |
| Domain | staging.gszep.com (staging), gszep.com (production) |

## Project Structure

```
_config.yml             # Jekyll config (title, author, plugins, excludes)
_data/
  projects.yml          # Project entries (data-driven)
  citations.csv         # Publications
_includes/              # Partials: navbar, footer, showcase, cards, etc.
  password-gate.html    # Client-side password gate for staging
_layouts/               # default, page, post, blog, project, publication
_sass/main.scss         # Base styles (Bulma import + Poppins font)
assets/
  css/style.scss        # Main stylesheet
  images/               # Image assets
  js/                   # Client-side search
art/                    # Interactive JS art projects (muscle, thread-panic)
projects/               # Project markdown pages
CNAME                   # Custom domain: gszep.com
slack-bot/              # Slack bot (bridges channel to Claude Code)
```

## Content Editing

Most requests are content updates. Key files:

| File | What it controls |
|------|-----------------|
| `_data/projects.yml` | Project entries |
| `_data/citations.csv` | Publications list |
| `_config.yml` | Site title, author info, social links |
| `_includes/showcase.html` | Hero/showcase section |
| `_includes/navbar.html` | Navigation bar |
| `_includes/footer.html` | Footer content |
| `projects/*.md` | Individual project pages |

Images go in `assets/images/` and are referenced as `/assets/images/filename.ext`.
Uploaded files from Slack are saved to `assets/images/uploads/`.

## Staging Password Gate

The staging site at staging.gszep.com has a client-side password gate.
The password is `preview`. It uses sessionStorage so it persists within
a browser tab. Production (gszep.com) and localhost are not affected.

The gate is implemented in `_includes/password-gate.html` and included
via `_includes/head.html` on every page.

## After Making Changes (MANDATORY)

Always commit and push after finishing edits:

1. Run `bundle exec jekyll build` to verify the build passes
2. Stage and commit with a descriptive message
3. Run `git push origin staging`
4. Tell the team changes will be live at https://staging.gszep.com in ~2 minutes

Never leave uncommitted work. If the build fails, fix it before moving on.

## Development Commands

```bash
bundle install            # Install dependencies
bundle exec jekyll serve  # Dev server at http://localhost:4000
bundle exec jekyll build  # Production build (output to _site/)
```

## Rules

1. Always read files before editing -- understand structure first
2. Run `bundle exec jekyll build` to validate before pushing
3. Commit frequently with small, atomic changes
4. Always push to the `staging` branch -- never push directly to `main`
5. Images go in `assets/images/` -- referenced as `/assets/images/filename.ext`
