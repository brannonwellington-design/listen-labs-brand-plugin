#!/usr/bin/env bash
# Listen Labs Brand Plugin — One-line installer
#
# Configures the Listen Labs MCP server for both Claude apps that read
# local MCP config:
#   - Claude Code (CLI / Desktop / IDE extensions): ~/.claude/settings.json
#   - Claude Desktop (general chat app):
#       macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
#       Linux: ~/.config/Claude/claude_desktop_config.json
#
# Writing both is harmless — if you don't have one of the apps installed,
# the unused config file just sits idle until that app picks it up later.
#
# Usage:
#   curl -sL https://raw.githubusercontent.com/brannonwellington-design/listen-labs-brand-plugin/main/install.sh | bash
#
set -e

INSTALL_DIR="$HOME/.listen-labs-brand-plugin"

echo "Installing Listen Labs Brand Plugin..."

# Clone or update the repo
if [ -d "$INSTALL_DIR" ]; then
  echo "Updating existing installation..."
  cd "$INSTALL_DIR" && git pull -q origin main
else
  echo "Cloning plugin..."
  git clone -q https://github.com/brannonwellington-design/listen-labs-brand-plugin.git "$INSTALL_DIR"
fi

chmod +x "$INSTALL_DIR/run.sh"

if [ -d "$INSTALL_DIR/skills" ]; then
  echo "Skills directory updated."
fi

# Point git at the tracked .githooks directory so GUIDELINES.md auto-regenerates
# from brand data on commit. Single source of truth — the hook lives in the repo.
git -C "$INSTALL_DIR" config core.hooksPath .githooks

# ─── Configure MCP entries for both Claude apps ─────────────────────────
# Settings file paths
CLAUDE_CODE_SETTINGS="$HOME/.claude/settings.json"
case "$OSTYPE" in
  darwin*)  CLAUDE_DESKTOP_SETTINGS="$HOME/Library/Application Support/Claude/claude_desktop_config.json" ;;
  *)        CLAUDE_DESKTOP_SETTINGS="$HOME/.config/Claude/claude_desktop_config.json" ;;
esac

# Idempotent JSON merger — adds (or replaces) the listen-labs-brand entry.
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

add_mcp_to_settings "$CLAUDE_CODE_SETTINGS"
echo "  Configured Claude Code:    $CLAUDE_CODE_SETTINGS"

add_mcp_to_settings "$CLAUDE_DESKTOP_SETTINGS"
echo "  Configured Claude Desktop: $CLAUDE_DESKTOP_SETTINGS"

echo ""
echo "Done! Quit (Cmd+Q on Mac) and reopen your Claude app to start using the Listen Labs brand tools."
echo ""
echo "Available tools: get_brand_colors, get_typography, get_spacing, get_icon_guidelines,"
echo "  get_header_convention, get_data_visualization, get_dataviz_palettes,"
echo "  get_art_direction, get_css_variables, get_full_guidelines"
echo ""
echo "Available skills: /data-viz (brand-compliant Chart.js visualizations),"
echo "  /pptx (brand-compliant PowerPoint presentations),"
echo "  /typography (editorial-quality typographic layout and hierarchy),"
echo "  /report (branded research reports with emotion-coded callouts)"
