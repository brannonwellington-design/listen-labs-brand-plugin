# Listen Labs Brand Plugin

MCP server that gives Claude access to Listen Labs brand guidelines — colors, typography, spacing, icons, art direction, data visualization rules, and CSS variables.

Once installed, Claude automatically applies brand standards when generating designs, code, or artifacts.

## Quick Install

```bash
curl -sL https://raw.githubusercontent.com/brannonwellington-design/listen-labs-brand-plugin/main/install.sh | bash
```

Then **fully quit** (Cmd+Q on Mac) and reopen your Claude app.

The installer configures both apps that read local MCP config:
- **Claude Code** (the coding assistant — CLI / Desktop / IDE extensions)
- **Claude Desktop** (the general chat app with Chat / Cowork / Code tabs)

If you only have one of the two installed, the other config file just sits idle until you install that app — no harm done.

## What It Does

The plugin adds these tools to Claude:

| Tool | Returns |
|------|---------|
| `get_brand_colors` | Color tokens (content/surface/emotion) for the Paper or Whisp theme |
| `get_css_variables` | Ready-to-use CSS custom properties |
| `get_typography` | Font family, weight, type scale, case rules |
| `get_spacing` | Base unit, component heights, border radius, grid presets |
| `get_icon_guidelines` | Lucide icon sizing/stroke table |
| `get_header_convention` | Branded header format and positioning |
| `get_data_visualization` | Chart rules, color usage, stroke weights |
| `get_dataviz_palettes` | Swappable data-viz palettes (`brand` monochromatic / `global` best-practices) + caps and CVD rules |
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
- Two swappable palette modes via one attribute (`data-dataviz-palette="brand|global"`):
  - **brand** (default) — monochromatic brand-blue (`#0021CC`); vermillion ↔ blue diverging
  - **global** — Okabe-Ito categorical, Viridis sequential, ColorBrewer RdBu diverging (CVD-safe, brand-agnostic)
- Soft cap 7 categorical series, hard cap 10; redundant encoding (line-style + marker shape) for ≥5 series
- 1px strokes on all chart elements
- 2px rounded corners on bars, 1px gap between inline bars
- Inter 400 for all labels — no bold, no other fonts
- Emotion color tokens restricted to Ekman emotion data only (orthogonal to palette mode)
- Responsive flex — no distortion at any width
- Branded header on every output
- Light/dark mode via `prefers-color-scheme`

**Output:** A single self-contained `.html` file that opens in your browser.

### `/pptx` — Presentations

Generate professional, brand-compliant PowerPoint presentations using PptxGenJS. Composes with the built-in Anthropic PPTX skill for full API coverage.

```
/pptx
```

Or just ask Claude to create a deck, slides, or presentation — the skill auto-triggers.

**What it enforces:**
- One Listen Labs theme per deck (Paper default, Whisp if specified) — values pulled from the brand MCP at generation time
- Brand blue used sparingly as accent — one accent element per slide maximum
- Inter 400 for everything — no bold, no serif, no other fonts
- Dark title/closing slides with light content slides ("sandwich" structure)
- Branded header on every content slide
- No drop shadows, no gradients, no accent lines under titles
- Mandatory visual QA loop with subagent inspection
- 8 pre-built slide templates (title, section, bullets, two-column, stat, cards, quote, closing)

**Output:** A `.pptx` file generated via PptxGenJS.

**Additional dependencies:** `npm install pptxgenjs` and `pip install "markitdown[pptx]" Pillow`

### `/typography` — Typographic Layout

Foundation skill for creating premium, editorial-quality hierarchy using only Inter Regular 400. Auto-triggers when laying out type-heavy content.

```
/typography
```

**What it provides:**
- Size hierarchy table mapping every text role to specific sizes, line heights, and weight tiers
- Three-tier visual weight system (primary / secondary / disabled) that replaces bold without ever changing font weight
- Spacing rhythm rules — heading space, paragraph spacing, section breaks, 4px vertical grid
- 10 pre-built typographic lockups (title blocks, stat blocks, metadata clusters, pull quotes, cards, section headers, asymmetric editorial layouts, accent rules, rotated labels, giant background numerals)
- Fluid responsive type scale using CSS `clamp()` with pre-calculated values
- Typographic precision details — curly quotes, ellipsis character, `text-balance`, `text-pretty`, `tabular-nums`, non-breaking spaces
- Contrast minimums, alignment rules, and the "tiny next to huge" editorial technique

**Philosophy:** Swiss International Style and modern editorial design (Kinfolk, Cereal, Monocle) translated for responsive digital interfaces.

### `/report` — Research Reports

Generate professional, brand-compliant research reports as self-contained HTML files. The flagship Listen Labs deliverable.

```
/report
```

Or just ask Claude to create a report, summary, brief, or write-up — the skill auto-triggers.

**What it provides:**
- Full report structure: cover, executive summary, methodology, findings, emotional analysis, recommendations, appendix
- Emotion-coded callouts for the 6 Ekman emotions — anger, happiness, disgust, surprise, sadness, fear
- Participant quote blocks, stat blocks, data tables, embedded Chart.js visualizations
- Print-ready `@media print` stylesheet for clean PDF export
- Light/dark mode via `prefers-color-scheme`

**Output:** A single self-contained `.html` file that opens in any browser and prints cleanly to PDF.

---

## Auto-Updates

The plugin auto-updates every time Claude starts a new session. When brand guidelines change in this repo, everyone gets the latest version automatically.

## Manual Setup

If you prefer to set things up manually:

1. Clone the repo:
   ```bash
   git clone https://github.com/brannonwellington-design/listen-labs-brand-plugin.git ~/.listen-labs-brand-plugin
   ```

2. Add this MCP entry to **whichever** app's config file matches the Claude app you use:

   **Claude Code** (coding assistant) — `~/.claude/settings.json`

   **Claude Desktop** (general chat app) — `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS, `~/.config/Claude/claude_desktop_config.json` on Linux

   ```json
   {
     "mcpServers": {
       "listen-labs-brand": {
         "command": "bash",
         "args": ["/Users/YOUR_USERNAME/.listen-labs-brand-plugin/run.sh"]
       }
     }
   }
   ```

   Use the absolute path to `run.sh` — `~` is not expanded by the MCP launcher in either app.

3. Fully quit (Cmd+Q on Mac) and reopen your Claude app.

## Requirements

- Python 3 (no additional packages needed)
- Git
- Either Claude Code (CLI / Desktop / IDE extensions) or Claude Desktop (general chat app)
