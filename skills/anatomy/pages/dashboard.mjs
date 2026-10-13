// Dashboard page shell: an anatomy hero that acts as navigation, a synced detail panel,
// and a grid of small brand charts. usage: node pages/dashboard.mjs <object> <spec.json> <out.html>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const ANATOMY = new URL("..", import.meta.url).pathname;
const k = await import(join(ANATOMY, "kit/iso-kit.mjs"));
const { kitScript, glScript } = await import(join(ANATOMY, "scripts/inline-kit.mjs"));
const { LL_TOKENS, curly, esc, t, headerHtml, HEADER_CSS, cameraCardCss, TIP_CSS, TIP_SCRIPT, viewToolsHtml, titleBlockHtml, viewToolsScript, BLUEPRINT_CSS, resolveScripts, captionHtml, playScript, PLAY_CSS, resolveTension, TENSION_CSS } = await import("./shared.mjs");

const [objName, specPath, outPath] = process.argv.slice(2);
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const SCRIPTS = resolveScripts(spec);   // captions are @references into the spec; the build fails on anything else
const obj = await import(`../objects/${objName}.mjs`);
spec.__tension = resolveTension(spec, obj.TENSION_EVENTS || []);   // fails the build unless its numbers resolve
const { svg, live } = obj.build(spec);
const skin = readFileSync(new URL("../skin/ll-skin.css", import.meta.url), "utf8");
const page = spec.page;
const BASE = spec.study.toolBase;

const figure = k.plateHtml({
  fig: spec.figure.fig + " · " + spec.figure.title, title: "", hint: spec.figure.hint, readout: "",
  caption: curly(spec.figure.caption),
  body: `${viewToolsHtml(SCRIPTS, spec.waves && spec.waves.list.length > 1 ? `<button class="fig-tool" type="button" aria-pressed="false" data-view="waves" title="${esc(spec.waves.list.map((w) => w.label).join(" vs "))}">Waves</button>` : "")}${titleBlockHtml(spec.figure.titleBlock, esc)}${captionHtml()}<div class="iso-stage" data-workbench tabindex="0" role="group" aria-label="${esc(spec.figure.title)}: left and right arrow keys move between benches">${svg}</div>`,
});

const tabs = spec.benches.map((b, i) => `
        <button class="bench-tab" type="button" role="tab" id="tab-${b.key}" aria-controls="bench-panel" aria-selected="${i === 0}" data-index="${i}">
          <span class="bench-tab__name">${esc(b.name)}</span>
          <span class="bench-tab__n">${b.users}<span class="bench-tab__base"> of ${BASE}</span></span>
        </button>`).join("");

