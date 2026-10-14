# Generated props: making the scenery a study needs

A scene belongs to its subject: a halftime show gets a stage, a home-repair study gets damaged and repaired houses, a
running-shoe study gets a track. When the library (`props/*.js`) has nothing that reads as the subject, write the props
for this study. They live with the study, never in the repository, and go through the bench before any scene uses them.

## Where they go

- Write them to `scenes/<slug>/props/<name>.js` (study data: git-ignored, private). When developing inside the plugin
  repository itself, the study folder is `skills/anatomy/studies/<slug>/` instead; the same rules apply.
- List the file in the study's `scene.json`: `"props": ["props/<name>.js"]`. The builder carries the source into the
  spec, so the page, the embed, the stills and the film all have it.
- Name them in the world's slots: for the lineup street, `scenery.low` / `scenery.high`, and set `scenery.surface`
  (`tiles` pavement, `lanes` for a track or road, `plain`) so the ground belongs to the subject too
  (`references/patterns.md`).

## The contract

```js
PROPS["finish-arch"] = {
  slots: {},                                 // data encodings it can carry; {} for scenery
  footprint: [12, 40],                       // [along x, along y] in world units: everything it draws stays inside
  variants: [{ state: "empty" }, { state: "crowded" }],   // optional: each is benched; worlds pass them as opts
  build(c, { x, y, state = "empty", part = "arch" }) {      // centred on (x, y); the ground is z = 0
    const { k, P, S, L, D, slab, faceX, faceY, rect, at } = c;
    const out = [];
    // … solids, lines and dots, pushed back to front …
    return {
      items: [{ phase: "near", part, tip: part, svg: out.join(""), bounds: [x0, y0, 0, x1, y1, z1] }],
      part: { name: "Finish arch", move: [0, 0, 16], anchor: [x, y, z1] },   // move: how far it lifts in Take apart
    };
  },
};
```

- `bounds` must cover **everything** the item draws, ropes and puddles included. The engine depth-sorts by bounds; a
  drawing that spills past them gets painted over the wrong things. The bench measures this.
- `phase`: `ground` lies flat on the ground (markings, rugs, puddles), `far` stands behind the data, `near` stands
  among it. Split a prop into several items when something could stand between its parts (a gate's two posts).
- Several solids inside one item draw in the order you push them: far ones first. `c.byDepth(points)` sorts positions
  far to near (wheels, posts, legs).

- **Ground paint** (a start line, a chequer, a puddle) is its own item with `phase: "ground"` and **no `part`**, so it
  stays on the ground when the scene is taken apart. Anything with a `part` lifts by its `move`.

## Scale and the viewer

- A person is 7 tall. A door is about 12, a car about 30 long, a house about 24 wide, a storey about 9.
- The camera looks from the +x, +y side, above, at an azimuth between 30° and 80°. The visible faces are the top, +x
  and +y: put doors, windows, signs and damage on those. A face toward -x or -y is never seen.
- Keep props low where people stand behind them. A tall prop belongs past the end of a lane, not beside one.
- At the lineup street's azimuth (62°), y is the depth axis: things meant to read side by side (a podium's three steps,
  a row of signs) run along x. A row along y stacks up behind itself and loses its shape. Check the 62° column of the
  bench sheet first.
- Across-both-lanes props (a gantry, a start line) are long in y: footprint about [12–16, 104] for the street's two lanes.

## Drawing cookbook (c = the drawing context, k = the kit)

| Want | Use |
|---|---|
| A box with rounded corners | `S(slab({ x, y, w, d, r }, z, h, steps, bevel), { tone })` |
| A post, wheel, pot, head | `S(k.cylinder(cx, cy, radius, z, h, P, steps, bevel), { tone })` |
| A rotated or irregular solid (a car askew, a wedge plan) | `S(k.extrude(ring, z, h, P, { convex: true }), { tone })`, ring = `[[x, y], …]` |
| A roof, a pyramid, a stepped form | stacked slabs, each inset a little: slopes don't exist, steps read as roofs |
| An outline on a wall (window, door, sign) | `L(faceY(y, rect(x0, x1, z0, z1)), { tone })` or `faceX(x, rect(y0, y1, z0, z1))` |
| A line in space (rope, crack, rail) | `L(k.segment([x, y, z], [x, y, z], P), { tone, free: true })` |
| A line on the ground | `L(k.lineOnTop([x, y], [x, y], z, P), { tone })` |
| A ring on the ground (puddle, mark) | `L(k.ring(cx, cy, r, z, P, steps), { tone: "faint", free: true })` |
| An upright ring (a wheel, a porthole, a clock face) | `L(k.sideRing([x, y, z], r, "x" or "y", P), { tone })`: "x" stands in the plane facing +x, "y" facing +y |
| A dot (handle, lamp, rivet) | `D([at([x, y, z])], { size: 0.5, tone })` |
| A seam around a slab | `S(..., { inner: L(k.sideSeam(plan, z, P, steps), { tone: "faint" }) })` |
| An area that should read darker (paint, tape, a chequer cell, a tarp) | `L(c.hatch({ x, y, w, d }, z, gap), { tone })`: diagonal hatching |

