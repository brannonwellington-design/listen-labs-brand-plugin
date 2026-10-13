// Stadium page: header, the stadium figure with an act switch, a rail of blocks / hopes / the selected detail, method.
// usage: node pages/stadium.mjs <spec.json> <out.html>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const ANATOMY = new URL("..", import.meta.url).pathname;
const k = await import(join(ANATOMY, "kit/iso-kit.mjs"));
const { kitScript } = await import(join(ANATOMY, "scripts/inline-kit.mjs"));
const { LL_TOKENS, esc, curly, t, headerHtml, HEADER_CSS, cameraCardCss, viewToolsHtml, viewToolsScript, titleBlockHtml, BLUEPRINT_CSS, TENSION_CSS, PLAY_CSS, captionHtml, playScript } = await import("./shared.mjs");
const [specPath, outPath] = process.argv.slice(2);
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const obj = await import("../objects/stadium.mjs");
// the tension prints numbers computed from the coding at build time; refuse to build if any is missing a digit
if (spec.tension) {
  if (!spec.tension.numbers.every((s) => /\d/.test(s))) throw new Error("tension numbers must state a number");
  spec.__tension = { label: curly(spec.tension.label), act: spec.tension.act, numbers: spec.tension.numbers.map((text) => ({ text })) };
}
const { svg, live } = obj.build(spec);
// scripts arrive resolved from the spec builder (numbers computed from the coding); refuse literal titles with digits
const SCRIPTS = Object.fromEntries(Object.entries(spec.scripts || {}).map(([key, sc]) => [key, { key, title: sc.title, label: sc.label, beats: sc.beats.map((b, i) => {
  if (/\d/.test(b.title || "")) throw new Error(`script ${key} beat ${i}: a title may not carry numbers`);
  return { ...b, kicker: b.act ? spec.acts.find((a) => a.key === b.act).when : "", title: curly(b.title || ""), caption: b.caption ? { text: curly(b.caption) } : null, quote: b.quote ? { ...b.quote, quote: curly(b.quote.quote) } : null, sub: null };
}) }]));
const skin = readFileSync(new URL("../skin/ll-skin.css", import.meta.url), "utf8");
const N = spec.study.n;

const actButtons = spec.acts.map((a, i) => `<button class="act-btn" type="button" role="radio" aria-checked="${i === spec.acts.length - 1}" data-act="${i}"><span class="act-btn__when">${t(a.when)}</span> ${t(a.name)}</button>`).join("");
const follow = `<select class="fig-play fig-follow" aria-label="Follow one fan"><option value="">Follow…</option>${spec.fans.map((f, i) => `<option value="${i}">Follow ${f.label}</option>`).join("")}</select>`;
const figure = k.plateHtml({
  fig: spec.figure.fig + " · " + spec.figure.title, title: "", hint: spec.figure.hint, readout: "", caption: curly(spec.figure.caption),
  body: `${viewToolsHtml(SCRIPTS, follow)}${captionHtml()}${titleBlockHtml(spec.figure.titleBlock, esc)}<div class="iso-stage" data-stadium tabindex="0" aria-label="${esc(spec.figure.title)}: click a fan, block or stage prop; arrow keys move between blocks; 1 and 2 switch acts">${svg}</div>`,
});

const DATA = {
  n: N,
  acts: spec.acts.map(({ key, name, when, up, report, code, dressing }) => ({ key, name, when, up, report, code, dressing, asked: spec.fans.filter((f) => f.feel[key]).length })),
  blocks: spec.blocks.map((b, i) => ({ key: b.key, name: b.name, scale: b.scale, size: b.fans.length, stats: spec.blockStats[i] })),
  hopes: spec.hopes.map(({ key, name, propName, count, base, quote }) => ({ key, name, prop: propName, count, base, quote })),
  segNote: spec.page.segmentNote || "",
  fans: spec.fans.map(({ label, block, segValue, feel, hopes, evidence, complete }) => ({ label, block, segValue, feel, hopes, complete, evidence: Object.fromEntries(Object.entries(evidence).map(([k2, e]) => [k2, { quote: curly(e.quote), source: e.source }])) })),
};
const notes = spec.page.notes.map((n) => `<li>${t(n)}</li>`).join("");

