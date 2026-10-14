// Machine props: the parts the packaging conveyor is assembled from. Each prop is a pure function of the drawing
// context `c` (engine/compose.js makeCtx) and its options `o`, returning
//   { items: [...], part: { name, move, anchor } }       (part omitted for props that are not one assembly)
// Station props take `o.x` (where along the line they stand) and `o.m`, the line they mount on
// ({ RAIL_Z0, RAIL_TOP, BELT_TOP }). Slots say which data encodings a prop can carry (engine/encodings.mjs).
// Plain source, concatenated with the engine and a world, then inlined into the page.

// ---------- base plate: the ground of a bench-top machine ----------
PROPS["base-plate"] = { slots: {}, build(c, { plate: PLATE, h: PLATE_H = 10, foot: FOOT_H = 5 }) {
  const { k, P, at, S, L, D, slab, byDepth } = c;
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // T-slot running the length of the plate
  out.push(L(k.planOutline({ x: -200, y: 35, w: PLATE.w - 42, d: 3, r: 1.5 }, 0, P, 4), { tone: "lo" }));
  // ruler strip along the front edge
  const strip = { x: -150, y: PLATE.y + PLATE.d - 15, w: PLATE.w - 112, d: 7, r: 1 };
  out.push(S(slab(strip, 0, 0.6, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
  // label plate, near-left corner
  const label = { x: -210, y: 46, w: 30, d: 22, r: 1.5 };
  out.push(S(slab(label, 0, 0.8, 4), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.6), 0.8, P, 4), { tone: "faint" }));
  [[0.3, 0.8], [0.5, 0.6], [0.7, 0.7]].forEach(([f, len]) => {
    const yy = label.y + label.d * f;
    out.push(L(k.lineOnTop([label.x + 4, yy], [label.x + 4 + (label.w - 8) * len, yy], 0.8, P), { tone: "lo", free: true }));
  });
  out.push(D([at([label.x + 2.4, label.y + 2.4, 0.8]), at([label.x + label.w - 2.4, label.y + label.d - 2.4, 0.8])], { size: 0.4 }));
  return { items: [{ phase: "ground", part: "base", tip: "", svg: out.join(""), bounds: c.box(PLATE, -PLATE_H - FOOT_H, 0.8) }],
    part: { name: "Base plate", move: [0, 0, 0], anchor: [PLATE.x + 30, PLATE.y + PLATE.d - 20, 0] } };
} };

// ---------- drive motor + gearbox + control box on the far side ----------
PROPS.drive = { slots: {}, build(c) {
  const { k, P, at, S, L, D, slab } = c;
  const out = [];
  const stand = { x: -176, y: -44, w: 22, d: 16, r: 1.5 };
  out.push(S(slab(stand, 0, 14, 3, 0.5), { tone: "lo" }));
  out.push(D([at([stand.x + 3, stand.y + 3, 14]), at([stand.x + stand.w - 3, stand.y + 3, 14])], { size: 0.4 }));
  const body = { x: -178, y: -42, w: 26, d: 12, r: 3 };
  out.push(S(slab(body, 14, 12, 6, 0.6), { tone: "mid", inner: L(k.sideSeam(body, 17, P, 6), { tone: "faint" }) }));
  for (let x = body.x + 5; x <= body.x + body.w - 5; x += 2.6) out.push(L(k.lineOnTop([x, body.y], [x, body.y + body.d], 26, P), { tone: "faint" }));
  // gearbox and output shaft housing reaching the rail
  const gear = { x: -152, y: -40, w: 9, d: 9, r: 1.2 };
  out.push(S(slab(gear, 15, 10, 3, 0.5), { tone: "mid" }));
  out.push(D(k.corners(gear, 1.8).map(([x, y]) => at([x, y, 25])), { size: 0.4 }));
  out.push(S(slab({ x: -150, y: -31, w: 5, d: 8, r: 0.8 }, 18, 5, 2, 0.3), { tone: "mid" }));
  out.push(S(k.cylinder(-165, -36, 2.4, 26, 2, P, 16), { tone: "mid" }));                       // junction box cap
  out.push(S(slab({ x: -170, y: -30, w: 10, d: 7, r: 0.8 }, 17, 7, 2, 0.3), { tone: "mid" }));   // motor bracket to the rail
  // control box on its post, wired to the motor
  const CTRL = { x: -210, y: -46, w: 16, d: 9, r: 1.2 };
  const cx = CTRL.x + CTRL.w / 2, cy = CTRL.y + CTRL.d / 2;
  out.push(k.wireSvg(at([CTRL.x + CTRL.w, cy, 22]), at([-176, -36, 4]), { via: [at([CTRL.x + CTRL.w + 4, cy, 22]), at([CTRL.x + CTRL.w + 4, cy, 0.6]), at([-180, -36, 0.6])], tone: "lo", size: 0.9 }));
  out.push(S(k.cylinder(cx, cy, 4.6, 0, 1.4, P, 20), { tone: "lo" }));
  out.push(S(slab({ x: cx - 1.5, y: cy - 1.5, w: 3, d: 3, r: 0.6 }, 1.4, 16.6, 2, 0.3), { tone: "mid" }));
  out.push(S(slab(CTRL, 18, 10, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(CTRL, 25, P, 3), { tone: "faint" }) }));
  out.push(D(k.corners(CTRL, 1.6).map(([x, y]) => at([x, y, 28])), { size: 0.4 }));
  out.push(S(k.cylinder(CTRL.x + 4.5, cy, 2, 28, 1.2, P, 16), { tone: "hi", crease: "lo" }));       // start
  out.push(S(k.cylinder(CTRL.x + 11, cy, 2.4, 28, 1.8, P, 18), { tone: "mid" }));                   // stop (mushroom)
  out.push(L(k.ring(CTRL.x + 11, cy, 1.2, 29.8, P, 12), { tone: "lo" }));
  return { items: [{ phase: "far", part: "drive", tip: "", svg: out.join(""), bounds: [-212, -46, 0, -145, -23, 30] }],
    part: { name: "Drive and controls", move: [0, -14, 26], anchor: [-165, -36, 28.4] } };
} };

