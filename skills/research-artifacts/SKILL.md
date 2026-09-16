---
name: research-artifacts
description: "Front door for anything a researcher, stakeholder, or customer will look at: build it as a clean, beautiful, correctly laid-out single-file HTML/SVG artifact in Listen Labs styling (or another brand file). Use for one-pagers, journey maps, personas, cross-tabs, concept tests, workflow/system diagrams, charts of any kind, maps, dashboards, interactive infographics and scrollytelling stories, posters and printable PDF pages, website landing/marketing pages, social graphics, HTML email, and open-ended or unusual visual prompts — even when no deliverable type is named. Hands off to /report for multi-section longform reports, /pptx for slide decks, and /data-viz when the Chart.js engine is the right renderer; loads /typography for hierarchy. If the output is something people will look at, this skill governs how it looks."
allowed-tools: Read Write Edit Bash(python3 *) Bash(open *) Bash(start *) Bash(xdg-open *) mcp__listen-labs-brand__get_full_guidelines mcp__plugin_listen-labs-brand_listen-labs-brand__get_full_guidelines mcp__listen-labs-brand__get_brand_colors mcp__plugin_listen-labs-brand_listen-labs-brand__get_brand_colors mcp__listen-labs-brand__get_css_variables mcp__plugin_listen-labs-brand_listen-labs-brand__get_css_variables mcp__listen-labs-brand__get_typography mcp__plugin_listen-labs-brand_listen-labs-brand__get_typography mcp__listen-labs-brand__get_spacing mcp__plugin_listen-labs-brand_listen-labs-brand__get_spacing mcp__listen-labs-brand__get_icon_guidelines mcp__plugin_listen-labs-brand_listen-labs-brand__get_icon_guidelines mcp__listen-labs-brand__get_header_convention mcp__plugin_listen-labs-brand_listen-labs-brand__get_header_convention mcp__listen-labs-brand__get_data_visualization mcp__plugin_listen-labs-brand_listen-labs-brand__get_data_visualization mcp__listen-labs-brand__get_dataviz_palettes mcp__plugin_listen-labs-brand_listen-labs-brand__get_dataviz_palettes mcp__listen-labs-brand__get_art_direction mcp__plugin_listen-labs-brand_listen-labs-brand__get_art_direction
---

# Research Artifacts

**Path convention.** This skill's folder is `${CLAUDE_SKILL_DIR}` and the plugin root is `${CLAUDE_SKILL_DIR}/../..`. Paths in this skill and its reference files that begin with `skills/` are relative to that plugin root (so `skills/_shared/brand-compliance.md` is `${CLAUDE_SKILL_DIR}/../_shared/brand-compliance.md`). Paths that begin with `references/` are relative to this skill's folder.

Turn research data and open-ended visual prompts into deliverables that look like they came out of a design studio — every time, regardless of how the prompt is phrased, in whichever brand the artifact belongs to.

**Where this runs.** Two delivery contexts, same physics: (1) a **file** on a machine — write a single `.html` and open it; (2) the **Listen Labs product canvas** — an HTML canvas editor fed by insights reports and chat, where the artifact is returned as one self-contained HTML document, rendered in a pane whose width is not the screen's, possibly with external network blocked, and then edited by a person. Everything below is written so the same artifact works in both. See "Canvas-safe delivery" under The Physics. One rule differs by context: the `Listen Labs / Title` credit line appears on standalone artifacts (files, PDFs, posters, exports) and is **omitted inside the product canvas**, where the chrome already carries the brand — the composition simply starts with the title. A canvas artifact that is later printed or exported becomes standalone: include the credit line inside `@media print` only (hidden on screen), so the paper version carries the brand and the pane does not.

**Nothing is out of scope.** This skill runs on an open-ended HTML canvas: a single pie chart, a full customer journey map, a poster, a landing page, a generative texture, or a thing nobody has named yet are all legitimate outputs. The references below are a pattern library, not a menu — they exist so that whatever gets made has great layout, hierarchy, and works on desktop and mobile. When a request fits no pattern, the Physics alone are enough to build it well; never narrow, redirect, or refuse a request because it has no anatomy.

The architecture separates what never changes from what changes per brand:

