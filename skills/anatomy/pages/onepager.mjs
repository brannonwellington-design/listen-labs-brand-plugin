// One-pager page shell (research-artifacts anatomy §1) wrapped around an anatomy object.
// usage: node pages/onepager.mjs <object> <spec.json> <out.html>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname as outDir } from "node:path";
const ANATOMY = new URL("..", import.meta.url).pathname;
const k = await import(join(ANATOMY, "kit/iso-kit.mjs"));
const { kitScript } = await import(join(ANATOMY, "scripts/inline-kit.mjs"));
const { LL_TOKENS: SHARED_TOKENS, applyWorld, headerHtml, HEADER_CSS, cameraCardCss, TIP_CSS, TIP_SCRIPT, viewToolsHtml, titleBlockHtml, viewToolsScript, BLUEPRINT_CSS, resolveScripts, captionHtml, playScript, PLAY_CSS, resolveTension, TENSION_CSS, reconHtml, RECON_CSS, whoOf, stopOf, labelFor } = await import("./shared.mjs");

const [objArg, specPath, outPath] = process.argv.slice(2);
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const WHO = whoOf(spec), STOP = stopOf(spec);   // who the respondents are and what a stop is called: the config's words
const objName = applyWorld(objArg, spec);   // "conveyor@aisle": the conveyor's data and runtime, staged in another world
const SCRIPTS = resolveScripts(spec);   // captions are @references into the spec; the build fails on anything else
const obj = await import(`../objects/${objName}.mjs`);
spec.__tension = resolveTension(spec, obj.TENSION_EVENTS || []);   // fails the build unless its numbers resolve
const { svg, live } = obj.build(spec);
const skin = readFileSync(new URL("../skin/ll-skin.css", import.meta.url), "utf8");
const page = { ...spec.page };
if (page.headlineStations) page.headlineStats = page.headlineStations.map((key) => { const s = spec.stations.find((x) => x.key === key); if (!s) throw new Error("headlineStations: unknown station " + key); return { value: String(s.count), base: `of ${spec.study.n} ${s.readout}` }; });
const N = spec.study.n;

