"""
Listen Labs brand data — the single source of truth for colors, typography,
spacing, icons, header conventions, data viz rules, art direction, and CSS
variable blocks.

Imported by:
- listen-labs-brand-server.py (exposes this data via MCP tools, including the logo)
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
    "css": "body {\n  font-family: 'Inter', 'Helvetica Neue', Arial, system-ui, sans-serif; /* metric-compatible fallbacks: layout must not depend on the webfont */\n  font-weight: 400;\n  /* never add letter-spacing */\n}",
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
    "where_it_appears": "Standalone artifacts and documents that leave the product: HTML files, PDFs, posters, decks, exported images. OMIT it inside the Listen Labs product canvas — the product chrome already carries the brand, and a second credit line reads as a watermark. Websites use the logo lockup in the navigation instead of the credit line.",
    "html_example": '''<header class="ll-header">
  <span class="ll-brand">Listen Labs /</span>
  <span class="ll-title">Project Title</span>
</header>
<style>
  .ll-header { position: absolute; top: 24px; left: 0; right: 0; text-align: center; font-size: 12px; line-height: 16px; }
  .ll-brand { color: var(--content-secondary); }
  .ll-title { color: var(--content-primary); }
</style>''',
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
        "hard_max": 8,
        "rule": "Beyond 7 categories, require direct data labels rather than legend lookup. Beyond 8 (the palette has eight categorical slots), roll up to 'Other'. Brand mode practical cap is 5 (monochromatic limits); past that the palette degrades to neutral grays — switch to global mode if you need more distinct categories.",
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


# Theme-orthogonal data-viz CSS. Brand mode is the default (applied at :root);
# global mode overrides via the [data-dataviz-palette="global"] attribute
# selector. Same selector pattern works for any ancestor — typically <main>.
DATAVIZ_CSS = f"""/* Data-viz palette tokens — brand mode (default) */
:root,
[data-dataviz-palette="brand"] {{
{_dataviz_decls("brand")}
}}

