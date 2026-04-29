<!-- AUTO-GENERATED from brand_data.py — do not edit manually -->
<!-- Run: python3 generate_guidelines.py -->

# Listen Labs Brand Guidelines

Apply these guidelines to **every** visual or document output. No exceptions unless the user explicitly overrides.

---

## Color Tokens

There are two themes: **Paper** (default — warm cream and brown) and **Whisp** (neutral grayscale). Both have light and dark modes. Use **Paper** unless the user or context calls for Whisp. Tokens are split into two categories: **content** (text and icons) and **surface** (backgrounds, fills, strokes, outlines, containers). Token names are identical across themes — only the values change.

---

### Content Tokens
*Used for text and icons only.*

| Token | Paper Light | Paper Dark | Whisp Light | Whisp Dark |
|---|---|---|---|---|
| `content-primary` | `#120F08` | `#F9F4EB` | `#1A1A1A` | `#E5E5E5` |
| `content-secondary` | `#6B6861` | `#9E9B94` | `#666666` | `#999999` |
| `content-inverse-primary` | `#F9F4EB` | `#120F08` | `#E5E5E5` | `#1A1A1A` |
| `content-inverse-secondary` | `#9E9B94` | `#6B6861` | `#999999` | `#666666` |
| `content-disabled` | `#B6B4AF` | `#504E49` | `#B2B2B2` | `#4D4D4D` |
| `content-inverse-disabled` | `#504E49` | `#B6B4AF` | `#4D4D4D` | `#B2B2B2` |
| `content-brand` | `#0021CC` | `#3354FF` | `#0021CC` | `#3354FF` |
| `content-brand-secondary` | `#7A85B8` | `#7A85B8` | `#7A85B8` | `#7A85B8` |
| `content-brand-contrast` | `#F9F4EB` | `#F9F4EB` | `#E5E5E5` | `#E5E5E5` |
| `content-brand-contrast-secondary` | `#9CA3C9` | `#9CA3C9` | `#9CA3C9` | `#9CA3C9` |
| `content-complimentary` | `#B88114` | `#B88114` | `#B88114` | `#B88114` |
| `content-warning` | `#B85814` | `#B85814` | `#B85814` | `#B85814` |
| `content-negative` | `#B82214` | `#B82214` | `#B82214` | `#B82214` |
| `content-positive` | `#0F8A38` | `#0F8A38` | `#0F8A38` | `#0F8A38` |

---

### Surface Tokens
*Used for backgrounds, container fills, strokes, and outlines.*

**Surface hierarchy:** `surface-primary` is the default canvas background. `surface-highlight` sits above the canvas and is reserved for elevated elements — active dropdown menus, chat input fields, and emphasis surfaces. It is used sparingly.

| Token | Paper Light | Paper Dark | Whisp Light | Whisp Dark |
|---|---|---|---|---|
| `surface-highlight` | `#FBF9F4` | `#080603` | `#FFFFFF` | `#000000` |
| `surface-primary` | `#F9F4EB` | `#130F06` | `#FAFAFA` | `#1A1A1A` |
| `surface-secondary` | `#EEE8DD` | `#201C13` | `#F0F0F0` | `#262626` |
| `surface-tertiary` | `#E2DCCF` | `#30291D` | `#E0E0E0` | `#333333` |
| `surface-inverse-primary` | `#120F08` | `#F9F4EB` | `#1A1A1A` | `#FAFAFA` |
| `surface-inverse-secondary` | `#1F1B14` | `#F0E9DB` | `#262626` | `#F0F0F0` |
| `surface-brand-primary` | `#0021CC` | `#0021CC` | `#0021CC` | `#0021CC` |
| `surface-brand-secondary` | `#D9DDF2` | `#131939` | `#D9DDF2` | `#131939` |
| `surface-complimentary-primary` | `#E5A119` | `#E5A119` | `#E5A119` | `#E5A119` |
| `surface-complimentary-secondary` | `#F5EBD6` | `#F5EBD6` | `#F5EBD6` | `#F5EBD6` |
| `surface-warning-primary` | `#CF6317` | `#CF6317` | `#CF6317` | `#CF6317` |
| `surface-warning-secondary` | `#F5E3D6` | `#F5E3D6` | `#F5E3D6` | `#F5E3D6` |
| `surface-negative-primary` | `#CF2617` | `#CF2617` | `#CF2617` | `#CF2617` |
| `surface-negative-secondary` | `#F5D9D6` | `#F5D9D6` | `#F5D9D6` | `#F5D9D6` |
| `surface-positive-primary` | `#14B84B` | `#14B84B` | `#14B84B` | `#14B84B` |
| `surface-positive-secondary` | `#D6F5E0` | `#D6F5E0` | `#D6F5E0` | `#D6F5E0` |

