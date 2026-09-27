// Layout references: the museum's plan and its overhead photograph of the
// actual garden. The photograph supplies the rooms, courts and walk junctions.
// https://rundale.net/wp-content/uploads/2018/09/PARKS_LV_2018_low.pdf
// https://rundale.net/wp-content/uploads/2019/10/Parka-regulārā-daļa-ar-bosketiem-2019_08.jpg
// https://rundale.net/wp-content/uploads/2019/10/Parteris-2018-gads-1-1.jpg
// North/palace is z=0, south/woodland is z=100; west is x=0, east x=100.
// These are diagram coordinates, not a survey or the electric car's tour route.
// Each page transition shows a crop of this one plan, using the existing art.
export const rundaleFragments = [
  { name: "Ornamentālais parters un rožu dārzs", numbers: [1, 2], crop: [34, 0, 66, 28], avenue: "central" },
  { name: "Zilais un Ceriņu boskets", numbers: [7, 8], crop: [15, 39, 45, 62], avenue: "west-outer", westOnly: true },
  { name: "Holandes boskets un Zaļais teātris", numbers: [9, 10], crop: [58, 28, 100, 65], avenue: "east-outer" },
  { name: "Centrālā aleja un bosketu krustojums", numbers: [8, 15, 16], crop: [10, 58, 90, 76], avenue: "central",
    roads: ["central", "west-inner", "east-inner", "west-edge", "east-edge", "cross-65", "golden-through", "hydrangea-through", "lilac-pergola--1", "lilac-pergola-1"] },
  { name: "Zelta vāzes un Hortenziju boskets", numbers: [15, 16], crop: [48, 63, 78, 84], avenue: "east-inner", minDepth: 44 },
  { name: "Hortenziju un Rotaļu boskets", numbers: [16, 18], crop: [18, 63, 50, 90], avenue: "central", minDepth: 48 },
  { name: "Memoriālais un Austrumu boskets", numbers: [11, 12, 13], crop: [56, 63, 100, 88], avenue: "east-edge", minDepth: 48 },
  { name: "Kanāls un pastaigu bosketi", numbers: [20], crop: [0, 98, 100, 126], avenue: "east-outer" }
];

export const gardenRoadWidth = 4.8;
const avenue = (id, pts) => ({ id, pts, avenue: true, width: gardenRoadWidth });
const footpath = (id, pts) => ({ id, pts, width: gardenRoadWidth });
const rectangle = (x, z, w, h) => [[x - w, z - h], [x + w, z - h], [x + w, z + h], [x - w, z + h], [x - w, z - h]];
const ellipse = (x, z, rx, rz, start = 0, end = Math.PI * 2) => Array.from({ length: 49 }, (_, i) => {
  const a = start + (end - start) * i / 48;
  return [x + Math.cos(a) * rx, z + Math.sin(a) * rz];
});
const close = pts => [...pts, pts[0]];
// Coordinates read on the 2016 px wide reference image, with the three
// transverse avenues registered to the same diagram coordinates as the plan.
const photo = (x, y) => [(1965 - x) / 18.7, y >= 662 ? 65 - (y - 662) * 37 / 503 : 65 + (662 - y) * 35 / 512];
const trace = pts => pts.map(([x, y]) => photo(x, y));

// Five rays, the transverse avenues and the perimeter define the bosquets.
function ray(id, start, end) {
  const a = photo(start, 1165), b = photo(end, 150);
  return avenue(id, [a, b, [b[0] + (b[0] - a[0]) * 26 / 72, 126]]);
}
const roads = [
  avenue("central", [[50, 28], [50, 126]]),
  ray("west-outer", 1350, 1840), ray("east-outer", 710, 199),
  ray("west-inner", 1198, 1440), ray("east-inner", 860, 600),
  avenue("west-edge", [[0, 0], [0, 100]]), avenue("east-edge", [[100, 0], [100, 100]]),
  ...[28, 65, 100].map(z => avenue("cross-" + z, [[0, z], [100, z]]))
];
const hedges = [], features = [], courts = [], pools = [];
function gate(id, z) {
  const road = roads.find(road => road.id === id), a = road.pts[0], b = road.pts[1];
  return [a[0] + (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]), z];
}
function walk(id, pts) {
  const road = footpath(id, pts); roads.push(road); return road;
}
function feature(kind, number, point, scale = 1) {
  features.push({ kind, number, x: point[0], z: point[1], scale });
}
function court(number, outline, islands = [], border = true) {
  courts.push({ number, pts: outline, islands });
  if (border) hedges.push({ number, low: true, pts: outline });
  for (const pts of islands) hedges.push({ number, low: true, pts });
}
function cross(x, z, rx, rz) {
  return close([[.3,-1],[.3,-.4],[.65,-.4],[.65,-.22],[1,-.22],[1,.22],[.65,.22],[.65,.4],
    [.3,.4],[.3,1],[-.3,1],[-.3,.4],[-.65,.4],[-.65,.22],[-1,.22],[-1,-.22],
    [-.65,-.22],[-.65,-.4],[-.3,-.4],[-.3,-1]].map(([a,b]) => [x + a * rx, z + b * rz]));
}

