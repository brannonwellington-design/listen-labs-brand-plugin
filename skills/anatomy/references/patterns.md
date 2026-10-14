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
| **journey** | ordered stages of one experience (find → buy → ship) with a count per stage; counts may overlap | carriers ride past every station; a gauge per station reads count of n; follow one respondent through their own stops | `conveyor`, `aisle` | `tools/patterns/journey.mjs` |
| **comparison** | 2–4 named options compared on the same measures (reach, ratings, reasons) | a bench per option; needles and tubes per measure; ghost needles for an earlier wave | `workbench` | `tools/patterns/comparison.mjs` |
| **sort** | one sample split many ways: exclusive groups and multi-mention reasons, told as chapters | coins (one per respondent) sorted into columns; drawers pulled out by count | `sortbench` | `tools/patterns/sort.mjs` |

Every pattern has a builder in `tools/patterns/`. They all enforce the same rules (`lib.mjs`). Crowd and lineup
compute their scene from the coding. Journey, comparison and sort are **report-driven**: their config carries the
report's own structure (stations, chapters, benches), and the coding attaches the people. Their pages are
`pages/onepager.mjs` (journey), `pages/scrolly.mjs` (sort) and `pages/dashboard.mjs` (comparison); crowd and lineup
render with `pages/scene-page.mjs`.

## Report-driven configs (journey, sort, comparison)

The config has the shape of the scene's spec, with every copy string written as a template:
- `{stations.<key>.count}`, `{steps.<key>.stat.value}`, `{benches.<key>.users}`: report data by key
- `{study.n}`, `{lit:…}` for non-data numbers, `@references` in tour captions

Data fields (counts, a stat's value, the report's headline stats) stay plain numbers.

**A number the report states that is not part of the scene's data** goes in `reportFacts`, by name and with where it
came from, and copy cites it by name:
```jsonc
"reportFacts": { "kept_quant": { "value": 15, "from": "report: work customers keep outside Listen (advanced quant)" } }
"body": "Customers still keep advanced quant ({reportFacts.kept_quant.value}) outside Listen."
```
Never link a number to a fact because the values match: two findings can share a number. Porting the first three
studies found two such coincidences.

People attach through `people: { filter, prefix, fields, method, privacyNote }`. Journey stations name their `code`,
and the builder counts each station's coded people for the reconciliation. Sort chapters carry their `follow` map,
which the builder checks against the column count. Comparison can add `wavesFrom: { file, minN, keys, note }` for a
tracker's cohorts.

The builders check each scene's limits:
- **journey:** 3–5 stations, counts within n
- **sort:** exclusive chapters place all n in 5 columns or fewer; cabinets have 7 drawers or fewer
- **comparison:** 2–4 benches, users within the base, ratings 0–100

## The concept step

Before building, propose **two or three concepts**. The person picks one, unless they've said to pick for them: then
pick, and write why in `concepts.md` so they can overrule it. Each concept is:

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

## Journey config (`scenes/<slug>/scene.json`)

A full synthetic config is in `examples/journey/`. The report gives each stage's count; the coding puts people on it.
- `world`: `conveyor` (a machine) or `aisle` (`conveyor@aisle` on the page: a store). `study.n` is the report's base.
- `stations`: 3–5, in order, the first being where people arrive. Each: `key`, `name`, `prop` (its role: `hopper`
  first, then `bin-rack`, `photo-eye`, `labeler`, `threshold-gate`), `count` (the report's), `code` (the coded
  dimension that means this person stopped here), `statement` ("found it easy to start": completes "N of n …"),
  `readout`, `implication`, optional `contrast: { count, statement }`, `quote` and `source` (a report quote; it is
  credited to the coded respondent its link points to), `camera` (optional: defaults to framing the station).
  In the aisle, `fixture` (a library or study prop with a footprint, at most 56×40) replaces the station's shop fitting.
- Station codes are `true` / `false`. If the coding uses other values, list the ones that mean a stop in `codeOn`; a
  coded `none` never counts.
