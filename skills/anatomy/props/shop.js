// Shop props: a grocery store's fittings. Same contract as props/machine.js: build(c, o) → { items, part?, fit? }.
// The aisle runs along x at y = 0; anything standing beside it keeps to |y| ≥ 16 so carts pass clear.
// Plain source, concatenated after engine/compose.js.

// ---------- store floor: a tiled slab, the ground every shop prop stands on ----------
PROPS["store-floor"] = { slots: {}, build(c, { plan, tile = 20, h = 6 }) {
  const { k, P, L, S } = c;
  const out = [`<path class="iso-halo" d="${k.haloOf(plan, -h, h, P)}"/>`];
  out.push(S(k.slabOf(plan, -h, h, P, 8, 1.2), { tone: "mid" }));
  const inset = k.insetPlan(plan, 4);
  out.push(L(k.planOutline(inset, 0, P), { tone: "faint" }));
  // grout lines between the inset edges: each runs from one border line to the opposite one, so no end floats
  const lines = [];
  for (let x = inset.x + tile; x < inset.x + inset.w - 2; x += tile) lines.push(k.lineOnTop([x, inset.y], [x, inset.y + inset.d], 0, P));
  for (let y = inset.y + tile; y < inset.y + inset.d - 2; y += tile) lines.push(k.lineOnTop([inset.x, y], [inset.x + inset.w, y], 0, P));
  out.push(L(lines.join(""), { tone: "faint" }));
  return { items: [{ phase: "ground", part: "base", tip: "", svg: out.join(""), bounds: c.box(plan, -h, 0) }],
    part: { name: "Store floor", move: [0, 0, 0], anchor: [plan.x + 30, plan.y + plan.d - 20, 0] } };
} };

// ---------- store entrance: sliding doors across the aisle, mat underfoot; every cart enters here ----------
PROPS["store-entrance"] = { slots: { flow: "source" }, build(c, { x }) {
  const { k, P, at, S, L, D, slab, faceY } = c;
  const Y = 30, HEAD = 58, T = 3;
  const post = (y) => S(slab({ x: x - T / 2, y: y - T / 2, w: T, d: T, r: 0.4 }, 0, HEAD, 2, 0.3), { tone: "mid" });
  // a glass leaf slid open beside the post: a thin pane in a frame, seen edge-on as a slab
  const leaf = (y0, y1) => {
    const pane = { x: x - 0.6, y: Math.min(y0, y1), w: 1.2, d: Math.abs(y1 - y0), r: 0.2 };
    return S(slab(pane, 1, HEAD - 4, 2, 0), { tone: "hi", crease: "lo" }) +
      L(k.segment([x + 0.6, pane.y + 2, 6], [x + 0.6, pane.y + pane.d - 2, 6], P), { tone: "faint", free: true });
  };
  const mat = { x: x - 14, y: -20, w: 28, d: 40, r: 1.5 };
  const matSvg = S(slab(mat, 0, 0.6, 3), { tone: "lo", crease: "none" }) +
    L([-12, -6, 0, 6, 12].map((dy) => k.lineOnTop([x - 11, dy], [x + 11, dy], 0.6, P)).join(""), { tone: "faint", free: true });
  const header = { x: x - 5, y: -Y - 2, w: 10, d: 2 * Y + 4, r: 1 };
  const headSvg = S(slab(header, HEAD, 8, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(header, HEAD + 4, P, 3), { tone: "faint" }) }) +
    L(faceY(Y + 2, [[x - 3, HEAD + 2], [x + 3, HEAD + 2], [x + 3, HEAD + 6], [x - 3, HEAD + 6]]), { tone: "lo" }) +   // motion-sensor window
    D([at([x, Y + 2, HEAD + 4])], { size: 0.5, tone: "hi" });
  return {
    items: [
      { phase: "ground", part: "hopper", svg: matSvg, bounds: c.box(mat, 0, 0.6) },
      { phase: "far", part: "hopper", svg: post(-Y) + leaf(-Y + 2, -16), bounds: [x - T, -Y - T, 0, x + T, -16, HEAD] },
      { phase: "near", part: "hopper", svg: leaf(16, Y - 2) + post(Y), bounds: [x - T, 16, 0, x + T, Y + T, HEAD] },
      { phase: "near", part: "hopper", svg: headSvg, bounds: c.box(header, HEAD, HEAD + 8) },
    ],
    part: { name: "Entrance", move: [0, 0, 40], anchor: [x, Y + 2, HEAD + 8] },
    fit: [[x, -Y - 2, HEAD + 8], [x, Y + 2, HEAD + 8]],
  };
} };

