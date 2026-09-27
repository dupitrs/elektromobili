/* Photographic layers, compositor-first. The living cloud is the one photo
   stacked as softly masked copies breathing on CSS clocks; lightning is a
   seeded channel drawn on a canvas between those layers, rendered as a pure
   function of time so any instant of a flash can be reproduced or held.
   All route coordinates are CSS pixels relative to the visit section. */
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const smooth = t => t * t * (3 - 2 * t);
const CORE = "247,249,255", INNER = "203,215,255", OUTER = "143,163,255";

function naturalOffset(element) {
  let x = 0, y = 0;
  for (let node = element; node; node = node.offsetParent) {
    x += node.offsetLeft; y += node.offsetTop;
  }
  return { x, y };
}

// Tiny seeded PRNG so one exact flash can be replayed from a seed.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Midpoint displacement; jitter shrinks with each split so the channel is
// crooked at large scale and only slightly rough up close.
function jag(a, b, spread, rand, depth, out) {
  if (!depth) { out.push(b); return; }
  const m = { x: (a.x + b.x) / 2 + (rand() - .5) * spread, y: (a.y + b.y) / 2 + (rand() - .5) * spread * .5 };
  jag(a, m, spread * .52, rand, depth - 1, out);
  jag(m, b, spread * .52, rand, depth - 1, out);
}
function channel(a, b, rand, depth, wobble = .34) {
  const points = [a];
  jag(a, b, Math.hypot(b.x - a.x, b.y - a.y) * wobble, rand, depth, points);
  return points;
}

// Return stroke: instant attack, fast decay, plus a slow ~300 ms afterglow.
function envelope(pulses, t) {
  let v = 0;
  for (const p of pulses) {
    const d = t - p.t;
    if (d >= 0) v += p.a * (Math.exp(-d / p.tau) + .2 * Math.exp(-d / 300));
  }
  return v;
}

// Everything the flash needs, decided once from the seed. `box` is the scene
// in its own pixels: base line, and the text-safe limits below it.
function makeEvent(kind, seed, box) {
  const rand = mulberry32(seed);
  const { W, H, baseY, safeX, safeY } = box;
  const origin = { x: W * (.4 + rand() * .3), y: H * (.34 + rand() * .16) };
  const event = { kind, origin, second: origin, pulses: [], main: [], branches: [], flare: null, leader: 0 };
  let t = 0;
  if (kind === "sheet") {
    const count = 2 + Math.floor(rand() * 3);
    for (let i = 0; i < count; i++) {
      event.pulses.push({ t, a: i ? .35 + rand() * .45 : .75 + rand() * .25, tau: 70 + rand() * 60 });
      t += 60 + rand() * 190;
    }
    event.second = { x: clamp(origin.x + (rand() - .5) * W * .3, W * .15, W * .85), y: Math.min(origin.y + H * .34, baseY - 6) };
  } else {
    const deep = W - safeX >= 90, short = safeY - baseY >= 24;
    let end, exit;
    if (rand() < .72 && (deep || short)) {
      if (deep) {
        // Desktop: leave the base over the lane strip and reach the ground there.
        exit = { x: safeX + 14 + rand() * (W - safeX) * .55, y: baseY - 4 };
        end = { x: Math.max(safeX + 8, exit.x + (rand() - .5) * 46), y: baseY + 40 + rand() * 70 };
        event.flare = end;
      } else {
        exit = { x: W * (.4 + rand() * .45), y: baseY - 4 };
        end = { x: exit.x + (rand() - .5) * 30, y: baseY + 12 + rand() * (safeY - baseY - 18) };
      }
      origin.x = clamp(exit.x - W * (.05 + rand() * .22), W * .36, W * .72);
      event.main = channel(origin, exit, rand, 4, .3).concat(channel(exit, end, rand, 6, .4).slice(1));
    } else {
      // Cloud-to-cloud: crawls sideways and never leaves the vapor.
      const side = rand() < .5 ? -1 : 1;
      exit = { x: clamp(origin.x + side * W * (.22 + rand() * .2), W * .08, W * .92), y: Math.min(origin.y + H * (rand() * .15 - .03), baseY - 12) };
      event.main = channel(origin, exit, rand, 5, .4);
    }
    // Keep the part below the base out of the text: fold stray x back past safeX.
    for (const p of event.main) if (p.y > safeY && p.x < safeX) p.x = safeX + (safeX - p.x) * .3;
    event.second = exit;
    const count = 2 + Math.floor(rand() * 3), n = event.main.length;
    for (let i = 0; i < count; i++) {
      const at = Math.floor(n * (.35 + rand() * .5)), p = event.main[at], q = event.main[Math.min(n - 1, at + 2)];
      const angle = Math.atan2(q.y - p.y, q.x - p.x) + (rand() < .5 ? -1 : 1) * (.4 + rand() * .5);
      const length = Math.hypot(end ? end.x - p.x : W * .2, end ? end.y - p.y : H * .1) * (.25 + rand() * .3);
      let tip = { x: p.x + Math.cos(angle) * length, y: p.y + Math.abs(Math.sin(angle)) * length };
      if (tip.y > safeY && tip.x < safeX) tip = { x: safeX + 6, y: Math.min(tip.y, safeY) };
      const branch = channel(p, tip, rand, 4, .4);
      for (const q of branch) if (q.y > safeY && q.x < safeX) q.x = safeX + (safeX - q.x) * .3;
      event.branches.push(branch);
    }
    event.leader = 16 + rand() * 14;
    event.pulses.push({ t: event.leader, a: 1, tau: 55 + rand() * 30 });
    t = event.leader;
    const strikes = 1 + Math.floor(rand() * 3);
    for (let i = 0; i < strikes; i++) {
      t += 70 + rand() * 160;
      event.pulses.push({ t, a: .45 + rand() * .35, tau: 40 + rand() * 40 });
    }
  }
  event.end = t + 620;
  return event;
}

