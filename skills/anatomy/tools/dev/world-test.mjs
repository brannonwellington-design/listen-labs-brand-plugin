// Dev: render a world's static geometry at several azimuths to standalone pages (for screenshots and line checks).
// usage: node tools/dev/world-test.mjs <world> <outdir> [az,az,...] [--theme light|dark] [--opts '{"seated":56}']
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const k = await import(new URL("../../kit/iso-kit.mjs", import.meta.url).href);
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const [world, out, azs = "60"] = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
const theme = opt("--theme", "light"), o = JSON.parse(opt("--opts", "{}"));
const FILES = { stadium: ["engine/compose.js", "engine/primitives.js", "props/stage.js", "worlds/stadium.world.js"] }[world];
const SPEC = opt("--spec") ? JSON.parse(readFileSync(opt("--spec"), "utf8")) : {};
const src = FILES.map((f) => readFileSync(new URL("../../" + f, import.meta.url), "utf8")).join("\n");
const geo = new Function("k", "spec", "P", "o", src + `\nreturn ${world}Geometry(k, spec, P, o);`);
const skin = readFileSync(new URL("../../skin/ll-skin.css", import.meta.url), "utf8");
mkdirSync(out, { recursive: true });
const W = 1200, H = 760;
for (const az of azs.split(",").map(Number)) {
  const P = k.fitProjection([[-200, -150, -8], [200, 150, -8], [-200, 150, 50], [200, -150, 50]], W, H, { pad: 20, azimuth: az, elevation: Number(opt("--el", 30)) });
  const t0 = performance.now();
  const g = geo(k, SPEC, P, o);
  const ms = (performance.now() - t0).toFixed(0);
  writeFileSync(`${out}/${world}-az${az}.html`, `<!doctype html><html data-theme="${theme}"><meta charset=utf-8><style>${k.ISO_CSS}${skin} html,body{margin:0;background:var(--paper, #fff)}</style><body data-theme="${theme}"><div class="iso-plate" style="padding:0;border:0;border-radius:0"><svg class="iso" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${g.body}</svg></div>`);
  console.log(`az ${az}: ${(g.body.length / 1024).toFixed(0)} KB svg, built in ${ms} ms`);
}
