# Listen Labs Brand Guidelines

Apply these guidelines to **every** visual or document output. No exceptions unless the user explicitly overrides.

---

## Color Tokens — Theme: Paper

The theme is called **Paper** and has light and dark modes. Tokens are split into two categories: **content** (text and icons) and **surface** (backgrounds, fills, strokes, outlines, containers).

---

### Content Tokens
*Used for text and icons only.*

| Token | Light (Paper) | Dark (Paper) |
|-------|--------------|-------------|
| `content-primary` | `#120F08` | `#F9F4EB` |
| `content-secondary` | `#120F08` at 60% | `#F9F4EB` at 60% |
| `content-inverse-primary` | `#F9F4EB` | `#120F08` |
| `content-inverse-secondary` | `#F9F4EB` at 60% | `#120F08` at 60% |
| `content-disabled` | `#120F08` at 30% | `#F9F4EB` at 30% |
| `content-inverse-disabled` | `#F9F4EB` at 30% | `#120F08` at 30% |
| `content-brand` | `#0021CC` | `#0021CC` |
| `content-brand-contrast` | `#F9F4EB` | `#F9F4EB` |
| `content-complimentary` | `#E5A119` | `#E5A119` |
| `content-warning` | `#CF6317` | `#CF6317` |
| `content-negative` | `#CF2617` | `#CF2617` |
| `content-positive` | `#0F8A38` | `#0F8A38` |

---

### Surface Tokens
*Used for backgrounds, container fills, strokes, and outlines.*

**Surface hierarchy:** `surface-primary` is the default canvas background. `surface-highlight` sits above the canvas and is reserved for elevated elements — active dropdown menus, chat input fields, and emphasis surfaces. It is used sparingly.

| Token | Light (Paper) | Dark (Paper) |
|-------|--------------|-------------|
| `surface-highlight` | `#FCFBF7` | `#080603` |
| `surface-primary` | `#F9F4EB` | `#130F06` |
| `surface-secondary` | `#EEE8DD` | `#201C13` |
| `surface-tertiary` | `#E2DCCF` | `#30291D` |
| `surface-inverse-primary` | `#120F08` | `#F9F4EB` |
| `surface-inverse-secondary` | `#1F1B14` | `#F0E9DB` |
| `surface-brand-primary` | `#0021CC` | `#0021CC` |
| `surface-brand-secondary` | `#0021CC` at 10% | `#0021CC` at 30% |
| `surface-complimentary-primary` | `#E5A119` | `#E5A119` |
| `surface-complimentary-secondary` | `#E5A119` at 10% | `#E5A119` at 10% |
| `surface-warning-primary` | `#CF6317` | `#CF6317` |
| `surface-warning-secondary` | `#CF6317` at 10% | `#CF6317` at 10% |
| `surface-negative-primary` | `#CF2617` | `#CF2617` |
| `surface-negative-secondary` | `#CF2617` at 10% | `#CF2617` at 20% |
| `surface-positive-primary` | `#14B84B` | `#14B84B` |
| `surface-positive-secondary` | `#14B84B` at 10% | `#14B84B` at 20% |

---

### Emotion Tokens
*Used exclusively for emotion-tagged data in interview/research contexts. Not for general UI.*

All emotion secondary tokens are 10% opacity in both light and dark mode.

| Token | Light & Dark |
|-------|-------------|
| `emotion-anger-primary` | `#BF4040` |
| `emotion-anger-secondary` | `#BF4040` at 10% |
| `emotion-happiness-primary` | `#D99E26` |
| `emotion-happiness-secondary` | `#D99E26` at 10% |
| `emotion-disgust-primary` | `#80BF40` |
| `emotion-disgust-secondary` | `#80BF40` at 10% |
| `emotion-surprise-primary` | `#40BFAA` |
| `emotion-surprise-secondary` | `#40BFAA` at 10% |
| `emotion-sadness-primary` | `#406ABF` |
| `emotion-sadness-secondary` | `#406ABF` at 10% |
| `emotion-fear-primary` | `#9540BF` |
| `emotion-fear-secondary` | `#9540BF` at 10% |