// ---------- conveyor frame: rails, legs, belt and its cleats ----------
// o: { X0, X1, LEGS, BUMP, m }. Returns items for the back frame (far), the belt (far, after the station props'
// far halves) and the front frame (near), plus `cleatsAt(offset)` for the live belt.
PROPS["conveyor-frame"] = { slots: { flow: "path" }, build(c, { X0, X1, LEGS, BUMP, m }) {
  const { k, P, at, S, L, D, slab, faceY, stadium } = c;
  const { RAIL_Z0, BELT_Z0, BELT_TOP, RAIL_TOP } = m;
  const RAIL_BACK = { x: X0, y: -23, w: X1 - X0, d: 5, r: 1 };
  const RAIL_FRONT = { x: X0, y: 18, w: X1 - X0, d: 5, r: 1 };
  function leg(x, y, side) {
    const out = [];
    out.push(S(k.cylinder(x, y, 3.6, 0, 1.2, P, 18), { tone: "lo" }));          // foot pad
    out.push(S(k.cylinder(x, y, 1.1, 1.2, 2, P, 10), { tone: "mid" }));          // levelling stud
    out.push(S(k.cylinder(x, y, 2.4, 3.2, 1.4, P, 6), { tone: "mid" }));         // hex lock nut
    const legPlan = { x: x - 2, y: y - 2, w: 4, d: 4, r: 0.6 };
    out.push(S(slab(legPlan, 4.6, RAIL_Z0 - 4.6, 2, 0.3), { tone: "mid", inner: L(k.sideSeam(legPlan, 8, P, 2), { tone: "faint" }) }));
    // gusset plate under the rail, bolted
    const gy = side === "near" ? y + 2 : y - 2.8;
    const g = { x: x - 6, y: gy, w: 12, d: 0.8, r: 0.2 };
    out.push(S(slab(g, RAIL_Z0 - 5, 5, 2), { tone: "mid", crease: "lo" }));
    if (side === "near") out.push(D([at([x - 4, gy + 0.8, RAIL_Z0 - 2.4]), at([x + 4, gy + 0.8, RAIL_Z0 - 2.4])], { size: 0.4 }));
    return out.join("");
  }
  function backFrame() {
    const out = [];
    // tail end plate across both rails
    out.push(S(slab({ x: X0 - 1.6, y: -24, w: 1.6, d: 48, r: 0.4 }, 24, 13, 2, 0.3), { tone: "mid" }));
    for (const x of LEGS) {
      out.push(leg(x, -20.5, "far"));
      out.push(S(slab({ x: x - 1, y: -18.5, w: 2, d: 37, r: 0.4 }, 8, 2, 2), { tone: "lo" }));
    }
    out.push(S(slab(RAIL_BACK, RAIL_Z0, RAIL_TOP - RAIL_Z0, 3, 0.4), { tone: "mid" }));
    return out.join("");
  }
  function frontFrame() {
    const out = [];
    for (const x of LEGS) out.push(leg(x, 20.5, "near"));
    const bolts = [];
    for (let x = X0 + 30; x <= X1 - 8; x += 13) bolts.push(x);
    const seam = k.sideSeam(RAIL_FRONT, 25, P, 3);
    out.push(S(slab(RAIL_FRONT, RAIL_Z0, RAIL_TOP - RAIL_Z0, 3, 0.4), { tone: "mid", inner: L(seam, { tone: "faint" }) }));
    out.push(L(bolts.map((x) => k.sideRing([x, 23, 31], 1.5, "y", P, 12)).join(""), { tone: "lo" }));
    out.push(D(bolts.map((x) => at([x, 23, 31])), { size: 0.4 }));
    // tail take-up: slotted plate, sliding block and adjusting bolt
    out.push(L(faceY(23, stadium(X0 + 15, 31.5, 16, 4)), { tone: "lo" }));
    out.push(S(slab({ x: X0 + 13, y: 23, w: 6, d: 1.2, r: 0.4 }, 29.4, 4.2, 2, 0.3), { tone: "mid", crease: "lo" }));
    out.push(D([at([X0 + 16, 24.2, 31.5])], { size: 0.55, tone: "hi" }));
    out.push(L(k.sideRing([X0 + 16, 24.2, 31.5], 1.3, "y", P, 12), { tone: "mid" }));
    // end roller bosses
    for (const x of [X0 + 4, X1 - 4]) {
      out.push(L(k.sideRing([x, 23, 31.5], 3.2, "y", P, 20), { tone: "mid" }));
      out.push(L(k.sideRing([x, 23, 31.5], 1.6, "y", P, 14), { tone: "lo" }));
      out.push(D([at([x, 23, 31.5])], { size: 0.5, tone: "hi" }));
    }
    return out.join("");
  }
  function belt() {
    const out = [];
    out.push(S(slab({ x: X0 + 0.5, y: -18, w: X1 - X0 - 1, d: 36, r: 1.5 }, BELT_Z0, BELT_TOP - BELT_Z0, 3, 0.3), { tone: "mid" }));
    if (!BUMP) return out.join("");
    // threshold bump bar across the belt at the shipping station, bolted to both rails
    out.push(S(slab({ x: BUMP.x, y: -18, w: BUMP.w, d: 36, r: 1.2 }, BELT_TOP, BUMP.h, 4, 0.4), { tone: "mid", crease: "lo" }));
    out.push(L(k.lineOnTop([BUMP.x + BUMP.w / 2, -18], [BUMP.x + BUMP.w / 2, 18], BELT_TOP + BUMP.h, P), { tone: "faint" }));
    out.push(D([-14, -5, 5, 14].map((y) => at([BUMP.x + 2, y, BELT_TOP + BUMP.h])), { size: 0.35, tone: "lo" }));
    return out.join("");
  }
  const cleatsAt = (offset) => beltCleats(k, P, X0, X1, BUMP, BELT_TOP, offset);
  return {
    cleatsAt,
    items: [
      { phase: "far", part: "frame", tip: "", svg: backFrame(), bounds: [X0 - 1.6, -24, 0, X1, -18, RAIL_TOP] },
      { phase: "far", part: "frame", tip: "", svg: belt() + `<path data-cleats class="iso-line" data-tone="lo" d="${cleatsAt(0)}"/>`, bounds: [X0, -18, BELT_Z0, X1, 18, BELT_TOP + (BUMP ? BUMP.h : 0)] },
      { phase: "near", part: "frame", tip: "", svg: frontFrame(), bounds: [X0, 18, 0, X1, 25, RAIL_TOP] },
    ],
    part: { name: "Frame and belt", move: [0, 0, 0], anchor: [X0 + 40, 0, BELT_TOP] },
  };
} };

