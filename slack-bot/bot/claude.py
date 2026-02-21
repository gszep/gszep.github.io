"""Claude Code CLI wrapper for managing sessions."""

import asyncio
import json
import logging

log = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are operating through a Slack channel. Multiple team members may send "
    "messages -- each message is prefixed with the sender's name.\n\n"
    "Repo context is in CLAUDE.md (loaded automatically). Follow its workflow.\n\n"
    "After pushing changes, tell the team they'll be live at {staging_url} "
    "in ~60 seconds. Remind them to hard-refresh to clear cache: "
    "Ctrl+Shift+R (Windows/Linux), Cmd+Shift+R (Mac Chrome/Firefox/Edge), "
    "Option+Cmd+E then Cmd+R (Mac Safari), or clear browsing data on mobile.\n\n"
    "If the user uploaded files, they are saved in the repo at the paths shown.\n\n"
    "Audience and communication style:\n"
    "- Your team members are non-technical (no-code). They don't know HTML, CSS, "
    "React, git, or programming concepts.\n"
    "- Behind the scenes you may use as many tools and steps as needed to complete "
    "the work, but your final Slack response MUST be concise and in plain language.\n"
    "- Never mention file paths, component names, git commands, or technical "
    "implementation details unless the user specifically asks.\n"
    "- Summarise what you did in terms of the visible result (e.g. 'I updated the "
    "About page headline and swapped in the new photo').\n"
    "- If a request is vague or you need assets (images, text, links), ask a "
    "specific follow-up question before starting work. It is better to clarify "
    "than to guess wrong.\n\n"
    "Formatting rules (Slack, not terminal):\n"
    "- Be concise. Short paragraphs, not walls of text.\n"
    "- No markdown headers (# not rendered). Use *bold* for emphasis.\n"
    "- Code blocks with triple backticks work fine."
)


class ClaudeSession:
    """Wraps the Claude Code CLI for a single persistent session."""

    def __init__(self, repo_dir: str, model: str = "sonnet", staging_url: str = ""):
        self.repo_dir = repo_dir
        self.model = model
        self.session_id: str | None = None
        self.system_prompt = SYSTEM_PROMPT.format(staging_url=staging_url)
        self._lock = asyncio.Lock()

    async def send(self, message: str) -> dict:
        """Send a message to Claude Code. Returns parsed JSON result.

        Serialises access so only one message runs at a time.
        """
        async with self._lock:
            return await self._invoke(message)

    @property
    def busy(self) -> bool:
        return self._lock.locked()

    async def _invoke(self, message: str) -> dict:
        cmd = [
            "claude",
            "-p",
            message,
            "--output-format",
            "json",
            "--dangerously-skip-permissions",
            "--model",
            self.model,
        ]

        if self.session_id:
            cmd.extend(["--resume", self.session_id])
        else:
            cmd.extend(["--append-system-prompt", self.system_prompt])

        log.info(
            "Claude invocation (session=%s): %s",
            self.session_id or "new",
            message[:120],
        )

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=self.repo_dir,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()

        if proc.returncode != 0:
            err = stderr.decode(errors="replace")[:500]
            log.error("Claude CLI error (rc=%d): %s", proc.returncode, err)
            return {"result": f"Claude error: {err}", "is_error": True}

        try:
            result = json.loads(stdout.decode())
        except json.JSONDecodeError:
            raw = stdout.decode(errors="replace")[:500]
            log.error("Bad JSON from Claude: %s", raw)
            return {"result": f"Unexpected output: {raw}", "is_error": True}

        new_sid = result.get("session_id")
        if new_sid:
            self.session_id = new_sid
            log.info("Session: %s", new_sid)

        cost = result.get("cost_usd", 0)
        turns = result.get("num_turns", 0)
        log.info("Done: %d turns, $%.4f", turns, cost)

        return result

    def reset(self) -> str | None:
        """End the current session. Returns the old session ID."""
        old = self.session_id
        self.session_id = None
        return old
