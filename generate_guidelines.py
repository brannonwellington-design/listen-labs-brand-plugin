#!/usr/bin/env python3
"""
Generates GUIDELINES.md from the brand data in brand_data.py.

Run directly:  python3 generate_guidelines.py
Also runs automatically via the pre-commit hook.
"""

import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "GUIDELINES.md")

sys.path.insert(0, SCRIPT_DIR)
import brand_data as data


def fmt_rgba(val):
    """Convert rgba(..., 0.6) to a readable 'base at 60%' string."""
    m = re.match(r"rgba\((.+),\s*([\d.]+)\)", val)
    if m:
        pct = int(float(m.group(2)) * 100)
        return f"{pct}%"
    return None


def color_display(val):
    """Return a display string for a color value."""
    pct = fmt_rgba(val)
    if pct:
        # Extract the base hex from the rgba components
        m = re.match(r"rgba\(([\d]+),\s*([\d]+),\s*([\d]+)", val)
        if m:
            r, g, b = int(m.group(1)), int(m.group(2)), int(m.group(3))
            return f"`#{r:02X}{g:02X}{b:02X}` at {pct}"
    return f"`{val}`"


def build_token_table(colors, themes, section):
    """Build a markdown table with one column per theme/mode combination.

    colors: data.COLORS dict.
    themes: list of theme names (e.g. ["paper", "whisp"]).
    section: "content" or "surface".
    """
    headers = ["Token"]
    for theme in themes:
        for mode in ("light", "dark"):
            headers.append(f"{theme.title()} {mode.title()}")
    sep = ["---"] * len(headers)

    tokens = list(colors[themes[0]]["light"][section].keys())
    rows = []
    for token in tokens:
        cells = [f"`{token}`"]
        for theme in themes:
            for mode in ("light", "dark"):
                cells.append(color_display(colors[theme][mode][section][token]))
        rows.append("| " + " | ".join(cells) + " |")

    return "\n".join([
        "| " + " | ".join(headers) + " |",
        "|" + "|".join(sep) + "|",
        *rows,
    ])


def build_css_variable_section(css_vars, themes):
    blocks = []
    for theme in themes:
        blocks.append(
            f"#### {theme.title()}\n"
            "```css\n"
            f"{css_vars[theme]['light']}\n"
            "\n"
            f"{css_vars[theme]['dark']}\n"
            "```"
        )
    return "\n\n".join(blocks)


def build_emotion_token_table(emotions):
    rows = []
    for token, val in emotions.items():
        rows.append(f"| `{token}` | `{val}` |")
    return "\n".join(rows)


def build_emotion_css(emotions):
    lines = []
    for token, val in emotions.items():
        lines.append(f"--{token}: {val};")
    return "\n".join(lines)


def build_icon_table(sizing_table):
    rows = []
    for entry in sizing_table:
        rows.append(f"| {entry['text_size']} | {entry['icon_size']} | {entry['stroke_width']} |")
    return "\n".join(rows)


def build_grid_table(grid_presets):
    label_map = {
        "presentation_1920x1080": "Presentation slides (1920x1080)",
        "desktop_website": "Desktop website",
        "mobile_website": "Mobile website",
        "desktop_product": "Desktop product design",
        "mobile_product": "Mobile product design",
    }
    rows = []
    for key, preset in grid_presets.items():
        label = label_map.get(key, key)
        rows.append(f"| {label} | {preset['columns']} | {preset['margins']} | {preset['gutters']} |")
    return "\n".join(rows)


def build_height_table(heights):
    rows = []
    for size, height in heights.items():
        rows.append(f"| {size} | {height} |")
    return "\n".join(rows)


