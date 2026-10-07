#!/usr/bin/env node
// Voiceover for a storyboard: narration per scene → word timestamps → scene timing and cues → mixed track,
// captions (.srt/.vtt), transcript, and a voiced storyboard for build-video.mjs. Audio is the clock.
//
// Usage: node voiceover.mjs <story.json> [--out-dir dir] [--provider elevenlabs|say] [--voice <id|name>] [--model eleven_v4]
//   elevenlabs  production. Needs ELEVENLABS_API_KEY in the environment (never in files). Word timings from the API.
//               Voice defaults to the brand house voice (library/voice.json, generated from brand_data.py);
//               --voice River / Daniel picks an approved alternate by name, or pass a voice ID.
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
const BRAND_VOICE = JSON.parse(readFileSync(path.join(HERE, '..', 'library', 'voice.json'), 'utf8'));   // generated from brand_data.py
const ALT = flag('--voice', null), MODEL = flag('--model', BRAND_VOICE.model);
const VOICE = ALT ? ([BRAND_VOICE.house, ...BRAND_VOICE.alternates].find(v => v.name.toLowerCase() === ALT.toLowerCase())?.id || ALT) : null;
const STORY_PATH = path.resolve(args[0] || 'story.json');
const OUT_DIR = path.resolve(flag('--out-dir', path.join(path.dirname(STORY_PATH), 'voice')));
const PACE_FLAG = flag('--pace', null);
const story = JSON.parse(readFileSync(STORY_PATH, 'utf8'));
const PACE = PACE_FLAG || story.pace || 'kinetic';
const [LEAD_IN, TAIL] = PACE === 'explainer' ? [0.15, 0.6] : [0.1, 0.35];   // narration starts just after the cut; scene holds a beat after it ends
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
/* ---------- beats: what each narration line covers ----------
   'scenes' mode (45s and longer): every narrated scene is its own beat — literal reads.
   'beats' mode (under 45s): story.beats groups consecutive scenes under one line, e.g.
     { "id": "open", "scenes": ["hook", "weekly"], "narration": "…", "cues": { "hook": "Three", "weekly": "ninety-three" } }
   Scenes in no beat play under silence. */
const MODE = story.narrationMode || (story.targetSeconds && story.targetSeconds < 45 ? 'beats' : 'scenes');
const byId = Object.fromEntries(story.scenes.map(sc => [sc.id, sc]));
const BEATS = [];
if (MODE === 'beats') {
  if (!story.beats) { console.error('beats mode needs story.beats (or set narrationMode: "scenes")'); process.exit(1); }
  const owner = {}; story.beats.forEach(b => b.scenes.forEach(id => { if (!byId[id]) { console.error(`beat ${b.id}: unknown scene ${id}`); process.exit(1); } owner[id] = b; }));
  story.scenes.forEach((sc, i) => {
    const b = owner[sc.id];
    if (!b) BEATS.push({ id: sc.id, scenes: [sc.id] });
    else if (b.scenes[0] === sc.id) {
      const idx = b.scenes.map(id => story.scenes.findIndex(x => x.id === id));
      if (idx.some((v, k) => k && v !== idx[k - 1] + 1)) { console.error(`beat ${b.id}: its scenes must be consecutive in the storyboard`); process.exit(1); }
      BEATS.push(b);
    }
  });
} else story.scenes.forEach(sc => BEATS.push({ id: sc.id, scenes: [sc.id], narration: sc.narration, cues: sc.cue ? { [sc.id]: sc.cue } : {} }));

