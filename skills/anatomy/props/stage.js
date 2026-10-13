// Stage props: a concert stage and what stands on it. Same contract as props/machine.js: build(c, o) → { items, part?, fit? }.
// The deck's top is at o.z (default 8.6); props stand on it. `lit` paints a prop's main solid in the accent (selected).
// Plain source, concatenated after engine/compose.js.

// ---------- deck: the stage platform with a thrust runway toward the near side ----------
PROPS["stage-deck"] = { slots: {}, build(c, { deck: DECK, run: RUN, z0 = 0.6, h = 8 }) {
  const { k, P, S, L, D, slab, at } = c;
  const top = z0 + h;
  const items = [
    { phase: "far", part: "stage", tip: "stage", svg: S(slab(DECK, z0, h, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(DECK, z0 + h / 2, P, 3), { tone: "faint" }) }) +
      L(k.planOutline(k.insetPlan(DECK, 2.5), top, P, 2), { tone: "faint" }), bounds: c.box(DECK, z0, top) },
    { phase: "far", part: "stage", tip: "stage", svg: S(slab(RUN, z0, h, 3, 0.4), { tone: "mid" }) + L(k.lineOnTop([RUN.x + RUN.w / 2, RUN.y], [RUN.x + RUN.w / 2, RUN.y + RUN.d], top, P), { tone: "faint" }) +
      D([at([RUN.x + RUN.w / 2, RUN.y + RUN.d - 2, top])], { size: 0.5, tone: "hi" }), bounds: c.box(RUN, z0, top) },
  ];
  return { items, top, part: { name: "Stage", move: [0, 0, 0], anchor: [DECK.x + DECK.w / 2, DECK.y + DECK.d, top] } };
} };

// ---------- truss: four towers and a roof grid over the deck, with lamps ----------
PROPS.truss = { slots: {}, build(c, { deck: DECK, z, top: TOP = 50, lamps = 6 }) {
  const { k, P, S, L, D, slab, at } = c;
  const tower = (x, y) => {
    const out = [S(slab({ x: x - 2, y: y - 2, w: 4, d: 4, r: 0.5 }, z, 1, 2), { tone: "lo" })];
    out.push(S(slab({ x: x - 1.4, y: y - 1.4, w: 2.8, d: 2.8, r: 0.3 }, z + 1, TOP - z - 1, 2, 0.2), { tone: "mid", inner: L([0.3, 0.6].map((f) => k.sideSeam({ x: x - 1.4, y: y - 1.4, w: 2.8, d: 2.8, r: 0.3 }, z + (TOP - z) * f, P, 2)).join(""), { tone: "faint" }) }));
    return out.join("");
  };
  const x0 = DECK.x + 2, x1 = DECK.x + DECK.w - 2, y0 = DECK.y + 2, y1 = DECK.y + DECK.d - 2;
  const beam = (plan) => S(slab(plan, TOP, 3, 2, 0.3), { tone: "mid" });
  const roof = beam({ x: x0 - 1.5, y: y0 - 1.5, w: x1 - x0 + 3, d: 3, r: 0.4 }) + beam({ x: x0 - 1.5, y: y1 - 1.5, w: x1 - x0 + 3, d: 3, r: 0.4 }) +
    beam({ x: x0 - 1.5, y: y0 + 1.5, w: 3, d: y1 - y0 - 3, r: 0.4 }) + beam({ x: x1 - 1.5, y: y0 + 1.5, w: 3, d: y1 - y0 - 3, r: 0.4 });
  // lamps hang under the front beam: a can with a lens ring
  const lampSvg = [];
  for (let i = 0; i < lamps; i++) {
    const x = x0 + ((x1 - x0) * (i + 0.5)) / lamps;
    lampSvg.push(S(k.cylinder(x, y1, 1.6, TOP - 4, 4, P, 14, 0.3), { tone: "mid" }) + D([at([x, y1, TOP - 4])], { size: 0.5, tone: "hi" }));
  }
  return {
    items: [
      { phase: "far", part: "truss", tip: "", svg: tower(x0, y0) + tower(x1, y0), bounds: [x0 - 2, y0 - 2, z, x1 + 2, y0 + 2, TOP] },
      { phase: "near", part: "truss", tip: "", svg: tower(x0, y1) + tower(x1, y1) + roof + lampSvg.join(""), bounds: [x0 - 2, y0 - 2, z, x1 + 2, y1 + 2, TOP + 3] },
    ],
    part: { name: "Lighting truss", move: [0, 0, 34], anchor: [(x0 + x1) / 2, y1, TOP + 3] },
  };
} };

