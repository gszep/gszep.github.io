"""Entry point: python -m bot"""

import asyncio
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the slack-bot directory (parent of bot/)
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

from .app import main  # noqa: E402

asyncio.run(main())
