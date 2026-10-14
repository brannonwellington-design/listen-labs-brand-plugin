// Generic scene page: works for any scene object that declares the scene contract. Header from spec.page, the scene
// from the shared builder, a rail of the object's facts (each one shows itself in the scene), the tour's quotes, and
// the method notes. A new pattern or world gets a finished page with no page code of its own.
// usage: node pages/scene-page.mjs <object[@world]> <spec.json> <out.html>
import { readFileSync, writeFileSync } from "node:fs";
const S = await import("./shared.mjs");
const { buildScene } = await import("./scene.mjs");
const [objArg, specPath, outPath] = process.argv.slice(2);
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const scene = await buildScene(objArg, spec, { mode: "page" });
const { esc, t, curly } = S;
const facts = scene.obj.facts ? scene.obj.facts(spec) : [];
const groups = [...new Set(facts.map((f) => f.group))];
const quotes = Object.values(scene.scripts || {}).flatMap((sc) => sc.beats).filter((b) => b.quote).filter((b, i, a) => a.findIndex((x) => x.quote.source === b.quote.source) === i);

const rail = groups.map((g) => `<section class="rg"><p class="rail-h">${t(g)}</p><div class="rows">${facts.filter((f) => f.group === g).map((f) => `
  <button class="row-btn" type="button" data-scene='${esc(JSON.stringify(f.scene))}' aria-pressed="false"><span class="row-btn__name">${t(f.label)}</span><span class="row-btn__count">${f.value ?? "–"}<span class="row-btn__base">/${f.base}</span></span></button>`).join("")}</div></section>`).join("");
const quoteHtml = quotes.map((b) => `<blockquote class="quote"><p>${t("“" + b.quote.quote + "”")}</p><footer>${esc(b.quote.who)} · ${t(b.title)} · <a href="${esc(b.quote.source)}" target="_blank" rel="noopener">Source</a></footer></blockquote>`).join("");

const css = `${S.LL_TOKENS}
${S.HEADER_CSS}
${scene.css}
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--surface-primary); color: var(--content-primary); font-family: 'Inter', 'Helvetica Neue', Arial, system-ui, sans-serif; font-weight: 400; -webkit-font-smoothing: antialiased; }
body.iso { --anatomy-page: var(--surface-primary); }
a { color: var(--content-brand); text-underline-offset: 3px; }
:focus-visible { outline: 2px solid var(--content-brand); outline-offset: 2px; border-radius: 4px; }
.page { max-width: var(--maxw); margin: 0 auto; padding: 72px var(--margin) 96px; container-type: inline-size; }
.ll-header { position: absolute; top: 24px; left: 0; right: 0; text-align: center; font-size: 12px; line-height: 16px; }
.ll-brand { color: var(--content-secondary); } .ll-title { color: var(--content-primary); }
h1, h2 { font-weight: 400; margin: 0; text-wrap: balance; } p { margin: 0; text-wrap: pretty; }
.workspace { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--gutter); align-items: start; margin-top: 48px; }
.ws-figure { grid-column: 1 / span 8; position: sticky; top: 24px; min-width: 0; }
.ws-rail { grid-column: 9 / -1; min-width: 0; display: grid; gap: 24px; }
.rail-h { font-size: 12px; line-height: 16px; color: var(--content-secondary); margin-bottom: 8px; }
.rows { display: grid; border-top: 1px solid var(--content-disabled); }
.row-btn { appearance: none; background: none; border: 0; border-bottom: 1px solid var(--content-disabled); border-left: 2px solid transparent; cursor: pointer; font: inherit; text-align: left; padding: 8px 12px; min-height: 44px; display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: baseline; color: var(--content-primary); }
.row-btn__name { font-size: 14px; line-height: 20px; }
.row-btn__count { font-size: 18px; line-height: 24px; font-variant-numeric: tabular-nums; }
.row-btn__base { font-size: 12px; color: var(--content-secondary); }
.row-btn[aria-pressed="true"] { border-left-color: var(--content-brand); background: var(--surface-highlight); }
.voices { margin-top: 64px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
.voices h2, .method h2 { font-size: 20px; line-height: 28px; grid-column: 1 / -1; }
.quote { margin: 0; padding-left: 14px; border-left: 2px solid var(--content-brand); }
.quote p { font-size: 16px; line-height: 24px; } .quote footer { margin-top: 8px; font-size: 13px; line-height: 20px; color: var(--content-secondary); }
.method { margin-top: 64px; max-width: 760px; } .method h2 { margin-bottom: 16px; }
.method ul { margin: 0; padding-left: 18px; display: grid; gap: 10px; font-size: 14px; line-height: 20px; color: var(--content-secondary); }
.method__source { margin-top: 16px; font-size: 13px; color: var(--content-secondary); }
@container (max-width: 960px) { .ws-figure, .ws-rail { grid-column: 1 / -1; } .ws-figure { position: static; } .ws-rail { margin-top: 24px; } }
`;
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(spec.study.title)} · scene</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
<style>${css}</style></head>
<body class="iso">
<header class="ll-header"><span class="ll-brand">Listen Labs</span> / <span class="ll-title">${t(spec.study.title)}</span></header>
<main class="page">
  ${S.headerHtml(spec.page)}
  <section class="workspace">
    <div class="ws-figure">${scene.markup}</div>
    <aside class="ws-rail" aria-label="Findings">${rail}</aside>
  </section>
  ${quoteHtml ? `<section class="voices"><h2>In their words</h2>${quoteHtml}</section>` : ""}
  <section class="method"><h2>Read before sharing</h2><ul>${(spec.page.notes || []).map((n) => `<li>${t(n)}</li>`).join("")}</ul>
    <p class="method__source">Source: ${t(spec.study.title)} · Listen Labs study ${esc(spec.study.id)} · n&nbsp;=&nbsp;${spec.study.n} coded</p></section>
</main>
<script type="module">
${(scene.js + `
const rows = [...document.querySelectorAll(".row-btn")];
rows.forEach((b) => b.addEventListener("click", () => { window.${scene.API}.scene(JSON.parse(b.dataset.scene)); rows.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
`).replace(/<\/(script)/gi, "<\\/$1")}
</script>
</body></html>`;
writeFileSync(outPath, html);
console.log("wrote", outPath);
