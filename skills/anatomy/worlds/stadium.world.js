// Stadium world: one figure per interview, seated in the stands by a segment (spec.blocks), standing or sitting by
// how they feel about the act on stage (spec.acts). The scoreboard lights one cell per fan on their feet. The stage
// carries the acts' dressing; for an act with spec.hopes, each hope is a prop on the deck.
//
// Data (spec): study.n · blocks [{ key, name, fans: [fan index…] }] in seating order (bend → far straight) ·
// fans [{ label, block, feel: { <act key>: "positive" | "neutral" | "negative" | null } }] ·
// acts [{ key, dressing: "backline" | "hopes" }] · hopes [{ key, prop: led-wall | dance-floor | guest-lift | flags | mic-stand | line-array }].
// State (rebuild): { act, poses (0 seated … 1 standing, per fan; omitted = from act), sel: { block | hope }, follow }.
// Plain source, concatenated after engine/compose.js, engine/primitives.js and props/stage.js.

const STADIUM = { straight: 150, radius: 62, rows: 7, depth: 9, rise: 5, d0: 6, aisle: 7 };
// What the stage hides: its deck footprint up to the top of the truss and line arrays, seen from the stadium's camera
// (azimuth 58° ± the orbit used by the default and block views, elevation 30°). A seat whose fan would stand inside that
// silhouette, behind it, is never used: every respondent stays visible (tools/qa.mjs checks this).
const STAGE_SHADOW = { x0: -31, x1: 31, y0: -39, y1: -5, z0: 0, z1: 56, az: [48, 53, 58, 63, 68], el: 30 };
function behindStage([x, y, z]) {
  const B = STAGE_SHADOW;
  return B.az.some((a) => {
    const A = (a * Math.PI) / 180, E = (B.el * Math.PI) / 180, cA = Math.cos(A), sA = Math.sin(A), cE = Math.cos(E), sE = Math.sin(E);
    const uv = ([X, Y, Z]) => [-X * sA + Y * cA, Z * cE - (X * cA + Y * sA) * sE];
    const depth = ([X, Y, Z]) => (X * cA + Y * sA) * cE + Z * sE;
    const pts = []; for (const X of [B.x0, B.x1]) for (const Y of [B.y0, B.y1]) for (const Z of [B.z0, B.z1]) pts.push([X, Y, Z]);
    if (depth([x, y, z]) >= Math.min(...pts.map(depth))) return false;   // in front of the stage: nothing hides it
    // convex hull of the box's silhouette, then point-in-polygon
    const P = pts.map(uv).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const half = (list) => { const h = []; for (const p of list) { while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop(); h.push(p); } h.pop(); return h; };
    const hull = [...half(P), ...half([...P].reverse())], q = uv([x, y, z]);
    return hull.every((p, i) => cross(p, hull[(i + 1) % hull.length], q) >= 0);
  });
}

function stadiumLayout(spec) {
  const T = racetrack(0, 0, STADIUM.straight, STADIUM.radius);
  const arc = Math.PI * T.radius;
  // seating runs from the start of the far bend (s = −arc) along the far straight (to s = straight); blocks share it
  // in proportion to their size, with a stair aisle between neighbours
  const S0 = -arc, S1 = T.straight, A = STADIUM.aisle;
  const sizes = spec.blocks.map((b) => Math.max(b.fans.length, 6));
  const total = sizes.reduce((a, b) => a + b, 0), room = S1 - S0 - A * (spec.blocks.length - 1);
  let s = S0;
  const blocks = spec.blocks.map((b, i) => { const len = (room * sizes[i]) / total, r = { key: b.key, s0: s, s1: s + len }; s += len + A; return r; });
  // seats: front rows first, spread along the block, skipping any seat the stage would hide
  const seats = new Array(spec.fans.length);
  spec.blocks.forEach((b, bi) => {
    const B = blocks[bi], len = B.s1 - B.s0;
    const cap = Math.max(1, Math.floor(len / 8.5));
    const seatAt = (r, sAt) => { const [x, y] = T.point(Math.min(sAt, B.s1 - 2), STADIUM.d0 + r * STADIUM.depth + STADIUM.depth * 0.45); return { x, y, z: (r + 1) * STADIUM.rise, row: r, block: bi, s: sAt }; };
    const open = (st) => !behindStage([st.x, st.y, st.z + 3]) && !behindStage([st.x, st.y, st.z + 6.5]);
    let k = 0;
    for (let r = 0; r < STADIUM.rows && k < b.fans.length; r++) {
      const left = b.fans.length - k;
      // a full row's slots, minus the hidden ones; a part row spreads its fans evenly over the open slots
      const slots = Array.from({ length: cap }, (_, j) => seatAt(r, B.s0 + ((j + 0.5 + (r % 2) * 0.25) * len) / cap)).filter(open);
      const take = Math.min(left, slots.length);
      for (let j = 0; j < take; j++, k++) seats[b.fans[k]] = left >= slots.length ? slots[j] : slots[Math.floor(((j + 0.5) * slots.length) / take)];
    }
    if (k < b.fans.length) throw new Error(`stadium: block ${b.key} has ${b.fans.length} fans but only ${k} seats the stage doesn't hide`);
  });
  const back = STADIUM.d0 + STADIUM.rows * STADIUM.depth;
  return { T, arc, blocks, seats, back, CENTER: [-30, -40, 18],
    fit: [[T.point(S0, back)[0], -T.radius - back, 0], [T.straight / 2 + 20, -T.radius - back, 50], [-T.straight / 2 - T.radius - back, 0, 0], [T.straight / 2 + T.radius + 10, T.radius + 20, 0], [-40, T.radius + 20, 0]] };
}

