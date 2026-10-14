// Lineup — an anatomy object for rating distributions: one figure per respondent standing at their own rating, a lane
// per group, a condition switch that walks everyone to their rating for it. Data contract: worlds/curb.world.js.
// Exposes window.LINE. Built by tools/patterns/lineup.mjs.

import { readFileSync } from "node:fs";
const k = await import(new URL("../kit/iso-kit.mjs", import.meta.url).href);

export const WIDTH = 760;
export const HEIGHT = 480;
const AZ = 62;
const SRC = ["engine/compose.js", "engine/primitives.js", "props/street.js", "worlds/curb.world.js"].map((f) => readFileSync(new URL("../" + f, import.meta.url), "utf8")).join("\n");
const RT = ["camera", "parts", "blueprint", "tension", "pin"].map((f) => readFileSync(new URL(`./${f}.js`, import.meta.url), "utf8")).join("\n");
const api = new Function("k", SRC + "\nreturn { layout: curbLayout, geometry: curbGeometry };")(k);
export const TENSION_EVENTS = ["walk"];

// ---------- scene contract (pages/scene.mjs) ----------
export const API = "LINE", HOOK = "data-lineup";
export const controls = (spec) => [
  { kind: "segmented", label: "Situation", call: "setCond", get: "cond", options: spec.conds.map((c, i) => ({ value: i, label: c.short })) },
  { kind: "select", label: "Follow…", call: "follow", get: "following", none: null, options: spec.people.map((p, i) => ({ value: i, label: "Follow " + p.label })) },
];
export const facts = (spec) => spec.conds.flatMap((c, ci) => spec.groups.map((g, gi) => ({
  key: `median.${c.key}.${g.key}`, value: spec.groupStats[gi][c.key].median, base: spec.scale.max, label: `median, ${g.name.toLowerCase()} (n = ${spec.groupStats[gi][c.key].n})`,   // the condition is the group heading
  group: c.name, scene: { cond: ci, group: gi } })));
export function prepare(spec, curly = (s) => s) {
  if (!spec.tension) return;
  if (!spec.tension.numbers.every((s) => /\d/.test(s))) throw new Error("tension numbers must state a number");
  spec.__tension = { label: curly(spec.tension.label), cond: spec.tension.cond, from: spec.tension.from, numbers: spec.tension.numbers.map((text) => ({ text })) };
}
export function scripts(spec, curly = (s) => s) {
  return Object.fromEntries(Object.entries(spec.scripts || {}).map(([key, sc]) => [key, { key, title: sc.title, label: sc.label, beats: sc.beats.map((b, i) => {
    if (/\d/.test(b.title || "")) throw new Error(`script ${key} beat ${i}: a title may not carry numbers`);
    return { ...b, kicker: b.cond ? spec.conds.find((c) => c.key === b.cond).name : "", title: curly(b.title || ""), caption: b.caption ? { text: curly(b.caption) } : null, quote: b.quote ? { ...b.quote, quote: curly(b.quote.quote) } : null, sub: null };
  }) }]));
}

