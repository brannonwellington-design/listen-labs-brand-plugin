#!/usr/bin/env bash
# Listen Labs Brand Plugin — One-line installer
#
# What it sets up:
#   - Claude Code (CLI / Desktop / IDE extensions): registers this GitHub repo
#     as a plugin marketplace with auto-update on, and installs the
#     "listen-labs-brand" plugin from it. The plugin carries both the MCP
#     brand tools and the skills. Its version is the git commit SHA, so every
#     push to `main` is a new version: Claude Code checks for plugin updates
#     shortly after each session starts and loads the new version on the next
#     launch — no reinstall needed.
#     If the `claude` CLI is not on PATH, falls back to a plain MCP entry in
#     ~/.claude/settings.json (tools only — skills need the plugin).
#   - Claude Desktop (general chat app, no plugin system): clones the repo to
#     ~/.listen-labs-brand-plugin and writes an MCP entry pointing at run.sh,
#     which git-pulls before every launch. Config file:
#       macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
#       Linux: ~/.config/Claude/claude_desktop_config.json
#
# Safe to re-run: every step is idempotent. Re-running also migrates an older
# MCP-only Claude Code install to the plugin install and pulls the latest
# plugin version immediately.
#
# Usage:
#   curl -sL https://raw.githubusercontent.com/brannonwellington-design/listen-labs-brand-plugin/main/install.sh | bash
#
set -e

REPO_SLUG="brannonwellington-design/listen-labs-brand-plugin"
REPO_URL="https://github.com/$REPO_SLUG.git"
INSTALL_DIR="$HOME/.listen-labs-brand-plugin"
MARKETPLACE_NAME="listen-labs"
PLUGIN_ID="listen-labs-brand@$MARKETPLACE_NAME"

echo "Installing Listen Labs Brand Plugin..."

# ─── Local clone (used by Claude Desktop, and as the CLI-less fallback) ───
if [ -d "$INSTALL_DIR" ]; then
  echo "Updating local clone..."
  git -C "$INSTALL_DIR" pull -q origin main
else
  echo "Cloning plugin..."
  git clone -q "$REPO_URL" "$INSTALL_DIR"
fi
chmod +x "$INSTALL_DIR/run.sh"

# Point git at the tracked .githooks directory so generated files (GUIDELINES.md,
# docs/, the research-artifacts brand file) regenerate from brand data on commit.
git -C "$INSTALL_DIR" config core.hooksPath .githooks

# ─── Settings file paths ─────────────────────────────────────────────────
CLAUDE_CODE_SETTINGS="$HOME/.claude/settings.json"
case "$OSTYPE" in
  darwin*)  CLAUDE_DESKTOP_SETTINGS="$HOME/Library/Application Support/Claude/claude_desktop_config.json" ;;
  *)        CLAUDE_DESKTOP_SETTINGS="$HOME/.config/Claude/claude_desktop_config.json" ;;
esac

# Idempotent JSON merger — adds (or replaces) the listen-labs-brand MCP entry.
# Uses env vars instead of string interpolation to avoid shell-quoting issues.
add_mcp_to_settings() {
  local SETTINGS="$1"
  mkdir -p "$(dirname "$SETTINGS")"
  INSTALL_DIR="$INSTALL_DIR" SETTINGS_PATH="$SETTINGS" python3 - <<'PY'
import json, os
path = os.environ['SETTINGS_PATH']
install_dir = os.environ['INSTALL_DIR']
data = {}
if os.path.exists(path):
    try:
        with open(path) as f:
            data = json.load(f)
    except Exception:
        data = {}
data.setdefault('mcpServers', {})['listen-labs-brand'] = {
    'command': 'bash',
    'args': [os.path.join(install_dir, 'run.sh')],
}
with open(path, 'w') as f:
    json.dump(data, f, indent=2)
PY
}

# Removes a legacy MCP-only entry so the plugin's own MCP server isn't loaded twice.
remove_legacy_mcp_entry() {
  local SETTINGS="$1"
  [ -f "$SETTINGS" ] || return 0
  SETTINGS_PATH="$SETTINGS" python3 - <<'PY'
import json, os
path = os.environ['SETTINGS_PATH']
try:
    with open(path) as f:
        data = json.load(f)
except Exception:
    raise SystemExit(0)
servers = data.get('mcpServers') or {}
if 'listen-labs-brand' in servers:
    del servers['listen-labs-brand']
    if not servers:
        data.pop('mcpServers', None)
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)
    print("  Removed legacy MCP-only entry from " + path)
