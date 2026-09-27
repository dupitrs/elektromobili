import { route, roadDistance } from "./years-routes.js?v=20260927-mobile-3";
import { rundaleFragments, rundalePlan, gardenRoadWidth } from "./rundale-garden-plan.js?v=20260927-mobile-3";

export const gardenProjection = 43 / Math.hypot(43, 36);

// Clip the museum plan before projecting it into a short page transition.
function clipLine(a, b, bounds) {
  const [left, top, right, bottom] = bounds, dx = b[0] - a[0], dz = b[1] - a[1];
  let start = 0, end = 1;
  for (const [p, q] of [[-dx, a[0] - left], [dx, right - a[0]], [-dz, a[1] - top], [dz, bottom - a[1]]]) {
    if (!p) { if (q < 0) return; continue; }
    const t = q / p;
    if (p < 0) start = Math.max(start, t); else end = Math.min(end, t);
    if (start >= end) return;
  }
  return [[a[0] + dx * start, a[1] + dz * start], [a[0] + dx * end, a[1] + dz * end]];
}

function inside(x, z, points) {
  let result = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i], b = points[j];
    if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) result = !result;
  }
  return result;
}

// A fixed reference fragment supplies every avenue and ornament. Its avenue
// connects the existing section gates; the same geometry still drives the car.
export function makeGardenBand({ index, width, height, unit, entryX, exitX, yearsJoin = null }) {
  const K = gardenProjection, worldWidth = width / unit, depth = height / (K * unit);
  const entry = entryX / unit, exit = exitX / unit;
  const fragment = rundaleFragments[index], [left, north, right, south] = fragment.crop;
  const primary = rundalePlan.roads.find(road => road.id === fragment.avenue);
  const [a, b] = primary.pts;
  const sourceAxis = z => a[0] + (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]);
  const inFragment = points => !fragment.westOnly || points.some(([x]) => x < 50);
  const straight = Math.min(5, depth * .16);
  // Reach the shared avenue before entering the continued 17 scene.
  const gateDepth = yearsJoin ? Math.min(depth - straight - 4, (yearsJoin.apron + yearsJoin.roadHeight) / (K * unit) + 4) : straight;
  const northStraight = yearsJoin?.edge === "top" ? gateDepth : straight;
  const southStraight = yearsJoin?.edge === "bottom" ? gateDepth : straight;
  const axis = Math.abs(entry - exit) < .01 ? route([[entry, 0], [exit, depth]], 0) :
    route([[entry, 0], [entry, northStraight], [exit, depth - southStraight], [exit, depth]], 4);
  function axisX(z) {
    if (z <= 0) return entry;
    if (z >= depth) return exit;
    const i = Math.max(1, axis.pts.findIndex(p => p[1] >= z));
    const a = axis.pts[i - 1], b = axis.pts[i];
    return a[0] + (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]);
  }
  // Narrow screens crop the same plan instead of shuffling its landmarks.
  const scaleX = Math.max(index === 0 ? 96 : 72, worldWidth) / (right - left);
  const project = ([x, z]) => {
    const localZ = 4 + (z - north) / (south - north) * (depth - 8);
    const localX = index === 0 ? (entry + exit) / 2 : axisX(localZ);
    return [localX + (x - sourceAxis(z)) * scaleX, localZ];
  };
  const visible = (x, z) => z >= north && z <= south;
  function projectLines(points) {
    const lines = [];
    for (let i = 1; i < points.length; i++) {
      // Horizontal crop bounds set the zoom, not the ends of the walks.
      // Neighbouring rooms continue until they actually leave the canvas.
      const clipped = clipLine(points[i - 1], points[i], [-Infinity, north, Infinity, south]);
      if (!clipped) continue;
      const [a, b] = clipped, count = Math.max(1, Math.ceil(Math.abs(b[1] - a[1]) / 2));
      const line = Array.from({ length: count + 1 }, (_, j) => project([
        a[0] + (b[0] - a[0]) * j / count, a[1] + (b[1] - a[1]) * j / count
      ]));
      const last = lines.at(-1);
      if (last && Math.hypot(last.at(-1)[0] - line[0][0], last.at(-1)[1] - line[0][1]) < .001) last.push(...line.slice(1));
      else lines.push(line);
    }
    return lines;
  }
  let path = axis;
  const roads = [], hedges = [], trees = [], features = [], clearings = [], beds = [], courts = [], pools = [], water = [];
  const roadWidth = gardenRoadWidth, clearance = 3.35;
  // The only fountain belongs to the parterre. Both halves of its roundel
  // connect to the central axis; the vehicle follows the eastern half.
  if (index === 0) {
    const [centreX, centreZ] = project([50, 13.5]), radius = 5.9;
    const half = side => {
      const rounded = route([[entry, 0], [centreX, 4], ...Array.from({ length: 41 }, (_, i) => {
        const a = -Math.PI / 2 + Math.PI * i / 40;
        return [centreX + side * Math.cos(a) * radius, centreZ + Math.sin(a) * radius];
      }), [centreX, depth - 4], [exit, depth]], 1.6);
      // Uniform samples retain the curve without repeatedly scanning the
      // roughly one thousand points produced by rounding every arc segment.
      return route(Array.from({ length: 121 }, (_, i) => {
        const p = rounded.at(rounded.length * i / 120);
        return [p.x, p.z];
      }), 0);
    };
    path = half(1);
    roads.push({ ...half(-1), width: roadWidth });
  }
  path.width = roadWidth; path.avenue = true;
  roads.unshift(path);
  for (const road of rundalePlan.roads) {
    if (road.id === fragment.avenue || (fragment.roads && !fragment.roads.includes(road.id))) continue;
    if (road.id !== "central" && !inFragment(road.pts)) continue;
    for (const points of projectLines(road.pts)) {
      // A clipped through-avenue continues out of the frame. Its round cap
      // must not turn a crop of the map into a dead end inside the garden.
      for (const start of [true, false]) {
        const a = start ? points[0] : points.at(-1), b = start ? points[1] : points.at(-2);
        const dz = a[1] - b[1];
        if (Math.abs(dz) < .001) continue;
        const edge = Math.abs(a[1] - 4) < .001 && dz < 0 ? 0 :
          Math.abs(a[1] - depth + 4) < .001 && dz > 0 ? depth : null;
        if (edge === null) continue;
        const point = [a[0] + (a[0] - b[0]) * (edge - a[1]) / dz, edge];
        if (start) points.unshift(point); else points.push(point);
      }
      roads.push({ ...route(points, 0), id: road.id, width: road.width, avenue: road.avenue, bordered: road.bordered });
    }
  }
  for (const clearing of rundalePlan.clearings) {
    if (!visible(clearing.x, clearing.z)) continue;
    clearings.push(Array.from({ length: 49 }, (_, i) => {
      const a = i * Math.PI / 24;
      return project([clearing.x + Math.cos(a) * clearing.rx, clearing.z + Math.sin(a) * clearing.rz]);
    }));
  }
  for (const bed of rundalePlan.beds) if (visible(bed.x, bed.z)) beds.push(bed.pts.map(project));
  for (const court of rundalePlan.courts) {
    if (fragment.roads && !fragment.numbers.includes(court.number)) continue;
    if (!inFragment(court.pts)) continue;
    const zs = court.pts.map(p => p[1]);
    if (Math.max(...zs) < north || Math.min(...zs) > south) continue;
    courts.push({ number: court.number, pts: court.pts.map(project), islands: court.islands.map(points => points.map(project)) });
  }
  for (const points of rundalePlan.pools) {
    if (points.some(p => visible(...p))) pools.push(points.map(project));
  }
  if (rundalePlan.canal[0][1] >= north && rundalePlan.canal[0][1] <= south) {
    const z = project(rundalePlan.canal[0])[1];
    water.push([[-4, z], [worldWidth + 4, z]]);
  }

  // Reserve the full car/trailer envelope, including the projected foliage.
  const free = (x, z, radius, objectHeight = 0) => {
    const projectedHeight = objectHeight * 36 / 43;
    for (let j = 0; j <= 4; j++) {
      if (roadDistance(x, z - projectedHeight * j / 4, [path]) < clearance + radius) return false;
    }
    return true;
  };
  const occupied = (x, z, radius, gap = .4, featureScale = 1) =>
    trees.some(p => Math.hypot(p.x - x, p.z - z) < p.radius + radius + gap) ||
    features.some(p => Math.hypot(p.x - x, p.z - z) < p.radius * featureScale + radius + gap);
  const onRoad = (x, z, radius) => roads.slice(1).some(road => roadDistance(x, z, [road]) < road.width / 2 + radius + .15);
  const waterPaths = water.map(pts => ({ pts }));
  function openGround(x, z, radius) {
    if (roadDistance(x, z, waterPaths) < 1.45 + radius) return true;
    return [...clearings, ...beds].some(points => inside(x, z, points) || roadDistance(x, z, [{ pts: points }]) < radius) ||
      courts.some(court => inside(x, z, court.pts));
  }
  const garden = { index, width, height, unit, depth, worldWidth, entryX, exitX, yearsJoin,
    reference: fragment.name, planNumbers: fragment.numbers,
    path, roads, roadWidth, collisionClearance: clearance, hedges, trees, features, clearings, beds, courts, pools, water };

  function hedge(x, z, border, scale = 1) {
    const radius = .84 * scale, objectHeight = 1.25 * scale;
    const sectionBorder = border === "top" || border === "bottom";
    const crossesBoundary = sectionBorder && roads.slice(1).some(road =>
      [road.pts[0], road.pts.at(-1)].some(p => border === "top" ? p[1] < 1 : p[1] > depth - 1) &&
      roadDistance(x, z, [road]) < road.width / 2 + radius + .15);
    if (x < -.5 || x > worldWidth + .5 || z < 1.3 || z > depth - 1.3 ||
      !free(x, z, radius, objectHeight) || occupied(x, z, radius, .08, scale < 1 ? .7 : 1) ||
      crossesBoundary || (!sectionBorder && (onRoad(x, z, radius) || (border !== "ornament" && openGround(x, z, radius))))) return;
    if (hedges.some(p => Math.hypot(p.x - x, p.z - z) < .4 * scale)) return;
    hedges.push({ kind: "hedge", x, z, rx: .7 * scale, rz: .55 * scale, radius, height: objectHeight, border, scale });
  }
  function hedgeLine(x1, z1, x2, z2, border, scale = 1) {
    const count = Math.max(1, Math.ceil(Math.hypot(x2 - x1, z2 - z1) / (.8 * scale)));
    for (let j = 0; j <= count; j++) hedge(x1 + (x2 - x1) * j / count, z1 + (z2 - z1) * j / count, border, scale);
  }
  function tree(x, z, border) {
    const radius = 1.15;
    if (x < 1.3 || x > worldWidth - 1.3 || !free(x, z, radius, 3.8) || occupied(x, z, radius) || onRoad(x, z, radius) || openGround(x, z, radius)) return;
    if (hedges.some(p => Math.hypot(p.x - x, p.z - z) < p.radius + radius + .15)) return;
    if (z < 5.4 || z > depth - 5.1) return;
    trees.push({ kind: "lime", x, z, rx: radius, rz: radius, radius, trunkRadius: .10, height: 3.8, border });
  }

  const dimensions = {
    fountain: [2.45, 2.2], pavilion: [2.35, 4.25], roses: [2.45, .65],
    parterre: [3.1, .65], pergola: [2.8, 3.5], hedge: [.84, 1.25], lime: [1.15, 3.8]
  };
  for (const feature of rundalePlan.features) {
    if (fragment.roads && !fragment.numbers.includes(feature.number)) continue;
    if (!inFragment([[feature.x, feature.z]])) continue;
    if (!visible(feature.x, feature.z)) continue;
    const [x, z] = project([feature.x, feature.z]);
    const scale = ["pavilion", "pergola"].includes(feature.kind) ? 1 : feature.scale;
    const [r, h] = dimensions[feature.kind], radius = r * scale, objectHeight = h * scale;
    // The thin fountain jet does not have the basin's full collision radius.
    const clearanceHeight = feature.kind === "fountain" ? .4 : objectHeight;
    if (x < radius || x > worldWidth - radius || z < objectHeight * 36 / 43 + radius || z > depth - radius - 1.5 ||
      !free(x, z, radius, clearanceHeight) || occupied(x, z, radius)) continue;
    features.push({ ...feature, x, z, radius, rx: radius, rz: radius, height: objectHeight, clearanceHeight, scale });
  }

  for (const outline of rundalePlan.hedges) {
    if (fragment.roads && !fragment.numbers.includes(outline.number)) continue;
    if (!inFragment(outline.pts)) continue;
    for (const points of projectLines(outline.pts)) {
      for (let i = 1; i < points.length; i++) hedgeLine(...points[i - 1], ...points[i], outline.perimeter ? "bosquet" : "ornament", outline.scale || 1);
    }
  }
  // Circular walks keep the same clear width as straight alleys. Their
  // original 3D hedges follow the walk edges instead of narrowing the ring.
  for (const road of roads.filter(road => road.bordered)) {
    for (let d = 0; d < road.length; d += .5) for (const side of [-1, 1]) {
      const p = road.at(d), offset = (roadWidth / 2 + 1.05) * side;
      hedge(p.x - Math.sin(p.angle) * offset, p.z + Math.cos(p.angle) * offset, "ornament");
    }
  }

  // Regular lime rows lie between the avenue and its continuous bosquet hedge.
  // Rows share one spacing and phase; all junctions use the complete network.
  const avenues = roads.filter(road => road.avenue && (index !== 0 || road !== path));
  function rowPoint(road, distance, side) {
    const p = road.at(distance), nx = -Math.sin(p.angle) * side, nz = Math.cos(p.angle) * side;
    const offset = (road === path ? 4.65 : road.width / 2 + 1.7) + Math.max(0, nz) * 2.7;
    return [p.x + nx * offset, p.z + nz * offset];
  }
  for (const road of avenues) {
    for (let d = 2.4; d < road.length; d += 4.8) for (const side of [-1, 1]) tree(...rowPoint(road, d, side), "avenue");
  }
  // The canal's far bank has the two straight rows seen on the museum plan.
  for (const row of rundalePlan.woodlandRows) {
    if (row < north || row > south) continue;
    const z = project([50, row])[1];
    for (let x = 2.4; x < worldWidth; x += 4.8) tree(x, z, "woodland");
  }
  hedgeLine(-.5, 1.65, worldWidth + .5, 1.65, "top");
  hedgeLine(-.5, depth - 1.3, worldWidth + .5, depth - 1.3, "bottom");
  garden.obstacles = [...hedges, ...trees, ...features];
  return garden;
}