const panelScript = `
const DATA = ${JSON.stringify(DATA)};
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const FEEL = { positive: "on their feet", neutral: "seated, neutral", negative: "seated, negative" };
const quoteHtml = (q, who) => q ? '<blockquote class="quote"><p>\\u201C' + esc(q.quote) + '\\u201D</p><footer>' + esc(who || q.who) + ' · <a href="' + q.source + '" target="_blank" rel="noopener">Source</a></footer></blockquote>' : "";
const actBtns = [...document.querySelectorAll(".act-btn")];
const followSel = $(".fig-follow");
function render(d) {
  const a = DATA.acts[d.act];
  actBtns.forEach((b, i) => b.setAttribute("aria-checked", String(i === d.act)));
  $("[data-r=act-name]").textContent = a.when + " · " + a.name;
  $("[data-r=act-num]").textContent = a.up;
  $("[data-r=act-base]").textContent = "of " + a.asked + (a.asked < DATA.n ? " asked (" + (DATA.n - a.asked) + " never reached the question)" : "") + " on their feet";
  $("[data-r=act-report]").textContent = "The report: " + a.report.count + " of " + a.report.base + " positive.";
  $("[data-r=blocks]").innerHTML = DATA.blocks.map((b, i) => { const s = b.stats[a.key]; return '<button class="row-btn" type="button" data-block="' + i + '" aria-pressed="' + (d.block === i) + '"><span class="row-btn__name">' + b.name + ' <span class="row-btn__scale">' + b.scale + '</span></span><span class="row-btn__count">' + s.positive + '<span class="row-btn__base">/' + b.size + '</span></span><span class="row-btn__bar" aria-hidden="true">' + Array.from({ length: b.size }, (_, j) => '<i' + (j < s.positive ? " data-on" : "") + '></i>').join("") + '</span></button>'; }).join("");
  const hopesOn = a.dressing === "hopes";
  $("[data-r=hopes-wrap]").hidden = !hopesOn;
  if (hopesOn) $("[data-r=hopes]").innerHTML = DATA.hopes.map((h, i) => '<button class="row-btn" type="button" data-hope="' + i + '" aria-pressed="' + (d.hope === i) + '"><span class="row-btn__name">' + h.name + ' <span class="row-btn__scale">' + h.prop + '</span></span><span class="row-btn__count">' + h.count + '<span class="row-btn__base">/' + h.base + '</span></span></button>').join("");
  followSel.value = d.follow == null ? "" : String(d.follow);
  // detail: the followed fan, else the selected hope, else the selected block
  const det = $("[data-r=detail]");
  if (d.follow != null) {
    const f = DATA.fans[d.follow], b = DATA.blocks.find((x) => x.key === f.block);
    const parts = DATA.acts.map((x) => { const v = f.feel[x.key], e = f.evidence[x.code]; return '<div class="fan-act' + (x.key === a.key ? " is-now" : "") + '"><p class="detail__k">' + x.when + ' · ' + x.name + ': ' + (v ? FEEL[v] : "never asked") + '</p>' + quoteHtml(e, f.label) + '</div>'; }).join("");
    const hopes = f.hopes.length ? '<p class="detail__k">Hoped for: ' + f.hopes.map((k) => DATA.hopes.find((h) => h.key === k).name.toLowerCase()).join(", ") + '</p>' : "";
    det.innerHTML = '<p class="detail__title">' + f.label + ' · ' + b.name + (DATA.segNote ? ' (' + DATA.segNote.replace("{value}", f.segValue) + ')' : '') + (f.complete ? "" : " · partial interview") + '</p>' + parts + hopes + '<button class="link-btn" type="button" data-unfollow>Back to everyone</button>';
  } else if (d.hope != null && hopesOn) {
    const h = DATA.hopes[d.hope];
    det.innerHTML = '<p class="detail__num">' + h.count + '</p><p class="detail__base">of ' + h.base + ' hoped for ' + h.name.toLowerCase() + '</p><p class="detail__k">On stage: the ' + h.prop.toLowerCase() + '. Hopes are multi-mention, so they add up to more than ' + h.base + '.</p>' + quoteHtml(h.quote);
  } else if (d.block != null) {
    const b = DATA.blocks[d.block], s = b.stats[a.key];
    det.innerHTML = '<p class="detail__num">' + s.positive + '</p><p class="detail__base">of ' + b.size + ' ' + b.name.toLowerCase() + ' (' + b.scale + ') on their feet for ' + a.name + '</p><p class="detail__k">' + s.neutral + ' seated and neutral · ' + s.negative + ' seated and negative' + (s.none ? ' · ' + s.none + ' never asked' : "") + '</p>' + quoteHtml(s.quote);
  } else det.innerHTML = '<p class="detail__k">Click a block, a stage prop or a fan in the drawing, or pick a row above.</p>';
}
document.addEventListener("stadium", (e) => render(e.detail));
actBtns.forEach((b) => b.addEventListener("click", () => STAD.setAct(+b.dataset.act)));
document.addEventListener("click", (e) => {
  const bl = e.target.closest("[data-block]"), ho = e.target.closest("[data-hope]");
  if (bl) STAD.selectBlock(+bl.dataset.block === STAD.block ? null : +bl.dataset.block);
  if (ho) STAD.selectHope(+ho.dataset.hope);
  if (e.target.closest("[data-unfollow]")) STAD.follow(null);
});
followSel.addEventListener("change", () => STAD.follow(followSel.value === "" ? null : +followSel.value));
render({ act: STAD.act, block: null, hope: null, follow: null });
`;

