---
name: pptx
description: "Use this skill any time a .pptx file is involved — creating slide decks, pitch decks, presentations, or editing existing .pptx files. TRIGGER when user mentions 'deck', 'slides', 'presentation', 'pptx', or references a .pptx filename. Always produces Listen Labs branded output. This skill layers brand constraints on top of the built-in Anthropic PPTX skill — use the built-in skill's pptxgenjs.md for the full PptxGenJS API reference and editing.md for template workflows."
---

# Listen Labs Presentation Skill

Generate professional, brand-compliant PowerPoint presentations using PptxGenJS. This skill enforces Listen Labs design standards on every slide. It composes with the built-in Anthropic PPTX skill — use their `pptxgenjs.md` for API details and `editing.md` for template editing.

---

## Quick Reference

| Task | Approach |
|------|----------|
| Create from scratch | Load brand tokens → use slide patterns from `references/slide-patterns.md` → QA loop |
| Edit existing .pptx | Use built-in PPTX skill's `editing.md` workflow, apply brand tokens during content step |
| Read/analyze | `python -m markitdown presentation.pptx` |

---

## Workflow

Every presentation follows this exact sequence:

1. **Load brand tokens** — call `get_brand_colors`, `get_typography`, `get_spacing`, and `get_art_direction` from the Listen Labs brand MCP. Never hardcode tokens from memory.
2. **Plan the deck** — outline all slides with their type (title, content, data, section, closing) before writing any code. Vary layouts — monotonous repetition is a failure mode.
3. **Reference slide patterns** — check `skills/pptx/references/slide-patterns.md` for pre-built PptxGenJS code per slide type. Adapt these, never improvise from scratch.
4. **Generate** — write a single Node.js script that produces the complete .pptx file.
5. **Run QA** — mandatory. Follow the QA workflow below. No presentation ships without at least one fix-and-verify cycle.
6. **Deliver** — output the .pptx file and confirm slide count.

---

## Listen Labs Design Standards

### Color — One Palette, Zero Improvisation

Every presentation uses the Listen Labs Paper theme exclusively:

| Role | Light Mode | Usage |
|------|-----------|-------|
| Slide background (default) | `F9F4EB` | `surface-primary` — warm off-white canvas |
| Slide background (dark slides) | `120F08` | `surface-inverse-primary` — title + closing slides |
| Primary text | `120F08` | `content-primary` — all body text on light slides |
| Inverse text | `F9F4EB` | `content-inverse-primary` — text on dark slides |
| Secondary text | `120F08` at 60% | `content-secondary` — captions, metadata, dates |
| Disabled/muted | `120F08` at 30% | `content-disabled` — grid lines, dividers |
| Brand accent | `0021CC` | `surface-brand-primary` — sparingly for key callouts only |
| Brand accent light | `0021CC` at 10% | `surface-brand-secondary` — highlight backgrounds |

**Rules:**
- Never introduce colors outside this palette. No gradients. No saturated accents beyond `0021CC`.
- Brand blue is used sparingly — one accent element per slide maximum. It is not a background color.
- "Sandwich" structure encouraged: dark title slide → light content slides → dark closing slide.
- Monochromatic data series: adjust HSL Lightness of `0021CC` for multi-series charts (same rule as data-viz skill).
- Emotion tokens only for Ekman emotion data — never for general decoration.

**Important:** PptxGenJS uses 6-char hex WITHOUT the `#` prefix. Never include `#`.

### Typography — Inter 400, No Exceptions

| Element | Font | Weight | Size | Color |
|---------|------|--------|------|-------|
| Slide title | Inter | 400 | 36pt | `content-primary` or `content-inverse-primary` |
| Section header | Inter | 400 | 24pt | `content-primary` |
| Body text | Inter | 400 | 16pt | `content-primary` |
| Bullet items | Inter | 400 | 14pt | `content-primary` |
| Captions / metadata | Inter | 400 | 10pt | `content-secondary` (60%) |
| Branded header | Inter | 400 | 10pt | See header rules below |

**Rules:**
- Inter Regular 400 for everything. No bold. No light. No italic. No other typeface.
- Never set `letterSpacing` or `charSpacing` — PptxGenJS silently ignores `letterSpacing` anyway.
- Size hierarchy must be visually obvious: titles at 36pt vs body at 14-16pt.
- Left-align body text and bullet lists. Center only slide titles.
- Never use ALL CAPS — sentence case or title case only.
- Use `bullet: true` for lists, never unicode bullet characters.
- Use `breakLine: true` between array items for multi-line text.

### Layout and Spacing

