# Render & QA

The composition is a single self-contained HTML file whose every frame is a pure function of time. A renderer steps through time, captures each frame, and encodes. Same input, same frames.

## The composition file

- **One SVG stage** sized to the design canvas (Listen Labs: half the output resolution — `get_motion` → `video.canvases`), rendered at 2× device scale. SVG keeps type crisp and every mark measurable.
- **Data first:** `const FACTS = …` and `const STORYBOARD = …` at the top (the validated JSON), then knobs (`FPS`, transition length, surface map), then the brand token values with a source comment.
- **One scene function per storyboard scene**: `draw(p, theme)` returns the scene's markup at local time `p` seconds. Scenes never read the wall clock or global state.
- **Timeline:** scene start times are the cumulative durations from the narration step; a transition overlaps the start of the incoming scene, and the outgoing scene keeps drawing underneath until covered.
- **Exports:** `window.renderFrame(t)`, `window.TOTAL`, `window.FPS`; `?export` strips the player chrome so the stage fills the viewport at its design size.
- **Player mode** (no `?export`): play/pause, a scrubber, and previous/next-scene buttons that land on each scene's settled frame; respects `prefers-reduced-motion` by starting paused on the first settled frame. All controls ≥44px with visible focus.
- **Fonts:** Inter loaded locally or bundled (OFL license) — don't depend on a network request at render time. Wait for `document.fonts.ready` before the first frame.
- **No third-party scripts at render time.** Charts are hand-drawn SVG; chart-library animation is never used.

## Rendering

`scripts/render-video.mjs` drives headless Chrome over the DevTools protocol (no npm dependencies) and pipes PNG frames into ffmpeg:

```bash
node scripts/render-video.mjs composition.html out.mp4 --audio narration.wav
```

- Reads the canvas size, `TOTAL`, and `FPS` from the page; renders at 2× device scale; encodes H.264, `yuv420p`, CRF 14, `+faststart`.
- `--audio` muxes a narration/mix track (AAC 48 kHz, 192 kbps); the video length is the composition length.
- A 30s video renders in about a minute on a laptop; for long renders, split the frame range across workers and concatenate (`ffmpeg -f concat`), which is exact because frames are deterministic.

This is the whole stack: an HTML file, headless Chrome, and ffmpeg. No video framework, no npm dependencies, nothing third-party at render time. Keep it that way — new needs (audio mixing, parallel rendering, captions) are solved with ffmpeg and plain JavaScript first.

## QA pass (run on every render)

`scripts/qa-video.mjs` implements the automated half. Notes from building it: overlap is judged on **ink boxes** (cap height above the baseline, descender depth only when the string has descenders) — browser text boxes include the full line height and flag every numeral sitting on its headline; contrast is measured against the **actual backdrop** (the filled shape behind the text, not the scene background), so a value inside a circle is judged on the circle; end dots are judged by their **center**, because a line that ends on the margin carries its dot on the margin by design. Tested against planted problems — an unsourced on-screen value, a 60-word quote overflowing 16:9, a label off the canvas, a 10 Hz strobe — and caught all four, while the real renders pass clean.

**Automated**
- `ffprobe`: resolution, fps, frame count = `round(TOTAL × FPS)`, duration, pixel format, audio stream present when expected.
- Overflow: at each scene's settled time, every text element's bounding box sits inside the safe-zone content box and the canvas; no two text boxes intersect.
- Type floor: every text element's font size ≥ the brand's video minimum for its role.
- Hold: for each text block, (time it stays fully visible after its entrance ends) ≥ the hold formula.
- Flash: no region changes luminance by ≥10% and back more than three times in any one-second window above the WCAG area threshold.
- Facts: every number rendered on screen at a settled time appears in the fact sheet.
- Loudness (with audio): integrated LUFS and true peak within target.
- Captions: every caption within line, CPS, and duration limits; no caption overlaps a data label's box.

**Visual**
- Contact sheet of every scene's settled frame (`ffmpeg -ss <t> -frames:v 1`, tiled) — run the `/research-artifacts` composition pass on each: one dominant element, nothing colliding, nothing off-grid.
- Contact sheet of every transition midpoint — the wipe or fade must not leave a frame where text is half-covered and unreadable for more than its transition length.
- Watch it once at full speed with sound off: does the on-screen text alone tell the story?

## Encoding presets

| Destination | Size | Notes |
|---|---|---|
| LinkedIn, web embed | 1080×1920, 1080×1350, 1080×1080, 1920×1080 | H.264, yuv420p, faststart, AAC 48 kHz |
| Reels / Shorts / TikTok | 1080×1920 | `social` safe zones; burn in captions |
| Presentation | 1920×1080 | `clean` safe zones; captions as a sidecar file |
