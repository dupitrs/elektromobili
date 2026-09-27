import { scroll } from "./smooth-scroll.js?v=20260927-mobile-1";
import { gardenPainter } from "./journey-start.js?v=20260927-mobile-1";
import { loadGardenSprites, loadYearsBackground } from "./garden-assets.js?v=20260927-mobile-1";
import { makeGardenBand } from "./journey-formal-garden.js?v=20260927-mobile-1";
import { createVisitWeather } from "./visit-weather.js?v=20260927-mobile-1";
import { layoutYears, yearsView, yearsBackgroundPlacement, yearsGardenJoin } from "./years-layout.js?v=20260927-mobile-1";
import { viewportHeight, onViewportChange } from "./viewport.js?v=20260927-mobile-1";

const motion = matchMedia("(prefers-reduced-motion: reduce)");
const K = 43 / Math.hypot(43, 36), ELEVATION = 36 / Math.hypot(43, 36);
const TAU = Math.PI * 2, HITCH = 4.02;
const mix = (a, b, t) => a + (b - a) * t;
const clamp = n => Math.max(0, Math.min(1, n));
const smooth = t => t * t * t * (10 + t * (-15 + 6 * t));
const main = document.querySelector("main");
const sections = [...main.querySelectorAll(":scope > section[id]")];

if (sections.length) setupJourney();