// ---------- hopper: throat on the rails + wider bin above; where every carrier enters ----------
PROPS.hopper = { slots: { flow: "source" }, build(c, { m }) {
  const { k, P, at, S, L, D, slab, openBox } = c;
  const { RAIL_TOP } = m;
  const HOP = { x: -178, y: -24, w: 34, d: 48, r: 1 };
  const HOP2 = { x: -184, y: -30, w: 46, d: 60, r: 1.5 };
  const throat = openBox(HOP, 46, 10, 2, "mid", false);
  const posts = (side) => {
    const y = side === "far" ? HOP.y + 0.5 : HOP.y + HOP.d - 3.5;
    return [HOP.x + 1, HOP.x + HOP.w - 4].map((x) => S(slab({ x, y, w: 3, d: 3, r: 0.4 }, RAIL_TOP, 46 - RAIL_TOP, 2, 0.3), { tone: "mid" })).join("");
  };
  function top() {
    const out = [];
    const t = 1.6, Z = 56, H = 15;
    out.push(S(slab(HOP2, Z, 1.6, 3, 0.4), { tone: "mid" }));                         // floor with the throat opening
    out.push(L(k.planOutline(k.insetPlan(HOP, 2), Z + 1.6, P, 2), { tone: "lo" }));
    out.push(D(k.corners(HOP2, 3.4).map(([x, y]) => at([x, y, Z + 1.6])), { size: 0.4 }));
    const bx = openBox(HOP2, Z + 1.6, H, t, "mid", false);
    out.push(bx.far);
    // stock waiting above the throat
    for (const [x, y] of [[-176, -22], [-162, -26], [-166, 8]]) {
      out.push(S(slab({ x, y, w: 14, d: 18, r: 4 }, Z + 1.6, 8, 5, 0.6), { tone: "hi", crease: "lo" }));
      out.push(L([x + 2.4, x + 11.6].map((xx) => k.lineOnTop([xx, y + 0.3], [xx, y + 17.7], Z + 9.6, P)).join(""), { tone: "lo" }));
    }
    out.push(bx.near);
    // rolled rim on the near walls
    const rim = Z + 1.6 + H;
    out.push(L(k.segment([HOP2.x, HOP2.y + HOP2.d, rim - 2.4], [HOP2.x + HOP2.w, HOP2.y + HOP2.d, rim - 2.4], P), { tone: "faint" }));
    out.push(L(k.segment([HOP2.x + HOP2.w, HOP2.y + t, rim - 2.4], [HOP2.x + HOP2.w, HOP2.y + HOP2.d, rim - 2.4], P), { tone: "faint" }));
    out.push(D([HOP2.x + 6, HOP2.x + HOP2.w / 2, HOP2.x + HOP2.w - 6].map((x) => at([x, HOP2.y + HOP2.d, rim - 5])), { size: 0.4 }));
    return out.join("");
  }
  return {
    items: [
      { phase: "far", part: "hopper", svg: posts("far") + throat.far, bounds: [HOP.x, HOP.y, RAIL_TOP, HOP.x + HOP.w, HOP.y + 4, 56] },
      { phase: "near", part: "hopper", svg: posts("near") + throat.near + top(), bounds: [HOP2.x, HOP2.y, RAIL_TOP, HOP2.x + HOP2.w, HOP2.y + HOP2.d, 73] },
    ],
    part: { name: "Hopper", move: [0, 0, 44], anchor: [HOP2.x + HOP2.w / 2, HOP2.y + HOP2.d, 72.6] },
    fit: [[-184, -30, 73]],
  };
} };

