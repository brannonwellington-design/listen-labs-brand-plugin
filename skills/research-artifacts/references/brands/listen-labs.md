# Listen Labs — brand file (default brand)

<!-- GENERATED FILE — do not edit by hand.
     Source: brand_data.py at the repo root. Regenerate with `python3 generate_brand_file.py`
     (the pre-commit hook does this automatically when brand_data.py changes). -->

> Answers the contract in `_contract.md`. Fields map 1:1; voice section at the bottom.

> **Source: `brand_data.py` (the same data the Listen Labs brand MCP serves) · Snapshot: 2026-07-14.**
> This file is regenerated from the repo's single source of truth, so it matches `get_full_guidelines` exactly.
> If the brand MCP is connected, you may still call it to confirm live values. Copy values verbatim, never approximate.

## Themes

Two themes. `paper` (warm cream/brown) is the default for all deliverables. `whisp` (neutral grayscale) only on explicit request. Each has light and dark modes; light is default.

## Core CSS — paste this block into every artifact

```css
/* ===== Listen Labs tokens — Paper theme, light mode (DEFAULT) ===== */
:root {
  /* Content */
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

  /* Surface */
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

  /* Emotion tokens — RESERVED for the 6 Ekman emotions only */
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
}

body {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  color: var(--content-primary);
  background: var(--surface-primary);
  /* never add letter-spacing */
}
```

Font import (put in `<head>`):
```html
<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
```

## Paper theme — dark mode overrides

```css
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
(All tokens not listed keep their light-mode values.)

## Whisp theme (on request only)

Light: `--content-primary:#1A1A1A; --content-secondary:#666666; --content-inverse-primary:#E5E5E5; --content-inverse-secondary:#999999; --content-disabled:#B2B2B2; --content-inverse-disabled:#4D4D4D; --content-brand-contrast:#E5E5E5; --surface-highlight:#FFFFFF; --surface-primary:#FAFAFA; --surface-secondary:#F0F0F0; --surface-tertiary:#E0E0E0; --surface-inverse-primary:#1A1A1A; --surface-inverse-secondary:#262626;` — brand/emotion/status tokens identical to paper.
Dark: `--content-primary:#E5E5E5; --content-secondary:#999999; --content-inverse-primary:#1A1A1A; --content-inverse-secondary:#666666; --content-disabled:#4D4D4D; --content-inverse-disabled:#B2B2B2; --content-brand-contrast:#E5E5E5; --surface-highlight:#000000; --surface-primary:#1A1A1A; --surface-secondary:#262626; --surface-tertiary:#333333; --surface-inverse-primary:#FAFAFA; --surface-inverse-secondary:#F0F0F0;`

## Typography

- Family: **Inter**. Weight: **400 (Regular only — never bold, never thin/light)**.
- Letter-spacing: **Default only — never override letter-spacing**.
- Type scale (px): 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128. Pick from the scale; don't invent sizes.
- Case: Standard sentence/title case for headlines and body. Title Case is used for the project header (Listen Labs / Title) and sparse metadata labels.
- Hierarchy = size jumps + color (primary vs secondary) + placement. Big numerals for key stats is the signature move.

## Spacing & shape

- Base unit **4px**; All spacing, sizing, and layout values use even numbers only. Minimum 4px, maximum common 96px.
- Component heights: XL 32px, L 24px, M 20px, S 16px, XS 12px.
- Border radius scale: **0, 2, 4, 8, 12, 16**. Button default: 8px. Concentric nesting: inner element radius < container radius (e.g., 8px inner → 12px or 16px container).
- Grid presets: presentation 1920×1080 → 12 col / 40px margins / 40px gutters; desktop website → 12 / 24 / 24; desktop product → 12 / 16 / 16; mobile → 4 / 16 / 16.
- Responsive: All elements must flex horizontally without skewing or scaling improperly — circles stay circular, squares stay square, aspect-locked shapes never distort regardless of container width.

## Icons

Lucide only, inline SVG, colored same as accompanying text. Icon line weight should visually match the weight of nearby typography (Inter Regular).

| Text size | Icon size | Stroke |
|---|---|---|
| 8px | 10×10 | 0.75px |
| 10px | 12×12 | 1px |
| 12px | 14×14 | 1px |
| 14px | 16×16 | 1.25px |
| 16px | 18×18 | 1.25px |
| 18px | 20×20 | 1.5px |
| 20px | 22×22 | 1.75px |
| 24px+ | 24×24 | 2px |

Interpolation: icon size ≈ text size + 2px, stroke ≈ scaled proportionally from 0.75px (at 8px text) to 2px (at 24px text).

## Header convention

```html
<div style="text-align:center; position:absolute; top:24px; left:0; right:0; font-family:'Inter',sans-serif; font-weight:400; font-size:12px;">
  <span style="color: var(--content-secondary)">Listen Labs /</span>
  <span style="color: var(--content-primary)"> Project Title</span>
</div>
```
Title Case always, both parts same size (12px default), top center, 24px from top. Both parts use the same font size. Default 12px for standalone pages/artifacts. Single line, space-separated with / divider. No letter-spacing.

