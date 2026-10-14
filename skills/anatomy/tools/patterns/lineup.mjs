// Lineup pattern: one figure per respondent standing at their own rating on a scale, a lane per group, one rating
// question per condition (situations, products, moments). Switching the condition walks everyone to their rating for
// it. Fits any closed rating question asked of everyone, by segment: numeric (0–10, 1–5) or worded (Very poor …
// Excellent, via scale.labels). World: curb, or any street the spec's `scenery` describes.
//
// usage: node tools/patterns/lineup.mjs <study dir>     → <dir>/specs/scene.figure.json
// Honesty rules come from ./lib.mjs (numbers only from facts, no numbers in titles, claims checked by assert, quotes
// by rule). Missing ratings stay missing: drawn faded off the scale and left out of that condition's median and n.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { all, makeCopy, pickQuote, median } from "./lib.mjs";

const dir = process.argv[2];
if (!dir) { console.error("usage: node tools/patterns/lineup.mjs <study dir>"); process.exit(2); }
const cfg = JSON.parse(readFileSync(join(dir, "scene.json"), "utf8"));
const rows = JSON.parse(readFileSync(join(dir, "codes/merged.json"), "utf8")).sort((a, b) => a.readable_id - b.readable_id);
const recon = JSON.parse(readFileSync(join(dir, "codes/merged-recon.json"), "utf8"));
const conds = cfg.conditions, why = cfg.why || null;
// A worded scale (Very poor … Excellent) lists its words low to high in scale.labels; they stand at 1…n. Answers listed
// in scale.missing ("Not applicable") are no answer for that condition: drawn faded, out of the median and the n.
const labels = cfg.scale.labels || null;
const { min, max } = labels ? { min: 1, max: labels.length } : cfg.scale;
const missingWords = cfg.scale.missing || [];
const wordOf = (v) => (labels ? labels[v - min] : String(v));
const medianWord = (m) => (m == null ? null : !labels ? String(m) : Number.isInteger(m) ? wordOf(m) : `between ${wordOf(Math.floor(m))} and ${wordOf(Math.ceil(m))}`);

const people = rows.map((r, i) => {
  const g = cfg.segments.groups.find((x) => all(r, x.filter));
  if (!g) throw new Error(`respondent ${r.readable_id} falls in no group`);
  const missing = {};
  const values = Object.fromEntries(conds.map((c) => {
    let v = r.closed?.[c.closed];
    if (v != null && missingWords.includes(v)) { missing[c.key] = v; return [c.key, null]; }
    if (labels && v != null) { const at = labels.indexOf(v); if (at < 0) throw new Error(`respondent ${r.readable_id}: ${c.closed} = "${v}" is not one of the scale's words`); v = min + at; }
    if (v != null && (typeof v !== "number" || v < min || v > max)) throw new Error(`respondent ${r.readable_id}: ${c.closed} = ${v} is off the ${min}–${max} scale`);
    return [c.key, v ?? null];
  }));
  const whyCond = why ? why.map[r.codes?.[why.dim]] || null : null;
  const ev = why && r.evidence?.[why.dim];
  return { label: (cfg.labelPrefix || "R") + String(i + 1).padStart(2, "0"), readableId: r.readable_id, complete: r.is_complete !== false, group: g.key, values, ...(Object.keys(missing).length ? { missing } : {}),
    why: ev ? { cond: whyCond, quote: ev.quote, source: ev.source } : null };
});
const groups = cfg.segments.groups.map((g) => ({ key: g.key, name: g.name, people: people.map((p, i) => (p.group === g.key ? i : -1)).filter((i) => i >= 0) }));
const groupStats = groups.map((g) => Object.fromEntries(conds.map((c) => {
  const vals = g.people.map((i) => people[i].values[c.key]).filter((v) => v != null);
  const counts = Array.from({ length: max - min + 1 }, (_, k) => vals.filter((v) => v === min + k).length);
  // a representative "why it was low" quote: from someone in this group whose lowest situation was this one
  const quote = pickQuote(g.people.map((i) => people[i]).filter((p) => p.why && p.why.cond === c.key).map((p) => ({ e: p.why, who: p.label })), 50);
  const m = median(vals);
  return [c.key, { median: m, medianWord: medianWord(m), n: vals.length, na: g.people.filter((i) => people[i].missing?.[c.key]).length, counts, quote, high: vals.filter((v) => v >= cfg.scale.high).length, low: vals.filter((v) => v <= cfg.scale.low).length }];
})));

// the contrast: the person whose rating falls most from the first condition to the tension condition, with a reason
const tensionCond = cfg.tension?.cond || conds[1]?.key;
const drops = people.map((p, i) => ({ i, p, d: (p.values[conds[0].key] ?? NaN) - (p.values[tensionCond] ?? NaN) })).filter((x) => !isNaN(x.d));
const swing = drops.filter((x) => x.p.why && x.p.why.cond === tensionCond).sort((a, b) => b.d - a.d || a.i - b.i)[0] || null;