- **Slide dimensions:** `LAYOUT_16x9` (10" x 5.625") — never change this.
- **Margins:** 0.6" minimum from all edges. Content lives within a 8.8" x 4.425" safe zone.
- **Spacing between elements:** 0.4" consistent gaps. Never mix spacing values.
- **Even numbers only:** all spacing, sizing, and positioning values use even increments (0.2", 0.4", 0.6", etc.).
- **Grid discipline:** nothing floats arbitrarily. Align to a consistent left edge (typically 0.6").
- **One dominant element per slide** — everything else is subordinate.

### Branded Header

Every slide (except title and closing) includes the Listen Labs header:

```javascript
slide.addText([
  { text: "Listen Labs / ", options: { color: "120F08", opacity: 0.6 } },
  { text: "Project Title", options: { color: "120F08" } }
], {
  x: 0, y: 0.2, w: 10, h: 0.3,
  align: "center",
  fontFace: "Inter",
  fontSize: 10,
  margin: 0,
});
```

On dark background slides, swap colors:
- "Listen Labs /" → `F9F4EB` at 60% opacity
- "Project Title" → `F9F4EB`

### Shadows, Effects, and Decoration

- **No drop shadows.** Never use `shadow` on any element.
- **No gradients.** Solid fills only.
- **No accent lines under titles.** This is a hallmark of AI-generated slides — use whitespace instead.
- **No decorative shapes or icons** that don't carry meaning.
- **No rounded/bubbly elements.** Use `RECTANGLE`, not `ROUNDED_RECTANGLE`, unless specifically needed for a card at 0.08" radius.
- **Border radius:** if used, only values from the brand scale (0, 0.02", 0.04", 0.08", 0.12", 0.16").

---

## Prohibited Elements

Never include any of the following:

1. Bold or light font weights — Inter 400 only
2. Serif fonts — no Georgia, Times, Palatino, Garamond, Cambria
3. Letter-spacing overrides
4. ALL CAPS text of any kind
5. Drop shadows on any element
6. Gradient fills or gradient backgrounds
7. Accent lines under titles
8. Decorative icons or clip art without informational purpose
9. Stock photography (unless user explicitly provides images)
10. Colors outside the Paper palette
11. Saturated accent colors beyond `0021CC`
12. Multiple competing focal points on a single slide
13. Centered body text or bullet lists (center titles only)
14. Unicode bullet characters (use `bullet: true`)
15. Odd-number spacing values
16. Busy or cluttered layouts — every element must earn its place

---

## PptxGenJS Critical Pitfalls

These are non-obvious bugs that corrupt output files:

1. **Never use `#` with hex colors** — write `0021CC`, not `#0021CC`. The `#` corrupts the file.
2. **Never encode opacity in 8-char hex** — use the `opacity` property instead. 8-char hex corrupts the file.
3. **Never reuse option objects** — PptxGenJS mutates them in-place. Use factory functions:
   ```javascript
   const makeText = () => ({ fontFace: "Inter", fontSize: 16, color: "120F08", margin: 0 });
   ```
4. **Use `bullet: true`**, never unicode bullet characters.
5. **Use `breakLine: true`** between array items for multi-line text.
6. **Avoid `lineSpacing` with bullets** — use `paraSpaceAfter` instead.
7. **Each presentation needs a fresh `pptxgen()` instance.**
8. **Set `margin: 0`** on text boxes for precise alignment with shapes.
9. **Negative shadow offsets corrupt files** — use `angle: 270` instead (but we don't use shadows anyway).

---

## QA Workflow (Required)

**Mindset:** Assume there are problems. Your job is to find them. If you find zero issues on first inspection, you were not looking hard enough.

### Phase 1: Content QA

```bash
python -m markitdown output.pptx | head -200
```

Grep for leftover placeholders:
```bash
python -m markitdown output.pptx | grep -iE "(xxxx|lorem|ipsum|placeholder|TODO|TBD|example|sample)"
```

Verify: correct slide count, all titles populated, no placeholder text, no duplicate content.

### Phase 2: Visual QA

Convert to images:
```bash
python scripts/office/soffice.py --headless --convert-to pdf output.pptx
pdftoppm -jpeg -r 150 output.pdf slide
```

Then launch a **subagent** to inspect with fresh eyes. Use this exact prompt:

```
Visually inspect these slides. Assume there are issues — find them.

Listen Labs brand rules to check against:
- Background should be warm off-white (#F9F4EB) or near-black (#120F08)
- No drop shadows, no gradients, no accent lines under titles
- Font should appear to be one weight throughout (no bold)
- Text should not be ALL CAPS anywhere
- Only one accent color (blue) used sparingly
- Minimum 0.5" margin from all edges
- No overlapping elements, no cut-off text
- Clean alignment — nothing floats arbitrarily
- Obvious size contrast between titles and body text
- Branded header "Listen Labs / Title" visible on content slides

For each slide, list issues or areas of concern:

Read and analyze these images:
[list slide image paths with expected descriptions]

Report ALL issues found, including minor ones.
```

### Phase 3: Fix and Verify

1. Fix all issues found.
2. Re-render only the affected slides.
3. Re-inspect the fixed slides — one fix often creates another problem.
4. Repeat until a full pass reveals no new issues.
5. **Do not declare success until you have completed at least one fix-and-verify cycle.**

---

## Dependencies

Install before first use:

```bash
npm install pptxgenjs
pip install "markitdown[pptx]" Pillow
```

LibreOffice and Poppler are needed for visual QA (PDF conversion and image extraction).
