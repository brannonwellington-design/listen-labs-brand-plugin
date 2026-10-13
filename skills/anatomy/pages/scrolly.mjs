// Scrollytelling page shell (research-artifacts anatomy: interactive data story) around an anatomy object.
// The object exposes a global with go(stepIndex); this page drives it from scroll position.
// usage: node pages/scrolly.mjs <object> <spec.json> <out.html>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const ANATOMY = new URL("..", import.meta.url).pathname;
const k = await import(join(ANATOMY, "kit/iso-kit.mjs"));
const { kitScript } = await import(join(ANATOMY, "scripts/inline-kit.mjs"));
const { LL_TOKENS, curly, esc, t, headerHtml, HEADER_CSS, TIP_CSS, TIP_SCRIPT, viewToolsHtml, titleBlockHtml, viewToolsScript, BLUEPRINT_CSS, resolveScripts, captionHtml, playScript, PLAY_CSS, resolveTension, TENSION_CSS } = await import("./shared.mjs");

const [objName, specPath, outPath] = process.argv.slice(2);
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const SCRIPTS = resolveScripts(spec);   // captions are @references into the spec; the build fails on anything else
const obj = await import(`../objects/${objName}.mjs`);
spec.__tension = resolveTension(spec, obj.TENSION_EVENTS || []);   // fails the build unless its numbers resolve
const { svg, live } = obj.build(spec);
const skin = readFileSync(new URL("../skin/ll-skin.css", import.meta.url), "utf8");
const page = spec.page;
const N = spec.study.n;

// follow one customer (Phase 4): only when the spec carries validated per-customer codes
const CUSTOMERS = spec.customers || [];
const FOLLOW_MENU = CUSTOMERS.length ? `<select class="fig-play fig-follow" aria-label="Follow one customer through every chapter"><option value="">Follow…</option>${CUSTOMERS.map((c, i) => `<option value="${i}">Follow ${c.label}</option>`).join("")}</select>` : "";
const plate = k.plateHtml({
  fig: spec.figure.fig + " · " + spec.figure.title,
  title: "",
  hint: spec.figure.hint,
  readout: "",
  body: `${viewToolsHtml(SCRIPTS, FOLLOW_MENU)}${titleBlockHtml(spec.figure.titleBlock, esc)}${captionHtml()}<div class="iso-stage" data-bench role="img" aria-label="${esc(spec.figure.title)}">${svg}</div>`,
});
const figure = plate.replace("</figure>", `<div class="bench-key" data-key aria-live="polite"></div></figure>`);

const steps = spec.steps.map((s, i) => {
  const quote = s.quote ? `
        <blockquote class="quote"><p>${t("“" + s.quote.text + "”")}</p><footer>Participant · <a href="${esc(s.quote.source)}" target="_blank" rel="noopener">Source</a></footer></blockquote>` : "";
  const caveat = s.caveat ? `<p class="step__caveat">${t(s.caveat)}</p>` : "";
  const sources = s.sources ? `<p class="step__sources">Evidence: ${s.sources.map((u, j) => `<a href="${esc(u)}" target="_blank" rel="noopener">${j + 1}</a>`).join(" · ")}</p>` : "";
  return `
      <article class="step" data-step="${i}" data-key="${esc(s.key)}" id="chapter-${esc(s.key)}">
        <p class="step__kicker">${t(s.kicker)}</p>
        <h2 class="step__title">${t(s.title)}</h2>
        <p class="step__num">${esc(s.stat.value)}</p>
        <p class="step__base">${t(s.stat.base)}</p>
        <p class="step__body">${t(s.body)}</p>${quote}
        ${caveat}${sources}
        <div class="step__follow" data-follow-card hidden></div>
      </article>`;
}).join("");

const checks = page.checks.map((c) => `<li><span class="check__lead">${t(c.lead)}</span> ${t(c.body)}</li>`).join("");
// disclose how our per-customer coding compares with the report (generated from the validator, never hand-written)
const recon = spec.customerCoding ? (() => {
  const R = spec.customerCoding.recon.filter((x) => !/×|derived|unlikely/.test(x.label));
  const exact = R.filter((x) => x.transcript === x.report).map((x) => x.label);
  const wide = R.filter((x) => Math.abs(x.transcript - x.report) >= 4).map((x) => `${x.label} (${x.transcript} vs ${x.report})`);
  return [`Following a customer uses our own coding of all ${spec.customers.length} transcripts against the report’s definitions, every code backed by a verbatim quote and its source. Columns, drawers and numbers keep the report’s counts; a followed customer is placed by their own coded answer. Our coding matches the report exactly on ${exact.length} of ${R.length} codes (${exact.join(", ")}) and differs most on ${wide.join(", ")}, where it reads the definitions more broadly.`,
    ...(spec.customerCoding.privacyNote ? [spec.customerCoding.privacyNote] : [])];
})() : [];
const notes = [...page.notes, ...recon].map((n) => `<li>${t(n)}</li>`).join("");

