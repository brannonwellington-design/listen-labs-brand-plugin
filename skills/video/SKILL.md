---
name: video
description: "Turn research data into a branded motion-graphics video: a study ‘video companion’, animated explainer, data story, social clip, or kinetic-type quote reel, rendered to MP4 at 9:16, 4:5, 1:1, or 16:9, from 30 seconds to about 4 minutes, with optional AI voiceover (ElevenLabs), captions, and participant clips. TRIGGER on video, motion graphic, animation, animated chart, explainer, reel, short, TikTok, Reels, Shorts, LinkedIn video, voiceover, or ‘video companion’. Still images, interactive pages, and decks belong to /research-artifacts, /report, and /pptx; this skill owns anything rendered as a timeline. Always Listen Labs styling by default; other brands via a brand file."
allowed-tools: Read Write Edit Bash(node *) Bash(ffmpeg *) Bash(ffprobe *) Bash(open *) Bash(xdg-open *) Bash(start *) mcp__listen-labs-brand__get_motion mcp__plugin_listen-labs-brand_listen-labs-brand__get_motion mcp__listen-labs-brand__get_full_guidelines mcp__plugin_listen-labs-brand_listen-labs-brand__get_full_guidelines mcp__listen-labs-brand__get_css_variables mcp__plugin_listen-labs-brand_listen-labs-brand__get_css_variables mcp__listen-labs-brand__get_dataviz_palettes mcp__plugin_listen-labs-brand_listen-labs-brand__get_dataviz_palettes mcp__listen-labs-brand__get_logo mcp__plugin_listen-labs-brand_listen-labs-brand__get_logo
---

# Video

**Path convention.** This skill's folder is `${CLAUDE_SKILL_DIR}` and the plugin root is `${CLAUDE_SKILL_DIR}/../..`. Paths beginning with `skills/` are relative to the plugin root; paths beginning with `references/` or `scripts/` are relative to this skill's folder.

A video is a sequence of compositions plus sound. **Every frame is a research artifact** and obeys the physics, chart grammar, and research ethics of `/research-artifacts` (`skills/research-artifacts/SKILL.md`, `references/charts.md`). This skill adds what a single frame cannot know: time, voice, choreography, and honesty in motion.

The architecture is the same as the rest of the plugin, extended in time:

1. **The Physics** — `/research-artifacts` physics for every settled frame, plus the time physics below.
2. **The Voice** — the active brand file, including its **Motion** section (tokens, transitions, canvases, safe zones, pacing presets). Listen Labs: `get_motion` on the brand MCP, or the Motion section of `skills/research-artifacts/references/brands/listen-labs.md`. Never invent a duration or easing curve.
3. **The Storyboard** (`references/storyboard.md`) — fact sheet, story arc, the length × depth grid, scene templates, aspect layouts, and the storyboard JSON.
4. **Motion & data** (`references/motion-and-data.md`) — choreography, transitions, count-ups, bars, lines, object constancy, and the anti-patterns.
5. **Narration, captions & audio** (`references/narration-captions-audio.md`) — writing for the ear, spoken numbers, ElevenLabs timing, captions, the mix, disclosure.
6. **Library & selector** (`library/library.js`, `scripts/build-video.mjs`) — the shared engine every composition is built from. Data shapes are **families** with several **executions** — ranking (dot bars, lollipops off a reference, 270° rings, area-true circles, vertical stems, spokes, half gauges), part of a whole (unit grid, ring fill, bloom, split line, waffle, cluster split), comparison (area pair, mirror bars, twin stems), scale (axis strip, vertical strip), quote (line rise, word build), count (bloom, grid, rings) — plus story-specific templates (node ring, combination ring, strike row, end row). The selector picks one execution per scene: fits the data (checked against the narrowest figure box any ratio uses) → never repeated in the video → least recently used for this study/customer (from a history file) → seeded tie-break. Surfaces and wipes the storyboard leaves open are assigned from a seeded rotation. `Listen Video Tests`-style gallery renders (every execution pinned once, both ratios) are the QA for any new execution.
7. **Render & QA** (`references/render.md`, `scripts/render-video.mjs`) — deterministic HTML frames → headless Chrome → ffmpeg, and the checks every render passes.
8. **Reference examples** (`references/examples/`) — `seltzer-30s-kinetic.html`, the approved kinetic 30s cut, and `genz-ai-30s.html`, the generalization test on a different study; both aspect-aware (9:16 and 16:9 from one file). The seltzer cut shows twelve different chart forms, one line weight, every figure on the margins, counters that land exactly, surface wipes. Start new compositions from its structure (data block, knobs, one draw function per scene, wipe engine, player) rather than from scratch — and never reuse its scene sequence wholesale; the story comes from the new study.