// ---------- gondola shelf: shelving on the far side of the aisle, with gaps where the range runs out ----------
// o: { x, gaps } — gaps is the share of facings left empty (drawn, not data: the count lives on the scale).
PROPS["gondola-shelf"] = { slots: {}, build(c, { x, gaps = 0.45 }) {
  const { k, P, at, S, L, D, slab, faceX, rect } = c;
  const G = { x: x - 26, y: -48, w: 52, d: 26 };
  const SHELVES = [6, 26, 46];
  const out = [];
  out.push(S(slab({ x: G.x, y: G.y, w: G.w, d: G.d, r: 0.6 }, 0, 6, 3, 0.4), { tone: "lo" }));                 // plinth
  out.push(S(slab({ x: G.x, y: G.y, w: G.w, d: 3, r: 0.4 }, 6, 64, 3, 0.3), { tone: "mid" }));                 // back panel
  for (const sx of [G.x, G.x + G.w - 2]) out.push(S(slab({ x: sx, y: G.y + 3, w: 2, d: G.d - 3, r: 0.3 }, 6, 64, 2, 0.3), { tone: "mid" }));   // uprights
  // facings: a fixed, seeded pattern of boxes and bags; the empty slots keep their price-strip label cards
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  SHELVES.forEach((z) => {
    const shelf = { x: G.x + 2, y: G.y + 3, w: G.w - 4, d: G.d - 4, r: 0.4 };
    out.push(S(slab(shelf, z, 1.6, 3, 0.3), { tone: "mid" }));
    const n = 4, fw = shelf.w / n;
    for (let i = 0; i < n; i++) {
      const fx = shelf.x + i * fw;
      if (rnd() < gaps) continue;
      const tall = rnd() < 0.5;
      out.push(S(slab({ x: fx + 1.5, y: shelf.y + 3, w: fw - 3, d: shelf.d - 7, r: tall ? 0.6 : 3 }, z + 1.6, tall ? 15 : 9, tall ? 3 : 5, 0.5), { tone: "hi", crease: "lo" }));
    }
    // shelf-edge price strip with one card per facing
    const edge = shelf.y + shelf.d;
    out.push(S(slab({ x: shelf.x, y: edge, w: shelf.w, d: 1, r: 0.3 }, z - 2, 3.6, 2), { tone: "mid", crease: "lo" }));
    for (let i = 0; i < n; i++) out.push(L(c.faceY(edge + 1, rect(shelf.x + i * fw + 2, shelf.x + (i + 1) * fw - 2, z - 1.2, z + 0.8)), { tone: "lo" }));
  });
  out.push(S(slab({ x: G.x, y: G.y, w: G.w, d: G.d, r: 0.6 }, 70, 2, 3, 0.4), { tone: "mid" }));               // top cap
  out.push(D([G.x + 4, G.x + G.w - 4].map((px) => at([px, G.y + G.d - 3, 72])), { size: 0.4 }));
  return {
    items: [{ phase: "far", part: "rack", svg: out.join(""), bounds: [G.x, G.y, 0, G.x + G.w, G.y + G.d, 72] }],
    part: { name: "Shelf", move: [0, -30, 30], anchor: [x, G.y + G.d, 72] },
    fit: [[G.x, G.y, 72], [G.x + G.w, G.y + G.d, 72]],
  };
} };