const CSS = `
*,*::before,*::after { box-sizing: border-box; }
html { background: var(--surface-primary); color-scheme: light dark; }
body { margin: 0; container-type: inline-size; font-family: 'Inter', 'Helvetica Neue', Arial, system-ui, sans-serif; font-weight: 400;
  color: var(--content-primary); background: var(--surface-primary); font-size: 16px; line-height: 24px; -webkit-font-smoothing: antialiased; }
body.iso { --anatomy-page: var(--surface-primary); }
a { color: var(--content-brand); text-underline-offset: 3px; }
:focus-visible { outline: 2px solid var(--content-brand); outline-offset: 2px; border-radius: 4px; }
h1, h2 { font-weight: 400; margin: 0; text-wrap: balance; }
p { margin: 0; text-wrap: pretty; }
.ll-header { position: absolute; top: 24px; left: 0; right: 0; text-align: center; font-size: 12px; line-height: 16px; }
.ll-brand { color: var(--content-secondary); }
.page { max-width: var(--maxw); margin: 0 auto; padding: 72px var(--margin) 96px; }

/* Scrolly: steps left, pinned bench right */
.scrolly { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--gutter); }
.scrolly__steps { grid-column: 1 / span 4; min-width: 0; padding: 16vh 0 40vh; }
.scrolly__figure { grid-column: 5 / -1; min-width: 0; }
.scrolly__sticky { position: sticky; top: 56px; }
.scrolly__sticky .iso-figure { margin: 0; }
/* full-bleed camera: the drawing runs to the card's rounded edge, labels float on top */
.scrolly__sticky .iso-plate { padding: 0; overflow: hidden; }
.scrolly__sticky .iso-svg { overflow: hidden; }
.scrolly__sticky .iso-plate-corners { z-index: 1; }
.scrolly__sticky .iso-plate-corner { background: var(--anatomy-card); padding: 2px 6px; margin: -2px -6px; border-radius: 4px; }
.step { min-height: 72vh; padding: 24px 0; opacity: .32; transition: opacity .4s ease; }
.step.is-active { opacity: 1; }
.step__kicker { font-size: 14px; line-height: 20px; color: var(--content-secondary); }
.step__title { font-size: 24px; line-height: 32px; margin-top: 8px; }
.step__num { font-size: 72px; line-height: 72px; margin-top: 24px; font-variant-numeric: tabular-nums; }
.step.is-active .step__num { color: var(--content-brand); }
.step__base { font-size: 14px; line-height: 20px; color: var(--content-secondary); margin-top: 8px; }
.step__body { font-size: 16px; line-height: 24px; margin-top: 20px; }
.step__caveat, .step__sources { font-size: 14px; line-height: 20px; color: var(--content-secondary); margin-top: 16px; }
.step__follow { margin-top: 20px; padding: 12px 14px; border-radius: 8px; background: var(--surface-highlight); border: 1px solid var(--content-brand); font-size: 14px; line-height: 20px; display: grid; gap: 6px; }
.step__follow[hidden] { display: none; }
.follow-k { color: var(--content-brand); }
.follow-q { margin: 4px 0 0; padding-left: 10px; border-left: 2px solid var(--content-brand); }
.follow-q footer { margin-top: 4px; font-size: 12px; line-height: 16px; color: var(--content-secondary); }
.follow-note { color: var(--content-secondary); }
.quote { margin: 24px 0 0; padding-left: 16px; border-left: 2px solid var(--content-brand); }
.quote p { font-size: 18px; line-height: 28px; }
.quote footer { margin-top: 8px; font-size: 14px; line-height: 20px; color: var(--content-secondary); }

/* Live key under the bench */
.bench-key { display: flex; flex-wrap: wrap; gap: 4px 20px; margin-top: 12px; font-size: 14px; line-height: 20px; color: var(--content-secondary); min-height: 48px; }
.bench-key__kind { flex-basis: 100%; font-size: 12px; line-height: 16px; }
.bench-key__n { color: var(--content-primary); font-variant-numeric: tabular-nums; }

/* Closing */
.closing { margin-top: 48px; border-top: 1px solid var(--content-disabled); padding-top: 40px; display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--gutter); row-gap: 40px; }
.closing h2 { font-size: 24px; line-height: 32px; margin-bottom: 24px; }
.checks { grid-column: 1 / span 7; }
.checks ol { margin: 0; padding-left: 24px; display: grid; gap: 12px; color: var(--content-secondary); max-width: 640px; }
.check__lead { color: var(--content-primary); }
.method { grid-column: 9 / -1; }
.method h2 { font-size: 14px; line-height: 20px; color: var(--content-secondary); margin-bottom: 12px; }
.method ul { margin: 0; padding-left: 16px; display: grid; gap: 8px; font-size: 14px; line-height: 20px; color: var(--content-secondary); }
.method__fig { font-size: 14px; line-height: 20px; color: var(--content-secondary); margin-top: 16px; }
.method__source { font-size: 14px; line-height: 20px; color: var(--content-secondary); margin-top: 16px; }

@container (max-width: 900px) {
  .scrolly { display: flex; flex-direction: column; }
  .scrolly__figure { order: -1; position: sticky; top: 0; z-index: 2; background: var(--surface-primary); padding-top: 8px; }
  .scrolly__sticky { position: static; }
  .scrolly__steps { padding: 8vh 0 30vh; }
  .step { min-height: 64vh; }
  .step__num { font-size: 56px; line-height: 56px; margin-top: 16px; }
  .bench-key { min-height: 0; font-size: 12px; line-height: 16px; }
  .checks, .method { grid-column: 1 / -1; }
}
@container (max-width: 600px) {
  .page { padding: 64px 16px 72px; }
  .scrolly__sticky .iso-plate-corner[data-corner="hint"], .scrolly__sticky .iso-plate-corner[data-corner="title"] { display: none; }
  .scrolly__sticky .iso-plate-corners { inset: 12px 14px; }
  .scrolly__sticky .iso-plate-corner[data-corner="readout"] { bottom: 0; }
}
@media (prefers-reduced-motion: reduce) { .step { transition: none; } }
`;

