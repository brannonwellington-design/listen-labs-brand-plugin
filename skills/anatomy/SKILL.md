---
name: anatomy
description: "Turn a Listen Labs study into a custom interactive isometric scene where every figure, token or needle is a real respondent: a stadium of fans for a halftime-show study, a store aisle for a shopping study, a machine for a funnel. Coded per respondent from the transcripts with verbatim, source-linked quotes; reconciled against the report; QA'd automatically. TRIGGER when someone wants a study turned into a scene, world, interactive figure, explorable, 'something people haven't seen before', an isometric illustration of study data, or asks to follow individual respondents through a visual. Charts, one-pagers and decks without a scene belong to /research-artifacts, /report and /pptx; timeline videos to /video."
---

# Anatomy: study scenes

**Path convention.** This skill's folder is `${CLAUDE_SKILL_DIR}`; commands below run from it. The plugin root is
`${CLAUDE_SKILL_DIR}/../..`. Read `README.md` here for the architecture.

A scene is a **pattern** (how the data behaves: crowd, journey, comparison, sort) wearing a **world** (what it looks
like: a stadium, a store, a machine). Read `references/patterns.md` before proposing anything.

## Non-negotiables

1. **Study data never enters git.** This repository is public. Everything a study produces goes under
   `studies/<slug>/` (git-ignored): codes, transcripts, specs, renders. Tracked code names no study, category or copy.
   Those live in the spec.
2. **Internal studies stay local.** If the study title or audience marks it internal (e.g. "[Internal]"), or the person
   says it is confidential, build local files only. Never publish it, and never paste its quotes anywhere else.
3. **Every person on screen is a coded respondent.** Every quote is verbatim with its source link. Every count is drawn
   against a visible base. Missing is drawn as missing, never as negative.
4. **The coding is never tuned to match the report.** Reconcile it, and print the reconciliation on the page.
5. **Brand:** Listen Labs Paper tokens come from `docs/tokens.css` (built by the pages), Inter Regular 400 only, the
   standard `Listen Labs / <title>` header. See `skills/_shared/brand-compliance.md`.

## Workflow

1. **Pull.** Get the report with `get_study_analysis` and the guide with `get_study_state`. Save the report to
   `studies/<slug>/report.md`. Note every number the report states: they become reconciliation rows. Note every chart
   that lacks values: the coding has to supply those.
2. **Concepts.** Propose two or three concepts, each with a mapping table (`references/patterns.md`, "The concept
   step"). Ask the person to pick, and ask whether the result may be shared beyond them (non-negotiable 2).
3. **Code.** Follow `references/coding.md`: write the codebook (md for coders, json for the validator), run parallel
   coders, then run `node tools/coding/check.mjs studies/<slug>`, then verify any quote not checked by script.
4. **Spec.** Write `studies/<slug>/scene.json` (crowd: the schema in `references/patterns.md`) and build it:
   `node tools/patterns/crowd.mjs studies/<slug>` or `node tools/patterns/lineup.mjs studies/<slug>`. The builder refuses hand-typed numbers, titles with numbers, and
   claims whose `assert` fails. Fix the copy, not the check.
   Journey, comparison and sort still use hand-written specs; follow the shape of the closest existing one.
5. **Build.** Any scene: `node pages/scene-page.mjs <object> studies/<slug>/specs/scene.figure.json studies/out/<slug>.html`
   (`lineup`, `stadium` …; the stadium also has its own richer page, `pages/stadium.mjs`). For
   the other patterns, use `pages/onepager.mjs` (journey, `conveyor` or `conveyor@aisle`), `pages/dashboard.mjs`
   (comparison) or `pages/scrolly.mjs` (sort).
6. **QA.** Run `node tools/qa.mjs studies/out/<slug>.html` (pass `--api CONV`, `WB` or `BENCH` for the other patterns).
   It must pass. Then open every screenshot it wrote and review it against `references/vqa.md`. Fix and re-run until
   both are clean.
7. **Bundle.** Run `node tools/bundle.mjs <object> <spec> studies/<slug>/bundle --share internal|shareable` (add
   `--video` for a film). Every host uses the bundle: a page pastes `embed.html`, a deck uses the per-beat stills, and
   all their words and numbers come from `manifest.json`. See `references/embedding.md`. When the person asked for the
   scene inside a one-pager or a deck, hand the bundle to `/research-artifacts` or `/pptx` and follow that section.
8. **Deliver.** Hand over the file(s) and a short summary: what the scene shows, the reconciliation, and what it can't
   show. Publish as a private Artifact only if the person said it may be shared, and never for an internal study.

## When the world doesn't exist yet

New props follow the contract at the top of `props/machine.js`: `build(ctx, options) → { items, part }`, where every
item has world `bounds` and a `phase`. Use the kit and `engine/primitives.js` (racetrack bands for tiers, lanes and
rows; `ground`; `person`). Check a new prop with `tools/dev/world-test.mjs` at several azimuths before wiring it in. The
engine depth-sorts by bounds, so a prop drawn in front of something that should hide it has wrong bounds.
