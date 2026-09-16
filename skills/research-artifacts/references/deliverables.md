# Deliverable Anatomies

This is a pattern library, not a menu. Each anatomy defines what a familiar deliverable is FOR, the parts it needs to do that job, a layout skeleton, and its known failure modes. Use it three ways: **adopt** one when the user asks for that thing by name; **compose** several when the request spans them (a journey map whose stages open into concept-test cards; a landing page with a live cross-tab in the hero; a poster that is one giant chart); or **ignore** them all when the request is something new, and build from the Physics. "Required parts" bind only when the user asked for that named deliverable — they are what a stakeholder expects a journey map or a one-pager to contain, not a gate on anything else. Skeletons are starting structures, never cages: vary composition freely. Failure modes, by contrast, are bugs anywhere they appear.

Every anatomy inherits the Responsive physics in SKILL.md: each has a phone composition, not just a desktop one. Where a required-parts list says "branded header", read it as *on standalone artifacts*; inside the Listen Labs product canvas the credit line is omitted and the title takes its place at the top of the composition. Where an anatomy is naturally wide, its mobile strategy is named below.

Anatomies 1–8 and 10–14 render through this skill; §9 hands off to `/report`. §10 (web page) and §12 (interactive story) lean on `skills/_shared/components.md` for buttons, inputs, nav, cards, and tooltips. Everything here inherits the Physics from SKILL.md and all values from the ACTIVE BRAND FILE (`brands/<brand>.md`). Token names below are universal; their resolved values, and all radii/strokes/fonts, come from that file.

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

**Mobile (≤768px):** pick one strategy and build it deliberately. *Rotate:* stages become a vertical sequence; each stage is a block with its name as a heading and the lanes as labelled rows (Actions, Touchpoints, Thinking, Emotion, Opportunities) inside it; the emotion curve becomes a vertical path in a 48px left rail with the same markers, or a per-stage emotion marker if the path would fight the text. *Pane:* keep the horizontal geometry inside an `overflow-x: auto` container with `scroll-snap-type: x mandatory`, one stage per snap point at 85vw so the next stage peeks, lane labels pinned with `position: sticky; left: 0` on a `--surface-primary` background, and a stage indicator (dots or "3 of 6") above. Rotate when the Thinking lane carries the story; pane when the curve does.

**Failure modes:** emotion tokens used as generic stage colors · a smoothed/interpolated emotion curve that invents data between measured points (straight segments or gentle monotone curves between real points only) · lanes so tall the map needs vertical scrolling per stage on desktop (there it is a horizontal artifact) · pain points marked with red badges everywhere (mark only the biggest 1–3; use `--content-negative` text, not filled red blobs) · stages with unequal widths implying unequal duration when duration wasn't measured.

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

**Mobile (≤768px):** the matrix keeps its geometry inside an `overflow-x: auto` pane with the row-label column pinned (`position: sticky; left: 0`) and column headers pinned (`position: sticky; top: 0`); cells never shrink below 44px; alternatively, for ≤3 personas, rotate to stacked persona cards each listing the attribute rows. Tooltips toggle on tap.

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

**Mobile (≤768px):** re-run the layout top→bottom (rank direction vertical) so the flow reads by scrolling; swimlanes become stacked bands with their label as a heading; if the diagram is genuinely wide (many parallel branches), pane it with snap points and a minimap-style stage indicator rather than shrinking node text below 12px.

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

## 10. Web Page / Landing Page

**For:** A marketing, product, or campaign page that a stranger reads top to bottom and acts on — a landing page, a feature page, a microsite, a program page.

**Required parts:** top navigation (per `skills/_shared/components.md` → Navigation; the branded credit line is NOT used on websites) · hero band with ONE headline (48–64px desktop / 32–40px mobile, `text-wrap: balance`), one supporting sentence (18px `--content-secondary`), and at most one primary + one secondary button · 3–6 content bands, each making one point with one dominant element (a stat, a figure, a short verbatim, a product frame) · one proof band (numbers with n=, logos, or quotes — never all three) · a closing call-to-action band (the one place a dark `--surface-inverse-primary` band is allowed) · footer.