**Where it appears:** Standalone artifacts and documents that leave the product: HTML files, PDFs, posters, decks, exported images. OMIT it inside the Listen Labs product canvas — the product chrome already carries the brand, and a second credit line reads as a watermark. Websites use the wordmark in the navigation instead of the credit line.

## Data-viz palette tokens

Two interchangeable modes with IDENTICAL token names. Default is **brand** (monochromatic blue — lightness varies, hue and saturation never do). Switch to **global** (Okabe-Ito categorical / Viridis sequential / ColorBrewer RdBu diverging — all CVD-safe) when >5 distinct categories are needed or the user wants brand-agnostic best practices. Swap via `data-dataviz-palette="brand|global"` on any chart ancestor.

- Brand mode: Monochromatic brand-blue. Default palette. Use when the chart is presented as Listen Labs branded content. Practical cap is 5 categorical series; past that, slots 6–8 fall back to neutral grays as a soft signal to switch to 'global' mode.
- Global mode: Brand-agnostic, best-practices palette. Categorical = Okabe-Ito 8 (academic CVD-safe standard). Sequential = Viridis 7-stop (perceptually uniform). Diverging = ColorBrewer RdBu 7 (CVD-safe). Use when the chart should follow data-viz best practices independent of brand identity.

```css
/* Data-viz palette tokens — brand mode (default) */
:root,
[data-dataviz-palette="brand"] {
  --dataviz-categorical-1: hsl(229, 100%, 40%);
  --dataviz-categorical-2: hsl(229, 100%, 60%);
  --dataviz-categorical-3: hsl(229, 100%, 25%);
  --dataviz-categorical-4: hsl(229, 100%, 78%);
  --dataviz-categorical-5: hsl(229, 100%, 50%);
  --dataviz-categorical-6: #525252;
  --dataviz-categorical-7: #8D8D8D;
  --dataviz-categorical-8: #C6C6C6;
  --dataviz-sequential-100: hsl(229, 100%, 92%);
  --dataviz-sequential-200: hsl(229, 100%, 82%);
  --dataviz-sequential-300: hsl(229, 100%, 70%);
  --dataviz-sequential-400: hsl(229, 100%, 55%);
  --dataviz-sequential-500: hsl(229, 100%, 40%);
  --dataviz-sequential-600: hsl(229, 100%, 28%);
  --dataviz-sequential-700: hsl(229, 100%, 18%);
  --dataviz-diverging-neg-3: hsl(27, 100%, 42%);
  --dataviz-diverging-neg-2: hsl(27, 100%, 62%);
  --dataviz-diverging-neg-1: hsl(27, 75%, 86%);
  --dataviz-diverging-zero: #F5F5F5;
  --dataviz-diverging-pos-1: hsl(229, 75%, 86%);
  --dataviz-diverging-pos-2: hsl(229, 100%, 62%);
  --dataviz-diverging-pos-3: #0021CC;
  --dataviz-highlight-accent: #0021CC;
  --dataviz-highlight-neutral-1: #525252;
  --dataviz-highlight-neutral-2: #8D8D8D;
  --dataviz-highlight-neutral-3: #C6C6C6;
  --dataviz-semantic-positive: #0F8A38;
  --dataviz-semantic-negative: #B82214;
  --dataviz-semantic-neutral: #8D8D8D;
}

/* Data-viz palette tokens — global (best-practices) mode */
[data-dataviz-palette="global"] {
  --dataviz-categorical-1: #0072B2;
  --dataviz-categorical-2: #E69F00;
  --dataviz-categorical-3: #009E73;
  --dataviz-categorical-4: #CC79A7;
  --dataviz-categorical-5: #56B4E9;
  --dataviz-categorical-6: #D55E00;
  --dataviz-categorical-7: #F0E442;
  --dataviz-categorical-8: #000000;
  --dataviz-sequential-100: #440154;
  --dataviz-sequential-200: #443A83;
  --dataviz-sequential-300: #31688E;
  --dataviz-sequential-400: #21908C;
  --dataviz-sequential-500: #35B779;
  --dataviz-sequential-600: #8FD744;
  --dataviz-sequential-700: #FDE725;
  --dataviz-diverging-neg-3: #B2182B;
  --dataviz-diverging-neg-2: #EF8A62;
  --dataviz-diverging-neg-1: #FDDBC7;
  --dataviz-diverging-zero: #F7F7F7;
  --dataviz-diverging-pos-1: #D1E5F0;
  --dataviz-diverging-pos-2: #67A9CF;
  --dataviz-diverging-pos-3: #2166AC;
  --dataviz-highlight-accent: #0072B2;
  --dataviz-highlight-neutral-1: #525252;
  --dataviz-highlight-neutral-2: #8D8D8D;
  --dataviz-highlight-neutral-3: #C6C6C6;
  --dataviz-semantic-positive: #0F8A38;
  --dataviz-semantic-negative: #B82214;
  --dataviz-semantic-neutral: #8D8D8D;
}
```

