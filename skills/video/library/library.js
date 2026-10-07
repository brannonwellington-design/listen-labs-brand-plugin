/* ==========================================================================
   Listen Labs video library — inlined into every composition by build-video.mjs.

   CORE      tokens, surfaces, aspect layouts, drawing helpers, labels, headline block
   FAMILIES  each data shape has several executions; the selector picks one per scene
             ranking    · dotBars · lollipopRef · radialBars · sizedCircles · columnDots · spokes · halfGauges
             partWhole  · unitGrid · ringFill · bloomFill · splitLine · waffle · clusterSplit
             comparison · areaPair · mirrorBars · twinStems
             scale      · axisStrip · columnStrip
             quote      · lineRise · wordBuild
             count      · bloomCount · gridCount · ringsCount
             story-specific templates: nodeRing · strikeRow · comboRing · endRow
   SELECTOR  fit filter → no repeats in the video → penalty for recent use → seeded tie-break
   ENGINE    timeline, wipes, layer, player

   Every value is drawn from the scene's data; every execution follows the motion rules in
   skills/video/references/motion-and-data.md (one line weight, figure box edges, credit zone,
   counters that land with their graphic, true baselines).
   ========================================================================== */

/* ===== CORE · tokens (brand_data.py MOTION) ===== */
const FPS = 30;
const TRANSITION = 0.4;
const LINE = 2;
const NBSP = '&#160;';
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t, dx = t => (3 * ax * t + 2 * bx) * t + cx;
  return x => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) { const e = sx(t) - x, d = dx(t); if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break; t -= e / d; }
    if (Math.abs(sx(t) - x) > 1e-4) { let lo = 0, hi = 1; t = x; for (let i = 0; i < 30; i++) { sx(t) < x ? lo = t : hi = t; t = (lo + hi) / 2; } }
    return sy(t);
  };
}
const EASE = { enter: bezier(0.05, 0.7, 0.1, 1), move: bezier(0.4, 0.14, 0.3, 1), settle: bezier(0, 0, 0, 1) };

/* ===== CORE · surfaces (blue = brand surface, Paper light, Paper dark) ===== */
const TH = {
  blue:  { bg: '#0021CC', fg: '#F9F4EB', fg2: '#F9F4EB', fg2Large: '#9CA3C9', grid: '#7A85B8', accent: '#F9F4EB', mute: '#9CA3C9', onAccent: '#0021CC', onMute: '#0021CC' },
  light: { bg: '#F9F4EB', fg: '#120F08', fg2: '#6B6861', fg2Large: '#6B6861', grid: '#B6B4AF', accent: '#0021CC', mute: '#8D8D8D', onAccent: '#F9F4EB', onMute: '#120F08' },
  dark:  { bg: '#130F06', fg: '#F9F4EB', fg2: '#9E9B94', fg2Large: '#9E9B94', grid: '#504E49', accent: '#3354FF', mute: '#8D8D8D', onAccent: '#F9F4EB', onMute: '#130F06' },
};

/* ===== CORE · aspect layouts (text column + figure box per ratio; clean safe zones; credit zone) ===== */
const ASPECTS = {
  '9:16': {
    W: 540, H: 960, M: 32, credit: 58, note: 912,
    text: { x: 32, big: 240, l1: 292, max: 476, lh1: 40, lh2: 32 },
    fig: { x0: 32, x1: 508, y0: 420, y1: 860 },
    quote: { x: 56, y0: 384, max: 452 },
    end: { title: [32, 320], titleSize: 64, rowSpan: 'content', row: 540, logo: { x: 270, y: 800, anchor: 'middle' }, study: { x: 270, y: 872, anchor: 'middle' } },
  },
  '16:9': {
    W: 960, H: 540, M: 48, credit: 38, note: 512,
    text: { x: 48, big: 214, l1: 266, max: 396, lh1: 40, lh2: 32 },
    fig: { x0: 468, x1: 912, y0: 72, y1: 464 },
    quote: { x: 72, y0: 196, max: 640 },
    end: { title: [48, 214], titleSize: 48, rowSpan: 'fig', row: null, logo: { x: 48, y: 412, anchor: 'start' }, study: { x: 48, y: 512, anchor: 'start' } },
  },
};
const CREDIT_SIZE = 14, NOTE_SIZE = 16, CLEAR = 32;
// Fit checks run at build time, before a ratio is chosen: width-dependent executions must fit the narrowest figure box
const FIG_MIN_W = Math.min(...Object.values(ASPECTS).map(a => a.fig.x1 - a.fig.x0));
let ASPECT, LAY, W, H, M, R, F;
function initLayout(aspect) {
  ASPECT = ASPECTS[aspect] ? aspect : '9:16';
  LAY = ASPECTS[ASPECT]; ({ W, H, M } = LAY); R = W - M;
  F = { ...LAY.fig, w: LAY.fig.x1 - LAY.fig.x0, h: LAY.fig.y1 - LAY.fig.y0, cx: (LAY.fig.x0 + LAY.fig.x1) / 2, cy: (LAY.fig.y0 + LAY.fig.y1) / 2 };
  const top = LAY.credit + CLEAR, bottom = LAY.note - NOTE_SIZE * 0.73 - CLEAR;
  if (F.y0 < top || F.y1 > bottom) console.warn(`Figure box breaks the credit/note clearance (${ASPECT})`);
}

/* ===== CORE · drawing helpers ===== */
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const clamp01 = v => Math.max(0, Math.min(1, v));
const seg = (p, a, b) => clamp01((p - a) / (b - a));            // seg(p, start, end)
const r2 = v => Math.round(v * 100) / 100;
const lerp = (a, b, k) => a + (b - a) * k;
const fmt = v => Math.round(v).toLocaleString('en-US');
const fmtVal = (v, unit = '', k = 1) => (v % 1 ? (v * k).toFixed(1) : fmt(v * k)) + unit;   // keeps the fact's precision
const pscale = k => Math.exp(lerp(Math.log(0.6), 0, k));        // perceptual scale-in 0.6 → 1
function C(cx, cy, r, o = {}) {
  if (r <= 0 || o.op === 0) return '';
  return `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(r)}" fill="${o.fill || 'none'}"` +
    (o.stroke ? ` stroke="${o.stroke}" stroke-width="${LINE}"` : '') + (o.op != null && o.op < 1 ? ` opacity="${r2(o.op)}"` : '') + '/>';
}
const L = (x1, y1, x2, y2, stroke) => `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="${stroke}" stroke-width="${LINE}"/>`;
const Lk = (x1, y1, x2, y2, k, stroke) => (k <= 0 ? '' : L(x1, y1, lerp(x1, x2, k), lerp(y1, y2, k), stroke));
function TX(x, y, str, size, fill, o = {}) {
  const op = o.op == null ? 1 : o.op;
  if (op <= 0) return '';
  return `<text x="${r2(x)}" y="${r2(y + (o.dy || 0))}" font-size="${size}" fill="${fill}" text-anchor="${o.anchor || 'start'}"` +
    (op < 1 ? ` opacity="${r2(op)}"` : '') + `>${str}</text>`;
}
const rise = (p, a, d = 0.35) => { const k = EASE.enter(seg(p, a, a + d)); return { op: k, dy: 24 * (1 - k) }; };
function arcPath(cx, cy, r, a0, a1) { // degrees, 0 = 12 o’clock, clockwise
  const pt = a => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)];
  const [x0, y0] = pt(a0), [x1, y1] = pt(a1);
  return `M${r2(x0)} ${r2(y0)} A${r2(r)} ${r2(r)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${r2(x1)} ${r2(y1)}`;
}
const arcEnd = (cx, cy, r, deg) => [cx + r * Math.sin(deg * Math.PI / 180), cy - r * Math.cos(deg * Math.PI / 180)];
const ringPt = (cx, cy, r, deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];
const niceMax = (v, step) => Math.ceil(v / step) * step;

