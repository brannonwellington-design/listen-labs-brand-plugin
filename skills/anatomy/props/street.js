// Street props: a city curb and what stands on it. Same contract as props/machine.js: build(c, o) → { items, part?, fit? }.
// Sidewalk top is z = 0; the road beyond the curb sits lower. Decoration never uses the accent: only data does.
// Plain source, concatenated after engine/compose.js and engine/primitives.js.

// ---------- building facade: the back wall of the sidewalk, windows and a door on the face toward the street ----------
PROPS["building-facade"] = { slots: {}, build(c, { x, y0, y1, h = 52, part = "building" }) {
  const { k, P, S, L, D, slab, faceX, rect, at } = c;
  const B = { x: x - 10, y: y0, w: 10, d: y1 - y0, r: 0.6 };
  const out = [S(slab({ x: B.x - 1, y: y0, w: 12, d: y1 - y0, r: 0.6 }, 0, 3, 3), { tone: "lo" })];
  out.push(S(slab(B, 3, h - 3, 3, 0.3), { tone: "mid", inner: L(k.sideSeam(B, 20, P, 3), { tone: "faint" }) }));
  const fx = x;
  const wins = [];
  for (let wy = y0 + 8; wy + 12 <= y1 - 6; wy += 18) {
    if (Math.abs(wy + 6) < 10) continue;   // the door sits at the middle
    wins.push(faceX(fx, rect(wy, wy + 12, 26, 40)));
  }
  out.push(L(wins.join(""), { tone: "lo" }));
  out.push(L(faceX(fx, rect(-6, 6, 3, 22)), { tone: "mid" }) + D([at([fx, 3.6, 12])], { size: 0.5, tone: "hi" }));   // door + handle
  out.push(S(slab({ x: B.x, y: y0, w: 12, d: y1 - y0, r: 0.6 }, h, 2, 3, 0.3), { tone: "mid" }));                   // parapet cap
  return { items: [{ phase: "far", part, tip: part, svg: out.join(""), bounds: [B.x - 1, y0, 0, x + 2, y1, h + 2] }],
    part: { name: "Building", move: [-20, 0, 0], anchor: [x, y1 - 8, h] }, fit: [[B.x, y0, h + 2], [B.x, y1, h + 2]] };
} };

// ---------- sidewalk ruler: the scale painted on the pavement, a tick per point, longer at the ends and the middle ----------
// o: { x0, step, min, max, y, labels?, part } — rating r sits at x0 + (r - min) * step
PROPS["sidewalk-ruler"] = { slots: { scale: "axis" }, build(c, { x0, step, min = 0, max = 10, y = 0, half = 2.2, labels = null, part = "ruler" }) {
  const { k, P, S, L, slab } = c;
  const strip = { x: x0 - 3, y: y - half, w: (max - min) * step + 6, d: 2 * half, r: 0.8 };
  const minor = [], major = [];
  for (let r = min; r <= max; r++) {
    const x = x0 + (r - min) * step, big = r === min || r === max || r === (min + max) / 2;
    if (labels) (big ? major : minor).push(k.lineOnTop([x, y - half + 0.4], [x, y - half + 2.4], 0.4, P), k.lineOnTop([x, y + half - 2.4], [x, y + half - 0.4], 0.4, P));   // short ticks at the edges; the word sits between
    else (big ? major : minor).push(k.lineOnTop([x, y - half + 0.4], [x, y + half - 0.4], 0.4, P));
  }
  // the scale's end numbers, painted on the pavement just beyond each end of the strip, where nobody stands
  // (a worded scale paints every word on the strip at its tick instead)
  const nums = labels ? labels.map((w, i) => k.faceTextSvg(k.topMatrix([x0 + i * step, y - 2.6], 0.4, P), w, { size: 5, tone: "mid", anchor: "middle" })).join("")
    : [[min, x0 - 10], [max, x0 + (max - min) * step + 9]].map(([r, x]) => k.faceTextSvg(k.topMatrix([x, y + 1.6], 0, P), String(r), { size: 5, tone: "mid", anchor: "middle" })).join("");
  const svg = S(slab(strip, 0, 0.4, 3), { tone: "hi", crease: "none" }) + L(minor.join(""), { tone: "lo", free: true }) + L(major.join(""), { tone: "mid", free: true }) + nums;
  return { items: [{ phase: "ground", part, tip: part, svg, bounds: c.box(strip, 0, 0.4) }], part: { name: "Comfort scale", move: [0, 0, 0], anchor: [x0 + ((max - min) * step) / 2, y, 0.4] } };
} };

