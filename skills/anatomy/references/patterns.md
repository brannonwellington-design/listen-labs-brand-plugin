# Patterns, worlds and the concept step

A scene is a **pattern**, which sets how the data behaves, wearing a **world**, which sets what it looks like.
- A pattern is chosen by the shape of the study's data.
- A world is chosen by what the study is about.
- The same pattern can wear many worlds, and the same data can be re-staged without touching the data code
  (`conveyor` and `aisle` show the same data and runtime in two worlds).

| Pattern | Fits when the study has… | Encodings | Worlds today | Builder |
|---|---|---|---|---|
| **crowd** | a segment (rating, group, region) and one or more things people react to (acts, products, ads, moments), plus optional multi-mention wishes | one figure per respondent; standing = positive, seated = neutral or negative, faded = not asked; a scoreboard cell per positive; one prop per wish, with its count | `stadium` | `tools/patterns/crowd.mjs` |
| **lineup** | a closed rating question (0–10, 1–5, 1–7) asked of everyone, by segment, in one or more conditions (situations, products, moments) | one figure per respondent standing at their own rating; a lane per group, people with the same rating one behind another (a dot plot); a marker at each lane's median; switching the condition walks everyone to their rating for it; no answer = faded, off the scale | `curb` | `tools/patterns/lineup.mjs` |
| **journey** | ordered stages of one experience (find → buy → ship) with a count per stage; counts may overlap | carriers ride past every station; a gauge per station reads count of n; follow one respondent through their own stops | `conveyor`, `aisle` | hand-built spec (`pages/onepager.mjs`) |
| **comparison** | 2–4 named options compared on the same measures (reach, ratings, reasons) | a bench per option; needles and tubes per measure; ghost needles for an earlier wave | `workbench` | hand-built spec (`pages/dashboard.mjs`) |
| **sort** | one sample split many ways: exclusive groups and multi-mention reasons, told as chapters | coins (one per respondent) sorted into columns; drawers pulled out by count | `sortbench` | hand-built spec (`pages/scrolly.mjs`) |

Crowd and lineup have generic builders, and both render with the generic page (`pages/scene-page.mjs`). Journey, comparison and sort run on hand-written specs today. Porting them to `tools/patterns/` builders, as `crowd`
already is, is the next step.

## The concept step

Before building, propose **two or three concepts**. The person picks one; don't pick for them. Each concept is:

1. **A one-line picture**: what the reader sees ("a stadium; each interview is a fan; they stand for the act they're
   excited about").
2. **Pattern and world**, from the table above. A world that doesn't exist yet is fine. Say so, and name the props it needs.
3. **A mapping table**: each piece of data → the prop or encoding that carries it → its base n. Every row must be an
   honest encoding from the table above. A prop with no data is decoration and must not use the accent, figures,
   needles or cells.
4. **The one thing it makes obvious** (the tension), and the facts that back it.
5. **What it can't show** (missing values, small groups), and how the page will say so.

Prefer a world that belongs to the study's subject (a stadium for a halftime show, a store for shopping, a track for
running shoes) over a generic machine, and only when the mapping stays honest.

## Lineup config (`studies/<slug>/scene.json`)

Like the crowd config (study, segments, figure, tension, page, tour, assert, countFacts), plus:
- `scale`: `{ min, max, high, low, lowLabel, highLabel }`. `high` and `low` define the "at or above" and "at or below"
  counts in the facts.
- `conditions`: `[{ key, name, short, closed: "<closed key holding the rating>", dressing, reportMedian: { <group>: n } }]`.
- `why`: `{ dim, map }`, a coded dimension naming the condition each person explained as lowest. Its quote attaches to
  that condition.

Facts include:
- `group.<g>.<cond>.median`, `.n`, `.high`, `.low` and `.counts`
- `report.<cond>.<g>`, `drop.<g>`, and `swing.label` / `swing.from` / `swing.to`: the largest fall from the first
  condition to the tension condition, with a reason

Tour beats take `cond`, `group`, `follow: "swing"`, `tension`, and `quote: "why:<cond>:<group>"`.

## Crowd config (`studies/<slug>/scene.json`)

```jsonc
{
  "pattern": "crowd", "world": "stadium", "labelPrefix": "F",
  "study": { "id": "…", "title": "…", "url": "…", "reportN": 0 },
  "segments": { "closed": "<closed key>", "groups": [{ "key": "…", "name": "…", "scale": "…", "filter": [<filter>] }] },
  "conditions": [{ "key": "…", "name": "…", "when": "…", "dim": "<exclusive dim: positive/neutral/negative>", "dressing": "backline | hopes", "report": [count, base] }],
  "hopes": { "dim": "<multi dim>", "base": [<filter>], "items": [{ "key": "…", "name": "…", "prop": "led-wall", "propName": "LED wall" }] },
  "evidence": ["<extra dims to keep quotes for>"],
  "countFacts": { "<name>": [<filter>] },
  "assert": ["block.<key>.<cond>.positive == block.<key>.size", "up.<a> > up.<b>"],
  "figure": { "fig": "Fig 1", "title": "…", "hint": "…", "label": "…{n}…", "caption": "…", "titleBlock": [["Base", "n = {n} coded"]] },
  "tension": { "label": "…", "act": "<condition key>", "numbers": ["…{block.<key>.<cond>.positive} of {block.<key>.size}…"] },
  "page": { "frame": "…", "headline": "…", "dek": "…", "blocksHeading": "…", "hopesHeading": "…", "segmentNote": "rated {value} of {lit:5}",
            "headlineStats": [{ "value": "<report number>", "base": "of <report base> …" }], "notes": ["…"] },
  "tour": [{ "hold": 6, "act": "<cond>", "block": "<key>", "hope": "top | <key>", "follow": "swing", "tension": true,
             "title": "no numbers", "caption": "{facts}", "quote": "block:<key>:<cond> | hope:top" }]
}
```

**Copy rules the builder enforces:**
- Numbers enter copy only as `{facts}` (see the `facts` object in `crowd.mjs`). A literal digit fails the build, except
  a non-data number written `{lit:1–5}` and the report's own numbers in `headlineStats` and `report`.
- Titles carry no numbers.
- A claim ("all", "most", "more than") needs an `assert` that the build checks.
- Copy never points at a page part ("in the header", "on the right"): the same caption and notes travel into
  one-pagers, decks and reports through the bundle.

Stage props available for hopes: `led-wall`, `dance-floor`, `guest-lift`, `flags`, `mic-stand`, `line-array`.
A new prop goes in `props/stage.js` (contract at the top of `props/machine.js`), and its stage position goes in
`worlds/stadium.world.js`.