// ---------- self-checkout: kiosk beside the aisle, screen and scanner glass ----------
PROPS["self-checkout"] = { slots: {}, build(c, { x }) {
  const { k, P, at, S, L, D, slab, faceY, stadium } = c;
  const B = { x: x - 12, y: -40, w: 24, d: 20, r: 1.6 };
  const out = [];
  out.push(S(slab({ x: B.x - 1, y: B.y - 1, w: B.w + 2, d: B.d + 2, r: 2 }, 0, 2, 3), { tone: "lo" }));
  out.push(S(slab(B, 2, 30, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(B, 16, P, 3), { tone: "faint" }) }));
  out.push(L(faceY(B.y + B.d, stadium(x, 10, 12, 2.4)), { tone: "lo" }));                                        // receipt slot
  // scanner glass flush in the counter top
  out.push(S(slab({ x: x - 7, y: B.y + 6, w: 14, d: 10, r: 0.8 }, 32, 0.6, 3), { tone: "hi", crease: "lo" }));
  out.push(L(k.lineOnTop([x - 5, B.y + 11], [x + 5, B.y + 11], 32.6, P), { tone: "lo", dotted: true, free: true, className: "eye-beam" }));
  // screen on a short neck at the back
  out.push(S(slab({ x: x - 2, y: B.y + 1, w: 4, d: 3, r: 0.4 }, 32, 10, 2, 0.3), { tone: "mid" }));
  const screen = { x: x - 10, y: B.y, w: 20, d: 2.4, r: 0.8 };
  out.push(S(slab(screen, 42, 16, 3, 0.4), { tone: "mid" }));
  out.push(L(faceY(B.y + 2.4, [[x - 8, 44], [x + 8, 44], [x + 8, 56], [x - 8, 56]]), { tone: "lo" }));
  out.push(D([at([x + 6, B.y + 2.4, 54])], { size: 0.5, tone: "hi" }));
  return {
    items: [{ phase: "far", part: "eye", svg: out.join(""), bounds: [B.x - 1, B.y - 1, 0, B.x + B.w + 1, B.y + B.d + 1, 58] }],
    part: { name: "Self-checkout", move: [0, -26, 24], anchor: [x, B.y + 2.4, 58] },
    fit: [[x - 10, B.y, 58]],
  };
} };

// ---------- price sign: a floor stand holding a large price card toward the aisle ----------
PROPS["price-sign"] = { slots: {}, build(c, { x }) {
  const { k, P, at, S, L, D, slab, faceY, rect } = c;
  const Y = -26;
  const out = [];
  out.push(S(k.cylinder(x, Y, 7, 0, 1.6, P, 28), { tone: "lo" }));
  out.push(S(k.cylinder(x, Y, 1.2, 1.6, 34.4, P, 12), { tone: "mid", crease: "none" }));
  const frame = { x: x - 15, y: Y - 1.2, w: 30, d: 2.4, r: 0.6 };
  out.push(S(slab(frame, 36, 26, 3, 0.4), { tone: "mid" }));
  const fy = Y + 1.2;
  out.push(L(faceY(fy, rect(x - 13, x + 13, 38, 60)), { tone: "lo" }));
  // the card: a big price block and two comparison rules under it
  out.push(S(slab({ x: x - 10, y: fy, w: 14, d: 0.6, r: 0.3 }, 47, 10, 2), { tone: "hi", crease: "lo" }));
  out.push(L(k.segment([x - 10, fy, 43], [x + 10, fy, 43], P) + k.segment([x - 10, fy, 40.5], [x + 4, fy, 40.5], P), { tone: "lo", free: true }));
  out.push(D([at([x + 9, fy + 0.6, 54])], { size: 0.6, tone: "hi" }));
  return {
    items: [{ phase: "far", part: "labeler", svg: out.join(""), bounds: [x - 15, Y - 7, 0, x + 15, Y + 7, 62] }],
    part: { name: "Price sign", move: [0, -24, 26], anchor: [x, fy, 62] },
    fit: [[x - 15, Y, 62], [x + 15, Y, 62]],
  };
} };