// ---------- curb and road: the sidewalk's edge, then the street the pod waits on ----------
PROPS["curb-road"] = { slots: {}, build(c, { x, y0, y1, w = 70, part = "road" }) {
  const { k, P, S, L, slab } = c;
  const curb = { x: x, y: y0, w: 4, d: y1 - y0, r: 0.4 };
  const road = { x: x + 4, y: y0, w, d: y1 - y0, r: 4 };
  const lane = k.lineOnTop([x + 4 + w * 0.62, y0 + 6], [x + 4 + w * 0.62, y1 - 6], -3, P);
  return { items: [
    { phase: "ground", part, tip: "", svg: S(slab(road, -9, 6, 4, 0.6), { tone: "lo" }) + L(lane, { tone: "faint", dashed: true, free: true }), bounds: c.box(road, -9, -3) },
    { phase: "ground", part, tip: "", svg: S(slab(curb, -9, 9, 2, 0.3), { tone: "mid" }), bounds: c.box(curb, -9, 0) },
  ], part: { name: "Curb and road", move: [0, 0, 0], anchor: [x + 2, y1 - 6, 0] } };
} };

// ---------- traffic cone: marks a group's median on the scale (data: its position is the median) ----------
PROPS["traffic-cone"] = { slots: { median: "position" }, build(c, { x, y, lit = false, part }) {
  const { k, P, S, L, slab } = c;
  const svg = S(slab({ x: x - 3, y: y - 3, w: 6, d: 6, r: 0.8 }, 0, 0.8, 3), { tone: "lo" }) +
    [[2.4, 0.8, 2.4], [1.8, 3.2, 2.2], [1.2, 5.4, 2], [0.7, 7.4, 1.4]].map(([r, z, h]) => S(k.cylinder(x, y, r, z, h, P, 16), { tone: "hi", crease: "lo", lit })).join("");
  return { items: [{ phase: "far", part, svg, bounds: [x - 3, y - 3, 0, x + 3, y + 3, 8.8] }], part: { name: "Median", move: [0, 0, 12], anchor: [x, y, 8.8] } };
} };

// ---------- driverless pod: a boxy, symmetric vehicle, no driver's seat; glass band, carriage doors, light bars ----------
PROPS["robotaxi-pod"] = { slots: {}, build(c, { x, y, part = "pod" }) {
  const { k, P, S, L, D, slab, faceY, faceX, rect, at } = c;
  const W = 34, Dp = 22, z0 = -3;
  const B = { x: x - W / 2, y: y - Dp / 2, w: W, d: Dp, r: 5 };
  const out = [];
  for (const [wx, wy] of c.byDepth([[B.x + 6, B.y + 1], [B.x + W - 6, B.y + 1], [B.x + 6, B.y + Dp - 1], [B.x + W - 6, B.y + Dp - 1]])) out.push(S(k.cylinder(wx, wy, 3.4, z0, 3.4, P, 20), { tone: "lo" }));
  out.push(S(slab(B, z0 + 2.4, 10, 6, 0.6), { tone: "mid", inner: L(k.sideSeam(B, z0 + 6, P, 6), { tone: "faint" }) }));                   // lower body
  out.push(S(slab(k.insetPlan(B, 0.6), z0 + 12.4, 9, 6, 0.4), { tone: "hi", crease: "lo" }));                                           // glass band
  out.push(S(slab(B, z0 + 21.4, 3, 6, 0.8), { tone: "mid" }));                                                                          // roof
  const fy = B.y + Dp, fx = B.x + W;
  out.push(L(faceY(fy, rect(x - 7, x + 7, z0 + 3.4, z0 + 21)) + k.segment([x, fy, z0 + 3.4], [x, fy, z0 + 21], P), { tone: "lo" }));   // carriage doors
  for (const ex of [B.x + 1, fx - 1]) out.push(L(k.segment([ex, B.y + 4, z0 + 9], [ex, B.y + Dp - 4, z0 + 9], P), { tone: "mid", free: true }));      // light bars, both ends
  out.push(L(faceX(fx, rect(B.y + 5, B.y + Dp - 5, z0 + 7.5, z0 + 10.5)), { tone: "lo" }));
  out.push(D([at([x, B.y + Dp / 2, z0 + 24.4])], { size: 0.6, tone: "hi" }));                                                             // roof sensor
  return { items: [{ phase: "near", part, tip: part, svg: out.join(""), bounds: [B.x, B.y, z0, B.x + W, B.y + Dp, z0 + 24.4] }],
    part: { name: "Driverless pod", move: [26, 0, 0], anchor: [x, fy, z0 + 24.4] }, fit: [[B.x + W, B.y + Dp, z0], [B.x, B.y, z0 + 25]] };
} };

