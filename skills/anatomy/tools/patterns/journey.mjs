// Journey pattern: ordered stages of one experience, each with the report's count of n; carriers ride past every
// station, and a followed respondent stops where their own coded words do. Worlds: conveyor, aisle (conveyor@aisle).
// The config holds the report's stations and copy; the coding attaches the people. Counts may overlap (not a funnel).
//
// usage: node tools/patterns/journey.mjs <study dir>     (scene.json + codes/merged.json → specs/scene.figure.json)
// config: documented in references/patterns.md ("Journey config"), with a synthetic example in examples/journey;
// copy is written as templates over the facts, plus
//   people: { codes?, filter: [<filter>], prefix: "P", fields: { lastOrder: "<row field>" }, method }
import { runReportPattern } from "./lib.mjs";
const dir = process.argv[2];
if (!dir) { console.error("usage: node tools/patterns/journey.mjs <study dir>"); process.exit(2); }
const spec = runReportPattern(dir, {
  name: "journey",
  validate(cfg) {
    const n = cfg.study.n, st = cfg.stations;
    if (st.length < 3 || st.length > 5) throw new Error(`journey takes 3–5 stations, got ${st.length}`);
    st.forEach((s) => { if (!Number.isInteger(s.count) || s.count < 0 || s.count > n) throw new Error(`station ${s.key}: count ${s.count} is not 0–${n}`); });
  },
  attach(cfg, rows, recon, codesFile) {
    if (!cfg.people) return {};
    const P = cfg.people;
    rows.forEach((r) => cfg.stations.forEach((s) => { if (s.code && !(s.code in (r.codes || {}))) throw new Error(`respondent ${r.readable_id} has no code ${s.code} (station ${s.key})`); }));
    // a station's code is a stop only when it is true, or one of the values the station lists in codeOn: a coded
    // "none" (never asked) or "no" must never count as a stop
    const stopAt = (s, v) => v === true || (Array.isArray(s.codeOn) && s.codeOn.includes(v));
    cfg.stations.forEach((s) => { if (!s.code) return; const odd = rows.map((r) => r.codes[s.code]).find((v) => typeof v !== "boolean" && !(s.codeOn || []).includes(v) && v != null && v !== "none" && v !== false);
      if (odd !== undefined && !s.codeOn) throw new Error(`station ${s.key}: code ${s.code} has the value "${odd}"; code it true/false, or list the values that mean a stop in codeOn`); });
    const stations = cfg.stations.map((s) => ({ ...s, ...(s.code ? { transcriptCount: rows.filter((r) => stopAt(s, r.codes[s.code])).length } : {}) }));
    const shoppers = rows.map((r, i) => ({ label: (P.prefix || "P") + String(i + 1).padStart(2, "0"), readableId: r.readable_id, uuid: r.response_uuid,
      ...Object.fromEntries(Object.entries(P.fields || {}).map(([k, f]) => [k, r[f] ?? r.closed?.[f] ?? null])),
      codes: { ...r.codes, ...Object.fromEntries(cfg.stations.filter((s) => s.code).map((s) => [s.code, stopAt(s, r.codes[s.code])])) }, evidence: r.evidence }));
    return { spec: { stations, shoppers, study: { ...cfg.study, coded: rows.length }, evidence: { codes: codesFile, method: P.method } }, keep: ["shoppers", "evidence"] };
  },
});
console.log(`journey spec: ${spec.stations.map((s) => `${s.key} ${s.count}${s.transcriptCount != null ? `/${s.transcriptCount} coded` : ""}`).join(" · ")}${spec.shoppers ? ` · ${spec.shoppers.length} people` : ""}`);
