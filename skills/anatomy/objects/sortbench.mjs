// Sort bench — an anatomy object template for "one sample, sorted many ways".
// Data contract: spec.study.n tokens (≤ 31 shown 1:1); spec.steps[] each with either
//   sorter:  { counts: [≤5 mutually exclusive groups summing to n], labels, lit?: { column, n } }
//   cabinet: { counts: [≤7 multi-mention counts out of n], labels, lit?: drawerIndex }
// Exclusive groups go in the sorter (stack height = count); overlapping mentions go in the
// cabinet (drawer pull = count / n). Tokens are anonymous: each step is an independent sort.

import { join } from "node:path";
const k = await import(new URL("../kit/iso-kit.mjs", import.meta.url).href);

export const WIDTH = 680;
export const HEIGHT = 400;
const AZ = 60;

import { readFileSync } from "node:fs";
export const GEOM_SRC = readFileSync(new URL("./sortbench.geom.js", import.meta.url), "utf8");
const PARTS_SRC = readFileSync(new URL("./parts.js", import.meta.url), "utf8");
const BLUEPRINT_SRC = readFileSync(new URL("./blueprint.js", import.meta.url), "utf8");
const CUTAWAY_SRC = readFileSync(new URL("./cutaway.js", import.meta.url), "utf8");
const TENSION_SRC = readFileSync(new URL("./tension.js", import.meta.url), "utf8");
export const TENSION_EVENTS = ["count"];
// ---------- scene contract (pages/scene.mjs): how any host mounts, drives and controls this object ----------
export const API = "BENCH", HOOK = "data-bench";
export const facts = (spec) => spec.steps.filter((s) => s.stat && /^\d+$/.test(String(s.stat.value))).map((s) => ({ key: "step." + s.key, value: +s.stat.value, base: spec.study.n, label: s.stat.base || s.title, group: s.kicker, scene: { step: spec.steps.indexOf(s) } }));
// the scrolly page drives chapters by scroll; anywhere else, a chapter menu does
export const controls = (spec) => [
  { kind: "select", label: "Chapter", call: "go", embedOnly: true, options: spec.steps.map((s, i) => ({ value: i, label: s.kicker })) },
  ...((spec.customers || []).length ? [{ kind: "select", label: "Follow…", call: "follow", get: "following", none: -1, options: spec.customers.map((c, i) => ({ value: i, label: "Follow " + c.label })) }] : []),
];
const sortbenchGeometry = new Function("k", "N", "P", "shape", GEOM_SRC + "\nreturn sortbenchGeometry(k, N, P, shape);");
// framing points (world) used to fit the base camera
const FIT = [[-232, -56, -15], [50, -56, -15], [50, 60, -15], [-232, 60, -15], [-232, -56, 0], [50, 60, 0], [-216, -11, 72], [-81, -8, 72], [-41, -47, 91], [26, 50, 0]];
export const CENTER = [-91, 2, 30];