// ---------- street lamps along the curb: lit for the late-night situation (decoration) ----------
PROPS["street-lamps"] = { slots: {}, build(c, { x, ys, h = 48, lit = true, part = "lamps" }) {
  const { k, P, S, D, slab, at } = c;
  return { items: ys.map((y) => ({ phase: "near", part, tip: "", bounds: [x - 12, y - 2, 0, x + 2, y + 2, h + 3],
    svg: S(k.cylinder(x, y, 2, 0, 1.4, P, 16), { tone: "lo" }) + S(k.cylinder(x, y, 0.8, 1.4, h - 1.4, P, 10), { tone: "mid", crease: "none" }) +
      S(slab({ x: x - 10, y: y - 0.8, w: 10.8, d: 1.6, r: 0.3 }, h, 1.4, 2), { tone: "mid" }) +
      S(slab({ x: x - 12, y: y - 2, w: 4, d: 4, r: 0.8 }, h - 2.2, 2.2, 3, 0.3), { tone: "hi", crease: "lo" }) +
      (lit ? D([at([x - 10, y, h - 2.4])], { size: 0.8, tone: "hi" }) : "") })),
    part: { name: "Street lamps", move: [0, 0, 20], anchor: [x - 10, ys[0], h] } };
} };

// ---------- airport canopy over the curb, with luggage waiting (decoration) ----------
PROPS["airport-canopy"] = { slots: {}, build(c, { x0, x1, y0, y1, h = 44, part = "canopy" }) {
  const { k, P, S, L, slab, faceX, rect } = c;
  const post = (x, y) => S(slab({ x: x - 1, y: y - 1, w: 2, d: 2, r: 0.3 }, 0, h, 2), { tone: "mid" });
  const roof = { x: x0 - 2, y: y0 - 2, w: x1 - x0 + 4, d: y1 - y0 + 4, r: 1 };
  const bag = (x, y, tall) => S(slab({ x, y, w: 5, d: 3, r: 0.8 }, 0.6, tall ? 8 : 6, 3, 0.3), { tone: "hi", crease: "lo" }) + S(slab({ x: x + 2, y: y + 1, w: 1, d: 1, r: 0.2 }, tall ? 8.6 : 6.6, 3, 2), { tone: "mid" });
  return { items: [
    { phase: "near", part, tip: "", svg: post(x0, y0) + post(x1, y0), bounds: [x0 - 1, y0 - 1, 0, x1 + 1, y0 + 1, h] },
    { phase: "near", part, tip: "", svg: post(x0, y1) + post(x1, y1) + S(slab(roof, h, 2, 3, 0.4), { tone: "mid" }) +
      S(slab({ x: x1 - 1, y: (y0 + y1) / 2 - 12, w: 1.2, d: 24, r: 0.3 }, h - 9, 7, 2), { tone: "lo" }) + L(faceX(x1 + 0.2, rect((y0 + y1) / 2 - 10, (y0 + y1) / 2 + 10, h - 7.5, h - 3.5)), { tone: "faint" }),
      bounds: [x0 - 2, y0 - 2, 0, x1 + 2, y1 + 2, h + 2] },
    { phase: "near", part, tip: "", svg: bag(x1 - 4, y1 + 4, true) + bag(x1 - 4, y1 + 8, false), bounds: [x1 - 4, y1 + 4, 0, x1 + 1, y1 + 11, 12] },
  ], part: { name: "Airport canopy", move: [0, 0, 22], anchor: [(x0 + x1) / 2, y1, h + 2] } };
} };