1. **The Physics** (below) — universal laws of layout, hierarchy, and research ethics. Brand-independent. Non-negotiable.
2. **The Voice** (`references/brands/<brand>.md`) — everything stylistic: tokens, type, strokes, radii, header, art direction, avoid list. One file per brand, all answering the same contract (`references/brands/_contract.md`).
3. **The Anatomy** (`references/deliverables.md`) — what each deliverable IS: required parts, layout skeleton, failure modes.
4. **The Chart Grammar** (`references/charts.md`) — which visualization for which data, and how to draw it.
5. **Grid Engineering** (`references/grid-engineering.md`) — the load-bearing machinery for editorial layouts: one-source-of-truth scaffold, subgrid bands, baseline lock, optical ink alignment, overlay + in-page audit. Read it for any one-pager, report, or dashboard.
6. **Components** (`skills/_shared/components.md`) — buttons, links, inputs, cards, chips, tooltips, nav, footer, bands, tables, stat tiles, empty/loading/error states, all keyed to tokens. Read it for any page, dashboard, explorer, or landing page; never invent a button.
7. **Precision & Hygiene** (`skills/_shared/brand-compliance.md`, sections "Typographic Precision", "Web Output Hygiene", "Imagery, Illustration, and the Logo", "Motion", "Composition Variety", "Print and PDF") — curly quotes, `…`, non-breaking value/unit spaces, `tabular-nums`, `text-wrap`, `color-scheme`, focus rings, reduced motion, touch targets, scrollable tables. Brand-independent; applied to every HTML artifact.

## Workflow

0. **Resolve the brand.** Default: `brands/listen-labs.md` (generated from the same `brand_data.py` the Listen Labs brand MCP serves — call `get_full_guidelines` if you want to confirm live values, but the file is authoritative and complete). If the user names another brand with a file in `brands/`, use that file. If they name a brand with no file, create one first: copy `_contract.md` and fill every field from their brand guidelines (ask for them, pull from a brand MCP if connected, or research official sources) — never improvise a brand from vibes. In the product canvas, where no file can be written, resolve the brand inline instead: put its answers in the artifact's token block with a source comment. The active brand file's answers are law for everything the contract covers; where a brand file is silent, fall back to the Listen Labs file's answer for that field.
0.5 **Take the data in honestly.** Sources are the user's message, an insights report, a chat thread, a pasted table, or — when the Listen Labs Studies MCP is connected — `get_study_analysis`, `get_study_responses`, and `get_response` for the study named. Copy numbers, bases (n=), and verbatims exactly; keep the study title and question as the source note; attribute verbatims by participant label; never invent, round, smooth, or "illustrate" data — if a value is missing, the artifact shows that it is missing (a designed "insufficient data" state) or asks. Restructure into one tidy data block before building (see Editability).
1. **Match the request to the nearest anatomies, or none.** `references/deliverables.md` holds fourteen patterns (one-pager, journey map, cross-tab explorer, concept test, workflow diagram, persona cards, dashboards, maps, longform report → `/report`, web/landing page, print page/poster, interactive data story, fixed-canvas graphic, HTML email). Use one, compose several (a journey map with an embedded concept test; a landing page whose hero is a live chart), or use none. The request defines the artifact; anatomies lend parts, skeletons, and failure modes. Open-ended prompts that match nothing still go through steps 2–6 — the physics, voice, and grammar fully constrain novel output, which is what keeps weird prompts on-brand.
2. **Read the relevant references.** Always the active brand file and the "Typographic Precision" + "Web Output Hygiene" sections of `skills/_shared/brand-compliance.md`; the matching anatomy; `charts.md` if any data is visualized; `grid-engineering.md` for any one-pager, report, dashboard, or other layout with a text grid; `skills/_shared/components.md` for anything with a button, input, nav, card, or tooltip. For type-heavy layouts also use `skills/typography/references/lockups.md` (10 pre-built lockups) and `responsive-type.md` (fluid `clamp()` scale). For emotion-coded content use `skills/report/references/emotion-callouts.md`.
3. **Choose theme and palette mode** per the brand file's defaults (Listen Labs: paper theme, light, brand dataviz mode; switch to the brand's global/best-practices palette past its categorical cap).
4. **Build as a single self-contained HTML file.** SVG for charts and diagrams under ~1000 elements; `<canvas>` for particles, generative texture, or >1000 points; Chart.js via the `/data-viz` skeleton when the user asks for Chart.js, needs its interactive tooltips/legends, or the chart is embedded in a `/report` (see "Rendering engines" in `charts.md`). Inline everything: the brand's CSS token block, its font imports, all data. The CSS variable NAMES are universal across brands (--content-*, --surface-*, --dataviz-*, --emotion-*); only resolved values differ — so anatomies and layouts never change per brand, only the token block swaps.
5. **Choose the composition deliberately** per "Composition Variety" in `skills/_shared/brand-compliance.md`: name the dominant element, the one signature lockup, the anchor, and the surface rhythm before writing markup — and make them differ from the last artifact.
6. **Verify** with the checklist below. Fix failures; don't ship them with apologies.
7. **Deliver for the context.** In a file context: write `<descriptive-name>.html` and open it (`open` macOS · `xdg-open` Linux · `start` Windows), otherwise print the path. In the product canvas: return the complete HTML document as the artifact — no file writes, no "open" commands, no instructions to download anything; one line naming what was built and any degradation applied.

