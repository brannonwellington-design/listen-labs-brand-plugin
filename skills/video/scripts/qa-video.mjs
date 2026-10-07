#!/usr/bin/env node
// Automated QA for a rendered video: the gate that lets videos ship without a person checking contact sheets.
//
// Usage: node qa-video.mjs <composition.html> [--video out.mp4] [--aspect 9:16|16:9] [--facts facts.json]
//                          [--captions captions.srt] [--sheet sheet.png] [--json]
// Exit 1 on errors. Warnings never block.
//
// Composition checks (headless Chrome, at every scene's settled frame): text inside canvas and margins, nothing in the
// credit zone, no overlapping text, type floors, text contrast (4.5:1, 3:1 at 24px+), everything settled by the settle
// point, figure marks inside the margins, and — with --facts — every number drawn on screen traces to the facts.
// Video checks: resolution / fps / frame count / pixel format / A–V sync (ffprobe), loudness (−17…−13 LUFS, true peak
// ≤ −1 dBTP), flashes (WCAG 2.3.1: ≤ 3 general flashes in any 1s), captions (≤42 chars/line, ≤2 lines (3 on 9:16),
// ≤20 chars/s, 0.8–7s, no overlap).

import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : fallback; };
const AS_JSON = args.includes('--json') && !!args.splice(args.indexOf('--json'), 1);
const VIDEO = flag('--video', null), ASPECT = flag('--aspect', '9:16'), FACTS = flag('--facts', null);
const CAPTIONS = flag('--captions', null), SHEET = flag('--sheet', null);
const INPUT = path.resolve(args[0] || 'composition.html');
const errors = [], warnings = [];
const E = (w, m) => errors.push(`${w}: ${m}`), W = (w, m) => warnings.push(`${w}: ${m}`);