// ---------- bin rack: a two-tier store shelf with empty picking bins ----------
PROPS["bin-rack"] = { slots: {}, build(c, { x: rackX }) {
  const { k, P, at, S, L, D, slab, faceX, rect } = c;
  const RACK = { x: rackX - 18, y: -34, w: 36, d: 68 };
  const TIERS = [48, 66];
  const post = (x, y) => S(slab({ x: x - 1, y: y - 1, w: 5, d: 5, r: 0.6 }, 0, 1, 2), { tone: "lo" }) +
    S(slab({ x, y, w: 3, d: 3, r: 0.4 }, 1, 81, 2, 0.3), { tone: "mid", inner: L(TIERS.map((z) => k.sideSeam({ x, y, w: 3, d: 3, r: 0.4 }, z - 2.5, P, 2)).join(""), { tone: "faint" }) });
  function scoopBin(x, y, w, d, z) {
    const back = 13, lip = 4.5, t = 1.1;
    const out = [];
    out.push(S(slab({ x, y, w, d, r: 0.6 }, z, t, 2, 0.3), { tone: "mid" }));                         // floor
    out.push(S(slab({ x, y, w, d: t, r: 0.3 }, z, back, 2, 0.3), { tone: "mid" }));                   // back wall
    out.push(S(slab({ x, y: y + t, w: t, d: d - 2 * t, r: 0.3 }, z, back, 2, 0.3), { tone: "mid" }));  // far side
    out.push(L(k.lineOnTop([x + t, y + d / 2], [x + w - t, y + d / 2], z + t, P), { tone: "faint", free: true }));  // floor rib: a crease between walls with no outline of its own at either end
    out.push(S(slab({ x: x + w - t, y: y + t, w: t, d: d - 2 * t, r: 0.3 }, z, lip, 2, 0.3), { tone: "mid" }));   // low front lip
    out.push(S(slab({ x, y: y + d - t, w, d: t, r: 0.3 }, z, lip, 2, 0.3), { tone: "mid" }));          // low near side
    // label card in its holder on the front lip
    const fx = x + w;
    out.push(L(faceX(fx, rect(y + 4, y + d - 4, z + 0.8, z + lip - 0.8)), { tone: "lo" }));
    out.push(L(k.segment([fx, y + 5.4, z + lip / 2], [fx, y + 5.4 + (d - 10.8) * 0.6, z + lip / 2], P), { tone: "lo", free: true }));
    return out.join("");
  }
  function near() {
    const out = [];
    for (const z of TIERS) {
      const shelf = { x: RACK.x, y: RACK.y, w: RACK.w, d: RACK.d, r: 1 };
      out.push(S(slab(shelf, z, 2, 3, 0.4), { tone: "mid" }));
      // three empty bins across the belt — “Nothing here. Come back later.”
      for (const y0 of [RACK.y + 3, RACK.y + 24, RACK.y + 45]) out.push(scoopBin(RACK.x + 2, y0, RACK.w - 5, 20, z + 2));
      // shelf edge strip on the downstream face
      out.push(S(slab({ x: RACK.x + RACK.w, y: RACK.y + 1, w: 1, d: RACK.d - 2, r: 0.3 }, z - 1.4, 3.4, 2), { tone: "mid", crease: "lo" }));
    }
    out.push(post(RACK.x, RACK.y + RACK.d - 3), post(RACK.x + RACK.w - 3, RACK.y + RACK.d - 3));
    // top frame: two side rails tying the four posts, bolted at each corner
    for (const x of [RACK.x, RACK.x + RACK.w - 3]) {
      out.push(S(slab({ x: x - 0.3, y: RACK.y - 0.3, w: 3.6, d: RACK.d + 0.6, r: 0.6 }, 82, 2.2, 2, 0.4), { tone: "mid" }));
      out.push(D([RACK.y + 1.5, RACK.y + RACK.d - 1.5].map((y) => at([x + 1.5, y, 84.2])), { size: 0.4 }));
    }
    return out.join("");
  }
  return {
    items: [
      { phase: "far", part: "rack", svg: post(RACK.x, RACK.y) + post(RACK.x + RACK.w - 3, RACK.y), bounds: [RACK.x - 1, RACK.y - 1, 0, RACK.x + RACK.w + 1, RACK.y + 4, 82] },
      { phase: "near", part: "rack", svg: near(), bounds: [RACK.x - 1, RACK.y - 1, 0, RACK.x + RACK.w + 1, RACK.y + RACK.d + 1, 84.2] },
    ],
    part: { name: "Bin rack", move: [0, 0, 50], anchor: [RACK.x + RACK.w / 2, RACK.y + RACK.d / 2, 84.2] },
    fit: [[rackX - 18, 34, 85], [rackX + 18, -34, 85], [rackX + 18, 34, 85]],
  };
} };

