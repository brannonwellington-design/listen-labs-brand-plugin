// Scene primitives: the shapes worlds are built from beyond boxes and cylinders. Plain source, concatenated after
// engine/compose.js. Every function takes the drawing context `c` (makeCtx) and returns compose items with bounds,
// so curved, many-piece things (a stadium bowl, a crowd) depth-sort with everything else.
//
//   racetrack(cx, cy, straight, radius)   a closed centreline: two straights joined by semicircles (a running
//                                         track, a stadium bowl, a velodrome). Everything below offsets from it.
//   bandRing(T, s0, s1, d0, d1)           the plan of a band between offsets d0 and d1 from the centreline, from
//                                         arc length s0 to s1: a lane, a stand section, a concourse
//   bandLine(T, s0, s1, d, z)             points of a line along the band at offset d (lane lines, seat rows)
//   tiers(c, T, {...})                    a stepped stand: solid tiers rising outward, cut into sections
//   ground(c, {...})                      the slab a world stands on, plain, tiled or striped (grass)
//   person(c, [x, y, z], {...})           one figure: a token for one respondent, never decoration
//   bounds2(ring, z0, z1)                 the world box of a plan ring

function bounds2(ring, z0, z1) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of ring) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return [x0, y0, z0, x1, y1, z1];
}

// s runs anticlockwise seen from above, starting at the far end of the far straight (y = cy − radius, the side
// away from a default camera). The outward normal points away from the infield.
function racetrack(cx, cy, straight, radius) {
  const half = straight / 2, arc = Math.PI * radius, L = 2 * straight + 2 * arc;
  const seg = [straight, arc, straight, arc];
  function at(s) {
    s = ((s % L) + L) % L;
    if (s < seg[0]) return { p: [cx - half + s, cy - radius], n: [0, -1] };
    s -= seg[0];
    if (s < seg[1]) { const a = -Math.PI / 2 + s / radius; return { p: [cx + half + Math.cos(a) * radius, cy + Math.sin(a) * radius], n: [Math.cos(a), Math.sin(a)] }; }
    s -= seg[1];
    if (s < seg[2]) return { p: [cx + half - s, cy + radius], n: [0, 1] };
    s -= seg[2];
    const a = Math.PI / 2 + s / radius;
    return { p: [cx - half + Math.cos(a) * radius, cy + Math.sin(a) * radius], n: [Math.cos(a), Math.sin(a)] };
  }
  const breaks = [0, seg[0], seg[0] + seg[1], seg[0] + seg[1] + seg[2], L];
  return { cx, cy, straight, radius, L, at, breaks,
    point: (s, d = 0) => { const { p, n } = at(s); return [p[0] + n[0] * d, p[1] + n[1] * d]; },
    normal: (s) => at(s).n,
    curved: (s) => { s = ((s % L) + L) % L; return (s > seg[0] && s < seg[0] + seg[1]) || s > seg[0] + seg[1] + seg[2]; } };
}

// sample arc lengths s0..s1: every straight corner exactly, about every `step` units around the bends
function bandSamples(T, s0, s1, step = 3) {
  const out = [s0];
  const inner = T.breaks.flatMap((b) => [b, b + T.L, b - T.L]).filter((b) => b > s0 + 1e-6 && b < s1 - 1e-6);
  let s = s0;
  const marks = [...inner, s1].sort((a, b) => a - b);
  for (const m of marks) {
    const curved = T.curved((s + m) / 2);
    const n = curved ? Math.max(1, Math.ceil((m - s) / step)) : 1;
    for (let i = 1; i <= n; i++) out.push(s + ((m - s) * i) / n);
    s = m;
  }
  return out;
}
function bandRing(T, s0, s1, d0, d1, step) {
  const ss = bandSamples(T, s0, s1, step);
  return [...ss.map((s) => T.point(s, d1)), ...ss.slice().reverse().map((s) => T.point(s, d0))];
}
const bandLine = (T, s0, s1, d, step) => bandSamples(T, s0, s1, step).map((s) => T.point(s, d));

