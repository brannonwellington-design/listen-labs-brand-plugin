# Examples

Synthetic, buildable configs for learning a pattern's `scene.json`. Nothing here is real: the study, the people and the
quotes are made up, and the source links point nowhere. Copy one into `scenes/<slug>/`, then replace the config and the
coding with the real study's.

| Folder | Pattern | Shows |
|---|---|---|
| `crowd/` | crowd | segments as stand blocks, two acts coded positive / neutral / negative (none = not asked, drawn faded), wishes as stage props, `people.filter`, rail wording (`standPhrase`, `hopePhrase`, `hopesHeading`), headline numbers from facts (ours and the report's), a report number given as a percentage |
| `lineup/` | lineup | the validator's codebook (`codebook.json`: closed answers, coded dimensions, report rows with bases), a worded scale with keys and a missing answer, a condition coded from an open answer (`dim`), scenery from library props, a tension from one condition to another, a tour beat that keeps the whole street in view, the reconciliation table |

Build one (from this skill's folder; crowd: run `node tools/coding/check.mjs examples/crowd` first, then `tools/patterns/crowd.mjs` and `pages/stadium.mjs <spec> <out.html>`): `node tools/patterns/lineup.mjs examples/lineup && node pages/scene-page.mjs lineup
examples/lineup/specs/scene.figure.json <out.html>`. The configs for the other patterns are documented in
`references/patterns.md`.
