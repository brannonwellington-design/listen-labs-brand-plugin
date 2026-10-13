// Shared camera for anatomy objects whose geometry is a pure function of a projection.
// Orbit = re-project (rebuild) at a new azimuth; zoom/pan = SVG viewBox around a focus point.
// Browser code, inlined by object modules. Keep az within ~30–80° so painter's order holds.
function makeCamera(o) {
  // o: { svg, KIT, P0, CENTER, W, H, rebuild(P), start: { az, zoom, focus } }
  const projAt = (az) => {
    const Pu = { origin: [0, 0], scale: o.P0.scale, azimuth: az, elevation: o.P0.elevation ?? 30 };
    const a = o.KIT.iso(o.CENTER, o.P0), b = o.KIT.iso(o.CENTER, Pu);
    return { ...Pu, origin: [a[0] - b[0], a[1] - b[1]] };
  };
  const cam = { az: o.start.az, zoom: o.start.zoom, f: [...o.start.focus] };
  let want = { az: cam.az, zoom: cam.zoom, f: [...cam.f] };
  let P = o.P0, builtAz = o.P0.azimuth, ms = 0, last = [0, 0, o.W, o.H];
  function view() {
    const [fx, fy] = o.KIT.iso(cam.f, P);
    const w = o.W / cam.zoom, h = o.H / cam.zoom;
    last = [fx - w / 2, fy - h / 2, w, h];
    const vb = `${last[0].toFixed(2)} ${last[1].toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`;
    o.svg.setAttribute("viewBox", vb);
    (o.views || []).forEach((v) => v.setAttribute("viewBox", vb));
  }
  return {
    get P() { return P; },
    get rebuildMs() { return ms; },
    get view() { return last; },
    set(c) { want = { az: c.az, zoom: c.zoom, f: [...c.focus] }; },
    step(dt, snap, tau = 0.6) {
      const e = snap ? 1 : 1 - Math.exp(-dt / tau);
      cam.az += (want.az - cam.az) * e;
      cam.zoom += (want.zoom - cam.zoom) * e;
      for (let q = 0; q < 3; q++) cam.f[q] += (want.f[q] - cam.f[q]) * e;
      const done = Math.abs(want.az - cam.az) < 0.02 && Math.abs(want.zoom - cam.zoom) < 0.002 && cam.f.every((v, q) => Math.abs(v - want.f[q]) < 0.05);
      if (done) { cam.az = want.az; cam.zoom = want.zoom; cam.f = [...want.f]; }
      if (Math.abs(cam.az - builtAz) > 0.12 || (done && cam.az !== builtAz)) {
        const t0 = performance.now();
        P = projAt(cam.az);
        o.rebuild(P);
        builtAz = cam.az;
        ms = performance.now() - t0;
      }
      view();
      return !done;
    },
  };
}