// ---------- exit gates: security pedestals either side of the way out, threshold strip between ----------
PROPS["exit-gates"] = { slots: {}, build(c, { x }) {
  const { k, P, at, S, L, D, slab } = c;
  const ped = (y) => {
    const base = { x: x - 4, y: y - 2.5, w: 8, d: 5, r: 1 };
    const body = { x: x - 2.5, y: y - 1.2, w: 5, d: 2.4, r: 1.1 };
    return S(slab(base, 0, 2, 3), { tone: "lo" }) +
      S(slab(body, 2, 44, 4, 0.4), { tone: "hi", crease: "lo", inner: L(k.sideSeam(body, 30, P, 4), { tone: "faint" }) }) +
      D([at([x, y + 1.2, 40])], { size: 0.5, tone: "hi" });
  };
  return {
    items: [
      { phase: "far", part: "gate", svg: ped(-18), bounds: [x - 4, -20.5, 0, x + 4, -15.5, 46] },
      { phase: "near", part: "gate", svg: ped(18), bounds: [x - 4, 15.5, 0, x + 4, 20.5, 46] },
    ],
    part: { name: "Exit gates", move: [0, 0, 30], anchor: [x, -18, 46] },
  };
} };

// threshold strip across the aisle floor at the exit: the bump the carts ride over (the bump is the station's)
PROPS["threshold-strip"] = { slots: {}, build(c, { bump: B }) {
  const { k, P, at, S, L, D, slab } = c;
  const strip = { x: B.x, y: -18, w: B.w, d: 36, r: 1.2 };
  const svg = S(slab(strip, 0, B.h, 4, 0.4), { tone: "mid", crease: "lo" }) +
    L(k.lineOnTop([B.x + B.w / 2, -18], [B.x + B.w / 2, 18], B.h, P), { tone: "faint" }) +
    D([-14, -5, 5, 14].map((y) => at([B.x + 2, y, B.h])), { size: 0.35, tone: "lo" });
  return { items: [{ phase: "far", part: "gate", svg, bounds: c.box(strip, 0, B.h) }] };
} };

// ---------- shopping cart: the carrier, a basket of groceries; built at the origin ----------
PROPS["shopping-cart"] = { slots: { individual: "carrier" }, build(c, { i }) {
  const { k, P, at, S, L, D, slab, openBox } = c;
  const out = [];
  for (const [x, y] of c.byDepth([[-8, -5], [-8, 5], [8, -5], [8, 5]])) {
    out.push(S(k.cylinder(x, y, 1.6, 0, 1.2, P, 12), { tone: "mid" }));                                 // caster
    out.push(S(slab({ x: x - 0.5, y: y - 0.5, w: 1, d: 1, r: 0.2 }, 1.2, 2.4, 2), { tone: "mid" }));    // fork
  }
  out.push(S(slab({ x: -10, y: -6, w: 20, d: 12, r: 0.8 }, 3.6, 1.2, 3), { tone: "lo" }));              // chassis
  out.push(S(slab({ x: -10, y: -5.5, w: 1, d: 1, r: 0.2 }, 4.8, 24, 2), { tone: "mid" }));              // far upright
  const basket = openBox({ x: -10, y: -7, w: 21, d: 14, r: 0.6 }, 15, 10, 0.8, "mid");
  out.push(basket.far);
  // the bigger basket: a cereal box, a carton, and a bag on top
  out.push(S(slab({ x: -7, y: -5, w: 5, d: 8, r: 0.4 }, 15.8, 12, 2, 0.3), { tone: "mid" }));
  out.push(S(slab({ x: -1, y: -5.5, w: 6, d: 5, r: 0.4 }, 15.8, 8, 2, 0.3), { tone: "mid" }));
  const bag = { x: 1, y: 0, w: 8, d: 6, r: 2.4 };
  out.push(S(slab(bag, 15.8, 6, 5, 0.5), { tone: "hi", crease: "lo" }));
  out.push(L([2.4, 7.6].map((bx) => k.lineOnTop([bx, 0.2], [bx, 5.8], 21.8, P)).join(""), { tone: "lo" }));
  out.push(basket.near);
  out.push(S(slab({ x: -10, y: 4.5, w: 1, d: 1, r: 0.2 }, 4.8, 24, 2), { tone: "mid" }));               // near upright
  out.push(S(slab({ x: -11.6, y: -7, w: 1.6, d: 14, r: 0.6 }, 27.6, 1.6, 2), { tone: "mid" }));        // handle
  return { svg: `<g data-bag="${i}" opacity="0">${out.join("")}</g>` };
} };

