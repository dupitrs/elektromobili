import assert from 'node:assert/strict';
import { yearsGardenJoin, yearsJoinPlacement, yearsView, yearsBackgroundPlacement } from '../assets/js/years-layout.js';
import { gardenRoutes, yearsJoinAvenues, yearsRoadWidth } from '../assets/js/years-routes.js';
import { makeGardenBand, gardenProjection as K } from '../assets/js/journey-formal-garden.js';
import { readFileSync } from 'node:fs';

const frames = JSON.parse(readFileSync(new URL('../assets/img/years/frames.json', import.meta.url)));
let checked = 0;
for (const [width, stageHeight] of [[320,498],[390,774],[390,1130],[320,1530],[768,944],[1440,820],[1920,1000],[1920,460]]) {
  const view = yearsView(width, stageHeight), unit = Math.max(8, Math.min(16, width/96));
  const backdrop = yearsBackgroundPlacement(width, stageHeight, frames);
  for (const edge of ['top', 'bottom']) {
    const join = yearsGardenJoin(width, stageHeight, edge), atTop = edge === 'top';
    const entryX = atTop ? view.laneX : width/2, exitX = atTop ? width-24 : view.laneX;
    const height = Math.max((atTop ? 58 : 50)*K*unit, 16*K*unit + join.apron + join.roadHeight + 1.875*Math.abs(exitX-entryX)/2.8);
    const placement = yearsJoinPlacement(height, join);
    const label = `${width} × ${stageHeight}, ${edge}`;
    assert(join.apron > 0, `${label}: apron outside viewport`);
    assert((atTop ? yearsJoinAvenues.south : yearsJoinAvenues.north).includes(join.worldZ));
    assert(gardenRoutes().roads.some(r=>r.pts.every(p=>p[1]===join.worldZ)), `${label}: join is a baked avenue`);
    assert.equal(join.roadHeight, yearsRoadWidth*K*view.scale);
    const sourceY = stageHeight/2+(join.worldZ-view.centerZ)*K*view.scale;
    assert(Math.abs(placement.junctionY-placement.imageY-sourceY)<.000001, `${label}: source avenue alignment`);
    const seam = atTop ? 0 : height;
    assert.equal(seam-placement.imageY, atTop ? stageHeight : 0, `${label}: consecutive image slices`);
    assert.equal(placement.imageBottom-placement.imageTop+placement.gardenBottom-placement.gardenTop,height);
    assert.equal(placement.imageTop, atTop ? 0 : placement.junctionY);
    assert.equal(placement.imageBottom, atTop ? placement.junctionY : height);
    assert(placement.imageTop >= backdrop.y+placement.imageY, `${label}: image covers north edge`);
    assert(placement.imageBottom <= backdrop.y+placement.imageY+backdrop.height, `${label}: image covers south edge`);
    const plan = makeGardenBand({index:atTop?4:3,width,height,unit,entryX,exitX,yearsJoin:join});
    const cross = plan.roads.find(r=>r.pts.every(p=>Math.abs(p[1]*K*unit-placement.junctionY)<.000001));
    assert(cross, `${label}: geometry and paint share the junction`);
    assert(Math.abs(cross.width*K*unit-join.roadHeight)<.000001, `${label}: same gravel width`);
    checked++;
  }
}
console.log(`Checked ${checked} map joins: real avenues, shared geometry, matching source pixels and no uncovered image edges.`);