/* ---------- color math (WCAG relative luminance) ---------- */
const hexToRgb = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); };
const lum = hex => { const [r, g, b] = hexToRgb(hex).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

/* ---------- composition: drive headless Chrome over CDP ---------- */
const CHROME = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => p && existsSync(p));
if (!CHROME) throw new Error('Chrome not found — set CHROME_PATH');
const PORT = 9300 + Math.floor(Math.random() * 600), profile = mkdtempSync(path.join(tmpdir(), 'llqa-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--hide-scrollbars', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let page; for (let i = 0; i < 60 && !page; i++) { try { page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page'); } catch { await sleep(200); } }
const ws = new WebSocket(page.webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, m => (m.error ? rej(new Error(m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };

const consoleWarnings = [];
await send('Runtime.enable');
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'warning') consoleWarnings.push(m.params.args.map(a => a.value).join(' ')); });
await send('Page.navigate', { url: `${pathToFileURL(INPUT).href}?export=1&aspect=${ASPECT.replace(':', 'x')}` });
for (let i = 0; i < 100; i++) { if (await evaluate(`document.readyState === 'complete' && typeof renderFrame === 'function'`)) break; await sleep(100); }
await evaluate('document.fonts.ready.then(() => true)');
const env = await evaluate(`({ W, H, M, R, F, credit: LAY.credit, note: LAY.note, CLEAR, NOTE_SIZE, CREDIT_SIZE, study: STUDY_TITLE,
  scenes: SCENES.map(s => ({ id: s.id, start: s.start, dur: s.dur, surface: s.surface, family: s.family, execution: s.execution, template: s.template, data: s.data, head: s.head, facts: s.facts, derived: s.derived, note: s.note, bg: TH[s.surface].bg })) })`);
await send('Emulation.setDeviceMetricsOverride', { width: env.W, height: env.H, deviceScaleFactor: 1, mobile: false });
consoleWarnings.forEach(w => E('composition', `console warning: ${w}`));

const ZONE_TOP = env.credit + env.CLEAR, ZONE_BOTTOM = env.note - env.NOTE_SIZE * 0.73 - env.CLEAR;
const MEASURE = `(() => {
  const svg = document.getElementById('stage'), out = { texts: [], marks: [] };
  const opacityOf = el => { let o = 1; for (let n = el; n && n !== svg; n = n.parentNode) { const a = n.getAttribute && n.getAttribute('opacity'); if (a != null) o *= +a; } return o; };
  // Ink box, not line box: cap height above the baseline, descender depth below only if the string has descenders
  const fills = [...svg.querySelectorAll('circle, rect')].filter(m => { const f = m.getAttribute('fill'); return f && f !== 'none' && !m.closest('defs'); });
  svg.querySelectorAll('text').forEach(t => {
    const b = t.getBBox(), size = +t.getAttribute('font-size'), y = +t.getAttribute('y'), str = t.textContent.replace(/\\u00a0/g, ' ');
    const top = y - 0.74 * size, bottom = y + (/[gjpqy,;()\\[\\]]/.test(str) ? 0.21 : 0.02) * size;
    const cx = b.x + b.width / 2, cy = (top + bottom) / 2;
    let backdrop = null;   // the last filled shape drawn before this text that contains its center (else the scene background)
    for (const m of fills) { if (!(m.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING)) continue; const mb = m.getBBox(); if (mb.width >= W) continue;
      const inside = m.tagName === 'circle' ? Math.hypot(cx - +m.getAttribute('cx'), cy - +m.getAttribute('cy')) <= +m.getAttribute('r') : (cx >= mb.x && cx <= mb.x + mb.width && cy >= mb.y && cy <= mb.y + mb.height);
      if (inside) backdrop = m.getAttribute('fill'); }
    out.texts.push({ x0: b.x, y0: top, x1: b.x + b.width, y1: bottom, size, backdrop, fill: t.getAttribute('fill') || (t.querySelector('tspan') && t.querySelector('tspan').getAttribute('fill')), op: opacityOf(t), str });
  });
  svg.querySelectorAll('circle, line, path, rect').forEach(m => { if (m.closest('clipPath') || m.closest('defs')) return; const b = m.getBBox(); const sw = +(m.getAttribute('stroke-width') || 0) / 2;
    out.marks.push({ tag: m.tagName, cx: m.tagName === 'circle' ? +m.getAttribute('cx') : null, x0: b.x - sw, y0: b.y - sw, x1: b.x + b.width + sw, y1: b.y + b.height + sw, logo: !!m.closest('g[transform*="scale"]') && m.tagName === 'path', bgRect: m.tagName === 'rect' && b.width >= ${'${W}'} }); });
  return out; })()`.replace('${W}', 'W');

/* ---------- allowed numbers (with --facts) ---------- */
let factById = null, STUDY_N = null;
if (FACTS) { const fs = JSON.parse(readFileSync(FACTS, 'utf8')); factById = Object.fromEntries(fs.facts.map(f => [f.id, f])); STUDY_N = fs.study.n; }
const factNums = f => { const o = []; const p = v => typeof v === 'number' && o.push(v);
  if (f.kind === 'scalar') { p(f.value); p(f.count); p(f.base); } if (f.kind === 'series') { f.items.forEach(i => { p(i.value); p(i.count); p(i.base); }); p(f.n); p(f.items.length); }
  if (f.kind === 'chart') { p(f.n); } if (f.kind === 'statement') f.numbers.forEach(p);
  [f.title, f.description].filter(Boolean).forEach(t => [...t.matchAll(/(?<![\w.])(\d[\d,]*(?:\.\d+)?)/g)].forEach(m => p(+m[1].replace(/,/g, '')))); return o; };

for (const sc of env.scenes) {
  const t = sc.start + sc.dur - 0.08, where = `${ASPECT} ${sc.id}`;
  await evaluate(`renderFrame(${t})`);
  const m = await evaluate(MEASURE);
  const isCredit = x => x.size === env.CREDIT_SIZE && x.y1 <= env.credit + 6, isNote = x => x.size === env.NOTE_SIZE && x.y0 >= env.note - 20;
  const isEnd = sc.template === 'endRow';
  m.texts.forEach(x => {
    const label = `“${x.str.slice(0, 28)}”`;
    if (x.op < 0.98) W(where, `${label} not fully visible at the settle point (opacity ${x.op.toFixed(2)})`);
    if (x.x0 < 0 || x.x1 > env.W || x.y0 < 0 || x.y1 > env.H) E(where, `${label} runs off the canvas`);
    else if (x.x0 < env.M - 2 || x.x1 > env.R + 2) E(where, `${label} crosses the side margin (${Math.round(x.x0)}–${Math.round(x.x1)} vs ${env.M}–${env.R})`);
    if (!isCredit(x) && !isNote(x) && !isEnd && x.y0 < ZONE_TOP - 1) E(where, `${label} enters the credit zone (top ${Math.round(x.y0)} < ${ZONE_TOP})`);
    if (!isCredit(x) && !isNote(x) && !isEnd && x.y1 > ZONE_BOTTOM + 2) E(where, `${label} enters the note clearance (bottom ${Math.round(x.y1)} > ${Math.round(ZONE_BOTTOM)})`);
    if (x.size < 14) E(where, `${label} is ${x.size}px — below the 14px floor`);
    if (x.fill && /^#[0-9a-f]{3,6}$/i.test(x.fill)) { const bgc = x.backdrop && /^#[0-9a-f]{3,6}$/i.test(x.backdrop) ? x.backdrop : sc.bg, c = contrast(x.fill, bgc), need = x.size >= 24 ? 3 : 4.5; if (c < need) E(where, `${label} contrast ${c.toFixed(2)}:1 < ${need}:1`); }
  });
  for (let i = 0; i < m.texts.length; i++) for (let j = i + 1; j < m.texts.length; j++) {
    const a = m.texts[i], b = m.texts[j];
    const ix = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), iy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
    if (ix > 2 && iy > 4) E(where, `text overlaps: “${a.str.slice(0, 20)}” and “${b.str.slice(0, 20)}”`);
  }
  m.marks.filter(k => !k.bgRect && !k.logo).forEach(k => {
    const offSide = k.cx != null ? (k.cx < env.M - 1 || k.cx > env.R + 1) : (k.x0 < env.M - 3 || k.x1 > env.R + 3);   // dots by center: an end dot sits on the margin by design
    if (offSide) E(where, `a ${k.tag} crosses the side margin (${Math.round(k.x0)}–${Math.round(k.x1)})`);
    if (!isEnd && (k.y0 < ZONE_TOP - 2 || k.y1 > ZONE_BOTTOM + 3)) E(where, `a ${k.tag} enters the credit/note clearance (${Math.round(k.y0)}–${Math.round(k.y1)})`);
  });
  if (factById) {   // every number drawn on screen traces to the scene's facts (plus engine complements: base − count, 100 − pct)
    const allowed = [STUDY_N, ...(sc.facts || []).flatMap(fid => (factById[fid] ? factNums(factById[fid]) : [])), ...(sc.derived || []).map(d => d.value)];
    const d = sc.data || {};
    if (d.items) allowed.push(d.items.length);
    if (d.pct != null) allowed.push(100 - d.pct, d.pct); if (d.count != null && d.base != null) allowed.push(d.base - d.count, d.count, d.base);
    if (d.ref) allowed.push(d.ref.value);
    if (d.n != null) allowed.push(d.n);
    const nums = m.texts.filter(x => !isCredit(x)).flatMap(x => [...x.str.matchAll(/(?<![\w.])(\d[\d,]*(?:\.\d+)?)/g)].map(mm => ({ v: +mm[1].replace(/,/g, ''), s: x.str })));
    nums.forEach(n => { if (!allowed.some(a => Math.abs(a - n.v) < 1e-6)) E(where, `on-screen ${n.v} (in “${n.s.slice(0, 30)}”) doesn't trace to the scene's facts`); });
  }
}
ws.close(); chrome.kill(); try { rmSync(profile, { recursive: true, force: true }); } catch {}

/* ---------- the video file ---------- */
const total = env.scenes.reduce((a, s) => a + s.dur, 0);
if (VIDEO) {
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', VIDEO]).toString());
  const v = probe.streams.find(s => s.codec_type === 'video'), a = probe.streams.find(s => s.codec_type === 'audio');
  const [ew, eh] = [env.W * 2, env.H * 2];
  if (v.width !== ew || v.height !== eh) E('video', `${v.width}×${v.height}, expected ${ew}×${eh}`);
  if (v.r_frame_rate !== '30/1') W('video', `frame rate ${v.r_frame_rate}`);
  if (v.pix_fmt !== 'yuv420p') E('video', `pixel format ${v.pix_fmt} (needs yuv420p for broad playback)`);
  const frames = +v.nb_frames, want = Math.round(total * 30);
  if (Math.abs(frames - want) > 1) E('video', `${frames} frames, composition says ${want}`);
  if (a) {
    if (Math.abs(+a.duration - +v.duration) > 0.1) E('audio', `audio ${(+a.duration).toFixed(2)}s vs video ${(+v.duration).toFixed(2)}s`);
    const stats = (() => {   // loudnorm prints its measurement as JSON on stderr
      const r = spawnSync('ffmpeg', ['-hide_banner', '-i', VIDEO, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr || '';
      const j = r.slice(r.lastIndexOf('{'), r.lastIndexOf('}') + 1); try { return JSON.parse(j); } catch { return null; }
    })();
    if (stats) {
      const I = +stats.input_i, TP = +stats.input_tp;
      if (I < -17 || I > -13) E('audio', `loudness ${I} LUFS (target −14…−16)`);
      if (TP > -1) E('audio', `true peak ${TP} dBTP (limit −1)`);
    } else W('audio', 'could not measure loudness');
  } else W('audio', 'no audio stream');

  /* flashes: per-frame mean luminance of a 32×32 grid; a flash = a ≥10% luminance swing and back in one region, area-weighted */
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', VIDEO, '-vf', 'scale=32:32,format=gray', '-f', 'rawvideo', '-']);
  const N = 1024, nf = Math.floor(raw.length / N), changes = [];
  const toLum = v => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  for (let f = 1; f < nf; f++) {
    let up = 0, down = 0;
    for (let p = 0; p < N; p++) { const a0 = toLum(raw[(f - 1) * N + p]), a1 = toLum(raw[f * N + p]), d = a1 - a0; if (Math.abs(d) >= 0.1 && Math.min(a0, a1) < 0.8) d > 0 ? up++ : down++; }
    const area = 0.111;   // WCAG general-flash area: 341×256 of 1024×768 ≈ 11% of the frame
    changes.push(up / N >= area ? 1 : down / N >= area ? -1 : 0);
  }
  for (let f = 0; f + 30 <= changes.length; f++) {
    const win = changes.slice(f, f + 30).filter(Boolean); let flips = 0;
    for (let k = 1; k < win.length; k++) if (win[k] !== win[k - 1]) flips++;
    if (flips / 2 > 3) { E('video', `more than 3 flashes in one second around ${(f / 30).toFixed(1)}s`); break; }
  }

  /* contact sheet of every settled frame (for a person or a vision reviewer) */
  if (SHEET) {
    const dir = mkdtempSync(path.join(tmpdir(), 'llsheet-'));
    env.scenes.forEach((s, i) => execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', `${s.start + s.dur - 0.08}`, '-i', VIDEO, '-frames:v', '1', '-vf', `scale=${env.W > env.H ? 480 : 240}:-1`, path.join(dir, `${String(i).padStart(2, '0')}.png`)]));
    const cols = env.W > env.H ? 3 : 6, rows = Math.ceil(env.scenes.length / cols);
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-pattern_type', 'glob', '-i', path.join(dir, '*.png'), '-filter_complex', `tile=${cols}x${rows}:padding=4:color=white`, '-frames:v', '1', path.resolve(SHEET)]);
    rmSync(dir, { recursive: true, force: true });
  }
}

/* ---------- captions ---------- */
if (CAPTIONS) {
  const srt = readFileSync(CAPTIONS, 'utf8').trim().split(/\n\s*\n/);
  const tsec = s => { const [h, m, r] = s.split(':'); return +h * 3600 + +m * 60 + +r.replace(',', '.'); };
  let prevEnd = -1;
  srt.forEach(block => {
    const lines = block.split('\n'), [a, b] = lines[1].split(' --> ').map(tsec), text = lines.slice(2), where = `caption ${lines[0]}`;
    const maxLines = ASPECT === '9:16' ? 3 : 2, chars = text.join(' ').length, dur = b - a;
    if (text.length > maxLines) E(where, `${text.length} lines (max ${maxLines})`);
    text.forEach(l => { if (l.length > 42) E(where, `line of ${l.length} characters (max 42)`); });
    if (dur < 0.8 - 1e-3 || dur > 7) E(where, `on screen ${dur.toFixed(2)}s (0.8–7s)`);
    if (chars / dur > 20.5) W(where, `${(chars / dur).toFixed(1)} characters per second (max 20)`);
    if (a < prevEnd - 1e-3) E(where, 'overlaps the previous caption');
    prevEnd = b;
  });
}

const ok = !errors.length;
if (AS_JSON) console.log(JSON.stringify({ ok, errors, warnings }, null, 2));
else {
  console.log(`${ok ? '✓ QA passed' : `✗ QA failed: ${errors.length} error(s)`} — ${ASPECT}, ${env.scenes.length} scenes, ${total.toFixed(1)}s`);
  errors.forEach(e => console.log('  error   ' + e)); warnings.forEach(w => console.log('  warning ' + w));
}
process.exit(ok ? 0 : 1);
