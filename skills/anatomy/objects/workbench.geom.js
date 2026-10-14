// Workbench geometry: pure function of (kit, spec, projection). Runs in Node and in the browser.
function workbenchGeometry(k, spec, P) {
  const BENCH_W = 84, BENCH_D = 48, TOP_Z = 30, TOP_H = 4;
  const TOP = TOP_Z + TOP_H;
  const DIAL_R = 8.5, DIAL_Z = 36, DIAL_TOP = 41;
  const SPAN = Math.PI * 1.5, FROM = -Math.PI * 0.75;
  const TUBE_R = 3, TUBE_Z = 39, TUBE_H = 26;
  const dialAt = (bx, j) => [bx - 26 + j * 20, 12];


  const benches = spec.benches;
  const front = [];
  const SP = 122;
  const BX = benches.map((_, i) => (i - (benches.length - 1) / 2) * SP);
  const PLATE = { x: BX[0] - 62, y: -42, w: BX[BX.length - 1] - BX[0] + 124, d: 92, r: 8 };
  const at = (p) => k.iso(p, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const D = (pts, style) => k.dotsSvg(pts, style);
  const slab = (plan, z, h, steps = 3, bevel = 0) => k.slabOf(plan, z, h, P, steps, bevel);
  const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  const faceY = (y, pts) => k.pathOf(pts.map(([x, z]) => at([x, y, z])), true);
  const rect = (a0, a1, z0, z1) => [[a0, z0], [a1, z0], [a1, z1], [a0, z1]];
  const [vx, vy] = k.towardViewer(P);
  const side = [-vy, vx];   // floor direction to a vertical cylinder's silhouette

  function plate() {
    const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -15, 10, P)}"/>`];
    for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
      out.push(S(k.cylinder(x, y, 7, -15, 1.6, P, 28), { tone: "lo" }));
      out.push(S(k.cylinder(x, y, 5.4, -13.4, 3.4, P, 28), { tone: "mid" }));
    }
    out.push(S(k.slabOf(PLATE, -10, 10, P, 8, 1.6), { tone: "mid" }));
    out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
    const screws = k.corners(PLATE, 10);
    out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
    out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
    const strip = { x: PLATE.x + 40, y: PLATE.y + PLATE.d - 13, w: PLATE.w - 80, d: 6, r: 1 };
    out.push(S(slab(strip, 0, 0.6, 3), { tone: "lo", crease: "none" }));
    const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [1.8, 3.2], P);
    out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
    out.push(D([at([strip.x + 2, strip.y + 3, 0.6]), at([strip.x + strip.w - 2, strip.y + 3, 0.6])], { size: 0.45 }));
    return out.join("");
  }

  const needleAt = (cx, cy, pct) => {
    const a = FROM + (pct / 100) * SPAN;
    return k.lineOnTop([cx - Math.sin(a) * 2, cy + Math.cos(a) * 2], [cx + Math.sin(a) * (DIAL_R - 2.6), cy - Math.cos(a) * (DIAL_R - 2.6)], DIAL_TOP + 0.2, P);
  };

  function bench(b, i) {
    const bx = BX[i];
    const out = [];
    const legs = [[bx - 37, -19], [bx + 33, -19], [bx - 37, 15], [bx + 33, 15]];
    const leg = ([x, y]) => S(k.cylinder(x + 2, y + 2, 3.2, 0, 1, P, 16), { tone: "lo" }) + S(slab({ x, y, w: 4, d: 4, r: 0.6 }, 1, TOP_Z - 1, 2, 0.3), { tone: "mid" });
    out.push(leg(legs[0]), leg(legs[1]));
    // lower shelf with a parts bin on it
    const shelf = { x: bx - 37, y: -19, w: 74, d: 38, r: 1 };
    out.push(S(slab(shelf, 9, 2, 3, 0.4), { tone: "lo" }));
    out.push(S(slab({ x: bx - 28, y: -12, w: 22, d: 16, r: 1 }, 11, 7, 3, 0.4), { tone: "mid", inner: L(k.sideSeam({ x: bx - 28, y: -12, w: 22, d: 16, r: 1 }, 14, P, 3), { tone: "faint" }) }));
    out.push(S(slab({ x: bx + 4, y: -10, w: 26, d: 14, r: 1 }, 11, 4, 3, 0.4), { tone: "mid" }));
    out.push(leg(legs[2]), leg(legs[3]));
    // top and apron label
    const top = { x: bx - BENCH_W / 2, y: -BENCH_D / 2, w: BENCH_W, d: BENCH_D, r: 2 };
    out.push(S(slab(top, TOP_Z, TOP_H, 4, 0.8), { tone: "mid" }));
    out.push(L(faceY(BENCH_D / 2, rect(bx - 12, bx + 12, TOP_Z + 0.8, TOP_Z + 3.2)), { tone: "lo" }));
    out.push(L(k.segment([bx - 10, BENCH_D / 2, TOP_Z + 2], [bx - 1, BENCH_D / 2, TOP_Z + 2], P), { tone: "lo", free: true }));
    // pegboard with perforations, a shelf and three bottles
    out.push(`<g data-part="peg-${i}">`);
    const peg = { x: bx - BENCH_W / 2, y: -BENCH_D / 2 - 2, w: BENCH_W, d: 2, r: 0.4 };
    out.push(S(slab(peg, TOP, 40, 2, 0.5), { tone: "mid" }));
    const holes = [];
    for (let x = bx - 37; x <= bx + 37; x += 5) for (let z = TOP + 5; z <= TOP + 36; z += 5) if (!(x < bx - 4 && z > TOP + 20 && z < TOP + 30)) holes.push(at([x, -BENCH_D / 2, z]));
    out.push(D(holes, { size: 0.42, tone: "lo" }));
    const ps = { x: bx - 38, y: -BENCH_D / 2, w: 32, d: 7, r: 0.6 };
    out.push(S(slab({ x: bx - 36, y: -BENCH_D / 2, w: 1.4, d: 5, r: 0.2 }, TOP + 19, 5, 1), { tone: "mid" }));
    out.push(S(slab({ x: bx - 9.4, y: -BENCH_D / 2, w: 1.4, d: 5, r: 0.2 }, TOP + 19, 5, 1), { tone: "mid" }));
    out.push(S(slab(ps, TOP + 24, 1.4, 2, 0.3), { tone: "mid" }));
    for (const [x, h] of [[bx - 31, 6], [bx - 23, 8], [bx - 15, 5]]) {
      out.push(S(k.cylinder(x, -BENCH_D / 2 + 3.5, 2.6, TOP + 25.4, h, P, 20), { tone: "mid" }));
      out.push(S(k.cylinder(x, -BENCH_D / 2 + 3.5, 1.4, TOP + 25.4 + h, 1.4, P, 14), { tone: "mid" }));
    }
    out.push(`</g>`);
    // mechanical counter: past-month users
    out.push(`<g data-part="counter-${i}">`);
    const box = { x: bx - 38, y: -20, w: 30, d: 15, r: 1.6 };
    out.push(`<g data-counter="${i}">${S(slab(box, TOP, 14, 3, 0.6), { tone: "hi", crease: "lo", inner: L(k.sideSeam(box, TOP + 3, P, 3), { tone: "faint" }) })}</g>`);
    const fy = box.y + box.d;
    const wx0 = bx - 35, wx1 = bx - 14, wz0 = TOP + 4, wz1 = TOP + 11;
    out.push(L(faceY(fy, rect(wx0, wx1, wz0, wz1)), { tone: "mid" }));
    const cell = (wx1 - wx0) / 3;
    out.push(L([1, 2].map((c) => k.segment([wx0 + c * cell, fy, wz0], [wx0 + c * cell, fy, wz1], P)).join(""), { tone: "lo" }));
    const digits = String(b.users).padStart(3, "0");
    for (let c = 0; c < 3; c++) {
      out.push(`<g data-digit="${i}-${c}">${k.faceTextSvg(k.sideMatrix([wx0 + (c + 0.5) * cell, fy], wz0 + 1.6, P, "left"), digits[c], { size: 5.2, tone: "hi", anchor: "middle" })}</g>`);
    }
    out.push(S(k.cylinder(bx - 13, -14, 2.2, TOP + 14, 2.4, P, 16), { tone: "mid" }));        // tally plunger
    out.push(S(k.cylinder(bx - 13, -14, 1.2, TOP + 16.4, 1.2, P, 12), { tone: "hi", crease: "lo" }));
    out.push(D(k.corners(box, 2).map(([x, y]) => at([x, y, TOP + 14])), { size: 0.38 }));
    out.push(`</g>`);
    // tube rack: reasons for choosing it, 0–100 % scale
    const base = { x: bx - 2, y: -22, w: 38, d: 13, r: 1.5 };
    const tubesX = [bx + 7, bx + 18, bx + 29], ty = -15;
    const back = { x: bx - 1, y: -22, w: 36, d: 1.2, r: 0.2 };
    out.push(S(slab(base, TOP, 3, 3, 0.5), { tone: "mid" }));
    out.push(S(slab(back, TOP + 3, TUBE_Z + TUBE_H + 2 - TOP - 3, 1, 0.2), { tone: "mid" }));
    const strip = { x: bx - 1, y: -20.8, w: 2.4, d: 0.5, r: 0 };
    out.push(S(slab(strip, TUBE_Z - 0.5, TUBE_H + 1, 1), { tone: "mid", crease: "lo" }));
    const sMin = [], sMaj = [];
    for (let q = 0; q <= 10; q++) (q % 5 === 0 ? sMaj : sMin).push(k.segment([bx - 1, -20.3, TUBE_Z + (q / 10) * TUBE_H], [bx - 1 + (q % 5 === 0 ? 2.2 : 1.2), -20.3, TUBE_Z + (q / 10) * TUBE_H], P));
    out.push(L(sMin.join(""), { tone: "lo" }), L(sMaj.join(""), { tone: "mid" }));
    b.reasons.forEach((r, j) => {
      out.push(`<g data-tipkey="tube-${i}-${j}">`);
      const x = tubesX[j];
      out.push(S(k.cylinder(x, ty, TUBE_R + 0.8, TOP + 3, TUBE_Z - TOP - 3, P, 20), { tone: "mid" }));
      out.push(L(k.ring(x, ty, TUBE_R, TUBE_Z, P, 20), { tone: "lo" }));
      const h = Math.max(0.4, (r.pct / 100) * TUBE_H);
      out.push(`<g data-fill="${i}-${j}">${S(k.cylinder(x, ty, TUBE_R - 0.5, TUBE_Z, h, P, 20), { tone: "hi", crease: "lo" })}</g>`);
      const e = [x + side[0] * TUBE_R, ty + side[1] * TUBE_R], w = [x - side[0] * TUBE_R, ty - side[1] * TUBE_R];
      // glass sits in the front layer, over the liquid canvas
      front.push(L(k.segment([e[0], e[1], TUBE_Z], [e[0], e[1], TUBE_Z + TUBE_H], P) + k.segment([w[0], w[1], TUBE_Z], [w[0], w[1], TUBE_Z + TUBE_H], P), { tone: "lo" }));
      front.push(L(k.ring(x, ty, TUBE_R, TUBE_Z + TUBE_H, P, 20), { tone: "lo" }));
      out.push(`</g>`);
    });
    // dials: appeal (left) and trust (right)
    out.push(`<g data-part="dials-${i}">`);
    for (const [j, val] of [[0, b.appeal], [1, b.trust]]) {
      out.push(`<g data-tipkey="dial-${i}-${j}">`);
      const [cx, cy] = dialAt(bx, j);
      const ped = { x: cx - 9.5, y: cy - 9.5, w: 19, d: 19, r: 2 };
      out.push(S(slab(ped, TOP, 2, 3, 0.4), { tone: "mid" }));
      out.push(D(k.corners(ped, 2).map(([x, y]) => at([x, y, TOP + 2])), { size: 0.35 }));
      out.push(S(k.cylinder(cx, cy, DIAL_R, DIAL_Z, DIAL_TOP - DIAL_Z, P, 56, 0.6), { tone: "hi", crease: "lo" }));
      out.push(L(k.knurl(cx, cy, DIAL_R, DIAL_TOP - 2.2, DIAL_TOP, 48, P, 0.3), { tone: "lo" }));
      out.push(L(k.sideArc(cx, cy, DIAL_R, DIAL_TOP - 2.2, P, 32), { tone: "faint" }));
      if (val == null) {
        // capped: the analysis reports no value
        out.push(S(slab({ x: cx - 2, y: cy - DIAL_R - 2.4, w: 4, d: 2.6, r: 0.4 }, DIAL_TOP - 1, 2.6, 2), { tone: "mid" }));
        out.push(S(k.cylinder(cx, cy, DIAL_R + 0.6, DIAL_TOP, 1.4, P, 56, 0.4), { tone: "mid" }));
        out.push(L(k.ring(cx, cy, DIAL_R - 2, DIAL_TOP + 1.4, P, 40), { tone: "faint" }));
        out.push(S(k.cylinder(cx, cy + 5, 1.2, DIAL_TOP + 1.4, 1, P, 12), { tone: "mid" }));
      } else {
        out.push(L(k.ring(cx, cy, DIAL_R - 1.4, DIAL_TOP, P, 48), { tone: "lo" }));
        const ticks = k.radialTicks(cx, cy, DIAL_R - 2, 20, 4, DIAL_TOP, [0.9, 1.9], P, FROM, SPAN);
        out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
        out.push(L(k.ring(cx, cy, 1, DIAL_TOP, P, 12), { tone: "mid" }));
        out.push(`<path data-needle="${i}-${j}" class="iso-line" data-tone="hi" data-free="start" d="${needleAt(cx, cy, val)}" style="stroke-width:1"/>`);
      }
      out.push(`</g>`);
    }
    out.push(`</g>`);
    // clipboard with notes, front right
    out.push(`<g data-part="clip-${i}">`);
    const cb = { x: bx + 12, y: 4, w: 22, d: 16, r: 1 };
    out.push(S(slab(cb, TOP, 0.8, 3, 0.2), { tone: "mid" }));
    out.push(S(slab({ x: bx + 13.4, y: 5.4, w: 19.2, d: 13.2, r: 0.3 }, TOP + 0.8, 0.3, 1), { tone: "hi", crease: "none" }));
    [0.25, 0.42, 0.59, 0.76].forEach((f, n) => out.push(L(k.lineOnTop([bx + 15, 5.4 + 13.2 * f], [bx + 15 + (n % 2 ? 11 : 14), 5.4 + 13.2 * f], TOP + 1.1, P), { tone: "lo", free: true })));
    out.push(S(slab({ x: bx + 19, y: 3.4, w: 8, d: 3, r: 0.8 }, TOP + 0.8, 1.6, 2, 0.2), { tone: "mid" }));
    out.push(`</g>`);
    return `<g data-bench="${i}" data-part="bench-${i}">${out.join("")}</g>`;
  }

  // ---------- parts registry (see worlds/conveyor.world.js): the bench, its top and the tube rack stay put
  // (the liquid shader and the glass layer are drawn in world space); what sits on it comes off.
  // Only the instruments carry a station (and the accent): the bench and pegboard are furniture.
  const parts = [
    { key: "base", name: "Base plate", move: [0, 0, 0], anchor: [PLATE.x + 30, PLATE.y + PLATE.d - 16, 0], station: -1 },
    ...benches.flatMap((b, i) => {
      const bx = BX[i];
      return [
        { key: "bench-" + i, name: b.name + " bench", move: [0, 0, 0], anchor: [bx, BENCH_D / 2, TOP], station: -1 },
        { key: "peg-" + i, name: b.name + " pegboard", move: [0, -20, 6], anchor: [bx, -BENCH_D / 2 - 2, TOP + 40], station: -1 },
        { key: "counter-" + i, name: b.name + " counter", move: [0, 0, 24], anchor: [bx - 23, -12.5, TOP + 14], station: i },
        { key: "dials-" + i, name: b.name + " dials", move: [0, 18, 4], anchor: [bx - 16, 12, DIAL_TOP], station: i },
        { key: "clip-" + i, name: b.name + " clipboard", move: [8, 20, 0], anchor: [bx + 23, 12, TOP + 1.1], station: i },
      ];
    }),
  ];
  const body = [`<g data-part="base">${plate()}</g>`, ...benches.map((b, i) => bench(b, i))];
  return { body: body.join(""), front: front.join(""), needleAt, parts };
}
