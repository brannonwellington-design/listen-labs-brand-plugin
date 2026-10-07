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
  font-family: 'Inter', 'Helvetica Neue', Arial, system-ui, sans-serif; /* metric-compatible fallbacks: layout must not depend on the webfont */
  font-weight: 400;
  /* never add letter-spacing */
}
```

---

## Logo

Files live in `assets/` at the plugin root (SVG + PNG, plus `-white` twins for dark surfaces). Default: **listen-labs-logo.svg** (the full lockup). Call `get_logo` on the brand MCP for ready-to-inline markup.

| Variant | File | Min height | Use |
| --- | --- | --- | --- |
| lockup | `listen-labs-logo.svg` | 20px | Mark + the full “Listen Labs” wordmark. The default everywhere the brand is named: nav, footers, covers, decks, exports. |
| lockup-short | `listen-labs-logo-short.svg` | 20px | Mark + “Listen”. Only when the full lockup would drop below its minimum height (narrow nav on phones, compact toolbars, tiny stages). |
| wordmark-short | `listen-labs-wordmark-short.svg` | 18px | The “Listen” wordmark alone, no mark. Rare: only beside another instance of the mark, or in a lockup with a partner brand. |
| mark | `listen-labs-mark.svg` | 16px | The mark alone. Favicons, avatars, app icons, social thumbnails, and anywhere the name is already written next to it. |

Rules:
- Default to the full lockup. Step down to the short lockup only when the full one cannot meet its minimum height; use the mark alone only where the name is redundant or the space is square.
- In HTML, inline the SVG markup from assets/ and set fill="currentColor" on its paths so it follows the theme (content-primary on light, inverse on dark bands). Never link to the file path or a URL from an artifact.
- Use the -white files only where currentColor is impossible: PNG in decks and email, or an SVG placed on a fixed dark surface.
- Clear space on every side equals the height of the mark (the square-and-curve glyph); nothing else enters it.
- Never recolor the logo brand blue or any other color, never stretch, rotate, outline, add a shadow, or place it on a busy surface; on photography use the mark on a solid surface tile.
- Websites and product surfaces use the lockup in the navigation; standalone artifacts and documents use the text credit line (Listen Labs / Title); never both on the same page.

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
- **Where it appears:** Standalone artifacts and documents that leave the product: HTML files, PDFs, posters, decks, exported images. OMIT it inside the Listen Labs product canvas — the product chrome already carries the brand, and a second credit line reads as a watermark. Websites use the logo lockup in the navigation instead of the credit line.

HTML example:
```html
<header class="ll-header">
  <span class="ll-brand">Listen Labs /</span>
  <span class="ll-title">Project Title</span>
</header>
<style>
  .ll-header { position: absolute; top: 24px; left: 0; right: 0; text-align: center; font-size: 12px; line-height: 16px; }
  .ll-brand { color: var(--content-secondary); }
  .ll-title { color: var(--content-primary); }
</style>
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

### Palette Modes (data-viz only)

Two interchangeable palettes share the same `--dataviz-*` token namespace. Token NAMES are identical across modes; only resolved values differ. Charts swap by setting `data-dataviz-palette="brand|global"` on any ancestor (typically `<main>`). Default is `brand` — charts that don't set the attribute behave exactly as they did before this addition.

| Mode | Categorical | Sequential | Diverging | When to use |
|---|---|---|---|---|
| `brand` (default) | Monochromatic brand-blue (HSL 229° / 100%, vary L only) | Brand-blue ramp (light → dark) | Vermillion (`#D55E00`) ↔ brand-blue | Listen Labs branded outputs; ≤5 categorical series |
| `global` | Okabe-Ito 8 (CVD-safe academic standard) | Viridis 7-stop (perceptually uniform) | ColorBrewer RdBu 7 (CVD-safe) | Brand-agnostic outputs; ≥6 categorical series; accessibility-first contexts |

Token namespace (same in both modes): `--dataviz-categorical-{1..8}`, `--dataviz-sequential-{100..700}`, `--dataviz-diverging-{neg-3, neg-2, neg-1, zero, pos-1, pos-2, pos-3}`, `--dataviz-highlight-{accent, neutral-1, neutral-2, neutral-3}`, `--dataviz-semantic-{positive, negative, neutral}`. Emotion tokens (`--emotion-*`) remain reserved for the 6 Ekman emotions and are orthogonal to palette mode.

