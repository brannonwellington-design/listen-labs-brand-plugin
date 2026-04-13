---
name: report
description: "Use this skill when creating research reports, insight summaries, study recaps, executive briefings, interview digests, competitive analyses, or any multi-section narrative document. TRIGGER when user mentions 'report', 'summary', 'brief', 'digest', 'findings', 'insights', 'writeup', 'write-up', or 'research document'. Produces self-contained, print-ready HTML files with Listen Labs branding, emotion-coded callouts, and embedded data visualizations."
allowed-tools: Bash(open *) mcp__listen-labs-brand__get_full_guidelines mcp__listen-labs-brand__get_brand_colors mcp__listen-labs-brand__get_css_variables mcp__listen-labs-brand__get_typography mcp__listen-labs-brand__get_data_visualization mcp__listen-labs-brand__get_art_direction mcp__listen-labs-brand__get_spacing
---

# Listen Labs Report Skill

Generate professional, brand-compliant research reports as self-contained HTML files. Reports open in any browser and print cleanly to PDF. This is the flagship Listen Labs deliverable — every element must meet editorial-quality standards.

This skill composes with `/typography` (hierarchy and layout), `/data-viz` (embedded charts), and the Listen Labs brand MCP tools (live tokens).

---

## Workflow

1. **Load brand tokens** — call `get_css_variables`, `get_typography`, `get_spacing`, and `get_art_direction` from the brand MCP. Never hardcode tokens.
2. **Copy the skeleton** — start from `skills/report/references/skeleton.html`. Copy completely, then modify.
3. **Plan the structure** — outline all sections before writing content. Every report needs at minimum: cover, executive summary, and findings. Reference `skills/report/references/section-patterns.md`.
4. **Apply emotion coding** — when findings reference emotional data, use emotion callouts from `skills/report/references/emotion-callouts.md`. Emotion tokens are reserved exclusively for Ekman emotion data.
5. **Embed visualizations** — embed Chart.js charts inline using `/data-viz` patterns. Charts inherit the report's CSS variables automatically.
6. **Audit** — run the self-audit checklist. No report ships without passing every item.
7. **Write and open** — save as a single `.html` file and open in browser.

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
- **Background:** `surface-primary` (`#F9F4EB` light, `#130F06` dark)

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

- **Body text at secondary opacity (60%).** Not primary. The secondary tier is the workhorse for reading text.
- **Headings at primary opacity (100%).** Headings are the only elements that use full opacity.
- **Metadata and captions at disabled opacity (30%).**
- **Brand blue (`#0021CC`) sparingly** — for key stat numbers, linked text, and one-per-section accent elements only.
- **Emotion tokens** — exclusively for Ekman emotion-coded content. See emotion callouts reference.

### Section Dividers

Major sections are separated by either:
- **96px of vertical whitespace** (preferred — cleaner), or
- **A full-width 1px rule** in `content-disabled` (30% opacity) with 48px above and 48px below

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

Background: `surface-brand-secondary` (brand blue at 10% opacity). Padding: 32px. Border-radius: 8px. One stat block per finding maximum.

### Embedded Charts

Charts are embedded inline using Chart.js (same patterns as `/data-viz`). They inherit the report's CSS variables automatically.

- Chart container: `width: 100%; height: 320px; margin: 24px 0;`
- Charts get a `<figcaption>` in 12px disabled opacity below them
- Follow all `/data-viz` rules: monochromatic brand blue, 1px strokes, 2px bar radius

---

## Emotion-Coded Content

When report findings reference emotional data from Listen Labs research, use emotion callouts. See `skills/report/references/emotion-callouts.md` for the full pattern library.

**Rules:**
- Emotion tokens are used ONLY for the 6 Ekman emotions: anger, happiness, disgust, surprise, sadness, fear
- Each emotion has a primary color (for accents) and a secondary color (10% opacity background)
- Never use emotion colors for general-purpose highlighting, status indicators, or decoration
- An emotion callout pairs a colored left border with the emotion's secondary background
- Emotion callouts include the emotion label as metadata

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

## Prohibited

1. Bold or light font weights
2. Italic text (including for quotes — use the left-border pattern instead)
3. Any typeface other than Inter
4. Letter-spacing overrides
5. ALL CAPS text
6. Decorative dividers, ornaments, or flourishes
7. Gradient backgrounds or fills
8. Drop shadows
9. Colors outside the Paper theme palette
10. Emotion tokens used for non-emotion purposes
11. Multiple accent colors on one page (brand blue only, emotion colors only for emotion data)
12. Centered body text (center only the cover title block)
13. Odd-number spacing values
14. Charts without captions
15. Participant quotes without attribution
16. Findings without supporting evidence (quotes, data, or both)

---

## Self-Audit Checklist

Before delivering any report:

- [ ] Brand MCP was called for live tokens
- [ ] Skeleton was used as starting point
- [ ] Cover section has: branded header, title, subtitle, date, metadata
- [ ] Executive summary is present and contains 3-5 key findings
- [ ] All sections follow the fixed order (cover → exec summary → findings → recommendations)
- [ ] Section spacing is consistent (96px between sections OR 1px rules — not both)
- [ ] Typography hierarchy matches the report hierarchy table
- [ ] Body text uses secondary opacity (60%), headings use primary (100%)
- [ ] All spacing values are multiples of 4px
- [ ] Participant quotes use left-border pattern with attribution
- [ ] Emotion callouts used ONLY for Ekman emotion data
- [ ] Stat blocks use brand-secondary background (10% opacity)
- [ ] Embedded charts follow /data-viz rules
- [ ] Tables use minimal styling (no zebra stripes, no heavy borders)
- [ ] Print stylesheet works (cover on own page, no split sections)
- [ ] Dark mode works via prefers-color-scheme
- [ ] Content width does not exceed 800px
- [ ] File is self-contained (single HTML, no external dependencies except CDN fonts/Chart.js)
- [ ] File opens correctly in browser

If ANY item fails, fix it before delivering.
