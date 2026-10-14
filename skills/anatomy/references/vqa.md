# Visual QA: what to look for in the screenshots

`node "$A/tools/qa.mjs" <page>` runs the automated checks and writes screenshots (desktop light and dark, phone, blueprint,
apart). Open every screenshot and check it against this list before anything is shared. These rules were learned from
real review passes; each one names the failure it prevents.

## Line and tone

- **One line weight, always.** Selection, follow and focus change *colour*, never stroke width. A thicker outline drawn
  under later fills gets cut into crescents that read as tapered "AI strokes".
- **Subject tone is a step, not a jump.** The skin's `--anatomy-hi` is a warm dark grey, not near-black: at one weight a
  black outline beside warm-grey structure reads as a heavier stroke.
- **Nothing floats.** Legs have feet, posts have bases, signs have stands. `lines.mjs` catches floating texture lines;
  floating solids you have to see.
- **Painter's order.** Anything behind a rail, a wall or a tier must be hidden by it. The engine sorts by world bounds;
  a prop with wrong bounds draws in front of what should cover it. Check every prop at the default camera and at the
  apart view.

## Motion and state

- **No standing CSS transitions on the drawing.** The camera rebuilds the SVG while it orbits; a standing transition
  restarts on every rebuild and never finishes.
- **Moving things never pass through each other.** Queue a new arrangement until the last one has landed.
- **Check states in a frozen pose** (`scene({...})`), not while a tour or idle loop moves the camera.
- **A reader's choice ends any automatic event** (tour, wave, idle tour). It never resumes on its own after that.

## Layout

- **No inset scroll boxes.** Rails scroll with the page; only a mode switch may stick.
- **Controls never cover a phone drawing.** Under 600 px the figure toolbar takes its own row.
- **Pins and callouts land on visible things.** A pin whose anchor is hidden fades and drops its leader; on blueprint
  sheets pins hang below their anchor so they don't cross callout leaders.
- **Card outlines are borders, not box-shadow rings.** A ring draws outside the box and gets clipped by its column.
- **Phone framing shows the story.** At 390 px the default camera must still show every group the headline talks
  about, at a size where individual figures read.

## Honesty, visually

- **Missing is not negative.** A respondent never asked about something is drawn faded, not in the tone of a negative
  answer, and drops out of that base.
- **Decoration never looks like data.** Only bound props use the accent, needles, cells or figures.
- **The base is on screen** wherever a count is.
