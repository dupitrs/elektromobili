import { yearsJoinAvenues, yearsRoadWidth } from "./years-routes.js?v=20260927-mobile-2";
import { viewportHeight } from "./viewport.js?v=20260927-mobile-2";

const projection = 43 / Math.hypot(43, 36);

/* Share the camera crop with the page-wide route so its car uses the
   garden's straight eastern avenue at x = 25 metres. */
export function yearsView(width, height) {
  const viewWidth = Math.max(width < 620 ? 46 : 64, 36 * width / height);
  // Keep even tall portrait crops inside the complete garden and its joins.
  const scale = Math.max(width / viewWidth, height / (200 * projection));
  const centerX = width < 620 ? 5 : 0;
  return { scale, centerX, centerZ: 3, laneX: width / 2 + (25 - centerX) * scale };
}

export function yearsGardenJoin(width, stageHeight, edge) {
  const view = yearsView(width, stageHeight), projectedScale = projection * view.scale;
  const atTop = edge === "top", direction = atTop ? 1 : -1;
  const stageEdgeZ = view.centerZ + direction * stageHeight / (2 * projectedScale);
  const avenues = atTop ? yearsJoinAvenues.south : yearsJoinAvenues.north;
  const roadHeight = yearsRoadWidth * projectedScale;
  const reserve = Math.min(48, 3 * view.scale) + roadHeight / 2;
  const worldZ = avenues.find(z => (z - stageEdgeZ) * direction * projectedScale >= reserve) ?? avenues.at(-1);
  const centreY = stageHeight / 2 + (worldZ - view.centerZ) * projectedScale;
  return { edge, stageHeight, worldZ, roadHeight,
    apron: (atTop ? centreY - stageHeight : -centreY) - roadHeight / 2 };
}

// The adjacent garden bands continue the same image at the same camera crop.
export function yearsBackgroundPlacement(width, height, frames) {
  const { scale, centerX, centerZ } = yearsView(width, height);
  const w = frames.backgroundWorldWidth * scale, h = frames.backgroundWorldHeight * scale;
  return { width: w, height: h, x: (width - w) / 2 - centerX * scale,
    y: (height - h) / 2 + (-.6 - centerZ) * 43 / Math.hypot(43, 36) * scale };
}

// `edge` names the band edge touching the years stage. Both the scenery and
// its driving route use this boundary; the source image continues unchanged.
export function yearsJoinPlacement(bandHeight, { edge, apron, roadHeight, stageHeight }) {
  const atTop = edge === "top";
  const junctionY = atTop ? apron + roadHeight / 2 : bandHeight - apron - roadHeight / 2;
  return {
    junctionY,
    imageY: atTop ? -stageHeight : bandHeight,
    imageTop: atTop ? 0 : junctionY,
    imageBottom: atTop ? junctionY : bandHeight,
    gardenTop: atTop ? junctionY : 0,
    gardenBottom: atTop ? bandHeight : junctionY
  };
}

/* Reserve the entire visible garden before its images finish loading. */
export function layoutYears(section) {
  const stage = section.querySelector(".years-stage");
  const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 80;
  const height = Math.max(180, viewportHeight() - headerHeight);
  stage.style.height = height + "px";
  const top = headerHeight;
  const distance = innerWidth < 620 ? Math.max(420, Math.min(620, viewportHeight() * .7)) : Math.max(680, Math.min(900, viewportHeight() * .85));
  section.style.setProperty("--years-pin-height", height + "px");
  section.style.setProperty("--years-pin-top", top + "px");
  section.style.setProperty("--years-scroll-distance", distance + "px");
  section.classList.toggle("is-reduced-motion", matchMedia("(prefers-reduced-motion: reduce)").matches);
  return { top, distance };
}
