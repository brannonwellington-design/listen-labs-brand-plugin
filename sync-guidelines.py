#!/usr/bin/env python3
"""
Generates GUIDELINES.md from the MCP server's brand data.

The server (listen-labs-brand-server.py) is the single source of truth.
Run this after editing the server to keep GUIDELINES.md in sync:

    python3 sync-guidelines.py

This is also run automatically via a pre-commit hook.
"""

import importlib.util
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_PATH = os.path.join(SCRIPT_DIR, "listen-labs-brand-server.py")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "GUIDELINES.md")

# Import the server module to access its data
spec = importlib.util.spec_from_file_location("server", SERVER_PATH)
server = importlib.util.module_from_spec(spec)
# Suppress the server's main() from running
sys.modules["server"] = server
spec.loader.exec_module(server)


def color_display(value):
    """Convert rgba values to human-readable format."""
    if value.startswith("rgba("):
        # Extract opacity
        parts = value.rstrip(")").split(",")
        opacity = parts[-1].strip()
        # Find the base hex from the token name context
        return f"`{value.split('(')[1].split(',')[0].strip()}` at {int(float(opacity) * 100)}%"
    return f"`{value}`"


def build_color_table(light_tokens, dark_tokens, category):
    """Build a markdown table for a color category."""
    lines = []
    lines.append(f"| Token | Light (Paper) | Dark (Paper) |")
    lines.append(f"|-------|--------------|-------------|")
    for token in light_tokens:
        light_val = light_tokens[token]
        dark_val = dark_tokens.get(token, light_val)
        # Format display values
        if "rgba" in str(light_val):
            parts = light_val.rstrip(")").split(",")
            base = parts[0].replace("rgba(", "").strip()
            pct = int(float(parts[-1].strip()) * 100)
            light_disp = f"`#{base}` at {pct}%" if base.startswith("#") else f"`{base}` at {pct}%"
            # Convert RGB to approximate display
            light_disp = f"`{light_tokens[token.replace('-secondary', '-primary').replace('-disabled', '-primary').replace('-inverse-secondary', '-inverse-primary')]}`" if False else f"at {pct}%"
        lines.append(f"| `{token}` | `{light_val}` | `{dark_val}` |")
    return "\n".join(lines)


