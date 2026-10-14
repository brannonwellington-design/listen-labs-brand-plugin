// Curb world (lineup pattern): one figure per respondent on a sidewalk that is a rating scale. The building wall is
// the scale's low end, the curb (where a driverless pod waits) its high end; each person stands at their own rating.
// Groups take a lane each, either side of the scale painted down the middle; people with the same rating stand one
// behind another, so each lane reads as a dot plot. A cone stands at each lane's median. Switching the condition walks
// everyone to their rating for it. No answer = faded, off the scale beside the wall.
//
// A spec with `scenery` swaps the curb, the building and the pod for its own end-of-lane props, so the same street can
// stand for any subject (damage → repair, a start line → a finish line):
//   scenery: { low: [item…], high: [item…], surface?: "tiles" | "lanes" | "plain" }, item = { prop, lane: 0 | 1 | "both",
//   opts?, name? }. Items at one end line up outward from the scale, nearest first; each prop declares its footprint.
//
// Data (spec): scale { min, max, labels? } · groups [{ key, name, people: [index…] }] (two lanes) ·
// people [{ label, group, values: { <cond key>: number | null } }] · conds [{ key, name, dressing: day | night | airport }] ·
// groupStats[g][cond] { median, n }.
// State (rebuild): { cond, follow, sel: { group } }.
// Plain source, concatenated after engine/compose.js, engine/primitives.js and props/street.js.

const CURB = { x0: 0, step: 14, laneGap: 9, slot: 4.6, perCol: 9, wall: -12, curbAt: 152, half: 54 };

function curbLayout(spec) {
  const { min, max } = spec.scale;
  if (spec.groups.length !== 2) throw new Error("curb world takes two groups (two lanes), got " + spec.groups.length);
  const gap = spec.scale.labels ? CURB.laneGap + 5 : CURB.laneGap;   // a worded scale paints its words in a wider strip
  const step = (10 * CURB.step) / (max - min);   // every scale spans the same street: a 1–5 scale gets wider steps
  const xOf = (r) => CURB.x0 + (r - min) * step;
  // where each person stands for a condition: their rating on x, a slot behind others with the same rating on y
  function positions(condKey) {
    const out = new Array(spec.people.length);
    spec.groups.forEach((g, gi) => {
      const side = gi === 0 ? -1 : 1, seen = {};
      g.people.forEach((pi) => {
        const v = spec.people[pi].values[condKey];
        // no answer: faded, off the scale beside its low end, in columns that wrap like the rated ones (outward, away from the scale)
        if (v == null) { const k = (seen.none = (seen.none || 0) + 1) - 1, col = Math.floor(k / CURB.perCol), row = k % CURB.perCol; out[pi] = { x: CURB.x0 - 7 - col * 3.4, y: side * (gap + row * CURB.slot), missing: true }; return; }
        const k = (seen[v] = (seen[v] || 0) + 1) - 1, col = Math.floor(k / CURB.perCol), row = k % CURB.perCol;
        out[pi] = { x: xOf(v) + (col ? (col % 2 ? 3 : -3) * Math.ceil(col / 2) : 0), y: side * (gap + row * CURB.slot), missing: false };
      });
    });
    return out;
  }
  const scaleEnd = xOf(max);
  if (spec.scenery) {
    const places = sceneryPlaces(spec.scenery), xs = places.flatMap((q) => [q.x - q.foot[0] / 2, q.x + q.foot[0] / 2]);
    const x0 = Math.min(CURB.wall, ...xs) - 4, x1 = Math.max(CURB.curbAt, ...xs) + 4;
    return { xOf, step, gap, positions, CENTER: [(x0 + x1) / 2, 0, 12], scaleEnd, places, ground: [x0, x1],
      fit: [[x0, -CURB.half, 30], [x0, CURB.half, 30], [x1, CURB.half, 0], [x1, -CURB.half, 0], [x1, 0, 26]] };
  }
  return { xOf, step, gap, positions, CENTER: [scaleEnd / 2 + 10, 0, 12], scaleEnd,
    fit: [[CURB.wall - 10, -CURB.half, 54], [CURB.wall - 10, CURB.half, 54], [CURB.curbAt + 60, CURB.half, -9], [CURB.curbAt + 60, -CURB.half, -9], [CURB.curbAt + 50, 12, 22]] };
}
// where each scenery item stands: past its end of the scale, in its lane, lined up outward from the scale
function sceneryPlaces(scenery) {
  const out = [];
  for (const end of ["low", "high"]) {
    // one cursor per lane, moving outward; an item across both lanes starts past whatever either lane holds, and pushes both
    // clear of the scale's end, where people stand; scenery.lowGap / highGap set the distance from the end tick
    const scaleEnd = CURB.x0 + 10 * CURB.step;
    const start = end === "low" ? CURB.x0 - (scenery.lowGap ?? 18) : scaleEnd + (scenery.highGap ?? 32), cursor = { 0: start, 1: start };
    const further = end === "low" ? Math.min : Math.max;
    (scenery[end] || []).forEach((it, i) => {
      const prop = PROPS[it.prop];
      if (!prop) throw new Error("scenery: unknown prop " + it.prop);
      const foot = prop.footprint || [20, 20], lane = it.lane ?? "both";
      if (lane !== "both" && lane !== 0 && lane !== 1) throw new Error(`scenery: lane must be 0, 1 or "both" (${it.prop})`);
      const edge = lane === "both" ? further(cursor[0], cursor[1]) : cursor[lane];
      const x = end === "low" ? edge - foot[0] / 2 : edge + foot[0] / 2;
      const next = end === "low" ? edge - foot[0] - 4 : edge + foot[0] + 4;
      if (lane === "both") cursor[0] = cursor[1] = next; else cursor[lane] = next;
      const y = lane === "both" ? 0 : (lane === 0 ? -1 : 1) * (CURB.half / 2);
      out.push({ ...it, end, i, x, y, foot, part: `${end}-${i}` });
    });
  }
  return out;
}

