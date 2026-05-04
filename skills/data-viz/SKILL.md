---
name: data-viz
description: Generate professional, brand-compliant data visualizations as self-contained HTML files. Use when creating charts, dashboards, data presentations, or any visual data output. TRIGGER when user asks to chart, graph, plot, visualize, or dashboard any data. Always produces Listen Labs branded output using Chart.js.
allowed-tools: Bash(python3 *) Bash(open *) mcp__listen-labs-brand__get_full_guidelines mcp__listen-labs-brand__get_brand_colors mcp__listen-labs-brand__get_css_variables mcp__listen-labs-brand__get_data_visualization mcp__listen-labs-brand__get_dataviz_palettes mcp__listen-labs-brand__get_typography
---

# Listen Labs Data Visualization Skill

Generate self-contained, brand-compliant HTML files with Chart.js visualizations that meet Listen Labs design standards. Output should be indistinguishable from hand-crafted professional work.

**Brand compliance is universal.** See `skills/_shared/brand-compliance.md` for the brand-wide rules every output must satisfy (themes, typography, spacing, header, emotion tokens). This skill adds chart-specific rules below.

---

## Workflow

Every visualization follows this exact sequence:

1. **Read brand-compliance** — read `skills/_shared/brand-compliance.md` for universal rules.
2. **Load brand tokens** — call `get_css_variables`, `get_data_visualization`, and `get_dataviz_palettes` from the Listen Labs brand MCP for live token values. Never hardcode from memory.
3. **Copy the skeleton** — start from `skills/data-viz/references/skeleton.html`. Copy it completely, then modify. Never build from scratch.
4. **Reference chart patterns** — check `skills/data-viz/references/chart-patterns.md` for the correct Chart.js configuration for your chart type.
5. **Populate with data** — insert the user's data into the Chart.js config. Apply color rules via the `dataViz*` helpers (mode-aware) — never write raw hex.
6. **Run self-audit** — check every item in the audit checklist below before delivering.
7. **Write and open** — save as a single `.html` file and open in the browser.

---

## Chart-Specific Rules

These rules add to the universal brand compliance rules.

### Colors

Colors come from the swappable **palette modes** below. Never write raw hex into chart config — always resolve through CSS variables via the `dataViz*` helpers.

#### Palette modes (brand vs. global)

Two parallel palettes share the same `--dataviz-*` token namespace. Token names are identical; only the resolved values differ. Charts swap palettes by changing one attribute on a wrapper element.

| Mode | Default? | Categorical | Sequential | Diverging | When to use |
|---|---|---|---|---|---|
| `brand` | yes | Monochromatic brand-blue (HSL 229° / 100%, vary L only) | Brand-blue ramp | Vermillion ↔ brand-blue | Listen Labs branded outputs; ≤5 categories. |
| `global` | no | Okabe-Ito 8 (CVD-safe) | Viridis 7-stop (perceptually uniform) | ColorBrewer RdBu 7 (CVD-safe) | Brand-agnostic outputs; ≥6 categories; accessibility-first contexts. |

Set the active mode on `<main>` (or any ancestor of the chart):

```html
<main data-dataviz-palette="brand">  <!-- default; matches existing brand behavior -->
<main data-dataviz-palette="global"> <!-- best-practices, brand-agnostic -->
```

Defaulting matters: charts with no `data-dataviz-palette` attribute resolve to brand mode and look the same as before this skill was extended.

#### Token namespace (same in both modes)

```
--dataviz-categorical-1 … --dataviz-categorical-8
--dataviz-sequential-100 … --dataviz-sequential-700   (100=lightest → 700=darkest)
--dataviz-diverging-{neg-3, neg-2, neg-1, zero, pos-1, pos-2, pos-3}
--dataviz-highlight-accent
--dataviz-highlight-neutral-{1, 2, 3}
--dataviz-semantic-{positive, negative, neutral}
```

Use the helpers in `skeleton.html` (`dataVizSeries(n)`, `dataVizSequential(n)`, `dataVizDiverging()`, `dataVizHighlight()`, `dataVizSemantic()`) — they read tokens from the chart's nearest palette scope, so the same chart code works in either mode.

#### Choosing the right palette type

- **Categorical** — distinct categories with no inherent order (bar/line series, pie slices). Use `dataVizSeries(n)`.
- **Sequential** — ordered or continuous data (heatmaps, ramps, ordinal bins). Use `dataVizSequential(n)`.
- **Diverging** — data with a meaningful midpoint (gain/loss, +/− deltas, sentiment). Use `dataVizDiverging()`.
- **Highlight** — one focal series + de-emphasized rest ("this vs. the rest"). Use `dataVizHighlight()`.
- **Semantic** — positive/negative/neutral status (KPI deltas, pass/fail). Use `dataVizSemantic()`.
- **Emotion** — the 6 Ekman emotions only. Use `--emotion-*` tokens. Orthogonal to brand/global. See `skills/report/references/emotion-callouts.md`.

#### Caps and accessibility rules (apply in both modes)

- **Soft cap: 7 categories.** Beyond 7, add direct labels rather than relying on the legend.
- **Hard cap: 10 categories.** Beyond 10, roll up to "Other".
- **Brand mode practical cap: 5.** Past 5, slots 6–8 fall back to neutral grays as a soft signal — switch to `global` mode if you need more distinct categories.
- **Redundant encoding for ≥5 series or any multi-line chart.** Pair color with line-style (solid/dashed/dotted) and marker shape. Never rely on color alone (WCAG 1.4.1).
- **Contrast ≥3:1** for chart elements vs. background; **≥4.5:1** for data labels.
- **Never red/green diverging** — both shipped diverging palettes (vermillion/blue, RdBu) are CVD-safe.

