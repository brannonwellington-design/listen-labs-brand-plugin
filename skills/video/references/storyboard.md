# Storyboard

The storyboard is the contract between the story (written by a model) and the render (done by code). It is plain JSON, every number in it cites a fact, and it is validated before any audio is generated or frame rendered.

## 1. The fact sheet

Build it first, from the source, before writing a word of script.

```json
{
  "study": { "id": "<study id>", "title": "Seltzer Water Flavor Preferences", "n": 300 },
  "facts": [
    { "id": "F1", "type": "scalar", "label": "Drink seltzer weekly", "value": 93, "unit": "%", "base": 300, "source": "weekly_beverages.flavored_water_or_seltzer" },
    { "id": "F2", "type": "series", "label": "MaxDiff index, 100 = average", "base": 300,
      "rows": [{ "key": "strawberry", "label": "Strawberry", "value": 148 }, { "key": "cucumber", "label": "Cucumber", "value": 46.7 }],
      "complete": false, "note": "Report lists 5 of 20 values — fetch the full chart table before storyboarding a ranking" },
    { "id": "F9", "type": "verbatim", "text": "<the verbatim, copied exactly>", "participant": "<P# label from the response>", "source_url": "<source link from the analysis>", "consent": { "video": false, "audio": false } }
  ]
}
```

Rules: values copied verbatim (no rounding); every series carries its base; `key` is a stable entity ID used for object constancy across scenes; `complete: false` blocks any template that implies a full ranking; verbatims carry a participant label and a consent record (which gates clips).

## 2. The length × depth grid

| | headline | standard | deep |
|---|---|---|---|
| **30s** | ✓ | ✓ (kinetic only) | → standard |
| **60s** | ✓ | ✓ | → standard |
| **90s** | → standard | ✓ | ✓ |
| **2min** | → standard | ✓ | ✓ |
| **4min** | → deep | → deep | ✓ |

`→` means the pair snaps to the named depth: a long video with shallow content would be padded, and a short video with deep content would break the hold rules. A 30s kinetic cut can carry standard depth because each finding gets one fast scene of its own. Say so in one line when it snaps.

**Depth decides content:**
- **headline** — the single most decision-relevant finding, up to three supporting stats, the recommendation. No method, no segments. At most one verbatim.
- **standard** — hook, 3–5 key findings each with one piece of evidence (a chart or a verbatim), the recommendation. Base and method in one line.
- **deep** — chapters: method and sample → findings (each with chart + verbatim) → segment differences → caveats and what the data can't say → recommendation and alternatives.

**Length decides pacing** — scene count, average scene length, word budget, default transition, on-screen word cap — from the brand's pacing presets (Listen Labs: `get_motion` → `video.pacing_presets`; 60s and 2min interpolate between their neighbours).

**Ranking findings for inclusion.** Order candidate findings by: (1) directly answers the study goal or recommendation, (2) effect size / spread, (3) confidence (base size, consistency across segments), (4) has a strong verbatim. Fill the depth's slots from the top; never include a finding without its evidence.

## 3. The arc

From Amini et al. (CHI 2015), the most common structure across professional data videos:

1. **Establish** — who, how many, what question (one scene; the hook can live here if it's the strongest number).
2. **Build** — findings that set up the peak.
3. **Peak** — one, near the middle or two-thirds mark: the most surprising or decision-changing finding, preceded by a beat of stillness (0.2–0.3s kinetic, 0.3–0.75s explainer).
4. **Takeaways** — the recommendation, then the end card.

The **hook** (first 3s) is the single strongest, plainly stated finding, legible muted. Don't always open on a number; a sharp claim or a verbatim can hook too.

## 4. Scene templates

Each template takes typed props, has a layout per aspect, and has data limits. Choose by the data's shape using `skills/research-artifacts/references/charts.md`, then by the video bans.

| Template | Data | Limits (9:16 / 16:9) | Motion signature |
|---|---|---|---|
| `stat-hero` | one scalar + base | 1 number | count-up with a fill (ring or bar) landing together |
| `unit-grid` | count of n (e.g. 188 of 300) | n ≤ 400 dots | outline grid builds, fill sweeps in reading order |
| `dot-bars` | ranked categories | 6 / 8 rows | lines grow from zero, dot at value, stagger by rank |
| `lollipop-index` | values around a reference (100 = average) | 6 / 8 rows | reference line first, then stems from the reference |
| `area-pair` | two magnitudes compared | 2 | area-true circles (radius ∝ √value), larger first |
| `radial-bars` | 2–4 shares of the same base | 4 | 270° arcs sweep from 12 o’clock; labels in the free quadrant |
| `axis-strip` | 3–5 values on one scale, close together | 5 | axis draws, dots travel to value, leader labels |
| `line-trend` | a series over time | 1 highlighted + ≤2 context lines | path draws on, end-dot and label land last |
| `quote` | one verbatim | ≤ 25 words | 2px left rule draws, words or lines rise in, attribution last |
| `clip` | a consented participant clip | ≤ 20s | cut in/out, lower-third label (P#), burned caption |
| `combination` | real combinations (e.g. top packs) | ≤ 20 nodes, ≤ 10 combos shown | real combos highlighted in rank order; never random |
| `chapter` | a chapter title (deep dive) | ≤ 6 words | wipe in, hold, cut |
| `end-card` | recommendation + logo + disclosure | — | line strings the elements; logo last |

Video bans (in addition to `charts.md`): no pie or donut, no dual axis, no legends (direct labels only), no more than three metrics on screen, no gridlines beyond a single reference line, no dashboards.

## 5. Aspect layouts

Each template ships a layout per aspect — re-composed, never scaled.

- **9:16** — vertical stack: headline block in the upper third, the graphic in the middle, source note at the bottom of the safe zone. Rankings read top to bottom. With the `social` safe-zone profile the content box is small; cut rows rather than shrink type.
- **4:5 / 1:1** — compact stack: headline and graphic share the frame; ranking limits drop by one or two rows; big numerals drop one step on the type scale.
- **16:9** — split: text in the left 5 columns, the graphic in the right 7 (12-column grid inside the safe zone); vertical bar charts become possible; captions sit under the text column when data runs full height.

The **dominant element** stays dominant in every ratio; the stacking order (claim → evidence → source) never changes.

## 6. Storyboard JSON

```json
{
  "brand": "listen-labs",
  "controls": { "length": "30s", "depth": "headline", "aspect": "9:16", "safe_zone": "clean", "testimonials": "off", "narrate_quotes": false, "voiceover": true },
  "preset": "snappy_30s",
  "voice": { "id": "<house voice id>", "model": "<model>", "seed": 7 },
  "scenes": [
    {
      "id": "s1", "template": "stat-hero", "surface": "brand-blue", "transition_in": "cut",
      "facts": ["F1"],
      "on_screen": { "big": "93%", "line1": "drink seltzer every week", "note": "n = 300 · share drinking each beverage weekly" },
      "narration": "Ninety-three percent of the three hundred people we interviewed drink seltzer every week.",
      "cues": [{ "at_word": "Ninety-three", "action": "count_start" }, { "at_word": "week", "action": "line1_in" }]
    }
  ],
  "end_card": { "recommendation": "Lead with Black Cherry, Mango and Watermelon.", "disclosure": "Narrated by an AI voice." }
}
```

## 7. The validator (runs before audio and render)

Reject the storyboard and fix it when any of these fail:

- A number in `on_screen` or `narration` that does not exactly match a cited fact (after spoken-number normalization: “sixty-three percent” ↔ 63%).
- A quantified scene without its base in `note`.
- A template whose data limits or `complete` requirement the facts don't meet.
- On-screen words above the preset cap, or a scene whose narration plus hold exceeds what the preset can carry.
- A quote whose text differs from the verbatim fact, lacks a participant label, or (with `narrate_quotes: false`) appears in `narration`.
- A `clip` scene whose fact lacks consent for video/audio.
- More than three transition types, or a banned chart.
