#!/usr/bin/env node
// Write a storyboard from a fact sheet + the three customer controls, validate it, and repair it until it passes.
//
// Usage:
//   node write-storyboard.mjs --facts facts.json --length 30 --depth standard --aspect 9:16 [--out story.json]
//        [--provider anthropic|agent] [--max-repairs 3] [--narrate-quotes]
//
//   anthropic  calls Claude (claude-opus-5-5) through the official SDK (@anthropic-ai/sdk; credentials from the
//              environment). Validation errors go back to the model for repair, up to --max-repairs rounds.
//   agent      writes the prompt to <out>.prompt.md for the Claude session running this skill to answer (it saves the
//              storyboard JSON to <out>), then: node validate-storyboard.mjs <out> --facts facts.json
//
// The model never sees raw prose for numbers — only the extracted fact sheet — and the validator re-checks every figure.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : fallback; };
const bool = name => { const i = args.indexOf(name); return i >= 0 ? (args.splice(i, 1), true) : false; };
const FACTS = path.resolve(flag('--facts', 'facts.json'));
const LENGTH = +flag('--length', '30'), DEPTH = flag('--depth', 'standard'), ASPECT = flag('--aspect', '9:16');
const OUT = path.resolve(flag('--out', FACTS.replace(/(\.facts)?\.json$/, '.story.json')));
const PROVIDER = flag('--provider', process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN ? 'anthropic' : 'agent');
const MAX_REPAIRS = +flag('--max-repairs', '3'), NARRATE_QUOTES = bool('--narrate-quotes');
const MODEL = 'claude-opus-5-5';

const facts = JSON.parse(readFileSync(FACTS, 'utf8'));
const { FAMILIES, TEMPLATES } = createRequire(import.meta.url)(path.join(HERE, '..', 'library', 'library.js'));
const exampleStory = readFileSync(path.join(HERE, '..', 'references', 'examples', 'seltzer.story.json'), 'utf8');

/* ---------- the prompt ---------- */
const catalog = Object.entries(FAMILIES).map(([fam, ex]) => `- ${fam}: ${Object.keys(ex).join(', ')}`).join('\n');
const mode = LENGTH < 45 ? 'beats' : 'scenes';
const SYSTEM = `You are the storyboard writer for Listen Labs research videos. You turn a study's fact sheet into a storyboard JSON that a deterministic engine renders into a branded motion-graphics video with an AI voiceover. You decide the story, the scenes, the on-screen copy, and the narration; the engine decides how each chart is drawn.

## Non-negotiable: research integrity
- Every number on screen, in chart data, in notes, and in narration must come from a fact you cite in that scene's "facts" array (fact values, counts, bases, the study n, series items, statement figures). Arithmetic on cited facts (a ratio, a difference, a count of items) must be declared in the scene's "derived" array: { "value": 3, "op": "ratio", "of": [148, 46.7], "round": "floor" }. A validator re-checks every figure; anything that doesn't trace is rejected.
- Keep each fact's precision (46.7 stays 46.7). Never round, smooth, or estimate. Never invent a category, value, or comparison the facts don't contain.
- A series marked "complete": false is a selection — never present it as a full ranking. Add a "gap" row ({ "after": <index>, "label": "+ N more …" } with N declared as a derived difference) or say it's a selection in the note.
- Small bases (n under 50) are shown as counts ("9 of 32"), not percentages; flag them in the note.
- Compared options (brands, concepts, tools) get equal visual weight; don't frame one as the winner unless the facts say so, and don't compare groups the report says aren't comparable.
- Quotes: only verbatim facts, copied exactly, cited, attributed "— Participant, <context>". ${NARRATE_QUOTES ? 'Narration may read the quote; the engine labels it as read by AI.' : 'Never put quote words in narration; introduce the quote instead ("One participant put it simply.").'}

## The video
- Length ${LENGTH}s, depth "${DEPTH}", aspect ${ASPECT}. Pace: ${LENGTH <= 60 ? 'kinetic — fast cuts, one stat per scene, about 2–3s per scene, 10–12 scenes for 30s' : 'explainer — narration carries the story, 5–8s per scene, chapters for long cuts'}.
- Depth: headline = the decision-relevant finding plus up to 3 supporting stats; standard = hook, 3–5 findings each with evidence, the takeaway; deep = method, findings by chapter, segments, verbatims, caveats.
- Arc: a hook in the first scene that states a finding (legible muted) → build → one peak around the middle-to-two-thirds mark → the takeaway → an endRow end card.
- Variety: no two consecutive scenes should look alike; don't use the same family more often than it has executions; use each template at most once (endRow last).
- Narration mode: ${mode === 'beats' ? `BEATS (under 45s). Put narration in story.beats — about one line per 2–3 consecutive scenes, roughly ${Math.round((LENGTH - 6 * 0.45) * 1.9)} words in total for ${LENGTH}s (the house voice speaks ~1.9 words/s). Each beat: { "id", "scenes": [consecutive scene ids], "narration", "cues": { "<sceneId>": "<first word of the phrase that should trigger that scene's data reveal>" } }. A cue on a number word requires that number to be spoken exactly as on screen. Keep the end line very short ("That's the pack.").` : 'SCENES (45s and longer). Give every scene its own "narration" (about 1.9 words/s of its duration) and a "cue" word; every on-screen headline number must be spoken exactly.'}
- Narration: numbers written as words ("sixty-three percent", "one hundred forty-eight"), plain, present tense, no hype. Never round in speech.

## On-screen copy
- head.big: { "value", "unit": "%"|"×"|"" , "count": false only for a static figure like a ratio } — the scene's one number. Or head.title (a short statement, used instead of a number). head.l1: ≤ 6 words, the must-read line. head.l2: ≤ 7 words, optional context in a quieter tone. Sentence case. No accent words, no exclamation marks.
- note: source/base/caveat in ≤ 50 characters (it must fit one line at 9:16). Notes describe the data, never the chart encoding. Use "n&#160;=&#160;300" with non-breaking spaces.
- Curly quotes and apostrophes (’ “ ”), the × sign for ratios.

## Library (families → executions; the engine picks the execution)
${catalog}
Templates: nodeRing { n, picks: [3 indices] } · comboRing { n, runners?: [[i,j,k]], winner: [i,j,k], labels: [3] } (real combinations only) · strikeRow { header, items: [2–6 labels] } · endRow { title, sub?, items: [2–4 labels], study, n }.
Family data shapes:
- ranking: { "unit": "%"|"", "items": [{ "label", "value" }] (2–6, ordered as the story needs), "ref"?: { "value", "label" } (e.g. 100 = average for an index), "gap"?: { "after", "label" }, "lead"?: index }
- partWhole: { "pct", "count"?, "base"?, "partLabel"?, "restLabel"? }
- comparison: { "a": { "label", "value" }, "b": { "label", "value" }, "unit"? }
- scale: { "items": [{ "label", "value", "focus"? }], "unit"?, "step"? } — several values close together on one axis
- quote: { "text", "who" } · count: { "n" }
Labels: short (≤ 18 characters), title case for proper nouns only.

## Output
Return only the storyboard JSON in a single \`\`\`json block. Top level: { "study", "historyKey", "pageTitle", "aria", "targetSeconds", "narrateQuotes", "scenes": [...], ${mode === 'beats' ? '"beats": [...]' : ''} }. Each scene: { "id", "family" | "template", "dur" (seconds, summing to about ${LENGTH}), "facts": [ids], "derived"?: [...], "data", "head"?, "note"? ${mode === 'scenes' ? ', "narration", "cue"' : ''} }. Leave "surface", "enter", and "execution" out — the engine assigns them.

Example of the format (an earlier study; its numbers mean nothing for yours, and it predates fact citations):
\`\`\`json
${exampleStory}
\`\`\``;

