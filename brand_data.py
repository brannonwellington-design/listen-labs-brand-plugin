"""
Listen Labs brand data — the single source of truth for colors, typography,
spacing, icons, header conventions, data viz rules, art direction, and CSS
variable blocks.

Imported by:
- listen-labs-brand-server.py (exposes this data via MCP tools)
- generate_guidelines.py (renders this data into GUIDELINES.md)

Edit values here. The pre-commit hook regenerates GUIDELINES.md automatically.
"""

COLORS = {
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
    },
    "line_stroke_weight": {
        "default": "1px consistent stroke on all chart elements — axes, grid lines, data lines, borders",
        "principle": "Opt for fewer lines rather than more. Minimalism without sacrificing function — remove any line that doesn't aid comprehension.",
    },
    "emotion_color_mapping": {
        "rule": "Emotion color tokens are exclusively reserved for the 6 core Ekman emotions (anger, happiness, disgust, surprise, sadness, fear). Never use emotion tokens for general data series, categories, or any purpose outside of Listen Labs emotional intelligence features.",
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
}
