import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
// Shared by every pattern builder: the filter language, copy templates over computed facts, and checked claims.
// Keeping these in one place means every pattern enforces the same honesty rules:
// · numbers enter copy only as {facts}; a literal digit fails the build ({lit:1–5} marks a non-data number)
// · titles carry no numbers at all
// · claims ("all", "most", "more") are backed by assert rules checked at build time
// · quotes are picked by rule, never by hand

// filters (the same language as tools/coding/check.mjs)
export function holds(r, q) {
  if (q.not) return !holds(r, q.not);
  if (q.any) return q.any.some((x) => holds(r, x));
  if (q.complete) return r.is_complete !== false;
  if (q.field) { const v = r[q.field]; return "eq" in q ? v === q.eq : q.in ? q.in.includes(v) : !!v; }   // a top-level row field (usable …)
  if (q.multi) { const [d, k] = q.multi.split("."); return k === "*" ? Object.values(r.codes?.[d] || {}).some(Boolean) : !!r.codes?.[d]?.[k]; }
  const v = q.dim ? r.codes?.[q.dim] : r.closed?.[q.closed];
  if ("eq" in q) return v === q.eq;
  if (q.in) return q.in.includes(v);
  if ("lte" in q) return v <= q.lte;
  if ("gte" in q) return v >= q.gte;
  throw new Error("unknown filter " + JSON.stringify(q));
}
export const all = (r, f = []) => f.every((q) => holds(r, q));

// copy templates over a facts object
export function makeCopy(facts) {
  const get = (path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), facts);
  function fill(tpl, where, { title = false } = {}) {
    if (tpl == null) return tpl;
    const bare = tpl.replace(/\{[^}]+\}/g, "");
    if (/\d/.test(bare)) throw new Error(`${where}: a number typed into copy ("${tpl}"). Use a {placeholder} from the facts, or {lit:…} for a non-data number`);
    const out = tpl.replace(/\{([^}]+)\}/g, (_, p) => {
      if (p.startsWith("lit:")) return p.slice(4);
      let v = get(p.replace(/\|lower$/, ""));
      if (v === undefined || v === null || typeof v === "object") throw new Error(`${where}: unknown fact {${p}}`);
      if (p.endsWith("|lower")) v = String(v).toLowerCase();
      return String(v);
    });
    if (title && /\d/.test(out)) throw new Error(`${where}: titles carry no numbers ("${out}")`);
    return out;
  }
  const fillAll = (o, where) => (Array.isArray(o) ? o.map((x, i) => fillAll(x, `${where}[${i}]`)) : typeof o === "string" ? fill(o, where) : o);
  function check(asserts = []) {
    for (const a of asserts) {
      const m = a.match(/^\s*([\w.]+)\s*(==|>=|<=|>|<)\s*([\w.]+|\d+(?:\.\d+)?)\s*(?:\*\s*([\d.]+))?\s*$/);
      if (!m) throw new Error("assert: cannot read " + a);
      const L = get(m[1]), R = (/^\d/.test(m[3]) ? +m[3] : get(m[3])) * (m[4] ? +m[4] : 1);
      if (typeof L !== "number" || typeof R !== "number") throw new Error("assert: " + a + " does not compare two numbers");
      const ok = { "==": L === R, ">=": L >= R, "<=": L <= R, ">": L > R, "<": L < R }[m[2]];
      if (!ok) throw new Error(`assert failed: ${a} (${L} vs ${R}) — the copy that relies on it is no longer true`);
    }
  }
  return { get, fill, fillAll, check };
}

// a quote by rule: the shortest of at least `min` characters (ties → first in respondent order)
export function pickQuote(cands, min = 50) {
  const x = cands.filter((c) => c.e && c.e.quote.length >= min).sort((a, b) => a.e.quote.length - b.e.quote.length)[0];
  return x ? { quote: x.e.quote, source: x.e.source, who: x.who } : null;
}
export const median = (xs) => { const s = xs.filter((v) => v != null).sort((a, b) => a - b); if (!s.length) return null; const m = s.length / 2; return s.length % 2 ? s[Math.floor(m)] : (s[m - 1] + s[m]) / 2; };

