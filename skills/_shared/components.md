# Components — Listen Labs interface vocabulary

Token-keyed specs for the interface elements a page, dashboard, explorer, or landing page needs. Every value traces to the brand: Inter 400, the 4px unit, component heights (XL 32 · L 24 · M 20 · S 16 · XS 12), the radius scale (0, 2, 4, 8, 12, 16), 1px strokes, no shadows, no gradients. Use these instead of inventing a button or a card — an invented one is where generic output starts.

Universal rules for every component: `font-family` inherits (Inter 400); text is sentence case except Title Case labels; states are conveyed by color role and border, never by shadow or scale-up; every interactive element has a `:focus-visible` ring (`2px solid var(--content-primary)`, offset 2px) and a ≥44×44px hit area on touch (visual height stays on the component scale — add padding or a transparent hit layer).

## Buttons

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| Primary | `--surface-brand-primary` | `--content-brand-contrast` | none | The one action per view that matters most. One per section, at most. |
| Secondary (default) | `--surface-highlight` | `--content-primary` | 1px `--surface-tertiary` | Everything else. |
| Inverse (on dark surfaces) | `--surface-inverse-primary` | `--surface-primary` | none | Toggles and controls on a dark band. |
| Quiet | transparent | `--content-secondary` | none | Tertiary actions, "Cancel", inline controls. Underline on hover. |

Sizes: XL 32px tall (12px/16px text, `height: 32px; padding: 0 16px`, radius 8) is the default; L 24px (12px/16px, `height: 24px; padding: 0 12px`, radius 8) for dense toolbars; never taller than 32px — hit area comes from padding/margin outside the visual box. Hover: secondary → `--surface-secondary` background; primary → no color change, cursor only (brand blue does not have a lighter "hover blue"). Active: 1px inset border `--content-disabled`. Disabled: text `--content-disabled`, border `--surface-tertiary`, no background change, `cursor: not-allowed`. Icon + label: Lucide icon at text size + 2px (14×14 for 12px text), 8px gap, icon colored like the label.

```css
.btn { display:inline-flex; align-items:center; gap:8px; height:32px; padding:0 16px; border-radius:8px;
       font:400 12px/16px inherit; color:var(--content-primary); background:var(--surface-highlight);
       border:1px solid var(--surface-tertiary); cursor:pointer; }
.btn:hover { background:var(--surface-secondary); }
.btn--primary { background:var(--surface-brand-primary); color:var(--content-brand-contrast); border-color:transparent; }
.btn--quiet { background:transparent; border-color:transparent; color:var(--content-secondary); }
.btn--quiet:hover { text-decoration:underline; text-underline-offset:2px; }
.btn:disabled { color:var(--content-disabled); border-color:var(--surface-tertiary); background:var(--surface-highlight); cursor:not-allowed; }
```

## Links

Body links: `--content-brand`, underlined (`text-underline-offset: 2px`, `text-decoration-thickness: 1px`); hover keeps the underline and shifts nothing else. Navigation links: `--content-secondary`, no underline, `--content-primary` on hover and for the current page (add `aria-current="page"`). Never a link that is only distinguishable by color (WCAG 1.4.1) — underline or position must carry it.

## Inputs, selects, textareas

Height XL 32px (L 24px in dense tables); padding 0 12px; radius 8; 1px `--surface-tertiary` border on `--surface-highlight`; text 12px/16px `--content-primary`; placeholder `--content-disabled`. Focus: border `--content-brand` plus the focus ring. Error: border `--content-negative`, a 12px message in `--content-negative` beneath, never a red fill. Labels: 12px `--content-secondary`, above the field, 4px gap; helper text 12px `--content-disabled`. Checkbox/radio 16×16, 1px border, brand fill when checked, 8px gap to label. Native `<select>` styled the same, with a 14×14 Lucide `chevron-down` at the right inside 12px padding.

## Cards

`--surface-highlight` on `--surface-primary`, 1px `--surface-tertiary` border, radius 12 (inner elements radius 8 — concentric nesting), padding 24px (16px mobile), 16px internal gap. No shadow, ever; lift is not a brand device. A card is a grouping device, not decoration: if the content reads fine without the border, drop the card. Card grids: equal heights per row, 24px gutters, 1–4 columns collapsing to 1 at 375px. Clickable cards get the whole surface as the hit area and `--surface-secondary` on hover.

