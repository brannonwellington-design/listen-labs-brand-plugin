#!/usr/bin/env node
// Validate a storyboard against its fact sheet before any audio or render. The guarantee behind automation:
// every number on screen or in narration traces to a cited fact (or to declared arithmetic on cited facts),
// every quote is a verbatim with a source, every scene has an execution that fits its data, and the copy
// fits the layout and the length.
//
// Usage: node validate-storyboard.mjs <story.json> --facts <facts.json> [--json]
// Exit 1 on errors. Warnings never block. --json prints { ok, errors, warnings } for the repair loop.
//
// Scene fields the validator reads: id, family|template, data, head, note, facts: ["F12", …],
// derived?: [{ value, op: "ratio"|"difference"|"sum"|"count", of: [n|"F12", …], round?: "floor"|"round" }].
// Story fields: study, targetSeconds?, narrationMode?, beats?, narrateQuotes?

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : fallback; };
const AS_JSON = args.includes('--json') && !!args.splice(args.indexOf('--json'), 1);
const FACTS = flag('--facts', null);
const story = JSON.parse(readFileSync(path.resolve(args[0] || 'story.json'), 'utf8'));
const factSheet = JSON.parse(readFileSync(path.resolve(FACTS), 'utf8'));
const { FAMILIES, TEMPLATES } = createRequire(import.meta.url)(path.join(HERE, '..', 'library', 'library.js'));

const errors = [], warnings = [];
const E = (where, msg) => errors.push(`${where}: ${msg}`), W = (where, msg) => warnings.push(`${where}: ${msg}`);
const factById = Object.fromEntries(factSheet.facts.map(f => [f.id, f]));
const STUDY_N = factSheet.study.n;

/* ---------- numbers a fact makes available ---------- */
function factNumbers(f) {
  const out = [];
  const push = (v, unit) => { if (typeof v === 'number' && isFinite(v)) out.push({ v, unit: unit || '' }); };
  if (f.kind === 'scalar') { push(f.value, f.unit); push(f.count); push(f.base); }
  if (f.kind === 'series') { f.items.forEach(i => { push(i.value, i.unit); push(i.count); push(i.base); }); push(f.n); push(f.items.length); }
  if (f.kind === 'chart') { push(f.n); if (f.categories) push(f.categories.length); }
  if (f.kind === 'statement') f.numbers.forEach(n => push(n));
  [f.title, f.description].filter(Boolean).forEach(t => [...t.matchAll(/(?<![\w.])(\d[\d,]*(?:\.\d+)?)/g)].forEach(m => push(+m[1].replace(/,/g, ''))));
  return out;
}
const close = (a, b) => Math.abs(a - b) < 1e-6;