// ---------- small charts (server-rendered, data from the spec) ----------
const pct = (v) => `${v}%`;
function barsChart(m) {
  return `<div class="bars" role="img" aria-label="${esc(m.title)}: ${m.bars.map((b) => `${b.label} ${b.pct}%`).join(", ")}">` + m.bars.map((b, i) => `
          <div class="bar">
            <div class="bar__head"><span class="bar__label">${t(b.label)}</span><span class="bar__value">${pct(b.pct)}</span></div>
            <div class="bar__track"><div class="bar__fill${i === 0 ? " is-lead" : ""}" style="--v:${b.pct}"></div></div>
          </div>`).join("") + `</div>`;
}
function pairedChart(m) {
  const legend = `<div class="legend">${m.series.map((s, i) => `<span class="legend__item"><span class="legend__swatch s${i}"></span>${esc(s)}</span>`).join("")}</div>`;
  return legend + `<div class="bars" role="img" aria-label="${esc(m.title)}">` + m.pairs.map((p) => `
          <div class="bar">
            <div class="bar__head"><span class="bar__label">${t(p.label)}</span><span class="bar__value">${p.values.map(pct).join(" → ")}</span></div>
            ${p.values.map((v, i) => `<div class="bar__track bar__track--thin"><div class="bar__fill s${i}" style="--v:${v}"></div></div>`).join("")}
          </div>`).join("") + `</div>`;
}
function slopeChart(m) {
  const W = 320, H = 168, padX = 56, top = 16, bottom = 28;
  const all = m.lines.flatMap((l) => l.values);
  const lo = Math.min(0, ...all), hi = Math.max(...all);
  const y = (v) => top + (1 - (v - lo) / (hi - lo || 1)) * (H - top - bottom);
  const x = [padX, W - padX];
  const lines = m.lines.map((l) => `
            <path d="M${x[0]} ${y(l.values[0]).toFixed(1)}L${x[1]} ${y(l.values[1]).toFixed(1)}" class="slope__line${l.story ? " is-story" : ""}"/>
            <circle cx="${x[0]}" cy="${y(l.values[0]).toFixed(1)}" r="3" class="slope__dot${l.story ? " is-story" : ""}"/>
            <circle cx="${x[1]}" cy="${y(l.values[1]).toFixed(1)}" r="3" class="slope__dot${l.story ? " is-story" : ""}"/>
            <text x="${x[0] - 8}" y="${(y(l.values[0]) + 4).toFixed(1)}" text-anchor="end" class="slope__val">${l.values[0]}%</text>
            <text x="${x[1] + 8}" y="${(y(l.values[1]) + 4).toFixed(1)}" class="slope__val${l.story ? " is-story" : ""}">${l.values[1]}%</text>`).join("");
  const axis = m.series.map((s, i) => `<text x="${x[i]}" y="${H - 6}" text-anchor="middle" class="slope__axis">${esc(s)}</text>`).join("");
  const keys = m.lines.map((l) => `<span class="legend__item"><span class="legend__line${l.story ? " is-story" : ""}"></span>${t(l.label)}</span>`).join("");
  return `<svg class="slope" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(m.title)}: ${m.lines.map((l) => `${l.label} ${l.values[0]}% to ${l.values[1]}%`).join("; ")}">
            <line x1="${x[0]}" y1="${top}" x2="${x[0]}" y2="${H - bottom}" class="slope__rule"/><line x1="${x[1]}" y1="${top}" x2="${x[1]}" y2="${H - bottom}" class="slope__rule"/>${lines}${axis}
          </svg><div class="legend">${keys}</div>`;
}
function dotsChart(m) {
  const first = m.dots[0];
  const cells = Array.from({ length: m.base }, (_, i) => `<span class="waffle__cell${i < first.n ? " is-on" : ""}"></span>`).join("");
  const rest = m.dots.slice(1).map((d) => `<li><span class="num">${d.n}</span> of ${m.base} ${t(d.label.charAt(0).toLowerCase() + d.label.slice(1))}</li>`).join("");
  const quote = m.quote ? `<blockquote class="quote quote--small"><p>${t("“" + m.quote.text + "”")}</p><footer>Participant · <a href="${esc(m.quote.source)}" target="_blank" rel="noopener">Source</a></footer></blockquote>` : "";
  return `<p class="waffle__lead"><span class="num">${first.n}</span> of ${m.base} ${t(first.label.charAt(0).toLowerCase() + first.label.slice(1))}</p>
          <div class="waffle" role="img" aria-label="${first.n} of ${m.base} participants">${cells}</div>
          <ul class="waffle__rest">${rest}</ul>${quote}`;
}
const modules = spec.modules.map((m) => {
  const chart = m.kind === "paired" ? pairedChart(m) : m.kind === "slope" ? slopeChart(m) : m.kind === "dots" ? dotsChart(m) : barsChart(m);
  return `
      <article class="module">
        <h3 class="module__title">${t(m.title)}</h3>
        <p class="module__note">${t(m.note)}</p>
        ${chart}
      </article>`;
}).join("");

const actions = page.actions.map((a) => `<li><span class="action__lead">${t(a.lead)}</span> ${t(a.body)}</li>`).join("");
const notes = [...page.notes, ...(spec.waves ? [spec.waves.note] : [])].map((n) => `<li>${t(n)}</li>`).join("");

const DATA = {
  base: BASE,
  benches: spec.benches.map((b) => ({ ...b, headline: curly(b.headline), body: curly(b.body), job: curly(b.job), quote: { ...b.quote, text: curly(b.quote.text), lead: b.quote.lead ? curly(b.quote.lead) : null } })),
};