Constraints: soft cap **7** categorical series; hard cap **8** (roll up to "Other" beyond). Brand mode practical cap is 5 — slots 6–8 fall back to neutral grays as a soft signal to switch to `global`. For 5+ series or any multi-line chart, encode redundantly (line-style + marker shape, not just color). Never red/green diverging — both shipped diverging palettes are CVD-safe.

### Stroke Weight
- **1px consistent stroke on all chart elements — axes, grid lines, data lines, borders**
- Opt for fewer lines rather than more. Minimalism without sacrificing function — remove any line that doesn't aid comprehension.

### Emotion Color Mapping
Emotion color tokens are exclusively reserved for the 6 core Ekman emotions (anger, happiness, disgust, surprise, sadness, fear). Never use emotion tokens for general data series, categories, or any purpose outside of Listen Labs emotional intelligence features. Emotion tokens are orthogonal to the brand/global palette modes.

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

## Motion

Motion is information, not decoration. Something moves only to show a change, a sequence, a relationship, or where to look next. If removing the motion loses nothing, remove it.

- **UI (productive):** Subtle and quick. Default is stillness; nothing animates on load, loops, or plays on its own. Used for state changes, reveals, tooltips.
- **Video (expressive):** Visible and choreographed, timed to narration. Still Rams: one orchestrated moment per scene, no ornament.

### Tokens

- UI durations: `instant` 70ms · `quick` 110ms · `short` 150ms · `medium` 240ms · `long` 400ms
- UI easing:
  - `standard`: `cubic-bezier(0.2, 0, 0.38, 0.9)`
  - `enter`: `cubic-bezier(0, 0, 0.38, 0.9)`
  - `exit`: `cubic-bezier(0.2, 0, 1, 0.9)`
- Video durations: `beat` 300ms · `move` 500ms · `scene` 700ms · `build` 1000ms · `count` 1600ms · `draw` 2000ms (snap to whole frames)
- Video easing:
  - `enter`: `cubic-bezier(0.05, 0.7, 0.1, 1)`
  - `exit`: `cubic-bezier(0.3, 0, 0.8, 0.15)`
  - `move`: `cubic-bezier(0.4, 0.14, 0.3, 1)`
  - `settle`: `cubic-bezier(0, 0, 0, 1)`
- Linear: Only for time itself: progress bars, playheads, constant rotation (Fluent).
- No bounce, elastic, back/overshoot, or springs with visible oscillation — in either register. Data never overshoots its true value.

### Choreography

- Animate only transform and opacity (scale, translate, opacity). Never animate width, height, font-size, or layout properties; bars grow by scaleX/scaleY from their baseline origin.
- Entrances ease out (enter), exits ease in (exit), moves between positions use move. Exits run about 75% of the matching entrance.
- A single element's entrance never exceeds 800ms. Bigger travel or size change gets more time, never less (Carbon).
- Stagger by importance, not source order — the first thing to move reads as most important. UI: ≤40ms apart, at most five. Video: 60–100ms apart, whole stagger ≤500ms.
- One thing leads at a time: no two simultaneous motions compete for the eye (staging).
- Scale animations interpolate perceptually (in log space), so growth doesn't appear to decelerate.
- No idle motion — nothing breathes, floats, pulses, glows, or drifts to fill time. Stillness is load-bearing.
- Motion is never the only cue: the final, settled state carries all the information.

### Transitions

| Transition | Duration | Use |
|---|---|---|
| cut | 0 | Default between video scenes. A hard cut re-focuses attention; text out-points land 2 frames before the cut (Netflix). |
| fade | ui medium in / quick out; video beat | An element enters or leaves within a scene (label, annotation, caption). Opacity only. |
| fade-through | video scene (outgoing 0–35%, incoming 35–100%, incoming scales 0.92→1) | Unrelated scenes or a new topic (M3 fade-through). |
| shift | video move | Next step in a sequence: X axis for sequence and time, Y axis for drill-down (M3 shared axis). The exiting direction sets the entering direction. |
| expand | video scene | A mark or card becomes its own detail view — the same entity grows into the next scene (M3 container transform). |
| wipe | video move | Brand signature, reserved for a change of surface (blue ↔ paper light ↔ paper dark) or a chapter break. A circle iris from a meaningful point (the mark that becomes the next scene) or a straight line sweep along one axis, with a 2px leading edge in the incoming content color. |

At most three transition types per video, each used with its one meaning. Under reduced motion every transition becomes a fade.

