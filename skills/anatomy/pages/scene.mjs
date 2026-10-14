// Scene builder: turns any scene object (objects/*.mjs) and its spec into the three pieces every host needs:
// markup (the figure card with its controls, caption card and drawing), css and js. Page shells, the 16:9 stage and
// the embed for other skills (/research-artifacts, /report, the product canvas) all mount scenes through this, so a
// new object or world works everywhere as soon as it declares the scene contract:
//   API, HOOK          the global its runtime registers (window.STAD …) and the attribute on its stage element
//   controls(spec)     the in-figure controls it needs: [{ kind: select | segmented, label, call, get?, none?,
//                      embedOnly?, options: [{ value, label }] }]; `call` is an API method, `get` an API getter
//   scripts(spec)?     resolved tours (default: resolveScripts); prepare(spec)? tension (default: resolveTension)
//   CSS?, STAGE_CSS?   object styles that must travel with it
// Brand tokens are NOT included: every Listen Labs host already declares them (docs/tokens.css). A standalone page
// adds them itself.
import { readFileSync } from "node:fs";
import { join } from "node:path";
const ANATOMY = new URL("..", import.meta.url).pathname;
const k = await import(join(ANATOMY, "kit/iso-kit.mjs"));
const { kitScript, glScript } = await import(join(ANATOMY, "scripts/inline-kit.mjs"));
const S = await import("./shared.mjs");
const skin = readFileSync(new URL("../skin/ll-skin.css", import.meta.url), "utf8");

const SCENE_CSS = `
.ll-scene { container-type: inline-size; }
.ll-scene .iso-figure { margin: 0; }
.ll-scene .iso-legend { font-size: 12px; line-height: 16px; }
.fig-seg { display: inline-flex; gap: 2px; padding: 2px; border-radius: 8px; background: var(--surface-secondary); }
.fig-seg button { white-space: nowrap; appearance: none; font: inherit; font-size: 12px; line-height: 16px; min-height: 32px; padding: 0 10px; border: 0; border-radius: 6px; background: transparent; color: var(--content-secondary); cursor: pointer; }
.fig-seg button[aria-checked="true"] { background: var(--surface-highlight); color: var(--content-primary); }
`;

function controlsHtml(list, mode) {
  return list.filter((c) => mode === "embed" || !c.embedOnly).map((c, i) => c.kind === "segmented"
    ? `<span class="fig-seg" role="radiogroup" aria-label="${S.esc(c.label)}" data-ctl="${i}">${c.options.map((o) => `<button type="button" role="radio" aria-checked="false" data-v="${o.value}">${S.esc(o.label)}</button>`).join("")}</span>`
    : `<select class="fig-play fig-ctl" aria-label="${S.esc(c.label)}" data-ctl="${i}"><option value="">${S.esc(c.label)}</option>${c.options.map((o) => `<option value="${o.value}">${S.esc(o.label)}</option>`).join("")}</select>`).join("");
}
// wire every control to the object's API, and keep it in step with the drawing (a click in the figure can change
// what a control shows)
const controlsScript = (api, list) => `
(() => {
  const CTL = ${JSON.stringify(list)}, A = window.${api};
  const els = [...document.querySelectorAll("[data-ctl]")];
  const val = (c, raw) => (raw === "" ? c.none ?? null : isNaN(+raw) ? raw : +raw);
  els.forEach((el) => {
    const c = CTL[+el.dataset.ctl];
    if (el.tagName === "SELECT") el.addEventListener("change", () => A[c.call](val(c, el.value)));
    else el.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) A[c.call](val(c, b.dataset.v)); });
  });
  function sync() {
    els.forEach((el) => {
      const c = CTL[+el.dataset.ctl]; if (!c.get) return;
      const v = A[c.get];
      if (el.tagName === "SELECT") el.value = v == null || v === c.none ? "" : String(v);
      else el.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", String(String(v) === b.dataset.v)));
    });
  }
  ["click", "keyup", "played", "view", "stadium", "station", "replay", "lineup", "scene"].forEach((t) => document.addEventListener(t, () => requestAnimationFrame(sync)));
  sync();
})();
`;

export async function buildScene(objArg, spec, { mode = "embed" } = {}) {
  const objName = S.applyWorld(objArg, spec);
  const obj = await import(`../objects/${objName}.mjs`);
  if (!obj.API || !obj.HOOK || !obj.controls) throw new Error(`objects/${objName}.mjs does not declare the scene contract (API, HOOK, controls)`);
  if (obj.prepare) obj.prepare(spec, S.curly); else spec.__tension = S.resolveTension(spec, obj.TENSION_EVENTS || []);
  const scripts = obj.scripts ? obj.scripts(spec, S.curly) : S.resolveScripts(spec);
  const { svg, live } = obj.build(spec);
  const controls = obj.controls(spec).filter((c) => mode === "embed" || !c.embedOnly);
  const markup = `<section class="ll-scene" data-scene="${objName}" data-api="${obj.API}">${k.plateHtml({
    fig: spec.figure.fig + " · " + spec.figure.title, title: "", hint: spec.figure.hint, readout: "", caption: S.curly(spec.figure.caption),
    body: `${S.viewToolsHtml(scripts, controlsHtml(controls, mode))}${S.titleBlockHtml(spec.figure.titleBlock, S.esc)}${S.captionHtml()}<div class="iso-stage" ${obj.HOOK} tabindex="0" aria-label="${S.esc(spec.figure.title)}">${svg}</div>`,
  })}</section>`;
  const css = [k.ISO_CSS, skin, S.cameraCardCss(".ll-scene"), S.BLUEPRINT_CSS, S.TENSION_CSS, S.PLAY_CSS, SCENE_CSS, obj.CSS || "", obj.STAGE_CSS || ""].join("\n");
  const js = kitScript() + (/glLayer\(/.test(live) ? glScript() : "") + live + S.viewToolsScript(obj.API, { hash: mode !== "embed" }) + S.playScript(obj.API, scripts) + controlsScript(obj.API, controls);
  return { objName, obj, API: obj.API, HOOK: obj.HOOK, svg, live, scripts, controls, markup, css, js };
}

// A fragment a host page can paste in once: styles, the figure, and its script. Safe to inline in single-file HTML.
export const fragment = (s) => `<!-- Listen Labs scene: ${s.objName}. Needs the host's Listen Labs brand tokens (docs/tokens.css). API: window.${s.API} -->
<style>
${s.css}
</style>
${s.markup}
<script type="module">
${s.js.replace(/<\/(script)/gi, "<\\/$1")}
</script>`;
