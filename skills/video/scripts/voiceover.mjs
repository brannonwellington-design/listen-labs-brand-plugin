#!/usr/bin/env node
// Voiceover for a storyboard: narration per scene → word timestamps → scene timing and cues → mixed track,
// captions (.srt/.vtt), transcript, and a voiced storyboard for build-video.mjs. Audio is the clock.
//
// Usage: node voiceover.mjs <story.json> [--out-dir dir] [--provider elevenlabs|say] [--voice <id|name>] [--model eleven_v4]
//   elevenlabs  production. Needs ELEVENLABS_API_KEY in the environment (never in files). Word timings from the API.
//   say         dev stand-in: macOS built-in voice, offline, nothing leaves the machine. No word timestamps from the
//               engine — they are ESTIMATED from character counts. Never ship a `say` render.
//
// Each scene may carry: "narration" (spoken text, numbers written as words), "cue" (the word on which the scene's data
// reveal should start). Validation runs first: every headline number must be spoken exactly; with
// story.narrateQuotes false, no quote text may appear in narration.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : fallback; };
const PROVIDER = flag('--provider', process.env.ELEVENLABS_API_KEY ? 'elevenlabs' : 'say');
const VOICE = flag('--voice', null), MODEL = flag('--model', 'eleven_v4');
const STORY_PATH = path.resolve(args[0] || 'story.json');
const OUT_DIR = path.resolve(flag('--out-dir', path.join(path.dirname(STORY_PATH), 'voice')));
const LEAD_IN = 0.15, TAIL = 0.6;            // narration starts just after the cut; scene holds a beat after it ends
const story = JSON.parse(readFileSync(STORY_PATH, 'utf8'));
const { FAMILIES, TEMPLATES } = createRequire(import.meta.url)(path.join(HERE, '..', 'library', 'library.js'));
mkdirSync(OUT_DIR, { recursive: true });

