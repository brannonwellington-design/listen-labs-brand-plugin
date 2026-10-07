#!/usr/bin/env node
// Extract a numbered fact sheet from a Listen Labs study analysis (the markdown returned by get_study_analysis).
// Deterministic parsing — no model reads prose for numbers. Every figure a video may show must come from here.
//
// Usage: node extract-facts.mjs <analysis.md | analysis.json> [--out facts.json] [--study-id <id>]
//   analysis.json may be the raw MCP result ({ "report_markdown": "…" }).
//
// Output: { study: {title, n, id}, facts: [ {id, kind, key, …} ], warnings: [] }
//   kind "scalar"   — value, unit, count?, base?, filter?, title, description
//   kind "series"   — items [{label, value, unit, count?, base?, factId}] from scalars sharing a chart key; complete: bool
//   kind "chart"    — title, type, description, categories?, n? (values not in the report unless a series covers them)
//   kind "verbatim" — text (exact), source (link) — only quotes that carry a [Source] link
//   kind "statement" — a prose sentence and the figures in it (incl. ordinals: "third" → 3)

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : fallback; };
const OUT = flag('--out', null), STUDY_ID = flag('--study-id', null);
const INPUT = path.resolve(args[0] || 'analysis.md');
let md = readFileSync(INPUT, 'utf8');
if (INPUT.endsWith('.json')) md = JSON.parse(md).report_markdown;

const warnings = [];
const facts = [];
let nextId = 1;
const add = f => { const fact = { id: `F${nextId++}`, ...f }; facts.push(fact); return fact; };

