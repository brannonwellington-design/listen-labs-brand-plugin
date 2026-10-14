// Coding validator, driven by a codebook file. Merges coder batches, checks structure and evidence integrity, then
// reconciles the coding against the report's own stated numbers. It never edits a code to match: the reconciliation
// is written next to the merged file and the page prints it.
//
// usage: node tools/coding/check.mjs <study dir>      (reads <dir>/codebook.json and <dir>/codes/batch*.json,
//                                                      writes <dir>/codes/merged.json and merged-recon.json)
//
// codebook.json:
//   exclusive: { <dim>: { values: [...], absent: [values that may rest on absence, i.e. evidence null] } }
//   multi:     { <dim>: { keys: [...], absent: [keys that may be true without a quote] } }
//   closed:    [<closed-question keys the coders copy, e.g. "familiarity">]
//   checks:    { closed: { <key>: { in: [...] } } }                     optional value checks on closed answers
//   answered:  { <dim>: [values meaning "never asked"] }                 default ["none"]
//   report:    [{ label, count: <filter>, base: <filter>, report: [count, base] }]
// A filter is an array of conditions, all of which must hold:
//   { dim, eq | in }  ·  { multi: "dim.key" }  ·  { closed, eq | in | lte | gte | includes }  ·  { complete: true }
//   ·  { answered: dim }  ·  { not: <condition> }  ·  { any: [<condition>…] }   ({ multi: "dim.*" } = any key true)
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
if (!dir) { console.error("usage: node tools/coding/check.mjs <study dir>"); process.exit(2); }
const book = JSON.parse(readFileSync(join(dir, "codebook.json"), "utf8"));
const rows = readdirSync(join(dir, "codes")).filter((f) => /^batch.*\.json$/.test(f)).flatMap((f) => JSON.parse(readFileSync(join(dir, "codes", f), "utf8")));
const SRC = /^https:\/\/listenlabs\.ai\/response\/[0-9a-f-]+\?message=\d+#a-\d+$/;
const NEVER = (dim) => (book.answered && book.answered[dim]) || ["none"];
const problems = [], ids = new Set();

function checkEv(r, key, ev, absenceOk) {
  if (!ev) { if (!absenceOk) problems.push(`${r.readable_id}: ${key} has no evidence`); return; }
  if (!ev.quote || !ev.quote.trim()) problems.push(`${r.readable_id}: ${key} empty quote`);
  if (!SRC.test(ev.source || "")) problems.push(`${r.readable_id}: ${key} malformed source ${ev.source}`);
  else if (!ev.source.includes(r.response_uuid)) problems.push(`${r.readable_id}: ${key} source is not this respondent's transcript`);
}
for (const r of rows) {
  if (ids.has(r.readable_id)) problems.push(`duplicate respondent ${r.readable_id}`);
  ids.add(r.readable_id);
  if (!r.response_uuid) problems.push(`${r.readable_id}: no response_uuid`);
  const c = r.codes || {};
  for (const key of book.closed || []) {
    if (r.closed?.[key] === undefined) problems.push(`${r.readable_id}: closed answer ${key} missing`);
    const chk = book.checks?.closed?.[key];
    if (chk?.in && !chk.in.includes(r.closed?.[key])) problems.push(`${r.readable_id}: ${key} = ${r.closed?.[key]}`);
  }
  for (const [dim, d] of Object.entries(book.exclusive || {})) {
    if (!d.values.includes(c[dim])) { problems.push(`${r.readable_id}: ${dim} = ${c[dim]} is not one of ${d.values.join("/")}`); continue; }
    checkEv(r, dim, r.evidence?.[dim], (d.absent || []).includes(c[dim]));
  }
  for (const [dim, d] of Object.entries(book.multi || {})) for (const key of d.keys) {
    const v = c[dim]?.[key];
    if (typeof v !== "boolean") problems.push(`${r.readable_id}: ${dim}.${key} must be true/false`);
    else if (v) checkEv(r, `${dim}.${key}`, r.evidence?.[`${dim}.${key}`], (d.absent || []).includes(key));
  }
}

// filters
function holds(r, q) {
  if (q.not) return !holds(r, q.not);
  if (q.any) return q.any.some((x) => holds(r, x));
  if (q.complete) return r.is_complete !== false;
  if (q.answered) return !NEVER(q.answered).includes(r.codes?.[q.answered]) && r.codes?.[q.answered] !== undefined;
  if (q.multi) { const [d, k] = q.multi.split("."); return k === "*" ? Object.values(r.codes?.[d] || {}).some(Boolean) : !!r.codes?.[d]?.[k]; }
  const v = q.dim ? r.codes?.[q.dim] : r.closed?.[q.closed];
  if ("eq" in q) return v === q.eq;
  if (q.in) return q.in.includes(v);
  if ("lte" in q) return v <= q.lte;
  if ("gte" in q) return v >= q.gte;
  if (q.includes) return (Array.isArray(v) ? v : [v]).some((x) => new RegExp(q.includes, "i").test(String(x)));
  throw new Error("unknown filter " + JSON.stringify(q));
}
const count = (f = []) => rows.filter((r) => f.every((q) => holds(r, q))).length;

console.log(`respondents: ${rows.length} (complete ${count([{ complete: true }])})   structural problems: ${problems.length}`);
problems.forEach((p) => console.log("  ✗ " + p));
console.log("\nreconciliation                          transcript      report");
const recon = (book.report || []).map((x) => {
  const v = count([...(x.base || []), ...x.count]), b = count(x.base);   // a count is always within its base
  console.log(`${x.label.padEnd(38)} ${String(v).padStart(4)} / ${String(b).padEnd(4)}  ${String(x.report[0]).padStart(4)} / ${x.report[1]}`);
  return { label: x.label, transcript: v, base: b, report: x.report[0], reportBase: x.report[1] };
});
for (const [dim, d] of Object.entries(book.multi || {})) {
  const base = book.multiBase?.[dim] || [];
  console.log(`\n${dim} (multi-mention, base ${count(base)}):`, d.keys.map((k) => `${k} ${count([...base, { multi: `${dim}.${k}` }])}`).join(" · "));
}
if (!problems.length) {
  writeFileSync(join(dir, "codes", "merged.json"), JSON.stringify(rows.sort((a, b) => a.readable_id - b.readable_id), null, 1));
  writeFileSync(join(dir, "codes", "merged-recon.json"), JSON.stringify(recon, null, 1));
  console.log(`\nwrote ${join(dir, "codes", "merged.json")}`);
}
process.exit(problems.length ? 1 : 0);
