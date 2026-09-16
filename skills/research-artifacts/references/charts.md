# Chart Grammar

Two questions, in order: WHICH chart (selection), then HOW to draw it (rendering spec). Selection is driven by perceptual accuracy — position beats length beats angle beats area beats color saturation. When two chart types both work, pick the one higher on that ladder.

## Selection rules

| The data question | Use | Not |
|---|---|---|
| Compare values across categories | Bar (horizontal if labels are long) | Pie, radar |
| Change over time | Line | Area stacks with >3 series |
| Part-to-whole, ≤5 parts, whole is meaningful | Stacked bar or pie (pie only if user asks or parts ≈ "one big vs rest") | Donut with center KPI clutter |
| Part-to-whole over time | Stacked bar per period | Multiple pies |
| Distribution | Histogram or dot strip | Box plot for non-technical audiences |
| Correlation of two measures | Scatter | Dual-axis line (banned) |
| Value across a 2-way grid (persona × attribute, day × hour) | Matrix heatmap (sequential ramp) | Grouped bars with 20 groups |
| Conceptual set overlap (2–3 sets) | Venn — CONCEPT diagrams only | Venn for quantitative overlap (areas lie); use an UpSet-style bar matrix for real overlap sizes |
| Flow between states | Sankey (2–3 stages max) or workflow diagram | Chord diagrams |
| Geography | Choropleth / proportional symbols (see deliverables.md §8) | 3D globes, pin clutter |
| Ranking shift between two points | Slope chart | Two side-by-side bar charts |

Rendering and volume ladder: SVG under ~1,000 elements; `<canvas>` 1,000–10,000; WebGL beyond that. By data volume: <20 points → simple chart, direct labels; 20–500 → standard; 500–5,000 → aggregate or filter first; 5,000+ → aggregation is mandatory (or canvas with intent). Never feed raw thousands into an SVG chart.
Additional anti-patterns (hard bans): 3D charts; dual y-axes with unrelated scales; truncated/non-zero axes without a visible break indication; rainbow or HSV-equidistant ramps.
Label defense (all chart types, not just pies): before rendering, account for the LONGEST label at the SMALLEST supported width — wrap to two lines max or truncate with the full text available on hover/tap; run collision spreading wherever labels can stack (pie leaders, endpoint labels, node labels, annotations). A single overlapping label makes the whole artifact read as broken.
Defaults when in doubt: **bar and line charts work for almost anything** — most brand files prefer them. Reach elsewhere only when the data demands it.

Qual-research specifics: small n → dot units or counts ("7 of 12"), not smooth percentages. Theme frequency → horizontal bars sorted descending, verbatim on hover/beside the top themes. Sentiment over interview time → line with Ekman-colored markers only where a specific emotion was coded.

## Universal rendering spec (all charts)

