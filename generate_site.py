#!/usr/bin/env python3
"""
Generates the public brand site (docs/) from brand_data.py.

Outputs:
  docs/index.html   — the one-page brand guideline (Paper theme, grid edition)
  docs/tokens.css   — CSS custom properties (Paper light + dark) + data-viz tokens
  docs/tokens.json  — full machine-readable token dump

Run directly:  python3 generate_site.py
Also runs automatically via the pre-commit hook.
Serve docs/ with GitHub Pages (Settings → Pages → main /docs).
"""

import datetime
import json
import os
import re
import subprocess
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(SCRIPT_DIR, "templates", "site_template.html")
LOGO_PATH = os.path.join(SCRIPT_DIR, "assets", "listen-labs-logo.svg")
DOCS_DIR = os.path.join(SCRIPT_DIR, "docs")

REPO_URL = "https://github.com/brannonwellington-design/listen-labs-brand-plugin"
INSTALL_CMD = (
    "curl -sL https://raw.githubusercontent.com/brannonwellington-design/"
    "listen-labs-brand-plugin/main/install.sh | bash"
)

sys.path.insert(0, SCRIPT_DIR)
import brand_data as data

LIGHT = data.COLORS["paper"]["light"]
DARK = data.COLORS["paper"]["dark"]
EMOTION = data.COLORS["emotion"]


# ── helpers ──────────────────────────────────────────────────────────────

def swatch(token, value, indent=12):
    pad = " " * indent
    return (
        f'{pad}<div><div class="chip h48" style="background:{value}"></div>'
        f'<div class="tok">{token}</div><div class="hex">{value}</div></div>'
    )


def css_decls(theme, indent):
    pad = " " * indent
    lines = []
    for group in ("content", "surface"):
        for token, value in theme[group].items():
            lines.append(f"{pad}--{token}: {value};")
    return "\n".join(lines)


def git_short_hash():
    try:
        return subprocess.check_output(
            ["git", "-C", SCRIPT_DIR, "rev-parse", "--short", "HEAD"],
            stderr=subprocess.DEVNULL, text=True,
        ).strip()
    except Exception:
        return None


# ── marker builders ──────────────────────────────────────────────────────