// Report-driven patterns (journey, sort, comparison) carry the report's own numbers and copy in their config. Facts
// index every array of keyed objects by key, so copy can say {stations.cart.count} or {benches.claude.users}.
export function indexByKey(o) {
  if (Array.isArray(o)) {
    const arr = o.map(indexByKey);
    if (o.length && o.every((x) => x && typeof x === "object" && typeof x.key === "string")) o.forEach((x, i) => { arr[x.key] = arr[i]; });
    return arr;
  }
  if (o && typeof o === "object") return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, indexByKey(v)]));
  return o;
}
// Fill every copy string in a config through the fact templates. Skipped: verbatim quotes and their links, keys and
// codes, camera and layout numbers, data values (a stat's value, a report fact's value), the report's own headline stats, and "@references" (resolved later by the script resolver, which has its own guard).
const SKIP = new Set(["quote", "source", "sources", "url", "id", "key", "code", "metric", "prop", "camera", "wideCamera", "sheetCamera", "apartCamera", "sheetApartCamera",
  "shopper", "target", "readableId", "codes", "evidence", "hold", "fig", "_source", "predicates", "headlineStats", "list", "empty", "value", "dim", "values", "multi", "lit", "event", "file"]);
export function fillTree(o, fill, where = "") {
  if (typeof o === "string") return o.startsWith("@") ? o : fill(o, where);
  if (Array.isArray(o)) return o.map((v, i) => fillTree(v, fill, `${where}[${i}]`));
  if (o && typeof o === "object") return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, SKIP.has(k) ? v : fillTree(v, fill, where ? `${where}.${k}` : k)]));
  return o;
}
export const readCodes = (dir, file = "codes/merged.json") => JSON.parse(readFileSync(join(dir, file), "utf8"));
// a study's own generated props (cfg.props: files in the study folder, benched per references/props.md), as one source
// string the scene objects load after the library
export function readPropSource(dir, cfg) {
  return (cfg.props || []).map((f) => {
    if (!existsSync(join(dir, f))) throw new Error(`props file ${f} not found in ${dir}`);
    return `// ${f}\n` + readFileSync(join(dir, f), "utf8");
  }).join("\n");
}

// The shared run of a report-driven pattern: read the config and the coding, let the pattern validate it and attach
// its people, fill every copy string from the facts, check the claims, write the spec.
import { writeFileSync, mkdirSync } from "node:fs";
// A number the report states that is not part of the scene's data goes in cfg.reportFacts, by name, with where it came
// from: { "<name>": { "value": 15, "from": "<report section or chart>" } }. Copy cites it as {reportFacts.<name>.value}.
// Never match a number to a fact by value alone: two findings can share a number.
export function runReportPattern(dir, { name, validate, attach }) {
  const cfg = JSON.parse(readFileSync(join(dir, "scene.json"), "utf8"));
  const codesFile = cfg.people?.codes || "codes/merged.json";
  const rows = cfg.people ? readCodes(dir, codesFile).filter((r) => all(r, cfg.people.filter || [])).sort((a, b) => a.readable_id - b.readable_id) : [];
  const reconFile = codesFile.replace(/\.json$/, "-recon.json");
  const recon = existsSync(join(dir, reconFile)) ? JSON.parse(readFileSync(join(dir, reconFile), "utf8")) : [];
  validate(cfg);
  const extra = attach ? attach(cfg, rows, recon, codesFile) : {};
  const draft = { ...cfg, ...extra.spec };
  const facts = { ...indexByKey(draft), ...(extra.facts || {}), recon: Object.fromEntries(recon.map((x, i) => [i, x])) };
  const { fill, check } = makeCopy(facts);
  check(cfg.assert);
  // people and their verbatim evidence pass through untouched; everything else is copy and gets filled
  const keep = extra.keep || [];
  const filled = fillTree(Object.fromEntries(Object.entries(draft).filter(([k]) => !keep.includes(k) && k !== "assert" && k !== "people" && k !== "pattern" && k !== "reportFacts" && k !== "wavesFrom")), fill);
  const spec = { ...filled, ...Object.fromEntries(keep.map((k) => [k, draft[k]])) };
  spec.reconciliation = recon.map((x) => ({ label: x.label, transcript: x.transcript, base: x.base, report: x.report, reportBase: x.reportBase, ...(x.derived ? { derived: x.derived } : {}) }));
  spec._source = `pattern ${name} · config ${join(dir, "scene.json")}${cfg.people ? ` · coding ${join(dir, codesFile)}` : ""}`;
  mkdirSync(join(dir, "specs"), { recursive: true });
  writeFileSync(join(dir, "specs/scene.figure.json"), JSON.stringify(spec, null, 2));
  return spec;
}
