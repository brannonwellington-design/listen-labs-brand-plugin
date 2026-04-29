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

## Universal Self-Audit Checklist

Before delivering any output, verify:

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

If any item fails, fix before delivering. Skill-specific checklists add format-specific items — pass both.
