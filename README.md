# Listen Labs Brand Plugin

MCP server that gives Claude access to Listen Labs brand guidelines — colors, typography, spacing, icons, art direction, data visualization rules, and CSS variables.

Once installed, Claude automatically applies brand standards when generating designs, code, or artifacts.

## Quick Install

```bash
curl -sL https://raw.githubusercontent.com/brannonwellington-design/listen-labs-brand-plugin/main/install.sh | bash
```

Then **fully quit** (Cmd+Q on Mac) and reopen your Claude app.

The installer configures both Claude apps:
- **Claude Code** (the coding assistant — CLI / Desktop / IDE extensions): installs this repo as a **plugin** (`listen-labs-brand@listen-labs`), which carries the MCP brand tools *and* all five skills, with auto-update on.
- **Claude Desktop** (the general chat app with Chat / Cowork / Code tabs): registers the MCP brand tools from a local clone that git-pulls before every launch.

If you only have one of the two installed, the other config just sits idle until you install that app — no harm done. Re-running the installer is safe; it also upgrades older MCP-only installs to the plugin so the skills start loading.

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

Five skills share one brand source. `/research-artifacts` is the front door for anything a researcher or stakeholder will look at; the others are specialists it hands off to.

| Ask for… | Skill |
|---|---|
| One-pager, journey map, cross-tab, concept test, persona cards, workflow diagram, dashboard, map, or any open-ended research visual | `/research-artifacts` |
| Multi-section longform report that prints to PDF | `/report` |
| Slide deck (.pptx) | `/pptx` |
| A Chart.js chart, or a chart inside a report | `/data-viz` |
| Type-heavy page or editorial layout | `/typography` |

### `/research-artifacts` — Research Deliverables (any brand)

Turn research data and open-ended visual prompts into studio-quality, self-contained HTML/SVG artifacts. Listen Labs styling by default; other brands via a brand file.

```
/research-artifacts
```

Or just ask for a one-pager, journey map, persona, cross-tab, concept test, workflow diagram, chart, map, or dashboard — the skill auto-triggers.

**How it's built:**
- **Physics** (`SKILL.md`) — brand-independent laws: one dominant element, scale contrast as hierarchy, load-bearing whitespace, WCAG contrast floors, redundant encoding, typographic precision, web hygiene.
- **Research ethics** — verbatims are sacred and attributed (P1, P7); n is always visible; small-n data as counts not percentages; compared concepts get identical visual weight; one story per view.
- **Voice** (`references/brands/<brand>.md`) — everything stylistic, one file per brand answering the same contract (`_contract.md`). `listen-labs.md` is **generated from `brand_data.py`** so it can never drift from the MCP. Other brands are added by filling in the contract (see below).
- **Anatomy** (`references/deliverables.md`) — required parts, layout skeleton, and failure modes for nine deliverables: one-pager, customer decision journey map, persona cross-tab explorer, concept test readout, workflow/process diagram, persona cards, chart panels & dashboards, global/geo heat maps, and the longform report (handed to `/report`). Plus a procedure for novel prompts.
- **Chart grammar** (`references/charts.md`) — which chart for which data (position > length > angle > area), a rendering and data-volume ladder, hard bans (3D, dual axes, truncated axes, rainbow ramps), label defense, data-derived scale domains, the NYT-style rule that crucial information is visible without interaction, interaction engineering for tooltips and hit areas, per-type rendering specs (bar, grouped bar, line, pie, venn/UpSet, heatmap, scatter, sankey, slope), rendering-engine choice (SVG, D3, Chart.js, canvas), generative/canvas rules, pinned CDN libraries.
- **Grid engineering** (`references/grid-engineering.md`) — Müller-Brockmann grid discipline adapted for single-file artifacts: grid parameters as CSS variables, subgrid bands, baseline lock, optical ink alignment for display type, a `G`-key overlay, and an in-page audit for column snap and baseline drift.
- **Failure prevention** (`SKILL.md`) — a safe default recipe for ambiguous asks, data sanity guards (empty, single, all-zero, negative), an extreme-input test, degrade-by-design rules, and how to handle impossible asks without shipping a broken chart.

**Output:** A single self-contained `.html` file.

### `/data-viz` — Data Visualization (Chart.js engine)

Generate professional, brand-compliant Chart.js visualizations as self-contained HTML files. This is the Chart.js rendering engine that `/research-artifacts` and `/report` delegate to; chart *selection* rules live in `/research-artifacts`.

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