const userPrompt = (repair) => `Study: ${facts.study.title} (n = ${facts.study.n})
Controls: length ${LENGTH}s · depth ${DEPTH} · aspect ${ASPECT}${NARRATE_QUOTES ? ' · narrate quotes' : ''}

Fact sheet:
\`\`\`json
${JSON.stringify(facts.facts, null, 1)}
\`\`\`${repair ? `

Your previous storyboard failed validation. Fix every error below and return the full corrected storyboard.
Errors:
${repair.errors.map(e => '- ' + e).join('\n')}${repair.warnings.length ? `\nWarnings (fix if you can):\n${repair.warnings.map(e => '- ' + e).join('\n')}` : ''}` : ''}`;

const extractJson = text => { const m = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/); if (!m) throw new Error('no JSON in the response'); return JSON.parse(m[1]); };
const validate = file => {
  try { execFileSync('node', [path.join(HERE, 'validate-storyboard.mjs'), file, '--facts', FACTS, '--json'], { encoding: 'utf8' }); return { ok: true, errors: [], warnings: [] }; }
  catch (e) { return JSON.parse(e.stdout); }
};

/* ---------- agent mode: hand the prompt to the running Claude session ---------- */
if (PROVIDER === 'agent') {
  const promptFile = OUT.replace(/\.json$/, '.prompt.md');
  writeFileSync(promptFile, `# System\n\n${SYSTEM}\n\n# User\n\n${userPrompt(null)}\n`);
  console.log(`agent mode: prompt written to ${promptFile}\nWrite the storyboard JSON to ${OUT}, then validate:\n  node ${path.join(HERE, 'validate-storyboard.mjs')} ${OUT} --facts ${FACTS}`);
  process.exit(0);
}

/* ---------- anthropic mode: Claude writes, the validator checks, errors go back for repair ---------- */
let Anthropic;
try { ({ default: Anthropic } = await import('@anthropic-ai/sdk')); }
catch { console.error('Install the SDK first: (cd skills/video && npm install)'); process.exit(1); }
const client = new Anthropic();
const messages = [{ role: 'user', content: userPrompt(null) }];
for (let round = 0; round <= MAX_REPAIRS; round++) {
  const stream = client.beta.messages.stream({
    model: MODEL, max_tokens: 32000, system: SYSTEM, messages,
    thinking: { type: 'adaptive' }, output_config: { effort: 'high' },
    betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default',   // refusal fallback, on by default
  });
  const msg = await stream.finalMessage();
  if (msg.stop_reason === 'refusal') { console.error('the model declined this request'); process.exit(1); }
  if (msg.stop_reason === 'max_tokens') { console.error('response truncated — raise max_tokens'); process.exit(1); }
  const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
  let story;
  try { story = extractJson(text); } catch (e) { messages.push({ role: 'assistant', content: msg.content }, { role: 'user', content: `That wasn't valid JSON (${e.message}). Return the full storyboard in one \`\`\`json block.` }); continue; }
  writeFileSync(OUT, JSON.stringify(story, null, 2));
  const v = validate(OUT);
  console.log(`round ${round}: ${v.ok ? 'valid' : `${v.errors.length} error(s)`}${v.warnings.length ? `, ${v.warnings.length} warning(s)` : ''}`);
  if (v.ok) { console.log(`wrote ${OUT}`); v.warnings.forEach(w => console.log('  warning ' + w)); process.exit(0); }
  messages.push({ role: 'assistant', content: msg.content }, { role: 'user', content: userPrompt(v) });
}
console.error(`still failing after ${MAX_REPAIRS} repairs — see ${OUT}`);
process.exit(1);