**Skeleton:** Full-width bands on the 12-column grid with the canonical rhythm (`brand-compliance.md`); grid engineering applies (`grid-engineering.md`). Hero text spans 7–8 of 12 columns and anchors LEFT — the asymmetric editorial layout from `/typography` — with the right columns holding one figure or breathing room, never a stock photo. Alternate band surfaces sparingly (primary / secondary / primary…), never a background color per section. Section headers are H2 32px with the overline only when it disambiguates. Feature bands: 2–3 columns of icon (Lucide, 18px) + 16px Title Case label + 14px `--content-secondary` copy, equal heights. Product screenshots sit in a 1px `--surface-tertiary` frame with radius 12 on `--surface-secondary`, at a fixed aspect ratio. Metadata: `<title>` in Title Case, `<meta name="description">`, `theme-color`, Open Graph title/description, and a favicon (`assets/listen-labs-logo.svg` from the plugin root, inline as a data URI). Full page must pass at 375 / 768 / 1280 with no sideways scroll.

**Failure modes:** a hero that centers everything (centered is for a single isolated line, not a whole band) · three buttons in the hero · a gradient, blob, or drop-shadow "card" grid · a band per idea until the page is twelve bands (cut to the six that carry the argument) · the branded credit line and a nav on the same page · a testimonial without attribution · a dark band used twice · type below 14px anywhere except metadata.

---

## 11. Print Page / Poster / PDF One-Pager

**For:** A single sheet that will be printed or exported to PDF — a poster, a printed one-pager, a handout, a spec sheet.

**Required parts:** branded header (may be replaced by the wordmark on a poster) · one dominant element readable at arm's length (poster) or across a desk (sheet) · supporting content that fits the page with no overflow · a footer line with source, date, and n= · the page geometry declared in CSS, not left to the print dialog.

**Skeleton:** A fixed-size page container sized in physical units and a matching `@page` rule:

```css
@page { size: A4 portrait; margin: 0; }           /* or Letter, A3, 18in 24in for a poster */
.page { width: 210mm; min-height: 297mm; padding: 16mm; margin: 0 auto; background: var(--surface-primary); }
@media screen { .page { box-shadow: none; outline: 1px solid var(--surface-tertiary); margin: 32px auto; } }
* { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
```

