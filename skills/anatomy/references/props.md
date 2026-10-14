# Generated props: making the scenery a study needs

A scene belongs to its subject: a halftime show gets a stage, a home-repair study gets damaged and repaired houses, a
running-shoe study gets a track. When the library (`props/*.js`) has nothing that reads as the subject, write the props
for this study. They live with the study, never in the repository, and go through the bench before any scene uses them.

## Where they go

- Write them to `scenes/<slug>/props/<name>.js` (study data: git-ignored, private).
- List the file in the study's `scene.json`: `"props": ["props/<name>.js"]`. The builder carries the source into the
  spec, so the page, the embed, the stills and the film all have it.
- Name them in the world's slots: for the lineup street, `scenery.low` / `scenery.high` (`references/patterns.md`).

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

## Scale and the viewer

- A person is 7 tall. A door is about 12, a car about 30 long, a house about 24 wide, a storey about 9.
- The camera looks from the +x, +y side, above, at an azimuth between 30° and 80°. The visible faces are the top, +x
  and +y: put doors, windows, signs and damage on those. A face toward -x or -y is never seen.
- Keep props low where people stand behind them. A tall prop belongs past the end of a lane, not beside one.

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
| A dot (handle, lamp, rivet) | `D([at([x, y, z])], { size: 0.5, tone })` |
| A seam around a slab | `S(..., { inner: L(k.sideSeam(plan, z, P, steps), { tone: "faint" }) })` |

Tones: `hi` (lightest face, glass, paint), `mid` (bodies, walls), `lo` (tyres, bases, tarps, shadowed parts), `faint`
(seams, marks). `free: true` marks a line end that is meant to stop in the air (a rope's stake, a crack's tip).

## Style rules

- Tones only. No colours, fonts or inline styles: the skin colours everything, light and dark.
- The accent (`lit`) is for data, never decoration.
- One line weight. Silhouette first: three to eight solids, then a few lines. If it needs a label to be recognised, the
  silhouette is wrong.
- States are variants of one prop (`damaged` / `repaired`, `empty` / `full`, `before` / `after`) that keep the same
  footprint, so the two ends of a scale read as the same thing changed.
- No study names, brands or copy in a prop. A prop that turns out generic can be promoted into `props/` later.

## The loop

1. Write the props file.
2. Bench it: `node "$A/tools/props/bench.mjs" scenes/<slug>/props/<name>.js`. It checks the contract, the footprint,
   the bounds at four azimuths, the scale, the brand and the line ends, and writes a light and a dark contact sheet next to
   the file (`bench/`). Fix until it passes. Never loosen a check; fix the prop.
3. Open both sheets and review them against the checklist below. Fix and re-bench until every item holds.
4. Put the props in the scene (`props` and `scenery` in `scene.json`), build, run `tools/qa.mjs`, and review the scene
   screenshots: the props must not hide people, cones or the scale words, and must read at the scene's own zoom.

## Review checklist (the sheet, then the scene)

1. **It names itself.** Someone who has not read the brief says what it is in two seconds, at azimuth 62.
2. **Variants read as states.** Damaged vs repaired, empty vs full are told apart at a glance, not on close inspection.
3. **Proportions.** Plausible against the person beside it.
4. **Nothing floats or shows through.** Every detail sits on a face, the ground or another solid.
5. **Clean in both themes.** Light and dark sheets both read; no part disappears into the paper.
6. **It belongs.** Same bevels, stepped forms and line weight as the library props on the same page.
7. **In the scene:** it hides no person, cone or scale word, and the scene still reads as the subject.
