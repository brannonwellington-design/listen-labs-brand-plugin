#!/usr/bin/env python3
"""
Generates the Listen Labs brand file used by the /research-artifacts skill
from the brand data in brand_data.py.

Output:
  skills/research-artifacts/references/brands/listen-labs.md

The research-artifacts skill separates brand-independent "physics" from the
per-brand "voice". The voice for Listen Labs lives in this generated file so
it can never drift from the values the MCP server and the brand site serve.
Any other brand file added to the same folder is authored by hand against
references/brands/_contract.md; the plugin ships with Listen Labs only.

Run directly:  python3 generate_brand_file.py
Also runs automatically via the pre-commit hook.
"""

import datetime
import os
import subprocess
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(
    SCRIPT_DIR, "skills", "research-artifacts", "references", "brands", "listen-labs.md"
)

sys.path.insert(0, SCRIPT_DIR)
import brand_data as data


def snapshot_date():
    """Date of the last commit touching brand_data.py; today if brand_data.py has uncommitted changes."""
    try:
        dirty = subprocess.run(
            ["git", "-C", SCRIPT_DIR, "status", "--porcelain", "--", "brand_data.py"],
            capture_output=True, text=True,
        ).stdout.strip()
        if dirty:
            return datetime.date.today().isoformat()
        out = subprocess.check_output(
            ["git", "-C", SCRIPT_DIR, "log", "-1", "--format=%cs", "--", "brand_data.py"],
            stderr=subprocess.DEVNULL,
            text=True,
        ).strip()
        if out:
            return out
    except Exception:
        pass
    return datetime.date.today().isoformat()


def css_root_block(theme):
    """Full light-mode token block for a theme, plus emotion tokens, as :root CSS."""
    light = data.COLORS[theme]["light"]
    lines = [f"/* ===== Listen Labs tokens — {theme.capitalize()} theme, light mode (DEFAULT) ===== */", ":root {"]
    for group, label in (("content", "Content"), ("surface", "Surface")):
        lines.append(f"  /* {label} */")
        for token, value in light[group].items():
            lines.append(f"  --{token}: {value};")
        lines.append("")
    lines.append("  /* Emotion tokens — RESERVED for the 6 Ekman emotions only */")
    for token, value in data.COLORS["emotion"].items():
        lines.append(f"  --{token}: {value};")
    lines.append("}")
    return "\n".join(lines)


def dark_overrides(theme):
    """Only the tokens whose dark value differs from light."""
    t = data.COLORS[theme]
    lines = []
    for group in ("content", "surface"):
        for token, value in t["dark"][group].items():
            if t["light"][group].get(token) != value:
                lines.append(f"--{token}: {value};")
        if group == "content":
            lines.append("")
    return "\n".join(lines).strip()


def diff_inline(theme, mode, against_theme="paper"):
    """One-line list of tokens that differ between a theme/mode and the default theme's same mode."""
    a = data.COLORS[theme][mode]
    b = data.COLORS[against_theme][mode]
    parts = []
    for group in ("content", "surface"):
        for token, value in a[group].items():
            if b[group].get(token) != value:
                parts.append(f"--{token}:{value};")
    return " ".join(parts)


def icon_table():
    rows = ["| Text size | Icon size | Stroke |", "|---|---|---|"]
    for r in data.ICONS["sizing_table"]:
        size = r["icon_size"].replace("px", "").replace("x", "×")
        rows.append(f"| {r['text_size']} | {size} | {r['stroke_width']} |")
    return "\n".join(rows)


def grid_presets_line():
    gp = data.SPACING["grid_presets"]
    order = [
        ("presentation_1920x1080", "presentation 1920×1080"),
        ("desktop_website", "desktop website"),
        ("desktop_product", "desktop product"),
        ("mobile_website", "mobile"),
    ]
    parts = []
    for key, label in order:
        p = gp[key]
        parts.append(
            f"{label} → {p['columns']} col / {p['margins']} margins / {p['gutters']} gutters"
            if key == "presentation_1920x1080"
            else f"{label} → {p['columns']} / {p['margins'].replace('px','')} / {p['gutters'].replace('px','')}"
        )
    return "; ".join(parts)


