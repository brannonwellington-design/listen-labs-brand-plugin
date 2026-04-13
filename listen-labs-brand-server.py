#!/usr/bin/env python3
"""
Listen Labs Brand MCP Server

A Model Context Protocol server that exposes Listen Labs brand guidelines
as tools for Claude Code and other MCP-compatible clients.

Run with: python3 listen-labs-brand-server.py
"""

import json
import sys

# ─── Brand Data ──────────────────────────────────────────────────────────────

COLORS = {
    "light": {
        "content": {
            "content-primary": "#120F08",
            "content-secondary": "rgba(18, 15, 8, 0.6)",
            "content-inverse-primary": "#F9F4EB",
            "content-inverse-secondary": "rgba(249, 244, 235, 0.6)",
            "content-disabled": "rgba(18, 15, 8, 0.3)",
            "content-inverse-disabled": "rgba(249, 244, 235, 0.3)",
            "content-brand": "#0021CC",
            "content-brand-contrast": "#F9F4EB",
            "content-complimentary": "#E5A119",
            "content-warning": "#CF6317",
            "content-negative": "#CF2617",
            "content-positive": "#0F8A38",
        },
        "surface": {
            "surface-highlight": "#FCFBF7",
            "surface-primary": "#F9F4EB",
            "surface-secondary": "#EEE8DD",
            "surface-tertiary": "#E2DCCF",
            "surface-inverse-primary": "#120F08",
            "surface-inverse-secondary": "#1F1B14",
            "surface-brand-primary": "#0021CC",
            "surface-brand-secondary": "rgba(0, 33, 204, 0.10)",
            "surface-complimentary-primary": "#E5A119",
            "surface-complimentary-secondary": "rgba(229, 161, 25, 0.10)",
            "surface-warning-primary": "#CF6317",
            "surface-warning-secondary": "rgba(207, 99, 23, 0.10)",
            "surface-negative-primary": "#CF2617",
            "surface-negative-secondary": "rgba(207, 38, 23, 0.10)",
            "surface-positive-primary": "#14B84B",
            "surface-positive-secondary": "rgba(20, 184, 75, 0.10)",
        },
    },
    "dark": {
        "content": {
            "content-primary": "#F9F4EB",
            "content-secondary": "rgba(249, 244, 235, 0.6)",
            "content-inverse-primary": "#120F08",
            "content-inverse-secondary": "rgba(18, 15, 8, 0.6)",
            "content-disabled": "rgba(249, 244, 235, 0.3)",
            "content-inverse-disabled": "rgba(18, 15, 8, 0.3)",
            "content-brand": "#0021CC",
            "content-brand-contrast": "#F9F4EB",
            "content-complimentary": "#E5A119",
            "content-warning": "#CF6317",
            "content-negative": "#CF2617",
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
            "surface-brand-secondary": "rgba(0, 33, 204, 0.30)",
            "surface-complimentary-primary": "#E5A119",
            "surface-complimentary-secondary": "rgba(229, 161, 25, 0.10)",
            "surface-warning-primary": "#CF6317",
            "surface-warning-secondary": "rgba(207, 99, 23, 0.10)",
            "surface-negative-primary": "#CF2617",
            "surface-negative-secondary": "rgba(207, 38, 23, 0.20)",
            "surface-positive-primary": "#14B84B",
            "surface-positive-secondary": "rgba(20, 184, 75, 0.20)",
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
    "listen_labs_color": "content-secondary (60% opacity)",
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
        "Grid lines use content-disabled opacity (30%) to stay subordinate to data.",
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
--content-secondary: rgba(18, 15, 8, 0.6);
--content-inverse-primary: #F9F4EB;
--content-inverse-secondary: rgba(249, 244, 235, 0.6);
--content-disabled: rgba(18, 15, 8, 0.3);
--content-inverse-disabled: rgba(249, 244, 235, 0.3);
--content-brand: #0021CC;
--content-brand-contrast: #F9F4EB;
--content-complimentary: #E5A119;
--content-warning: #CF6317;
--content-negative: #CF2617;
--content-positive: #0F8A38;

--surface-highlight: #FCFBF7;
--surface-primary: #F9F4EB;
--surface-secondary: #EEE8DD;
--surface-tertiary: #E2DCCF;
--surface-inverse-primary: #120F08;
--surface-inverse-secondary: #1F1B14;
--surface-brand-primary: #0021CC;
--surface-brand-secondary: rgba(0, 33, 204, 0.10);
--surface-complimentary-primary: #E5A119;
--surface-complimentary-secondary: rgba(229, 161, 25, 0.10);
--surface-warning-primary: #CF6317;
--surface-warning-secondary: rgba(207, 99, 23, 0.10);
--surface-negative-primary: #CF2617;
--surface-negative-secondary: rgba(207, 38, 23, 0.10);
--surface-positive-primary: #14B84B;
--surface-positive-secondary: rgba(20, 184, 75, 0.10);

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
--content-secondary: rgba(249, 244, 235, 0.6);
--content-inverse-primary: #120F08;
--content-inverse-secondary: rgba(18, 15, 8, 0.6);
--content-disabled: rgba(249, 244, 235, 0.3);
--content-inverse-disabled: rgba(18, 15, 8, 0.3);

--surface-highlight: #080603;
--surface-primary: #130F06;
--surface-secondary: #201C13;
--surface-tertiary: #30291D;
--surface-inverse-primary: #F9F4EB;
--surface-inverse-secondary: #F0E9DB;
--surface-brand-secondary: rgba(0, 33, 204, 0.30);
--surface-negative-secondary: rgba(207, 38, 23, 0.20);
--surface-positive-secondary: rgba(20, 184, 75, 0.20);""",
}


# ─── Tool Definitions ────────────────────────────────────────────────────────

TOOLS = [
    {
        "name": "get_brand_colors",
        "description": "Get Listen Labs color tokens for the Paper theme. Returns content tokens (text/icons), surface tokens (backgrounds/fills/strokes), and emotion tokens. Specify mode for light or dark, or 'all' for both plus emotions.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "mode": {
                    "type": "string",
                    "enum": ["light", "dark", "all"],
                    "description": "Color mode to return. 'all' returns light, dark, and emotion tokens.",
                    "default": "all",
                },
                "category": {
                    "type": "string",
                    "enum": ["content", "surface", "emotion", "all"],
                    "description": "Token category to filter by.",
                    "default": "all",
                },
            },
        },
    },
    {
        "name": "get_css_variables",
        "description": "Get ready-to-use CSS custom property declarations for Listen Labs Paper theme. Returns CSS variable blocks for light mode, dark mode, or both.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "mode": {
                    "type": "string",
                    "enum": ["light", "dark", "both"],
                    "description": "Which mode's CSS variables to return.",
                    "default": "both",
                },
            },
        },
    },
    {
        "name": "get_typography",
        "description": "Get Listen Labs typography rules: font family, weight, type scale, letter-spacing rules, case conventions, and base CSS.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_spacing",
        "description": "Get Listen Labs spacing and sizing system: base unit, component height presets, border radius scale, and grid presets for different media.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_icon_guidelines",
        "description": "Get Listen Labs icon usage rules: library (Lucide), sizing/stroke table keyed to text size, and color rules.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_header_convention",
        "description": "Get the Listen Labs branded header format (Listen Labs / Project Title), positioning, color rules, and an HTML example.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_data_visualization",
        "description": "Get Listen Labs data visualization rules: chart type preferences, color usage (monochromatic brand shades), stroke weights, emotion color restrictions, and responsive/flexing rules.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_art_direction",
        "description": "Get Listen Labs art direction principles: Dieter Rams philosophy, composition rules, the brand feel, and what to avoid.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_full_guidelines",
        "description": "Get the complete Listen Labs brand guidelines in one call — colors, typography, spacing, icons, header, data visualization, art direction, and CSS variables. Use this when you need everything at once.",
        "inputSchema": {"type": "object", "properties": {}},
    },
]


# ─── Tool Handlers ────────────────────────────────────────────────────────────

def handle_get_brand_colors(args):
    mode = args.get("mode", "all")
    category = args.get("category", "all")
    result = {}

    if mode in ("light", "all"):
        light = {}
        if category in ("content", "all"):
            light["content"] = COLORS["light"]["content"]
        if category in ("surface", "all"):
            light["surface"] = COLORS["light"]["surface"]
        result["light"] = light

    if mode in ("dark", "all"):
        dark = {}
        if category in ("content", "all"):
            dark["content"] = COLORS["dark"]["content"]
        if category in ("surface", "all"):
            dark["surface"] = COLORS["dark"]["surface"]
        result["dark"] = dark

    if mode == "all" and category in ("emotion", "all"):
        result["emotion"] = COLORS["emotion"]

    return json.dumps(result, indent=2)


def handle_get_css_variables(args):
    mode = args.get("mode", "both")
    if mode == "light":
        return CSS_VARIABLES["light"]
    elif mode == "dark":
        return CSS_VARIABLES["dark"]
    else:
        return CSS_VARIABLES["light"] + "\n\n" + CSS_VARIABLES["dark"]


def handle_get_typography(_args):
    return json.dumps(TYPOGRAPHY, indent=2)


def handle_get_spacing(_args):
    return json.dumps(SPACING, indent=2)


def handle_get_icon_guidelines(_args):
    return json.dumps(ICONS, indent=2)


def handle_get_header_convention(_args):
    return json.dumps(HEADER, indent=2)


def handle_get_data_visualization(_args):
    return json.dumps(DATA_VISUALIZATION, indent=2)


def handle_get_art_direction(_args):
    return json.dumps(ART_DIRECTION, indent=2)


def handle_get_full_guidelines(_args):
    return json.dumps({
        "colors": COLORS,
        "typography": TYPOGRAPHY,
        "spacing": SPACING,
        "icons": ICONS,
        "header": HEADER,
        "data_visualization": DATA_VISUALIZATION,
        "art_direction": ART_DIRECTION,
        "css_variables": CSS_VARIABLES,
    }, indent=2)


HANDLERS = {
    "get_brand_colors": handle_get_brand_colors,
    "get_css_variables": handle_get_css_variables,
    "get_typography": handle_get_typography,
    "get_spacing": handle_get_spacing,
    "get_icon_guidelines": handle_get_icon_guidelines,
    "get_header_convention": handle_get_header_convention,
    "get_data_visualization": handle_get_data_visualization,
    "get_art_direction": handle_get_art_direction,
    "get_full_guidelines": handle_get_full_guidelines,
}


# ─── MCP Protocol (JSON-RPC 2.0 over stdio) ──────────────────────────────────

SERVER_INFO = {
    "name": "listen-labs-brand",
    "version": "1.0.0",
}

CAPABILITIES = {
    "tools": {},
}


def make_response(id, result):
    return {"jsonrpc": "2.0", "id": id, "result": result}


def make_error(id, code, message):
    return {"jsonrpc": "2.0", "id": id, "error": {"code": code, "message": message}}


def handle_request(msg):
    method = msg.get("method")
    id = msg.get("id")
    params = msg.get("params", {})

    if method == "initialize":
        return make_response(id, {
            "protocolVersion": "2024-11-05",
            "serverInfo": SERVER_INFO,
            "capabilities": CAPABILITIES,
        })

    elif method == "notifications/initialized":
        return None  # notification, no response

    elif method == "tools/list":
        return make_response(id, {"tools": TOOLS})

    elif method == "tools/call":
        tool_name = params.get("name")
        tool_args = params.get("arguments", {})
        handler = HANDLERS.get(tool_name)

        if not handler:
            return make_error(id, -32602, f"Unknown tool: {tool_name}")

        try:
            result_text = handler(tool_args)
            return make_response(id, {
                "content": [{"type": "text", "text": result_text}],
            })
        except Exception as e:
            return make_error(id, -32603, str(e))

    elif method == "ping":
        return make_response(id, {})

    elif method and method.startswith("notifications/"):
        return None  # ignore notifications

    else:
        if id is not None:
            return make_error(id, -32601, f"Method not found: {method}")
        return None


def main():
    log("Listen Labs Brand MCP Server started")

    buffer = ""
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break

            buffer += line

            # Try to parse complete JSON messages from buffer
            # MCP uses newline-delimited JSON
            while "\n" in buffer:
                line_end = buffer.index("\n")
                message_str = buffer[:line_end].strip()
                buffer = buffer[line_end + 1:]

                if not message_str:
                    continue

                try:
                    msg = json.loads(message_str)
                except json.JSONDecodeError:
                    log(f"Failed to parse JSON: {message_str[:100]}")
                    continue

                response = handle_request(msg)
                if response is not None:
                    sys.stdout.write(json.dumps(response) + "\n")
                    sys.stdout.flush()

        except KeyboardInterrupt:
            break
        except Exception as e:
            log(f"Error: {e}")


def log(msg):
    sys.stderr.write(f"[listen-labs-brand] {msg}\n")
    sys.stderr.flush()


if __name__ == "__main__":
    main()