### Palette rules

- Brand mode practical cap: **5 categorical series** (slots 6–8 degrade to neutral grays as a soft signal to switch to global mode).
- Soft max 7 categories (beyond that: direct data labels, not legend lookup). Hard max 10 (beyond: roll up to "Other").
- For 5+ series or any line chart with multiple lines, encode redundantly: line-style (solid/dashed/dotted) + marker shape (circle/triangle/square) in addition to color. Never rely on color alone (WCAG 1.4.1).
- Contrast: All categorical colors must hit ≥3:1 against the chart background; data labels must hit ≥4.5:1.
- Never use red/green for diverging data. Default RdBu (global) and vermillion/blue (brand) are both CVD-safe.
- Grayscale check: Adjacent palette stops must differ by ≥20% luminance when desaturated. Both shipped palettes pass; verify when extending.
- Emotion tokens (--emotion-*) remain reserved for the 6 Ekman emotions and are independent of the brand/global palette mode.
- Construction rule for extending brand mode: Adjust L value in HSL while keeping H and S constant for a cohesive, monochromatic palette. Prefer fewer distinct hues — lean on lightness variation before introducing new colors.

## Chart primitives

- Bar corner radius: 2px rounded corners on bar sections; 1px padding gap between bars that are in-line with each other.
- Line weights: 1px consistent stroke on all chart elements — axes, grid lines, data lines, borders; the story line may be 2px. Opt for fewer lines rather than more. Minimalism without sacrificing function — remove any line that doesn't aid comprehension.
- Grid-line token: --content-disabled, horizontal only unless both axes continuous.
- Preferred chart types: bar, line. Bar and line charts work for almost anything and are very flexible. Default to these unless the data specifically demands another format.

## Strokes (general)

1px everywhere — dividers, diagram edges, borders. Heavier weight is never emphasis; emphasis comes from scale and color role.

## Emotion tokens (product module)

Emotion color tokens are exclusively reserved for the 6 core Ekman emotions (anger, happiness, disgust, surprise, sadness, fear). Never use emotion tokens for general data series, categories, or any purpose outside of Listen Labs emotional intelligence features. Emotion tokens are orthogonal to the brand/global palette modes.

| Emotion | Primary | Secondary (10% wash) |
|---|---|---|
| Anger | `--emotion-anger-primary` (`#BF4040`) | `--emotion-anger-secondary` |
| Happiness | `--emotion-happiness-primary` (`#D99E26`) | `--emotion-happiness-secondary` |
| Disgust | `--emotion-disgust-primary` (`#80BF40`) | `--emotion-disgust-secondary` |
| Surprise | `--emotion-surprise-primary` (`#40BFAA`) | `--emotion-surprise-secondary` |
| Sadness | `--emotion-sadness-primary` (`#406ABF`) | `--emotion-sadness-secondary` |
| Fear | `--emotion-fear-primary` (`#9540BF`) | `--emotion-fear-secondary` |

## Art direction (voice)

- Philosophy: Dieter Rams — less, but better. Every element must earn its place.
- Core principles:
  - Radical reduction — strip down until removing one more thing would break comprehension
  - Stillness — white space is load-bearing, not leftover
  - Neutral confidence — the design doesn't try to impress, it simply works
  - Scale contrast is the primary compositional tool — not color, not decoration
  - One dominant element per composition — everything else is subordinate
  - Grid discipline — nothing floats arbitrarily
  - Functional hierarchy — most important = most visually dominant
- The feel: minimal editorial · technical precision · bold simplicity · warm, not cold.
- Typography voice: Inter 400 ONLY — never bold, never light. Hierarchy by SIZE, color role, and position, never weight. Never override letter-spacing. Sentence case; Title Case only for the header and sparse metadata labels. Big numerals for key stats is the signature move.
- Avoid list (each instantly reads as off-brand): drop shadows or heavy depth effects; rounded, bubbly UI; bright/saturated accent colors beyond #0021CC; bold or light font weights; letter-spacing overrides; cluttered layouts; generic or decorative imagery; odd numbers for spacing or sizing; arbitrary border radius values outside the scale; multiple competing focal points; decorative elements that don't carry meaning.

## Precision & hygiene (Listen Labs house rules)

The brand-independent typographic precision rules (curly quotes, `…`, non-breaking value/unit spaces, `tabular-nums`, `text-wrap: balance` / `pretty`) and the web-output hygiene rules (`color-scheme`, `theme-color`, `:focus-visible`, `prefers-reduced-motion`, 44px touch targets, no hover-only states, scrollable tables) live in `skills/_shared/brand-compliance.md`. Apply them to every Listen Labs artifact; they are also sound defaults for any other brand unless that brand's file says otherwise.
