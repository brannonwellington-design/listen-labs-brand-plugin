# Listen Labs Brand Plugin

MCP server that gives Claude access to Listen Labs brand guidelines — colors, typography, spacing, icons, art direction, data visualization rules, and CSS variables.

Once installed, Claude automatically applies brand standards when generating designs, code, or artifacts.

## Quick Install

```bash
curl -sL https://raw.githubusercontent.com/brannonwellington-design/listen-labs-brand-plugin/main/install.sh | bash
```

Then restart Claude Code. That's it.

## What It Does

The plugin adds these tools to Claude:

| Tool | Returns |
|------|---------|
| `get_brand_colors` | Color tokens (light/dark/emotion) for the Paper theme |
| `get_css_variables` | Ready-to-use CSS custom properties |
| `get_typography` | Font family, weight, type scale, case rules |
| `get_spacing` | Base unit, component heights, border radius, grid presets |
| `get_icon_guidelines` | Lucide icon sizing/stroke table |
| `get_header_convention` | Branded header format and positioning |
| `get_data_visualization` | Chart rules, color usage, stroke weights |
| `get_art_direction` | Design philosophy, composition principles |
| `get_full_guidelines` | Everything above in one call |

## Skills

### `/data-viz` — Data Visualization

Generate professional, brand-compliant data visualizations as self-contained HTML files. Uses Chart.js with full Listen Labs brand enforcement.

```
/data-viz
```

Or just ask Claude to chart, graph, or visualize any data — the skill auto-triggers.

**What it enforces:**
- Monochromatic brand blue (`#0021CC`) shading for data series
- 1px strokes on all chart elements
- 2px rounded corners on bars, 1px gap between inline bars
- Inter 400 for all labels — no bold, no other fonts
- Emotion color tokens restricted to Ekman emotion data only
- Responsive flex — no distortion at any width
- Branded header on every output
- Light/dark mode via `prefers-color-scheme`

**Output:** A single self-contained `.html` file that opens in your browser.

---

## Auto-Updates

The plugin auto-updates every time Claude starts a new session. When brand guidelines change in this repo, everyone gets the latest version automatically.

## Manual Setup

If you prefer to set things up manually:

1. Clone the repo:
   ```bash
   git clone https://github.com/brannonwellington-design/listen-labs-brand-plugin.git ~/.listen-labs-brand-plugin
   ```

2. Add to `~/.claude/settings.json`:
   ```json
   {
     "mcpServers": {
       "listen-labs-brand": {
         "command": "bash",
         "args": ["~/.listen-labs-brand-plugin/run.sh"]
       }
     }
   }
   ```

3. Restart Claude Code.

## Requirements

- Python 3 (no additional packages needed)
- Git
- Claude Code (CLI, Desktop, or Web)
