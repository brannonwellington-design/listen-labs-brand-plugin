// Stadium — an anatomy object for audience sentiment: one figure per interview, seated by segment, standing for an
// act they feel positive about. Data contract: see worlds/stadium.world.js. Acts switch the stage dressing and the
// crowd's poses; the scoreboard lights one cell per fan on their feet. Click a fan to follow them, a block or a stage
// prop to select it. Exposes window.STAD.

import { readFileSync } from "node:fs";
const k = await import(new URL("../kit/iso-kit.mjs", import.meta.url).href);

export const WIDTH = 760;
export const HEIGHT = 500;
const AZ = 58;
const SRC = ["engine/compose.js", "engine/primitives.js", "props/stage.js", "worlds/stadium.world.js"].map((f) => readFileSync(new URL("../" + f, import.meta.url), "utf8")).join("\n");
const RT = ["camera", "parts", "blueprint", "tension", "pin"].map((f) => readFileSync(new URL(`./${f}.js`, import.meta.url), "utf8")).join("\n");
const api = new Function("k", SRC + "\nreturn { layout: stadiumLayout, geometry: stadiumGeometry };")(k);
export const TENSION_EVENTS = ["wave"];
// ---------- scene contract (pages/scene.mjs): how any host mounts, drives and controls this object ----------
export const API = "STAD", HOOK = "data-stadium";
// structured facts a host can set as stat modules: every value computed by the pattern builder, each with the scene
// state that shows it, so a host's "show me" can light the right part of the drawing
export const facts = (spec) => [
  ...spec.acts.map((a) => ({ key: "act." + a.key, value: a.up, base: spec.fans.filter((f) => f.feel[a.key]).length, label: `on their feet for ${a.name}`, group: a.when, scene: { act: a.key } })),
  ...spec.acts.flatMap((a) => spec.blocks.map((b, i) => ({ key: `block.${b.key}.${a.key}`, value: spec.blockStats[i][a.key].positive, base: b.fans.length - spec.blockStats[i][a.key].none, label: `${b.name.toLowerCase()} on their feet for ${a.name}`, group: b.name, scene: { act: a.key, block: i } }))),
  ...(spec.hopes || []).map((h, i) => ({ key: "hope." + h.key, value: h.count, base: h.base, label: `hoped for ${h.name.toLowerCase()}`, group: "Hopes", scene: { act: (spec.acts.find((a) => a.dressing === "hopes") || {}).key, hope: i } })),
];
export const CSS = `
/* scoreboard cells: one per respondent; lit = on their feet */
.sb-cell { fill: var(--anatomy-lo); stroke: none; }
.sb-cell[data-on] { fill: var(--anatomy-accent, var(--content-brand)); }
`;
export const controls = (spec) => [
  ...(spec.acts.length > 1 ? [{ kind: "segmented", label: "On stage", call: "setAct", get: "act", options: spec.acts.map((a, i) => ({ value: i, label: a.name })) }] : []),
  { kind: "select", label: "Follow…", call: "follow", get: "following", none: null, options: spec.fans.map((f, i) => ({ value: i, label: "Follow " + f.label })) },
];
// the tension prints numbers computed from the coding at build time; refuse to build if any is missing a digit
export function prepare(spec, curly = (s) => s) {
  if (!spec.tension) return;
  if (!spec.tension.numbers.every((s) => /\d/.test(s))) throw new Error("tension numbers must state a number");
  spec.__tension = { label: curly(spec.tension.label), act: spec.tension.act, numbers: spec.tension.numbers.map((text) => ({ text })) };
}
// tour beats arrive resolved from the pattern builder (numbers computed from the coding); titles may not carry numbers
export function scripts(spec, curly = (s) => s) {
  return Object.fromEntries(Object.entries(spec.scripts || {}).map(([key, sc]) => [key, { key, title: sc.title, label: sc.label, beats: sc.beats.map((b, i) => {
    if (/\d/.test(b.title || "")) throw new Error(`script ${key} beat ${i}: a title may not carry numbers`);
    return { ...b, kicker: b.act ? spec.acts.find((a) => a.key === b.act).when : "", title: curly(b.title || ""), caption: b.caption ? { text: curly(b.caption) } : null, quote: b.quote ? { ...b.quote, quote: curly(b.quote.quote) } : null, sub: null };
  }) }]));
}

