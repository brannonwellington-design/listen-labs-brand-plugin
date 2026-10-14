// Preflight: can this machine build a scene? Run it first, from the working folder. It checks what the build, QA and
// bundle steps need and says how to fix what is missing, instead of letting a later step fail half way.
//
// usage: node tools/doctor.mjs
//   Node 22 or newer (the browser driver uses the built-in WebSocket)
//   Chrome or Chromium (QA, screenshots, stills and films drive it headless; CHROME_PATH overrides the search)
//   the working folder: writable, and if it is a git repository, scenes/ is ignored (study data never enters git)
import { existsSync, readdirSync, readFileSync, accessSync, constants } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";

const problems = [];
const ok = (msg) => console.log("✓ " + msg), bad = (msg, fix) => { console.log("✗ " + msg + "\n    " + fix); problems.push(msg); };

const major = Number(process.versions.node.split(".")[0]);
if (major >= 22) ok(`Node ${process.versions.node}`);
else bad(`Node ${process.versions.node} is too old (need 22 or newer)`, "Install the current Node from https://nodejs.org (or `brew install node` on a Mac), then run this again.");

// the same places scripts/drive.mjs looks
const candidates = [process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", join(homedir(), "Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
  "/Applications/Chromium.app/Contents/MacOS/Chromium", "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"].filter(Boolean);
const pw = join(homedir(), "Library/Caches/ms-playwright");
if (existsSync(pw)) for (const d of readdirSync(pw)) candidates.push(join(pw, d, "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"), join(pw, d, "chrome-mac/Chromium.app/Contents/MacOS/Chromium"), join(pw, d, "chrome-linux/chrome"));
const chrome = candidates.find((p) => existsSync(p));
if (chrome) ok("Chrome: " + chrome);
else bad("No Chrome or Chromium found", "Install Google Chrome (https://www.google.com/chrome), or set CHROME_PATH to a Chrome or Chromium binary.");

const cwd = process.cwd();
try { accessSync(cwd, constants.W_OK); ok("Working folder is writable: " + cwd); }
catch { bad("The working folder is not writable: " + cwd, "Open a folder you can write to (scenes/ is created there)."); }
const git = spawnSync("git", ["rev-parse", "--show-toplevel"], { cwd, encoding: "utf8" });
if (git.status === 0) {
  const ignored = spawnSync("git", ["check-ignore", "-q", "scenes/x"], { cwd }).status === 0;
  if (ignored) ok("scenes/ is git-ignored here");
  else bad("This folder is a git repository and scenes/ is not ignored", "Add a line `scenes/` to .gitignore before writing any study data.");
}
if (cwd.includes("/.claude/plugins/")) bad("The working folder is inside the installed plugin", "Work from your own project folder: the plugin folder is replaced on every update.");

console.log(problems.length ? `\n${problems.length} problem(s) to fix before building a scene.` : "\nReady to build scenes.");
process.exit(problems.length ? 1 : 0);
