# Brand Contract — template

Every file in `brands/` answers ALL of these fields. The CSS variable names are fixed across brands; only values change. Copy this file to `brands/<brand-slug>.md`, fill every field from the brand's official guidelines (never invent), and note the source + snapshot date at the top.

```
> Source: <official guidelines / brand MCP / URL> · Snapshot: <date> · Derived fields marked (derived)
```

## 1. Themes & color tokens
- Themes available and the default (e.g., one theme, or light/dark pair).
- Full CSS block resolving: --content-primary/-secondary/-disabled/-inverse-primary/-inverse-secondary/-brand/-brand-secondary/-negative/-positive/-warning; --surface-highlight/-primary/-secondary/-tertiary/-inverse-primary/-brand-primary/-brand-secondary.
- Dark-mode overrides (or a statement that the brand is single-mode).

## 2. Typography
- Families (heading + body if they differ), fallback stacks, import URL.
- Allowed weights (exact list) and where each is permitted.
- Letter-spacing policy. Case rules.
- Type scale (exact px list).

## 3. Spacing & shape
- Base unit; even/odd policy; common max.
- Radius scale (exact list) + concentric nesting note.
- Grid presets (columns/margins/gutters for presentation, desktop, mobile).

## 4. Strokes & icons
- Default stroke weight(s); grid-line token.
- Icon library; sizing/stroke table or rule; icon color rule.

## 5. Header convention
- Format (e.g., "{Brand} / {Title}"), position, sizes, colors, HTML snippet.

## 6. Dataviz palettes
- Brand mode: categorical slots 1–8, sequential 100–700, diverging neg-3..pos-3, highlight + semantic tokens — as a full --dataviz-* CSS block.
- Global/best-practices mode block (may reuse Okabe-Ito/Viridis/RdBu).
- Categorical cap for brand mode; construction rule (e.g., "vary L only, hold H and S").
- Chart primitives: bar corner radius, inline gap between adjacent/stacked bars, story-line weight vs default line weight.

## 7. Emotion tokens (product module)
- Six colors for anger, happiness, disgust, surprise, sadness, fear (+ 10% secondary washes), harmonized to the brand palette. Mark as (derived) if the brand has no official mapping.

## 8. Art direction
- Philosophy (one line). The feel (3–5 phrases). The avoid list (what instantly reads as off-brand).
