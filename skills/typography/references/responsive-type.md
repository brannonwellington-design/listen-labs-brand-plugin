# Responsive Typography

Fluid type scaling for Listen Labs layouts. Headings scale smoothly between mobile and desktop. Body text and captions stay fixed.

---

## Principles

1. **Headings scale. Body doesn't.** Display, H1, H2, and H3 sizes reduce on smaller screens. Body (16px), caption (12px), and micro (10px) are fixed — they're already at minimum readable sizes.
2. **Never use `vw` alone for font-size.** Always wrap in `clamp()` with pixel min and max values. Bare `vw` breaks browser zoom (WCAG accessibility violation).
3. **Hierarchy compresses on mobile.** Desktop might have an 8x ratio between display and caption. Mobile compresses to ~3-4x. This is fine — smaller screens have less competing content, so less contrast is needed.
4. **Stick to the brand type scale.** The min and max values of each `clamp()` must be values from the Listen Labs scale: 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128px.

---

## Fluid Type Scale

### CSS Custom Properties

```css
:root {
  /* ── Fluid headings ─────────────────────────────── */
  --type-display:    clamp(48px, 5vw + 24px, 96px);
  --type-h1:         clamp(32px, 3vw + 16px, 48px);
  --type-h2:         clamp(24px, 2vw + 12px, 32px);
  --type-h3:         clamp(20px, 1.5vw + 10px, 24px);
  --type-body-lead:  clamp(16px, 1vw + 10px, 18px);

  /* ── Fixed sizes ────────────────────────────────── */
  --type-body:       16px;
  --type-body-small: 14px;
  --type-caption:    12px;
  --type-micro:      10px;

  /* ── Line heights (4px grid aligned) ────────────── */
  --lh-display:      1.08;
  --lh-h1:           1.1;
  --lh-h2:           1.15;
  --lh-h3:           1.2;
  --lh-body-lead:    1.6;
  --lh-body:         1.6;
  --lh-body-small:   1.5;
  --lh-caption:      1.4;
  --lh-micro:        1.4;
}
```

### Applied Classes

```css
/* ── All text ─────────────────────────────────────── */
body {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  /* never add letter-spacing */
}

/* ── Headings ─────────────────────────────────────── */
.display {
  font-size: var(--type-display);
  line-height: var(--lh-display);
  color: var(--content-primary);
}

.h1 {
  font-size: var(--type-h1);
  line-height: var(--lh-h1);
  color: var(--content-primary);
}

.h2 {
  font-size: var(--type-h2);
  line-height: var(--lh-h2);
  color: var(--content-primary);
}

.h3 {
  font-size: var(--type-h3);
  line-height: var(--lh-h3);
  color: var(--content-primary);
}

/* ── Body ─────────────────────────────────────────── */
.body-lead {
  font-size: var(--type-body-lead);
  line-height: var(--lh-body-lead);
  color: var(--content-secondary);
}

.body {
  font-size: var(--type-body);
  line-height: var(--lh-body);
  color: var(--content-secondary);
  max-width: 720px; /* reading measure */
}

.body-small {
  font-size: var(--type-body-small);
  line-height: var(--lh-body-small);
  color: var(--content-secondary);
}

/* ── Small text ───────────────────────────────────── */
.caption {
  font-size: var(--type-caption);
  line-height: var(--lh-caption);
  color: var(--content-disabled);
}

.micro {
  font-size: var(--type-micro);
  line-height: var(--lh-micro);
  color: var(--content-disabled);
}
```

---

## How `clamp()` Works

```
font-size: clamp(MIN, PREFERRED, MAX);
```

- **MIN:** The smallest the text will ever get (mobile floor).
- **PREFERRED:** A viewport-relative formula that scales linearly. The text lives here between breakpoints.
- **MAX:** The largest the text will ever get (desktop ceiling).

### The Math

To scale linearly from `min` at viewport `vw_min` to `max` at viewport `vw_max`:

```
preferred = (slope × 100vw) + intercept

where:
  slope = (max - min) / (vw_max - vw_min)
  intercept = min - (slope × vw_min)
```

For most Listen Labs layouts, `vw_min = 375px` (mobile) and `vw_max = 1440px` (desktop).

