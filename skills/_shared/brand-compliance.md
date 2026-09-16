# Brand Compliance — Universal Rules

Every Listen Labs output must satisfy these brand-wide rules, regardless of skill or format. Skill-specific docs add format-specific rules on top of these.

For full brand specifications, see `GUIDELINES.md` at the repo root or call `get_full_guidelines` from the brand MCP. For live token values, always call the MCP — never hardcode from memory.

**Scope of this file.** The "Themes" and "Universal Rules" sections are the Listen Labs *voice* — the same answers also live, generated from `brand_data.py`, in `skills/research-artifacts/references/brands/listen-labs.md`. The "Typographic Precision" and "Web Output Hygiene" sections are brand-independent craft and apply to every HTML artifact regardless of brand. When `/research-artifacts` is rendering another brand (a file in its `references/brands/`), that brand file replaces the voice rules (fonts, weights, colors, radii, header) while the precision and hygiene rules still apply. Brand-independent layout physics and research-ethics rules live in `skills/research-artifacts/SKILL.md`.

**Path convention.** Paths in this skill and its reference files that begin with `skills/` are relative to the plugin root (the directory that contains the skill that references this file, two levels up from this file when installed as a plugin). Paths that begin with `references/` are relative to this skill's own folder.

---

## Themes

Listen Labs has two themes:

- **Paper** (default) — warm cream and brown palette
- **Whisp** — neutral grayscale palette

Both have light and dark modes. Pick **one theme per artifact** (Paper unless the user specifies Whisp). Do not mix themes within a single output. Token names are identical across themes — only the values change, so a skill written against `surface-primary` works in both.

Emotion tokens (`emotion-anger-*`, `emotion-happiness-*`, etc.) are shared across themes.

---

## Universal Rules

1. **Live tokens, never hardcoded.** Call the brand MCP for color and CSS variable values at generation time. Memorized values drift.
2. **Inter Regular 400 only.** No bold, no light, no italic, no serif, no other typeface.
3. **No letter-spacing.** Default browser/system spacing only.
4. **No ALL CAPS.** Sentence case or title case throughout.
5. **Sizes from the brand type scale.** No arbitrary font sizes.
6. **Even-number spacing, 4px base.** All padding, margin, gap, width, height, and offset values are multiples of 4.
7. **Border radius from the brand scale.** Only 0, 2, 4, 8, 12, 16.
8. **No drop shadows. No gradients. No decorative elements without informational purpose.**
9. **Branded header** (`Listen Labs / Title`) where the format supports it. Call `get_header_convention` for the spec.
10. **Emotion tokens are reserved.** Use `emotion-*` only for the six Ekman emotion data — never for general categories, status indicators, or decoration.
11. **Colors stay within the active theme palette.** No introducing colors outside Paper/Whisp tokens. The one sanctioned exception is the `global` data-viz palette mode (Okabe-Ito / Viridis / RdBu), which exists for accessibility and brand-agnostic charts and is reached only through the `--dataviz-*` tokens.

---

## Typographic Precision

These are the small details that separate professional from premium. Apply to every output that contains text.

1. **Use the ellipsis character `…` — never three periods `...`.** Loading states end with `…` (`Loading…`, `Saving…`).
2. **Use curly quotes `"` `"` and `'` `'`** — never straight quotes `"` `'`. (Apostrophes inside words too: `it's`, not `it's`.)
3. **Non-breaking space between value and unit** (`10&nbsp;MB`, `12&nbsp;px`, `5&nbsp;min read`) and inside compact brand names or shortcuts (`⌘&nbsp;K`).
4. **Numeric columns and tables use `font-variant-numeric: tabular-nums`** so digits align vertically.
5. **Headings use `text-wrap: balance`** to prevent widows. **Body paragraphs use `text-wrap: pretty`** where supported — improves rag without manual `<br>` tweaks.
6. **No straight quotes or `...` in body copy** — these read as authored-by-LLM signals when they slip through.

---

## Web Output Hygiene