// ---------- produce scale: the count slot. A dial face toward the reader; needle angle = value / n over 270° ----
// o: { i, x, y, n, value }. The face is the plane y + SCALE.FACE; ticks every unit to n, zero and n marked.
const SCALE = { FACE: 3, ZC: 30, R: 11 };
function scaleNeedle(k, P, x, y, v, N) {
  const a = -Math.PI * 0.75 + (v / N) * Math.PI * 1.5, fy = y + SCALE.FACE + 0.3;
  const p = (r) => k.iso([x + Math.sin(a) * r, fy, SCALE.ZC + Math.cos(a) * r], P);
  return k.pathOf([p(-2.6), p(SCALE.R - 3.2)]);
}
PROPS["produce-scale"] = { slots: { count: "needle" }, build(c, { i, x, y, n: N, value }) {
  const { k, P, at, S, L, D, slab } = c;
  const { FACE, ZC, R } = SCALE, fy = y + FACE;
  const out = [];
  const foot = { x: x - 10, y: y - 8, w: 20, d: 14, r: 2 };
  out.push(S(slab(foot, 0, 3, 4, 0.5), { tone: "mid", inner: L(k.sideSeam(foot, 1.2, P, 4), { tone: "faint" }) }));
  out.push(S(slab({ x: x - 2, y: y - 3, w: 4, d: 4, r: 0.6 }, 3, ZC - R - 4 - 3, 2, 0.3), { tone: "mid" }));          // column
  const head = { x: x - R - 3, y: y - FACE, w: 2 * R + 6, d: 2 * FACE, r: 3 };
  out.push(S(slab(head, ZC - R - 4, 2 * R + 8, 6, 0.6), { tone: "hi", crease: "lo" }));
  out.push(L(k.sideRing([x, fy, ZC], R + 1.2, "y", P, 64), { tone: "lo" }));          // bezel
  out.push(L(k.sideRing([x, fy, ZC], R, "y", P, 64), { tone: "faint" }));             // glass edge
  const ticks = { minor: [], major: [] };
  for (let t = 0; t <= N; t++) {
    const a = -Math.PI * 0.75 + (t / N) * Math.PI * 1.5, major = t % 5 === 0 || t === N;
    const r0 = R - (major ? 3.2 : 2), r1 = R - 0.8;
    (major ? ticks.major : ticks.minor).push(k.segment([x + Math.sin(a) * r0, fy, ZC + Math.cos(a) * r0], [x + Math.sin(a) * r1, fy, ZC + Math.cos(a) * r1], P));
  }
  out.push(L(ticks.minor.join(""), { tone: "lo", free: true }), L(ticks.major.join(""), { tone: "mid", free: true }));
  out.push(L(k.sideRing([x, fy, ZC], R - 3.2, "y", P, 64), { tone: "faint" }));     // tick circle: the needle tip lands on it
  out.push(L(k.sideRing([x, fy, ZC], 1.4, "y", P, 16), { tone: "mid" }));
  // weighing pan on top
  out.push(S(k.cylinder(x, y, 1.2, ZC + R + 4, 2, P, 12), { tone: "mid" }));
  out.push(`<g data-puck="${i}">${S(k.cylinder(x, y, 9, ZC + R + 6, 1.6, P, 40, 0.4), { tone: "mid" })}</g>`);   // the pan lights when its station is selected
  out.push(`<path data-needle="${i}" class="iso-line" data-tone="hi" data-free="start" d="${scaleNeedle(k, P, x, y, value, N)}" style="stroke-width:1.1"/>`);
  return {
    needleAt: (nx, v) => scaleNeedle(k, P, nx, y, v, N),
    items: [{ phase: "front", part: "gauge-" + i, svg: out.join(""), bounds: [x - R - 3, y - 8, 0, x + R + 3, y + 6, ZC + R + 8] }],
    part: { move: [0, 30, 6], anchor: [x, y, ZC + R + 7.6] },
  };
} };