/* ---------- study ---------- */
const title = (md.match(/^#\s+(.+)$/m) || [])[1]?.trim() || 'Untitled study';

/* ---------- appendix blocks: ### Scalar / ### Chart / ### Reel ---------- */
const blocks = md.split(/\n(?=### (?:Scalar|Chart|Reel): )/).slice(1).map(b => b.trim());
const field = (b, name) => (b.match(new RegExp(`^${name}:\\s*(.+)$`, 'm')) || [])[1]?.trim();
const head = b => { const m = b.match(/^### (Scalar|Chart|Reel): (.+) \(([^()]+)\)\s*$/m); return m ? { type: m[1], title: m[2].trim(), key: m[3].trim() } : null; };

function parseValue(raw) {
  // "67% (197 out of 293)" · "300" · "46.7" · "86 (out of 298)" · "24% (71 out of 300)"
  const m = raw.match(/^(-?[\d,]*\.?\d+)\s*(%|×|x)?\s*(?:\((?:(\d[\d,]*)\s+)?out of\s+(\d[\d,]*)\))?/);
  if (!m) return null;
  const num = s => (s == null ? undefined : +s.replace(/,/g, ''));
  return { value: num(m[1]), unit: m[2] === 'x' ? '×' : (m[2] || ''), count: num(m[3]), base: num(m[4]) };
}
const scalars = [], charts = [];
for (const b of blocks) {
  const h = head(b);
  if (!h) { warnings.push(`unparsed block: ${b.split('\n')[0].slice(0, 80)}`); continue; }
  if (h.type === 'Scalar') {
    const raw = field(b, 'Value'), v = raw && parseValue(raw);
    if (!v) { warnings.push(`${h.key}: unparsed value “${raw}”`); continue; }
    const desc = (field(b, 'Description') || '').replace('{{value}}', `${v.value}${v.unit}`);
    const filter = field(b, 'Row filter');
    scalars.push({ kind: 'scalar', key: h.key, title: h.title, description: desc, ...v, ...(filter ? { filter: filter.split(' = ').pop() } : {}) });
  } else if (h.type === 'Chart') {
    const cats = field(b, 'Primary filter');
    const conf = b.match(/Confidence:\s*\w+\s*\((\d[\d,]*) respondents\)/);
    charts.push({
      kind: 'chart', key: h.key, title: h.title, type: field(b, 'Chart type') || '', description: field(b, 'Description') || '',
      ...(cats ? { categories: cats.split(/,\s*/) } : {}), ...(conf ? { n: +conf[1].replace(/,/g, '') } : {}),
      ...(field(b, 'Row filter') ? { filter: field(b, 'Row filter').split(' = ').pop() } : {}),
    });
  }
  // Reels: quotes without [Source] links are not usable as on-screen verbatims (no attribution); skipped by design.
}

/* ---------- study n ---------- */
const total = scalars.find(s => /^total_?interviews$/i.test(s.key));
if (!total) warnings.push('no totalInterviews scalar — study n unknown');

/* ---------- scalars → facts, then series from shared chart keys ---------- */
const scalarFacts = scalars.map(s => add(s));
const byParent = {};
scalarFacts.forEach(f => { const dot = f.key.indexOf('.'); if (dot > 0) (byParent[f.key.slice(0, dot)] ||= []).push(f); });
for (const [parent, all] of Object.entries(byParent)) {
  if (all.length < 2) continue;
  const chart = charts.find(c => c.key === parent);
  // Item labels: a trailing "(Label)" in the title, else the wording that differs before a suffix most titles share
  // ("Mango in self-picked variety pack" → "Mango"). Scalars that don't share the suffix stay standalone.
  let members = all, label;
  if (all.every(f => /\([^()]+\)\s*$/.test(f.title))) label = f => f.title.match(/\(([^()]+)\)\s*$/)[1].trim();
  else {
    const counts = {};
    all.forEach(f => { const w = f.title.split(/\s+/); for (let k = 2; k <= Math.min(6, w.length - 1); k++) { const suf = w.slice(-k).join(' '); counts[suf] = (counts[suf] || 0) + 1; } });
    const best = Object.entries(counts).filter(([, c]) => c >= 2).sort((x, y) => y[1] - x[1] || y[0].length - x[0].length)[0];
    if (!best) continue;
    members = all.filter(f => f.title.endsWith(' ' + best[0]));
    label = f => f.title.slice(0, -best[0].length).trim();
    if (members.length < 2) continue;
  }
  const unit = members[0].unit;
  const complete = chart && chart.categories ? chart.categories.length === members.length : false;
  add({
    kind: 'series', key: parent, title: chart ? chart.title : members[0].title.replace(/\s*\([^()]+\)\s*$/, ''),
    description: chart ? chart.description : '', unit,
    items: members.map(f => {
      const l = label(f), [group, period] = l.includes(' > ') ? l.split(' > ') : [null, null];
      return { label: l, ...(group ? { group, period } : {}), value: f.value, unit: f.unit, ...(f.count != null ? { count: f.count } : {}), ...(f.base != null ? { base: f.base } : {}), factId: f.id };
    }),
    complete, ...(chart && chart.n ? { n: chart.n } : {}), ...(chart && chart.filter ? { filter: chart.filter } : {}),
    ...(!complete ? { note: chart && chart.categories ? `report gives ${members.length} of ${chart.categories.length} categories` : 'report lists only some values — do not present as a full ranking' } : {}),
  });
}
charts.forEach(c => add(c));

/* ---------- verbatims: exact quote text tied to a [Source] link ---------- */
const body = md.split(/\n### (?:Scalar|Chart|Reel): /)[0];
const seen = new Set();
const pushQuote = (text, source, how) => {
  text = text.trim().replace(/\s+/g, ' ');
  if (text.length < 8 || seen.has(text)) return;
  seen.add(text);
  // a few quoted words inside the analyst's sentence: real, but too partial to stand alone on screen
  const fragment = text.split(/\s+/).length < 8;
  add({ kind: 'verbatim', text, source, how, ...(fragment ? { fragment: true, note: 'fragment — do not use as a standalone on-screen quote' } : {}) });
};
// 1. "quoted text" [Source](url)  — straight or curly quotes
for (const m of body.matchAll(/["“]([^"“”]{8,}?)["”]\s*\[Source\]\((https?:[^)\s]+)\)/g)) pushQuote(m[1], m[2], 'quoted');
// 2. a paragraph that is nothing but the quote and its link
for (const para of body.split(/\n{2,}/)) {
  const m = para.trim().match(/^([^\[\]"“”*#\-][^\[\]]{10,}?)\s*\[Source\]\((https?:[^)\s]+)\)\s*$/);
  if (m && !/^(One|Others|This|The|They|Participants)\b/.test(m[1])) pushQuote(m[1], m[2], 'standalone');
}
// 3. "…described: <quote> [Source](url)" — introduced by a colon
for (const m of body.matchAll(/described:\s+([^"“\[]{10,}?)\s*\[Source\]\((https?:[^)\s]+)\)/g)) pushQuote(m[1], m[2], 'colon');

/* ---------- statements: figures that live only in the report's prose ("all 1,140 possible combinations") ---------- */
const ORD = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10 };
const keys = new Set(scalars.map(x => x.key).concat(charts.map(c => c.key)));
const prose = body.replace(/["“][^"“”]*["”]\s*\[Source\]\([^)]+\)/g, '').replace(/\[Source\]\([^)]+\)/g, '').replace(/https?:\S+/g, '');   // participants' words are verbatims, not findings
for (const sentence of prose.split(/(?<=[.!?])\s+|\n+/)) {
  const clean = sentence.replace(/\*\*/g, '').trim();
  if (!clean || clean.startsWith('#') || clean.split(/\s+/).length < 5) continue;   // list markers and fragments aren't findings
  const words = clean.split(/\s+/).filter(w => !keys.has(w.replace(/[(),.;:]/g, '')));
  const text = words.join(' ');
  const nums = [...text.matchAll(/(?<![\w-])(\d[\d,]*(?:\.\d+)?)(?![\w])/g)].map(m => +m[1].replace(/,/g, ''));
  const ords = [...text.toLowerCase().matchAll(/\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\b/g)].map(m => ORD[m[1]]);
  const hyph = [...text.matchAll(/\b(\d+)-(?:flavor|item|point|pack)/g)].map(m => +m[1]);
  const all = [...new Set([...nums, ...ords, ...hyph])].filter(n => !(n >= 1900 && n <= 2100));   // skip years
  if (all.length) add({ kind: 'statement', text, numbers: all });
}

const out = {
  study: { title, n: total ? total.value : null, ...(STUDY_ID ? { id: STUDY_ID } : {}) },
  facts, warnings,
  counts: { statements: facts.filter(f => f.kind === 'statement').length, scalars: scalarFacts.length, series: facts.filter(f => f.kind === 'series').length, charts: charts.length, verbatims: facts.filter(f => f.kind === 'verbatim').length },
};
const dest = path.resolve(OUT || INPUT.replace(/\.(md|json)$/, '.facts.json'));
writeFileSync(dest, JSON.stringify(out, null, 2));
console.log(`${title} · n = ${out.study.n}\n${JSON.stringify(out.counts)}${warnings.length ? '\nwarnings:\n  ' + warnings.join('\n  ') : ''}\nwrote ${dest}`);
