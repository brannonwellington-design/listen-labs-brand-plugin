// Sort pattern: one sample sorted many ways, told as chapters. Exclusive chapters sort every token into columns that
// sum to n; multi-mention chapters pull drawers out by count. A followed respondent is placed in each chapter by their
// own coded answer. World: sortbench.
//
// usage: node tools/patterns/sort.mjs <study dir>     (scene.json + codes/merged.json → specs/scene.figure.json)
// config: the sortbench spec shape (study, figure, steps [{ key, kicker, title, body, stat, sorter | cabinet, follow }],
// page, scripts, tension, predicates) with copy as templates, plus
//   people: { codes?, filter, prefix: "C", method, privacyNote }
import { runReportPattern } from "./lib.mjs";
const dir = process.argv[2];
if (!dir) { console.error("usage: node tools/patterns/sort.mjs <study dir>"); process.exit(2); }
const spec = runReportPattern(dir, {
  name: "sort",
  validate(cfg) {
    const n = cfg.study.n;
    cfg.steps.forEach((s) => {
      if (!!s.sorter === !!s.cabinet) throw new Error(`chapter ${s.key}: needs exactly one of sorter (exclusive) or cabinet (multi-mention)`);
      const counts = (s.sorter || s.cabinet).counts;
      if (counts.some((c) => !Number.isInteger(c) || c < 0 || c > n)) throw new Error(`chapter ${s.key}: counts must be 0–${n}`);
      if (s.sorter && counts.reduce((a, b) => a + b, 0) !== n) throw new Error(`chapter ${s.key}: an exclusive sort must place all ${n} (counts sum to ${counts.reduce((a, b) => a + b, 0)})`);
      if (s.sorter && counts.length > 5) throw new Error(`chapter ${s.key}: a sorter has at most 5 columns`);
      if (s.cabinet && counts.length > 7) throw new Error(`chapter ${s.key}: a cabinet has at most 7 drawers`);
      if (s.follow) { const k = s.follow.multi ? s.follow.multi.length : s.follow.values.length; if (k !== counts.length) throw new Error(`chapter ${s.key}: ${counts.length} columns/drawers but the follow map has ${k}`); }
      if (s.follow?.lit && !cfg.predicates?.[s.follow.lit]) throw new Error(`chapter ${s.key}: unknown predicate ${s.follow.lit}`);
    });
  },
  attach(cfg, rows, recon, codesFile) {
    if (!cfg.people) return {};
    const P = cfg.people;
    const customers = rows.map((r, i) => ({ label: (P.prefix || "C") + String(i + 1).padStart(2, "0"), readableId: r.readable_id, codes: r.codes, evidence: r.evidence }));
    return { spec: { customers, customerCoding: { codes: codesFile, recon, method: P.method, ...(P.privacyNote ? { privacyNote: P.privacyNote } : {}) } }, keep: ["customers", "customerCoding"] };
  },
});
console.log(`sort spec: ${spec.steps.length} chapters (${spec.steps.filter((s) => s.sorter).length} sorts, ${spec.steps.filter((s) => s.cabinet).length} cabinets)${spec.customers ? ` · ${spec.customers.length} people` : ""}`);
