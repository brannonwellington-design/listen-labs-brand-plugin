#!/usr/bin/env node
// Build a self-contained video composition from a storyboard JSON.
// Picks one execution per family scene (fit → no repeats → recency penalty → seeded tie-break),
// inlines the library, the logo, and the storyboard into one HTML file, and records the picks
// in a history file so the next video for the same study/customer comes out different.
//
// Usage: node build-video.mjs <story.json> [--out out.html] [--history history.json] [--seed any-string] [--dry]
//   --history   JSON file { "<historyKey>": [["weekly=ranking.dotBars", …] /* newest first */, …] }; created if missing
//   --seed      defaults to `${historyKey}:${count of past videos}` — reproducible, and new for each generation
//   --dry       print the picks without writing anything
//   --pin-out   also write the storyboard with executions, surfaces and wipes pinned (input for voiceover.mjs)
//
// With narration: build --pin-out story.pinned.json --history h.json → voiceover.mjs story.pinned.json → build the voiced story

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LIB_DIR = path.join(HERE, '..', 'library');
const PLUGIN_ROOT = path.join(HERE, '..', '..', '..');
const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : fallback; };
const DRY = args.includes('--dry') && args.splice(args.indexOf('--dry'), 1);
const OUT = flag('--out', null), HISTORY = flag('--history', null), SEED = flag('--seed', null), PIN_OUT = flag('--pin-out', null);
const STORY_PATH = path.resolve(args[0] || 'story.json');

const story = JSON.parse(readFileSync(STORY_PATH, 'utf8'));
const { selectExecutions } = createRequire(import.meta.url)(path.join(LIB_DIR, 'library.js'));
const key = story.historyKey || story.study;
const history = HISTORY && existsSync(HISTORY) ? JSON.parse(readFileSync(HISTORY, 'utf8')) : {};
const past = history[key] || [];
const seed = SEED || `${key}:${past.length}`;

const { picks, log } = selectExecutions(story.scenes, past, seed);
console.log(`seed ${seed}\n` + log.map(l => '  ' + l).join('\n'));
if (DRY) process.exit(0);
if (PIN_OUT) { writeFileSync(path.resolve(PIN_OUT), JSON.stringify(story, null, 2)); console.log(`wrote ${path.resolve(PIN_OUT)}`); }

// Inline the logo lockup with its fill removed (the engine sets it per surface)
const svg = readFileSync(path.join(PLUGIN_ROOT, 'assets', 'listen-labs-logo.svg'), 'utf8');
const wordmark = (svg.match(/<path[^>]*\/>/g) || []).join('').replace(/\sfill="#[0-9A-Fa-f]{6}"/g, '');
const script = [
  `/* Storyboard: ${path.basename(STORY_PATH)} · executions chosen with seed “${seed}” */`,
  `const STORY = ${JSON.stringify(story, null, 2)};`,
  `const WORDMARK = \`${wordmark}\`;   // assets/listen-labs-logo.svg, viewBox 0 0 520 71`,
  readFileSync(path.join(LIB_DIR, 'library.js'), 'utf8'),
  'boot(STORY);',
].join('\n\n');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const html = readFileSync(path.join(LIB_DIR, 'shell.html'), 'utf8')
  .replace('%%TITLE%%', esc(story.pageTitle || 'Research Video'))
  .replace('%%ARIA%%', esc(story.aria || story.study))
  .replace('%%SCRIPT%%', () => script);
const out = path.resolve(OUT || STORY_PATH.replace(/\.json$/, '.html'));
writeFileSync(out, html);
console.log(`wrote ${out}`);

if (HISTORY) {
  history[key] = [picks, ...past].slice(0, 6);
  writeFileSync(HISTORY, JSON.stringify(history, null, 2) + '\n');
  console.log(`history updated (${history[key].length} videos for “${key}”)`);
}
