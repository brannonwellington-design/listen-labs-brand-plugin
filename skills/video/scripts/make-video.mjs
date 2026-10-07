#!/usr/bin/env node
// One command from a study analysis to finished, QA'd videos.
//
//   node make-video.mjs --analysis analysis.md --length 30 --depth standard --aspects 9:16,16:9 \
//        [--voice elevenlabs|say|none] [--history history.json] [--out-dir dir] [--storyboard story.json] [--provider anthropic|agent]
//
// Steps (each a gate — the run stops at the first failure):
//   1 extract-facts      analysis → facts.json
//   2 write-storyboard   facts + controls → story.json (API: Claude writes and repairs; agent: stops with a prompt to answer,
//                        then re-run with --storyboard story.json)
//   3 validate           every figure traces to a fact; quotes exact; executions fit; copy fits
//   4 select             executions, surfaces, wipes (variety history) → story.pinned.json
//   5 voiceover          narration, word-cued timing, mix, captions, transcript (skipped with --voice none)
//   6 build              one self-contained composition (video.html)
//   7 render + QA        per aspect: MP4, then qa-video.mjs (layout, contrast, numbers, file, loudness, flashes, captions)
// Writes <out-dir>/report.json and exits non-zero if any gate fails.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : fallback; };
const ANALYSIS = flag('--analysis', null), LENGTH = flag('--length', '30'), DEPTH = flag('--depth', 'standard');
const ASPECTS = flag('--aspects', '9:16').split(','), VOICE = flag('--voice', process.env.ELEVENLABS_API_KEY ? 'elevenlabs' : 'none');
const OUT = path.resolve(flag('--out-dir', 'video-out')), HISTORY = flag('--history', path.join(OUT, '..', 'history.json'));
const STORYBOARD = flag('--storyboard', null), PROVIDER = flag('--provider', null);
if (!ANALYSIS && !STORYBOARD) { console.error('need --analysis <file> (or --storyboard to resume)'); process.exit(1); }
mkdirSync(OUT, { recursive: true });

const report = { started: new Date().toISOString(), controls: { length: +LENGTH, depth: DEPTH, aspects: ASPECTS, voice: VOICE }, steps: [], outputs: {} };
const save = () => writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
const node = (script, argv, { capture = false } = {}) => execFileSync('node', [path.join(HERE, script), ...argv], { encoding: 'utf8', stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit' });
async function step(name, fn) {
  const t0 = Date.now();
  process.stdout.write(`\n▸ ${name}\n`);
  try { const detail = await fn(); report.steps.push({ name, ok: true, seconds: +((Date.now() - t0) / 1000).toFixed(1), ...(detail ? { detail } : {}) }); save(); }
  catch (e) {
    report.steps.push({ name, ok: false, seconds: +((Date.now() - t0) / 1000).toFixed(1), error: String(e.stdout || e.message).trim().slice(0, 4000) });
    report.ok = false; save();
    console.error(`\n✗ stopped at “${name}”. See ${path.join(OUT, 'report.json')}`); process.exit(1);
  }
}

const facts = path.join(OUT, 'facts.json'), story = path.join(OUT, 'story.json'), pinned = path.join(OUT, 'story.pinned.json');
if (ANALYSIS) await step('extract facts', () => { node('extract-facts.mjs', [path.resolve(ANALYSIS), '--out', facts]); });
if (!existsSync(facts)) { console.error(`no facts at ${facts}`); process.exit(1); }

await step('write storyboard', () => {
  if (STORYBOARD) { if (path.resolve(STORYBOARD) !== story) copyFileSync(path.resolve(STORYBOARD), story); return { source: 'provided' }; }
  const prov = PROVIDER || (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN ? 'anthropic' : 'agent');
  node('write-storyboard.mjs', ['--facts', facts, '--length', LENGTH, '--depth', DEPTH, '--aspect', ASPECTS[0], '--out', story, '--provider', prov]);
  if (prov === 'agent') {
    console.log(`\nAgent mode: answer ${story.replace(/\.json$/, '.prompt.md')} by writing ${story}, then resume:\n  node ${path.join(HERE, 'make-video.mjs')} --storyboard ${story} --out-dir ${OUT} --length ${LENGTH} --aspects ${ASPECTS.join(',')} --voice ${VOICE}`);
    report.paused = 'agent mode: storyboard pending'; save(); process.exit(0);
  }
  return { source: prov };
});

await step('validate storyboard', () => {
  try { node('validate-storyboard.mjs', [story, '--facts', facts, '--json'], { capture: true }); }
  catch (e) { const v = JSON.parse(e.stdout); throw Object.assign(new Error('storyboard invalid'), { stdout: v.errors.join('\n') }); }
  const v = JSON.parse(node('validate-storyboard.mjs', [story, '--facts', facts, '--json'], { capture: true }));
  return { warnings: v.warnings };
});

await step('select executions', () => {
  const out = node('build-video.mjs', [story, '--history', path.resolve(HISTORY), '--pin-out', pinned, '--out', path.join(OUT, 'selection-preview.html')], { capture: true });
  return { picks: out.split('\n').filter(l => /^\s+\w+: \w+\.\w+/.test(l)).map(l => l.trim().replace(/ \(from.*/, '')) };
});

let built = pinned, audio = null, captions = null;
if (VOICE !== 'none') await step(`voiceover (${VOICE})`, () => {
  node('voiceover.mjs', [pinned, '--provider', VOICE, '--out-dir', path.join(OUT, 'voice')]);
  built = path.join(OUT, 'voice', path.basename(pinned).replace(/\.json$/, '.voiced.json'));
  audio = path.join(OUT, 'voice', 'narration.wav'); captions = path.join(OUT, 'voice', 'captions.srt');
  report.outputs.captions = captions; report.outputs.transcript = path.join(OUT, 'voice', 'transcript.txt');
  return { total: JSON.parse(readFileSync(built, 'utf8')).voiced?.total };
});

const html = path.join(OUT, 'video.html');
await step('build composition', () => { node('build-video.mjs', [built, '--out', html], { capture: true }); report.outputs.composition = html; });

report.qa = {};
for (const aspect of ASPECTS) {
  const tag = aspect.replace(':', 'x'), mp4 = path.join(OUT, `video-${tag}.mp4`);
  await step(`render ${aspect}`, () => { node('render-video.mjs', [html, mp4, '--query', `aspect=${tag}`, ...(audio ? ['--audio', audio] : [])]); report.outputs[`video_${tag}`] = mp4; });
  await step(`QA ${aspect}`, () => {
    const argv = [html, '--video', mp4, '--aspect', aspect, '--facts', facts, '--sheet', path.join(OUT, `qa-${tag}.png`), '--json', ...(captions ? ['--captions', captions] : [])];
    let res;
    try { res = JSON.parse(node('qa-video.mjs', argv, { capture: true })); }
    catch (e) { res = JSON.parse(e.stdout); report.qa[aspect] = res; throw Object.assign(new Error('QA failed'), { stdout: res.errors.join('\n') }); }
    report.qa[aspect] = res; report.outputs[`contact_sheet_${tag}`] = path.join(OUT, `qa-${tag}.png`);
    return { warnings: res.warnings.length };
  });
}
report.ok = true; report.finished = new Date().toISOString(); save();
console.log(`\n✓ done — ${ASPECTS.map(a => `video-${a.replace(':', 'x')}.mp4`).join(', ')} in ${OUT}`);
