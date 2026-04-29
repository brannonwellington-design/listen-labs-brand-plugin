#!/usr/bin/env python3
"""
Generates GUIDELINES.md from the brand data in listen-labs-brand-server.py.

Run directly:  python3 generate_guidelines.py
Also runs automatically via the pre-commit hook.
"""

import importlib.util
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_PATH = os.path.join(SCRIPT_DIR, "listen-labs-brand-server.py")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "GUIDELINES.md")


def load_server_data():
    spec = importlib.util.spec_from_file_location("brand_server", SERVER_PATH)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


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


def build_content_token_table(light_content, dark_content):
    rows = []
    for token in light_content:
        light_val = color_display(light_content[token])
        dark_val = color_display(dark_content[token])
        rows.append(f"| `{token}` | {light_val} | {dark_val} |")
    return "\n".join(rows)


def build_surface_token_table(light_surface, dark_surface):
    rows = []
    for token in light_surface:
        light_val = color_display(light_surface[token])
        dark_val = color_display(dark_surface[token])
        rows.append(f"| `{token}` | {light_val} | {dark_val} |")
    return "\n".join(rows)


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

    type_scale_str = ", ".join(str(s) for s in T["type_scale_px"])
    radius_str = ", ".join(str(r) for r in S["border_radius_scale"])
    height_values = ", ".join(sorted(set(S["component_heights"].values()), key=lambda v: int(v.replace("px", ""))))

    core_principles = "\n".join(f"- **{p.split(' — ')[0]}.**{' ' + p.split(' — ', 1)[1] if ' — ' in p else ''}" for p in A["core_principles"])
    the_feel = "\n".join(f"- **{p.split(' — ')[0]}** — {p.split(' — ', 1)[1]}" for p in A["the_feel"])
    avoid_list = "\n".join(f"- {item}" for item in A["avoid"])

    dataviz_general = "\n".join(f"- {rule}" for rule in D["general_rules"])
    emotion_tokens_list = "\n".join(f"- `{t}`" for t in D["emotion_color_mapping"]["tokens"])

    return f"""<!-- AUTO-GENERATED from listen-labs-brand-server.py — do not edit manually -->
<!-- Run: python3 generate_guidelines.py -->

# Listen Labs Brand Guidelines

Apply these guidelines to **every** visual or document output. No exceptions unless the user explicitly overrides.

---

## Color Tokens — Theme: Paper

The theme is called **Paper** and has light and dark modes. Tokens are split into two categories: **content** (text and icons) and **surface** (backgrounds, fills, strokes, outlines, containers).

---

### Content Tokens
*Used for text and icons only.*

| Token | Light (Paper) | Dark (Paper) |
|-------|--------------|-------------|
{build_content_token_table(C["light"]["content"], C["dark"]["content"])}

---

### Surface Tokens
*Used for backgrounds, container fills, strokes, and outlines.*

**Surface hierarchy:** `surface-primary` is the default canvas background. `surface-highlight` sits above the canvas and is reserved for elevated elements — active dropdown menus, chat input fields, and emphasis surfaces. It is used sparingly.

| Token | Light (Paper) | Dark (Paper) |
|-------|--------------|-------------|
{build_surface_token_table(C["light"]["surface"], C["dark"]["surface"])}

---

### Emotion Tokens
*Used exclusively for emotion-tagged data in interview/research contexts. Not for general UI.*

All emotion secondary tokens are 10% opacity in both light and dark mode.

| Token | Light & Dark |
|-------|-------------|
{build_emotion_token_table(C["emotion"])}

```css
{build_emotion_css(C["emotion"])}
```

---

### CSS Variables
```css
{V["light"]}

{V["dark"]}
```

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
| Surface highlight (light) | `#FBF9F4` — elevated elements only |
| Surface highlight (dark) | `#080603` — elevated elements only |
| Content primary (light) | `#120F08` |
| Content primary (dark) | `#F9F4EB` |
| Content secondary (light) | `#6B6861` |
| Content secondary (dark) | `#9E9B94` |
| Content disabled (light) | `#B6B4AF` |
| Content disabled (dark) | `#504E49` |
| Brand (light) | `#0021CC` |
| Brand (dark) | `#3354FF` |
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
    data = load_server_data()
    md = generate(data)
    with open(OUTPUT_PATH, "w") as f:
        f.write(md)
    print(f"Generated {OUTPUT_PATH}")
