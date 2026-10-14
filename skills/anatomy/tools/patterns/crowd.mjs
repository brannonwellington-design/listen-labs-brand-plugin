// Crowd pattern: one figure per respondent, grouped by a segment, reacting to one or more conditions (acts, products,
// moments), with an optional multi-mention set ("hopes") shown as props. Builds the scene spec from a study's validated
// coding (codes/merged.json, codes/merged-recon.json) and its scene config (scene.json). World: stadium.
//
// usage: node tools/patterns/crowd.mjs <study dir>     → <dir>/specs/scene.figure.json
//
// Honesty rules enforced here, so no study can skip them:
// · Every number in copy comes from a {placeholder} computed from the coding, or from a field the config marks as
//   the report's own (report: [count, base], headlineStats). A literal digit anywhere else fails the build; a
//   deliberate non-data number (a rating scale) is written {lit:1–5}.
// · Titles (headline, tour titles, tension label) carry no numbers at all.
// · A respondent never asked about a condition has no feeling for it (drawn faded, excluded from that base).
// · Claims in copy ("all", "most", "more") are backed by cfg.assert rules over the facts, checked at build time.
// · Quotes are picked by rule (from the group's most common answer, the shortest of at least 50 characters), never by hand.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { holds, all, makeCopy } from "./lib.mjs";

const dir = process.argv[2];
if (!dir) { console.error("usage: node tools/patterns/crowd.mjs <study dir>"); process.exit(2); }
const cfg = JSON.parse(readFileSync(join(dir, "scene.json"), "utf8"));
const rows = JSON.parse(readFileSync(join(dir, "codes/merged.json"), "utf8")).sort((a, b) => a.readable_id - b.readable_id);
const recon = JSON.parse(readFileSync(join(dir, "codes/merged-recon.json"), "utf8"));
const FEELS = ["positive", "neutral", "negative"];

// ---------- the crowd ----------
const seg = cfg.segments, conds = cfg.conditions, W = cfg.hopes;
const keep = [...new Set([...conds.map((c) => c.dim), ...(cfg.evidence || []), ...(W ? W.items.map((h) => `${W.dim}.${h.key}`) : [])])];
const fans = rows.map((r, i) => {
  const g = seg.groups.find((x) => all(r, x.filter));
  if (!g) throw new Error(`respondent ${r.readable_id} falls in no segment group`);
  return {
    label: (cfg.labelPrefix || "R") + String(i + 1).padStart(2, "0"), readableId: r.readable_id, complete: r.is_complete !== false,
    segValue: r.closed?.[seg.closed] ?? null, block: g.key,
    feel: Object.fromEntries(conds.map((c) => [c.key, FEELS.includes(r.codes[c.dim]) ? r.codes[c.dim] : null])),
    hopes: W ? W.items.filter((h) => r.codes[W.dim]?.[h.key]).map((h) => h.key) : [],
    evidence: Object.fromEntries(keep.filter((k) => r.evidence?.[k]).map((k) => [k, r.evidence[k]])),
  };
});
const blocks = seg.groups.map((g) => ({ key: g.key, name: g.name, scale: g.scale, fans: fans.map((f, i) => (f.block === g.key ? i : -1)).filter((i) => i >= 0) }));
const hopesBase = W ? rows.filter((r) => all(r, W.base)).length : 0;

function pick(list, dim, cond, value) {
  const x = list.filter((f) => f.evidence[dim] && (!value || f.feel[cond] === value)).map((f) => ({ f, e: f.evidence[dim] }))
    .filter((y) => y.e.quote.length >= 50).sort((a, b) => a.e.quote.length - b.e.quote.length)[0];
  return x ? { quote: x.e.quote, source: x.e.source, who: x.f.label } : null;
}
const modal = (list, cond) => { const c = { positive: 0, neutral: 0, negative: 0 }; list.forEach((f) => f.feel[cond] && c[f.feel[cond]]++); return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]; };
const blockStats = blocks.map((b) => {
  const list = b.fans.map((i) => fans[i]);
  return Object.fromEntries(conds.map((c) => {
    const n = (v) => list.filter((f) => f.feel[c.key] === v).length, m = modal(list, c.key);
    return [c.key, { positive: n("positive"), neutral: n("neutral"), negative: n("negative"), none: list.filter((f) => !f.feel[c.key]).length, modal: m, quote: pick(list, c.dim, c.key, m) }];
  }));
});
const hopes = W ? W.items.map((h) => {
  const list = fans.filter((f) => f.hopes.includes(h.key));
  const q = list.map((f) => ({ f, e: f.evidence[`${W.dim}.${h.key}`] })).filter((x) => x.e && x.e.quote.length >= 40).sort((a, b) => a.e.quote.length - b.e.quote.length)[0];
  return { key: h.key, name: h.name, prop: h.prop, propName: h.propName, count: list.length, base: hopesBase, quote: q ? { quote: q.e.quote, source: q.e.source, who: q.f.label } : null };
}) : [];
const up = (c) => fans.filter((f) => f.feel[c] === "positive").length;
const asked = (c) => fans.filter((f) => f.feel[c]).length;
// the contrast: positive about the first condition, not about the last (both answered, both quoted)
const [cA, cB] = [conds[0], conds[conds.length - 1]];
const swingList = fans.map((f, i) => ({ f, i })).filter(({ f }) => f.feel[cA.key] === "positive" && f.feel[cB.key] && f.feel[cB.key] !== "positive");
const swing = swingList.find(({ f }) => f.evidence[cA.dim] && f.evidence[cB.dim]);

