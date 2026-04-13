# Typographic Lockups

Pre-built type compositions for Listen Labs. A lockup is a fixed spatial arrangement of text elements that creates a distinctive, repeatable composition. Copy and adapt — never improvise type arrangements from scratch.

All lockups use Inter Regular 400 only. Hierarchy comes from size, opacity, and spatial position.

---

## 1. Title Block

The standard page or section opener. Three tiers stacked vertically.

```
[10px, content-disabled, Title Case]     Category or Date
                                          ↕ 8px gap
[48px, content-primary, Title Case]      The Main Headline
                                          ↕ 12px gap
[16px, content-secondary, sentence]      A one-line subtitle or description that supports the headline.
```

**CSS:**
```css
.title-block .overline {
  font-size: 10px;
  line-height: 16px;    /* 4px grid */
  color: var(--content-disabled);
  margin-bottom: 8px;
}
.title-block .headline {
  font-size: 48px;
  line-height: 52px;    /* 4px grid */
  color: var(--content-primary);
  margin-bottom: 12px;
}
.title-block .subtitle {
  font-size: 16px;
  line-height: 24px;    /* 4px grid */
  color: var(--content-secondary);
}
```

**Why it works:** The 4.8x ratio between overline (10px) and headline (48px) creates the visual tension that type-pairing normally provides. The overline in disabled opacity signals "metadata" without needing a different font.

### Variations

**Without overline** (simpler):
```
[48px, content-primary]                  The Main Headline
                                          ↕ 12px gap
[16px, content-secondary]                Supporting subtitle text.
```

**With larger display** (hero/landing):
```
[10px, content-disabled]                 Category
                                          ↕ 8px gap
[80px, content-primary]                  Big Statement
                                          ↕ 16px gap
[18px, content-secondary]                A lead paragraph that expands on the statement above.
```

---

## 2. Stat / Big Number

Highlight a single metric with dramatic scale contrast.

```
[64px, content-brand (#0021CC)]          47%
                                          ↕ 4px gap
[14px, content-secondary]                increase in user engagement
```

**CSS:**
```css
.stat-lockup .number {
  font-size: 64px;
  line-height: 68px;    /* 4px grid */
  color: var(--content-brand);
  margin-bottom: 4px;
}
.stat-lockup .label {
  font-size: 14px;
  line-height: 20px;    /* 4px grid */
  color: var(--content-secondary);
}
```

**Why it works:** The 4.6x ratio between number and label, plus the brand accent color on the number, draws the eye instantly. The tight 4px gap binds label to number.

### Variations

**Stat with context line:**
```
[64px, content-brand]                    2.4M
                                          ↕ 4px gap
[14px, content-secondary]                monthly active users
                                          ↕ 8px gap
[12px, content-disabled]                 Up from 1.8M last quarter
```

**Compact stat (for cards or grids):**
```
[40px, content-brand]                    92%
                                          ↕ 4px gap
[12px, content-secondary]                satisfaction rate
```

---

## 3. Metadata Cluster

A group of small, subordinate data points. Appears near titles or at the top/bottom of cards and articles.

### Vertical Stack
```
[12px, content-disabled]                 Jan 12, 2026
[12px, content-disabled]                 5 min read
[12px, content-disabled]                 Research
```
- 4px gap between items
- All same size, all disabled opacity
- Hierarchy comes from spatial proximity to the content it describes

### Inline with Dividers
```
[12px, content-disabled]                 Jan 12, 2026  /  5 min read  /  Research
```
- `/` divider in content-disabled
- 8px horizontal padding around each divider
- Single line, compact

**CSS (inline):**
```css
.metadata-inline {
  font-size: 12px;
  line-height: 16px;
  color: var(--content-disabled);
  display: flex;
  gap: 8px;
  align-items: center;
}
.metadata-inline .divider {
  color: var(--content-disabled);
}
```

### Inline with Dot Dividers
```
[12px, content-disabled]                 Research  ·  5 min read  ·  Jan 2026
```
- Midpoint dot (`·`) as divider, slightly softer than `/`
- Same spacing rules

---

## 4. Section Header with Rule

A section heading with a horizontal line that anchors it to the grid.

```
────────────────────────────────────────  [1px, content-disabled]
                                          ↕ 16px gap
[24px, content-primary, Title Case]      Section Title
                                          ↕ 12px gap
[14px, content-secondary, sentence]      Optional section description.
```

