// Cutaway: open a part and show the evidence inside it. A stack of index cards rises out of the part —
// one card per verbatim the spec holds for that finding (capped at 24 drawn, the count always printed) —
// and a panel lists the quotes, each with its source. The part's casing goes see-through while open.
// Browser code, inlined by object modules. Nothing here invents text: items come from the spec.
function makeCutaway(o) {
  // o: { plate, svg, KIT, offset(partKey), onClose() }
  const NS = "http://www.w3.org/2000/svg";
  const panel = document.createElement("aside");
  panel.className = "cut"; panel.hidden = true;
  panel.setAttribute("aria-label", "Evidence");
  panel.innerHTML = `<div class="cut__head"><p class="cut__title" data-k="title"></p><button class="cut__close" type="button" aria-label="Close evidence">Close</button></div>
    <p class="cut__note" data-k="note"></p><ol class="cut__list" data-k="list"></ol>`;
  const leader = document.createElementNS(NS, "svg");
  leader.setAttribute("class", "cut__leader"); leader.setAttribute("aria-hidden", "true");
  o.plate.append(leader, panel);
  panel.querySelector(".cut__close").addEventListener("click", () => close());
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const short = (u) => { try { const x = new URL(u); return x.host + x.pathname.replace(/^(\/[^/]+\/[0-9a-f]{8}).*$/, "$1…"); } catch { return u; } };
  let cur = null, rise = { x: 0, v: 0 }, target = 0, g = null;
  function open(c) {
    // c: { part, anchor: [x,y,z], title, note, items: [{ quote, lead?, source, who }], total }
    cur = c; target = 1;
    o.plate.setAttribute("data-cut", c.part);
    panel.hidden = false;
    panel.querySelector('[data-k="title"]').textContent = c.title;
    panel.querySelector('[data-k="note"]').textContent = c.note || "";
    panel.querySelector('[data-k="list"]').innerHTML = c.items.map((it, i) =>
      `<li class="cut__card"><p class="cut__quote">${it.quote ? (it.lead ? esc(it.lead) + " " : "") + "“" + esc(it.quote) + "”" : "<span class=\"cut__noquote\">Quoted in the report; open the source for the passage.</span>"}</p>` +
      `<p class="cut__src">${esc(it.who || "Participant")} · <a href="${esc(it.source)}" target="_blank" rel="noopener">Source · ${esc(short(it.source))}</a></p></li>`).join("");
    panel.querySelector(".cut__list").scrollTop = 0;
  }
  function close() {
    if (!cur) return;
    target = 0; o.plate.removeAttribute("data-cut"); panel.hidden = true; leader.innerHTML = "";
    o.onClose && o.onClose();
  }
  function step(dt, snap) {
    if (snap) { rise.x = target; rise.v = 0; return; }
    const h = dt / 4;
    for (let q = 0; q < 4; q++) { rise.v += (60 * (target - rise.x) - 13 * rise.v) * h; rise.x += rise.v * h; }
    if (Math.abs(rise.x - target) < 1e-3 && Math.abs(rise.v) < 1e-3) { rise.x = target; if (target === 0) cur = null; }
  }
  // the card stack: thin slabs fanned upward from the anchor; the top card carries ruled lines
  function draw(P) {
    if (!g || !g.isConnected) { g = document.createElementNS(NS, "g"); g.setAttribute("data-cards", ""); o.svg.appendChild(g); }
    // only the opened part goes see-through (re-marked every frame: the camera rebuilds the SVG when it orbits)
    o.svg.querySelectorAll("[data-open]").forEach((el) => { if (!cur || el.dataset.part !== cur.part || target === 0) el.removeAttribute("data-open"); });
    if (cur && target === 1) o.svg.querySelectorAll('[data-part="' + cur.part + '"]').forEach((el) => el.setAttribute("data-open", ""));
    if (!cur || rise.x < 0.01) { g.innerHTML = ""; if (!cur) leader.innerHTML = ""; return; }
    const K = o.KIT, off = o.offset(cur.part), a = [0, 1, 2].map((q) => cur.anchor[q] + off[q]);
    const n = Math.min(24, Math.max(1, cur.total));
    const gap = 1.3 * rise.x, lift = 3 + Math.min(10, 2 + n) * rise.x;   // a thin stack hovers low over its part
    let out = "";
    for (let j = 0; j < n; j++) {
      const z = a[2] + lift + j * gap;
      const plan = { x: a[0] - 8, y: a[1] - 5.5, w: 16, d: 11, r: 0.6 };
      out += K.solidSvg(K.slabOf(plan, z, 0.5, P, 2, 0.2), { tone: j === n - 1 ? "hi" : "mid", crease: "none", lit: j === n - 1 });
    }
    const top = a[2] + lift + (n - 1) * gap + 0.5;
    const rules = [0.3, 0.5, 0.7].map((f, i) => K.lineOnTop([a[0] - 6, a[1] - 5.5 + 11 * f], [a[0] - 6 + (i === 2 ? 7 : 11), a[1] - 5.5 + 11 * f], top, P)).join("");
    out += K.lineSvg(rules, { tone: "lo", free: true });
    g.setAttribute("opacity", Math.min(1, rise.x * 1.5).toFixed(3));
    g.innerHTML = out;
    // leader from the panel to the top card
    const pr = o.plate.getBoundingClientRect(), m = o.svg.getScreenCTM();
    if (!m || panel.hidden) return;
    const [u, v] = K.iso([a[0], a[1], top], P);
    const pt = new DOMPoint(u, v).matrixTransform(m), qr = panel.getBoundingClientRect();
    const ax = pt.x - pr.left, ay = pt.y - pr.top, lx = qr.left - pr.left - 2, ly = Math.min(Math.max(qr.top - pr.top + 20, ay), qr.bottom - pr.top - 20);
    leader.setAttribute("viewBox", `0 0 ${pr.width.toFixed(1)} ${pr.height.toFixed(1)}`);
    leader.innerHTML = ax < lx ? `<path class="bp-leader" data-on d="M${lx.toFixed(1)} ${ly.toFixed(1)}H${Math.max(ax + 6, lx - 12).toFixed(1)}L${ax.toFixed(1)} ${ay.toFixed(1)}"/><circle class="bp-dot" data-on cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="2.5"/>` : "";
  }
  // a framing that keeps the opened part (and its rising cards) in the left part of the shot, clear of the panel:
  // focus moves along the screen's right axis by `share` of the visible width
  function frame(P, az, zoom, W, share = 0.22, at = null, lift = 14) {
    const K = o.KIT, a = at || (cur ? cur.anchor : [0, 0, 0]);
    const Pa = { ...P, azimuth: az };
    const ex = K.axisVector(Pa, [1, 0, 0]), ey = K.axisVector(Pa, [0, 1, 0]);
    const want = (W / zoom) * share;                  // screen px to the right
    const det = ex[0] * ey[1] - ey[0] * ex[1];
    const bx = (want * ey[1]) / det, by = (-want * ex[1]) / det;   // world dx, dy giving a pure horizontal shift
    return { az, zoom, focus: [a[0] + bx, a[1] + by, a[2] + lift] };
  }
  return { open, close, step, draw, frame, get open_() { return cur; }, get busy() { return rise.x !== target; }, get isOpen() { return !!cur && target === 1; } };
}
