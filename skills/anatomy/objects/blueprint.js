// Blueprint: a technical-drawing view of any anatomy object that has a parts registry.
// The drawing re-inks (CSS on .iso-plate[data-blueprint]); this module adds the annotation layer:
// one numbered callout per finding, in a row above the drawing, each with a leader that lands on
// a terminal dot on the part's surface and a scale of n ticks (one tick per respondent).
// Browser code, inlined by object modules.
function makeBlueprint(o) {
  // o: { plate, svg, KIT, items: [{ part, anchor, num, name, count, n }], offset(partKey), onPick(i) }
  // anchor is a world point, or a function returning one (for parts whose position is data: a coin stack's top,
  // a drawer pulled out by its count). setItems() swaps the findings when the figure changes chapter.
  const NS = "http://www.w3.org/2000/svg";
  const layer = document.createElement("div");
  layer.className = "bp-layer";
  const leaders = document.createElementNS(NS, "svg");
  leaders.setAttribute("class", "bp-leaders");
  leaders.setAttribute("aria-hidden", "true");
  const row = document.createElement("div");
  row.className = "bp-row";
  row.style.setProperty("--bp-cols", String(o.items.length));
  const scale = (count, n) => {
    if (count == null) return `<svg class="bp-scale" viewBox="0 0 62 6" aria-hidden="true"><path class="bp-scale__miss" d="M0 3H62"/></svg>`;
    if (n > 60) {   // too many respondents for one tick each: a proportional bar, still read against n
      const w = (62 * count) / n;
      return `<svg class="bp-scale" viewBox="0 0 62 6" aria-hidden="true"><rect class="bp-scale__rest" x="0" y="1" width="62" height="4"/><rect class="bp-scale__on" x="0" y="1" width="${w.toFixed(2)}" height="4"/></svg>`;
    }
    const step = 62 / n, on = [], off = [];
    for (let i = 0; i < n; i++) (i < count ? on : off).push(`M${(i * step + step / 2).toFixed(2)} ${i % 5 === 4 ? 0 : 1.5}V6`);
    return `<svg class="bp-scale" viewBox="0 0 62 6" aria-hidden="true"><path class="bp-scale__rest" d="${off.join("")}"/><path class="bp-scale__on" d="${on.join("")}"/></svg>`;
  };
  // layout "row": labels across the top, leaders drop to parts laid out left to right (stations, benches, columns).
  // layout "column": labels down the right edge, leaders run left to parts stacked top to bottom (drawers).
  // Either way the label order matches the parts' screen order, so no two leaders cross.
  let items = o.items, labels = [], layout = o.layout || "row";
  function makeLabels() {
  row.innerHTML = "";
  row.style.setProperty("--bp-cols", String(items.length));
  row.toggleAttribute("data-many", items.length > 5 && layout === "row");
  row.dataset.layout = layout;
  labels = items.map((it, i) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "bp-label";
    el.dataset.i = String(i);
    el.innerHTML = `<span class="bp-label__head"><span class="bp-num">${it.num}</span><span class="bp-name">${it.name}</span></span>` +
      `<span class="bp-count">${it.count == null ? "not reported" : it.count + "<span>/" + it.n + "</span>"}</span>${scale(it.count, it.n)}`;
    el.setAttribute("aria-label", `${it.num} ${it.name}: ${it.count == null ? "not reported" : it.count + " of " + it.n}`);
    el.addEventListener("pointerenter", () => o.onPick && o.onPick(i, "hover"));
    el.addEventListener("click", () => o.onPick && o.onPick(i, "click"));
    el.title = it.name;
    el.tabIndex = on ? 0 : -1;
    row.appendChild(el);
    return el;
  });
  }
  let on = false;
  makeLabels();
  layer.append(leaders, row);
  o.plate.appendChild(layer);
  let reinkTimer = 0;
  function set(v) {
    if (v !== on) { o.plate.setAttribute("data-reinking", ""); clearTimeout(reinkTimer); reinkTimer = setTimeout(() => o.plate.removeAttribute("data-reinking"), 450); }
    on = v;
    o.plate.toggleAttribute("data-blueprint", v);
    layer.classList.toggle("is-on", v);
    labels.forEach((el) => { el.tabIndex = v ? 0 : -1; });
    if (!v) leaders.innerHTML = "";
  }
  function lit(i) { labels.forEach((el, j) => el.toggleAttribute("data-on", i === j)); }
  function update(P, show = true) {
    layer.classList.toggle("is-hidden", !show);
    if (!on || !show) return;
    const pr = o.plate.getBoundingClientRect();
    const m = o.svg.getScreenCTM();
    if (!m || !pr.width) return;
    leaders.setAttribute("viewBox", `0 0 ${pr.width.toFixed(1)} ${pr.height.toFixed(1)}`);
    const compact = pr.width < 520;
    row.classList.toggle("is-compact", compact);
    let d = "", dots = "";
    labels.forEach((el, i) => {
      const it = items[i];
      const off = o.offset(it.part);
      const a = typeof it.anchor === "function" ? it.anchor() : it.anchor;
      const [u, v] = o.KIT.iso([0, 1, 2].map((q) => a[q] + off[q]), P);
      const pt = new DOMPoint(u, v).matrixTransform(m);
      const ax = pt.x - pr.left, ay = pt.y - pr.top;
      el.style.visibility = "";
      if (compact && layout === "column" && !el.hasAttribute("data-on")) { el.style.visibility = "hidden"; return; }   // stacked parts: only the chapter's lit one fits
      if (compact) {   // phones: a small tag sits on a short stub right above its part
        const w = el.offsetWidth, h = el.offsetHeight;
        const x = Math.max(4, Math.min(pr.width - w - 4, ax - w / 2)), y = Math.max(4, ay - h - 12);
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        el.toggleAttribute("data-off", false);
        d += `<path class="bp-leader" data-i="${i}" d="M${ax.toFixed(1)} ${(y + h).toFixed(1)}V${ay.toFixed(1)}"/>`;
        dots += `<circle class="bp-dot" data-i="${i}" cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="2.5"/>`;
        return;
      }
      el.style.transform = "";
      const lr = el.getBoundingClientRect();
      if (layout === "column") {
        const lx = lr.left - pr.left - 4, ly = lr.top - pr.top + lr.height / 2;
        const inside = ax > 0 && ax < lx && ay > 0 && ay < pr.height;
        el.toggleAttribute("data-off", !inside);
        if (!inside) return;
        const knee = Math.max(ax + 4, lx - 10);
        d += `<path class="bp-leader" data-i="${i}" d="M${lx.toFixed(1)} ${ly.toFixed(1)}H${knee.toFixed(1)}L${ax.toFixed(1)} ${ay.toFixed(1)}"/>`;
        dots += `<circle class="bp-dot" data-i="${i}" cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="2.5"/>`;
        return;
      }
      // the row sits above the drawing (desktop) or below it (phones); leaders leave from the side facing the part
      const below = lr.top - pr.top > pr.height / 2;
      const lx = lr.left - pr.left + lr.width / 2, ly = below ? lr.top - pr.top - 4 : lr.bottom - pr.top + 4;
      const inside = ax > 0 && ax < pr.width && (below ? ay < ly && ay > 0 : ay > ly && ay < pr.height);
      el.toggleAttribute("data-off", !inside);
      if (!inside) return;
      const knee = below ? Math.max(ay + 4, ly - 10) : Math.min(ay - 4, ly + 10);
      d += `<path class="bp-leader" data-i="${i}" d="M${lx.toFixed(1)} ${ly.toFixed(1)}V${knee.toFixed(1)}L${ax.toFixed(1)} ${ay.toFixed(1)}"/>`;
      dots += `<circle class="bp-dot" data-i="${i}" cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="2.5"/>`;
    });
    leaders.innerHTML = d + dots;
    const lit = labels.findIndex((el) => el.hasAttribute("data-on"));
    leaders.querySelectorAll(`[data-i="${lit}"]`).forEach((n) => n.setAttribute("data-on", ""));
  }
  function setItems(next, nextLayout = "row") { const keep = labels.findIndex((el) => el.hasAttribute("data-on")); items = next; layout = nextLayout; makeLabels(); if (keep >= 0) lit(keep); }
  return { set, lit, update, setItems, get on() { return on; } };
}