## Chips, tags, badges

Height M 20px (S 16px inline), padding 0 8px, radius 4, 10px/16px text (chips are micro labels; the same information also appears in full elsewhere). Neutral: `--surface-secondary` background, `--content-secondary` text. Selected/filter-on: `--surface-brand-secondary` background, `--content-brand` text. Status chips use the status tokens (`--surface-positive-secondary` + `--content-positive`, negative, warning). Never emotion tokens for a badge.

## Tooltips and popovers

`--surface-highlight` card, 1px `--surface-tertiary` border, radius 8, padding 8px 12px, 12px/16px text; no shadow, no arrow. Anchored to the hovered element's box, 8px away; toggles on tap as well as hover; content that matters lives on the page, not in the tooltip. Transition `opacity` 150ms only.

## Navigation and page header

Top nav: a single 64px band (48px mobile), `--surface-primary` background, 1px `--surface-tertiary` bottom hairline, contents on the page grid. Left: the Listen Labs wordmark (paste the SVG markup from `assets/listen-labs-logo.svg` at the plugin root inline — never a path or URL — rendered at 20px tall, `currentColor` so it follows the theme). Right: up to five text links (12px, `--content-secondary`, 24px gap) and at most one button (secondary; primary only if the page has a single conversion). Sticky nav is allowed; it keeps its background and hairline. Mobile: links collapse behind a Lucide `menu` button (32×32 hit area 44) into a full-width list with 48px rows. The branded credit line (`Listen Labs / Title`) is for artifacts and documents; a website uses the nav instead, not both.

## Footer

One band, `--surface-secondary` background, 96px top padding / 64px bottom (64/48 mobile), 1px hairline above. Columns on the grid: wordmark + one-line description, 2–3 link groups (12px Title Case group labels in `--content-secondary`, 14px links), legal line 12px `--content-disabled`. No social-icon rainbow: Lucide icons at 16px in `--content-secondary`.

## Sections and bands

A page is a stack of full-width bands. Alternate `--surface-primary` and `--surface-secondary` at most every other band; a dark band (`--surface-inverse-primary` with inverse content tokens) is allowed once per page for the closing call to action. Band padding follows the canonical rhythm in `brand-compliance.md`. Inside a band, content sits on the 12-column grid; a section header is an H2 (32px desktop / 24px mobile) with an optional 12px overline in `--content-secondary` only when it disambiguates.

## Tables

Header row 12px Title Case `--content-primary` with a 1px `--content-disabled` rule beneath; body rows 14px `--content-secondary` with 1px `--surface-tertiary` rules; 12px 16px cell padding; `tabular-nums`; numeric columns right-aligned; no zebra striping, no heavy borders, no row hover unless rows are interactive. Wrap in an `overflow-x:auto` container with `min-width: 640px` on the table.

## Stat tiles / KPI rows

One number per tile: 48px numeral (`--content-primary`, `tabular-nums`, `text-wrap: balance` on its label), 12px label beneath in `--content-secondary`, optional delta chip using semantic tokens, n= in `--content-disabled`. Tiles align numerals on one baseline across the row (equalize label heights); when they stack, a 1px hairline separates them. Up to four tiles per row at desktop width, wrapping beyond that (six KPIs become 4 + 2, or 3 + 3); never a tile with two competing numbers.

## Empty, loading, and error states

Empty: a 14px sentence in `--content-secondary` inside the component's own outline, with one secondary button if there is an action. Loading: text ends with `…`; a 1px indeterminate bar in `--content-brand` on `--surface-tertiary` (height 2px) — no spinners, no skeleton shimmer. Error: 14px `--content-negative` message, never a red panel. Insufficient data in a chart: the panel renders `--surface-secondary` with the message inside (see the map rule) — a designed absence, never a blank.

## Motion (component level)

Only `opacity` and `transform`; 150ms for hovers and tooltips, 200–400ms ease-out for reveals; no bounce, no loop, no parallax; a `prefers-reduced-motion: reduce` path to the same end state on every transition. Full policy: `brand-compliance.md` → Motion.