```css
--emotion-anger-primary: #BF4040;
--emotion-anger-secondary: rgba(191, 64, 64, 0.10);
--emotion-happiness-primary: #D99E26;
--emotion-happiness-secondary: rgba(217, 158, 38, 0.10);
--emotion-disgust-primary: #80BF40;
--emotion-disgust-secondary: rgba(128, 191, 64, 0.10);
--emotion-surprise-primary: #40BFAA;
--emotion-surprise-secondary: rgba(64, 191, 170, 0.10);
--emotion-sadness-primary: #406ABF;
--emotion-sadness-secondary: rgba(64, 106, 191, 0.10);
--emotion-fear-primary: #9540BF;
--emotion-fear-secondary: rgba(149, 64, 191, 0.10);
```

---

### CSS Variables
```css
/* Paper - Light */
--content-primary: #120F08;
--content-secondary: rgba(18, 15, 8, 0.6);
--content-inverse-primary: #F9F4EB;
--content-inverse-secondary: rgba(249, 244, 235, 0.6);
--content-disabled: rgba(18, 15, 8, 0.3);
--content-inverse-disabled: rgba(249, 244, 235, 0.3);
--content-brand: #0021CC;
--content-brand-contrast: #F9F4EB;
--content-complimentary: #E5A119;
--content-warning: #CF6317;
--content-negative: #CF2617;
--content-positive: #0F8A38;

--surface-highlight: #FCFBF7;
--surface-primary: #F9F4EB;
--surface-secondary: #EEE8DD;
--surface-tertiary: #E2DCCF;
--surface-inverse-primary: #120F08;
--surface-inverse-secondary: #1F1B14;
--surface-brand-primary: #0021CC;
--surface-brand-secondary: rgba(0, 33, 204, 0.10);
--surface-complimentary-primary: #E5A119;
--surface-complimentary-secondary: rgba(229, 161, 25, 0.10);
--surface-warning-primary: #CF6317;
--surface-warning-secondary: rgba(207, 99, 23, 0.10);
--surface-negative-primary: #CF2617;
--surface-negative-secondary: rgba(207, 38, 23, 0.10);
--surface-positive-primary: #14B84B;
--surface-positive-secondary: rgba(20, 184, 75, 0.10);

/* Paper - Dark (override these in dark mode) */
--content-primary: #F9F4EB;
--content-secondary: rgba(249, 244, 235, 0.6);
--content-inverse-primary: #120F08;
--content-inverse-secondary: rgba(18, 15, 8, 0.6);
--content-disabled: rgba(249, 244, 235, 0.3);
--content-inverse-disabled: rgba(18, 15, 8, 0.3);

--surface-highlight: #080603;
--surface-primary: #130F06;
--surface-secondary: #201C13;
--surface-tertiary: #30291D;
--surface-inverse-primary: #F9F4EB;
--surface-inverse-secondary: #F0E9DB;
--surface-brand-secondary: rgba(0, 33, 204, 0.30);
--surface-negative-secondary: rgba(207, 38, 23, 0.20);
--surface-positive-secondary: rgba(20, 184, 75, 0.20);
```

---

## Typography

- **Font**: Inter, loaded from Google Fonts (`https://fonts.googleapis.com/css2?family=Inter&display=swap`)
- **Weight**: Regular (400) only — **never bold, never thin/light**
- **Letter spacing**: **Never add letter-spacing as a style.** Use default browser/system letter-spacing at all times. This is a hard brand rule.
- **Size**: Scale freely — large display type is encouraged for impact. Small type for secondary info is fine.
- **Type scale**: Use only these sizes (px): `6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128` — never pick an arbitrary size outside this scale
- **Case**: Standard headlines and body copy use normal sentence or title case — **all caps is reserved exclusively for** the project header label (`LISTEN LABS / TITLE`) and very sparse detail areas (e.g. small metadata labels, category tags). Never default to all caps for headings or general copy.

```css
body {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  /* never add letter-spacing */
}
```

---

## Header / Title Convention

Most Listen Labs outputs include a branded header at the top center:

```
LISTEN LABS / PROJECT TITLE
```

