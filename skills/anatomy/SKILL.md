---
name: anatomy
description: "Turn a Listen Labs study into a custom interactive isometric scene where every figure, token or needle is a real respondent: a stadium of fans for a halftime-show study, a store aisle for a shopping study, a machine for a funnel. Coded per respondent from the transcripts with verbatim, source-linked quotes; reconciled against the report; QA'd automatically. TRIGGER when someone wants a study turned into a scene, world, interactive figure, explorable, 'something people haven't seen before', an isometric illustration of study data, or asks to follow individual respondents through a visual. Charts, one-pagers and decks without a scene belong to /research-artifacts, /report and /pptx; timeline videos to /video."
---

# Anatomy: study scenes

**Path convention.** `$A` below means this skill's folder, `${CLAUDE_SKILL_DIR}`; the plugin root is `$A/../..`. Read
`$A/README.md` for the architecture. Commands run from the person's **working folder**, never from `$A`: the plugin
folder is replaced on every update, so anything written there is lost. Each study gets `scenes/<slug>/` in the working
folder, and finished pages go to `scenes/out/`. Before writing anything, if the working folder is a git repository, make
sure `scenes/` is in its `.gitignore` (add it if not), so study data can't be committed by accident.

A scene is a **pattern** (how the data behaves: crowd, journey, comparison, sort) wearing a **world** (what it looks
like: a stadium, a store, a machine). Read `$A/references/patterns.md` before proposing anything.

Files the workflow writes (report, concepts, codebook, configs) can be written with any tool; if one tool refuses a file
type, write it with the shell.

## Non-negotiables

1. **Study data never enters git.** Everything a study produces goes under `scenes/<slug>/` in the working folder, kept
   out of git: codes, transcripts, specs, renders. The plugin repository is public, so its code names no study,
   category or copy. Those live in the spec.
2. **Internal studies stay local.** If the study title or audience marks it internal (e.g. "[Internal]"), or the person
   says it is confidential, build local files only. Never publish it, and never paste its quotes anywhere else.
3. **Every person on screen is a coded respondent.** Every quote is verbatim with its source link. Every count is drawn
   against a visible base. Missing is drawn as missing, never as negative.
4. **The coding is never tuned to match the report.** Reconcile it, and print the reconciliation on the page.
5. **Brand:** Listen Labs Paper tokens come from the plugin's `docs/tokens.css` (read by the pages), Inter Regular 400 only, the
   standard `Listen Labs / <title>` header. See `$A/../_shared/brand-compliance.md`.

## Workflow

0. **Preflight.** Run `node "$A/tools/doctor.mjs"` from the working folder. It checks Node, Chrome and the folder, and
   says how to fix anything missing. Tell the person what to install before going further; don't work around it.
1. **Pull.** Get the report with `get_study_analysis` and the guide with `get_study_state`. Save the report to
   `scenes/<slug>/report.md`. Note every number the report states: they become reconciliation rows. Note every chart
   that lacks values: the coding has to supply those.
2. **Concepts.** Propose two or three concepts, each with a mapping table (`$A/references/patterns.md`, "The concept
   step"), written to `scenes/<slug>/concepts.md`. Ask the person to pick, unless they've said to pick for them: then
   pick, and record why in that file so they can overrule it. Ask whether the result may be shared beyond them
   (non-negotiable 2). Example configs for each pattern are in `$A/examples/`.
3. **Code.** Follow `$A/references/coding.md`: write the codebook (md for coders, json for the validator), run parallel
   coders, then run `node "$A/tools/coding/check.mjs" scenes/<slug>`, then verify any quote not checked by script.
4. **Spec.** Write `scenes/<slug>/scene.json` (the schema for each pattern is in `$A/references/patterns.md`) and build it:
   `node "$A/tools/patterns/<crowd | lineup | journey | sort | comparison>.mjs" scenes/<slug>`. The builder refuses hand-typed numbers, titles with numbers, and
   claims whose `assert` fails. Fix the copy, not the check.
5. **Build.** Any scene: `node "$A/pages/scene-page.mjs" <object> scenes/<slug>/specs/scene.figure.json scenes/out/<slug>.html`
   (`lineup`, `stadium` …; the stadium also has its own richer page, `$A/pages/stadium.mjs`). For
   journeys, `scene-page.mjs conveyor` (or `conveyor@aisle`) works; `$A/pages/onepager.mjs` is the richer page (journey), `$A/pages/dashboard.mjs`
   (comparison) or `$A/pages/scrolly.mjs` (sort).
6. **QA.** Run `node "$A/tools/qa.mjs" scenes/out/<slug>.html`.
   It must pass. Then open every screenshot it wrote and review it against `$A/references/vqa.md`. Fix and re-run until
   both are clean.
7. **Bundle.** Run `node "$A/tools/bundle.mjs" <object> <spec> scenes/<slug>/bundle --share internal|shareable` (add
   `--video` for a film). Every host uses the bundle: a page pastes `embed.html`, a deck uses the per-beat stills, and
   all their words and numbers come from `manifest.json`. See `$A/references/embedding.md`. When the person asked for the
   scene inside a one-pager or a deck, hand the bundle to `/research-artifacts` or `/pptx` and follow that section.
8. **Deliver.** Hand over the file(s) and a short summary: what the scene shows, the reconciliation, and what it can't
   show. Publish as a private Artifact only if the person said it may be shared, and never for an internal study.

## When the world doesn't exist yet

Prefer scenery that belongs to the subject over a generic machine. When the library has nothing that reads as the
subject, generate the props for this study, following `$A/references/props.md`: write them to
`scenes/<slug>/props/<name>.js`, bench them with `node "$A/tools/props/bench.mjs" scenes/<slug>/props/<name>.js` until
the checks pass, review the contact sheets against its checklist, then list them in `scene.json` (`props`, and the
world's slots such as `scenery`). They stay with the study. A generated prop that is generic (no study names or copy)
can later be promoted into `$A/props/` by a pull request.