**Fills are always paper.** A solid's tone colours its edges and the face shading, not a darker fill: `lo` gives a
heavier outline, not a black object. To make an area read darker, hatch it, and give the hatched area a drawn edge for
every hatch line to end on: the top edge of a slab with its default crease, or `L(k.planOutline(plan, z, P), …)`. For the scene's own light and dark themes,
`mid` and `lo` survive both; `faint` details can vanish in dark, so keep anything that must read at `mid`.

**Creases.** `crease: "none"` on a solid also drops its top edge line. Hatching or lines that should end on that edge
then float; keep the default crease on any solid other lines end on.

**No tilted solids.** Solids extrude straight up from a plan: there are no slopes, tilted planes or upright discs. A
sagging roof is stepped slabs; a tyre is a low cylinder (a puck) plus an upright ring line on its visible side.

**Line ends.** The line check (`scripts/lines.mjs`) needs every texture line to end on something: another stroke, a dot,
an outline, or under a solid painted after it. A line that merely lies on a face's interior is not rooted. Fixes, in
order: end it on an edge, put a dot (`D`) at the end (a knot, a rivet), draw the solid that should cover the end after
the line, or mark an end that truly stops in the air with `free: true` (both ends), `free: "start"` or `free: "end"`.

## Style rules

- Tones only. No colours, fonts or inline styles: the skin colours everything, light and dark.
- The accent (`lit`) is for data, never decoration.
- One line weight. Silhouette first: three to eight solids, then a few lines. If it needs a label to be recognised, the
  silhouette is wrong.
- States are variants of one prop (`damaged` / `repaired`, `empty` / `full`, `before` / `after`) that keep the same
  footprint, so the two ends of a scale read as the same thing changed.
- A prop that carries data takes `lit` (true while its data is selected, e.g. a stadium hope) and passes it to its
  main solid: `S(..., { tone, lit })`. Scenery that carries no data ignores it.
- No study names, brands or copy in a prop. A prop that turns out generic can be promoted into `props/` later.

## The loop

1. Write the props file.
2. Bench it: `node "$A/tools/props/bench.mjs" scenes/<slug>/props/<name>.js` (add `--zoom 2` to see small details).
   The line check always runs at zoom 2, so a pass doesn't depend on the zoom you view at; floating ends are ringed in
   `bench/zoom2/<name>-lines.png` (or `bench/<name>-lines.png` at zoom 2). It checks the contract, the footprint,
   the bounds at four azimuths, the scale, the brand and the line ends, and writes a light and a dark contact sheet next to
   the file (`bench/`). Fix until it passes. Never loosen a check; fix the prop.
3. Open both sheets and review them against the checklist below. Fix and re-bench until every item holds.
4. Do the blind read (below) and redraw until every prop and state passes it.
5. Put the props in the scene (`props` and `scenery` in `scene.json`), build, run `tools/qa.mjs`, and review the scene
   screenshots: the props must not hide people, cones or the scale words, and must read at the scene's own zoom. QA's
   "every person visible" check fails if scenery hides anyone.

## The blind read

The person who wrote a prop can't judge whether it names itself: they know what it is. Before a prop goes in a scene,
someone who hasn't seen the brief names it cold.

1. Bench with `--blind`. The sheet's rows are lettered, and the answer key goes to `bench/<name>-blind-key.json`.
2. Start a fresh subagent with no brief, only this prompt and the light sheet's path:
   > Open this image. It is a contact sheet of small isometric objects, one per lettered row, each shown from four
   > angles with small figures for scale. For each row, say in a few words what the object is, and if two rows look
   > like the same object in different states, say what changed. Don't guess from context; say "unclear" if it is.
   > Image: `<path to bench/<name>-blind-light.png>`
3. Compare its answers with the key. A row passes when the answer names the same thing (a "gate" for a finish arch
   with tape is close enough; a "fence" is not) and a state pair passes when the change is named. Redraw what fails,
   following what the reviewer saw instead, and run a fresh reviewer: one who has seen an earlier sheet isn't blind.

## Review checklist (the sheet, then the scene)

1. **It names itself.** Someone who has not read the brief says what it is in two seconds, at azimuth 62.
2. **Variants read as states.** Damaged vs repaired, empty vs full are told apart at a glance, not on close inspection.
3. **Proportions.** Plausible against the person beside it.
4. **Nothing floats or shows through.** Every detail sits on a face, the ground or another solid.
5. **Clean in both themes.** Light and dark sheets both read; no part disappears into the paper.
6. **It belongs.** Same bevels, stepped forms and line weight as the library props on the same page.
7. **In the scene:** it hides no person (QA checks), cone or scale word, and the scene still reads as the subject.