export function build(spec) {
  const LAY = api.layout(spec);
  const P = k.fitProjection(LAY.fit, WIDTH, HEIGHT, { pad: 12, azimuth: AZ });
  const G = api.geometry(k, spec, P, { cond: spec.conds[0].key });
  const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: spec.figure.label, body: [G.body] });
  const SPEC = { scale: spec.scale, conds: spec.conds.map(({ key, name, short, dressing }) => ({ key, name, short, dressing })),
    groups: spec.groups.map(({ key, name, people }) => ({ key, name, people })), people: spec.people.map(({ label, group, values }) => ({ label, group, values })),
    groupStats: spec.groupStats.map((g) => Object.fromEntries(Object.entries(g).map(([c, s]) => [c, { median: s.median, n: s.n }]))) };
  const live = `
const LINE = (() => {
const KIT = { AZIMUTH, ELEVATION, ISO_CSS, SHADES, axisVector, boxCorners, cameraOf, circleRing, coil, corners, cylinder, depthOf, dotGrid, dotsSvg, extrude, faceTextSvg, fadeLineSvg, fadedSvg, figureSvg, fitProjection, groupSvg, haloOf, holdStill, insetPlan, iso, joinPaths, knurl, lineOnTop, lineSvg, onTop, pageHtml, pathOf, planOutline, plateHtml, pointsAt, radialTicks, ring, ringOf, ringSeam, rise, roundedPlan, screenRise, segment, sideArc, sideMatrix, sideRing, sideSeam, sideTicks, slabOf, solidSvg, topMatrix, topTicks, towardViewer, translateAlong, wireSvg };
${RT}
${SRC}
const SPEC = ${JSON.stringify(SPEC)};
const P0 = ${JSON.stringify(P)};
let P = P0;
const TENSION = ${JSON.stringify(spec.__tension || null)};
const WIDE = ${JSON.stringify(spec.figure.wideCamera || { az: AZ, zoom: 1.0, focus: LAY.CENTER })};
const LAY = curbLayout(SPEC);
const N = SPEC.people.length;
const stage = document.querySelector("[data-lineup]");
const svg = stage.querySelector("svg");
const plate = stage.closest(".iso-plate");
const readout = plate.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
let cond = 0, selGroup = null, follow = null;
let target = LAY.positions(SPEC.conds[0].key);
const pos = target.map((p) => ({ ...p }));
let G = null;
const state = () => ({ cond: SPEC.conds[cond].key, pos, sel: { group: selGroup }, follow });
function rebuild() { G = curbGeometry(KIT, SPEC, P, state()); svg.innerHTML = G.body; parts.apply(P); }
function drawPeople() { const layer = svg.querySelector("[data-people]"); if (layer) layer.innerHTML = G.peopleSvg(pos, state()); }
const wideCam = () => (plate.clientWidth < 520 ? { az: WIDE.az, zoom: WIDE.zoom * 1.25, focus: [WIDE.focus[0] - 6, WIDE.focus[1], WIDE.focus[2]] } : WIDE);
const camera = makeCamera({ svg, KIT, P0, CENTER: ${JSON.stringify(LAY.CENTER)}, W: ${WIDTH}, H: ${HEIGHT}, start: WIDE, rebuild: (p) => { P = p; rebuild(); } });
let PARTS = curbGeometry(KIT, SPEC, P, state()).parts;
const order = () => ["base", "road", "ruler", "building", ...SPEC.groups.map((g) => "median-" + g.key), "pod", "dressing"];
let parts = makeParts({ svg, KIT, parts: PARTS, order: order() });
const view = { blueprint: false, apart: false };
const callouts = () => SPEC.groups.map((g, gi) => { const p = PARTS.find((q) => q.key === "median-" + g.key); const s = SPEC.groupStats[gi][SPEC.conds[cond].key]; return p ? { part: p.key, anchor: p.anchor, num: String(gi + 1).padStart(2, "0"), name: g.name + " · median", count: s.median, n: SPEC.scale.max } : null; }).filter(Boolean);
const bp = makeBlueprint({ plate, svg, KIT, items: callouts(), offset: (key) => parts.offset(key), onPick: (i) => selectGroup(i) });
const pin = makePin({ plate, svg, KIT });
const chip = TENSION ? makeTensionChip(plate, TENSION, "bottom") : null;
function say() {
  const c = SPEC.conds[cond];
  if (walkT != null) { readout.textContent = "Walking to: " + c.name; return; }
  if (follow != null) { const p = SPEC.people[follow], v = p.values[c.key]; readout.textContent = p.label + " · " + (v == null ? "no answer" : "rated " + v + " on " + SPEC.scale.min + "–" + SPEC.scale.max) + " · " + c.name; return; }
  if (selGroup != null) { const g = SPEC.groups[selGroup], s = SPEC.groupStats[selGroup][c.key]; readout.textContent = g.name + " · median " + s.median + " on " + SPEC.scale.min + "–" + SPEC.scale.max + " (n = " + s.n + ") · " + c.name; return; }
  readout.textContent = c.name + " · " + SPEC.groups.map((g, gi) => g.name + " median " + SPEC.groupStats[gi][c.key].median).join(" · ");
}
function emit(type) { document.dispatchEvent(new CustomEvent("lineup", { detail: { type, cond, group: selGroup, follow } })); }
function personCam(i) { const p = target[i]; return { az: ${AZ}, zoom: 2.4, focus: [p.x, p.y, 6] }; }
function laneCam(gi) { return { az: ${AZ}, zoom: 1.5, focus: [LAY.scaleEnd / 2, gi === 0 ? -24 : 24, 6] }; }
function aim() { camera.set(view.apart || view.blueprint ? WIDE : follow != null ? personCam(follow) : selGroup != null ? laneCam(selGroup) : wideCam()); }
// ---------- state ----------
let touched = false, walkT = null, tensionPlayed = false;
function setCond(c, quiet) {
  if (!quiet) { touched = true; endWalk(); }
  if (c === cond && !quiet) return;
  cond = c;
  target = LAY.positions(SPEC.conds[cond].key);
  PARTS = curbGeometry(KIT, SPEC, P, state()).parts;
  parts = makeParts({ svg, KIT, parts: PARTS, order: order() });
  if (view.apart) parts.set(true);
  bp.setItems(callouts());
  rebuild();
  if (still.matches) { target.forEach((t, i) => Object.assign(pos[i], t)); drawPeople(); }
  aim(); say(); emit("cond"); run();
}
function selectGroup(i) { touched = true; endWalk(); selGroup = i; if (follow != null) setFollowRaw(null); bp.lit(i == null ? -1 : i); rebuild(); aim(); say(); emit("group"); run(); }
function setFollowRaw(i) { follow = i; if (i == null) pin.hide(); else { const p = SPEC.people[i]; pin.set(p.label, SPEC.groups.find((g) => g.key === p.group).name); } }
function setFollow(i) { touched = true; endWalk(); setFollowRaw(i == null || i < 0 ? null : i); if (follow != null) selGroup = null; rebuild(); aim(); say(); emit("follow"); run(); }
function setView(v, quiet) {
  if (!quiet) touched = true;
  const was = { ...view }; Object.assign(view, v);
  bp.set(view.blueprint); plate.toggleAttribute("data-apart", view.apart);
  if (view.apart !== was.apart) parts.set(view.apart);
  aim(); if (!quiet) document.dispatchEvent(new CustomEvent("view", { detail: { ...view } })); run();
}
// ---------- tension: the walk. Everyone stands at their rating for the first condition, then walks to their rating for
// the tension condition. Each figure moves only to its own coded answer; the chip prints the stated medians.
function endWalk() { if (walkT == null) return; walkT = null; if (chip) chip.hide(); }
function playTension(force) {
  if (!TENSION || walkT != null || still.matches || (!force && tensionPlayed)) return;
  tensionPlayed = true;
  const from = SPEC.conds.findIndex((c) => c.key === TENSION.from), to = SPEC.conds.findIndex((c) => c.key === TENSION.cond);
  selGroup = null; if (follow != null) setFollowRaw(null);
  if (view.apart || view.blueprint) setView({ blueprint: false, apart: false }, true);
  setCond(from, true);
  target.forEach((t, i) => Object.assign(pos[i], t)); drawPeople();
  walkT = 0; walkTo = to;
  if (chip) chip.show(6.5);
  camera.set(wideCam()); say(); run();
}
let walkTo = 0;
// ---------- loop ----------
let frame = 0, last = 0, visible = false, introLeft = 0;
function tick(now) {
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
  parts.step(dt); parts.apply(P);
  if (introLeft > 0) introLeft -= dt;
  if (walkT != null) { walkT += dt; if (walkT > 1.2 && cond !== walkTo) setCond(walkTo, true); if (walkT > 6.5) { walkT = null; say(); } }
  if (chip) chip.step(dt);
  let moving = false;
  const e = 1 - Math.exp(-dt / 0.45);
  for (let i = 0; i < N; i++) {
    const t = target[i], p = pos[i];
    const lag = Math.min(0.6, (i % 7) * 0.05);   // a crowd doesn't move as one
    if (Math.abs(t.x - p.x) > 0.05 || Math.abs(t.y - p.y) > 0.05) { if (introLeft <= lag) { p.x += (t.x - p.x) * e; p.y += (t.y - p.y) * e; } moving = true; }
    else { p.x = t.x; p.y = t.y; }
    p.missing = t.missing;
  }
  if (moving) drawPeople();
  const camMoving = camera.step(dt, still.matches);
  if (follow != null) pin.update(P, [pos[follow].x, pos[follow].y, 9], dt);
  bp.update(P);
  frame = visible && (moving || camMoving || parts.busy || walkT != null || pin.moving || (chip && chip.on)) ? requestAnimationFrame(tick) : 0;
}
function run() {
  if (still.matches) { parts.step(0, true); parts.apply(P); target.forEach((t, i) => Object.assign(pos[i], t)); drawPeople(); camera.step(0, true); if (follow != null) pin.update(P, [pos[follow].x, pos[follow].y, 9], 0, true); bp.update(P); return; }
  if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); }
}
// ---------- direct manipulation ----------
stage.addEventListener("click", (e) => {
  const pe = e.target.closest("[data-p]");
  if (pe) { setFollow(+pe.dataset.p === follow ? null : +pe.dataset.p); return; }
  const part = e.target.closest("[data-part]"), key = part && part.dataset.part;
  if (key && key.startsWith("median-")) { selectGroup(SPEC.groups.findIndex((g) => "median-" + g.key === key)); return; }
  if (selGroup != null || follow != null) { selGroup = null; setFollow(null); bp.lit(-1); }
});
stage.addEventListener("keydown", (e) => {
  if (e.key === "b" || e.key === "B") setView({ blueprint: !view.blueprint });
  else if (e.key === "a" || e.key === "A") setView({ apart: !view.apart });
  else if (e.key === "ArrowRight" || e.key === "ArrowLeft") { setCond((cond + (e.key === "ArrowRight" ? 1 : -1) + SPEC.conds.length) % SPEC.conds.length); e.preventDefault(); }
  else if (e.key === "Escape") { selGroup = null; setFollow(null); bp.lit(-1); }
});
function scene(sc) {
  touched = true;   // a script or a host's "show me" is in control: the automatic walk never plays over it
  const c = sc.cond == null ? cond : typeof sc.cond === "number" ? sc.cond : SPEC.conds.findIndex((x) => x.key === sc.cond);
  if (c !== cond) setCond(c, true);
  const v = sc.view || { blueprint: false, apart: false };
  if (!!v.blueprint !== view.blueprint || !!v.apart !== view.apart) setView({ blueprint: !!v.blueprint, apart: !!v.apart }, true);
  if (sc.tension) { tensionPlayed = false; playTension(true); return; }
  if (sc.follow != null && sc.follow >= 0) { setFollowRaw(sc.follow); selGroup = null; }
  else { if (follow != null) setFollowRaw(null); selGroup = sc.group != null && sc.group >= 0 ? sc.group : null; bp.lit(selGroup == null ? -1 : selGroup); }
  rebuild(); if (sc.camera) camera.set(sc.camera); else aim(); say(); emit("scene"); run();
}
function unscript() { endWalk(); }
new IntersectionObserver((en) => {
  visible = en[en.length - 1].isIntersecting;
  if (visible && !tensionPlayed && TENSION && !still.matches) setTimeout(() => { if (walkT == null && !touched) playTension(false); }, (introLeft + 2.5) * 1000);
  run();
}, { rootMargin: "120px 0px" }).observe(stage);
rebuild();
if (!still.matches) introLeft = parts.intro();
drawPeople();
camera.set(wideCam()); camera.step(0, true); say();
window.LINE = { unscript, setCond, selectGroup, follow: setFollow, setView, get view() { return { ...view }; }, scene, tension: () => playTension(true), camera,
  get cond() { return cond; }, get group() { return selGroup; }, get following() { return follow; } };
return window.LINE;
})();
`;
  return { svg, live, P };
}