/* Data-viz palette tokens — global (best-practices) mode */
[data-dataviz-palette="global"] {{
{_dataviz_decls("global")}
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

# ─── Motion ──────────────────────────────────────────────────────────────────
# Two registers share one vocabulary:
#   - "ui"    (productive) → interactive artifacts, product surfaces. Default is stillness.
#   - "video" (expressive) → motion-graphics video rendered from research data (/video skill).
# Values are borrowed, not invented; each cites its source. Durations are ms; in video,
# snap every duration to whole frames at the composition's fps.
# Sources: IBM Carbon motion (carbondesignsystem.com/elements/motion/overview),
# Material Design 3 motion tokens (material-components-android docs/theming/Motion.md),
# Fluent 2 token source, Apple HIG (Reduce Motion), Heer & Robertson 2007
# "Animated Transitions in Statistical Data Graphics", Bostock "Object Constancy",
# BBC Subtitle Guidelines, Netflix Timed Text Style Guide, EBU R95 / R128, WCAG 2.2.

MOTION = {
    "philosophy": "Motion is information, not decoration. Something moves only to show a change, a sequence, a relationship, or where to look next. If removing the motion loses nothing, remove it.",
    "registers": {
        "ui": "Subtle and quick. Default is stillness; nothing animates on load, loops, or plays on its own. Used for state changes, reveals, tooltips.",
        "video": "Visible and choreographed, timed to narration. Still Rams: one orchestrated moment per scene, no ornament.",
    },
    "duration_ms": {
        "ui": {
            "instant": 70,   # Carbon fast-01 — toggles, button press
            "quick": 110,    # Carbon fast-02 — fades, tooltips out
            "short": 150,    # Carbon moderate-01 / M3 Short3 — hover, tooltip in
            "medium": 240,   # Carbon moderate-02 — expansion, toast
            "long": 400,     # Carbon slow-01 / M3 Medium4 — large reveal
        },
        "video": {
            "beat": 300,     # M3 Medium2 — small element in/out, label fade
            "move": 500,     # M3 Long2 — entrances, shifts, wipes
            "scene": 700,    # Carbon slow-02 / M3 ExtraLong1 — scene-level transitions
            "build": 1000,   # M3 ExtraLong4 — one transition stage on a chart (Heer & Robertson ~1s)
            "count": 1600,   # count-up / bar fill landing together (1.2–2.5s range)
            "draw": 2000,    # line or path draw-on
        },
    },
    "easing": {
        "ui": {
            "standard": "cubic-bezier(0.2, 0, 0.38, 0.9)",   # Carbon productive standard
            "enter": "cubic-bezier(0, 0, 0.38, 0.9)",        # Carbon productive entrance
            "exit": "cubic-bezier(0.2, 0, 1, 0.9)",          # Carbon productive exit
        },
        "video": {
            "enter": "cubic-bezier(0.05, 0.7, 0.1, 1)",      # M3 emphasized-decelerate
            "exit": "cubic-bezier(0.3, 0, 0.8, 0.15)",       # M3 emphasized-accelerate
            "move": "cubic-bezier(0.4, 0.14, 0.3, 1)",       # Carbon expressive standard — repositioning, wipes
            "settle": "cubic-bezier(0, 0, 0, 1)",            # M3 standard-decelerate — counters and fills land softly on the exact value
        },
        "linear": "Only for time itself: progress bars, playheads, constant rotation (Fluent).",
        "forbidden": "No bounce, elastic, back/overshoot, or springs with visible oscillation — in either register. Data never overshoots its true value.",
    },
    "choreography": [
        "Animate only transform and opacity (scale, translate, opacity). Never animate width, height, font-size, or layout properties; bars grow by scaleX/scaleY from their baseline origin.",
        "Entrances ease out (enter), exits ease in (exit), moves between positions use move. Exits run about 75% of the matching entrance.",
        "A single element's entrance never exceeds 800ms. Bigger travel or size change gets more time, never less (Carbon).",
        "Stagger by importance, not source order — the first thing to move reads as most important. UI: ≤40ms apart, at most five. Video: 60–100ms apart, whole stagger ≤500ms.",
        "One thing leads at a time: no two simultaneous motions compete for the eye (staging).",
        "Scale animations interpolate perceptually (in log space), so growth doesn't appear to decelerate.",
        "No idle motion — nothing breathes, floats, pulses, glows, or drifts to fill time. Stillness is load-bearing.",
        "Motion is never the only cue: the final, settled state carries all the information.",
    ],
    "transitions": {
        "cut": {"duration": "0", "use": "Default between video scenes. A hard cut re-focuses attention; text out-points land 2 frames before the cut (Netflix)."},
        "fade": {"duration": "ui medium in / quick out; video beat", "use": "An element enters or leaves within a scene (label, annotation, caption). Opacity only."},
        "fade_through": {"duration": "video scene (outgoing 0–35%, incoming 35–100%, incoming scales 0.92→1)", "use": "Unrelated scenes or a new topic (M3 fade-through)."},
        "shift": {"duration": "video move", "use": "Next step in a sequence: X axis for sequence and time, Y axis for drill-down (M3 shared axis). The exiting direction sets the entering direction."},
        "expand": {"duration": "video scene", "use": "A mark or card becomes its own detail view — the same entity grows into the next scene (M3 container transform)."},
        "wipe": {"duration": "video move", "use": "Brand signature, reserved for a change of surface (blue ↔ paper light ↔ paper dark) or a chapter break. A circle iris from a meaningful point (the mark that becomes the next scene) or a straight line sweep along one axis, with a 2px leading edge in the incoming content color."},
        "budget": "At most three transition types per video, each used with its one meaning. Under reduced motion every transition becomes a fade.",
    },
    "reduced_motion": "Every animation has a no-motion path to the same final state: transitions become fades of quick/beat length, counters show their final value, draws appear complete, staggers collapse. UI: respect prefers-reduced-motion. Video: offer a still/settled-frame variant or rely on the player's pause control (WCAG 2.2.2).",
    "video": {
        "frame_rate": "30fps default; 60fps only when fast motion needs it. Every time is authored in seconds and converted to frames (round), never typed as raw frame numbers.",
        "determinism": "Every frame is a pure function of its time: no CSS transitions/animations, no wall-clock, no unseeded randomness, no network during render, chart-library animations disabled.",
        "canvases": {
            "note": "Design at half the output resolution and render at 2× device scale, so the brand type scale (max 128px) reads at video size and stays on-scale.",
            "9:16": {"output_px": [1080, 1920], "design_px": [540, 960]},
            "4:5": {"output_px": [1080, 1350], "design_px": [540, 676]},
            "1:1": {"output_px": [1080, 1080], "design_px": [540, 540]},
            "16:9": {"output_px": [1920, 1080], "design_px": [960, 540]},
        },
        "type_minimums_design_px": {
            "note": "Design-canvas px (×2 at output). Picked from the brand type scale. Floors, not targets — scale contrast still leads.",
            "display_numeral": 96,
            "headline": 40,
            "supporting": 24,
            "label": 18,
            "source_note": 16,
            "credit_line": 14,
        },
        "safe_zones_design_px": {
            "note": "Inset from each edge on the design canvas. 'clean' = LinkedIn, web embeds, presentations (EBU R95 graphics-safe, 5%, rounded to the 4px grid). 'social' = Reels / Shorts / TikTok, where platform UI covers the frame (union of Meta and YouTube published zones; TikTok publishes templates only). Choose the profile per destination; when unknown, use social on 9:16.",
            "9:16": {"clean": {"top": 48, "bottom": 48, "left": 32, "right": 32}, "social": {"top": 136, "bottom": 336, "left": 32, "right": 96}},
            "4:5": {"clean": {"top": 36, "bottom": 36, "left": 32, "right": 32}, "social": {"top": 36, "bottom": 36, "left": 32, "right": 32}},
            "1:1": {"clean": {"top": 32, "bottom": 32, "left": 32, "right": 32}, "social": {"top": 32, "bottom": 32, "left": 32, "right": 32}},
            "16:9": {"clean": {"top": 28, "bottom": 28, "left": 48, "right": 48}, "social": {"top": 28, "bottom": 28, "left": 48, "right": 48}},
        },
        "pace": {
            "kinetic": "Default for short-form (≤60s) and anything without narration: fast cuts, one stat per scene, every scene a different visual form, built to be looped and rewatched. The viewer reads the must-read text (the number and its short line); labels, notes, and supporting lines are glanceable.",
            "explainer": "Default for voiced videos of 90s and longer: narration carries the story, scenes hold long enough for every word on screen to be read.",
        },
        "hold_time": {
            "kinetic": "hold_s = max(1.2, 0.3 + 0.2 × must-read words + 0.3 × numbers). Must-read = the dominant number or claim and its one short line; labels, source notes, and secondary lines don't count. Calibrated on the first Listen Labs short (Seltzer, Oct 2026), which reviewers judged right — not on subtitle research.",
            "explainer": "hold_s = max(1.0, 0.5 + 0.33 × words) + 1.0s per number on screen (+0.5s for a 5+ digit figure). Counts every word on screen.",
            "counting": "Measured from when the entrance animation ends, not when it starts.",
            "source": "Explainer: BBC subtitle reading speed (160–180 wpm ≈ 0.33–0.375 s/word), Netflix minimum event 20 frames, BBC 'more time for long figures'. Kinetic: house calibration.",
            "climax": "Explainer: hold 0.3–0.75s of stillness before the key reveal. Kinetic: a beat of 0.2–0.3s is enough. Every scene's first motion starts 0.05–0.3s after the cut.",
        },
        "scene_structure": "Each scene: build (0–30% of its duration) → breathe (30–70%, settled and readable) → resolve (70–100%, hold or hand off). In explainers, narration fills the breathe phase.",
        "line_weight": "One stroke weight for all line art in a video: 2px on the design canvas (4px at output). Reference lines, axes, tracks, stems, arcs, leaders, outline circles, strike-throughs, wipe edges, quote rules — all 2px. Hierarchy between lines comes from color tier (content color for the story, muted for context, grid color for structure), never from weight. Only exception: a mark so small that a 2px stroke would fill it (outline dots under 6px radius) — enlarge the mark rather than thin the line.",
        "edges": "Every horizontal figure spans the content box, left margin to right margin (inside the safe zone): tracks, axes, strike lines, unit grids, rows of shapes. A label column that ends the figure aligns to the margin too (values right-aligned at the right margin). Room for labels is made by moving the labels — above the line, into a right-aligned value column — never by stopping the chart short. Circular and radial forms center on the frame's vertical axis. Anything that stops short of an edge stops at a named grid line on purpose; 'almost full width' is always a bug.",
        "credit_zone": "The credit line (Listen Labs / Title) is 14px on the design canvas, centered, its baseline at the safe-zone top plus its cap height — as high as the safe zone allows. It owns a protected zone: nothing else enters from the canvas top to 32px below the credit baseline, and the same 32px clearance holds above the source note at the bottom. Every figure keeps all of its ink — marks and labels — inside its figure box, and figure boxes sit between the two zones. Radial figures size themselves so their top labels stay inside the box. Applies to every video in every aspect ratio.",
        "variety": "Never reuse a scene template or chart form within one video of 90s or less (one deliberate bookend excepted); in longer videos, not within the same chapter. Rotate the dominant element (numeral, chart, shape, quote), the layout anchor, and the surface from scene to scene. Two consecutive scenes that look alike read as a stall.",
        "pacing_presets": {
            "snappy_30s": {"pace": "kinetic", "narration_words": 70, "scenes": "10–12", "avg_scene_s": "2–3", "ideas": "hook + 8–10 stats or moments, one per scene, + end card", "default_transition": "wipe on every surface change, cut otherwise", "max_on_screen_words": "6 must-read"},
            "standard_90s": {"pace": "kinetic or explainer", "narration_words": 210, "scenes": "14–24", "avg_scene_s": "3–6", "ideas": "hook + 3–5 findings, each with 2–4 supporting scenes + takeaway", "default_transition": "cut / shift; wipe on surface change", "max_on_screen_words": "8 must-read (kinetic) · 12 (explainer)"},
            "deep_dive_4min": {"pace": "explainer", "narration_words": 540, "scenes": "30–45 in 4–6 chapters", "avg_scene_s": "5–8", "ideas": "method, findings by chapter, segments, verbatims, caveats", "default_transition": "cut within chapters, wipe between", "max_on_screen_words": "15"},
        },
        "narration": {
            "rate": "2.3–2.5 spoken words per second (≈140–150 wpm); ≈2.0 for dense statistics. Measure real duration from TTS timestamps, never estimate.",
            "audio_is_the_clock": "Voiceover is generated per scene first; each scene lasts as long as its narration plus its hold. Reveals are scheduled on word timestamps (the counter lands as its number is spoken).",
        },
        "captions": {
            "rules": "≤42 characters per line; ≤2 lines (≤3 on 9:16); ≤20 characters per second; each caption 0.8–7s on screen; start on speech onset, never more than 2s late; break after punctuation or before conjunctions, never between article and noun.",
            "placement": "Bottom by default, inside the safe zone, never over chart labels, values, or faces — move to the top when the data sits low. Set in Inter 400 at supporting size, content color on a solid surface band (no shadow, no outline).",
            "source": "Netflix Timed Text Style Guide; BBC Subtitle Guidelines.",
        },
        "audio": {
            "loudness": "Master to -14 to -16 LUFS integrated, true peak ≤ -1 dBTP for social/web; -23 LUFS (EBU R128) variant for broadcast. Platform targets are not officially published; this is the safe common range.",
            "music": "Optional, quiet, unobtrusive. Bed sits roughly 6–12 dB under the voice (ducked whenever narration plays). Music is muted under participant clips. No sound effects as punchlines.",
        },
        "accessibility": [
            "Captions on every video (WCAG 1.2.2) and a transcript alongside (1.2.8).",
            "Every number and takeaway that appears on screen is also spoken (integrated audio description, WCAG 1.2.5).",
            "Never more than three flashes per second. Flicker of thin lines counts by total area against the 341×256px limit (WCAG 2.3.1) — rapid redraws are designed out, not argued about.",
            "Text on video meets 4.5:1 (3:1 at 24px+ design size), same as the web floors.",
        ],
    },
}


def _ms(v):
    return f"{v}ms"


MOTION_CSS = ":root {\n" + "\n".join(
    [f"  --duration-{reg}-{name}: {_ms(v)};" for reg in ("ui", "video") for name, v in MOTION["duration_ms"][reg].items()]
    + [f"  --ease-{reg}-{name}: {v};" for reg in ("ui", "video") for name, v in MOTION["easing"][reg].items()]
) + "\n}\n\n/* Reduced motion: every transition collapses to a short opacity fade — drop transforms in the component, keep the fade. */\n@media (prefers-reduced-motion: reduce) {\n  :root {\n" + "\n".join(
    [f"    --duration-{reg}-{name}: {_ms(MOTION['duration_ms']['ui']['quick'])};" for reg in ("ui", "video") for name in MOTION["duration_ms"][reg]]
) + "\n  }\n}"

# ─── Logo ────────────────────────────────────────────────────────────────────
# Files live in assets/ at the plugin root. Every variant ships as SVG (paths
# only, one flat fill) and PNG (for decks, email, and anything that cannot
# inline SVG). "-white" files carry the cream fill for dark surfaces where
# currentColor cannot be used; in HTML, inline the default file and set
# fill="currentColor" so the logo follows the theme.

LOGO = {
    "default_variant": "lockup",
    "fill_light": "#120F08",   # = content-primary (paper light)
    "fill_dark": "#F9F4EB",    # = content-inverse-primary / paper dark canvas text
    "variants": {
        "lockup": {
            "file": "listen-labs-logo",
            "description": "Mark + the full “Listen Labs” wordmark. The default everywhere the brand is named: nav, footers, covers, decks, exports.",
            "viewbox": "0 0 520 71",
            "min_height_px": 20,
        },
        "lockup-short": {
            "file": "listen-labs-logo-short",
            "description": "Mark + “Listen”. Only when the full lockup would drop below its minimum height (narrow nav on phones, compact toolbars, tiny stages).",
            "viewbox": "0 0 307 71",
            "min_height_px": 20,
        },
        "wordmark-short": {
            "file": "listen-labs-wordmark-short",
            "description": "The “Listen” wordmark alone, no mark. Rare: only beside another instance of the mark, or in a lockup with a partner brand.",
            "viewbox": "0 0 226 65",
            "min_height_px": 18,
        },
        "mark": {
            "file": "listen-labs-mark",
            "description": "The mark alone. Favicons, avatars, app icons, social thumbnails, and anywhere the name is already written next to it.",
            "viewbox": "0 0 51 69",
            "min_height_px": 16,
        },
    },
    "rules": [
        "Default to the full lockup. Step down to the short lockup only when the full one cannot meet its minimum height; use the mark alone only where the name is redundant or the space is square.",
        "In HTML, inline the SVG markup from assets/ and set fill=\"currentColor\" on its paths so it follows the theme (content-primary on light, inverse on dark bands). Never link to the file path or a URL from an artifact.",
        "Use the -white files only where currentColor is impossible: PNG in decks and email, or an SVG placed on a fixed dark surface.",
        "Clear space on every side equals the height of the mark (the square-and-curve glyph); nothing else enters it.",
        "Never recolor the logo brand blue or any other color, never stretch, rotate, outline, add a shadow, or place it on a busy surface; on photography use the mark on a solid surface tile.",
        "Websites and product surfaces use the lockup in the navigation; standalone artifacts and documents use the text credit line (Listen Labs / Title); never both on the same page.",
    ],
}

# ─── CSS variable blocks ─────────────────────────────────────────────────────
# Derived from COLORS so the two can never drift apart. Light blocks carry the
# full token set plus emotion tokens; dark blocks carry only the tokens whose
# values differ from light (i.e. the overrides).

def _css_block(theme_name, mode):
    theme = COLORS[theme_name]
    lines = [f"/* {theme_name.capitalize()} - {mode.capitalize()} */"]
    if mode == "light":
        for group in ("content", "surface"):
            for token, value in theme["light"][group].items():
                lines.append(f"--{token}: {value};")
            lines.append("")
        lines.append("/* Emotion tokens */")
        for token, value in COLORS["emotion"].items():
            lines.append(f"--{token}: {value};")
    else:
        for group in ("content", "surface"):
            for token, value in theme["dark"][group].items():
                if theme["light"][group].get(token) != value:
                    lines.append(f"--{token}: {value};")
            if group == "content":
                lines.append("")
    return "\n".join(lines)


CSS_VARIABLES = {
    theme: {mode: _css_block(theme, mode) for mode in ("light", "dark")}
    for theme in THEMES
}
