"""
Listen Labs brand data — the single source of truth for colors, typography,
spacing, icons, header conventions, data viz rules, art direction, and CSS
variable blocks.

Imported by:
- listen-labs-brand-server.py (exposes this data via MCP tools)
- generate_guidelines.py (renders this data into GUIDELINES.md)

Edit values here. The pre-commit hook regenerates GUIDELINES.md automatically.
"""

THEMES = ["paper", "whisp"]
DEFAULT_THEME = "paper"

COLORS = {
    "paper": {
        "light": {
            "content": {
                "content-primary": "#120F08",
                "content-secondary": "#6B6861",
                "content-inverse-primary": "#F9F4EB",
                "content-inverse-secondary": "#9E9B94",
                "content-disabled": "#B6B4AF",
                "content-inverse-disabled": "#504E49",
                "content-brand": "#0021CC",
                "content-brand-secondary": "#7A85B8",
                "content-brand-contrast": "#F9F4EB",
                "content-brand-contrast-secondary": "#9CA3C9",
                "content-complimentary": "#B88114",
                "content-warning": "#B85814",
                "content-negative": "#B82214",
                "content-positive": "#0F8A38",
            },
            "surface": {
                "surface-highlight": "#FBF9F4",
                "surface-primary": "#F9F4EB",
                "surface-secondary": "#EEE8DD",
                "surface-tertiary": "#E2DCCF",
                "surface-inverse-primary": "#120F08",
                "surface-inverse-secondary": "#1F1B14",
                "surface-brand-primary": "#0021CC",
                "surface-brand-secondary": "#D9DDF2",
                "surface-complimentary-primary": "#E5A119",
                "surface-complimentary-secondary": "#F5EBD6",
                "surface-warning-primary": "#CF6317",
                "surface-warning-secondary": "#F5E3D6",
                "surface-negative-primary": "#CF2617",
                "surface-negative-secondary": "#F5D9D6",
                "surface-positive-primary": "#14B84B",
                "surface-positive-secondary": "#D6F5E0",
            },
        },
        "dark": {
            "content": {
                "content-primary": "#F9F4EB",
                "content-secondary": "#9E9B94",
                "content-inverse-primary": "#120F08",
                "content-inverse-secondary": "#6B6861",
                "content-disabled": "#504E49",
                "content-inverse-disabled": "#B6B4AF",
                "content-brand": "#3354FF",
                "content-brand-secondary": "#7A85B8",
                "content-brand-contrast": "#F9F4EB",
                "content-brand-contrast-secondary": "#9CA3C9",
                "content-complimentary": "#B88114",
                "content-warning": "#B85814",
                "content-negative": "#B82214",
                "content-positive": "#0F8A38",
            },
            "surface": {
                "surface-highlight": "#080603",
                "surface-primary": "#130F06",
                "surface-secondary": "#201C13",
                "surface-tertiary": "#30291D",
                "surface-inverse-primary": "#F9F4EB",
                "surface-inverse-secondary": "#F0E9DB",
                "surface-brand-primary": "#0021CC",
                "surface-brand-secondary": "#131939",
                "surface-complimentary-primary": "#E5A119",
                "surface-complimentary-secondary": "#F5EBD6",
                "surface-warning-primary": "#CF6317",
                "surface-warning-secondary": "#F5E3D6",
                "surface-negative-primary": "#CF2617",
                "surface-negative-secondary": "#F5D9D6",
                "surface-positive-primary": "#14B84B",
                "surface-positive-secondary": "#D6F5E0",
            },
        },
    },
    "whisp": {
        "light": {
            "content": {
                "content-primary": "#1A1A1A",
                "content-secondary": "#666666",
                "content-inverse-primary": "#E5E5E5",
                "content-inverse-secondary": "#999999",
                "content-disabled": "#B2B2B2",
                "content-inverse-disabled": "#4D4D4D",
                "content-brand": "#0021CC",
                "content-brand-secondary": "#7A85B8",
                "content-brand-contrast": "#E5E5E5",
                "content-brand-contrast-secondary": "#9CA3C9",
                "content-complimentary": "#B88114",
                "content-warning": "#B85814",
                "content-negative": "#B82214",
                "content-positive": "#0F8A38",
            },
            "surface": {
                "surface-highlight": "#FFFFFF",
                "surface-primary": "#FAFAFA",
                "surface-secondary": "#F0F0F0",
                "surface-tertiary": "#E0E0E0",
                "surface-inverse-primary": "#1A1A1A",
                "surface-inverse-secondary": "#262626",
                "surface-brand-primary": "#0021CC",
                "surface-brand-secondary": "#D9DDF2",
                "surface-complimentary-primary": "#E5A119",
                "surface-complimentary-secondary": "#F5EBD6",
                "surface-warning-primary": "#CF6317",
                "surface-warning-secondary": "#F5E3D6",
                "surface-negative-primary": "#CF2617",
                "surface-negative-secondary": "#F5D9D6",
                "surface-positive-primary": "#14B84B",
                "surface-positive-secondary": "#D6F5E0",
            },
        },
        "dark": {
            "content": {
                "content-primary": "#E5E5E5",
                "content-secondary": "#999999",
                "content-inverse-primary": "#1A1A1A",
                "content-inverse-secondary": "#666666",
                "content-disabled": "#4D4D4D",
                "content-inverse-disabled": "#B2B2B2",
                "content-brand": "#3354FF",
                "content-brand-secondary": "#7A85B8",
                "content-brand-contrast": "#E5E5E5",
                "content-brand-contrast-secondary": "#9CA3C9",
                "content-complimentary": "#B88114",
                "content-warning": "#B85814",
                "content-negative": "#B82214",
                "content-positive": "#0F8A38",
            },
            "surface": {
                "surface-highlight": "#000000",
                "surface-primary": "#1A1A1A",
                "surface-secondary": "#262626",
                "surface-tertiary": "#333333",
                "surface-inverse-primary": "#FAFAFA",
                "surface-inverse-secondary": "#F0F0F0",
                "surface-brand-primary": "#0021CC",
                "surface-brand-secondary": "#131939",
                "surface-complimentary-primary": "#E5A119",
                "surface-complimentary-secondary": "#F5EBD6",
                "surface-warning-primary": "#CF6317",
                "surface-warning-secondary": "#F5E3D6",
                "surface-negative-primary": "#CF2617",
                "surface-negative-secondary": "#F5D9D6",
                "surface-positive-primary": "#14B84B",
                "surface-positive-secondary": "#D6F5E0",
            },
        },
    },
    "emotion": {
        "emotion-anger-primary": "#BF4040",
        "emotion-anger-secondary": "rgba(191, 64, 64, 0.10)",
        "emotion-happiness-primary": "#D99E26",
        "emotion-happiness-secondary": "rgba(217, 158, 38, 0.10)",
        "emotion-disgust-primary": "#80BF40",
        "emotion-disgust-secondary": "rgba(128, 191, 64, 0.10)",
        "emotion-surprise-primary": "#40BFAA",
        "emotion-surprise-secondary": "rgba(64, 191, 170, 0.10)",
        "emotion-sadness-primary": "#406ABF",
        "emotion-sadness-secondary": "rgba(64, 106, 191, 0.10)",
        "emotion-fear-primary": "#9540BF",
        "emotion-fear-secondary": "rgba(149, 64, 191, 0.10)",
    },
}

