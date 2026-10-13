// Dev check: render the conveyor with declared and depth-sorted painter order at several azimuths and write
// standalone pages for a pixel diff. usage: node tools/dev/pixel-sort.mjs <spec.json> <outdir>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const k = await import(new URL("../../kit/iso-kit.mjs", import.meta.url).href);
const [specPath, out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const skin = readFileSync(new URL("../../skin/ll-skin.css", import.meta.url), "utf8");
const NEW = ["engine/compose.js", "props/machine.js", "worlds/conveyor.world.js"].map((f) => readFileSync(new URL("../../" + f, import.meta.url), "utf8")).join("\n");
const geo = new Function("k", "spec", "P", "opts", NEW + "\nreturn conveyorGeometry(k, spec, P, opts);");
for (const az of (process.argv[4] || "60,30,90").split(",").map(Number)) for (const sort of ["declared", "depth"]) {
  const P = k.fitProjection([[-230, -60, -15], [260, 90, 90]], 1360, 920, { pad: 20, azimuth: az });
  const g = geo(k, spec, P, { sort });
  writeFileSync(`${out}/az${az}-${sort}.html`, `<!doctype html><meta charset=utf-8><style>${k.ISO_CSS}${skin} html,body{margin:0;background:#fff}</style><div class="iso-plate" style="padding:0;border:0;border-radius:0"><svg class="iso" viewBox="0 0 1360 920" width="1360" height="920">${g.body}</svg></div>`);
}
