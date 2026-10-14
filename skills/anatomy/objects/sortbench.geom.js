// Sort bench geometry: pure function of the kit, the token count and a projection.
// Runs at build time (Node) and in the browser when the camera orbits.
// shape = { cols, drawers }: the sorter gets as many columns as the widest exclusive sort (2–5) and the cabinet
// as many drawers as the longest reason list (1–7); the rail, drive and cabinet height follow.
function sortbenchGeometry(k, N, P, shape = { cols: 5, drawers: 7 }) {
  // ---------- world layout ----------
  const PLATE = { x: -232, y: -56, w: 282, d: 116, r: 8 };
  const CAB_SHIFT = -44;   // cabinet is modelled at x 4..70 and slid left by this much
  const PLATE_H = 10, FOOT_H = 5;
  // sorter
  const COLS = [-200, -174, -148, -122, -96].slice(0, shape.cols);
  const RIGHT = COLS[COLS.length - 1] + 22;           // drive column; the rail runs from the end post to here
  const DX = RIGHT + 74;                              // drive parts were modelled at x -74
  const COIN_R = 4.5, COIN_H = 2.2, BASE_Z = 6;
  const BOARD_TOP = 58, RAIL_Z = 62, FLY_Z = 70;
  const SUB = { x: -216, y: -16, w: RIGHT - 8 + 216, d: 30, r: 2 };
  // cabinet
  const CAB = { x: 4, y: -46, w: 66, d: 52 };
  const FRONT_Y = 6;
  const DRAWERS = shape.drawers, PITCH = 10, DRAWER_Z0 = 7;
  const TOPZ = DRAWER_Z0 + DRAWERS * PITCH + 1;       // cabinet top: 78 with seven drawers
  const PULL_MAX = 44;
  const drawerZ = (i) => DRAWER_Z0 + (DRAWERS - 1 - i) * PITCH;


  const at = (p) => k.iso(p, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const D = (pts, style) => k.dotsSvg(pts, style);
  const slab = (plan, z, h, steps = 3, bevel = 0) => k.slabOf(plan, z, h, P, steps, bevel);
  const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  const faceY = (y, pts) => k.pathOf(pts.map(([x, z]) => at([x, y, z])), true);
  const faceX = (x, pts) => k.pathOf(pts.map(([y, z]) => at([x, y, z])), true);
  const rect = (a0, a1, z0, z1) => [[a0, z0], [a1, z0], [a1, z1], [a0, z1]];
  const stadium = (c0, c1, len, h, steps = 6) => {
    const r = h / 2, half = len / 2 - r, pts = [];
    for (let i = 0; i <= steps; i++) { const a = -Math.PI / 2 + (i / steps) * Math.PI; pts.push([c0 + half + Math.cos(a) * r, c1 + Math.sin(a) * r]); }
    for (let i = 0; i <= steps; i++) { const a = Math.PI / 2 + (i / steps) * Math.PI; pts.push([c0 - half + Math.cos(a) * r, c1 + Math.sin(a) * r]); }
    return pts;
  };

  // ---------- base plate ----------
  function plate() {
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
    out.push(L(k.planOutline({ x: -222, y: 26, w: 262, d: 3, r: 1.5 }, 0, P, 4), { tone: "lo" }));   // T-slot
    const strip = { x: -176, y: PLATE.y + PLATE.d - 15, w: 124, d: 7, r: 1 };
    out.push(S(slab(strip, 0, 0.6, 3), { tone: "lo", crease: "none" }));
    const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
    out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
    out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
    const label = { x: -224, y: 34, w: 34, d: 18, r: 1.5 };
    out.push(S(slab(label, 0, 0.8, 4), { tone: "lo", crease: "none" }));
    out.push(L(k.planOutline(k.insetPlan(label, 1.6), 0.8, P, 4), { tone: "faint" }));
    [[0.3, 0.8], [0.5, 0.55], [0.7, 0.7]].forEach(([f, len]) => {
      const yy = label.y + label.d * f;
      out.push(L(k.lineOnTop([label.x + 4, yy], [label.x + 4 + (label.w - 8) * len, yy], 0.8, P), { tone: "lo", free: true }));
    });
    out.push(D([at([label.x + 2.4, label.y + 2.4, 0.8]), at([label.x + label.w - 2.4, label.y + label.d - 2.4, 0.8])], { size: 0.4 }));
    return out.join("");
  }

  // ---------- sorter ----------
  function sorterBack() {
    const out = [];
    out.push(`<g data-part="sorter-stand">`);
    // sub-base with column label holders on its front face
    out.push(S(slab(SUB, 0, 4, 4, 0.6), { tone: "mid" }));
    out.push(D(k.corners(SUB, 2.4).map(([x, y]) => at([x, y, 4])), { size: 0.4 }));
    for (const c of COLS) {
      out.push(L(faceY(SUB.y + SUB.d, rect(c - 6, c + 6, 0.9, 3.1)), { tone: "lo" }));
      out.push(L(k.segment([c - 4.6, SUB.y + SUB.d, 2], [c - 4.6 + 6, SUB.y + SUB.d, 2], P), { tone: "lo", free: true }));
    }
    out.push(`</g>`);out.push(`<g data-part="sorter-boards">`);
    // ruled backboards: one tick per token, a long tick every 5
    for (const c of COLS) {
      const board = { x: c - 7, y: -11, w: 14, d: 3, r: 0.6 };
      out.push(S(slab(board, 4, BOARD_TOP - 4, 2, 0.4), { tone: "mid" }));
      // raised ruler strip on the board face; ticks grow from its outlined left edge
      const strip = { x: c + 3.4, y: -8, w: 3.4, d: 0.6, r: 0 };
      out.push(S(slab(strip, BASE_Z - 1, BOARD_TOP - BASE_Z - 1, 1), { tone: "mid", crease: "lo" }));
      const minor = [], major = [];
      for (let l = 0; l <= 23; l++) {
        const z = BASE_Z + l * COIN_H;
        (l % 5 === 0 ? major : minor).push(k.segment([c + 3.4, -7.4, z], [c + 3.4 + (l % 5 === 0 ? 2.8 : 1.5), -7.4, z], P));
      }
      out.push(L(minor.join(""), { tone: "lo" }), L(major.join(""), { tone: "mid" }));
      out.push(D([at([c - 5, -8, BOARD_TOP - 2]), at([c - 5, -8, 7])], { size: 0.4 }));
    }
    out.push(`</g>`);out.push(`<g data-part="sorter-rail">`);
    // solenoid gates on the rail's far side
    for (const c of COLS) {
      out.push(S(slab({ x: c - 3.5, y: -9.5, w: 7, d: 5.5, r: 1 }, RAIL_Z - 1, 7, 3, 0.4), { tone: "mid" }));
      out.push(S(k.cylinder(c, -6.75, 1.8, RAIL_Z + 6, 1.8, P, 14), { tone: "mid" }));
      out.push(D([at([c, -6.75, RAIL_Z + 7.8])], { size: 0.45, tone: "hi" }));
    }
    // end post, rail and lips
    out.push(S(slab({ x: -215, y: -2.5, w: 5, d: 5, r: 0.8 }, 4, RAIL_Z - 4, 2, 0.4), { tone: "mid" }));
    const rail = { x: -216, y: -4, w: RIGHT - 7 + 216, d: 8, r: 1 };
    out.push(S(slab(rail, RAIL_Z, 3, 3, 0.5), { tone: "mid" }));
    out.push(S(slab({ x: -216, y: -4, w: RIGHT - 7 + 216, d: 1, r: 0.3 }, RAIL_Z + 3, 2, 2), { tone: "mid" }));
    out.push(L(COLS.map((c) => k.ring(c, 0, 3, RAIL_Z + 3, P, 20)).join(""), { tone: "lo" }));
    out.push(S(slab({ x: -216, y: 3, w: RIGHT - 7 + 216, d: 1, r: 0.3 }, RAIL_Z + 3, 2, 2), { tone: "mid" }));
    out.push(`</g>`);out.push(`<g data-part="sorter-stand">`);
    // cups
    for (const c of COLS) {
      out.push(S(k.cylinder(c, 0, 6, 4, 2, P, 32, 0.4), { tone: "mid" }));
      out.push(L(k.ring(c, 0, COIN_R + 0.4, BASE_Z, P, 28), { tone: "faint" }));
    }
    out.push(`</g>`);
    return out.join("");
  }
  function sorterFront() {
    const out = [];
    out.push(`<g data-part="sorter-cage">`);
    for (const c of COLS) {
      for (const dx of [-5.8, 5.8]) out.push(S(k.cylinder(c + dx, 5.4, 0.9, 4, BOARD_TOP - 6, P, 10), { tone: "mid", crease: "none" }));
      const tie = { x: c - 7, y: -8, w: 14, d: 15.4, r: 1.2 };
      out.push(S(slab(tie, BOARD_TOP - 2, 2.4, 3, 0.4), { tone: "mid" }));
      out.push(L(k.ring(c, 0, COIN_R + 0.6, BOARD_TOP + 0.4, P, 24), { tone: "lo" }));
      out.push(D([at([c - 5.8, 5.4, BOARD_TOP + 0.4]), at([c + 5.8, 5.4, BOARD_TOP + 0.4])], { size: 0.4 }));
    }
    out.push(`</g>`);out.push(`<g data-part="sorter-rail">`);
    // drive column and box at the rail's right end
    out.push(S(k.cylinder(-74 + DX, 0, 5, 0, 1.6, P, 22), { tone: "lo" }));
    out.push(S(slab({ x: -77 + DX, y: -3, w: 6, d: 6, r: 0.8 }, 1.6, 54.4, 2, 0.4), { tone: "mid" }));
    const box = { x: -81 + DX, y: -8, w: 13, d: 16, r: 1.6 };
    out.push(S(slab(box, 56, 13, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(box, 59, P, 3), { tone: "faint" }) }));
    for (const z of [61.4, 63.6, 65.8]) out.push(L(faceY(8, stadium(-74.5 + DX, z, 8, 1.1)), { tone: "lo" }));
    out.push(D(k.corners(box, 2).map(([x, y]) => at([x, y, 69])), { size: 0.4 }));
    out.push(S(k.cylinder(-74.5 + DX, -1, 3, 69, 3, P, 24), { tone: "mid" }));
    out.push(L(k.knurl(-74.5 + DX, -1, 3, 69, 72, 24, P), { tone: "lo" }));
    out.push(L(k.lineOnTop([-74.5 + DX, -1], [-74.5 + DX, 2], 72, P), { tone: "hi" }));
    out.push(D([at([-70.4 + DX, 8, 67.6])], { size: 0.55, tone: "hi" }));
    out.push(`</g>`);
    return out.join("");
  }
  function coin(i) {
    const body = S(k.cylinder(0, 0, COIN_R, 0, COIN_H, P, 28, 0.3), { tone: "hi", crease: "lo" }) +
      L(k.ring(0, 0, COIN_R - 1.3, COIN_H, P, 20), { tone: "faint" });
    return `<g data-coin="${i}">${body}</g>`;
  }

  // ---------- cabinet ----------
  function cabinetBack() {
    const out = [];
    // signal cable from the sorter's drive column to the cabinet plinth
    const plinth = { x: 2, y: -48, w: 70, d: 56, r: 2 };
    out.push(`<g data-part="base">` + S(slab(plinth, 0, 5, 4, 0.8), { tone: "lo" }) + `</g>`);
    out.push(`<g data-part="cab-back">` + S(slab({ x: CAB.x, y: CAB.y, w: CAB.w, d: 2, r: 0.4 }, 5, TOPZ - 5, 2, 0.4), { tone: "mid" }) +          // back
      S(slab({ x: CAB.x, y: CAB.y + 2, w: 2, d: CAB.d - 2, r: 0.4 }, 5, TOPZ - 5, 2, 0.4), { tone: "mid" }) + `</g>`);  // far side
    return out.join("");
  }
  function drawer(i) {
    const z0 = drawerZ(i), zc = z0 + 4.6;
    const out = [];
    const inX0 = 7.5, inX1 = 66.5, back = -43, front = 4;
    out.push(S(slab({ x: inX0, y: back, w: inX1 - inX0, d: front - back, r: 0.6 }, z0, 1, 2, 0.3), { tone: "mid" }));
    out.push(S(slab({ x: inX0, y: back, w: inX1 - inX0, d: 1.2, r: 0.3 }, z0, 7, 2, 0.3), { tone: "mid" }));
    out.push(S(slab({ x: inX0, y: back + 1.2, w: 1.2, d: front - back - 1.2, r: 0.3 }, z0, 7, 2, 0.3), { tone: "mid" }));
    for (const y of [-31, -19, -7]) out.push(S(slab({ x: inX0 + 1.2, y, w: inX1 - inX0 - 2.4, d: 0.8, r: 0.2 }, z0 + 1, 4.4, 2), { tone: "mid", crease: "lo" }));
    out.push(S(slab({ x: inX1 - 1.2, y: back + 1.2, w: 1.2, d: front - back - 1.2, r: 0.3 }, z0, 7, 2, 0.3), { tone: "mid" }));
    // front plate, handle, label holder
    out.push(`<g data-front="${i}">${S(slab({ x: 6.2, y: front, w: 61.6, d: 2.4, r: 0.6 }, z0 - 0.4, 9.6, 3, 0.4), { tone: "hi", crease: "lo" })}</g>`);
    const fy = front + 2.4;
    out.push(L(faceY(fy, rect(10, 24, zc - 2.2, zc + 2.2)), { tone: "lo" }));
    out.push(L(k.segment([11.6, fy, zc], [11.6 + 7.6, fy, zc], P), { tone: "lo", free: true }));
    for (const x of [44, 54.8]) out.push(S(slab({ x, y: fy, w: 1.2, d: 1.4, r: 0.3 }, zc - 0.6, 1.2, 2), { tone: "mid", crease: "none" }));
    out.push(S(slab({ x: 43.4, y: fy + 1.4, w: 13, d: 1.2, r: 0.5 }, zc - 0.8, 1.6, 3), { tone: "mid", crease: "lo" }));
    return `<g data-drawer="${i}">${out.join("")}</g>`;
  }
  function cabinetFront() {
    const out = [];
    out.push(`<g data-part="cab-side">`);
    const side = { x: CAB.x + CAB.w - 2, y: CAB.y + 2, w: 2, d: CAB.d - 2, r: 0.4 };
    out.push(S(slab(side, 5, TOPZ - 5, 2, 0.4), { tone: "mid" }));
    const xf = CAB.x + CAB.w;
    out.push(L(faceX(xf, rect(CAB.y + 8, FRONT_Y - 6, 12, TOPZ - 6)), { tone: "faint" }));
    out.push(D([[CAB.y + 5, 9], [FRONT_Y - 3, 9], [CAB.y + 5, TOPZ - 3], [FRONT_Y - 3, TOPZ - 3]].map(([y, z]) => at([xf, y, z])), { size: 0.4 }));
    out.push(`</g>`);out.push(`<g data-part="cab-top">`);
    const top = { x: CAB.x - 1, y: CAB.y - 1, w: CAB.w + 2, d: CAB.d + 2, r: 1.5 };
    out.push(S(slab(top, TOPZ, 3, 4, 0.8), { tone: "mid" }));
    out.push(L(k.planOutline(k.insetPlan(top, 4), TOPZ + 3, P, 4), { tone: "faint" }));
    // card-file tray: the index the drawers are filed from
    const tray = { x: 14, y: -36, w: 30, d: 24 }, tz = TOPZ + 3, th = 6, tt = 1;
    out.push(S(slab({ ...tray, r: 0.8 }, tz, tt, 3, 0.3), { tone: "mid" }));
    out.push(S(slab({ x: tray.x, y: tray.y, w: tray.w, d: tt, r: 0.3 }, tz, th, 2, 0.3), { tone: "mid" }));
    out.push(S(slab({ x: tray.x, y: tray.y + tt, w: tt, d: tray.d - 2 * tt, r: 0.3 }, tz, th, 2, 0.3), { tone: "mid" }));
    for (let y = tray.y + 3; y < tray.y + tray.d - 3; y += 2.6) {
      out.push(S(slab({ x: tray.x + 2, y, w: tray.w - 4, d: 0.5, r: 0 }, tz + tt, 8.6, 1), { tone: "hi", crease: "lo" }));
    }
    out.push(S(slab({ x: tray.x + 2, y: tray.y + 12.2, w: 8, d: 0.6, r: 0 }, tz + tt, 10.6, 1), { tone: "mid", crease: "lo" }));   // tab divider
    out.push(S(slab({ x: tray.x + tray.w - tt, y: tray.y + tt, w: tt, d: tray.d - 2 * tt, r: 0.3 }, tz, th, 2, 0.3), { tone: "mid" }));
    out.push(S(slab({ x: tray.x, y: tray.y + tray.d - tt, w: tray.w, d: tt, r: 0.3 }, tz, th, 2, 0.3), { tone: "mid" }));
    out.push(L(faceY(tray.y + tray.d, rect(tray.x + 10, tray.x + 20, tz + 1.4, tz + 4.4)), { tone: "lo" }));
    out.push(`</g>`);
    return out.join("");
  }

  // ---------- parts registry (see worlds/conveyor.world.js) ----------
  // The data never comes apart: coins stay in their stacks and drawers stay pulled to their counts.
  // What comes off is the structure around them. Cabinet anchors are modelled at x 4..70, so shift them.
  const parts = [
    { key: "base", name: "Base plate", move: [0, 0, 0], anchor: [PLATE.x + 30, PLATE.y + PLATE.d - 20, 0], station: -1 },
    { key: "sorter-stand", name: "Sorter sub-base and cups", move: [0, 0, 0], anchor: [-150, SUB.y + SUB.d, 4], station: -1 },
    { key: "sorter-boards", name: "Ruled backboards", move: [0, -22, 0], anchor: [-148, -9.5, BOARD_TOP], station: -1 },
    { key: "sorter-rail", name: "Rail, gates and drive", move: [0, 0, 26], anchor: [COLS[Math.floor(COLS.length / 2)], 0, RAIL_Z + 5], station: -1 },
    { key: "sorter-cage", name: "Posts and ties", move: [0, 18, 0], anchor: [-148, 7.4, BOARD_TOP + 0.4], station: -1 },
    { key: "cab-back", name: "Cabinet back", move: [0, -18, 0], anchor: [CAB.x + CAB.w / 2 + CAB_SHIFT, CAB.y, TOPZ], station: -1 },
    { key: "cab-side", name: "Cabinet side", move: [20, 0, 0], anchor: [CAB.x + CAB.w + CAB_SHIFT, -20, 40], station: -1 },
    { key: "cab-top", name: "Cabinet top and card tray", move: [0, 0, 28], anchor: [29 + CAB_SHIFT, -24, TOPZ + 14], station: -1 },
  ];
  const wireTo = [2 + CAB_SHIFT, -24, 3];
  const body = [
    `<g data-part="base">${plate()}</g>`,
    sorterBack(),
    `<g data-coins>${Array.from({ length: N }, (_, i) => coin(i)).join("")}</g>`,
    sorterFront(),
    `<g data-wire>` + k.wireSvg(at([-71 + DX, 2, 1]), at(wireTo), { via: [at([-64 + DX, 2, 0.6]), at([-4 + CAB_SHIFT, -24, 0.6]), at([2 + CAB_SHIFT, -24, 0.6])], tone: "lo", size: 0.9 }) + `</g>`,
    `<g transform="${k.translateAlong(P, [CAB_SHIFT, 0, 0])}">`,
    cabinetBack(),
    `<g data-drawers>${Array.from({ length: DRAWERS }, (_, i) => drawer(DRAWERS - 1 - i)).join("")}</g>`,
    cabinetFront(),
    `</g>`,
  ];
  return { body: body.join(""), COLS, COIN_H, BASE_Z, FLY_Z, PULL_MAX, DRAWERS, parts, CAB_SHIFT, drawerZ: (i) => drawerZ(i), RIGHT, TOPZ };
}
