"""Configuration from environment variables."""

import os
from dataclasses import dataclass, field


@dataclass
class Config:
    # Slack
    slack_bot_token: str = ""
    slack_app_token: str = ""
    slack_channel_id: str = ""

    # GitHub (single repo, bot works on staging branch)
    github_token: str = ""
    repo: str = "gszep/gszep.github.io"

    # Paths
    repo_dir: str = "/home/gszep/Documents/repos/gszep.github.io"
    upload_dir: str = "assets/images/uploads"

    # URLs
    staging_url: str = "https://staging.gszep.com"
    production_url: str = "https://gszep.com"
    approved_user_ids: list[str] = field(default_factory=list)
    claude_model: str = "sonnet"

    @classmethod
    def from_env(cls) -> "Config":
        approved = os.environ.get("APPROVED_USER_IDS", "")
        return cls(
            slack_bot_token=os.environ["SLACK_BOT_TOKEN"],
            slack_app_token=os.environ["SLACK_APP_TOKEN"],
            slack_channel_id=os.environ.get("SLACK_CHANNEL_ID", ""),
            github_token=os.environ.get("GITHUB_TOKEN", ""),
            repo=os.environ.get("GITHUB_REPO", "gszep/gszep.github.io"),
            repo_dir=os.environ.get(
                "REPO_DIR",
                "/home/gszep/Documents/repos/gszep.github.io",
            ),
            upload_dir=os.environ.get("UPLOAD_DIR", "assets/images/uploads"),
            staging_url=os.environ.get(
                "STAGING_URL", "https://staging.gszep.com"
            ),
            production_url=os.environ.get(
                "PRODUCTION_URL", "https://gszep.com"
            ),
            approved_user_ids=[u.strip() for u in approved.split(",") if u.strip()],
            claude_model=os.environ.get("CLAUDE_MODEL", "sonnet"),
        )