/* ---------- validation: numbers spoken exactly, quotes kept off the TTS vendor unless allowed ---------- */
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const under100 = n => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''));
const under1000 = n => (n < 100 ? under100(n) : ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + under100(n % 100) : ''));
function spokenForms(v) {
  const forms = new Set(), int = Math.floor(v), dec = Math.round((v - int) * 10);
  const base = int < 1000 ? under1000(int) : under1000(Math.floor(int / 1000)) + ' thousand' + (int % 1000 ? ' ' + under1000(int % 1000) : '');
  forms.add(base);
  if (int >= 100 && int < 1000) { forms.add(base.replace(' hundred ', ' hundred and ')); forms.add(base.replace(/^one hundred/, 'a hundred')); forms.add(base.replace(/^one hundred/, 'a hundred and').replace('and ', 'and ')); }
  if (int >= 1100 && int < 2000 && int % 100 !== 0) { const h = Math.floor(int / 100), r = int % 100; forms.add(`${under100(h)} hundred ${under100(r)}`); forms.add(`${under100(h)} hundred and ${under100(r)}`); }
  if (int >= 1100 && int < 2000 && int % 100 === 0) forms.add(`${under100(int / 100)} hundred`);
  return [...forms].map(f => (dec ? `${f} point ${ONES[dec]}` : f));
}
const norm = s => ' ' + s.toLowerCase().replace(/[’']/g, "'").replace(/[-–—]/g, ' ').replace(/[^a-z0-9' ]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
const problems = [];
story.scenes.forEach(sc => {
  const big = sc.head && sc.head.big;
  if (big && sc.narration) {
    const unitWord = big.unit === '%' ? ' percent' : big.unit === '×' ? ' times' : '';
    const ok = spokenForms(big.value).some(f => norm(sc.narration).includes(norm(f + unitWord)));
    if (!ok) problems.push(`${sc.id}: headline ${big.value}${big.unit || ''} is not spoken exactly (expected e.g. “${spokenForms(big.value)[0]}${unitWord}”)`);
  }
  if (big && !sc.narration) problems.push(`${sc.id}: headline ${big.value}${big.unit || ''} appears on screen but is never narrated`);
  if (sc.narration && /\d/.test(sc.narration)) problems.push(`${sc.id}: write numbers as words in narration so the voice can’t misread them`);
  const isQuote = sc.family === 'quote' || sc.template === 'quote';
  if (isQuote && !story.narrateQuotes && sc.narration) {
    const words = norm(sc.data.text).trim().split(' ').filter(w => w.length > 3);
    const shared = words.filter(w => norm(sc.narration).includes(` ${w} `));
    if (shared.length >= Math.min(4, words.length)) problems.push(`${sc.id}: narration repeats the quote, but narrateQuotes is off — introduce it instead`);
  }
});
if (story.targetSeconds) {   // word budget at ~2.4 spoken words per second (brand narration rate)
  const words = story.scenes.reduce((a, sc) => a + (sc.narration ? sc.narration.split(/\s+/).length : 0), 0), budget = Math.round(story.targetSeconds * 2.4);
  if (words > budget * 1.1) problems.push(`narration is ${words} words; a ${story.targetSeconds}s video holds about ${budget} — cut lines or choose a longer length`);
}
if (problems.length) { console.error('Narration check failed:\n  ' + problems.join('\n  ')); process.exit(1); }

/* ---------- providers ---------- */
function wordsFromAlignment(al) {
  const words = []; let cur = null;
  al.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) { if (cur) { words.push(cur); cur = null; } return; }
    if (!cur) cur = { text: '', start: al.character_start_times_seconds[i] };
    cur.text += ch; cur.end = al.character_end_times_seconds[i];
  });
  if (cur) words.push(cur);
  return words;
}
const recentIds = [];
async function elevenlabs(sc, i, file) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY is not set');
  const voice = VOICE || story.voice?.id;
  if (!voice) throw new Error('No voice: pass --voice <voice_id> or set story.voice.id');
  const body = {
    text: sc.narration, model_id: story.voice?.model || MODEL, seed: story.voice?.seed ?? 7, apply_text_normalization: 'on',
    voice_settings: story.voice?.settings || { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: 1 },
  };
  if (recentIds.length) body.previous_request_ids = recentIds.slice(-3);        // stitching: prosody carries across scenes
  else if (i > 0) body.previous_text = story.scenes.slice(0, i).map(s => s.narration).filter(Boolean).slice(-2).join(' ');
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const id = res.headers.get('request-id'); if (id) recentIds.push(id);
  const json = await res.json();
  writeFileSync(file, Buffer.from(json.audio_base64, 'base64'));
  return { words: wordsFromAlignment(json.alignment), estimated: false };
}
function say(sc, i, file) {
  const aiff = file.replace(/\.\w+$/, '.aiff');
  execFileSync('say', ['-v', VOICE || 'Samantha', '-r', '175', '-o', aiff, sc.narration]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', aiff, '-ar', '44100', file]);
  const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString();
  const toks = sc.narration.split(/\s+/), weights = toks.map(t => t.length + 1), total = weights.reduce((a, b) => a + b, 0);
  let t = 0.05; const span = Math.max(0.1, dur - 0.15);
  return { words: toks.map((text, j) => { const w = { text, start: t }; t += span * weights[j] / total; w.end = t - 0.02; return w; }), estimated: true };
}

/* ---------- run ---------- */
const execOf = sc => {
  if (sc.family && !sc.execution) throw new Error(`${sc.id}: execution not pinned — run build-video.mjs --pin-out first so cues match the chosen execution`);
  return sc.family ? FAMILIES[sc.family][sc.execution] : TEMPLATES[sc.template];
};
let acc = 0; const clips = [], words = [], transcript = [];
for (const [i, sc] of story.scenes.entries()) {
  sc.start = acc;
  if (sc.narration) {
    const file = path.join(OUT_DIR, `${String(i + 1).padStart(2, '0')}-${sc.id}.${PROVIDER === 'say' ? 'wav' : 'mp3'}`);
    const r = PROVIDER === 'elevenlabs' ? await elevenlabs(sc, i, file) : say(sc, i, file);
    const audioDur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString();
    // scene lasts as long as its narration plus a held beat — never shorter than the storyboard asked for
    sc.dur = Math.max(sc.dur, +(LEAD_IN + audioDur + TAIL).toFixed(2));
    if (sc.cue) {   // the data reveal starts on the cue word
      const first = t => norm(t).trim().split(' ')[0], w = r.words.find(x => first(x.text) === first(sc.cue));
      if (!w) throw new Error(`${sc.id}: cue “${sc.cue}” not found in narration`);
      const [revealStart] = execOf(sc).reveal(sc.data);
      sc.revealShift = Math.max(0, +(LEAD_IN + w.start - revealStart).toFixed(2));
    }
    clips.push({ file, at: sc.start + LEAD_IN });
    r.words.forEach(w => words.push({ text: w.text, start: sc.start + LEAD_IN + w.start, end: sc.start + LEAD_IN + w.end, scene: sc.id }));
    transcript.push(`[${sc.start.toFixed(1)}s] ${sc.narration}`);
    console.log(`${sc.id}: ${audioDur.toFixed(2)}s narration → scene ${sc.dur}s${sc.revealShift ? `, reveal +${sc.revealShift}s on “${sc.cue}”` : ''}${r.estimated ? ' (timings estimated)' : ''}`);
  }
  const isQuote = sc.family === 'quote' || sc.template === 'quote';
  if (isQuote) transcript.push(`[${sc.start.toFixed(1)}s] On screen: ${sc.data.text} ${sc.data.who}${story.narrateQuotes ? ' (read by AI voice)' : ''}`);
  if (sc.template === 'endRow') sc.data.disclosure = story.narrateQuotes ? 'Narrated by an AI voice, including participant quotes.' : 'Narrated by an AI voice.';
  acc += sc.dur;
}
const TOTAL = acc;

/* ---------- mix: clips at their scene offsets, loudness-normalized (−16 LUFS, −1 dBTP) ---------- */
const track = path.join(OUT_DIR, 'narration.wav');
const inputs = clips.flatMap(c => ['-i', c.file]);
const filter = clips.map((c, i) => `[${i}:a]adelay=${Math.round(c.at * 1000)}|${Math.round(c.at * 1000)},aformat=channel_layouts=stereo[a${i}]`).join(';') +
  `;${clips.map((_, i) => `[a${i}]`).join('')}amix=inputs=${clips.length}:normalize=0,apad,atrim=0:${TOTAL.toFixed(3)},loudnorm=I=-16:TP=-1:LRA=11[out]`;
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filter, '-map', '[out]', '-ar', '48000', track]);