/* ===== CORE · text ===== */
// Quote layout: 40px lines if the block (lines + attribution) fits above the note clearance; otherwise one step down
// the type scale (32px) and start higher. Long verbatims stay verbatim — the type adapts, never the words.
function quoteLayout(text) {
  const q = LAY.quote, limit = LAY.note - NOTE_SIZE * 0.73 - CLEAR;
  for (const [size, lh] of [[40, 56], [32, 44]]) {
    const lines = wrap(text, size, q.max), y0 = Math.min(q.y0, limit - (lines.length - 1) * lh - 40 - 18);
    if (y0 >= LAY.credit + CLEAR + size || size === 32) return { lines, size, lh, x: q.x, y0: Math.max(y0, LAY.credit + CLEAR + size) };
  }
}
const textW = (str, size) => String(str).replace(/&#160;/g, ' ').length * size * 0.56;
function greedy(str, size, max) {
  const out = []; let line = '';
  for (const w of String(str).split(' ')) { const t = line ? line + ' ' + w : w; if (textW(t, size) > max && line) { out.push(line); line = w; } else line = t; }
  return line ? [...out, line] : out;
}
function wrap(str, size, max) {                 // balanced: no stranded single word
  const lines = greedy(str, size, max);
  if (lines.length < 2) return lines;
  let lo = size, hi = max;
  while (hi - lo > 2) { const mid = (lo + hi) / 2; greedy(str, size, mid).length > lines.length ? lo = mid : hi = mid; }
  return greedy(str, size, hi);
}
// Axis point labels: first slot (above/below × near/far) and anchor that stays in F and clears placed labels
function placeLabels(items, ay, size = 18) {
  const slots = [[-70, -52], [52, 70], [-120, -102], [102, 120]], placed = [];
  return items.map(it => {
    const w = Math.max(textW(it.name, size), textW(it.value, size)) + 8;
    for (const [dn, dv] of slots) for (const anchor of ['middle', 'end', 'start']) {
      const x0 = anchor === 'middle' ? it.x - w / 2 : anchor === 'end' ? it.x - w : it.x, box = { x0, x1: x0 + w, y0: ay + dn - size, y1: ay + dv + 4 };
      if (box.x0 < F.x0 || box.x1 > F.x1 || box.y0 < F.y0 || box.y1 > F.y1) continue;
      if (placed.some(b => !(box.x1 + 12 < b.x0 || box.x0 > b.x1 + 12 || box.y1 + 8 < b.y0 || box.y0 > b.y1 + 8))) continue;
      placed.push(box);
      return { anchor, ny: ay + dn, vy: ay + dv, ly: dn < 0 ? ay + dv + 10 : ay + dn - size - 6 };
    }
    console.warn(`No clear slot for label “${it.name}”`);
    return { anchor: 'middle', ny: ay - 70, vy: ay - 52, ly: ay - 42 };
  });
}
// Row labels under shapes: edge-aligned ends, centered middles; if neighbours collide, alternate rows drop a tier
function rowLabels(xs, names, size = 18) {
  const n = xs.length, anchors = xs.map((_, i) => (i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'));
  const lx = xs.map((x, i) => (i === 0 ? F.x0 : i === n - 1 ? F.x1 : x));
  const ext = i => { const w = textW(names[i], size); return anchors[i] === 'start' ? [lx[i], lx[i] + w] : anchors[i] === 'end' ? [lx[i] - w, lx[i]] : [lx[i] - w / 2, lx[i] + w / 2]; };
  let collide = false;
  for (let i = 1; i < n; i++) if (ext(i - 1)[1] + 12 > ext(i)[0]) collide = true;
  return xs.map((_, i) => ({ x: lx[i], anchor: anchors[i], tier: collide && i % 2 === 1 ? 1 : 0 }));
}
// Headline block: big numeral (or a statement title), line 1, line 2 — wrapped and placed by the layout
function head(p, T, o) {
  const t = LAY.text; let s = '';
  const l2col = o.l2Color === 'fg2Large' ? T.fg2Large : T.fg2;
  if (o.title) {
    const tl = wrap(o.title, 48, t.max);
    tl.forEach((ln, i) => { s += TX(t.x, t.big + i * 56, ln, 48, T.fg, rise(p, 0.05 + i * 0.05)); });
    if (o.l2) wrap(o.l2, 24, t.max).forEach((ln, i) => { s += TX(t.x, t.big + (tl.length - 1) * 56 + 44 + i * t.lh2, ln, 24, l2col, rise(p, 0.35 + i * 0.04)); });
    return s;
  }
  if (o.big != null) s += TX(t.x, t.big, o.big, 128, T.fg, rise(p, o.bigAt ?? 0.05));
  const l1 = wrap(o.l1 || '', 32, t.max);
  l1.forEach((ln, i) => { s += TX(t.x, t.l1 + i * t.lh1, ln, 32, T.fg, rise(p, 0.2 + i * 0.04)); });
  if (o.l2) {
    const y2 = t.l1 + (l1.length - 1) * t.lh1 + 40;
    wrap(o.l2, 24, t.max).forEach((ln, i) => { s += TX(t.x, y2 + i * t.lh2, ln, 24, l2col, rise(p, 0.35 + i * 0.04)); });
  }
  return s;
}

/* ==========================================================================
   FAMILIES — each execution: { form, fits(d) → bool, reveal(d) → [start, end] of its main
   data reveal (the headline counter lands with it), draw(p, T, d) → svg, anchor?(d) → [x, y]
   where the next scene's wipe should start }
   ========================================================================== */

/* ---------- ranking: { items: [{label, value}], unit, ref?: {value, label}, gap?: {after, label}, lead?: index } ---------- */
const rankDomain = d => niceMax(Math.max(...d.items.map(i => i.value), d.ref ? d.ref.value : 0), d.unit === '%' ? 10 : 20);
const rankFmt = (d, v, k = 1) => fmtVal(v, d.unit || '', k);
const RANKING = {
  dotBars: {   // rows of tracks, dots at value, value column right-aligned at the edge
    form: 'bars',
    fits: d => d.items.length <= 6,
    reveal: () => [0.3, 1.3],
    draw(p, T, d) {
      let s = '';
      const max = rankDomain(d), X = v => F.x0 + v / max * F.w, lead = d.lead ?? 0;
      const rows = d.items.length + (d.gap ? 1 : 0), top = F.y0 + 60 + (d.ref ? 16 : 0), step = Math.min(72, (F.y1 - 8 - top) / Math.max(1, rows - 1));   // every row inside F
      let r = 0;
      if (d.ref) {
        s += Lk(X(d.ref.value), F.y0 + 30, X(d.ref.value), top + (rows - 1) * step + 8, EASE.move(seg(p, 0.1, 0.5)), T.grid);
        s += TX(X(d.ref.value), F.y0 + 14, d.ref.label, 18, T.fg2, { anchor: 'middle', ...rise(p, 0.2) });
      }
      d.items.forEach((it, i) => {
        if (d.gap && i === d.gap.after + 1) { s += TX(F.x0, top + r * step - 10, d.gap.label, 18, T.fg2, rise(p, 0.6)); r++; }
        const y = top + r * step, isLead = i === lead, k = EASE.settle(seg(p, 0.3 + i * 0.08, 1.1 + i * 0.08));
        s += Lk(F.x0, y, F.x1, y, EASE.move(seg(p, 0.1 + i * 0.05, 0.5 + i * 0.05)), T.grid);
        s += TX(F.x0, y - 16, it.label, 18, isLead ? T.fg : T.fg2, rise(p, 0.2 + i * 0.06));
        s += Lk(F.x0, y, X(it.value), y, k, isLead ? T.accent : T.mute);
        if (k > 0) s += C(lerp(F.x0, X(it.value), k), y, isLead ? 9 : 7, { fill: isLead ? T.accent : T.mute });
        s += TX(F.x1, y - 16, rankFmt(d, it.value, k), 18, isLead ? T.fg : T.fg2, { anchor: 'end', op: seg(p, 0.4 + i * 0.08, 0.7 + i * 0.08) });
        r++;
      });
      return s;
    },
    anchor: d => [F.x0 + d.items[d.lead ?? 0].value / rankDomain(d) * F.w, F.y0 + 60],
  },
  lollipopRef: {   // stems from a reference line (100 = average), value column at the edge
    form: 'stems',
    fits: d => !!d.ref && d.items.length <= 6,
    reveal: () => [0.3, 1.3],
    draw(p, T, d) {
      let s = '';
      const vals = d.items.map(i => i.value).concat(d.ref.value);
      const lo = Math.floor(Math.min(...vals) / 20) * 20, hi = niceMax(Math.max(...vals), 20);
      const x0 = F.x0 + 144, x1 = F.x1 - 56, X = v => x0 + (v - lo) / (hi - lo) * (x1 - x0);
      const n = d.items.length + (d.gap ? 1 : 0), top = F.y0 + 64, step = (F.y1 - 40 - top) / Math.max(1, n - 1);
      s += Lk(X(d.ref.value), F.y0 + 34, X(d.ref.value), F.y1 - 6, EASE.move(seg(p, 0.1, 0.5)), T.grid);
      s += TX(X(d.ref.value), F.y0 + 18, d.ref.label, 18, T.fg, { anchor: 'middle', ...rise(p, 0.2) });
      let r = 0;
      d.items.forEach((it, i) => {
        if (d.gap && i === d.gap.after + 1) { s += TX(F.x0, top + r * step + 6, d.gap.label, 18, T.fg, rise(p, 0.8)); r++; }
        const y = top + r * step, k = EASE.settle(seg(p, 0.3 + i * 0.12, 1.0 + i * 0.12));
        s += TX(F.x0, y + 6, it.label, 18, T.fg, rise(p, 0.2 + i * 0.08));
        s += Lk(X(d.ref.value), y, X(it.value), y, k, T.accent);
        if (k > 0) s += C(lerp(X(d.ref.value), X(it.value), k), y, i === (d.lead ?? 0) ? 10 : 8, { fill: T.accent });
        s += TX(F.x1, y + 6, rankFmt(d, it.value), 18, T.fg, { anchor: 'end', op: seg(p, 0.7 + i * 0.12, 1.0 + i * 0.12) });
        r++;
      });
      return s;
    },
    anchor: d => [F.cx, F.y0 + 64],
  },
  radialBars: {   // 270° concentric arcs from 12 o’clock; labels in the free quadrant
    form: 'rings',
    fits: d => d.items.length <= 4 && d.unit === '%' && !d.gap && !d.ref && d.items.every(i => i.value <= 100),
    reveal: () => [0.15, 1.15],
    draw(p, T, d) {
      let s = '';
      const sc = Math.min(1, (Math.min(F.w, F.h) / 2 - 10) / 196), lead = d.lead ?? 0;
      d.items.forEach((it, i) => {
        const r = [196, 164, 132, 100][i] * sc, isLead = i === lead, k = EASE.settle(seg(p, 0.15 + i * 0.1, 1.0 + i * 0.1));
        if (seg(p, 0, 0.3) > 0) s += `<path d="${arcPath(F.cx, F.cy, r, 0, 270)}" fill="none" stroke="${T.grid}" stroke-width="${LINE}" opacity="${r2(seg(p, 0, 0.3))}"/>`;
        const sweep = 270 * it.value / 100 * k;
        if (sweep > 0.5) s += `<path d="${arcPath(F.cx, F.cy, r, 0, sweep)}" fill="none" stroke="${isLead ? T.accent : T.mute}" stroke-width="${LINE}"/>`;
        if (k > 0) { const [ex, ey] = arcEnd(F.cx, F.cy, r, sweep); s += C(ex, ey, isLead ? 8 : 6, { fill: isLead ? T.accent : T.mute }); }
        s += TX(F.cx - 12, F.cy - r + 5, `${it.label} ${rankFmt(d, it.value, k)}`, 18, isLead ? T.fg : T.fg2, { anchor: 'end', ...rise(p, 0.3 + i * 0.1) });
      });
      return s;
    },
    anchor: () => [F.cx, F.cy],
  },
  sizedCircles: {   // area-true circles on one baseline, value inside each, names below (staggered if crowded)
    form: 'circles',
    fits: d => d.items.length >= 2 && d.items.length <= 5 && !d.gap && d.items.every(i => i.value > 0),
    reveal: () => [0.2, 1.1],
    geom(d) {
      const max = Math.max(...d.items.map(i => i.value)), q = d.items.map(i => Math.sqrt(i.value / max));
      const r1 = Math.min(F.h / 2 - 70, F.w / (2 * q.reduce((a, b) => a + b, 0) + 0.3 * (d.items.length - 1)));
      const rs = q.map(v => r1 * v), gap = (F.w - 2 * rs.reduce((a, b) => a + b, 0)) / (d.items.length - 1);
      const xs = []; let x = F.x0; rs.forEach(r => { xs.push(x + r); x += 2 * r + gap; });
      return { rs, xs, base: F.cy + r1 * 0.55 };
    },
    draw(p, T, d) {
      let s = '';
      const g = this.geom(d), lead = d.lead ?? 0, lab = rowLabels(g.xs, d.items.map(i => i.label));
      s += TX(F.x0, F.y0 + 14, `Circle area${NBSP}∝${NBSP}value`, 16, T.fg2, { op: seg(p, 0.6, 0.9) });   // encoding legend comes from the execution
      d.items.forEach((it, i) => {
        const k = EASE.enter(seg(p, 0.2 + i * 0.09, 0.75 + i * 0.09)), r = g.rs[i];
        s += C(g.xs[i], g.base - r, r * pscale(k), { fill: i === lead ? T.accent : T.mute, op: k });
        if (r >= 22) s += TX(g.xs[i], g.base - r + 6, rankFmt(d, it.value), 18, i === lead ? T.onAccent : T.onMute, { anchor: 'middle', op: seg(p, 0.6 + i * 0.09, 0.9 + i * 0.09) });
        else s += TX(g.xs[i], g.base - 2 * r - 12, rankFmt(d, it.value), 18, T.fg, { anchor: 'middle', op: seg(p, 0.6 + i * 0.09, 0.9 + i * 0.09) });
        s += TX(lab[i].x, g.base + 36 + lab[i].tier * 26, it.label, 18, T.fg, { anchor: lab[i].anchor, ...rise(p, 0.5 + i * 0.08) });
      });
      return s;
    },
    anchor(d) { const g = this.geom(d), i = d.lead ?? 0; return [g.xs[i], g.base - g.rs[i]]; },
  },
  columnDots: {   // vertical stems from a shared baseline, dot and value on top, names below
    form: 'columns',
    fits: d => { const cw = FIG_MIN_W / (d.items.length + (d.gap ? 1 : 0)); return d.items.length <= 6 && d.items.every(i => i.label.split(' ').every(w => w.length * 18 * 0.56 <= cw - 8)) && (!d.gap || d.gap.label.replace(/&#160;/g, ' ').split(' ').every(w => w.length * 18 * 0.56 <= cw - 8)); },
    reveal: () => [0.3, 1.3],
    draw(p, T, d) {
      let s = '';
      const cols = d.items.length + (d.gap ? 1 : 0), cw = F.w / cols, base = F.y1 - 56, top = F.y0 + 40;
      const max = rankDomain(d), Y = v => base - v / max * (base - top), lead = d.lead ?? 0;
      s += Lk(F.x0, base, F.x1, base, EASE.move(seg(p, 0.05, 0.45)), T.grid);                       // true baseline
      if (d.ref) {
        s += Lk(F.x0, Y(d.ref.value), F.x1, Y(d.ref.value), EASE.move(seg(p, 0.15, 0.55)), T.grid);
        s += TX(F.x1, Y(d.ref.value) - 10, d.ref.label, 18, T.fg2, { anchor: 'end', ...rise(p, 0.3) });
      }
      let c = 0;
      d.items.forEach((it, i) => {
        if (d.gap && i === d.gap.after + 1) {
          s += TX(F.x0 + (c + 0.5) * cw, base - 12, '…', 24, T.fg2, { anchor: 'middle', op: seg(p, 0.6, 0.9) });
          wrap(d.gap.label, 18, cw - 8).forEach((ln, j) => { s += TX(F.x0 + (c + 0.5) * cw, base + 30 + j * 22, ln, 18, T.fg2, { anchor: 'middle', ...rise(p, 0.6) }); });
          c++;
        }
        const x = F.x0 + (c + 0.5) * cw, isLead = i === lead, k = EASE.settle(seg(p, 0.3 + i * 0.08, 1.1 + i * 0.08)), y = lerp(base, Y(it.value), k);
        s += Lk(x, base, x, Y(it.value), k, isLead ? T.accent : T.mute);
        if (k > 0) s += C(x, y, isLead ? 9 : 7, { fill: isLead ? T.accent : T.mute });
        s += TX(x, Y(it.value) - 18, rankFmt(d, it.value, k), 18, isLead ? T.fg : T.fg2, { anchor: 'middle', op: seg(p, 0.5 + i * 0.08, 0.8 + i * 0.08) });
        wrap(it.label, 18, cw - 8).forEach((ln, j) => { s += TX(x, base + 30 + j * 22, ln, 18, isLead ? T.fg : T.fg2, { anchor: 'middle', ...rise(p, 0.2 + i * 0.06) }); });
        c++;
      });
      return s;
    },
    anchor(d) { const cols = d.items.length + (d.gap ? 1 : 0), i = d.lead ?? 0; return [F.x0 + (i + 0.5) * F.w / cols, F.y1 - 56]; },
  },
};

/* ---------- partWhole: { pct, count?, base?, partLabel?, restLabel? } ---------- */
const PART_WHOLE = {
  unitGrid: {   // one dot per respondent, the part fills in reading order
    form: 'grid',
    fits: d => d.count != null && d.base != null && d.base <= 400,
    reveal: () => [0.7, 1.7],
    geom(d) {
      const cols = 20, rows = Math.ceil(d.base / cols), dotR = 7.5;
      const gap = Math.min((F.w - 2 * dotR) / (cols - 1), (F.h - 2 * dotR - 46) / (rows - 1)), gridH = (rows - 1) * gap;
      return { cols, dotR, gap, gx: F.x0 + dotR + ((F.w - 2 * dotR) - (cols - 1) * gap) / 2, gy: F.y0 + (F.h - (gridH + 2 * dotR + 46)) / 2 + dotR, gridH };
    },
    draw(p, T, d) {
      let s = '';
      const g = this.geom(d), filled = Math.round(d.count * EASE.settle(seg(p, 0.7, 1.7)));
      for (let i = 0; i < d.base; i++) {
        const cx = g.gx + (i % g.cols) * g.gap, cy = g.gy + Math.floor(i / g.cols) * g.gap, a = EASE.enter(seg(p, 0.05 + i * 0.0018, 0.35 + i * 0.0018));
        s += i < filled ? C(cx, cy, g.dotR * a, { fill: T.accent }) : C(cx, cy, 7 * a, { stroke: T.mute });
      }
      const ly = g.gy + g.gridH + 46;
      s += C(F.x0 + g.dotR, ly - 6, g.dotR, { fill: T.accent, op: seg(p, 1.4, 1.7) });
      s += TX(F.x0 + 24, ly, `${fmt(filled)} of ${d.base}${d.partLabel ? ' ' + d.partLabel : ''}`, 18, T.fg, { op: seg(p, 1.4, 1.7) });
      return s;
    },
    anchor() { return [F.cx, F.cy]; },
  },
  ringFill: {   // one ring, the part sweeps from 12 o’clock; count of base at its center
    form: 'ring',
    fits: () => true,
    reveal: () => [0.3, 1.9],
    geom: () => ({ cx: F.cx, cy: F.cy, r: Math.min(F.w, F.h) / 2 - 12 }),
    draw(p, T, d) {
      let s = '';
      const g = this.geom(), k = EASE.settle(seg(p, 0.3, 1.9)), sweep = 360 * d.pct / 100 * k;
      if (seg(p, 0.1, 0.4) > 0) s += C(g.cx, g.cy, g.r, { stroke: T.grid, op: seg(p, 0.1, 0.4) });
      if (sweep > 0.5) s += `<path d="${arcPath(g.cx, g.cy, g.r, 0, sweep)}" fill="none" stroke="${T.accent}" stroke-width="${LINE}"/>`;
      if (k > 0) { const [ex, ey] = arcEnd(g.cx, g.cy, g.r, sweep); s += C(ex, ey, 10, { fill: T.accent }); }
      const center = d.count != null ? `${fmt(d.count * k)} of ${d.base}` : (d.partLabel || '');
      if (center) s += TX(g.cx, g.cy + 8, center, 24, T.fg2Large, { anchor: 'middle', op: seg(p, 0.3, 0.6) });
      return s;
    },
    anchor(d) { const g = this.geom(); return arcEnd(g.cx, g.cy, g.r, 360 * d.pct / 100); },
  },
  bloomFill: {   // respondents bloom as a sunflower; the part lights from the core outward
    form: 'bloom',
    fits: d => d.count != null && d.base != null && d.base <= 400,
    reveal: () => [1.0, 2.2],
    draw(p, T, d) {
      let s = '';
      const sc = Math.min(1, (Math.min(F.w, F.h) / 2 - 6) / (11 * Math.sqrt(d.base))), lit = d.count * EASE.settle(seg(p, 1.0, 2.2));
      for (let i = 0; i < d.base; i++) {
        const dl = 0.1 + (i / d.base) * 0.6, k = EASE.enter(seg(p, dl, dl + 0.4));
        if (k <= 0) continue;
        const a = i * GOLDEN, rr = 11 * Math.sqrt(i + 0.5) * k * sc;
        s += C(F.cx + Math.cos(a) * rr, F.cy + Math.sin(a) * rr, 4, { fill: i < lit ? T.accent : T.mute, op: i < lit ? 1 : 0.6 });
      }
      return s;
    },
    anchor() { return [F.cx, F.cy]; },
  },
  splitLine: {   // one line edge to edge, the part in accent; both sides labeled with their share
    form: 'line',
    fits: () => true,
    reveal: () => [0.4, 1.6],
    draw(p, T, d) {
      let s = '';
      const y = F.cy, k = EASE.settle(seg(p, 0.4, 1.6)), xs = F.x0 + d.pct / 100 * F.w, xk = lerp(F.x0, xs, k);
      s += Lk(F.x0, y, F.x1, y, EASE.move(seg(p, 0.05, 0.45)), T.grid);
      s += Lk(F.x0, y, xs, y, k, T.accent);
      s += Lk(xk, y - 28, xk, y + 28, k > 0 ? 1 : 0, T.accent);
      if (k > 0) s += C(xk, y, 10, { fill: T.accent });
      const rest = 100 - d.pct, restCount = d.count != null ? d.base - d.count : null;
      s += TX(F.x0, y - 48, fmtVal(d.pct, '%', k), 24, T.fg, { op: seg(p, 0.4, 0.7) });
      s += TX(F.x0, y - 24, d.count != null ? `${fmt(d.count * k)} ${d.partLabel || ''}`.trim() : (d.partLabel || ''), 18, T.fg2, { op: seg(p, 0.5, 0.8) });
      s += TX(F.x1, y + 64, `${fmtVal(rest, '%')}`, 24, T.fg2, { anchor: 'end', op: seg(p, 1.4, 1.7) });
      s += TX(F.x1, y + 88, restCount != null ? `${fmt(restCount)} ${d.restLabel || ''}`.trim() : (d.restLabel || ''), 18, T.fg2, { anchor: 'end', op: seg(p, 1.5, 1.8) });
      return s;
    },
    anchor(d) { return [F.x0 + d.pct / 100 * F.w, F.cy]; },
  },
};

/* ---------- single-execution templates (become families as they gain executions) ---------- */
const nodeRingGeom = () => ({ cx: F.cx, cy: F.cy, r: Math.min(180, F.w / 2 - 24, F.h / 2 - 40) });
const nodeAt = (k, n) => { const g = nodeRingGeom(); return ringPt(g.cx, g.cy, g.r, -90 + k * 360 / n); };
const TEMPLATES = {
  bloomCount: { form: 'bloom', fits: () => true, reveal: () => [0.1, 1.0],   // { n }: one seed blooms into n dots
    draw(p, T, d) {
      let s = '';
      const sc = Math.min(1, (Math.min(F.w, F.h) / 2 - 6) / (11 * Math.sqrt(d.n))), seed = EASE.enter(seg(p, 0, 0.2)) * (1 - seg(p, 0.35, 0.8));
      s += C(F.cx, F.cy, 12 * seed, { fill: T.fg });
      for (let i = 0; i < d.n; i++) {
        const dl = 0.2 + (i / d.n) * 0.6, k = EASE.enter(seg(p, dl, dl + 0.45));
        if (k <= 0) continue;
        const a = i * GOLDEN + p * 0.3, rr = 11 * Math.sqrt(i + 0.5) * k * sc;
        s += C(F.cx + Math.cos(a) * rr, F.cy + Math.sin(a) * rr, 4, { fill: T.fg });
      }
      return s;
    }, anchor: () => [F.cx, F.cy] },
  nodeRing: { form: 'nodes', fits: () => true, reveal: () => [0.1, 0.8],   // { n, picks: [i, j, k] }
    draw(p, T, d) {
      let s = '';
      const pick = EASE.enter(seg(p, 0.9, 1.3)), tri = EASE.move(seg(p, 1.0, 1.6));
      for (let j = 0; j < d.picks.length; j++) { const [x1, y1] = nodeAt(d.picks[j], d.n), [x2, y2] = nodeAt(d.picks[(j + 1) % d.picks.length], d.n); s += Lk(x1, y1, x2, y2, tri, T.accent); }
      for (let k = 0; k < d.n; k++) {
        const [x, y] = nodeAt(k, d.n), a = EASE.enter(seg(p, 0.1 + k * 0.03, 0.45 + k * 0.03));
        if (d.picks.includes(k) && pick > 0) s += C(x, y, lerp(14, 20, pick) * a, { fill: T.accent });
        else s += C(x, y, 14 * a, { fill: T.bg, stroke: T.fg2 });
      }
      return s;
    }, anchor: d => nodeAt(d.picks[0], d.n) },
  areaPair: { form: 'circles', fits: () => true, reveal: () => [0.1, 0.9],   // { a: {label, value}, b: {label, value} }
    geom(d) { const big = Math.min(140, (F.h - 60) / 2, F.w * 0.3), small = big * Math.sqrt(d.b.value / d.a.value), base = F.y1 - 60; return { big, small, base, bx: F.x0 + big, by: base - big, sx: F.x1 - small, sy: base - small }; },
    draw(p, T, d) {
      let s = '';
      const g = this.geom(d), kb = EASE.enter(seg(p, 0.1, 0.7)), ks = EASE.enter(seg(p, 0.35, 0.95));
      s += TX(F.x1, F.y0 + 14, `Circle area${NBSP}∝${NBSP}value`, 16, T.fg2, { anchor: 'end', op: seg(p, 0.6, 0.9) });   // encoding legend comes from the execution
      s += C(g.bx, g.by, g.big * pscale(kb), { fill: T.accent, op: kb });
      s += C(g.sx, g.sy, g.small * pscale(ks), { fill: T.mute, op: ks });
      s += TX(g.bx, g.base + 36, d.a.label, 18, T.fg, { anchor: 'middle', ...rise(p, 0.4) });
      s += TX(g.bx, g.base + 60, fmtVal(d.a.value), 18, T.fg2, { anchor: 'middle', ...rise(p, 0.45) });
      s += TX(g.sx, g.base + 36, d.b.label, 18, T.fg, { anchor: 'middle', ...rise(p, 0.6) });
      s += TX(g.sx, g.base + 60, fmtVal(d.b.value), 18, T.fg2, { anchor: 'middle', ...rise(p, 0.65) });
      return s;
    }, anchor(d) { const g = this.geom(d); return [g.sx, g.sy]; } },
  strikeRow: { form: 'strike', fits: () => true, reveal: () => [0.1, 1.0],   // { header, items: [labels] }
    draw(p, T, d) {
      let s = '';
      const y = F.cy, n = d.items.length, xs = d.items.map((_, i) => F.x0 + 46 + i * (F.w - 92) / (n - 1));
      s += TX(F.x0, y - 80, d.header, 18, T.fg2, rise(p, 0.15));
      d.items.forEach((f, i) => {
        const k = EASE.enter(seg(p, 0.1 + i * 0.06, 0.5 + i * 0.06)), struck = seg(p, 0.8 + i * 0.07, 0.9 + i * 0.07);
        s += C(xs[i], y, 36 * k, { fill: T.bg, stroke: struck > 0 ? T.fg2 : T.fg });
        s += TX(xs[i], y + 64, f, 18, T.fg, { anchor: 'middle', ...rise(p, 0.2 + i * 0.06) });
      });
      s += Lk(F.x0, y, F.x1, y, EASE.move(seg(p, 0.75, 1.25)), T.fg);
      return s;
    }, anchor: () => [F.cx, F.cy] },
  quote: { form: 'quote', fits: () => true, reveal: () => [0, 0],   // { text, who }
    draw(p, T, d) {
      let s = '';
      const q = quoteLayout(d.text), lh = q.lh, lines = q.lines;
      s += Lk(q.x - 24, q.y0 - q.size - 4, q.x - 24, q.y0 - q.size - 4 + lines.length * lh + 8, EASE.move(seg(p, 0, 0.5)), T.fg);
      lines.forEach((ln, i) => { s += TX(q.x, q.y0 + i * lh, ln, q.size, T.fg, rise(p, 0.1 + i * 0.12, 0.3)); });
      s += TX(q.x, q.y0 + (lines.length - 1) * lh + 40, d.who, 18, T.fg, rise(p, 0.8));
      return s;
    }, anchor: () => [LAY.quote.x, LAY.quote.y0] },
  axisStrip: { form: 'axis', fits: () => true, reveal: () => [0.25, 1.2],   // { items: [{label, value, focus}], step? }
    draw(p, T, d) {
      let s = '';
      const step = d.step || 10, vals = d.items.map(i => i.value), lo = Math.floor(Math.min(...vals) / step) * step, hi = niceMax(Math.max(...vals), step);
      const X = v => F.x0 + (v - lo) / (hi - lo) * F.w, ay = F.cy;
      s += Lk(F.x0, ay, F.x1, ay, EASE.move(seg(p, 0.05, 0.45)), T.grid);
      const spots = placeLabels(d.items.map(it => ({ x: X(it.value), name: it.label, value: fmtVal(it.value, d.unit || '') })), ay);
      d.items.forEach((it, i) => {
        const k = EASE.enter(seg(p, 0.25 + i * 0.1, 0.85 + i * 0.1)), x = lerp(F.x0, X(it.value), k), sp = spots[i], lab = seg(p, 0.75 + i * 0.1, 1.05 + i * 0.1);
        s += Lk(X(it.value), sp.ly < ay ? ay - 12 : ay + 12, X(it.value), sp.ly, lab, T.grid);
        if (k > 0) s += it.focus ? C(x, ay, 10, { fill: T.accent }) : C(x, ay, 7, { fill: T.bg, stroke: T.fg });
        s += TX(X(it.value), sp.ny, it.label, 18, T.fg, { anchor: sp.anchor, op: lab });
        s += TX(X(it.value), sp.vy, fmtVal(it.value, d.unit || ''), 18, T.fg2, { anchor: sp.anchor, op: lab });
      });
      return s;
    },
    anchor(d) { const step = d.step || 10, vals = d.items.map(i => i.value), lo = Math.floor(Math.min(...vals) / step) * step, hi = niceMax(Math.max(...vals), step), f = d.items.find(i => i.focus) || d.items[0]; return [F.x0 + (f.value - lo) / (hi - lo) * F.w, F.cy]; } },
  comboRing: { form: 'nodes', fits: () => true, reveal: () => [0.1, 1.3],   // { n, runners: [[i,j,k]…], winner: [i,j,k], labels: [3] } — real combinations only
    draw(p, T, d) {
      let s = '';
      (d.runners || []).forEach((c, m) => {
        const k = EASE.move(seg(p, 0.25 + m * 0.45, 0.6 + m * 0.45));
        for (let j = 0; j < 3; j++) { const [x1, y1] = nodeAt(c[j], d.n), [x2, y2] = nodeAt(c[(j + 1) % 3], d.n); s += Lk(x1, y1, x2, y2, k, T.mute); }
      });
      const tri = EASE.move(seg(p, 1.3, 1.7));
      for (let j = 0; j < 3; j++) { const [x1, y1] = nodeAt(d.winner[j], d.n), [x2, y2] = nodeAt(d.winner[(j + 1) % 3], d.n); s += Lk(x1, y1, x2, y2, tri, T.fg); }
      const runnerNodes = (d.runners || []).flat().filter(k => !d.winner.includes(k));
      for (let k = 0; k < d.n; k++) {
        const [x, y] = nodeAt(k, d.n), a = EASE.enter(seg(p, k * 0.015, 0.25 + k * 0.015)), pick = d.winner.includes(k) ? EASE.enter(seg(p, 1.3, 1.6)) : 0;
        s += C(x, y, (5 + (runnerNodes.includes(k) ? 2 : 0) + 5 * pick) * a, { fill: T.fg });
      }
      const g = nodeRingGeom();
      d.winner.forEach((k, i) => {
        const [x, y] = nodeAt(k, d.n), above = y < g.cy - g.r * 0.5;
        const pos = above ? [x, y - 24, 'middle'] : [x + (x > g.cx ? -6 : 8), y + 44, x > g.cx ? 'start' : 'end'];
        s += TX(pos[0], pos[1], d.labels[i], 18, T.fg, { anchor: pos[2], ...rise(p, 1.4 + i * 0.06, 0.3) });
      });
      return s;
    }, anchor: d => nodeAt(d.winner[0], d.n) },
  endRow: { form: 'end', fits: () => true, reveal: () => [0, 0],   // { title, sub, items: [labels], study, n }
    draw(p, T, d) {
      let s = '';
      const E = LAY.end, ts = E.titleSize, tlh = ts + 8, title = wrap(d.title, ts, LAY.text.max), sub = d.sub ? wrap(d.sub, 24, LAY.text.max) : [];
      title.forEach((ln, i) => { s += TX(E.title[0], E.title[1] + i * tlh, ln, ts, T.fg, rise(p, 0.05 + i * 0.05)); });
      const subY = E.title[1] + (title.length - 1) * tlh + 44;
      sub.forEach((ln, i) => { s += TX(E.title[0], subY + i * LAY.text.lh2, ln, 24, T.fg2Large, rise(p, 0.2 + i * 0.04)); });
      const n = d.items.length, rr = n > 3 ? 40 : 56, [rx0, rx1] = E.rowSpan === 'fig' ? [F.x0, F.x1] : [M, R];
      const textEnd = subY + Math.max(0, sub.length - 1) * LAY.text.lh2, y = E.rowSpan === 'content' ? Math.max(E.row, textEnd + 56 + rr) : F.cy;
      const xs = d.items.map((_, i) => rx0 + rr + i * (rx1 - rx0 - 2 * rr) / (n - 1));
      s += Lk(rx0, y, rx1, y, EASE.move(seg(p, 0.1, 0.6)), T.fg);
      d.items.forEach((f, i) => {
        const k = EASE.enter(seg(p, 0.3 + i * 0.1, 0.8 + i * 0.1));
        s += C(xs[i], y, rr * pscale(k), { fill: T.fg, op: k });
        const lx = i === 0 ? rx0 : i === n - 1 ? rx1 : xs[i], anchor = i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle';
        s += TX(lx, y + rr + 36, f, 20, T.fg, { anchor, ...rise(p, 0.45 + i * 0.1) });
      });
      const w = seg(p, 1.0, 1.4), lw = 28 * 520 / 71, lx = E.logo.anchor === 'middle' ? E.logo.x - lw / 2 : E.logo.x;
      s += `<g transform="translate(${r2(lx)} ${E.logo.y}) scale(${r2(28 / 71 * 1000) / 1000})" opacity="${r2(w)}" fill="${T.fg}">${WORDMARK}</g>`;
      s += TX(E.study.x, E.study.y, `${d.study} · n${NBSP}=${NBSP}${d.n}`, 16, T.fg, { anchor: E.study.anchor, op: w });
      if (d.disclosure) s += TX(E.study.x, E.study.y - 22, d.disclosure, 16, T.fg2Large, { anchor: E.study.anchor, op: w });   // AI-voice disclosure (MRS, EU AI Act Art. 50)
      return s;
    }, anchor: () => [F.cx, F.cy] },
};


/* ---------- ranking, more executions ---------- */
Object.assign(RANKING, {
  spokes: {   // values as spokes from a hub, longest = largest; labels outside the ring
    form: 'spokes',
    fits: d => d.items.length >= 3 && d.items.length <= 8 && !d.gap,
    reveal: () => [0.3, 1.3],
    geom(d) {
      const n = d.items.length, labW = Math.max(...d.items.map(i => Math.max(textW(i.label, 18), textW(rankFmt(d, i.value), 18))));
      const rmax = Math.max(60, Math.min(F.h / 2 - 52, F.w / 2 - labW - 22)), hub = 10, max = rankDomain(d);
      return { n, rmax, hub, max, ang: i => -90 + i * 360 / n, rad: v => hub + v / max * (rmax - hub) };
    },
    draw(p, T, d) {
      let s = '';
      const g = this.geom(d), lead = d.lead ?? 0;
      s += C(F.cx, F.cy, g.rmax, { stroke: T.grid, op: seg(p, 0.05, 0.4) });                    // the scale’s full extent
      if (d.ref) { s += C(F.cx, F.cy, g.rad(d.ref.value), { stroke: T.grid, op: seg(p, 0.15, 0.5) }); }
      d.items.forEach((it, i) => {
        const a = g.ang(i), k = EASE.settle(seg(p, 0.3 + i * 0.07, 1.1 + i * 0.07)), isLead = i === lead;
        const [x1, y1] = ringPt(F.cx, F.cy, g.hub, a), [x2, y2] = ringPt(F.cx, F.cy, g.rad(it.value), a);
        s += Lk(x1, y1, x2, y2, k, isLead ? T.accent : T.mute);
        if (k > 0) s += C(lerp(x1, x2, k), lerp(y1, y2, k), isLead ? 9 : 7, { fill: isLead ? T.accent : T.mute });
        const [lx, ly] = ringPt(F.cx, F.cy, g.rmax + 16, a), c = Math.cos(a * Math.PI / 180);
        const sn = Math.sin(a * Math.PI / 180), anchor = Math.abs(c) < 0.2 ? 'middle' : c > 0 ? 'start' : 'end', dy = sn < -0.8 ? -24 : sn > 0.8 ? 16 : -4;
        s += TX(lx, ly + dy, it.label, 18, isLead ? T.fg : T.fg2, { anchor, ...rise(p, 0.4 + i * 0.07) });
        s += TX(lx, ly + dy + 20, rankFmt(d, it.value, k), 18, isLead ? T.fg : T.fg2, { anchor, op: seg(p, 0.6 + i * 0.07, 0.9 + i * 0.07) });
      });
      s += C(F.cx, F.cy, g.hub, { fill: T.fg, op: seg(p, 0.1, 0.3) });
      return s;
    },
    anchor(d) { const g = this.geom(d), i = d.lead ?? 0; return ringPt(F.cx, F.cy, g.rad(d.items[i].value), g.ang(i)); },
  },
  halfGauges: {   // small multiples of 180° gauges, two per row; value inside, name below
    form: 'gauges',
    fits: d => d.unit === '%' && d.items.length >= 2 && d.items.length <= 4 && !d.gap && !d.ref && d.items.every(i => i.value <= 100),
    reveal: () => [0.3, 1.3],
    geom(d) {
      const cols = 2, rows = Math.ceil(d.items.length / cols), cw = F.w / cols, ch = F.h / rows;
      const r = Math.min(cw / 2 - 14, ch - 70);
      return { cols, rows, cw, ch, r, at: i => [F.x0 + (i % cols + 0.5) * cw, F.y0 + Math.floor(i / cols) * ch + (ch + r) / 2 - 14] };
    },
    draw(p, T, d) {
      let s = '';
      const g = this.geom(d), lead = d.lead ?? 0;
      d.items.forEach((it, i) => {
        const [cx, cy] = g.at(i), k = EASE.settle(seg(p, 0.3 + i * 0.1, 1.2 + i * 0.1)), isLead = i === lead;
        if (seg(p, 0.05, 0.35) > 0) s += `<path d="${arcPath(cx, cy, g.r, -90, 90)}" fill="none" stroke="${T.grid}" stroke-width="${LINE}" opacity="${r2(seg(p, 0.05, 0.35))}"/>`;
        const sweep = 180 * it.value / 100 * k;
        if (sweep > 0.5) s += `<path d="${arcPath(cx, cy, g.r, -90, -90 + sweep)}" fill="none" stroke="${isLead ? T.accent : T.mute}" stroke-width="${LINE}"/>`;
        if (k > 0) { const [ex, ey] = arcEnd(cx, cy, g.r, -90 + sweep); s += C(ex, ey, isLead ? 8 : 6, { fill: isLead ? T.accent : T.mute }); }
        s += TX(cx, cy - 8, rankFmt(d, it.value, k), 24, isLead ? T.fg : T.fg2, { anchor: 'middle', op: seg(p, 0.3 + i * 0.1, 0.6 + i * 0.1) });
        s += TX(cx, cy + 30, it.label, 18, isLead ? T.fg : T.fg2, { anchor: 'middle', ...rise(p, 0.2 + i * 0.08) });
      });
      return s;
    },
    anchor(d) { return this.geom(d).at(d.lead ?? 0); },
  },
});

/* ---------- part of a whole, more executions ---------- */
Object.assign(PART_WHOLE, {
  waffle: {   // 20 × 5 squares edge to edge, each square = 1%
    form: 'squares',
    fits: d => Number.isInteger(d.pct) && d.pct >= 0 && d.pct <= 100,
    reveal: () => [0.6, 1.6],
    geom() { const cell = F.w / 20, side = cell - 6; return { cell, side, y0: F.cy - 2.5 * cell }; },
    draw(p, T, d) {
      let s = '';
      const g = this.geom(), filled = Math.round(d.pct * EASE.settle(seg(p, 0.6, 1.6)));
      for (let i = 0; i < 100; i++) {
        const col = i % 20, row = Math.floor(i / 20), x = F.x0 + col * g.cell + 3, y = g.y0 + row * g.cell + 3, a = EASE.enter(seg(p, 0.05 + i * 0.004, 0.35 + i * 0.004));
        if (a <= 0) continue;
        s += i < filled
          ? `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(g.side)}" height="${r2(g.side)}" rx="2" fill="${T.accent}" opacity="${r2(a)}"/>`
          : `<rect x="${r2(x + 1)}" y="${r2(y + 1)}" width="${r2(g.side - 2)}" height="${r2(g.side - 2)}" rx="2" fill="none" stroke="${T.mute}" stroke-width="${LINE}" opacity="${r2(a)}"/>`;
      }
      s += TX(F.x0, g.y0 + 5 * g.cell + 34, `Each square${NBSP}=${NBSP}1%${d.count != null ? ` · ${d.count} of ${d.base}` : ''}`, 18, T.fg2, { op: seg(p, 1.2, 1.5) });
      return s;
    },
    anchor(d) { const g = this.geom(), i = Math.max(0, d.pct - 1); return [F.x0 + (i % 20 + 0.5) * g.cell, g.y0 + (Math.floor(i / 20) + 0.5) * g.cell]; },
  },
  clusterSplit: {   // everyone gathers in one cluster, then the part and the rest separate into two
    form: 'clusters',
    fits: d => d.count != null && d.base != null && d.base <= 400 && d.count > 0 && d.count < d.base,
    reveal: () => [0.9, 1.9],
    geom(d) {
      const rest = d.base - d.count, sMax = Math.min((F.w / 4 - 10) / Math.sqrt(Math.max(d.count, rest)), (F.h / 2 - 50) / Math.sqrt(d.base));
      const s = Math.min(11, sMax);
      return { s, lx: F.x0 + F.w * 0.25, rx: F.x0 + F.w * 0.75, cy: F.cy - 16, pos: (i, cx) => { const a = i * GOLDEN, rr = s * Math.sqrt(i + 0.5); return [cx + Math.cos(a) * rr, F.cy - 16 + Math.sin(a) * rr]; } };
    },
    draw(p, T, d) {
      let s = '';
      const g = this.geom(d), k = EASE.move(seg(p, 0.9, 1.9)), dotR = Math.min(4, g.s * 0.36);
      for (let i = 0; i < d.base; i++) {
        const a = EASE.enter(seg(p, 0.1 + (i / d.base) * 0.5, 0.4 + (i / d.base) * 0.5));
        if (a <= 0) continue;
        const part = i < d.count, [x0, y0] = g.pos(i, F.cx), [x1, y1] = part ? g.pos(i, g.lx) : g.pos(i - d.count, g.rx);
        s += C(lerp(x0, x1, k), lerp(y0, y1, k), dotR, { fill: part && k > 0 ? T.accent : T.mute, op: a });
      }
      const lab = seg(p, 1.6, 1.9), yl = g.cy + g.s * Math.sqrt(Math.max(d.count, d.base - d.count)) + 34;
      s += TX(g.lx, yl, `${d.count} ${d.partLabel || ''}`.trim(), 18, T.fg, { anchor: 'middle', op: lab });
      s += TX(g.rx, yl, `${d.base - d.count} ${d.restLabel || ''}`.trim(), 18, T.fg2, { anchor: 'middle', op: lab });
      return s;
    },
    anchor(d) { return [this.geom(d).lx, F.cy - 16]; },
  },
});

/* ---------- comparison: { a: {label, value}, b: {label, value}, unit? } ---------- */
const COMPARISON = {
  areaPair: TEMPLATES.areaPair,
  mirrorBars: {   // two bars from a shared center axis, length ∝ value; the larger reaches its edge
    form: 'mirror',
    fits: d => d.a.value >= 0 && d.b.value >= 0,
    reveal: () => [0.3, 1.2],
    draw(p, T, d) {
      let s = '';
      const max = Math.max(d.a.value, d.b.value), half = F.w / 2, y = F.cy, k = EASE.settle(seg(p, 0.3, 1.2));
      const la = d.a.value / max * half, lb = d.b.value / max * half;
      s += Lk(F.cx, y - 40, F.cx, y + 40, EASE.move(seg(p, 0.05, 0.35)), T.grid);
      s += Lk(F.cx, y, F.cx - la, y, k, T.accent); s += Lk(F.cx, y, F.cx + lb, y, k, T.mute);
      if (k > 0) { s += C(F.cx - la * k, y, 10, { fill: T.accent }); s += C(F.cx + lb * k, y, 8, { fill: T.mute }); }
      s += TX(F.cx - la, y - 28, d.a.label, 18, T.fg, { anchor: la > half - 40 ? 'start' : 'middle', ...rise(p, 0.5) });
      s += TX(F.cx - la, y + 44, fmtVal(d.a.value, d.unit || ''), 24, T.fg, { anchor: la > half - 40 ? 'start' : 'middle', op: seg(p, 1.0, 1.3) });
      s += TX(F.cx + lb, y - 28, d.b.label, 18, T.fg, { anchor: lb > half - 40 ? 'end' : 'middle', ...rise(p, 0.6) });
      s += TX(F.cx + lb, y + 44, fmtVal(d.b.value, d.unit || ''), 24, T.fg2, { anchor: lb > half - 40 ? 'end' : 'middle', op: seg(p, 1.0, 1.3) });
      return s;
    },
    anchor(d) { const max = Math.max(d.a.value, d.b.value); return [F.cx + d.b.value / max * F.w / 2, F.cy]; },
  },
  twinStems: {   // two vertical stems on a true baseline; values above, names below
    form: 'columns',
    fits: d => d.a.value >= 0 && d.b.value >= 0,
    reveal: () => [0.3, 1.2],
    draw(p, T, d) {
      let s = '';
      const base = F.y1 - 56, top = F.y0 + 40, max = Math.max(d.a.value, d.b.value), Y = v => base - v / max * (base - top);
      const xs = [F.x0 + F.w * 0.3, F.x0 + F.w * 0.7], k = EASE.settle(seg(p, 0.3, 1.2));
      s += Lk(F.x0, base, F.x1, base, EASE.move(seg(p, 0.05, 0.45)), T.grid);
      [d.a, d.b].forEach((it, i) => {
        const col = i === 0 ? T.accent : T.mute, y = lerp(base, Y(it.value), k);
        s += Lk(xs[i], base, xs[i], Y(it.value), k, col);
        if (k > 0) s += C(xs[i], y, i === 0 ? 10 : 8, { fill: col });
        s += TX(xs[i], Y(it.value) - 20, fmtVal(it.value, d.unit || ''), 24, i === 0 ? T.fg : T.fg2, { anchor: 'middle', op: seg(p, 0.9, 1.2) });
        s += TX(xs[i], base + 32, it.label, 18, T.fg, { anchor: 'middle', ...rise(p, 0.2 + i * 0.1) });
      });
      return s;
    },
    anchor(d) { return [F.x0 + F.w * 0.7, F.y1 - 56]; },
  },
};

/* ---------- scale: { items: [{label, value, focus}], unit?, step? } — several values on one scale ---------- */
const SCALE = {
  axisStrip: TEMPLATES.axisStrip,
  columnStrip: {   // a vertical scale on the left edge; dots on it, labels spread to the right without colliding
    form: 'vaxis',
    fits: d => d.items.length >= 2 && d.items.length <= 6,
    reveal: () => [0.25, 1.2],
    geom(d) {
      const step = d.step || 10, vals = d.items.map(i => i.value), lo = Math.floor(Math.min(...vals) / step) * step, hi = niceMax(Math.max(...vals), step);
      const top = F.y0 + 16, bot = F.y1 - 16, Y = v => bot - (v - lo) / (hi - lo) * (bot - top), ax = F.x0 + 8;
      const order = d.items.map((it, i) => ({ i, y: Y(it.value) })).sort((a, b) => a.y - b.y), ly = [];
      order.forEach((o, j) => { ly[o.i] = j === 0 ? Math.max(top + 6, o.y) : Math.max(o.y, ly[order[j - 1].i] + 30); });
      const over = Math.max(0, ...d.items.map((_, i) => ly[i] - (bot - 6)));
      if (over > 0) d.items.forEach((_, i) => { ly[i] -= over; });
      return { lo, hi, top, bot, Y, ax, ly, lx: F.x0 + 64 };
    },
    draw(p, T, d) {
      let s = '';
      const g = this.geom(d);
      s += Lk(g.ax, g.bot, g.ax, g.top, EASE.move(seg(p, 0.05, 0.45)), T.grid);
      d.items.forEach((it, i) => {
        const k = EASE.enter(seg(p, 0.25 + i * 0.1, 0.85 + i * 0.1)), y = lerp(g.bot, g.Y(it.value), k), lab = seg(p, 0.7 + i * 0.1, 1.0 + i * 0.1);
        s += Lk(g.ax + 12, g.Y(it.value), g.lx - 10, g.ly[i] - 6, lab, T.grid);
        if (k > 0) s += it.focus ? C(g.ax, y, 10, { fill: T.accent }) : C(g.ax, y, 7, { fill: T.bg, stroke: T.fg });
        s += TX(g.lx, g.ly[i], `${it.label}`, 18, T.fg, { op: lab });
        s += TX(F.x1, g.ly[i], fmtVal(it.value, d.unit || ''), 18, it.focus ? T.fg : T.fg2, { anchor: 'end', op: lab });
      });
      return s;
    },
    anchor(d) { const g = this.geom(d), f = d.items.find(i => i.focus) || d.items[0]; return [g.ax, g.Y(f.value)]; },
  },
};

/* ---------- quote: { text, who } ---------- */
const QUOTE = {
  lineRise: TEMPLATES.quote,
  wordBuild: {   // words land one at a time in reading order; the rule draws first; attribution last
    form: 'quote',
    fits: d => d.text.split(' ').length <= 30,
    reveal: () => [0, 0],
    draw(p, T, d) {
      let s = '';
      const q = quoteLayout(d.text), lh = q.lh, lines = q.lines;
      s += Lk(q.x - 24, q.y0 - q.size - 4, q.x - 24, q.y0 - q.size - 4 + lines.length * lh + 8, EASE.move(seg(p, 0, 0.4)), T.fg);
      let w = 0; const total = lines.reduce((a, l) => a + l.split(' ').length, 0), per = Math.min(0.09, 1.1 / total);
      lines.forEach((ln, i) => {
        const spans = ln.split(' ').map(word => { const op = EASE.enter(seg(p, 0.2 + w * per, 0.2 + w * per + 0.2)); w++; return `<tspan opacity="${r2(op)}">${word}</tspan>`; }).join(' ');
        s += `<text x="${q.x}" y="${q.y0 + i * lh}" font-size="${q.size}" fill="${T.fg}" xml:space="preserve">${spans}</text>`;
      });
      s += TX(q.x, q.y0 + (lines.length - 1) * lh + 40, d.who, 18, T.fg, rise(p, 0.3 + total * per));
      return s;
    },
    anchor: () => [LAY.quote.x, LAY.quote.y0],
  },
};

/* ---------- count: { n } — “this many people”, as a field of n dots ---------- */
const COUNT = {
  bloomCount: TEMPLATES.bloomCount,
  gridCount: {   // n dots fill the figure box row by row, edge to edge
    form: 'grid',
    fits: d => d.n <= 400,
    reveal: () => [0.1, 1.1],
    draw(p, T, d) {
      let s = '';
      const cols = 20, rows = Math.ceil(d.n / cols), dotR = 5, gap = Math.min((F.w - 2 * dotR) / (cols - 1), (F.h - 2 * dotR) / (rows - 1));
      const gy = F.cy - (rows - 1) * gap / 2, shown = d.n * EASE.settle(seg(p, 0.1, 1.1));
      for (let i = 0; i < Math.ceil(shown); i++) s += C(F.x0 + dotR + (i % cols) * gap, gy + Math.floor(i / cols) * gap, dotR, { fill: T.fg, op: clamp01(shown - i) });
      return s;
    },
    anchor: () => [F.cx, F.cy],
  },
  ringsCount: {   // n dots on concentric rings around the figure center, filling outward
    form: 'orbits',
    fits: d => d.n <= 400,
    reveal: () => [0.1, 1.1],
    geom(d) {
      const rmax = Math.min(F.w, F.h) / 2 - 8, pts = []; let r = 0, ring = 0;
      while (pts.length < d.n) { const cnt = ring === 0 ? 1 : Math.floor(2 * Math.PI * r / 15); for (let j = 0; j < cnt && pts.length < d.n; j++) pts.push([r, j * 360 / cnt + ring * 7]); ring++; r = ring * 15; }
      const sc = Math.min(1, rmax / Math.max(1, r - 15));
      return pts.map(([rr, a]) => ringPt(F.cx, F.cy, rr * sc, a - 90));
    },
    draw(p, T, d) {
      let s = '';
      const pts = this.geom(d), shown = d.n * EASE.settle(seg(p, 0.1, 1.1));
      for (let i = 0; i < Math.ceil(shown); i++) s += C(pts[i][0], pts[i][1], 4, { fill: T.fg, op: clamp01(shown - i) });
      return s;
    },
    anchor: () => [F.cx, F.cy],
  },
};

const FAMILIES = { ranking: RANKING, partWhole: PART_WHOLE, comparison: COMPARISON, scale: SCALE, quote: QUOTE, count: COUNT };
const execOf = sc => (sc.family ? FAMILIES[sc.family][sc.execution] : TEMPLATES[sc.template]);

/* ==========================================================================
   SELECTOR — pick one execution per family scene.
   1 fit: only executions whose fits(data) holds (honesty and grammar come first)
   2 within the video: never reuse an execution; avoid a form another scene already uses
   3 across videos: penalize executions used in recent videos for this study/customer — and much harder when the
     same scene got the same execution last time (history entries are "sceneId=family.execution")
   4 seeded tie-break: reproducible for a given seed, different for a new one
   ========================================================================== */
function seededRandom(seed) {
  let h = 1779033703 ^ String(seed).length;
  for (const ch of String(seed)) { h = Math.imul(h ^ ch.charCodeAt(0), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}
function selectExecutions(scenes, history = [], seed = 'default') {
  const rnd = seededRandom(seed), usedExec = new Set(), usedForms = new Set();
  scenes.filter(sc => sc.template).forEach(sc => usedForms.add(TEMPLATES[sc.template].form));
  const recency = (sceneId, id) => history.reduce((pen, video, age) => {   // newest video first
    const ids = video.map(e => e.split('=').pop());
    return pen + (ids.includes(id) ? 3 / (age + 1) : 0) + (video.includes(`${sceneId}=${id}`) ? 3 / (age + 1) : 0);
  }, 0);
  const log = [];
  scenes.forEach(sc => {
    if (!sc.family) return;
    if (sc.execution) { usedExec.add(`${sc.family}.${sc.execution}`); return; }   // pinned by the storyboard
    const fam = FAMILIES[sc.family];
    const fitting = Object.entries(fam).filter(([, ex]) => ex.fits(sc.data));
    let pool = fitting.filter(([id]) => !usedExec.has(`${sc.family}.${id}`));
    if (!pool.length && fitting.length) { pool = fitting; log.push(`${sc.id}: family “${sc.family}” exhausted in this video — reusing; add executions or vary the story`); }
    const scored = pool
      .map(([id, ex]) => ({ id, score: 2 + rnd() - recency(sc.id, `${sc.family}.${id}`) - (usedForms.has(ex.form) ? 1.5 : 0) }))
      .sort((a, b) => b.score - a.score);
    if (!scored.length) throw new Error(`No ${sc.family} execution fits scene “${sc.id}”`);
    sc.execution = scored[0].id;
    usedExec.add(`${sc.family}.${sc.execution}`); usedForms.add(fam[sc.execution].form);
    log.push(`${sc.id}: ${sc.family}.${sc.execution} (from ${scored.map(s => s.id).join(', ')})`);
  });
  log.push(...assignStyle(scenes, rnd));
  return { picks: scenes.filter(sc => sc.family).map(sc => `${sc.id}=${sc.family}.${sc.execution}`), log };
}

/* Surfaces and wipes the storyboard leaves open: a seeded rotation of blue / light / dark with no surface twice in a
   row, and wipes drawn from the brand's one signature (circle iris from the previous scene's anchor, or a line sweep)
   with no variant twice in a row. Same surface back to back → a cut. Explicit values in the storyboard always win. */
function assignStyle(scenes, rnd) {
  const surfaces = ['blue', 'light', 'dark'], wipes = [{ type: 'circle', at: 'prev' }, { type: 'line', dir: 'down' }, { type: 'line', dir: 'up' }, { type: 'line', dir: 'right' }];
  const log = []; let lastWipe = -1;
  scenes.forEach((sc, i) => {
    if (!sc.surface) {
      const prev = i > 0 ? scenes[i - 1].surface : null, next = scenes[i + 1] && scenes[i + 1].surface;
      const options = surfaces.filter(x => x !== prev && x !== next);
      const pool = options.length ? options : surfaces.filter(x => x !== prev);
      sc.surface = pool[Math.floor(rnd() * pool.length)];
      log.push(`${sc.id}: surface ${sc.surface}`);
    }
  });
  scenes.forEach((sc, i) => {
    if (i === 0 || sc.enter !== undefined) return;
    if (sc.surface === scenes[i - 1].surface) { sc.enter = null; return; }   // same surface: cut
    let w; do { w = Math.floor(rnd() * wipes.length); } while (w === lastWipe);
    lastWipe = w; sc.enter = { ...wipes[w] };
  });
  return log;
}

/* ==========================================================================
   ENGINE — headline counters, timeline, wipes, layers, player
   ========================================================================== */
let SCENES = [], TOTAL = 0, STUDY_TITLE = '';
function headFor(sc, p, T) {
  const h = sc.head || {};
  if (h.title) return head(p, T, h);
  if (!h.big) return h.l1 ? head(p, T, h) : '';
  const shift = sc.revealShift || 0, [a0, b0] = h.big.at || execOf(sc).reveal(sc.data), a = a0 + shift, b = b0 + shift;
  const k = h.big.count === false ? 1 : EASE.settle(seg(p, a, b));
  return head(p, T, { ...h, big: (h.big.prefix || '') + fmtVal(h.big.value, h.big.unit || '', k), bigAt: h.big.count === false ? 0.05 : a });
}
function layer(sc, p, scale = 1) {
  const T = TH[sc.surface], ex = execOf(sc);
  const tf = scale !== 1 ? ` transform="translate(${W / 2} ${H / 2}) scale(${r2(scale * 1000) / 1000}) translate(${-W / 2} ${-H / 2})"` : '';
  return `<g${tf}><rect x="-40" y="-40" width="${W + 80}" height="${H + 80}" fill="${T.bg}"/>` +
    ex.draw(Math.max(0, p - (sc.revealShift || 0)), T, sc.data) + headFor(sc, p, T) +
    (sc.template === 'endRow' ? '' : `<text x="${W / 2}" y="${LAY.credit}" font-size="${CREDIT_SIZE}" text-anchor="middle"><tspan fill="${T.fg2}">Listen Labs /</tspan> <tspan fill="${T.fg}">${STUDY_TITLE}</tspan></text>`) +
    (sc.note ? TX(M, LAY.note, sc.note, NOTE_SIZE, T.fg2) : '') + `</g>`;
}
function frame(t) {
  t = Math.max(0, Math.min(TOTAL - 1e-6, t));
  let i = SCENES.findIndex(s => t < s.start + s.dur); if (i < 0) i = SCENES.length - 1;
  const s = SCENES[i], p = t - s.start;
  if (i === 0 || p >= TRANSITION || !s.enter) return layer(s, p);
  const prev = SCENES[i - 1], k = EASE.move(p / TRANSITION), T = TH[s.surface];
  let clip, edge;
  if (s.enter.type === 'circle') {
    const pex = execOf(prev), [x, y] = s.enter.at === 'center' || !pex.anchor ? [F.cx, F.cy] : pex.anchor.call(pex, prev.data);
    const r = Math.max(...[[0, 0], [W, 0], [0, H], [W, H]].map(([a, b]) => Math.hypot(a - x, b - y))) * k;
    clip = `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}"/>`; edge = C(x, y, r, { stroke: T.fg });
  } else {
    const d = s.enter.dir;
    if (d === 'down')  { const h = H * k; clip = `<rect x="0" y="0" width="${W}" height="${r2(h)}"/>`; edge = L(0, h, W, h, T.fg); }
    if (d === 'up')    { const y = H * (1 - k); clip = `<rect x="0" y="${r2(y)}" width="${W}" height="${r2(H - y)}"/>`; edge = L(0, y, W, y, T.fg); }
    if (d === 'right') { const w = W * k; clip = `<rect x="0" y="0" width="${r2(w)}" height="${H}"/>`; edge = L(w, 0, w, H, T.fg); }
  }
  return `<defs><clipPath id="wipe">${clip}</clipPath></defs>` + layer(prev, prev.dur + p, 1 + 0.04 * k) +
    `<g clip-path="url(#wipe)">${layer(s, p, 1 + 0.06 * (1 - k))}</g>` + edge;
}
function boot(story) {
  const params = new URLSearchParams(location.search);
  initLayout((params.get('aspect') || story.aspect || '9:16').replace('x', ':'));
  STUDY_TITLE = story.study;
  SCENES = story.scenes.map(s => ({ ...s }));
  let acc = 0; SCENES.forEach(s => { s.start = acc; acc += s.dur; }); TOTAL = acc;
  SCENES.forEach(sc => { if (sc.note && textW(sc.note, NOTE_SIZE) > R - M) console.warn(`Note too long for ${ASPECT} (${sc.id})`); if (!execOf(sc)) throw new Error(`Unknown template for ${sc.id}`); });
  window.CANVAS = { width: W, height: H }; window.TOTAL = TOTAL; window.FPS = FPS;
  const stage = document.getElementById('stage'), frameEl = document.querySelector('.stage-frame');
  stage.setAttribute('viewBox', `0 0 ${W} ${H}`); frameEl.style.aspectRatio = `${W} / ${H}`;
  window.renderFrame = t => { stage.innerHTML = frame(t); };
  if (params.has('export')) { document.body.classList.add('export'); frameEl.style.width = `${W}px`; frameEl.style.height = `${H}px`; window.renderFrame(0); return; }
  if (W > H) { frameEl.style.width = 'min(100%, 768px)'; document.querySelector('.controls').style.width = 'min(100%, 768px)'; }
  const playBtn = document.getElementById('play'), scrub = document.getElementById('scrub'), time = document.getElementById('time');
  let playing = false, cur = 0, last = 0; scrub.max = TOTAL;
  const show = t => { cur = t; window.renderFrame(t); scrub.value = t; time.textContent = `${t.toFixed(1)} / ${TOTAL.toFixed(1)} s`; };
  const tick = now => { if (!playing) return; cur += (now - last) / 1000; last = now; if (cur >= TOTAL) cur = 0; show(cur); requestAnimationFrame(tick); };
  const setPlaying = on => { playing = on; playBtn.textContent = on ? 'Pause' : 'Play'; if (on) { last = performance.now(); requestAnimationFrame(tick); } };
  playBtn.addEventListener('click', () => setPlaying(!playing));
  scrub.addEventListener('input', () => { setPlaying(false); show(+scrub.value); });
  const settled = i => SCENES[i].start + SCENES[i].dur - 0.05, sceneAt = t => Math.max(0, SCENES.findIndex(s => t < s.start + s.dur));
  document.getElementById('prev').addEventListener('click', () => { setPlaying(false); show(settled(Math.max(0, sceneAt(cur) - 1))); });
  document.getElementById('next').addEventListener('click', () => { setPlaying(false); show(settled(Math.min(SCENES.length - 1, sceneAt(cur) + 1))); });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) show(settled(0)); else { show(0); setPlaying(true); }
}

if (typeof module !== 'undefined') module.exports = { FAMILIES, TEMPLATES, selectExecutions };
