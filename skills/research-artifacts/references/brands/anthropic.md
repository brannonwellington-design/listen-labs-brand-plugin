# Anthropic — brand file

> Source: Anthropic's official public brand-guidelines skill (github.com/anthropics/skills) — core palette and typography are official; extended tokens, dataviz ramps, and emotion colors are (derived) extrapolations harmonized to that palette. Snapshot: 2026-09-15.

## 1. Themes & color tokens

Single warm theme, light default, with a dark mode built by inverting the official dark/light pair.

```css
:root {
  /* Content — official core: dark #141413, light #faf9f5, mid gray #b0aea5 */
  --content-primary: #141413;
  --content-secondary: #6E6D66;          /* (derived) mid-tone between dark and #b0aea5 for 4.5:1 */
  --content-disabled: #B0AEA5;
  --content-inverse-primary: #FAF9F5;
  --content-inverse-secondary: #B0AEA5;
  --content-brand: #C15F3C;              /* (derived) accent orange deepened for 4.5:1 text contrast */
  --content-brand-secondary: #B0917F;    /* (derived) */
  --content-negative: #A83A2E;           /* (derived, warm red-clay) */
  --content-positive: #5C7048;           /* (derived from green accent) */
  --content-warning: #96692E;            /* (derived) */

  /* Surface — official: light #faf9f5, light gray #e8e6dc */
  --surface-highlight: #FFFFFF;
  --surface-primary: #FAF9F5;
  --surface-secondary: #F0EEE6;          /* (derived) step between primary and light gray */
  --surface-tertiary: #E8E6DC;
  --surface-inverse-primary: #141413;
  --surface-brand-primary: #D97757;      /* official accent orange */
  --surface-brand-secondary: #F1E0D8;    /* (derived) 12% orange wash */
}
```

Dark mode overrides (guard per publishing rules):
```css
--content-primary:#FAF9F5; --content-secondary:#B0AEA5; --content-disabled:#5C5B54;
--content-brand:#E08B6D;
--surface-highlight:#0D0D0C; --surface-primary:#141413; --surface-secondary:#1E1E1C; --surface-tertiary:#2A2A27;
--surface-brand-secondary:#3A2A22;
```

## 2. Typography

- Headings: **Poppins** (fallback Arial, sans-serif). Body: **Lora** (fallback Georgia, serif). Official pairing.
- Import: `https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Lora&display=swap`
- Allowed weights: Lora 400 for body; Poppins 400 for large display, 500–600 for headings ≤32px. Weight IS a permitted hierarchy tool in this brand (unlike Listen Labs).
- Letter-spacing: default; Poppins display >40px may use -0.01em (optical, sparing).
- Case: sentence case throughout; Title Case for the header convention.
- Type scale (px): 10, 12, 14, 16, 18, 21, 24, 28, 32, 40, 48, 56, 64, 80, 96. Body text renders in Lora; UI labels, axes, and metadata in Poppins 400.

## 3. Spacing & shape

- Base unit 4px, even values only, common max 96px.
- Radius scale: 0, 4, 8, 12, 16, 24 (this brand tolerates softer curvature than Listen Labs). Concentric nesting applies.
- Grid presets: presentation 1920×1080 → 12/48/32; desktop → 12/24/24; mobile → 4/16/16.

## 4. Strokes & icons

- Default stroke 1px; story elements may carry 2px. Grid-line token: --content-disabled.
- Icons: Lucide, sized text+2px, stroke 1–2px scaled to text size, colored as accompanying text.

## 5. Header convention

`Anthropic / Project Title` — top center, 24px from top, 12px Poppins 400, "Anthropic /" in --content-secondary, title in --content-primary, Title Case, no letter-spacing.

## 6. Dataviz palettes

Brand mode (derived): built on the official accent trio — orange #D97757 leads, blue #6A9BCC and green #788C5D support; extra slots vary lightness of the orange (hold H≈15, S≈51, vary L).

```css
:root, [data-dataviz-palette="brand"] {
  --dataviz-categorical-1: #D97757;
  --dataviz-categorical-2: #6A9BCC;
  --dataviz-categorical-3: #788C5D;
  --dataviz-categorical-4: hsl(15, 51%, 42%);
  --dataviz-categorical-5: hsl(15, 51%, 76%);
  --dataviz-categorical-6: #5C5B54;
  --dataviz-categorical-7: #8A8980;
  --dataviz-categorical-8: #C4C2B8;
  --dataviz-sequential-100: hsl(15, 55%, 93%);
  --dataviz-sequential-200: hsl(15, 53%, 84%);
  --dataviz-sequential-300: hsl(15, 51%, 72%);
  --dataviz-sequential-400: hsl(15, 51%, 60%);
  --dataviz-sequential-500: hsl(15, 55%, 47%);
  --dataviz-sequential-600: hsl(15, 60%, 35%);
  --dataviz-sequential-700: hsl(15, 62%, 24%);
  --dataviz-diverging-neg-3: hsl(211, 44%, 38%);
  --dataviz-diverging-neg-2: #6A9BCC;
  --dataviz-diverging-neg-1: hsl(211, 40%, 86%);
  --dataviz-diverging-zero: #F0EEE6;
  --dataviz-diverging-pos-1: hsl(15, 51%, 86%);
  --dataviz-diverging-pos-2: #D97757;
  --dataviz-diverging-pos-3: hsl(15, 55%, 40%);
  --dataviz-highlight-accent: #D97757;
  --dataviz-highlight-neutral-1: #5C5B54;
  --dataviz-highlight-neutral-2: #8A8980;
  --dataviz-highlight-neutral-3: #C4C2B8;
  --dataviz-semantic-positive: #5C7048;
  --dataviz-semantic-negative: #A83A2E;
  --dataviz-semantic-neutral: #8A8980;
}
```

Global mode: identical to the standard best-practices block (Okabe-Ito / Viridis / RdBu — see the Listen Labs file §"global mode"; values are brand-independent).

- Categorical cap in brand mode: 5 (orange/blue/green + two orange shades); past that, switch to global.
- Diverging axis is blue↔orange (both official accents, CVD-safe). Never red/green.
- Chart primitives: bar corner radius 4px; 2px inline gap between adjacent/stacked bars; default line 1px, story line 2px.

## 7. Emotion tokens (derived — product module)

Harmonized to the earthy register: anger #A83A2E · happiness #D9A441 · disgust #788C5D · surprise #5FA8A0 · sadness #6A9BCC · fear #8C6E9E. Secondaries: same at 10% alpha. Reserved for coded Ekman emotions only.

## 8. Art direction

- Philosophy: warm intelligence — humanist, editorial, calm confidence.
- The feel: book-like warmth (serif body on ivory) · generous margins · soft geometry · accents used sparingly, like marginalia.
- Avoid list: cold pure white or pure black; neon/saturated hues outside the accent trio; more than one accent dominating a view; heavy drop shadows; cramped text measure (Lora body wants 60–75ch); all-caps body text; Listen Labs blue #0021CC (that's another brand's voice).
