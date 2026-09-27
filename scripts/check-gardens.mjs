import assert from 'node:assert/strict';
import { makeGardenBand, gardenProjection as K } from '../assets/js/journey-formal-garden.js';
import { roadDistance } from '../assets/js/years-routes.js';
import { yearsView, yearsGardenJoin } from '../assets/js/years-layout.js';

let checked = 0;
for (const width of [320, 390, 768, 1440, 1920]) {
  const unit = Math.max(8, Math.min(16, width / 96)), view = yearsView(width, 820);
  const lane = width < 768 ? 12 : Math.max(12, (width - 1280) / 4);
  const gates = [width / 2, width < 768 ? lane : width * .41, lane, width / 2,
    view.laneX, width - lane, width - lane - unit, width - lane, width / 2];
  for (let index = 0; index < 8; index++) {
    const yearsJoin = [3, 4].includes(index) ? yearsGardenJoin(width, 820, index === 3 ? 'bottom' : 'top') : null;
    const base = [46, 48, 48, 50, 58, 48, 48, 48][index];
    const height = Math.max(base * K * unit, 16 * K * unit +
      (yearsJoin ? yearsJoin.apron + yearsJoin.roadHeight : 0) + 1.875 * Math.abs(gates[index+1]-gates[index]) / 2.8);
    const plan = makeGardenBand({index,width,height,unit,entryX:gates[index],exitX:gates[index+1],yearsJoin});
    const label = `${width}px, garden ${index}`;
    const lightweight = makeGardenBand({index,width,height,unit,entryX:gates[index],exitX:gates[index+1],yearsJoin,pathOnly:true});
    assert.deepEqual(lightweight.path.pts, plan.path.pts, `${label}: deferred scenery preserves the driving path`);
    assert(Math.abs(plan.path.pts[0][0] * unit - gates[index]) < .001, `${label}: entrance`);
    assert(Math.abs(plan.path.pts.at(-1)[0] * unit - gates[index+1]) < .001, `${label}: exit`);
    assert.equal(plan.path.pts[0][1], 0);
    assert.equal(plan.path.pts.at(-1)[1], plan.depth);
    if (index === 0) {
      const fountains = plan.features.filter(p => p.kind === 'fountain');
      assert.equal(fountains.length, 2, `${label}: exactly two side fountains`);
      assert.equal(fountains[0].z, fountains[1].z, `${label}: fountains share a cross avenue`);
      assert(fountains[0].x < plan.worldWidth / 2 && fountains[1].x > plan.worldWidth / 2,
        `${label}: no central fountain`);
      for (const [x,z] of plan.path.pts.filter(p => p[1] <= fountains[0].z + 1)) {
        assert(Math.abs(x - plan.worldWidth / 2) < .001, `${label}: straight central entrance at ${z}`);
      }
      for (const fountain of fountains) {
        assert(fountain.x - fountain.radius > 0 && fountain.x + fountain.radius < plan.worldWidth,
          `${label}: complete fountains within viewport`);
        assert(roadDistance(fountain.x, fountain.z, plan.roads) > fountain.radius + plan.roadWidth / 2,
          `${label}: fountain basin outside every road`);
      }
    }
    for (let i=1;i<plan.path.pts.length;i++) assert(plan.path.pts[i][1] > plan.path.pts[i-1][1], `${label}: reversible route`);
    for (const objects of [plan.hedges,plan.trees,plan.features]) for (const p of objects) {
      assert(Number.isFinite(p.x) && Number.isFinite(p.z), `${label}: finite position`);
      assert(objects.some(q => q.kind === p.kind && Math.abs(q.x - (plan.worldWidth-p.x)) < .001 && Math.abs(q.z-p.z) < .001), `${label}: unpaired ${p.kind} at ${p.x},${p.z}`);
      // Check the visible plant footprint, including projected height above ground.
      const h = p.kind === 'fountain' ? .4 : p.height;
      for (let j=0;j<=4;j++) assert(roadDistance(p.x,p.z-h*36/43*j/4,[plan.path]) >= plan.roadWidth/2+p.radius-.05,
        `${label}: ${p.kind} overlaps driving avenue at ${p.x},${p.z}`);
    }
    for (const p of plan.trees) assert(!plan.hedges.some(q => Math.hypot(p.x-q.x,p.z-q.z) < p.radius+q.radius+.1), `${label}: tree overlaps hedge`);
    for (const p of plan.hedges) assert(plan.hedges.some(q => q !== p && Math.hypot(p.x-q.x,p.z-q.z) < 1.5), `${label}: isolated hedge fragment`);
    assert(plan.hedges.length > 30, `${label}: missing borders`);
    checked++;
  }
}
console.log(`Checked ${checked} garden layouts: paired planting, open driving routes, continuous endpoints and tree clearance.`);
