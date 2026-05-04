# Listen Labs Slide Patterns

Pre-built PptxGenJS code for each slide type. Copy and adapt these — never build slide layouts from scratch.

All patterns use these shared constants:

```javascript
const pptxgen = require("pptxgenjs");
let pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10" x 5.625"

// ── Listen Labs Brand Tokens ───────────────────────────────
// IMPORTANT: Populate these from `get_brand_colors(theme=<paper|whisp>)` at
// generation time. PptxGenJS needs literal 6-char hex without the `#` prefix.
// Example below shows Paper light values — substitute Whisp values if Whisp
// is the selected theme.
const BRAND = {
  // Light-slide colors
  bg:                "F9F4EB",  // surface-primary
  bgSecondary:       "EEE8DD",  // surface-secondary
  bgTertiary:        "E2DCCF",  // surface-tertiary
  text:              "120F08",  // content-primary
  textMuted:         "6B6861",  // content-secondary (opaque)
  textDisabled:      "B6B4AF",  // content-disabled (opaque)

  // Dark-slide colors (used on title/section/closing slides)
  bgDark:            "120F08",  // surface-inverse-primary
  textInverse:       "F9F4EB",  // content-inverse-primary
  textInverseMuted:  "9E9B94",  // content-inverse-secondary (opaque)

  // Brand accents
  accent:            "0021CC",  // surface-brand-primary
  accentLight:       "D9DDF2",  // surface-brand-secondary (opaque)
};

// ── Factory Functions (never reuse option objects) ──────────
const makeTitle = () => ({
  fontFace: "Inter", fontSize: 36, color: BRAND.text, margin: 0,
});
const makeTitleInverse = () => ({
  fontFace: "Inter", fontSize: 36, color: BRAND.textInverse, margin: 0,
});
const makeBody = () => ({
  fontFace: "Inter", fontSize: 16, color: BRAND.text, margin: 0,
});
const makeCaption = () => ({
  fontFace: "Inter", fontSize: 10, color: BRAND.textMuted, margin: 0,
});
const makeHeader = () => ({
  fontFace: "Inter", fontSize: 10, margin: 0,
});