// A stepped stand around (part of) a track: `rows` solid tiers, each `depth` deep and `rise` higher than the one
// inside it, starting `d0` out from the centreline, cut into `sections` between s0 and s1. Each tier carries a seat
// row line along its tread. Returns { items, sections: [{ s0, s1, tiers: [{ d0, d1, z }] }] } so a world can seat
// figures on the treads. Within a section, the tier nearer the viewer is declared last.
function tiers(c, T, { s0 = 0, s1 = T.L, sections = 16, d0 = 0, depth = 8, rise = 4, rows = 6, z0 = 0, part = "stands", tip = "", tone = "mid", seat = true, phase = "far", step = 3 } = {}) {
  const { k, P, S, L } = c;
  const tv = k.towardViewer(P);
  const items = [], out = [];
  for (let j = 0; j < sections; j++) {
    const a = s0 + ((s1 - s0) * j) / sections, b = s0 + ((s1 - s0) * (j + 1)) / sections;
    const n = T.normal((a + b) / 2);
    const facesViewer = n[0] * tv[0] + n[1] * tv[1] < 0;   // a stand whose seats look toward the camera
    const list = [];
    for (let i = 0; i < rows; i++) {
      const r0 = d0 + i * depth, r1 = r0 + depth, top = z0 + (i + 1) * rise;
      const ring = bandRing(T, a, b, r0, r1, step);
      const inner = seat ? L(k.onTop(bandLine(T, a, b, r0 + depth * 0.55, step), top, P), { tone: "lo" }) : "";
      list.push({ phase, part, tip, svg: S(k.extrude(ring, z0, top - z0, P, { convex: false }), { tone, inner }), bounds: bounds2(ring, z0, top) });
      out.push({ s0: a, s1: b, row: i, d0: r0, d1: r1, z: top });
    }
    items.push(...(facesViewer ? list.reverse() : list));
  }
  return { items, seats: out };
}

// The ground: a slab with a halo, an inset border and an optional surface pattern whose lines run border to border.
function ground(c, { plan, h = 6, pattern = "none", tile = 20, part = "base", tip = "", tone = "mid", stripes = 12, axis = "x" }) {
  const { k, P, L, S } = c;
  const out = [`<path class="iso-halo" d="${k.haloOf(plan, -h, h, P)}"/>`];
  out.push(S(k.slabOf(plan, -h, h, P, 8, 1.2), { tone }));
  const inset = k.insetPlan(plan, 4);
  out.push(L(k.planOutline(inset, 0, P), { tone: "faint" }));
  const lines = [];
  if (pattern === "tiles") {
    for (let x = inset.x + tile; x < inset.x + inset.w - 2; x += tile) lines.push(k.lineOnTop([x, inset.y], [x, inset.y + inset.d], 0, P));
    for (let y = inset.y + tile; y < inset.y + inset.d - 2; y += tile) lines.push(k.lineOnTop([inset.x, y], [inset.x + inset.w, y], 0, P));
  } else if (pattern === "stripes") {
    const along = axis === "x", span = along ? inset.w : inset.d;
    for (let i = 1; i < stripes; i++) {
      const t = (span * i) / stripes;
      lines.push(along ? k.lineOnTop([inset.x + t, inset.y], [inset.x + t, inset.y + inset.d], 0, P) : k.lineOnTop([inset.x, inset.y + t], [inset.x + inset.w, inset.y + t], 0, P));
    }
  }
  if (lines.length) out.push(L(lines.join(""), { tone: "faint" }));
  return { phase: "ground", part, tip, svg: out.join(""), bounds: c.box(plan, -h, 0) };
}

// One person, standing at [x, y, z]: a body and a head. `h` is the height in world units. `lit` paints the brand
// accent (a followed respondent); `data` adds attributes (data-respondent="7"). Below about 3 px tall on screen it
// draws as a single dot, so a crowd stays legible when the camera pulls back.
function person(c, [x, y, z], { h = 7, tone = "hi", lit = false, data = "", phase = "far", part, tip } = {}) {
  const { k, P, S, D, at } = c;
  const px = Math.abs(at([x, y, z + h])[1] - at([x, y, z])[1]);
  let svg;
  if (px < 3) svg = D([at([x, y, z + h * 0.6])], { size: 0.7, tone: lit ? "hi" : "mid" });
  else {
    const r = h * 0.17;
    svg = S(k.cylinder(x, y, r, z, h * 0.66, P, 12, 0), { tone, lit, crease: "lo" }) +
      S(k.cylinder(x, y, r * 0.78, z + h * 0.72, h * 0.28, P, 12, r * 0.25), { tone, lit, crease: "lo" });
  }
  return { phase, part, tip, raw: !part, svg: data ? `<g ${data}>${svg}</g>` : svg, bounds: [x - h * 0.2, y - h * 0.2, z, x + h * 0.2, y + h * 0.2, z + h] };
}