// ---------- LED wall at the back of the deck: spectacle ----------
PROPS["led-wall"] = { slots: {}, build(c, { deck: DECK, z, h = 30, lit = false, part = "led-wall" }) {
  const { k, P, S, L, slab, faceY, rect } = c;
  const W = { x: DECK.x + 6, y: DECK.y + 1, w: DECK.w - 12, d: 2.2, r: 0.4 };
  const fy = W.y + W.d;
  const panels = [];
  const cols = 6, rows = 3;
  for (let i = 1; i < cols; i++) { const x = W.x + (W.w * i) / cols; panels.push(k.segment([x, fy, z + 2], [x, fy, z + h - 2], P)); }
  for (let j = 1; j < rows; j++) { const zz = z + 2 + ((h - 4) * j) / rows; panels.push(k.segment([W.x + 2, fy, zz], [W.x + W.w - 2, fy, zz], P)); }
  const svg = S(slab(W, z, h, 2, 0.3), { tone: "lo", lit }) + L(faceY(fy, rect(W.x + 2, W.x + W.w - 2, z + 2, z + h - 2)), { tone: "mid" }) + L(panels.join(""), { tone: "faint" });
  return { items: [{ phase: "far", part, svg, bounds: c.box(W, z, z + h) }], part: { name: "LED wall", move: [0, -20, 10], anchor: [W.x + W.w / 2, fy, z + h] } };
} };

// ---------- dance floor: a raised light-up riser on the deck: choreography ----------
PROPS["dance-floor"] = { slots: {}, build(c, { x, y, z, w = 22, d = 12, lit = false, part = "dance-floor" }) {
  const { k, P, S, L, slab } = c;
  const F = { x, y, w, d, r: 0.6 };
  const grid = [];
  for (let i = 1; i < 6; i++) grid.push(k.lineOnTop([x + (w * i) / 6, y], [x + (w * i) / 6, y + d], z + 1.6, P));
  for (let j = 1; j < 3; j++) grid.push(k.lineOnTop([x, y + (d * j) / 3], [x + w, y + (d * j) / 3], z + 1.6, P));
  return { items: [{ phase: "far", part, svg: S(slab(F, z, 1.6, 3, 0.3), { tone: "hi", crease: "lo", lit }) + L(grid.join(""), { tone: "lo" }), bounds: c.box(F, z, z + 1.6) }],
    part: { name: "Dance floor", move: [0, 0, 14], anchor: [x + w / 2, y + d, z + 1.6] } };
} };

// ---------- guest lift: a square platform raised out of the deck on rails: surprise guests ----------
PROPS["guest-lift"] = { slots: {}, build(c, { x, y, z, lit = false, part = "guest-lift", raise = 6 }) {
  const { k, P, S, L, D, slab, at } = c;
  const R = { x: x - 5, y: y - 5, w: 10, d: 10, r: 0.4 };
  const rail = (rx, ry) => S(slab({ x: rx - 0.6, y: ry - 0.6, w: 1.2, d: 1.2, r: 0.2 }, z, raise + 2, 2), { tone: "mid" });
  const svg = L(k.planOutline(k.insetPlan(R, -1.2), z, P, 2), { tone: "lo" }) + rail(R.x, R.y) + rail(R.x + R.w, R.y) +
    S(slab(R, z + raise - 1, 1.4, 2, 0.3), { tone: "hi", crease: "lo", lit }) + rail(R.x, R.y + R.d) + rail(R.x + R.w, R.y + R.d) +
    D([at([x, y, z + raise + 0.4])], { size: 0.6, tone: "hi" });
  return { items: [{ phase: "far", part, svg, bounds: [R.x - 1.2, R.y - 1.2, z, R.x + R.w + 1.2, R.y + R.d + 1.2, z + raise + 2] }],
    part: { name: "Guest lift", move: [0, 0, 16], anchor: [x, y + 5, z + raise + 0.4] } };
} };

