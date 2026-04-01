#!/usr/bin/env bash
# Listen Labs Brand Plugin — One-line installer for Claude Code
#
# Usage:
#   curl -sL https://raw.githubusercontent.com/brannonwellington-design/listen-labs-brand-plugin/main/install.sh | bash
#
set -e

INSTALL_DIR="$HOME/.listen-labs-brand-plugin"
SETTINGS_FILE="$HOME/.claude/settings.json"

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

# Install pre-commit hook so GUIDELINES.md auto-generates from server data
HOOK_FILE="$INSTALL_DIR/.git/hooks/pre-commit"
cat > "$HOOK_FILE" << 'HOOK'
#!/bin/sh
REPO_ROOT="$(git rev-parse --show-toplevel)"
if git diff --cached --name-only | grep -q "listen-labs-brand-server.py"; then
    python3 "$REPO_ROOT/generate_guidelines.py"
    git add "$REPO_ROOT/GUIDELINES.md"
fi
HOOK
chmod +x "$HOOK_FILE"

# Ensure ~/.claude directory exists
mkdir -p "$HOME/.claude"

# Add MCP server config to Claude Code settings
if [ -f "$SETTINGS_FILE" ]; then
  # Check if already configured
  if python3 -c "
import json, sys
with open('$SETTINGS_FILE') as f:
    data = json.load(f)
servers = data.get('mcpServers', {})
if 'listen-labs-brand' in servers:
    sys.exit(0)
else:
    sys.exit(1)
" 2>/dev/null; then
    echo "Plugin already configured in Claude Code settings."
  else
    # Add the MCP server entry
    python3 -c "
import json
with open('$SETTINGS_FILE') as f:
    data = json.load(f)
if 'mcpServers' not in data:
    data['mcpServers'] = {}
data['mcpServers']['listen-labs-brand'] = {
    'command': 'bash',
    'args': ['$INSTALL_DIR/run.sh']
}
with open('$SETTINGS_FILE', 'w') as f:
    json.dump(data, f, indent=2)
"
    echo "Added listen-labs-brand to Claude Code MCP config."
  fi
else
  # Create settings file with just the MCP server
  python3 -c "
import json
data = {
    'mcpServers': {
        'listen-labs-brand': {
            'command': 'bash',
            'args': ['$INSTALL_DIR/run.sh']
        }
    }
}
with open('$SETTINGS_FILE', 'w') as f:
    json.dump(data, f, indent=2)
"
  echo "Created Claude Code settings with listen-labs-brand MCP config."
fi

echo ""
echo "Done! Restart Claude Code to start using the Listen Labs brand tools."
echo "Available tools: get_brand_colors, get_typography, get_spacing, get_icon_guidelines,"
echo "  get_header_convention, get_data_visualization, get_art_direction, get_css_variables,"
echo "  get_full_guidelines"