---

### Emotion Tokens
*Used exclusively for emotion-tagged data in interview/research contexts. Not for general UI. Shared across both themes.*

All emotion secondary tokens are 10% opacity in both light and dark mode.

| Token | Light & Dark |
|-------|-------------|
| `emotion-anger-primary` | `#BF4040` |
| `emotion-anger-secondary` | `rgba(191, 64, 64, 0.10)` |
| `emotion-happiness-primary` | `#D99E26` |
| `emotion-happiness-secondary` | `rgba(217, 158, 38, 0.10)` |
| `emotion-disgust-primary` | `#80BF40` |
| `emotion-disgust-secondary` | `rgba(128, 191, 64, 0.10)` |
| `emotion-surprise-primary` | `#40BFAA` |
| `emotion-surprise-secondary` | `rgba(64, 191, 170, 0.10)` |
| `emotion-sadness-primary` | `#406ABF` |
| `emotion-sadness-secondary` | `rgba(64, 106, 191, 0.10)` |
| `emotion-fear-primary` | `#9540BF` |
| `emotion-fear-secondary` | `rgba(149, 64, 191, 0.10)` |

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

#### Paper
```css
/* Paper - Light */
--content-primary: #120F08;
--content-secondary: #6B6861;
--content-inverse-primary: #F9F4EB;
--content-inverse-secondary: #9E9B94;
--content-disabled: #B6B4AF;
--content-inverse-disabled: #504E49;
--content-brand: #0021CC;
--content-brand-secondary: #7A85B8;
--content-brand-contrast: #F9F4EB;
--content-brand-contrast-secondary: #9CA3C9;
--content-complimentary: #B88114;
--content-warning: #B85814;
--content-negative: #B82214;
--content-positive: #0F8A38;

--surface-highlight: #FBF9F4;
--surface-primary: #F9F4EB;
--surface-secondary: #EEE8DD;
--surface-tertiary: #E2DCCF;
--surface-inverse-primary: #120F08;
--surface-inverse-secondary: #1F1B14;
--surface-brand-primary: #0021CC;
--surface-brand-secondary: #D9DDF2;
--surface-complimentary-primary: #E5A119;
--surface-complimentary-secondary: #F5EBD6;
--surface-warning-primary: #CF6317;
--surface-warning-secondary: #F5E3D6;
--surface-negative-primary: #CF2617;
--surface-negative-secondary: #F5D9D6;
--surface-positive-primary: #14B84B;
--surface-positive-secondary: #D6F5E0;

/* Emotion tokens */
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

/* Paper - Dark */
--content-primary: #F9F4EB;
--content-secondary: #9E9B94;
--content-inverse-primary: #120F08;
--content-inverse-secondary: #6B6861;
--content-disabled: #504E49;
--content-inverse-disabled: #B6B4AF;
--content-brand: #3354FF;

--surface-highlight: #080603;
--surface-primary: #130F06;
--surface-secondary: #201C13;
--surface-tertiary: #30291D;
--surface-inverse-primary: #F9F4EB;
--surface-inverse-secondary: #F0E9DB;
--surface-brand-secondary: #131939;
```

#### Whisp
```css
/* Whisp - Light */
--content-primary: #1A1A1A;
--content-secondary: #666666;
--content-inverse-primary: #E5E5E5;
--content-inverse-secondary: #999999;
--content-disabled: #B2B2B2;
--content-inverse-disabled: #4D4D4D;
--content-brand: #0021CC;
--content-brand-secondary: #7A85B8;
--content-brand-contrast: #E5E5E5;
--content-brand-contrast-secondary: #9CA3C9;
--content-complimentary: #B88114;
--content-warning: #B85814;
--content-negative: #B82214;
--content-positive: #0F8A38;

--surface-highlight: #FFFFFF;
--surface-primary: #FAFAFA;
--surface-secondary: #F0F0F0;
--surface-tertiary: #E0E0E0;
--surface-inverse-primary: #1A1A1A;
--surface-inverse-secondary: #262626;
--surface-brand-primary: #0021CC;
--surface-brand-secondary: #D9DDF2;
--surface-complimentary-primary: #E5A119;
--surface-complimentary-secondary: #F5EBD6;
--surface-warning-primary: #CF6317;
--surface-warning-secondary: #F5E3D6;
--surface-negative-primary: #CF2617;
--surface-negative-secondary: #F5D9D6;
--surface-positive-primary: #14B84B;
--surface-positive-secondary: #D6F5E0;

/* Emotion tokens */
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

/* Whisp - Dark */
--content-primary: #E5E5E5;
--content-secondary: #999999;
--content-inverse-primary: #1A1A1A;
--content-inverse-secondary: #666666;
--content-disabled: #4D4D4D;
--content-inverse-disabled: #B2B2B2;
--content-brand: #3354FF;

--surface-highlight: #000000;
--surface-primary: #1A1A1A;
--surface-secondary: #262626;
--surface-tertiary: #333333;
--surface-inverse-primary: #FAFAFA;
--surface-inverse-secondary: #F0F0F0;
--surface-brand-secondary: #131939;
```

