"""GitHub operations for creating and merging upstream PRs.

In the single-repo model, the bot works on the `staging` branch of the
upstream repo. The /approve command creates a PR from staging -> main
and immediately merges it. No worktrees or cross-fork mechanics needed.
"""

import logging

import httpx

log = logging.getLogger(__name__)


async def create_upstream_pr(
    github_token: str,
    repo: str,
    title: str = "Content update from staging",
    body: str = "",
    auto_merge: bool = True,
) -> dict:
    """Create a PR from staging -> main and optionally merge it."""
    headers = {
        "Authorization": f"token {github_token}",
        "Accept": "application/vnd.github.v3+json",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        # Create or find existing PR
        pr_result = await _create_or_find_pr(client, headers, repo, title, body)
        if not pr_result["success"]:
            return pr_result

        # Auto-merge if requested
        if auto_merge:
            merge_result = await _merge_pr(
                client, headers, repo, pr_result["pr_number"]
            )
            pr_result["merged"] = merge_result["merged"]
            if not merge_result["merged"]:
                pr_result["merge_error"] = merge_result.get("error", "Unknown")

        return pr_result


async def _create_or_find_pr(
    client: httpx.AsyncClient,
    headers: dict,
    repo: str,
    title: str,
    body: str,
) -> dict:
    """Create a new PR or find an existing one."""
    url = f"https://api.github.com/repos/{repo}/pulls"
    payload = {
        "title": title,
        "head": "staging",
        "base": "main",
        "body": body
        or (
            "Content update from the staging site.\n\n"
            "Review at https://staging.gszep.com before merging."
        ),
    }

    resp = await client.post(url, json=payload, headers=headers)

    if resp.status_code == 201:
        pr = resp.json()
        log.info("Created PR #%d: %s", pr["number"], pr["html_url"])
        return {
            "success": True,
            "pr_url": pr["html_url"],
            "pr_number": pr["number"],
        }

    if resp.status_code == 422:
        data = resp.json()
        errors = data.get("errors", [{}])
        msg = errors[0].get("message", "") if errors else data.get("message", "")
        if "already exists" in msg.lower():
            return await _find_existing_pr(client, headers, repo)
        # No changes between branches
        if "no commits" in msg.lower() or "nothing to compare" in msg.lower():
            return {"success": False, "error": "No changes between staging and main."}
        log.warning("PR creation failed (422): %s", msg)
        return {"success": False, "error": msg}

    log.error("GitHub API error %d: %s", resp.status_code, resp.text[:300])
    return {"success": False, "error": f"GitHub API {resp.status_code}"}


async def _find_existing_pr(
    client: httpx.AsyncClient,
    headers: dict,
    repo: str,
) -> dict:
    """Find an existing open PR from staging -> main."""
    owner = repo.split("/")[0]
    url = f"https://api.github.com/repos/{repo}/pulls"
    params = {"head": f"{owner}:staging", "state": "open"}
    resp = await client.get(url, headers=headers, params=params)
    if resp.status_code == 200 and resp.json():
        pr = resp.json()[0]
        return {
            "success": True,
            "pr_url": pr["html_url"],
            "pr_number": pr["number"],
            "existing": True,
        }
    return {"success": False, "error": "PR already exists but could not find it."}


async def _merge_pr(
    client: httpx.AsyncClient,
    headers: dict,
    repo: str,
    pr_number: int,
) -> dict:
    """Merge a PR via the GitHub API."""
    url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}/merge"
    payload = {
        "merge_method": "merge",
        "commit_title": f"Deploy: merge staging to main (#{pr_number})",
    }

    resp = await client.put(url, json=payload, headers=headers)

    if resp.status_code == 200:
        log.info("Merged PR #%d", pr_number)
        return {"merged": True}

    data = resp.json()
    msg = data.get("message", f"HTTP {resp.status_code}")
    log.warning("Merge failed for PR #%d: %s", pr_number, msg)
    return {"merged": False, "error": msg}