## The Physics (brand-independent)

**Composition.**
- One dominant element per composition; everything else is subordinate. Two competing focal points is a bug in any brand.
- Scale contrast is the primary hierarchy tool. Hierarchy comes from size, color role (primary vs secondary content), and position — decoration is never hierarchy.
- White space is load-bearing, not leftover. Strip until removing one more thing would break comprehension; every element earns its place by carrying meaning.
- Nothing floats arbitrarily: everything sits on the grid, and all spacing follows multiples of the brand's base unit. Consistent rhythm is universal; the unit itself is voice.
- Responsive flexing never distorts aspect-locked shapes: circles stay circular at every width. Wide content (tables, maps, matrices) scrolls inside its own overflow-x container; the page body never scrolls sideways.
- Structural devices encode information, they never decorate: numbered markers only for true sequences, eyebrows/labels only when they disambiguate, borders only where grouping needs them. Never accent a single word of a headline in another color or style — the classic generated-page tell. (A brand may claim big numerals or similar as its signature — that is voice, and it earns the treatment; reaching for the same treatment brand-blind is the anti-pattern.)
- Body text measure stays ≤720px (about 65–75 characters) inside whatever column holds it; serif body gets slightly more line-height than sans.

**Responsive physics (every artifact, from a lone pie chart to a full journey map).**
- Design at three widths, always: 375 (phone), 768 (tablet), 1280+ (desktop). The desktop composition is the ambition; the phone composition is the proof. Both must be deliberately designed, not left to reflow.
- Fluid by default: percentage or grid-fraction widths, `max-width` on reading columns, `clamp()` type for display sizes (see `skills/typography/references/responsive-type.md`); fixed pixel widths only inside a fixed-canvas graphic (anatomy §13) or a print sheet (§11).
- **Stacking order is a decision, not a side effect.** When columns collapse, the dominant element leads, evidence follows its claim, and metadata trails. Set the order in markup (or `order` on the grid) — never let the source order decide.
- **Horizontal artifacts** (journey maps, timelines, Gantt-like flows, wide matrices, swimlane diagrams) choose one of two mobile strategies and say which: (a) *rotate* — stages become a vertical sequence with the lanes as labelled rows inside each stage; or (b) *pane* — the artifact keeps its horizontal geometry inside its own `overflow-x: auto` container with `scroll-snap-type: x mandatory`, stage-width snap points, a visible "swipe" affordance (a 1px scroll rail or the next stage peeking 24px), and pinned lane labels. The page body itself never scrolls sideways.
- **Charts re-layout, they don't shrink.** Below ~600px: long category labels turn a vertical bar chart into a horizontal one; tick counts drop to 3–4; legends give way to direct labels; multi-series charts become small multiples stacked; a chart's height is set per breakpoint (240–320px on phones), never left to a distorted aspect ratio. Recompute on resize (`ResizeObserver`), and keep text at real pixel sizes — never let a scaled `viewBox` shrink the type.
- **Touch is the primary input on phones:** ≥44px hit areas, tooltips that toggle on tap, no hover-only reveals, sticky elements that don't cover the content they annotate.
- **Density scales with width:** 12 columns → 8 → 4; gutters 24 → 16; the canonical rhythm in `skills/_shared/brand-compliance.md` steps down with it. Type floors at any width: 14px for body copy, 12px for captions and metadata a reader must take in, 10px only for micro labels that repeat information available elsewhere (overlines, chip text, axis ticks, an emotion label beside its swatch). Nothing under 10px on screen.
- **Horizontal scrollers need `min-width: 0`.** A pane that scrolls sideways (journey map, matrix, timeline) is almost always a grid or flex item, and grid/flex items default to `min-width: auto` — their content silently forces the whole page wider even with `overflow-x: auto` set. Put `min-width: 0` on the scroller and on every grid/flex ancestor between it and the artifact root.
- **Test by rendering, never by construction.** Arithmetic on line-heights does not catch a page that scrolls sideways. At each width, measure `document.documentElement.scrollWidth <= clientWidth` and list any element whose `getBoundingClientRect().right` exceeds the pane; fix the structure, then re-measure. The composition pass in the checklist is run at all three widths on a real render.

