// Tension chip: names the counterintuitive finding while its event plays, with the stated numbers beside it.
// Browser code, inlined by object modules. The numbers are resolved from the spec at build time.
function makeTensionChip(plate, T, pos = "top") {
  const el = document.createElement("div");
  el.className = "tension"; el.setAttribute("role", "status"); el.dataset.pos = pos;
  el.innerHTML = '<p class="tension__kicker">The tension</p><p class="tension__label"></p>' + T.numbers.map(() => '<p class="tension__num"></p>').join("");
  el.querySelector(".tension__label").textContent = T.label;
  el.querySelectorAll(".tension__num").forEach((p, i) => { p.textContent = T.numbers[i].text; });
  plate.appendChild(el);
  // timed on the object's own animation clock (not setTimeout), so a recorded video holds it for the same beats
  let left = 0;
  return {
    show(sec) { left = sec; el.classList.add("is-on"); },
    step(dt) { if (left <= 0) return; left -= dt; if (left <= 0) el.classList.remove("is-on"); },
    hide() { left = 0; el.classList.remove("is-on"); },
    get on() { return left > 0; },
  };
}