---

## Typography

- **Font**: Inter only — loaded from Google Fonts (`https://fonts.googleapis.com/css2?family=Inter&display=swap`). Never use any other typeface. Serif fonts are strictly prohibited — this includes Georgia, Times New Roman, Playfair Display, and any other serif or slab-serif typeface, whether system-default or explicitly set.
- **Weight**: 400 (Regular only — never bold, never thin/light). This applies to every element without exception: headings, labels, body copy, captions, buttons, and any other text.
- **Letter spacing**: **Never add letter-spacing as a style.** Use default browser/system letter-spacing at all times. This is a hard brand rule.
- **Size**: Scale freely — large display type is encouraged for impact. Small type for secondary info is fine.
- **Type scale**: Use only these sizes (px): `6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128` — never pick an arbitrary size outside this scale.
- **Case**: Standard sentence/title case for headlines and body. Title Case is used for the project header (Listen Labs / Title) and sparse metadata labels. **Never use all caps under any circumstances** — not for headings, labels, metadata, tags, buttons, headers, or any other element. This is a hard rule with no exceptions.

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
Listen Labs / Project Title
```

Rules:
- Positioned **top center**, **24px from top from the top**
- Title Case always
- `Listen Labs /` is in **secondary content color**
- `Project Title` is in **primary content color**
- Both use the same font size — **default is 12px** for standalone pages, features, slides, tools, and artifacts. Only deviate if the context clearly calls for a larger display treatment.
- No letter-spacing added
- Single line, space-separated with a `/` divider

HTML example:
```html
<div style="text-align:center; position:absolute; top:24px; left:0; right:0; font-family:'Inter',sans-serif; font-weight:400; font-size:12px;">
  <span style="color: var(--content-secondary)">Listen Labs /</span>
  <span style="color: var(--content-primary)"> Project Title</span>
