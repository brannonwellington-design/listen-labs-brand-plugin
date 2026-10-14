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