export function createVisitWeather(section) {
  const note = section?.querySelector(".visit-note");
  const scene = note?.querySelector(".rain-scene");
  if (!section || !note || !scene) return null;
  section.classList.add("visit-weather");
  note.classList.remove("reveal");
  note.classList.add("in");
  const fallback = scene.querySelector(".rain-cloud");
  scene.querySelectorAll(".rain-drops, .rain-bang").forEach(node => node.remove());
  const src = new URL("../img/weather/rain-cloud.webp", import.meta.url).href;
  scene.style.setProperty("--wx-img", `url("${src}")`);
  const layer = name => {
    const node = document.createElement("div"); node.className = "wx-layer " + name; return node;
  };
  const cloud = new Image(512, 341);
  cloud.className = "weather-cloud"; cloud.alt = ""; cloud.decoding = "async";
  let loaded = false, settle;
  const settled = new Promise(resolve => { settle = resolve; });
  cloud.addEventListener("load", () => {
    loaded = true; settle();
    scene.classList.add("has-weather-cloud");
    if (fallback) fallback.setAttribute("hidden", "");
  }, { once: true });
  cloud.addEventListener("error", () => {
    settle();
    scene.classList.add("weather-cloud-unavailable");
    cloud.remove();
  }, { once: true });
  cloud.src = src;
  const bolt = document.createElement("canvas"); bolt.className = "wx-bolt";
  const litA = layer("wx-lit wx-lit-a"), litB = layer("wx-lit wx-lit-b");
  // Bottom to top: haze, photo, shade, channel, lobes, wisps, lit copies, rain.
  scene.append(layer("wx-haze"), cloud, layer("wx-shade"), bolt,
    layer("wx-lobe-l"), layer("wx-lobe-c"), layer("wx-lobe-r"), layer("wx-wisps"), litA, litB);
  const rain = document.createElement("span"); rain.className = "weather-rain";
  const shaft = document.createElement("b"); shaft.className = "wx-shaft"; rain.append(shaft);
  for (let i = 0; i < 24; i++) {
    const drop = document.createElement("i");
    drop.style.setProperty("--drop-x", ((i * 37) % 97) + "%");
    drop.style.setProperty("--drop-delay", (-i * .137).toFixed(3) + "s");
    drop.style.setProperty("--drop-time", (.56 + i % 5 * .075).toFixed(3) + "s");
    drop.style.setProperty("--drop-opacity", (.2 + i % 4 * .12).toFixed(2));
    // Longer streaks fall under the darkest middle of the base.
    drop.style.setProperty("--drop-h", (14 + 8 * Math.sin(((i * 37) % 97) / 97 * Math.PI)).toFixed(1) + "px");
    rain.append(drop);
  }
  scene.append(rain);
  const ambient = document.createElement("div"); ambient.className = "wx-ambient";
  note.append(ambient);
  const marks = document.createElement("div"); marks.className = "weather-wheelmarks";
  marks.setAttribute("aria-hidden", "true");
  let canvas = document.createElement("canvas"); marks.append(canvas); section.append(marks);
  let geometry, route = [], scale = 8, routeKey = "", markTop = 0, markHeight = 0, lastReveal = -1;
  let rearY = -Infinity, visible = false, box, ratio = 1, sceneLeft = 0;
  let event = null, t0 = 0, held = -1, frame = 0, timer = 0, quiet = false, fresh = true, started = null, finish = null;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const active = () => visible && !document.hidden && !motion.matches;
  let measured; const firstMeasure = new Promise(resolve => { measured = resolve; });

  function playRain() {
    scene.classList.toggle("is-weather-active", active());
    note.classList.toggle("is-weather-active", active());
    if (active()) schedule();
    else { clearTimeout(timer); timer = 0; fresh = true; if (held < 0) stop(); }
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting; playRain();
    }, { rootMargin: "80px" }).observe(note);
  } else visible = true;
  document.addEventListener("visibilitychange", playRain);
  motion.addEventListener("change", playRain);
  playRain();

  function measure({ unit, edgeX }) {
    scale = unit;
    const origin = naturalOffset(section), bounds = naturalOffset(note);
    const noteX = bounds.x - origin.x, noteY = bounds.y - origin.y;
    const laneX = Math.min(edgeX - clamp(unit * 2.7, 34, 44), noteX + note.offsetWidth - 18);
    const cloudWidth = Math.min(section.clientWidth - 24, clamp(unit * 20, 250, 330));
    const cloudLeft = clamp(laneX - cloudWidth * .77, 12, section.clientWidth - cloudWidth - 8);
    const cloudHeight = cloudWidth * 341 / 512;
    // The upper third is deliberately empty so the vehicle can change lanes
    // above the paragraph and pass behind the cloud itself.
    sceneLeft = cloudLeft - noteX;
    scene.style.width = cloudWidth + "px";
    scene.style.height = cloudHeight + "px";
    scene.style.left = sceneLeft + "px";
    scene.style.top = "-25px";
    rain.style.left = clamp(laneX - cloudLeft - 27, 0, cloudWidth - 54) + "px";
    rain.style.top = cloudWidth * .43 + "px";
    const style = getComputedStyle(note);
    // Text-safe limits in scene pixels: bolts below the base stay right of the
    // paragraph (safeX) unless they end above the heading (safeY).
    box = {
      W: cloudWidth, H: cloudHeight, baseY: cloudWidth * .53,
      safeX: note.offsetWidth - (parseFloat(style.paddingRight) || 70) + 12 - sceneLeft,
      safeY: (parseFloat(style.paddingTop) || 156) + 25 - 16
    };
    ratio = Math.min(devicePixelRatio || 1, 2);
    const boltWidth = cloudWidth + 60, boltHeight = cloudHeight + 130;
    bolt.width = Math.round(boltWidth * ratio); bolt.height = Math.round(boltHeight * ratio);
    bolt.style.width = boltWidth + "px"; bolt.style.height = boltHeight + "px";
    Object.assign(ambient.style, { left: "-60px", top: "-200px", width: note.offsetWidth + 380 + "px", height: "560px" });
    const projectedUnit = 43 / Math.hypot(43, 36) * unit;
    const turnSpan = Math.max(18 * projectedUnit, 8 * projectedUnit + 1.875 * Math.abs(edgeX - laneX) / 2.4);
    geometry = {
      laneX,
      turnStartY: Math.max(0, noteY + 28 - turnSpan),
      turnEndY: noteY + 28,
      cloudY: noteY + cloudWidth * .34 - 25,
      cloudBottomY: noteY + cloudWidth * .53 - 25
    };
    if (event && held >= 0) render(held);
    measured();
    return geometry;
  }

  // --- lightning -----------------------------------------------------------
  function light(node, point) {
    node.style.setProperty("--fx", (point.x / box.W * 100).toFixed(1) + "%");
    node.style.setProperty("--fy", (point.y / box.H * 100).toFixed(1) + "%");
  }
  // Multi-pass glow: wide soft outer, mid, thin bright inner, near-white core.
  // Runs still inside the vapor (above veilY) are drawn dimmer and wider, so
  // the channel reads as a lit vein through the cloud rather than a line on it.
  function strokeGlow(context, points, strength, size, veilY) {
    const runs = [];
    for (let i = 1; i < points.length; i++) {
      const veiled = points[i].y < veilY && points[i - 1].y < veilY;
      const run = runs[runs.length - 1];
      if (run && run.veiled === veiled) run.points.push(points[i]);
      else runs.push({ veiled, points: [points[i - 1], points[i]] });
    }
    for (const { veiled, points: run } of runs) {
      const trace = () => {
        context.beginPath();
        run.forEach((p, i) => context[i ? "lineTo" : "moveTo"](p.x, p.y));
      };
      const passes = [[18, OUTER, .09], [8, INNER, .16], [2.8, INNER, .5]];
      if (veiled) passes.unshift([26, OUTER, .05]);
      for (const [width, colour, alpha] of passes) {
        trace(); context.lineWidth = width * size;
        context.strokeStyle = `rgba(${colour},${clamp(alpha * strength * (veiled ? .6 : 1), 0, 1)})`; context.stroke();
      }
      for (let i = 1; i < run.length; i++) {
        const p = run[i], index = points.indexOf(p), at = index / points.length;
        const bead = .7 + .3 * Math.sin(index * 2.3 + p.x * .5);
        context.beginPath(); context.moveTo(run[i - 1].x, run[i - 1].y); context.lineTo(p.x, p.y);
        context.lineWidth = size * (1.9 - 1.1 * at);
        context.strokeStyle = `rgba(${CORE},${clamp(strength * bead * (veiled ? .3 : 1), 0, 1)})`; context.stroke();
      }
    }
  }
  function render(t) {
    const flicker = 1 + .05 * Math.sin(t * .61) * Math.cos(t * .17);
    const intensity = envelope(event.pulses, t) * flicker;
    const context = bolt.getContext("2d");
    if (context) {
      context.setTransform(ratio, 0, 0, ratio, 30 * ratio, 0);
      context.clearRect(-30, 0, box.W + 60, box.H + 130);
      context.lineCap = "round"; context.lineJoin = "round";
      context.globalCompositeOperation = "lighter";
      // Interior glow at the origin: warm core to cool edge, veiled by the front lobes.
      const glow = context.createRadialGradient(event.origin.x, event.origin.y, 0, event.origin.x, event.origin.y, box.W * .24);
      glow.addColorStop(0, `rgba(255,244,226,${clamp(.55 * intensity, 0, 1)})`);
      glow.addColorStop(.45, `rgba(180,196,255,${clamp(.15 * intensity, 0, 1)})`);
      glow.addColorStop(1, "rgba(143,163,255,0)");
      context.fillStyle = glow; context.fillRect(-30, 0, box.W + 60, box.H + 130);
      if (event.kind === "bolt") {
        const leading = t < event.leader, grown = smooth(clamp(t / event.leader, 0, 1));
        const shown = leading ? event.main.slice(0, Math.max(2, Math.ceil(event.main.length * grown))) : event.main;
        strokeGlow(context, shown, leading ? .15 + .12 * grown : intensity, 1, box.baseY - 6);
        if (!leading) {
          // Branches belong to the first return stroke; re-strikes reuse the main channel.
          const first = envelope([event.pulses[0]], t) * flicker;
          const branchy = first + .2 * Math.max(0, intensity - first);
          for (const branch of event.branches) strokeGlow(context, branch, branchy * .7, .55, box.baseY - 6);
          // Rain scatters the light where the channel leaves the base.
          const exit = event.second, r = box.W * .14;
          context.save(); context.translate(exit.x, exit.y); context.scale(1.6, 1);
          const air = context.createRadialGradient(0, 0, 0, 0, 0, r);
          air.addColorStop(0, `rgba(${INNER},${clamp(.14 * intensity, 0, 1)})`);
          air.addColorStop(.5, `rgba(${OUTER},${clamp(.05 * intensity, 0, 1)})`);
          air.addColorStop(1, `rgba(${OUTER},0)`);
          context.fillStyle = air; context.fillRect(-r, -r, r * 2, r * 2); context.restore();
          if (event.flare) {
            // Ground flare: a flat warm pool of light where the channel meets the ground.
            const r = 18 + 12 * intensity;
            context.save(); context.translate(event.flare.x, event.flare.y); context.scale(1.7, 1);
            const flare = context.createRadialGradient(0, 0, 0, 0, 0, r);
            flare.addColorStop(0, `rgba(255,246,232,${clamp(.32 * intensity, 0, 1)})`);
            flare.addColorStop(.4, `rgba(${INNER},${clamp(.1 * intensity, 0, 1)})`);
            flare.addColorStop(1, `rgba(${OUTER},0)`);
            context.fillStyle = flare; context.fillRect(-r, -r, r * 2, r * 2); context.restore();
          }
        }
      }
    }
    litA.style.opacity = clamp(intensity, 0, 1).toFixed(3);
    litB.style.opacity = clamp(intensity * .8, 0, 1).toFixed(3);
    ambient.style.opacity = clamp(intensity, 0, 1).toFixed(3);
    scene.style.setProperty("--wx-flash", clamp(intensity, 0, 1).toFixed(3));
  }
  function tick() {
    frame = 0;
    if (!event || held >= 0) return;
    const t = performance.now() - t0;
    render(t);
    const begun = started; started = null; if (begun) begun();
    if (t < event.end) frame = requestAnimationFrame(tick); else stop();
  }
  function stop() {
    cancelAnimationFrame(frame); frame = 0;
    if (!event) return;
    event = null; held = -1;
    const context = bolt.getContext("2d");
    if (context) { context.setTransform(1, 0, 0, 1, 0, 0); context.clearRect(0, 0, bolt.width, bolt.height); }
    litA.style.opacity = litB.style.opacity = ambient.style.opacity = "0";
    scene.style.removeProperty("--wx-flash");
    const begun = started, done = finish; started = finish = null;
    if (begun) begun(); if (done) done();
  }
  function strike({ kind = "sheet", seed = 1, at } = {}) {
    stop();
    if (!box || !loaded || motion.matches) return Promise.resolve();
    event = makeEvent(kind === "bolt" ? "bolt" : "sheet", seed | 0, box);
    light(litA, event.origin); light(litB, event.second);
    const focus = event.kind === "bolt" ? event.second : event.origin;
    ambient.style.setProperty("--ax", sceneLeft + focus.x + 60 + "px");
    ambient.style.setProperty("--ay", focus.y - 25 + 200 + "px");
    if (at !== undefined && at !== null && !Number.isNaN(+at)) {
      held = +at; render(held);
      return Promise.resolve();
    }
    return new Promise(resolve => { started = resolve; t0 = performance.now(); tick(); });
  }
  function resume() {
    if (!event || held < 0) return;
    t0 = performance.now() - held; held = -1; tick();
  }
  function schedule() {
    if (timer || quiet || !active()) return;
    // First flash soon after the cloud comes into view, then long uneven gaps.
    timer = setTimeout(() => {
      timer = 0;
      if (quiet || !active() || event) { schedule(); return; }
      fresh = false;
      strike({ kind: Math.random() < .65 ? "sheet" : "bolt", seed: Math.random() * 2 ** 31 | 0 });
      finish = schedule;
    }, fresh ? 500 + Math.random() * 1000 : 5000 + Math.random() * 9000);
  }
  function idle() { quiet = true; clearTimeout(timer); timer = 0; }
  const ready = Promise.all([firstMeasure, settled]).then(() => undefined);
  window.__visitWeather = { ready, strike, resume, idle };
  const params = new URLSearchParams(location.search), storm = params.get("storm");
  if (storm) ready.then(() => {
    idle();
    if (storm === "bolt" || storm === "sheet") {
      strike({ kind: storm, seed: +params.get("seed") || 1, at: params.has("at") ? +params.get("at") : undefined });
    }
  });

  // --- wheel marks ---------------------------------------------------------
  function recover() {
    canvas.addEventListener("contextlost", event => {
      event.preventDefault();
      const replacement = document.createElement("canvas");
      canvas.replaceWith(replacement); canvas = replacement; recover(); paint();
    });
    canvas.addEventListener("contextrestored", paint);
  }
  recover();

  function paint() {
    if (!geometry || route.length < 2) return;
    markTop = geometry.cloudBottomY;
    markHeight = Math.max(1, section.offsetHeight - markTop);
    const minX = Math.floor(Math.min(...route.map(p => p.x)) - scale * 1.4);
    const maxX = Math.ceil(Math.max(...route.map(p => p.x)) + scale * 1.4);
    const width = maxX - minX, ratio = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.round(width * ratio), h = Math.round(markHeight * ratio);
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    canvas.style.width = width + "px"; canvas.style.height = markHeight + "px";
    Object.assign(marks.style, { left: minX + "px", top: markTop + "px", width: width + "px", height: markHeight + "px" });
    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, markHeight);
    const samples = [];
    for (let i = 1; i < route.length; i++) {
      const a = route[i - 1], b = route[i], dx = b.x - a.x, dy = b.y - a.y;
      const distance = Math.hypot(dx, dy);
      if (!distance || b.y < markTop) continue;
      const count = Math.max(1, Math.ceil(distance / Math.max(2, scale * .18)));
      for (let j = 0; j <= count; j++) {
        const t = j / count, y = a.y + dy * t;
        if (y < markTop) continue;
        samples.push({ x: a.x + dx * t - minX, y: y - markTop, nx: -dy / distance, ny: dx / distance });
      }
    }
    context.lineCap = "round"; context.lineJoin = "round";
    for (const side of [-1, 1]) {
      const track = () => {
        context.beginPath();
        samples.forEach((p, i) => {
          const offset = side * scale * .69;
          context[i ? "lineTo" : "moveTo"](p.x + p.nx * offset, p.y + p.ny * offset);
        });
      };
      track(); context.strokeStyle = "rgba(104, 77, 46, .15)";
      context.lineWidth = Math.max(3, scale * .4); context.stroke();
      track(); context.strokeStyle = "rgba(94, 66, 36, .31)";
      context.lineWidth = Math.max(1.8, scale * .22);
      context.setLineDash([Math.max(1.4, scale * .14), Math.max(1.1, scale * .1)]);
      context.stroke(); context.setLineDash([]);
      // Sparse, deterministic flecks keep the mud organic without a particle loop.
      for (let i = 0; i < samples.length; i += 3) {
        const p = samples[i], noise = Math.sin(i * 31.7 + side * 9.1);
        const offset = side * scale * (.69 + noise * .18);
        context.fillStyle = "rgba(112, 78, 39, .16)";
        context.beginPath();
        context.ellipse(p.x + p.nx * offset, p.y + p.ny * offset, .55 + Math.abs(noise) * .8, .7, 0, 0, Math.PI * 2);
        context.fill();
      }
    }
    lastReveal = -1; update({ rearY });
  }

  function setRoute(points, unit) {
    scale = unit;
    const key = [unit, section.offsetHeight, geometry?.cloudBottomY,
      ...points.flatMap(p => [p.x.toFixed(2), p.y.toFixed(2)])].join();
    if (key === routeKey) return;
    routeKey = key; route = points; paint();
  }

  function update(position) {
    rearY = position.rearY;
    const reveal = Math.round(clamp(rearY - markTop, 0, markHeight) * 10) / 10;
    if (reveal === lastReveal) return;
    lastReveal = reveal;
    marks.style.clipPath = `inset(0 0 ${Math.max(0, markHeight - reveal)}px 0)`;
  }
  return { measure, setRoute, update };
}
