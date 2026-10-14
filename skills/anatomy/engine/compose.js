// World engine: props emit drawing items; the composer orders them for the painter and wraps them as parts.
// Plain browser-and-Node source (no imports): object modules concatenate it with the props and the world, then
// inline the result into the page, because geometry is rebuilt in the browser whenever the camera turns.
//
// An item is { phase, svg, part?, tip?, bounds?, raw? }:
//   phase   ground | far | carrier | near | front. Phases draw in that order. "far" and "near" are the two halves of
//           anything that holds or straddles moving things (a tote's back walls, then the bags, then its front walls).
//   bounds  [x0, y0, z0, x1, y1, z1], the item's box in world units. Within a phase, two items whose screen boxes
//           overlap draw in the order their boxes separate along the view; anything else keeps declaration order.
//   part    the parts-registry key this item belongs to (several items may share one part); tip "" = no tooltip.
//   raw     svg is emitted as is, with no part wrapper (moving carriers, wires).

const PHASES = ["ground", "far", "carrier", "near", "front"];
const PROPS = {};   // prop registry: props/*.js files add to it

// The drawing context every prop receives: the kit, the projection and the short helpers the props share.
function makeCtx(k, P) {
  const at = (p) => k.iso(p, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const D = (pts, style) => k.dotsSvg(pts, style);
  const slab = (plan, z, h, steps = 3, bevel = 0) => k.slabOf(plan, z, h, P, steps, bevel);
  const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  // open box: floor + far walls (draw before the contents), near walls (after). Viewer sits toward +x,+y.
  function openBox(plan, z, h, t, tone = "mid", floor = true) {
    const { x, y, w, d } = plan;
    const far = [], near = [];
    if (floor) far.push(S(slab({ x, y, w, d, r: plan.r }, z, t, 3, 0.4), { tone }));
    far.push(S(slab({ x, y, w, d: t, r: 0.4 }, z, h, 2, 0.3), { tone }));
    far.push(S(slab({ x, y: y + t, w: t, d: d - 2 * t, r: 0.4 }, z, h, 2, 0.3), { tone }));
    near.push(S(slab({ x: x + w - t, y: y + t, w: t, d: d - 2 * t, r: 0.4 }, z, h, 2, 0.3), { tone }));
    near.push(S(slab({ x, y: y + d - t, w, d: t, r: 0.4 }, z, h, 2, 0.3), { tone }));
    return { far: far.join(""), near: near.join("") };
  }
  // closed outlines lying on a vertical face
  const faceY = (y, pts) => k.pathOf(pts.map(([x, z]) => at([x, y, z])), true);
  const faceX = (x, pts) => k.pathOf(pts.map(([y, z]) => at([x, y, z])), true);
  const stadium = (c0, c1, len, h, steps = 6) => {        // in-face 2D stadium centred at (c0, c1)
    const r = h / 2, half = len / 2 - r, pts = [];
    for (let i = 0; i <= steps; i++) { const a = -Math.PI / 2 + (i / steps) * Math.PI; pts.push([c0 + half + Math.cos(a) * r, c1 + Math.sin(a) * r]); }
    for (let i = 0; i <= steps; i++) { const a = Math.PI / 2 + (i / steps) * Math.PI; pts.push([c0 - half + Math.cos(a) * r, c1 + Math.sin(a) * r]); }
    return pts;
  };
  const rect = (a0, a1, z0, z1) => [[a0, z0], [a1, z0], [a1, z1], [a0, z1]];
  // diagonal hatching across a plan rectangle lying at height z: the way to make an area read darker (paint, tape,
  // a chequer cell), since every fill is paper and tone colours only edges and lines. Square-cornered areas only (a
  // rounded corner leaves hatch ends floating). Returns a path d for L(…).
  const hatch = ({ x, y, w, d }, z, gap = 1.4) => {
    const out = [];
    for (let s = x + y + gap; s < x + w + y + d; s += gap) {
      const lo = Math.max(x, s - (y + d)), hi = Math.min(x + w, s - y);
      if (hi - lo > 0.2) out.push(k.lineOnTop([lo, s - lo], [hi, s - hi], z, P));
    }
    return out.join("");
  };
  const box = (plan, z0, z1) => [plan.x, plan.y, z0, plan.x + plan.w, plan.y + plan.d, z1];
  // ---------- solids in any orientation (the kit's own solids only extrude straight up) ----------
  // solid3(verts, faces): any convex solid from its corners and faces (each a list of vertex indices). Visible faces,
  // silhouette, creases and shading come from the camera, in the same layered paths the kit's solids use, so S(…) draws
  // them with the same tones, shading and themes. Returns those paths plus `bounds` ([x0,y0,z0,x1,y1,z1]) for items.
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const crossV = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const unit = (a) => { const n = Math.hypot(...a) || 1; return [a[0] / n, a[1] / n, a[2] / n]; };
  const hull2 = (pts) => {
    const q = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const half = (list) => { const h = []; for (const p of list) { while (h.length >= 2 && cr(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop(); h.push(p); } h.pop(); return h; };
    return [...half(q), ...half([...q].reverse())];
  };
  function solid3(verts, faces) {
    const { sinA, cosA, sinE, cosE } = k.cameraOf(P);
    const view = [cosA * cosE, sinA * cosE, sinE];                       // toward the viewer
    const mid = verts.reduce((m, v) => [m[0] + v[0] / verts.length, m[1] + v[1] / verts.length, m[2] + v[2] / verts.length], [0, 0, 0]);
    const info = faces.map((f) => {
      let n = unit(crossV(sub(verts[f[1]], verts[f[0]]), sub(verts[f[2]], verts[f[0]])));
      const fc = f.reduce((m, i) => [m[0] + verts[i][0] / f.length, m[1] + verts[i][1] / f.length, m[2] + verts[i][2] / f.length], [0, 0, 0]);
      if (dot(n, sub(fc, mid)) < 0) n = [-n[0], -n[1], -n[2]];             // outward
      return { f, n, seen: dot(n, view) > 1e-6 };
    });
    const pts = verts.map((v) => at(v)), path = (idx, closed) => k.pathOf(idx.map((i) => pts[i]), closed);
    // each edge, and whether the faces on its two sides are seen
    const edges = new Map();
    info.forEach(({ f, seen }) => f.forEach((a, i) => { const b = f[(i + 1) % f.length], key = a < b ? a + "," + b : b + "," + a; (edges.get(key) || edges.set(key, []).get(key)).push(seen); }));
    const outline = [], crease = [];
    for (const [key, sides] of edges) { const [a, b] = key.split(",").map(Number); const n = sides.filter(Boolean).length; if (n === 1) outline.push(path([a, b])); else if (n === 2) crease.push(path([a, b])); }
    // shading: faces that look up are the top; the rest go in the kit's shade buckets by how they face the light
    const shades = Array.from({ length: k.SHADES }, () => []), tops = [];
    const light = [-sinA, cosA];
    for (const { f, n, seen } of info) {
      if (!seen) continue;
      if (n[2] > 0.55) { tops.push(path(f, true)); continue; }
      const h = Math.hypot(n[0], n[1]) || 1, lit = Math.min(1, ((n[0] / h) * light[0] + (n[1] / h) * light[1] + 1) / 2 + Math.max(0, n[2]) * 0.4);
      shades[Math.min(k.SHADES - 1, Math.max(0, Math.floor(lit * k.SHADES)))].push(path(f, true));
    }
    const xs = verts.map((v) => v[0]), ys = verts.map((v) => v[1]), zs = verts.map((v) => v[2]);
    return { fill: k.pathOf(hull2(pts), true), outline: outline.join(""), crease: crease.join(""), top: tops.join(""), shades: shades.map((d) => d.join("")),
      bounds: [Math.min(...xs), Math.min(...ys), Math.min(...zs), Math.max(...xs), Math.max(...ys), Math.max(...zs)] };
  }
  // prism(profile, from, to): a convex 2D profile [[u, v]…] swept straight from one 3D point to another. v points as
  // close to straight up as the axis allows (u runs across): a gable roof is a triangle swept along the ridge, a ramp a
  // right triangle, a beam a rectangle.
  function prism(profile, from, to) {
    const a = unit(sub(to, from));
    const ref = Math.abs(a[2]) > 0.95 ? [1, 0, 0] : [0, 0, 1];
    const e2 = unit(sub(ref, a.map((x) => x * dot(ref, a)))), e1 = crossV(a, e2);
    const ring = (o) => profile.map(([u, v]) => [o[0] + u * e1[0] + v * e2[0], o[1] + u * e1[1] + v * e2[1], o[2] + u * e1[2] + v * e2[2]]);
    const verts = [...ring(from), ...ring(to)], n = profile.length;
    const faces = [profile.map((_, i) => i), profile.map((_, i) => n + i).reverse(), ...profile.map((_, i) => [i, (i + 1) % n, n + (i + 1) % n, n + i])];
    return solid3(verts, faces);
  }
  const circle = (r, steps) => Array.from({ length: steps }, (_, i) => [r * Math.cos((i / steps) * 2 * Math.PI), r * Math.sin((i / steps) * 2 * Math.PI)]);
  // rod(a, b, r): a round pole between any two points (a leaning post, a rail, a thick rope)
  const rod = (a, b, r, steps = 10) => prism(circle(r, steps), a, b);
  // disc([x, y, z], r, thickness, axis): a cylinder standing on its edge, facing along "x" or "y" (a wheel, a clock face)
  const disc = ([x, y, z], r, t, axis = "y", steps = 20) => axis === "x" ? prism(circle(r, steps), [x - t / 2, y, z], [x + t / 2, y, z]) : prism(circle(r, steps), [x, y - t / 2, z], [x, y + t / 2, z]);
  // box3([x, y, z], [w, d, h], { rz, ry, rx }): a box centred on (x, y, z), turned by degrees about z (spin), then y
  // (tip along x) and x (tip along y): a leaning sign, a fallen slat, a sagging roof panel
  function box3([x, y, z], [w, d, h], { rz = 0, ry = 0, rx = 0 } = {}) {
    const R = (deg) => (deg * Math.PI) / 180, [cz, sz, cy, sy, cx, sx] = [Math.cos(R(rz)), Math.sin(R(rz)), Math.cos(R(ry)), Math.sin(R(ry)), Math.cos(R(rx)), Math.sin(R(rx))];
    const turn = ([u, v, t]) => { let [a, b, cc] = [u * cz - v * sz, u * sz + v * cz, t]; [a, cc] = [a * cy + cc * sy, -a * sy + cc * cy]; [b, cc] = [b * cx - cc * sx, b * sx + cc * cx]; return [x + a, y + b, z + cc]; };
    const verts = []; for (const t of [-h / 2, h / 2]) for (const [u, v] of [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]]) verts.push(turn([u, v, t]));
    return solid3(verts, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]);
  }
  return { k, P, at, S, L, D, slab, byDepth, openBox, faceY, faceX, stadium, rect, box, hatch, solid3, prism, rod, disc, box3 };
}

// Order items for the painter. Within a phase, an edge a → b (a drawn first) is added only when the two items'
// screen boxes overlap and their world boxes separate on an axis; the side of that axis facing away from the
// viewer draws first. Ties and cycles fall back to declaration order, so a hand-ordered world stays as written.
function orderItems(items, k, P) {
  const tv = k.towardViewer(P);
  const screenBox = (b) => {
    let u0 = Infinity, v0 = Infinity, u1 = -Infinity, v1 = -Infinity;
    for (const x of [b[0], b[3]]) for (const y of [b[1], b[4]]) for (const z of [b[2], b[5]]) {
      const [u, v] = k.iso([x, y, z], P);
      if (u < u0) u0 = u; if (u > u1) u1 = u; if (v < v0) v0 = v; if (v > v1) v1 = v;
    }
    return [u0, v0, u1, v1];
  };
  const EPS = 0.01;
  const before = (a, b) => {                  // true: a draws first; false: b first; null: no separating axis
    for (let ax = 2; ax >= 0; ax--) {         // height first: what rests on something draws after it
      const dir = ax === 2 ? 1 : Math.sign(tv[ax]) || 1;
      if (a[ax + 3] <= b[ax] + EPS) return dir > 0;
      if (b[ax + 3] <= a[ax] + EPS) return dir < 0;
    }
    return null;
  };
  const out = [];
  for (const phase of PHASES) {
    const list = items.map((it, i) => ({ it, i })).filter(({ it }) => (it.phase || "far") === phase);
    const n = list.length;
    const sb = list.map(({ it }) => (it.bounds ? screenBox(it.bounds) : null));
    const succ = Array.from({ length: n }, () => []), indeg = new Array(n).fill(0);
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      const A = list[a].it.bounds, B = list[b].it.bounds;
      if (!A || !B) continue;
      const sa = sb[a], sbb = sb[b];
      if (sa[2] <= sbb[0] || sbb[2] <= sa[0] || sa[3] <= sbb[1] || sbb[3] <= sa[1]) continue;   // no screen overlap
      const r = before(A, B);
      if (r === true) { succ[a].push(b); indeg[b]++; } else if (r === false) { succ[b].push(a); indeg[a]++; }
    }
    // Kahn's algorithm, always taking the earliest-declared ready item; a cycle releases its earliest member
    const done = new Array(n).fill(false);
    for (let c = 0; c < n; c++) {
      let pick = -1;
      for (let j = 0; j < n; j++) if (!done[j] && indeg[j] === 0) { pick = j; break; }
      if (pick < 0) for (let j = 0; j < n; j++) if (!done[j]) { pick = j; break; }
      done[pick] = true;
      for (const s of succ[pick]) indeg[s]--;
      out.push(list[pick].it);
    }
  }
  return out;
}

function composeWorld(items, k, P, { sort = "depth" } = {}) {
  const ordered = sort === "declared"
    ? PHASES.flatMap((ph) => items.filter((it) => (it.phase || "far") === ph))
    : orderItems(items, k, P);
  return ordered.map((it) => {
    if (it.raw || !it.part) return it.svg;
    const tip = it.tip === undefined ? it.part : it.tip;
    return `<g data-part="${it.part}"${tip ? ` data-tipkey="${tip}"` : ""}>${it.svg}</g>`;
  }).join("");
}
