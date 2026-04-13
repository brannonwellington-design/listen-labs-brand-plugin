---
name: data-viz
description: Generate professional, brand-compliant data visualizations as self-contained HTML files. Use when creating charts, dashboards, data presentations, or any visual data output. TRIGGER when user asks to chart, graph, plot, visualize, or dashboard any data. Always produces Listen Labs branded output using Chart.js.
allowed-tools: Bash(python3 *) Bash(open *) mcp__listen-labs-brand__get_full_guidelines mcp__listen-labs-brand__get_brand_colors mcp__listen-labs-brand__get_css_variables mcp__listen-labs-brand__get_data_visualization mcp__listen-labs-brand__get_typography
---

# Listen Labs Data Visualization Skill

Generate self-contained, brand-compliant HTML files with Chart.js visualizations that meet Listen Labs design standards. Output should be indistinguishable from hand-crafted professional work.

---

## Workflow

Every visualization follows this exact sequence:

1. **Load brand tokens** — call `get_css_variables` and `get_data_visualization` from the Listen Labs brand MCP to get live token values. Never hardcode tokens from memory.
2. **Copy the skeleton** — start from `skills/data-viz/references/skeleton.html`. Copy it completely, then modify. Never build from scratch.
3. **Reference chart patterns** — check `skills/data-viz/references/chart-patterns.md` for the correct Chart.js configuration for your chart type.
4. **Populate with data** — insert the user's data into the Chart.js config. Apply brand color rules.
5. **Run self-audit** — check every item in the audit checklist below before delivering.
6. **Write and open** — save as a single `.html` file and open in the browser.

---

## Non-Negotiable Rules

### Colors
- **All colors via CSS custom properties.** Never use raw hex values in chart configuration. Reference CSS variables through a JavaScript helper that reads computed styles.
- **Monochromatic data series.** Use `#0021CC` (brand blue) as the base. Generate additional shades by adjusting HSL Lightness only — keep Hue and Saturation constant. Example stops for multi-series: 100%, 70%, 45%, 20% lightness variation.
- **Emotion tokens are restricted.** Only use `--emotion-anger-*`, `--emotion-happiness-*`, `--emotion-disgust-*`, `--emotion-surprise-*`, `--emotion-sadness-*`, `--emotion-fear-*` when the data explicitly represents one of the 6 Ekman emotions. Never use emotion colors for general categories, status indicators, or decoration.

### Typography
- **Inter 400 only.** Every label, annotation, axis title, legend entry, and tooltip uses `'Inter', sans-serif` at weight 400. No bold. No light. No other font.
- **No letter-spacing.** Never set `letterSpacing` on any Chart.js element.
- **Sizes from the type scale only.** Axis labels: 10px or 12px. Chart title: 14px or 16px. Annotations: 10px. Never pick arbitrary sizes.

### Strokes and Lines
- **1px everywhere.** Axis lines, grid lines, data line strokes, bar borders — all 1px. No exceptions.
- **Fewer lines, not more.** Remove grid lines that don't aid comprehension. Default: show horizontal grid only, hide vertical grid. Hide axis lines when grid lines are present.
- **Grid line color**: `content-disabled` (30% opacity of content-primary). Grid lines must be subordinate to data.

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
- **Even-number spacing only.** All padding, margin, and gap values use multiples of 4px.

### Structure
- **Branded header** at top of every output: `Listen Labs / [Chart Title]` — 12px, top center, 24px from top. "Listen Labs /" in `content-secondary`, title in `content-primary`.
- **Light mode default.** Dark mode via `prefers-color-scheme: dark` media query.
- **Semantic HTML.** Use `<main>`, `<section>`, `<figure>`, `<figcaption>`.
- **Accessible canvas.** Every `<canvas>` gets `role="img"` and a descriptive `aria-label`.

---

## Chart.js Setup

```javascript
// Disable animations globally
Chart.defaults.animation = false;

// Get brand colors from CSS variables
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

### Monochromatic Shade Generator

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

Before delivering ANY output, verify every item:

- [ ] Brand MCP was called for live tokens (not hardcoded from memory)
- [ ] Skeleton was used as the starting point
- [ ] All colors use CSS custom properties, no raw hex in JS/chart config
- [ ] Data series use monochromatic brand blue shades (unless emotion data)
- [ ] Emotion tokens used ONLY for Ekman emotion data
- [ ] Font is Inter 400 everywhere — no bold, no other font
- [ ] No letter-spacing set anywhere
- [ ] Font sizes are from the type scale (10, 12, 14, 16, etc.)
- [ ] All strokes are 1px
- [ ] Bar corners are 2px radius
- [ ] Grid lines use content-disabled (30% opacity)
- [ ] Spacing uses even numbers only (multiples of 4px)
- [ ] Chart flexes horizontally without distortion
- [ ] Branded header present: "Listen Labs / Title" at top center
- [ ] Dark mode works via prefers-color-scheme
- [ ] Canvas has role="img" and aria-label
- [ ] Output is a single self-contained HTML file
- [ ] File opens correctly in browser

If ANY item fails, fix it before delivering. Do not mention the audit to the user — just ensure compliance silently.