const facts = {
  n: people.length, complete: people.filter((p) => p.complete).length, reportN: cfg.study.reportN, study: cfg.study,
  scale: { min, max, high: cfg.scale.high, low: cfg.scale.low, highWord: wordOf(cfg.scale.high), lowWord: wordOf(cfg.scale.low) },
  group: Object.fromEntries(groups.map((g, gi) => [g.key, { size: g.people.length, ...Object.fromEntries(conds.map((c) => [c.key, groupStats[gi][c.key]])) }])),
  report: Object.fromEntries(conds.map((c) => [c.key, c.reportMedian || {}])),
  drop: Object.fromEntries(groups.map((g) => [g.key, drops.filter((x) => x.p.group === g.key && x.d >= (cfg.dropBy || 3)).length])),
  swing: swing ? { label: swing.p.label, from: swing.p.values[conds[0].key], to: swing.p.values[tensionCond], drop: swing.d, fromWord: wordOf(swing.p.values[conds[0].key]), toWord: wordOf(swing.p.values[tensionCond]) } : null,
  recon: Object.fromEntries(recon.map((x, i) => [i, x])),
  coded: Object.fromEntries(Object.entries(cfg.countFacts || {}).map(([k, f]) => [k, rows.filter((r) => all(r, f)).length])),
};
const { fill, fillAll, check } = makeCopy(facts);
check(cfg.assert);

const gi = (key) => { const i = groups.findIndex((g) => g.key === key); if (i < 0) throw new Error("unknown group " + key); return i; };
function beat(b, i) {
  const where = `tour[${i}]`;
  const out = { hold: b.hold, cond: b.cond, title: fill(b.title, where + ".title", { title: true }), caption: fill(b.caption, where + ".caption") };
  if (b.group) out.group = gi(b.group);
  if (b.tension) out.tension = true;
  if (b.follow === "swing") { if (!swing) return null; out.follow = swing.i; out.quote = { quote: swing.p.why.quote, source: swing.p.why.source, who: swing.p.label }; }
  if (b.quote) { const [, cond, group] = b.quote.split(":"); const q = groupStats[gi(group)][cond].quote; out.quote = q ? { ...q } : null; }
  return out;
}
// the study's own props (cfg.props: files under the study folder, written and benched per references/props.md)
const propFiles = cfg.props || [];
for (const f of propFiles) if (!existsSync(join(dir, f))) throw new Error(`props file ${f} not found in ${dir}`);
const propSource = propFiles.map((f) => `// ${f}\n` + readFileSync(join(dir, f), "utf8")).join("\n");
const spec = {
  _source: `pattern lineup · coding ${join(dir, "codes/merged.json")} · config ${join(dir, "scene.json")}`,
  study: { ...cfg.study, n: people.length, complete: facts.complete }, object: "lineup", world: cfg.world || "curb", ...(cfg.scenery ? { scenery: cfg.scenery } : {}), ...(propSource ? { propSource } : {}),
  scale: { min, max, lowLabel: cfg.scale.lowLabel, highLabel: cfg.scale.highLabel, high: cfg.scale.high, low: cfg.scale.low, ...(labels ? { labels } : {}) },
  conds: conds.map((c) => ({ key: c.key, name: c.name, short: c.short || c.name, dressing: c.dressing, reportMedian: c.reportMedian || {} })),
  groups, groupStats, people,
  figure: { ...cfg.figure, label: fill(cfg.figure.label, "figure.label"), caption: fill(cfg.figure.caption, "figure.caption"), titleBlock: cfg.figure.titleBlock.map(([k, v], i) => [k, fill(v, `figure.titleBlock[${i}]`)]) },
  tension: cfg.tension ? { label: fill(cfg.tension.label, "tension.label", { title: true }), event: "walk", cond: tensionCond, from: conds[0].key, numbers: fillAll(cfg.tension.numbers, "tension.numbers") } : null,
  page: { frame: fill(cfg.page.frame, "page.frame"), headline: fill(cfg.page.headline, "page.headline", { title: true }), dek: fill(cfg.page.dek, "page.dek"),
    headlineStats: cfg.page.headlineStats, notes: fillAll(cfg.page.notes, "page.notes") },
  scripts: cfg.tour ? { tour: { title: "The tour", label: "The tour", beats: cfg.tour.map(beat).filter(Boolean) } } : {},
};
mkdirSync(join(dir, "specs"), { recursive: true });
writeFileSync(join(dir, "specs/scene.figure.json"), JSON.stringify(spec, null, 2));
console.log(`lineup spec: ${people.length} respondents · ${groups.map((g) => `${g.key} ${g.people.length}`).join(", ")} · medians ${conds.map((c) => `${c.key} ${groups.map((g, i) => groupStats[i][c.key].median).join("/")}`).join(", ")}${swing ? ` · swing ${swing.p.label} ${facts.swing.from}→${facts.swing.to}` : ""}`);