**Canvas-safe delivery (every artifact must survive a sandboxed pane).**
- **Respond to the container, not the screen.** The artifact may render in a pane that is 500px wide on a 1600px display. Put `container-type: inline-size` on `<body>` (or an outer wrapper) and write the breakpoints as `@container (max-width: 600px)` … for its descendants — a container cannot be styled by its own query, so the element that carries the switched variables must be a child of the container, never the container itself. with matching `@media` queries only as a fallback for engines without container queries. Charts measure their own container (`ResizeObserver`), never `window.innerWidth`. Inside an iframe `100vh` measures the pane, so it is acceptable for a full-bleed cover or a stage that should fill the pane; internal layout decisions use container units (`cqw`, `cqh`) or percentages, never viewport units.
- **Assume no network.** Inline everything: CSS, JS, data, the wordmark's SVG markup (read `assets/listen-labs-logo.svg` from the plugin and paste its contents — never link to a path or URL). Prefer plain SVG + JS with zero libraries; load a library only when the chart genuinely needs it, and then with a visible fallback if it fails (a `<script onerror>` that swaps the chart for a designed notice). Fonts: request Inter, but design so the metric-compatible fallback stack (`'Inter', 'Helvetica Neue', Arial, system-ui, sans-serif`) looks right — never let a layout depend on the webfont having loaded.
- **No host assumptions.** No `localStorage` or cookies required for first render; no `fetch` for essential content; no `alert`/`prompt`; no top-level navigation; nothing that needs a server. Interaction is plain JS inside the file.
- **Own your box.** The document sets its own `background` on `<html>`/`body` (the pane may be any color), starts at the top-left with no external margin, and never scrolls sideways at the document level.

**Editability (a person will change this after you).**
- **Data lives in one place:** a single `const DATA = …` block (or a `<script type="application/json" id="data">`) at the top of the script, in plain readable JSON, with a comment naming the source. Rendering code reads from it; nothing is hard-typed into the markup twice.
- **Knobs at the top:** the 2–6 parameters a person might tune (title, subtitle, n, palette mode, highlighted series, chart height) are named constants under the data block, not scattered literals.
- **Readable structure:** semantic sections with short comments (`<!-- Hero -->`, `<!-- Findings -->`), class names that say what a thing is (`.stat-tile`, `.journey-stage`), no minification, no inline `style=""` for anything a person might want to change, and the brand token block first so a color change is one edit.
- **Copy is copy:** headlines, labels, and verbatims sit in the markup (or the data block), never assembled from string fragments in JS, so editing a sentence is editing a sentence.

**Legibility floors (WCAG, non-negotiable in every brand).**
- Text ≥4.5:1 contrast against its background; graphical elements ≥3:1. Consequence for Listen Labs: `--content-disabled` (1.9:1 on Paper light) is never a text color — it is for hairlines, grid lines, placeholders, and disabled controls. The “disabled tier” of the type system is size plus `--content-secondary`, not the disabled token. Emotion fills that fall under 3:1 on a light surface (happiness on Paper) carry a 1px `--content-primary` ring, and emotion names are set in `--content-primary` beside a swatch, never in the emotion color.
- Never encode meaning in color alone: 5+ series or any multi-line chart gets redundant encoding (dash pattern, marker shape, direct labels).
- Grid lines and structural hairlines stay visually subordinate to data (the brand file names the token, typically --content-disabled).
- Motion respects `prefers-reduced-motion: reduce` — every reveal or transition has a no-motion path to the same final state.
- Numeric labels use tabular figures (`font-variant-numeric: tabular-nums`) everywhere numbers align or update.
- Crucial information is visible without interaction (tooltips deepen, never gatekeep), and every chart SVG carries an `aria-label` describing its finding.

**Structure tokens.** Type sizes come from the brand's type scale — never invented sizes. Radii from the brand's radius scale, concentrically nested (inner < container). Stroke weights from the brand's stroke spec.