def component_heights_line():
    ch = data.SPACING["component_heights"]
    return ", ".join(f"{k} {v}" for k, v in ch.items())


def type_scale_line():
    return ", ".join(str(s) for s in data.TYPOGRAPHY["type_scale_px"])


def radius_scale_line():
    return ", ".join(str(r) for r in data.SPACING["border_radius_scale"])


def bullets(items):
    return "\n".join(f"- {i}" for i in items)


def generate():
    ad = data.ART_DIRECTION
    hdr = data.HEADER
    dv = data.DATA_VISUALIZATION
    rules = data.DATAVIZ_RULES
    caps = rules["category_caps"]
    brand_desc = data.DATAVIZ_PALETTES["brand"]["description"]
    global_desc = data.DATAVIZ_PALETTES["global"]["description"]
    feel = " · ".join(f.split(" — ")[0].lower() if " — " in f else f.lower() for f in ad["the_feel"])
    avoid = "; ".join(a[0].lower() + a[1:] for a in ad["avoid"])
    body_css = data.TYPOGRAPHY["css"].replace(
        "  /* never add letter-spacing */",
        "  color: var(--content-primary);\n  background: var(--surface-primary);\n  /* never add letter-spacing */",
    )
    emotion_rows = "\n".join(
        f"| {e.capitalize()} | `--emotion-{e}-primary` (`{data.COLORS['emotion']['emotion-' + e + '-primary']}`) | `--emotion-{e}-secondary` |"
        for e in ("anger", "happiness", "disgust", "surprise", "sadness", "fear")
    )
    principles = "\n".join(f"  - {p}" for p in ad["core_principles"])

    md = f"""# Listen Labs — brand file (default brand)

<!-- GENERATED FILE — do not edit by hand.
     Source: brand_data.py at the repo root. Regenerate with `python3 generate_brand_file.py`
     (the pre-commit hook does this automatically when brand_data.py changes). -->

> Answers the contract in `_contract.md`. Fields map 1:1; voice section at the bottom.

> **Source: `brand_data.py` (the same data the Listen Labs brand MCP serves) · Snapshot: {snapshot_date()}.**
> This file is regenerated from the repo's single source of truth, so it matches `get_full_guidelines` exactly.
> If the brand MCP is connected, you may still call it to confirm live values. Copy values verbatim, never approximate.

## Themes

Two themes. `{data.DEFAULT_THEME}` (warm cream/brown) is the default for all deliverables. `whisp` (neutral grayscale) only on explicit request. Each has light and dark modes; light is default.

## Core CSS — paste this block into every artifact

```css
{css_root_block(data.DEFAULT_THEME)}

{body_css}
```

Font import (put in `<head>`):
```html
<link href="{data.TYPOGRAPHY["font_import"]}" rel="stylesheet">
```

## {data.DEFAULT_THEME.capitalize()} theme — dark mode overrides

```css
{dark_overrides(data.DEFAULT_THEME)}
```
(All tokens not listed keep their light-mode values.)

## Whisp theme (on request only)

Light: `{diff_inline("whisp", "light")}` — brand/emotion/status tokens identical to {data.DEFAULT_THEME}.
Dark: `{diff_inline("whisp", "dark")}`

## Typography

- Family: **{data.TYPOGRAPHY["font_family"]}**. Weight: **{data.TYPOGRAPHY["font_weight"]}**.
- Letter-spacing: **{data.TYPOGRAPHY["letter_spacing"]}**.
- Type scale (px): {type_scale_line()}. Pick from the scale; don't invent sizes.
- Case: {data.TYPOGRAPHY["case_rules"]}
- Hierarchy = size jumps + color (primary vs secondary) + placement. Big numerals for key stats is the signature move.

## Spacing & shape

- Base unit **{data.SPACING["base_unit"]}**; {data.SPACING["rule"]}
- Component heights: {component_heights_line()}.
- Border radius scale: **{radius_scale_line()}**. {data.SPACING["border_radius_notes"]}
- Grid presets: {grid_presets_line()}.
- Responsive: {data.SPACING["responsive_rule"]}

## Icons

{data.ICONS["library"]}, inline SVG, colored same as accompanying text. {data.ICONS["principle"]}

{icon_table()}

Interpolation: {data.ICONS["interpolation"]}.

## Header convention

```html
{hdr["html_example"]}
```
{hdr["case"]}, both parts same size ({hdr["default_font_size"]} default), {hdr["position"].lower()}. {hdr["notes"]}

**Where it appears:** {hdr.get("where_it_appears", "")}

## Data-viz palette tokens

Two interchangeable modes with IDENTICAL token names. Default is **{rules["default_mode"]}** (monochromatic blue — lightness varies, hue and saturation never do). Switch to **global** (Okabe-Ito categorical / Viridis sequential / ColorBrewer RdBu diverging — all CVD-safe) when >5 distinct categories are needed or the user wants brand-agnostic best practices. Swap via `data-dataviz-palette="brand|global"` on any chart ancestor.

- Brand mode: {brand_desc}
- Global mode: {global_desc}

```css
{data.DATAVIZ_CSS}
```

### Palette rules

- Brand mode practical cap: **5 categorical series** (slots 6–8 degrade to neutral grays as a soft signal to switch to global mode).
- Soft max {caps["soft_max"]} categories (beyond that: direct data labels, not legend lookup). Hard max {caps["hard_max"]} (beyond: roll up to "Other").
- {rules["redundant_encoding"]}
- Contrast: {rules["contrast"]["rule"]}
- {rules["diverging_cvd"]}
- Grayscale check: {rules["grayscale"]}
- {rules["emotion_orthogonality"]}
- Construction rule for extending brand mode: {dv["color_usage"]["approach"]}

## Chart primitives

- Bar corner radius: {dv["chart_types"]["bar_chart_rules"]["corner_radius"]}; {dv["chart_types"]["bar_chart_rules"]["inline_gap"]}.
- Line weights: {dv["line_stroke_weight"]["default"]}; the story line may be 2px. {dv["line_stroke_weight"]["principle"]}
- Grid-line token: --content-disabled, horizontal only unless both axes continuous.
- Preferred chart types: {", ".join(dv["chart_types"]["preferred"])}. {dv["chart_types"]["notes"]}

## Strokes (general)

1px for structure — dividers, diagram edges, borders, axes, grid. 2px only for the named emphasis devices: a story line in a multi-line chart, the participant-quote left border, a winner underline in a matrix, an accent rule in a lockup. Heavier weight is never general emphasis; emphasis comes from scale and color role.

## Emotion tokens (product module)

{dv["emotion_color_mapping"]["rule"]}

| Emotion | Primary | Secondary (10% wash) |
|---|---|---|
{emotion_rows}

## Art direction (voice)

- Philosophy: {ad["philosophy"]}
- Core principles:
{principles}
- The feel: {feel}.
- Typography voice: Inter 400 ONLY — never bold, never light. Hierarchy by SIZE, color role, and position, never weight. Never override letter-spacing. Sentence case; Title Case only for the header and sparse metadata labels. Big numerals for key stats is the signature move.
- Avoid list (each instantly reads as off-brand): {avoid}.

## Precision & hygiene (Listen Labs house rules)

The brand-independent typographic precision rules (curly quotes, `…`, non-breaking value/unit spaces, `tabular-nums`, `text-wrap: balance` / `pretty`) and the web-output hygiene rules (`color-scheme`, `theme-color`, `:focus-visible`, `prefers-reduced-motion`, 44px touch targets, no hover-only states, scrollable tables) live in `skills/_shared/brand-compliance.md`. Apply them to every Listen Labs artifact; they are also sound defaults for any other brand unless that brand's file says otherwise.
"""
    return md


def main():
    md = generate()
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        f.write(md)
    print(f"Generated {os.path.relpath(OUTPUT_PATH, SCRIPT_DIR)}")


if __name__ == "__main__":
    main()
