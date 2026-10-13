// Workbench — an anatomy object template for comparing 2–4 segments side by side.
// Data contract: spec.benches[] (2–4), each { name, users (of study.toolBase), appeal|null, trust|null,
//   reasons: [3 × { label, pct }] }. Benches are identical by design (neutral comparison);
//   a null gauge is shown capped ("not reported"), never estimated.

import { join } from "node:path";
const k = await import(new URL("../kit/iso-kit.mjs", import.meta.url).href);

// layer stack for any page or stage that hosts the workbench: back SVG · liquid canvas · front glass SVG
export const STAGE_CSS = `
.iso-stage[data-workbench] { position: relative; }
.iso-stage[data-workbench] .wb-gl, .iso-stage[data-workbench] .wb-front { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.iso-stage[data-workbench] .wb-front { overflow: hidden; }
.iso-stage[data-workbench][data-gl] [data-fill] { opacity: var(--wb-fallback, 0); }
`;
export const WIDTH = 680;
export const HEIGHT = 340;
const AZ = 60;

const BENCH_W = 84, BENCH_D = 48, TOP_Z = 30, TOP_H = 4;
const TOP = TOP_Z + TOP_H;
const DIAL_R = 8.5, DIAL_Z = 36, DIAL_TOP = 41;
const SPAN = Math.PI * 1.5, FROM = -Math.PI * 0.75;
const TUBE_R = 3, TUBE_Z = 39, TUBE_H = 26;
const dialAt = (bx, j) => [bx - 26 + j * 20, 12];

import { readFileSync } from "node:fs";
export const GEOM_SRC = readFileSync(new URL("./workbench.geom.js", import.meta.url), "utf8");
const CAMERA_SRC = readFileSync(new URL("./camera.js", import.meta.url), "utf8");
const PARTS_SRC = readFileSync(new URL("./parts.js", import.meta.url), "utf8");
const BLUEPRINT_SRC = readFileSync(new URL("./blueprint.js", import.meta.url), "utf8");
const CUTAWAY_SRC = readFileSync(new URL("./cutaway.js", import.meta.url), "utf8");
const TENSION_SRC = readFileSync(new URL("./tension.js", import.meta.url), "utf8");
export const TENSION_EVENTS = ["pour"];
const workbenchGeometry = new Function("k", "spec", "P", GEOM_SRC + "\nreturn workbenchGeometry(k, spec, P);");
export const CENTER = [0, 4, 30];

function tipsFor(spec) {
  const base = spec.study.toolBase, t = {};
  spec.benches.forEach((b, i) => {
    t["counter-" + i] = `${b.name} counter: ${b.users} of ${base} used it in the past month`;
    t["dial-" + i + "-0"] = b.appeal == null ? `${b.name} appeal dial, capped: not reported as a value in the analysis` : `${b.name} appeal: ${b.appeal}% of its ${b.users} users find it somewhat or very appealing`;
    t["dial-" + i + "-1"] = b.trust == null ? `${b.name} trust dial, capped: not reported as a value in the analysis` : `${b.name} trust: ${b.trust}% of its ${b.users} users trust it somewhat or completely`;
    b.reasons.forEach((r, j) => { t["tube-" + i + "-" + j] = `${r.label}: ${r.pct}% of ${b.name}’s ${b.users} users${j === 0 ? " · same tube on every bench" : ""}`; });
  });
  return t;
}

