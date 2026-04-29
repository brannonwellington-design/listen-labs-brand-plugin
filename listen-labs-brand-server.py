#!/usr/bin/env python3
"""
Listen Labs Brand MCP Server

A Model Context Protocol server that exposes Listen Labs brand guidelines
as tools for Claude Code and other MCP-compatible clients.

Run with: python3 listen-labs-brand-server.py
"""

import json
import os
import sys

# Make brand_data importable when this script is invoked directly (the file
# lives next to brand_data.py but its directory isn't always on sys.path,
# e.g. when launched via an absolute path from MCP config).
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from brand_data import (
    ART_DIRECTION,
    COLORS,
    CSS_VARIABLES,
    DATA_VISUALIZATION,
    DEFAULT_THEME,
    HEADER,
    ICONS,
    SPACING,
    THEMES,
    TYPOGRAPHY,
)

# ─── Tool Definitions ────────────────────────────────────────────────────────

TOOLS = [
    {
        "name": "get_brand_colors",
        "description": "Get Listen Labs color tokens. Returns content tokens (text/icons), surface tokens (backgrounds/fills/strokes), and emotion tokens. Themes: 'paper' (default, warm cream/brown) and 'whisp' (neutral grayscale). Specify theme, mode (light/dark), and category to filter.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "theme": {
                    "type": "string",
                    "enum": THEMES + ["all"],
                    "description": "Theme to return. 'all' returns every theme.",
                    "default": DEFAULT_THEME,
                },
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
        "description": "Get ready-to-use CSS custom property declarations. Themes: 'paper' (default) and 'whisp'. Returns CSS variable blocks for the requested theme and mode.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "theme": {
                    "type": "string",
                    "enum": THEMES + ["all"],
                    "description": "Theme to return. 'all' returns every theme.",
                    "default": DEFAULT_THEME,
                },
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

def _theme_colors(theme, mode, category):
    out = {}
    if mode in ("light", "all"):
        light = {}
        if category in ("content", "all"):
            light["content"] = COLORS[theme]["light"]["content"]
        if category in ("surface", "all"):
            light["surface"] = COLORS[theme]["light"]["surface"]
        out["light"] = light
    if mode in ("dark", "all"):
        dark = {}
        if category in ("content", "all"):
            dark["content"] = COLORS[theme]["dark"]["content"]
        if category in ("surface", "all"):
            dark["surface"] = COLORS[theme]["dark"]["surface"]
        out["dark"] = dark
    return out


def handle_get_brand_colors(args):
    theme = args.get("theme", DEFAULT_THEME)
    mode = args.get("mode", "all")
    category = args.get("category", "all")
    result = {}

    themes = THEMES if theme == "all" else [theme]
    for t in themes:
        result[t] = _theme_colors(t, mode, category)

    if mode == "all" and category in ("emotion", "all"):
        result["emotion"] = COLORS["emotion"]

    return json.dumps(result, indent=2)


def handle_get_css_variables(args):
    theme = args.get("theme", DEFAULT_THEME)
    mode = args.get("mode", "both")

    def block(t, m):
        if m == "both":
            return CSS_VARIABLES[t]["light"] + "\n\n" + CSS_VARIABLES[t]["dark"]
        return CSS_VARIABLES[t][m]

    themes = THEMES if theme == "all" else [theme]
    return "\n\n".join(block(t, mode) for t in themes)


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