// ---------- planters along the curb: a daytime street (decoration) ----------
PROPS.planters = { slots: {}, build(c, { x, ys, part = "planters" }) {
  const { k, P, S, slab } = c;
  return { items: ys.map((y) => ({ phase: "near", part, tip: "", bounds: [x - 4, y - 4, 0, x + 4, y + 4, 16],
    svg: S(slab({ x: x - 4, y: y - 4, w: 8, d: 8, r: 0.8 }, 0, 6, 3, 0.4), { tone: "mid" }) + S(k.cylinder(x, y, 3.6, 6, 7, P, 18, 1.2), { tone: "hi", crease: "lo" }) })),
    part: { name: "Planters", move: [0, 0, 14], anchor: [x, ys[0], 13] } };
} };

// ---------- end-of-lane props for a lineup street (worlds/curb.world.js `scenery`) ----------
// Each declares its footprint [along the scale, across it] and builds centred at (x, y); the street places it past one
// end of a lane. Faces toward +x and +y are the ones the viewer sees.

// sedan: a low body with a long bonnet, a glass cabin set back, tyres showing at the sides. state "damaged": skewed where
// it stopped, the nose crumpled, a cracked windscreen, the bumper on the road and a flat tyre
PROPS.sedan = { slots: {}, footprint: [34, 20], build(c, { x, y, state = "repaired", part = "sedan" }) {
  const { k, P, S, L, at } = c;
  const W = 30, Dp = 13, hurt = state === "damaged", ang = hurt ? -0.32 : 0;
  const cs = Math.cos(ang), sn = Math.sin(ang);
  const pt = (u, v) => [x + u * cs - v * sn, y + u * sn + v * cs];               // car frame (u along, v across) → world
  const box = (u0, u1, v0, v1, ch = 1.2) => [[u0 + ch, v0], [u1 - ch, v0], [u1, v0 + ch], [u1, v1 - ch], [u1 - ch, v1], [u0 + ch, v1], [u0, v1 - ch], [u0, v0 + ch]].map(([u, v]) => pt(u, v));
  const solid = (ring, z, h, style) => S(k.extrude(ring, z, h, P, { convex: true, bevel: 0.3 }), style);
  const nose = hurt ? W / 2 - 4 : W / 2, out = [];
  const tyres = [[-W / 2 + 6, -Dp / 2 - 0.2], [W / 2 - 7, -Dp / 2 - 0.2], [-W / 2 + 6, Dp / 2 + 0.2], [W / 2 - 7, Dp / 2 + 0.2]].map(([u, v]) => ({ u, v, p: pt(u, v) }));
  for (const t of [...tyres].sort((a, b) => k.depthOf([a.p[0], a.p[1], 0], P) - k.depthOf([b.p[0], b.p[1], 0], P))) {
    const flat = hurt && t.u > 0 && t.v > 0;
    out.push(S(k.cylinder(t.p[0], t.p[1], flat ? 3.2 : 2.8, 0, flat ? 1.2 : 2.6, P, 18), { tone: "lo" }));
  }
  out.push(solid(box(-W / 2, nose, -Dp / 2, Dp / 2, 2.4), 1.6, 4.6, { tone: "mid" }));                                         // body
  out.push(solid(box(-W / 2 + 6, 3, -Dp / 2 + 1.4, Dp / 2 - 1.4, 1.6), 6.2, 3.4, { tone: "hi", crease: "lo" }));               // glass
  out.push(solid(box(-W / 2 + 7, 1.6, -Dp / 2 + 1.8, Dp / 2 - 1.8, 1.4), 9.6, 1, { tone: "mid" }));                            // roof
  const line = (pts) => k.pathOf(pts.map(([u, v, z]) => at([...pt(u, v), z])));
  if (hurt) {
    const zig = []; for (let i = 0; i <= 6; i++) zig.push([nose - 3 + (i % 2 ? 2.2 : 0), -Dp / 2 + 1 + (i * (Dp - 2)) / 6, 6.2]);
    out.push(L(line(zig), { tone: "mid", free: true }));                                                                         // crumpled bonnet
    out.push(L(line([[3, -2.5, 9.2], [3, 0.5, 7.6], [3, -0.5, 6.6]]) + line([[3, 0.5, 7.6], [3, 3.5, 8.8]]), { tone: "lo", free: true }));   // cracked windscreen
    const bump = [[W / 2 + 2, -Dp / 2 + 1], [W / 2 + 4, -Dp / 2 + 1.6], [W / 2 + 3, Dp / 2 - 1], [W / 2 + 1, Dp / 2 - 1.6]].map(([u, v]) => pt(u, v));
    out.push(S(k.extrude(bump, 0, 1.4, P, { convex: true }), { tone: "lo" }));                                                  // bumper on the road
  } else {
    out.push(L(line([[W / 2, -Dp / 2 + 2, 4.4], [W / 2, -Dp / 2 + 4.4, 4.4]]) + line([[W / 2, Dp / 2 - 4.4, 4.4], [W / 2, Dp / 2 - 2, 4.4]]), { tone: "lo", free: true }));   // headlamps
  }
  const all = [...box(-W / 2, W / 2 + 4, -Dp / 2 - 3, Dp / 2 + 3)];
  const xs = all.map((q) => q[0]), ys = all.map((q) => q[1]);
  return { items: [{ phase: "near", part, tip: part, svg: out.join(""), bounds: [Math.min(...xs), Math.min(...ys), 0, Math.max(...xs), Math.max(...ys), 10.6] }],
    part: { name: hurt ? "Damaged car" : "Repaired car", move: [0, 0, 14], anchor: [x, y, 10.6] } };
} };