export function build(spec) {
  const benches = spec.benches;
  const SP = 122;
  const BX = benches.map((_, i) => (i - (benches.length - 1) / 2) * SP);
  const PLATE = { x: BX[0] - 62, y: -42, w: BX[BX.length - 1] - BX[0] + 124, d: 92, r: 8 };
  const P = k.fitProjection(
    [...k.boxCorners(PLATE, -15, 0), [BX[0] - 42, -26, 76], [BX[BX.length - 1] + 42, -26, 76]],
    WIDTH, HEIGHT, { pad: 14, azimuth: AZ },
  );
  const at = (p) => k.iso(p, P);
  const G = workbenchGeometry(k, spec, P);
  const { needleAt, parts } = G;
  const callouts = benches.map((b, i) => { const p = parts.find((q) => q.key === "counter-" + i); return { part: p.key, anchor: p.anchor, num: String(i + 1).padStart(2, "0"), name: b.name, count: b.users, n: spec.study.toolBase }; });
  // evidence on each bench's clipboard: the verbatims the spec carries for that assistant
  const evidence = benches.map((b, i) => {
    const p = parts.find((q) => q.key === "clip-" + i);
    const items = [b.quote].filter(Boolean).map((q) => ({ quote: q.text, lead: q.lead || "", source: q.source, who: "Participant" }));
    return { part: p.key, anchor: p.anchor, items, total: items.length, title: b.name + " · " + items.length + (items.length === 1 ? " verbatim" : " verbatims") + " in this spec",
      note: "The quote the report highlights for " + b.name + ". Its " + b.users + " users are the base for its dials and tubes." };
  });
  const ORDER = ["base", ...benches.map((_, i) => "bench-" + i), ...benches.flatMap((_, i) => ["peg-" + i, "counter-" + i, "dials-" + i, "clip-" + i])];
  const body = [G.body];
  const frontSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg wb-front" viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true">${G.front}</svg>`;
  const TUBES = benches.flatMap((b, i) => b.reasons.map((r, j) => ({ x: BX[i] + 7 + 11 * j, y: -15, pct: r.pct, bench: i, j })));
  const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: spec.figure.label, body }) + `<canvas class="wb-gl" aria-hidden="true"></canvas>` + frontSvg;

  const benchScreenX = BX.map((x) => at([x, 0, TOP])[0] / WIDTH);
  const live = `
const WB = (() => {
const KIT = { AZIMUTH, ELEVATION, ISO_CSS, SHADES, axisVector, boxCorners, cameraOf, circleRing, coil, corners, cylinder, depthOf, dotGrid, dotsSvg, extrude, faceTextSvg, fadeLineSvg, fadedSvg, figureSvg, fitProjection, groupSvg, haloOf, holdStill, insetPlan, iso, joinPaths, knurl, lineOnTop, lineSvg, onTop, pageHtml, pathOf, planOutline, plateHtml, pointsAt, radialTicks, ring, ringOf, ringSeam, rise, roundedPlan, screenRise, segment, sideArc, sideMatrix, sideRing, sideSeam, sideTicks, slabOf, solidSvg, topMatrix, topTicks, towardViewer, translateAlong, wireSvg };
${CAMERA_SRC}
${PARTS_SRC}
${BLUEPRINT_SRC}
${CUTAWAY_SRC}
${TENSION_SRC}
${GEOM_SRC}
const P0 = ${JSON.stringify(P)};
let P = P0;
const SPEC = ${JSON.stringify({ benches: benches.map(({ name, users, appeal, trust, reasons }) => ({ name, users, appeal, trust, reasons })) })};
const TENSION = ${JSON.stringify(spec.__tension || null)};
const WAVES = ${JSON.stringify(spec.waves ? spec.waves.list : [])};
const PARTS = ${JSON.stringify(parts)}, ORDER = ${JSON.stringify(ORDER)}, CALLOUTS = ${JSON.stringify(callouts)}, EVIDENCE = ${JSON.stringify(evidence)};
const SHEET = ${JSON.stringify(spec.figure.sheetCamera || { az: AZ, zoom: 0.8, focus: [0, 0, 44] })};
const APART = ${JSON.stringify(spec.figure.apartCamera || { az: 58, zoom: 0.84, focus: [0, 4, 38] })};
const SHEET_APART = ${JSON.stringify(spec.figure.sheetApartCamera || { az: 58, zoom: 0.74, focus: [0, 0, 50] })};
const CAMS = ${JSON.stringify(benches.map((b) => b.camera || { az: AZ, zoom: 1.9, focus: [0, -2, 46] }))};
const WIDE = ${JSON.stringify(spec.figure.wideCamera || { az: AZ, zoom: 1, focus: CENTER })};
const TIPS = ${JSON.stringify(tipsFor(spec))};
function applyTips() {
  svg.querySelectorAll("[data-tipkey]").forEach((el) => { const t = TIPS[el.dataset.tipkey]; if (t) el.setAttribute("data-tip", t); });
  svg.querySelectorAll("[data-counter]").forEach((el) => el.setAttribute("data-tip", TIPS["counter-" + el.dataset.counter]));
}
const BX = ${JSON.stringify(BX)}, GX = ${JSON.stringify(benchScreenX)};
const B = ${JSON.stringify(benches.map((b) => ({ name: b.name, users: b.users, appeal: b.appeal, trust: b.trust })))};
const BASE = ${spec.study.toolBase};
const DIAL_R = ${DIAL_R}, DIAL_TOP = ${DIAL_TOP}, SPAN = ${SPAN}, FROM = ${FROM};
const root = document.querySelector("[data-workbench]");
const FRONT = root.querySelector(".wb-front");
const svg = root.querySelector("svg");
const readout = root.closest(".iso-plate").querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const needleAt = ${needleAt.toString().replace(/k\.lineOnTop/g, "lineOnTop")};
const camera = makeCamera({ svg, KIT, P0, CENTER: ${JSON.stringify(CENTER)}, W: ${WIDTH}, H: ${HEIGHT}, start: WIDE,
  views: [FRONT],
  rebuild: (p) => { P = p; const g = workbenchGeometry(KIT, SPEC, P); svg.innerHTML = g.body; FRONT.innerHTML = g.front; applyTips(); if (sel >= 0) svg.querySelector('[data-counter="' + sel + '"] .iso-solid').setAttribute("data-lit", ""); applyOn(); parts.apply(P); if (typeof applyValues === "function") try { applyValues(); } catch (e) {} } });
// ---------- parts, intro, exploded view, blueprint ----------
const PARTS_BY = Object.fromEntries(PARTS.map((p) => [p.key, p]));
const parts = makeParts({ svg, KIT, parts: PARTS, order: ORDER });
const plate = root.closest(".iso-plate");
const view = { blueprint: false, apart: false, waves: false };
const sheet = () => view.blueprint || view.apart;
const roomy = (c) => (plate.clientWidth < 520 ? { ...c, zoom: c.zoom * 0.96, focus: [c.focus[0], c.focus[1], c.focus[2] + 6] } : c);
const restCam = () => (view.apart && view.blueprint ? roomy(SHEET_APART) : view.apart ? APART : view.blueprint ? roomy(SHEET) : WIDE);
const bp = makeBlueprint({ plate, svg, KIT, items: CALLOUTS, offset: parts.offset,
  onPick: (i, how) => { hold(); select(i, how !== "click"); } });
let introLeft = 0, phase = "";
const wkey = document.createElement("p");
wkey.className = "wave-key"; wkey.hidden = true; plate.appendChild(wkey);
function waveKey() {
  wkey.hidden = !view.waves || CUR < 0;
  if (wkey.hidden) return;
  const c = WAVES[CUR], p = PREV >= 0 ? WAVES[PREV] : null;
  wkey.innerHTML = '<span class="wave-key__cur">Solid: ' + c.label + " (n " + c.n + ")</span>" + (p ? '<span class="wave-key__prev">Dashed: ' + p.label + " (n " + p.n + ")</span>" : "") + '<span class="wave-key__note">Tubes: all interviews, not by wave</span>';
}
// ---------- tension: the pour. The shared first tube on every bench drains and refills together, seen wide, so the
// smallest bench's tube visibly finishes highest; the chip prints the stated numbers.
let chip = null, ten = null, tensionPlayed = false, tensionDue = 0;
function playTension(force) {
  if (!TENSION || ten || still.matches || (!force && tensionPlayed)) return;
  tensionPlayed = true; tensionDue = 0;
  if (!chip) chip = makeTensionChip(plate, TENSION, "bottom");   // the benches fill the top of a wide shot
  if (sel !== TENSION.index) select(TENSION.index, true);
  TUBES.forEach((t, j) => { if (t.j === 0) want[j] = 0; });
  camera.set(sheet() ? restCam() : { ...WIDE, focus: [WIDE.focus[0], WIDE.focus[1], WIDE.focus[2] - 12] }); camFor = -1;   // every bench in view
  ten = { t: 0 }; chip.show(6.5); run();
}
function stepTension(dt) {
  if (tensionDue > 0) { tensionDue -= dt; if (tensionDue <= 0) playTension(); }
  if (chip) chip.step(dt);
  if (!ten) return false;
  ten.t += dt;
  if (ten.t > 4.5) ten = null;
  return true;
}
const cut = makeCutaway({ plate, svg, KIT, offset: parts.offset, onClose: () => { if (!scripted) camera.set(sheet() || sel < 0 ? restCam() : CAMS[sel]); run(); } });
function cutaway(i) {
  if (i == null || i < 0) { cut.close(); return; }
  if (i !== sel) select(i, false);
  cut.open(EVIDENCE[i]);
  if (!sheet()) { camera.set(cut.frame(P, CAMS[i].az, 1.8, ${WIDTH}, 0.2)); camFor = i; }
  run();
}
root.addEventListener("click", () => { if (scripted) return; if (cut.isOpen) cut.close(); else if (sel >= 0) { hold(); cutaway(sel); } });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && cut.isOpen) cut.close(); });
function applyOn() {
  svg.querySelectorAll("[data-part]").forEach((el) => { const p = PARTS_BY[el.dataset.part]; el.toggleAttribute("data-on", !!p && sel >= 0 && p.station === sel); });
  bp.lit(sel);
}
function setView(v, quiet) {
  const was = { ...view };
  Object.assign(view, v);
  bp.set(view.blueprint);
  plate.toggleAttribute("data-apart", view.apart);
  if (view.waves !== was.waves) { plate.toggleAttribute("data-waves", view.waves); applyValues(); waveKey(); if (sel >= 0 && !phase) readout.textContent = readoutFor(sel); }
  if (view.apart !== was.apart) parts.set(view.apart);
  camera.set(restCam()); camFor = -1;
  if (!quiet) document.dispatchEvent(new CustomEvent("view", { detail: { ...view } }));
  run();
}
// ---------- scene (scripts, video, slides): { bench, view, camera, wide } ----------
let scripted = false;
function scene(sc) {
  scripted = true; touring = false; clearTimeout(idle);
  const v = sc.view || { blueprint: false, apart: false };
  if (!!v.blueprint !== view.blueprint || !!v.apart !== view.apart || !!v.waves !== view.waves) setView({ blueprint: !!v.blueprint, apart: !!v.apart, waves: !!v.waves && WAVES.length > 1 });
  if (sc.bench != null && sc.bench >= 0) select(sc.bench, false);
  if (sc.cutaway && sc.bench >= 0) { cutaway(sc.bench); return; } else cut.close();
  if (sc.tension) { tensionPlayed = false; tensionDue = 1.2; }
  camera.set(sc.camera || (sc.wide || sc.bench == null || sc.bench < 0 || sheet() ? restCam() : CAMS[sc.bench]));
  camFor = sc.wide ? -1 : sc.bench;
  run();
}
function unscript() { if (!scripted) return; scripted = false; cut.close(); hold(); }
function say() {
  let p = "";
  if (introLeft > 0) p = "assembling · " + ORDER.length + " parts";
  else if (parts.busy) p = view.apart ? "taking apart" : "closing up";
  else if (view.apart) p = "apart · " + parts.count + " assemblies";
  if (p === phase) return;
  phase = p;
  if (p) readout.textContent = p;
  else if (sel >= 0) readout.textContent = readoutFor(sel);
}
// layers that are not SVG parts (the liquid canvas and the glass) arrive with their benches
function layersVis() { const v = Math.min(...B.map((_, i) => parts.vis("bench-" + i))); const o = v < 0.999 ? v.toFixed(3) : ""; FRONT.style.opacity = o; glCanvas.style.opacity = o; }
let camFor = -1, camBusy = false;
// ---------- liquid shader: world-space columns in the same camera, glass in the front SVG ----------
const TUBES = ${JSON.stringify(TUBES)}, NT = TUBES.length;
const TUBE_Z = ${TUBE_Z}, TUBE_H = ${TUBE_H}, LIQ_R = ${TUBE_R - 0.5};
const FRAG = \`
#define NT \${NT}
uniform float uAx[NT];
uniform float uAy[NT];
uniform float uTop[NT];
uniform float uTilt[NT];
uniform float uLight;
uniform float uOn;
const float R=\${LIQ_R.toFixed(2)};
const float Z0=\${TUBE_Z.toFixed(2)};
// kit-style toon shading: a flat top plus four crisp facing bands, brand sequential blues
const vec3 L_TOP=vec3(.839,.867,1.);   // dataviz sequential-100
const vec3 L_B0=vec3(.733,.776,1.);
const vec3 L_B1=vec3(.639,.706,1.);    // sequential-200
const vec3 L_B2=vec3(.522,.616,1.);
const vec3 L_B3=vec3(.400,.502,1.);    // sequential-300
const vec3 D_TOP=vec3(.27,.36,.86);
const vec3 D_B0=vec3(.19,.27,.74);
const vec3 D_B1=vec3(.15,.22,.63);
const vec3 D_B2=vec3(.12,.18,.53);
const vec3 D_B3=vec3(.09,.14,.43);
vec4 over(vec4 a,vec4 b){return a+b*(1.-a.a);}
void main(){
  vec2 vb=viewOf(gl_FragCoord.xy);
  vec3 V=towardViewer();
  vec3 p0=rayOf(vb);
  float px=pixelOf();
  float aa=.5*px;
  vec2 d=V.xy;float dl=length(d);vec2 dn=d/dl;vec2 perp=vec2(-dn.y,dn.x);
  // which side the kit's light comes from, in screen terms
  float lightSide=sign(dot(normalize(lightDir().xy),perp)+1e-4);
  float zaa=aa/uCam.w;
  vec4 acc=vec4(0.);
  for(int i=0;i<NT;i++){
    vec2 o=p0.xy-vec2(uAx[i],uAy[i]);
    float s=dot(o,perp);
    float as=abs(s);
    if(as>R+aa*3.) continue;                         // coverage is exactly 0 beyond R+aa
    float hc=sqrt(max(R*R-s*s,0.));
    float al=dot(o,dn);
    float tf=(hc-al)/dl;
    float zf=p0.z+tf*V.z;
    float top=uTop[i]+uTilt[i]*(s/R);                // tilted surface during a slosh
    if(top<=Z0+.02) continue;
    // coverage: inside the silhouette, above the front bottom arc, below the far rim of the top ellipse
    float cov=(1.-smoothstep(R-aa,R+aa,as))*smoothstep(Z0-zaa,Z0+zaa,zf);
    float tb=(-hc-al)/dl, zb=p0.z+tb*V.z;
    cov*=smoothstep(-zaa,zaa,top-zb);
    if(cov<=0.) continue;
    // top surface vs wall: crisp boundary along the front rim of the surface
    float onTop=smoothstep(-zaa,zaa,zf-top);
    // facing bands across the wall: screen position across the cylinder = facing
    float f=lightSide*s/R;                           // -1 shadow side .. +1 lit side
    float b1=smoothstep(.55-aa/R,.55+aa/R,f);
    float b2=smoothstep(.0-aa/R,.0+aa/R,f);
    float b3=smoothstep(-.55-aa/R,-.55+aa/R,f);
    vec3 lw=mix(mix(mix(L_B3,L_B2,b3),L_B1,b2),L_B0,b1);
    vec3 dw=mix(mix(mix(D_B3,D_B2,b3),D_B1,b2),D_B0,b1);
    vec3 col=mix(mix(dw,D_TOP,onTop),mix(lw,L_TOP,onTop),uLight);
    acc=over(vec4(col,1.)*cov,acc);
  }
  gl_FragColor=acc*uOn;
}\`;
const isLight = () => document.documentElement.dataset.theme === "light" || (document.documentElement.dataset.theme !== "dark" && !matchMedia("(prefers-color-scheme: dark)").matches);
const glCanvas = root.querySelector(".wb-gl");
const liquid = typeof glLayer === "function" ? glLayer({ canvas: glCanvas, fragment: FRAG, view: [${WIDTH}, ${HEIGHT}], camera: glCamera(P0),
  uniforms: ["uTop", "uTilt", "uOn", "uOrigin", "uK", "uCam"], maxRatio: 2.5,
  fixed: { uAx: TUBES.map((t) => t.x), uAy: TUBES.map((t) => t.y), uLight: isLight() ? 1 : 0 } }) : null;
if (liquid) root.setAttribute("data-gl", "");
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (liquid) { liquid.set({ uLight: isLight() ? 1 : 0 }); drawLiquid(); } });
// fill envelopes: each tube's level (fraction of its value) and a slosh that rings down after a pour
const level = TUBES.map(() => ({ x: 1, v: 0 })), want = TUBES.map(() => 1), slosh = TUBES.map(() => 0);
let liquidOn = { x: 0, v: 0 }, glClock = 0;
function pour(bench) {
  TUBES.forEach((t, j) => { if (t.bench === bench && !still.matches) want[j] = 0; });
}
function glCam() {
  const v = camera.view, s = ${WIDTH} / v[2];
  const c = glCamera({ ...P, origin: [(P.origin[0] - v[0]) * s, (P.origin[1] - v[1]) * s], scale: P.scale * s });
  return { uOrigin: c.origin, uK: c.k, uCam: c.cam };
}
function stepLiquid(dt) {
  if (!liquid) return false;
  let busy = settle(liquidOn, 1, dt, 0.45, still.matches);
  TUBES.forEach((t, j) => {
    if (want[j] === 0 && level[j].x < 0.03 && introLeft <= 0) want[j] = 1;   // drained (and the bench is built): start the pour
    const before = level[j].x;
    if (settle(level[j], want[j], dt, want[j] === 0 ? 0.09 : 0.32, still.matches)) busy = true;
    if (want[j] === 1 && before < 0.92 && level[j].x >= 0.92) slosh[j] = 1;   // ring as it reaches its mark
    slosh[j] *= Math.exp(-dt / 0.55);
    if (slosh[j] > 0.002) busy = true; else slosh[j] = 0;
  });
  glCanvas.parentElement.style.setProperty("--wb-fallback", String(Math.max(0, (1 - liquidOn.x) / (1 - liquidOn.x * 0.55))));
  return busy;
}
const tiltOf = (j) => slosh[j] * 0.6 * Math.sin(glClock * 7.2 + j * 1.9);
const topOf = (j) => TUBE_Z + Math.max(0, level[j].x) * (TUBES[j].pct / 100) * TUBE_H;
// crisp SVG outlines for the liquid: silhouette, tilted top ellipse, front bottom arc
function liquidLines() {
  let g = FRONT.querySelector("[data-liq]");
  if (!g) { g = document.createElementNS("http://www.w3.org/2000/svg", "path"); g.setAttribute("data-liq", ""); g.setAttribute("class", "iso-line"); g.setAttribute("data-tone", "hi"); FRONT.insertBefore(g, FRONT.firstChild); }
  if (!liquid) { g.setAttribute("d", ""); return; }
  const [vx, vy] = KIT.towardViewer(P), side = [-vy, vx], perp = side;
  let d = "";
  TUBES.forEach((t, j) => {
    const top = topOf(j);
    if (top - TUBE_Z < 0.05 || liquidOn.x < 0.5) return;
    const tilt = tiltOf(j), zAt = (cx, cy) => top + tilt * ((cx - t.x) * perp[0] + (cy - t.y) * perp[1]) / LIQ_R;
    const pts = [];
    for (let q = 0; q <= 40; q++) { const a = (q / 40) * Math.PI * 2, cx = t.x + Math.cos(a) * LIQ_R, cy = t.y + Math.sin(a) * LIQ_R; pts.push(KIT.iso([cx, cy, zAt(cx, cy)], P)); }
    d += KIT.pathOf(pts, true);
    for (const sg of [1, -1]) {
      const cx = t.x + side[0] * LIQ_R * sg, cy = t.y + side[1] * LIQ_R * sg;
      d += KIT.segment([cx, cy, TUBE_Z], [cx, cy, zAt(cx, cy)], P);
    }
    d += KIT.sideArc(t.x, t.y, LIQ_R, TUBE_Z, P, 24);
  });
  g.setAttribute("d", d);
}
function drawLiquid() {
  if (!liquid) return;
  liquid.draw({ ...glCam(), uOn: liquidOn.x, uTop: TUBES.map((t, j) => topOf(j)), uTilt: TUBES.map((t, j) => tiltOf(j)) }, still.matches ? 0.8 : glClock);
  liquidLines();
}
let sel = -1, frame = 0, last = 0, anim = null, touring = true, clock = 0, idle = 0, visible = false;
// ---------- waves (tracker studies): the latest wave's own numbers, the wave before as dashed ghost needles ----------
// Counters show each wave's users out of that wave's base; dials read a wave only where the report publishes values.
// Tubes (reasons, coded across all interviews) have no wave view and dim while waves are shown.
const CUR = WAVES.length - 1, PREV = WAVES.length - 2;
const valueOf = (i, f) => (view.waves && CUR >= 0 ? WAVES[CUR].benches[i][f] : B[i][f]);
function readoutFor(i) {
  if (!view.waves || CUR < 0) return B[i].name + " · " + B[i].users + " of " + BASE + " used it last month";
  const c = WAVES[CUR], p = PREV >= 0 ? WAVES[PREV] : null;
  return B[i].name + " · " + c.label + ": " + c.benches[i].users + " of " + c.base + (p ? " · " + p.label + ": " + p.benches[i].users + " of " + p.base : "");
}
function applyValues() {
  B.forEach((b, i) => {
    if (!anim || anim.i !== i) setDigits(i, valueOf(i, "users"));
    ["appeal", "trust"].forEach((f, j) => {
      if (b[f] == null) return;   // capped: the report publishes no value
      const n = svg.querySelector('[data-needle="' + i + '-' + j + '"]');
      const v = valueOf(i, f);
      if (n && v != null && (!anim || anim.i !== i)) n.setAttribute("d", needleAt(BX[i] - 26 + j * 20, 12, v));
    });
  });
  let g = svg.querySelector("[data-ghosts]");
  if (!g) { g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("data-ghosts", ""); svg.appendChild(g); }
  if (!view.waves || PREV < 0) { g.innerHTML = ""; return; }
  let d = "";
  B.forEach((b, i) => ["appeal", "trust"].forEach((f, j) => { const v = WAVES[PREV].benches[i][f]; if (b[f] != null && v != null) d += needleAt(BX[i] - 26 + j * 20, 12, v); }));
  g.innerHTML = d ? '<path class="iso-line wave-ghost" data-tone="mid" data-dashed data-free="start" d="' + d + '"/>' : "";
}
function setDigits(i, value) {
  const s = String(Math.round(value)).padStart(3, "0");
  for (let c = 0; c < 3; c++) { const t = svg.querySelector('[data-digit="' + i + '-' + c + '"] text'); if (t && t.textContent !== s[c]) t.textContent = s[c]; }
}
function select(i, quiet) {
  if (i === sel) return;
  if (sel >= 0) svg.querySelector('[data-counter="' + sel + '"] .iso-solid').removeAttribute("data-lit");
  sel = i;
  svg.querySelector('[data-counter="' + i + '"] .iso-solid').setAttribute("data-lit", "");
  if (!phase) readout.textContent = readoutFor(i);
  if (sheet()) { camera.set(restCam()); camFor = -1; } else { camera.set(CAMS[i]); camFor = i; }
  applyOn();
  if (TENSION && i === TENSION.index && !tensionPlayed && !scripted && !ten && introLeft <= 0) tensionDue = 1.4;   // once per visit
  pour(i);
  anim = still.matches ? null : { t: 0, i };
  if (!quiet) document.dispatchEvent(new CustomEvent("bench", { detail: { index: i, from: "figure" } }));
  run();
}
function draw(u) {
  if (!anim) { if (sel >= 0) setDigits(sel, valueOf(sel, "users")); return; }
  const i = anim.i, e = 1 - Math.pow(1 - u, 3);
  setDigits(i, valueOf(i, "users") * e);
  [valueOf(i, "appeal"), valueOf(i, "trust")].forEach((v, j) => {
    if (v == null || [B[i].appeal, B[i].trust][j] == null) return;
    const n = svg.querySelector('[data-needle="' + i + '-' + j + '"]');
    n.setAttribute("d", needleAt(BX[i] - 26 + j * 20, 12, v * e));
  });
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  parts.step(dt, still.matches);
  cut.step(dt, still.matches);
  const tenBusy = stepTension(dt) || tensionDue > 0 || (chip && chip.on);
  if (introLeft > 0) { introLeft -= dt; if (introLeft <= 0 && parts.busy) introLeft = 0.05; }
  say();
  if (touring && !still.matches && visible && introLeft <= 0 && !cut.isOpen && !ten && tensionDue <= 0) { clock += dt; if (clock >= 0) { const want = Math.floor(clock / 5) % B.length; if (want !== sel) select(want, false); else if (camFor !== want && !sheet()) { camera.set(CAMS[want]); camFor = want; } } }
  camBusy = camera.step(dt, still.matches);
  parts.apply(P); layersVis(); bp.update(P); cut.draw(P);
  glClock += dt;
  const glBusy = stepLiquid(dt);
  drawLiquid();
  camBusy = camBusy || glBusy;
  if (anim) { anim.t += dt; const u = Math.min(1, anim.t / 1.2); draw(u); if (u >= 1) anim = null; }
  frame = visible && (anim || touring || camBusy || parts.busy || introLeft > 0 || cut.busy || cut.isOpen || tenBusy) && !still.matches ? requestAnimationFrame(tick) : 0;
}
function run() { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } if (still.matches) { parts.step(0, true); say(); camera.step(0, true); parts.apply(P); layersVis(); bp.update(P); stepLiquid(0); drawLiquid(); draw(1); } }
addEventListener("resize", () => drawLiquid());
function hold() { touring = false; clearTimeout(idle); idle = setTimeout(() => { touring = true; clock = sel * 5; run(); }, 8000); }
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "80px 0px" }).observe(root);
root.addEventListener("pointermove", (ev) => {
  if (scripted) return;
  const box = svg.getBoundingClientRect(); const f = (ev.clientX - box.left) / box.width;
  const v = camera.view;
  const gx = sheet() ? BX.map((x) => (KIT.iso([x, 0, ${TOP}], P)[0] - v[0]) / v[2]) : GX;
  let best = 0; gx.forEach((g, j) => { if (Math.abs(g - f) < Math.abs(gx[best] - f)) best = j; });
  hold(); select(best);
});
root.addEventListener("keydown", (ev) => {
  if (ev.key === "b" || ev.key === "B") { setView({ blueprint: !view.blueprint }); return; }
  if (ev.key === "a" || ev.key === "A") { setView({ apart: !view.apart }); return; }
  const d = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0; if (!d) return;
  ev.preventDefault(); hold(); select((sel + d + B.length) % B.length);
});
root.addEventListener("pointerleave", () => {
  if (scripted) return; camera.set(restCam()); camFor = -1; run(); });
document.addEventListener("bench", (e) => { if (e.detail.from !== "figure") { hold(); select(e.detail.index, true); } });
applyTips();
select(0, true);
camera.set(WIDE); camFor = -1;
clock = -2.5;   // open on the wide shot, then start the tour
// the benches build themselves the first time they run; the tubes stay empty until then, then pour
if (!still.matches) { introLeft = parts.intro(0.07); want.fill(0); level.forEach((l) => { l.x = 0; }); clock = -2.2; parts.apply(P); layersVis(); }
camera.step(0, true);
window.WB = { select, camera, setView, get view() { return { ...view }; }, parts, scene, unscript, cutaway, tension: () => playTension(true),
  // verification hook: draw the liquid and measure its ink in the same frame
  inspectLiquid() {
    if (!liquid) return "no webgl";
    drawLiquid();
    const g = liquid.gl, w = glCanvas.width, h = glCanvas.height, px = new Uint8Array(w * h * 4);
    g.readPixels(0, 0, w, h, g.RGBA, g.UNSIGNED_BYTE, px);
    let ink = 0, edge = 0, over = 0, maxA = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, al = px[i + 3]; if (!al) continue; ink++; maxA = Math.max(maxA, al); if (px[i] > al || px[i + 1] > al || px[i + 2] > al) over++; if (x < 3 || y < 3 || x > w - 4 || y > h - 4) edge++; }
    return w + "x" + h + " inked " + ink + " edge " + edge + " premult-overflow " + over + " maxAlpha " + maxA;
  } };
return window.WB;   // one object: page scripts that say WB get the same API as window.WB
})();
`;
  return { svg, live, P };
}