TYPOGRAPHY = {
    "font_family": "Inter",
    "font_import": "https://fonts.googleapis.com/css2?family=Inter&display=swap",
    "font_weight": "400 (Regular only — never bold, never thin/light)",
    "letter_spacing": "Default only — never override letter-spacing",
    "type_scale_px": [6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128],
    "case_rules": "Standard sentence/title case for headlines and body. Title Case is used for the project header (Listen Labs / Title) and sparse metadata labels.",
    "css": "body {\n  font-family: 'Inter', sans-serif;\n  font-weight: 400;\n  /* never add letter-spacing */\n}",
}

SPACING = {
    "base_unit": "4px",
    "rule": "All spacing, sizing, and layout values use even numbers only. Minimum 4px, maximum common 96px.",
    "responsive_rule": "All elements must flex horizontally without skewing or scaling improperly — circles stay circular, squares stay square, aspect-locked shapes never distort regardless of container width.",
    "component_heights": {
        "XL": "32px",
        "L": "24px",
        "M": "20px",
        "S": "16px",
        "XS": "12px",
    },
    "border_radius_scale": [0, 2, 4, 8, 12, 16],
    "border_radius_notes": "Button default: 8px. Concentric nesting: inner element radius < container radius (e.g., 8px inner → 12px or 16px container).",
    "grid_presets": {
        "presentation_1920x1080": {"columns": 12, "margins": "40px", "gutters": "40px"},
        "desktop_website": {"columns": 12, "margins": "24px", "gutters": "24px"},
        "mobile_website": {"columns": 4, "margins": "16px", "gutters": "16px"},
        "desktop_product": {"columns": 12, "margins": "16px", "gutters": "16px"},
        "mobile_product": {"columns": 4, "margins": "16px", "gutters": "16px"},
    },
}

