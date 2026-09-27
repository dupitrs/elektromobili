/* Metres in the X/Z plane. Roads and vehicles use these same sampled paths. */
export function route(points, radius = 2.4) {
  const pts = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    if (radius === 0) { pts.push(points[i]); continue; }
    const a = points[i - 1], b = points[i], c = points[i + 1];
    const ab = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const bc = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const r = Math.min(radius, ab / 3, bc / 3);
    const start = [b[0] + (a[0] - b[0]) * r / ab, b[1] + (a[1] - b[1]) * r / ab];
    const end = [b[0] + (c[0] - b[0]) * r / bc, b[1] + (c[1] - b[1]) * r / bc];
    pts.push(start);
    for (let j = 1; j <= 24; j++) {
      const t = j / 24, u = 1 - t;
      pts.push([u * u * start[0] + 2 * u * t * b[0] + t * t * end[0],
        u * u * start[1] + 2 * u * t * b[1] + t * t * end[1]]);
    }
  }
  pts.push(points[points.length - 1]);
  const lengths = [0];
  for (let i = 1; i < pts.length; i++) lengths.push(lengths[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return {
    pts, length: lengths[lengths.length - 1],
    at(distance) {
      let i = 1;
      while (i < pts.length - 1 && lengths[i] < distance) i++;
      const a = pts[i - 1], b = pts[i];
      const t = (distance - lengths[i - 1]) / (lengths[i] - lengths[i - 1]);
      return { x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t,
        angle: Math.atan2(b[1] - a[1], b[0] - a[0]) };
    }
  };
}

// Real transverse avenues outside the digit formation. Responsive crops join
// the next complete avenue, where no trees or hedges cross the gravel.
export const yearsJoinAvenues = {
  north: [-30, -52, -82, -112],
  south: [36, 56, 84, 112]
};
export const yearsRoadWidth = 3.12;

export function gardenRoutes() {
  // Extend every entrance along its existing heading beyond the map. These
  // same paths paint the full road and reserve clearance in the planting.
  const stem = route([[-6, 160], [-6, -8]]);
  const flag = route([[-110, -8 + 103.8 * 26 / 25.8], [-6.2, -8]]);
  const base = route([[-110, 9], [-1, 9]]);
  const seven = route([[12 + 126 * 12.55 / 20, 160], [-.55, 14], [11, -8], [.7, -8]], 2.7);
  // Reach the centre of the 7's diagonal, not merely the edge of its gravel.
  const baseJunction = -.55 + (14 - 9) * (11 + .55) / (14 + 8);
  const roads = [stem, flag, seven,
    route([[-110, -14], [110, -14]]),
    route([[-25, -160], [-25, 18], [110, 18]], 2),
    route([[25, -160], [25, 160]], 2),
    // Connect the 7's top bar to the 1, then continue the 1 north to the
    // transverse avenue. The closer digits share one continuous junction.
    route([[.7, -8], [-6, -8]]),
    route([[-6, -8], [-6, -14]]), route([[-110, 9], [baseJunction, 9]]),
    ...[...yearsJoinAvenues.north, ...yearsJoinAvenues.south].map(z => route([[-110, z], [110, z]], 0))];
  const fleet = [
    // Four equally spaced cars give the 1 a continuous, balanced upright.
    { path: stem, end: stem.length - .4, trailers: 0, delay: 0.25, arrival: 7.8 },
    { path: stem, end: stem.length - 5, trailers: 0, delay: 0.85, arrival: 7.8 },
    { path: stem, end: stem.length - 9.6, trailers: 0, delay: 1.45, arrival: 7.8 },
    { path: stem, end: stem.length - 14.2, trailers: 0, delay: 2.05, arrival: 7.8 },
    { path: flag, end: flag.length - 3, trailers: 0, delay: 0.7 },
    // A short serif makes the 1 unmistakable, even at thumbnail size.
    { path: base, end: base.length - 3.1, trailers: 1, delay: 4.8 },
    { path: seven, end: seven.length - 1.85, trailers: 1, delay: 0 },
    { path: seven, end: seven.length - 9.6, trailers: 1, delay: 1.2 },
    { path: seven, end: seven.length - 18, trailers: 1, delay: 2.4 },
    // A solo car completes the 7 at the same baseline as the 1.
    { path: seven, end: seven.length - 26.2, trailers: 0, delay: 3.2 }
  ];
  return { roads, fleet };
}

export function roadDistance(x, z, roads) {
  let nearest = Infinity;
  for (const path of roads) {
    for (let i = 1; i < path.pts.length; i++) {
      const a = path.pts[i - 1], b = path.pts[i];
      const dx = b[0] - a[0], dz = b[1] - a[1];
      const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz)));
      nearest = Math.min(nearest, Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz));
    }
  }
  return nearest;
}

