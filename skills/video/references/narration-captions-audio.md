# Narration, captions & audio

Sources: BBC Subtitle Guidelines, Netflix Timed Text Style Guide, WCAG 2.2 (1.2.x, 2.3.1), EBU R128, ElevenLabs API docs (text-to-speech with timestamps, request stitching), MRS Guidance on AI, Insights Association Code, EU AI Act Art. 50, and the narration rules of HeyGen HyperFrames' agent skills.

## Writing for the ear

- **Rate:** budget ≈1.9 words per second for the house voice (measured: Matilda on eleven_v4). A 30s kinetic cut with 12 narrated scenes holds about 45 words — so a voiced 30s narrates the beats, not every scene, or runs longer. `eleven_v4` ignores the speed setting; control length with word count. Verify real duration from the TTS timestamps.
- **High-privacy accounts:** ElevenLabs refuses request-ID stitching when the account is in high-privacy mode; `voiceover.mjs` detects this and falls back to text context (`previous_text` / `next_text`). Keep high-privacy on — it means requests aren't retained.
- **One claim per spoken line**, 6–20 words. Silent scenes are allowed — let a big number breathe.
- **Narration deepens, on-screen text states.** Don't read the screen word for word; do speak every number and takeaway that appears (WCAG 1.2.5 integrated description).
- **Plain words, active voice, present tense.** “Black Cherry jumps to first” beats “It was found that Black Cherry was selected most frequently.”
- **Base sizes spoken once per figure group**, not every sentence: “Of the three hundred people we interviewed…”.

## Spoken numbers

- **Speak exactly what is on screen.** 63% → “sixty-three percent”; 46.7 → “forty-six point seven”; 1,140 → “eleven hundred and forty” or “one thousand one hundred forty” (pick one style per video).
- **Never round in speech.** HyperFrames lets the voice round; we don't. Approximation words only describe comparisons the facts support (“nearly catching” for 136 vs 134), never replace a figure.
- **Ratios and indexes need their frame**: “a hundred and forty-eight on an index where a hundred is average.”
- **Write numbers as words in the TTS text** (or set text normalization on and test it) so the voice can't misread units, decimals, or years. Keep the on-screen form as numerals.
- **Counts for small n**: “seven of twelve participants”, never “fifty-eight percent”.

## Quotes

- With `narrate_quotes: false` (default): the quote is on screen only; narration introduces it (“One participant put it simply.”) and lets it sit in silence or under music. The quote text never goes to the TTS vendor.
- With `narrate_quotes: true`: the AI voice reads the verbatim exactly; the scene shows “Participant quote · read by AI voice”. Pick a neutral delivery — no acted emotion.
- With `testimonials: clips` and consent: the participant's own audio plays; music mutes; a burned caption shows the exact words; lower-third shows the participant label (P#), never a real name.

## The pipeline

```bash
node scripts/build-video.mjs story.json --history history.json --pin-out story.pinned.json   # choose executions, surfaces, wipes
node scripts/voiceover.mjs story.pinned.json --voice <voice_id>                             # narration, timing, cues, mix, captions
node scripts/build-video.mjs voice/story.pinned.voiced.json --out video.html                 # composition with the voiced timing
node scripts/render-video.mjs video.html video.mp4 --audio voice/narration.wav
```

**Two narration modes** (chosen from `targetSeconds`, or set `narrationMode`):
- **`beats` — under 45s.** `story.beats` groups consecutive scenes under one line: `{ "id": "open", "scenes": ["hook", "weekly"], "narration": "Three hundred seltzer drinkers, and ninety-three percent drink it weekly.", "cues": { "hook": "Three", "weekly": "ninety-three" } }`. The voice tells the story; fast scenes play under it. Cue words set the cuts inside a beat (each cued scene arrives ~0.25s before its word; 1.2s minimum per scene), so the voice never runs ahead of the picture. A cue on a number word requires that number to be spoken exactly; uncued on-screen numbers are carried by the transcript. About 6 lines / 55 words for 30s.
- **`scenes` — 45s and longer.** Each scene's own `narration` and `cue`; every on-screen number is spoken.

