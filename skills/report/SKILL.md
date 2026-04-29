---
name: report
description: "Use this skill when creating research reports, insight summaries, study recaps, executive briefings, interview digests, competitive analyses, or any multi-section narrative document. TRIGGER when user mentions 'report', 'summary', 'brief', 'digest', 'findings', 'insights', 'writeup', 'write-up', or 'research document'. Produces self-contained, print-ready HTML files with Listen Labs branding, emotion-coded callouts, and embedded data visualizations."
allowed-tools: Bash(open *) mcp__listen-labs-brand__get_full_guidelines mcp__listen-labs-brand__get_brand_colors mcp__listen-labs-brand__get_css_variables mcp__listen-labs-brand__get_typography mcp__listen-labs-brand__get_data_visualization mcp__listen-labs-brand__get_art_direction mcp__listen-labs-brand__get_spacing
---

# Listen Labs Report Skill

Generate professional, brand-compliant research reports as self-contained HTML files. Reports open in any browser and print cleanly to PDF. This is the flagship Listen Labs deliverable — every element must meet editorial-quality standards.

**Brand compliance is universal.** See `skills/_shared/brand-compliance.md` for the brand-wide rules every output must satisfy. This skill adds report-specific rules below. It composes with `/typography` (hierarchy and layout), `/data-viz` (embedded charts), and the Listen Labs brand MCP.

---

## Workflow

1. **Read brand-compliance** — read `skills/_shared/brand-compliance.md` for universal rules.
2. **Load brand tokens** — call `get_css_variables`, `get_typography`, `get_spacing`, `get_header_convention`, and `get_art_direction` from the brand MCP. Never hardcode tokens.
3. **Copy the skeleton** — start from `skills/report/references/skeleton.html`. Copy completely, then modify.
4. **Plan the structure** — outline all sections before writing content. Every report needs at minimum: cover, executive summary, and findings. Reference `skills/report/references/section-patterns.md`.
5. **Apply emotion coding** — when findings reference emotional data, use emotion callouts from `skills/report/references/emotion-callouts.md`. Emotion tokens are reserved exclusively for Ekman emotion data.
6. **Embed visualizations** — embed Chart.js charts inline using `/data-viz` patterns. Charts inherit the report's CSS variables automatically.
7. **Audit** — run the self-audit checklist. No report ships without passing every item.
8. **Write and open** — save as a single `.html` file and open in browser.

---

## Report Structure

Every report follows this section order. Sections can be omitted if irrelevant, but the order is fixed.

| # | Section | Required | Purpose |
|---|---------|----------|---------|
| 1 | Cover | Yes | Title, subtitle, date, project metadata |
| 2 | Executive Summary | Yes | 3-5 key findings, top-line narrative |
| 3 | Table of Contents | Optional | For reports with 5+ sections |
| 4 | Background / Context | Optional | Why this research was done |
| 5 | Methodology | Optional | How the research was conducted |
| 6 | Findings | Yes | The core content — individual insights with evidence |
| 7 | Emotional Analysis | Optional | Emotion distribution, sentiment patterns (uses emotion tokens) |
| 8 | Recommendations | Optional | What to do with the findings |
| 9 | Appendix | Optional | Raw data, full quotes, methodology details |

---

## Design Standards

### Page Layout

- **Max content width:** 800px, centered with `margin: 0 auto`
- **Page padding:** 48px horizontal on desktop, 24px on mobile
- **Section spacing:** 96px between major sections (cover, exec summary, findings, etc.)
- **Subsection spacing:** 48px between subsections within a major section
- **Background:** `surface-primary` — values resolve from the active theme's CSS variables

### The Cover Section

The cover is the first thing anyone sees. It must be simple, confident, and branded.

```
[Branded Header: Listen Labs / Report Title — 12px, top center, 24px from top]

                    ↕ generous vertical centering

[10px, content-disabled, Title Case]     Study Type or Category
                                          ↕ 8px
[48px, content-primary, Title Case]      Report Title
                                          ↕ 12px
[16px, content-secondary, sentence]      One-line subtitle or description
                                          ↕ 24px
[12px, content-disabled]                 Date  ·  Author  ·  Participant Count
```

The cover takes a full viewport height (`min-height: 100vh`) with content vertically centered. No decorative elements. The title block lockup does all the work.

### Typography Hierarchy

Follow the `/typography` skill hierarchy table. For reports specifically:

| Role | Size | Line Height | Opacity | Use |
|------|------|-------------|---------|-----|
| Report title (cover) | 48px | 1.1 | primary | Once, on the cover |
| Section heading | 32px | 1.15 | primary | Major section breaks (Findings, Methodology, etc.) |
| Subsection heading | 24px | 1.2 | primary | Individual findings within a section |
| Body lead | 18px | 1.6 | secondary | Executive summary paragraph, section intros |
| Body default | 16px | 1.6 | secondary | Standard report text |
| Body small | 14px | 1.5 | secondary | Supporting detail, extended quotes |
| Caption | 12px | 1.4 | disabled | Chart labels, source citations, footnotes |
| Metadata | 10px | 1.4 | disabled | Dates, participant IDs, tags |

### Colors