// house: walls, a stepped hip roof, windows and a door. state "damaged": a tarp tied over the roof, boarded windows, water
PROPS.house = { slots: {}, footprint: [26, 24], build(c, { x, y, state = "repaired", part = "house" }) {
  const { k, P, S, L, D, slab, faceX, faceY, rect, at } = c;
  const W = 24, Dp = 22, Hh = 17, hurt = state === "damaged";
  const B = { x: x - W / 2, y: y - Dp / 2, w: W, d: Dp, r: 0.6 };
  const out = [S(slab(k.insetPlan(B, -1), 0, 1.4, 3), { tone: "lo" })];
  out.push(S(slab(B, 1.4, Hh - 1.4, 3, 0.3), { tone: "mid" }));
  const roof = [[-1.6, 0], [1.2, 2.4], [4.2, 2.4], [7.2, 2.4]];
  let z = Hh;
  roof.forEach(([inset, h], i) => { const pl = k.insetPlan(B, inset); out.push(S(slab(pl, z, i ? h : 1.6, 3, 0.3), { tone: i === 3 ? "hi" : "mid", crease: "lo" })); z += i ? h : 1.6; });
  const fy = B.y + Dp, fx = B.x + W;
  const wins = [faceY(fy, rect(B.x + 3, B.x + 9, 7, 12)), faceY(fy, rect(B.x + W - 9, B.x + W - 3, 7, 12)), faceX(fx, rect(B.y + 3, B.y + 8, 7, 12))];
  out.push(L(wins.join(""), { tone: "lo" }));
  out.push(L(faceX(fx, rect(y + 1, y + 7, 1.4, 12)), { tone: "mid" }));                                                   // door
  if (hurt) {
    // boards across each window, a tarp over one side of the roof tied down to stakes, a puddle by the door
    const X = (a0, a1, z0, z1, face, at0) => k.pathOf([[a0, z0], [a1, z1]].map(([a, zz]) => at(face === "y" ? [a, at0, zz] : [at0, a, zz]))) + k.pathOf([[a0, z1], [a1, z0]].map(([a, zz]) => at(face === "y" ? [a, at0, zz] : [at0, a, zz])));
    out.push(L(X(B.x + 3, B.x + 9, 7, 12, "y", fy) + X(B.x + W - 9, B.x + W - 3, 7, 12, "y", fy) + X(B.y + 3, B.y + 8, 7, 12, "x", fx), { tone: "mid", free: true }));
    const tarp = { x: B.x - 1, y: y - 1, w: W + 2, d: Dp / 2 + 2.4, r: 0.6 };
    out.push(S(slab(tarp, Hh + 1.6, 0.8, 3, 0.2), { tone: "lo", crease: "none" }));
    const ties = [[tarp.x + 2, tarp.y + tarp.d], [tarp.x + tarp.w - 2, tarp.y + tarp.d]];
    out.push(L(ties.map(([tx, ty]) => k.segment([tx, ty, Hh + 1.6], [tx + (tx > x ? 4 : -4), ty + 4, 0], P)).join(""), { tone: "lo", free: true }));
    out.push(D(ties.map(([tx, ty]) => at([tx + (tx > x ? 4 : -4), ty + 4, 0])), { size: 0.5, tone: "mid" }));
    out.push(L(k.ring(fx + 6, y + 6, 4, 0.2, P, 20) + k.ring(fx + 5, y + 6, 2, 0.2, P, 14), { tone: "faint", free: true }));
  } else {
    out.push(D([at([fx, y + 5.8, 6.4])], { size: 0.45, tone: "hi" }));                                                     // door handle
    out.push(S(slab({ x: fx + 1.5, y: B.y + 2, w: 3, d: 8, r: 0.5 }, 0, 2.6, 3, 0.2), { tone: "mid" }) + S(k.cylinder(fx + 3, B.y + 4, 1.3, 2.6, 2.2, P, 12, 0.4), { tone: "hi", crease: "lo" }) + S(k.cylinder(fx + 3, B.y + 8, 1.3, 2.6, 2.2, P, 12, 0.4), { tone: "hi", crease: "lo" }));   // planter
  }
  return { items: [{ phase: "near", part, tip: part, svg: out.join(""), bounds: [B.x - 1, B.y - 1, 0, fx + (hurt ? 10 : 5), fy + 1, z] }],
    part: { name: hurt ? "Damaged house" : "Repaired house", move: [0, 0, 18], anchor: [x, y, z] } };
} };