def generate(data):
    C = data.COLORS
    T = data.TYPOGRAPHY
    S = data.SPACING
    I = data.ICONS
    H = data.HEADER
    D = data.DATA_VISUALIZATION
    A = data.ART_DIRECTION
    V = data.CSS_VARIABLES
    THEMES = data.THEMES
    DEFAULT_THEME = data.DEFAULT_THEME
    default_light_surface = C[DEFAULT_THEME]["light"]["surface"]
    default_dark_surface = C[DEFAULT_THEME]["dark"]["surface"]
    default_light_content = C[DEFAULT_THEME]["light"]["content"]
    default_dark_content = C[DEFAULT_THEME]["dark"]["content"]

    type_scale_str = ", ".join(str(s) for s in T["type_scale_px"])
    radius_str = ", ".join(str(r) for r in S["border_radius_scale"])
    height_values = ", ".join(sorted(set(S["component_heights"].values()), key=lambda v: int(v.replace("px", ""))))

    core_principles = "\n".join(f"- **{p.split(' — ')[0]}.**{' ' + p.split(' — ', 1)[1] if ' — ' in p else ''}" for p in A["core_principles"])
    the_feel = "\n".join(f"- **{p.split(' — ')[0]}** — {p.split(' — ', 1)[1]}" for p in A["the_feel"])
    avoid_list = "\n".join(f"- {item}" for item in A["avoid"])

    dataviz_general = "\n".join(f"- {rule}" for rule in D["general_rules"])
    emotion_tokens_list = "\n".join(f"- `{t}`" for t in D["emotion_color_mapping"]["tokens"])

    return f"""<!-- AUTO-GENERATED from brand_data.py — do not edit manually -->
<!-- Run: python3 generate_guidelines.py -->

# Listen Labs Brand Guidelines

Apply these guidelines to **every** visual or document output. No exceptions unless the user explicitly overrides.

---

## Color Tokens

There are two themes: **Paper** (default — warm cream and brown) and **Whisp** (neutral grayscale). Both have light and dark modes. Use **Paper** unless the user or context calls for Whisp. Tokens are split into two categories: **content** (text and icons) and **surface** (backgrounds, fills, strokes, outlines, containers). Token names are identical across themes — only the values change.

---

### Content Tokens
*Used for text and icons only.*

{build_token_table(C, THEMES, "content")}

---

### Surface Tokens
*Used for backgrounds, container fills, strokes, and outlines.*

**Surface hierarchy:** `surface-primary` is the default canvas background. `surface-highlight` sits above the canvas and is reserved for elevated elements — active dropdown menus, chat input fields, and emphasis surfaces. It is used sparingly.

{build_token_table(C, THEMES, "surface")}

---

### Emotion Tokens
*Used exclusively for emotion-tagged data in interview/research contexts. Not for general UI. Shared across both themes.*

All emotion secondary tokens are 10% opacity in both light and dark mode.

| Token | Light & Dark |
|-------|-------------|
{build_emotion_token_table(C["emotion"])}

```css
{build_emotion_css(C["emotion"])}
```

---

### CSS Variables

{build_css_variable_section(V, THEMES)}

---

## Typography

- **Font**: Inter only — loaded from Google Fonts (`{T["font_import"]}`). Never use any other typeface. Serif fonts are strictly prohibited — this includes Georgia, Times New Roman, Playfair Display, and any other serif or slab-serif typeface, whether system-default or explicitly set.
- **Weight**: {T["font_weight"]}. This applies to every element without exception: headings, labels, body copy, captions, buttons, and any other text.
- **Letter spacing**: **Never add letter-spacing as a style.** Use default browser/system letter-spacing at all times. This is a hard brand rule.
- **Size**: Scale freely — large display type is encouraged for impact. Small type for secondary info is fine.
- **Type scale**: Use only these sizes (px): `{type_scale_str}` — never pick an arbitrary size outside this scale.
- **Case**: {T["case_rules"]} **Never use all caps under any circumstances** — not for headings, labels, metadata, tags, buttons, headers, or any other element. This is a hard rule with no exceptions.

```css
{T["css"]}
```

---

## Header / Title Convention

Most Listen Labs outputs include a branded header at the top center:

```
{H["format"]}
```

Rules:
- Positioned **top center**, **{H["position"].split(", ")[1]} from the top**
- {H["case"]}
- `Listen Labs /` is in **secondary content color**
- `Project Title` is in **primary content color**
- Both use the same font size — **default is {H["default_font_size"]}** for standalone pages, features, slides, tools, and artifacts. Only deviate if the context clearly calls for a larger display treatment.
- No letter-spacing added
- Single line, space-separated with a `/` divider

HTML example:
```html
{H["html_example"]}
```

---

## Art Direction

Listen Labs designs simulate the sensibility of **Dieter Rams** — the German industrial designer whose work defined what it means for something to be both beautiful and inevitable. When making any layout or composition decision, ask: *what would he remove, and what would he leave?*

### Core POV

{core_principles}

### The Listen Labs Feel
{the_feel}

### What to Avoid
{avoid_list}

---

## Spacing & Sizing System

All spacing, sizing, and layout values use **even numbers only**, building up from a **{S["base_unit"]} base unit**. Odd numbers are avoided across the entire system.

- **Responsive rule**: {S["responsive_rule"]}
- Minimum unit: **{S["base_unit"]}**
- Maximum common unit: **96px**
- All padding, margin, gap, width, height, offset, and positioning values should land on even numbers
- When in doubt, round to the nearest even number

---

## Grid Presets

Use these column grids as the layout foundation for each medium. Apply the correct preset based on context — don't guess or invent arbitrary gutters.

| Medium | Columns | Margins | Gutters |
|--------|---------|---------|---------|
{build_grid_table(S["grid_presets"])}

---

### Height Presets
Components (buttons, inputs, tags, etc.) snap to these heights:

| Size | Height |
|------|--------|
{build_height_table(S["component_heights"])}

### Border Radius Scale
Acceptable values only: `{radius_str}` — no arbitrary values.

{S["border_radius_notes"]}

---

## Icons

- **Library**: {I["library"]}
- **Principle**: {I["principle"]}
- **Sizing scale**: Match icon size and stroke to the text size it's paired with:

| Text size | Icon size | Stroke width |
|-----------|-----------|--------------|
{build_icon_table(I["sizing_table"])}

- {I["interpolation"]}
- {I["color_rule"]}

---

## Data Visualization

### Chart Types
- **Preferred**: {", ".join(D["chart_types"]["preferred"])} — {D["chart_types"]["notes"]}
- **Bar chart rules**: {D["chart_types"]["bar_chart_rules"]["corner_radius"]}. {D["chart_types"]["bar_chart_rules"]["inline_gap"]}.

### Color Usage
- **{D["color_usage"]["principle"]}**
- {D["color_usage"]["approach"]}

### Stroke Weight
- **{D["line_stroke_weight"]["default"]}**
- {D["line_stroke_weight"]["principle"]}

### Emotion Color Mapping
{D["emotion_color_mapping"]["rule"]}

Reserved tokens:
{emotion_tokens_list}

### General Rules
{dataviz_general}

---

## Medium-Specific Notes

### HTML / Web Artifacts
- Import Inter via Google Fonts in `<head>`
- Use CSS variables for all colors
- Default to light mode; add dark mode via `prefers-color-scheme` or a toggle if relevant
- Use `surface-primary` as the default canvas background
- `surface-highlight` reserved for elevated elements (dropdowns, inputs, emphasis)

*All values below reference the default theme ({DEFAULT_THEME.title()}). For {", ".join(t.title() for t in THEMES if t != DEFAULT_THEME)}, see the Color Tokens section above.*

### Canvas / Visualizations
- Background fill: `{default_light_surface["surface-primary"]}` (light) or `{default_dark_surface["surface-primary"]}` (dark) — i.e. `surface-primary`
- Draw text using Inter where possible (load as web font or use system fallback)
- Use `{default_light_content["content-brand"]}` sparingly for highlighted data points or accents
- **Multi-series data using brand blue**: when `{default_light_content["content-brand"]}` is used to fill data objects (bars, pie slices, lines, etc.), additional data series can use the same blue at descending opacity stops rather than introducing new colors. Choose stops that are visually distinct — e.g. 100%, 60%, 30% for three series, or 100%, 70%, 45%, 20% for four. Avoid stops so close together they're hard to tell apart.

### Presentations (PPTX)
- Slide background: `{default_light_surface["surface-primary"]}` (`surface-primary`)
- Primary text: `{default_light_content["content-primary"]}`
- Accent: `{default_light_content["content-brand"]}` for key callouts only
- Use Inter throughout; Regular weight only; never serif, never bold
- Header slide: large title in title case, centered, branded header convention at top

### Word Documents (DOCX)
- Page background or header area should evoke the default theme palette
- Inter Regular throughout; never serif, never bold
- Use `{default_light_content["content-brand"]}` for links or key highlights only

---

## Quick Reference

| Property | Value |
|----------|-------|
| Default theme | {DEFAULT_THEME.title()} |
| Available themes | {", ".join(t.title() for t in THEMES)} |
| Canvas / default bg (light) | `{default_light_surface["surface-primary"]}` (surface-primary) |
| Canvas / default bg (dark) | `{default_dark_surface["surface-primary"]}` (surface-primary) |
| Surface highlight (light) | `{default_light_surface["surface-highlight"]}` — elevated elements only |
| Surface highlight (dark) | `{default_dark_surface["surface-highlight"]}` — elevated elements only |
| Content primary (light) | `{default_light_content["content-primary"]}` |
| Content primary (dark) | `{default_dark_content["content-primary"]}` |
| Content secondary (light) | `{default_light_content["content-secondary"]}` |
| Content secondary (dark) | `{default_dark_content["content-secondary"]}` |
| Content disabled (light) | `{default_light_content["content-disabled"]}` |
| Content disabled (dark) | `{default_dark_content["content-disabled"]}` |
| Brand (light) | `{default_light_content["content-brand"]}` |
| Brand (dark) | `{default_dark_content["content-brand"]}` |
| Font | Inter only, 400 Regular only — never serif, never bold |
| Letter spacing | Default (never override) |
| Text case | Sentence or title case only — never all caps |
| Spacing unit | {S["base_unit"]} base, even numbers only |
| Component heights | {height_values} |
| Border radius | {radius_str}px — button default 8px |
| Shadows | None |
| Header format | `Listen Labs / Title` — top center, {H["position"].split(", ")[1]}, title case |
"""


if __name__ == "__main__":
    md = generate(data)
    with open(OUTPUT_PATH, "w") as f:
        f.write(md)
    print(f"Generated {OUTPUT_PATH}")