export function build(spec) {
  const LAY = api.layout(spec);
  const P = k.fitProjection(LAY.fit, WIDTH, HEIGHT, { pad: 12, azimuth: AZ });
  const actIdx = spec.acts.length - 1;
  const G = api.geometry(k, spec, P, { act: spec.acts[actIdx].key });
  const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: spec.figure.label, body: [G.body] });
  const SPEC = { study: { n: spec.fans.length }, blocks: spec.blocks.map(({ key, name, fans }) => ({ key, name, fans })),
    fans: spec.fans.map(({ label, block, feel }) => ({ label, block, feel })), acts: spec.acts.map(({ key, name, dressing }) => ({ key, name, dressing })), hopes: (spec.hopes || []).map(({ key, name, prop }) => ({ key, name, prop })) };
  const R = { rise: 5, depth: 9, d0: 6 };
  const blockCam = LAY.blocks.map((B) => { const mid = (B.s0 + B.s1) / 2, [x, y] = LAY.T.point(mid, R.d0 + 2 * R.depth); return { az: AZ, zoom: 1.9, focus: [x, y + 6, 12] }; });
  const live = `
const STAD = (() => {
const KIT = { AZIMUTH, ELEVATION, ISO_CSS, SHADES, axisVector, boxCorners, cameraOf, circleRing, coil, corners, cylinder, depthOf, dotGrid, dotsSvg, extrude, faceTextSvg, fadeLineSvg, fadedSvg, figureSvg, fitProjection, groupSvg, haloOf, holdStill, insetPlan, iso, joinPaths, knurl, lineOnTop, lineSvg, onTop, pageHtml, pathOf, planOutline, plateHtml, pointsAt, radialTicks, ring, ringOf, ringSeam, rise, roundedPlan, screenRise, segment, sideArc, sideMatrix, sideRing, sideSeam, sideTicks, slabOf, solidSvg, topMatrix, topTicks, towardViewer, translateAlong, wireSvg };
${RT}
${SRC}
const SPEC = ${JSON.stringify(SPEC)};
const P0 = ${JSON.stringify(P)};
let P = P0;
const TENSION = ${JSON.stringify(spec.__tension || null)};
const WIDE = ${JSON.stringify(spec.figure.wideCamera || { az: AZ, zoom: 1.0, focus: LAY.CENTER })};
const SHEET = ${JSON.stringify(spec.figure.sheetCamera || { az: AZ, zoom: 0.98, focus: [LAY.CENTER[0], LAY.CENTER[1] + 6, LAY.CENTER[2] + 10] })};
const APART = ${JSON.stringify(spec.figure.apartCamera || { az: AZ, zoom: 0.92, focus: [LAY.CENTER[0], LAY.CENTER[1] - 6, LAY.CENTER[2] + 14] })};
const BLOCK_CAM = ${JSON.stringify(blockCam)};
const STAGE_CAM = { az: ${AZ + 4}, zoom: 2.3, focus: [0, -18, 20] };
const LAY = stadiumLayout(SPEC);
const N = SPEC.fans.length;
const stage = document.querySelector("[data-stadium]");
const svg = stage.querySelector("svg");
const plate = stage.closest(".iso-plate");
const readout = plate.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
let act = ${actIdx}, selBlock = null, selHope = null, follow = null;
const feel = (i, a = act) => SPEC.fans[i].feel[SPEC.acts[a].key];
const poses = SPEC.fans.map((_, i) => (feel(i) === "positive" ? 1 : 0));
const target = poses.slice();
let G = null, cellsOn = -1;
const state = () => ({ act: SPEC.acts[act].key, poses, sel: { block: selBlock, hope: selHope }, follow });
function rebuild() {
  G = stadiumGeometry(KIT, SPEC, P, state());
  svg.innerHTML = G.body;
  cellsOn = -1;
  parts.apply(P);
}
// fans and scoreboard redraw in place while poses move: same DOM slots, so painter's order holds
const TONE = { positive: "hi", neutral: "mid", negative: "lo" };
const drawn = poses.slice();
function drawFans(force) {
  let standing = 0;
  for (let i = 0; i < N; i++) {
    if (poses[i] > 0.5) standing++;
    if (!force && Math.abs(poses[i] - drawn[i]) < 0.004) continue;
    const g = svg.querySelector('[data-fan="' + i + '"]');
    if (!g) continue;
    const lit = i === follow || (selBlock != null && follow == null && SPEC.fans[i].block === SPEC.blocks[selBlock].key);
    g.innerHTML = G.fanSvg(i, poses[i], TONE[feel(i)] || null, lit);
    drawn[i] = poses[i];
  }
  if (standing !== cellsOn) { const cells = svg.querySelector("[data-cells]"); if (cells) cells.innerHTML = G.cellsSvg(standing); cellsOn = standing; }
  return standing;
}
const camera = makeCamera({ svg, KIT, P0, CENTER: ${JSON.stringify(LAY.CENTER)}, W: ${WIDTH}, H: ${HEIGHT}, start: WIDE, rebuild: (p) => { P = p; rebuild(); drawFans(true); } });
// ---------- parts, blueprint, pin ----------
let PARTS = stadiumGeometry(KIT, SPEC, P, state()).parts;
const ORDER = () => ["base", "field", "wall", ...SPEC.blocks.map((b) => "block-" + b.key), "aisles", "scoreboard", "stage", "truss", ...PARTS.filter((p) => p.key.startsWith("hope-") || p.key === "backline").map((p) => p.key)];
let parts = makeParts({ svg, KIT, parts: PARTS, order: ORDER() });
const view = { blueprint: false, apart: false };
const counts = () => SPEC.blocks.map((b) => b.fans.filter((i) => feel(i) === "positive").length);
const callouts = () => SPEC.blocks.map((b, bi) => { const p = PARTS.find((q) => q.key === "block-" + b.key); return { part: p.key, anchor: p.anchor, num: String(bi + 1).padStart(2, "0"), name: b.name, count: counts()[bi], n: b.fans.length }; });
const bp = makeBlueprint({ plate, svg, KIT, items: callouts(), offset: (key) => parts.offset(key), onPick: (i) => selectBlock(i) });
const pin = makePin({ plate, svg, KIT });
const chip = TENSION ? makeTensionChip(plate, TENSION, "bottom") : null;
function say() {
  const a = SPEC.acts[act], up = counts().reduce((x, y) => x + y, 0);
  if (wave) readout.textContent = "The wave · " + a.name;
  else if (follow != null) { const f = SPEC.fans[follow], v = feel(follow); readout.textContent = f.label + " · " + (v === "positive" ? "on their feet" : v ? "stays seated (" + v + ")" : "not asked") + " for " + a.name; }
  else if (selHope != null) readout.textContent = SPEC.hopes[selHope].name;
  else if (selBlock != null) readout.textContent = SPEC.blocks[selBlock].name + " · " + counts()[selBlock] + " of " + SPEC.blocks[selBlock].fans.length + " on their feet for " + a.name;
  else { const asked = SPEC.fans.filter((_, i) => feel(i)).length; readout.textContent = a.name + " · " + up + " of " + asked + (asked < N ? " asked" : "") + " on their feet"; }
}
function emit(type) { document.dispatchEvent(new CustomEvent("stadium", { detail: { type, act, block: selBlock, hope: selHope, follow } })); }
// on a phone-width card the whole bowl makes every fan a speck: frame the stands and the stage instead
const wide = () => (plate.clientWidth < 520 ? { az: WIDE.az, zoom: WIDE.zoom * 1.3, focus: [WIDE.focus[0] - 14, WIDE.focus[1] - 4, WIDE.focus[2]] } : WIDE);
const restCam = () => (view.apart ? APART : view.blueprint ? SHEET : wide());
function aim() { camera.set(view.apart || view.blueprint ? restCam() : follow != null ? fanCam(follow) : selHope != null ? STAGE_CAM : selBlock != null ? BLOCK_CAM[selBlock] : wide()); }
function fanCam(i) { const s = LAY.seats[i]; return { az: ${AZ}, zoom: 2.6, focus: [s.x, s.y + 8, s.z + 6] }; }
// ---------- state changes ----------
let touched = false;   // the reader has chosen something: the wave never plays on its own after that
function endWave() { touched = true; if (!wave) return; wave = null; if (chip) chip.hide(); SPEC.fans.forEach((_, i) => { target[i] = feel(i) === "positive" ? 1 : 0; }); }
function setAct(a, quiet) {
  if (!quiet) endWave();
  if (a === act && !quiet) return;
  act = a; selHope = null;
  SPEC.fans.forEach((_, i) => { target[i] = feel(i) === "positive" ? 1 : 0; });
  PARTS = stadiumGeometry(KIT, SPEC, P, state()).parts;
  parts = makeParts({ svg, KIT, parts: PARTS, order: ORDER() });
  if (view.apart) parts.set(true);
  bp.setItems(callouts());
  rebuild(); drawFans(true);
  if (still.matches) { target.forEach((v, i) => (poses[i] = v)); drawFans(true); }
  aim(); say(); emit("act"); run();
}
function selectBlock(i) { endWave(); selBlock = i; selHope = null; if (follow != null) setFollowRaw(null); bp.lit(i == null ? -1 : i); rebuild(); drawFans(true); aim(); say(); emit("block"); run(); }
function selectHope(i) { if (SPEC.acts[act].dressing !== "hopes") return; endWave(); selHope = i; selBlock = null; if (follow != null) setFollowRaw(null); rebuild(); drawFans(true); aim(); say(); emit("hope"); run(); }
function setFollowRaw(i) { follow = i; if (i == null) pin.hide(); else { const f = SPEC.fans[i]; pin.set(f.label, SPEC.blocks.find((b) => b.key === f.block).name); } }
function setFollow(i) { endWave(); setFollowRaw(i == null || i < 0 ? null : i); if (follow != null) selBlock = null; rebuild(); drawFans(true); aim(); say(); emit("follow"); run(); }
function setView(v, quiet) {
  if (!quiet) touched = true;
  const was = { ...view };
  Object.assign(view, v);
  bp.set(view.blueprint);
  plate.toggleAttribute("data-apart", view.apart);
  if (view.apart !== was.apart) parts.set(view.apart);
  aim();
  if (!quiet) document.dispatchEvent(new CustomEvent("view", { detail: { ...view } }));
  run();
}
// ---------- tension: the wave. Everyone sits; a wave runs along the stands and only fans who are positive about the
// act on stage rise as it passes, so it carries through some blocks and breaks in others. It moves nobody who isn't
// already encoded: a fan rises only if their own coded answer is positive. The chip prints the stated numbers.
let wave = null, tensionPlayed = false;
const WAVE_S0 = LAY.blocks[0].s0, WAVE_S1 = LAY.blocks[LAY.blocks.length - 1].s1, WAVE_T = 5.2;
function playTension(force) {
  if (!TENSION || wave || still.matches || (!force && tensionPlayed)) return;
  tensionPlayed = true;
  const want = SPEC.acts.findIndex((a) => a.key === TENSION.act);
  if (want >= 0 && want !== act) setAct(want, true);
  wave = { t: -0.8 };
  if (chip) chip.show(WAVE_T + 2.4);
  if (view.apart || view.blueprint) setView({ blueprint: false, apart: false });
  selBlock = null; selHope = null; if (follow != null) setFollowRaw(null);
  rebuild(); drawFans(true);
  camera.set(wide()); say(); run();
}
function waveTargets() {
  const front = WAVE_S1 - (WAVE_S1 - WAVE_S0) * Math.max(0, wave.t) / WAVE_T;   // from the very familiar block toward the bend
  SPEC.fans.forEach((_, i) => { const d = Math.abs(LAY.seats[i].s - front); target[i] = wave.t >= 0 && d < 16 && feel(i) === "positive" ? 1 : 0; });
}
// ---------- loop ----------
let frame = 0, last = 0, visible = false, introLeft = 0;
function tick(now) {
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
  parts.step(dt); parts.apply(P);
  if (introLeft > 0) introLeft -= dt;
  if (wave) { wave.t += dt; if (wave.t > WAVE_T + 1.2) { wave = null; SPEC.fans.forEach((_, i) => { target[i] = feel(i) === "positive" ? 1 : 0; }); say(); } else waveTargets(); }
  if (chip) chip.step(dt);
  const e = 1 - Math.exp(-dt / (wave ? 0.12 : 0.22));
  let moving = false;
  for (let i = 0; i < N; i++) {
    // fans rise in a ripple through their block rather than all at once
    const lag = wave ? 0 : (LAY.seats[i].row * 0.06 + (i % 5) * 0.03);
    const d = target[i] - poses[i];
    if (Math.abs(d) > 0.002) { poses[i] += d * (introLeft > lag ? 0 : e); moving = true; } else poses[i] = target[i];
  }
  drawFans(false);
  const camMoving = camera.step(dt, still.matches);
  if (follow != null) { const s = LAY.seats[follow], o = parts.offset("block-" + SPEC.fans[follow].block); pin.update(P, [s.x + o[0], s.y + o[1], s.z + 9 + o[2]], dt); }
  bp.update(P);
  frame = visible && (moving || camMoving || parts.busy || wave || pin.moving || (chip && chip.on)) ? requestAnimationFrame(tick) : 0;
}
function run() { if (still.matches) { parts.step(0, true); parts.apply(P); target.forEach((v, i) => (poses[i] = v)); drawFans(true); camera.step(0, true); if (follow != null) { const s = LAY.seats[follow]; pin.update(P, [s.x, s.y, s.z + 9], 0, true); } bp.update(P); return; } if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } }
// ---------- direct manipulation ----------
stage.addEventListener("click", (e) => {
  const fan = e.target.closest("[data-fan]");
  if (fan) { setFollow(+fan.dataset.fan === follow ? null : +fan.dataset.fan); return; }
  const part = e.target.closest("[data-part]");
  const key = part && part.dataset.part;
  if (key && key.startsWith("block-")) { selectBlock(SPEC.blocks.findIndex((b) => "block-" + b.key === key)); return; }
  if (key && key.startsWith("hope-")) { selectHope(SPEC.hopes.findIndex((h) => "hope-" + h.key === key)); return; }
  if (selBlock != null || selHope != null || follow != null) { selBlock = null; selHope = null; setFollow(null); bp.lit(-1); }
});
stage.addEventListener("keydown", (e) => {
  if (e.key === "b" || e.key === "B") setView({ blueprint: !view.blueprint });
  else if (e.key === "a" || e.key === "A") setView({ apart: !view.apart });
  else if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const d = e.key === "ArrowRight" ? 1 : -1; selectBlock(selBlock == null ? 0 : (selBlock + d + SPEC.blocks.length) % SPEC.blocks.length); e.preventDefault(); }
  else if (e.key === "Escape") { selBlock = null; selHope = null; setFollow(null); bp.lit(-1); }
  else if (e.key === "1" || e.key === "2") setAct(+e.key - 1);
});
// ---------- scene: the one state a script, a video frame or a deep link can ask for ----------
function scene(sc) {
  touched = true;   // a script or a host's "show me" is in control: the automatic wave never plays over it
  const a = sc.act == null ? act : typeof sc.act === "number" ? sc.act : SPEC.acts.findIndex((x) => x.key === sc.act);
  if (a !== act) setAct(a);
  const v = sc.view || { blueprint: false, apart: false };
  if (!!v.blueprint !== view.blueprint || !!v.apart !== view.apart) setView({ blueprint: !!v.blueprint, apart: !!v.apart }, true);
  if (sc.tension) { tensionPlayed = false; selBlock = null; selHope = null; playTension(true); return; }
  if (sc.follow != null && sc.follow >= 0) setFollow(sc.follow);
  else if (sc.hope != null && sc.hope >= 0) { if (follow != null) setFollowRaw(null); selectHope(sc.hope); }
  else { if (follow != null) setFollowRaw(null); selectBlock(sc.block != null && sc.block >= 0 ? sc.block : null); bp.lit(sc.block >= 0 ? sc.block : -1); }
  if (sc.camera) camera.set(sc.camera);
  run();
}
function unscript() { endWave(); }
new IntersectionObserver((en) => {
  visible = en[en.length - 1].isIntersecting;
  if (visible && !tensionPlayed && TENSION && !still.matches) setTimeout(() => { if (!wave && !touched) playTension(false); }, (introLeft + 2.5) * 1000);
  run();
}, { rootMargin: "120px 0px" }).observe(stage);
rebuild();
if (!still.matches) { introLeft = parts.intro(); SPEC.fans.forEach((_, i) => { poses[i] = 0; }); }
drawFans(true);
camera.set(wide()); camera.step(0, true); say();
window.STAD = { unscript, setAct, selectBlock, selectHope, follow: setFollow, setView, get view() { return { ...view }; }, scene, tension: () => playTension(true), camera,
  get act() { return act; }, get block() { return selBlock; }, get following() { return follow; }, get standing() { return poses.filter((p) => p > 0.5).length; } };
return window.STAD;
})();
`;
  return { svg, live, P };
}
