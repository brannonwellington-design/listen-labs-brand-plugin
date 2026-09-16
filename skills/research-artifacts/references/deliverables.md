# Deliverable Anatomies

Each anatomy defines: what the deliverable is FOR, its required parts, its layout skeleton, and its known failure modes. The skeleton is a starting structure, not a cage — vary composition freely, but a deliverable missing a required part is incomplete, and a listed failure mode is a bug.

Anatomies 1–8 render as HTML/SVG through this skill; §9 hands off to `/report`. Everything here inherits the Physics from SKILL.md and all values from the ACTIVE BRAND FILE (`brands/<brand>.md`). Token names below are universal; their resolved values, and all radii/strokes/fonts, come from that file.

---

## 1. Research One-Pager

**For:** A single screen/page that lets a stakeholder absorb one study's story in 60 seconds.

**Required parts:** branded header · study title + one-line frame (who/what/when, n=) · ONE dominant element (the headline finding: a large stat, a chart, or a pull-quote — pick one) · 2–4 supporting findings · at least one verbatim · a "so what" (recommendation or implication).

**Skeleton:** 12-column grid (desktop 24px margins/gutters; 1920×1080 presentation 40/40). Dominant element spans ≥6 columns and owns the upper region. Supporting findings as equal modules below or beside — each module: a Lucide icon (sized per the icon table) + short label in `--content-secondary` + finding in `--content-primary` + its evidence (mini-stat or micro-chart). Big numerals from the type scale (48–96px) for key stats; their units and n= at 12–14px in `--content-secondary` beside them. **Stat-module type stack:** the big numeral and its small annotation NEVER share an inline flow — the annotation sits on its own line beneath the numeral (an annotation that wraps mid-phrase against the numeral reads as broken at some width, always). In a row of stat modules, equalize label heights (min-height for the tallest label) so the numerals align on one baseline across the row; release the equalizer when modules stack. Balance multi-line labels (`text-wrap: balance`) so no line orphans a word. **When stat modules stack vertically** (narrow viewports), whitespace alone no longer separates them — each stacked module after the first gets a hairline separator (1px, the grid-line token) plus baseline-multiple padding, matching the page's existing separator grammar. Stacked modules without separators read as one run-on column.

**Failure modes:** two elements competing for dominance · icons as decoration on every module whether meaningful or not · findings without evidence attached · body text below 12px to cram more in (cut content instead) · a background color per module (use `--surface-secondary` sparingly, hairlines otherwise).

---

## 2. Customer Decision Journey Map

**For:** Showing how customers move from need to decision, and where the experience helps or hurts.

**Required parts:** branded header · stage columns (typically 4–7: e.g., Trigger → Research → Compare → Decide → Onboard) · swimlane rows, top to bottom: **Actions** (what they do), **Touchpoints** (where), **Thinking** (verbatims), **Emotion curve**, **Opportunities** (optional bottom lane) · a base note (n=, method).

**Skeleton:** Horizontal layout; stages are equal-width columns separated by 1px hairlines in `--content-disabled`. Stage names at the top of each column, 14–16px. Lane labels pinned left in `--content-secondary`, 12px, Title Case. The **emotion curve** is the visual heart: a single 1px→2px SVG path spanning all stages, y = emotional valence. Each inflection point gets a 4–8px circular marker. Where the data identifies a specific Ekman emotion, color THAT marker (and optionally a `--emotion-*-secondary` wash behind that stage segment) with the matching emotion token — this is the one legitimate home of emotion tokens. Valence without a named emotion: use `--content-brand` for the line and markers.

**Verbatims in the Thinking lane:** 12–14px, `--content-primary`, preceded by an opening quote glyph in `--content-brand-secondary`, attributed (P3) in `--content-secondary`. One quote per stage beats three.

**Failure modes:** emotion tokens used as generic stage colors · a smoothed/interpolated emotion curve that invents data between measured points (straight segments or gentle monotone curves between real points only) · lanes so tall the map needs vertical scrolling per stage (this is a horizontal artifact) · pain points marked with red badges everywhere (mark only the biggest 1–3; use `--content-negative` text, not filled red blobs) · stages with unequal widths implying unequal duration when duration wasn't measured.

---

## 3. Persona Cross-Tab Explorer

**For:** Comparing how segments/personas differ across attributes, behaviors, or responses — as a scannable matrix, optionally interactive.

**Required parts:** branded header · personas as COLUMNS (with name + one-line descriptor + n= each) · attributes/questions as ROWS, grouped under row-group labels · cell values · a legend for the value encoding · base sizes.