### Pre-Calculated Examples

| Role | Mobile (375px) | Desktop (1440px) | clamp() |
|------|---------------|------------------|---------|
| Display | 48px | 96px | `clamp(48px, 5vw + 24px, 96px)` |
| H1 | 32px | 48px | `clamp(32px, 3vw + 16px, 48px)` |
| H2 | 24px | 32px | `clamp(24px, 2vw + 12px, 32px)` |
| H3 | 20px | 24px | `clamp(20px, 1.5vw + 10px, 24px)` |
| Body Lead | 16px | 18px | `clamp(16px, 1vw + 10px, 18px)` |
| Body | 16px | 16px | `16px` (fixed) |
| Caption | 12px | 12px | `12px` (fixed) |
| Micro | 10px | 10px | `10px` (fixed) |

---

## Responsive Spacing

Spacing scales proportionally with type to maintain visual rhythm.

### Heading Spacing at Breakpoints

| Element | Desktop | Tablet (768px) | Mobile (375px) |
|---------|---------|---------------|----------------|
| H1 above | 48px | 40px | 32px |
| H1 below | 24px | 20px | 16px |
| H2 above | 40px | 32px | 24px |
| H2 below | 16px | 12px | 12px |
| H3 above | 32px | 24px | 20px |
| H3 below | 12px | 8px | 8px |
| Section break | 96px | 64px | 48px |

### CSS with Media Queries

```css
/* ── Spacing custom properties ────────────────────── */
:root {
  --space-section: 96px;
  --space-h1-above: 48px;
  --space-h1-below: 24px;
  --space-h2-above: 40px;
  --space-h2-below: 16px;
  --space-h3-above: 32px;
  --space-h3-below: 12px;
  --space-paragraph: 16px;
}

@media (max-width: 768px) {
  :root {
    --space-section: 64px;
    --space-h1-above: 40px;
    --space-h1-below: 20px;
    --space-h2-above: 32px;
    --space-h2-below: 12px;
    --space-h3-above: 24px;
    --space-h3-below: 8px;
  }
}

@media (max-width: 480px) {
  :root {
    --space-section: 48px;
    --space-h1-above: 32px;
    --space-h1-below: 16px;
    --space-h2-above: 24px;
    --space-h2-below: 12px;
    --space-h3-above: 20px;
    --space-h3-below: 8px;
  }
}
```

---

## Responsive Layout Patterns

### Grid Collapse

Desktop 12-column → Tablet 8-column → Mobile 4-column (matches brand grid presets).

```css
.layout {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(12, 1fr);
  padding: 0 24px;
}

@media (max-width: 768px) {
  .layout {
    gap: 16px;
    grid-template-columns: repeat(4, 1fr);
    padding: 0 16px;
  }
}
```

### Asymmetric → Stacked

The asymmetric two-column editorial layout collapses to single-column on mobile:

```css
.editorial {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .editorial {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .editorial .sidebar {
    /* Metadata becomes inline row above content */
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }
}
```

### Reading Measure Constraint

Body text must be constrained regardless of viewport width:

```css
.body {
  max-width: 720px; /* ~65-75 characters at 16px Inter */
  width: 100%;
}
```

On very wide screens (1440px+), the body column stays at 720px with increasing margins. The headline can extend wider for impact.

---

## Accessibility Requirements

1. **All text must scale with browser zoom.** Use `px` inside `clamp()` — browser zoom scales pixel values. Never use `vw` alone.
2. **Minimum text size: 10px.** Nothing in the Listen Labs scale goes below 10px for readable content (6px and 8px are reserved for decorative micro-text only).
3. **Color contrast:** `content-primary` on `surface-primary` must meet WCAG AA (4.5:1 for body, 3:1 for large text). The Listen Labs Paper theme passes this — `#120F08` on `#F9F4EB` is ~15:1 contrast.
4. **`content-secondary` (60% opacity)** on `surface-primary` must also meet AA for body text. Verify in dark mode as well.
5. **`content-disabled` (30% opacity)** does NOT meet AA contrast. Use only for non-essential metadata that is supplementary, never for actionable or required content.
6. **Reduced motion:** Wrap any type animations in `@media (prefers-reduced-motion: no-preference)`.
