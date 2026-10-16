// Leak scan: the plugin repository is public, so no study's fingerprint may appear in tracked files. Reads every local
// study's config and codebook (git-ignored: scenes/*/ and skills/anatomy/studies/*/) and collects what identifies it:
//   - names: station, condition, group, hope, act and title strings of two or more words, matched as whole phrases
//   - coded keys with a separator (first_try, not-asked) from codebooks and configs
//   - words not in the system dictionary (brands, coined terms) from those names
// Words the synthetic examples use, or that several studies share, are left out. Then every tracked file is searched.
//
// usage: node skills/anatomy/tools/dev/leak-scan.mjs     (from the repository root; exits 1 on a hit)
// Run it before every commit that touches skills/anatomy. A hit is either a leak (remove it) or a generic word that
// happens to match (rename nothing; judge it and move on).
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const dict = new Set(existsSync("/usr/share/dict/words") ? readFileSync("/usr/share/dict/words", "utf8").toLowerCase().split("\n") : []);
// the system word list has no plurals or verb forms: try the word's stems too
const known = (w) => { w = w.replace(/['’]s$/, ""); if (!dict.size || dict.has(w)) return true;
  return [w.replace(/ies$/, "y"), w.replace(/es$/, ""), w.replace(/s$/, ""), w.replace(/ed$/, ""), w.replace(/ed$/, "e"), w.replace(/ing$/, ""), w.replace(/ing$/, "e"), w.replace(/er$/, ""), w.replace(/ly$/, ""), w.replace(/-/g, "")].some((x) => x.length > 2 && dict.has(x)) || w.split("-").every((x) => x.length < 3 || dict.has(x)); };
const NAME_FIELDS = new Set(["name", "short", "title", "when", "propName", "statement", "readout", "headline", "label"]);
const KEY_FIELDS = new Set(["key", "dim", "closed", "code", "altCode", "eq"]);
const prints = new Map();   // fingerprint → set of sources
const add = (fp, src) => { fp = fp.toLowerCase().trim(); if (fp.length >= 5) (prints.get(fp) || prints.set(fp, new Set()).get(fp)).add(src); };
function walk(o, src, field = "") {
  if (typeof o === "string") {
    if (NAME_FIELDS.has(field)) {
      const words = o.toLowerCase().replace(/\{[^}]*\}/g, " ").match(/[a-z][a-z'’-]*/g) || [];
      if (words.length >= 2) add(words.join(" "), src);
      for (const w of words) if (w.length >= 4 && !known(w)) add(w, src);
    }
    if (KEY_FIELDS.has(field) && /[a-z][_-][a-z]/i.test(o)) add(o, src);
  } else if (Array.isArray(o)) o.forEach((x) => walk(x, src, field));
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) {
    if (k.startsWith("_") || ["quote", "source", "url", "propSource"].includes(k)) continue;
    if (["values", "keys", "map", "multi", "exclusive"].includes(k) && v && typeof v === "object" && !Array.isArray(v)) Object.keys(v).forEach((x) => /[a-z][_-][a-z]/i.test(x) && add(x, src));
    if (["values", "keys"].includes(k) && Array.isArray(v)) v.forEach((x) => typeof x === "string" && /[a-z][_-][a-z]/i.test(x) && add(x, src));
    walk(v, src, k);
  }
}
const read = (p) => { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; } };
const studyDirs = ["scenes", "skills/anatomy/studies"].filter((d) => existsSync(join(root, d)))
  .flatMap((d) => readdirSync(join(root, d)).map((s) => join(root, d, s)).filter((p) => statSync(p).isDirectory()));
for (const d of studyDirs) for (const f of ["scene.json", "codebook.json", "scene.base.json"]) { const j = read(join(d, f)); if (j) walk(j, d.split("/").pop()); }
const ex = join(root, "skills/anatomy/examples");
if (existsSync(ex)) for (const d of readdirSync(ex)) for (const f of ["scene.json", "codebook.json"]) { const j = read(join(ex, d, f)); if (j) walk(j, "__example"); }
// generic words that happen to be one study's fingerprint and are the engine's or the web's own vocabulary, or that the system word list lacks
const GENERIC = new Set(["google", "marketplace", "conveyor", "embedded", "embedding", "smallest", "strongest", "speaker arrays", "boxes"]);
const fingerprints = [...prints].filter(([fp]) => !GENERIC.has(fp)).filter(([, s]) => !s.has("__example") && s.size === 1).map(([fp, s]) => [fp, [...s][0]]);

const tracked = execSync("git ls-files", { cwd: root, encoding: "utf8" }).split("\n").filter((f) => f && !f.startsWith("skills/anatomy/examples/") && !/\.(png|jpe?g|gif|svg|ico|woff2?|pdf|zip)$/i.test(f));
const hits = [];
for (const f of tracked) {
  let text; try { text = readFileSync(join(root, f), "utf8"); } catch { continue; }
  const low = text.toLowerCase().replace(/[‘’]/g, "'");
  for (const [fp, study] of fingerprints) {
    const re = new RegExp(`(^|[^a-z0-9_])${fp.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[‘’]/g, "'")}(?![a-z0-9_])`);
    const m = re.exec(low);
    if (m) { const line = low.slice(0, m.index).split("\n").length; hits.push(`${f}:${line}  "${fp}" (${study})  ${text.split("\n")[line - 1].trim().slice(0, 120)}`); }
  }
}
hits.forEach((h) => console.log(h));
console.log(`\n${fingerprints.length} fingerprints from ${studyDirs.length} local studies · ${hits.length} hit(s) in ${tracked.length} tracked files`);
process.exit(hits.length ? 1 : 0);