// one person: body and head, all in one tone (position is the data); a faded figure has no answer for this condition
function curbPersonSvg(c, x, y, lit, missing) {
  const { k, P, S } = c;
  const svg = S(k.cylinder(x, y, 1.3, 0, 4.6, P, 12, 0), { tone: "hi", lit, crease: "lo" }) + S(k.cylinder(x, y, 1.05, 5, 2, P, 12, 0.3), { tone: "hi", lit, crease: "lo" });
  return missing ? `<g opacity="0.3">${svg}</g>` : svg;
}
// the people layer, sorted far to near so a walk never draws a person through another
function curbPeopleSvg(c, spec, pos, state) {
  const { k, P } = c;
  const order = pos.map((p, i) => i).sort((a, b) => k.depthOf([pos[a].x, pos[a].y, 0], P) - k.depthOf([pos[b].x, pos[b].y, 0], P));
  const lit = (i) => i === state.follow || (state.sel && state.sel.group != null && state.follow == null && spec.people[i].group === spec.groups[state.sel.group].key);
  return order.map((i) => `<g data-p="${i}">${curbPersonSvg(c, pos[i].x, pos[i].y, lit(i), pos[i].missing)}</g>`).join("");
}

function curbGeometry(k, spec, P, state = {}) {
  const LAY = curbLayout(spec);
  const c = makeCtx(k, P);
  const cond = spec.conds.find((x) => x.key === state.cond) || spec.conds[0];
  const ci = spec.conds.indexOf(cond);
  const H = CURB.half, items = [], SC = spec.scenery;
  // ground: the sidewalk, tiled, from the wall to the curb (or under all of a scenery street)
  // a scenery street's surface: tiles (pavement), lanes (a track or road: lines along the scale at each lane's edges) or plain
  if (SC) items.push(ground(c, { plan: { x: LAY.ground[0], y: -H, w: LAY.ground[1] - LAY.ground[0], d: 2 * H, r: 2 }, h: 9, tile: 14,
    pattern: SC.surface === "lanes" ? "lanes" : SC.surface === "plain" ? "none" : "tiles", lanes: [-H + 5, -LAY.gap + 2, LAY.gap - 2, H - 5] }));
  else {
    items.push(ground(c, { plan: { x: CURB.wall - 12, y: -H, w: CURB.curbAt - CURB.wall + 12, d: 2 * H, r: 2 }, h: 9, pattern: "tiles", tile: 14 }));
    items.push(...PROPS["curb-road"].build(c, { x: CURB.curbAt, y0: -H, y1: H, w: 60 }).items);
  }
  const ruler = PROPS["sidewalk-ruler"].build(c, { x0: LAY.xOf(spec.scale.min), step: LAY.step, min: spec.scale.min, max: spec.scale.max, y: 0, labels: spec.scale.labels, ...(spec.scale.labels ? { half: 6 } : {}) });
  items.push(...ruler.items);
  const building = SC ? null : PROPS["building-facade"].build(c, { x: CURB.wall, y0: -H, y1: H });
  if (building) items.push(...building.items);
  // lane names painted at the head of each lane, by the wall, like road markings
  items.push({ phase: "ground", part: "ruler", tip: "", svg: spec.groups.map((g, gi) => k.faceTextSvg(k.topMatrix([CURB.x0 + 2, (gi === 0 ? -1 : 1) * (H - 4)], 0, P), g.name, { size: 4.5, tone: "mid" })).join(""), bounds: [CURB.x0, -H, 0, CURB.x0 + 60, H, 0.2] });
  // medians: a cone per lane at the lane's median for this condition
  const cones = spec.groups.map((g, gi) => {
    const m = spec.groupStats[gi][cond.key].median;
    return m == null ? null : PROPS["traffic-cone"].build(c, { x: LAY.xOf(m), y: (gi === 0 ? -1 : 1) * (LAY.gap - 4.4), part: "median-" + g.key });
  });
  cones.forEach((cn) => cn && items.push(...cn.items));
  // people
  const pos = state.pos || LAY.positions(cond.key);
  items.push({ phase: "carrier", raw: true, svg: `<g data-people>${curbPeopleSvg(c, spec, pos, state)}</g>` });
  // the scenery street's own props; otherwise the pod waiting at the curb, and the condition's dressing
  const scenery = SC ? LAY.places.map((q) => { const b = PROPS[q.prop].build(c, { ...(q.opts || {}), x: q.x, y: q.y, part: q.part }); items.push(...b.items); return { key: q.part, ...b.part, ...(q.name ? { name: q.name } : {}) }; }) : [];
  const pod = SC ? null : PROPS["driverless-pod"].build(c, { x: CURB.curbAt + 24, y: 0 });
  if (pod) items.push(...pod.items);
  const dress = SC ? null : cond.dressing === "night" ? PROPS["street-lamps"].build(c, { x: CURB.curbAt - 2, ys: [-H + 10, H - 10] })
    : cond.dressing === "airport" ? PROPS["airport-canopy"].build(c, { x0: CURB.curbAt - 30, x1: CURB.curbAt - 4, y0: -H + 8, y1: H - 22 })
    : cond.dressing === "day" ? PROPS.planters.build(c, { x: CURB.curbAt - 6, ys: [-H + 8, H - 8] }) : null;
  if (dress) items.push(...dress.items.map((it) => ({ ...it, part: "dressing" })));

  const parts = [
    { key: "base", name: SC ? "Street" : "Sidewalk", move: [0, 0, 0], anchor: [SC ? LAY.ground[0] : CURB.wall, H - 6, 0] },
    ...(SC ? [] : [{ key: "road", name: "Curb and road", move: [0, 0, 0], anchor: [CURB.curbAt, H - 6, 0] }]),
    { key: "ruler", ...ruler.part },
    ...(building ? [{ key: "building", ...building.part }] : []),
    ...spec.groups.map((g, gi) => cones[gi] ? { key: "median-" + g.key, ...cones[gi].part, name: g.name + " median", station: gi } : null).filter(Boolean),
    ...scenery,
    ...(pod ? [{ key: "pod", ...pod.part }] : []),
    ...(dress ? [{ key: "dressing", ...dress.part }] : []),
  ].map((p) => ({ key: p.key, name: p.name, move: p.move, anchor: p.anchor, station: p.station ?? -1 }));
  return { body: composeWorld(items, k, P), parts, layout: LAY, positions: pos, cond: ci,
    peopleSvg: (positions, st) => curbPeopleSvg(c, spec, positions, st) };
}