PY
}

# Turns on background auto-update for the marketplace (third-party marketplaces
# default to off). Allowed in user settings per the Claude Code settings reference.
enable_marketplace_auto_update() {
  local SETTINGS="$1"
  mkdir -p "$(dirname "$SETTINGS")"
  SETTINGS_PATH="$SETTINGS" MARKETPLACE_NAME="$MARKETPLACE_NAME" REPO_SLUG="$REPO_SLUG" python3 - <<'PY'
import json, os
path = os.environ['SETTINGS_PATH']
name = os.environ['MARKETPLACE_NAME']
repo = os.environ['REPO_SLUG']
data = {}
if os.path.exists(path):
    try:
        with open(path) as f:
            data = json.load(f)
    except Exception:
        data = {}
mk = data.setdefault('extraKnownMarketplaces', {})
entry = mk.setdefault(name, {'source': {'source': 'github', 'repo': repo}})
entry['autoUpdate'] = True
with open(path, 'w') as f:
    json.dump(data, f, indent=2)
PY
}

# ─── Claude Code: plugin install (tools + skills, auto-updating) ──────────
if command -v claude >/dev/null 2>&1; then
  echo "Registering plugin with Claude Code..."
  # Adding an already-registered marketplace is a no-op; a mismatch (e.g. an
  # older local-directory registration) is replaced so the GitHub source wins.
  if ! claude plugin marketplace add "$REPO_SLUG" >/dev/null 2>&1; then
    claude plugin marketplace remove "$MARKETPLACE_NAME" >/dev/null 2>&1 || true
    claude plugin marketplace add "$REPO_SLUG" >/dev/null 2>&1 || true
  fi
  if claude plugin install "$PLUGIN_ID" --scope user >/dev/null 2>&1; then
    claude plugin update "$PLUGIN_ID" >/dev/null 2>&1 || true
    enable_marketplace_auto_update "$CLAUDE_CODE_SETTINGS"
    remove_legacy_mcp_entry "$CLAUDE_CODE_SETTINGS"
    echo "  Configured Claude Code:    plugin $PLUGIN_ID (auto-updates from GitHub main)"
  else
    echo "  Plugin install did not complete — falling back to an MCP-only entry (tools, no skills)."
    echo "  To get the skills, run:"
    echo "    claude plugin marketplace add $REPO_SLUG && claude plugin install $PLUGIN_ID"
    add_mcp_to_settings "$CLAUDE_CODE_SETTINGS"
    echo "  Configured Claude Code:    $CLAUDE_CODE_SETTINGS"
  fi
else
  echo "  'claude' CLI not found — writing an MCP-only entry for Claude Code (tools, no skills)."
  echo "  After installing Claude Code, re-run this installer to get the skills."
  add_mcp_to_settings "$CLAUDE_CODE_SETTINGS"
  echo "  Configured Claude Code:    $CLAUDE_CODE_SETTINGS"
fi

# ─── Claude Desktop: plain MCP entry (no plugin system) ──────────────────
add_mcp_to_settings "$CLAUDE_DESKTOP_SETTINGS"
echo "  Configured Claude Desktop: $CLAUDE_DESKTOP_SETTINGS"

echo ""
echo "Done! Quit (Cmd+Q on Mac) and reopen your Claude app to start using the Listen Labs brand tools."
echo ""
echo "Available tools: get_brand_colors, get_typography, get_spacing, get_icon_guidelines,"
echo "  get_header_convention, get_data_visualization, get_dataviz_palettes,"
echo "  get_art_direction, get_css_variables, get_full_guidelines"
echo ""
echo "Available skills (Claude Code): /research-artifacts (one-pagers, journey maps, cross-tabs,"
echo "    concept tests, diagrams, dashboards, maps — any research visual, in any brand),"
echo "  /report (branded longform research reports with emotion-coded callouts),"
echo "  /data-viz (brand-compliant Chart.js visualizations),"
echo "  /pptx (brand-compliant PowerPoint presentations),"
echo "  /typography (editorial-quality typographic layout and hierarchy)"
