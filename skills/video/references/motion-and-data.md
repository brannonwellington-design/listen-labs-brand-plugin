# Motion & data

Tokens (durations, easings, transitions) come from the brand's Motion section — Listen Labs: `get_motion`. This file is how to use them. Sources: Heer & Robertson 2007 (*Animated Transitions in Statistical Data Graphics*), Robertson et al. 2008, Bostock (*Object Constancy*), Material 3 and Carbon motion, and the rule sets of Remotion's and HeyGen HyperFrames' agent skills, filtered through a Rams brand.

## Choreography

- **Direction of ease.** Entrances use `enter` (decelerate), exits use `exit` (accelerate), moves between positions use `move`. Counters and fills use `settle`. Never bounce, elastic, or overshoot.
- **Asymmetry.** Exits run about 75% of the matching entrance. A single entrance is at most 800ms.
- **Offsets.** First motion 0.05–0.3s after a cut (motion at frame 0 reads as a glitch). Stagger 60–100ms by importance; the whole stagger stays under 500ms. The first thing to move is read as the most important.
- **Staging.** One thing leads at a time. A scene's motion budget: one entrance group, one data reveal, one emphasis. Anything else enters by fade or not at all.
- **Build → breathe → resolve.** Reveals happen in the first ~30%, the middle is settled and readable while narration explains it, the end holds or hands off.
- **Stillness before the peak.** A beat of no motion before the video's key reveal: 0.2–0.3s in a kinetic cut, 0.3–0.75s in an explainer.
- **No idle motion.** Nothing floats, breathes, pulses, glows, or drifts while the viewer reads.
- **Transform and opacity only.** Bars grow by `scaleX`/`scaleY` from their baseline origin; scale interpolates perceptually (in log space); never animate width, height, or font-size.
- **Vector continuity.** When a scene exits in a direction, the next enters from the opposite side along the same axis (a shift); a wipe starts from the mark that becomes the next scene.

## Transitions — one meaning each

| Transition | Meaning | Use |
|---|---|---|
| cut | attention reset | default between scenes |
| fade | an element arrives or leaves | labels, notes, captions inside a scene |
| fade-through | new topic, unrelated data | between unrelated findings |
| shift | next step in a sequence | X for time/sequence, Y for drill-down |
| expand | this thing, in detail | a mark grows into its own scene |
| wipe (brand signature) | change of surface or chapter | circle iris from the mark that becomes the next scene, or a line sweep; 2px leading edge in the incoming content color |

At most three types per video. Under reduced motion, all become fades.

## Honest data in motion

- **True baselines.** Bars and lines grow from the real zero (or the declared reference, e.g. 100 = average). Never from an arbitrary floor.
- **Fixed scales.** A scene's scale never changes while values are on screen. If a rescale is unavoidable it is its own stage, before value changes, with a reference line kept as a landmark.
- **At most two stages per transition** (e.g. axis, then values). Never change position, size, and color at once.
- **Each stage ~0.75–1.25s** (brand token `build`), slow-in/slow-out, then hold.
- **Intermediate frames are valid charts.** Don't tween between chart types in ways that pass through false values; cross-fade or cut instead.
- **Object constancy.** Each entity (a flavor, a segment) keeps its key, color, and screen position logic across scenes. Unrelated data never morphs into other data.
- **Counters land exactly.** Duration `count` (1.2–2.5s), easing `settle`, `tabular-nums` in a fixed-width box, rounded (not floored) display values, the unit or suffix arrives after the count lands, and the final frame shows the exact fact value with its original precision (46.7 stays 46.7).
- **A counter appears when it starts counting.** Never show a resting “0” or “0%” before the count begins — a still zero reads as the value. If the scene holds stillness before the reveal, the numeral enters with the count.
- **Number and graphic land together.** A count-up and its bar or ring fill share start, duration, and easing — one beat.
- **Same concept, same frame.** Successive stats about one concept keep the layout; only the value changes. A layout change signals a new idea.
- **Real marks only.** Illustrative motion uses the real data (actual combinations, actual respondents). Random marks that look like data are forbidden, even as texture.
- **Trends with many crossing series** animate only the highlighted series, or end on small multiples (Robertson et al.: animation is enjoyed but error-prone for analysis).

## Line weight

Line art is the house style for data in video — stems, rings, axes, tracks, strike-throughs, combination triangles, wipe edges — so it must read as one hand. **Every stroke in a video is the same weight** (Listen Labs: 2px design / 4px output, `get_motion` → `video.line_weight`). Tell lines apart by color tier: the story in the content or accent color, context in the muted color, structure (reference lines, tracks, axes) in the grid color. Never thicken a line to emphasize it — enlarge its end dot, change its color, or let it move first. Set the weight once as a constant and have every drawing helper read it, so no scene can drift.

## Edges

A figure that runs *almost* the full width reads as a mistake, because the eye can't find what it's aligned to. **Horizontal figures span the content box, margin to margin** (`get_motion` → `video.edges`): tracks, axes, strike lines, unit grids, rows of circles. When a figure needs room for values, the values move — above the line, or into a value column right-aligned at the margin — and the plot ends where that column begins, so the figure as a whole still ends on the margin. Circular forms center on the frame. Name the content box once (`M`, `R`) and derive every extent from it; a hand-typed `x1 = 452` is how drift starts. In QA, overlay the margins on the contact sheet and check that every figure starts and ends on them.