## The three controls

A customer controls only these. Everything else is decided by the rules.

| Control | Values | What it changes |
|---|---|---|
| **Length** | 30s · 60s · 90s · 2min · 4min | Pacing preset (scene count, average scene length, word budget, default transition) |
| **Depth** | headline · standard · deep | Which findings and how much evidence enter the storyboard |
| **Aspect** | 9:16 · 4:5 · 1:1 · 16:9 | Canvas, safe-zone profile, and each scene's layout variant |

Length and depth interact: not every pair is valid. See the grid in `references/storyboard.md`; an invalid pair snaps to the nearest valid one and says so in one line.

Two toggles, both off by default:
- **Testimonials** — `off` (quotes render as kinetic type) or `clips` (real participant video/audio where consent allows; otherwise the scene falls back to type).
- **Narrate quotes** — `false` (quotes are on screen only and never sent to the TTS vendor) or `true` (the AI voice reads them, labelled on screen as read by AI).

## Workflow

0. **Resolve the brand** exactly as `/research-artifacts` step 0, including its Motion section. Default: Listen Labs, Paper theme; the brand-blue surface (`--surface-brand-primary` with `--content-brand-contrast`) is a legitimate third surface for video.
1. **Build the fact sheet** with `scripts/extract-facts.mjs <analysis.md|json>` — deterministic parsing of the analysis's Scalar / Chart blocks, series grouped by chart (flagged complete or partial), prose statements with their figures, and verbatims that carry a `[Source]` link (fragments flagged). No model reads prose for numbers. Pull the study (Listen Labs Studies MCP: `get_study_analysis`, then chart tables and `get_study_responses` / `get_response` as needed). Copy every number with its base, every verbatim with its participant label and source link, and every chart series in full. Number the facts (`F1…`). If the report prose cites a chart you don't have the values for, fetch the values — don't storyboard around a gap. Missing data is shown as missing, never estimated.
2. **Write the storyboard** with `scripts/write-storyboard.mjs --facts facts.json --length 30 --depth standard --aspect 9:16` — API mode calls Claude (`claude-opus-5-5`, `npm install` in `skills/video` first) and repairs against the validator up to 3 rounds; agent mode writes the prompt for the running Claude session to answer. Either way (`references/storyboard.md`): pick the pacing preset from length, the content from depth, the arc (establish → build → one peak → takeaways), then scenes as JSON — template, fact IDs, on-screen text, narration line. Every number in the narration or on screen must cite a fact ID.
3. **Validate the storyboard** with `scripts/validate-storyboard.mjs story.json --facts facts.json` before any audio or render — every on-screen, data, note, and spoken number must trace to a cited fact or declared arithmetic (`derived`); quotes must be exact, non-fragment verbatims; every scene needs a fitting execution; notes must fit 9:16; narration must fit the length. Its checks: every figure matches its fact exactly; every quantified scene has its base; on-screen words ≤ the preset's cap; hold time is satisfiable; no banned chart; quotes are verbatim and attributed. Fix, then continue.
4. **Voice first** (`references/narration-captions-audio.md`, `scripts/voiceover.mjs`): pin executions (`build-video.mjs --pin-out`), then generate narration per scene with word timestamps; each scene's duration becomes narration + hold, its data reveal is cued to the word that names it, and the step writes the mixed track (−16 LUFS), captions (`.srt`, `.vtt`), a transcript, and the AI-voice disclosure on the end card. Without voiceover, durations come from the hold-time formula alone.
5. **Build the composition** with `scripts/build-video.mjs story.json --history <history.json>`: each scene names a `family` (the selector picks the execution) or a `template`, with its data, headline, and note. The build inlines the library, logo, and storyboard into one self-contained HTML file whose frames are a pure function of time, and records the picks in the history file. Write a new execution or template into `library/library.js` (never into one video) when a study needs a form the library lacks.
6. **Render & QA**: frame-render to MP4 with `scripts/render-video.mjs` (audio muxed), then gate it with `scripts/qa-video.mjs` — at every scene's settled frame it measures the real composition in Chrome (text inside canvas and margins, credit zone and note clearance, no overlapping ink, 14px floor, contrast against the actual backdrop, settled by the settle point, marks inside the margins, every on-screen number traced to the facts) and checks the file (resolution, fps, frame count, yuv420p, A/V sync, −17…−13 LUFS and ≤ −1 dBTP, WCAG flashes, caption limits). It writes a contact sheet for anyone who wants to look; nobody has to.