### Typography sizing (chart-specific)
- Axis labels: 10px or 12px. Chart title: 14px or 16px. Annotations: 10px.
- All other typography rules (Inter 400 only, no letter-spacing, no all-caps) come from the universal compliance file.

### Strokes and Lines
- **1px everywhere.** Axis lines, grid lines, data line strokes, bar borders — all 1px. No exceptions.
- **Fewer lines, not more.** Remove grid lines that don't aid comprehension. Default: show horizontal grid only, hide vertical grid. Hide axis lines when grid lines are present.
- **Grid line color: `--content-disabled`.** Grid lines must be subordinate to data.

### Bar Charts
- **2px border radius** on all bar sections (`borderRadius: 2`).
- **1px gap** between inline bars (`barPercentage: 0.9`, `categoryPercentage: 0.85` — tune so visual gap is ~1px).
- **No bar borders** unless needed for contrast on very light fills.

### Line Charts
- **1px line weight** (`borderWidth: 1`).
- **No fill** by default (`fill: false`). Only add area fill if the user specifically requests it, and use 10% opacity of the line color.
- **Small, clean data points** — 3px radius circles, no special point styles.

### Layout and Responsiveness
- **All elements must flex horizontally** without distortion. Circles stay circular, squares stay square. Use `maintainAspectRatio: false` with a constrained container height.
- **Chart container**: `width: 100%; max-width: 800px; margin: 0 auto;` with a fixed height (400px default, adjustable).

### Structure
- **Branded header** at top of every output. Call `get_header_convention` for the canonical spec.
- **Light mode default.** Dark mode via `prefers-color-scheme: dark` media query.
- **Semantic HTML.** Use `<main>`, `<section>`, `<figure>`, `<figcaption>`.
- **Accessible canvas.** Every `<canvas>` gets `role="img"` and a descriptive `aria-label`.

---

## Chart.js Setup

```javascript
// Disable animations globally
Chart.defaults.animation = false;

// Get brand tokens from CSS variables
var style = getComputedStyle(document.documentElement);
var brandBlue = style.getPropertyValue('--surface-brand-primary').trim();
var contentPrimary = style.getPropertyValue('--content-primary').trim();
var contentSecondary = style.getPropertyValue('--content-secondary').trim();
var contentDisabled = style.getPropertyValue('--content-disabled').trim();

// Global font defaults
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.weight = 400;
Chart.defaults.font.size = 12;
Chart.defaults.color = contentPrimary;
```

### Palette helpers (mode-aware)

The skeleton ships with helpers that resolve `--dataviz-*` tokens against the chart's nearest palette scope. They work identically in `brand` and `global` modes — flipping the wrapper attribute changes the resolved colors without any code change.

```javascript
var canvas = document.getElementById('chart');

dataVizSeries(3, canvas);      // → 3 categorical colors from active mode
dataVizSequential(5, canvas);  // → 5 evenly-spaced sequential stops
dataVizDiverging(canvas);      // → 7 diverging stops (neg-3 → pos-3)
dataVizHighlight(canvas);      // → { accent, neutral: [g1, g2, g3] }
dataVizSemantic(canvas);       // → { positive, negative, neutral }
```

### Legacy: `brandShades()`

Pre-existing helper. Kept for backward compatibility. Prefer `dataVizSeries()` for new charts — it respects the active palette mode.

```javascript
function brandShades(count) {
  // Base: hsl(229, 100%, 40%) = #0021CC
  var shades = [];
  var step = 50 / (count + 1);
  for (var i = 0; i < count; i++) {
    var lightness = 30 + (step * (i + 1));
    shades.push('hsl(229, 100%, ' + lightness + '%)');
  }
  return shades;
}
```

---

## Output Specification

- **Single `.html` file.** All CSS inline in `<style>`. All JS inline in `<script>`. No external dependencies except Google Fonts and Chart.js CDN.
- **Chart.js CDN**: `https://cdn.jsdelivr.net/npm/chart.js@4`
- **Inter font**: `https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap`
- **File location**: Write to the current working directory with a descriptive filename (e.g., `revenue-by-quarter.html`).
- **Auto-open**: After writing, run `open <filename>.html` to preview in browser.

---

## Self-Audit Checklist

Pass the universal compliance checklist in `skills/_shared/brand-compliance.md` PLUS the chart-specific items below:

- [ ] Skeleton was used as the starting point
- [ ] All colors via CSS custom properties — no raw hex in JS/chart config
- [ ] Palette mode is set explicitly on `<main>` (`data-dataviz-palette="brand"` or `"global"`)
- [ ] Data series use the right palette type (categorical/sequential/diverging/highlight/semantic) for the data shape
- [ ] Categorical series count is within caps (≤5 brand, ≤7 global; ≤10 hard with "Other" rollup)
- [ ] Multi-line / ≥5-series charts use redundant encoding (line-style + marker shape, not just color)
- [ ] No raw `--surface-brand-primary` in chart config when a `--dataviz-*` token applies
- [ ] Emotion charts still use `--emotion-*` tokens (orthogonal to brand/global)
- [ ] Chart-specific font sizes (axis 10–12px, title 14–16px, annotations 10px)
- [ ] All strokes are 1px
- [ ] Bar corners are 2px radius
- [ ] Grid lines use `--content-disabled`
- [ ] Chart flexes horizontally without distortion
- [ ] Dark mode works via prefers-color-scheme
- [ ] Canvas has role="img" and aria-label
- [ ] Output is a single self-contained HTML file
- [ ] File opens correctly in browser

If ANY item fails, fix it before delivering. Do not mention the audit to the user — just ensure compliance silently.
