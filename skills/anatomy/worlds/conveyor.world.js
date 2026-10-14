// Conveyor world: a packaging line on a base plate, assembled from machine props (props/machine.js).
// Data: spec.stations = 3–5 ordered stations { name, prop, count }; spec.study.n = the base every gauge reads.
// The machine's shape follows the study's shape: the station count sets the belt length, the legs, the plate and
// where the tote sits; each station's prop stands at its own station (the hopper is always first, where sessions
// begin). With five stations this is exactly the hand-tuned gold-standard layout.
// Plain source, concatenated after engine/compose.js and props/machine.js.

function conveyorLayout(spec) {
  const SLOTS = [-161, -95, -25, 45, 110];              // station pitch from the gold standard
  const n = spec.stations.length;
  if (n < 3 || n > 5) throw new Error("conveyor takes 3–5 stations, got " + n);
  if (spec.stations[0].prop !== "hopper") throw new Error("the first station must carry the hopper: sessions start there");
  const STATION_X = SLOTS.slice(0, n);
  const X0 = -180, X1 = STATION_X[n - 1] + 42;          // belt ends
  const LEGS = [-172, -62, 12, 80, 146].filter((x) => x < X1 - 12).concat(n === 5 ? [] : [X1 - 6]);
  const TOTE = { x: X1 + 8, y: -27, w: 50, d: 54, r: 2 };
  const PLATE = { x: -222, y: -50, w: TOTE.x + TOTE.w + 20 + 222, d: 140, r: 8 };
  const xOf = (prop) => { const i = spec.stations.findIndex((s) => s.prop === prop); return i < 0 ? null : STATION_X[i]; };
  const gx = xOf("threshold-gate");
  const BUMP = gx == null ? null : { x: gx - 4, w: 8, h: 3 };
  const SPAWN = -170, DROP = X1 + 3, FALL = 24, LAND_Z = 9, REST = 18;
  const BELT_LEN = DROP - SPAWN;
  return { n, STATION_X, X0, X1, LEGS, TOTE, PLATE, BUMP, xOf, SPAWN, DROP, FALL, LAND_Z, REST, BELT_LEN, PATH_LEN: BELT_LEN + FALL + REST,
    CENTER: [PLATE.x + PLATE.w / 2 - 0, 20, 20], RIDE: 34, GAUGE: { y: 64, top: DIAL.TOP } };
}

function conveyorGeometry(k, spec, P, opts = {}) {
  const LAY = conveyorLayout(spec);
  const { STATION_X, X0, X1, LEGS, TOTE, PLATE, BUMP } = LAY;
  const M = { RAIL_Z0: 22, BELT_Z0: 30, BELT_TOP: 34, RAIL_TOP: 37 };   // the line every station prop mounts on
  const GAUGE_Y = 64, BAGS = 10;
  const N = spec.study.n;
  const stations = spec.stations;
  const c = makeCtx(k, P);

  // which part key each station prop becomes (kept stable: scripts, tips and the page refer to these keys)
  const PROP_PART = { hopper: "hopper", "bin-rack": "rack", "photo-eye": "eye", labeler: "labeler", "threshold-gate": "gate" };
  const base = PROPS["base-plate"].build(c, { plate: PLATE });
  const drive = PROPS.drive.build(c, {});
  const frame = PROPS["conveyor-frame"].build(c, { X0, X1, LEGS, BUMP, m: M });
  const props = stations.map((s, i) => ({ s, i, key: PROP_PART[s.prop], built: PROPS[s.prop].build(c, { x: STATION_X[i], m: M }) }));
  const tote = PROPS.tote.build(c, { plan: TOTE });
  const bags = Array.from({ length: BAGS }, (_, i) => PROPS["product-bag"].build(c, { i }).svg).join("");
  const gauges = stations.map((s, i) => PROPS["dial-gauge"].build(c, { i, x: STATION_X[i], y: GAUGE_Y, n: N, value: s.count }));
  const wires = stations.map((_, i) => PROPS["signal-wire"].build(c, { i, x: STATION_X[i] + 6, fromY: GAUGE_Y - 13, toY: 23, z: M.RAIL_Z0 + 3 }));

  // the props this study doesn't use aren't built; the hopper always is
  const ordered = ["hopper", "rack", "eye", "labeler", "gate"].map((key) => props.find((p) => p.key === key)).filter(Boolean);
  const items = [
    ...base.items,
    ...drive.items,
    frame.items[0],
    ...ordered.flatMap((p) => p.built.items.filter((it) => it.phase === "far")),
    frame.items[1],
    ...tote.items.filter((it) => it.phase === "far"),
    { phase: "carrier", raw: true, svg: `<g data-bags>${bags}</g>` },
    frame.items[2],
    ...ordered.flatMap((p) => p.built.items.filter((it) => it.phase === "near")),
    ...tote.items.filter((it) => it.phase === "near"),
    ...wires.flatMap((w) => w.items),
    ...gauges.flatMap((g) => g.items),
  ];

  // ---------- parts registry ----------
  // One entry per assembly the machine comes apart into. `move` is the real disassembly direction
  // (props lift off the line, gauges slide toward the reader, the tote rolls clear, the drive backs off);
  // `anchor` is a point on the part's surface where a callout lands; `station` ties a part to spec.stations.
  const parts = [
    { key: "base", ...base.part },
    { key: "frame", ...frame.part },
    { key: "drive", ...drive.part },
    ...ordered.map((p) => ({ key: p.key, ...p.built.part, station: p.i })),
    { key: "tote", ...tote.part },
    ...gauges.map((g, i) => ({ key: "gauge-" + i, name: stations[i].name + " gauge", ...g.part, station: i })),
  ].map((p) => ({ key: p.key, name: p.name, move: p.move, anchor: p.anchor, station: p.station ?? -1 }));

  return { body: composeWorld(items, k, P, { sort: opts.sort }), needleAt: gauges[0].needleAt, cleatsAt: frame.cleatsAt, parts, layout: LAY };
}

// the runtime's per-frame hooks
function conveyorNeedle(k, P, x, v, N) { return dialNeedle(k, P, x, 64, v, N); }
function conveyorCleats(k, P, X0, X1, BUMP, RIDE, offset) { return beltCleats(k, P, X0, X1, BUMP, RIDE, offset); }
