import { gardenRoutes } from "./years-routes.js?v=20260927-mobile-2";
import { layoutYears, yearsView, yearsBackgroundPlacement } from "./years-layout.js?v=20260927-mobile-2";
import { loadYearsBackground, loadGardenSprites } from "./garden-assets.js?v=20260927-mobile-2";
import { scroll } from "./smooth-scroll.js?v=20260927-mobile-2";
import { viewportHeight, onViewportChange } from "./viewport.js?v=20260927-mobile-2";

/* The camera never moves. Pre-rendered views of the original 3D models keep
   their detail without rebuilding geometry or shadows while the page scrolls. */
const RUN_TIME = 9;
const FORMATION_END = .72;
const COLOR_RETURN_START = 1.22, COLOR_RETURN_END = 1.62;
const TAU = Math.PI * 2;
const CAMERA_LENGTH = Math.hypot(43, 36);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const smooth = value => { const t = clamp(value, 0, 1); return t * t * (3 - 2 * t); };

export async function createGarden(section) {
  const canvas = section.querySelector(".years-canvas");
  const stage = section.querySelector(".years-stage");
  const pin = section.querySelector(".years-pin");
  const plus = section.querySelector(".years-plus");
  const title = section.querySelector(".years-title");
  const chapter = section.closest(".journey-chapter");
  const adjoiningBands = [chapter?.querySelector(".journey-band"), chapter?.nextElementSibling?.querySelector(".journey-band")].filter(Boolean);
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("Canvas unavailable");
  const [background, { car, trailer, frames }] = await Promise.all([
    loadYearsBackground(), loadGardenSprites()
  ]);
  const { fleet } = gardenRoutes();
  const vehicles = [];
  for (const train of fleet) {
    train.vehicles = Array.from({ length: train.trailers + 1 }, (_, i) => {
      const vehicle = { x: 0, z: 0, angle: 0, atlas: i ? trailer : car };
      vehicles.push(vehicle); return vehicle;
    });
  }
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0, height = 0, scale = 1, centerX = 0, centerZ = 3, sectionTop = 0;
  let pinTop = 84, scrollDistance = 900, elapsed = -1, raf = 0, active = true;
  let pixelRatio = 1, colorReturn = 0, paintedBackdrop = "", paintedEmphasis = "";

  function project(x, y, z) {
    return {
      x: width / 2 + (x - centerX) * scale,
      y: height / 2 - (y * 36 - (z - centerZ) * 43) / CAMERA_LENGTH * scale
    };
  }

  function resize() {
    const layout = layoutYears(section);
    pinTop = layout.top; scrollDistance = layout.distance;
    sectionTop = chapter ? chapter.getBoundingClientRect().top + scrollY + section.offsetTop : section.getBoundingClientRect().top + scrollY;
    width = stage.clientWidth; height = stage.clientHeight;
    const view = yearsView(width, height);
    ({ scale, centerX, centerZ } = view);
    pixelRatio = Math.min(devicePixelRatio || 1, 1.5);
    const bufferWidth = Math.round(width * pixelRatio), bufferHeight = Math.round(height * pixelRatio);
    if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
      canvas.width = bufferWidth; canvas.height = bufferHeight;
    }
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const backdrop = yearsBackgroundPlacement(width, height, frames);
    // Re-assigning the same background can send the browser back to the
    // decoder for a 1600 px wide garden, which a phone feels as a stall.
    const placement = [background.src, backdrop.width, backdrop.height, backdrop.x, backdrop.y].join();
    if (placement !== paintedBackdrop) {
      paintedBackdrop = placement;
      stage.style.backgroundImage = 'url("' + background.src + '")';
      stage.style.backgroundSize = backdrop.width + "px " + backdrop.height + "px";
      stage.style.backgroundPosition = backdrop.x + "px " + backdrop.y + "px";
    }

    // Start each queue just outside the current crop, on its existing road.
    const starts = new Map(), margin = 2.6 * scale;
    for (const train of fleet) {
      if (!starts.has(train.path)) {
        let outside = -200, inside = train.end;
        for (let i = 0; i < 24; i++) {
          const distance = (outside + inside) / 2, p = train.path.at(distance);
          const screen = project(p.x, 1.1, p.z);
          if (screen.x >= -margin && screen.x <= width + margin && screen.y >= -margin && screen.y <= height + margin) inside = distance;
          else outside = distance;
        }
        starts.set(train.path, outside - .5);
      }
      train.start = starts.get(train.path);
    }
    const anchor = project(14, 1, -11.8);
    const fontSize = parseFloat(getComputedStyle(plus).fontSize);
    const insetX = (plus.offsetWidth || fontSize * .7) / 2 + 12;
    const insetY = (plus.offsetHeight || fontSize) / 2 + 12;
    plus.style.left = clamp(anchor.x, insetX, width - insetX) + "px";
    plus.style.top = clamp(anchor.y, insetY, height - insetY) + "px";
    // Place the caption below the entire 17, clear of the eastern avenue.
    const caption = project(1, 0, 14), titleRight = Math.min(width - 16, view.laneX - 5 * scale);
    title.style.maxWidth = Math.max(180, titleRight - 16) + "px";
    const titleBottom = height - Math.min(20, height * .04) - title.offsetHeight / 2;
    const titleTop = Math.min(titleBottom, project(1, 0, 12).y + 12 + title.offsetHeight / 2);
    section.style.setProperty("--years-title-x", clamp(caption.x, title.offsetWidth / 2 + 16, titleRight - title.offsetWidth / 2) + "px");
    section.style.setProperty("--years-title-y", clamp(caption.y, titleTop, titleBottom) + "px");
    updateScrollProgress(); draw();
  }

  function travel(train) {
    const duration = (train.arrival ?? RUN_TIME) - train.delay;
    const u = clamp((elapsed - train.delay) / duration, 0, 1);
    const a = .12, b = .76, area = 1 - a / 2 - (1 - b) / 2;
    let distance;
    if (u < a) distance = u * u / (2 * a);
    else if (u < b) distance = u - a / 2;
    else { const tail = u - b; distance = b - a / 2 + tail - tail * tail / (2 * (1 - b)); }
    return train.start + (train.end - train.start) * distance / area;
  }

  function sprite(vehicle, index, x, y, size) {
    context.drawImage(vehicle.atlas,
      (index % frames.columns) * frames.tile, Math.floor(index / frames.columns) * frames.tile,
      frames.tile, frames.tile, x, y, size, size);
  }

  function draw() {
    section.classList.toggle("is-formed", elapsed >= RUN_TIME);
    section.classList.toggle("is-plus-visible", elapsed >= RUN_TIME * .5);
    // Writing this custom property invalidates the whole section's styles,
    // so only a value the eye can tell apart is worth a frame of that work.
    const emphasis = (smooth((elapsed / RUN_TIME - .15) / .85) * (1 - colorReturn)).toFixed(3);
    if (emphasis !== paintedEmphasis) {
      paintedEmphasis = emphasis;
      section.style.setProperty("--years-emphasis", emphasis);
      for (const band of adjoiningBands) band.style.setProperty("--years-emphasis", emphasis);
    }
    context.clearRect(0, 0, width, height);
    const leaders = new Map();
    context.strokeStyle = "#242725";
    context.lineWidth = Math.max(.7, .07 * scale);
    for (const train of fleet) {
      let distance = travel(train);
      const leader = leaders.get(train.path);
      if (leader) distance = Math.min(distance, leader.distance - leader.gap);
      leaders.set(train.path, { distance, gap: train.trailers ? 7.75 + Math.sin(Math.PI * elapsed / RUN_TIME) : 4.6 });
      train.vehicles.forEach((vehicle, i) => {
        const offset = i ? 3.5 / 2 + .77 + 3 / 2 + (i - 1) * 3.77 : 0;
        const s = distance - offset, front = train.path.at(s + 1), back = train.path.at(s - 1);
        vehicle.x = (front.x + back.x) / 2; vehicle.z = (front.z + back.z) / 2;
        vehicle.angle = -Math.atan2(front.z - back.z, front.x - back.x);
      });
      for (let i = 1; i < train.vehicles.length; i++) {
        const lead = train.vehicles[i - 1], tail = train.vehicles[i];
        const hitch = i > 1 ? -1.6 : -1.85;
        const from = project(lead.x + Math.cos(lead.angle) * hitch, .395, lead.z - Math.sin(lead.angle) * hitch);
        const to = project(tail.x + Math.cos(tail.angle) * 1.5, .395, tail.z - Math.sin(tail.angle) * 1.5);
        context.beginPath(); context.moveTo(from.x, from.y); context.lineTo(to.x, to.y); context.stroke();
      }
    }
    const size = frames.spriteWorldSize * scale;
    vehicles.sort((a, b) => a.z - b.z);
    // Keep the original roof colors: a glow on each sprite can wash out
    // the neighboring roof where the vehicles overlap along the 7.
    for (const vehicle of vehicles) {
      const point = project(vehicle.x, 0, vehicle.z);
      const x = point.x - size / 2, y = point.y - size / 2;
      if (x > width || y > height || x + size < 0 || y + size < 0) continue;
      const turn = ((vehicle.angle % TAU + TAU) % TAU) / TAU * frames.count;
      const index = Math.floor(turn), mix = turn - index;
      sprite(vehicle, index, x, y, size);
      // Blend adjacent five-degree views to keep turns continuous.
      if (mix > .001) {
        context.globalAlpha = mix;
        sprite(vehicle, (index + 1) % frames.count, x, y, size);
        context.globalAlpha = 1;
      }
    }
  }

  function updateScrollProgress() {
    const before = elapsed, previousReturn = colorReturn;
    const lead = Math.min(180, viewportHeight() * .2);
    const offset = scrollY - sectionTop + pinTop;
    elapsed = motionPreference.matches ? RUN_TIME :
      clamp((offset + lead) / (scrollDistance * FORMATION_END + lead), 0, 1) * RUN_TIME;
    // Keep the complete 17 emphasized throughout the hold, then restore
    // the palette gently as the garden starts scrolling out of view.
    colorReturn = motionPreference.matches ? 1 : smooth((offset / scrollDistance - COLOR_RETURN_START) / (COLOR_RETURN_END - COLOR_RETURN_START));
    return elapsed !== before || colorReturn !== previousReturn;
  }
  function onScroll() {
    if (raf || !active || document.hidden) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (active && !document.hidden && updateScrollProgress()) draw();
    });
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  resize();
  section.classList.add("is-3d-ready");
  if ("IntersectionObserver" in window) new IntersectionObserver(entries => {
      active = entries[0].isIntersecting;
      if (active) onScroll(); else stop();
    }, { rootMargin: "120px" }).observe(section);
  new ResizeObserver(resize).observe(pin);
  scroll.on("scroll", onScroll);
  onViewportChange(resize);
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : onScroll());
  document.addEventListener("erm:langchange", () => requestAnimationFrame(resize));
  document.addEventListener("erm:journeylayout", resize);
  motionPreference.addEventListener("change", resize);
  document.fonts.ready.then(resize);
  document.fonts.addEventListener("loadingdone", resize);
}