**Skeleton:** A matrix where rows are separated by 1px hairlines and column groups by slightly heavier visual rhythm (spacing, not heavier lines). Cell encoding depends on data type:
- **Proportions/intensities:** filled cells using the `--dataviz-sequential-*` ramp, value printed inside at ≥4.5:1 contrast (flip to `--content-inverse-primary` on dark fills, i.e., sequential-500+).
- **Counts at small n:** dot units (one 8px dot per participant) instead of percentages.
- **Categorical answers:** short text, dominant answer in `--content-primary`, others `--content-secondary`.
Highest value per row may carry a 2px `--content-brand` underline to guide scanning — but ONLY on rows whose encoding doesn't already rank itself (dot units, text). Ramp-filled cells self-rank (darkest = highest); adding an underline to a filled cell double-marks it and reads as a rendering error. On dot rows, skip winner marking when comparing proportions across very small unequal bases (4 of 4 "beating" 5 of 6 is a claim the data can't support).

**Interactive version (when asked for an "explorer"):** persona columns toggle on/off; row-group filter chips (brand component height M, radius mid step); hovering a cell reveals the underlying verbatim or count in a tooltip styled as `--surface-highlight` card, 1px `--surface-tertiary` border, radius from the brand scale (mid step), NO shadow. Tooltips also respond to tap (toggle on click) so the evidence layer isn't hover-only and lost on touch devices. All interactions in vanilla JS inside the single file.

**Failure modes:** rainbow cells (one hue per persona — the ramp encodes VALUE, personas are structural) · percentages on n<10 segments · heatmap fills so dark the text disappears · sorting rows arbitrarily instead of by insight (sort by variance or by the story) · tooltips with shadows.

---

## 4. Concept Test Readout

**For:** Presenting how concepts/stimuli performed against each other, without visually biasing the winner.

**Required parts:** branded header · concept cards (2–5), each: concept name, thumbnail or short description, its key metrics, one representative verbatim (positive or negative — honest, not cherry-picked) · a shared-scale comparison chart · methodology note (n=, within/between subjects, what was shown).

**Skeleton:** Concept cards in one row, IDENTICAL dimensions and internal structure — same thumbnail box, same metric block order, same quote treatment. Neutrality is structural. Below them, one grouped bar chart (see charts.md) comparing all concepts on the same metrics with a shared y-axis. The winning concept is marked by data (its bar values), optionally a single `--content-brand` label — never by a bigger card, a colored border, or placement first.

**Failure modes:** the team's favorite concept gets the leftmost slot + a brand-blue border + its best quote (bias by design) · per-concept y-axis scales · "preference %" without n · thumbnails at different aspect ratios (crop to a fixed ratio box, `--surface-secondary` letterbox) · more than ~4 metrics per concept (pick the decision-driving ones).

---

## 5. Workflow / Process Diagram

**For:** Showing how a process, system, or research pipeline flows.

**Required parts:** branded header · nodes (steps) · directed edges · clear start and end · swimlanes when multiple actors own steps.

**Skeleton:** Layered/ranked layout — compute ranks (longest-path from start) and place rank by rank, left→right for ≤7 steps, top→bottom for longer flows. NEVER eyeball node positions on anything non-trivial: for >8 nodes or any branching/merging, use a layout engine (dagre or ELK.js from cdnjs) and then snap its output to the 4px grid. Nodes: `--surface-highlight` fill, 1px `--surface-tertiary` border, radius from the brand scale (mid step), even-numbered padding (12–16px), label 14px. Decision nodes: same rectangle with a small Lucide `git-branch` icon, NOT a diamond (diamonds waste space and read as legacy flowchart). Edges: 1px `--content-disabled` paths, orthogonal or gently curved, small closed-triangle arrowheads (6–8px) in the same color; edge labels 10–12px `--content-secondary`. The primary/happy path may use `--content-brand` at 1px to pop against gray alternates. Swimlanes: hairline-separated horizontal bands, lane labels 12px Title Case pinned left.