// ---------- photo-eye: clamped emitter + receiver ----------
PROPS["photo-eye"] = { slots: {}, build(c, { x: eyeX, m }) {
  const { k, P, at, S, L, D, slab } = c;
  const { RAIL_TOP } = m;
  function post(y, side) {
    const out = [];
    out.push(S(slab({ x: eyeX - 3, y: y - 2.5, w: 6, d: 5, r: 0.8 }, RAIL_TOP, 1.6, 2, 0.3), { tone: "mid" }));   // rail clamp
    out.push(D([at([eyeX - 1.8, y, RAIL_TOP + 1.6]), at([eyeX + 1.8, y, RAIL_TOP + 1.6])], { size: 0.35 }));
    out.push(S(k.cylinder(eyeX, y, 1.3, RAIL_TOP + 1.6, 6.4, P, 12), { tone: "mid", crease: "none" }));
    const head = { x: eyeX - 2.6, y: y - 2.6, w: 5.2, d: 5.2, r: 1 };
    out.push(S(slab(head, RAIL_TOP + 8, 6.4, 3, 0.4), { tone: "mid" }));
    out.push(D([at([eyeX, y, RAIL_TOP + 14.4])], { size: 0.5, tone: "hi" }));                                  // status LED
    if (side === "far") out.push(L(k.sideRing([eyeX, y + 2.6, RAIL_TOP + 11], 1.4, "y", P, 14), { tone: "hi" }));   // lens
    return out.join("");
  }
  const near = L(k.segment([eyeX, -17.9, RAIL_TOP + 11], [eyeX, 17.9, RAIL_TOP + 11], P), { tone: "lo", dotted: true, className: "eye-beam" }) +
    D([at([eyeX, -17.9, RAIL_TOP + 11])], { size: 0.5, tone: "hi" }) + post(20.5, "near");
  return {
    items: [
      { phase: "far", part: "eye", svg: post(-20.5, "far"), bounds: [eyeX - 3, -23, RAIL_TOP, eyeX + 3, -18, RAIL_TOP + 14.4] },
      { phase: "near", part: "eye", svg: near, bounds: [eyeX - 3, -18, RAIL_TOP, eyeX + 3, 23, RAIL_TOP + 14.4] },
    ],
    part: { name: "Photo-eye", move: [0, 0, 30], anchor: [eyeX, -20.5, RAIL_TOP + 14.4] },
  };
} };