Type sizes go UP for print distance: a poster headline is 96–128px from the type scale, body no smaller than 14px on a sheet and 20px on a poster; line lengths still ≤ 80 characters. Use the light tokens of the chosen theme for anything that will be printed (the skeleton's print block does this automatically); a dark poster is a deliberate choice with `--surface-inverse-primary` set explicitly, not the reader's OS dark mode leaking in. Charts render as static SVG (no tooltips, direct labels only), and every value the reader needs is printed on the page. Hairlines 1px; nothing lighter than `--content-disabled` on paper. No page-break rules are needed inside a one-pager because nothing may break — if content overflows, cut content, never shrink type below the floors. Export: open in the browser and print to PDF with margins "None" and background graphics on; say this in one line when delivering.

**Failure modes:** a responsive web layout "printed" (unpredictable pagination) · text that depends on hover · light-on-dark inherited from a dark-mode machine · two dominant elements on one sheet · an unlabelled chart · a poster built at screen sizes so the headline is 32px tall on paper.

---

## 12. Interactive Infographic / Explorable Data Story

**For:** A narrative that the reader moves through — a scrollytelling piece, a step-through explainer, a filterable explorer, an annotated chart that reveals its layers.

**Required parts:** branded header · a title that states the finding · an opening view that already tells the story with NO interaction (the Archie Tse rule — the default render is the overview) · 3–7 narrative steps or one control set (filters, toggles, a range) · direct annotations on the chart at each step · a source/method note with n= · a static fallback: every state the story depends on is reachable by keyboard and readable in print.

**Skeleton:** Two patterns, pick one:
- *Scrollytelling:* a sticky chart panel (`position: sticky; top: 64px`, 60% width desktop, full width stacked on mobile) beside a column of step paragraphs (18px lead, 16px body, 24px gap, each step ≥ 60vh tall). An `IntersectionObserver` sets the active step; the chart transitions between states in 200–400ms ease-out on `opacity`/`transform` only, and jumps instantly under `prefers-reduced-motion`. Every step is a real DOM section with a heading, so the piece reads top to bottom as an article when scripting fails.
- *Explorer:* controls in one row above the chart (chips, a select, or a range from `components.md`), the chart, then a details region that updates with the selection. Overview first, zoom and filter second, details on demand (Shneiderman). Controls never start in an empty state; the initial selection is the most interesting one.
Chart internals follow `charts.md` (interaction engineering: hit layers in the same coordinate space, proximity snapping, tooltips anchored to marks, text halos). Annotations use a 1px leader and 12px text with a paper halo. State is plain JS in the single file; no framework.

**Failure modes:** a story that only exists in tooltips · animation on load with no reduced-motion path · a chart that re-scales its axes between steps without a visible cue (keep domains fixed across steps unless the change IS the point) · steps shorter than the viewport so two are active at once · controls that reset the story · a mobile layout where the sticky panel covers the text.

---

## 13. Fixed-Canvas Graphic (social, slide image, thumbnail)

**For:** A single image at a fixed pixel size — a social post, an Open Graph image, a slide-sized graphic, a thumbnail for a report.

**Required parts:** a fixed-size stage · one dominant element (a stat, a verbatim, a chart) · the wordmark or the `Listen Labs /` credit line · nothing that depends on scrolling or hovering.

**Skeleton:** Standard stages — 1200×630 (Open Graph / link preview), 1080×1080 (square), 1080×1350 (portrait social), 1920×1080 (slide, presentation grid 12 / 40 / 40), 1600×900 (thumbnail). Build the stage as `.stage { width: 1200px; height: 630px; position: relative; overflow: hidden; }` with an inner safe area of 8% on every side; place on the 12-column grid inside that area. Type does NOT use the fluid `clamp()` scale — pick fixed sizes from the type scale for the stage (headline 64–96px on a 1200-wide stage, metadata 20–24px; nothing under 20px on social sizes). Big numeral + tiny label is the signature move here. Export at 2× device pixel ratio: open the file, screenshot the `.stage` element (Chrome: DevTools → Capture node screenshot; or `chromium --headless --screenshot --window-size=W,H file.html`), and state the export step in one line. Provide a `data-mode="light"` pin on `<html>` so the export does not depend on the machine's OS theme.

**Failure modes:** responsive units on a fixed stage · text touching the edge (respect the safe area) · a screenshot at 1× that ships blurry · dark mode leaking in from the exporting machine · three ideas on one tile.

---

## 14. HTML Email

**For:** A branded email — announcement, digest, invitation — that must render in mail clients.

**The physics change here, and the skill says so:** mail clients strip `<style>`, ignore CSS custom properties, block web fonts, and mangle flex/grid. So an email is NOT built from the brand token block or the HTML skeletons. Instead:

**Required parts:** a 600px table-based layout, centered · every style inlined with literal hex values resolved from the brand file (Paper light) · font stack `'Inter', 'Helvetica Neue', Arial, sans-serif` (Inter will usually not load; the layout must look right in Arial) · a preheader line · one primary "bulletproof" button (a table cell with `background-color`, 32px tall, radius 8 via `border-radius` where supported, padded link inside — never an image button) · the wordmark as an inline PNG/SVG-with-PNG-fallback at 20px tall · a plain-text alternative · a footer with sender address and unsubscribe where applicable.

**Skeleton:** `<table role="presentation" width="600">` rows for header / hero / body / call to action / footer; 24px cell padding; 16px/24px body in `#6B6861` on `#F9F4EB`, headings in `#120F08` (values copied from the brand file at build time, stated in a comment at the top of the file); 1px `#E2DCCF` hairlines as table borders; no background images; no charts (link to the artifact instead, or embed a static PNG). Dark mode: add `<meta name="color-scheme" content="light">` and `<meta name="supported-color-schemes" content="light">` so clients do not invert the palette; the brand's cream canvas is designed for light rendering.

**Failure modes:** `var(--…)` anywhere in an email · a `<style>`-only layout · a web font the layout depends on · a 100%-width layout that breaks in Outlook · a chart canvas · more than one primary button.

---

## Open-ended / novel prompts

When the request matches no anatomy ("make me something that shows how our interview themes orbit each other"), do not fall back to generic-AI defaults. Procedure: (0) answer Vignelli's three intangibles in one line each — SEMANTIC: what does this mean and why does it exist; SYNTACTIC: what structure/grid disciplines it; PRAGMATIC: will a stranger understand it instantly — and for expressive/generative pieces write a 2–3 line visual philosophy (how it should FEEL and what governs every mark) before any code; (1) identify what must be COMPARED or FOLLOWED — that picks the encoding via charts.md; (2) apply the Physics plus the ACTIVE BRAND'S voice — its tokens, its fonts and weights, its base-unit rhythm, its stroke spec, one dominant element, its header convention; (3) borrow the nearest anatomy's parts (a "theme orbit" is a network → workflow-diagram edge/node rules apply; layout via d3-force, then settle and render static unless interaction is requested). Novelty should come from the CONCEPT and composition, never from breaking the physics — that's what keeps weird prompts unmistakably on-brand. Nothing here caps ambition: if the request is a single pie chart, build the best pie chart (charts.md → Pie) with its phone layout; if it is a wall-sized interactive atlas of every interview, build that, on the same physics.
