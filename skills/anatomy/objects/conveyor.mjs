// Conveyor — an anatomy object template for ordered journeys.
// Data contract: spec.stations = 3–5 ordered stations, each { name, prop, count, readout };
//                spec.study.n = the base every gauge reads against.
// Props a station can carry: hopper | bin-rack | photo-eye | labeler | threshold-gate.
// The belt carries every bag past every station (counts overlap; this is not a funnel).

import { join } from "node:path";
const KIT = new URL("../kit/iso-kit.mjs", import.meta.url).href;
const k = await import(KIT);

export const WIDTH = 680;
export const HEIGHT = 460;   // taller frame: the one-pager pins this beside its control rail
const AZ = 60;

// ---------- world layout (units ≈ px) ----------
const PLATE = { x: -222, y: -50, w: 452, d: 140, r: 8 };
const PLATE_H = 10, FOOT_H = 5;
const X0 = -180, X1 = 152;                 // belt ends
const RAIL_Z0 = 22, BELT_Z0 = 30, BELT_TOP = 34, RAIL_TOP = 37;
const LEGS = [-172, -62, 12, 80, 146];
const STATION_X = [-161, -95, -25, 45, 110];
const GAUGE_Y = 64, DIAL_R = 13, DIAL_Z = 10, DIAL_TOP = 17;
const SPAN = Math.PI * 1.5, FROM = -Math.PI * 0.75;
const TOTE = { x: 160, y: -27, w: 50, d: 54, r: 2 }, TOTE_H = 26;
const BUMP = { x: 106, w: 8, h: 3 };

// ---------- bag path (shared by build + live) ----------
const SPAWN = -170, DROP = 155, FALL = 24, LAND_Z = 9, REST = 18;
const BELT_LEN = DROP - SPAWN;
export const PATH_LEN = BELT_LEN + FALL + REST;
export const BAGS = 10;
export const SPEED = 15;

import { readFileSync } from "node:fs";
// Worlds that stage an ordered journey: same data, same runtime, different props. spec.__world picks one.
const WORLDS = {
  conveyor: { files: ["engine/compose.js", "props/machine.js", "worlds/conveyor.world.js"], fn: "conveyor" },
  aisle: { files: ["engine/compose.js", "props/machine.js", "props/shop.js", "worlds/aisle.world.js"], fn: "aisle" },
};
function worldOf(spec) {
  const w = WORLDS[spec.__world || "conveyor"];
  if (!w) throw new Error("unknown world " + spec.__world + " (have " + Object.keys(WORLDS).join(", ") + ")");
  const src = w.files.map((f) => readFileSync(new URL("../" + f, import.meta.url), "utf8")).join("\n") +
    `\nfunction lineGeometry(k, spec, P) { return ${w.fn}Geometry(k, spec, P); }\nfunction lineNeedle(k, P, x, v, N) { return ${w.fn}Needle(k, P, x, v, N); }\nfunction lineCleats(k, P, X0, X1, BUMP, RIDE, offset) { return ${w.fn}Cleats(k, P, X0, X1, BUMP, RIDE, offset); }`;
  const api = new Function("k", src + "\nreturn { layout: " + w.fn + "Layout, geometry: lineGeometry };")(k);
  return { src, ...api };
}
const CAMERA_SRC = readFileSync(new URL("./camera.js", import.meta.url), "utf8");
const PARTS_SRC = readFileSync(new URL("./parts.js", import.meta.url), "utf8");
const BLUEPRINT_SRC = readFileSync(new URL("./blueprint.js", import.meta.url), "utf8");
const CUTAWAY_SRC = readFileSync(new URL("./cutaway.js", import.meta.url), "utf8");
const TENSION_SRC = readFileSync(new URL("./tension.js", import.meta.url), "utf8");
const PIN_SRC = readFileSync(new URL("./pin.js", import.meta.url), "utf8");
export const TENSION_EVENTS = ["stall"];
// ---------- scene contract (pages/scene.mjs): how any host mounts, drives and controls this object ----------
export const API = "CONV", HOOK = "data-conveyor";
export const facts = (spec) => spec.stations.map((s, i) => ({ key: "station." + s.key, value: s.count, base: spec.study.n, label: s.readout, group: s.name, scene: { station: i } }));
export const controls = (spec) => (spec.shoppers || []).length ? [{ kind: "select", label: "Follow…", call: "follow", get: "following", none: -1,
  options: spec.shoppers.map((p, i) => ({ value: i, label: "Follow " + p.label })) }] : [];