def build_markers():
    m = {}
    today = datetime.date.today()

    m["CSS_TOKENS_LIGHT"] = css_decls(LIGHT, 4)
    m["CSS_TOKENS_DARK"] = css_decls(DARK, 4)
    m["VERSION_LINE"] = f"Grid Edition · {today.strftime('%B %Y')}"

    # Logo: strip fill so the page recolors it via CSS; export JS re-adds black.
    logo_svg = open(LOGO_PATH).read()
    paths = re.findall(r"<path [^>]*/>", logo_svg)
    m["LOGO_PATHS"] = "\n              ".join(
        p.replace(' fill="black"', "") for p in paths
    )

    m["BRAND_PRIMARY"] = LIGHT["surface"]["surface-brand-primary"]
    m["BRAND_DARK"] = DARK["content"]["content-brand"]

    side = []
    for token in ("surface-brand-secondary",):
        v = LIGHT["surface"][token]
        side.append(
            f'          <div class="chip h48" style="background:{v}"></div>\n'
            f'          <div class="tok">{token}</div>\n'
            f'          <div class="hex">{v}</div>'
        )
    v = LIGHT["content"]["content-brand-secondary"]
    side.append(
        f'          <div class="chip h48" style="background:{v}; margin-top:16px"></div>\n'
        f'          <div class="tok">content-brand-secondary</div>\n'
        f'          <div class="hex">{v}</div>'
    )
    m["SWATCHES_BRAND_SIDE"] = "\n".join(side)

    content_order = [
        "content-primary", "content-secondary", "content-disabled",
        "content-complimentary", "content-warning", "content-negative",
        "content-positive",
    ]
    m["SWATCHES_CONTENT"] = "\n".join(
        swatch(t, LIGHT["content"][t]) for t in content_order
    )

    neutral_order = [
        "surface-highlight", "surface-primary", "surface-secondary",
        "surface-tertiary", "surface-inverse-primary", "surface-inverse-secondary",
    ]
    m["SWATCHES_SURFACE_NEUTRAL"] = "\n".join(
        swatch(t, LIGHT["surface"][t]) for t in neutral_order
    )

    semantic_order = [
        "surface-complimentary-primary", "surface-complimentary-secondary",
        "surface-warning-primary", "surface-warning-secondary",
        "surface-negative-primary", "surface-negative-secondary",
        "surface-positive-primary", "surface-positive-secondary",
    ]
    m["SWATCHES_SURFACE_SEMANTIC"] = "\n".join(
        swatch(t, LIGHT["surface"][t]) for t in semantic_order
    )

    emotion_rows = []
    for token, value in EMOTION.items():
        if token.endswith("-primary"):
            name = token.replace("emotion-", "").replace("-primary", "")
            emotion_rows.append(swatch(name, value))
    m["SWATCHES_EMOTION"] = "\n".join(emotion_rows)

    m["TYPE_SCALE"] = " · ".join(str(px) for px in data.TYPOGRAPHY["type_scale_px"])

    m["ROWS_HEIGHTS"] = "\n".join(
        f"            <tr><td>{k}</td><td>{v}</td></tr>"
        for k, v in data.SPACING["component_heights"].items()
    )

    preset_labels = {
        "presentation_1920x1080": "Presentation 1920×1080",
        "desktop_website": "Desktop website",
        "desktop_product": "Desktop product",
        "mobile_website": "Mobile website",
        "mobile_product": "Mobile product",
    }
    preset_rows = []
    for key, spec in data.SPACING["grid_presets"].items():
        label = preset_labels.get(key, key.replace("_", " ").capitalize())
        mg = f"{spec['margins'].replace('px', '')} / {spec['gutters']}"
        preset_rows.append(
            f"            <tr><td>{label}</td><td>{spec['columns']}</td><td>{mg}</td></tr>"
        )
    m["ROWS_GRID_PRESETS"] = "\n".join(preset_rows)

    m["RADIUS_DEMOS"] = "\n".join(
        f'            <div class="r" style="border-radius:{r}px">{r}</div>'
        if r else '            <div class="r" style="border-radius:0">0</div>'
        for r in data.SPACING["border_radius_scale"]
    )

    icon_rows = []
    for row in data.ICONS["sizing_table"]:
        icon = row["icon_size"].replace("px", "").replace("x", "×")
        icon_rows.append(
            f"            <tr><td>{row['text_size']}</td><td>{icon}</td>"
            f"<td>{row['stroke_width']}</td></tr>"
        )
    m["ROWS_ICONS"] = "\n".join(icon_rows)

    h = data.HEADER
    colors = (
        h["listen_labs_color"].replace("content-", "")
        + " / "
        + h["project_title_color"].replace("content-", "")
    )
    m["ROWS_HEADER"] = "\n".join([
        '            <tr><td>Format</td><td><span class="tier-2">Listen Labs /</span> Project Title</td></tr>',
        f"            <tr><td>Position</td><td>{h['position']}</td></tr>",
        f"            <tr><td>Size</td><td>{h['default_font_size']}, both parts equal</td></tr>",
        f"            <tr><td>Case</td><td>{h['case']}</td></tr>",
        f"            <tr><td>Colors</td><td>{colors}</td></tr>",
    ])

    brand_pal = data.DATAVIZ_PALETTES["brand"]

    def stop(color, bordered=False):
        border = "; border:1px solid var(--hairline)" if bordered else ""
        return f'            <div class="stop" style="background:{color}{border}"></div>'

    m["STRIP_CATEGORICAL"] = "\n".join(stop(c) for c in brand_pal["categorical"])
    m["STRIP_SEQUENTIAL"] = "\n".join(stop(c) for c in brand_pal["sequential"])
    div_order = ["neg-3", "neg-2", "neg-1", "zero", "pos-1", "pos-2", "pos-3"]
    m["STRIP_DIVERGING"] = "\n".join(
        stop(brand_pal["diverging"][k], bordered=(k == "zero")) for k in div_order
    )

    caps = data.DATAVIZ_RULES["category_caps"]
    m["CAP_SOFT"] = str(caps["soft_max"])
    m["CAP_HARD"] = str(caps["hard_max"])

    principle_cells = []
    for p in data.ART_DIRECTION["core_principles"]:
        if " — " in p:
            title, body = p.split(" — ", 1)
        else:
            title, body = p, ""
        body = body[:1].upper() + body[1:] + ("." if body and not body.endswith(".") else "")
        principle_cells.append(
            f'            <div class="principle"><div class="p-title">{title}</div>'
            f'<div class="p-body">{body}</div></div>'
        )
    m["PRINCIPLES"] = "\n".join(principle_cells)

    avoid = list(data.ART_DIRECTION["avoid"]) + ["Emotion tokens on non-emotion data"]
    half = (len(avoid) + 1) // 2
    m["AVOID_COL1"] = "\n".join(
        f'          <div class="avoid-item">{a}</div>' for a in avoid[:half]
    )
    m["AVOID_COL2"] = "\n".join(
        f'          <div class="avoid-item">{a}</div>' for a in avoid[half:]
    )

    m["INSTALL_CMD"] = INSTALL_CMD
    m["REPO_URL"] = REPO_URL

    stamp = today.isoformat()
    short = git_short_hash()
    if short:
        stamp += f" · {short}"
    m["STAMP"] = stamp

    return m


