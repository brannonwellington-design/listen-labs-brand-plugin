// Aisle world: the same ordered-journey data as the conveyor, staged as a walk through a grocery store.
// Carts roll in through the entrance, along an aisle past each station's fitting, over the exit threshold and out
// to the pickup tote; a row of produce scales in front reads each station's count against n.
// The spec is unchanged: its station roles (the conveyor's prop names) map to shop props here.
// Plain source, concatenated after engine/compose.js and props/shop.js (and props/machine.js for the tote).

const AISLE_ROLE = { hopper: "store-entrance", "bin-rack": "gondola-shelf", "photo-eye": "self-checkout", labeler: "price-sign", "threshold-gate": "exit-gates" };

function aisleLayout(spec) {
  const SLOTS = [-161, -95, -25, 45, 110];
  const n = spec.stations.length;
  if (n < 3 || n > 5) throw new Error("aisle takes 3–5 stations, got " + n);
  if (spec.stations[0].prop !== "hopper") throw new Error("the first station must be the entrance: sessions start there");
  const STATION_X = SLOTS.slice(0, n);
  const X0 = -180, X1 = STATION_X[n - 1] + 42;
  const TOTE = { x: X1 + 40, y: -27, w: 50, d: 54, r: 2 };
  const PLATE = { x: -222, y: -60, w: TOTE.x + TOTE.w + 20 + 222, d: 150, r: 4 };
  const xOf = (role) => { const i = spec.stations.findIndex((s) => s.prop === role); return i < 0 ? null : STATION_X[i]; };
  const gx = xOf("threshold-gate");
  const BUMP = gx == null ? null : { x: gx - 4, w: 8, h: 2 };
  // carts ride the floor (no drop): FALL keeps them rolling level, REST fades them before the curb
  const SPAWN = -170, DROP = X1 + 3, FALL = 24, LAND_Z = 0, REST = 18;
  const BELT_LEN = DROP - SPAWN;
  return { n, STATION_X, X0, X1, LEGS: [], TOTE, PLATE, BUMP, xOf, SPAWN, DROP, FALL, LAND_Z, REST, BELT_LEN, PATH_LEN: BELT_LEN + FALL + REST,
    CENTER: [PLATE.x + PLATE.w / 2, 20, 24], RIDE: 0, GAUGE: { y: 64, top: SCALE.ZC + SCALE.R + 8 },
    fit: [[PLATE.x, PLATE.y, -6], [PLATE.x + PLATE.w, PLATE.y + PLATE.d, -6], [PLATE.x, PLATE.y + PLATE.d, -6], [PLATE.x + PLATE.w, PLATE.y, -6],
      [STATION_X[0], -32, 66], [STATION_X[0], 32, 66], ...(xOf("bin-rack") != null ? [[xOf("bin-rack") - 26, -48, 72], [xOf("bin-rack") + 26, -48, 72]] : [])] };
}

function aisleGeometry(k, spec, P, opts = {}) {
  const LAY = aisleLayout(spec);
  const { STATION_X, TOTE, PLATE, BUMP } = LAY;
  const N = spec.study.n, stations = spec.stations;
  const c = makeCtx(k, P);
  const PART = { hopper: "hopper", "bin-rack": "rack", "photo-eye": "eye", labeler: "labeler", "threshold-gate": "gate" };
  const floor = PROPS["store-floor"].build(c, { plan: PLATE });
  // a station can name its own fitting (s.fixture: a library or study prop with a footprint), standing on the far side
  // of the aisle at the station; otherwise its role's shop fitting
  const props = stations.map((s, i) => {
    if (s.fixture) {
      const f = PROPS[s.fixture];
      if (!f) throw new Error("aisle: unknown fixture prop " + s.fixture);
      if (!f.footprint) throw new Error("aisle: fixture " + s.fixture + " declares no footprint");
      if (f.footprint[0] > 56 || f.footprint[1] > 40) throw new Error(`aisle: fixture ${s.fixture} is ${f.footprint.join("×")}; a station takes 56×40 at most`);
      return { i, key: PART[s.prop], built: f.build(c, { ...(s.fixtureOpts || {}), x: STATION_X[i], y: -24, part: PART[s.prop] }) };
    }
    return { i, key: PART[s.prop], built: PROPS[AISLE_ROLE[s.prop]].build(c, { x: STATION_X[i] }) };
  });
  const strip = BUMP ? PROPS["threshold-strip"].build(c, { bump: BUMP }) : { items: [] };
  const tote = PROPS.tote.build(c, { plan: TOTE });
  const carts = Array.from({ length: 10 }, (_, i) => PROPS["shopping-cart"].build(c, { i }).svg).join("");
  const scales = stations.map((s, i) => PROPS["produce-scale"].build(c, { i, x: STATION_X[i], y: LAY.GAUGE.y, n: N, value: s.count }));
  const items = [
    ...floor.items,
    ...strip.items,
    ...props.flatMap((p) => p.built.items),
    ...tote.items,
    { phase: "carrier", raw: true, svg: `<g data-bags>${carts}</g><path data-cleats class="iso-line" d=""/>` },
    ...scales.flatMap((g) => g.items),
  ];
  const parts = [
    { key: "base", ...floor.part },
    ...props.map((p) => ({ key: p.key, ...p.built.part, station: p.i })),
    { key: "tote", ...tote.part, name: "Pickup tote" },
    ...scales.map((g, i) => ({ key: "gauge-" + i, name: stations[i].name + " scale", ...g.part, station: i })),
  ].map((p) => ({ key: p.key, name: p.name, move: p.move, anchor: p.anchor, station: p.station ?? -1 }));
  return { body: composeWorld(items, k, P, { sort: opts.sort }), parts, layout: LAY };
}

// the runtime's per-frame hooks
function aisleNeedle(k, P, x, v, N) { return scaleNeedle(k, P, x, 64, v, N); }
function aisleCleats() { return ""; }