**Typographic precision (every brand).** Curly quotes and apostrophes, never straight. The ellipsis character `…`, never `...`. Non-breaking space between a value and its unit (`n&nbsp;=&nbsp;24`, `12&nbsp;min`). `font-variant-numeric: tabular-nums` on any column of numbers, stat block, or table. `text-wrap: balance` on headings and stat labels; `text-wrap: pretty` on body paragraphs. These read as authored-by-a-designer signals; their absence reads as authored-by-an-LLM.

**Web hygiene (every HTML artifact).** Declare `<meta name="color-scheme" content="light dark">` and a `theme-color` matching the resolved `--surface-primary`. Visible `:focus-visible` rings on every interactive element; never `outline: none` without a replacement. When motion is used, animate only `transform` and `opacity`. Touch targets ≥44×44px; tooltips also toggle on tap. Tables set `min-width: 640px` inside their overflow container. Full spec and checklist: `skills/_shared/brand-compliance.md`.

**Hierarchy without weight (single-weight brands).** When the brand allows one font weight (Listen Labs: Inter 400), hierarchy comes from four tools in priority order — size, tier (`--content-primary` / `-secondary` / `-disabled`), spacing, and case. Two text elements within 1.2× size of each other MUST differ in tier. Space above a heading is always greater than space below it (≈2:1). Line heights snap to multiples of the base unit. Full system: `skills/typography/SKILL.md`.

## Research Ethics (brand-independent)

- **Verbatims are sacred.** Participant quotes render distinctly per the anatomy specs and are never paraphrased into marketing copy. Attribute with participant labels (P1, P7), never real names.
- **Neutrality in comparison.** Concept-test and A/B layouts give every option identical visual weight — same card size, same structure, same chart scale. A bigger card is a thumb on the scale.
- **Evidence links to claims.** A finding without its supporting quote, count, or chart is an assertion; pair them spatially.
- **N is always visible.** Any quantified claim shows its base (n=24) near the number. Small-n qual data renders as counts or dots, not percentages — "7 of 12 participants" beats "58%".
- **One story per view.** A chart or panel makes one point. If it's making two, it's two charts.

**The emotion module.** Ekman emotion coding (anger, happiness, disgust, surprise, sadness, fear) is a product concept, not a styling choice: the --emotion-* tokens exist in every brand file (each brand supplies its own six colors) and are reserved EXCLUSIVELY for coded Ekman emotions — never as generic category colors, in any brand.

## The Voice (read the brand file for all of this)

Everything below is answered by the active brand file, never assumed: color tokens and themes · font families, weights, and import · type scale · spacing base unit · radius scale · stroke weights · the branded header convention · dataviz palettes (brand + global modes, categorical caps) · emotion colors · chart primitives (bar corner radius, inline gaps) · art-direction philosophy, "the feel," and the avoid list. Two brands can legitimately disagree on all of it — never carry one brand's voice (a font weight rule, an accent color, an avoid-list item) into another brand's output.

## Failure prevention (robustness for any prompt)

The goal: a broken or ugly render should be nearly impossible to summon, no matter how weird the request or the data.

- **The safe default recipe.** When a request is ambiguous and clarification isn't possible, build the low-variance version: default brand, light mode, 12-column grid, one dominant element, bar or line chart with direct labels, the credit line if the context calls for it, no interaction beyond tooltips. It is always acceptable and it is the floor, not the ceiling: a clear request for something ambitious is built ambitiously, within the physics.
- **Data sanity guards.** Every render survives: empty data, a single datum, all-zero totals (never divide by zero into NaN geometry), missing fields, and negative values where only positives were expected. Empty or below-threshold data renders an explicit "insufficient data" state in `--surface-secondary` — a designed absence, never a blank or broken chart (generalizing the map rule).
- **Extreme-input test.** Before delivering, mentally run: zero items, one item, 40 categories (→ roll up past the cap), the longest realistic label, and a 375px viewport. If any of those breaks the layout, fix the structure, not the sample data.
- **Degrade by design.** When input exceeds a cap (categories, nodes, slices, series), reduce it deliberately — aggregate, roll into "Other," chunk into phases, switch chart type per the grammar — and say so in a source/method note. Never render something known to violate the grammar with an apology attached.
- **Impossible asks.** If a request requires breaking physics (a 12-slice pie, color-only encoding, a fake y-axis), build the nearest compliant version and state in one line what was changed and why. Compliance plus a sentence beats obedience plus a broken chart.

## Sibling skills (same plugin)

These skills share the brand MCP and `skills/_shared/brand-compliance.md`. Hand off, don't duplicate:

| Request shape | Use | Why |
|---|---|---|
| Multi-section longform report (cover → executive summary → findings → recommendations), print-to-PDF | `/report` | Owns the report skeleton, section patterns, emotion callouts, and print stylesheet. Anatomy §9 in `deliverables.md` summarizes it. |
| Slide deck, .pptx | `/pptx` | PptxGenJS output with its own QA loop; charts on slides follow this skill's chart grammar with hex resolved at build time. |
| Standalone Chart.js chart, or a chart embedded in a `/report` | `/data-viz` | Ships the Chart.js skeleton and mode-aware `dataViz*` palette helpers. Chart *selection* still comes from `charts.md` here. |
| Type-heavy page, landing page, editorial layout | `/typography` | Hierarchy table, three-tier weight system, spacing rhythm, 10 lockups, fluid type scale. |

The Müller-Brockmann grid discipline is absorbed into `references/grid-engineering.md`, so no external grid skill is required. If a dedicated grid-systems skill is installed anyway, it may extend that file for editorial/longform layouts — where either conflicts with the active brand file on palette or type, the brand file wins. If a D3 skill is installed, use its techniques restyled to the active brand's tokens.

## Verification checklist (run before delivering, every time)

- [ ] Brand resolved explicitly; every color, font, size, radius, and stroke traces to the active brand file (no invented values, no values leaked from another brand)
- [ ] Credit line per context: present on standalone/exported artifacts, omitted inside the product canvas; the layout looks intentional either way (no empty band where a header would have been)
- [ ] Only the brand's allowed font families and weights (search the file for `font-weight` and `letter-spacing` and check every hit against the brand file)
- [ ] All spacing in multiples of the brand's base unit; radii only from its scale
- [ ] Strokes per the brand's stroke spec; grid lines subordinate to data
- [ ] Data series use --dataviz-* tokens; categorical count within the brand's cap (else switch to its global mode); >7 categories → direct labels; >8 → rolled up to “Other” (the palette has eight slots)
- [ ] Multi-line charts: redundant encoding, not color alone
- [ ] Text contrast ≥4.5:1, graphical ≥3:1
- [ ] One dominant element; nothing off-grid; resize test — circles still circular
- [ ] Verbatims attributed (P#), sample sizes visible, compared options visually equal; emotion tokens only on coded Ekman emotions
- [ ] No double-marking: an element whose encoding already ranks or highlights it (ramp fill, size, position) gets no second marker (underline, badge, border)
- [ ] Composition pass: look at the render as a whole, not just the values — legal elements can still collide into something that looks broken
- [ ] One theme per artifact (Listen Labs: Paper unless Whisp was requested); dark mode via `prefers-color-scheme` resolves correctly
- [ ] Typographic precision: curly quotes, `…`, `&nbsp;` before units, `tabular-nums` on numbers, `text-wrap` on headings/body
- [ ] Web hygiene: `color-scheme` + `theme-color` declared, `:focus-visible` rings, `prefers-reduced-motion` honored, 44px touch targets, no hover-only states, tables scroll horizontally
- [ ] Designed (not just reflowed) at 375 / 768 / 1280px — stacking order chosen, horizontal artifacts rotate or pane with snap points (scroller and its grid/flex ancestors have `min-width: 0`), charts re-layout per breakpoint, stat modules stack with separators — and `scrollWidth <= clientWidth` measured on a real render at each width
- [ ] Single self-contained HTML document: CSS, JS, data, and the wordmark inlined; at most a pinned CDN library with a visible fallback, and a Google Fonts request the layout does not depend on
- [ ] Container-based breakpoints (`container-type: inline-size` on the root, `@container` queries) so the artifact adapts to a pane, not just a screen; no `window.innerWidth`, no layout-critical `100vh`
- [ ] Data in one readable block with a source comment; knobs as named constants; readable sections and class names — a person can edit this without reverse-engineering it
- [ ] Every number, base, and verbatim traces to the source (report, chat, study); nothing invented; missing data shown as a designed absence
- [ ] Scale domains derived from the data (no hand-typed caps); tabular-nums on numeric labels; reduced-motion guard on every animation
- [ ] Nothing essential lives only in a tooltip; renders legibly at 375px width
- [ ] Editorial layouts: grid-engineering audit run (column snap, baseline drift, optical ink) at widths above and below --maxw
- [ ] Extreme-input test passed: empty/one/many categories, longest label, 375px — no NaN geometry, no overlapping labels, no sideways page scroll
- [ ] Any degradation (roll-ups, truncation, chart-type switch) is disclosed in a source/method note