- `people`: `{ filter, prefix, fields: { lastOrder: "<closed key>" }, method }` puts the coded respondents on the line.
- `arrival`: `{ code, on, off, lastLabel, endLabel }`: how a followed respondent's journey starts and ends, in words.
- `page.who` (`{ one, many }`, default respondent / respondents) and `page.stop` (`{ on, off, at }`, default "Stopped
  here" / "No stop coded here" / "stopped at"): the study's own words for its people and its stops.
- `tension`: `{ label, event: "stall", target: { station }, numbers: ["@stations.<key>.finding", …] }`.
- `scripts.tour.beats`: `{ hold, station?, camera?: "wide", title, caption, sub?, quote? }`; captions and quotes are
  `@references` (`@stations.<key>.finding`, `.contrast`, `.quote`, `@page.dek`), resolved at build time.
- The page prints the reconciliation (the codebook's `report` rows) as a table, and its source line says how many
  interviews were coded as well as the report's n.

## Lineup config (`scenes/<slug>/scene.json`)

Like the crowd config (study, segments, figure, tension, page, tour, assert, countFacts), plus:
- `scale`: `{ min, max, high, low, lowLabel, highLabel }`. `high` and `low` define the "at or above" and "at or below"
  counts in the facts. A worded scale gives `labels` (low to high, e.g. `["Very poor", "Poor", "Fair", "Good",
  "Excellent"]`) instead of `min`/`max`; the words stand at 1…n, so `high: 4` means Good or better. Answers listed in
  `missing` (e.g. `["Not applicable"]`) count as no answer for that condition: drawn faded, left out of the median and n.
  The coding copies the answer words exactly; the builder maps them. `lowPhrase` / `highPhrase` say how a threshold reads
  in copy and on the rail: "or worse" / "or better" by default, "or less" / "or more" for prices and amounts. Keep each
  word to about 12 characters ("$51–100", not "$51 to $100"); longer words shrink on the ruler and stop reading.
- `scenery` (optional): the street's own end-of-lane props instead of the default curb, building and pod, so the street
  belongs to the subject. `{ low: [item…], high: [item…], surface? }`, item `{ prop, lane: 0 | 1 | "both", opts?, name? }`,
  lined up outward from the scale, nearest first (an item across both lanes starts past whatever either lane holds).
  `surface`: `tiles` (pavement, the default), `lanes` (lines along the scale: a track or road) or `plain`. Props come from `props/street.js` (e.g. `sedan` and `house` with
  `opts.state` `damaged` or `repaired`, `body-shop`); a new prop declares a `footprint`. Pick props whose low and high
  ends read as the scale's two ends.
- `page.condLabel` (optional): what the condition control is called ("Moment", "Product"; default "Situation"). More
  than four conditions show as a dropdown.
- `conditions`: `[{ key, name, short, closed: "<closed key holding the rating>" | dim: "<coded dimension>", dressing,
  reportMedian: { <group>: n } }]`. Use `dim` when the position comes from an open answer coded onto the scale (a price
  band, a frequency band): the coders code the dimension with its evidence, and the condition reads it. A coded value of
  `none` is no answer. If the coded values are short keys, list them in `scale.keys`, in the same order as
  `scale.labels`. One condition is fine: the switch disappears and the tension shows its contrast without a walk.
- `why`: `{ dim, map }`, a coded dimension naming the condition each person explained as lowest. Its quote attaches to
  that condition. For a scale where "lowest" doesn't fit (a price, a frequency), give each condition its own quote source
  instead: `conditions[].quoteDim`, the coded dimension whose evidence explains that position. Beats quote it with
  `quote: "quote:<cond>:<group>"` (`why:` works the same).
- `scale.verb`: how the readout reads a person's position ("rated Good" by default; "would spend $300+", "plays weekly").
- `scenery.lowGap` / `highGap`: how far the end props stand from the scale's end ticks (18 and 32 by default; smaller
  pulls a prop right up to the end, so "the flagship sits at the top of the scale" reads, but keep room for the people
  standing at the end).
- `page.headlineStats`: `[{ value, base }]`, the big numbers in the header. The value is a fact like every other number:
  the coding (`{group.casual.ceiling.high}`) or the report's own (`{report.<cond>.<g>}`, `{recon.N.report}`, and then say
  "report" in the base). Don't headline a report number the scene draws differently without saying so.

Facts include:
- `group.<g>.<cond>.median`, `.medianWord` (the scale word, or "between Fair and Good"), `.n`, `.na` (answered
  "missing"), `.high`, `.low` and `.counts`; `scale.highWord` and `scale.lowWord`
- `report.<cond>.<g>`, `drop.<g>`, and `swing.label` / `swing.from` / `swing.to` (`.fromWord` / `.toWord` on a worded scale): the largest fall from the first
  condition to the tension condition, with a reason

Tour beats take `cond`, `group`, `follow: "swing"`, `tension`, `wide: true` (keep the whole street in view, for beats
where the scenery is the point), and `quote: "why:<cond>:<group>"`.

`tension`: `{ label, from?, cond, numbers }`: everyone walks from `from` (default the first condition) to `cond`.
`swing: "fall"` (default) or `"rise"` picks the person who moves furthest in that direction, for `follow: "swing"`.

The page prints the reconciliation (the codebook's `report` rows) as a table, "Against the report"; notes need not repeat
it.

## Crowd config (`scenes/<slug>/scene.json`)

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

**Crowd notes** (a full synthetic config is in `examples/crowd/`):
- Each condition's `dim` is coded exactly `positive`, `neutral`, `negative` or `none` (not asked: drawn faded, never as
  negative). Standing means positive.
- `people.filter` leaves coded rows out of the crowd (an interview that never reached the questions). Every remaining
  row must fall in a segment group; a group may match people never asked the segment question (a `not` / `any`
  filter) and is named as such ("Region not asked").
- Rail wording: `page.standPhrase` ("on their feet for"), `page.hopePhrase` ("hoped for"), `page.hopesHeading`. Write
  them for the study: two questions about one product aren't "acts", so "said yes to" may read better than "on their feet".
- Quotes need at least 50 characters (40 for hopes); the shortest qualifying quote is picked by rule.
- `headlineStats` values are facts: ours (`{up.<cond>}`, `{block.<key>.<cond>.positive}`) or the report's
  (`{report.<cond>.count}`, `{reportFacts.<name>.value}`), with "report" said in the base text.
- A report number stated only as a percentage goes in the codebook's report row as `{ "pct": 40, "of": 50 }`; the table
  shows the derived count and says it came from the percentage.

**Hope props.** `prop` names a stage prop from `props/stage.js` (`led-wall`, `dance-floor`, `guest-lift`, `flags`,
`mic-stand`, `line-array`: each has its own spot on the stage) or any prop from the study's own `props` files with a
footprint of at most 30×24. Those stand in a row across the front of the field, up to four, in the order of `items`
(the stage keeps its backline when every hope is a field prop), built with `{ x, y, lit, part,
...propOpts }`: `lit` is true while that hope is selected, so the prop's main solid takes the accent (it carries data).

**Figure titles are short:** the title shares the card's top edge with the controls, so about 17 to 25 characters fit
depending on the controls. QA's "nothing cut off" check fails a title that's clipped; shorten it.

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