</div>
```

---

## Art Direction

Listen Labs designs simulate the sensibility of **Dieter Rams** — the German industrial designer whose work defined what it means for something to be both beautiful and inevitable. When making any layout or composition decision, ask: *what would he remove, and what would he leave?*

### Core POV

- **Radical reduction.** strip down until removing one more thing would break comprehension
- **Stillness.** white space is load-bearing, not leftover
- **Neutral confidence.** the design doesn't try to impress, it simply works
- **Scale contrast is the primary compositional tool.** not color, not decoration
- **One dominant element per composition.** everything else is subordinate
- **Grid discipline.** nothing floats arbitrarily
- **Functional hierarchy.** most important = most visually dominant

### The Listen Labs Feel
- **Minimal editorial** — lots of breathing room
- **Technical precision** — clean alignment, deliberate spacing
- **Bold simplicity** — big shapes, large type, graphic confidence
- **Warm, not cold** — warm off-white canvas and near-black text

### What to Avoid
- Drop shadows or heavy depth effects
- Rounded, bubbly UI
- Bright/saturated accent colors beyond #0021CC
- Bold or light font weights
- Letter-spacing overrides
- Cluttered layouts
- Generic or decorative imagery
- Odd numbers for spacing or sizing
- Arbitrary border radius values outside the scale
- Multiple competing focal points
- Decorative elements that don't carry meaning

---

## Spacing & Sizing System

All spacing, sizing, and layout values use **even numbers only**, building up from a **4px base unit**. Odd numbers are avoided across the entire system.

- **Responsive rule**: All elements must flex horizontally without skewing or scaling improperly — circles stay circular, squares stay square, aspect-locked shapes never distort regardless of container width.
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

Button default: 8px. Concentric nesting: inner element radius < container radius (e.g., 8px inner → 12px or 16px container).

---

## Icons

- **Library**: Lucide only
- **Principle**: Icon line weight should visually match the weight of nearby typography (Inter Regular).
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

- icon size ≈ text size + 2px, stroke ≈ scaled proportionally from 0.75px (at 8px text) to 2px (at 24px text)
- Icons use the same color as accompanying text (primary or secondary content color).

---

## Data Visualization

### Chart Types
- **Preferred**: bar, line — Bar and line charts work for almost anything and are very flexible. Default to these unless the data specifically demands another format.
- **Bar chart rules**: 2px rounded corners on bar sections. 1px padding gap between bars that are in-line with each other.

### Color Usage
- **Monochromatic by default. Use the primary brand color (#0021CC) as the base, then increase or decrease the Lightness (HSL) to produce additional shades for multi-series data.**
- Adjust L value in HSL while keeping H and S constant for a cohesive, monochromatic palette. Prefer fewer distinct hues — lean on lightness variation before introducing new colors.

### Stroke Weight
- **1px consistent stroke on all chart elements — axes, grid lines, data lines, borders**
- Opt for fewer lines rather than more. Minimalism without sacrificing function — remove any line that doesn't aid comprehension.

### Emotion Color Mapping
Emotion color tokens are exclusively reserved for the 6 core Ekman emotions (anger, happiness, disgust, surprise, sadness, fear). Never use emotion tokens for general data series, categories, or any purpose outside of Listen Labs emotional intelligence features.

Reserved tokens:
- `emotion-anger-primary / secondary`
- `emotion-happiness-primary / secondary`
- `emotion-disgust-primary / secondary`
- `emotion-surprise-primary / secondary`
- `emotion-sadness-primary / secondary`
- `emotion-fear-primary / secondary`

### General Rules
- Use even-number spacing values consistent with the brand spacing system (4px base unit).
- Labels and annotations follow brand typography rules — Inter Regular 400, no letter-spacing overrides.
- Grid lines use content-disabled to stay subordinate to data.
- One dominant data story per chart — avoid overloading a single visualization with competing narratives.

---

## Medium-Specific Notes

### HTML / Web Artifacts
- Import Inter via Google Fonts in `<head>`
- Use CSS variables for all colors
- Default to light mode; add dark mode via `prefers-color-scheme` or a toggle if relevant
- Use `surface-primary` as the default canvas background
- `surface-highlight` reserved for elevated elements (dropdowns, inputs, emphasis)

*All values below reference the default theme (Paper). For Whisp, see the Color Tokens section above.*

### Canvas / Visualizations
- Background fill: `#F9F4EB` (light) or `#130F06` (dark) — i.e. `surface-primary`
- Draw text using Inter where possible (load as web font or use system fallback)
- Use `#0021CC` sparingly for highlighted data points or accents
- **Multi-series data using brand blue**: when `#0021CC` is used to fill data objects (bars, pie slices, lines, etc.), additional data series can use the same blue at descending opacity stops rather than introducing new colors. Choose stops that are visually distinct — e.g. 100%, 60%, 30% for three series, or 100%, 70%, 45%, 20% for four. Avoid stops so close together they're hard to tell apart.

### Presentations (PPTX)
- Slide background: `#F9F4EB` (`surface-primary`)
- Primary text: `#120F08`
- Accent: `#0021CC` for key callouts only
- Use Inter throughout; Regular weight only; never serif, never bold
- Header slide: large title in title case, centered, branded header convention at top

### Word Documents (DOCX)
- Page background or header area should evoke the default theme palette
- Inter Regular throughout; never serif, never bold
- Use `#0021CC` for links or key highlights only

---

## Quick Reference

| Property | Value |
|----------|-------|
| Default theme | Paper |
| Available themes | Paper, Whisp |
| Canvas / default bg (light) | `#F9F4EB` (surface-primary) |
| Canvas / default bg (dark) | `#130F06` (surface-primary) |
| Surface highlight (light) | `#FBF9F4` — elevated elements only |
| Surface highlight (dark) | `#080603` — elevated elements only |
| Content primary (light) | `#120F08` |
| Content primary (dark) | `#F9F4EB` |
| Content secondary (light) | `#6B6861` |
| Content secondary (dark) | `#9E9B94` |
| Content disabled (light) | `#B6B4AF` |
| Content disabled (dark) | `#504E49` |
| Brand (light) | `#0021CC` |
| Brand (dark) | `#3354FF` |
| Font | Inter only, 400 Regular only — never serif, never bold |
| Letter spacing | Default (never override) |
| Text case | Sentence or title case only — never all caps |
| Spacing unit | 4px base, even numbers only |
| Component heights | 12px, 16px, 20px, 24px, 32px |
| Border radius | 0, 2, 4, 8, 12, 16px — button default 8px |
| Shadows | None |
| Header format | `Listen Labs / Title` — top center, 24px from top, title case |