// ---------- price labeler: column, arm, roll, web, head, tamp ----------
PROPS.labeler = { slots: {}, build(c, { x: labX }) {
  const { k, P, at, S, L, D, slab, faceY, stadium } = c;
  function far() {
    const out = [];
    out.push(S(k.cylinder(labX, -36, 6.4, 0, 1.8, P, 28), { tone: "lo" }));
    out.push(D([0, 1, 2, 3].map((i) => { const a = Math.PI / 4 + (i * Math.PI) / 2; return at([labX + Math.cos(a) * 4.6, -36 + Math.sin(a) * 4.6, 1.8]); }), { size: 0.4 }));
    const col = { x: labX - 3, y: -39, w: 6, d: 6, r: 1 };
    out.push(S(slab(col, 1.8, 64.2, 3, 0.4), { tone: "mid", inner: L(k.sideSeam(col, 30, P, 3), { tone: "faint" }) }));
    return out.join("");
  }
  function near() {
    const out = [];
    // clamp collar on the column with a knurled lock knob
    const collar = { x: labX - 4.4, y: -40.4, w: 8.8, d: 8.8, r: 1.4 };
    out.push(S(slab(collar, 61, 7, 3, 0.5), { tone: "mid" }));
    out.push(S(slab({ x: labX + 4.4, y: -37.2, w: 2.2, d: 2.4, r: 0.5 }, 63.6, 2, 2), { tone: "mid", crease: "none" }));
    out.push(S(k.cylinder(labX + 8.6, -36, 2.4, 62.6, 4, P, 20), { tone: "mid" }));
    out.push(L(k.knurl(labX + 8.6, -36, 2.4, 62.6, 66.6, 20, P), { tone: "lo" }));
    // arm with end cap
    const arm = { x: labX - 3.5, y: -40, w: 7, d: 46, r: 1 };
    out.push(S(slab(arm, 68, 4, 3, 0.4), { tone: "mid" }));
    out.push(D([at([labX, -36, 72]), at([labX, 3, 72])], { size: 0.45 }));
    // label web: two tape edges from the roll to the guide slot
    const rollY = -24, rollR = 6, half = 2;
    const tangentY = rollY + Math.sqrt(rollR * rollR - half * half);
    out.push(L(k.planOutline({ x: labX - 2.6, y: -3.4, w: 5.2, d: 1.6, r: 0.6 }, 72, P, 2), { tone: "lo" }));
    out.push(L([-half, half].map((dx) => k.lineOnTop([labX + dx, tangentY - 1.5], [labX + dx, -3.4], 72, P)).join(""), { tone: "mid" }));
    // supply roll and spindle
    out.push(S(k.cylinder(labX, rollY, rollR, 72, 4, P, 36, 0.4), { tone: "hi", crease: "lo" }));
    out.push(L(k.ring(labX, rollY, rollR - 1.6, 76, P, 28), { tone: "faint" }));
    out.push(S(k.cylinder(labX, rollY, 1.8, 76, 1.6, P, 14), { tone: "mid" }));
    // print-and-apply head
    const head = { x: labX - 7, y: -6, w: 14, d: 12, r: 1.4 };
    out.push(S(slab(head, 52, 16, 3, 0.6), { tone: "hi", crease: "lo", inner: L(k.sideSeam(head, 61, P, 3), { tone: "faint" }) }));
    for (const z of [55, 57.6]) out.push(L(faceY(6, stadium(labX - 1, z, 9, 1.2)), { tone: "lo" }));
    out.push(D([at([labX + 4.6, 6, 65])], { size: 0.5, tone: "hi" }));
    out.push(S(k.cylinder(labX, 0, 1.4, 50, 2, P, 12), { tone: "mid" }));                                  // tamp ram
    out.push(S(slab({ x: labX - 4, y: -4, w: 8, d: 8, r: 0.8 }, 48, 2, 2, 0.3), { tone: "mid", crease: "lo" }));   // tamp pad
    return out.join("");
  }
  return {
    items: [
      { phase: "far", part: "labeler", svg: far(), bounds: [labX - 6.4, -42.4, 0, labX + 6.4, -29.6, 66] },
      { phase: "near", part: "labeler", svg: near(), bounds: [labX - 7, -40.4, 48, labX + 11, 6, 77.6] },
    ],
    part: { name: "Price labeler", move: [0, 0, 36], anchor: [labX, -24, 76] },
    fit: [[labX, -24, 78]],
  };
} };

// ---------- shipping threshold: barrier post, arm, rest post ----------
PROPS["threshold-gate"] = { slots: {}, build(c, { x: gateX }) {
  const { k, P, at, S, L, D, slab } = c;
  function far() {
    const out = [];
    out.push(S(k.cylinder(gateX + 10, -34, 4.6, 0, 1.6, P, 22), { tone: "lo" }));
    out.push(S(k.cylinder(gateX + 10, -34, 2.2, 1.6, 46.4, P, 16), { tone: "mid", crease: "none" }));
    const bx = { x: gateX + 5, y: -39, w: 10, d: 10, r: 1.6 };
    out.push(S(slab(bx, 48, 9, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(bx, 51, P, 3), { tone: "faint" }) }));
    out.push(D(k.corners(bx, 2).map(([x, y]) => at([x, y, 57])), { size: 0.4 }));
    return out.join("");
  }
  function near() {
    const out = [];
    out.push(S(k.cylinder(gateX + 10, -34, 2.8, 57, 1.4, P, 16), { tone: "mid" }));                  // pivot hub
    out.push(S(slab({ x: gateX + 7.5, y: -46, w: 5, d: 9, r: 0.8 }, 58, 4, 2, 0.3), { tone: "mid" })); // counterweight
    const arm = { x: gateX + 8.5, y: -37, w: 3, d: 64, r: 0.8 };
    out.push(S(slab(arm, 58.4, 2.6, 2, 0.3), { tone: "hi", crease: "lo" }));
    out.push(D([at([gateX + 10, -34, 61])], { size: 0.55, tone: "hi" }));
    // rest post with a fork on the near side
    out.push(S(k.cylinder(gateX + 10, 30, 3.6, 0, 1.4, P, 18), { tone: "lo" }));
    out.push(S(k.cylinder(gateX + 10, 30, 1.6, 1.4, 55.6, P, 14), { tone: "mid", crease: "none" }));
    out.push(S(slab({ x: gateX + 7, y: 28, w: 1.2, d: 4, r: 0.3 }, 57, 4.6, 2), { tone: "mid" }));
    out.push(S(slab({ x: gateX + 11.8, y: 28, w: 1.2, d: 4, r: 0.3 }, 57, 4.6, 2), { tone: "mid" }));
    return out.join("");
  }
  return {
    items: [
      { phase: "far", part: "gate", svg: far(), bounds: [gateX + 5, -39, 0, gateX + 15, -29, 57] },
      { phase: "near", part: "gate", svg: near(), bounds: [gateX + 5, -46, 0, gateX + 15, 34, 62] },
    ],
    part: { name: "Threshold gate", move: [0, 0, 34], anchor: [gateX + 10, -34, 57] },
  };
} };