// Actual bosquet perimeters. The openings are cut only where the recorded
// walks meet them; these do not follow an arbitrary offset around every road.
const rooms = [
  [11, [[104,177],[157,177],[395,621],[101,621]]],
  [12, [[242,177],[554,177],[647,488],[507,626],[455,626]]],
  [13, [[552,622],[685,622],[660,532]]],
  [14, [[646,176],[866,176],[884,211],[710,393]]],
  [15, [[718,428],[894,251],[943,272],[943,576],[901,622],[770,622]]],
  [16, [[1112,272],[1148,247],[1300,403],[1240,622],[1156,622],[1112,574]]],
  [14, [[1180,176],[1396,176],[1343,377],[1166,211]]],
  [17, [[1361,622],[1478,622],[1406,543],[1387,545]]],
  [18, [[1485,176],[1796,176],[1632,498],[1557,622],[1428,496]]],
  [19, [[1876,178],[1949,178],[1949,622],[1647,622]]],
  [10, [[107,710],[438,710],[673,1122],[107,1122]]],
  [9, [[541,708],[703,708],[792,1123],[738,1123]]],
  [8, [[795,708],[878,708],[909,757],[944,766],[944,1124],[910,1124]]],
  [8, [[1181,708],[1265,708],[1150,1124],[1116,1124],[1116,766],[1151,757]]],
  [7, [[1358,708],[1514,708],[1318,1123],[1271,1123]]],
  [6, [[1625,710],[1760,885],[1698,930],[1427,1124]]],
  [5, [[1678,710],[1949,710],[1949,882],[1807,882]]]
];
for (const [number, points] of rooms) hedges.push({ number, perimeter: true, pts: close(trace(points)) });

// The parterre is a continuous gravel court around four planted quarters and
// three basins, not a road ending at a fountain or a grass roundabout.
const parterreIslands = [];
const quarter = [[449,1170],[783,1170],[843,1151],[875,1110],[890,1060],[890,901],
  [845,887],[809,871],[780,839],[753,800],[733,757],[721,728],[554,728],[540,777],[506,807],[452,824]]
  .map(([x,y]) => [50 + (x - 990) / 53.5, 13.5 + (636 - y) / 44.5]);
for (const side of [-1, 1]) for (const end of [-1, 1]) {
  parterreIslands.push(close(quarter.map(([x,z]) => [50 + side * (x - 50), 13.5 + end * (z - 13.5)])));
  feature("parterre", 1, [50 + side * 6.4, 13.5 + end * 7.4], .8);
}
court(1, rectangle(50, 14, 13, 14), parterreIslands, false);
feature("fountain", 1, [50, 13.5], .8);
for (const x of [38.8, 61.2]) pools.push(close(Array.from({ length: 8 }, (_, i) => {
  const a = Math.PI / 8 + i * Math.PI / 4;
  return [x + Math.cos(a) * 1.15, 13.5 + Math.sin(a) * 1.45];
})));

// Connected rose-garden walks wrap planted compartments and open directly
// onto the parterre and the transverse avenue. There are no approach stubs.
for (const side of [-1, 1]) {
  const islands = [];
  for (const x of [5, 15.5, 26.5, 34]) for (const z of [6, 21.5]) {
    const cx = side < 0 ? x : 100 - x, rx = x === 34 ? 2.1 : 3.8;
    if (x >= 26.5) {
      // The compartments beside the parterre are crossed by diagonal walks.
      islands.push(close([[cx-rx+.5,z-4.4],[cx+rx-.5,z-4.4],[cx,z-.8]]),
        close([[cx-rx+.5,z+4.4],[cx+rx-.5,z+4.4],[cx,z+.8]]),
        close([[cx-rx,z-3.3],[cx-rx,z+3.3],[cx-.6,z]]),
        close([[cx+rx,z-3.3],[cx+rx,z+3.3],[cx+.6,z]]));
      for (const dz of [-2.9, 2.9]) feature("roses", 2, [cx, z + dz], x === 34 ? .4 : .6);
    } else {
      islands.push(rectangle(cx, z, rx, 4.4));
      feature("roses", 2, [cx, z]);
    }
  }
  court(2, rectangle(side < 0 ? 18.5 : 81.5, 14, 18.5, 14), islands, false);
}