// one fan: torso and head; t = 0 seated, 1 standing. Tone: hi = positive, mid = neutral, lo = negative. A fan never asked
// about this act is drawn faded (tone null), so no answer never reads as a negative one.
function fanSvg(c, seat, t, tone, lit) {
  if (!tone) return `<g opacity="0.3">${fanSvg(c, seat, 0, "lo", lit)}</g>`;
  const { k, P, S } = c;
  const body = 2.8 + t * 3.4, r = 1.3;
  return S(k.cylinder(seat.x, seat.y, r, seat.z, body, P, 12, 0), { tone, lit, crease: "lo" }) +
    S(k.cylinder(seat.x, seat.y, r * 0.8, seat.z + body + 0.4, 2, P, 12, 0.3), { tone, lit, crease: "lo" });
}
const FEEL_TONE = { positive: "hi", neutral: "mid", negative: "lo" };

function stadiumGeometry(k, spec, P, state = {}) {
  const LAY = stadiumLayout(spec);
  const { T, arc, blocks, seats, back } = LAY;
  const c = makeCtx(k, P);
  const { S, L, D, slab, at } = c;
  const act = spec.acts.find((a) => a.key === state.act) || spec.acts[spec.acts.length - 1];
  const feelOf = (i) => spec.fans[i].feel[act.key];
  const poseOf = (i) => (state.poses ? state.poses[i] : feelOf(i) === "positive" ? 1 : 0);
  const sel = state.sel || {};
  const items = [];

  // ground: concourse slab, then the striped field inside the track, with its centre line
  const pad = 24, gx0 = -T.straight / 2 - T.radius - back - pad, gy0 = -T.radius - back - pad;
  const G = { x: gx0, y: gy0, w: T.straight / 2 + T.radius + 26 - gx0, d: T.radius + 30 - gy0, r: 10 };
  items.push(ground(c, { plan: G, h: 8 }));
  const field = { x: -T.straight / 2 - 22, y: -T.radius + 14, w: T.straight + 44, d: 2 * T.radius - 28, r: 3 };
  const f = ground(c, { plan: field, h: 0.6, pattern: "stripes", stripes: 10, part: "field" });
  f.svg = f.svg.replace(/^<path class="iso-halo"[^>]*>/, "");
  f.bounds = c.box(field, 0, 0.6);
  items.push(f);

  // stands: one stepped block per segment, stair aisles between them, a low wall round the near side
  const R = STADIUM;
  blocks.forEach((B, bi) => {
    const len = B.s1 - B.s0;
    const st = tiers(c, T, { s0: B.s0, s1: B.s1, sections: Math.max(2, Math.round(len / 22)), d0: R.d0, depth: R.depth, rise: R.rise, rows: R.rows, part: "block-" + B.key, tip: "block-" + B.key });
    items.push(...st.items);
    if (bi < blocks.length - 1) {
      // aisle: a narrow stair, two steps per tier
      const a0 = B.s1, a1 = blocks[bi + 1].s0;
      items.push(...tiers(c, T, { s0: a0, s1: a1, sections: 1, d0: R.d0, depth: R.depth / 2, rise: R.rise / 2, rows: R.rows * 2, part: "aisles", tip: "", tone: "lo", seat: false }).items);
    }
  });
  items.push(...tiers(c, T, { s0: T.straight, s1: 2 * T.straight + arc, sections: 10, d0: R.d0, depth: 5, rise: 3, rows: 1, part: "wall", tip: "", seat: false }).items);

  // fans: drawn in their block's part so they move with it
  const blockOf = (i) => blocks[seats[i].block].key;
  const fanLit = (i) => i === state.follow || (sel.block != null && spec.fans[i].block === spec.blocks[sel.block].key && state.follow == null);
  spec.fans.forEach((fan, i) => {
    const s = seats[i];
    const tone = FEEL_TONE[feelOf(i)] || null;
    items.push({ phase: "far", part: "block-" + blockOf(i), tip: "", svg: `<g data-fan="${i}">${fanSvg(c, s, poseOf(i), tone, fanLit(i))}</g>`, bounds: [s.x - 1.4, s.y - 1.4, s.z, s.x + 1.4, s.y + 1.4, s.z + 8.8] });
  });

  // scoreboard over the far stands' back row, one cell per fan
  const onFeet = spec.fans.filter((_, i) => feelOf(i) === "positive").length;
  const sb = PROPS.scoreboard.build(c, { x: 18, y: -T.radius - back - 2, z: R.rows * R.rise + 4, n: spec.fans.length, cols: 11, on: onFeet });
  items.push(...sb.items);

  // stage at centre field
  const DECK = { x: -28, y: -36, w: 56, d: 28, r: 1 }, RUN = { x: -5, y: -8, w: 10, d: 32, r: 0.8 };
  const deck = PROPS["stage-deck"].build(c, { deck: DECK, run: RUN });
  const Z = deck.top;
  items.push(...deck.items);
  const truss = PROPS.truss.build(c, { deck: DECK, z: Z, top: 52 });
  items.push(...truss.items);
  const dressing = [];
  if (act.dressing === "backline") dressing.push({ key: "backline", built: PROPS.backline.build(c, { deck: DECK, z: Z }) });
  else {
    // each hope names the stage prop that stands for it (spec.hopes[].prop); the world knows where each prop goes
    const make = {
      "led-wall": (lit, part) => PROPS["led-wall"].build(c, { deck: DECK, z: Z, h: 30, lit, part }),
      "dance-floor": (lit, part) => PROPS["dance-floor"].build(c, { x: DECK.x + 8, y: DECK.y + 10, z: Z, w: 22, d: 13, lit, part }),
      "guest-lift": (lit, part) => PROPS["guest-lift"].build(c, { x: DECK.x + DECK.w - 12, y: DECK.y + 17, z: Z, lit, part }),
      flags: (lit, part) => PROPS.flags.build(c, { at: [[DECK.x + 1.5, DECK.y + DECK.d - 1.5], [DECK.x + DECK.w - 13, DECK.y + DECK.d - 1.5]], z: Z, h: 30, lit, part }),
      "mic-stand": (lit, part) => PROPS["mic-stand"].build(c, { x: 0, y: RUN.y + RUN.d - 6, z: Z, lit, part }),
      "line-array": (lit, part) => PROPS["line-array"].build(c, { at: [[DECK.x + 6, DECK.y + DECK.d - 2], [DECK.x + DECK.w - 6, DECK.y + DECK.d - 2]], top: 52, lit, part }),
    };
    // any other prop (a study's own, props/… with a footprint) takes the next free spot on the field beside the stage,
    // at ground level; it carries data (lit when its hope is selected), and QA checks it hides no fan
    const FIELD_SLOTS = [[-48, -16], [46, -16], [-42, 6], [40, 6]], SLOT_MAX = [30, 24];
    let free = 0;
    spec.hopes.forEach((h, hi) => {
      const lit = sel.hope === hi, part = "hope-" + h.key;
      if (make[h.prop]) { dressing.push({ key: part, built: make[h.prop](lit, part) }); return; }
      const prop = PROPS[h.prop];
      if (!prop) throw new Error("stadium: unknown prop " + h.prop + " (library props/stage.js, or the study's props files)");
      if (!prop.footprint) throw new Error("stadium: prop " + h.prop + " declares no footprint, so it can't be placed");
      if (prop.footprint[0] > SLOT_MAX[0] || prop.footprint[1] > SLOT_MAX[1]) throw new Error(`stadium: prop ${h.prop} is ${prop.footprint.join("×")}; a field spot takes ${SLOT_MAX.join("×")} at most`);
      if (free >= FIELD_SLOTS.length) throw new Error("stadium: more than " + FIELD_SLOTS.length + " study props for the field");
      const [x, y] = FIELD_SLOTS[free++];
      dressing.push({ key: part, built: prop.build(c, { ...(h.propOpts || {}), x, y, lit, part }) });
    });
  }
  for (const d of dressing) items.push(...d.built.items);

  const parts = [
    { key: "base", name: "Concourse", move: [0, 0, 0], anchor: [G.x + 30, G.y + G.d - 20, 0] },
    { key: "field", name: "Field", move: [0, 0, 0], anchor: [0, field.y + field.d, 0.6] },
    ...blocks.map((B, bi) => {
      const mid = (B.s0 + B.s1) / 2, n = T.normal(mid), [ax, ay] = T.point(mid, R.d0 + 2 * R.depth);
      return { key: "block-" + B.key, name: spec.blocks[bi].name, move: [n[0] * 26, n[1] * 26, 8], anchor: [ax, ay, 3 * R.rise], station: bi };
    }),
    { key: "aisles", name: "Aisles", move: [0, 0, 0], anchor: [0, 0, 0] },
    { key: "wall", name: "Near wall", move: [0, 14, 0], anchor: [0, T.radius + 8, 3] },
    { key: "scoreboard", ...sb.part },
    { key: "stage", ...deck.part },
    { key: "truss", ...truss.part },
    ...dressing.map((d) => ({ key: d.key, ...d.built.part })),
  ].map((p) => ({ key: p.key, name: p.name, move: p.move, anchor: p.anchor, station: p.station ?? -1 }));

  return {
    body: composeWorld(items, k, P), parts, layout: LAY, onFeet,
    cellsSvg: sb.cellsSvg,
    fanSvg: (i, t, tone, lit) => fanSvg(c, seats[i], t, tone, lit),
  };
}