// typographic precision: curly quotes, apostrophes, ellipsis
const curly = (s) => s
  .replace(/(^|[\s(\[—–-])"/g, "$1“").replace(/"/g, "”")
  .replace(/(^|[\s(\[—–-])'/g, "$1‘").replace(/'/g, "’")
  .replace(/\.\.\./g, "…");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const t = (s) => esc(curly(s)).replace(/ of (\d+)/g, " of&nbsp;$1").replace(/n = (\d+)/g, "n&nbsp;=&nbsp;$1");

const CHIPS = (spec.shoppers || []).map((p, i) => `
      <button class="replay__chip" type="button" aria-pressed="false" data-shopper="${i}">${esc(p.label)}</button>`).join("");
const DATA_N = spec.study.n;
const figure0 = k.plateHtml({
  fig: spec.figure.fig + " · " + spec.figure.title,
  title: "",
  hint: spec.figure.hint,
  readout: "",
  caption: curly(spec.figure.caption),
  body: `${viewToolsHtml(SCRIPTS, (spec.shoppers || []).length ? `<select class="fig-play fig-follow" aria-label="Follow one ${esc(WHO.one)}"><option value="">Follow…</option>${spec.shoppers.map((p, i) => `<option value="${i}">Follow ${p.label}</option>`).join("")}</select>` : "")}${titleBlockHtml(spec.figure.titleBlock, esc)}${captionHtml()}<div class="replay-quote" data-replay-quote hidden><p data-rq="text"></p><a data-rq="src" target="_blank" rel="noopener">Source</a></div><div class="iso-stage" data-conveyor tabindex="0" role="slider" aria-label="${esc(spec.figure.title)}: arrow keys move between stations" aria-valuemin="1" aria-valuemax="${spec.stations.length}" aria-valuenow="1">${svg}</div>`,
});
const figure = figure0;

const tabs = spec.stations.map((s, i) => `
        <button class="station-tab" type="button" role="tab" id="tab-${s.key}" aria-controls="station-panel" aria-selected="${i === 0}" data-index="${i}">
          <span class="station-tab__name">${t(s.name)}</span>
          <span class="station-tab__count">${s.count}<span class="station-tab__base">/${N}</span></span>
        </button>`).join("");

const actions = page.actions.map((a) => `
        <li class="action"><span class="action__lead">${t(a.lead)}</span> <span class="action__body">${t(a.body)}</span></li>`).join("");

const notes = [...page.notes].map((n) => `<li>${t(n)}</li>`).join("");

// DATA block the live panel reads (one place, editable)
const DATA = {
  n: N,
  stations: spec.stations.map(({ key, name, count, statement, contrast, quote, source, implication, code, transcriptCount, readout }) => ({ key, name, count, code, transcriptCount, readout, statement: curly(statement), contrast: contrast ? { ...contrast, statement: curly(contrast.statement) } : null, quote: curly(quote), source, implication: curly(implication) })),
  shoppers: (spec.shoppers || []).map((p) => ({ label: p.label, lastOrder: p.lastOrder, codes: p.codes, evidence: Object.fromEntries(Object.entries(p.evidence).map(([k, e]) => [k, { quote: curly(e.quote), source: e.source }])) })),
};

const panelScript = `
// merge one key into the hash, keeping the others (#view=… survives a station click)
function setHash(key, value) { const q = new URLSearchParams(location.hash.slice(1)); q.delete("station"); q.delete("shopper"); if (value) q.set(key, value); history.replaceState(null, "", "#" + q.toString().replace(/%2C/g, ",")); }
const DATA = ${JSON.stringify(DATA, null, 2)};
const STOP = ${JSON.stringify(stopOf(spec))}, WHO = ${JSON.stringify(whoOf(spec))};
const ARRIVAL = ${JSON.stringify(spec.arrival || { code: "", altCode: "", on: "", off: "", lastLabel: "" })};
const panel = document.getElementById("station-panel");
const tabsEl = [...document.querySelectorAll(".station-tab")];
const nbsp = (s) => s.replace(/ of (\\d+)/g, " of\\u00A0$1");
let followIdx = -1, current = 0;
// the followed respondent at this station: their own words, or that no stop was coded here
function renderFollow() {
  const card = panel.querySelector("[data-f=follow]");
  if (followIdx < 0) { card.hidden = true; return; }
  const p = DATA.shoppers[followIdx], s = DATA.stations[current], k = current;
  const code = k === 0 ? (p.codes[ARRIVAL.code] ? ARRIVAL.code : ARRIVAL.altCode) : s.code;
  const on = k === 0 || p.codes[code], e = on ? p.evidence[code] : null;
  const status = k === 0 ? (p.codes[ARRIVAL.code] ? ARRIVAL.on : ARRIVAL.off) : on ? STOP.on : STOP.off;
  card.hidden = false;
  card.innerHTML = '<p class="follow-k">' + p.label + '</p><p>' + status + '</p>' + (e ? '<blockquote class="follow-q"><p>\u201C' + e.quote.replace(/</g, "&lt;") + '\u201D</p><footer>' + p.label + ' · <a href="' + e.source + '" target="_blank" rel="noopener">Source</a></footer></blockquote>' : "");
}
function render(i) {
  current = i;
  const s = DATA.stations[i];
  tabsEl.forEach((b, j) => { b.setAttribute("aria-selected", String(i === j)); b.tabIndex = i === j ? 0 : -1; });
  panel.setAttribute("aria-labelledby", "tab-" + s.key);
  panel.querySelector("[data-f=num]").textContent = s.count;
  panel.querySelector("[data-f=base]").textContent = "of " + DATA.n + " " + WHO.many;
  panel.querySelector("[data-f=name]").textContent = s.name;
  panel.querySelector("[data-f=statement]").textContent = s.statement + ".";
  const c = panel.querySelector("[data-f=contrast]");
  c.hidden = !s.contrast;
  const tc = panel.querySelector("[data-f=transcript]");
  tc.hidden = s.transcriptCount == null || s.noTranscriptCount;
  if (!tc.hidden) tc.textContent = "Our transcript coding: " + s.transcriptCount + " of " + DATA.n + (s.transcriptCount < s.count ? " named it as a reason (stricter than the report)" : s.transcriptCount > s.count ? " (broader than the report)" : "") + ".";
  if (s.contrast) c.textContent = "Versus " + s.contrast.count + " of " + DATA.n + " who " + s.contrast.statement + ".";
  panel.querySelector("[data-f=quote]").textContent = "\\u201C" + s.quote + "\\u201D";
  panel.querySelector("[data-f=source]").href = s.source;
  panel.querySelector("[data-f=implication]").textContent = s.implication;
  renderFollow();
}
tabsEl.forEach((b, i) => {
  b.addEventListener("click", () => { render(i); setHash("station", DATA.stations[i].key); document.dispatchEvent(new CustomEvent("station", { detail: { index: i, from: "tabs" } })); });
  b.addEventListener("keydown", (e) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const j = (i + d + tabsEl.length) % tabsEl.length;
    tabsEl[j].focus(); tabsEl[j].click();
  });
});
document.addEventListener("station", (e) => { if (e.detail.from === "figure") render(e.detail.index); });
render(0);
// ---------- workspace modes ----------
const modes = [...document.querySelectorAll(".ws-mode")];
function setMode(m) {
  modes.forEach((b) => { const on = b.dataset.mode === m; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
  document.querySelectorAll(".ws-pane").forEach((p) => { p.hidden = p.dataset.pane !== m; });
  if (m === "stations" && window.CONV && CONV.replaying) CONV.stopReplay();
}
modes.forEach((b, i) => {
  b.addEventListener("click", () => setMode(b.dataset.mode));
  b.addEventListener("keydown", (e) => { const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return; e.preventDefault(); const j = (i + d + modes.length) % modes.length; modes[j].focus(); setMode(modes[j].dataset.mode); });
});
// ---------- replay UI ----------
const chips = [...document.querySelectorAll(".replay__chip")];
const card = document.querySelector("[data-replay-card]");
const overlay = document.querySelector("[data-replay-quote]");
let replaying = -1;
function stepHtml(p, s, k) {
  const code = k === 0 ? (p.codes[ARRIVAL.code] ? ARRIVAL.code : ARRIVAL.altCode) : s.code;
  const on = k === 0 || p.codes[code];
  const e = on ? p.evidence[code] : null;
  const status = k === 0 ? (p.codes[ARRIVAL.code] ? ARRIVAL.on : ARRIVAL.off) : on ? s.readout.charAt(0).toUpperCase() + s.readout.slice(1) : STOP.off;
  return '<li class="rstep' + (on ? "" : " is-off") + '" data-k="' + k + '"><p class="rstep__name">' + s.name + '</p><p class="rstep__status">' + status + '</p>' +
    (e ? '<p class="rstep__quote">\u201C' + e.quote.replace(/</g, "&lt;") + '\u201D</p><p class="rstep__src">' + p.label + ' · <a href="' + e.source + '" target="_blank" rel="noopener">Source</a></p>' : "") + "</li>";
}
function renderShopper(i) {
  replaying = i;
  chips.forEach((c, j) => c.setAttribute("aria-pressed", String(j === i)));
  card.hidden = i < 0;
  overlay.hidden = true;
  if (i < 0) return;
  const p = DATA.shoppers[i];
  card.querySelector("[data-r=who]").textContent = p.label + " · " + ARRIVAL.lastLabel + ": " + p.lastOrder;
  let html = DATA.stations.map((s, k) => stepHtml(p, s, k)).join("");
  const X = ARRIVAL.extra;   // a coded reason with no station on this line (spec.arrival.extra)
  if (X && p.codes[X.code] && p.evidence[X.code]) html += '<li class="rstep__extra">' + X.text + ': \u201C' + p.evidence[X.code].quote.replace(/</g, "&lt;") + '\u201D <a href="' + p.evidence[X.code].source + '" target="_blank" rel="noopener">Source</a></li>';
  card.querySelector("[data-r=path]").innerHTML = html;
}
chips.forEach((c, i) => c.addEventListener("click", () => {
  if (replaying === i) { CONV.stopReplay(); return; }
  renderShopper(i); CONV.replay(i);
  setHash("shopper", DATA.shoppers[i].label);
  const fig = document.querySelector(".ws-figure");
  if (fig.getBoundingClientRect().bottom < 80) fig.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}));
card.querySelector("[data-r=back]").addEventListener("click", () => CONV.stopReplay());
document.addEventListener("replay", (e) => {
  const d = e.detail;
  if (d.phase === "stop" && d.shopper < 0) { renderShopper(-1); return; }
  if (d.shopper !== replaying) renderShopper(d.shopper);
  card.querySelectorAll(".rstep").forEach((el) => el.classList.toggle("is-now", d.phase === "stop" && +el.dataset.k === d.station));
  const now = card.querySelector(".rstep.is-now");
  // keep the current stop in view by scrolling the page (the rail has no scroll box of its own); on narrow screens the
  // pinned figure covers the top, so the stop is kept below it
  if (now) { const n = now.getBoundingClientRect(), fig = document.querySelector(".ws-figure"), narrow = getComputedStyle(document.querySelector(".workspace")).display === "flex";
    const topSafe = narrow ? fig.getBoundingClientRect().bottom + 8 : 96;
    if (n.bottom > innerHeight - 16 || n.top < topSafe) scrollBy({ top: n.top - topSafe - 8, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }
  if (d.phase === "stop" && d.station != null) {
    const p = DATA.shoppers[d.shopper], s = DATA.stations[d.station];
    const code = d.station === 0 ? (p.codes[ARRIVAL.code] ? ARRIVAL.code : ARRIVAL.altCode) : s.code;
    const ev = p.evidence[code];
    overlay.hidden = !ev;
    if (ev) { overlay.querySelector("[data-rq=text]").textContent = "\u201C" + ev.quote + "\u201D"; overlay.querySelector("[data-rq=src]").href = ev.source; overlay.querySelector("[data-rq=src]").textContent = p.label + " · Source"; }
  } else if (d.phase !== "stop") overlay.hidden = true;
});
const shopperHash = new URLSearchParams(location.hash.slice(1)).get("shopper");
const shopperIndex = DATA.shoppers.findIndex((p) => p.label === shopperHash);
if (shopperIndex >= 0) { setMode("shoppers"); chips[shopperIndex].click(); document.querySelector(".workspace").scrollIntoView({ block: "start" }); }

// deep link: #station=<key>
const fromHash = new URLSearchParams(location.hash.slice(1)).get("station");
const hashIndex = DATA.stations.findIndex((s) => s.key === fromHash);
if (hashIndex >= 0) { tabsEl[hashIndex].click(); document.querySelector(".workspace").scrollIntoView({ block: "start" }); }
${TIP_SCRIPT}
// follow menu ↔ figure ↔ hash
(() => {
  const menu = document.querySelector(".fig-follow");
  if (!menu || !CONV.follow) return;
  menu.addEventListener("change", () => CONV.follow(menu.value === "" ? -1 : +menu.value));
  document.addEventListener("follow", (e) => {
    followIdx = e.detail.index; menu.value = followIdx >= 0 ? String(followIdx) : ""; renderFollow();
    const q = new URLSearchParams(location.hash.slice(1)); if (e.detail.label) q.set("follow", e.detail.label); else q.delete("follow");
    history.replaceState(null, "", "#" + q.toString().replace(/%2C/g, ","));
  });
  const want = new URLSearchParams(location.hash.slice(1)).get("follow");
  const wi = DATA.shoppers.findIndex((p) => p.label === want);
  if (wi >= 0) CONV.follow(wi);
})();
${viewToolsScript("CONV")}
${playScript("window.CONV", SCRIPTS)}
`;

const LL_TOKENS = SHARED_TOKENS + ":root { --maxw: 1200px; }";   // brand tokens from docs/tokens.css; this page runs narrower

const CSS = `
*,*::before,*::after { box-sizing: border-box; }
html { background: var(--surface-primary); color-scheme: light dark; }
body {
  margin: 0; container-type: inline-size;
  font-family: 'Inter', 'Helvetica Neue', Arial, system-ui, sans-serif; font-weight: 400;
  color: var(--content-primary); background: var(--surface-primary);
  font-size: 16px; line-height: 24px; -webkit-font-smoothing: antialiased;
}
/* the anatomy card sits on the page surface; its paper is the highlight surface */
body.iso { --anatomy-page: var(--surface-primary); }
a { color: var(--content-brand); text-underline-offset: 3px; }
:focus-visible { outline: 2px solid var(--content-brand); outline-offset: 2px; border-radius: 4px; }
.page { max-width: var(--maxw); margin: 0 auto; padding: 72px var(--margin) 96px; }
.ll-header { position: absolute; top: 24px; left: 0; right: 0; text-align: center; font-size: 12px; line-height: 16px; }
.ll-brand { color: var(--content-secondary); }
.ll-title { color: var(--content-primary); }
h1, h2, h3 { font-weight: 400; margin: 0; text-wrap: balance; }
p { margin: 0; text-wrap: pretty; }

/* Intro */

/* Figure (dominant element) */
.hero-figure .iso-figure { margin: 0; }
.hero-figure .iso-legend { max-width: 720px; }

/* Workspace: figure left (sticky), control rail right (sticky, scrolls inside) */
.workspace { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--gutter); align-items: start; overflow-x: clip; }
.ws-figure { grid-column: 1 / span 8; position: sticky; top: 24px; min-width: 0; }
.ws-figure .iso-figure { margin: 0; }
.ws-figure .iso-legend { font-size: 12px; line-height: 16px; }
/* the rail scrolls with the page (no inset scroll box); only its mode switch sticks, the figure stays pinned beside it */
.ws-rail { grid-column: 9 / -1; min-width: 0; }
.ws-modes { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px; border-radius: 12px; background: var(--surface-secondary); position: sticky; top: 24px; z-index: 1; }
.ws-modes::before { content: ""; position: absolute; left: -4px; right: -4px; bottom: 100%; height: 24px; background: var(--surface-primary); }
.ws-modes::after { content: ""; position: absolute; left: 0; right: 0; top: 100%; height: 12px; background: var(--surface-primary); }
.ws-mode { appearance: none; font: inherit; font-size: 14px; line-height: 20px; min-height: 44px; border: 0; border-radius: 8px; background: transparent; color: var(--content-secondary); cursor: pointer; }
.ws-mode[aria-selected="true"] { background: var(--surface-highlight); color: var(--content-primary); box-shadow: 0 0 0 1px var(--surface-tertiary); }
.ws-pane { padding-top: 16px; }
/* stations: vertical tab list + single-column detail */
.station-tabs { display: grid; border-top: 1px solid var(--content-disabled); }
.station-tab { appearance: none; background: none; border: 0; border-bottom: 1px solid var(--content-disabled); cursor: pointer; font: inherit; color: var(--content-secondary);
  text-align: left; padding: 8px 12px; min-height: 44px; display: flex; justify-content: space-between; align-items: baseline; gap: 12px; border-left: 2px solid transparent; }
.station-tab__name { font-size: 14px; line-height: 20px; }
.station-tab__count { font-size: 18px; line-height: 24px; font-variant-numeric: tabular-nums; color: var(--content-primary); }
.station-tab__base { font-size: 12px; color: var(--content-secondary); }
.station-tab[aria-selected="true"] { color: var(--content-primary); border-left-color: var(--content-brand); background: var(--surface-highlight); }
.station-tab[aria-selected="true"] .station-tab__count { color: var(--content-brand); }
.station-panel { padding-top: 20px; display: grid; gap: 20px; }
.panel__num { font-size: 56px; line-height: 56px; font-variant-numeric: tabular-nums; }
.panel__base { font-size: 14px; line-height: 20px; color: var(--content-secondary); margin-top: 4px; }
.panel__name { font-size: 14px; line-height: 20px; color: var(--content-secondary); margin-bottom: 4px; }
.panel__statement { font-size: 16px; line-height: 24px; margin-top: 12px; }
.panel__contrast { font-size: 14px; line-height: 20px; color: var(--content-secondary); margin-top: 8px; }
.panel__evidence { display: grid; gap: 16px; }
.panel__so-label { font-size: 14px; line-height: 20px; color: var(--content-secondary); }
.panel__so p { font-size: 14px; line-height: 20px; margin-top: 4px; }
/* shoppers: chips + vertical path */
.replay__lede { font-size: 14px; line-height: 20px; color: var(--content-secondary); }
.replay__chips { display: grid; grid-template-columns: repeat(auto-fill, minmax(48px, 1fr)); gap: 4px; margin-top: 12px; }
.replay__chip { appearance: none; font: inherit; font-size: 12px; line-height: 16px; min-height: 44px; border-radius: 8px; border: 1px solid var(--content-disabled); background: var(--surface-highlight); color: var(--content-secondary); cursor: pointer; font-variant-numeric: tabular-nums; }
.replay__chip:hover { color: var(--content-primary); border-color: var(--content-secondary); }
.replay__chip[aria-pressed="true"] { background: var(--content-brand); border-color: var(--content-brand); color: var(--surface-highlight); }
.replay__card { border-top: 1px solid var(--content-disabled); padding-top: 16px; margin-top: 16px; }
.replay__cardhead { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.replay__who { font-size: 16px; line-height: 24px; }
.replay__back { appearance: none; font: inherit; font-size: 14px; background: none; border: 0; color: var(--content-brand); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; min-height: 44px; }
.replay__path { list-style: none; margin: 4px 0 0; padding: 0; display: grid; gap: 12px; }
.quote { margin: 0; padding-left: 20px; border-left: 2px solid var(--content-brand); max-width: 640px; }
.quote p { font-size: 24px; line-height: 32px; }
.ws-rail .quote p { font-size: 16px; line-height: 24px; }
.ws-rail .quote { padding-left: 14px; }
.quote footer { margin-top: 12px; font-size: 14px; line-height: 20px; color: var(--content-secondary); }
.panel__so { max-width: 640px; }
.panel__so-label { font-size: 14px; line-height: 20px; color: var(--content-secondary); }
.panel__so p { font-size: 16px; line-height: 24px; margin-top: 4px; }

/* Act + exit */
.closing { margin-top: 80px; display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--gutter); row-gap: 48px; border-top: 1px solid var(--content-disabled); padding-top: 40px; }
.closing h2 { font-size: 24px; line-height: 32px; margin-bottom: 24px; }
.act { grid-column: 1 / span 7; }
.actions { margin: 0; padding: 0; list-style: none; counter-reset: a; display: grid; gap: 16px; }
.action { counter-increment: a; display: grid; grid-template-columns: 32px 1fr; font-size: 16px; line-height: 24px; color: var(--content-secondary); max-width: 640px; }
.action::before { content: counter(a); color: var(--content-primary); font-variant-numeric: tabular-nums; grid-row: span 2; }
.action__lead { color: var(--content-primary); }
.exit { grid-column: 9 / -1; }
.exit .quote p { font-size: 18px; line-height: 28px; }
.exit__lead { font-size: 16px; line-height: 24px; color: var(--content-secondary); margin-bottom: 20px; }

/* Method */
${RECON_CSS}
.method { margin-top: 80px; border-top: 1px solid var(--content-disabled); padding-top: 24px; display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--gutter); }
.method h2 { grid-column: 1 / span 3; font-size: 14px; line-height: 20px; color: var(--content-secondary); }
.method ul { grid-column: 4 / -1; margin: 0; padding: 0 0 0 16px; font-size: 14px; line-height: 20px; color: var(--content-secondary); display: grid; gap: 8px; max-width: 720px; }
.method__source { grid-column: 4 / -1; margin-top: 16px; font-size: 14px; line-height: 20px; color: var(--content-secondary); }

.rstep { padding: 12px 0 0 12px; border-left: 1px solid var(--content-disabled); transition: border-color .3s ease; }
.rstep.is-now { border-left: 2px solid var(--content-brand); padding-left: 11px; }
.rstep__name { font-size: 14px; line-height: 20px; color: var(--content-secondary); }
.rstep__status { font-size: 14px; line-height: 20px; margin-top: 4px; }
.rstep.is-off .rstep__status { color: var(--content-secondary); }
.rstep__quote { font-size: 14px; line-height: 20px; margin-top: 8px; }
.rstep__src { font-size: 12px; line-height: 16px; color: var(--content-secondary); margin-top: 4px; }
.rstep__extra { grid-column: 1 / -1; font-size: 14px; line-height: 20px; color: var(--content-secondary); }
.replay-quote { position: absolute; z-index: 2; left: 16px; top: 72px; max-width: min(420px, 70%); background: var(--anatomy-card); border-left: 2px solid var(--content-brand); padding: 8px 12px; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 20px; }
.replay-quote a { display: inline-block; margin-top: 4px; font-size: 12px; }
@container (max-width: 900px) {
  .workspace { display: flex; flex-direction: column; }
  .ws-figure { position: sticky; top: 0; z-index: 3; background: var(--surface-primary); padding-top: 8px; width: 100%; }
  .ws-figure .iso-legend { display: none; }
  .ws-rail { position: static; max-height: none; overflow: visible; width: 100%; margin-top: 16px; padding-right: 0; }
  .ws-modes { top: auto; position: static; }
  .act, .exit { grid-column: 1 / -1; }
  .method h2, .method ul, .method__source { grid-column: 1 / -1; }
  .method h2 { margin-bottom: 12px; }
}
@container (max-width: 600px) {
  .replay-quote { display: none; }   /* on phones the path card right below carries the quote */
  .page { padding: 64px 16px 72px; }
  .quote p { font-size: 20px; line-height: 28px; }
}
@media print {
  .ll-header { position: static; margin-bottom: 24px; }
  .ws-rail { display: none; }
}
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
${cameraCardCss(".ws-figure")}
${TIP_CSS}
${BLUEPRINT_CSS}
${TENSION_CSS}
${PLAY_CSS}
.step__follow { margin-top: 4px; padding: 12px 14px; border-radius: 8px; background: var(--surface-highlight); border: 1px solid var(--content-brand); font-size: 14px; line-height: 20px; display: grid; gap: 6px; }
.step__follow[hidden] { display: none; }
.follow-k { color: var(--content-brand); }
.follow-q { margin: 4px 0 0; padding-left: 10px; border-left: 2px solid var(--content-brand); }
.follow-q footer { margin-top: 4px; font-size: 12px; line-height: 16px; color: var(--content-secondary); }
</style>
</head>
<body class="iso">
<!-- Credit line (standalone artifact) -->
<header class="ll-header"><span class="ll-brand">Listen Labs /</span> <span class="ll-title">${esc(page.credit)}</span></header>

<main class="page" data-scene-page>
  <!-- Intro -->
  <!-- Intro: the shared header (eyebrow, headline, dek; key figures top right) -->${headerHtml(page)}

  <!-- Workspace: the figure stays in view while the rail drives it -->
  <section class="workspace" aria-label="Explore the conveyor">
    <div class="ws-figure">
      ${figure}
    </div>
    <aside class="ws-rail" aria-label="Controls">
      <div class="ws-modes" role="tablist" aria-label="Explore by">
        <button class="ws-mode" type="button" role="tab" id="mode-stations" aria-controls="pane-stations" aria-selected="true" data-mode="stations">Stations</button>
        <button class="ws-mode" type="button" role="tab" id="mode-shoppers" aria-controls="pane-shoppers" aria-selected="false" data-mode="shoppers" tabindex="-1">Shoppers</button>
      </div>

      <!-- Stations pane -->
      <div class="ws-pane" id="pane-stations" role="tabpanel" aria-labelledby="mode-stations" data-pane="stations">
        <div class="station-tabs" role="tablist" aria-label="Stations">${tabs}
        </div>
        <div class="station-panel" id="station-panel" role="tabpanel" aria-live="polite">
          <div class="panel__stat">
            <p class="panel__name" data-f="name"></p>
            <p class="panel__num" data-f="num"></p>
            <p class="panel__base" data-f="base"></p>
            <p class="panel__statement" data-f="statement"></p>
            <p class="panel__contrast" data-f="contrast" hidden></p>
            <p class="panel__contrast" data-f="transcript" hidden></p>
          </div>
          <div class="step__follow" data-f="follow" hidden></div>
          <div class="panel__evidence">
            <blockquote class="quote">
              <p data-f="quote"></p>
              <footer>Participant · <a data-f="source" href="#" target="_blank" rel="noopener">Source</a></footer>
            </blockquote>
            <div class="panel__so">
              <p class="panel__so-label">So what</p>
              <p data-f="implication"></p>
            </div>
          </div>
        </div>
      </div>

      <!-- People pane: every carrier is one of the coded respondents -->
      <div class="ws-pane replay" id="pane-shoppers" role="tabpanel" aria-labelledby="mode-shoppers" data-pane="shoppers" hidden>
        <p class="replay__lede">${t(page.replayLede || `Every carrier is one of the ${DATA_N} ${WHO.many}. Pick one and theirs travels alone, stopping wherever their own words show a stop.`)}</p>
        <div class="replay__chips" role="group" aria-label="${esc(WHO.many.charAt(0).toUpperCase() + WHO.many.slice(1))}">${CHIPS}
        </div>
        <div class="replay__card" data-replay-card hidden>
          <div class="replay__cardhead">
            <p class="replay__who" data-r="who"></p>
            <button class="replay__back" type="button" data-r="back">Back to all ${esc(WHO.many)}</button>
          </div>
          <ol class="replay__path" data-r="path"></ol>
        </div>
      </div>
    </aside>
  </section>

  <!-- Act + exit -->
  <section class="closing">
    <div class="act">
      <h2>${t(page.actTitle)}</h2>
      <ol class="actions">${actions}
      </ol>
    </div>
    <div class="exit">
      <h2>${t(spec.exit.name)}</h2>
      <p class="exit__lead">${t(page.exitLead)}</p>
      <blockquote class="quote">
        <p>${t("“" + spec.exit.quote + "”")}</p>
        <footer>${esc(labelFor(spec, spec.exit.source))} · <a href="${esc(spec.exit.source)}" target="_blank" rel="noopener">Source</a></footer>
      </blockquote>
    </div>
  </section>

  <!-- Method -->
  ${reconHtml(spec, t)}
  <section class="method">
    <h2>Read before sharing</h2>
    <ul>${notes}</ul>
    <p class="method__source">Source: <a href="${esc(spec.study.url)}" target="_blank" rel="noopener">${t(spec.study.title)}</a> · Listen Labs study ${esc(spec.study.id)} · n&nbsp;=&nbsp;${N} in the report${spec.study.coded ? ` · ${spec.study.coded} coded` : ""}</p>
  </section>
</main>
<script type="module">
${(kitScript() + live + panelScript).replace(/<\/(script)/gi, "<\\/$1")}
</script>
</body>
</html>`;

mkdirSync(outDir(outPath), { recursive: true });
writeFileSync(outPath, html);
console.log("wrote", outPath);