const pageScript = `
const stepsEl = [...document.querySelectorAll(".step")];
let active = -1;
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
function pick() {
  if (window.__director && __director.playing) return;   // a walkthrough is driving the bench; scrolling resumes when it ends
  const line = innerHeight * (matchMedia("(max-width: 900px)").matches ? 0.72 : 0.55);
  let i = 0;
  stepsEl.forEach((el, j) => { if (el.getBoundingClientRect().top < line) i = j; });
  if (i !== active) {
    active = i;
    stepsEl.forEach((el, j) => el.classList.toggle("is-active", j === i));
    BENCH.go(i);
    { const q = new URLSearchParams(location.hash.slice(1)); if (q.get("chapter") !== stepsEl[i].dataset.key) { q.set("chapter", stepsEl[i].dataset.key); history.replaceState(null, "", "#" + q.toString().replace(/%2C/g, ",")); } }
  }
  // scrub: over the last 40% of a chapter the camera starts travelling toward the next framing
  const r = stepsEl[i].getBoundingClientRect();
  const f = (line - r.top) / Math.max(1, r.height);
  // on narrow screens the chapter is read below the pinned bench, so most of its scroll is spent reading: the camera
  // only starts toward the next framing over the last fifth, instead of panning off this chapter's data mid-read
  const from = matchMedia("(max-width: 900px)").matches ? 0.8 : 0.6;
  BENCH.scrub(i, ease((f - from) / (1 - from)));
}
let queued = false;
addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; pick(); }); } }, { passive: true });
addEventListener("resize", pick);
document.addEventListener("played", () => { active = -1; pick(); });   // hand the bench back to the scroll position
window.BENCH = BENCH;
// deep link: #chapter=<key>
const fromHash = new URLSearchParams(location.hash.slice(1)).get("chapter");
const hashEl = fromHash && document.getElementById("chapter-" + fromHash);
if (hashEl) requestAnimationFrame(() => { hashEl.scrollIntoView({ block: "center" }); pick(); });
window.__goStep = (i) => { stepsEl[i].scrollIntoView({ block: "center" }); };
pick();
// ---------- follow one customer: their coded place in every chapter, with the quote that put them there ----------
const FOLLOW_DATA = ${JSON.stringify({ steps: spec.steps.map((s) => ({ follow: s.follow || null, labels: (s.sorter ? s.sorter.labels : s.cabinet.labels).map((l) => l.replace(/ \(derived[^)]*\)/, "")) })), customers: CUSTOMERS.map((c) => ({ label: c.label, codes: c.codes, evidence: c.evidence })) })};
(() => {
  const menu = document.querySelector(".fig-follow");
  if (!menu || !window.BENCH || !BENCH.follow) return;
  const escH = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const q = (ev, who) => ev ? '<blockquote class="follow-q"><p>\u201C' + escH(ev.quote) + '\u201D</p><footer>' + who + ' · <a href="' + escH(ev.source) + '" target="_blank" rel="noopener">Source</a></footer></blockquote>' : "";
  function render(i) {
    document.querySelectorAll("[data-follow-card]").forEach((card, s) => {
      if (i < 0) { card.hidden = true; card.innerHTML = ""; return; }
      const st = FOLLOW_DATA.steps[s], c = FOLLOW_DATA.customers[i], f = st.follow;
      card.hidden = false;
      if (!f) { card.innerHTML = '<p class="follow-k">' + c.label + '</p><p>Not coded for this chapter.</p>'; return; }
      if (f.multi) {
        const cited = f.multi.map((k, d) => c.codes[f.dim][k] ? d : -1).filter((d) => d >= 0);
        card.innerHTML = '<p class="follow-k">' + c.label + ' cites ' + cited.length + ' of ' + f.multi.length + '</p><p>' + (cited.length ? cited.map((d) => escH(st.labels[d])).join(" · ") : "none of these") + '</p>' +
          cited.slice(0, 2).map((d) => q(c.evidence[f.dim + "." + f.multi[d]], c.label)).join("");
        return;
      }
      const v = c.codes[f.dim], col = f.values.indexOf(v);
      const ev = c.evidence[f.dim];
      card.innerHTML = '<p class="follow-k">' + c.label + '</p><p>' + (col >= 0 ? escH(st.labels[col]) : "Coded “" + escH(String(v)) + "”, which has no column in this chapter") + '</p>' +
        (ev ? q(ev, c.label) : '<p class="follow-note">Coded from what the transcript does not mention' + (c.evidence[f.dim + "_note"] ? "" : "") + '.</p>');
    });
  }
  menu.addEventListener("change", () => { BENCH.follow(menu.value === "" ? -1 : +menu.value); });
  document.addEventListener("follow", (e) => { render(e.detail.index); menu.value = e.detail.index >= 0 ? String(e.detail.index) : "";
    const qy = new URLSearchParams(location.hash.slice(1)); if (e.detail.label) qy.set("follow", e.detail.label); else qy.delete("follow"); history.replaceState(null, "", "#" + qy.toString().replace(/%2C/g, ",")); });
  const want = new URLSearchParams(location.hash.slice(1)).get("follow");
  const wi = FOLLOW_DATA.customers.findIndex((c) => c.label === want);
  if (wi >= 0) BENCH.follow(wi);
})();
${TIP_SCRIPT}
${viewToolsScript("window.BENCH")}
${playScript("window.BENCH", SCRIPTS)}
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#F9F4EB">
<title>${esc(page.htmlTitle)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
<style>
${LL_TOKENS}
${k.ISO_CSS}
${skin}
${HEADER_CSS}
${CSS}
${TIP_CSS}
${BLUEPRINT_CSS}
${TENSION_CSS}
${PLAY_CSS}
</style>
</head>
<body class="iso">
<header class="ll-header"><span class="ll-brand">Listen Labs /</span> <span class="ll-title">${esc(page.credit)}</span></header>
<main class="page">
  <!-- Intro: title left, key figures in the top-right space -->${headerHtml(page)}

  <!-- Scrolly: steps drive the pinned bench -->
  <section class="scrolly">
    <div class="scrolly__steps">${steps}
    </div>
    <div class="scrolly__figure">
      <div class="scrolly__sticky">
        ${figure}
      </div>
    </div>
  </section>

  <!-- Closing -->
  <section class="closing">
    <div class="checks">
      <h2>${t(page.checksTitle)}</h2>
      <ol>${checks}</ol>
    </div>
    <div class="method">
      <h2>Read before sharing</h2>
      <ul>${notes}</ul>
      <p class="method__fig">${t(spec.figure.caption)}</p>
      <p class="method__source">Source: <a href="${esc(spec.study.url)}" target="_blank" rel="noopener">${t(spec.study.title)}</a> · study ${esc(spec.study.id)} · n&nbsp;=&nbsp;${N}</p>
    </div>
  </section>
</main>
<script type="module">
${(kitScript() + live + pageScript).replace(/<\/(script)/gi, "<\\/$1")}
</script>
</body>
</html>`;
writeFileSync(outPath, html);
console.log("wrote", outPath);