Rules:
- Positioned **top center**, **24px from the top**
- All caps always
- `LISTEN LABS /` is in **secondary content color** (60% opacity)
- `PROJECT TITLE` is in **primary content color**
- Both use the same font size — **default is 10px** for standalone pages, features, slides, tools, and artifacts. Only deviate if the context clearly calls for a larger display treatment.
- No letter-spacing added
- Single line, space-separated with a `/` divider

HTML example:
```html
<div style="text-align:center; position:absolute; top:24px; left:0; right:0; font-family:'Inter',sans-serif; font-weight:400; font-size:10px;">
  <span style="color: var(--content-secondary)">LISTEN LABS /</span>
  <span style="color: var(--content-primary)"> PROJECT TITLE</span>
</div>
```

---

## Art Direction

Listen Labs designs simulate the sensibility of **Dieter Rams** — the German industrial designer whose work defined what it means for something to be both beautiful and inevitable. When making any layout or composition decision, ask: *what would he remove, and what would he leave?*

### Core POV

- **Less, but better.** Every element must earn its place. If it doesn't serve a clear function in the hierarchy, remove it. Decoration is not a function.
- **Radical reduction.** Strip the design down until removing one more thing would break comprehension. Stop there. That's the design.
- **Stillness.** A resolved layout doesn't feel restless or busy. White space is load-bearing — it creates calm, frames content, and signals confidence. It is never leftover.
- **Neutral confidence.** The design doesn't try to impress. It simply works — and that's what makes it impressive.

### Hierarchy & Composition

- **Scale contrast is the primary compositional tool** — not color, not decoration. A very large element next to a very small one creates tension, focus, and visual interest without adding noise. Think: a massive numeral next to a tiny label. A wide rule next to a narrow caption.
- **One dominant element per composition.** Everything else is subordinate. The eye should never be confused about where to look first.
- **Grid discipline.** Elements align to a felt-but-invisible structure. Nothing floats arbitrarily. Alignment is how you signal intention.
- **Functional hierarchy.** The most important thing is the most visually dominant thing — always. If the hierarchy is ambiguous, the design isn't finished.

### What This Looks Like in Practice

- Prefer one large typographic element over several medium ones
- Use empty space actively — position it, don't just leave it
- Combine simple large shapes with fine text or thin lines for contrast
- Let a single brand blue element do all the accent work — don't introduce more
- Avoid anything that would make Rams ask "why is that there?"

### What to Avoid (Rams Lens)

- Layouts that feel "designed" rather than resolved
- Multiple competing focal points
- Decorative elements that don't carry meaning
- Busyness mistaken for richness
- Anything that requires explanation to justify its presence

### The Listen Labs Feel
- **Minimal editorial** — lots of breathing room, nothing cluttered
- **Technical precision** — clean alignment, deliberate spacing, nothing accidental
- **Bold simplicity** — big shapes, large type, graphic confidence. Impact comes from scale and composition, not decoration.
- **Warm, not cold** — the warm off-white canvas and near-black text give a human, analog quality even in technical contexts

### Layout
- **Generous whitespace** — let elements breathe. Margins and padding should feel intentional and spacious.
- **No drop shadows** — avoid `box-shadow` for depth. Use borders, spacing, and contrast instead.
- **No heavy decorative elements** — no gradients, no textures, no stock imagery aesthetic

### What to Avoid
- Drop shadows or heavy depth effects
- Rounded, bubbly UI (respect the border radius scale)
- Bright or saturated accent colors beyond `#0021CC`
- Bold or light font weights
- Letter-spacing overrides
- Cluttered layouts
- Generic or decorative imagery
- Odd numbers for spacing or sizing
- Arbitrary border radius values outside the scale

---

## Spacing & Sizing System

All spacing, sizing, and layout values use **even numbers only**, building up from a **4px base unit**. Odd numbers are avoided across the entire system.

- Minimum unit: **4px**
- Maximum common unit: **96px**
- All padding, margin, gap, width, height, offset, and positioning values should land on even numbers
- When in doubt, round to the nearest even number

---

## Grid Presets

Use these column grids as the layout foundation for each medium. Apply the correct preset based on context — don't guess or invent arbitrary gutters.