// ── Branded Header Helper ──────────────────────────────────
function addHeader(slide, title, dark) {
  var prefixColor = dark ? BRAND.textInverseMuted : BRAND.textMuted;
  var titleColor  = dark ? BRAND.textInverse      : BRAND.text;
  slide.addText([
    { text: "Listen Labs / ", options: { color: prefixColor } },
    { text: title, options: { color: titleColor } }
  ], {
    x: 0, y: 0.2, w: 10, h: 0.3,
    align: "center",
    fontFace: "Inter",
    fontSize: 10,
    margin: 0,
  });
}
```

---

## 1. Title Slide (Dark)

Opening slide with large title centered on dark background.

```javascript
function addTitleSlide(pres, title, subtitle) {
  var slide = pres.addSlide();
  slide.background = { color: BRAND.bgDark };

  // Title — large, centered
  slide.addText(title, {
    x: 0.6, y: 1.6, w: 8.8, h: 1.4,
    align: "center",
    ...makeTitleInverse(),
    fontSize: 44,
  });

  // Subtitle — smaller, muted
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6, y: 3.0, w: 8.8, h: 0.6,
      align: "center",
      fontFace: "Inter",
      fontSize: 16,
      color: BRAND.textInverseMuted,
      margin: 0,
    });
  }

  // Branded header — title slide gets just "Listen Labs" (no project title yet)
  slide.addText("Listen Labs", {
    x: 0, y: 0.2, w: 10, h: 0.3,
    align: "center",
    fontFace: "Inter",
    fontSize: 10,
    color: BRAND.textInverseMuted,
    margin: 0,
  });

  return slide;
}
```

---

## 2. Section Divider (Dark)

Marks a new section of the presentation. Dark background, large text.

```javascript
function addSectionSlide(pres, sectionTitle, projectTitle) {
  var slide = pres.addSlide();
  slide.background = { color: BRAND.bgDark };

  addHeader(slide, projectTitle, true);

  slide.addText(sectionTitle, {
    x: 0.6, y: 1.8, w: 8.8, h: 1.2,
    align: "left",
    ...makeTitleInverse(),
    fontSize: 36,
  });

  return slide;
}
```

---

## 3. Content Slide — Title + Bullets

Standard content slide with title and bullet list.

```javascript
function addBulletSlide(pres, title, bullets, projectTitle) {
  var slide = pres.addSlide();
  slide.background = { color: BRAND.bg };

  addHeader(slide, projectTitle, false);

  // Title
  slide.addText(title, {
    x: 0.6, y: 0.7, w: 8.8, h: 0.6,
    align: "left",
    ...makeTitle(),
    fontSize: 24,
  });

  // Bullets
  var bulletItems = bullets.map(function(item, i) {
    var entry = { text: item, options: { ...makeBody(), fontSize: 14, bullet: true, indentLevel: 0 } };
    if (i < bullets.length - 1) entry.options.paraSpaceAfter = 8;
    return entry;
  });

  slide.addText(bulletItems, {
    x: 0.6, y: 1.5, w: 8.8, h: 3.6,
    align: "left",
    valign: "top",
    margin: 0,
  });

  return slide;
}
```

---

## 4. Two-Column Content

Split layout for comparisons, before/after, or side-by-side content.

```javascript
function addTwoColumnSlide(pres, title, leftTitle, leftItems, rightTitle, rightItems, projectTitle) {
  var slide = pres.addSlide();
  slide.background = { color: BRAND.bg };

  addHeader(slide, projectTitle, false);

  // Title
  slide.addText(title, {
    x: 0.6, y: 0.7, w: 8.8, h: 0.6,
    align: "left",
    ...makeTitle(),
    fontSize: 24,
  });

  // Left column header
  slide.addText(leftTitle, {
    x: 0.6, y: 1.5, w: 4.0, h: 0.4,
    align: "left",
    fontFace: "Inter", fontSize: 14, color: BRAND.accent, margin: 0,
  });

  // Left column content
  var leftBullets = leftItems.map(function(item) {
    return { text: item, options: { ...makeBody(), fontSize: 14, bullet: true } };
  });
  slide.addText(leftBullets, {
    x: 0.6, y: 2.0, w: 4.0, h: 3.0,
    align: "left", valign: "top", margin: 0,
  });

  // Right column header
  slide.addText(rightTitle, {
    x: 5.4, y: 1.5, w: 4.0, h: 0.4,
    align: "left",
    fontFace: "Inter", fontSize: 14, color: BRAND.accent, margin: 0,
  });

  // Right column content
  var rightBullets = rightItems.map(function(item) {
    return { text: item, options: { ...makeBody(), fontSize: 14, bullet: true } };
  });
  slide.addText(rightBullets, {
    x: 5.4, y: 2.0, w: 4.0, h: 3.0,
    align: "left", valign: "top", margin: 0,
  });

  return slide;
}
```

---

## 5. Key Stat / Big Number

Highlight a single metric or takeaway with a large number.

```javascript
function addStatSlide(pres, statValue, statLabel, context, projectTitle) {
  var slide = pres.addSlide();
  slide.background = { color: BRAND.bg };

  addHeader(slide, projectTitle, false);

  // Big number
  slide.addText(statValue, {
    x: 0.6, y: 1.2, w: 8.8, h: 1.6,
    align: "center",
    fontFace: "Inter", fontSize: 72, color: BRAND.accent, margin: 0,
  });

  // Label
  slide.addText(statLabel, {
    x: 0.6, y: 2.8, w: 8.8, h: 0.6,
    align: "center",
    ...makeTitle(),
    fontSize: 24,
  });

  // Context
  if (context) {
    slide.addText(context, {
      x: 1.5, y: 3.6, w: 7.0, h: 0.6,
      align: "center",
      fontFace: "Inter", fontSize: 14, color: BRAND.textMuted, margin: 0,
    });
  }

  return slide;
}
```

---

## 6. Three-Card Layout

For presenting 3 pillars, features, or categories side by side.

```javascript
function addThreeCardSlide(pres, title, cards, projectTitle) {
  // cards = [{ title: "Card 1", body: "Description" }, ...]
  var slide = pres.addSlide();
  slide.background = { color: BRAND.bg };

  addHeader(slide, projectTitle, false);

  slide.addText(title, {
    x: 0.6, y: 0.7, w: 8.8, h: 0.6,
    align: "left",
    ...makeTitle(),
    fontSize: 24,
  });

  var cardWidth = 2.6;
  var gap = 0.4;
  var startX = 0.6;

  cards.forEach(function(card, i) {
    var x = startX + (cardWidth + gap) * i;

    // Card background
    slide.addShape(pres.ShapeType.rect, {
      x: x, y: 1.5, w: cardWidth, h: 3.2,
      fill: { color: BRAND.bgSecondary },
      rectRadius: 0.08,
    });

    // Card title
    slide.addText(card.title, {
      x: x + 0.2, y: 1.7, w: cardWidth - 0.4, h: 0.4,
      align: "left",
      fontFace: "Inter", fontSize: 14, color: BRAND.accent, margin: 0,
    });

    // Card body
    slide.addText(card.body, {
      x: x + 0.2, y: 2.2, w: cardWidth - 0.4, h: 2.2,
      align: "left", valign: "top",
      fontFace: "Inter", fontSize: 12, color: BRAND.text, margin: 0,
    });
  });

  return slide;
}
```

---

## 7. Quote / Callout

Feature a key quote or testimonial.

```javascript
function addQuoteSlide(pres, quote, attribution, projectTitle) {
  var slide = pres.addSlide();
  slide.background = { color: BRAND.bg };

  addHeader(slide, projectTitle, false);

  // Quote mark — large brand accent
  slide.addText("\u201C", {
    x: 0.6, y: 1.0, w: 1.0, h: 1.0,
    fontFace: "Inter", fontSize: 72, color: BRAND.accent, opacity: 0.3, margin: 0,
  });

  // Quote text
  slide.addText(quote, {
    x: 1.2, y: 1.4, w: 7.6, h: 2.0,
    align: "left", valign: "top",
    fontFace: "Inter", fontSize: 20, color: BRAND.text, margin: 0,
  });

  // Attribution
  if (attribution) {
    slide.addText(attribution, {
      x: 1.2, y: 3.6, w: 7.6, h: 0.4,
      align: "left",
      fontFace: "Inter", fontSize: 12, color: BRAND.textMuted, margin: 0,
    });
  }

  return slide;
}
```

---

## 8. Closing Slide (Dark)

Final slide with a simple closing message.

```javascript
function addClosingSlide(pres, closingText, contactInfo) {
  var slide = pres.addSlide();
  slide.background = { color: BRAND.bgDark };

  // Closing text — centered
  slide.addText(closingText || "Thank you", {
    x: 0.6, y: 1.8, w: 8.8, h: 1.2,
    align: "center",
    ...makeTitleInverse(),
    fontSize: 36,
  });

  // Contact / follow-up info
  if (contactInfo) {
    slide.addText(contactInfo, {
      x: 0.6, y: 3.2, w: 8.8, h: 0.6,
      align: "center",
      fontFace: "Inter", fontSize: 14, color: BRAND.textInverseMuted, margin: 0,
    });
  }

  // Branded footer
  slide.addText("Listen Labs", {
    x: 0, y: 4.8, w: 10, h: 0.4,
    align: "center",
    fontFace: "Inter", fontSize: 10, color: BRAND.textInverseMuted, margin: 0,
  });

  return slide;
}
```

---

## Chart Slides

PptxGenJS can't read CSS variables, so chart colors are resolved from the `/data-viz` palette spec into literal hex strings (no `#` prefix — PptxGenJS rejects it) at generation time. Pick one palette mode per deck via `DATAVIZ_MODE`, plus a `THEME_MODE` so dark-canvas decks substitute the same dark-mode-adapted hexes as `/data-viz`:

