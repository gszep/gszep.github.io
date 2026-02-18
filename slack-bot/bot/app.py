"""Slack bot application: bridges Slack channel to Claude Code sessions."""

import logging
import re
from pathlib import Path

import httpx
from slack_bolt.adapter.socket_mode.async_handler import AsyncSocketModeHandler
from slack_bolt.async_app import AsyncApp

from .claude import ClaudeSession
from .config import Config
from .github import create_upstream_pr

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
)
log = logging.getLogger(__name__)

config = Config.from_env()
bot_user_id: str = ""

app = AsyncApp(token=config.slack_bot_token)

session = ClaudeSession(
    repo_dir=config.repo_dir,
    model=config.claude_model,
    staging_url=config.staging_url,
)


# -- Helpers ------------------------------------------------------------------


def in_bot_channel(event: dict) -> bool:
    """Check if event is in the configured channel."""
    if not config.slack_channel_id:
        return True
    return event.get("channel") == config.slack_channel_id


def to_slack_mrkdwn(text: str) -> str:
    """Minimal markdown-to-Slack-mrkdwn conversion."""
    # **bold** -> *bold*
    text = re.sub(r"\*\*(.+?)\*\*", r"*\1*", text)
    # ## headers -> *header*
    text = re.sub(r"^#{1,6}\s+(.+)$", r"*\1*", text, flags=re.MULTILINE)
    # [text](url) -> <url|text>
    text = re.sub(r"\[(.+?)\]\((.+?)\)", r"<\2|\1>", text)
    return text


def truncate(text: str, limit: int = 3000) -> str:
    """Truncate for Slack message limits."""
    if len(text) <= limit:
        return text
    return text[:limit] + "\n_... (truncated)_"


async def download_slack_file(url: str, filename: str) -> str:
    """Download a Slack file into the repo uploads directory."""
    upload_dir = Path(config.repo_dir) / config.upload_dir
    upload_dir.mkdir(parents=True, exist_ok=True)

    dest = upload_dir / filename
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.get(
            url, headers={"Authorization": f"Bearer {config.slack_bot_token}"}
        )
        resp.raise_for_status()
        dest.write_bytes(resp.content)

    return str(dest.relative_to(config.repo_dir))


async def get_display_name(client, user_id: str) -> str:
    """Fetch a Slack user's display name."""
    try:
        info = await client.users_info(user=user_id)
        profile = info["user"]["profile"]
        return profile.get("display_name") or profile.get("real_name") or user_id
    except Exception:
        return user_id


async def react(client, channel: str, ts: str, name: str, remove: str | None = None):
    """Add a reaction, optionally removing another first."""
    try:
        if remove:
            await client.reactions_remove(channel=channel, timestamp=ts, name=remove)
    except Exception:
        pass
    try:
        await client.reactions_add(channel=channel, timestamp=ts, name=name)
    except Exception:
        pass


# -- Message Handler ----------------------------------------------------------


@app.event("message")
async def handle_message(event, client, say):
    subtype = event.get("subtype")
    if subtype and subtype not in ("file_share",):
        return
    if event.get("bot_id"):
        return
    if not in_bot_channel(event):
        return

    text = (event.get("text") or "").strip()
    files = event.get("files", [])
    if not text and not files:
        return

    # Only respond when the bot is explicitly @-mentioned
    if bot_user_id and f"<@{bot_user_id}>" not in text:
        return

    # Strip the @-mention from text before forwarding to Claude
    if bot_user_id:
        text = text.replace(f"<@{bot_user_id}>", "").strip()

    user_id = event.get("user", "unknown")
    channel = event["channel"]
    ts = event["ts"]

    # If Claude is already working, let the user know
    if session.busy:
        await react(client, channel, ts, "hourglass")
        await say(
            text="I'm working on another request right now. I'll get to yours next.",
            channel=channel,
        )
        # Queue: the lock in session.send() will serialise this

    await react(client, channel, ts, "hourglass_flowing_sand")

    try:
        # Download any uploaded files
        file_paths = []
        for f in files:
            url = f.get("url_private_download") or f.get("url_private")
            if url:
                path = await download_slack_file(url, f["name"])
                file_paths.append(path)
                log.info("Downloaded %s -> %s", f["name"], path)

        # Build the message for Claude
        name = await get_display_name(client, user_id)
        message = f"{name}: {text}" if text else f"{name}:"
        if file_paths:
            message += "\n\nUploaded files saved to repo:\n"
            message += "\n".join(f"- {p}" for p in file_paths)

        # Send to Claude Code
        result = await session.send(message)
        response = result.get("result", "_(no response)_")

        # Format and post
        formatted = truncate(to_slack_mrkdwn(response))
        await say(text=formatted, channel=channel)

        await react(
            client, channel, ts, "white_check_mark", remove="hourglass_flowing_sand"
        )

    except Exception:
        log.exception("Error handling message")
        await say(text="Something went wrong. Check the bot logs.", channel=channel)
        await react(client, channel, ts, "x", remove="hourglass_flowing_sand")


# -- Slash Commands -----------------------------------------------------------


@app.command("/new")
async def handle_new(ack, respond):
    await ack()
    old_id = session.reset()
    if old_id:
        await respond(f"Session ended (`{old_id[:8]}...`). Starting fresh.")
    else:
        await respond("No active session. Ready for a new conversation.")


@app.command("/approve")
async def handle_approve(ack, respond, command):
    await ack()
    user_id = command["user_id"]

    if config.approved_user_ids and user_id not in config.approved_user_ids:
        await respond(
            "You don't have permission to approve deployments. "
            "Ask an admin to add your Slack user ID to APPROVED_USER_IDS."
        )
        return

    if not config.github_token:
        await respond("GITHUB_TOKEN not configured. Cannot create PR.")
        return

    await respond("Deploying staging to production (creating PR and merging)...")

    result = await create_upstream_pr(
        github_token=config.github_token,
        repo=config.repo,
        title="Content update from staging",
        body="Approved via Slack bot.",
        auto_merge=True,
    )

    if result["success"]:
        if result.get("merged"):
            await respond(
                f"Deployed to production: {result['pr_url']}\n"
                f"Changes will be live at https://staging.gszep.com in ~2 minutes."
            )
        elif result.get("merge_error"):
            await respond(
                f"PR created: {result['pr_url']}\n"
                f"Auto-merge failed: {result['merge_error']}\n"
                f"Please merge manually."
            )
        else:
            await respond(
                f"PR created: {result['pr_url']}\n"
                f"Review and merge to deploy to production."
            )
    else:
        await respond(f"Failed: {result['error']}")


@app.command("/current")
async def handle_current(ack, respond):
    await ack()
    sid = session.session_id
    busy = "(busy)" if session.busy else "(idle)"
    if sid:
        await respond(
            f"Active session: `{sid[:12]}...` {busy}\nStaging: {config.staging_url}"
        )
    else:
        await respond(
            f"No active session. Send a message to start one.\n"
            f"Staging: {config.staging_url}"
        )


# -- Entry Point --------------------------------------------------------------


async def main():
    global bot_user_id
    auth = await app.client.auth_test()
    bot_user_id = auth["user_id"]
    log.info("Bot user ID: %s", bot_user_id)

    handler = AsyncSocketModeHandler(app, config.slack_app_token)
    log.info(
        "Bot starting -- channel=%s, repo=%s, model=%s",
        config.slack_channel_id or "(any)",
        config.repo_dir,
        config.claude_model,
    )
    await handler.start_async()