/* One contour at a constant distance from the whole road network. Taking
   the network together prevents offset rows folding over inside corners. */
export function hedgeContours(roads, offset, width, depth, step = .4, distance = (x, z) => roadDistance(x, z, roads)) {
  const nx = Math.round(width / step), nz = Math.round(depth / step);
  const grid = [], vertices = new Map(), links = new Map();
  for (let z = 0; z <= nz; z++) for (let x = 0; x <= nx; x++) {
    const px = x * width / nx - width / 2, pz = z * depth / nz - depth / 2;
    grid.push({ x: px, z: pz, value: distance(px, pz) - offset });
  }
  function crossing(a, b) {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (!vertices.has(key)) {
      const p = grid[a], q = grid[b];
      let lo = 0, hi = 1;
      for (let i = 0; i < 10; i++) {
        const mid = (lo + hi) / 2;
        const value = distance(p.x + (q.x - p.x) * mid, p.z + (q.z - p.z) * mid) - offset;
        if ((value < 0) === (p.value < 0)) lo = mid; else hi = mid;
      }
      const t = (lo + hi) / 2;
      vertices.set(key, [p.x + (q.x - p.x) * t, p.z + (q.z - p.z) * t]);
    }
    return key;
  }
  function triangle(a, b, c) {
    const cuts = [];
    for (const [u, v] of [[a, b], [b, c], [c, a]]) {
      if ((grid[u].value < 0) !== (grid[v].value < 0)) cuts.push(crossing(u, v));
    }
    if (cuts.length !== 2) return;
    for (let i = 0; i < 2; i++) {
      if (!links.has(cuts[i])) links.set(cuts[i], []);
      links.get(cuts[i]).push(cuts[1 - i]);
    }
  }
  for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) {
    const a = z * (nx + 1) + x, b = a + 1, c = a + nx + 1, d = c + 1;
    triangle(a, b, d); triangle(a, d, c);
  }
  const visited = new Set(), contours = [];
  // Start open contours at the map boundary; closed contours follow after.
  const starts = [...links.keys()].sort((a, b) => links.get(a).length - links.get(b).length);
  for (const start of starts) {
    if (visited.has(start)) continue;
    const points = []; let current = start, previous;
    while (current && !visited.has(current)) {
      points.push(vertices.get(current)); visited.add(current);
      const next = links.get(current).find(key => key !== previous);
      previous = current; current = next;
    }
    if (current === start) points.push(vertices.get(start));
    if (points.length > 1) {
      const clean = [points[0]];
      const normal = ([x, z]) => [
        (distance(x + .001, z) - distance(x - .001, z)) / .002,
        (distance(x, z + .001) - distance(x, z - .001)) / .002
      ];
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1], b = points[i];
        // Recover the exact meeting point of straight borders instead of
        // leaving a diagonal shortcut across the corner of a grid cell.
        if (Math.abs(distance((a[0] + b[0]) / 2, (a[1] + b[1]) / 2) - offset) > .02) {
          const na = normal(a), nb = normal(b), det = na[0] * nb[1] - na[1] * nb[0];
          if (Math.abs(det) > .01) {
            const ca = na[0] * a[0] + na[1] * a[1], cb = nb[0] * b[0] + nb[1] * b[1];
            const x = (ca * nb[1] - na[1] * cb) / det, z = (na[0] * cb - ca * nb[0]) / det;
            if (Math.hypot(x - a[0], z - a[1]) < step * 2 && Math.abs(distance(x, z) - offset) < .005) clean.push([x, z]);
          }
        }
        clean.push(b);
      }
      contours.push(clean);
    }
  }
  return contours;
}