export function build(spec) {
  const N = spec.study.n;
  // the bench's shape follows the study: widest exclusive sort → columns, longest reason list → drawers
  const SHAPE = {
    cols: Math.max(2, ...spec.steps.filter((s) => s.sorter).map((s) => s.sorter.counts.length)),
    drawers: Math.max(1, ...spec.steps.filter((s) => s.cabinet).map((s) => s.cabinet.counts.length)),
  };
  if (SHAPE.cols > 5 || SHAPE.drawers > 7) throw new Error("sort bench takes ≤5 exclusive groups and ≤7 reasons");
  const G0 = sortbenchGeometry(k, N, { origin: [0, 0], scale: 1, azimuth: AZ, elevation: 30 }, SHAPE);
  const fit = FIT.map((p) => (p[2] === 72 && p[0] === -81 ? [G0.RIGHT - 7, -8, 72] : p[2] === 91 ? [-41, -47, G0.TOPZ + 13] : p));
  const P = k.fitProjection(fit, WIDTH, HEIGHT, { pad: 16, azimuth: AZ });
  const G = sortbenchGeometry(k, N, P, SHAPE);
  const { COLS, COIN_H, BASE_Z, FLY_Z, PULL_MAX, DRAWERS, parts, CAB_SHIFT } = G;
  // evidence per chapter: its quote plus every source the report cites for it. Cabinet chapters open the card
  // tray (the index the drawers are filed from); sorter chapters open the rail the tokens are sorted under.
  const partOf = (k) => parts.find((q) => q.key === k);
  const evidence = spec.steps.map((s) => {
    const items = [];
    if (s.quote) items.push({ quote: s.quote.text, source: s.quote.source, who: "Participant" });
    for (const src of s.sources || []) if (!items.some((x) => x.source === src)) items.push({ quote: "", source: src, who: "Cited in the report" });
    const p = partOf(s.cabinet ? "cab-top" : "sorter-rail");
    return { part: p.key, anchor: p.anchor, items, total: items.length, title: s.kicker + " · " + items.length + (items.length === 1 ? " source" : " sources"),
      note: items.length ? "The verbatims and source passages the report cites for this chapter." : "The report cites no individual source for this chapter." };
  });
  const DRAWER_Z = Array.from({ length: DRAWERS }, (_, i) => G.drawerZ(i));
  const body = [G.body];
  const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: spec.figure.label, body });

  // ---------- live ----------
  const STATES = spec.steps.map((s) => ({
    sorter: s.sorter ? { counts: s.sorter.counts, lit: s.sorter.lit || null } : null,
    cabinet: s.cabinet ? { counts: s.cabinet.counts, lit: s.cabinet.lit ?? -1 } : null,
    readout: s.readout,
    camera: s.camera || { az: AZ, zoom: 1, focus: CENTER },
    sorterLabels: s.sorter ? s.sorter.labels : null,
    cabinetLabels: s.cabinet ? s.cabinet.labels : null,
    key: s.sorter ? { kind: "Columns, left to right", items: s.sorter.labels.map((l, i) => [l, s.sorter.counts[i]]) }
      : { kind: "Drawers, top to bottom", items: s.cabinet.labels.map((l, i) => [l, s.cabinet.counts[i]]) },
  }));
  const live = `
const BENCH = (() => {
const KIT = { AZIMUTH, ELEVATION, ISO_CSS, SHADES, axisVector, boxCorners, cameraOf, circleRing, coil, corners, cylinder, depthOf, dotGrid, dotsSvg, extrude, faceTextSvg, fadeLineSvg, fadedSvg, figureSvg, fitProjection, groupSvg, haloOf, holdStill, insetPlan, iso, joinPaths, knurl, lineOnTop, lineSvg, onTop, pageHtml, pathOf, planOutline, plateHtml, pointsAt, radialTicks, ring, ringOf, ringSeam, rise, roundedPlan, screenRise, segment, sideArc, sideMatrix, sideRing, sideSeam, sideTicks, slabOf, solidSvg, topMatrix, topTicks, towardViewer, translateAlong, wireSvg };
${PARTS_SRC}
${BLUEPRINT_SRC}
${CUTAWAY_SRC}
${TENSION_SRC}
${GEOM_SRC}
const P0 = ${JSON.stringify(P)};
let P = P0;
const CENTER = ${JSON.stringify(CENTER)}, W = ${WIDTH}, H = ${HEIGHT};
const N = ${N}, COLS = ${JSON.stringify(COLS)}, COIN_H = ${COIN_H}, BASE_Z = ${BASE_Z}, FLY_Z = ${FLY_Z};
const PULL_MAX = ${PULL_MAX}, DRAWERS = ${DRAWERS}, SHAPE = ${JSON.stringify(SHAPE)};
const STATES = ${JSON.stringify(STATES)};
const EVIDENCE = ${JSON.stringify(evidence)};
const TENSION = ${JSON.stringify(spec.__tension || null)};
// follow one respondent: each chapter's coded dimension, and every customer's own codes (labels C01, C02 …)
const FOLLOWS = ${JSON.stringify(spec.steps.map((s) => s.follow || null))};
const WHO_ONE = ${JSON.stringify(((spec.page || {}).who || {}).one || "respondent")};
const CUSTOMERS = ${JSON.stringify((spec.customers || []).map((c) => ({ label: c.label, codes: c.codes })))};
const COL_LABELS = ${JSON.stringify(spec.steps.map((s) => (s.sorter ? s.sorter.labels : s.cabinet.labels)))};
const PARTS = ${JSON.stringify(parts)}, CAB_SHIFT = ${CAB_SHIFT}, DRAWER_Z = ${JSON.stringify(DRAWER_Z)};
const ORDER = ["base", "sorter-stand", "sorter-boards", "sorter-cage", "sorter-rail", "cab-back", "cab-side", "cab-top"];
const SHEET = ${JSON.stringify(spec.figure.sheetCamera || { az: AZ, zoom: 0.78, focus: [-91, -4, 46] })};
const APART = ${JSON.stringify(spec.figure.apartCamera || { az: 58, zoom: 0.8, focus: [-91, 0, 42] })};
const SHEET_APART = ${JSON.stringify(spec.figure.sheetApartCamera || { az: 58, zoom: 0.7, focus: [-91, -4, 56] })};
const root = document.querySelector("[data-bench]");
const svg = root.querySelector("svg");
let coinsG, coins, drawersG, drawers, fronts, wireEl;
function bind() {
  wireEl = svg.querySelector("[data-wire]");
  coinsG = svg.querySelector("[data-coins]");
  coins = [...svg.querySelectorAll("[data-coin]")];
  drawersG = svg.querySelector("[data-drawers]");
  drawers = [...svg.querySelectorAll("[data-drawer]")].sort((a, b) => +a.dataset.drawer - +b.dataset.drawer);
  fronts = drawers.map((d) => d.querySelector("[data-front] .iso-solid"));
}
bind();
const plateEl = root.closest(".iso-plate");
const readout = plateEl.querySelector("[data-readout]");
const keyEl = plateEl.parentElement.querySelector("[data-key]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const zOf = (l) => BASE_Z + l * COIN_H;
// coin state: where it sits and, while moving, its path
const C = coins.map((_, i) => ({ col: 0, level: i, x: COLS[0], z: BASE_Z + i * COIN_H, move: null, lit: false }));
const pulls = drawers.map(() => ({ at: 0, want: 0, delay: 0 }));
let queued = null;
let lastSorter = null, current = -1, frame = 0, last = 0, clock = 0, order = "";
function assign(counts, animate) {
  const nCols = COLS.length;
  const want = Array.from({ length: nCols }, (_, c) => counts[c] || 0);
  const byCol = Array.from({ length: nCols }, () => []);
  C.forEach((s, i) => byCol[s.col].push(i));
  byCol.forEach((list) => list.sort((a, b) => C[a].level - C[b].level));
  const movers = [], slots = [];
  byCol.forEach((list, c) => {
    list.slice(want[c]).forEach((i) => movers.push(i));
    for (let l = Math.min(list.length, want[c]); l < want[c]; l++) slots.push([c, l]);
  });
  movers.sort((a, b) => C[b].level - C[a].level || C[a].col - C[b].col);
  movers.forEach((i, j) => {
    const [c, l] = slots[j];
    const s = C[i];
    if (animate) s.move = { x0: s.x, z0: s.z, x1: COLS[c], z1: zOf(l), t: -j * 0.045, dur: 1.15 };
    else { s.x = COLS[c]; s.z = zOf(l); }
    s.col = c; s.level = l;
  });
}
function setLit(lit) {
  C.forEach((s) => { s.lit = !!lit && s.col === lit.column && s.level < lit.n; });
  applyLit();
}
let tipSorter = null, tipCab = null;
function applyTips() {
  if (tipSorter) coins.forEach((el, i) => { const c = C[i].col; el.setAttribute("data-tip", "Token · one anonymous " + WHO_ONE + ". Column: " + tipSorter.labels[c] + " · " + tipSorter.counts[c] + " of " + N); });
  drawers.forEach((el, i) => el.setAttribute("data-tip", tipCab && tipCab.counts[i] != null ? "Drawer · " + tipCab.labels[i] + ": " + tipCab.counts[i] + " of " + N + " cited this (pull = share)" : "Drawer closed in this chapter"));
}
function applyLit() {
  applyTips();
  coins.forEach((el, i) => { const solid = el.querySelector(".iso-solid"); if (C[i].lit) solid.setAttribute("data-lit", ""); else solid.removeAttribute("data-lit"); });
  fronts.forEach((f, i) => { if (litDrawer === i) f.setAttribute("data-lit", ""); else f.removeAttribute("data-lit"); });
}

// ---------- camera: orbit (re-project) + zoom/pan (viewBox) ----------
const projAt = (az) => {
  const Pu = { origin: [0, 0], scale: P0.scale, azimuth: az, elevation: P0.elevation ?? 30 };
  const a = KIT.iso(CENTER, P0), b = KIT.iso(CENTER, Pu);
  return { ...Pu, origin: [a[0] - b[0], a[1] - b[1]] };
};
const cam = { az: STATES[0].camera.az, zoom: STATES[0].camera.zoom, f: [...STATES[0].camera.focus] };
let camWant = { az: cam.az, zoom: cam.zoom, f: [...cam.f] }, builtAz = P0.azimuth, rebuildMs = 0;
let litCoins = null, litDrawer = -1;
function rebuild(az) {
  const t0 = performance.now();
  P = projAt(az);
  svg.innerHTML = sortbenchGeometry(KIT, N, P, SHAPE).body;
  bind();
  order = "";
  applyLit();
  if (parts) { applyFollow(); placeParts(); }
  builtAz = az;
  rebuildMs = performance.now() - t0;
}
function applyView() {
  const [fx, fy] = KIT.iso(cam.f, P);
  const w = W / cam.zoom, h = H / cam.zoom;
  svg.setAttribute("viewBox", (fx - w / 2).toFixed(2) + " " + (fy - h / 2).toFixed(2) + " " + w.toFixed(2) + " " + h.toFixed(2));
}
function stepCamera(dt, snap) {
  const e = snap ? 1 : 1 - Math.exp(-dt / 0.4);
  cam.az += (camWant.az - cam.az) * e;
  cam.zoom += (camWant.zoom - cam.zoom) * e;
  for (let q = 0; q < 3; q++) cam.f[q] += (camWant.f[q] - cam.f[q]) * e;
  const done = Math.abs(camWant.az - cam.az) < 0.02 && Math.abs(camWant.zoom - cam.zoom) < 0.002 && cam.f.every((v, q) => Math.abs(v - camWant.f[q]) < 0.05);
  if (done) { cam.az = camWant.az; cam.zoom = camWant.zoom; cam.f = [...camWant.f]; }
  if (Math.abs(cam.az - builtAz) > 0.12 || (done && cam.az !== builtAz)) rebuild(cam.az);
  applyView();
  return !done;
}
function scrub(i, t) {
  const a = STATES[i].camera, b = STATES[Math.min(i + 1, STATES.length - 1)].camera;
  const l = (x, y) => x + (y - x) * t;
  camWant = sheet() ? camOf(restCam()) : { az: l(a.az, b.az), zoom: l(a.zoom, b.zoom), f: a.focus.map((v, q) => l(v, b.focus[q])) };
  run();
}
function go(index) {
  if (index === current) return;
  current = index;
  if (cut.isOpen && !scripted) cut.close();   // a new chapter closes the evidence of the last one
  if (TENSION && index === TENSION.index && !tensionPlayed && !scripted && !ten) tensionDue = 1.5;   // once per visit, after the coins settle
  const st = STATES[index];
  const animate = !still.matches;
  if (st.sorter) tipSorter = { labels: st.sorterLabels, counts: st.sorter.counts };
  tipCab = st.cabinet ? { labels: st.cabinetLabels, counts: st.cabinet.counts } : null;
  if (st.sorter) {
    const same = lastSorter && lastSorter.join() === st.sorter.counts.join();
    // a new sort waits for the last one's coins to land: re-sorting mid-flight let a coin still descending to a low slot
    // pass through coins that had already landed above it (seen when a deep link or fast scroll jumps chapters)
    if (!same) { if (animate && C.some((s) => s.move)) queued = { counts: st.sorter.counts, lit: st.sorter.lit }; else { queued = null; assign(st.sorter.counts, animate); } }
    lastSorter = st.sorter.counts;
    setLit(st.sorter.lit);
  } else setLit(null);
  const cab = st.cabinet;
  pulls.forEach((p, i) => { p.want = cab && cab.counts[i] != null ? (cab.counts[i] / N) * PULL_MAX : 0; p.delay = animate ? i * 0.08 : 0; if (!animate) p.at = p.want; });
  litDrawer = cab ? cab.lit : -1;
  applyLit();
  placeFollow();
  camWant = sheet() ? camOf(restCam()) : { az: st.camera.az, zoom: st.camera.zoom, f: [...st.camera.focus] };
  root.classList.toggle("is-cabinet", !!cab);
  if (!phase) readout.textContent = st.readout;
  bp.setItems(calloutsFor(index), st.sorter ? "row" : "column");
  bp.lit(st.sorter ? (st.sorter.lit ? st.sorter.lit.column : -1) : cab.lit ?? -1);
  if (keyEl) keyEl.innerHTML = '<span class="bench-key__kind">' + st.key.kind + '</span>' + st.key.items.map(([l, n]) => '<span class="bench-key__item"><span class="bench-key__n">' + n + '</span> ' + l + '</span>').join("");
  run();
}
function draw() {
  C.forEach((s, i) => coins[i].setAttribute("transform", translateAlong(P, [s.x, 0, s.z])));
  if (ten) countLit();
  const keyed = C.map((s, i) => [s.x * 0.5 + s.z * 0.3, i]).sort((a, b) => a[0] - b[0]);
  const sig = keyed.map((k) => k[1]).join(",");
  if (sig !== order) { order = sig; keyed.forEach(([, i]) => coinsG.appendChild(coins[i])); }
  pulls.forEach((p, i) => drawers[i].setAttribute("transform", translateAlong(P, [0, p.at, 0])));
}
function stepCoin(s, dt) {
  const m = s.move; if (!m) return false;
  m.t += dt;
  const u = Math.max(0, Math.min(1, m.t / m.dur));
  const up = FLY_Z - m.z0, across = Math.abs(m.x1 - m.x0), down = FLY_Z - m.z1, total = up + across + down || 1;
  const d = smooth(u) * total;
  if (d < up) { s.x = m.x0; s.z = m.z0 + d; }
  else if (d < up + across) { s.x = m.x0 + Math.sign(m.x1 - m.x0) * (d - up); s.z = FLY_Z; }
  else { s.x = m.x1; s.z = FLY_Z - (d - up - across); }
  if (u >= 1) { s.x = m.x1; s.z = m.z1; s.move = null; }
  return true;
}
let lastDt = 1 / 60;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now; lastDt = dt;
  parts.step(dt, still.matches);
  cut.step(dt, still.matches);
  if (introLeft > 0) introLeft -= dt;
  say();
  let busy = stepCamera(dt, still.matches) || parts.busy || introLeft > 0 || cut.busy;
  if (stepTension(dt) || tensionDue > 0 || (chip && chip.on) || pinMoving) busy = true;
  C.forEach((s) => { if (stepCoin(s, dt)) busy = true; });
  if (queued && !C.some((s) => s.move)) { const q = queued; queued = null; assign(q.counts, true); setLit(q.lit); placeFollow(); busy = true; }
  pulls.forEach((p) => {
    if (p.delay > 0) { p.delay -= dt; busy = true; return; }
    p.at += (p.want - p.at) * (1 - Math.exp(-dt / 0.3));
    if (Math.abs(p.want - p.at) < 0.02) p.at = p.want; else busy = true;
  });
  draw();
  placeParts();
  frame = busy ? requestAnimationFrame(tick) : 0;
}
function run() { if (!frame) { last = 0; frame = requestAnimationFrame(tick); } }
// ---------- parts, intro, exploded view, blueprint ----------
// The data never comes apart: coins stay stacked and drawers stay pulled to their counts.
const parts = makeParts({ svg, KIT, parts: PARTS, order: ORDER });
const view = { blueprint: false, apart: false };
const sheet = () => view.blueprint || view.apart;
const camOf = (c) => ({ az: c.az, zoom: c.zoom, f: [...c.focus] });
const roomy = (c) => (plateEl.clientWidth < 520 ? { ...c, zoom: c.zoom * 0.96, focus: [c.focus[0], c.focus[1], c.focus[2] + 6] } : c);
const restCam = () => (view.apart && view.blueprint ? roomy(SHEET_APART) : view.apart ? APART : roomy(SHEET));
// callouts follow the chapter: one per column (exclusive groups) or per drawer (multi-mention reasons)
function calloutsFor(i) {
  const st = STATES[i];
  if (st.sorter) return st.sorterLabels.map((l, c) => ({ part: "sorter-stand", anchor: () => [COLS[c], 0, zOf(st.sorter.counts[c])], num: String(c + 1).padStart(2, "0"), name: l, count: st.sorter.counts[c], n: N }));
  return st.cabinetLabels.map((l, d) => ({ part: "base", anchor: () => [37 + CAB_SHIFT, 6.4 + pulls[d].at, DRAWER_Z[d] + 4.6], num: String(d + 1).padStart(2, "0"), name: l, count: st.cabinet.counts[d], n: N }));
}
const bp = makeBlueprint({ plate: plateEl, svg, KIT, items: [], offset: parts.offset });
let introLeft = 0, phase = "";
// ---------- follow one respondent ----------
// The customer is placed by their own coded answer, never the other way round. In a sorter chapter they become a coin
// already sitting in their column (on the right side of a highlighted subgroup); the pin glides there, so nothing has to
// fly through a stack. In a cabinet chapter every drawer they cited is outlined. No column for their answer: the pin says so.
let follow = -1, followIdx = -1, pinAt = null, pinMoving = false;
// a chapter may light the subset of its column that meets a named predicate: spec.predicates[name] = { dim, in: [values] }
const PREDICATES = ${JSON.stringify(spec.predicates || {})};
const meets = (c, name) => { const q = PREDICATES[name]; if (!q) throw new Error("unknown predicate " + name); return q.in.includes(c.codes[q.dim]); };
const pin = document.createElement("div");
pin.className = "follow-pin"; pin.hidden = true; pin.setAttribute("aria-live", "polite");
const pinLine = document.createElementNS("http://www.w3.org/2000/svg", "svg");
pinLine.setAttribute("class", "follow-pin__line"); pinLine.setAttribute("aria-hidden", "true");
plateEl.append(pinLine, pin);
function followTarget(i) {
  const f = FOLLOWS[i], c = CUSTOMERS[follow];
  if (!f || !c) return null;
  if (f.multi) return { drawers: f.multi.map((k, d) => (c.codes[f.dim][k] ? d : -1)).filter((d) => d >= 0), of: f.multi.length };
  const col = f.values.indexOf(c.codes[f.dim]);
  return { col, value: c.codes[f.dim], lit: f.lit ? meets(c, f.lit) : null };
}
function placeFollow() {
  followIdx = -1;
  if (follow < 0 || current < 0) return applyFollow();
  const st = STATES[current], t = followTarget(current);
  if (st.sorter && t && t.col >= 0 && st.sorter.counts[t.col] > 0) {
    const L = st.sorter.lit && st.sorter.lit.column === t.col ? st.sorter.lit.n : null;
    const fits = (s) => s.col === t.col && (L == null || t.lit == null || (s.level < L) === t.lit);
    // prefer a coin near the top of the stack, where the pin can reach it
    const cand = C.map((s, j) => [s, j]).filter(([s]) => fits(s)).sort((a, b) => b[0].level - a[0].level);
    if (cand.length) followIdx = cand[0][1];
  }
  applyFollow();
}
function applyFollow() {
  coins.forEach((el, i) => el.querySelector(".iso-solid").toggleAttribute("data-follow", i === followIdx));
  const t = follow >= 0 && current >= 0 ? followTarget(current) : null;
  fronts.forEach((f, d) => f.toggleAttribute("data-follow", !!(t && t.drawers && t.drawers.includes(d))));
  pin.hidden = follow < 0;
  if (follow < 0) { pinLine.innerHTML = ""; return; }
  const c = CUSTOMERS[follow], labels = COL_LABELS[current] || [];
  let sub = "";
  if (!t) sub = "not coded for this chapter";
  else if (t.drawers) sub = "cites " + t.drawers.length + " of " + t.of;
  else if (t.col < 0 || followIdx < 0) sub = "coded outside these columns";
  else sub = labels[t.col].replace(/ \(derived[^)]*\)/, "");
  pin.innerHTML = '<span class="follow-pin__who">' + c.label + '</span><span class="follow-pin__sub"></span>';
  pin.querySelector(".follow-pin__sub").textContent = sub;
}
function followAnchor() {
  // world point the pin points at: the followed coin, or the top cited drawer front
  if (follow < 0 || current < 0) return null;
  if (followIdx >= 0) { const s = C[followIdx]; return [s.x, 0, s.z + COIN_H]; }
  const t = followTarget(current);
  if (t && t.drawers && t.drawers.length) { const d = t.drawers[0]; return [37 + CAB_SHIFT, 6.4 + pulls[d].at, DRAWER_Z[d] + 4.6]; }
  return null;
}
function drawPin(dt) {
  if (follow < 0) return;
  const a = followAnchor(), pr = plateEl.getBoundingClientRect(), m = svg.getScreenCTM();
  if (!a || !m) { pinLine.innerHTML = ""; pin.style.transform = "translate(16px, 64px)"; return; }
  const [u, v] = KIT.iso(a, P), pt = new DOMPoint(u, v).matrixTransform(m);
  const want = [pt.x - pr.left, pt.y - pr.top];
  const e = still.matches || !pinAt ? 1 : 1 - Math.exp(-dt / 0.25);
  pinAt = pinAt ? [pinAt[0] + (want[0] - pinAt[0]) * e, pinAt[1] + (want[1] - pinAt[1]) * e] : want;
  pinMoving = Math.hypot(want[0] - pinAt[0], want[1] - pinAt[1]) > 0.4;
  const tools = plateEl.querySelector(".fig-tools"), floor = tools ? tools.getBoundingClientRect().bottom - pr.top + 8 : 8;   // never under the toolbar
  const below = plateEl.hasAttribute("data-blueprint");   // callouts own the space above the drawing on a blueprint sheet
  const lx = Math.max(8, Math.min(pr.width - pin.offsetWidth - 8, pinAt[0] + 34));
  const ly = below ? Math.min(pr.height - pin.offsetHeight - 48, pinAt[1] + 26) : Math.max(floor, pinAt[1] - 58);
  pin.style.transform = "translate(" + lx.toFixed(1) + "px, " + ly.toFixed(1) + "px)";
  pinLine.setAttribute("viewBox", "0 0 " + pr.width.toFixed(1) + " " + pr.height.toFixed(1));
  pinLine.innerHTML = '<path class="bp-leader" data-on d="M' + lx.toFixed(1) + " " + (ly + pin.offsetHeight / 2).toFixed(1) + "H" + (pinAt[0] + 14).toFixed(1) + "L" + pinAt[0].toFixed(1) + " " + pinAt[1].toFixed(1) + '"/><circle class="bp-dot" data-on cx="' + pinAt[0].toFixed(1) + '" cy="' + pinAt[1].toFixed(1) + '" r="2.5"/>';
}
function setFollow(i, quiet) {
  follow = i >= 0 && i < CUSTOMERS.length ? i : -1; pinAt = null;
  placeFollow(); run();
  if (!quiet) document.dispatchEvent(new CustomEvent("follow", { detail: { index: follow, label: follow >= 0 ? CUSTOMERS[follow].label : null } }));
}
// ---------- tension: the count-off. In the target chapter the highlighted coins (the subgroup the report states) go
// dark, then light one at a time, bottom up, while the rest of their column stays dark: nothing moves, so nothing can
// pass through the stack. The chip prints both stated numbers.
const chip = TENSION ? makeTensionChip(plateEl, TENSION) : null;
let ten = null, tensionPlayed = false, tensionDue = 0;
const COUNT_GAP = 0.32, COUNT_LEAD = 0.5;
function countLit() {
  // during the count-off a highlighted coin shows lit only once the count has reached it
  const lit = C.map((s, j) => [s, j]).filter(([s]) => s.lit).sort((a, b) => a[0].level - b[0].level).map(([, j]) => j);
  const shown = ten ? Math.max(0, Math.floor((ten.t - COUNT_LEAD) / COUNT_GAP) + 1) : lit.length;
  lit.forEach((j, k) => { const solid = coins[j].querySelector(".iso-solid"); if (k < shown) solid.setAttribute("data-lit", ""); else solid.removeAttribute("data-lit"); });
}
function playTension(force) {
  if (!TENSION || ten || still.matches || (!force && tensionPlayed)) return;
  tensionPlayed = true; tensionDue = 0;
  if (current !== TENSION.index) go(TENSION.index);
  ten = { t: 0 }; chip.show(6); run();
}
function stepTension(dt) {
  if (tensionDue > 0) { tensionDue -= dt; if (tensionDue <= 0) playTension(); }
  if (chip) chip.step(dt);
  if (!ten) return false;
  ten.t += dt;
  const lit = C.filter((s) => s.lit).length;
  if (ten.t > COUNT_LEAD + lit * COUNT_GAP + 0.8) { ten = null; countLit(); }
  return true;
}
const cut = makeCutaway({ plate: plateEl, svg, KIT, offset: parts.offset, onClose: () => { const st = STATES[Math.max(0, current)]; camWant = sheet() ? camOf(restCam()) : { az: st.camera.az, zoom: st.camera.zoom, f: [...st.camera.focus] }; run(); } });
function cutaway(on) {
  if (!on || current < 0 || !EVIDENCE[current].items.length) { cut.close(); return; }
  cut.open(EVIDENCE[current]);
  if (!sheet()) camWant = camOf(cut.frame(P, STATES[current].camera.az, 1.5, W, 0.2));
  run();
}
root.addEventListener("click", () => { if (scripted) return; cutaway(!cut.isOpen); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && cut.isOpen) cut.close(); });
function placeParts() {
  parts.apply(P);
  const o = parts.vis("sorter-stand"), d = parts.vis("cab-back");
  coinsG.setAttribute("opacity", o < 0.999 ? o.toFixed(3) : "1");
  drawersG.setAttribute("opacity", d < 0.999 ? d.toFixed(3) : "1");
  const w = Math.max(0, 1 - parts.share("sorter-rail") * 4) * parts.vis("sorter-rail");
  if (wireEl) wireEl.setAttribute("opacity", w < 0.999 ? w.toFixed(3) : "1");
  bp.update(P);
  cut.draw(P);
  drawPin(lastDt);
}
function say() {
  let p = "";
  if (introLeft > 0) p = "assembling · " + ORDER.length + " parts";
  else if (parts.busy) p = view.apart ? "taking apart" : "closing up";
  else if (view.apart) p = "apart · " + parts.count + " assemblies";
  if (p === phase) return;
  phase = p;
  readout.textContent = p || (current >= 0 ? STATES[current].readout : "");
}
function setView(v, quiet) {
  const was = { ...view };
  Object.assign(view, v);
  bp.set(view.blueprint);
  plateEl.toggleAttribute("data-apart", view.apart);
  if (view.apart !== was.apart) parts.set(view.apart);
  const st = STATES[Math.max(0, current)];
  camWant = sheet() ? camOf(restCam()) : { az: st.camera.az, zoom: st.camera.zoom, f: [...st.camera.focus] };
  if (!quiet) document.dispatchEvent(new CustomEvent("view", { detail: { ...view } }));
  run();
}
// ---------- scene (scripts, video, slides): { step, view, camera, wide } ----------
let scripted = false;
function scene(sc) {
  scripted = true;
  const v = sc.view || { blueprint: false, apart: false };
  if (!!v.blueprint !== view.blueprint || !!v.apart !== view.apart) setView({ blueprint: !!v.blueprint, apart: !!v.apart }, true);
  if (sc.follow !== undefined && sc.follow !== follow) setFollow(sc.follow);
  if (sc.step != null && sc.step >= 0) go(sc.step);
  if (sc.cutaway) { cutaway(true); return; } else cut.close();
  if (sc.tension) { tensionPlayed = false; tensionDue = 1.5; }
  const st = STATES[Math.max(0, current)];
  camWant = sc.camera ? camOf(sc.camera) : sheet() || sc.wide ? camOf(restCam()) : { az: st.camera.az, zoom: st.camera.zoom, f: [...st.camera.focus] };
  run();
}
function unscript() { scripted = false; cut.close(); }
root.addEventListener("keydown", (ev) => {
  if (ev.key === "b" || ev.key === "B") setView({ blueprint: !view.blueprint });
  if (ev.key === "a" || ev.key === "A") setView({ apart: !view.apart });
});
assign(STATES[0].sorter.counts, false);
go(0);
stepCamera(0, true);
draw();
// the bench builds itself on load (reduced motion: it is simply there)
if (!still.matches) { introLeft = parts.intro(0.1); placeParts(); run(); } else { parts.step(0, true); placeParts(); }
window.BENCH = { __coins: () => C.map((s, i) => ({ i, col: s.col, level: s.level, z: +s.z.toFixed(2), lit: s.lit, moving: !!s.move })), go, scrub, count: STATES.length, get rebuildMs() { return rebuildMs; }, rebuild, setView, get view() { return { ...view }; }, parts, scene, unscript, cutaway, tension: () => playTension(true), follow: setFollow, get following() { return follow; }, customers: CUSTOMERS.map((c) => c.label), get scripted() { return scripted; } };
return window.BENCH;
})();
`;
  return { svg, live, P };
}