ICONS = {
    "library": "Lucide only",
    "principle": "Icon line weight should visually match the weight of nearby typography (Inter Regular).",
    "sizing_table": [
        {"text_size": "8px", "icon_size": "10x10px", "stroke_width": "0.75px"},
        {"text_size": "10px", "icon_size": "12x12px", "stroke_width": "1px"},
        {"text_size": "12px", "icon_size": "14x14px", "stroke_width": "1px"},
        {"text_size": "14px", "icon_size": "16x16px", "stroke_width": "1.25px"},
        {"text_size": "16px", "icon_size": "18x18px", "stroke_width": "1.25px"},
        {"text_size": "18px", "icon_size": "20x20px", "stroke_width": "1.5px"},
        {"text_size": "20px", "icon_size": "22x22px", "stroke_width": "1.75px"},
        {"text_size": "24px+", "icon_size": "24x24px", "stroke_width": "2px"},
    ],
    "color_rule": "Icons use the same color as accompanying text (primary or secondary content color).",
    "interpolation": "icon size ≈ text size + 2px, stroke ≈ scaled proportionally from 0.75px (at 8px text) to 2px (at 24px text)",
}

HEADER = {
    "format": "Listen Labs / Project Title",
    "position": "Top center, 24px from top",
    "case": "Title Case always",
    "listen_labs_color": "content-secondary",
    "project_title_color": "content-primary",
    "default_font_size": "12px",
    "notes": "Both parts use the same font size. Default 12px for standalone pages/artifacts. Single line, space-separated with / divider. No letter-spacing.",
    "html_example": '''<div style="text-align:center; position:absolute; top:24px; left:0; right:0; font-family:'Inter',sans-serif; font-weight:400; font-size:12px;">
  <span style="color: var(--content-secondary)">Listen Labs /</span>
  <span style="color: var(--content-primary)"> Project Title</span>
</div>''',
}

DATA_VISUALIZATION = {
    "chart_types": {
        "preferred": ["bar", "line"],
        "notes": "Bar and line charts work for almost anything and are very flexible. Default to these unless the data specifically demands another format.",
        "bar_chart_rules": {
            "corner_radius": "2px rounded corners on bar sections",
            "inline_gap": "1px padding gap between bars that are in-line with each other",
        },
    },
    "color_usage": {
        "principle": "Monochromatic by default. Use the primary brand color (#0021CC) as the base, then increase or decrease the Lightness (HSL) to produce additional shades for multi-series data.",
        "approach": "Adjust L value in HSL while keeping H and S constant for a cohesive, monochromatic palette. Prefer fewer distinct hues — lean on lightness variation before introducing new colors.",
        "palette_modes": "Two interchangeable palette modes are exposed via --dataviz-* tokens: 'brand' (default — monochromatic brand-blue) and 'global' (best-practices, brand-agnostic — Okabe-Ito categorical, Viridis sequential, ColorBrewer RdBu diverging). Swap by setting data-dataviz-palette=\"brand|global\" on any ancestor of the chart. Token names are identical across modes; only resolved values differ. See DATAVIZ_PALETTES for the full specification.",
    },
    "line_stroke_weight": {
        "default": "1px consistent stroke on all chart elements — axes, grid lines, data lines, borders",
        "principle": "Opt for fewer lines rather than more. Minimalism without sacrificing function — remove any line that doesn't aid comprehension.",
    },
    "emotion_color_mapping": {
        "rule": "Emotion color tokens are exclusively reserved for the 6 core Ekman emotions (anger, happiness, disgust, surprise, sadness, fear). Never use emotion tokens for general data series, categories, or any purpose outside of Listen Labs emotional intelligence features. Emotion tokens are orthogonal to the brand/global palette modes.",
        "tokens": [
            "emotion-anger-primary / secondary",
            "emotion-happiness-primary / secondary",
            "emotion-disgust-primary / secondary",
            "emotion-surprise-primary / secondary",
            "emotion-sadness-primary / secondary",
            "emotion-fear-primary / secondary",
        ],
    },
    "general_rules": [
        "Use even-number spacing values consistent with the brand spacing system (4px base unit).",
        "Labels and annotations follow brand typography rules — Inter Regular 400, no letter-spacing overrides.",
        "Grid lines use content-disabled to stay subordinate to data.",
        "One dominant data story per chart — avoid overloading a single visualization with competing narratives.",
    ],
}