// body shop: a garage with a roll-up door facing the viewer and a sign band above it
PROPS["body-shop"] = { slots: {}, footprint: [30, 26], build(c, { x, y, part = "shop" }) {
  const { k, P, S, L, slab, faceY, rect } = c;
  const W = 30, Dp = 26, Hh = 22;
  const B = { x: x - W / 2, y: y - Dp / 2, w: W, d: Dp, r: 0.6 };
  const out = [S(slab(B, 0, Hh, 3, 0.3), { tone: "mid", inner: L(k.sideSeam(B, Hh - 4, P, 3), { tone: "faint" }) })];
  out.push(S(slab(k.insetPlan(B, -0.6), Hh, 1.6, 3, 0.3), { tone: "mid" }));
  const fy = B.y + Dp, d0 = B.x + 5, d1 = B.x + W - 5;
  const ribs = []; for (let zz = 3; zz < 15; zz += 2.4) ribs.push(k.segment([d0 + 0.6, fy, zz], [d1 - 0.6, fy, zz], P));
  out.push(L(faceY(fy, rect(d0, d1, 0, 15)), { tone: "mid" }) + L(ribs.join(""), { tone: "faint", free: true }));
  out.push(S(slab({ x: d0, y: fy, w: d1 - d0, d: 0.8, r: 0.2 }, 16.5, 3, 2), { tone: "hi", crease: "lo" }));              // sign band
  return { items: [{ phase: "far", part, tip: part, svg: out.join(""), bounds: [B.x - 0.6, B.y - 0.6, 0, B.x + W + 0.6, fy + 0.8, Hh + 1.6] }],
    part: { name: "Body shop", move: [0, 0, 20], anchor: [x, y, Hh + 1.6] } };
} };