**One command:** `scripts/make-video.mjs --analysis analysis.md --length 30 --depth standard --aspects 9:16,16:9 --voice elevenlabs` runs steps 1–6 as gates (extract → write → validate → select → voice → build → render → QA per aspect), stops at the first failure before spending credits or render time, and writes `report.json`.
7. **Deliver**: the MP4, captions file, transcript, and the editable HTML source. In a file context, open the MP4. State any degradation (pair snapped, chart switched, data missing) in one line.

## Time physics (brand-independent)

- **Determinism.** Every frame is a pure function of its time. No CSS transitions or animations, no wall clock, no unseeded randomness, no network during render, chart-library animation off. Author times in seconds; convert to frames.
- **Audio is the clock.** When there is narration, timing follows it — never the reverse. Reveals land on the word that names them. **Under 45s, narrate beats, not scenes** (one line across 2–3 scenes, cue words placing the scene cuts); **45s and longer, narrate scene by scene.**
- **Two paces.** *Kinetic* (default for ≤60s and unvoiced video): fast cuts, one stat per scene, 10–12 scenes in 30s, built to be looped — the viewer reads the must-read number and line, everything else is glanceable. *Explainer* (default for voiced 90s+): narration carries the story and every word on screen gets read. The brand's pacing presets name the pace; never apply explainer holds to a kinetic cut.
- **Hold before you cut.** Must-read text stays settled for the brand's hold-time formula for the pace (Listen Labs kinetic: `max(1.2, 0.3 + 0.2 × must-read words + 0.3 × numbers)`; explainer: `max(1.0, 0.5 + 0.33 × words) + 1.0s per number`), counted from when its entrance ends. If a scene can't satisfy it, cut words — never let it flash past.
- **Variety is part of the physics.** Never reuse a scene template or chart form within a video of 90s or less (one bookend excepted). Rotate the dominant element, layout anchor, and surface every scene. Repetition reads as a stall, and in short-form a stall loses the viewer. **Across videos too:** every generation for the same study or customer must feel made for it, so executions rotate through the selector and its history — never hand-copy a previous video's scenes.
- **One orchestrated moment per scene.** Build (0–30%) → breathe (30–70%) → resolve (70–100%). One thing leads at a time; no idle motion.
- **Every settled frame passes `/research-artifacts`.** Pause anywhere in a scene's breathe phase and the frame must be a finished, legible composition: one dominant element, nothing off-grid, contrast floors met, on-scale type at or above the brand's video minimums, inside the safe zone.
- **Muted-first.** Most video autoplays silently. The headline finding is on screen in the first 3 seconds, and the on-screen text alone tells the story; narration deepens it.

## Research ethics in motion (non-negotiable)

Everything in `/research-artifacts` Research Ethics applies. In addition:

- **Exact numbers, spoken exactly.** Any figure the narration speaks is the figure on screen (“sixty-three percent”), never a rounding of it. In scene-by-scene narration every on-screen number is spoken; in beat narration (under 45s) the transcript lists every on-screen figure. Approximation words (“nearly”, “about”) only describe a comparison the facts support, never replace a figure.
- **Animated data is real data.** Counters land on the exact value; bars grow from the true baseline; intermediate frames are valid charts. Illustrative motion uses the real data (actual combinations, actual respondents) or is plainly abstract and carries no number. Random marks that look like data are forbidden.
- **Verbatims are sacred in sound and picture.** On-screen quotes are verbatim and attributed (P#). A clip is never trimmed or spliced so it changes meaning; an omission inside a quote shows as `…`. Music is muted under participant voices.
- **The AI voice is disclosed.** The end card and the video metadata say the narration is an AI voice. A quote read by the AI voice is labelled on screen: “Participant quote · read by AI voice”. Never imply a participant said something in the synthetic voice.
- **Clips need consent that covers this use.** Use a participant's video or audio only when the response's consent covers recording, sharing with the recipient, and this use; otherwise fall back to type. Never show a participant's real name.
- **N stays visible.** Any quantified scene carries its base in its source note. Small-n data stays as counts.
- **Neutral comparison.** Compared options get the same size, position logic, timing, and motion. Animating one concept more energetically is a thumb on the scale.

## Delivery contexts

- **File / machine:** write `<study-slug>-<length>-<aspect>.html`, render to `.mp4` next to it, open the MP4. The credit line (`Listen Labs / Title`) appears; it is standalone output.
- **Product (on-demand video companion):** the same storyboard JSON drives a render job; the customer previews the script (cheap) before the render (expensive). No credit line inside the product player; it is burned in only for downloaded exports.

## Verification checklist (every video)

- [ ] Brand and its Motion section resolved; every duration, easing, and transition traces to it; ≤3 transition types, each used with its meaning
- [ ] Fact sheet built from the source; every on-screen and spoken number cites a fact and matches it exactly; bases visible; nothing estimated
- [ ] Length × depth pair valid (or snapped and disclosed); scene count and word budget within the preset
- [ ] Pace chosen (kinetic or explainer) and its hold formula met for every must-read block, counted from entrance end; first motion 0.05–0.3s after each cut; a finding on screen within 3s
- [ ] Credit zone: credit line 14px at the top of the safe zone; no mark or label within 32px below it or 32px above the source note; all figure ink inside its figure box
- [ ] Edges: every horizontal figure starts and ends on the content-box margins (verified with a margin overlay on the contact sheet); value columns right-aligned to the margin; circular forms centered
- [ ] One line weight for every stroke in the video (brand `video.line_weight`); emphasis by color, dot size, or order — never weight
- [ ] Built through `build-video.mjs` with the study/customer history: no scene repeats its last execution, and the picks are recorded
- [ ] Variety: no scene template or chart form repeats (one bookend allowed); dominant element, layout anchor, and surface rotate
- [ ] Every settled frame passes the `/research-artifacts` composition pass at the target aspect: one dominant element, on-grid, contrast ≥4.5:1 (3:1 at 24px+), type ≥ brand video minimums, inside the chosen safe-zone profile, captions never covering data
- [ ] Animated data honest: true baselines, fixed scales within a scene, ≤2 stages per transition, stable identity per entity across scenes, counters land exactly, no random data-like marks, no banned charts (pie, dual-axis, legends, >3 metrics on screen)
- [ ] No more than three flashes per second anywhere (including flickering thin lines, counted by area)
- [ ] Narration speaks every on-screen number and takeaway; numbers spoken exactly; AI voice disclosed; AI-read quotes labelled; quotes verbatim and attributed; clips consented and untrimmed in meaning
- [ ] Audio (if any): −14 to −16 LUFS integrated, ≤ −1 dBTP, music ducked under voice and muted under participants
- [ ] Captions file and transcript delivered; captions within line, CPS, and duration limits
- [ ] Deterministic render: same input, same frames; output is 1080-wide (or 1920 for 16:9), yuv420p, faststart, correct duration and frame count (`ffprobe`)
- [ ] Reduced-motion / settled-frame variant available on request (each scene's resolve frame)