// ---------- facts: the only source of numbers in copy ----------
const facts = {
  n: fans.length, complete: fans.filter((f) => f.complete).length, partial: fans.filter((f) => !f.complete).length, reportN: cfg.study.reportN,
  up: Object.fromEntries(conds.map((c) => [c.key, up(c.key)])), asked: Object.fromEntries(conds.map((c) => [c.key, asked(c.key)])),
  block: Object.fromEntries(blocks.map((b, i) => [b.key, { size: b.fans.length, ...blockStats[i] }])),
  sizes: blocks.map((b) => b.fans.length).join(" / "),
  hope: Object.fromEntries(hopes.map((h) => [h.key, h])), hopesBase,
  top: hopes.slice().sort((a, b) => b.count - a.count)[0] || null,
  swing: { count: swingList.length, label: swing ? swing.f.label : "" },
  recon: Object.fromEntries(recon.map((x, i) => [i, x])),
  coded: Object.fromEntries(Object.entries(cfg.countFacts || {}).map(([k, f]) => [k, rows.filter((r) => all(r, f)).length])),
};
facts.study = cfg.study;
const { get, fill, fillAll, check } = makeCopy(facts);

// ---------- claims: copy that says "all", "most", "more" names the fact behind it, and the build checks it ----------
check(cfg.assert);

// ---------- spec ----------
const bi = (key) => { const i = blocks.findIndex((b) => b.key === key); if (i < 0) throw new Error("unknown block " + key); return i; };
const q = (x) => (x ? { quote: x.quote, source: x.source, who: x.who } : null);
function beat(b, i) {
  const where = `tour[${i}]`;
  const out = { hold: b.hold, act: b.act, title: fill(b.title, where + ".title", { title: true }), caption: fill(b.caption, where + ".caption") };
  if (b.block) out.block = bi(b.block);
  if (b.hope === "top") out.hope = hopes.indexOf(facts.top);
  else if (b.hope) out.hope = hopes.findIndex((h) => h.key === b.hope);
  if (b.follow === "swing") { if (!swing) return null; out.follow = swing.i; out.quote = { quote: swing.f.evidence[cB.dim].quote, source: swing.f.evidence[cB.dim].source, who: swing.f.label }; }
  if (b.tension) out.tension = true;
  if (b.quote) {
    const [kind, key, cond] = b.quote.split(":");
    out.quote = kind === "block" ? q(blockStats[bi(key)][cond].quote) : kind === "hope" ? q(key === "top" ? facts.top.quote : facts.hope[key].quote) : null;
  }
  return out;
}
const page = cfg.page;
const spec = {
  _source: `pattern crowd · coding ${join(dir, "codes/merged.json")} · config ${join(dir, "scene.json")}`,
  study: { ...cfg.study, n: fans.length, complete: facts.complete },
  object: cfg.world || "stadium",
  acts: conds.map((c) => ({ key: c.key, name: c.name, when: c.when, code: c.dim, dressing: c.dressing, report: { count: c.report[0], base: c.report[1] }, up: up(c.key) })),
  blocks, blockStats, hopes, fans,
  figure: { ...cfg.figure, label: fill(cfg.figure.label, "figure.label"), caption: fill(cfg.figure.caption, "figure.caption"), titleBlock: cfg.figure.titleBlock.map(([k, v], i) => [k, fill(v, `figure.titleBlock[${i}]`)]) },
  tension: cfg.tension ? { label: fill(cfg.tension.label, "tension.label", { title: true }), event: "wave", act: cfg.tension.act, numbers: fillAll(cfg.tension.numbers, "tension.numbers") } : null,
  page: {
    frame: fill(page.frame, "page.frame"), headline: fill(page.headline, "page.headline", { title: true }), dek: fill(page.dek, "page.dek"),
    blocksHeading: fill(page.blocksHeading, "page.blocksHeading"), hopesHeading: fill(page.hopesHeading, "page.hopesHeading"),
    segmentNote: page.segmentNote ? page.segmentNote.replace(/\{lit:([^}]*)\}/g, "$1") : "",
    headlineStats: page.headlineStats,   // the report's own numbers, copied from get_study_analysis
    notes: fillAll(page.notes, "page.notes"),
  },
  scripts: cfg.tour ? { tour: { title: "The tour", label: "The tour", beats: cfg.tour.map(beat).filter(Boolean) } } : {},
};
mkdirSync(join(dir, "specs"), { recursive: true });
writeFileSync(join(dir, "specs/scene.figure.json"), JSON.stringify(spec, null, 2));
console.log(`crowd spec: ${fans.length} respondents · ${blocks.map((b) => `${b.key} ${b.fans.length}`).join(", ")} · up ${conds.map((c) => `${c.key} ${up(c.key)}/${asked(c.key)}`).join(", ")}${hopes.length ? " · hopes " + hopes.map((h) => h.key + " " + h.count).join(", ") : ""}`);
