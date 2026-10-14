// Prop bench: build every prop a file defines, in every variant it declares, check it, and draw a contact sheet for
// the visual review. This is the loop a generated prop goes through before any world uses it (references/props.md).
//
// usage: node tools/props/bench.mjs <props.js> [--prop <name>] [--out <dir>] [--zoom 2] [--no-shots]
//   --zoom draws every cell larger, for reviewing small details
//   --blind letters the rows (A, B, …) instead of naming them, and writes the answer key to <name>-blind-key.json: the sheet a
//           reviewer who has not seen the brief names cold (references/props.md, "The blind read")
//   <props.js> is a study's own props file (scenes/<slug>/props/*.js) or a library file (props/*.js).
//
// Checks, per prop and variant (exit 1 if any fails):
//   contract   build(c, { x, y, ...variant }) returns items (phase, 6-number bounds, svg) and a part { name, move, anchor }
//   footprint  the prop declares footprint [along x, along y] and its items stay inside it, centred on (x, y)
//   bounds     at four azimuths across the camera's range (30–80°), every item's drawing stays inside its projected bounds: a drawing that overflows its
//              bounds gets depth-sorted wrong next to other things
//   scale      height between 1 and 60 (a person is 7)
//   brand      no colours, fonts or inline styles in the markup: tones only (the skin colours them, light and dark)
//   lines      every texture line ends on something (scripts/lines.mjs on the light sheet, always at zoom 2)
// The sheet: each variant at four azimuths and once at the size a scene draws it, with a person in front and one behind for scale and occlusion, light and
// dark. Open the PNGs and review them against references/props.md before wiring the prop into a world.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname, basename, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = join(HERE, "..", "..");
const k = await import(join(ROOT, "kit/iso-kit.mjs"));
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const file = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
if (!file) { console.error("usage: node tools/props/bench.mjs <props.js> [--prop name] [--out dir] [--no-shots]"); process.exit(2); }
const blind = args.includes("--blind");
const only = opt("--prop", null), out = resolve(opt("--out", join(dirname(resolve(file)), "bench"))), shots = !args.includes("--no-shots");
mkdirSync(out, { recursive: true });

// the engine, then the file under test (so we know which props it defines), then the rest of the library, so a prop
// can build on library props
const read = (f) => readFileSync(join(ROOT, f), "utf8");
const target = readFileSync(resolve(file), "utf8");
const library = readdirSync(join(ROOT, "props")).filter((f) => f.endsWith(".js")).map((f) => join("props", f)).filter((f) => resolve(ROOT, f) !== resolve(file));
const env = new Function("k", `${read("engine/compose.js")}\n${read("engine/primitives.js")}
const before = new Set(Object.keys(PROPS));
${target}
const mine = Object.keys(PROPS).filter((n) => !before.has(n));
${library.map(read).join("\n")}
return { PROPS, PHASES, makeCtx, composeWorld, person, ground, mine };`)(k);
const names = env.mine.filter((n) => !only || n === only);
if (!names.length) { console.error(only ? `no prop "${only}" in ${file}` : `${file} defines no props`); process.exit(2); }

const ZOOM = Math.max(1, Number(opt("--zoom", 1)));
const AZ = [30, 45, 62, 80], CELL = [420 * ZOOM, 300 * ZOOM];
const VIEWS = [...AZ.map((az) => ({ az })), { az: 62, scene: true }];   // the camera's whole range (objects/camera.js keeps azimuth within 30–80°)
const fails = [], warns = [];
const fail = (n, msg) => fails.push(`${n}: ${msg}`), warn = (n, msg) => warns.push(`${n}: ${msg}`);
const fin = (a) => Array.isArray(a) && a.every((v) => typeof v === "number" && isFinite(v));
const boxOf = (d) => { const nums = (d.match(/-?\d+(?:\.\d+)?/g) || []).map(Number), b = [Infinity, Infinity, -Infinity, -Infinity]; for (let i = 0; i + 1 < nums.length; i += 2) { b[0] = Math.min(b[0], nums[i]); b[1] = Math.min(b[1], nums[i + 1]); b[2] = Math.max(b[2], nums[i]); b[3] = Math.max(b[3], nums[i + 1]); } return b; };