# ─── Data-Viz Palettes (brand vs. global, swappable) ────────────────────────
#
# Two parallel palettes share the same --dataviz-* token namespace:
#   - "brand"  → monochromatic brand-blue (default; matches existing behavior).
#   - "global" → brand-agnostic, best-practices palette built from established
#                research-grade sources (Okabe-Ito, Viridis, ColorBrewer RdBu).
#
# Charts read --dataviz-* tokens via getComputedStyle. The resolved value
# depends on the nearest ancestor with `data-dataviz-palette=...`, so any
# chart can flip palettes by changing one attribute on a wrapper element.
#
# Existing tokens (--surface-brand-*, --content-*, --emotion-*) and helpers
# (brandShades) are unchanged. This block is purely additive.

DATAVIZ_PALETTES = {
    "brand": {
        "description": "Monochromatic brand-blue. Default palette. Use when the chart is presented as Listen Labs branded content. Practical cap is 5 categorical series; past that, slots 6–8 fall back to neutral grays as a soft signal to switch to 'global' mode.",
        "categorical": [
            "hsl(229, 100%, 40%)",  # 1 — brand primary (#0021CC)
            "hsl(229, 100%, 60%)",  # 2
            "hsl(229, 100%, 25%)",  # 3
            "hsl(229, 100%, 78%)",  # 4
            "hsl(229, 100%, 50%)",  # 5
            "#525252",              # 6 — neutral fallback
            "#8D8D8D",              # 7
            "#C6C6C6",              # 8
        ],
        "sequential": [
            "hsl(229, 100%, 92%)",  # 100 — lightest
            "hsl(229, 100%, 82%)",  # 200
            "hsl(229, 100%, 70%)",  # 300
            "hsl(229, 100%, 55%)",  # 400
            "hsl(229, 100%, 40%)",  # 500 — brand mid
            "hsl(229, 100%, 28%)",  # 600
            "hsl(229, 100%, 18%)",  # 700 — darkest
        ],
        "diverging": {
            "neg-3": "hsl(27, 100%, 42%)",   # vermillion (#D55E00) — same hex as global categorical-6
            "neg-2": "hsl(27, 100%, 62%)",
            "neg-1": "hsl(27, 75%, 86%)",
            "zero":  "#F5F5F5",
            "pos-1": "hsl(229, 75%, 86%)",
            "pos-2": "hsl(229, 100%, 62%)",
            "pos-3": "#0021CC",              # brand primary
        },
        "highlight": {
            "accent":    "#0021CC",  # brand primary
            "neutral-1": "#525252",
            "neutral-2": "#8D8D8D",
            "neutral-3": "#C6C6C6",
        },
        "semantic": {
            "positive": "#0F8A38",
            "negative": "#B82214",
            "neutral":  "#8D8D8D",
        },
    },
    "global": {
        "description": "Brand-agnostic, best-practices palette. Categorical = Okabe-Ito 8 (academic CVD-safe standard). Sequential = Viridis 7-stop (perceptually uniform). Diverging = ColorBrewer RdBu 7 (CVD-safe). Use when the chart should follow data-viz best practices independent of brand identity.",
        "categorical": [
            "#0072B2",  # 1 — Blue (Okabe-Ito)
            "#E69F00",  # 2 — Orange
            "#009E73",  # 3 — Green
            "#CC79A7",  # 4 — Reddish purple
            "#56B4E9",  # 5 — Sky blue
            "#D55E00",  # 6 — Vermillion (same hex as brand diverging neg-3)
            "#F0E442",  # 7 — Yellow
            "#000000",  # 8 — Black
        ],
        "sequential": [
            "#440154",  # 100 — Viridis
            "#443A83",  # 200
            "#31688E",  # 300
            "#21908C",  # 400
            "#35B779",  # 500
            "#8FD744",  # 600
            "#FDE725",  # 700
        ],
        "diverging": {
            "neg-3": "#B2182B",  # ColorBrewer RdBu
            "neg-2": "#EF8A62",
            "neg-1": "#FDDBC7",
            "zero":  "#F7F7F7",
            "pos-1": "#D1E5F0",
            "pos-2": "#67A9CF",
            "pos-3": "#2166AC",
        },
        "highlight": {
            "accent":    "#0072B2",  # Okabe-Ito Blue
            "neutral-1": "#525252",
            "neutral-2": "#8D8D8D",
            "neutral-3": "#C6C6C6",
        },
        "semantic": {
            "positive": "#0F8A38",
            "negative": "#B82214",
            "neutral":  "#8D8D8D",
        },
    },
}