**Reduced motion.** Every animation has a no-motion path to the same final state: transitions become fades of quick/beat length, counters show their final value, draws appear complete, staggers collapse. UI: respect prefers-reduced-motion. Video: offer a still/settled-frame variant or rely on the player's pause control (WCAG 2.2.2).

### Video

- **Frame rate:** 30fps default; 60fps only when fast motion needs it. Every time is authored in seconds and converted to frames (round), never typed as raw frame numbers.
- **Determinism:** Every frame is a pure function of its time: no CSS transitions/animations, no wall-clock, no unseeded randomness, no network during render, chart-library animations disabled.
- **Canvases:** Design at half the output resolution and render at 2× device scale, so the brand type scale (max 128px) reads at video size and stays on-scale.

| Ratio | Output px | Design px |
|---|---|---|
| 9:16 | 1080×1920 | 540×960 |
| 4:5 | 1080×1350 | 540×676 |
| 1:1 | 1080×1080 | 540×540 |
| 16:9 | 1920×1080 | 960×540 |

- **Type minimums (design px):** display numeral 96px · headline 40px · supporting 24px · label 18px · source note 16px · credit line 16px. Design-canvas px (×2 at output). Picked from the brand type scale. Floors, not targets — scale contrast still leads.
- **Safe zones** (design px, top / right / bottom / left). Inset from each edge on the design canvas. 'clean' = LinkedIn, web embeds, presentations (EBU R95 graphics-safe, 5%, rounded to the 4px grid). 'social' = Reels / Shorts / TikTok, where platform UI covers the frame (union of Meta and YouTube published zones; TikTok publishes templates only). Choose the profile per destination; when unknown, use social on 9:16.

| Ratio | Clean | Social |
|---|---|---|
| 9:16 | 48 / 32 / 48 / 32 | 136 / 96 / 336 / 32 |
| 4:5 | 36 / 32 / 36 / 32 | 36 / 32 / 36 / 32 |
| 1:1 | 32 / 32 / 32 / 32 | 32 / 32 / 32 / 32 |
| 16:9 | 28 / 48 / 28 / 48 | 28 / 48 / 28 / 48 |

- **Pace:** kinetic — Default for short-form (≤60s) and anything without narration: fast cuts, one stat per scene, every scene a different visual form, built to be looped and rewatched. The viewer reads the must-read text (the number and its short line); labels, notes, and supporting lines are glanceable. Explainer — Default for voiced videos of 90s and longer: narration carries the story, scenes hold long enough for every word on screen to be read.
- **Hold time:** kinetic `hold_s = max(1.2, 0.3 + 0.2 × must-read words + 0.3 × numbers). Must-read = the dominant number or claim and its one short line; labels, source notes, and secondary lines don't count. Calibrated on the first Listen Labs short (Seltzer, Oct 2026), which reviewers judged right — not on subtitle research.` Explainer `hold_s = max(1.0, 0.5 + 0.33 × words) + 1.0s per number on screen (+0.5s for a 5+ digit figure). Counts every word on screen.` Measured from when the entrance animation ends, not when it starts. Explainer: hold 0.3–0.75s of stillness before the key reveal. Kinetic: a beat of 0.2–0.3s is enough. Every scene's first motion starts 0.05–0.3s after the cut.
- **Variety:** Never reuse a scene template or chart form within one video of 90s or less (one deliberate bookend excepted); in longer videos, not within the same chapter. Rotate the dominant element (numeral, chart, shape, quote), the layout anchor, and the surface from scene to scene. Two consecutive scenes that look alike read as a stall.
- **Line weight:** One stroke weight for all line art in a video: 2px on the design canvas (4px at output). Reference lines, axes, tracks, stems, arcs, leaders, outline circles, strike-throughs, wipe edges, quote rules — all 2px. Hierarchy between lines comes from color tier (content color for the story, muted for context, grid color for structure), never from weight. Only exception: a mark so small that a 2px stroke would fill it (outline dots under 6px radius) — enlarge the mark rather than thin the line.
- **Edges:** Every horizontal figure spans the content box, left margin to right margin (inside the safe zone): tracks, axes, strike lines, unit grids, rows of shapes. A label column that ends the figure aligns to the margin too (values right-aligned at the right margin). Room for labels is made by moving the labels — above the line, into a right-aligned value column — never by stopping the chart short. Circular and radial forms center on the frame's vertical axis. Anything that stops short of an edge stops at a named grid line on purpose; 'almost full width' is always a bug.
- **Scene structure:** Each scene: build (0–30% of its duration) → breathe (30–70%, settled and readable) → resolve (70–100%, hold or hand off). In explainers, narration fills the breathe phase.
- **Narration:** 2.3–2.5 spoken words per second (≈140–150 wpm); ≈2.0 for dense statistics. Measure real duration from TTS timestamps, never estimate. Voiceover is generated per scene first; each scene lasts as long as its narration plus its hold. Reveals are scheduled on word timestamps (the counter lands as its number is spoken).