Storyboard fields (scenes mode): each scene's `narration` (numbers written as words) and optional `cue` (the word on which its data reveal starts); story-level `narrateQuotes` (default false), `voice: { id, model, seed, settings }`, `targetSeconds`. Before any audio is generated, the script checks that every headline number is spoken exactly, that no digits appear in narration, that quote text stays out of narration when `narrateQuotes` is off, and that the word count fits `targetSeconds` at ~2.4 words/s.

`--provider say` is a dev stand-in (macOS voice, offline, nothing leaves the machine) for testing timing and layout without an API key; its word timings are estimated, the transcript says so, and it is never shipped.

## ElevenLabs

- **API key** from the environment (`ELEVENLABS_API_KEY`); never written to files, storyboards, or HTML.
- **Voice:** the house voice by default, with a short list of approved alternates; never a cloned or customer-supplied voice. Record voice ID, model, settings, and `seed` in the storyboard so renders reproduce.
- **One request per scene** to `POST /v1/text-to-speech/{voice_id}/with-timestamps`. The response carries audio and character-level `alignment` (`characters`, `character_start_times_seconds`, `character_end_times_seconds`); derive word timings by grouping characters between spaces.
- **Continuity across scenes:** pass `previous_request_ids` / `next_request_ids` (≤3 each, under 2 hours old) so prosody doesn't reset at every cut. Request stitching is not available on every model (not `eleven_v3`) and is disabled under zero-retention mode — when unavailable, generate in larger chunks (a chapter at a time) and split at sentence boundaries using the timestamps.
- **Model choice:** prefer the most stable long-form model that supports stitching and timestamps; confirm against the current ElevenLabs docs at build time, since model names change.
- **Scene duration** = narration duration + the scene's remaining hold requirement (the hold for its text, counted from entrance end), rounded to whole frames.
- **Cues:** storyboard `cues` reference words; resolve each to the word's start time and schedule the reveal there (a counter starts on its number's first word and lands by its last).
- **Data minimization:** only narration text is sent. Quotes are sent only when `narrate_quotes` is on. Use zero-retention where the account supports it.

## Captions

- **Generated from the same word timestamps** — never typed by hand, never evenly distributed.
- **Limits:** ≤42 characters per line; ≤2 lines (≤3 on 9:16); ≤20 characters per second; each caption 0.8–7s; start on speech onset, never more than 2s late; leave gaps of ≥1s or none.
- **Breaks:** after punctuation or before conjunctions; never split article from noun or a number from its unit; keep a figure and its label on one line.
- **Placement:** bottom of the safe zone by default; move to the top when data sits low; never over chart labels, values, or faces.
- **Style:** Inter 400 at the supporting size, content color on a solid surface band; no shadow, no outline, no word-by-word karaoke highlight in the default style.
- **Files:** always deliver `.srt` and `.vtt`; burn in for social exports where the platform's auto-captions can't be trusted.
- **Transcript:** a plain-text transcript (narration + quotes with P# labels + on-screen figures) ships with every video (WCAG 1.2.8).

## The mix

- **Loudness:** master to −14 to −16 LUFS integrated, true peak ≤ −1 dBTP for social and web; −23 LUFS (EBU R128) variant for broadcast. (Platform targets are not officially published; this is the safe common range.) Measure with `ffmpeg -af loudnorm=print_format=json` and normalize in a second pass.
- **Music:** optional, quiet, unobtrusive; ducked ~6–12 dB under narration (attack ~50ms, release ~500ms); muted under participant audio. No sound effects as punchlines, no meme stingers. If music is generated (e.g. ElevenLabs music), size its sections to the chapter durations.
- **Silence is allowed.** A held number with no music and no voice is a valid beat.

## Disclosure

- **End card:** “Narrated by an AI voice.” (and “Participant quotes read by AI voice.” when `narrate_quotes` is on).
- **Metadata:** the export's description/metadata states the AI narration (EU AI Act Art. 50 requires disclosure of synthetic audio that could pass as real; MRS requires AI-generated elements to be clearly identifiable to clients).
- **Never** present the AI voice as a participant, a named researcher, or a real person.