Or just ask Claude to create a report, summary, brief, or write-up — the skill auto-triggers. Single-screen visuals (one-pagers, journey maps, dashboards) route to `/research-artifacts` instead.

**What it provides:**
- Full report structure: cover, executive summary, methodology, findings, emotional analysis, recommendations, appendix
- Emotion-coded callouts for the 6 Ekman emotions — anger, happiness, disgust, surprise, sadness, fear
- Participant quote blocks, stat blocks, data tables, embedded Chart.js visualizations
- Print-ready `@media print` stylesheet for clean PDF export
- Light/dark mode via `prefers-color-scheme`

**Output:** A single self-contained `.html` file that opens in any browser and prints cleanly to PDF.

---

## Brand Site

The one-page brand guideline lives at **`docs/index.html`** and is generated from `brand_data.py` — the same source of truth the MCP tools read. Edit `brand_data.py`, commit, and the page, `docs/tokens.css`, `docs/tokens.json`, `GUIDELINES.md`, and the `/research-artifacts` brand file (`skills/research-artifacts/references/brands/listen-labs.md`) all regenerate automatically via the pre-commit hook.

Serve it with GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / `docs`**. The page includes the logo SVG (copy/download), all Paper tokens, the full spec, a toggleable layout grid (press `G`), and the plugin install command — so one URL serves humans grabbing assets and routes Claude users into the plugin.

Developer endpoints served alongside the page:

| File | Contents |
| ---- | -------- |
| `tokens.css` | Paper light + dark custom properties, emotion tokens, data-viz palette tokens |
| `tokens.json` | Full machine-readable dump of every token and rule |

Regenerate manually anytime with `python3 generate_site.py`, `python3 generate_guidelines.py`, and `python3 generate_brand_file.py`.

### Generated files — never edit by hand

| Generated file | Generator | Consumed by |
| --- | --- | --- |
| `GUIDELINES.md` | `generate_guidelines.py` | Humans, `get_full_guidelines` |
| `docs/index.html`, `docs/tokens.css`, `docs/tokens.json` | `generate_site.py` | Brand site, developers |
| `skills/research-artifacts/references/brands/listen-labs.md` | `generate_brand_file.py` | `/research-artifacts` skill |

To add a **second brand** to `/research-artifacts`, copy `skills/research-artifacts/references/brands/_contract.md` to `<brand>.md` and fill every field from that brand's official guidelines. Those files are authored by hand and are not generated. The plugin ships with Listen Labs only.

## Auto-Updates

**Claude Code.** The plugin's version is the git commit SHA of `main`, so every push is a new version. Claude Code checks the marketplace for plugin updates shortly after each session starts (within about ten minutes) and loads the new version on the next launch, or immediately if you run `/reload-plugins`. Nothing to reinstall. To pull an update right now: `claude plugin update listen-labs-brand@listen-labs`.

**Claude Desktop.** The MCP server launches through `run.sh`, which does a `git pull` from `main` before starting, so the brand tools are current every session.

## Manual Setup

If you prefer to set things up manually:

**Claude Code** (coding assistant) — install as a plugin, which brings the tools and the skills together:

```bash
claude plugin marketplace add brannonwellington-design/listen-labs-brand-plugin
claude plugin install listen-labs-brand@listen-labs
```

Then turn on auto-update for the marketplace in `~/.claude/settings.json` (third-party marketplaces default to off):

```json
{
  "extraKnownMarketplaces": {
    "listen-labs": {
      "source": { "source": "github", "repo": "brannonwellington-design/listen-labs-brand-plugin" },
      "autoUpdate": true
    }
  }
}
```

Inside Claude Code the same two steps are `/plugin marketplace add …` and `/plugin install …`. Skills are namespaced by plugin, so they also answer to `/listen-labs-brand:report` and friends.

**Claude Desktop** (general chat app) — it has no plugin system, so register the MCP server directly:

1. Clone the repo:
   ```bash
   git clone https://github.com/brannonwellington-design/listen-labs-brand-plugin.git ~/.listen-labs-brand-plugin
   ```

2. Add this MCP entry to `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS, or `~/.config/Claude/claude_desktop_config.json` on Linux:

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

   Use the absolute path to `run.sh` — `~` is not expanded by the MCP launcher.

3. Fully quit (Cmd+Q on Mac) and reopen the app.

## Requirements

- Python 3 (no additional packages needed)
- Git
- Either Claude Code (CLI / Desktop / IDE extensions) or Claude Desktop (general chat app)
