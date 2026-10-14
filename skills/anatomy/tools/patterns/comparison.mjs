// Comparison pattern: 2–4 named options compared on the same measures, benches built identically so none gets more
// visual weight; optional waves (a tracker's cohorts) drawn as ghost needles. World: workbench.
//
// usage: node tools/patterns/comparison.mjs <study dir>     (scene.json [+ waves file] → specs/scene.figure.json)
// config: the workbench spec shape (study { n, toolBase }, figure, benches [{ key, name, users, appeal, trust, reasons,
// … }], modules, page, scripts, tension) with copy as templates, plus optional
//   wavesFrom: { file, minN, keys: { <bench key>: "<key in the file>" }, note }   (counted from closed answers)
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runReportPattern } from "./lib.mjs";
const dir = process.argv[2];
if (!dir) { console.error("usage: node tools/patterns/comparison.mjs <study dir>"); process.exit(2); }
const spec = runReportPattern(dir, {
  name: "comparison",
  validate(cfg) {
    const base = cfg.study.toolBase ?? cfg.study.n, b = cfg.benches;
    if (b.length < 2 || b.length > 4) throw new Error(`comparison takes 2–4 benches, got ${b.length}`);
    b.forEach((x) => {
      if (!Number.isInteger(x.users) || x.users < 0 || x.users > base) throw new Error(`bench ${x.key}: users ${x.users} is not 0–${base}`);
      for (const m of ["appeal", "trust"]) if (x[m] != null && (x[m] < 0 || x[m] > 100)) throw new Error(`bench ${x.key}: ${m} ${x[m]} is not a 0–100 share`);
    });
  },
  attach(cfg) {
    if (!cfg.wavesFrom) return {};
    const Wc = cfg.wavesFrom, W = JSON.parse(readFileSync(join(dir, Wc.file), "utf8")), MIN = Wc.minN ?? 30;
    const pct = (x) => (x && x.asked >= MIN ? Math.round((x.top2 / x.asked) * 1000) / 10 : null);
    // waves keep only cohorts with completed interviews; a bench the report gives no rating for stays capped in every wave
    const list = W.cohorts.filter((c) => c.n_complete > 0).map((c) => ({ key: c.key, label: c.label, n: c.n_complete, base: c.n_answered_q5,
      benches: cfg.benches.map((b) => { const k = Wc.keys[b.key], rated = b.appeal != null;
        return { users: c.users[k], appeal: rated ? pct(c.appeal[k]) : null, trust: rated ? pct(c.trust[k]) : null, appealN: c.appeal[k] ? c.appeal[k].asked : 0, trustN: c.trust[k] ? c.trust[k].asked : 0 }; }) }));
    const empty = W.cohorts.filter((c) => c.n_complete === 0).map((c) => c.label);
    const facts = { waves: { listText: list.map((w) => `${w.label} (${w.n})`).join(" and "), emptyText: empty.length ? "; " + empty.join(", ") + " are set up but empty" : "", allN: W.all.n_complete, minN: MIN } };
    return { spec: { waves: { source: Wc.file, minN: MIN, list, empty, note: Wc.note } }, facts };
  },
});
console.log(`comparison spec: ${spec.benches.map((b) => `${b.key} ${b.users}`).join(" · ")}${spec.waves ? ` · ${spec.waves.list.length} waves` : ""}`);
