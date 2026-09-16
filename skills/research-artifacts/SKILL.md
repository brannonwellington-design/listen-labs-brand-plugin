---
name: research-artifacts
description: "Build qualitative-research deliverables and data visualizations as beautiful, correctly laid-out HTML/SVG artifacts in any brand's styling (Listen Labs by default). Use this skill whenever the user asks for a one-pager, journey map, customer decision journey, persona, persona cards, cross-tab, concept test, workflow diagram, process map, chart (bar, line, pie, venn, heatmap, sankey, slope), global map, dashboard, KPI view, or ANY visual/canvas output related to research findings, interview data, or Listen Labs — even if they don't name a deliverable type, even for 'weird' open-ended visual prompts, and even when they ask for it 'in X branding.' This is the front door for research visuals; it hands off to /report for multi-section longform reports, /pptx for slide decks, and /data-viz when the Chart.js engine is the right renderer. If the output is something a researcher or stakeholder will look at, this skill governs how it looks."
allowed-tools: Bash(python3 *) Bash(open *) mcp__listen-labs-brand__get_full_guidelines mcp__plugin_listen-labs-brand_listen-labs-brand__get_full_guidelines mcp__listen-labs-brand__get_brand_colors mcp__plugin_listen-labs-brand_listen-labs-brand__get_brand_colors mcp__listen-labs-brand__get_css_variables mcp__plugin_listen-labs-brand_listen-labs-brand__get_css_variables mcp__listen-labs-brand__get_typography mcp__plugin_listen-labs-brand_listen-labs-brand__get_typography mcp__listen-labs-brand__get_spacing mcp__plugin_listen-labs-brand_listen-labs-brand__get_spacing mcp__listen-labs-brand__get_icon_guidelines mcp__plugin_listen-labs-brand_listen-labs-brand__get_icon_guidelines mcp__listen-labs-brand__get_header_convention mcp__plugin_listen-labs-brand_listen-labs-brand__get_header_convention mcp__listen-labs-brand__get_data_visualization mcp__plugin_listen-labs-brand_listen-labs-brand__get_data_visualization mcp__listen-labs-brand__get_dataviz_palettes mcp__plugin_listen-labs-brand_listen-labs-brand__get_dataviz_palettes mcp__listen-labs-brand__get_art_direction mcp__plugin_listen-labs-brand_listen-labs-brand__get_art_direction
---

# Research Artifacts

**Path convention.** Paths in this skill and its reference files that begin with `skills/` are relative to the plugin root (the directory that contains this skill's folder, two levels up from this file when installed as a plugin). Paths that begin with `references/` are relative to this skill's own folder.

Turn research data and open-ended visual prompts into deliverables that look like they came out of a design studio — every time, regardless of how the prompt is phrased, in whichever brand the artifact belongs to.

The architecture separates what never changes from what changes per brand:

1. **The Physics** (below) — universal laws of layout, hierarchy, and research ethics. Brand-independent. Non-negotiable.
2. **The Voice** (`references/brands/<brand>.md`) — everything stylistic: tokens, type, strokes, radii, header, art direction, avoid list. One file per brand, all answering the same contract (`references/brands/_contract.md`).
3. **The Anatomy** (`references/deliverables.md`) — what each deliverable IS: required parts, layout skeleton, failure modes.
4. **The Chart Grammar** (`references/charts.md`) — which visualization for which data, and how to draw it.
5. **Grid Engineering** (`references/grid-engineering.md`) — the load-bearing machinery for editorial layouts: one-source-of-truth scaffold, subgrid bands, baseline lock, optical ink alignment, overlay + in-page audit. Read it for any one-pager, report, or dashboard.
6. **Precision & Hygiene** (`skills/_shared/brand-compliance.md`, sections "Typographic Precision" and "Web Output Hygiene") — curly quotes, `…`, non-breaking value/unit spaces, `tabular-nums`, `text-wrap`, `color-scheme`, focus rings, reduced motion, touch targets, scrollable tables. Brand-independent; applied to every HTML artifact.

## Workflow

0. **Resolve the brand.** Default: `brands/listen-labs.md` (generated from the same `brand_data.py` the Listen Labs brand MCP serves — call `get_full_guidelines` if you want to confirm live values, but the file is authoritative and complete). If the user names another brand with a file in `brands/`, use that file. If they name a brand with no file, create one first: copy `_contract.md` and fill every field from their brand guidelines (ask for them, pull from a brand MCP if connected, or research official sources) — never improvise a brand from vibes. The active brand file's answers are law for everything the contract covers; where a brand file is silent, fall back to the Listen Labs file's answer for that field.
1. **Classify the request** against `references/deliverables.md`. Open-ended prompts that match nothing still go through steps 2–5 — the physics, voice, and grammar fully constrain novel output, which is what keeps weird prompts on-brand.
2. **Read the relevant references.** Always the active brand file and the "Typographic Precision" + "Web Output Hygiene" sections of `skills/_shared/brand-compliance.md`; the matching anatomy; `charts.md` if any data is visualized; `grid-engineering.md` for any one-pager, report, dashboard, or other layout with a text grid. For type-heavy layouts also use `skills/typography/references/lockups.md` (10 pre-built lockups) and `responsive-type.md` (fluid `clamp()` scale). For emotion-coded content use `skills/report/references/emotion-callouts.md`.
3. **Choose theme and palette mode** per the brand file's defaults (Listen Labs: paper theme, light, brand dataviz mode; switch to the brand's global/best-practices palette past its categorical cap).
4. **Build as a single self-contained HTML file.** SVG for charts and diagrams under ~1000 elements; `<canvas>` for particles, generative texture, or >1000 points; Chart.js via the `/data-viz` skeleton when the user asks for Chart.js, needs its interactive tooltips/legends, or the chart is embedded in a `/report` (see "Rendering engines" in `charts.md`). Inline everything: the brand's CSS token block, its font imports, all data. The CSS variable NAMES are universal across brands (--content-*, --surface-*, --dataviz-*, --emotion-*); only resolved values differ — so anatomies and layouts never change per brand, only the token block swaps.
5. **Verify** with the checklist below. Fix failures; don't ship them with apologies.

