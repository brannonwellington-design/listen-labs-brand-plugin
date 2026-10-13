// Scene bundle: everything another skill needs to place a scene, from one spec, plus a manifest that describes it.
// /research-artifacts and /report read embed.html; /pptx reads stills/ and the beats in manifest.json; /video and
// decks can use tour.mp4. Every caption, number and quote in the manifest is the spec's own (computed from the
// coding, verbatim with sources), so a host can set them as live text without retyping anything.
//
// usage: node tools/bundle.mjs <object[@world]> <spec.json> <out dir> --share internal|shareable [--script tour]
//        [--video] [--theme light|dark]
//
// <out dir>/
//   embed.html       the figure card, its styles and script: paste once into a Listen Labs page (needs brand tokens)
//   preview.html     embed.html on a bare branded page, to open and to QA
//   stage.html       the 16:9 frame the recorder films
//   stills/          per tour beat: beat-NN.png (16:9 slide), figure-NN.png and figure-NN.svg (drawing alone)
//   tour.mp4         with --video
//   manifest.json    files, study, base, sharing, alt text, API and controls, and every beat's copy and quote
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const [objArg, specPath, out] = args;
const share = opt("--share", null);
if (!objArg || !specPath || !out || !["internal", "shareable"].includes(share)) {
  console.error("usage: node tools/bundle.mjs <object[@world]> <spec.json> <out dir> --share internal|shareable [--script tour] [--video]");
  process.exit(2);
}
const script = opt("--script", "tour"), theme = opt("--theme", "light");
const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = join(HERE, "..");
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const { buildScene, fragment } = await import(join(ROOT, "pages/scene.mjs"));
const { LL_TOKENS, curly } = await import(join(ROOT, "pages/shared.mjs"));
mkdirSync(join(out, "stills"), { recursive: true });

// 1. embed + preview
const scene = await buildScene(objArg, spec, { mode: "embed" });
const embed = fragment(scene);
writeFileSync(join(out, "embed.html"), embed);
writeFileSync(join(out, "preview.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${spec.study.title} · scene preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
<style>${LL_TOKENS}
*{box-sizing:border-box} html,body{margin:0;background:var(--surface-primary);color:var(--content-primary);font-family:'Inter','Helvetica Neue',Arial,system-ui,sans-serif;font-weight:400}
body.iso{--anatomy-page:var(--surface-primary)} .wrap{max-width:960px;margin:0 auto;padding:48px 24px}</style></head>
<body class="iso"><main class="wrap">${embed}</main></body></html>`);

// 2. stage + stills (+ video), on the recorder's virtual clock
const node = (file, a) => { const r = spawnSync(process.execPath, [join(ROOT, file), ...a], { encoding: "utf8", timeout: 900000 }); if (r.status) { console.error(r.stdout + r.stderr); process.exit(1); } return r.stdout; };
node("pages/stage.mjs", [objArg, specPath, join(out, "stage.html")]);
const hasScript = Object.keys(scene.scripts || {}).includes(script);
if (hasScript) {
  node("tools/record.mjs", [join(out, "stage.html"), "--script", script, "--stills", join(out, "stills"), "--figures", "--scale", "2", "--theme", theme, ...(args.includes("--video") ? ["--out", join(out, "tour.mp4")] : ["--stills-only"])]);
}

// 3. manifest
const figureSize = (file) => { if (!existsSync(file)) return null; const root = readFileSync(file, "utf8").match(/<svg[^>]*>/)[0]; return [+root.match(/ width="(\d+)/)[1], +root.match(/ height="(\d+)/)[1]]; };
const sc = scene.scripts[script];
const nn = (i) => String(i + 1).padStart(2, "0");
const manifest = {
  scene: scene.objName, world: spec.__world || null,
  study: { id: spec.study.id, title: spec.study.title, url: spec.study.url, n: spec.study.n },
  sharing: share,   // internal: local files only, never published, quotes never copied elsewhere
  requires: ["Listen Labs brand tokens on the host page (docs/tokens.css)", "a single scene per page (one window." + scene.API + ")"],
  alt: curly(spec.figure.label), caption: curly(spec.figure.caption), title: spec.figure.title,
  api: { global: scene.API, scene: "window." + scene.API + ".scene({ … })", controls: scene.controls.map(({ kind, label, call, get }) => ({ kind, label, call, get })) },
  files: {
    embed: "embed.html", preview: "preview.html", stage: "stage.html",
    video: existsSync(join(out, "tour.mp4")) ? "tour.mp4" : null,
  },
  tour: hasScript ? {
    key: script, title: sc.title,
    beats: sc.beats.map((b, i) => ({
      n: i + 1, hold: b.hold, kicker: b.kicker || "", title: b.title || "", caption: b.caption?.text || "",
      quote: b.quote ? { text: b.quote.quote, who: b.quote.who, source: b.quote.source } : null,
      slide: `stills/beat-${nn(i)}.png`, figurePng: `stills/figure-${nn(i)}.png`, figureSvg: `stills/figure-${nn(i)}.svg`,
      figureSize: figureSize(join(out, `stills/figure-${nn(i)}.svg`)),
      // labels drawn over the drawing (a follow pin, blueprint callouts, the tension card) exist only in the PNGs
      overlay: (b.follow != null && b.follow >= 0) || !!b.tension || !!(b.view && (b.view.blueprint || b.view.apart)),   // [width, height] in px: hosts size the image without parsing it
    })),
  } : null,
  facts: scene.obj.facts ? scene.obj.facts(spec) : [],   // { key, value, base, label, group, scene }: set as stat modules; scene() shows each one
  notes: (spec.page?.notes || []).map(curly),
  footer: `n = ${spec.study.n} · ${spec.study.title} · Listen Labs study ${spec.study.id}`,
};
writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`bundle: ${resolve(out)}\n  embed.html · preview.html · stage.html${manifest.tour ? ` · stills for ${manifest.tour.beats.length} beats` : " · no tour (no stills)"}${manifest.files.video ? " · tour.mp4" : ""} · manifest.json (sharing: ${share})`);
