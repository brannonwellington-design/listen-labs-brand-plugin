---
name: typography
description: "Use this skill when laying out type-heavy content — HTML pages, dashboards, artifacts, landing pages, emails, documents, or any layout where text hierarchy, spacing, and composition matter. TRIGGER when user asks to design, lay out, or build any interface or page with text. Provides Listen Labs typographic hierarchy, spacing rhythm, lockup patterns, grid rules, and responsive scaling — all using Inter Regular 400 only. This is a foundation skill that /data-viz and /pptx build on."
allowed-tools: mcp__listen-labs-brand__get_full_guidelines mcp__listen-labs-brand__get_typography mcp__listen-labs-brand__get_spacing mcp__listen-labs-brand__get_css_variables mcp__listen-labs-brand__get_art_direction
---

# Listen Labs Typography Skill

Achieve premium, editorial-quality hierarchy using only Inter Regular 400. No bold. No light. No italic. No other typeface. Hierarchy comes from size, opacity, spacing, and composition — never from weight.

This skill encodes the typographic philosophy of Swiss International Style and modern editorial design (Kinfolk, Cereal, Monocle) translated for responsive digital interfaces. Every rule works within the Listen Labs brand constraints.

---

## Workflow

1. **Load brand tokens** — call `get_typography`, `get_spacing`, and `get_css_variables` from the Listen Labs brand MCP. Never hardcode values from memory.
2. **Establish hierarchy** — assign roles from the hierarchy table below. Every text element must have a clear role.
3. **Apply spacing rhythm** — use the spacing rules to create vertical rhythm. Space above headings > space below.
4. **Compose lockups** — reference `skills/typography/references/lockups.md` for pre-built title blocks, stat blocks, and metadata patterns.
5. **Scale responsively** — reference `skills/typography/references/responsive-type.md` for fluid type patterns.
6. **Audit** — run the self-audit checklist before delivering.

---

## The Single-Weight Hierarchy System

With one font weight, you have four tools for creating hierarchy. Use them in this priority order:

1. **Size** — the primary tool. Scale contrast does the heavy lifting.
2. **Opacity** — replaces bold. Three tiers create clear visual weight.
3. **Spacing** — whitespace groups, separates, and elevates.
4. **Case** — Title Case for headings/labels, sentence case for body.

These four tools used together produce hierarchy indistinguishable from multi-weight systems.

---

## Size Hierarchy Table

Every text element in a layout must map to one of these roles. No arbitrary sizes — use only values from the Listen Labs type scale.

| Role | Desktop | Mobile | Line Height | Opacity | Case |
|------|---------|--------|-------------|---------|------|
| Display / Hero | 64-96px | 40-56px | 1.05-1.1 | primary (100%) | Title Case |
| Page Title (H1) | 48px | 32px | 1.1 | primary (100%) | Title Case |
| Section Title (H2) | 32px | 24px | 1.15 | primary (100%) | Title Case |
| Subsection (H3) | 24px | 20px | 1.2 | primary (100%) | Title Case |
| Body Lead | 18px | 16px | 1.6 | secondary (60%) | Sentence case |
| Body Default | 16px | 16px | 1.6 | secondary (60%) | Sentence case |
| Body Small | 14px | 14px | 1.5 | secondary (60%) | Sentence case |
| Caption / Metadata | 12px | 12px | 1.4 | disabled (30%) | Sentence case |
| Micro / Overline | 10px | 10px | 1.4 | disabled (30%) | Title Case |

### Line Height Rules

Line height has an inverse relationship with font size. Large text needs tight leading. Small text needs air.

| Size Tier | Line Height | Why |
|-----------|-------------|-----|
| 48px and above | 1.05-1.1 | Large text reads as a visual block — tight leading keeps it cohesive |
| 24-40px | 1.15-1.25 | Medium headings need moderate breathing room |
| 14-20px | 1.5-1.6 | Reading text needs generous leading for comfortable scanning |
| 10-12px | 1.4 | Small text needs air but not as much as body — it's scanned, not read line by line |

**Snap line heights to multiples of 4px** for vertical rhythm:
- 16px text × 1.5 = 24px line height (divisible by 4)
- 14px text × ~1.71 = 24px line height (snap to 24px)
- 48px text × 1.08 = ~52px line height (snap to 52px)
- 12px text × 1.33 = 16px line height (snap to 16px)

---

## The Three-Tier Opacity System

Opacity replaces bold. These three tiers create the same visual weight differentiation that bold/regular/light would provide.

| Tier | Token | Opacity | Use For |
|------|-------|---------|---------|
| Primary | `content-primary` | 100% | Headlines, titles, the single most important element per section |
| Secondary | `content-secondary` | 60% | Body text, descriptions, supporting content — the workhorse tier |
| Disabled | `content-disabled` | 30% | Metadata, timestamps, captions, divider lines, grid lines |

### Rules

- A heading in `content-primary` paired with body in `content-secondary` produces the same visual contrast as a bold/regular pairing at the same size.
- **Most running text lives at 60% (secondary).** Primary opacity is reserved for headings and the most important content. Do not use primary opacity for body text when it appears alongside headings.
- Captions and timestamps get the triple reduction: smaller size + lower opacity + generous surrounding space. This makes them clearly subordinate without needing a lighter font weight.
- **If two text elements are within 1.2x size of each other, they MUST differ in opacity.** Same size + same opacity = no hierarchy = a failure.

---

## Spacing Rhythm

Spacing is structural, not decorative. It groups related content, separates unrelated content, and creates vertical rhythm.

### Space Around Headings

Space above a heading is always greater than space below it. This groups the heading with the content that follows, not the content that precedes it.