function setupJourney() {
  const root = document.createElement("div"); root.className = "garden-journey journey-on";
  const guide = document.createElement("div"); guide.className = "journey-guide";
  guide.setAttribute("aria-hidden", "true");
  let canvas = document.createElement("canvas"); guide.append(canvas);
  let context = canvas.getContext("2d");
  const chapters = document.createElement("div"); chapters.className = "journey-chapters";
  sections[0].before(root); root.append(guide, chapters);
  const bands = [];
  function addBand(parent, index) {
    const element = (index === 0 && document.getElementById("journeyOpening")) || document.createElement("div");
    element.classList.add("journey-band");
    element.setAttribute("aria-hidden", "true");
    if (!index || index === sections.length) element.classList.add("journey-band-end");
    const surface = document.createElement("canvas"); element.append(surface); parent.append(element);
    const band = { element, canvas: surface, index, top: 0, key: "", requested: "", revision: 0 };
    bands.push(band); return band;
  }
  const stops = sections.map((section, index) => {
    const chapter = document.createElement("div"); chapter.className = "journey-chapter";
    const band = addBand(chapter, index);
    section.classList.add("journey-stop"); chapter.append(section); chapters.append(chapter);
    return { section, chapter, band };
  });
  addBand(chapters, sections.length);
  const weather = createVisitWeather(document.getElementById("apmeklejums"));

  const yearsIndex = stops.findIndex(stop => stop.section.id === "gadi");
  const hasSurfaceBackground = stop => Boolean(stop && stop.section.id !== "gadi");
  bands.forEach((band, index) => {
    band.element.classList.toggle("fade-top", hasSurfaceBackground(stops[index - 1]));
    band.element.classList.toggle("fade-bottom", hasSurfaceBackground(stops[index]));
  });
  let sprites, yearsBackground, points = [], rows = [], routeLength = 0;
  let width = 0, height = 0, header = 0, unit = 8, pixelRatio = 1;
  let rootTop = 0, rootBottom = 0, maxScroll = 0, spriteSize = 0, previousTrain = "";
  let frame = 0, layoutFrame = 0, active = false, failed = false;
  let painter;

  function disableJourney(error) {
    if (failed) return;
    failed = true; root.classList.remove("journey-on", "is-ready"); cancelDraw();
    painter?.terminate();
    scroll.resize(); document.dispatchEvent(new Event("erm:journeylayout"));
    console.warn("Garden journey unavailable:", error);
  }

  function requestPaint() {
    if (!painter || failed) return;
    // Prepare all bands in the background, starting with the current viewport.
    const ordered = [...bands].sort((a, b) => Math.abs(a.top - scrollY) - Math.abs(b.top - scrollY));
    for (const band of ordered) {
      if (!band.options) continue;
      const requested = band.key + ":" + Boolean(band.yearsJoin?.image);
      if (band.requested === requested) continue;
      band.requested = requested;
      band.element.classList.remove("is-painted");
      const { image, ...join } = band.yearsJoin || {};
      painter.postMessage({ index: band.index, key: band.key, revision: ++band.revision,
        options: { ...band.options, yearsJoin: band.yearsJoin ? join : null },
        backgroundURL: image?.src, pixelRatio });
    }
  }

  function recoverGuide() {
    canvas.addEventListener("contextlost", event => {
      event.preventDefault();
      const replacement = document.createElement("canvas");
      replacement.width = canvas.width; replacement.height = canvas.height;
      replacement.style.cssText = canvas.style.cssText;
      canvas.replaceWith(replacement); canvas = replacement;
      context = canvas.getContext("2d", { willReadFrequently: true });
      previousTrain = ""; recoverGuide(); requestDraw();
    });
    canvas.addEventListener("contextrestored", () => { previousTrain = ""; requestDraw(); });
  }
  recoverGuide();

  function push(x, z) {
    const last = points.at(-1);
    if (last) {
      const length = Math.hypot(x - last.x, z - last.z);
      if (length < .000001) return;
      routeLength += length;
    }
    points.push({ x, z, s: routeLength });
  }
  function at(distance) {
    if (distance <= 0) return { x: points[0].x, z: points[0].z + distance };
    if (distance >= routeLength) return { x: points.at(-1).x, z: points.at(-1).z + distance - routeLength };
    let lo = 0, hi = points.length - 1;
    while (lo + 1 < hi) { const mid = (lo + hi) >> 1; if (points[mid].s < distance) lo = mid; else hi = mid; }
    const a = points[lo], b = points[hi], t = (distance - a.s) / (b.s - a.s);
    return { x: mix(a.x, b.x, t), z: mix(a.z, b.z, t) };
  }
  // Invert one monotone document-space path. There are no section hand-offs,
  // cameras or blended positions: both vehicles always follow this same road.
  function distanceAtY(y) {
    const z = (y - rootTop) / (K * unit);
    if (z <= points[0].z) return z - points[0].z;
    if (z >= points.at(-1).z) return routeLength + z - points.at(-1).z;
    let lo = 0, hi = points.length - 1;
    while (lo + 1 < hi) { const mid = (lo + hi) >> 1; if (points[mid].z < z) lo = mid; else hi = mid; }
    const a = points[lo], b = points[hi];
    return mix(a.s, b.s, (z - a.z) / (b.z - a.z));
  }
  function vehicle(distance, atlas) {
    const front = at(distance + 1), back = at(distance - 1);
    return { x: (front.x + back.x) / 2, z: (front.z + back.z) / 2,
      angle: -Math.atan2(front.z - back.z, front.x - back.x), atlas };
  }
  function travelDistance(y) {
    // Park before the final road ends; scrolling into the footer must not
    // extrapolate the train onto an unpainted stretch beyond the garden.
    const focus = header + height * .34;
    const park = routeLength - 2.8;
    const parkY = rootTop + at(park).z * K * unit;
    const remaining = Math.max(0, parkY - maxScroll - focus);
    const finish = smooth(clamp((y - maxScroll + height * .7) / (height * .7)));
    let targetY = y + focus + remaining * finish;
    const years = stops.find(stop => stop.section.id === "gadi");
    if (years && years.hold > 0 && targetY > years.top && targetY < years.top + years.height) {
      // Scroll through the full section, but drive only the visible avenue.
      // The same mapping in reverse keeps the car and its trailer on the road.
      const progress = (targetY - years.top) / years.height;
      const pinTop = Math.max(years.top, Math.min(y + years.pinTop, years.top + years.hold));
      targetY = pinTop + progress * years.pinHeight;
    }
    return Math.max(0, Math.min(park, distanceAtY(targetY)));
  }
  function trainPose(y, distance = travelDistance(y)) {
    // The negative bottom margin makes this sticky layer's margin-box zero
    // high. Its bottom constraint is the garden edge, not edge minus height.
    const layerTop = Math.min(Math.max(header, rootTop - y), rootBottom - y);
    return [vehicle(distance, sprites.car), vehicle(distance - HITCH, sprites.trailer)]
      .map(v => ({ ...v, x: v.x * unit, y: rootTop + v.z * K * unit - y - layerTop }));
  }

  function localBox(element, section) {
    let x = 0, y = 0, node = element;
    while (node && node !== section) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent; }
    return { x, y, width: element.offsetWidth, height: element.offsetHeight };
  }
  function contentRoute(stop, left, right) {
    const section = stop.section, desktop = width >= 768;
    const years = section.id === "gadi" ? layoutYears(section) : null;
    const h = section.getBoundingClientRect().height;
    let entryX = left, exitX = left, path;
    if (section.id === "pieredze" && desktop) {
      const a = localBox(section.querySelector(".exp-intro"), section);
      const b = localBox(section.querySelector(".exp-scene"), section);
      entryX = exitX = (a.x + a.width + b.x) / 2;
    } else if (section.id === "valodas") {
      const list = localBox(section.querySelector(".lang-list"), section);
      exitX = list.x + list.width / 2;
      entryX = desktop ? exitX : left;
      if (!desktop) {
        const head = localBox(section.querySelector(".lang-head"), section);
        const start = head.y + head.height + 4 * K * unit;
        const end = list.y - 4 * K * unit;
        path = [{ x: entryX, y: 0 }, { x: entryX, y: start }];
        for (let j = 1; j <= 80; j++) {
          const t = j / 80;
          path.push({ x: mix(entryX, exitX, smooth(t)), y: mix(start, end, t) });
        }
        path.push({ x: exitX, y: h });
      }
    } else if (years) {
      const stage = section.querySelector(".years-stage");
      entryX = exitX = yearsView(stage.clientWidth, stage.clientHeight).laneX;
      stop.height = h; stop.pinHeight = stage.clientHeight; stop.pinTop = years.top;
      stop.hold = Math.max(0, h - stop.pinHeight);
    } else if (["galerija", "apmeklejums", "kontakti"].includes(section.id)) {
      entryX = exitX = right;
      if (section.id === "apmeklejums") {
        const wet = weather.measure({ unit, edgeX: right });
        exitX = wet.laneX;
        path = [{ x: entryX, y: 0 }, { x: entryX, y: wet.turnStartY }];
        for (let j = 1; j <= 80; j++) {
          const t = j / 80;
          path.push({ x: mix(entryX, exitX, smooth(t)), y: mix(wet.turnStartY, wet.turnEndY, t) });
        }
        path.push({ x: exitX, y: section.getBoundingClientRect().height });
      }
    }
    stop.entryX = entryX; stop.exitX = exitX;
    stop.path = path || [{ x: entryX, y: 0 }, { x: exitX, y: h }];
  }

  function updateLanguages(distance) {
    const front = at(distance + 2), rear = at(distance - HITCH - 1.68);
    const y = rootTop + front.z * K * unit;
    const trainLength = (front.z - rear.z) * K * unit;
    for (const row of rows) {
      const rowHeight = row.bottom - row.top;
      // Start drawing the cards together ahead of the car; settle into the
      // narrow seam as the trailer clears the row. Reverse on the same path.
      const lead = Math.max(unit * 4, rowHeight * .65);
      const progress = motion.matches ? 1 : clamp((y - row.top + lead) / (lead + trainLength + rowHeight * .8));
      const value = progress.toFixed(4);
      if (value === row.value) continue;
      row.value = value;
      row.items.forEach((item, index) => {
        const delay = index * .1;
        const open = 1 - smooth(clamp((progress - delay) / (1 - delay)));
        item.style.setProperty("--zip-open", open.toFixed(4));
      });
    }
  }

  function measure() {
    layoutFrame = 0;
    if (failed || !root.classList.contains("journey-on")) return;
    header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 80;
    width = root.clientWidth; height = viewportHeight() - header;
    unit = Math.max(8, Math.min(16, width / 96));
    root.style.setProperty("--journey-unit", unit + "px");
    root.style.setProperty("--journey-height", height + "px");
    pixelRatio = Math.min(devicePixelRatio || 1, 1.5);
    const content = stops[0].section.querySelector(".container");
    const lane = Math.max(12, (content.getBoundingClientRect().left - root.getBoundingClientRect().left) / 2);
    const languages = stops.find(stop => stop.section.id === "valodas");
    const turnSpace = 8 * K * unit + Math.max(24 * K * unit, 1.875 * (width / 2 - lane) / 2.4);
    languages.section.style.setProperty("--language-turn-space", turnSpace + "px");
    stops.forEach(stop => contentRoute(stop, lane, width - lane));
    for (const band of bands) {
      band.entryX = stops[band.index - 1]?.exitX ?? width / 2;
      band.exitX = stops[band.index]?.entryX ?? width / 2;
      const base = [46, 48, 48, 50, 58, 48, 48, 48][band.index];
      const bend = Math.abs(band.exitX - band.entryX);
      band.yearsJoin = null;
      if (yearsIndex >= 0 && (band.index === yearsIndex || band.index === yearsIndex + 1)) {
        const stageHeight = stops[yearsIndex].pinHeight;
        band.yearsJoin = { ...yearsGardenJoin(width, stageHeight, band.index === yearsIndex ? "bottom" : "top"),
          image: yearsBackground, backdrop: sprites && yearsBackgroundPlacement(width, stageHeight, sprites.frames) };
      }
      band.element.classList.toggle("years-join", !!band.yearsJoin?.image);
      const connectionSpace = band.yearsJoin ? band.yearsJoin.apron + band.yearsJoin.roadHeight : 0;
      band.element.style.height = Math.max(base * K * unit, 16 * K * unit + connectionSpace + 1.875 * bend / 2.8) + "px";
    }
    rootTop = root.getBoundingClientRect().top + scrollY;
    rootBottom = rootTop + root.getBoundingClientRect().height;
    maxScroll = Math.max(0, document.documentElement.scrollHeight - viewportHeight());
    points = []; routeLength = 0;
    for (const band of bands) {
      band.top = band.element.getBoundingClientRect().top + scrollY;
      const bandHeight = band.element.getBoundingClientRect().height;
      const { entryX, exitX } = band;
      const key = [band.index, width, bandHeight, unit, entryX, exitX, pixelRatio, band.yearsJoin?.stageHeight].join();
      if (key !== band.key) {
        band.key = key;
        band.options = { index: band.index, width, height: bandHeight, unit, entryX, exitX, yearsJoin: band.yearsJoin };
        band.path = makeGardenBand({ ...band.options, pathOnly: true }).path;
      }
      const z = (band.top - rootTop) / (K * unit);
      band.path.pts.forEach(p => push(p[0], z + p[1]));
      const stop = stops[band.index];
      if (stop) {
        stop.top = stop.section.getBoundingClientRect().top + scrollY;
        stop.path.forEach(p => push(p.x / unit, (stop.top + p.y - rootTop) / (K * unit)));
      }
    }
    const cards = [...languages.section.querySelectorAll(".lang-list li")];
    const list = localBox(languages.section.querySelector(".lang-list"), languages.section);
    // Use the spare space beside the list for a wider sweep on large screens.
    const spread = Math.min(112, Math.max(0, Math.min(list.x, width - list.x - list.width) - 12));
    languages.section.style.setProperty("--language-spread", spread + "px");
    rows = [];
    for (let i = 0; i < cards.length; i += 2) {
      const items = cards.slice(i, i + 2), boxes = items.map(item => localBox(item, languages.section));
      rows.push({ items, top: languages.top + Math.min(...boxes.map(b => b.y)),
        bottom: languages.top + Math.max(...boxes.map(b => b.y + b.height)), value: "" });
    }
    const visit = stops.find(stop => stop.section.id === "apmeklejums");
    weather.setRoute(visit.path, unit);
    updateLanguages(travelDistance(scrollY));
    spriteSize = Math.ceil(unit * 12);
    const size = Math.round(spriteSize * pixelRatio);
    if (canvas.width !== size) canvas.width = canvas.height = size;
    canvas.style.width = canvas.style.height = spriteSize + "px";
    previousTrain = "";
    scroll.resize(); document.dispatchEvent(new Event("erm:journeylayout")); requestDraw(); requestPaint();
  }
  function requestMeasure() { if (!layoutFrame) layoutFrame = requestAnimationFrame(measure); }

  function drawTrain(vehicles) {
    const [car, trailer] = vehicles, scale = unit;
    const mid = { x: (car.x + trailer.x) / 2, y: (car.y + trailer.y) / 2 };
    canvas.style.transform = `translate3d(${(mid.x - spriteSize / 2).toFixed(2)}px,${(mid.y - spriteSize / 2).toFixed(2)}px,0)`;
    const key = [scale, car.angle, trailer.angle, car.x - trailer.x, car.y - trailer.y].map(n => n.toFixed(3)).join();
    if (key === previousTrain) return;
    previousTrain = key;
    const c = context, frames = sprites.frames, size = frames.spriteWorldSize * scale;
    c.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0); c.clearRect(0, 0, spriteSize, spriteSize);
    const hitch = (v, offset) => ({ x: spriteSize / 2 + v.x - mid.x + Math.cos(v.angle) * offset * scale,
      y: spriteSize / 2 + v.y - mid.y - Math.sin(v.angle) * offset * K * scale - .395 * ELEVATION * scale });
    const from = hitch(car, -1.85), to = hitch(trailer, 1.5);
    c.strokeStyle = "#30362c"; c.lineWidth = Math.max(.7, .07 * scale);
    c.beginPath(); c.moveTo(from.x, from.y); c.lineTo(to.x, to.y); c.stroke();
    for (const v of [...vehicles].sort((a, b) => a.y - b.y)) {
      const point = { x: spriteSize / 2 + v.x - mid.x, y: spriteSize / 2 + v.y - mid.y };
      const turn = ((v.angle % TAU + TAU) % TAU) / TAU * frames.count;
      const index = Math.floor(turn), alpha = turn - index;
      const draw = frame => c.drawImage(v.atlas,
        frame % frames.columns * frames.tile, Math.floor(frame / frames.columns) * frames.tile,
        frames.tile, frames.tile, point.x - size / 2, point.y - size / 2, size, size);
      draw(index);
      if (alpha > .001) { c.globalAlpha = alpha; draw((index + 1) % frames.count); c.globalAlpha = 1; }
    }
  }
  function draw() {
    frame = 0;
    if (!active || !sprites || !points.length || motion.matches || document.hidden || failed) return;
    const distance = travelDistance(scrollY);
    drawTrain(trainPose(scrollY, distance)); updateLanguages(distance);
    const visit = stops.find(stop => stop.section.id === "apmeklejums");
    weather.update({ rearY: rootTop + at(distance - HITCH - 1.68).z * K * unit - visit.top });
  }
  function requestDraw() { if (!frame && active && !motion.matches && !document.hidden) frame = requestAnimationFrame(draw); }
  function cancelDraw() { cancelAnimationFrame(frame); frame = 0; }

  async function enable() {
    try {
      if (!context) throw new Error("Canvas unavailable");
      if (gardenPainter.error) throw gardenPainter.error;
      painter = gardenPainter.worker;
      if (!painter) throw new Error("Background canvas unavailable");
      painter.onerror = event => { event.preventDefault(); disableJourney(event.message); };
      painter.onmessage = ({ data }) => {
        if (data.error) { disableJourney(data.error); return; }
        const band = bands[data.index];
        if (band.revision === data.revision) band.element.classList.add("is-painted");
      };
      for (const band of bands) {
        const surface = band.canvas.transferControlToOffscreen();
        painter.postMessage({ index: band.index, canvas: surface }, [surface]);
      }
      requestPaint();
      sprites = await loadGardenSprites();
      if (failed) return;
      measure(); root.classList.add("is-ready");
    } catch (error) {
      disableJourney(error);
    }
  }
  if (yearsIndex >= 0) {
    const backgroundObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      backgroundObserver.disconnect();
      Promise.all([loadYearsBackground(), loadGardenSprites()]).then(([image]) => {
        if (failed) return;
        yearsBackground = image;
        requestMeasure();
      }).catch(() => {});
    }, { rootMargin: "1200px" });
    backgroundObserver.observe(bands[yearsIndex].element);
  }
  new IntersectionObserver(entries => {
    active = entries[0].isIntersecting;
    if (active) requestDraw(); else cancelDraw();
  }, { rootMargin: "200px" }).observe(root);
  const observer = new ResizeObserver(requestMeasure);
  for (const stop of stops) observer.observe(stop.section);
  scroll.on("scroll", requestDraw);
  onViewportChange(requestMeasure);
  document.addEventListener("erm:langchange", requestMeasure);
  document.addEventListener("visibilitychange", () => document.hidden ? cancelDraw() : requestDraw());
  document.fonts.ready.then(requestMeasure);
  document.fonts.addEventListener("loadingdone", requestMeasure);
  motion.addEventListener("change", () => { requestMeasure(); if (motion.matches) cancelDraw(); else requestDraw(); });
  requestMeasure();
  // Module scripts run after parsing; unrelated page assets must not hold up the garden.
  enable();
}