export const CENTER = [4, 20, 20];

function tipsFor(spec) {
  const N = spec.study.n;
  const t = { ...(spec.figure.tips || {}) };
  spec.stations.forEach((s, i) => { t["gauge-" + i] = `${s.name} gauge: ${s.count} of ${N} ${s.statement}`; });
  return t;
}

export function build(spec) {
  // layout follows the study (3–5 stations); these shadow the gold-standard defaults above
  const W = worldOf(spec);
  const LAY = W.layout(spec);
  const { PLATE, X0, X1, STATION_X, BUMP, SPAWN, DROP, FALL, LAND_Z, REST, BELT_LEN, PATH_LEN, CENTER, xOf } = LAY;
  const BELT_TOP = LAY.RIDE ?? 34, GAUGE_Y = LAY.GAUGE?.y ?? 64, DIAL_TOP = LAY.GAUGE?.top ?? 17;   // where carriers ride and gauges read
  const N = spec.study.n;
  const stations = spec.stations;
  const P = k.fitProjection(
    LAY.fit || [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [-184, -30, 73],
      ...(xOf("bin-rack") != null ? [[xOf("bin-rack") - 18, 34, 85], [xOf("bin-rack") + 18, -34, 85], [xOf("bin-rack") + 18, 34, 85]] : []),
      ...(xOf("labeler") != null ? [[xOf("labeler"), -24, 78]] : [])],
    WIDTH, HEIGHT, { pad: 14, azimuth: AZ },
  );
  const at = (p) => k.iso(p, P);
  const G = W.geometry(k, spec, P);
  const { parts } = G;
  // one callout per station, landing on the station's prop
  const callouts = stations.map((s, i) => {
    const p = parts.find((q) => q.station === i && !q.key.startsWith("gauge-"));
    return { part: p.key, anchor: p.anchor, num: String(i + 1).padStart(2, "0"), name: s.name, count: s.count, n: N };
  });
  // evidence behind each station: every coded shopper's own words (station 0: how the session arrived)
  const evidence = stations.map((s, i) => {
    const code = i === 0 ? spec.arrival.code : s.code;
    const items = (spec.shoppers || []).filter((p) => p.codes[code] && p.evidence[code]).map((p) => ({ quote: p.evidence[code].quote, source: p.evidence[code].source, who: p.label }));
    const part = callouts[i].part;
    return { part, anchor: parts.find((q) => q.key === part).anchor, items, total: items.length,
      title: s.name + " · " + items.length + " shoppers in their own words",
      note: items.length ? "Coded from all " + N + " transcripts against the report’s definition. The gauge shows the report’s count (" + s.count + " of " + N + ")." : "No coded transcript quotes for this station." };
  });
  // assembly order for the intro and the explode: stand first, then the line in belt order, gauges last
  const ORDER = ["base", "frame", "drive", "hopper", "rack", "eye", "labeler", "gate", "tote", ...stations.map((_, i) => "gauge-" + i)].filter((key) => parts.some((p) => p.key === key));
  const body = [G.body];
  const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: spec.figure.label, body });

  // ---------- live ----------
  const gaugeScreenX = STATION_X.map((x) => at([x, GAUGE_Y, DIAL_TOP])[0] / WIDTH);
  const live = `
const CONV = (() => {
const KIT = { AZIMUTH, ELEVATION, ISO_CSS, SHADES, axisVector, boxCorners, cameraOf, circleRing, coil, corners, cylinder, depthOf, dotGrid, dotsSvg, extrude, faceTextSvg, fadeLineSvg, fadedSvg, figureSvg, fitProjection, groupSvg, haloOf, holdStill, insetPlan, iso, joinPaths, knurl, lineOnTop, lineSvg, onTop, pageHtml, pathOf, planOutline, plateHtml, pointsAt, radialTicks, ring, ringOf, ringSeam, rise, roundedPlan, screenRise, segment, sideArc, sideMatrix, sideRing, sideSeam, sideTicks, slabOf, solidSvg, topMatrix, topTicks, towardViewer, translateAlong, wireSvg };
${CAMERA_SRC}
${PARTS_SRC}
${BLUEPRINT_SRC}
${CUTAWAY_SRC}
${TENSION_SRC}
${PIN_SRC}
${W.src}
const P0 = ${JSON.stringify(P)};
let P = P0;
const SPEC = ${JSON.stringify({ study: { n: N }, stations: stations.map(({ count, name, prop }) => ({ count, name, prop })) })};
const FOLLOW_X = [${STATION_X[0] + 11}, ${X1 - 2}];   // where the replay camera may travel
const PARTS = ${JSON.stringify(parts)};
const ORDER = ${JSON.stringify(ORDER)};
const CALLOUTS = ${JSON.stringify(callouts)};
const EVIDENCE = ${JSON.stringify(evidence)};
const TENSION = ${JSON.stringify(spec.__tension || null)};
const SHEET = ${JSON.stringify(spec.figure.sheetCamera || { az: AZ, zoom: 0.74, focus: [8, 12, 38] })};
const APART = ${JSON.stringify(spec.figure.apartCamera || { az: 58, zoom: 0.78, focus: [10, 24, 44] })};
const SHEET_APART = ${JSON.stringify(spec.figure.sheetApartCamera || { az: 58, zoom: 0.66, focus: [10, 14, 60] })};
const CAMS = ${JSON.stringify(stations.map((s) => s.camera || { az: AZ, zoom: 1.6, focus: [0, 20, 25] }))};
const WIDE = ${JSON.stringify(spec.figure.wideCamera || { az: AZ, zoom: 1, focus: CENTER })};
const TIPS = ${JSON.stringify(tipsFor(spec))};
const ARRIVAL = ${JSON.stringify(spec.arrival || { code: "", on: "", off: "" })};
const SHOPPERS = ${JSON.stringify((spec.shoppers || []).map((p) => ({ label: p.label, codes: p.codes })))};
const STOP_CODES = ${JSON.stringify(stations.map((s) => s.code || null))};
const NAMES = ${JSON.stringify(stations.map((s) => s.name))};
const STATUS = ${JSON.stringify(stations.map((s) => s.readout))};
const N = ${N};
const COUNTS = ${JSON.stringify(stations.map((s) => s.count))};
const STATION_X = ${JSON.stringify(STATION_X)};
const GX = ${JSON.stringify(gaugeScreenX)};
const GAUGE_Y = ${GAUGE_Y}, DIAL_R = ${DIAL_R}, DIAL_TOP = ${DIAL_TOP}, SPAN = ${SPAN}, FROM = ${FROM};
const X0 = ${X0}, X1 = ${X1}, BELT_TOP = ${BELT_TOP}, BUMP = ${JSON.stringify(BUMP)};
const SPAWN = ${SPAWN}, DROP = ${DROP}, FALL = ${FALL}, LAND_Z = ${LAND_Z}, REST = ${REST};
const BELT_LEN = ${BELT_LEN}, PATH_LEN = ${PATH_LEN}, BAGS = ${BAGS}, SPEED = ${SPEED};
const stage = document.querySelector("[data-conveyor]");
const svg = stage.querySelector("svg");
let bags, cleats, needles, pucks, wires;
function bind() {
  bags = [...svg.querySelectorAll("[data-bag]")];
  wires = [...svg.querySelectorAll("[data-wire]")];
  cleats = svg.querySelector("[data-cleats]");
  needles = [...svg.querySelectorAll("[data-needle]")];
  pucks = [...svg.querySelectorAll("[data-puck] .iso-solid")];
  svg.querySelectorAll("[data-tipkey]").forEach((el) => { const t = TIPS[el.dataset.tipkey]; if (t) el.setAttribute("data-tip", t); });
  bags.forEach((b, i) => b.setAttribute("data-tip", (TIPS.bags && TIPS.bags[i]) || TIPS.bag));
}
bind();
const readout = stage.closest(".iso-plate").querySelector("[data-readout]");
const READOUTS = ${JSON.stringify(stations.map((s) => `${s.name} · ${s.count} of ${N} ${s.readout}`))};
const still = matchMedia("(prefers-reduced-motion: reduce)");
const needleAt = (x, v) => lineNeedle(KIT, P, x, v, N);
const cleatsAt = (offset) => lineCleats(KIT, P, X0, X1, BUMP, BELT_TOP, offset);
const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const bump = (x) => !BUMP ? 0 : BUMP.h * (smooth((x - (BUMP.x - 7)) / 7) - smooth((x - (BUMP.x + BUMP.w)) / 7));
function bagPose(s) {
  if (s < BELT_LEN) { const x = SPAWN + s; return [x, BELT_TOP + bump(x), smooth(s / 14)]; }
  if (s < BELT_LEN + FALL) { const u = (s - BELT_LEN) / FALL; return [DROP + s - BELT_LEN, BELT_TOP - (BELT_TOP - LAND_Z) * u * u, 1]; }
  return [DROP + FALL, LAND_Z, 1 - smooth((s - BELT_LEN - FALL) / REST)];
}
function applySel() {
  if (selected >= 0) { pucks[selected].setAttribute("data-lit", ""); needles[selected].setAttribute("data-tone", "lit"); }
  svg.querySelectorAll("[data-part]").forEach((el) => { const p = PARTS_BY[el.dataset.part]; el.toggleAttribute("data-on", !!p && p.station === selected && selected >= 0); });
  if (bp) bp.lit(selected);
  const hero = bags[0].querySelector(".iso-solid");
  if (replay) { hero.setAttribute("data-lit", ""); bags[0].setAttribute("data-tip", SHOPPERS[replay.i].label + " · one shopper’s session, replayed"); } else hero.removeAttribute("data-lit");
}
// ---------- replay: one shopper's bag rides alone; the line stops where they hesitated ----------
let replay = null, others = 1;
const PAUSE = 2.4, HOP = 2.4;
function stopsFor(i) {
  const c = SHOPPERS[i].codes;
  return STOP_CODES.map((code, k) => ({ k, s: (k === 0 ? -138 : STATION_X[k]) - SPAWN, coded: k === 0 ? true : !!c[code] })).filter((st) => st.coded);
}
function startReplay(i) {
  if (i < 0 || !SHOPPERS[i]) { stopReplay(); return; }
  touring = false; clearTimeout(idle);
  if (view.apart) setView({ apart: false });   // arm first: a bag only rides an assembled line
  if (follow !== i) setFollow(i);              // a replay follows that shopper, and keeps following when it ends
  replay = { i, s: 0, pause: 0, stops: stopsFor(i), next: 0, end: 0 };
  applySel();
  document.dispatchEvent(new CustomEvent("replay", { detail: { shopper: i, phase: "start" } }));
  if (still.matches) { replay.s = PATH_LEN - REST; replay.next = replay.stops.length; }
  run();
}
function stopReplay() {
  if (!replay) return;
  replay = null; applySel();
  camera.set(restCam()); camFor = -1;
  document.dispatchEvent(new CustomEvent("replay", { detail: { shopper: -1, phase: "stop" } }));
  hold(); run();
}
function replayStatus(i, k) {
  const c = SHOPPERS[i].codes;
  if (k === 0) return c[ARRIVAL.code] ? ARRIVAL.on.toLowerCase() : ARRIVAL.off.toLowerCase();
  return STATUS[k];
}
function stepReplay(dt) {
  const r = replay;
  if (parts.busy || parts.apart > 0.001) return;
  if (r.end > 0) { r.end -= dt; if (r.end <= 0) startReplay(r.i); return; }
  if (r.pause > 0) { r.pause -= dt; return; }
  const v = SPEED * 2.6 * dt;
  r.s += v; travel += v;
  const st = r.stops[r.next];
  if (st && r.s >= st.s) {
    r.s = st.s; r.next++; r.pause = PAUSE;
    if (st.k !== selected) { if (selected >= 0) { pucks[selected].removeAttribute("data-lit"); needles[selected].setAttribute("data-tone", "hi"); } selected = st.k; applySel(); sweep[st.k] = 0; }
    readout.textContent = SHOPPERS[r.i].label + " · " + NAMES[st.k] + ": " + replayStatus(r.i, st.k);
    document.dispatchEvent(new CustomEvent("replay", { detail: { shopper: r.i, phase: "stop", station: st.k } }));
  }
  if (r.s >= PATH_LEN - REST) { r.s = PATH_LEN - REST; r.end = 2.6; readout.textContent = SHOPPERS[r.i].label + " · back in the order already open"; document.dispatchEvent(new CustomEvent("replay", { detail: { shopper: r.i, phase: "end" } })); }
}
const camera = makeCamera({ svg, KIT, P0, CENTER: ${JSON.stringify(CENTER)}, W: ${WIDTH}, H: ${HEIGHT}, start: WIDE,
  rebuild: (p) => { P = p; svg.innerHTML = lineGeometry(KIT, SPEC, P).body; bind(); applySel(); if (typeof applyFollow === "function") try { applyFollow(); } catch (e) {} draw(); } });
// ---------- parts, intro, exploded view, blueprint ----------
const PARTS_BY = Object.fromEntries(PARTS.map((p) => [p.key, p]));
const parts = makeParts({ svg, KIT, parts: PARTS, order: ORDER });
const plate = stage.closest(".iso-plate");
const view = { blueprint: false, apart: false };
const sheet = () => view.blueprint || view.apart;
// on a narrow card the tags sit on the parts: a little headroom above the tallest prop
const roomy = (c) => (plate.clientWidth < 520 ? { ...c, zoom: c.zoom * 0.96, focus: [c.focus[0], c.focus[1], c.focus[2] + 6] } : c);
const restCam = () => (view.apart && view.blueprint ? roomy(SHEET_APART) : view.apart ? APART : view.blueprint ? roomy(SHEET) : WIDE);
const bp = makeBlueprint({ plate, svg, KIT, items: CALLOUTS, offset: parts.offset,
  onPick: (i, how) => { hold(); select(i); if (how === "click") document.dispatchEvent(new CustomEvent("station", { detail: { index: i, from: "figure" } })); } });
let introLeft = 0, phase = "";
// ---------- tension: the stall. One bag rides to the target station, the eye passes it (beam lights), and the bag
// stops anyway, then backs off the line; the needle re-reads its count while the chip prints the stated number.
const chip = TENSION ? makeTensionChip(plate, TENSION) : null;
let ten = null, tensionPlayed = false, tensionDue = 0;
const T_RIDE = 1.6, T_HOLD = 2.4, T_BACK = 1.2;
function playTension(force) {
  if (!TENSION || ten || still.matches || (!force && tensionPlayed)) return;
  tensionPlayed = true; tensionDue = 0;
  if (replay) stopReplay();
  if (view.apart) setView({ apart: false });
  const i = TENSION.index;
  if (i !== selected) select(i, true);
  // its own shot: the station right of centre (the chip sits on the left), low on the belt
  if (!sheet()) { camera.set(cut.frame(P, CAMS[i].az, 1.8, ${WIDTH}, -0.16, [STATION_X[i], 0, BELT_TOP], 6)); camFor = i; }
  ten = { t: -0.5, x: STATION_X[i] };
  chip.show(0.5 + T_RIDE + T_HOLD + T_BACK + 2.5);
  run();
}
function tensionPose() {
  const t = ten.t, x1 = ten.x, x0 = x1 - 70;
  if (t < 0) return null;
  if (t < T_RIDE) { const u = smooth(t / T_RIDE); return [x0 + (x1 - x0) * u, 0, smooth(t / 0.3)]; }
  if (t < T_RIDE + T_HOLD) { const u = (t - T_RIDE) / T_HOLD; return [x1, 1.6 * Math.abs(Math.sin(u * Math.PI * 3)) * (1 - u), 1]; }
  const u = Math.min(1, (t - T_RIDE - T_HOLD) / T_BACK);
  return [x1 - 30 * smooth(u), 0, 1 - smooth(u)];
}
function stepTension(dt) {
  if (tensionDue > 0) { tensionDue -= dt; if (tensionDue <= 0) playTension(); }
  if (chip) chip.step(dt);
  if (!ten) return;
  const before = ten.t;
  ten.t += dt;
  if (before < T_RIDE && ten.t >= T_RIDE) sweep[TENSION.index] = 0;      // the needle re-reads the count as the bag stops
  const beam = svg.querySelector('[data-part="eye"] .eye-beam');
  if (beam) beam.setAttribute("data-tone", ten.t > T_RIDE && ten.t < T_RIDE + T_HOLD ? "lit" : "lo");
  if (ten.t > T_RIDE + T_HOLD + T_BACK + 0.3) { ten = null; if (beam) beam.setAttribute("data-tone", "lo"); }
}
// ---------- follow one shopper: their bag carries a pin, the stations where their own words show a hesitation
// are outlined, and a replay keeps following them. Station 0 is how they arrived (spec.arrival), outlined when its code is set.
let follow = -1, bag0 = null;
const fpin = makePin({ plate, svg, KIT });
function followStops(i) { const c = SHOPPERS[i].codes; return STOP_CODES.map((code, k) => (k === 0 ? !!c[ARRIVAL.code] : !!c[code])); }
function applyFollow() {
  const on = follow >= 0 ? followStops(follow) : [];
  pucks.forEach((p, k) => p.toggleAttribute("data-follow", !!on[k]));
  if (bags[0]) bags[0].querySelector(".iso-solid").toggleAttribute("data-follow", follow >= 0);
  if (follow < 0) { fpin.hide(); return; }
  const hes = on.map((v, k) => (k > 0 && v ? NAMES[k] : null)).filter(Boolean);
  fpin.set(SHOPPERS[follow].label, hes.length ? "stops at " + hes.join(", ") : "no stops coded");
}
function setFollow(i, quiet) {
  follow = i >= 0 && i < SHOPPERS.length ? i : -1;
  applyFollow(); run();
  if (!quiet) document.dispatchEvent(new CustomEvent("follow", { detail: { index: follow, label: follow >= 0 ? SHOPPERS[follow].label : null } }));
}
// ---------- cutaway: click a station (or Enter) to open it and see the shoppers' words inside ----------
const cut = makeCutaway({ plate, svg, KIT, offset: parts.offset, onClose: () => { if (!scripted && !replay) camera.set(sheet() || selected < 0 ? restCam() : CAMS[selected]); run(); } });
function cutaway(i) {
  if (i == null || i < 0) { cut.close(); return; }
  if (replay) stopReplay();
  if (i !== selected) select(i, false);
  cut.open(EVIDENCE[i]);
  if (!sheet()) { camera.set(cut.frame(P, CAMS[i].az, 1.5, ${WIDTH})); camFor = i; }
  run();
}
stage.addEventListener("click", () => { if (scripted || replay) return; if (cut.isOpen) cut.close(); else if (selected >= 0) { hold(); cutaway(selected); } });
function setView(v, quiet) {
  const was = { ...view };
  Object.assign(view, v);
  if (view.apart && replay) stopReplay();
  bp.set(view.blueprint);
  plate.toggleAttribute("data-apart", view.apart);
  if (view.apart !== was.apart) parts.set(view.apart);
  if (!replay) { camera.set(restCam()); camFor = -1; }   // back to the wide shot; hover or the tour zooms in again
  if (!quiet) document.dispatchEvent(new CustomEvent("view", { detail: { ...view } }));
  run();
}
// ---------- scene: the one state a script, a video frame, a slide or a deep link can ask for ----------
// { station: index | -1, camera: {az,zoom,focus} | null (station camera, or the rest camera), wide: bool,
//   view: { blueprint, apart }, shopper: index | -1 }. While scripted, hover and the tour stand down.
let scripted = false;
function scene(sc) {
  scripted = true; touring = false; clearTimeout(idle);
  const v = sc.view || { blueprint: false, apart: false };
  if (!!v.blueprint !== view.blueprint || !!v.apart !== view.apart) setView({ blueprint: !!v.blueprint, apart: !!v.apart });
  if (sc.follow !== undefined && sc.follow !== follow) setFollow(sc.follow);
  if (sc.shopper != null && sc.shopper >= 0) { if (!replay || replay.i !== sc.shopper) startReplay(sc.shopper); return; }
  if (replay) stopReplay();
  if (sc.station != null && sc.station >= 0) select(sc.station, false);
  if (sc.cutaway && sc.station >= 0) cutaway(sc.station); else cut.close();
  if (sc.tension) { tensionPlayed = false; playTension(true); }
  const cam = sc.camera || (sc.wide || sc.station == null || sc.station < 0 || sheet() ? restCam() : CAMS[sc.station]);
  camera.set(cam); camFor = sc.wide ? -1 : sc.station;
  run();
}
function unscript() { if (!scripted) return; scripted = false; cut.close(); hold(); }
function say() {
  // readout phase from the parts themselves, not from the target
  let p = "";
  if (introLeft > 0) p = "assembling · " + ORDER.length + " parts";
  else if (parts.busy) p = view.apart ? "taking apart" : "closing up";
  else if (view.apart) p = "apart · " + parts.count + " assemblies";
  if (p === phase) return;
  phase = p;
  if (p) readout.textContent = p;
  else if (!replay && selected >= 0) readout.textContent = READOUTS[selected];
}
let camFor = -1, travel = 0, selected = -1, sweep = [...COUNTS], frame = 0, last = 0, visible = false, touring = true, tourClock = 0, idle = 0, bagVis = 1;
function select(i, quiet) {
  if (i === selected) return;
  if (selected >= 0) { pucks[selected].removeAttribute("data-lit"); needles[selected].setAttribute("data-tone", "hi"); }
  selected = i;
  pucks[i].setAttribute("data-lit", "");
  needles[i].setAttribute("data-tone", "lit");
  sweep[i] = still.matches ? COUNTS[i] : 0;
  if (!phase) readout.textContent = READOUTS[i];
  if (TENSION && i === TENSION.index && !tensionPlayed && !scripted && !view.apart && !ten) tensionDue = 0.9;   // once per visit, after the camera arrives
  if (sheet()) { camera.set(restCam()); camFor = -1; } else { camera.set(CAMS[i]); camFor = i; }
  applySel();
  stage.setAttribute("aria-valuenow", String(i + 1));
  stage.setAttribute("aria-valuetext", READOUTS[i]);
  if (!quiet) document.dispatchEvent(new CustomEvent("station", { detail: { index: i, from: "figure" } }));
  run();
}
function draw() {
  parts.apply(P);
  wires.forEach((w, i) => { const f = Math.max(0, 1 - parts.share("gauge-" + i) * 4) * parts.vis("gauge-" + i); if (f < 0.999) w.setAttribute("opacity", f.toFixed(3)); else w.removeAttribute("opacity"); });
  for (let i = 0; i < BAGS; i++) {
    if (ten && i === 0) {
      bag0 = null;   // the tension borrows bag 0; it is nobody in particular
      const pose = tensionPose();
      if (pose) { bags[0].setAttribute("transform", translateAlong(P, [pose[0], 0, BELT_TOP + pose[1]])); bags[0].setAttribute("opacity", pose[2].toFixed(3)); }
      else bags[0].setAttribute("opacity", "0");
      continue;
    }
    if (replay && i === 0) {
      const [x, z] = bagPose(replay.s);
      const hop = replay.pause > 0 ? HOP * Math.abs(Math.sin(Math.PI * 2 * (1 - replay.pause / PAUSE))) : 0;
      bag0 = [x, 0, z + hop + 8];
      bags[0].setAttribute("transform", translateAlong(P, [x, 0, z + hop]));
      bags[0].setAttribute("opacity", "1");
      continue;
    }
    const s = (travel + i * (PATH_LEN / BAGS)) % PATH_LEN;
    const [x, z, o] = bagPose(s);
    // the pin lets go while the bag is fading or still inside the hopper's throat (a pin never lands on something hidden)
    if (i === 0) bag0 = o * others * bagVis > 0.5 && x > STATION_X[0] + 24 ? [x, 0, z + 8] : null;
    bags[i].setAttribute("transform", translateAlong(P, [x, 0, z]));
    bags[i].setAttribute("opacity", (o * others * bagVis).toFixed(3));
  }
  cleats.setAttribute("d", cleatsAt(((travel % 12) + 12) % 12));
  needles.forEach((n, i) => n.setAttribute("d", needleAt(STATION_X[i], sweep[i])));
  bp.update(P, !replay);
  cut.draw(P);
  fpin.update(P, bag0, 1 / 60, still.matches);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  others += ((replay || ten ? 0 : 1) - others) * (1 - Math.exp(-dt / 0.3));
  stepTension(dt);
  parts.step(dt, still.matches);
  cut.step(dt, still.matches);
  if (introLeft > 0) { introLeft -= dt; if (introLeft <= 0 && parts.busy) introLeft = 0.05; }
  bagVis += ((parts.busy || parts.apart > 0.01 || introLeft > 0 ? 0 : 1) - bagVis) * (1 - Math.exp(-dt / 0.3));
  say();
  if (replay) {
    if (!still.matches) stepReplay(dt);
    const [bx] = bagPose(replay.s);
    camera.set({ az: 54 + ((bx - SPAWN) / BELT_LEN) * 16, zoom: 1.75, focus: [Math.max(FOLLOW_X[0], Math.min(FOLLOW_X[1], bx + 10)), 30, 30] });
  } else if (!still.matches) travel += SPEED * dt;
  if (!replay && touring && !still.matches && introLeft <= 0 && !cut.isOpen && !ten && tensionDue <= 0) { tourClock += dt; if (tourClock >= 0) { const want = Math.floor(tourClock / 4.2) % COUNTS.length; if (want !== selected) select(want, false); else if (camFor !== want && !sheet()) { camera.set(CAMS[want]); camFor = want; } } }
  camera.step(dt, still.matches);
  // a needle reads only once its gauge is home
  for (let i = 0; i < sweep.length; i++) { const home = parts.share("gauge-" + i) < 0.02 && parts.vis("gauge-" + i) > 0.9; sweep[i] += ((home ? COUNTS[i] : 0) - sweep[i]) * (1 - Math.exp(-dt / 0.35)); }
  draw();
  frame = visible && !still.matches ? requestAnimationFrame(tick) : 0;
}
function run() { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } if (still.matches) { sweep = [...COUNTS]; parts.step(0, true); bagVis = parts.apart > 0.01 ? 0 : 1; say(); camera.step(0, true); draw(); } }
function hold() { touring = false; clearTimeout(idle); idle = setTimeout(() => { touring = true; tourClock = selected * 4.2; run(); }, 6000); }
new IntersectionObserver((e) => {
  visible = e[e.length - 1].isIntersecting;
  // the first time the reader sees it, the machine builds itself, then the tour starts
  if (visible) run();
}, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => {
  if (replay || scripted) return;
  const box = svg.getBoundingClientRect();
  const f = (event.clientX - box.left) / box.width;
  const v = camera.view;
  const gx = sheet() ? STATION_X.map((x, i) => { const o = parts.offset("gauge-" + i); return (KIT.iso([x + o[0], GAUGE_Y + o[1], DIAL_TOP + o[2]], P)[0] - v[0]) / v[2]; }) : GX;
  let best = 0; gx.forEach((g, i) => { if (Math.abs(g - f) < Math.abs(gx[best] - f)) best = i; });
  hold(); select(best);
});
stage.addEventListener("keydown", (event) => {
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") to = Math.min(COUNTS.length - 1, selected + 1);
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") to = Math.max(0, selected - 1);
  if (event.key === "Escape" && replay) { stopReplay(); return; }
  if (event.key === "b" || event.key === "B") { setView({ blueprint: !view.blueprint }); return; }
  if (event.key === "a" || event.key === "A") { setView({ apart: !view.apart }); return; }
  if (event.key === "Enter") { event.preventDefault(); if (cut.isOpen) cut.close(); else cutaway(selected); return; }
  if (replay) return;
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = COUNTS.length - 1;
  if (to === null) return;
  event.preventDefault(); hold(); select(to);
});
stage.addEventListener("pointerleave", () => { if (!replay && !scripted) { camera.set(restCam()); camFor = -1; } });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && replay) stopReplay(); if (e.key === "Escape" && cut.isOpen) cut.close(); });
document.addEventListener("station", (e) => { if (e.detail.from !== "figure") { if (replay) stopReplay(); hold(); select(e.detail.index, true); } });
select(0, true);
camera.set(WIDE); camFor = -1;
tourClock = -2.5;   // open on the wide shot, then start the tour
// the machine builds itself the first time it runs (the loop only runs while it is on screen)
if (!still.matches) { introLeft = parts.intro(); bagVis = 0; sweep = sweep.map(() => 0); tourClock = -2.2; }
camera.step(0, true);
draw();
window.CONV = { select, camera, replay: startReplay, stopReplay, get replaying() { return replay; }, setView, get view() { return { ...view }; }, parts, scene, unscript, cutaway, tension: () => playTension(true), follow: setFollow, get following() { return follow; } };
return window.CONV;   // one object: page scripts that say CONV get the same API as window.CONV
})();
`;
  return { svg, live, P };
}