const rows = [];
for (const name of names) {
  const prop = env.PROPS[name];
  const variants = prop.variants || [{}];
  if (!prop.footprint) { warn(name, "no footprint: worlds cannot place it (skipped)"); continue; }
  if (!fin(prop.footprint) || prop.footprint.length !== 2) { fail(name, "footprint must be [along x, along y]"); continue; }
  const [fx, fy] = prop.footprint;
  for (const v of variants) {
    const tag = name + (Object.keys(v).length ? " " + JSON.stringify(v) : "");
    const cells = [];
    let top = 0, ok = true;
    for (const view of VIEWS) {
      const az = view.az;
      // fit the cell to the footprint plus room for the two people; the last cell draws the prop at the size a scene
      // shows it (the lineup street at 62°), so a prop that only reads when enlarged is caught on the sheet
      const P = view.scene ? k.fitProjection([[-91 / ZOOM, -40 / ZOOM, 0], [91 / ZOOM, 40 / ZOOM, 0]], CELL[0], CELL[1], { pad: 0, azimuth: az })
        : k.fitProjection([[-fx / 2 - 12, -fy / 2 - 12, 0], [fx / 2 + 12, fy / 2 + 12, 0], [-fx / 2 - 12, fy / 2 + 12, 30], [fx / 2 + 12, -fy / 2 - 12, 30]], CELL[0], CELL[1], { pad: 18, azimuth: az });
      const c = env.makeCtx(k, P);
      let built;
      try { built = prop.build(c, { ...v, x: 0, y: 0 }); } catch (e) { fail(tag, "build threw: " + e.message); ok = false; break; }
      if (az === AZ[0]) {
        if (!built || !Array.isArray(built.items) || !built.items.length) { fail(tag, "build must return { items: [...] }"); ok = false; break; }
        const p = built.part;
        if (!p || typeof p.name !== "string" || !fin(p.move) || p.move.length !== 3 || !fin(p.anchor) || p.anchor.length !== 3) fail(tag, "part must be { name, move: [x,y,z], anchor: [x,y,z] }");
        built.items.forEach((it, i) => {
          if (!env.PHASES.includes(it.phase)) fail(tag, `item ${i}: phase "${it.phase}" is not one of ${env.PHASES.join("/")}`);
          if (!fin(it.bounds) || it.bounds.length !== 6 || it.bounds[3] <= it.bounds[0] || it.bounds[4] <= it.bounds[1] || it.bounds[5] < it.bounds[2]) fail(tag, `item ${i}: bounds must be [x0,y0,z0,x1,y1,z1] with x1>x0, y1>y0`);
          else {
            const [x0, y0, , x1, y1, z1] = it.bounds;
            if (x0 < -fx / 2 - 1 || x1 > fx / 2 + 1 || y0 < -fy / 2 - 1 || y1 > fy / 2 + 1) fail(tag, `item ${i}: bounds [${it.bounds.map((n) => +n.toFixed(1))}] leave the footprint ${fx}×${fy}`);
            top = Math.max(top, z1);
          }
          if (typeof it.svg !== "string" || !it.svg) fail(tag, `item ${i}: empty svg`);
          else if (/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|style=|font-family|font-weight/i.test(it.svg)) fail(tag, `item ${i}: colours, fonts or inline styles in the markup (use tones)`);
        });
        if (top > 60 || top < 1) fail(tag, `height ${top.toFixed(1)}: out of scale (a person is 7)`);
      }
      // bounds must contain the drawing at every azimuth (projected screen boxes, 1.5 px slack)
      for (const [i, it] of built.items.entries()) {
        if (!fin(it.bounds)) continue;
        const [x0, y0, z0, x1, y1, z1] = it.bounds, pr = [];
        for (const X of [x0, x1]) for (const Y of [y0, y1]) for (const Z of [z0, z1]) pr.push(k.iso([X, Y, Z], P));
        const bb = [Math.min(...pr.map((q) => q[0])), Math.min(...pr.map((q) => q[1])), Math.max(...pr.map((q) => q[0])), Math.max(...pr.map((q) => q[1]))];
        const d = [...it.svg.matchAll(/\bd="([^"]+)"/g)].map((m) => m[1]).join(" ");
        const db = boxOf(d);
        const over = Math.max(bb[0] - db[0], db[2] - bb[2], bb[1] - db[1], db[3] - bb[3]);
        if (over > 1.5) { fail(tag, `item ${i}: the drawing overflows its bounds by ${over.toFixed(1)} px at azimuth ${az}; widen bounds to cover everything it draws`); break; }
      }
      // the cell: a plate, the prop, a person in front (toward +x) and one behind (toward -y), depth-sorted together
      const plate = env.ground(c, { plan: { x: -fx / 2 - 10, y: -fy / 2 - 10, w: fx + 20, d: fy + 20, r: 2 }, h: 3, pattern: "tiles", tile: 10 });
      const front = env.person(c, [fx / 2 + 5, 0, 0], { part: "scale-front" }), back = env.person(c, [-fx / 4, -fy / 2 - 5, 0], { part: "scale-back" });
      cells.push({ az, tag: view.scene ? "scene size" : "az " + az, svg: env.composeWorld([plate, ...built.items, front, back], k, P) });
    }
    if (ok) rows.push({ tag, cells });
  }
}