Applies to any HTML output (reports, data-viz, web artifacts). PPTX is exempt — these are HTML/CSS-specific.

### Color scheme + theme color
Always declare both schemes on `<html>` so browser scrollbars and native form controls match the active mode:

```html
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="<resolved surface-primary value>">
```

```css
html { color-scheme: light dark; }
```

### Focus styles
Never use `outline: none` without a replacement. Every interactive element gets a visible focus indicator. Prefer `:focus-visible` so the ring only appears on keyboard navigation:

```css
:focus-visible {
  outline: 2px solid var(--content-primary);
  outline-offset: 2px;
}
```

(Or use the active theme's `--content-brand` for branded focus.)

### Motion (implementation)
Full policy in the **Motion** section below. Gate every transition and animate **only `transform` and `opacity`** — never `transition: all`:

```css
@media (prefers-reduced-motion: no-preference) {
  .interactive { transition: transform 150ms, opacity 150ms; }
}
```

### Mobile rules
- **Touch targets ≥ 44×44px** for every interactive element on mobile. This is the *hit area*, not the visual size: a brand button keeps its 32px visual height (XL component height) and gains the rest through padding, margin, or a transparent `::before` hit layer.
- **No hover-only states.** Active/focus states must convey the same information without hover.
- **Tables**: wrap in `overflow-x-auto` and set `min-width: 640px` on the table itself so the layout never breaks below tablet.
- **Canonical vertical rhythm (every skill uses these, never other values):**
  - Between major sections: 96px desktop · 64px tablet · 48px mobile (longform reports may use 96px throughout, or a single 1px rule with 48px above and below — never both).
  - Between subsections: 48px desktop · 32px mobile.
  - Page horizontal padding: 24px desktop · 16px mobile for full-width pages; a centered reading column (reports) uses 48px desktop · 24px mobile inside its max-width.
  - Hero / cover top and bottom: 128px desktop · 96px tablet · 64px mobile.

---

## Imagery, Illustration, and the Logo

- **Default is no imagery.** Listen Labs artifacts carry their weight with type, numbers, and data. Add an image only when it IS the content (a product frame, a participant-provided artifact, a map).
- **Never stock photography, never generated "people".** Invented humans undermine research credibility. Persona identity is a monochrome geometric mark, not a face.
- **When a hero or illustrative image is genuinely wanted** (a campaign page, a cover), the sanctioned source is the Listen Labs Brand Hub image recipes: if the `Listen_Labs_Brand_Hub` MCP is connected, call `list_recipes` → `get_recipe` and hand the finished Midjourney prompt to the user rather than drawing an illustration by hand. Otherwise state that an image slot is reserved and leave a `--surface-secondary` placeholder with the exact size.
- **The wordmark** lives at `assets/listen-labs-logo.svg` (plugin root). Inline it as SVG with `fill="currentColor"` so it follows the theme; render at 20px tall in nav and footers, 16px in a credit line; clear space equal to its height on all sides; never recolor it brand blue, never stretch, never place on a busy surface. Websites use the wordmark in the nav; artifacts and documents use the text credit line (`Listen Labs / Title`) — not both.
- **Icons:** Lucide only, inline SVG, sized and stroked per the icon table, colored as the accompanying text. An icon on every list item is decoration; an icon that disambiguates is information.

---

## Motion

- **Default is stillness.** No motion on load, no looping, no parallax, no auto-playing anything.
- **When motion is used** (a reveal in an interactive story, a hover, a tooltip): animate only `transform` and `opacity`; 150ms for hover/tooltip, 200–400ms ease-out for reveals and state changes; stagger children ≤ 40ms apart and never more than five; one thing moves at a time.
- **Every transition has a reduced-motion path** to the same final state: wrap in `@media (prefers-reduced-motion: no-preference)` or check `matchMedia` before animating in JS.
- **Motion is never the only cue.** Whatever a transition reveals must also be discoverable without it.

---

## Composition Variety (the anti-generic rule)

Two artifacts built from the same skeleton must not look like the same artifact. Before building, choose deliberately, and choose differently from the last thing you made:

- **The dominant element** — a giant numeral, a single chart, a verbatim set large, a stark headline, a map. One per composition.
- **The signature move** — pick one from `skills/typography/references/lockups.md` (tiny-next-to-huge, asymmetric two-column, giant background numeral, rotated label column, section header with rule) and commit to it; the same lockup should not open every deliverable.
- **The anchor** — left-anchored asymmetric layouts are the house default; centered composition is reserved for a single isolated line (a cover title, a stat on a tile).
- **The surface rhythm** — mostly `--surface-primary`; one `--surface-secondary` band or one dark band as the accent, not both, not every other section.
- **Reading direction** — vary between vertical stacks, two-column spreads, and horizontal flows (journeys, timelines) according to the data's shape, not habit.
- **Then stop.** Variety comes from these choices, never from adding ornament, a second accent color, a shadow, or a font weight.

---

## Print and PDF

Any HTML output may be printed. Every skeleton already ships a print block that re-declares the chosen theme's light tokens, sets `print-color-adjust: exact`, and declares `@page` margins. When you author HTML from scratch, do the same, plus:

- `break-inside: avoid` on figures, quotes, callouts, stat blocks, and table rows; `break-after: page` after a cover.
- Print what the reader needs: no content that lives only in tooltips or hover states; every chart shows its values or direct labels.
- For a fixed-size sheet or poster, size the page container in physical units and set `@page { size: …; margin: 0 }` (anatomy §11 in `skills/research-artifacts/references/deliverables.md`).
- Tell the user the export step in one line: browser → Print → Save as PDF, margins None, background graphics on.

---

## Universal Self-Audit Checklist

Before delivering any output, verify:

**Brand fundamentals:**
- [ ] Brand MCP was called for live tokens — none hardcoded from memory
- [ ] Output uses one theme consistently (Paper default; Whisp if specified)
- [ ] Inter Regular 400 everywhere — no bold, light, italic, serif
- [ ] No letter-spacing overrides
- [ ] No ALL CAPS text
- [ ] Font sizes from the brand type scale only
- [ ] Spacing values are multiples of 4px (even numbers)
- [ ] Border radius from scale only (0, 2, 4, 8, 12, 16)
- [ ] No drop shadows, no gradients, no decorative ornament
- [ ] Branded header present where the format supports it
- [ ] Emotion tokens used only for Ekman emotion data
- [ ] Colors stay within the active theme palette

**Typographic precision:**
- [ ] No straight quotes — curly quotes only (`"`/`"`/`'`/`'`)
- [ ] No `...` — use the ellipsis character `…`
- [ ] Non-breaking space between value and unit (`10&nbsp;MB`)
- [ ] Tabular numerals on numeric columns / tables (`tabular-nums`)
- [ ] Headings use `text-wrap: balance`; body paragraphs use `text-wrap: pretty`

**Web output hygiene** (HTML outputs only — skip for PPTX):
- [ ] `color-scheme: light dark` declared on `<html>`
- [ ] `<meta name="theme-color">` matches the active surface-primary
- [ ] Visible `:focus-visible` styles on every interactive element
- [ ] `prefers-reduced-motion` honored; transitions limited to `transform` and `opacity`
- [ ] Touch targets ≥ 44×44px on mobile
- [ ] No hover-only states
- [ ] Tables wrap in `overflow-x-auto` with `min-width: 640px`
- [ ] Tested at 375px / 768px / 1280px — no horizontal scroll, no broken layouts
- [ ] Print check: light tokens re-declared in `@media print`, `print-color-adjust: exact`, nothing essential hover-only
- [ ] No stock or generated imagery; wordmark from `assets/listen-labs-logo.svg` if used, credit line OR nav, not both
- [ ] Motion: none by default; any transition is `opacity`/`transform`, ≤400ms, with a reduced-motion path
- [ ] Composition chosen deliberately (dominant element, one signature lockup, left anchor, surface rhythm) — not the same layout as the last artifact

If any item fails, fix before delivering. Skill-specific checklists add format-specific items — pass both.
