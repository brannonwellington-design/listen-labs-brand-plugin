// Stage: a 1280×720 frame for one object and its scripts — what the recorder films for video, slides and posters.
// The figure takes the left, the caption column the right; the credit, n and study id are always on screen.
// Open it in a browser with #play=<script> to preview; tools/record.mjs drives it on a virtual clock.
// usage: node pages/stage.mjs <object> <spec.json> <out.html> [--api CONV] [--stage data-conveyor]
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const ANATOMY = new URL("..", import.meta.url).pathname;
const k = await import(join(ANATOMY, "kit/iso-kit.mjs"));
const { kitScript, glScript } = await import(join(ANATOMY, "scripts/inline-kit.mjs"));
const { applyWorld, LL_TOKENS, esc, cameraCardCss, titleBlockHtml, BLUEPRINT_CSS, resolveScripts, captionHtml, playScript, PLAY_CSS, resolveTension, TENSION_CSS } = await import("./shared.mjs");

const args = process.argv.slice(2);
const [objArg, specPath, outPath] = args;
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const objName = applyWorld(objArg, spec);
const opt = (name, d) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : d; };
const API = opt("--api", { conveyor: "CONV", workbench: "WB", sortbench: "BENCH" }[objName]);
const HOOK = opt("--stage", { conveyor: "data-conveyor", workbench: "data-workbench", sortbench: "data-bench" }[objName]);
const SCRIPTS = resolveScripts(spec);
const obj = await import(`../objects/${objName}.mjs`);
spec.__tension = resolveTension(spec, obj.TENSION_EVENTS || []);   // fails the build unless its numbers resolve
const { svg, live } = obj.build(spec);
const skin = readFileSync(new URL("../skin/ll-skin.css", import.meta.url), "utf8");
const page = spec.page;
const N = spec.study.n;

const figure = k.plateHtml({
  fig: "", title: "", hint: "", readout: "",
  body: `${titleBlockHtml(spec.figure.titleBlock, esc)}<div class="iso-stage" ${HOOK} tabindex="-1" role="img" aria-label="${esc(spec.figure.title)}">${svg}</div>`,
});

const CSS = `
*,*::before,*::after { box-sizing: border-box; }
html, body { margin: 0; width: 1280px; height: 720px; overflow: hidden; background: var(--surface-primary); }
body { font-family: 'Inter', 'Helvetica Neue', Arial, system-ui, sans-serif; font-weight: 400; color: var(--content-primary); -webkit-font-smoothing: antialiased; container-type: inline-size; }
body.iso { --anatomy-page: var(--surface-primary); }
p, h1, h2, blockquote, ol, dl { margin: 0; }
.st .tension { width: min(340px, 44%); }
.st { position: relative; width: 1280px; height: 720px; }
.st__credit { position: absolute; left: 40px; top: 32px; font-size: 16px; line-height: 24px; }
.st__credit span { color: var(--content-secondary); }
.st__fig { position: absolute; left: 40px; top: 80px; width: 820px; }
.st__fig .iso-figure { margin: 0; }
.st__fig .iso-plate-corner[data-corner="fig"], .st__fig .iso-plate-corner[data-corner="title"], .st__fig .iso-plate-corner[data-corner="hint"] { display: none; }
.st__side { position: absolute; left: 900px; top: 80px; width: 340px; bottom: 96px; display: flex; flex-direction: column; justify-content: center; }
.st .cap { position: static; width: auto; padding: 0; background: none; box-shadow: none; gap: 12px; font-size: 20px; line-height: 28px; }
.st .cap__head { font-size: 14px; line-height: 20px; }
.st .cap__stop { display: none; }
.st .cap__title { font-size: 28px; line-height: 36px; }
.st .cap__sub { font-size: 16px; line-height: 24px; }
.st .cap__quote { padding-left: 14px; }
.st .cap__quote p { font-size: 18px; line-height: 26px; -webkit-line-clamp: 5; }
.st .cap__quote footer { font-size: 13px; line-height: 18px; }
.st .cap__bar { display: none; }
/* fit: when a beat carries more text than the column holds, step the type down (never clip a quote's source) */
.st__side[data-fit="1"] .cap { font-size: 18px; line-height: 26px; } .st__side[data-fit="1"] .cap__title { font-size: 24px; line-height: 32px; }
.st__side[data-fit="1"] .cap__quote p { font-size: 16px; line-height: 24px; }
.st__side[data-fit="2"] .cap { font-size: 16px; line-height: 24px; gap: 8px; } .st__side[data-fit="2"] .cap__title { font-size: 22px; line-height: 28px; }
.st__side[data-fit="2"] .cap__sub, .st__side[data-fit="2"] .cap__quote p { font-size: 14px; line-height: 20px; }
.st__side[data-fit="3"] .cap { font-size: 15px; line-height: 22px; gap: 6px; } .st__side[data-fit="3"] .cap__title { font-size: 20px; line-height: 26px; }
.st__side[data-fit="3"] .cap__sub, .st__side[data-fit="3"] .cap__quote p { font-size: 13px; line-height: 18px; } .st__side[data-fit="3"] .cap__quote p { -webkit-line-clamp: 4; }
.st__foot { position: absolute; left: 40px; right: 40px; bottom: 32px; display: flex; justify-content: space-between; gap: 24px; font-size: 13px; line-height: 18px; color: var(--content-secondary); }
.st__bar { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: var(--surface-secondary); }
.st__bar i { display: block; height: 100%; background: var(--content-brand); transform-origin: 0 50%; transform: scaleX(0); }
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1280">
<meta name="color-scheme" content="light dark">
<title>${esc(page.htmlTitle)} · stage</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
<style>
${LL_TOKENS}
${k.ISO_CSS}
${skin}
${CSS}
${cameraCardCss(".st__fig")}
${BLUEPRINT_CSS}
${TENSION_CSS}
${PLAY_CSS}
${obj.STAGE_CSS || ""}
</style>
</head>
<body class="iso">
<div class="st">
  <p class="st__credit"><span>Listen Labs /</span> ${esc(page.credit)}</p>
  <div class="st__fig">${figure}</div>
  <aside class="st__side">${captionHtml()}</aside>
  <p class="st__foot"><span>n&nbsp;=&nbsp;${N} · ${esc(spec.study.title)}</span><span>Listen Labs study ${esc(spec.study.id)}</span></p>
  <div class="st__bar" aria-hidden="true"><i data-stage-bar></i></div>
</div>
<script type="module">
${(kitScript() + (/glLayer\(/.test(live) ? glScript() : "") + live + playScript("window." + API, SCRIPTS) + `
document.addEventListener("played", () => { window.__played = true; });
const bar = document.querySelector("[data-stage-bar]"), capBar = document.querySelector('[data-c="bar"]');
new MutationObserver(() => { bar.style.transform = capBar.style.transform; }).observe(capBar, { attributes: true, attributeFilter: ["style"] });
const side = document.querySelector(".st__side"), capEl = document.querySelector("[data-cap]");
function fit() { for (let f = 0; f <= 3; f++) { side.dataset.fit = String(f); if (capEl.scrollHeight <= side.clientHeight) return; } }
new MutationObserver(fit).observe(capEl, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["hidden"] });
`).replace(/<\/(script)/gi, "<\\/$1")}
</script>
</body>
</html>`;
writeFileSync(outPath, html);
console.log("wrote", outPath);