- **`DATAVIZ_MODE`** — `"brand"` (default; monochromatic brand-blue) or `"global"` (Okabe-Ito categorical for brand-agnostic decks / ≥6 categorical series, CVD-safe).
- **`THEME_MODE`** — `"light"` (default) or `"dark"` (matches the canvas; flips the small set of tokens that would be invisible on dark backgrounds — brand cat-3, global cat-8).

The hex values come straight from `get_dataviz_palettes` and match the CSS tokens in `/data-viz` exactly, so a chart on a slide reads identically to the same chart in HTML — including the dark-mode adaptations.

```javascript
// Palette + theme mode for this deck. Set once. Charts use the matching palette below.
var DATAVIZ_MODE = "brand";  // or "global"
var THEME_MODE   = "light";  // or "dark" — matches the slide canvas

// Categorical palettes (hex without `#`, mirrors --dataviz-categorical-1..8).
// Resolved from get_dataviz_palettes — keep in sync if those tokens change.
// Two columns: light-mode values (canonical) and dark-mode overrides (flipped
// only for tokens that collide with dark canvases).
var DATAVIZ_CATEGORICAL = {
  brand: {
    light: [  // monochromatic brand-blue (HSL 229° / 100%, vary L); slots 6-8 are neutral grays
      hslToHex(229, 100, 40),  // 1 — brand primary (#0021CC)
      hslToHex(229, 100, 60),  // 2
      hslToHex(229, 100, 25),  // 3
      hslToHex(229, 100, 78),  // 4
      hslToHex(229, 100, 50),  // 5
      "525252",                // 6 — neutral fallback (switch to global past 5)
      "8D8D8D",                // 7
      "C6C6C6",                // 8
    ],
    dark: [
      hslToHex(229, 100, 40),
      hslToHex(229, 100, 60),
      hslToHex(229, 100, 72),  // 3 — was L=25; flipped for dark-canvas legibility
      hslToHex(229, 100, 78),
      hslToHex(229, 100, 50),
      "525252",
      "8D8D8D",
      "C6C6C6",
    ],
  },
  global: {
    light: [  // Okabe-Ito 8 (CVD-safe academic standard)
      "0072B2",  // 1 — Blue
      "E69F00",  // 2 — Orange
      "009E73",  // 3 — Green
      "CC79A7",  // 4 — Reddish purple
      "56B4E9",  // 5 — Sky blue
      "D55E00",  // 6 — Vermillion (same hex as brand diverging neg-3)
      "F0E442",  // 7 — Yellow
      "000000",  // 8 — Black
    ],
    dark: [
      "0072B2",
      "E69F00",
      "009E73",
      "CC79A7",
      "56B4E9",
      "D55E00",
      "F0E442",
      "FFFFFF",  // 8 — was black; swapped for dark-canvas legibility
    ],
  },
};