// ---------- flags: poles at the deck's corners with flags out toward the runway: Latin culture ----------
PROPS.flags = { slots: {}, build(c, { at: spots, z, h = 30, lit = false, part = "flags" }) {
  const { k, P, S, L, slab } = c;
  const items = spots.map(([x, y], i) => {
    const pole = S(k.cylinder(x, y, 0.7, z, h, P, 10), { tone: "mid", crease: "none" }) + S(k.cylinder(x, y, 1.1, z + h, 1, P, 10, 0.2), { tone: "mid" });
    const flag = { x: x + 0.7, y: y - 0.3, w: 11, d: 0.6, r: 0.2 };
    const cloth = S(slab(flag, z + h - 8, 7, 2), { tone: "hi", crease: "lo", lit }) +
      L(k.segment([flag.x + 3.6, flag.y + flag.d, z + h - 8], [flag.x + 3.6, flag.y + flag.d, z + h - 1], P) + k.segment([flag.x + 7.3, flag.y + flag.d, z + h - 8], [flag.x + 7.3, flag.y + flag.d, z + h - 1], P), { tone: "lo" });
    return { phase: "far", part, svg: pole + cloth, bounds: [x - 1.1, y - 1.1, z, x + 12, y + 1.1, z + h + 1] };
  });
  return { items, part: { name: "Flags", move: [0, 0, 18], anchor: [spots[0][0] + 6, spots[0][1], z + h] } };
} };

// ---------- mic stand at the runway's tip, monitor wedges either side: live vocals ----------
PROPS["mic-stand"] = { slots: {}, build(c, { x, y, z, lit = false, part = "mic", wedges = true }) {
  const { k, P, S, L, D, slab, at } = c;
  let svg = S(k.cylinder(x, y, 2, z, 0.6, P, 16), { tone: "lo" }) + S(k.cylinder(x, y, 0.45, z + 0.6, 12, P, 8), { tone: "mid", crease: "none" }) +
    S(k.cylinder(x, y, 1, z + 12.6, 2.2, P, 12, 0.3), { tone: "hi", crease: "lo", lit });
  if (wedges) for (const dx of [-6, 6]) {
    const wd = { x: x + dx - 2.5, y: y + 2, w: 5, d: 3.4, r: 0.6 };
    svg += S(slab(wd, z, 2.6, 3, 0.3), { tone: "mid" }) + L(c.faceY(wd.y + wd.d, c.rect(wd.x + 0.8, wd.x + wd.w - 0.8, z + 0.6, z + 2)), { tone: "faint" });
  }
  return { items: [{ phase: "far", part, svg, bounds: [x - 8.5, y - 2, z, x + 8.5, y + 5.4, z + 14.8] }],
    part: { name: "Mic and monitors", move: [0, 10, 10], anchor: [x, y, z + 14.8] } };
} };

// ---------- line arrays: speaker stacks hung from the truss either side: the hits, loud ----------
PROPS["line-array"] = { slots: {}, build(c, { at: spots, top, n = 5, lit = false, part = "speakers" }) {
  const { k, P, S, L, slab } = c;
  const items = spots.map(([x, y]) => {
    const out = [L(k.segment([x, y, top], [x, y, top - 3], P), { tone: "lo" })];
    for (let i = 0; i < n; i++) {
      const box = { x: x - 3, y: y - 2.2, w: 6, d: 4.4, r: 0.5 };
      out.push(S(slab(box, top - 3 - (i + 1) * 3.4, 3.2, 2, 0.3), { tone: "mid", lit: lit && i === 0 }));
    }
    return { phase: "near", part, svg: out.join(""), bounds: [x - 3, y - 2.2, top - 3 - n * 3.4, x + 3, y + 2.2, top] };
  });
  return { items, part: { name: "Speaker arrays", move: [0, 0, 20], anchor: [spots[0][0], spots[0][1] + 2.2, top - 3] } };
} };

