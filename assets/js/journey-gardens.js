import { route } from "./years-routes.js?v=20260927-mobile-2";
export { makeGardenBand, gardenProjection } from "./journey-formal-garden.js?v=20260927-mobile-2";

// Every approach enters from the north. Adjacent tiles share a straight avenue.
export const gardens = [
  { shape: "rectangle", entry: -6, approach: [[0,-52],[0,-42],[-6,-34],[-6,-18]], exit: [[0,28],[10,32],[10,36],[0,40],[0,52]] },
  { shape: "diamond", entry: 4, approach: [[0,-52],[0,-42],[10,-34],[4,-26],[4,-18]], exit: [[0,26],[-10,30],[-10,36],[0,40],[0,52]] },
  { shape: "octagon", entry: 0, approach: [[0,-52],[0,-42],[-10,-36],[-10,-30],[0,-26],[0,-18]], exit: [[0,26],[8,32],[0,40],[0,52]] },
  { shape: "avenue", entry: 8, approach: [[0,-52],[0,-42],[8,-36],[8,-18]], exit: [[0,26],[-8,32],[0,40],[0,52]] },
  { shape: "circle", entry: -5, approach: [[0,-52],[0,-42],[-12,-34],[-5,-26],[-5,-18]], exit: [[0,26],[12,30],[8,34],[0,40],[0,52]] },
  { shape: "labyrinth", entry: 6, approach: [[0,-52],[0,-42],[-8,-36],[-8,-30],[6,-26],[6,-18]], exit: [[0,26],[-12,30],[-12,34],[0,40],[0,52]] },
  { shape: "crescent", entry: -2, approach: [[0,-52],[0,-42],[10,-36],[10,-30],[-2,-26],[-2,-18]], exit: [[0,26],[14,30],[14,34],[0,40],[0,52]] }
];

export function gardenDimensions(tall) {
  const depth = tall ? 3.5 : 1;
  return { depth, spacing: 104 * depth, worldWidth: 112, clearingWidth: 26, clearingDepth: 26 * depth };
}

export function gardenRoute(index, tall) {
  const garden = gardens[index], { depth } = gardenDimensions(tall);
  const points = [...garden.approach, [garden.entry,0], [0,4], [0,14], ...garden.exit].map(([x,z]) => [x,z*depth]);
  const path = route(points, 3);
  function nearest(target) {
    let distance = 0, best = Infinity, result = 0;
    path.pts.forEach((p,i) => {
      if (i) distance += Math.hypot(p[0]-path.pts[i-1][0],p[1]-path.pts[i-1][1]);
      const d = Math.hypot(p[0]-target[0],p[1]-target[1]*depth);
      if (d < best) { best=d; result=distance; }
    });
    return result;
  }
  return { ...path, gate: nearest(garden.approach.at(-1)), depart: nearest([0,14]) };
}

// Matching side avenues connect the tiles. Planting follows every road.
export function gardenRoads(index, tall) {
  const { depth } = gardenDimensions(tall);
  const line = points => route(points.map(([x,z]) => [x,z*depth]), 2);
  return [gardenRoute(index,tall),
    line([[-34,-60],[-34,60]]), line([[34,-60],[34,60]]),
    line([[-64,-36],[64,-36]]), line([[-64,36],[64,36]]),
    line([[-56,0],[-34,0],[-27,-8]]), line([[56,0],[34,0],[27,8]]),
    line([[-54,-60],[-54,60]]), line([[54,-60],[54,60]])
  ];
}
