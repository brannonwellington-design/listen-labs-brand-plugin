---
name: pptx
description: "Use this skill any time a .pptx file is involved — creating slide decks, pitch decks, presentations, or editing existing .pptx files. TRIGGER when user mentions 'deck', 'slides', 'presentation', 'pptx', or references a .pptx filename. Always produces Listen Labs branded output. This skill layers brand constraints on top of the built-in Anthropic PPTX skill — use the built-in skill's pptxgenjs.md for the full PptxGenJS API reference and editing.md for template workflows."
---

# Listen Labs Presentation Skill

Generate professional, brand-compliant PowerPoint presentations using PptxGenJS. This skill enforces Listen Labs design standards on every slide. It composes with the built-in Anthropic PPTX skill — use their `pptxgenjs.md` for API details and `editing.md` for template editing.

**Brand compliance is universal.** See `skills/_shared/brand-compliance.md` for the brand-wide rules every output must satisfy. This skill adds PPTX-specific rules below.

---

## Quick Reference

| Task | Approach |
|------|----------|
| Create from scratch | Read shared compliance → load brand tokens for chosen theme → use `references/slide-patterns.md` → QA loop |
| Edit existing .pptx | Use built-in PPTX skill's `editing.md` workflow, apply brand tokens during content step |
| Read/analyze | `python -m markitdown presentation.pptx` |

---

## Workflow

Every presentation follows this exact sequence:

1. **Read brand-compliance** — read `skills/_shared/brand-compliance.md` for universal rules.
2. **Choose a theme** — Paper (default) or Whisp (if user specifies). Lock to one theme for the whole deck — never mix.
3. **Load brand tokens** — call `get_brand_colors(theme=…)`, `get_typography`, `get_spacing`, `get_header_convention`, and `get_art_direction` from the Listen Labs brand MCP. Use the returned hex values to populate the `BRAND` const in your script. Never hardcode from memory.
4. **Plan the deck** — outline all slides with their type (title, content, data, section, closing) before writing any code. Vary layouts — monotonous repetition is a failure mode.
5. **Reference slide patterns** — check `skills/pptx/references/slide-patterns.md` for pre-built PptxGenJS code per slide type. Adapt these, never improvise from scratch.
6. **Generate** — write a single Node.js script that produces the complete .pptx file.
7. **Run QA** — mandatory. Follow the QA workflow below. No presentation ships without at least one fix-and-verify cycle.
8. **Deliver** — output the .pptx file and confirm slide count.

---

## PPTX-Specific Design Standards

### Color — Token Roles

PptxGenJS doesn't read CSS variables — it needs literal hex strings. So at generation time, fetch the chosen theme's tokens via `get_brand_colors(theme=…)` and populate them into the script's `BRAND` const. Use these token roles:

| Role | Token | Usage |
|------|-------|-------|
| Slide background (default) | `surface-primary` | Light content canvas |
| Slide background (dark) | `surface-inverse-primary` | Title + closing slides |
| Primary text | `content-primary` | Body text on light slides |
| Inverse text | `content-inverse-primary` | Text on dark slides |
| Secondary text | `content-secondary` | Captions, metadata, dates |
| Disabled/muted | `content-disabled` | Dividers, subordinate marks |
| Brand accent | `surface-brand-primary` | Sparingly, for key callouts only |
| Brand accent (tinted bg) | `surface-brand-secondary` | Highlight backgrounds |

**Rules:**
- Never introduce colors outside the active theme palette. No gradients. No saturated accents beyond brand blue.
- Brand blue is used sparingly — one accent element per slide maximum. It is not a background color.
- "Sandwich" structure encouraged: dark title slide → light content slides → dark closing slide.
- Monochromatic data series: adjust HSL Lightness of the brand-blue base for multi-series charts (same rule as data-viz skill).
- Emotion rules: see `skills/report/references/emotion-callouts.md` for the canonical guide.

**Important:** PptxGenJS uses 6-char hex WITHOUT the `#` prefix. Strip the `#` when assigning brand values. Never include `#`.

### Typography — Slide-Specific Sizing

Universal typography rules (Inter 400 only, no letter-spacing, no all-caps) come from the shared compliance file. PPTX-specific size table:

| Element | Size | Color token |
|---------|------|-------------|
| Slide title | 36pt | `content-primary` or `content-inverse-primary` |
| Section header | 24pt | `content-primary` |
| Body text | 16pt | `content-primary` |
| Bullet items | 14pt | `content-primary` |
| Captions / metadata | 10pt | `content-secondary` |
| Branded header | 10pt | See `get_header_convention` |

**PPTX-specific notes:**
- Size hierarchy must be visually obvious: titles at 36pt vs body at 14–16pt.
- Left-align body text and bullet lists. Center only slide titles.
- Use `bullet: true` for lists — never unicode bullet characters.
- Use `breakLine: true` between array items for multi-line text.
- PptxGenJS silently ignores `letterSpacing` anyway, but never set `charSpacing` either.

### Layout and Spacing

- **Slide dimensions:** `LAYOUT_16x9` (10" x 5.625") — never change this.
- **Margins:** 0.6" minimum from all edges. Content lives within a 8.8" x 4.425" safe zone.
- **Spacing between elements:** 0.4" consistent gaps. Never mix spacing values.
- **Even numbers only:** all spacing, sizing, and positioning values use even increments (0.2", 0.4", 0.6", etc.).
- **Grid discipline:** nothing floats arbitrarily. Align to a consistent left edge (typically 0.6").
- **One dominant element per slide** — everything else is subordinate.

### Branded Header

Every slide (except title and closing) includes the Listen Labs branded header. Call `get_header_convention` for the canonical spec. The `addHeader` helper in `references/slide-patterns.md` is the canonical PPTX implementation — use it.

In summary:
- `Listen Labs /` in `content-secondary` token (or `content-inverse-secondary` on dark slides)
- Project title in `content-primary` token (or `content-inverse-primary` on dark slides)
- Top center, 10pt, Inter 400, 0.2" from top

### Shadows, Effects, and Decoration

- **No drop shadows.** Never use `shadow` on any element.
- **No gradients.** Solid fills only.
- **No accent lines under titles.** This is a hallmark of AI-generated slides — use whitespace instead.
- **No decorative shapes or icons** that don't carry meaning.
- **No rounded/bubbly elements.** Use `RECTANGLE`, not `ROUNDED_RECTANGLE`, unless specifically needed for a card at 0.08" radius.
- **Border radius:** if used, only values from the brand scale (0, 0.02", 0.04", 0.08", 0.12", 0.16").

---

## PPTX-Specific Prohibitions

Universal brand prohibitions (no bold/light/italic, no serif, no letter-spacing, no all-caps, no shadows, no gradients, no decoration without purpose, even-number spacing only, etc.) come from `skills/_shared/brand-compliance.md`. PPTX adds:

1. Accent lines under titles — a hallmark of AI-generated decks; use whitespace instead
2. Stock photography unless the user explicitly provides images
3. Saturated accent colors beyond brand blue
4. Centered body text or bullet lists — center only slide titles
5. Unicode bullet characters — use `bullet: true`
6. Multiple competing focal points on a single slide
7. Busy or cluttered layouts — every element must earn its place

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
- Background should match the active theme's `surface-primary` (light slides) or `surface-inverse-primary` (dark slides)
- No drop shadows, no gradients, no accent lines under titles
- Font should appear to be one weight throughout (no bold)
- Text should not be ALL CAPS anywhere
- Only one accent color (brand blue) used sparingly
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