// ---------- tote: an open box at the end of the line, holding someone else's order ----------
PROPS.tote = { slots: { flow: "sink" }, build(c, { plan: TOTE, h: TOTE_H = 26 }) {
  const { k, P, S, L, slab, openBox, faceX, stadium } = c;
  const bx = openBox(TOTE, 0, TOTE_H, 2, "mid");
  const tx = TOTE.x - 160;   // contents were placed for a tote at x 160
  const contents = S(slab({ x: tx + 192, y: -22, w: 14, d: 6, r: 0.6 }, 2, 21, 2, 0.4), { tone: "mid" }) +
    L(k.planOutline({ x: tx + 193.6, y: -21, w: 10.8, d: 4, r: 0.4 }, 23, P, 2), { tone: "faint" }) +
    S(slab({ x: tx + 164, y: -23, w: 9, d: 9, r: 0.6 }, 2, 15, 2, 0.4), { tone: "mid" }) +
    S(k.cylinder(tx + 168.5, -18.5, 1.8, 17, 1.6, P, 14), { tone: "mid" }) +
    S(slab({ x: tx + 175, y: -23, w: 13, d: 9, r: 2.5 }, 2, 6, 4, 0.4), { tone: "mid" }) +
    S(slab({ x: tx + 190, y: 4, w: 14, d: 18, r: 4 }, 2, 7, 5, 0.5), { tone: "mid" }) +
    L([tx + 192.4, tx + 201.6].map((x) => k.lineOnTop([x, 4.3], [x, 21.7], 9, P)).join(""), { tone: "lo" });
  function detail() {
    const out = [];
    const yF = TOTE.y + TOTE.d, xF = TOTE.x + TOTE.w;
    const rimZ = TOTE_H - 3;
    // rim band and vertical ribs on the two visible outer faces
    out.push(L(k.segment([TOTE.x, yF, rimZ], [xF, yF, rimZ], P) + k.segment([xF, TOTE.y + 2, rimZ], [xF, yF, rimZ], P), { tone: "faint" }));
    const ribsY = []; for (let x = TOTE.x + 7; x <= xF - 7; x += 7) ribsY.push(k.segment([x, yF, 0], [x, yF, rimZ], P));
    const ribsX = []; for (const y of [-21, -15, 15, 21]) ribsX.push(k.segment([xF, y, 0], [xF, y, rimZ], P));
    out.push(L(ribsY.join("") + ribsX.join(""), { tone: "faint" }));
    // hand-hold slot on the end wall
    out.push(L(faceX(xF, stadium(0, rimZ - 4.4, 18, 4)), { tone: "lo" }));
    return out.join("");
  }
  return {
    items: [
      { phase: "far", part: "tote", svg: bx.far + contents, bounds: c.box(TOTE, 0, TOTE_H) },
      { phase: "near", part: "tote", svg: bx.near + detail(), bounds: c.box(TOTE, 0, TOTE_H) },
    ],
    part: { name: "Tote", move: [34, 0, 8], anchor: [TOTE.x + TOTE.w / 2, TOTE.y + TOTE.d, TOTE_H] },
  };
} };

// ---------- product bag: the carrier, built at the origin and moved live ----------
PROPS["product-bag"] = { slots: { individual: "carrier" }, build(c, { i }) {
  const { k, P, at, S, L, D, slab } = c;
  const plan = { x: -7, y: -9, w: 14, d: 18, r: 4 };
  const yAt = (x) => { const dx = Math.max(0, Math.abs(x) - 3); return 9 - 4 + Math.sqrt(16 - dx * dx); };
  const crimp = [-4.6, 4.6].map((x) => k.lineOnTop([x, -yAt(x)], [x, yAt(x)], 8, P)).join("");
  const teeth = [];
  for (const x of [-5.9, 5.9]) for (let y = -5.6; y <= 5.61; y += 1.4) teeth.push(at([x, y, 8]));
  const body = S(slab(plan, 0, 8, 5, 0.6), { tone: "hi", crease: "lo" }) +
    L(crimp, { tone: "lo" }) + D(teeth, { size: 0.3, tone: "lo" }) +
    L(k.planOutline({ x: -2.4, y: -4.6, w: 4.8, d: 9.2, r: 1 }, 8, P, 3), { tone: "faint" });
  return { svg: `<g data-bag="${i}" opacity="0">${body}</g>` };
} };

// Live geometry the page redraws every frame: plain functions so the runtime calls the same code the props use.
const DIAL = { R: 13, Z: 10, TOP: 17, SPAN: Math.PI * 1.5, FROM: -Math.PI * 0.75 };
function dialNeedle(k, P, x, y, v, N) {
  const a = DIAL.FROM + (v / N) * DIAL.SPAN;
  return k.lineOnTop([x - Math.sin(a) * 3, y + Math.cos(a) * 3], [x + Math.sin(a) * (DIAL.R - 3.6), y - Math.cos(a) * (DIAL.R - 3.6)], DIAL.TOP + 0.2, P);
}
function beltCleats(k, P, X0, X1, BUMP, BELT_TOP, offset) {
  const lines = [];
  for (let x = X0 + 4 + (offset % 12); x < X1 - 2; x += 12) {
    if (BUMP && x > BUMP.x - 1 && x < BUMP.x + BUMP.w + 1) continue;
    lines.push(k.lineOnTop([x, -18], [x, 18], BELT_TOP, P));
  }
  return lines.join("");
}