DATAVIZ_RULES = {
    "default_mode": "brand",
    "swap_mechanism": 'Set data-dataviz-palette="brand|global" on any ancestor of the chart (typically <main> or :root). All --dataviz-* tokens cascade and resolve to the active mode\'s values. Charts can omit the attribute entirely to inherit the brand default.',
    "category_caps": {
        "soft_max": 7,
        "hard_max": 10,
        "rule": "Beyond 7 categories, require direct data labels rather than legend lookup. Beyond 10, roll up to 'Other'. Brand mode practical cap is 5 (monochromatic limits); past that the palette degrades to neutral grays — switch to global mode if you need more distinct categories.",
    },
    "redundant_encoding": "For 5+ series or any line chart with multiple lines, encode redundantly: line-style (solid/dashed/dotted) + marker shape (circle/triangle/square) in addition to color. Never rely on color alone (WCAG 1.4.1).",
    "contrast": {
        "graphical_min_ratio": "3:1",
        "text_min_ratio": "4.5:1",
        "rule": "All categorical colors must hit ≥3:1 against the chart background; data labels must hit ≥4.5:1.",
    },
    "grayscale": "Adjacent palette stops must differ by ≥20% luminance when desaturated. Both shipped palettes pass; verify when extending.",
    "diverging_cvd": "Never use red/green for diverging data. Default RdBu (global) and vermillion/blue (brand) are both CVD-safe.",
    "emotion_orthogonality": "Emotion tokens (--emotion-*) remain reserved for the 6 Ekman emotions and are independent of the brand/global palette mode.",
    "dark_mode_adaptation": "A small set of palette tokens flip values in dark mode (`prefers-color-scheme: dark`) to stay legible against dark canvases. Brand: categorical-3 brightens; diverging-zero adopts surface-tertiary (theme-coherent across Paper and Whisp). Global: categorical-8 swaps black → white; diverging-zero adopts surface-tertiary. Token names are unchanged. See DATAVIZ_DARK_OVERRIDES.",
}

# Dark-mode overrides for tokens that collide with dark canvases. Keyed by
# palette mode → token short name → CSS value. Token names match
# DATAVIZ_PALETTES; only listed keys flip in dark mode. var(--surface-tertiary)
# is used so the diverging midpoint stays theme-coherent across Paper/Whisp.
DATAVIZ_DARK_OVERRIDES = {
    "brand": {
        # hsl(229, 100%, 25%) reads as near-black on dark canvases — flip to a
        # legible mid-light blue while keeping the monochromatic identity.
        "categorical-3": "hsl(229, 100%, 72%)",
        # #F5F5F5 is invisible on dark; surface-tertiary gives a subtle
        # "neutral midpoint" that adapts to the active theme.
        "diverging-zero": "var(--surface-tertiary)",
    },
    "global": {
        # Pure black is invisible on dark canvases. White is the natural
        # CVD-safe substitute for the 8th Okabe-Ito slot.
        "categorical-8": "#FFFFFF",
        # Same theme-coherent midpoint as brand.
        "diverging-zero": "var(--surface-tertiary)",
    },
}


def _dataviz_decls(mode):
    """Generate CSS custom-property declarations for a palette mode."""
    p = DATAVIZ_PALETTES[mode]
    lines = []
    for i, c in enumerate(p["categorical"], start=1):
        lines.append(f"  --dataviz-categorical-{i}: {c};")
    stops = [100, 200, 300, 400, 500, 600, 700]
    for stop, c in zip(stops, p["sequential"]):
        lines.append(f"  --dataviz-sequential-{stop}: {c};")
    for key in ("neg-3", "neg-2", "neg-1", "zero", "pos-1", "pos-2", "pos-3"):
        lines.append(f"  --dataviz-diverging-{key}: {p['diverging'][key]};")
    lines.append(f"  --dataviz-highlight-accent: {p['highlight']['accent']};")
    for n in (1, 2, 3):
        lines.append(f"  --dataviz-highlight-neutral-{n}: {p['highlight'][f'neutral-{n}']};")
    for key in ("positive", "negative", "neutral"):
        lines.append(f"  --dataviz-semantic-{key}: {p['semantic'][key]};")
    return "\n".join(lines)


