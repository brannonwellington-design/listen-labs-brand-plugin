#!/usr/bin/env bash
# Auto-update and start the Listen Labs Brand MCP server.
# Called by Claude Code's MCP config — pulls latest changes before each session.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Pull latest (quiet, non-blocking on failure)
git pull -q origin main 2>/dev/null || true

exec python3 "$SCRIPT_DIR/listen-labs-brand-server.py"