**CSS:**
```css
.section-header .rule {
  height: 1px;
  background: var(--content-disabled);
  margin-bottom: 16px;
}
.section-header .title {
  font-size: 24px;
  line-height: 28px;    /* 4px grid */
  color: var(--content-primary);
  margin-bottom: 12px;
}
.section-header .description {
  font-size: 14px;
  line-height: 20px;    /* 4px grid */
  color: var(--content-secondary);
}
```

**Why it works:** The 1px rule in disabled opacity provides a clean visual break without competing with the heading. It's the editorial equivalent of a section divider in a magazine spread.

---

## 5. Card Header

A compact title arrangement for cards, list items, or contained UI elements.

```
[16px, content-primary, Title Case]      Card Title Here
                                          ↕ 4px gap
[14px, content-secondary, sentence]      A brief description of the card content that stays to two lines max.
                                          ↕ 8px gap
[12px, content-disabled]                 Metadata  ·  Jan 2026
```

**CSS:**
```css
.card-header .title {
  font-size: 16px;
  line-height: 24px;
  color: var(--content-primary);
  margin-bottom: 4px;
}
.card-header .description {
  font-size: 14px;
  line-height: 20px;
  color: var(--content-secondary);
  margin-bottom: 8px;
}
.card-header .meta {
  font-size: 12px;
  line-height: 16px;
  color: var(--content-disabled);
}
```

**Why it works:** Three size tiers (16 → 14 → 12) with three opacity tiers (primary → secondary → disabled) create clear hierarchy in a compact vertical space.

---

## 6. Pull Quote

A featured quote pulled from body content for emphasis.

```
                                          ↕ 40px above
[24px, content-primary, sentence]        "Design is not just what it looks like and feels like.
                                          Design is how it works."
                                          ↕ 12px gap
[12px, content-disabled]                 — Attribution Name
                                          ↕ 40px below
```

**CSS:**
```css
.pull-quote {
  margin: 40px 0;
  padding-left: 24px;
  border-left: 2px solid var(--content-disabled);
}
.pull-quote .text {
  font-size: 24px;
  line-height: 32px;    /* 4px grid */
  color: var(--content-primary);
  margin-bottom: 12px;
}
.pull-quote .attribution {
  font-size: 12px;
  line-height: 16px;
  color: var(--content-disabled);
}
```

**Why it works:** The 2px left border (from the brand border radius scale) plus 24px indent creates a quiet visual anchor. The 2x size difference from body text (24px vs 16px) signals "this is featured" without decoration.

---

## 7. Asymmetric Two-Column

The editorial layout: narrow metadata column left, wide content column right.

```
col 1-3 (narrow)                    col 4-12 (wide)
─────────────────                   ──────────────────────────────────────
[10px, disabled]                    [32px, primary, Title Case]
Category                            Section Heading That Spans
                                    the Full Content Column
[10px, disabled]
Jan 2026                            [16px, secondary, sentence]
                                    Body text lives here in the wide
[10px, disabled]                    column. It flows naturally at
5 min read                          the optimal reading measure of
                                    about 65-75 characters per line.
```

**CSS:**
```css
.asymmetric-layout {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 24px;
}
.asymmetric-layout .sidebar {
  font-size: 10px;
  line-height: 16px;
  color: var(--content-disabled);
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 8px; /* align with heading baseline */
}
.asymmetric-layout .content .heading {
  font-size: 32px;
  line-height: 36px;
  color: var(--content-primary);
  margin-bottom: 16px;
}
.asymmetric-layout .content .body {
  font-size: 16px;
  line-height: 24px;
  color: var(--content-secondary);
  max-width: 720px;
}
```

**Why it works:** The asymmetric grid with tiny metadata (10px disabled) beside large content (32px primary) creates the "tiny next to huge" tension. The narrow left column mirrors the sidebar approach of Swiss Style posters and Cereal magazine layouts.

**Responsive:** On mobile (< 768px), stack vertically — metadata cluster on top as an inline row, then content below.

---

## Composition Rules for All Lockups

1. **Every lockup needs at least a 1.5x size ratio** between its largest and smallest elements.
2. **Gaps within a lockup are smaller** than gaps between separate lockups. Internal cohesion > external separation.
3. **All gaps are multiples of 4px.** Common: 4, 8, 12, 16, 24.
4. **Lockups are left-aligned** unless specifically a centered hero element.
5. **Never mix lockup styles** within the same hierarchy level. If two cards exist side by side, they use the same lockup pattern.
6. **Lockups are responsive.** Display and H1 sizes scale down on mobile per the hierarchy table. Caption and metadata sizes stay fixed.