// ---------- dial gauge: the count slot. Needle angle = value / n over a 270° sweep; ticks every unit to n ----------
// o: { i, x, y, n, value }. Returns the gauge and `needleAt(x, value)` for the live needle.
PROPS["dial-gauge"] = { slots: { count: "needle" }, build(c, { i, x, y, n: N, value }) {
  const { k, P, at, S, L, D, slab } = c;
  const { R: DIAL_R, Z: DIAL_Z, TOP: DIAL_TOP, SPAN, FROM } = DIAL;
  const needleAt = (nx, v) => dialNeedle(k, P, nx, y, v, N);
  const out = [];
  const ped = { x: x - 13, y: y - 13, w: 26, d: 26, r: 3 };
  out.push(S(slab(ped, 0, 5, 5, 0.6), { tone: "mid", inner: L(k.sideSeam(ped, 1.6, P, 5), { tone: "faint" }) }));
  const screws = k.corners(ped, 3);
  out.push(L(screws.map(([sx, sy]) => k.ring(sx, sy, 1.2, 5, P, 10)).join(""), { tone: "faint" }));
  out.push(D(screws.map((p) => at([p[0], p[1], 5])), { size: 0.4 }));
  // lock knob on the downstream face
  out.push(S(slab({ x: x + 13, y: y - 1.2, w: 2.4, d: 2.4, r: 0.5 }, 1.4, 2.2, 2), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(x + 17.2, y, 2.2, 0.6, 3.8, P, 18), { tone: "mid" }));
  out.push(L(k.knurl(x + 17.2, y, 2.2, 0.6, 4.4, 18, P), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, 4, 5, DIAL_Z - 5, P, 24), { tone: "mid" }));
  out.push(L(k.sideArc(x, y, 4, 7.4, P, 16), { tone: "faint" }));
  out.push(`<g data-puck="${i}">${S(k.cylinder(x, y, DIAL_R, DIAL_Z, DIAL_TOP - DIAL_Z, P, 64, 0.8), { tone: "hi", crease: "lo" })}</g>`);
  out.push(L(k.knurl(x, y, DIAL_R, DIAL_TOP - 3, DIAL_TOP, 72, P, 0.3), { tone: "lo" }));
  out.push(L(k.sideArc(x, y, DIAL_R, DIAL_TOP - 3, P, 40), { tone: "faint" }));
  out.push(L(k.ring(x, y, DIAL_R - 0.7, DIAL_TOP, P, 64), { tone: "faint" }));     // glass edge
  out.push(L(k.ring(x, y, DIAL_R - 1.8, DIAL_TOP, P, 64), { tone: "lo" }));
  const t = k.radialTicks(x, y, DIAL_R - 2.4, N, 5, DIAL_TOP, [1.1, 2.4], P, FROM, SPAN);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  // zero mark and full-scale mark (n)
  const markAt = (a, len) => k.lineOnTop([x + Math.sin(a) * (DIAL_R - 2.4 - len), y - Math.cos(a) * (DIAL_R - 2.4 - len)], [x + Math.sin(a) * (DIAL_R - 2.4), y - Math.cos(a) * (DIAL_R - 2.4)], DIAL_TOP, P);
  out.push(L(markAt(FROM, 3.2) + markAt(FROM + SPAN, 3.2), { tone: "hi" }));
  out.push(L(k.ring(x, y, 1.4, DIAL_TOP, P, 16), { tone: "mid" }));
  // crown
  out.push(S(slab({ x: x + DIAL_R - 1, y: y - 2, w: 3, d: 4, r: 0.8 }, DIAL_Z + 1.8, 3.6, 3), { tone: "mid" }));
  out.push(S(slab({ x: x + DIAL_R + 1.6, y: y - 2.6, w: 1.8, d: 5.2, r: 0.8 }, DIAL_Z + 1.2, 4.8, 3), { tone: "mid" }));
  out.push(`<path data-needle="${i}" class="iso-line" data-tone="hi" data-free="start" d="${needleAt(x, value)}" style="stroke-width:1.1"/>`);
  return {
    needleAt,
    items: [{ phase: "front", part: "gauge-" + i, svg: out.join(""), bounds: [x - 13, y - 13, 0, x + 19.4, y + 13, DIAL_TOP] }],
    part: { move: [0, 30, 6], anchor: [x, y + DIAL_R, DIAL_TOP] },
  };
} };

// ---------- signal wire from a gauge pedestal back to the line ----------
PROPS["signal-wire"] = { slots: {}, build(c, { i, x, fromY, toY, z }) {
  const { k, at } = c;
  return { items: [{ phase: "front", raw: true, svg: `<g data-wire="${i}">${k.wireSvg(at([x, fromY, 2.5]), at([x, toY, z]), { via: [at([x, toY + 7, 0.6]), at([x, toY + 0.6, 0.6])], tone: "lo", size: 0.9 })}</g>`, bounds: [x - 1, toY, 0, x + 1, fromY, z] }] };
} };