def _dataviz_dark_decls(mode):
    """CSS declarations for dark-mode overrides (only tokens that flip)."""
    overrides = DATAVIZ_DARK_OVERRIDES.get(mode, {})
    return "\n".join(f"    --dataviz-{key}: {val};" for key, val in overrides.items())


# Theme-orthogonal data-viz CSS. Brand mode is the default (applied at :root);
# global mode overrides via the [data-dataviz-palette="global"] attribute
# selector. Same selector pattern works for any ancestor — typically <main>.
# Dark-mode overrides flip the small set of tokens that collide with dark
# canvases when the user's system prefers a dark color scheme.
DATAVIZ_CSS = f"""/* Data-viz palette tokens — brand mode (default) */
:root,
[data-dataviz-palette="brand"] {{
{_dataviz_decls("brand")}
}}

/* Data-viz palette tokens — global (best-practices) mode */
[data-dataviz-palette="global"] {{
{_dataviz_decls("global")}
}}

/* Dark-mode adaptations — only tokens that need to flip for legibility on
   dark canvases. Token names unchanged; charts read the same --dataviz-*
   tokens regardless of theme. */
@media (prefers-color-scheme: dark) {{
  :root,
  [data-dataviz-palette="brand"] {{
{_dataviz_dark_decls("brand")}
  }}
  [data-dataviz-palette="global"] {{
{_dataviz_dark_decls("global")}
  }}
}}"""

ART_DIRECTION = {
    "philosophy": "Dieter Rams — less, but better. Every element must earn its place.",
    "core_principles": [
        "Radical reduction — strip down until removing one more thing would break comprehension",
        "Stillness — white space is load-bearing, not leftover",
        "Neutral confidence — the design doesn't try to impress, it simply works",
        "Scale contrast is the primary compositional tool — not color, not decoration",
        "One dominant element per composition — everything else is subordinate",
        "Grid discipline — nothing floats arbitrarily",
        "Functional hierarchy — most important = most visually dominant",
    ],
    "the_feel": [
        "Minimal editorial — lots of breathing room",
        "Technical precision — clean alignment, deliberate spacing",
        "Bold simplicity — big shapes, large type, graphic confidence",
        "Warm, not cold — warm off-white canvas and near-black text",
    ],
    "avoid": [
        "Drop shadows or heavy depth effects",
        "Rounded, bubbly UI",
        "Bright/saturated accent colors beyond #0021CC",
        "Bold or light font weights",
        "Letter-spacing overrides",
        "Cluttered layouts",
        "Generic or decorative imagery",
        "Odd numbers for spacing or sizing",
        "Arbitrary border radius values outside the scale",
        "Multiple competing focal points",
        "Decorative elements that don't carry meaning",
    ],
}