/* ---------- captions: ≤42 chars/line, ≤2 lines, ≤20 chars/s, 0.8–7 s, break at punctuation and pauses ---------- */
const cues = []; let cur = [];
const flush = () => { if (cur.length) { cues.push({ start: cur[0].start, end: cur[cur.length - 1].end, text: cur.map(w => w.text).join(' ') }); cur = []; } };
words.forEach((w, i) => {
  const next = words[i + 1], text = [...cur, w].map(x => x.text).join(' ');
  if (text.length > 84 || (cur.length && w.scene !== cur[0].scene)) flush();
  cur.push(w);
  const pause = next ? next.start - w.end : 1, punct = /[.!?;:]$/.test(w.text) || (/,$/.test(w.text) && text.length > 30);
  if (punct || pause >= 0.15 && text.length > 20 || !next) flush();
});
cues.forEach((c, i) => {
  const minEnd = c.start + Math.max(0.8, c.text.length / 20);
  c.end = Math.min(Math.max(c.end, minEnd), cues[i + 1] ? cues[i + 1].start - 0.02 : TOTAL, c.start + 7);
  if (c.text.length > 42) { const words = c.text.split(' '); let best = 1, diff = 1e9; for (let k = 1; k < words.length; k++) { const a = words.slice(0, k).join(' ').length, b = words.slice(k).join(' ').length; if (Math.max(a, b) <= 42 && Math.abs(a - b) < diff) { diff = Math.abs(a - b); best = k; } } c.lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')]; } else c.lines = [c.text];
});
const ts = (t, sep) => { const h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, s = Math.floor(t) % 60, ms = Math.round((t % 1) * 1000); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}${sep}${String(ms).padStart(3, '0')}`; };
writeFileSync(path.join(OUT_DIR, 'captions.srt'), cues.map((c, i) => `${i + 1}\n${ts(c.start, ',')} --> ${ts(c.end, ',')}\n${c.lines.join('\n')}\n`).join('\n'));
writeFileSync(path.join(OUT_DIR, 'captions.vtt'), 'WEBVTT\n\n' + cues.map(c => `${ts(c.start, '.')} --> ${ts(c.end, '.')}\n${c.lines.join('\n')}\n`).join('\n'));
writeFileSync(path.join(OUT_DIR, 'transcript.txt'), `${story.study}\nNarration: AI voice (${PROVIDER === 'say' ? 'DEV STAND-IN — macOS voice, estimated timings' : 'ElevenLabs ' + (story.voice?.model || MODEL)})\n\n` + transcript.join('\n') + '\n');

const voiced = path.join(OUT_DIR, path.basename(STORY_PATH).replace(/\.json$/, '.voiced.json'));
story.scenes.forEach(sc => { delete sc.start; });
story.voiced = { provider: PROVIDER, estimatedTimings: PROVIDER === 'say', total: +TOTAL.toFixed(2) };
writeFileSync(voiced, JSON.stringify(story, null, 2));
console.log(`\ntotal ${TOTAL.toFixed(2)}s · ${cues.length} captions\nwrote ${track}\nwrote ${voiced}\nnext: node build-video.mjs ${path.basename(voiced)} … then render-video.mjs … --audio narration.wav`);