| Medium | Columns | Margins | Gutters |
|--------|---------|---------|---------|
| Presentation slides (1920x1080) | 12 | 40px | 40px |
| Desktop website | 12 | 24px | 24px |
| Mobile website | 4 | 16px | 16px |
| Desktop product design | 12 | 16px | 16px |
| Mobile product design | 4 | 16px | 16px |

---

### Height Presets
Components (buttons, inputs, tags, etc.) snap to these heights:

| Size | Height |
|------|--------|
| XL | 32px |
| L | 24px |
| M | 20px |
| S | 16px |
| XS | 12px |

### Border Radius Scale
Acceptable values only: `0, 2, 4, 8, 12, 16` — no arbitrary values.

- **Button default**: `8px`
- **Concentric nesting rule**: when an element is nested inside a container, the inner radius should be smaller to maintain a natural concentric look:
  - Inner element at `8px` → container typically `12px` or `16px`
  - Inner element at `4px` → container typically `8px`
  - A container holding an `8px` radius button is usually `12px` or `16px` outer radius

---

## Icons

- **Library**: Lucide only
- **Principle**: Icon line weight should visually match the weight of nearby typography — since we only use Inter Regular, icons should feel similarly refined, never chunky
- **Sizing scale**: Match icon size and stroke to the text size it's paired with:

| Text size | Icon size | Stroke width |
|-----------|-----------|--------------|
| 8px | 10x10px | 0.75px |
| 10px | 12x12px | 1px |
| 12px | 14x14px | 1px |
| 14px | 16x16px | 1.25px |
| 16px | 18x18px | 1.25px |
| 18px | 20x20px | 1.5px |
| 20px | 22x22px | 1.75px |
| 24px+ | 24x24px | 2px |

- When in doubt, interpolate linearly: icon size = text size + 2px, stroke = scaled proportionally from 0.75px (at 8px text) to 2px (at 24px text)
- Icons should use the same color as the text they accompany (primary or secondary content color)

---

## Medium-Specific Notes

### HTML / Web Artifacts
- Import Inter via Google Fonts in `<head>`
- Use CSS variables for all colors
- Default to light mode; add dark mode via `prefers-color-scheme` or a toggle if relevant
- Use `surface-primary` as the default canvas background
- `surface-highlight` reserved for elevated elements (dropdowns, inputs, emphasis)

### Canvas / Visualizations
- Background fill: `#F9F4EB` (light) or `#130F06` (dark) — i.e. `surface-primary`
- Draw text using Inter where possible (load as web font or use system fallback)
- Use `#0021CC` sparingly for highlighted data points or accents
- **Multi-series data using brand blue**: when `#0021CC` is used to fill data objects (bars, pie slices, lines, etc.), additional data series can use the same blue at descending opacity stops rather than introducing new colors. Choose stops that are visually distinct — e.g. 100%, 60%, 30% for three series, or 100%, 70%, 45%, 20% for four. Avoid stops so close together they're hard to tell apart.

### Presentations (PPTX)
- Slide background: `#F9F4EB` (`surface-primary`)
- Primary text: `#120F08`
- Accent: `#0021CC` for key callouts only
- Use Inter throughout; Regular weight only
- Header slide: large all-caps title, centered, branded header convention at top

### Word Documents (DOCX)
- Page background or header area should evoke the warm palette
- Inter Regular throughout
- Use `#0021CC` for links or key highlights only

---

## Quick Reference

| Property | Value |
|----------|-------|
| Canvas / default bg (light) | `#F9F4EB` (surface-primary) |
| Canvas / default bg (dark) | `#130F06` (surface-primary) |
| Surface highlight (light) | `#FCFBF7` — elevated elements only |
| Surface highlight (dark) | `#080603` — elevated elements only |
| Content primary (light) | `#120F08` |
| Content primary (dark) | `#F9F4EB` |
| Content secondary | 60% opacity of content primary |
| Content disabled | 30% opacity of content primary |
| Brand | `#0021CC` |
| Font | Inter, 400 only |
| Letter spacing | Default (never override) |
| Spacing unit | 4px base, even numbers only |
| Component heights | 12, 16, 20, 24, 32px |
| Border radius | 0, 2, 4, 8, 12, 16px — button default 8px |
| Shadows | None |
| Header format | `LISTEN LABS / TITLE` — top center, 24px from top |
