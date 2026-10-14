// Shared page pieces for every page shell: tokens, typography helpers, the editorial header.

// Brand tokens come from the plugin's generated token file (docs/tokens.css, built from brand_data.py), never from a
// copy: brand rule 1. Only layout measures and the dark-mode data-viz steps the figures need are added here.
import { readFileSync as __readTokens } from "node:fs";
export const LL_TOKENS = __readTokens(new URL("../../../docs/tokens.css", import.meta.url), "utf8") + `
:root { --maxw: 1280px; --gutter: 24px; --margin: 24px; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --dataviz-categorical-1: hsl(229, 100%, 60%); --dataviz-highlight-neutral-3: #504E49; }
}
:root[data-theme="dark"] { --dataviz-categorical-1: hsl(229, 100%, 60%); --dataviz-highlight-neutral-3: #504E49; }
`;

export const curly = (s) => String(s)
  .replace(/(^|[\s(\[—–-])"/g, "$1“").replace(/"/g, "”")
  .replace(/(^|[\s(\[—–-])'/g, "$1‘").replace(/'/g, "’")
  .replace(/\.\.\./g, "…");
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const t = (s) => esc(curly(s))
  .replace(/ of (\d)/g, " of&nbsp;$1")
  .replace(/(\d+) − (\d+)/g, "$1&nbsp;−&nbsp;$2")
  .replace(/n = (\d+)/g, "n&nbsp;=&nbsp;$1");

// Editorial header: title block left, key-stat stack in the top-right negative space.
export function headerHtml(page) {
  const stats = (page.headlineStats || []).map((s) => `
      <div class="hstat">
        <p class="hstat__num">${esc(s.value)}</p>
        <p class="hstat__base">${t(s.base)}</p>
      </div>`).join("");
  return `
  <section class="intro">
    <div class="intro__main">
      <p class="intro__frame">${t(page.frame)}</p>
      <h1 class="intro__title">${t(page.headline)}</h1>
      <p class="intro__dek">${t(page.dek)}</p>
    </div>
    ${stats ? `<aside class="intro__stats" aria-label="Key figures">${stats}
    </aside>` : ""}
  </section>`;
}

export const HEADER_CSS = `
.intro { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--gutter); align-items: end; margin-bottom: 56px; }
.intro__main { grid-column: 1 / span 7; }
.intro__frame { font-size: 14px; line-height: 20px; color: var(--content-secondary); margin-bottom: 16px; }
.intro__title { font-size: 48px; line-height: 56px; }
.intro__dek { font-size: 18px; line-height: 28px; color: var(--content-secondary); margin-top: 16px; max-width: 640px; }
.intro__stats { grid-column: 9 / -1; display: grid; }
.hstat { border-top: 1px solid var(--content-disabled); padding: 12px 0 16px; display: grid; grid-template-columns: 96px 1fr; column-gap: 16px; align-items: baseline; }
.hstat__num { font-size: 40px; line-height: 48px; font-variant-numeric: tabular-nums; color: var(--content-primary); }
.hstat__base { font-size: 14px; line-height: 20px; color: var(--content-secondary); text-wrap: balance; }
.hstat:first-child .hstat__num { color: var(--content-brand); }
.hstat:first-child { border-top: 0; padding-top: 0; }   /* rules only between figures: a line above the first floats unaligned */
@container (max-width: 900px) {
  .intro__main { grid-column: 1 / -1; }
  .intro__title { font-size: 36px; line-height: 44px; }
  .intro__stats { grid-column: 1 / -1; margin-top: 32px; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: var(--gutter); }
  .hstat { grid-template-columns: 1fr; }
}
@container (max-width: 600px) {
  .intro__title { font-size: 30px; line-height: 38px; }
  .intro__stats { grid-template-columns: 1fr; }
  .hstat { grid-template-columns: 72px 1fr; }
  .hstat__num { font-size: 32px; line-height: 40px; }
}
`;

// Full-bleed camera card: the drawing runs to the card's rounded edge so zooming never shows
// a hard inner clip; corner labels float on a card-coloured backing.
export const cameraCardCss = (scope) => `
${scope} .iso-plate { padding: 0; overflow: hidden; }
${scope} .iso-svg { overflow: hidden; }
${scope} .iso-plate-corners { z-index: 1; }
${scope} .iso-plate-corner { background: var(--anatomy-card); padding: 2px 6px; margin: -2px -6px; border-radius: 4px; }
@container (max-width: 600px) {
  ${scope} .iso-plate-corners { inset: 12px 14px; }
  ${scope} .iso-plate-corner[data-corner="hint"], ${scope} .iso-plate-corner[data-corner="title"] { display: none; }
  ${scope} .iso-plate-corner[data-corner="readout"] { bottom: 0; left: 0; white-space: normal; text-align: right; line-height: 1.35; }   /* a long readout wraps instead of running off the card */
}
`;

// Hover/tap labels on the drawing: any element with data-tip inside an .iso-plate.
export const TIP_CSS = `
.iso-plate { position: relative; }
.iso-tip { position: absolute; left: 0; top: 0; z-index: 3; pointer-events: none; max-width: 260px; padding: 6px 10px; border-radius: 8px;
  background: var(--content-primary); color: var(--surface-primary); font-size: 12px; line-height: 16px; text-wrap: pretty; }
.iso-tip[hidden] { display: none; }
`;
export const TIP_SCRIPT = `
document.querySelectorAll(".iso-plate").forEach((plate) => {
  const tip = document.createElement("div");
  tip.className = "iso-tip"; tip.setAttribute("role", "tooltip"); tip.hidden = true;
  plate.appendChild(tip);
  const show = (e) => {
    const el = e.target && e.target.closest ? e.target.closest("[data-tip]") : null;
    if (!el || !plate.contains(el)) { tip.hidden = true; return; }
    if (tip.textContent !== el.getAttribute("data-tip")) tip.textContent = el.getAttribute("data-tip");
    tip.hidden = false;
    const r = plate.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    let x = e.clientX - r.left + 14, y = e.clientY - r.top + 16;
    if (x + w > r.width - 8) x = e.clientX - r.left - w - 14;
    if (y + h > r.height - 8) y = e.clientY - r.top - h - 14;
    tip.style.transform = "translate(" + Math.max(8, x) + "px, " + Math.max(8, y) + "px)";
  };
  plate.addEventListener("pointermove", show);
  plate.addEventListener("pointerdown", show);
  plate.addEventListener("pointerleave", () => { tip.hidden = true; });
});
`;

// ---------- Phase 1: blueprint + take-apart (any object with a parts registry) ----------
// Toolbar that sits in the figure's top-right corner. Buttons drive window[api].setView.
export const viewToolsHtml = (scripts, extra = "") => `<div class="fig-tools" role="group" aria-label="Drawing view">${extra}${scripts && Object.keys(scripts).length ? `
  <select class="fig-play" data-play aria-label="Play a guided walkthrough"><option value="">Play…</option>${Object.values(scripts).map((sc) => `<option value="${sc.key}">Play: ${sc.label}</option>`).join("")}</select>` : ""}
  <button class="fig-tool" type="button" aria-pressed="false" data-view="blueprint" title="Blueprint (B)">Blueprint</button>
  <button class="fig-tool" type="button" aria-pressed="false" data-view="apart" title="Take apart (A)">Take apart</button>
</div>`;
// Engineering title block: rows come from spec.figure.titleBlock ([label, value] pairs), never invented here.
export const titleBlockHtml = (rows, esc) => rows && rows.length ? `<dl class="bp-title" aria-label="Drawing title block">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>` : "";
export const viewToolsScript = (api, { hash = true } = {}) => `
(() => {
  const tools = [...document.querySelectorAll(".fig-tool")];
  const sync = (v) => tools.forEach((b) => b.setAttribute("aria-pressed", String(!!v[b.dataset.view])));
  const setHash = (v) => { if (!${hash}) return; const q = new URLSearchParams(location.hash.slice(1)); const on = ["blueprint", "apart", "waves"].filter((k) => v[k]); if (on.length) q.set("view", on.join(",")); else q.delete("view"); history.replaceState(null, "", q.toString() ? "#" + q.toString().replace(/%2C/g, ",") : location.pathname + location.search); };
  tools.forEach((b) => b.addEventListener("click", () => { const k = b.dataset.view; ${api}.setView({ [k]: !${api}.view[k] }); }));
  document.addEventListener("view", (e) => { sync(e.detail); setHash(e.detail); });
  const want = (new URLSearchParams(${hash} ? location.hash.slice(1) : "").get("view") || "").split(",");
  if (want.includes("blueprint") || want.includes("apart") || want.includes("waves")) ${api}.setView({ blueprint: want.includes("blueprint"), apart: want.includes("apart"), ...(want.includes("waves") ? { waves: true } : {}) });
})();
`;
export const BLUEPRINT_CSS = `
/* toolbar */
.fig-tools { position: absolute; top: 12px; right: 12px; z-index: 2; display: flex; gap: 4px; padding: 4px; border-radius: 8px; background: var(--anatomy-card); border: 1px solid var(--anatomy-faint); }
.fig-tool { appearance: none; font: inherit; font-size: 12px; line-height: 16px; padding: 6px 10px; min-height: 32px; border: 0; border-radius: 4px; background: transparent; color: var(--anatomy-text); cursor: pointer; }
.fig-tool:hover { color: var(--anatomy-strong); }
.fig-tool[aria-pressed="true"] { background: var(--content-brand); color: var(--surface-highlight); }
@media (pointer: coarse) { .fig-tool { min-height: 44px; } }

/* re-inked drawing: flat paper fills, brand-blue line weights, grid paper */
.iso-plate { transition: background-color .35s ease; }
/* re-inking fades only while the blueprint toggle runs: the camera rebuilds the drawing every frame as it orbits, and a
   standing transition would restart on every rebuilt part, so a highlight would never finish fading in */
.iso-plate[data-reinking] .iso-svg :is(.iso-fill, .iso-shade, .iso-top) { transition: fill .35s ease; }
.iso-plate[data-reinking] .iso-svg .iso-line { transition: stroke .35s ease; }
.iso-plate[data-blueprint] {
  --anatomy-paper: var(--anatomy-card); --anatomy-face: var(--anatomy-card); --anatomy-top: var(--anatomy-card);
  --anatomy-shade-0: var(--anatomy-card); --anatomy-shade-1: var(--anatomy-card); --anatomy-shade-2: var(--anatomy-card); --anatomy-shade-3: var(--anatomy-card);
  --anatomy-hi: #0021CC; --anatomy-mid: #5F6CC0; --anatomy-lo: #A3ABDA; --anatomy-faint: #D2D7EE; --anatomy-lit: #0021CC;
  --anatomy-lit-top: #E6E9F8; --anatomy-lit-shade: #D6DBF3; --anatomy-dot: #0021CC; --anatomy-halo-opacity: 0;
  --bp-grid: rgba(0, 33, 204, .06); --bp-grid-major: rgba(0, 33, 204, .1);
  background-image:
    linear-gradient(var(--bp-grid-major) 1px, transparent 1px), linear-gradient(90deg, var(--bp-grid-major) 1px, transparent 1px),
    linear-gradient(var(--bp-grid) 1px, transparent 1px), linear-gradient(90deg, var(--bp-grid) 1px, transparent 1px);
  background-size: 96px 96px, 96px 96px, 24px 24px, 24px 24px;
  background-position: -1px -1px;
}
[data-theme="dark"] .iso-plate[data-blueprint] {
  --anatomy-card: #0A0F2E; --anatomy-hi: #E8ECFF; --anatomy-mid: #8E9AE6; --anatomy-lo: #4C58A8; --anatomy-faint: #263070; --anatomy-lit: #FFFFFF;
  --anatomy-lit-top: #1E2A78; --anatomy-lit-shade: #18226A; --anatomy-dot: #E8ECFF; --anatomy-text: #A9B3EE; --anatomy-strong: #FFFFFF;
  --bp-grid: rgba(140, 160, 255, .07); --bp-grid-major: rgba(140, 160, 255, .12);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .iso-plate[data-blueprint] {
    --anatomy-card: #0A0F2E; --anatomy-hi: #E8ECFF; --anatomy-mid: #8E9AE6; --anatomy-lo: #4C58A8; --anatomy-faint: #263070; --anatomy-lit: #FFFFFF;
    --anatomy-lit-top: #1E2A78; --anatomy-lit-shade: #18226A; --anatomy-dot: #E8ECFF; --anatomy-text: #A9B3EE; --anatomy-strong: #FFFFFF;
    --bp-grid: rgba(140, 160, 255, .07); --bp-grid-major: rgba(140, 160, 255, .12);
  }
}

/* sheet views (blueprint or apart): the selected station's parts carry the one accent, the rest step down a tone */
.iso-plate:is([data-blueprint], [data-apart]) [data-part]:not([data-on]) .iso-line[data-tone="hi"] { stroke: var(--anatomy-mid); }
.iso-plate:is([data-blueprint], [data-apart]) [data-part]:not([data-on]) .iso-line[data-tone="mid"] { stroke: var(--anatomy-lo); }
.iso-plate:is([data-blueprint], [data-apart]) [data-part][data-on] .iso-solid > .iso-fill { fill: var(--anatomy-face); }
.iso-plate:is([data-blueprint], [data-apart]) [data-part][data-on] .iso-solid > .iso-top { fill: var(--anatomy-lit-top); }
.iso-plate:is([data-blueprint], [data-apart]) [data-part][data-on] .iso-solid > .iso-shade { fill: var(--anatomy-lit-shade); }
.iso-plate:is([data-blueprint], [data-apart]) [data-part][data-on] .iso-solid[data-seamless] > .iso-top { stroke: var(--anatomy-lit-top); }
.iso-plate:is([data-blueprint], [data-apart]) [data-part][data-on] .iso-solid[data-seamless] > .iso-shade { stroke: var(--anatomy-lit-shade); }
.iso-plate:is([data-blueprint], [data-apart]) [data-part][data-on] .iso-line[data-tone="hi"] { stroke: var(--anatomy-lit); }

/* callouts */
.bp-layer { position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: 0; transition: opacity .35s ease; }
.bp-layer.is-on { opacity: 1; }
.bp-layer.is-on.is-hidden { opacity: 0; }
.bp-layer:not(.is-on) .bp-label, .bp-layer.is-hidden .bp-label { pointer-events: none; }
.bp-leaders { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.bp-leader { fill: none; stroke: var(--anatomy-mid); stroke-width: .75; }
.bp-dot { fill: var(--anatomy-card); stroke: var(--anatomy-mid); stroke-width: .75; }
.bp-leader[data-on], .bp-dot[data-on] { stroke: var(--anatomy-lit); stroke-width: 1.25; }
.bp-row { position: absolute; left: 16px; right: 16px; top: 64px; display: grid; grid-template-columns: repeat(var(--bp-cols), minmax(0, 1fr)); gap: 8px; }
.bp-label { pointer-events: auto; justify-self: center; appearance: none; font: inherit; text-align: left; cursor: pointer;
  display: grid; gap: 2px; padding: 6px 8px; border-radius: 4px; border: 1px solid var(--anatomy-lo); background: var(--anatomy-card); color: var(--anatomy-hi); transition: border-color .2s ease, opacity .2s ease; }
.bp-label[data-on] { border-color: var(--anatomy-lit); box-shadow: inset 0 0 0 1px var(--anatomy-lit); }
.bp-label[data-off] { opacity: .45; }
.bp-label__head { display: flex; gap: 6px; font-size: 12px; line-height: 16px; color: var(--anatomy-mid); white-space: nowrap; }
.bp-num { color: var(--anatomy-hi); font-variant-numeric: tabular-nums; }
.bp-name { max-width: 9em; overflow: hidden; text-overflow: ellipsis; }
.bp-row[data-many] .bp-name { display: none; }   /* 6+ findings: numbers, counts and scales; the key below names them */
.bp-count { font-size: 18px; line-height: 24px; font-variant-numeric: tabular-nums; }
.bp-count span { font-size: 12px; color: var(--anatomy-mid); }
.bp-scale { display: block; width: 62px; height: 6px; margin-top: 2px; overflow: visible; }
.bp-scale path { fill: none; stroke-width: 1; vector-effect: non-scaling-stroke; }
.bp-scale__on { stroke: var(--anatomy-hi); fill: var(--anatomy-hi); }
.bp-scale__rest { stroke: var(--anatomy-faint); fill: var(--anatomy-faint); }
.bp-scale__miss { stroke: var(--anatomy-lo); stroke-dasharray: 2 3; }
.bp-row[data-layout="column"] { left: auto; right: 16px; grid-template-columns: max-content; gap: 4px; }
.bp-row[data-layout="column"] .bp-label { justify-self: end; grid-template-columns: auto auto auto; align-items: center; column-gap: 8px; padding: 4px 8px; }
.bp-row[data-layout="column"] .bp-name { display: none; }
.bp-row[data-layout="column"] .bp-count { font-size: 14px; line-height: 20px; }
.bp-row[data-layout="column"] .bp-scale { margin-top: 0; }
.bp-row.is-compact { inset: 0; display: block; }
.bp-row.is-compact .bp-label { position: absolute; left: 0; top: 0; }

/* cutaway: the open part goes see-through; its evidence panel sits on the right with a leader to the card stack */
.iso-plate[data-cut] [data-open] :is(.iso-fill, .iso-shade, .iso-top) { fill-opacity: .3; }
.iso-plate[data-cut] [data-part]:not([data-on]) .iso-line[data-tone="hi"] { stroke: var(--anatomy-mid); }
.cut { position: absolute; z-index: 3; right: 16px; top: 64px; max-height: calc(100% - 108px); width: min(340px, 46%); display: flex; flex-direction: column; gap: 8px;
  padding: 12px 14px; border-radius: 8px; background: var(--anatomy-card); border: 1px solid var(--anatomy-faint); font-size: 14px; line-height: 20px; color: var(--anatomy-strong); }
.cut[hidden] { display: none; }
.cut__head { display: flex; align-items: baseline; gap: 8px; }
.cut__title { font-size: 16px; line-height: 24px; }
.cut__close { margin-left: auto; appearance: none; border: 0; background: none; font: inherit; font-size: 12px; color: var(--content-brand); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; padding: 0; }
.cut__note { font-size: 12px; line-height: 16px; color: var(--anatomy-text); }
.cut__list { list-style: none; margin: 0; padding: 0 4px 0 0; overflow-y: auto; overscroll-behavior: contain; display: grid; gap: 10px; counter-reset: card; }
.cut__card { padding: 8px 10px; border-left: 2px solid var(--content-brand); background: var(--surface-highlight, transparent); border-radius: 0 4px 4px 0; }
.cut__src { margin-top: 4px; font-size: 12px; line-height: 16px; color: var(--anatomy-text); }
.cut__noquote { color: var(--anatomy-text); }
.cut__leader { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2; overflow: visible; }
@container (max-width: 600px) { .cut { left: 8px; right: 8px; top: 52px; max-height: calc(100% - 60px); width: auto; } .cut__leader { display: none; } }

/* follow one customer: their coin (or cited drawers) outlined in the accent, a pin naming them */
/* a followed part changes colour, never weight: the drawing keeps one line weight everywhere */
.iso-solid[data-follow] > .iso-edge { stroke: var(--anatomy-lit); }
.follow-pin { position: absolute; left: 0; top: 0; z-index: 3; display: grid; gap: 0; padding: 4px 8px; border-radius: 4px; background: var(--anatomy-card);
  border: 1px solid var(--content-brand); font-size: 12px; line-height: 16px; pointer-events: none; max-width: 220px; }
.follow-pin[hidden] { display: none; }
.follow-pin[data-idle] { opacity: .45; }
.follow-pin { transition: opacity .25s ease; }
.follow-pin__who { color: var(--content-brand); font-size: 14px; line-height: 20px; }
.follow-pin__sub { color: var(--anatomy-text); }
.follow-pin__line { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2; overflow: visible; }

/* waves (tracker): ghost needles for the wave before; tubes dim because reasons are not coded by wave */
.wave-ghost { stroke-dasharray: 2.5 2.5; stroke-width: 1; }
.iso-plate[data-waves] [data-tipkey^="tube-"], .iso-plate[data-waves] .wb-gl, .iso-plate[data-waves] .wb-front { opacity: .3; transition: opacity .35s ease; }
.wave-key { position: absolute; z-index: 2; left: 16px; bottom: 44px; display: flex; flex-wrap: wrap; gap: 4px 12px; padding: 4px 8px; border-radius: 4px; background: var(--anatomy-card);
  border: 1px solid var(--anatomy-faint); font-size: 12px; line-height: 16px; color: var(--anatomy-text); }
.wave-key[hidden] { display: none; }
.wave-key__cur { color: var(--anatomy-strong); }

/* title block: the study's method, drawn where an engineer would look for it */
/* a title strip along the foot of the sheet: one column per row of spec.figure.titleBlock */
.bp-title { position: absolute; left: 16px; right: 16px; bottom: 44px; z-index: 1; margin: 0; display: grid; grid-auto-flow: column; grid-template-rows: auto auto; grid-auto-columns: auto;
  border: 1px solid var(--anatomy-mid); background: var(--anatomy-card); font-size: 12px; line-height: 16px; opacity: 0; transition: opacity .35s ease; pointer-events: none; }
.iso-plate[data-blueprint] .bp-title { opacity: 1; }
.bp-title dt, .bp-title dd { margin: 0; padding: 4px 8px; border-left: 1px solid var(--anatomy-lo); }
.bp-title dt { color: var(--anatomy-mid); padding-bottom: 0; }
.bp-title dd { color: var(--anatomy-hi); padding-top: 0; }
.bp-title dt:first-of-type, .bp-title dd:first-of-type { border-left: 0; }
@container (max-width: 600px) {
  .bp-label { padding: 2px 6px; }
  .bp-label__head { display: none; }
  .iso-plate-corner[data-corner="fig"] { display: none; }                  /* the toolbar takes the top edge */
  .bp-name, .bp-scale { display: none; }
  .bp-count { font-size: 12px; line-height: 16px; }
  .bp-count span { display: none; }   /* the base (n) is in the readout and the rail; tags carry the count only */
  .bp-title { display: none; }
  /* phones: the controls get their own row above the drawing instead of covering a fifth of it */
  .fig-tools { position: relative; top: auto; right: auto; left: auto; margin: 8px 8px 0; flex-wrap: wrap; border: 0; padding: 0; gap: 2px; }   /* wraps, never a hidden sideways scroller: every control stays visible */
  .fig-tool, .fig-play { white-space: nowrap; flex: none; }
}
`;

// ---------- Phase 2: scripts (one camera script → Play, video, slides, poster; lenses are just more scripts) ----------
// A beat: { hold, camera: "wide" | {az,zoom,focus}, station: key, view: {blueprint, apart}, shopper: label,
//           title (literal heading, no numbers), caption / sub / quote: "@refs" into the spec }.
// Captions never carry new claims: every caption, sub and quote must be a reference, resolved here at build time
// with its provenance kept beside the text. A literal title containing a digit fails the build.
export function resolveRef(spec, ref) {
  if (typeof ref !== "string" || !ref.startsWith("@")) throw new Error(`script caption must be an @reference into the spec, got ${JSON.stringify(ref)}`);
  const parts = ref.slice(1).split(".");
  const N = spec.study.n;
  const fail = () => { throw new Error(`unresolved script reference ${ref}`); };
  if (parts[0] === "stations") {
    const s = spec.stations.find((x) => x.key === parts[1]) || fail();
    const f = parts[2];
    if (f === "finding") return { text: `${s.count} of ${N} shoppers ${s.statement}.`, from: ref };
    if (f === "contrast") return s.contrast ? { text: `${s.contrast.count} of ${N} shoppers ${s.contrast.statement}.`, from: ref } : fail();
    if (f === "quote") return { quote: s.quote, source: s.source, who: "Participant", from: ref };
    if (f === "implication" || f === "statement") return { text: s[f], from: ref };
    fail();
  }
  if (parts[0] === "shoppers") {
    const p = spec.shoppers.find((x) => x.label === parts[1]) || fail();
    if (parts[2] === "path") {
      // station 0 is how the session arrived (spec.arrival), not a hesitation — same rule as the replay
      const stops = spec.stations.slice(1).filter((s) => s.code && p.codes[s.code]).map((s) => s.name);
      const A = spec.arrival, arrived = (p.codes[A.code] ? A.on : A.off).toLowerCase();
      return { text: `${p.label}: ${arrived}; ${A.lastLabel} ${p.lastOrder}. Their own words show hesitation at ${stops.length ? stops.join(", ") : "no station"}.`, from: ref };
    }
    if (parts[2] === "at") {   // where this shopper stood at a station, from their own codes
      const k = spec.stations.findIndex((s) => s.key === parts[3]); if (k < 0) fail();
      const s = spec.stations[k];
      if (k === 0) return { text: `${p.label}: ${(p.codes[spec.arrival.code] ? spec.arrival.on : spec.arrival.off).toLowerCase()}.`, from: ref };
      return { text: p.codes[s.code] ? `${p.label}: ${s.readout}.` : `${p.label}: no hesitation coded here.`, from: ref };
    }
    if (parts[2] === "evidence") { const e = p.evidence[parts[3]] || fail(); return { quote: e.quote, source: e.source, who: p.label, from: ref }; }
    fail();
  }
  // sort bench chapters: stat, title, kicker, body, caveat, quote
  if (parts[0] === "steps") {
    const st = (spec.steps || []).find((x) => x.key === parts[1]) || fail();
    const f = parts[2];
    if (f === "stat") return { text: `${st.stat.value} ${st.stat.base}.`, from: ref };
    if (f === "quote") return st.quote ? { quote: st.quote.text, source: st.quote.source, who: "Participant", from: ref } : fail();
    if (["title", "kicker", "body", "caveat"].includes(f)) return st[f] ? { text: st[f], from: ref } : fail();
    fail();
  }
  // workbenches: users of the tool base, headline, body, quote, reasons; "*" compares one reason across benches
  if (parts[0] === "benches") {
    const base = spec.study.toolBase;
    if (parts[1] === "*" && parts[2] === "reasons") {
      const j = +parts[3];
      const label = spec.benches[0].reasons[j].label;
      if (!spec.benches.every((b) => b.reasons[j].label === label)) fail();   // only a reason every bench shares compares
      return { text: `${label}: ${spec.benches.map((b) => `${b.name} ${b.reasons[j].pct}%`).join(", ")} of each assistant’s own users.`, from: ref };
    }
    const b = spec.benches.find((x) => x.key === parts[1]) || fail();
    const f = parts[2];
    if (f === "users") return { text: `${b.users} of ${base} used ${b.name} in the past month.`, from: ref };
    // a paraphrased lead-in stays outside the quotation marks: only the participant's own words are quoted
    if (f === "quote") return { quote: b.quote.text, lead: b.quote.lead || "", source: b.quote.source, who: "Participant", from: ref };
    if (f === "reasons") { const r = b.reasons[+parts[3]] || fail(); return { text: `${r.pct}% of ${b.name}’s ${b.users} users: ${r.label.toLowerCase()}.`, from: ref }; }
    if (f === "dials") return { text: b.appeal == null ? `${b.name}’s appeal and trust: not reported as values in the analysis, so its dials stay capped.` : `${b.appeal}% of ${b.name}’s users find it appealing; ${b.trust}% trust it.`, from: ref };
    if (["headline", "body", "name"].includes(f)) return { text: b[f], from: ref };
    fail();
  }
  // one followed customer (Phase 4): where their own coded answer puts them in a chapter, and the quote behind it
  if (parts[0] === "customers") {
    const c = (spec.customers || []).find((x) => x.label === parts[1]) || fail();
    const st = (spec.steps || []).find((x) => x.key === parts[3]) || fail();
    const f = st.follow || fail();
    const labels = (st.sorter ? st.sorter.labels : st.cabinet.labels).map((l) => l.replace(/ \(derived[^)]*\)/, ""));
    if (parts[2] === "in") {
      if (f.multi) { const cited = f.multi.filter((k) => c.codes[f.dim][k]).map((k) => labels[f.multi.indexOf(k)]); return { text: `${c.label} cites ${cited.length} of ${f.multi.length}: ${cited.join(", ").toLowerCase() || "none"}.`, from: ref }; }
      const col = f.values.indexOf(c.codes[f.dim]);
      return { text: col >= 0 ? `${c.label}: ${labels[col].toLowerCase()}.` : `${c.label} is coded outside these columns.`, from: ref };
    }
    if (parts[2] === "quote") {
      const key = f.multi ? (f.multi.find((k) => c.codes[f.dim][k] && c.evidence[f.dim + "." + k]) ? f.dim + "." + f.multi.find((k) => c.codes[f.dim][k] && c.evidence[f.dim + "." + k]) : null) : f.dim;
      const e = key && c.evidence[key];
      return e ? { quote: e.quote, source: e.source, who: c.label, from: ref } : fail();
    }
    fail();
  }
  // tracker waves (spec.waves): the latest wave against the one before, values side by side with their n — no trend words
  if (parts[0] === "waves") {
    const W = spec.waves || fail(), L = W.list;
    if (L.length < 2) fail();
    const c = L[L.length - 1], p = L[L.length - 2];
    if (parts[1] === "title") return { text: `${p.label} → ${c.label}`, from: ref };
    if (parts[1] === "summary") return { text: `${p.label}: ${p.n} interviews. ${c.label}: ${c.n} interviews. Dashed needles show ${p.label}; solid, ${c.label}.`, from: ref };
    const i = spec.benches.findIndex((b) => b.key === parts[1]); if (i < 0) fail();
    const b = spec.benches[i], f = parts[2];
    if (f === "users") return { text: `${b.name} users: ${p.benches[i].users} of ${p.base} in ${p.label}, ${c.benches[i].users} of ${c.base} in ${c.label}.`, from: ref };
    if (f === "appeal" || f === "trust") {
      if (c.benches[i][f] == null || p.benches[i][f] == null) return { text: `${b.name} ${f}: not shown by wave (the report publishes no value, or too few answered).`, from: ref };
      const word = f === "appeal" ? "find it appealing" : "trust it";
      return { text: `${b.name}, share of its users who ${word}: ${p.benches[i][f]}% in ${p.label} (n ${p.benches[i][f + "N"]}) and ${c.benches[i][f]}% in ${c.label} (n ${c.benches[i][f + "N"]}).`, from: ref };
    }
    fail();
  }
  if (parts[0] === "page" && parts[1] === "headlineStats") { const h = spec.page.headlineStats[+parts[2]] || fail(); return { text: `${h.value} ${h.base}.`, from: ref }; }
  if (parts[0] === "exit" && parts[1] === "quote") return { quote: spec.exit.quote, source: spec.exit.source, who: "Participant", from: ref };
  if (parts[0] === "page") {
    const v = parts.slice(1).reduce((o, k) => (o == null ? o : o[k]), spec.page);
    if (v == null) fail();
    if (typeof v === "object" && v.lead) return { text: `${v.lead} ${v.body}`, from: ref };
    return { text: String(v), from: ref };
  }
  fail();
}
export function resolveScripts(spec) {
  const out = {};
  for (const [key, sc] of Object.entries(spec.scripts || {})) {
    out[key] = { key, title: sc.title, label: sc.label || sc.title, beats: sc.beats.map((b, i) => {
      if (b.title && !b.title.startsWith("@") && /\d/.test(b.title)) throw new Error(`script ${key} beat ${i}: a literal title may not carry numbers ("${b.title}") — put the number in an @reference`);
      const station = b.station ? spec.stations.findIndex((s) => s.key === b.station) : -1;
      if (b.station && station < 0) throw new Error(`script ${key} beat ${i}: unknown station ${b.station}`);
      const shopper = b.shopper ? (spec.shoppers || []).findIndex((p) => p.label === b.shopper) : -1;
      const step = b.step ? (spec.steps || []).findIndex((x) => x.key === b.step) : -1;
      if (b.step && step < 0) throw new Error(`script ${key} beat ${i}: unknown step ${b.step}`);
      const bench = b.bench ? (spec.benches || []).findIndex((x) => x.key === b.bench) : -1;
      if (b.bench && bench < 0) throw new Error(`script ${key} beat ${i}: unknown bench ${b.bench}`);
      if (b.shopper && shopper < 0) throw new Error(`script ${key} beat ${i}: unknown shopper ${b.shopper}`);
      const r = (x) => (x ? resolveRef(spec, x) : null);
      const quote = r(b.quote);
      return {
        hold: b.hold, station, shopper, step, bench, view: b.view || { blueprint: false, apart: false },
        camera: b.camera === "wide" || !b.camera ? null : b.camera, wide: b.camera === "wide",
        kicker: station >= 0 ? `${String(station + 1).padStart(2, "0")} · ${spec.stations[station].name}`
          : step >= 0 ? spec.steps[step].kicker
          : bench >= 0 ? `${String(bench + 1).padStart(2, "0")} · ${spec.benches[bench].name}`
          : (b.shopper ? "Replay" : ""),
        title: b.title ? (b.title.startsWith("@") ? resolveRef(spec, b.title).text : b.title) : "",
        tension: !!b.tension, cutaway: !!b.cutaway,
        follow: sc.follow ? (spec.customers || spec.shoppers || []).findIndex((c) => c.label === sc.follow) : -1, caption: r(b.caption), sub: r(b.sub), quote: quote && quote.quote ? quote : null, poster: !!b.poster,
      };
    }) };
  }
  return out;
}
import { readFileSync as __read } from "node:fs";
export const DIRECTOR_SRC = __read(new URL("../objects/director.js", import.meta.url), "utf8");
// Caption card: rendered inside the figure on pages, in its own column on the 16:9 stage.
export const captionHtml = () => `<div class="cap" data-cap hidden aria-live="polite">
  <div class="cap__head"><span class="cap__kicker" data-c="kicker"></span><span class="cap__count" data-c="count"></span><button class="cap__stop" type="button" data-c="stop">Stop</button></div>
  <p class="cap__title" data-c="title"></p>
  <p class="cap__text" data-c="text"></p>
  <p class="cap__sub" data-c="sub"></p>
  <blockquote class="cap__quote" data-c="quote"><p data-c="qtext"></p><footer><span data-c="who"></span> · <a data-c="src" target="_blank" rel="noopener">Source</a></footer></blockquote>
  <div class="cap__bar" aria-hidden="true"><i data-c="bar"></i></div>
</div>`;
// Browser: director + caption rendering + play menu. api is the object's global (window.CONV …).
export const playScript = (api, scripts) => `
${DIRECTOR_SRC}
(() => {
  const SCRIPTS = ${JSON.stringify(scripts)};
  const cap = document.querySelector("[data-cap]");
  if (!cap) return;
  const c = (k) => cap.querySelector('[data-c="' + k + '"]');
  const menu = document.querySelector("[data-play]");
  const short = (u) => { try { const x = new URL(u); return x.host + x.pathname.replace(/^(\\/[^/]+\\/[0-9a-f]{8}).*$/, "$1…"); } catch { return u; } };
  function show(b, i, sc) {
    cap.hidden = false;
    c("kicker").textContent = b.kicker || sc.title;
    c("count").textContent = (i + 1) + " / " + sc.beats.length;
    c("title").textContent = b.title; c("title").hidden = !b.title;
    c("text").textContent = b.caption ? b.caption.text : ""; c("text").hidden = !b.caption;
    c("sub").textContent = b.sub ? b.sub.text : ""; c("sub").hidden = !b.sub;
    const q = b.quote;
    c("quote").hidden = !q;
    if (q) { c("qtext").textContent = (q.lead ? q.lead + " " : "") + "\\u201C" + q.quote + "\\u201D"; c("who").textContent = q.who; c("src").href = q.source; c("src").textContent = "Source · " + short(q.source); }
    document.documentElement.setAttribute("data-playing", sc.key);
    cap.dataset.pos = b.shopper >= 0 ? "bottom" : "";   // a replay follows the bag through the middle of the shot
  }
  const director = makeDirector({
    scripts: SCRIPTS,
    apply: (b) => ${api}.scene(b),
    onBeat: show,
    onProgress: (t, T) => { c("bar").style.transform = "scaleX(" + Math.min(1, t / T).toFixed(4) + ")"; },
    onEnd: (key, stopped) => { cap.hidden = true; ${api}.unscript(); if (before) ${api}.setView(before); before = null; if (menu) menu.value = ""; document.documentElement.removeAttribute("data-playing"); document.dispatchEvent(new CustomEvent("played", { detail: { key, stopped: !!stopped } })); },
  });
  // the reader's own view (blueprint / apart) comes back when a walkthrough ends or is interrupted
  let before = null;
  const start = (key) => { if (!director.playing) before = ${api}.view; return director.play(key); };
  window.__director = director;
  window.__scripts = SCRIPTS;
  if (menu) menu.addEventListener("change", () => { if (menu.value) start(menu.value); else director.stop(); });
  c("stop").addEventListener("click", () => director.stop());
  // any other interaction hands control back to the reader
  document.addEventListener("pointerdown", (e) => { if (director.playing && !e.target.closest("[data-cap], .fig-play")) director.stop(); }, true);
  document.addEventListener("keydown", (e) => { if (director.playing && e.key === "Escape") director.stop(); });
  const want = new URLSearchParams(location.hash.slice(1)).get("play");
  if (want && SCRIPTS[want]) { if (menu) menu.value = want; start(want); }
})();
`;
export const PLAY_CSS = `
.fig-play { appearance: none; font: inherit; font-size: 12px; line-height: 16px; padding: 6px 24px 6px 10px; min-height: 32px; border: 0; border-radius: 4px; cursor: pointer;
  color: var(--anatomy-text); background: transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%236B6861'/%3E%3C/svg%3E") no-repeat right 8px center; }
.fig-play:hover { color: var(--anatomy-strong); }
.fig-play { field-sizing: content; }   /* size to the chosen option, not the longest one (no dead gap before the arrow) */
[data-playing] .fig-play { background-color: var(--content-brand); color: var(--surface-highlight); }
@media (pointer: coarse) { .fig-play { min-height: 44px; } }
.cap { position: absolute; z-index: 3; left: 16px; top: 64px; width: min(400px, 60%); padding: 12px 14px; border-radius: 8px; background: var(--anatomy-card);
  border: 1px solid var(--anatomy-faint); display: grid; gap: 6px; font-size: 14px; line-height: 20px; color: var(--anatomy-strong); }
.cap[hidden] { display: none; }
.cap[data-pos="bottom"] { top: auto; bottom: 44px; }
.cap__head { display: flex; align-items: baseline; gap: 8px; font-size: 12px; line-height: 16px; color: var(--anatomy-text); }
.cap__kicker { color: var(--content-brand); }
.cap__count { font-variant-numeric: tabular-nums; }
.cap__stop { margin-left: auto; appearance: none; border: 0; background: none; font: inherit; color: var(--content-brand); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; padding: 0; }
.cap__title { font-size: 16px; line-height: 24px; }
.cap__text { text-wrap: pretty; }
.cap__sub { color: var(--anatomy-text); }
.cap__quote { margin: 2px 0 0; padding-left: 10px; border-left: 2px solid var(--content-brand); }
.cap__quote p { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.cap__quote footer { margin-top: 4px; font-size: 12px; line-height: 16px; color: var(--anatomy-text); }
.cap__bar { height: 2px; background: var(--anatomy-faint); border-radius: 1px; overflow: hidden; margin-top: 4px; }
.cap__bar i { display: block; height: 100%; background: var(--content-brand); transform-origin: 0 50%; transform: scaleX(0); }
[data-playing] .replay-quote { display: none !important; }
[data-playing] .iso-plate[data-blueprint] .cap { top: auto; bottom: 96px; }   /* the callout row owns the top of a blueprint sheet */
@container (max-width: 600px) {
  .cap, .cap[data-pos="bottom"] { left: 8px; right: 8px; width: auto; top: auto; bottom: 8px; padding: 6px 10px; gap: 2px; font-size: 13px; line-height: 18px; }
  .cap__quote, .cap__sub, .cap__title { display: none; }
  .cap__text { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }   /* the rail below carries the full text */
}
`;

// ---------- Phase 3: the tension event (README: honesty rules) ----------
// spec.tension = { label, event, target: { station | step | bench }, numbers: ["@ref", …] }.
// Fails the build unless every reference resolves to text carrying a number, the label is a literal without digits,
// and the event is one the object knows. The resolved numbers ride along and are printed beside the event.
export function resolveTension(spec, events) {
  const t = spec.tension;
  if (!t) return null;
  if (!t.label || /\d/.test(t.label)) throw new Error("tension.label must be a literal without numbers; the numbers come from tension.numbers");
  if (!events.includes(t.event)) throw new Error(`tension.event "${t.event}" is not one this object plays (${events.join(", ")})`);
  if (!t.numbers || !t.numbers.length) throw new Error("tension.numbers must name at least one @reference: the event dramatizes a stated number");
  const numbers = t.numbers.map((r) => { const x = resolveRef(spec, r); if (!x.text || !/\d/.test(x.text)) throw new Error(`tension number ${r} resolves to text without a number`); return { text: x.text, from: r }; });
  const key = t.target.station ? ["stations", t.target.station] : t.target.step ? ["steps", t.target.step] : ["benches", t.target.bench];
  const index = (spec[key[0]] || []).findIndex((x) => x.key === key[1]);
  if (index < 0) throw new Error(`tension.target ${key.join(".")} not found`);
  return { label: t.label, event: t.event, index, numbers };
}
export const TENSION_CSS = `
.tension { position: absolute; z-index: 3; left: 16px; top: 64px; width: min(380px, 56%); padding: 10px 12px; border-radius: 8px; background: var(--anatomy-card);
  border: 1px solid var(--content-brand); display: grid; gap: 4px; font-size: 14px; line-height: 20px; color: var(--anatomy-strong);
  opacity: 0; transform: translateY(-4px); transition: opacity .35s ease, transform .35s ease; pointer-events: none; }
.tension.is-on { opacity: 1; transform: none; }
.tension[data-pos="bottom"] { top: auto; bottom: 44px; }
.tension__kicker { font-size: 12px; line-height: 16px; color: var(--content-brand); }
.tension__label { font-size: 16px; line-height: 24px; }
.tension__num { color: var(--anatomy-text); }
/* the chip shows during walkthroughs too: the rule is that the dramatized numbers are printed every time it plays.
   The play caption sits top-left, so the chip moves to the foot of the figure. */
[data-playing] .tension { top: auto; bottom: 44px; }
@container (max-width: 600px) { .tension { left: 8px; right: 8px; width: auto; top: auto; bottom: 8px; } .tension__num + .tension__num { display: none; } }
`;

// "object@world" picks a world for an object's data (objects/conveyor.mjs: conveyor | aisle). The world's own copy
// (alt label, caption, tips, drawing name) lives in spec.figure.worlds[world] and replaces the default figure copy.
export function applyWorld(arg, spec) {
  const [objName, world] = String(arg).split("@");
  if (world) {
    spec.__world = world;
    const copy = spec.figure.worlds?.[world];
    if (!copy) throw new Error(`spec.figure.worlds.${world} is missing: a world needs its own alt label, caption and tips`);
    Object.assign(spec.figure, copy);
  }
  return objName;
}

// The reconciliation, printed on every scene page (non-negotiable 4): our coding of each interview next to the numbers
// the report states. Builders put it in spec.reconciliation; QA fails a scene page without it.
export const RECON_CSS = `
.recon { margin-top: 64px; max-width: 760px; } .recon h2 { font-size: 20px; line-height: 28px; margin-bottom: 8px; } .recon p { font-size: 14px; line-height: 20px; color: var(--content-secondary); margin-bottom: 12px; }
.recon table { width: 100%; border-collapse: collapse; font-size: 14px; line-height: 20px; font-variant-numeric: tabular-nums; }
.recon th { text-align: left; font-weight: 400; font-size: 12px; color: var(--content-secondary); border-bottom: 1px solid var(--content-disabled); padding: 6px 8px 6px 0; }
.recon td { border-bottom: 1px solid var(--content-disabled); padding: 8px 8px 8px 0; } .recon td + td, .recon th + th { text-align: right; }
.recon small { color: var(--content-secondary); font-size: 12px; }`;
export function reconHtml(spec, t = (x) => x) {
  const rows = spec.reconciliation || [];
  if (!rows.length) return `<section class="recon" data-recon><h2>Against the report</h2><p>The report states no counts this coding can be checked against.</p></section>`;
  return `<section class="recon" data-recon><h2>Against the report</h2><p>Our coding of each interview, next to the numbers the report states. The coding is never adjusted to match.</p>
    <table><thead><tr><th>Measure</th><th>Our coding</th><th>Report</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${t(r.label)}</td><td>${r.transcript} of ${r.base}</td><td>${r.report} of ${r.reportBase}${r.derived ? ` <small>(from ${r.derived})</small>` : ""}</td></tr>`).join("")}</tbody></table></section>`;
}