// A diagonal through-walk connects each inner southern salon to the avenues.
// Golden Vase has a broad notched forecourt; Hydrangea has four planted fans.
const gold = photo(844, 513), hydrangea = photo(1200, 500);
const goldCourt = close(trace([[767,530],[797,496],[779,477],[815,445],[835,464],[865,434],
  [886,446],[878,461],[915,481],[901,503],[924,529],[903,551],[883,543],[850,580],[825,567],[807,588],[771,557]]));
court(15, goldCourt);
feature("pavilion", 15, gold);
walk("golden-through", [gate("east-inner", 82.2), photo(742,434), gold, photo(911,586), gate("central", 65)]);
feature("pergola", 15, photo(777,461), .65);
const hydraOutline = close(trace([[1147,440],[1164,422],[1180,436],[1200,417],[1220,434],
  [1238,427],[1259,448],[1247,466],[1264,493],[1248,511],[1261,532],[1240,554],
  [1223,543],[1200,563],[1183,548],[1165,562],[1146,542],[1156,522],[1133,498],[1144,479],[1129,461]]));
const fans = [];
for (let q = 0; q < 4; q++) {
  const start = q * Math.PI / 2 - Math.PI / 4 + .2, end = (q + 1) * Math.PI / 2 - Math.PI / 4 - .2;
  const outer = ellipse(...hydrangea, 2.9, 4, start, end);
  const inner = ellipse(...hydrangea, 1.05, 1.45, end, start);
  fans.push(close([...outer, ...inner]));
}
court(16, hydraOutline, fans);
walk("hydrangea-through", [gate("central", 65), photo(1113,588), hydrangea, photo(1298,403), gate("west-inner", 82.2)]);
for (const [number, centre, side] of [[15, photo(901, 308), 1], [16, photo(1149, 302), -1]]) {
  court(number, cross(...centre, 2.2, 4));
  walk("inner-cross-" + number, [[50, centre[1]], [centre[0], centre[1]]]);
  walk("flowering-diagonal-" + number, [gate(side < 0 ? "west-inner" : "east-inner", 83), gate("central", 100)]);
}

// Blue: a planted round centre and a surrounding circular walk. Dutch: four
// quarter beds in its circular salon. Both link to the transverse pergola walk.
for (const [number, centre, outer, inner] of [
  [7, photo(1385, 808), "west-outer", "west-inner"],
  [9, photo(671, 814), "east-outer", "east-inner"]
]) {
  const [x, z] = centre, islands = [];
  if (number === 7) islands.push(ellipse(x, z, 1.8, 3.2));
  else for (let q = 0; q < 4; q++) {
    const a = q * Math.PI / 2 + .18, b = (q + 1) * Math.PI / 2 - .18;
    islands.push(close([[x + Math.cos((a+b)/2) * .45, z + Math.sin((a+b)/2) * .7], ...ellipse(x, z, 1.8, 3.2, a, b)]));
  }
  court(number, ellipse(x, z, 2.8, 4.7), islands);
  walk("salon-ring-" + number, ellipse(x, z, 2.3, 3.95)).bordered = true;
  walk("pergola-cross-" + number, [gate(outer, 41.4), gate(inner, 41.4)]);
  const connection = [(gate(outer, 41.4)[0] + gate(inner, 41.4)[0]) / 2, 41.4];
  walk("circular-salon-" + number, [connection, [x, z - 4.7]]);
  feature("pergola", number, connection, .75);
  if (number === 7) for (const side of [-1, 1]) feature("pergola", number, [x + side * 2.5, z], .5);
}

// The paired lilac rooms have two small, shaped courts and a diagonal pergola
// connection between their avenue gates, visible in the overhead photograph.
for (const side of [-1, 1]) {
  const inner = side < 0 ? "west-inner" : "east-inner";
  const centre = [50 + side * 6.3, 47.5];
  court(8, cross(...centre, 2.3, 4.2));
  walk("lilac-south-" + side, [gate(inner, 41), [centre[0], 41], centre]);
  const upper = [50 + side * 7.5, 57.1];
  court(8, cross(...upper, 2.6, 2.8));
  walk("lilac-pergola-" + side, [gate(inner, 53.2), upper, gate("central", 61.5)]);
  feature("pergola", 8, upper, .7);
}

// Memorial and Play: upper cross courts, a transverse pergola and an offset
// walk into the lower cross court. The change of direction is in the real plan.
for (const [number, top, bottom, outer, inner] of [
  [12, photo(428, 235), photo(522, 506), "east-outer", "east-inner"],
  [18, photo(1623, 234), photo(1544, 508), "west-outer", "west-inner"]
]) {
  court(number, cross(...top, number === 18 ? 6.2 : 4, 3.1));
  court(number, cross(...bottom, 4.9, 2.7));
  walk("upper-court-" + number, [[top[0], 100], top]);
  walk("southern-pergola-" + number, [gate(outer, 86.3), gate(inner, 86.3)]);
  walk("offset-walk-" + number, [top, [top[0], 83.4], [bottom[0], 83.4], bottom]);
  walk("lower-court-" + number, [gate(outer, bottom[1]), bottom, gate(inner, bottom[1])]);
  feature("pergola", number, [top[0], 86.3], .8);
}