const CSS = `
*,*::before,*::after { box-sizing: border-box; }
html { background: var(--surface-primary); color-scheme: light dark; }
body { margin: 0; container-type: inline-size; font-family: 'Inter', 'Helvetica Neue', Arial, system-ui, sans-serif; font-weight: 400;
  color: var(--content-primary); background: var(--surface-primary); font-size: 16px; line-height: 24px; -webkit-font-smoothing: antialiased; }
body.iso { --anatomy-page: var(--surface-primary); }
a { color: var(--content-brand); text-underline-offset: 3px; }
:focus-visible { outline: 2px solid var(--content-brand); outline-offset: 2px; border-radius: 4px; }
h1, h2, h3 { font-weight: 400; margin: 0; text-wrap: balance; }
p { margin: 0; text-wrap: pretty; }
.num { font-variant-numeric: tabular-nums; color: var(--content-primary); }
.ll-header { position: absolute; top: 24px; left: 0; right: 0; text-align: center; font-size: 12px; line-height: 16px; }
.ll-brand { color: var(--content-secondary); }
.page { max-width: var(--maxw); margin: 0 auto; padding: 72px var(--margin) 96px; }
.hero .iso-figure { margin: 0; }
.hero .iso-legend { max-width: 720px; }

/* Bench tabs + panel */
.bench-tabs { display: grid; grid-template-columns: repeat(${spec.benches.length}, minmax(0, 1fr)); border-top: 1px solid var(--content-disabled); margin-top: 40px; }
.bench-tab { appearance: none; background: none; border: 0; border-bottom: 1px solid var(--content-disabled); font: inherit; color: var(--content-secondary);
  text-align: left; padding: 16px 16px 16px 0; min-height: 44px; cursor: pointer; display: flex; flex-direction: column; gap: 4px; }
.bench-tab__name { font-size: 16px; line-height: 24px; }
.bench-tab__n { font-size: 24px; line-height: 32px; color: var(--content-primary); font-variant-numeric: tabular-nums; }
.bench-tab__base { font-size: 14px; color: var(--content-secondary); }
.bench-tab[aria-selected="true"] { color: var(--content-primary); border-bottom: 2px solid var(--content-brand); padding-bottom: 15px; }
.bench-tab[aria-selected="true"] .bench-tab__n { color: var(--content-brand); }
.bench-panel { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--gutter); row-gap: 32px; padding-top: 32px; }
.panel__reach { grid-column: 1 / span 3; }
.panel__num { font-size: 72px; line-height: 72px; font-variant-numeric: tabular-nums; }
.panel__base { font-size: 14px; line-height: 20px; color: var(--content-secondary); margin-top: 8px; }
.panel__metrics { grid-column: 4 / span 4; display: grid; gap: 20px; }
.panel__story { grid-column: 9 / -1; }
.panel__label { font-size: 14px; line-height: 20px; color: var(--content-secondary); margin-bottom: 8px; }
.panel__headline { font-size: 24px; line-height: 32px; }
.panel__body { margin-top: 12px; color: var(--content-secondary); }
.panel__job { margin-top: 16px; font-size: 14px; line-height: 20px; color: var(--content-secondary); }
.panel__job span { color: var(--content-primary); }
.absent { border: 1px dashed var(--content-disabled); border-radius: 8px; padding: 12px 16px; font-size: 14px; line-height: 20px; color: var(--content-secondary); background: var(--surface-secondary); }

/* Bars (shared by panel + modules) */
.bars { display: grid; gap: 12px; }
.bar__head { display: flex; justify-content: space-between; gap: 16px; font-size: 14px; line-height: 20px; }
.bar__label { color: var(--content-secondary); }
.bar__value { color: var(--content-primary); font-variant-numeric: tabular-nums; white-space: nowrap; }
.bar__track { height: 8px; background: var(--surface-secondary); border-radius: 2px; margin-top: 4px; overflow: hidden; }
.bar__track--thin { height: 6px; }
.bar__track--thin + .bar__track--thin { margin-top: 2px; }
.bar__fill { height: 100%; width: calc(var(--v) * 1%); background: var(--dataviz-categorical-4); border-radius: 2px; }
.bar__fill.is-lead, .bar__fill.s1 { background: var(--dataviz-categorical-1); }
.bar__fill.s0 { background: var(--dataviz-categorical-4); }

/* Module grid */
.modules { margin-top: 72px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--gutter); }
.modules__title { grid-column: 1 / -1; font-size: 24px; line-height: 32px; margin-bottom: 0; }
.module { background: var(--surface-highlight); border: 1px solid var(--surface-tertiary); border-radius: 12px; padding: 20px 20px 24px; min-width: 0; display: flex; flex-direction: column; gap: 12px; }
.module__title { font-size: 16px; line-height: 24px; }
.module__note { font-size: 12px; line-height: 16px; color: var(--content-secondary); margin-top: -8px; }
.legend { display: flex; flex-wrap: wrap; gap: 4px 16px; font-size: 12px; line-height: 16px; color: var(--content-secondary); }
.legend__item { display: inline-flex; align-items: center; gap: 6px; }
.legend__swatch { width: 12px; height: 8px; border-radius: 2px; }
.legend__swatch.s0 { background: var(--dataviz-categorical-4); } .legend__swatch.s1 { background: var(--dataviz-categorical-1); }
.legend__line { width: 16px; height: 0; border-top: 1px solid var(--content-secondary); }
.legend__line.is-story { border-top: 2px solid var(--content-brand); }
.slope { width: 100%; height: auto; display: block; }
.slope__rule { stroke: var(--content-disabled); stroke-width: 1; }
.slope__line { stroke: var(--content-secondary); stroke-width: 1; fill: none; }
.slope__line.is-story { stroke: var(--content-brand); stroke-width: 2; }
.slope__dot { fill: var(--surface-highlight); stroke: var(--content-secondary); stroke-width: 1; }
.slope__dot.is-story { stroke: var(--content-brand); fill: var(--content-brand); }
.slope__val { font-size: 12px; fill: var(--content-secondary); font-variant-numeric: tabular-nums; }
.slope__val.is-story { fill: var(--content-brand); }
.slope__axis { font-size: 12px; fill: var(--content-secondary); }
.waffle { display: grid; grid-template-columns: repeat(30, minmax(0, 1fr)); gap: 2px; }
.waffle__cell { aspect-ratio: 1; border-radius: 1px; background: var(--surface-tertiary); }
.waffle__cell.is-on { background: var(--content-brand); }
.waffle__lead, .waffle__rest { font-size: 14px; line-height: 20px; color: var(--content-secondary); }
.waffle__rest { margin: 0; padding: 0; list-style: none; display: grid; gap: 4px; }
.quote { margin: 0; padding-left: 16px; border-left: 2px solid var(--content-brand); }
.quote p { font-size: 18px; line-height: 28px; }
.quote--small p { font-size: 14px; line-height: 20px; }
.quote footer { margin-top: 8px; font-size: 14px; line-height: 20px; color: var(--content-secondary); }
.quote--small footer { font-size: 12px; line-height: 16px; }

/* Closing */
.closing { margin-top: 72px; border-top: 1px solid var(--content-disabled); padding-top: 40px; display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--gutter); row-gap: 40px; }
.closing h2 { font-size: 24px; line-height: 32px; margin-bottom: 24px; }
.act { grid-column: 1 / span 7; }
.act ol { margin: 0; padding-left: 24px; display: grid; gap: 12px; color: var(--content-secondary); max-width: 640px; }
.action__lead { color: var(--content-primary); }
.method { grid-column: 9 / -1; }
.method h2 { font-size: 14px; line-height: 20px; color: var(--content-secondary); margin-bottom: 12px; }
.method ul { margin: 0; padding-left: 16px; display: grid; gap: 8px; font-size: 14px; line-height: 20px; color: var(--content-secondary); }
.method__source { font-size: 14px; line-height: 20px; color: var(--content-secondary); margin-top: 16px; }

@container (max-width: 1000px) { .modules { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (max-width: 900px) {
  .panel__reach, .panel__metrics, .panel__story, .act, .method { grid-column: 1 / -1; }
}
@container (max-width: 600px) {
  .page { padding: 64px 16px 72px; }
  .modules { grid-template-columns: 1fr; }
  .panel__num { font-size: 56px; line-height: 56px; }
  .bench-tab__base { display: none; }
}
`;

