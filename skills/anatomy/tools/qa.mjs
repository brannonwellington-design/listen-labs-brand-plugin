// QA gate for a built scene page. Runs every automated check, writes the screenshots a visual review needs, and
// exits 1 if anything fails. Nothing ships (or gets published) until this passes and the screenshots are reviewed
// against references/vqa.md.
//
// usage: node tools/qa.mjs <page.html> [--out <dir>] [--api STAD]   (the scene API is read from the page when omitted)
//   1. lines (reduced motion and with motion): every texture line ends on something
//   2. console: no errors in light or dark
//   3. phone: no horizontal scroll at 390 px
//   3b. people: no respondent hidden behind scenery at the default view
//   4. leaks: the page carries no transcript link without its quote, and no "TODO"/"lorem"
//   5. screenshots: desktop light + dark, phone, and the figure in blueprint and apart views
import { spawnSync } from "node:child_process";
import { readFileSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const page = args[0];
if (!page) { console.error("usage: node tools/qa.mjs <page.html> [--out dir] [--api STAD]"); process.exit(2); }
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const out = opt("--out", join(dirname(page), "qa", basename(page, ".html")));
// the scene's runtime API: a scene page marks it with data-api; the older shells assign window.<API>
const source = readFileSync(page, "utf8");
const api = opt("--api", (source.match(/data-api="([A-Z]+)"/) || source.match(/window\.([A-Z]{2,8}) ?=/) || [])[1]);
if (!api) { console.error("qa: cannot find the scene API in the page; pass --api <NAME>"); process.exit(2); }
mkdirSync(out, { recursive: true });
const S = join(dirname(fileURLToPath(import.meta.url)), "..", "scripts");
const run = (script, a) => { const r = spawnSync(process.execPath, [join(S, script), ...a], { encoding: "utf8", timeout: 240000 }); return (r.stdout || "") + (r.stderr || ""); };
const fails = [];
const check = (name, ok, detail) => { console.log(`${ok ? "✓" : "✗"} ${name}${detail ? " · " + detail : ""}`); if (!ok) fails.push(name); };

// 1. lines
for (const [label, extra] of [["lines (reduced motion)", ["--reduced"]], ["lines (motion, settled)", ["--wait", "4000"]]]) {
  const o = run("lines.mjs", [page, ...extra]);
  const m = o.match(/line ends: (\d+) of (\d+)/);
  check(label, m && m[1] === "0", m ? `${m[1]} floating of ${m[2]}` : o.trim().split("\n").slice(-2).join(" "));
  if (/console: (?!clean)/.test(o) || /exception/.test(o)) check(label + " console", false, o.match(/exception[^\n]*/)?.[0]);
}
// 2–3. themes, phone, screenshots
const drive = (actions, flags) => run("drive.mjs", [page, JSON.stringify(actions), ...flags]);
for (const theme of ["light", "dark"]) {
  const o = drive([["wait", 3000], ["shot", join(out, `desktop-${theme}.png`)], ["eval", `${api}.setView({ blueprint: true })`], ["wait", 2000], ["shot", join(out, `blueprint-${theme}.png`), ".iso-plate"],
    ["eval", `${api}.setView({ blueprint: false, apart: true })`], ["wait", 2400], ["shot", join(out, `apart-${theme}.png`), ".iso-plate"]], ["--theme", theme, "--width", "1440", "--height", "1000"]);
  check(`console (${theme})`, /console: clean/.test(o), (o.match(/exception[^\n]*|console: [^\n]*/) || [""])[0]);
}
const ph = drive([["wait", 3000], ["eval", "document.documentElement.scrollWidth + ' ' + document.documentElement.clientWidth"], ["shot", join(out, "phone.png")]], ["--width", "390", "--height", "900"]);
const [sw, cw] = ((ph.match(/eval: "(\d+) (\d+)"/) || [])).slice(1).map(Number);
check("phone width", sw && sw <= cw, `${sw} / ${cw} px`);
// 3b. every person visible: a respondent hidden behind scenery is a respondent the reader can't see. For each person
// drawn ([data-p], [data-fan]) the check samples the head and the body; if a non-person part is on top at both, it is
// hidden. Run at the default view, reduced motion (everyone at rest).
const OCCLUDED = `(() => { const svg = document.querySelector(".iso-plate svg"); if (!svg) return "{}"; const hid = {}; let n = 0;
  for (const g of svg.querySelectorAll("[data-p],[data-fan]")) { const r = g.getBoundingClientRect(); if (r.width < 2 || r.height < 3) continue; n++;
    const cover = [0.2, 0.6].map((f) => { const t = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height * f).find((e) => svg.contains(e) && e !== svg);
      if (!t || g.contains(t) || t.closest("[data-p],[data-fan]")) return null; const part = t.closest("[data-part]"); return part ? part.getAttribute("data-part") : "scenery"; });
    if (cover[0] && cover[1]) hid[cover[0]] = (hid[cover[0]] || 0) + 1; }
  return JSON.stringify({ n, hid }); })()`;
const oc = drive([["wait", 2500], ["eval", OCCLUDED]], ["--reduced", "--width", "1440", "--height", "1000"]);
const ocm = oc.match(/eval: "(.*)"/);
if (ocm) {
  const r = JSON.parse(JSON.parse(`"${ocm[1]}"`)), hidden = Object.values(r.hid || {}).reduce((a, b) => a + b, 0);
  if (r.n) check("every person visible", hidden === 0, hidden ? `${hidden} of ${r.n} hidden behind ${Object.entries(r.hid).map(([k, v]) => `${k} (${v})`).join(", ")}` : `${r.n} people, none hidden`);
}
// 3c. nothing cut off: a figure corner (title, hint, readout) or a control label that overflows its box is cut with an
// ellipsis or clipped, so the reader loses words. Desktop width, after the intro settles.
const CLIPPED = `JSON.stringify([...document.querySelectorAll(".iso-plate-corner, .fig-tools button, .fig-tools select")].filter((e) => e.offsetParent && e.scrollWidth > e.clientWidth + 1).map((e) => (e.dataset.corner || e.tagName.toLowerCase()) + ": " + e.textContent.trim().slice(0, 40)))`;
const cl = drive([["wait", 3000], ["eval", CLIPPED]], ["--reduced", "--width", "1440", "--height", "1000"]);
const clm = cl.match(/eval: "(.*)"/);
if (clm) { const list = JSON.parse(JSON.parse(`"${clm[1]}"`)); check("nothing cut off", !list.length, list.length ? list.join(" · ") + " (shorten it)" : ""); }
// 4. content leaks
const html = readFileSync(page, "utf8");
if (/data-scene-page/.test(html)) check("reconciliation printed", /data-recon/.test(html), "the page shows our coding against the report");
check("no placeholder copy", !/\b(TODO|lorem ipsum|FIXME)\b/i.test(html));
check("brand weight only", !/font-weight:\s*[5-9]00|wght@[0-9;]*[5-9]00/.test(html), "Inter Regular 400 only");
console.log(`\nscreenshots for the visual review: ${out}`);
console.log(fails.length ? `\nQA FAILED: ${fails.join(", ")}` : "\nQA passed. Now review the screenshots against references/vqa.md before sharing.");
process.exit(fails.length ? 1 : 0);