## Labels that survive new data

Hand-picked label positions are tuned to one dataset; the next study's values put them off the frame or on top of each other. The Gen Z test (second study) hit exactly this. So:
- **Point labels on an axis place themselves**: try slots (above/below the axis, near/far) × anchors (middle/end/start) and take the first that stays inside the figure box and clears every label already placed (`placeLabels` in `references/examples/genz-ai-30s.html`). If nothing fits, warn — then cut a label or change the form.
- **Values go inside their mark when the mark is big enough** (a circle's % at its center), set in the surface's on-accent color so it holds contrast on the fill. Labels below then carry only the name, and neighbours can't collide.
- **Edge labels align to the edge**: the first label in a row anchors start at the left edge, the last anchors end at the right edge, the rest center on their mark.
- **Source notes fit one line** inside the content box at every ratio; the composition warns when one doesn't, and the fix is shorter copy, never smaller type.
- **Stacked end cards flow from the text down**: the figure row sits at least 56px below the last line of copy, however many lines the title wraps to.

## Draw techniques

- **Lines and paths:** draw with `stroke-dasharray`/`stroke-dashoffset` from measured `getTotalLength()`; the end dot and label land after the path completes (`draw` token).
- **Rings / radial bars:** start at 12 o’clock; sweep clockwise; measure, don't hard-code circumference; the end dot travels with the arc.
- **Typewriter text:** slice the string; never animate per-character opacity.
- **Wipes:** a `clipPath` circle or rect driven by time; the outgoing scene keeps running underneath until covered.

## Accessibility

- No more than three flashes in any one second. A rapidly redrawn set of thin lines counts by its total area — design rapid redraws out rather than measuring them.
- Contrast floors apply to every settled frame, including text over a wipe edge.
- A settled-frame (resolve) still of every scene is the reduced-motion path.

## Worked examples — two seltzer shorts

Both are 30s, 9:16, from Seltzer Water Flavor Preferences (n = 300). Together they calibrate the kinetic pace.

**v1 — the reference for kinetic style.** Twelve scenes of about 2.5s, a different chart form in every scene (phyllotaxis bloom of 300 dots, 270° radial bars, a ring of 20 flavors, lollipops off the 100 line, area-true circles, one line striking five circles, a kinetic quote, dot-line bars, an axis strip, a combination ring, a unit grid, an end card), surfaces flipping blue / light / dark with circle and line wipes. Reviewers judged its pace and visuals right. What it got wrong, and the fixes now in the rules:
- **Random triangles in the “1,140 combos” scene**, redrawn every frame — data-looking marks that weren't data, flickering at 30Hz. Fix: light up the real top combinations one at a time.
- **Labels at 14 design px** (28px output) and a 12px credit line. Fix: label minimum 18, source note and credit 16.
- **Credit line and notes outside the safe zone.** Fix: place them inside the chosen profile.

**v3 — the approved reference** (`references/examples/seltzer-30s-kinetic.html`, 9:16 and 16:9): v1's scenes and pace with the fixes above, plus one line weight and margin-to-margin figures.

**Gen Z ChatGPT Usage Study — the generalization test** (`references/examples/genz-ai-30s.html`): ten scenes from the same templates and rules on different data — 270° reach bars, area-true circles per tool, a ring fill, an axis strip, dot-line bars, a slope for a small subgroup (shown as a count, 9 of 32), June → July dumbbells, a workflow end card. Every rule held unchanged; four things broke that seltzer never triggered — hand-placed axis labels ran off the frame, lane labels collided, a three-line end-card title ran into its figure, and long source notes overflowed 9:16. All four were fixed in general form (see *Labels that survive new data*), not patched per scene.

**v5 and v6 — the library at work** (built with `scripts/build-video.mjs` from `references/examples/seltzer.story.json`): the same storyboard and data as v3, with history loaded. v5 re-drew the four family scenes; v6, after the library grew to 23 executions in six families, re-drew eight scenes and re-ordered the surfaces. Lessons the build caught: fit checks must use the narrowest figure box (six vertical stems can't hold "Watermelon" at 9:16); text inside a muted mark needs its own on-mute color for contrast; and an encoding note in the storyboard ("circle area ∝ value") became false when the selector chose mirror bars — encoding legends now come from the execution.

**v2 — over-correction.** Rebuilt under explainer holds and “one headline + three stats” at 30s: six scenes of about 5s, the pack row used twice, two near-identical dot-on-a-line bars, the same top-left numeral layout in four scenes. Every rule check passed and the video was boring: slow, repetitive, visually thinner than v1. That is why kinetic pace, its own hold formula, and the variety rule exist. Rules that pass on a video nobody wants to watch are wrong rules.

**What v2 added that stays:** every number traces to a fact; a counter appears only when it starts counting; the finding can lead in the first seconds.
