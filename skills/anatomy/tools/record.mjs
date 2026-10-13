// Record a stage page (pages/stage.mjs) on a virtual clock: every frame is computed, not filmed in real time,
// so the video is identical on every run and never drops a frame however slow the capture is.
// One script → an MP4, one PNG per beat (the settled last frame of each beat: slides), and a poster.
//
// usage: node tools/record.mjs <stage.html> --script tour [--out out/video/x.mp4] [--fps 30] [--scale 1.5]
//        [--stills out/video/x-slides] [--poster out/video/x-poster.png] [--theme light|dark] [--stills-only]
//        [--figures]   with --stills, also write each beat's drawing alone: figure-NN.png (no caption column) and
//                      figure-NN.svg (vector, every style resolved to plain attributes so PowerPoint, Keynote and print
//                      read it without CSS)
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
const { chromePort } = await import(new URL("../scripts/chrome-port.mjs", import.meta.url).href);

// Virtual clock: requestAnimationFrame callbacks and performance.now only move when the recorder says so.
const CLOCK = `(()=>{let t=0,q=[];window.requestAnimationFrame=(cb)=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
performance.now=()=>t;window.__step=(ms)=>{t+=ms;const run=q;q=[];for(const cb of run){try{cb(t)}catch(e){console.error(e)}}return t};})();`;

// The drawing as a standalone vector: a copy of the live SVG with every computed paint style written onto each element
// as a plain attribute (CSS variables, classes and stylesheets resolved away), hidden layers dropped.
const SVG_FLAT = `(() => {
  const src = document.querySelector(".iso-stage svg"), out = src.cloneNode(true);
  const A = ["fill", "fill-opacity", "stroke", "stroke-opacity", "stroke-width", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "opacity"];
  const a = [src, ...src.querySelectorAll("*")], b = [out, ...out.querySelectorAll("*")];
  a.forEach((el, i) => {
    const cs = getComputedStyle(el), o = b[i];
    if (cs.display === "none" || cs.visibility === "hidden") { o.setAttribute("data-drop", ""); return; }
    for (const p of A) { const v = cs.getPropertyValue(p); if (v) o.setAttribute(p, v); }
    o.removeAttribute("class"); o.removeAttribute("style");
  });
  out.querySelectorAll("[data-drop]").forEach((el) => el.remove());
  out.querySelectorAll("style").forEach((el) => el.remove());
  const r = src.getBoundingClientRect();
  out.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  out.setAttribute("width", Math.round(r.width)); out.setAttribute("height", Math.round(r.height));
  return new XMLSerializer().serializeToString(out);
})()`;

if (typeof WebSocket === "undefined" && !process.execArgv.includes("--experimental-websocket")) {
  const child = spawn(process.execPath, ["--experimental-websocket", ...process.argv.slice(1)], { stdio: "inherit" });
  child.on("exit", (code) => process.exit(code ?? 1));
} else await main();