// ---------- drum riser with a kit, and amp stacks: a rock band's backline (the opening act) ----------
PROPS.backline = { slots: {}, build(c, { deck: DECK, z, part = "backline" }) {
  const { k, P, S, L, D, slab, at } = c;
  const cx = DECK.x + DECK.w / 2, ry = DECK.y + 4;
  const riser = { x: cx - 9, y: ry, w: 18, d: 11, r: 0.6 };
  let svg = S(slab(riser, z, 3, 3, 0.3), { tone: "mid" });
  const rz = z + 3;
  svg += S(k.cylinder(cx, ry + 6, 3.2, rz, 4, P, 24, 0.3), { tone: "hi", crease: "lo" });                        // kick drum (lying would need lathe; upright reads fine)
  for (const [dx, dy, r] of [[-5, 3, 1.8], [5, 3, 1.8], [-6, 8, 2], [6, 8, 2.2]]) svg += S(k.cylinder(cx + dx, ry + dy, r, rz, 2.6, P, 18, 0.2), { tone: "mid" });
  for (const dx of [-7.5, 7.5]) svg += S(k.cylinder(cx + dx, ry + 1.5, 0.3, rz, 7, P, 6), { tone: "mid", crease: "none" }) + S(k.cylinder(cx + dx, ry + 1.5, 2.4, rz + 7, 0.3, P, 20), { tone: "hi", crease: "lo" });
  for (const ax of [DECK.x + 6, DECK.x + DECK.w - 14]) {
    const amp = { x: ax, y: DECK.y + 3, w: 8, d: 5, r: 0.5 };
    svg += S(slab(amp, z, 6, 2, 0.3), { tone: "lo" }) + S(slab(amp, z + 6, 6, 2, 0.3), { tone: "lo" }) + S(slab({ ...amp, d: 4 }, z + 12, 3, 2, 0.3), { tone: "mid" }) +
      L(c.faceY(amp.y + amp.d, c.rect(amp.x + 1, amp.x + amp.w - 1, z + 1, z + 11)), { tone: "faint" });
  }
  return { items: [{ phase: "far", part, svg, bounds: [DECK.x + 6, DECK.y + 3, z, DECK.x + DECK.w - 6, ry + 11, z + 15] }],
    part: { name: "Backline", move: [0, -16, 12], anchor: [cx, ry + 11, z + 7] } };
} };

// ---------- scoreboard: one cell per respondent; a cell lights for each fan on their feet ----------
// o: { x, y, z, n, cols, part }. The face is the plane y + D (toward the field and the default camera).
// Returns `cellsSvg(on)` so the runtime can relight the cells without rebuilding the board.
PROPS.scoreboard = { slots: { count: "cells" }, build(c, { x, y, z, n, cols = 9, part = "scoreboard", on = 0 }) {
  const { k, P, S, L, D, slab, at } = c;
  const rows = Math.ceil(n / cols), CW = 4, CH = 3.2, GAP = 1;
  const W = cols * (CW + GAP) + GAP + 4, H = rows * (CH + GAP) + GAP + 6, Dp = 3;
  const B = { x: x - W / 2, y: y - Dp, w: W, d: Dp, r: 0.6 };
  const fy = y + 0.01;
  const legs = [B.x + 5, B.x + W - 7].map((lx) => S(slab({ x: lx, y: y - 2.5, w: 2, d: 2, r: 0.3 }, 0, z, 2), { tone: "mid" })).join("");
  const board = S(slab(B, z, H, 2, 0.4), { tone: "lo" }) + L(c.faceY(y, c.rect(B.x + 1.5, B.x + W - 1.5, z + 1.5, z + H - 1.5)), { tone: "mid" });
  const cell = (i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const x0 = B.x + 2 + GAP + col * (CW + GAP), z1 = z + H - 3 - GAP - row * (CH + GAP);
    return [[x0, z1 - CH], [x0 + CW, z1 - CH], [x0 + CW, z1], [x0, z1]];
  };
  const cellsSvg = (lit) => Array.from({ length: n }, (_, i) => `<path class="sb-cell"${i < lit ? " data-on" : ""} d="${c.faceY(fy, cell(i))}"/>`).join("");
  return {
    cellsSvg,
    items: [{ phase: "far", part, tip: part, svg: legs + board + `<g data-cells>${cellsSvg(on)}</g>`, bounds: [B.x, B.y, 0, B.x + W, y, z + H] }],
    part: { name: "Scoreboard", move: [0, -24, 20], anchor: [x, y, z + H] },
    fit: [[B.x, y, z + H], [B.x + W, y, z + H]],
  };
} };
