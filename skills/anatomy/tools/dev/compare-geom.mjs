// Dev check: the world-engine conveyor must draw exactly what the hand-ordered legacy geometry drew.
// usage: node tools/dev/compare-geom.mjs <legacy conveyor.geom.js> <spec.json>
import { readFileSync } from "node:fs";
const k = await import(new URL("../../kit/iso-kit.mjs", import.meta.url).href);
const [legacyPath, specPath] = process.argv.slice(2);
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const NEW = ["engine/compose.js", "props/machine.js", "worlds/conveyor.world.js"].map((f) => readFileSync(new URL("../../" + f, import.meta.url), "utf8")).join("\n");
const legacy = new Function("k", "spec", "P", readFileSync(legacyPath, "utf8") + "\nreturn conveyorGeometry(k, spec, P);");
const fresh = new Function("k", "spec", "P", "opts", NEW + "\nreturn conveyorGeometry(k, spec, P, opts);");
const split = (s) => s.split(/(?=<g data-part=|<g data-bags|<g data-wire=)/);
for (const az of [60, 20, 100, 160, 250, 330]) {
  const P = k.fitProjection([[-230, -60, -15], [260, 90, 90]], 680, 460, { pad: 14, azimuth: az });
  const a = legacy(k, spec, P), d = fresh(k, spec, P, { sort: "declared" }), z = fresh(k, spec, P, { sort: "depth" });
  const partsSame = JSON.stringify(a.parts) === JSON.stringify(d.parts);
  const A = split(a.body), Z = split(z.body);
  const moved = A.map((s, i) => (Z[i] === s ? null : i)).filter((i) => i != null);
  console.log(`az ${String(az).padStart(3)}  declared ${a.body === d.body ? "identical" : "DIFFERS"}  parts ${partsSame ? "same" : "DIFFER"}  depth-sorted: ${moved.length ? moved.length + " groups reordered" : "identical"}  ${a.body.length} chars`);
  if (moved.length) console.log("   order:", Z.map((s) => (s.match(/data-(?:part|wire)="([^"]+)"|data-bags/) || ["?"])[0].replace(/data-|"/g, "")).join(" "));
}
