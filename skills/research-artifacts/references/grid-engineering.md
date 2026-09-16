# Grid Engineering (absorbed from Müller-Brockmann grid discipline, adapted for single-file artifacts)

Applies in full to editorial layouts — one-pagers, reports, dashboards, anything with a text grid. For pure canvas/generative pieces, only the scaffold (§1) and audit (§5) apply. Brand-agnostic: all values come from the active brand file.

## 1. One source of truth

Every grid parameter lives in `:root` CSS variables — `--cols`, `--gutter`, `--margin`, `--bl` (baseline unit, the brand's base unit), `--lh` (leading = a fixed multiple of `--bl`), `--maxw`. Content, spacing, AND any overlay all read these same variables. Never hand-author a second copy of the grid; duplicates drift.

## 2. Bands and column lines

Don't eyeball spans. Each horizontal band spans all columns and re-exposes them so every child snaps to identical column LINES:

```css
.band { grid-column:1 / -1; display:grid; grid-template-columns:subgrid; column-gap:var(--gutter); align-items:start; }
@supports not (grid-template-columns:subgrid) { .band { grid-template-columns:repeat(var(--cols),1fr); } }
```
Children place with `grid-column: <start>/<end>` (e.g. `1/6`, `6/13`).

## 3. Baseline lock

- Every line-height is a multiple of `--bl`, and **in px, not unitless, for display type** — unitless leading on large type pushes the box off the grid.
- Every margin and padding is a multiple of `--bl`; section padding a multiple of `--lh` so content starts ON a line.
- **Media heights are multiples of `--lh`** (charts, images, spacer blocks) so their top AND bottom both land on lines.
- Hairline rules sit inside a baseline-height band, never free-floating between lines.

## 4. Optical ink alignment (display type)

A large headline whose BOX sits exactly on the column line still looks misaligned, because the letterform's ink is inset by its side-bearing. Cure at runtime, after `document.fonts.ready` and on resize — measure the loaded font, shift the box so the INK lands on the line:

```js
async function opticalAlign(sel){
  await document.fonts.ready;
  const ctx = document.createElement('canvas').getContext('2d');
  document.querySelectorAll(sel).forEach(el => {
    el.style.marginLeft = '0px';
    const cs = getComputedStyle(el);
    let ch = (el.textContent || '').trim()[0]; if (!ch) return;
    if (cs.textTransform === 'uppercase') ch = ch.toUpperCase();
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const abl = ctx.measureText(ch).actualBoundingBoxLeft;   // +ve = ink overhangs left of box
    if (isFinite(abl)) el.style.marginLeft = abl.toFixed(2) + 'px';
  });
}
opticalAlign('.display, h1, .numeral');           // rerun on resize (debounced)
```
Also hang opening quote glyphs of pull-quotes/verbatims outside the text box (negative indent equal to the glyph advance) so the first line's ink aligns with the lines below. Side-bearing is font-specific — measuring a fallback font gives the wrong nudge, which is why this runs against the loaded webfont, never a hardcoded constant.

## 5. The overlay and the in-page audit

**Overlay (optional but recommended for editorial artifacts):** a `G`-key toggle fades in numbered translucent column fields, baseline lines (major every `--lh`, faint minor every `--bl`), and margin lines. THE #1 BUG: the overlay must live INSIDE the same max-width content wrapper as the content, reading the same variables — a full-width overlay over centered content drifts apart at every viewport wider than `--maxw`. Showing the real grid the page is built on is itself a credibility feature.

**Audit (always, before delivering):** the original discipline verifies with headless Chrome; artifacts can't, so run this in-page self-audit during development and fix every violation it logs:

```js
function auditGrid(){
  const cs = getComputedStyle(document.documentElement);
  const bl = parseFloat(cs.getPropertyValue('--bl')), issues = [];
  document.querySelectorAll('.band > *').forEach(el => {
    const r = el.getBoundingClientRect(), band = el.parentElement.getBoundingClientRect();
    // column snap: left edge must sit on a column START, right edge on a column END
    // (build BOTH sets — an item ending "at line N" ends across the gutter; single-edge math lies)
  });
  document.querySelectorAll('h1,h2,p,.k,.v').forEach(el => {
    const top = el.getBoundingClientRect().top + scrollY;
    const off = top % bl;
    if (Math.min(off, bl - off) > bl/2 * 0.9) issues.push(['baseline drift', el, off.toFixed(1)]);
  });
  console.table(issues); return issues.length;
}
```
Check at multiple widths, including wider and narrower than `--maxw` — centered-container drift only appears past the max width. Exclude optically-aligned display elements from the box check (their box is intentionally offset; their INK is what must sit on the line).
