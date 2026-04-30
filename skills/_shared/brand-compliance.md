# Brand Compliance — Universal Rules

Every Listen Labs output must satisfy these brand-wide rules, regardless of skill or format. Skill-specific docs add format-specific rules on top of these.

For full brand specifications, see `GUIDELINES.md` at the repo root or call `get_full_guidelines` from the brand MCP. For live token values, always call the MCP — never hardcode from memory.

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
11. **Colors stay within the active theme palette.** No introducing colors outside Paper/Whisp tokens.

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

### Motion
Honor `prefers-reduced-motion`. If you add transitions or animations, gate them and animate **only `transform` and `opacity`** — never `transition: all`:

```css
@media (prefers-reduced-motion: no-preference) {
  .interactive { transition: transform 150ms, opacity 150ms; }
}
```

### Mobile rules
- **Touch targets ≥ 44×44px** for every interactive element on mobile.
- **No hover-only states.** Active/focus states must convey the same information without hover.
- **Tables**: wrap in `overflow-x-auto` and set `min-width: 640px` on the table itself so the layout never breaks below tablet.
- **Section padding scales:** `py-16 md:py-24 lg:py-32` (or equivalent — 64 / 96 / 128px). Horizontal padding `px-4 md:px-8` (16 / 32px).

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

If any item fails, fix before delivering. Skill-specific checklists add format-specific items — pass both.