## The Physics (brand-independent)

**Composition.**
- One dominant element per composition; everything else is subordinate. Two competing focal points is a bug in any brand.
- Scale contrast is the primary hierarchy tool. Hierarchy comes from size, color role (primary vs secondary content), and position — decoration is never hierarchy.
- White space is load-bearing, not leftover. Strip until removing one more thing would break comprehension; every element earns its place by carrying meaning.
- Nothing floats arbitrarily: everything sits on the grid, and all spacing follows multiples of the brand's base unit. Consistent rhythm is universal; the unit itself is voice.
- Responsive flexing never distorts aspect-locked shapes: circles stay circular at every width. Wide content (tables, maps, matrices) scrolls inside its own overflow-x container; the page body never scrolls sideways.
- Structural devices encode information, they never decorate: numbered markers only for true sequences, eyebrows/labels only when they disambiguate, borders only where grouping needs them. Never accent a single word of a headline in another color or style — the classic generated-page tell. (A brand may claim big numerals or similar as its signature — that is voice, and it earns the treatment; reaching for the same treatment brand-blind is the anti-pattern.)
- Body text lines stay under ~80 characters; serif body gets slightly more line-height than sans.

**Legibility floors (WCAG, non-negotiable in every brand).**
- Text ≥4.5:1 contrast against its background; graphical elements ≥3:1.
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

- **The safe default recipe.** When a request is ambiguous and clarification isn't possible, build the low-variance version: default brand, light mode, 12-column grid, one dominant element, bar or line chart with direct labels, brand header, no interaction beyond tooltips. It is always acceptable; exotic choices must be earned by the request.
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
- [ ] Branded header present per the brand's header convention
- [ ] Only the brand's allowed font families and weights (search the file for `font-weight` and `letter-spacing` and check every hit against the brand file)
- [ ] All spacing in multiples of the brand's base unit; radii only from its scale
- [ ] Strokes per the brand's stroke spec; grid lines subordinate to data
- [ ] Data series use --dataviz-* tokens; categorical count within the brand's cap (else switch to its global mode); >7 categories → direct labels
- [ ] Multi-line charts: redundant encoding, not color alone
- [ ] Text contrast ≥4.5:1, graphical ≥3:1
- [ ] One dominant element; nothing off-grid; resize test — circles still circular
- [ ] Verbatims attributed (P#), sample sizes visible, compared options visually equal; emotion tokens only on coded Ekman emotions
- [ ] No double-marking: an element whose encoding already ranks or highlights it (ramp fill, size, position) gets no second marker (underline, badge, border)
- [ ] Composition pass: look at the render as a whole, not just the values — legal elements can still collide into something that looks broken
- [ ] One theme per artifact (Listen Labs: Paper unless Whisp was requested); dark mode via `prefers-color-scheme` resolves correctly
- [ ] Typographic precision: curly quotes, `…`, `&nbsp;` before units, `tabular-nums` on numbers, `text-wrap` on headings/body
- [ ] Web hygiene: `color-scheme` + `theme-color` declared, `:focus-visible` rings, `prefers-reduced-motion` honored, 44px touch targets, no hover-only states, tables scroll horizontally
- [ ] Resize test at 375 / 768 / 1280px — no horizontal page scroll, no broken layouts, stat modules stack with separators
- [ ] Single self-contained `.html` file; only pinned cdnjs/jsdelivr libraries and Google Fonts are external
- [ ] Scale domains derived from the data (no hand-typed caps); tabular-nums on numeric labels; reduced-motion guard on every animation
- [ ] Nothing essential lives only in a tooltip; renders legibly at 375px width
- [ ] Editorial layouts: grid-engineering audit run (column snap, baseline drift, optical ink) at widths above and below --maxw
- [ ] Extreme-input test passed: empty/one/many categories, longest label, 375px — no NaN geometry, no overlapping labels, no sideways page scroll
- [ ] Any degradation (roll-ups, truncation, chart-type switch) is disclosed in a source/method note