def generate():
    COLORS = server.COLORS
    TYPOGRAPHY = server.TYPOGRAPHY
    SPACING = server.SPACING
    ICONS = server.ICONS
    HEADER = server.HEADER
    DATA_VIS = server.DATA_VISUALIZATION
    ART = server.ART_DIRECTION
    CSS = server.CSS_VARIABLES

    # --- Build the markdown ---
    sections = []

    sections.append("""# Listen Labs Brand Guidelines

Apply these guidelines to **every** visual or document output. No exceptions unless the user explicitly overrides.

---

## Color Tokens — Theme: Paper

The theme is called **Paper** and has light and dark modes. Tokens are split into two categories: **content** (text and icons) and **surface** (backgrounds, fills, strokes, outlines, containers).

---

### Content Tokens
*Used for text and icons only.*

| Token | Light (Paper) | Dark (Paper) |
|-------|--------------|-------------|""")

    for token, light_val in COLORS["light"]["content"].items():
        dark_val = COLORS["dark"]["content"].get(token, light_val)
        lv = format_val(light_val)
        dv = format_val(dark_val)
        sections.append(f"| `{token}` | {lv} | {dv} |")

    sections.append("""
---

### Surface Tokens
*Used for backgrounds, container fills, strokes, and outlines.*

**Surface hierarchy:** `surface-primary` is the default canvas background. `surface-highlight` sits above the canvas and is reserved for elevated elements — active dropdown menus, chat input fields, and emphasis surfaces. It is used sparingly.

| Token | Light (Paper) | Dark (Paper) |
|-------|--------------|-------------|""")

    for token, light_val in COLORS["light"]["surface"].items():
        dark_val = COLORS["dark"]["surface"].get(token, light_val)
        lv = format_val(light_val)
        dv = format_val(dark_val)
        sections.append(f"| `{token}` | {lv} | {dv} |")

    sections.append("""
---

### Emotion Tokens
*Used exclusively for emotion-tagged data in interview/research contexts. Not for general UI.*

All emotion secondary tokens are 10% opacity in both light and dark mode.

| Token | Light & Dark |
|-------|-------------|""")

    for token, val in COLORS["emotion"].items():
        sections.append(f"| `{token}` | `{val}` |")

    # Emotion CSS block
    sections.append("\n```css")
    for token, val in COLORS["emotion"].items():
        sections.append(f"--{token}: {val};")
    sections.append("```")

    # CSS Variables
    sections.append(f"""
---

### CSS Variables
```css
{CSS['light']}

{CSS['dark']}
```

---

## Typography

- **Font**: Inter only — loaded from Google Fonts (`{TYPOGRAPHY['font_import']}`). Never use any other typeface. Serif fonts are strictly prohibited — this includes Georgia, Times New Roman, Playfair Display, and any other serif or slab-serif typeface, whether system-default or explicitly set.
- **Weight**: {TYPOGRAPHY['font_weight']}. This applies to every element without exception: headings, labels, body copy, captions, buttons, and any other text.
- **Letter spacing**: **Never add letter-spacing as a style.** Use default browser/system letter-spacing at all times. This is a hard brand rule.
- **Size**: Scale freely — large display type is encouraged for impact. Small type for secondary info is fine.
- **Type scale**: Use only these sizes (px): `{', '.join(str(s) for s in TYPOGRAPHY['type_scale_px'])}` — never pick an arbitrary size outside this scale.
- **Case**: {TYPOGRAPHY['case_rules']} **Never use all caps under any circumstances** — not for headings, labels, metadata, tags, buttons, headers, or any other element. This is a hard rule with no exceptions.

```css
{TYPOGRAPHY['css']}
```

---

## Header / Title Convention

Most Listen Labs outputs include a branded header at the top center:

```
{HEADER['format']}
```

Rules:
- Positioned **top center**, **{HEADER['position'].split(', ')[1]} from the top**
- {HEADER['case']}
- `Listen Labs /` is in **secondary content color** (60% opacity)
- `Project Title` is in **primary content color**
- Both use the same font size — **default is {HEADER['default_font_size']}** for standalone pages, features, slides, tools, and artifacts. Only deviate if the context clearly calls for a larger display treatment.
- No letter-spacing added
- Single line, space-separated with a `/` divider

HTML example:
```html
{HEADER['html_example']}
```

---

## Art Direction

Listen Labs designs simulate the sensibility of **Dieter Rams** — the German industrial designer whose work defined what it means for something to be both beautiful and inevitable. When making any layout or composition decision, ask: *what would he remove, and what would he leave?*

### Core POV
""")

    for p in ART["core_principles"]:
        sections.append(f"- **{p.split(' — ')[0]}.**" + (f" {p.split(' — ')[1]}" if " — " in p else ""))

    sections.append("""
### The Listen Labs Feel""")
    for f in ART["the_feel"]:
        sections.append(f"- **{f.split(' — ')[0]}** — {f.split(' — ')[1]}" if " — " in f else f"- {f}")

    sections.append("""
### What to Avoid""")
    for a in ART["avoid"]:
        sections.append(f"- {a}")

    # Spacing
    sections.append(f"""
---

## Spacing & Sizing System

All spacing, sizing, and layout values use **even numbers only**, building up from a **{SPACING['base_unit']} base unit**. Odd numbers are avoided across the entire system.

- Minimum unit: **{SPACING['base_unit']}**
- Maximum common unit: **96px**
- All padding, margin, gap, width, height, offset, and positioning values should land on even numbers
- When in doubt, round to the nearest even number

---

## Grid Presets

Use these column grids as the layout foundation for each medium. Apply the correct preset based on context — don't guess or invent arbitrary gutters.

| Medium | Columns | Margins | Gutters |
|--------|---------|---------|---------|""")

    grid_labels = {
        "presentation_1920x1080": "Presentation slides (1920x1080)",
        "desktop_website": "Desktop website",
        "mobile_website": "Mobile website",
        "desktop_product": "Desktop product design",
        "mobile_product": "Mobile product design",
    }
    for key, preset in SPACING["grid_presets"].items():
        label = grid_labels.get(key, key)
        sections.append(f"| {label} | {preset['columns']} | {preset['margins']} | {preset['gutters']} |")

    sections.append("""
---

### Height Presets
Components (buttons, inputs, tags, etc.) snap to these heights:

| Size | Height |
|------|--------|""")

    for size, height in SPACING["component_heights"].items():
        sections.append(f"| {size} | {height} |")

    sections.append(f"""
### Border Radius Scale
Acceptable values only: `{', '.join(str(r) for r in SPACING['border_radius_scale'])}` — no arbitrary values.

{SPACING['border_radius_notes']}

---

## Icons

- **Library**: {ICONS['library']}
- **Principle**: {ICONS['principle']}
- **Sizing scale**: Match icon size and stroke to the text size it's paired with:

| Text size | Icon size | Stroke width |
|-----------|-----------|--------------|""")

    for row in ICONS["sizing_table"]:
        sections.append(f"| {row['text_size']} | {row['icon_size']} | {row['stroke_width']} |")

    sections.append(f"""
- {ICONS['interpolation']}
- {ICONS['color_rule']}

---

## Data Visualization

### Chart Types
- **Preferred**: {', '.join(DATA_VIS['chart_types']['preferred'])} — {DATA_VIS['chart_types']['notes']}
- **Bar chart rules**: {DATA_VIS['chart_types']['bar_chart_rules']['corner_radius']}. {DATA_VIS['chart_types']['bar_chart_rules']['inline_gap']}.

### Color Usage
- **{DATA_VIS['color_usage']['principle']}**
- {DATA_VIS['color_usage']['approach']}

### Stroke Weight
- **{DATA_VIS['line_stroke_weight']['default']}**
- {DATA_VIS['line_stroke_weight']['principle']}

### Emotion Color Mapping
{DATA_VIS['emotion_color_mapping']['rule']}

Reserved tokens:""")

    for t in DATA_VIS["emotion_color_mapping"]["tokens"]:
        sections.append(f"- `{t}`")

    sections.append("""
### General Rules""")
    for rule in DATA_VIS["general_rules"]:
        sections.append(f"- {rule}")

    sections.append("""
---

## Medium-Specific Notes

### HTML / Web Artifacts
- Import Inter via Google Fonts in `<head>`
- Use CSS variables for all colors
- Default to light mode; add dark mode via `prefers-color-scheme` or a toggle if relevant
- Use `surface-primary` as the default canvas background
- `surface-highlight` reserved for elevated elements (dropdowns, inputs, emphasis)

### Canvas / Visualizations
- Background fill: `#F9F4EB` (light) or `#130F06` (dark) — i.e. `surface-primary`
- Draw text using Inter where possible (load as web font or use system fallback)
- Use `#0021CC` sparingly for highlighted data points or accents
- **Multi-series data using brand blue**: when `#0021CC` is used to fill data objects (bars, pie slices, lines, etc.), additional data series can use the same blue at descending opacity stops rather than introducing new colors. Choose stops that are visually distinct — e.g. 100%, 60%, 30% for three series, or 100%, 70%, 45%, 20% for four. Avoid stops so close together they're hard to tell apart.

### Presentations (PPTX)
- Slide background: `#F9F4EB` (`surface-primary`)
- Primary text: `#120F08`
- Accent: `#0021CC` for key callouts only
- Use Inter throughout; Regular weight only; never serif, never bold
- Header slide: large title in title case, centered, branded header convention at top

### Word Documents (DOCX)
- Page background or header area should evoke the warm palette
- Inter Regular throughout; never serif, never bold
- Use `#0021CC` for links or key highlights only

---

## Quick Reference

| Property | Value |
|----------|-------|
| Canvas / default bg (light) | `#F9F4EB` (surface-primary) |
| Canvas / default bg (dark) | `#130F06` (surface-primary) |
| Surface highlight (light) | `#FCFBF7` — elevated elements only |
| Surface highlight (dark) | `#080603` — elevated elements only |
| Content primary (light) | `#120F08` |
| Content primary (dark) | `#F9F4EB` |
| Content secondary | 60% opacity of content primary |
| Content disabled | 30% opacity of content primary |
| Brand | `#0021CC` |
| Font | Inter only, 400 Regular only — never serif, never bold |
| Letter spacing | Default (never override) |
| Text case | Sentence or title case only — never all caps |
| Spacing unit | 4px base, even numbers only |
| Component heights | 12, 16, 20, 24, 32px |
| Border radius | 0, 2, 4, 8, 12, 16px — button default 8px |
| Shadows | None |
| Header format | `Listen Labs / Title` — top center, 24px from top, title case |
""")

    md = "\n".join(sections)

    with open(OUTPUT_PATH, "w") as f:
        f.write(md)

    print(f"Generated {OUTPUT_PATH}")
    print(f"  Sections: colors, typography, header, art direction, spacing, icons, data viz, medium notes, quick ref")


def format_val(val):
    """Format a color value for the markdown table."""
    if val.startswith("rgba("):
        parts = val.rstrip(")").split(",")
        pct = int(float(parts[-1].strip()) * 100)
        # Get the hex base from the primary token
        r, g, b = int(parts[0].replace("rgba(", "").strip()), int(parts[1].strip()), int(parts[2].strip())
        hex_val = f"#{r:02X}{g:02X}{b:02X}"
        return f"`{hex_val}` at {pct}%"
    return f"`{val}`"


if __name__ == "__main__":
    generate()