// The small southern triangles contain a forecourt at the pavilion/spring.
const eastPavilion = photo(634, 583), spring = photo(1409, 550);
court(13, rectangle(...eastPavilion, 2.1, 2.4));
feature("pavilion", 13, eastPavilion, .85);
walk("east-pavilion-court", [gate("east-inner", eastPavilion[1]), eastPavilion, [eastPavilion[0], 65]]);
court(17, cross(...spring, 1.15, 1.3));
feature("pergola", 17, spring, .6);
walk("spring-court", [[spring[0] - 3, 65], spring, gate("west-outer", spring[1])]);

// The theatre's two pavilions stand on the ends of the stage terrace, enclosed
// by the stepped amphitheatre and connected to the surrounding perimeter walk.
const theatre = photo(253, 918);
const theatreCourt = close(trace([[155,789],[187,780],[218,805],[235,842],[265,857],
  [300,894],[313,936],[354,939],[380,975],[362,1004],[331,1001],[310,964],
  [283,957],[269,914],[244,891],[215,879],[202,839],[176,836],[155,815]]));
court(10, theatreCourt);
for (const [x,y] of [[195,850],[339,980]]) feature("pavilion", 10, photo(x,y), .8);
for (const radius of [3, 4.2, 5.4, 6.6]) hedges.push({ number: 10, scale: .8,
  pts: ellipse(...theatre, radius, radius * 1.37, -Math.PI * .65, Math.PI * .23) });
walk("theatre-stage", [[100, 52], photo(163,792), photo(195,850), photo(339,980), gate("east-outer", 40.6)]);
walk("theatre-perimeter", close(trace([[145,756],[386,756],[471,991],[361,1085],[143,1085]])));
walk("theatre-north", [gate("east-outer", 61), photo(386,756)]);
walk("theatre-south", [[93,28], photo(226,1085)]);

// Picnic pavilion opens onto the gardener's-house forecourt at the west edge.
const picnic = photo(1925,864);
court(5, close(trace([[1766,897],[1957,897],[1957,829],[1887,829],[1887,871],[1802,871]])));
feature("pavilion", 5, picnic, .8);
walk("gardener-cross", [gate("west-outer", 40.6), [0, 40.6]]);
walk("picnic-court", [[0,picnic[1]], picnic, [picnic[0],40.6]]);

// Low planting fills the centre of the Blue bosquet; the surrounding ring is
// kept completely walkable rather than running a path into a flower bed.
const blueCentre = photo(1385,808);
for (const dz of [-1.1,0,1.1]) for (const dx of [-.8,0,.8]) {
  feature("hedge", 7, [blueCentre[0] + dx, blueCentre[1] + dz], .7);
}

// Ornamental trees recorded inside the lily collection; the regular avenue
// limes are still placed separately in rows outside the bosquet hedges.
for (const point of [[139,242],[178,343],[223,437],[151,484],[314,544]]) {
  feature("lime", 11, photo(...point), .8);
}

// The labyrinth retains the photograph's circular circuits and bent entrance.
const maze = { x: 6.4, z: 81, rx: 3.4, rz: 4.65 };
for (let ring = 0; ring < 5; ring++) {
  const rx = maze.rx - ring * .63, rz = rx * maze.rz / maze.rx;
  for (let quarter = 0; quarter < 4; quarter++) {
    const start = quarter * Math.PI / 2 + .11, end = (quarter + 1) * Math.PI / 2 - .11;
    hedges.push({ number: 19, scale: .25, pts: ellipse(maze.x, maze.z, rx, rz, start, end) });
    if (ring < 4 && quarter % 2 === ring % 2) {
      const a = end;
      hedges.push({ number: 19, scale: .25, pts: [
        [maze.x + Math.cos(a) * rx, maze.z + Math.sin(a) * rz],
        [maze.x + Math.cos(a) * (rx - .63), maze.z + Math.sin(a) * (rx - .63) * maze.rz / maze.rx]
      ] });
    }
  }
}
walk("labyrinth-entrance", [[11.2,65],[11.2,71],[maze.x,74],[maze.x,maze.z-maze.rz]]);

export const rundalePlan = {
  roads, hedges, features, courts, pools,
  // The central junction is an open gravel salon, with no fountain.
  clearings: [{ x: 50, z: 65, rx: 6.2, rz: 5.3 }],
  beds: [{ x: maze.x, z: maze.z, pts: ellipse(maze.x, maze.z, maze.rx + .35, maze.rz + .45) }],
  canal: [[-5, 103.5], [105, 103.5]],
  woodlandRows: [109, 115]
};