- **Body text uses `content-secondary`.** Not primary. The secondary tier is the workhorse for reading text.
- **Headings use `content-primary`.** Headings are the only elements that use the strongest tier.
- **Metadata and captions use `content-disabled`.**
- **Brand blue sparingly** — for key stat numbers, linked text, and one-per-section accent elements only. Use `var(--content-brand)` so the value tracks the active theme.
- **Emotion tokens** — exclusively for Ekman emotion-coded content. See `skills/report/references/emotion-callouts.md`.

### Section Dividers

Major sections are separated by either:
- **96px of vertical whitespace** (preferred — cleaner), or
- **A full-width 1px rule** in `content-disabled` with 48px above and 48px below

Never use both. Pick one style and use it consistently throughout a report.

### Block Quotes and Participant Quotes

Participant quotes are a core report element. They use a left border accent:

```css
.participant-quote {
  margin: 24px 0;
  padding-left: 24px;
  border-left: 2px solid var(--surface-brand-primary);
}
.participant-quote .text {
  font-size: 16px;
  line-height: 24px;
  color: var(--content-primary);
  font-style: normal; /* never italic */
}
.participant-quote .attribution {
  font-size: 12px;
  line-height: 16px;
  color: var(--content-disabled);
  margin-top: 8px;
}
```

The 2px brand-blue left border signals "this is a direct quote" without decoration. Attribution in disabled opacity signals metadata.

### Data Tables

Tables follow the minimal brand aesthetic — no heavy borders, no zebra striping.

```css
.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  line-height: 20px;
}
.report-table th {
  text-align: left;
  color: var(--content-primary);
  padding: 12px 16px;
  border-bottom: 1px solid var(--content-disabled);
}
.report-table td {
  color: var(--content-secondary);
  padding: 12px 16px;
  border-bottom: 1px solid var(--surface-tertiary);
}
```

Header row uses primary opacity with a 1px disabled border. Body rows use secondary opacity with a tertiary surface border (barely visible — just enough structure).

### Stat Blocks

Inline stat callouts that break up narrative text:

```
┌──────────────────────────────────────────────────┐
│  [48px, brand blue]        47%                   │
│  [14px, content-secondary] of participants       │
│                            reported frustration   │
│                            with the current flow  │
└──────────────────────────────────────────────────┘
```

Background: `surface-brand-secondary`. Padding: 32px. Border-radius: 8px. One stat block per finding maximum.

### Embedded Charts

Charts are embedded inline using Chart.js (same patterns as `/data-viz`). They inherit the report's CSS variables automatically.

- Chart container: `width: 100%; height: 320px; margin: 24px 0;`
- Charts get a `<figcaption>` in 12px disabled opacity below them
- Follow all `/data-viz` rules: monochromatic brand blue, 1px strokes, 2px bar radius

---

## Emotion-Coded Content

When report findings reference emotional data, use emotion callouts. See `skills/report/references/emotion-callouts.md` for the canonical pattern library, rules, and emotion-chart guidance.

---

## Print Stylesheet

Every report must print cleanly. The skeleton includes these print rules:

```css
@media print {
  body { background: #fff; }
  .cover { page-break-after: always; }
  .section { page-break-inside: avoid; }
  .finding { page-break-inside: avoid; }
  .chart-container { page-break-inside: avoid; }
  .no-print { display: none; }
}
```

- Cover page gets its own printed page
- Sections and findings avoid splitting across pages
- Charts never split across pages
- Background changes to white for printing (saves ink, improves readability)

---

## Report-Specific Prohibitions

Universal brand prohibitions (no bold/light/italic, no serif, no letter-spacing, no all-caps, no shadows, no gradients, no decoration without purpose, even-number spacing only, etc.) come from `skills/_shared/brand-compliance.md`. Report adds:

1. Italic text — including for quotes; use the left-border pattern instead
2. Multiple accent colors on one page (brand blue only; emotion colors only for emotion data)
3. Centered body text — center only the cover title block
4. Charts without captions
5. Participant quotes without attribution
6. Findings without supporting evidence (quotes, data, or both)

---

## Self-Audit Checklist

Pass the universal compliance checklist in `skills/_shared/brand-compliance.md` PLUS the report-specific items below:

- [ ] Skeleton was used as starting point
- [ ] Cover section has: branded header, title, subtitle, date, metadata
- [ ] Executive summary is present and contains 3–5 key findings
- [ ] All sections follow the fixed order (cover → exec summary → findings → recommendations)
- [ ] Section spacing is consistent (96px between sections OR 1px rules — not both)
- [ ] Typography hierarchy matches the report hierarchy table
- [ ] Body text uses `content-secondary`, headings use `content-primary`
- [ ] Participant quotes use left-border pattern with attribution
- [ ] Stat blocks use `surface-brand-secondary` background
- [ ] Embedded charts follow /data-viz rules
- [ ] Tables use minimal styling (no zebra stripes, no heavy borders)
- [ ] Print stylesheet works (cover on own page, no split sections)
- [ ] Dark mode works via prefers-color-scheme
- [ ] Content width does not exceed 800px
- [ ] File is self-contained (single HTML, no external dependencies except CDN fonts/Chart.js)
- [ ] File opens correctly in browser

If ANY item fails, fix it before delivering.
