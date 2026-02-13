# Personal Portfolio Website

This website is managed by Claude Code via a Slack bot. See `CLAUDE.md` at the repo
root for the full project context, workflow, and rules.

The Slack bot (`slack-bot/`) bridges a Slack channel to Claude Code sessions.
Messages are posted in Slack, Claude edits the repo and pushes to the
`staging` branch. A GitHub Action syncs staging to a deploy repo at
https://staging.gszep.com. The `/approve` command creates and merges a PR
from `staging` to `main`; production deploys automatically.

Always commit and push to staging after finishing edits. Never leave uncommitted work.

If you are working in this repo via Amplifier, follow the same rules as in `CLAUDE.md`.