/* ---------- spoken numbers → values ("one hundred forty-eight", "eleven hundred forty", "sixty-three percent") ---------- */
const UNITS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const ORD = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5 };
function spokenNumbers(text) {
  const toks = text.toLowerCase().replace(/[-–]/g, ' ').replace(/[^a-z0-9.' ]/g, ' ').split(/\s+/).filter(Boolean);
  const found = []; let cur = null, total = 0, pointMode = false, dec = '';
  const flush = () => { if (cur !== null || total) { let v = total + (cur || 0); if (dec) v = +(`${v}.${dec}`); found.push(v); } cur = null; total = 0; pointMode = false; dec = ''; };
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (pointMode && t in UNITS) { dec += UNITS[t]; continue; }
    if (t in UNITS) { cur = (cur || 0) + UNITS[t]; continue; }
    if (t in TENS) { cur = (cur || 0) + TENS[t]; continue; }
    if (t === 'hundred') { cur = (cur || 1) * 100; continue; }
    if (t === 'thousand') { total += (cur || 1) * 1000; cur = null; continue; }
    if (t === 'and' && (cur !== null || total) && toks[i + 1] && (toks[i + 1] in UNITS || toks[i + 1] in TENS)) continue;
    if (t === 'point' && (cur !== null || total)) { pointMode = true; continue; }
    if (t === 'a' && toks[i + 1] === 'hundred') { cur = 1; continue; }
    flush();
    if (t in ORD) found.push(ORD[t]);
  }
  flush();
  // "one" used as a pronoun ("One participant", "one reaches") is not a figure
  return found.filter((v, i) => !(v === 1 && /\bone\s+(participant|reaches|of|person|thing|line)\b/.test(text.toLowerCase())));
}
const digitNumbers = text => [...String(text).replace(/&#160;/g, ' ').matchAll(/(?<![\w.#])(\d[\d,]*(?:\.\d+)?)(\s*%)?/g)].map(m => ({ v: +m[1].replace(/,/g, ''), unit: m[2] ? '%' : '' }));

/* ---------- structure ---------- */
if (!Array.isArray(story.scenes) || !story.scenes.length) E('story', 'no scenes');
if (!story.study) E('story', 'missing study title');
const ids = new Set();
const SHAPES = {
  ranking: d => Array.isArray(d.items) && d.items.length >= 2 && d.items.every(i => typeof i.label === 'string' && typeof i.value === 'number'),
  partWhole: d => typeof d.pct === 'number' && d.pct >= 0 && d.pct <= 100 && (d.count == null || (typeof d.base === 'number' && d.count <= d.base)),
  comparison: d => d.a && d.b && typeof d.a.value === 'number' && typeof d.b.value === 'number',
  scale: d => Array.isArray(d.items) && d.items.length >= 2 && d.items.every(i => typeof i.value === 'number'),
  quote: d => typeof d.text === 'string' && typeof d.who === 'string',
  count: d => typeof d.n === 'number' && d.n > 0,
};
const TSHAPES = {
  nodeRing: d => typeof d.n === 'number' && Array.isArray(d.picks),
  comboRing: d => typeof d.n === 'number' && Array.isArray(d.winner) && d.winner.length === 3 && Array.isArray(d.labels),
  strikeRow: d => typeof d.header === 'string' && Array.isArray(d.items) && d.items.length >= 2 && d.items.length <= 6,
  endRow: d => typeof d.title === 'string' && Array.isArray(d.items) && d.items.length >= 2 && d.items.length <= 4 && typeof d.study === 'string',
};
const verbatims = factSheet.facts.filter(f => f.kind === 'verbatim');
const normQuote = s => s.replace(/[“”"]/g, '').replace(/[’]/g, "'").replace(/\s+/g, ' ').trim();
const textW = (s, size) => String(s).replace(/&#160;/g, ' ').length * size * 0.56;

story.scenes.forEach(sc => {
  const where = `scene ${sc.id || '?'}`;
  if (!sc.id) E(where, 'missing id');
  if (ids.has(sc.id)) E(where, 'duplicate id'); ids.add(sc.id);
  if (!(sc.dur > 0)) E(where, 'dur must be a positive number of seconds');
  const d = sc.data || {};
  if (sc.family) {
    if (!FAMILIES[sc.family]) { E(where, `unknown family “${sc.family}” (have: ${Object.keys(FAMILIES).join(', ')})`); return; }
    if (!SHAPES[sc.family](d)) { E(where, `data doesn't match the ${sc.family} shape`); return; }
    const fitting = Object.entries(FAMILIES[sc.family]).filter(([, ex]) => ex.fits(d)).map(([id]) => id);
    if (!fitting.length) E(where, `no ${sc.family} execution fits this data`);
    if (sc.execution && !fitting.includes(sc.execution)) E(where, `pinned execution ${sc.execution} doesn't fit this data (fitting: ${fitting.join(', ')})`);
  } else if (sc.template) {
    if (!TEMPLATES[sc.template]) { E(where, `unknown template “${sc.template}”`); return; }
    if (TSHAPES[sc.template] && !TSHAPES[sc.template](d)) E(where, `data doesn't match the ${sc.template} template`);
  } else E(where, 'needs a family or a template');

  /* facts cited */
  const cited = (sc.facts || []).map(id => factById[id] || (E(where, `cites unknown fact ${id}`), null)).filter(Boolean);
  const isQuote = sc.family === 'quote' || sc.template === 'quote', isEnd = sc.template === 'endRow';
  if (!cited.length && !isEnd) E(where, 'cites no facts (scene.facts)');

  /* numbers must trace */
  const allowed = [{ v: STUDY_N, unit: '' }, ...cited.flatMap(factNumbers)];
  (d.items || []).length && allowed.push({ v: d.items.length, unit: '' });
  (sc.derived || []).forEach((dv, k) => {
    const ops = dv.of.map(o => (typeof o === 'number' ? o : (factById[o] ? (factById[o].value ?? factById[o].numbers?.[0]) : NaN)));
    const opsOk = dv.of.every((o, i) => typeof o === 'string' ? cited.some(f => f.id === o) : allowed.some(a => close(a.v, ops[i])));
    if (!opsOk) { E(where, `derived[${k}] uses a number that isn't from a cited fact`); return; }
    let r = dv.op === 'ratio' ? ops[0] / ops[1] : dv.op === 'difference' ? ops[0] - ops[1] : dv.op === 'sum' ? ops.reduce((a, b) => a + b, 0) : dv.op === 'count' ? ops.length : NaN;
    r = dv.round === 'floor' ? Math.floor(r) : dv.round === 'round' ? Math.round(r) : r;
    if (!close(r, dv.value)) E(where, `derived[${k}] says ${dv.value} but ${dv.op}(${ops.join(', ')}) = ${+r.toFixed(3)}`);
    else allowed.push({ v: dv.value, unit: dv.unit || '' });
  });
  const check = (v, unit, from) => {
    if (typeof v !== 'number' || !isFinite(v)) return;
    const hit = allowed.filter(a => close(a.v, v));
    if (!hit.length) E(where, `${from}: ${v}${unit} doesn't trace to a cited fact${cited.length ? ` (${cited.map(f => f.id).join(', ')})` : ''}`);
    else if (unit === '%' && !hit.some(a => a.unit === '%' || a.unit === '')) E(where, `${from}: ${v}% — the matching fact isn't a percentage`);
  };
  const h = sc.head || {};
  if (h.big) check(h.big.value, h.big.unit === '%' ? '%' : '', 'headline');
  ['title', 'l1', 'l2'].forEach(k => h[k] && digitNumbers(h[k]).forEach(n => check(n.v, n.unit, k)));
  if (sc.note) digitNumbers(sc.note).forEach(n => check(n.v, n.unit, 'note'));
  const walk = (o, p) => { if (o && typeof o === 'object') Object.entries(o).forEach(([k, v]) => {
    if (['picks', 'winner', 'runners', 'after'].includes(k)) return;   // ring indices / gap position, not figures
    if (typeof v === 'number') check(v, k === 'pct' || (k === 'value' && d.unit === '%') ? '%' : '', `data.${p}${k}`);
    else if (typeof v === 'string' && !isQuote) digitNumbers(v).forEach(n => check(n.v, n.unit, `data.${p}${k}`));
    else if (typeof v === 'object') walk(v, `${p}${k}.`);
  }); };
  walk(d, '');
  if (sc.narration) { if (/\d/.test(sc.narration)) E(where, 'narration has digits — write numbers as words'); spokenNumbers(sc.narration).forEach(v => check(v, '', 'narration')); }

  /* quotes are verbatims with sources */
  if (isQuote) {
    const v = verbatims.find(q => normQuote(q.text) === normQuote(d.text || ''));
    if (!v) E(where, 'quote text is not an exact verbatim from the fact sheet');
    else if (v.fragment) E(where, `${v.id} is a fragment of a sentence — use a full verbatim`);
    else if (!(sc.facts || []).includes(v.id)) E(where, `cite the verbatim's fact (${v.id})`);
    if (/\b[A-Z][a-z]+ [A-Z][a-z]+\b/.test((d.who || '').replace(/^—\s*/, '').replace(/\bParticipant\b.*/, ''))) W(where, 'attribution looks like a real name — use a participant label');
  }

  /* partial series must not read as a full ranking */
  cited.filter(f => f.kind === 'series' && !f.complete).forEach(f => {
    if (sc.family === 'ranking' && !d.gap && !/top|of \d+|shown|selected/i.test(`${sc.note || ''} ${h.l1 || ''} ${h.title || ''}`))
      W(where, `${f.id} is a partial series (${f.note || 'incomplete'}) — add a gap row or say it's a selection`);
  });
  /* small bases read as counts */
  cited.filter(f => f.base != null && f.base < 50 && f.unit === '%').forEach(f => W(where, `${f.id} has a small base (n = ${f.base}) — show it as a count (“${f.count} of ${f.base}”)`));

  /* layout fit */
  if (sc.note && textW(sc.note, 16) > 476) E(where, `note too long for 9:16 (${Math.round(textW(sc.note, 16))}px > 476px) — shorten it`);
  if (h.l1 && textW(h.l1, 32) > 476 * 2) W(where, 'line 1 wraps to 3+ lines at 9:16 — shorten it');
});

/* ---------- variety, length, narration ---------- */
const templates = story.scenes.filter(s => s.template && s.template !== 'endRow').map(s => s.template);
templates.filter((t, i) => templates.indexOf(t) !== i).forEach(t => W('story', `template ${t} used more than once`));
for (const fam of Object.keys(FAMILIES)) {
  const scenes = story.scenes.filter(s => s.family === fam);
  if (scenes.length > 1) {
    const execs = Object.keys(FAMILIES[fam]).length;
    if (scenes.length > execs) W('story', `${scenes.length} ${fam} scenes but only ${execs} executions — some will repeat`);
  }
}
const total = story.scenes.reduce((a, s) => a + (s.dur || 0), 0);
if (story.targetSeconds && Math.abs(total - story.targetSeconds) > story.targetSeconds * 0.2) W('story', `planned length ${total.toFixed(1)}s vs target ${story.targetSeconds}s`);
const mode = story.narrationMode || (story.targetSeconds && story.targetSeconds < 45 ? 'beats' : 'scenes');
if (story.beats) story.beats.forEach(b => {
  if (/\d/.test(b.narration || '')) E(`beat ${b.id}`, 'narration has digits — write numbers as words');
  const allowed = b.scenes.flatMap(id => { const sc = story.scenes.find(s => s.id === id); return sc ? [STUDY_N, ...(sc.facts || []).flatMap(fid => factById[fid] ? factNumbers(factById[fid]).map(n => n.v) : []), ...(sc.derived || []).map(x => x.value), ...(sc.data?.items ? [sc.data.items.length] : [])] : []; });
  spokenNumbers(b.narration || '').forEach(v => { if (!allowed.some(a => close(a, v))) E(`beat ${b.id}`, `narration says ${v}, which doesn't trace to a fact cited by its scenes`); });
  b.scenes.forEach(id => { if (!ids.has(id)) E(`beat ${b.id}`, `unknown scene ${id}`); });
});
if (mode === 'beats' && story.targetSeconds && story.beats) {
  const words = story.beats.reduce((a, b) => a + (b.narration ? b.narration.split(/\s+/).length : 0), 0), budget = Math.round((story.targetSeconds - story.beats.length * 0.45) * 1.9);
  if (words > budget * 1.1) E('story', `narration is ${words} words; ${story.targetSeconds}s holds about ${budget}`);
}
if (mode === 'beats' && story.targetSeconds && !story.beats && story.scenes.some(s => s.narration)) W('story', 'under 45s, narrate beats (story.beats) rather than scenes');

const ok = !errors.length;
if (AS_JSON) console.log(JSON.stringify({ ok, errors, warnings }, null, 2));
else {
  console.log(ok ? `✓ storyboard valid (${story.scenes.length} scenes, ${total.toFixed(1)}s planned)` : `✗ ${errors.length} error(s)`);
  errors.forEach(e => console.log('  error   ' + e)); warnings.forEach(w => console.log('  warning ' + w));
}
process.exit(ok ? 0 : 1);