| Element | Space Above | Space Below | Ratio |
|---------|-------------|-------------|-------|
| H1 (48px) | 48px | 24px | 2:1 |
| H2 (32px) | 40px | 16px | 2.5:1 |
| H3 (24px) | 32px | 12px | 2.7:1 |
| Body paragraph | — | 16px | — |
| Section break | 64-96px | — | — |

### Paragraph Spacing

- Paragraph margin-bottom = body font size (16px for default body).
- Never use less paragraph spacing than the difference between line-height and font-size. Paragraphs must be visually distinct from line breaks within a paragraph.

### Section Breaks

Major sections are separated by 64-96px of vertical space — or a full-width 1px rule in `content-disabled` (30% opacity). This breathing room is the editorial technique that gives layouts their premium, unhurried feel.

### The 4px Vertical Rhythm Grid

All spacing values must be multiples of 4px (brand rule). Common values:

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96`

When line heights are also snapped to multiples of 4px, text across adjacent columns aligns baseline-to-baseline. This creates the invisible structural consistency that separates premium from amateur.

---

## Grid and Measure

### Reading Measure (Line Length)

Body text must never exceed 720px or approximately 65-75 characters per line. On a 12-column desktop grid:

- **Body text occupies 6-8 columns** (optimal reading measure)
- **Headlines can span full 12 columns** for maximum impact
- **Metadata can sit in a narrow 2-3 column sidebar** for asymmetric layouts

### The Asymmetric Editorial Layout

The premium editorial technique: content does not center — it anchors left with generous right margin.

```
12-column grid:
[  1  ][  2  ][  3  ][  4  ][  5  ][  6  ][  7  ][  8  ][ 9 ][ 10][ 11][ 12]
|---- body text (cols 1-7, ~58%) --------|--- breathing room / metadata ---|
|---- headlines (cols 1-10 or 1-12) ----------------------------------------|
```

This asymmetry creates visual sophistication. The right margin is active whitespace — it can hold metadata, pull quotes, or simply breathe.

### Alignment

- **Left-aligned, ragged right for all text.** Never justified.
- Left alignment creates a strong vertical anchor the eye returns to.
- Ragged right eliminates uneven word spacing and creates organic texture.
- Center alignment only for: the Listen Labs branded header and isolated single-line elements (hero headlines on landing pages, stat numbers on feature cards).

---

## Contrast Minimums

### Size Contrast Between Adjacent Elements

| Adjacent Pair | Minimum Ratio | Example |
|---------------|---------------|---------|
| Overline → Headline | 4x+ | 10px → 48px (4.8x) |
| Caption → Section Title | 2.5x+ | 12px → 32px (2.7x) |
| Body → Subsection | 1.5x+ | 16px → 24px (1.5x) |
| Body Small → Body Default | 1.1x | 14px → 16px (differentiate with opacity) |

**Below 1.5x size ratio:** elements MUST differ in opacity tier. Size alone is not enough.

**Below 1.2x size ratio:** elements MUST differ in both opacity AND case (e.g., 14px sentence case secondary vs 16px Title Case primary).

### The Tiny-Next-to-Huge Technique

Placing 10px metadata directly adjacent to a 64px headline (6.4x ratio) creates the visual energy that type-pairing normally provides. This is the core editorial technique — small, quiet metadata in close spatial proximity to large, dominant headlines.

Use this anywhere you need visual tension without introducing a second typeface or weight.

---

## Case as Hierarchy

With no all-caps allowed, the distinction between Title Case and sentence case is a subtle but real hierarchy signal.

| Case | Use For | Effect |
|------|---------|--------|
| Title Case | Headings, labels, navigation, buttons, the branded header | Signals authority, structure, "this is a label" |
| Sentence case | Body copy, descriptions, helper text, error messages | Signals reading content, conversational tone |

**Where case replaces weight:** In traditional systems, a label might be set in bold at body size. In a single-weight system, set the label in Title Case at the same size as body text. The capitalization pattern alone signals "this is a label, not running text."

---

## Prohibited

1. Bold or light font weights of any kind
2. Italic for emphasis (use opacity differentiation instead)
3. Any typeface other than Inter
4. Letter-spacing overrides
5. ALL CAPS on any element
6. Justified text alignment
7. Centered body text or paragraph blocks (center only isolated headlines)
8. Line lengths exceeding 75 characters (~720px)
9. Odd-number spacing values
10. Line heights that don't approximate multiples of 4px
11. Adjacent same-size, same-opacity text elements (no hierarchy = failure)
12. Decorative type treatments (outlines, shadows, gradients on text)

---

## Self-Audit Checklist

Before delivering any layout:

- [ ] Every text element maps to a role in the hierarchy table
- [ ] Font sizes are from the Listen Labs type scale only
- [ ] Line heights follow the inverse rule (large text tight, small text generous)
- [ ] Line heights snap to multiples of 4px
- [ ] Opacity tiers are correct: primary for headings, secondary for body, disabled for metadata
- [ ] Elements within 1.2x size of each other differ in opacity
- [ ] Space above headings > space below (2:1 minimum ratio)
- [ ] Paragraph spacing = body font size (16px)
- [ ] All spacing values are multiples of 4px
- [ ] Body text measure does not exceed 720px / 75 characters
- [ ] Text is left-aligned ragged right (not justified, not centered body)
- [ ] Title Case used for headings and labels, sentence case for body
- [ ] No bold, no italic, no letter-spacing, no all-caps
- [ ] Responsive: headings scale between mobile and desktop sizes
- [ ] Branded header present where required

If ANY item fails, fix it before delivering. Do not mention the audit to the user.
