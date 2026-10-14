# Examples

Synthetic, buildable configs for learning a pattern's `scene.json`. Nothing here is real: the study, the people and the
quotes are made up, and the source links point nowhere. Copy one into `scenes/<slug>/`, then replace the config and the
coding with the real study's.

| Folder | Pattern | Shows |
|---|---|---|
| `crowd/` | crowd | segments as stand blocks, two acts coded positive / neutral / negative (none = not asked, drawn faded), wishes as stage props, `people.filter`, rail wording (`standPhrase`, `hopePhrase`, `hopesHeading`), headline numbers from facts (ours and the report's), a report number given as a percentage |
| `journey/` | journey | stations with the report's counts and a coded true/false stop each, arrival and end labels, the words for people and stops (`page.who`, `page.stop`), a stall tension, a tour of `@references` |
| `lineup/` | lineup | the validator's codebook (`codebook.json`: closed answers, coded dimensions, report rows with bases), a worded scale with keys and a missing answer, a condition coded from an open answer (`dim`), scenery from library props, a tension from one condition to another, a tour beat that keeps the whole street in view, the reconciliation table |

Build one (from this skill's folder; crowd or journey: run `node tools/coding/check.mjs examples/<name>` first, then the pattern's builder and `pages/stadium.mjs` (crowd) or `pages/scene-page.mjs conveyor` (journey)): `node tools/patterns/lineup.mjs examples/lineup && node pages/scene-page.mjs lineup
examples/lineup/specs/scene.figure.json <out.html>`. The configs for the other patterns are documented in
`references/patterns.md`.