const panelScript = `
const DATA = ${JSON.stringify(DATA, null, 2)};
const panel = document.getElementById("bench-panel");
const tabsEl = [...document.querySelectorAll(".bench-tab")];
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const bar = (label, v, lead) => '<div class="bar"><div class="bar__head"><span class="bar__label">' + esc(label) + '</span><span class="bar__value">' + v + '%</span></div><div class="bar__track"><div class="bar__fill' + (lead ? ' is-lead' : '') + '" style="--v:' + v + '"></div></div></div>';
function render(i) {
  const b = DATA.benches[i];
  tabsEl.forEach((el, j) => { el.setAttribute("aria-selected", String(i === j)); el.tabIndex = i === j ? 0 : -1; });
  panel.setAttribute("aria-labelledby", "tab-" + b.key);
  panel.querySelector("[data-f=num]").textContent = b.users;
  panel.querySelector("[data-f=base]").textContent = "of " + DATA.base + " used " + b.name + " in the past month";
  const m = panel.querySelector("[data-f=metrics]");
  const opinion = b.appeal == null
    ? '<p class="panel__label">Appeal and trust among its users</p><p class="absent">Not reported as values in the analysis. The report describes Claude’s appeal and trust as strong among a small, self-selected group of ' + b.users + ' users.</p>'
    : '<p class="panel__label">Among its ' + b.users + ' users</p><div class="bars">' + bar("Find it somewhat or very appealing", b.appeal, true) + bar("Trust it somewhat or completely", b.trust) + '</div>';
  m.innerHTML = '<div>' + opinion + '</div><div><p class="panel__label">Why they choose it (share of its users)</p><div class="bars">' + b.reasons.map((r, j) => bar(j === 0 ? r.label + " · same on every bench" : r.label, r.pct, j === 0)).join("") + '</div></div>';
  panel.querySelector("[data-f=headline]").textContent = b.headline;
  panel.querySelector("[data-f=body]").textContent = b.body;
  const q = b.quote;
  panel.querySelector("[data-f=quote]").innerHTML = (q.lead ? esc(q.lead) + ' \\u201C' : '\\u201C') + esc(q.text) + '\\u201D';
  panel.querySelector("[data-f=source]").href = q.source;
  panel.querySelector("[data-f=job]").textContent = b.job;
}
tabsEl.forEach((el, i) => {
  el.addEventListener("click", () => { render(i); history.replaceState(null, "", "#bench=" + DATA.benches[i].key); document.dispatchEvent(new CustomEvent("bench", { detail: { index: i, from: "tabs" } })); });
  el.addEventListener("keydown", (e) => { const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return; e.preventDefault(); const j = (i + d + tabsEl.length) % tabsEl.length; tabsEl[j].focus(); tabsEl[j].click(); });
});
document.addEventListener("bench", (e) => { if (e.detail.from === "figure") render(e.detail.index); });
render(0);
// deep link: #bench=<key>
const fromHash = new URLSearchParams(location.hash.slice(1)).get("bench");
const hashIndex = DATA.benches.findIndex((b) => b.key === fromHash);
if (hashIndex >= 0) { tabsEl[hashIndex].click(); document.querySelector(".hero").scrollIntoView({ block: "start" }); }
${TIP_SCRIPT}
${viewToolsScript("window.WB")}
${playScript("window.WB", SCRIPTS)}
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
${cameraCardCss(".hero")}
${TIP_CSS}
${BLUEPRINT_CSS}
${TENSION_CSS}
${PLAY_CSS}
/* liquid layer stack: back SVG · canvas · front glass SVG (same box, same viewBox) */
.hero .iso-stage { position: relative; }
.hero .wb-gl, .hero .wb-front { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.hero .wb-front { overflow: hidden; }
.hero .iso-stage[data-gl] [data-fill] { opacity: var(--wb-fallback, 0); }
</style>
</head>
<body class="iso">
<header class="ll-header"><span class="ll-brand">Listen Labs /</span> <span class="ll-title">${esc(page.credit)}</span></header>
<main class="page">
  <!-- Intro -->${headerHtml(page)}

  <!-- Hero: the benches are the navigation -->
  <section class="hero" aria-label="Assistants">
    ${figure}
    <div class="bench-tabs" role="tablist" aria-label="Assistants">${tabs}
    </div>
    <div class="bench-panel" id="bench-panel" role="tabpanel" aria-live="polite">
      <div class="panel__reach">
        <p class="panel__label">Past-month reach</p>
        <p class="panel__num" data-f="num"></p>
        <p class="panel__base" data-f="base"></p>
      </div>
      <div class="panel__metrics" data-f="metrics"></div>
      <div class="panel__story">
        <h2 class="panel__headline" data-f="headline"></h2>
        <p class="panel__body" data-f="body"></p>
        <blockquote class="quote" style="margin-top:20px"><p data-f="quote"></p><footer>Participant · <a data-f="source" href="#" target="_blank" rel="noopener">Source</a></footer></blockquote>
        <p class="panel__job">The job ahead: <span data-f="job"></span></p>
      </div>
    </div>
  </section>

  <!-- Module grid -->
  <section class="modules" aria-label="Findings">
    <h2 class="modules__title">Across all participants</h2>${modules}
  </section>

  <!-- Closing -->
  <section class="closing">
    <div class="act"><h2>${t(page.actionsTitle)}</h2><ol>${actions}</ol></div>
    <div class="method">
      <h2>Read before sharing</h2>
      <ul>${notes}</ul>
      <p class="method__source">Source: <a href="${esc(spec.study.url)}" target="_blank" rel="noopener">${t(spec.study.title)}</a> · study ${esc(spec.study.id)} · n&nbsp;=&nbsp;${spec.study.n}</p>
    </div>
  </section>
</main>
<script type="module">
${(kitScript() + glScript() + live + panelScript).replace(/<\/(script)/gi, "<\\/$1")}
</script>
</body>
</html>`;
writeFileSync(outPath, html);
console.log("wrote", outPath);