CSS_VARIABLES = {
    "paper": {
        "light": """/* Paper - Light */
--content-primary: #120F08;
--content-secondary: #6B6861;
--content-inverse-primary: #F9F4EB;
--content-inverse-secondary: #9E9B94;
--content-disabled: #B6B4AF;
--content-inverse-disabled: #504E49;
--content-brand: #0021CC;
--content-brand-secondary: #7A85B8;
--content-brand-contrast: #F9F4EB;
--content-brand-contrast-secondary: #9CA3C9;
--content-complimentary: #B88114;
--content-warning: #B85814;
--content-negative: #B82214;
--content-positive: #0F8A38;

--surface-highlight: #FBF9F4;
--surface-primary: #F9F4EB;
--surface-secondary: #EEE8DD;
--surface-tertiary: #E2DCCF;
--surface-inverse-primary: #120F08;
--surface-inverse-secondary: #1F1B14;
--surface-brand-primary: #0021CC;
--surface-brand-secondary: #D9DDF2;
--surface-complimentary-primary: #E5A119;
--surface-complimentary-secondary: #F5EBD6;
--surface-warning-primary: #CF6317;
--surface-warning-secondary: #F5E3D6;
--surface-negative-primary: #CF2617;
--surface-negative-secondary: #F5D9D6;
--surface-positive-primary: #14B84B;
--surface-positive-secondary: #D6F5E0;

/* Emotion tokens */
--emotion-anger-primary: #BF4040;
--emotion-anger-secondary: rgba(191, 64, 64, 0.10);
--emotion-happiness-primary: #D99E26;
--emotion-happiness-secondary: rgba(217, 158, 38, 0.10);
--emotion-disgust-primary: #80BF40;
--emotion-disgust-secondary: rgba(128, 191, 64, 0.10);
--emotion-surprise-primary: #40BFAA;
--emotion-surprise-secondary: rgba(64, 191, 170, 0.10);
--emotion-sadness-primary: #406ABF;
--emotion-sadness-secondary: rgba(64, 106, 191, 0.10);
--emotion-fear-primary: #9540BF;
--emotion-fear-secondary: rgba(149, 64, 191, 0.10);""",
        "dark": """/* Paper - Dark */
--content-primary: #F9F4EB;
--content-secondary: #9E9B94;
--content-inverse-primary: #120F08;
--content-inverse-secondary: #6B6861;
--content-disabled: #504E49;
--content-inverse-disabled: #B6B4AF;
--content-brand: #3354FF;

--surface-highlight: #080603;
--surface-primary: #130F06;
--surface-secondary: #201C13;
--surface-tertiary: #30291D;
--surface-inverse-primary: #F9F4EB;
--surface-inverse-secondary: #F0E9DB;
--surface-brand-secondary: #131939;""",
    },
    "whisp": {
        "light": """/* Whisp - Light */
--content-primary: #1A1A1A;
--content-secondary: #666666;
--content-inverse-primary: #E5E5E5;
--content-inverse-secondary: #999999;
--content-disabled: #B2B2B2;
--content-inverse-disabled: #4D4D4D;
--content-brand: #0021CC;
--content-brand-secondary: #7A85B8;
--content-brand-contrast: #E5E5E5;
--content-brand-contrast-secondary: #9CA3C9;
--content-complimentary: #B88114;
--content-warning: #B85814;
--content-negative: #B82214;
--content-positive: #0F8A38;

--surface-highlight: #FFFFFF;
--surface-primary: #FAFAFA;
--surface-secondary: #F0F0F0;
--surface-tertiary: #E0E0E0;
--surface-inverse-primary: #1A1A1A;
--surface-inverse-secondary: #262626;
--surface-brand-primary: #0021CC;
--surface-brand-secondary: #D9DDF2;
--surface-complimentary-primary: #E5A119;
--surface-complimentary-secondary: #F5EBD6;
--surface-warning-primary: #CF6317;
--surface-warning-secondary: #F5E3D6;
--surface-negative-primary: #CF2617;
--surface-negative-secondary: #F5D9D6;
--surface-positive-primary: #14B84B;
--surface-positive-secondary: #D6F5E0;

/* Emotion tokens */
--emotion-anger-primary: #BF4040;
--emotion-anger-secondary: rgba(191, 64, 64, 0.10);
--emotion-happiness-primary: #D99E26;
--emotion-happiness-secondary: rgba(217, 158, 38, 0.10);
--emotion-disgust-primary: #80BF40;
--emotion-disgust-secondary: rgba(128, 191, 64, 0.10);
--emotion-surprise-primary: #40BFAA;
--emotion-surprise-secondary: rgba(64, 191, 170, 0.10);
--emotion-sadness-primary: #406ABF;
--emotion-sadness-secondary: rgba(64, 106, 191, 0.10);
--emotion-fear-primary: #9540BF;
--emotion-fear-secondary: rgba(149, 64, 191, 0.10);""",
        "dark": """/* Whisp - Dark */
--content-primary: #E5E5E5;
--content-secondary: #999999;
--content-inverse-primary: #1A1A1A;
--content-inverse-secondary: #666666;
--content-disabled: #4D4D4D;
--content-inverse-disabled: #B2B2B2;
--content-brand: #3354FF;

--surface-highlight: #000000;
--surface-primary: #1A1A1A;
--surface-secondary: #262626;
--surface-tertiary: #333333;
--surface-inverse-primary: #FAFAFA;
--surface-inverse-secondary: #F0F0F0;
--surface-brand-secondary: #131939;""",
    },
}
