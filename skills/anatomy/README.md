# Anatomy: study scenes

Turns a Listen Labs study into an interactive isometric scene: a machine, a store, a stadium. Every figure, token and
needle stands for real respondents, every quote is verbatim with its source link, and the base n is always on screen.

```
study ─► coding (per respondent, verbatim evidence) ─► spec ─► world (props on a pattern) ─► page ─► QA
```

| Folder | What lives there |
|---|---|
| `kit/` | The vendored isometric kit (MIT, unmodified; see `kit/README.md`). |
| `skin/` | Maps the kit's tokens to Listen Labs Paper, light and dark. |
| `engine/` | `compose.js`: props emit items with 3D bounds and a phase (ground, far, carrier, near, front); the composer depth-sorts them, so any world stacks correctly without hand ordering. `primitives.js`: racetrack bands (tiers, lanes, rows), ground, person. |
| `props/` | Prop libraries: `machine.js`, `shop.js`, `stage.js`, `street.js`. A prop is `build(ctx, options) → { items, part }` and declares the data slots it can carry. |
| `worlds/` | A world lays props out for a study's data: `conveyor` and `aisle` (ordered journey), `stadium` (one figure per respondent, by segment, reacting to a condition), `curb` (one figure per respondent standing at their own rating, a lane per group). |
| `objects/` | Live runtimes (camera, parts, blueprint, follow, tension, scripts) and the earlier sorter and workbench objects, not yet on the engine. |
| `pages/` | `scene.mjs` (the one builder every host uses), `scene-page.mjs` (a finished page for any scene), the older shells `onepager`, `scrolly`, `dashboard`, `stadium`, and `stage` (16:9 for video). |
| `scripts/`, `tools/` | Line check, browser driver, recorder; `tools/dev/` holds engine regression checks. |
| `scenes/<slug>/` | **Not in this folder.** A study's specs, codes, quotes and renders live in the working folder of whoever builds it, kept out of git (the plugin folder is replaced on every update). Study data never enters this repository: some studies are internal or customer-confidential, and this repository is public. A local `studies/` folder here is git-ignored for development. |

## Rules every scene keeps

- A count is drawn against a visible base n. Missing data is drawn as missing, never estimated, and never drawn like a negative answer.
- Quotes are verbatim with their source link; a paraphrased lead-in stays outside the quotation marks.
- Coding never gets tuned to match the report; the reconciliation is printed on the page.
- Code holds no study-specific copy, categories or names, including a study's words for its people and findings ("shoppers",
  "hesitated"). Those live in the spec (`arrival`, `predicates`, `page.who`, `page.stop`, `page.*`). Before every commit,
  run `node skills/anatomy/tools/dev/leak-scan.mjs` from the repository root: it checks every tracked file for the
  names, phrases and coded keys of every study on this machine, and must print 0 hits.
- One line weight; highlights change colour only. Verify with `node scripts/lines.mjs <page> --reduced` (must print `line ends: 0`).
