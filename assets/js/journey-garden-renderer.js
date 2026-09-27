import { decodeImage } from "./garden-assets.js?v=20260927-mobile-3";
import { gardenProjection as K } from "./journey-formal-garden.js?v=20260927-mobile-3";
import { yearsJoinPlacement } from "./years-layout.js?v=20260927-mobile-3";

let decorations;
const paintings = new WeakMap();
export function loadGardenDecor() {
  if (!decorations) {
    const asset = file => new URL("../img/journey/" + file, import.meta.url).href;
    decorations = Promise.all([
      typeof Image === "function" ? decodeImage(asset("decor.webp")) :
        fetch(asset("decor.webp")).then(response => {
          if (!response.ok) throw new Error("Garden decorations unavailable");
          return response.blob();
        }).then(blob => createImageBitmap(blob)),
      fetch(asset("decor.json")).then(response => {
        if (!response.ok) throw new Error("Garden decorations unavailable");
        return response.json();
      })
    ]).then(([image, metadata]) => ({ image, ...metadata }));
  }
  return decorations;
}

// All scenery is painted once when the layout changes. Scrolling only moves
// the separate vehicle, keeping the complete garden out of the frame loop.
export function drawGardenBand(canvas, plan, assets, pixelRatio = 1) {
  const ratio = Math.min(pixelRatio, 2), { width, height, unit } = plan;
  if (!paintings.has(canvas)) canvas.addEventListener("contextrestored", () => {
    const latest = paintings.get(canvas);
    drawGardenBand(canvas, latest.plan, latest.assets, latest.ratio);
  });
  paintings.set(canvas, { plan, assets, ratio });
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  if (canvas.style) { canvas.style.width = width + "px"; canvas.style.height = height + "px"; }
  // Static bands never need GPU-backed canvases. This also avoids compositor
  // context pressure when a fast anchor jump exposes several gardens at once.
  const c = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
  c.setTransform(ratio, 0, 0, ratio, 0, 0);
  // Cover rounded backing-store pixels before clipping either adjoining map.
  // Fractional CSS heights must not leave a dark one-pixel seam at the edge.
  c.fillStyle = "#bbc9a3";
  c.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);
  const join = plan.yearsJoin?.image ? plan.yearsJoin : null;
  const placement = join && yearsJoinPlacement(height, join);
  const junctionY = placement?.junctionY;
  c.save();
  if (join) {
    c.beginPath();
    c.rect(0, placement.gardenTop, width, placement.gardenBottom - placement.gardenTop);
    c.clip();
  }
  c.fillStyle = "rgba(244,243,202,.07)";
  for (let x = -unit * 6 + plan.index * unit % (unit * 12); x < width; x += unit * 12) c.fillRect(x, 0, unit * 6, height);
  c.save(); c.scale(unit, K * unit);
  c.lineCap = "round"; c.lineJoin = "round";
  for (const points of plan.water) {
    c.beginPath(); points.forEach(([x, z], i) => i ? c.lineTo(x, z) : c.moveTo(x, z));
    c.lineWidth = 3.8; c.strokeStyle = "#ded8c6"; c.stroke();
    c.lineWidth = 2.9; c.strokeStyle = "#8bbdc4"; c.stroke();
  }
  c.fillStyle = "#e9e2cd";
  for (const points of [...plan.beds, ...plan.clearings]) {
    c.beginPath(); points.forEach(([x, z], i) => i ? c.lineTo(x, z) : c.moveTo(x, z));
    c.closePath(); c.fill();
  }
  for (const court of plan.courts) {
    c.beginPath();
    for (const points of [court.pts, ...court.islands]) {
      points.forEach(([x, z], i) => i ? c.lineTo(x, z) : c.moveTo(x, z)); c.closePath();
    }
    c.fill("evenodd");
  }
  // The joining cross avenue uses the exact width of the adjoining 17 map.
  // Equal-colour strokes merge into one surface without outlined seams.
  c.strokeStyle = "#e9e2cd";
  for (const roadWidth of new Set(plan.roads.map(road => road.width))) {
    c.lineWidth = roadWidth; c.beginPath();
    for (const road of plan.roads.filter(road => road.width === roadWidth)) {
      road.pts.forEach(([x, z], i) => i ? c.lineTo(x, z) : c.moveTo(x, z));
    }
    c.stroke();
  }
  for (const points of plan.pools) {
    // Stone basins retain the same raised rim and cast shadow as the decor.
    c.save(); c.translate(.28, .38);
    c.beginPath(); points.forEach(([x, z], i) => i ? c.lineTo(x, z) : c.moveTo(x, z)); c.closePath();
    c.fillStyle = "rgba(48,54,32,.14)"; c.fill();
    c.restore();
    c.beginPath(); points.forEach(([x, z], i) => i ? c.lineTo(x, z) : c.moveTo(x, z)); c.closePath();
    c.fillStyle = "#babca7"; c.fill();
    c.save(); c.translate(0, -.2);
    c.beginPath(); points.forEach(([x, z], i) => i ? c.lineTo(x, z) : c.moveTo(x, z)); c.closePath();
    c.fillStyle = "#8bbdc4"; c.strokeStyle = "#ded8c6"; c.lineWidth = .3; c.fill(); c.stroke();
    c.restore();
  }
  c.restore();
  const objects = [...plan.hedges, ...plan.trees, ...plan.features].sort((a, b) => a.z - b.z);
  for (const object of objects) {
    const frame = assets.frames[object.kind];
    const w = frame.worldWidth * unit * (object.scale || 1), h = frame.worldHeight * unit * (object.scale || 1);
    // Atlas frames include transparent padding. Clip against the plant's
    // physical bounds so that complete rows survive beside the cross avenue.
    const top = (object.z - object.radius - object.height * 36 / 43) * K * unit;
    const bottom = (object.z + object.radius) * K * unit;
    // Whole plants stop beside the new cross avenue, without sliced crowns.
    if (join && (join.edge === "top" ? top < junctionY + join.roadHeight / 2 : bottom > junctionY - join.roadHeight / 2)) continue;
    c.drawImage(assets.image, frame.x, frame.y, frame.width, frame.height,
      object.x * unit - w * frame.anchorX, object.z * K * unit - h * frame.anchorY, w, h);
  }
  c.restore();
  if (join) {
    // Copy the actual adjoining part of the 17 garden. Roads, hedges, mowing
    // stripes and their scale meet at the same pixels on both section edges.
    const b = join.backdrop;
    c.save(); c.beginPath();
    c.rect(0, placement.imageTop, width, placement.imageBottom - placement.imageTop);
    c.clip();
    c.drawImage(join.image, b.x, b.y + placement.imageY, b.width, b.height);
    c.restore();
    // Every walk from either map joins this continuous transverse avenue.
    c.fillStyle = "#e9e2cd";
    c.fillRect(0, junctionY - join.roadHeight / 2, width, join.roadHeight);
  }
}
