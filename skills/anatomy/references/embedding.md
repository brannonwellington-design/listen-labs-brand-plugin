# Placing a scene inside other work

A scene is built once and placed anywhere: in a one-pager, a report, the product canvas or a deck. The host skill
never rebuilds or retypes it. It takes the **bundle**:

```
node tools/bundle.mjs <object[@world]> studies/<slug>/specs/<spec>.json studies/<slug>/bundle --share internal|shareable [--video]
```

| File | Use |
|---|---|
| `embed.html` | The figure card with its own controls (switch, follow, play, blueprint), styles and script. Paste it once into a Listen Labs page. |
| `preview.html` | The embed alone on a branded page. QA it with `node tools/qa.mjs <bundle>/preview.html --api <API>`. |
| `stage.html` | The 16:9 frame the recorder films. |
| `stills/beat-NN.png` | A finished 16:9 slide per tour beat: drawing, caption, quote, credit and n. |
| `stills/figure-NN.png`, `figure-NN.svg` | The drawing alone per beat. The SVG is vector with every style flattened to plain attributes, so PowerPoint, Keynote and print read it without CSS. |
| `tour.mp4` | With `--video`: the tour as a film. |
| `manifest.json` | Everything a host needs to know: study, n, sharing, alt text, caption, API and controls, every beat's title, caption and quote with source, and the method notes. |

**The manifest is the only source of words and numbers for the host.** Set captions, n and quotes from it. Never retype
them and never compute new numbers from them. Every number in it was computed from the coding and checked at build
time; a retyped number has no such guarantee.

`sharing: "internal"` means local files only: never publish the host either, and never copy its quotes into anything
that leaves the machine.

## In a page (/research-artifacts, /report, the product canvas)

1. Paste `embed.html` where the scene goes. It is a `<style>`, a `<section class="ll-scene">` and a
   `<script type="module">`. It needs only the host's Listen Labs brand tokens (`docs/tokens.css`), which every Listen
   Labs page already declares. It writes nothing to the host's URL.
2. **Give it the dominant slot.** A scene is the page's one big element: full width of the content column, or 8 of 12
   columns with a rail beside it. It sizes to its container (container queries), so don't fix its height.
3. **Drive it from the page.** The page's own controls (a cross-tab row, a step list, a button) call
   `window.<API>.scene({ … })` or the methods in `manifest.api.controls` (`setAct`, `follow`, `go` …). Listen for the
   object's events to keep the page in step:
   - `stadium` (detail: `act`, `block`, `hope`, `follow`)
   - `station` (conveyor)
   - `view`, and `played` (a tour ended)
4. **Put the words beside it, from the manifest:** the caption under it, the method notes in the page's "read before
   sharing", and the n wherever a count is.
5. **One scene per page** for now: each registers one `window.<API>`.
6. **Print or PDF** (/report): the live scene doesn't print. Place `stills/figure-NN.svg` for the beat that makes the
   page's point, with that beat's caption from the manifest.

## In a deck (/pptx)

A deck can't run the scene, so it carries the tour as slides:

- **One slide per tour beat** (or the beats the deck needs, in order). Use `figure-NN.svg` (vector; fall back to
  `figure-NN.png` if the target app mangles it) as the dominant image, left about 60% of the slide. Set the beat's
  `kicker`, `title`, `caption` and `quote` from the manifest as **native text**, so the deck stays editable and
  searchable. Put the quote's source in the speaker notes with the beat number. Keep the credit line and `n = …` on
  every scene slide.
- **Beats with `overlay: true`** (a followed person's tag, blueprint callouts, the tension card) need
  `figure-NN.png`: those labels are drawn over the drawing and are not in the SVG.
- **Or use `beat-NN.png` whole**, a finished 16:9 slide, when the deck just needs the tour as it is. It isn't editable,
  so prefer the composed version for decks people will rework.
- **Motion:** add `tour.mp4` on one slide (PptxGenJS `addMedia`) if the deck will be presented live.
- **Link:** only when `sharing` is `shareable`, put the interactive version's link on the closing slide.

The deck skill's own rules still apply: brand hex values from the brand tools, Inter Regular, header helper,
margins.