// the sheet: one svg, a row per prop variant, a cell per azimuth
const W = CELL[0] * VIEWS.length, H = CELL[1] * rows.length + 30 * rows.length;
const label = (r, ri) => (blind ? String.fromCharCode(65 + ri) : r.tag.replace(/[<&]/g, ""));
const body = rows.map((r, ri) => `<g transform="translate(0 ${ri * (CELL[1] + 30)})"><text class="bench-tag" x="8" y="18">${label(r, ri)}</text>${r.cells.map((cell, ci) => `<g transform="translate(${ci * CELL[0]} 24)">${cell.svg}<text class="bench-tag" x="8" y="${CELL[1] - 8}">${cell.tag}</text></g>`).join("")}</g>`).join("");
const skin = read("skin/ll-skin.css");
const page = (theme) => `<!doctype html><html data-theme="${theme}"><meta charset=utf-8><title>Prop bench</title><style>${k.ISO_CSS}${skin} html,body{margin:0;background:${theme === "dark" ? "#16130f" : "#faf8f4"}} .bench-tag{font:12px/1 Inter, system-ui, sans-serif; fill: var(--anatomy-muted, #888)}</style><body data-theme="${theme}"><div class="iso-plate" style="padding:0;border:0;border-radius:0;width:${W}px"><svg class="iso" data-theme="${theme}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${body}</svg></div>`;
const stem = basename(file, ".js") + (only ? "-" + only : "") + (blind ? "-blind" : "");
if (blind) writeFileSync(join(out, `${stem}-key.json`), JSON.stringify(Object.fromEntries(rows.map((r, ri) => [String.fromCharCode(65 + ri), r.tag])), null, 2));
for (const theme of ["light", "dark"]) writeFileSync(join(out, `${stem}-${theme}.html`), page(theme));

// line ends, always judged at zoom 2 (the check measures in screen pixels, so a pass must not depend on the sheet's
// zoom): at zoom 1 the bench runs itself at zoom 2 for this one check. Then the screenshots for the review.
if (rows.length && ZOOM < 2) {
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), resolve(file), ...(only ? ["--prop", only] : []), "--zoom", "2", "--no-shots", "--out", join(out, "zoom2")], { encoding: "utf8" });
  for (const l of (r.stdout || "").split("\n").filter((l) => l.startsWith("✗ lines:"))) fails.push(l.slice(2) + " (at zoom 2, ringed in bench/zoom2/)");
} else if (rows.length) {
  const r = spawnSync(process.execPath, [join(ROOT, "scripts/lines.mjs"), join(out, `${stem}-light.html`), "--out", join(out, `${stem}-lines.png`), "--width", String(W), "--height", String(Math.min(H, 4000))], { encoding: "utf8" });
  const m = (r.stdout + r.stderr).match(/line ends: (\d+) of (\d+)/);
  if (!m) fail("lines", "the line check did not run: " + (r.stdout + r.stderr).trim().split("\n").slice(-2).join(" "));
  else if (m[1] !== "0") fail("lines", `${m[1]} floating line ends of ${m[2]} (ringed in ${stem}-lines.png)`);
}
if (rows.length) {
  if (shots) for (const theme of ["light", "dark"]) spawnSync(process.execPath, [join(ROOT, "scripts/capture.mjs"), join(out, `${stem}-${theme}.html`), "--out", join(out, `${stem}-${theme}.png`), "--width", String(W), "--height", String(Math.min(H, 4000)), "--scale", "1"], { encoding: "utf8" });
}
for (const w of warns) console.log("· " + w);
for (const f of fails) console.log("✗ " + f);
console.log(`\n${rows.length} variant(s) of ${names.length} prop(s) · sheets in ${out}`);
console.log(fails.length ? `BENCH FAILED (${fails.length})` : "Bench passed. Now open the sheets and review them against references/props.md.");
process.exit(fails.length ? 1 : 0);
