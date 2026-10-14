// Director: plays a resolved script (pages/shared.mjs resolveScripts) against any object with scene().
// The same beats drive the page's Play menu, the 16:9 stage the recorder films, the slides and the poster.
// Time comes from requestAnimationFrame, so the recorder's virtual clock makes every frame deterministic.
function makeDirector(o) {
  // o: { scripts: { key: { title, beats } }, apply(beat, i), onBeat(beat, i, script), onProgress(t, total), onEnd(key) }
  let cur = null, t = 0, at = -1, last = 0, token = 0;
  const total = (sc) => sc.beats.reduce((a, b) => a + b.hold, 0);
  function beatAt(sc, time) { let acc = 0; for (let k = 0; k < sc.beats.length; k++) { if (time < acc + sc.beats[k].hold) return [k, time - acc]; acc += sc.beats[k].hold; } return [sc.beats.length, 0]; }
  function tick(now, my) {
    if (!cur || my !== token) return;
    t += last ? Math.min((now - last) / 1000, 0.25) : 0;
    last = now;
    const [k] = beatAt(cur, t);
    if (k >= cur.beats.length) { const key = cur.key; cur = null; o.onEnd && o.onEnd(key); return; }
    if (k !== at) { at = k; o.apply(cur.beats[k], k); o.onBeat && o.onBeat(cur.beats[k], k, cur); }
    o.onProgress && o.onProgress(t, total(cur));
    requestAnimationFrame((n) => tick(n, my));
  }
  function play(key) {
    const sc = o.scripts[key];
    if (!sc) return 0;
    cur = sc; t = 0; at = -1; last = 0;
    const my = ++token;
    requestAnimationFrame((n) => tick(n, my));
    return total(sc);
  }
  function stop() { if (!cur) return; const key = cur.key; cur = null; token++; o.onEnd && o.onEnd(key, true); }
  return { play, stop, get playing() { return cur ? cur.key : null; }, get beat() { return at; }, get time() { return t; }, duration: (key) => total(o.scripts[key]) };
}
