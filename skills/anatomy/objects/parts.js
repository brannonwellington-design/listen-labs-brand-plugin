// Parts: self-assembly and exploded views for any anatomy object whose geometry
// tags its assemblies with data-part and returns a parts registry
// ([{ key, name, move: [dx, dy, dz], anchor: [x, y, z], station }]).
// Browser code, inlined by object modules. One spring per assembly (0 = assembled, 1 = apart),
// staggered; on a reversal only the assemblies whose target changes are rescheduled
// (references/motion.md, "Exploded views").
function makeParts(o) {
  // o: { svg, KIT, parts, order?, gap = 0.035 }
  const K = 64, C = 14.2, SUB = 4;
  const S = {};
  o.parts.forEach((p) => { S[p.key] = { p, x: 0, v: 0, target: 0, vis: 1, visT: 1, pending: null }; });
  const order = (o.order || o.parts.map((p) => p.key)).filter((k) => S[k]);   // an order may name parts this build doesn't have
  const moves = (k) => S[k].p.move.some((v) => v !== 0);
  let clock = 0;
  function set(apart, gap = o.gap ?? 0.035) {
    const want = apart ? 1 : 0;
    const seq = (apart ? order : [...order].reverse()).filter(moves);
    let n = 0;
    for (const k of seq) {
      const s = S[k];
      s.pending = null;                       // anything that hasn't left yet stays home
      if (s.target === want) continue;
      s.pending = { value: want, vis: 1, at: clock + n++ * gap };
    }
  }
  // Build the machine in front of the reader: everything starts apart and invisible,
  // then each assembly fades in on its way home, in order.
  function intro(gap = 0.09) {
    order.forEach((k, i) => {
      const s = S[k];
      s.x = moves(k) ? 1 : 0; s.v = 0; s.target = s.x; s.vis = 0; s.visT = 0;
      s.pending = { value: 0, vis: 1, at: clock + i * gap };
    });
    return order.length * gap + 1.1;            // seconds until settled
  }
  function step(dt, snap) {
    clock += dt;
    for (const k of order) {
      const s = S[k];
      if (s.pending && (snap || clock >= s.pending.at)) { s.target = s.pending.value; s.visT = s.pending.vis; s.pending = null; }
      if (snap) { s.x = s.target; s.v = 0; s.vis = s.visT; continue; }
      const h = dt / SUB;
      for (let q = 0; q < SUB; q++) { s.v += (K * (s.target - s.x) - C * s.v) * h; s.x += s.v * h; }
      if (Math.abs(s.x - s.target) < 1e-4 && Math.abs(s.v) < 1e-3) { s.x = s.target; s.v = 0; }
      s.vis += (s.visT - s.vis) * (1 - Math.exp(-dt / 0.22));
      if (Math.abs(s.vis - s.visT) < 2e-3) s.vis = s.visT;
    }
  }
  const offset = (k) => { const s = S[k]; return s ? s.p.move.map((v) => v * s.x) : [0, 0, 0]; };
  function apply(P) {
    o.svg.querySelectorAll("[data-part]").forEach((el) => {
      const s = S[el.dataset.part];
      if (!s) return;
      if (Math.abs(s.x) > 1e-4) el.setAttribute("transform", o.KIT.translateAlong(P, offset(el.dataset.part)));
      else el.removeAttribute("transform");
      if (s.vis < 0.999) el.setAttribute("opacity", Math.max(0, s.vis).toFixed(3));
      else el.removeAttribute("opacity");
    });
  }
  return {
    set, intro, step, apply, offset,
    share: (k) => (S[k] ? S[k].x : 0),
    vis: (k) => (S[k] ? S[k].vis : 1),
    get apart() { return Math.max(...order.map((k) => S[k].x)); },
    get busy() { return order.some((k) => { const s = S[k]; return s.pending || s.x !== s.target || s.vis !== s.visT; }); },
    get count() { return order.filter(moves).length; },
  };
}