function chromePath() {
  const c = [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium"].filter(Boolean);
  const pw = join(homedir(), "Library/Caches/ms-playwright");
  if (existsSync(pw)) for (const d of readdirSync(pw).sort().reverse()) c.push(join(pw, d, "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"), join(pw, d, "chrome-mac/Chromium.app/Contents/MacOS/Chromium"));
  return c.find((p) => existsSync(p));
}

async function main() {
  const argv = process.argv.slice(2);
  const opt = (name, d) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : d; };
  const target = argv[0];
  const script = opt("--script", "tour");
  const fps = Number(opt("--fps", 30));
  const scale = Number(opt("--scale", 1.5));
  const out = opt("--out", `out/video/${script}.mp4`);
  const stills = opt("--stills", null);
  const poster = opt("--poster", null);
  const theme = opt("--theme", "light");
  const stillsOnly = argv.includes("--stills-only");
  const figures = argv.includes("--figures");
  const url = pathToFileURL(resolve(target)).href + "#play=" + script;

  const profile = mkdtempSync(join(tmpdir(), "ll-record-"));
  const chrome = spawn(chromePath(), ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run", "--hide-scrollbars", "--allow-file-access-from-files", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "about:blank"]);
  const port = await chromePort(chrome, profile);
  let ff = null;
  const finish = (code) => { chrome.kill("SIGKILL"); try { rmSync(profile, { recursive: true, force: true }); } catch {} process.exit(code); };
  try {
    const page = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let id = 0; const pending = new Map(); const problems = [];
    ws.onmessage = (m) => {
      const d = JSON.parse(m.data);
      if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
      else if (d.method === "Runtime.exceptionThrown") problems.push("exception: " + (d.params.exceptionDetails.exception?.description ?? d.params.exceptionDetails.text));
      else if (d.method === "Runtime.consoleAPICalled" && d.params.type === "error") problems.push("console.error: " + d.params.args.map((a) => a.value ?? a.description).join(" "));
    };
    await new Promise((r) => (ws.onopen = r));
    const send = (method, params = {}) => new Promise((r) => { const c = ++id; pending.set(c, r); ws.send(JSON.stringify({ id: c, method, params })); });
    const evaluate = async (expression) => { const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description); return r.result?.result?.value; };
    await send("Runtime.enable"); await send("Page.enable");
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: theme }] });
    await send("Page.addScriptToEvaluateOnNewDocument", { source: CLOCK });
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: scale, mobile: false });
    await send("Page.navigate", { url });
    await new Promise((r) => setTimeout(r, 1500));
    await evaluate("document.fonts.ready.then(() => true)");
    const total = await evaluate(`window.__director ? __director.duration(${JSON.stringify(script)}) : 0`);
    if (!total) throw new Error(`no script "${script}" on this stage (window.__director missing or unknown key)`);
    const frames = Math.ceil(total * fps) + Math.round(fps * 0.5);
    console.log(`recording ${script}: ${total}s · ${frames} frames at ${fps} fps · ${1280 * scale}×${720 * scale}`);

    if (!stillsOnly) {
      mkdirSync(dirname(resolve(out)), { recursive: true });
      ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-movflags", "+faststart", resolve(out)], { stdio: ["pipe", "inherit", "inherit"] });
    }
    if (stills) mkdirSync(resolve(stills), { recursive: true });
    const shoot = async (format, extra = {}) => (await send("Page.captureScreenshot", { format, quality: format === "jpeg" ? 92 : undefined, ...extra })).result.data;
    // beat boundaries come from the script itself: the frame just before each boundary is that beat's settled slide
    const beats = await evaluate(`JSON.stringify(window.__scripts[${JSON.stringify(script)}].beats.map((b) => ({ hold: b.hold, poster: b.poster })))`).then(JSON.parse);
    const ends = []; beats.reduce((acc, b) => { ends.push(acc + b.hold); return acc + b.hold; }, 0);
    const lastFrameOf = ends.map((e) => Math.round(e * fps) - 1);
    const t0 = Date.now();
    for (let f = 0; f < frames; f++) {
      await evaluate(`__step(${(1000 / fps).toFixed(6)})`);
      const k = lastFrameOf.indexOf(f);
      if (k >= 0 && (stills || (poster && beats[k].poster))) {
        const png = Buffer.from(await shoot("png"), "base64");
        const nn = String(k + 1).padStart(2, "0");
        if (stills) writeFileSync(join(resolve(stills), `beat-${nn}.png`), png);
        if (stills && figures) {
          const box = JSON.parse(await evaluate(`JSON.stringify(document.querySelector(".iso-stage").getBoundingClientRect())`));
          writeFileSync(join(resolve(stills), `figure-${nn}.png`), Buffer.from((await send("Page.captureScreenshot", { format: "png", clip: { x: box.x, y: box.y, width: box.width, height: box.height, scale: 1 } })).result.data, "base64"));
          writeFileSync(join(resolve(stills), `figure-${nn}.svg`), await evaluate(SVG_FLAT));
        }
        if (poster && beats[k].poster) writeFileSync(resolve(poster), png);
      }
      if (ff) { const jpg = await shoot("jpeg"); if (!ff.stdin.write(Buffer.from(jpg, "base64"))) await new Promise((r) => ff.stdin.once("drain", r)); }
      if (f % (fps * 5) === 0) process.stdout.write(`  ${(f / fps).toFixed(0)}s / ${total}s  (${((Date.now() - t0) / 1000).toFixed(0)}s elapsed)\n`);
    }
    if (ff) { ff.stdin.end(); await new Promise((r) => ff.on("close", r)); console.log("wrote", out); }
    if (stills) console.log("wrote stills to", stills);
    if (poster) console.log(existsSync(resolve(poster)) ? "wrote " + poster : "no beat marked poster: true");
    for (const p of problems) console.log(p);
    finish(problems.length ? 1 : 0);
  } catch (e) {
    console.error(e.message);
    if (ff) ff.kill();
    finish(1);
  }
}