**Failure modes:** overlapping or crossing edges that a layout engine would have avoided · arrowheads of varying sizes · node fills in categorical colors (structure isn't a data series) · diamonds and drop-shadowed boxes · dense diagrams at one zoom level (chunk into phases with more whitespace instead).

---

## 6. Persona Cards (set)

**For:** Making segments memorable and decision-useful.

**Required parts per card:** persona name + archetype line · the 2–4 attributes that actually DIFFERENTIATE this persona (not a generic demographic dump) · a defining verbatim · goals/frustrations shortlist · n= and how the segment was derived.

**Skeleton:** Equal-sized cards, `--surface-highlight` on `--surface-primary`, 1px border, radius from the brand scale (large step; concentric: inner elements one step down). Name at 24–32px. A small attribute bar row (mini horizontal bars on the sequential ramp) showing where this persona indexes vs. the others — same attribute order on every card so cards can be compared side by side. No stock photos; if a visual identity is needed, a simple geometric mark per persona in monochrome brand shades.

**Failure modes:** stock-photo faces (invented humans undermine research credibility) · attributes ordered differently per card · vanity demographics that don't drive decisions · one persona's card visually richer than the others.

---

## 7. Chart Panels & Dashboards

**For:** Any request that is primarily "show me the data" — single charts, chart grids, KPI views.

**Skeleton:** Each chart is a panel: title (16px, sentence case, states the FINDING not the metric — "Onboarding drop-off concentrates at step 3", not "Completion by step") · subtitle 12px `--content-secondary` with metric + n= · the chart · source/method note 10px if needed. Panels on the 12-column grid, aligned edges, equal gutters. One dominant panel is allowed and encouraged when there's a headline story. Chart internals: see charts.md.

**Failure modes:** titles that name the axis instead of the insight · sparkline soup (many tiny charts, no hierarchy) · legends when direct labels fit · panels of arbitrary heights that break row alignment.

---

## 8. Global Maps & Geo Heat Maps

**For:** Showing how a measure varies across countries/regions.

**Required parts:** branded header · choropleth or symbol map · a labeled color/size legend with real values · n per region rule (regions below reporting threshold render as `--surface-secondary` "insufficient data", never as zero) · source note.

**Skeleton:** D3 + TopoJSON (world-atlas via cdnjs), **equal-area projection** (`geoEqualEarth` default — Mercator inflates the rich north and is a credibility bug in research). Country fills from the `--dataviz-sequential-*` ramp (or diverging ramp for above/below-baseline measures); country borders 1px (0.5px acceptable at dense zoom) in `--surface-primary` so borders read as gaps, not lines. No graticule unless asked. Ocean = page background (no filled ocean rectangle). Legend: horizontal ramp swatches (equal 12–16px blocks, radius 2) with min/max/midpoint values, 10–12px labels. For counts-by-city, proportional circles: `--content-brand` at 20% fill opacity, 1px solid stroke, AREA (not radius) proportional to value.

**Failure modes:** Mercator · red-green diverging ramps · unbounded rainbow scales · legend with no numbers · countries with no data filled as the lowest ramp color (lying) · labels on every country (label only the story's countries).

---

## 9. Long-form Research Report

**For:** The flagship multi-section narrative deliverable — a full study readout that reads on screen and prints cleanly to PDF. Owned by the `/report` skill; this anatomy exists so classification lands there and so the physics still apply.

**Required parts:** branded header · cover (title, one-line subtitle, date · author · participant count) · executive summary (3–5 key findings) · findings, each paired with its evidence (verbatim, count, or chart) · recommendations when the brief asks "so what". Optional in fixed order: table of contents (5+ sections), background, methodology, emotional analysis, appendix.

**Skeleton:** Start from `skills/report/references/skeleton.html` and the section patterns in `skills/report/references/section-patterns.md`. Reading measure ≤800px, centered; 96px between major sections (or one 1px hairline with 48px above and below — pick one style per report, never both); 48px between subsections. Cover fills the viewport with the title block vertically centered and no decoration. Body text in `--content-secondary`; headings in `--content-primary`; captions and metadata in `--content-disabled`. Participant quotes: 2px `--content-brand` left border, attribution in `--content-disabled`, never italic. Stat blocks on `--surface-brand-secondary`, 32px padding, one per finding maximum. Charts embedded via the `/data-viz` Chart.js skeleton with a 12px `<figcaption>`. Emotion-coded findings use the callouts in `skills/report/references/emotion-callouts.md`. Print stylesheet: cover on its own page, sections/findings/charts never split across pages, white background.

**Failure modes:** findings without evidence attached · quotes without attribution · both whitespace AND rules as section dividers · centered body text · italic quotes · charts without captions · a second accent color anywhere (brand blue only; emotion tokens only on coded emotions).

---

## Open-ended / novel prompts

When the request matches no anatomy ("make me something that shows how our interview themes orbit each other"), do not fall back to generic-AI defaults. Procedure: (1) identify what must be COMPARED or FOLLOWED — that picks the encoding via charts.md; (2) apply The Laws — tokens, Inter 400, 4px grid, 1px strokes, one dominant element, branded header; (3) borrow the nearest anatomy's parts (a "theme orbit" is a network → workflow-diagram edge/node rules apply; layout via d3-force, then settle and render static unless interaction is requested). Novelty should come from the CONCEPT and composition, never from breaking the physics — that's what keeps weird prompts unmistakably on-brand.
