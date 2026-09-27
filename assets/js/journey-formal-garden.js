import { route, roadDistance, hedgeContours } from "./years-routes.js?v=20260927-mobile-2";
import { rundaleFragments, gardenRoadWidth } from "./rundale-garden-plan.js?v=20260927-mobile-2";
import { yearsJoinPlacement } from "./years-layout.js?v=20260927-mobile-2";

export const gardenProjection = 43 / Math.hypot(43, 36);
const elevation = 36 / 43;

// Formal, paired garden rooms. Only the driving avenue follows the section
// gates; planting and ornaments keep their proportions and mirror each other.
export function makeGardenBand({ index, width, height, unit, entryX, exitX, yearsJoin = null, pathOnly = false }) {
  const K = gardenProjection, worldWidth = width / unit, depth = height / (K * unit);
  const centre = worldWidth / 2, entry = entryX / unit, exit = exitX / unit;
  const roadWidth = gardenRoadWidth, clearance = 3.35, hedgeOffset = 4.8;
  const joinDepth = yearsJoin ? (yearsJoin.apron + yearsJoin.roadHeight) / (K * unit) + 4 : 5;
  const north = yearsJoin?.edge === "top" ? joinDepth : 5;
  const south = depth - (yearsJoin?.edge === "bottom" ? joinDepth : 5);
  const mid = (north + south) / 2;
  const roads = [], hedges = [], trees = [], features = [], courts = [], pools = [], water = [];
  const addRoad = (points, radius = 2.4, width = roadWidth) => {
    const road = { ...route(points, radius), width, avenue: true };
    roads.push(road); return road;
  };
  // Keep the entrance straight between the two side fountains. Only the
  // final approach bends toward the next section's existing entrance.
  const path = addRoad(Math.abs(entry - exit) < .01 ? [[entry, 0], [exit, depth]] :
    [[entry, 0], [entry, index === 0 ? mid + 5 : north], [exit, south], [exit, depth]], 4);
  // Layout needs only the driving path; planting is built near the viewport.
  if (pathOnly) return { path };
  const mirror = points => points.map(([x, z]) => [worldWidth - x, z]);
  const ellipse = (x, z, rx, rz = rx) => Array.from({ length: 65 }, (_, i) => {
    const a = i * Math.PI / 32; return [x + Math.cos(a) * rx, z + Math.sin(a) * rz];
  });
  if (Math.max(Math.abs(entry - centre), Math.abs(exit - centre)) > .01) addRoad(mirror(path.pts), 0);
  // A single transverse avenue gives each junction a clear, complete shape.
  if (index === 0) {
    const left = centre / 2, right = worldWidth - left, radius = 6;
    addRoad([[-8, mid], [left - radius, mid]], 0);
    addRoad([[left + radius, mid], [right - radius, mid]], 0);
    addRoad([[right + radius, mid], [worldWidth + 8, mid]], 0);
    for (const x of [left, right]) {
      addRoad(ellipse(x, mid, radius), 0);
      features.push({kind:"fountain", x, z:mid, radius:1.96, height:1.76, scale:.8});
    }
  } else if (index === 7) water.push([[-8, mid], [worldWidth + 8, mid]]);
  else addRoad([[-8, mid], [worldWidth + 8, mid]], 0);

  const edge = yearsJoin && yearsJoinPlacement(height, yearsJoin).junctionY / (K * unit);
  if (yearsJoin) addRoad([[-8, edge], [worldWidth + 8, edge]], 0, yearsJoin.roadHeight / (K * unit));
  const top = yearsJoin?.edge === "top" ? edge : 0;
  const bottom = yearsJoin?.edge === "bottom" ? edge : depth;
  const openPaths = [...roads, ...water.map(pts => ({pts}))];
  const allClear = (x, z, radius, h = 0) => {
    for (let i = 0; i <= 4; i++) {
      if (roadDistance(x, z - h * elevation * i / 4, openPaths) < clearance + radius) return false;
    }
    return true;
  };
  const pair = (x, z) => Math.abs(x - centre) < .01 ? [[x, z]] : [[x, z], [worldWidth - x, z]];

  // Find a shared centre for each paired salon inside the actual free lawn.
  // Reject a pair together: cropping or a junction never leaves half a motif.
  const salons = [];
  for (const [z1, z2] of [[top + 3, mid - 4], [mid + 4, bottom - 3]]) {
    let best;
    for (let z = z1 + 2; z <= z2 - 2; z += 1) for (let x = 9; x <= centre - 9; x += 1) {
      const room = Math.min(x - 2, centre - x - 2, z - top - 3, bottom - z - 3,
        ...pair(x, z).map(([px, pz]) => roadDistance(px, pz, openPaths) - hedgeOffset));
      const score = room - Math.abs(z - (z1 + z2) / 2) * .08;
      if (!best || score > best.score) best = { x, z, room, score };
    }
    if (index !== 7 && best && best.room >= 5.5) salons.push(best);
  }
  const shape = (x, z, r) => {
    if ([1, 2, 7].includes(index)) return ellipse(x, z, r);
    if ([4, 6].includes(index)) return [[x, z-r], [x+r, z], [x, z+r], [x-r, z], [x, z-r]];
    const cut = r * .22;
    return [[x-r+cut,z-r],[x+r-cut,z-r],[x+r,z-r+cut],[x+r,z+r-cut],
      [x+r-cut,z+r],[x-r+cut,z+r],[x-r,z+r-cut],[x-r,z-r+cut],[x-r+cut,z-r]];
  };
  for (const salon of salons) for (const [x, z] of pair(salon.x, salon.z)) {
    const radius = Math.min(5.5, (salon.room - 1.5) / 1.3), pts = shape(x, z, radius);
    const kind = index === 0 ? "parterre" : [2, 4, 6].includes(index) ? "pavilion" : "roses";
    courts.push({ x, z, radius, kind, pts, islands: [], number: rundaleFragments[index].numbers[0] });
    const scale = Math.min(1, radius / 3.5);
    features.push({ kind, x, z, radius: (kind === "pavilion" ? 2.35 : 3.1) * scale,
      height: (kind === "pavilion" ? 4.25 : .65) * scale, scale });
  }

  // Each pavilion opens onto its nearest avenue. The paired gate and walk
  // become part of the same contour instead of cutting random hedge gaps.
  const avenues = roads.slice();
  for (const court of courts.filter(c => c.kind === "pavilion" && c.x < centre)) {
    let nearest, distance = Infinity;
    for (const road of avenues) for (let i = 1; i < road.pts.length; i++) {
      const a = road.pts[i-1], b = road.pts[i], dx = b[0]-a[0], dz = b[1]-a[1];
      const t = Math.max(0, Math.min(1, ((court.x-a[0])*dx+(court.z-a[1])*dz)/(dx*dx+dz*dz)));
      const p = [a[0]+dx*t, a[1]+dz*t], d = Math.hypot(court.x-p[0],court.z-p[1]);
      if (d < distance) { distance = d; nearest = p; }
    }
    const points = [nearest, [court.x, court.z]];
    openPaths.push(addRoad(points, 0), addRoad(mirror(points), 0));
  }

  // The contour is taken around the complete network, including section
  // boundaries. Corners join once; all road junctions remain open.
  const boundaries = [
    { pts: [[-12, top - hedgeOffset + 1.65], [worldWidth + 12, top - hedgeOffset + 1.65]] },
    { pts: [[-12, bottom + hedgeOffset - 1.65], [worldWidth + 12, bottom + hedgeOffset - 1.65]] }
  ];
  const contourRoads = [...openPaths, ...boundaries].map(road => ({ width: road.width ?? roadWidth,
    pts: road.pts.map(([x,z]) => [x - centre, z - depth / 2]) }));
  const pavilionCourts = courts.filter(c => c.kind === "pavilion");
  function surfaceDistance(x, z) {
    let distance = Math.min(...contourRoads.map(road => roadDistance(x,z,[road]) - (road.width - roadWidth) / 2));
    const px = x + centre, pz = z + depth / 2;
    for (const court of pavilionCourts) {
      const dx = Math.abs(px-court.x), dz = Math.abs(pz-court.z);
      const inside = index === 2 ? Math.hypot(dx,dz) <= court.radius : dx+dz <= court.radius;
      distance = Math.min(distance, roadWidth / 2 + (inside ? 0 : roadDistance(px,pz,[court])));
    }
    return distance;
  }
  const contours = hedgeContours(contourRoads, hedgeOffset, worldWidth + 4, depth + 4, .65, surfaceDistance);
  function plantHedge(x, z, border = "bosquet", scale = 1) {
    if (Math.abs(x - centre) < .15) x = centre;
    if (x < -.7 || x > worldWidth + .7 || z < top + 1.3 || z > bottom - 1.3) return;
    if (features.some(p => p.kind === "fountain" && Math.hypot(x - p.x, z - p.z) < 3)) return;
    if (hedges.some(p => Math.hypot(p.x - x, p.z - z) < .3 * scale)) return;
    hedges.push({kind:"hedge", x, z, radius:.84*scale, height:1.25*scale, scale, border});
  }
  function plantOutline(points, border, scale = 1) {
    const outline = route(points, 0), count = Math.max(1, Math.ceil(outline.length / (.65 * scale)));
    for (let i = 0; i <= count; i++) {
      const p = outline.at(outline.length * i / count);
      for (const [x, z] of pair(p.x, p.z)) plantHedge(x, z, border, scale);
    }
  }
  // Use one half of each contour and reflect every plant, including its phase.
  // This keeps spacing exactly equal on the two sides, not merely approximate.
  for (const points of contours) {
    const projected = points.map(([x,z]) => [x + centre, z + depth / 2]);
    const outline = route(projected, 0);
    if (outline.length < 8) continue;
    const count = Math.max(1, Math.ceil(outline.length / .65));
    for (let i = 0; i <= count; i++) {
      const p = outline.at(outline.length * i / count);
      if (p.x > centre + .01) continue;
      for (const [x, z] of pair(p.x, p.z)) plantHedge(x, z);
    }
    for (let i = 1; i < projected.length; i++) {
      const a = projected[i - 1], b = projected[i];
      if ((a[0] < centre) === (b[0] < centre) || a[0] === b[0]) continue;
      plantHedge(centre, a[1] + (b[1] - a[1]) * (centre - a[0]) / (b[0] - a[0]));
    }
  }
  for (const court of courts.filter(c => c.x < centre && c.kind !== "pavilion")) plantOutline(court.pts, "ornament", .75);

  // A regular, mirrored grid fills the lawns outside the continuous hedges.
  // Trees never punch holes into a hedge or crowd a pavilion.
  const rows = Math.max(1, Math.floor((bottom - top - 12) / 5.6));
  for (let row = 0; row < rows; row++) {
    const z = (top + bottom) / 2 + (row - (rows - 1) / 2) * 5.6;
    for (let x = centre - 5.6; x >= 3; x -= 5.6) {
      const positions = pair(x, z);
      if (positions.some(([px,pz]) => pz < top + 6 || pz > bottom - 4 || !allClear(px,pz,1.15,3.8) ||
        hedges.some(p => Math.hypot(p.x-px,p.z-pz) < p.radius + 1.6) ||
        courts.some(c => roadDistance(px,pz,[{pts:c.pts}]) < 2 ||
          Math.hypot(px-c.pts[0][0],pz-c.pts[0][1]) < 1) ||
        features.some(p => Math.hypot(p.x-px,p.z-pz) < 8))) continue;
      for (const [px,pz] of positions) trees.push({kind:"lime",x:px,z:pz,radius:1.15,height:3.8,border:"avenue"});
    }
  }
  return { index, width, height, unit, depth, worldWidth, entryX, exitX, yearsJoin,
    reference: rundaleFragments[index].name, planNumbers: rundaleFragments[index].numbers,
    path, roads, roadWidth, collisionClearance: clearance, hedges, trees, features, courts, pools, water,
    clearings: [], beds: [], obstacles: [...hedges, ...trees, ...features] };
}