- SVG, drawn with plain JS or D3 (cdnjs), inside a responsive `viewBox`; text NOT scaled by viewBox distortion (use `preserveAspectRatio` sensibly or recompute on resize).
- **Re-layout per breakpoint, never shrink.** Wrap the draw in a function and call it from a `ResizeObserver` on the container. Below ~600px: vertical bars with long labels become horizontal bars; tick count drops to 3–4; legend → direct labels; multi-series → stacked small multiples; chart height 240–320px set explicitly per breakpoint; margins recomputed from the measured longest label. A standalone pie keeps its circle (the container's height follows its width) and moves labels from leaders to a list beneath when the stage is under ~480px.
- All strokes 1px. Axis lines: `--content-secondary`. Grid lines: `--content-disabled`, horizontal only unless both axes are continuous, and as few as comprehension needs (3–5). No chart border box. No axis line where a baseline gridline already does the job — fewer lines beat more.
- Ticks: 10–12px, `--content-secondary`, with `font-variant-numeric: tabular-nums` on all numeric labels rendered as DOM or SVG text (axes, values, tooltips). Chart.js paints to a canvas and cannot apply it, which is one more reason to prefer SVG for anything with aligned numbers. Numbers right-aligned on y, centered on x. Abbreviate (1.2k, 40%). Never rotate x labels 45° — use a horizontal bar chart instead.
- Series colors: `--dataviz-categorical-*` in slot order. One-series charts use `--dataviz-highlight-accent`; when one series is the story among several, story = accent, rest = the highlight neutrals.
- Direct labels at line ends / bar ends whenever they fit; legend only when direct labels can't work, and then as a single top row, 12px, swatch = 12px square, radius = smallest nonzero step of the brand radius scale.
- Titles state findings (see deliverables.md §7); subtitle names metric, unit, timeframe; a source/method line (10px, `--content-secondary`) closes the panel when the data has a source worth crediting. Every chart shows its n.
- Scale domains come FROM THE DATA (`max` of the series), never a hand-typed round cap — a hardcoded cap silently pushes outliers off-canvas. Extend to a tidy tick above the true max if needed.
- The Archie Tse rule: crucial information is visible WITHOUT interaction. Tooltips deepen the story (verbatims, exact bases); they never carry the only copy of something the reader needs. Design at 375px width first, then widen.
- Interaction engineering (each rule prevents a real observed bug):
  - Hover hit-layers live in the SAME transformed group/coordinate space as the marks they target — an overlay on the SVG root while marks sit in a translated `<g>` reads pointer coords off by the margins and highlights the wrong mark.
  - Proximity, not pixels: never make a reader hover a 2–3px target. Give marks generous invisible hit areas, or for lines/scatter build a Delaunay/nearest-point snap so the closest mark responds.
  - Anchor tooltips to the hovered MARK's box (centered above it) and move the tip with `transform: translate(...)` over 150ms so it glides between marks; a cursor-glued tooltip jitters and covers the data. One reusable highlight marker moves along lines to give the tip an anchor.
  - Annotations drawn on the chart get a paper-colored text halo (`paint-order: stroke fill; stroke: var(--surface-primary); stroke-width: 3px`) and a short 1px leader lifting them clear of the data and axis ticks.
- Animation: none by default. If asked (or established in the artifact's pattern): single 200–400ms ease-out reveal, no bouncing, nothing loops — and every reveal/transition is wrapped in a `prefers-reduced-motion: reduce` guard that skips straight to the final state.

## Rendering engines

Chart *selection* above applies to every engine. Pick the engine by need:

| Engine | Use when | Where the code lives |
|---|---|---|
| Plain SVG + JS (default) | Simple bars, lines, dots, slopes, small multiples — fewest dependencies, fastest load | Write inline per the specs below |
| D3 (cdnjs) | Maps, sankeys, force layouts, scales/axes you'd otherwise hand-roll | Write inline; load per "Library loading" |
| Chart.js via the `/data-viz` skeleton | The user asks for Chart.js; interactive tooltips/legends matter; the chart is embedded in a `/report` (whose skeleton already ships the helpers) | `skills/data-viz/references/skeleton.html` (mode-aware `dataVizSeries / dataVizSequential / dataVizDiverging / dataVizHighlight / dataVizSemantic` helpers) and `chart-patterns.md` (per-type Chart.js configs: bar, line, sequential, diverging, highlight, semantic, emotion) |
| `<canvas>` | Particles, generative texture, >1000 elements | See "Canvas & generative" below |

Whatever the engine: colors resolve from `--dataviz-*` tokens (never raw hex in chart code), strokes follow the brand file's chart primitives, and the branded header sits above.

## Per-type specs

**Bar.** Corner radius per the brand file's chart primitives (Listen Labs: 2px). Two different gaps: 1px between bars that touch inside a group or a stack (the brand's “inline” gap), and 20–40% of a bar's width between categories. Bar width is always ≥ the category gap. Baseline ALWAYS zero. Sort by value unless the axis has natural order. Value labels at bar ends, 12px; inside the bar only if it fits at ≥4.5:1 (use `--content-inverse-primary` on dark fills).

**Grouped bar.** ≤4 groups × ≤4 series before it becomes a heatmap or small multiples. 1px between bars within a group, one bar-width between groups.

**Line.** line weights per the brand chart primitives (default vs story line). Points marked only at data points that matter (ends, inflections, annotations) — 4–6px diameter circles (2–3px radius), filled `--surface-primary` with 1px series-color stroke. Multi-line: redundant encoding (solid/dashed/dotted + marker shape) per the active brand file. Y-axis may start non-zero ONLY with a visible axis break note; default zero.

**Pie (when justified).** ≤5 slices, largest starting at 12 o'clock going clockwise, remainder rolled to "Other" in `--dataviz-highlight-neutral-3`. Visual 1px `--surface-primary` gaps between slices, achieved with a 2px `--surface-primary` stroke on each slice path (each edge contributes half). Outside labels use ELBOW leaders — a radial stub from the arc, then a short horizontal run, text anchored past the elbow — never straight radial lines: a radial leader's approach angle depends on slice position, so near 6 and 12 o'clock it stabs vertically into the lettering. Spread same-side labels to a minimum vertical separation (≈2 text rows) before drawing leaders, so adjacent thin slices don't stack their labels. Text sits beside the elbow end, never touching the line. Labels inside only if ≥4.5:1. Never a legend for a pie — if labels don't fit, it should've been a bar.

**Venn (concept only).** 2–3 circles, `--dataviz-categorical-*` strokes at 1px with 8–10% fill opacity of the same colors; intersection labels in `--content-primary`. State in a footnote that areas are NOT proportional. If the user wants proportional overlap: switch to an UpSet-style layout (intersection-size bars above a dot-membership matrix) — it's honest and it looks more original than a Venn anyway.

**Heatmap (matrix).** Sequential ramp; cell radius = smallest nonzero brand step; 2px gaps between cells (gaps in `--surface-primary`, no cell borders); values printed in cells when cell ≥ 32px wide, contrast-flipped on dark cells. Include the ramp legend with real values. Diverging data (above/below a baseline) uses the diverging ramp centered on the true zero/baseline.

**Scatter.** 6–8px circles, 1px stroke, 60–80% fill opacity for overlap legibility. Trend line only if the relationship is the finding, 1px dashed `--content-secondary`. Quadrant hairlines + corner labels for 2×2 strategy framings.

**Sankey.** ≤3 stages, node bars in monochrome brand shades, links at 20–30% opacity of source-node color, 1px node strokes. Label every node with name + value; never rely on ribbon width alone.

**Slope chart.** Two vertical baselines, 1px connecting lines, story lines in accent, rest in neutrals, direct labels both ends.

For explorable views (dashboards, explorers) follow Shneiderman's mantra: overview first, zoom and filter second, details on demand last — the default render is the overview, never an empty state waiting for input.

## Canvas & generative (open-ended visual prompts)

`<canvas>` (or SVG particle systems) is for texture, motion, and >1000-element renders — not for standard charts. When a prompt calls for something generative/expressive (an ambient visual of interview activity, a poster-like data texture): seed all randomness (`mulberry32(seed)`) so outputs are reproducible; expose the 2–4 parameters that matter as plain variables at the top of the script; draw only with token colors (pull them via `getComputedStyle(document.documentElement).getPropertyValue('--content-brand')` so theme switching still works); respect the physics — even generative work gets the brand header, the type rules, and one dominant visual idea. Tune parameters until the output looks mastered — controlled chaos, not first-render noise; if the first seed looks accidental, iterate the parameters, not the disclaimer. `requestAnimationFrame` for motion; static poster output should also render at 2× via `devicePixelRatio` scaling so exports stay crisp.

## Library loading (single-file artifacts)

Order of preference: **no library** (plain SVG + JS covers bars, lines, dots, slopes, pies, heatmaps, small multiples, simple diagrams) → D3 only for maps, sankeys, and force layouts → Chart.js only when the user asks for it or a `/report` embeds it. In the product canvas, assume external requests may be blocked: any `<script src>` gets an `onerror` handler that replaces the chart with a designed "could not load" notice, and the artifact must still read correctly without the chart (title, subtitle, values in a table or list). When a library is used, load it from cdnjs or jsDelivr at an exact pinned version (never a floating major like `@4`), as a `<script>` UMD build before your inline script:
- D3: `https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js`
- TopoJSON client: `https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js`
- Dagre (workflow layout): `https://cdnjs.cloudflare.com/ajax/libs/dagre/0.8.5/dagre.min.js`
World geometry: inline the TopoJSON into the file by default (countries-110m is ~100 KB); fetch `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json` at runtime only in a file context where network is known to be available, and never as the only path.
Plain SVG + JS with no library is preferred for simple bars/lines — fewer dependencies, faster loads.
