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
  return { k, P, at, S, L, D, slab, byDepth, openBox, faceY, faceX, stadium, rect, box, hatch };
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
