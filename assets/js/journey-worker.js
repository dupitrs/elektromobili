import { makeGardenBand } from "./journey-formal-garden.js?v=20260928-mobile-6";
import { loadGardenDecor, drawGardenBand } from "./journey-garden-renderer.js?v=20260928-mobile-6";

// Geometry and rasterization both stay off the scrolling thread. Keep only the
// newest requested layout for each band when resizing or changing language.
const surfaces = new Map(), pending = new Map(), plans = new Map();
let running = false, background;
// Fetch the small shared atlas as soon as the early worker starts. Geometry
// can then be calculated while its pixels are still travelling over the network.
const decorations = loadGardenDecor().then(assets => ({ assets }), error => ({ error }));

async function paintNext() {
  if (running || !pending.size) return;
  running = true;
  // Font/layout changes must not push the opening garden behind all seven others.
  const index = pending.has(0) ? 0 : pending.keys().next().value;
  const job = pending.get(index);
  pending.delete(index);
  try {
    let cached = plans.get(index);
    if (cached?.key !== job.key) {
      cached = { key: job.key, plan: makeGardenBand(job.options) };
      plans.set(index, cached);
    }
    const { assets, error } = await decorations;
    if (error) throw error;
    let image;
    if (job.backgroundURL) {
      const result = await background;
      if (result.error) throw result.error;
      image = result.image;
    }
    // A newer resize may have arrived while assets were being decoded.
    if (!pending.has(index)) {
      cached.plan.yearsJoin = job.options.yearsJoin && { ...job.options.yearsJoin, image };
      drawGardenBand(surfaces.get(index), cached.plan, assets, job.pixelRatio);
      self.postMessage({ index, revision: job.revision });
    }
  } catch (error) {
    self.postMessage({ error: error.message });
  } finally {
    running = false;
    // Yield to queued messages before choosing the next layout.
    setTimeout(paintNext, 0);
  }
}

self.onmessage = ({ data }) => {
  if (data.canvas) surfaces.set(data.index, data.canvas);
  else {
    // Download the shared 17 backdrop while the first garden bands paint.
    if (data.backgroundURL && !background) background = fetch(data.backgroundURL).then(response => {
      if (!response.ok) throw new Error("Garden background unavailable");
      return response.blob();
    }).then(blob => createImageBitmap(blob)).then(image => ({ image }), error => ({ error }));
    pending.set(data.index, data);
    paintNext();
  }
};