# ── outputs ──────────────────────────────────────────────────────────────

def render_index(markers):
    html = open(TEMPLATE_PATH).read()
    for key, value in markers.items():
        html = html.replace("{{" + key + "}}", value)
    leftover = re.findall(r"\{\{[A-Z_]+\}\}", html)
    if leftover:
        raise SystemExit(f"Unfilled template markers: {sorted(set(leftover))}")
    return html


def render_tokens_css():
    def decls(theme, indent):
        pad = " " * indent
        lines = []
        for group in ("content", "surface"):
            for token, value in theme[group].items():
                lines.append(f"{pad}--{token}: {value};")
        return "\n".join(lines)

    emotion = "\n".join(
        f"  --{token}: {value};" for token, value in EMOTION.items()
    )
    return "\n".join([
        "/* Listen Labs design tokens — Paper theme.",
        f" * Generated from brand_data.py (COLORS) — do not edit by hand. {datetime.date.today().isoformat()}",
        f" * Source: {REPO_URL}",
        " * Dark mode applies via data-theme=\"dark\" on <html>, or via OS preference",
        " * unless data-theme=\"light\" explicitly opts out. */",
        "",
        ":root {",
        decls(LIGHT, 2),
        "",
        "  /* Emotion tokens — reserved for the 6 Ekman emotions */",
        emotion,
        "}",
        "",
        ':root[data-theme="dark"] {',
        decls(DARK, 2),
        "}",
        "",
        "@media (prefers-color-scheme: dark) {",
        '  :root:not([data-theme="light"]) {',
        decls(DARK, 4),
        "  }",
        "}",
        "",
        data.DATAVIZ_CSS,
        "",
    ])


def render_tokens_json():
    payload = {
        "meta": {
            "brand": "Listen Labs",
            "theme": "paper",
            "generated": datetime.date.today().isoformat(),
            "commit": git_short_hash(),
            "source": REPO_URL,
        },
        "colors": data.COLORS,
        "typography": data.TYPOGRAPHY,
        "spacing": data.SPACING,
        "icons": data.ICONS,
        "header": data.HEADER,
        "data_visualization": data.DATA_VISUALIZATION,
        "dataviz_palettes": data.DATAVIZ_PALETTES,
        "dataviz_rules": data.DATAVIZ_RULES,
        "art_direction": data.ART_DIRECTION,
    }
    return json.dumps(payload, indent=2)


def main():
    os.makedirs(DOCS_DIR, exist_ok=True)
    markers = build_markers()

    with open(os.path.join(DOCS_DIR, "index.html"), "w") as f:
        f.write(render_index(markers))
    with open(os.path.join(DOCS_DIR, "tokens.css"), "w") as f:
        f.write(render_tokens_css())
    with open(os.path.join(DOCS_DIR, "tokens.json"), "w") as f:
        f.write(render_tokens_json())

    nojekyll = os.path.join(DOCS_DIR, ".nojekyll")
    if not os.path.exists(nojekyll):
        open(nojekyll, "w").close()

    print("Generated docs/index.html, docs/tokens.css, docs/tokens.json")


if __name__ == "__main__":
    main()
