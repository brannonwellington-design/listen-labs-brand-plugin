import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const k = await import(new URL("../kit/iso-kit.mjs", import.meta.url).href);
const { kitScript } = await import(new URL("../scripts/inline-kit.mjs", import.meta.url).href);
const [objName, specPath, outPath] = process.argv.slice(2);
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const obj = await import(`../objects/${objName}.mjs`);
const { svg, live } = obj.build(spec);
const skin = readFileSync(new URL("../skin/ll-skin.css", import.meta.url), "utf8");
const body = k.plateHtml({ fig: spec.figure.fig, title: spec.figure.title, hint: spec.figure.hint, readout: "", caption: spec.figure.caption,
  body: `<div class="iso-stage" data-conveyor tabindex="0" role="slider">${svg}</div>` });
let html = k.pageHtml({ title: "test", theme: process.argv.includes("--dark") ? "dark" : "light", body, script: kitScript() + live, width: 900 });
html = html.replace("</style>", skin + "</style>");
writeFileSync(outPath, html);
console.log("wrote", outPath);