// Returns `count` chart colors from the active palette + theme. Wraps past 8.
// Soft cap 7, hard cap 10 — same rules as the /data-viz dataVizSeries() helper.
function dataVizSeriesHex(count) {
  if (count > 10) console.warn("dataVizSeriesHex: " + count + " categories exceeds the hard cap (10).");
  else if (count > 7) console.warn("dataVizSeriesHex: " + count + " exceeds the soft cap (7); add direct labels.");
  var palette = DATAVIZ_CATEGORICAL[DATAVIZ_MODE][THEME_MODE];
  var out = [];
  for (var i = 0; i < count; i++) out.push(palette[i % 8]);
  return out;
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  var c = (1 - Math.abs(2 * l - 1)) * s;
  var x = c * (1 - Math.abs((h / 60) % 2 - 1));
  var m = l - c / 2, r = 0, g = 0, b = 0;
  if      (h < 60)  { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }
  var to = function(n) { return Math.round((n + m) * 255).toString(16).padStart(2, "0").toUpperCase(); };
  return to(r) + to(g) + to(b);
}

// Legacy alias — kept so older slide scripts keep working. Resolves to the
// brand-mode categorical palette in the active theme.
function brandShadesHex(count) {
  var prev = DATAVIZ_MODE;
  DATAVIZ_MODE = "brand";
  var out = dataVizSeriesHex(count);
  DATAVIZ_MODE = prev;
  return out;
}

function addChartSlide(pres, title, chartType, chartData, projectTitle) {
  var slide = pres.addSlide();
  slide.background = { color: BRAND.bg };

  addHeader(slide, projectTitle, false);

  slide.addText(title, {
    x: 0.6, y: 0.7, w: 8.8, h: 0.6,
    align: "left",
    ...makeTitle(),
    fontSize: 24,
  });

  slide.addChart(chartType, chartData, {
    x: 0.6, y: 1.5, w: 8.8, h: 3.6,
    showTitle: false,
    showLegend: true,
    legendPos: "b",
    legendFontFace: "Inter",
    legendFontSize: 10,
    legendColor: BRAND.text,
    chartColors: dataVizSeriesHex(chartData.length),
    border: { pt: 0 },
    catAxisLabelFontFace: "Inter",
    catAxisLabelFontSize: 10,
    catAxisLabelColor: BRAND.textMuted,
    valAxisLabelFontFace: "Inter",
    valAxisLabelFontSize: 10,
    valAxisLabelColor: BRAND.textMuted,
    catGridLine: { style: "none" },
    valGridLine: { color: BRAND.bgTertiary, style: "solid", size: 1 },
  });

  return slide;
}
```

---

## Assembly Pattern

Every script follows this structure:

```javascript
const pptxgen = require("pptxgenjs");
let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";

// [Include BRAND constants and factory functions from above]
// [Include addHeader helper]
// [Include slide functions needed for this deck]

// ── Build the deck ─────────────────────────────────────────
addTitleSlide(pres, "Presentation Title", "Subtitle or date");
addBulletSlide(pres, "Agenda", ["Topic 1", "Topic 2", "Topic 3"], "Presentation Title");
addSectionSlide(pres, "Section One", "Presentation Title");
// ... more slides ...
addClosingSlide(pres, "Thank You", "email@listenlabs.com");

// ── Save ───────────────────────────────────────────────────
pres.writeFile({ fileName: "presentation.pptx" })
  .then(function() { console.log("Created presentation.pptx"); });
```

### Slide Order Best Practices

1. **Title slide** (dark) — always first
2. **Agenda/overview** (light) — optional but recommended for 8+ slide decks
3. **Content slides** (light) — the core of the deck, varied layouts
4. **Section dividers** (dark) — break up long decks into logical parts
5. **Key stat or quote** — punctuate sections with emphasis slides
6. **Closing slide** (dark) — always last
