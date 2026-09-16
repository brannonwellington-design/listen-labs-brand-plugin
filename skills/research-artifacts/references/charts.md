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

Defaults when in doubt: **bar and line charts work for almost anything** — most brand files prefer them. Reach elsewhere only when the data demands it.

Qual-research specifics: small n → dot units or counts ("7 of 12"), not smooth percentages. Theme frequency → horizontal bars sorted descending, verbatim on hover/beside the top themes. Sentiment over interview time → line with Ekman-colored markers only where a specific emotion was coded.

## Universal rendering spec (all charts)

- SVG, drawn with plain JS or D3 (cdnjs), inside a responsive `viewBox`; text NOT scaled by viewBox distortion (use `preserveAspectRatio` sensibly or recompute on resize).
- All strokes 1px. Axis lines: `--content-secondary`. Grid lines: `--content-disabled`, horizontal only unless both axes are continuous, and as few as comprehension needs (3–5). No chart border box. No axis line where a baseline gridline already does the job — fewer lines beat more.
- Ticks: 10–12px Inter 400, `--content-secondary`. Numbers right-aligned on y, centered on x. Abbreviate (1.2k, 40%). Never rotate x labels 45° — use a horizontal bar chart instead.
- Series colors: `--dataviz-categorical-*` in slot order. One-series charts use `--dataviz-highlight-accent`; when one series is the story among several, story = accent, rest = the highlight neutrals.
- Direct labels at line ends / bar ends whenever they fit; legend only when direct labels can't work, and then as a single top row, 12px, swatch = 12px square, radius = smallest nonzero step of the brand radius scale.
- Titles state findings (see deliverables.md §7). Every chart shows its n.
- Animation: none by default. If asked: single 200–400ms ease-out reveal, no bouncing, nothing loops.

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

**Bar.** Corner radius and inline gap per the brand file's chart primitives (Listen Labs: 2px corners, 1px gaps). Bar width ≥ gap between bars (gap = 20–40% of bar). Baseline ALWAYS zero. Sort by value unless the axis has natural order. Value labels at bar ends, 12px; inside the bar only if it fits at ≥4.5:1 (use `--content-inverse-primary` on dark fills).

**Grouped bar.** ≤4 groups × ≤4 series before it becomes a heatmap or small multiples. 1px between bars within a group, one bar-width between groups.

**Line.** line weights per the brand chart primitives (default vs story line). Points marked only at data points that matter (ends, inflections, annotations) — 4–6px circles, filled `--surface-primary` with 1px series-color stroke. Multi-line: redundant encoding (solid/dashed/dotted + marker shape) per the active brand file. Y-axis may start non-zero ONLY with a visible axis break note; default zero.

**Pie (when justified).** ≤5 slices, largest starting at 12 o'clock going clockwise, remainder rolled to "Other" in `--dataviz-highlight-neutral-3`. 1px `--surface-primary` gaps between slices (matches the bar gap logic). Outside labels use ELBOW leaders — a radial stub from the arc, then a short horizontal run, text anchored past the elbow — never straight radial lines: a radial leader's approach angle depends on slice position, so near 6 and 12 o'clock it stabs vertically into the lettering. Spread same-side labels to a minimum vertical separation (≈2 text rows) before drawing leaders, so adjacent thin slices don't stack their labels. Text sits beside the elbow end, never touching the line. Labels inside only if ≥4.5:1. Never a legend for a pie — if labels don't fit, it should've been a bar.

**Venn (concept only).** 2–3 circles, `--dataviz-categorical-*` strokes at 1px with 8–10% fill opacity of the same colors; intersection labels in `--content-primary`. State in a footnote that areas are NOT proportional. If the user wants proportional overlap: switch to an UpSet-style layout (intersection-size bars above a dot-membership matrix) — it's honest and it looks more original than a Venn anyway.

**Heatmap (matrix).** Sequential ramp; cell radius = smallest nonzero brand step; 2px gaps between cells (gaps in `--surface-primary`, no cell borders); values printed in cells when cell ≥ 32px wide, contrast-flipped on dark cells. Include the ramp legend with real values. Diverging data (above/below a baseline) uses the diverging ramp centered on the true zero/baseline.

**Scatter.** 6–8px circles, 1px stroke, 60–80% fill opacity for overlap legibility. Trend line only if the relationship is the finding, 1px dashed `--content-secondary`. Quadrant hairlines + corner labels for 2×2 strategy framings.

**Sankey.** ≤3 stages, node bars in monochrome brand shades, links at 20–30% opacity of source-node color, 1px node strokes. Label every node with name + value; never rely on ribbon width alone.

**Slope chart.** Two vertical baselines, 1px connecting lines, story lines in accent, rest in neutrals, direct labels both ends.

## Canvas & generative (open-ended visual prompts)

`<canvas>` (or SVG particle systems) is for texture, motion, and >1000-element renders — not for standard charts. When a prompt calls for something generative/expressive (an ambient visual of interview activity, a poster-like data texture): seed all randomness (`mulberry32(seed)`) so outputs are reproducible; expose the 2–4 parameters that matter as plain variables at the top of the script; draw only with token colors (pull them via `getComputedStyle(document.documentElement).getPropertyValue('--content-brand')` so theme switching still works); respect the physics — even generative work gets the branded header, the type rules, and one dominant visual idea. `requestAnimationFrame` for motion; static poster output should also render at 2× via `devicePixelRatio` scaling so exports stay crisp.

## Library loading (single-file artifacts)

From cdnjs only, pinned versions, `<script>` UMD builds before your inline script:
- D3: `https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js`
- TopoJSON client: `https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js`
- Dagre (workflow layout): `https://cdnjs.cloudflare.com/ajax/libs/dagre/0.8.5/dagre.min.js`
World geometry: fetch `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json` at runtime; if the render target blocks external fetches, inline the TopoJSON into the file instead.
Plain SVG + JS with no library is preferred for simple bars/lines — fewer dependencies, faster loads.