const css = `
${LL_TOKENS}
${k.ISO_CSS}
${skin}
${HEADER_CSS}
${cameraCardCss(".ws-figure")}
${BLUEPRINT_CSS}
${TENSION_CSS}
${PLAY_CSS}
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--surface-primary); color: var(--content-primary); font-family: 'Inter', 'Helvetica Neue', Arial, system-ui, sans-serif; font-weight: 400; -webkit-font-smoothing: antialiased; }
body.iso { --anatomy-page: var(--surface-primary); }
a { color: var(--content-brand); text-underline-offset: 3px; }
:focus-visible { outline: 2px solid var(--content-brand); outline-offset: 2px; border-radius: 4px; }
.page { max-width: var(--maxw); margin: 0 auto; padding: 72px var(--margin) 96px; container-type: inline-size; }
.ws-figure { container-type: inline-size; }
.ll-header { position: absolute; top: 24px; left: 0; right: 0; text-align: center; font-size: 12px; line-height: 16px; }
.ll-brand { color: var(--content-secondary); } .ll-title { color: var(--content-primary); }
h1, h2, h3 { font-weight: 400; margin: 0; text-wrap: balance; }
p { margin: 0; text-wrap: pretty; }
.workspace { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--gutter); align-items: start; overflow-x: clip; margin-top: 48px; }
.ws-figure { grid-column: 1 / span 8; position: sticky; top: 24px; min-width: 0; }
.ws-figure .iso-figure { margin: 0; }
.ws-figure .iso-legend { font-size: 12px; line-height: 16px; }
.ws-rail { grid-column: 9 / -1; min-width: 0; display: grid; gap: 28px; }
/* scoreboard cells: one per interview; lit = on their feet */
.sb-cell { fill: var(--anatomy-lo); stroke: none; }
.sb-cell[data-on] { fill: var(--anatomy-accent, var(--content-brand)); }
/* act switch */
.acts { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px; border-radius: 12px; background: var(--surface-secondary); }
.act-btn { appearance: none; font: inherit; font-size: 14px; line-height: 20px; min-height: 52px; border: 0; border-radius: 8px; background: transparent; color: var(--content-secondary); cursor: pointer; text-align: left; padding: 6px 12px; }
.act-btn__when { display: block; font-size: 12px; line-height: 16px; }
.act-btn[aria-checked="true"] { background: var(--surface-highlight); color: var(--content-primary); border: 1px solid var(--surface-tertiary); }
.act-num { font-size: 56px; line-height: 56px; font-variant-numeric: tabular-nums; color: var(--content-brand); }
.act-base { font-size: 14px; line-height: 20px; color: var(--content-secondary); margin-top: 4px; }
.act-name { font-size: 14px; line-height: 20px; color: var(--content-secondary); margin-bottom: 8px; }
.act-report { font-size: 12px; line-height: 16px; color: var(--content-secondary); margin-top: 8px; }
.rail-h { font-size: 12px; line-height: 16px; color: var(--content-secondary); margin-bottom: 8px; }
.rows { display: grid; border-top: 1px solid var(--content-disabled); }
.row-btn { appearance: none; background: none; border: 0; border-bottom: 1px solid var(--content-disabled); border-left: 2px solid transparent; cursor: pointer; font: inherit; color: var(--content-secondary);
  text-align: left; padding: 8px 12px; min-height: 44px; display: grid; grid-template-columns: 1fr auto; gap: 4px 12px; align-items: baseline; }
.row-btn__name { font-size: 14px; line-height: 20px; color: var(--content-primary); }
.row-btn__scale { font-size: 12px; color: var(--content-secondary); }
.row-btn__count { font-size: 18px; line-height: 24px; font-variant-numeric: tabular-nums; color: var(--content-primary); }
.row-btn__base { font-size: 12px; color: var(--content-secondary); }
.row-btn__bar { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 2px; }
.row-btn__bar i { width: 6px; height: 6px; border-radius: 1px; background: var(--content-disabled); }
.row-btn__bar i[data-on] { background: var(--content-brand); }
.row-btn[aria-pressed="true"] { border-left-color: var(--content-brand); background: var(--surface-highlight); }
.detail { display: grid; gap: 12px; border-top: 1px solid var(--content-disabled); padding-top: 16px; }
.detail__title { font-size: 16px; line-height: 24px; }
.detail__num { font-size: 40px; line-height: 44px; font-variant-numeric: tabular-nums; }
.detail__base { font-size: 14px; line-height: 20px; color: var(--content-secondary); }
.detail__k { font-size: 14px; line-height: 20px; color: var(--content-secondary); }
.fan-act { display: grid; gap: 8px; } .fan-act.is-now .detail__k { color: var(--content-primary); }
.quote { margin: 0; padding-left: 14px; border-left: 2px solid var(--content-brand); }
.quote p { font-size: 16px; line-height: 24px; }
.quote footer { margin-top: 8px; font-size: 13px; line-height: 20px; color: var(--content-secondary); }
.link-btn { appearance: none; font: inherit; font-size: 14px; background: none; border: 0; padding: 0; color: var(--content-brand); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; min-height: 44px; justify-self: start; }
.method { margin-top: 72px; max-width: 760px; }
.method h2 { font-size: 20px; line-height: 28px; margin-bottom: 16px; }
.method ul { margin: 0; padding-left: 18px; display: grid; gap: 10px; font-size: 14px; line-height: 20px; color: var(--content-secondary); }
.method__source { margin-top: 16px; font-size: 13px; color: var(--content-secondary); }
@media (max-width: 960px) {
  .workspace { display: block; }
  .ws-figure { position: static; }
  .ws-rail { margin-top: 24px; }
}
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(spec.study.title)} · stadium</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body class="iso">
<header class="ll-header"><span class="ll-brand">Listen Labs</span> / <span class="ll-title">${t(spec.study.title)}</span></header>
<main class="page">
  ${headerHtml(spec.page)}
  <section class="workspace">
    <div class="ws-figure">${figure}</div>
    <aside class="ws-rail" aria-label="Stadium controls">
      <div>
        <div class="acts" role="radiogroup" aria-label="Which act is on stage">${actButtons}</div>
      </div>
      <div>
        <p class="act-name" data-r="act-name"></p>
        <p class="act-num" data-r="act-num"></p>
        <p class="act-base" data-r="act-base"></p>
        <p class="act-report" data-r="act-report"></p>
      </div>
      <div>
        <p class="rail-h">${t(spec.page.blocksHeading)}</p>
        <div class="rows" data-r="blocks"></div>
      </div>
      <div data-r="hopes-wrap">
        <p class="rail-h">${t(spec.page.hopesHeading)}</p>
        <div class="rows" data-r="hopes"></div>
      </div>
      <div class="detail" data-r="detail" aria-live="polite"></div>
    </aside>
  </section>
  <section class="method">
    <h2>Read before sharing</h2>
    <ul>${notes}</ul>
    <p class="method__source">Source: <a href="${esc(spec.study.url)}" target="_blank" rel="noopener">${t(spec.study.title)}</a> · Listen Labs study ${esc(spec.study.id)} · n&nbsp;=&nbsp;${N} coded</p>
  </section>
</main>
<script type="module">
${(kitScript() + live + viewToolsScript("STAD") + playScript("STAD", SCRIPTS) + panelScript).replace(/<\/(script)/gi, "<\\/$1")}
</script>
</body>
</html>`;
writeFileSync(outPath, html);
console.log("wrote", outPath);
