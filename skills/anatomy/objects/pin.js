// Pin: names one followed respondent on the drawing — a label with a leader that lands on a terminal dot at a world
// point, easing as that point moves (a riding bag, a coin the follow hops to). Stays below the figure's toolbar.
// Browser code, inlined by object modules (the sort bench has its own earlier copy of this logic).
function makePin(o) {
  // o: { plate, svg, KIT }
  const NS = "http://www.w3.org/2000/svg";
  const el = document.createElement("div");
  el.className = "follow-pin"; el.hidden = true; el.setAttribute("aria-live", "polite");
  el.innerHTML = '<span class="follow-pin__who"></span><span class="follow-pin__sub"></span>';
  const line = document.createElementNS(NS, "svg");
  line.setAttribute("class", "follow-pin__line"); line.setAttribute("aria-hidden", "true");
  o.plate.append(line, el);
  let at = null, moving = false;
  return {
    set(who, sub) { el.hidden = false; el.querySelector(".follow-pin__who").textContent = who; el.querySelector(".follow-pin__sub").textContent = sub || ""; },
    hide() { el.hidden = true; line.innerHTML = ""; at = null; moving = false; },
    get moving() { return moving; },
    update(P, world, dt, snap) {
      if (el.hidden) return;
      const pr = o.plate.getBoundingClientRect(), m = o.svg.getScreenCTM();
      el.toggleAttribute("data-idle", !world);   // nothing visible to point at: the label rests, faded, with no leader
      if (!world || !m) { line.innerHTML = ""; return; }
      const [u, v] = o.KIT.iso(world, P), pt = new DOMPoint(u, v).matrixTransform(m);
      const want = [pt.x - pr.left, pt.y - pr.top];
      const e = snap || !at ? 1 : 1 - Math.exp(-dt / 0.12);
      at = at ? [at[0] + (want[0] - at[0]) * e, at[1] + (want[1] - at[1]) * e] : want;
      moving = Math.hypot(want[0] - at[0], want[1] - at[1]) > 0.4;
      const tools = o.plate.querySelector(".fig-tools"), floor = tools ? tools.getBoundingClientRect().bottom - pr.top + 8 : 8;
      // on a blueprint sheet the space above the drawing belongs to the callouts and their leaders: hang the pin below
      const below = o.plate.hasAttribute("data-blueprint");
      const lx = Math.max(8, Math.min(pr.width - el.offsetWidth - 8, at[0] + 34));
      const ly = below ? Math.min(pr.height - el.offsetHeight - 48, at[1] + 26) : Math.max(floor, at[1] - 58);
      el.style.transform = "translate(" + lx.toFixed(1) + "px, " + ly.toFixed(1) + "px)";
      line.setAttribute("viewBox", "0 0 " + pr.width.toFixed(1) + " " + pr.height.toFixed(1));
      const inside = at[0] > 0 && at[0] < pr.width && at[1] > 0 && at[1] < pr.height;
      line.innerHTML = inside ? '<path class="bp-leader" data-on d="M' + lx.toFixed(1) + " " + (ly + el.offsetHeight / 2).toFixed(1) + "H" + (at[0] + 14).toFixed(1) + "L" + at[0].toFixed(1) + " " + at[1].toFixed(1) + '"/><circle class="bp-dot" data-on cx="' + at[0].toFixed(1) + '" cy="' + at[1].toFixed(1) + '" r="2.5"/>' : "";
    },
  };
}
