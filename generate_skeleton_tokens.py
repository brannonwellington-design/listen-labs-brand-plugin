#!/usr/bin/env python3
"""
Stamps the brand token block into the HTML skeletons that skills copy from.

Targets (each must contain the marker pair):
  skills/report/references/skeleton.html
  skills/data-viz/references/skeleton.html

Everything between
  /* @brand-tokens:start */
and
  /* @brand-tokens:end */
is replaced with CSS generated from brand_data.py:

  - Paper light (default) on :root, Whisp light on :root[data-theme="whisp"]
  - dark-mode overrides for both themes, via prefers-color-scheme and a
    forced :root[data-mode="dark"]; :root[data-mode="light"] pins light
  - a print block that re-declares the chosen theme's LIGHT tokens so a
    dark-mode machine never prints light text on white paper
  - emotion tokens and both data-viz palette modes

Run directly:  python3 generate_skeleton_tokens.py
Also runs automatically via the pre-commit hook.
"""

import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TARGETS = [
    os.path.join(SCRIPT_DIR, "skills", "report", "references", "skeleton.html"),
    os.path.join(SCRIPT_DIR, "skills", "data-viz", "references", "skeleton.html"),
]
START = "/* @brand-tokens:start */"
END = "/* @brand-tokens:end */"

sys.path.insert(0, SCRIPT_DIR)
import brand_data as data


def decls(theme, mode, only_diff_from=None, indent="      "):
    """CSS declarations for a theme/mode. If only_diff_from=(theme, mode), emit only tokens that differ."""
    out = []
    for group in ("content", "surface"):
        for token, value in data.COLORS[theme][mode][group].items():
            if only_diff_from:
                t2, m2 = only_diff_from
                if data.COLORS[t2][m2][group].get(token) == value:
                    continue
            out.append(f"{indent}--{token}: {value};")
    return "\n".join(out)


def emotion_decls(indent="      "):
    return "\n".join(f"{indent}--{t}: {v};" for t, v in data.COLORS["emotion"].items())


def indent_block(text, spaces):
    pad = " " * spaces
    return "\n".join(pad + l if l.strip() else l for l in text.splitlines())


def build_block():
    d = data.DEFAULT_THEME
    others = [t for t in data.THEMES if t != d]
    parts = [START, "    /* GENERATED from brand_data.py by generate_skeleton_tokens.py — do not edit by hand.",
             f"     * Themes: {d} (default) + {', '.join(others)}. Pick one per artifact with data-theme on <html>.",
             "     * Mode: follows the OS via prefers-color-scheme; force with data-mode=\"light|dark\" on <html>.",
             "     * Print always uses the chosen theme's light tokens. Token NAMES are identical across themes. */"]
    # Light default
    parts.append(f"    :root {{\n      /* {d.capitalize()} — light (default) */\n{decls(d, 'light')}\n\n      /* Emotion tokens — reserved for the six Ekman emotions */\n{emotion_decls()}\n    }}")
    for t in others:
        parts.append(f"    :root[data-theme=\"{t}\"] {{\n      /* {t.capitalize()} — light (tokens that differ from {d}) */\n{decls(t, 'light', only_diff_from=(d, 'light'))}\n    }}")
    # Dark via OS preference (unless pinned light)
    dark_rules = [f"      :root:not([data-mode=\"light\"]) {{\n        /* {d.capitalize()} — dark (tokens that differ from light) */\n{decls(d, 'dark', only_diff_from=(d, 'light'), indent='        ')}\n      }}"]
    for t in others:
        dark_rules.append(f"      :root[data-theme=\"{t}\"]:not([data-mode=\"light\"]) {{\n        /* {t.capitalize()} — dark */\n{decls(t, 'dark', only_diff_from=(t, 'light'), indent='        ')}\n      }}")
    parts.append("    @media (prefers-color-scheme: dark) {\n" + "\n".join(dark_rules) + "\n    }")
    # Forced dark
    forced = [f"    :root[data-mode=\"dark\"] {{\n{decls(d, 'dark', only_diff_from=(d, 'light'))}\n    }}"]
    for t in others:
        forced.append(f"    :root[data-theme=\"{t}\"][data-mode=\"dark\"] {{\n{decls(t, 'dark', only_diff_from=(t, 'light'))}\n    }}")
    parts.append("\n".join(forced))
    # Print: always light of chosen theme, keep backgrounds
    # Selectors repeat the dark-mode selectors so the print rules match their specificity;
    # print comes last in source order, so it wins and a dark-mode machine prints the light tokens.
    print_rules = [f"      :root, :root:not([data-mode=\"light\"]), :root[data-mode=\"dark\"] {{\n{decls(d, 'light', indent='        ')}\n      }}"]
    for t in others:
        sel = f":root[data-theme=\"{t}\"], :root[data-theme=\"{t}\"]:not([data-mode=\"light\"]), :root[data-theme=\"{t}\"][data-mode=\"dark\"]"
        print_rules.append(f"      {sel} {{\n{decls(t, 'light', only_diff_from=(d, 'light'), indent='        ')}\n      }}")
    print_rules.append("      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }")
    print_rules.append("      @page { size: auto; margin: 16mm; }")
    parts.append("    @media print {\n" + "\n".join(print_rules) + "\n    }")
    # Data-viz palettes
    parts.append(indent_block(data.DATAVIZ_CSS, 4))
    parts.append("    " + END)
    return "\n\n".join(parts)


def stamp(path, block):
    html = open(path).read()
    pattern = re.compile(re.escape(START) + r".*?" + re.escape(END), re.S)
    if not pattern.search(html):
        raise SystemExit(f"{path}: markers {START} … {END} not found")
    html = pattern.sub(lambda m: block.strip(), html, count=1)
    open(path, "w").write(html)
    print(f"Stamped tokens into {os.path.relpath(path, SCRIPT_DIR)}")


def main():
    block = build_block()
    for t in TARGETS:
        stamp(t, block)


if __name__ == "__main__":
    main()