const NUM_WORDS = new Set([...ONES, ...TENS.filter(Boolean), 'hundred', 'thousand', 'a']);
const problems = [];
BEATS.forEach(b => {
  const scs = b.scenes.map(id => byId[id]);
  if (b.narration && /\d/.test(b.narration)) problems.push(`${b.id}: write numbers as words in narration so the voice can’t misread them`);
  scs.forEach(sc => {
    const big = sc.head && sc.head.big, unitWord = big && (big.unit === '%' ? ' percent' : big.unit === '×' ? ' times' : '');
    const spoken = big && b.narration && spokenForms(big.value).some(f => norm(b.narration).includes(norm(f + unitWord)));
    const cue = b.cues && b.cues[sc.id], cueIsNumber = cue && NUM_WORDS.has(norm(cue).trim().split(' ')[0]);
    if (MODE === 'scenes' && big && !b.narration) problems.push(`${sc.id}: headline ${big.value}${big.unit || ''} appears on screen but is never narrated`);
    if (big && (MODE === 'scenes' ? b.narration : cueIsNumber) && !spoken) problems.push(`${sc.id}: headline ${big.value}${big.unit || ''} is not spoken exactly (expected e.g. “${spokenForms(big.value)[0]}${unitWord}”)`);
    const isQuote = sc.family === 'quote' || sc.template === 'quote';
    if (isQuote && !story.narrateQuotes && b.narration) {
      const qw = norm(sc.data.text).trim().split(' ').filter(w => w.length > 3), shared = qw.filter(w => norm(b.narration).includes(` ${w} `));
      if (shared.length >= Math.min(4, qw.length)) problems.push(`${sc.id}: narration repeats the quote, but narrateQuotes is off — introduce it instead`);
    }
  });
});
if (story.targetSeconds) {   // word budget at the measured house-voice rate (≈1.9 words/s), minus each line's lead-in and hold
  const words = BEATS.reduce((a, b) => a + (b.narration ? b.narration.split(/\s+/).length : 0), 0);
  const lines = BEATS.filter(b => b.narration).length, budget = Math.round(Math.max(0, story.targetSeconds - lines * (LEAD_IN + TAIL)) * 1.9);
  if (words > budget * 1.1) problems.push(`narration is ${words} words; a ${story.targetSeconds}s video holds about ${budget} — cut lines or choose a longer length`);
}
if (problems.length) { console.error('Narration check failed:\n  ' + problems.join('\n  ')); process.exit(1); }
console.log(`narration mode: ${MODE} (${BEATS.filter(b => b.narration).length} lines over ${story.scenes.length} scenes)`);

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
const recentIds = []; let idStitching = true;   // falls back to text context when the account can't use request IDs (high-privacy / zero-retention)
async function elevenlabs(sc, i, file) {   // sc: a beat (narration + scenes)
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY is not set');
  const voice = VOICE || story.voice?.id || BRAND_VOICE.house.id;
  if (!voice) throw new Error('No voice: pass --voice <voice_id> or set story.voice.id');
  const body = {
    text: sc.narration, model_id: story.voice?.model || MODEL, seed: story.voice?.seed ?? 7, apply_text_normalization: 'on',
    voice_settings: story.voice?.settings || BRAND_VOICE.settings,
  };
  const prevText = BEATS.slice(0, i).map(s => s.narration).filter(Boolean).slice(-2).join(' ');
  const nextText = BEATS.slice(i + 1).map(s => s.narration).filter(Boolean).slice(0, 1).join(' ');
  const send = () => {
    const b = { ...body };
    if (idStitching && recentIds.length) b.previous_request_ids = recentIds.slice(-3);   // stitching: prosody carries across scenes
    else { if (prevText) b.previous_text = prevText; if (nextText) b.next_text = nextText; }
    return fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
      method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, body: JSON.stringify(b),
    });
  };
  let res = await send();
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 400 && /stitching|high_privacy|zero.retention/i.test(err) && idStitching) {
      idStitching = false;
      console.log('  account is in high-privacy mode: request-ID stitching unavailable — using text context (previous_text / next_text)');
      res = await send();
      if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
    } else throw new Error(`ElevenLabs ${res.status}: ${err.slice(0, 300)}`);
  }
  const id = res.headers.get('request-id'); if (id) recentIds.push(id);
  const json = await res.json();
  writeFileSync(file, Buffer.from(json.audio_base64, 'base64'));
  return { words: wordsFromAlignment(json.alignment), estimated: false };
}
function say(sc, i, file) {
  const aiff = file.replace(/\.\w+$/, '.aiff');
  execFileSync('say', ['-v', 'Samantha', '-r', '175', '-o', aiff, sc.narration]);
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
const first = t => norm(t).trim().split(' ')[0];
for (const [i, b] of BEATS.entries()) {
  const scs = b.scenes.map(id => byId[id]);
  let r = null, audioDur = 0, trimmed = null;
  if (b.narration) {
    const file = path.join(OUT_DIR, `${String(i + 1).padStart(2, '0')}-${b.id}.${PROVIDER === 'say' ? 'wav' : 'mp3'}`);
    r = PROVIDER === 'elevenlabs' ? await elevenlabs(b, i, file) : say(b, i, file);
    // trim silence the engine leaves at both ends, so pacing is set by the words, not by padding
    const lead = Math.max(0, (r.words[0]?.start ?? 0) - 0.03), endT = (r.words[r.words.length - 1]?.end ?? 0) + 0.08;
    trimmed = file.replace(/\.(\w+)$/, '.trim.wav');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', file, '-af', `atrim=${lead.toFixed(3)}:${endT.toFixed(3)},asetpts=PTS-STARTPTS`, '-ar', '44100', trimmed]);
    r.words.forEach(w => { w.start -= lead; w.end -= lead; });
    audioDur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', trimmed]).toString();
    const need = LEAD_IN + audioDur + TAIL, MIN = 1.2, PRE = 0.25;
    const cueAt = {};
    for (const [sid, word] of Object.entries(b.cues || {})) { const w = r.words.find(x => first(x.text) === first(word)); if (w) cueAt[sid] = LEAD_IN + w.start; }
    if (scs.length > 1 && Object.keys(cueAt).some(id => id !== scs[0].id)) {
      // cue words set the scene boundaries inside a beat: each cued scene arrives just before its word is spoken
      const starts = [0];
      for (let k = 1; k < scs.length; k++) {
        const earliest = starts[k - 1] + (cueAt[scs[k].id] != null ? MIN : Math.max(MIN, scs[k - 1].dur));
        starts[k] = cueAt[scs[k].id] != null ? Math.max(earliest, cueAt[scs[k].id] - PRE) : earliest;
      }
      scs.forEach((sc, k) => { sc.dur = +(k < scs.length - 1 ? starts[k + 1] - starts[k] : Math.max(MIN, sc.dur, need - starts[k])).toFixed(2); });
    } else {
      // no inner cues: the beat lasts as long as its line plus a held beat — its scenes stretch together, never shorter than planned
      const planned = scs.reduce((a, sc) => a + sc.dur, 0);
      if (need > planned) scs.forEach(sc => { sc.dur = +(sc.dur * need / planned).toFixed(2); });
    }
  }
  let t = acc; scs.forEach(sc => { sc.start = t; t += sc.dur; });
  const shifts = [];
  if (r) {
    for (const [sid, word] of Object.entries(b.cues || {})) {   // each cued scene's data reveal starts on its word
      const w = r.words.find(x => first(x.text) === first(word));
      if (!w) throw new Error(`${b.id}: cue “${word}” not found in narration`);
      const sc = byId[sid], at = acc + LEAD_IN + w.start, [revealStart] = execOf(sc).reveal(sc.data);
      if (at < sc.start - 0.05) console.log(`  warning: “${word}” is spoken ${(sc.start - at).toFixed(2)}s before scene ${sid} appears — reorder the line or the beat`);
      sc.revealShift = Math.max(0, +(at - sc.start - revealStart).toFixed(2));
      if (sc.revealShift) shifts.push(`${sid} +${sc.revealShift}s on “${word}”`);
    }
    clips.push({ file: trimmed, at: acc + LEAD_IN });
    r.words.forEach(w => words.push({ text: w.text, start: acc + LEAD_IN + w.start, end: acc + LEAD_IN + w.end, scene: b.id }));
    transcript.push(`[${acc.toFixed(1)}s] ${b.narration}`);
  }
  scs.forEach(sc => {   // on-screen content, so numbers the voice doesn't read stay accessible (media alternative)
    const h = sc.head || {}, big = h.big ? `${h.big.value.toLocaleString('en-US')}${h.big.unit || ''} ` : '';
    if (h.title || h.l1) transcript.push(`[${sc.start.toFixed(1)}s]   On screen: ${big}${h.title || h.l1}${h.l2 ? ' — ' + h.l2 : ''}`.replace(/&#160;/g, ' '));
    const isQuote = sc.family === 'quote' || sc.template === 'quote';
    if (isQuote) transcript.push(`[${sc.start.toFixed(1)}s]   On screen: ${sc.data.text} ${sc.data.who}${story.narrateQuotes ? ' (read by AI voice)' : ''}`);
    if (sc.template === 'endRow') sc.data.disclosure = story.narrateQuotes ? 'Narrated by an AI voice, including participant quotes.' : 'Narrated by an AI voice.';
  });
  console.log(`${b.id}${b.scenes.length > 1 ? ` (${b.scenes.join(', ')})` : ''}: ${b.narration ? audioDur.toFixed(2) + 's narration' : 'silent'} → ${(t - acc).toFixed(2)}s${shifts.length ? ' · ' + shifts.join(', ') : ''}${r && r.estimated ? ' (timings estimated)' : ''}`);
  acc = t;
}
const TOTAL = acc;

/* ---------- mix: clips at their scene offsets, loudness-normalized (−16 LUFS; true peak −1.5 so the AAC encode stays under −1 dBTP) ---------- */
const track = path.join(OUT_DIR, 'narration.wav');
const inputs = clips.flatMap(c => ['-i', c.file]);
const filter = clips.map((c, i) => `[${i}:a]adelay=${Math.round(c.at * 1000)}|${Math.round(c.at * 1000)},aformat=channel_layouts=stereo[a${i}]`).join(';') +
  `;${clips.map((_, i) => `[a${i}]`).join('')}amix=inputs=${clips.length}:normalize=0,apad,atrim=0:${TOTAL.toFixed(3)},loudnorm=I=-16:TP=-1.5:LRA=11[out]`;
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
