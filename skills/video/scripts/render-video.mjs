#!/usr/bin/env node
// Render a deterministic HTML composition to MP4.
// The page must expose window.renderFrame(t), window.TOTAL (seconds), window.FPS,
// and optionally window.CANVAS = { width, height } (design px; default 540×960).
// Frames are captured at 2× device scale and piped as PNG into ffmpeg. No npm dependencies.
//
// Usage: node render-video.mjs <composition.html> [out.mp4] [--audio track.wav] [--scale 2] [--query aspect=16x9]

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : fallback; };
const AUDIO = flag('--audio', null);
const SCALE = Number(flag('--scale', '2'));
const QUERY = flag('--query', '');   // extra URL params for the composition, e.g. aspect=16x9
const INPUT = path.resolve(args[0] || 'composition.html');
const OUTPUT = path.resolve(args[1] || INPUT.replace(/\.html?$/, '.mp4'));
const PORT = 9300 + Math.floor(Math.random() * 600);

const CHROME = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].find(p => p && existsSync(p));
if (!CHROME) throw new Error('Chrome not found — set CHROME_PATH');
if (!existsSync(INPUT)) throw new Error(`No composition at ${INPUT}`);

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'llvideo-'))}`,
  '--hide-scrollbars', '--no-first-run', '--mute-audio', 'about:blank',
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let page;
for (let i = 0; i < 60 && !page; i++) {
  try { page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page'); }
  catch { await sleep(200); }
}
if (!page) { chrome.kill(); throw new Error('Chrome did not start'); }

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id;
  pending.set(i, m => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)));
  ws.send(JSON.stringify({ id: i, method, params }));
});
const evaluate = async expr => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(`Page error: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
  return r.result.value;
};

try {
  await send('Page.navigate', { url: pathToFileURL(INPUT).href + '?export=1' + (QUERY ? '&' + QUERY : '') });
  for (let i = 0; i < 100; i++) {
    if (await evaluate(`document.readyState === 'complete' && typeof renderFrame === 'function'`)) break;
    await sleep(100);
  }
  await evaluate('document.fonts.ready.then(() => true)');
  const { width, height } = await evaluate('window.CANVAS || { width: 540, height: 960 }');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: SCALE, mobile: false });
  const total = await evaluate('TOTAL'), fps = await evaluate('FPS');
  const frames = Math.round(total * fps);

  const ffArgs = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-'];
  if (AUDIO) ffArgs.push('-i', path.resolve(AUDIO), '-c:a', 'aac', '-ar', '48000', '-b:a', '192k', '-shortest');
  ffArgs.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '14', '-preset', 'slow', '-movflags', '+faststart', OUTPUT);
  const ff = spawn('ffmpeg', ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });

  for (let f = 0; f < frames; f++) {
    await evaluate(`renderFrame(${f / fps})`);
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    if (!ff.stdin.write(Buffer.from(data, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (f % (fps * 5) === 0) process.stdout.write(`frame ${f}/${frames}\n`);
  }
  ff.stdin.end();
  const code = await new Promise(r => ff.on('close', r));
  if (code !== 0) throw new Error(`ffmpeg exited ${code}`);
  console.log(`wrote ${OUTPUT} (${width * SCALE}×${height * SCALE}, ${fps}fps, ${frames} frames)`);
} finally {
  ws.close(); chrome.kill();
}