| Preset | Pace | Words | Scenes | Avg scene | Ideas | Default transition | Max on-screen words |
|---|---|---|---|---|---|---|---|
| snappy 30s | kinetic | 70 | 10–12 | 2–3s | hook + 8–10 stats or moments, one per scene, + end card | wipe on every surface change, cut otherwise | 6 must-read |
| standard 90s | kinetic or explainer | 210 | 14–24 | 3–6s | hook + 3–5 findings, each with 2–4 supporting scenes + takeaway | cut / shift; wipe on surface change | 8 must-read (kinetic) · 12 (explainer) |
| deep dive 4min | explainer | 540 | 30–45 in 4–6 chapters | 5–8s | method, findings by chapter, segments, verbatims, caveats | cut within chapters, wipe between | 15 |

- **Captions:** ≤42 characters per line; ≤2 lines (≤3 on 9:16); ≤20 characters per second; each caption 0.8–7s on screen; start on speech onset, never more than 2s late; break after punctuation or before conjunctions, never between article and noun. Bottom by default, inside the safe zone, never over chart labels, values, or faces — move to the top when the data sits low. Set in Inter 400 at supporting size, content color on a solid surface band (no shadow, no outline).
- **Audio:** Master to -14 to -16 LUFS integrated, true peak ≤ -1 dBTP for social/web; -23 LUFS (EBU R128) variant for broadcast. Platform targets are not officially published; this is the safe common range. Optional, quiet, unobtrusive. Bed sits roughly 6–12 dB under the voice (ducked whenever narration plays). Music is muted under participant clips. No sound effects as punchlines.
- **Accessibility:**
  - Captions on every video (WCAG 1.2.2) and a transcript alongside (1.2.8).
  - Every number and takeaway that appears on screen is also spoken (integrated audio description, WCAG 1.2.5).
  - Never more than three flashes per second. Flicker of thin lines counts by total area against the 341×256px limit (WCAG 2.3.1) — rapid redraws are designed out, not argued about.
  - Text on video meets 4.5:1 (3:1 at 24px+ design size), same as the web floors.

```css
:root {
  --duration-ui-instant: 70ms;
  --duration-ui-quick: 110ms;
  --duration-ui-short: 150ms;
  --duration-ui-medium: 240ms;
  --duration-ui-long: 400ms;
  --duration-video-beat: 300ms;
  --duration-video-move: 500ms;
  --duration-video-scene: 700ms;
  --duration-video-build: 1000ms;
  --duration-video-count: 1600ms;
  --duration-video-draw: 2000ms;
  --ease-ui-standard: cubic-bezier(0.2, 0, 0.38, 0.9);
  --ease-ui-enter: cubic-bezier(0, 0, 0.38, 0.9);
  --ease-ui-exit: cubic-bezier(0.2, 0, 1, 0.9);
  --ease-video-enter: cubic-bezier(0.05, 0.7, 0.1, 1);
  --ease-video-exit: cubic-bezier(0.3, 0, 0.8, 0.15);
  --ease-video-move: cubic-bezier(0.4, 0.14, 0.3, 1);
  --ease-video-settle: cubic-bezier(0, 0, 0, 1);
}

/* Reduced motion: every transition collapses to a short opacity fade — drop transforms in the component, keep the fade. */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-ui-instant: 110ms;
    --duration-ui-quick: 110ms;
    --duration-ui-short: 110ms;
    --duration-ui-medium: 110ms;
    --duration-ui-long: 110ms;
    --duration-video-beat: 110ms;
    --duration-video-move: 110ms;
    --duration-video-scene: 110ms;
    --duration-video-build: 110ms;
    --duration-video-count: 110ms;
    --duration-video-draw: 110ms;
  }
}
```

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
- **Multi-series data**: use the swappable `--dataviz-*` tokens described in **Palette Modes** above. The `brand` mode (default) renders monochromatic brand-blue shades — practical cap is 5 series; past that, switch to `global` mode (Okabe-Ito categorical, CVD-safe) by setting `data-dataviz-palette="global"` on the chart container. For 5+ series or any multi-line chart, encode redundantly (line-style + marker shape, not color alone).

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
