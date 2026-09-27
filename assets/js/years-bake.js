/* Source for the pre-rendered garden and vehicle views. Run scripts/bake-years.cjs. */
import * as T from "./vendor/three.module.js";
import { materials as m, mesh, box, rod, bake, vehicleModel } from "./years-models.js";
import { gardenRoutes, roadDistance, hedgeContours, yearsJoinAvenues, yearsRoadWidth } from "./years-routes.js";

const MAP_W = 160, MAP_D = 260;
const joinAvenues = [...yearsJoinAvenues.north, ...yearsJoinAvenues.south];
let seed = 17;
function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }

function groundTexture(roads) {
  const canvas = document.createElement("canvas"); canvas.width = 1638; canvas.height = 3328;
  const c = canvas.getContext("2d"), sx = canvas.width / MAP_W, sz = canvas.height / MAP_D;
  // Match the grass, mowing stripes and gravel in journey-garden-renderer.js.
  c.fillStyle = "#bbc9a3"; c.fillRect(0, 0, canvas.width, canvas.height);
  for (let x = 0; x < canvas.width; x += 12 * sx) {
    c.fillStyle = "rgba(244,243,202,.07)"; c.fillRect(x, 0, 6 * sx, canvas.height);
  }
  function paths(width, color) {
    c.save(); c.scale(sx, sz); c.translate(MAP_W / 2, MAP_D / 2);
    c.lineWidth = width; c.strokeStyle = color; c.lineCap = "round"; c.lineJoin = "round";
    for (const road of roads) {
      c.beginPath(); road.pts.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.stroke();
    }
    c.restore();
  }
  paths(yearsRoadWidth, "#e9e2cd");
  for (let i = 0; i < 24000; i++) {
    c.fillStyle = i % 2 ? "rgba(54,52,31,.018)" : "rgba(255,252,222,.025)";
    c.fillRect(random() * canvas.width, random() * canvas.height, 1 + random() * 2, 1);
  }
  const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace;
  texture.anisotropy = 4; return texture;
}

export function hedgeTexture() {
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = 128;
  const c = canvas.getContext("2d"); c.fillStyle = "#82916b"; c.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 3200; i++) {
    c.fillStyle = i % 3 ? "rgba(34,53,17,.14)" : "rgba(211,217,160,.26)";
    c.beginPath(); c.ellipse(random() * 128, random() * 128, 1.5, 2.7, random() * 6, 0, Math.PI * 2); c.fill();
  }
  const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace;
  texture.wrapS = texture.wrapT = T.RepeatWrapping; return texture;
}

/* Leafy bosquets and clipped lime avenues. Both margins of every existing
   road are planted; junctions retain the complete vehicle clearance. */
async function landscaping(roads, contours, yieldSetup) {
  const group = new T.Group();
  const hedgeMap = hedgeTexture();
  const foliage = new T.MeshStandardMaterial({ color: 0x718d48, map: hedgeMap,
    bumpMap: hedgeMap, bumpScale: .055, roughness: 1 });
  const marble = new T.MeshStandardMaterial({ color: 0xded8c5, roughness: .96 });
  const copper = new T.MeshStandardMaterial({ color: 0x548778, roughness: .65, metalness: .15 });
  const coreGeometry = new T.SphereGeometry(1, 9, 6);
  const positions = coreGeometry.getAttribute("position");
  // Uneven, softly clipped volumes, with no flat box walls or spherical seams.
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
    const noise = 1 + .055 * Math.sin(x * 19 + y * 11) * Math.cos(z * 17 - y * 13);
    positions.setXYZ(i, Math.sign(x) * Math.pow(Math.abs(x), .83) * noise,
      Math.sign(y) * Math.pow(Math.abs(y), .86) * noise,
      Math.sign(z) * Math.pow(Math.abs(z), .83) * noise);
  }
  coreGeometry.computeVertexNormals();

  const leafCanvas = document.createElement("canvas"); leafCanvas.width = leafCanvas.height = 128;
  const lc = leafCanvas.getContext("2d");
  // Heart-shaped lime leaves with a central vein, used as small 3D leaf sprays.
  for (const [x, y, angle, size, color] of [[64,72,-.3,43,"#7c9b4b"],[30,65,-1,29,"#587c37"],[89,48,.8,31,"#97ad60"]]) {
    lc.save(); lc.translate(x,y); lc.rotate(angle); lc.scale(size/40,size/40);
    lc.beginPath(); lc.moveTo(0,31); lc.bezierCurveTo(-10,15,-35,4,-25,-17);
    lc.bezierCurveTo(-19,-29,-4,-26,0,-14); lc.bezierCurveTo(10,-31,35,-19,26,-3);
    lc.bezierCurveTo(22,14,6,23,0,31); lc.fillStyle=color; lc.fill();
    lc.strokeStyle="rgba(214,223,147,.5)"; lc.lineWidth=1; lc.beginPath();lc.moveTo(0,29);lc.lineTo(0,-15);
    for(let k=0;k<4;k++){lc.moveTo(0,19-k*8);lc.lineTo(-15,8-k*7);lc.moveTo(0,19-k*8);lc.lineTo(17,8-k*7);}lc.stroke();lc.restore();
  }
  const leafMap = new T.CanvasTexture(leafCanvas); leafMap.colorSpace = T.SRGBColorSpace;
  const leafMaterial = new T.MeshStandardMaterial({ map: leafMap, color: 0xe1e6c9,
    alphaTest: .4, side: T.DoubleSide, roughness: 1 });
  const cores = [], leaves = [], foliageBounds = [], treePositions = [];
  const roadPlanting = roads.map(() => ({ trees: [0, 0] }));
  const coreCenters = [];
  const pavilionCenter = { x: 13.6, z: 8.9 };
  function clear(x, z, rx, rz, margin = 1.82, angle = 0) {
    const cs = Math.cos(angle), sn = Math.sin(angle);
    for(let ix=-1;ix<=1;ix++)for(let iz=-1;iz<=1;iz++) {
      const px = x + ix * rx * cs + iz * rz * sn;
      const pz = z - ix * rx * sn + iz * rz * cs;
      if(Math.abs(px)>MAP_W/2 || Math.abs(pz)>MAP_D/2 || roadDistance(px,pz,roads)<margin)return false;
    }
    return true;
  }
  function crown(x,y,z,sx,sy,sz,angle=0,detail=12) {
    cores.push({x,y,z,sx,sy,sz,angle,shade:.78+random()*.22});
    const cs=Math.cos(angle),sn=Math.sin(angle);
    for(let i=0;i<detail;i++) {
      const az=random()*Math.PI*2, ny=random()*1.8-.8, ring=Math.sqrt(1-ny*ny);
      const dx=Math.cos(az)*ring*sx, dz=Math.sin(az)*ring*sz;
      leaves.push({x:x+dx*cs+dz*sn,y:y+ny*sy,z:z-dx*sn+dz*cs,
        size:.12+random()*.07,rx:random()*Math.PI,ry:random()*Math.PI*2,rz:random()*Math.PI*2});
    }
  }
  function treeHedgeGap(x,z,radius,hedge) {
    const dx=x-hedge.x,dz=z-hedge.z,cs=Math.cos(hedge.angle||0),sn=Math.sin(hedge.angle||0);
    const localX=dx*cs-dz*sn,localZ=dx*sn+dz*cs;
    return Math.hypot(Math.max(0,Math.abs(localX)-hedge.rx),Math.max(0,Math.abs(localZ)-hedge.rz))-radius;
  }
  function bush(x,z,height,width,angle=0,spacing=.56) {
    const rx=spacing*.95+.14, rz=width*.56+.14;
    if(!clear(x,z,rx,rz,1.82,angle))return false;
    if(Math.hypot(x-pavilionCenter.x,z-pavilionCenter.z)<2)return false;
    if(treePositions.some(p=>treeHedgeGap(p[0],p[1],p[2],{x,z,rx,rz,angle})<.2))return false;
    if(coreCenters.some(p=>Math.hypot(x-p[0],z-p[1])<.28))return false;
    const h=height*(.94+random()*.1);
    crown(x,h*.52,z,spacing*.9,h*.53,width*.53,angle,14);
    coreCenters.push([x,z]); foliageBounds.push({x,z,rx,rz,angle,kind:"hedge"});return true;
  }
  function tree(x,z,height=2.15,radius=.55,angle=0) {
    const bound=radius*1.1+.12;
    // The adjoining canvas changes at these avenues. Keep the complete
    // projected crown clear of their gravel, not just the ground footprint.
    const projectedTop = z - height * 36 / 43 - bound;
    if(joinAvenues.some(avenue => projectedTop < avenue + yearsRoadWidth / 2 + .15
      && z + bound > avenue - yearsRoadWidth / 2 - .15))return false;
    if(Math.hypot(x-pavilionCenter.x,z-pavilionCenter.z)<1.6+bound)return false;
    if(!clear(x,z,bound,bound,1.82,angle)||treePositions.some(p=>Math.hypot(x-p[0],z-p[1])<1.6))return false;
    if(foliageBounds.some(p=>p.kind==="hedge"&&treeHedgeGap(x,z,bound,p)<.2))return false;
    rod(group,[x,.02,z],[x,height-.35,z],.05,m.trunk);
    for(const a of [0,2.1,4.2])rod(group,[x,height-1,z],[x+Math.cos(a)*radius*.5,height-.5,z+Math.sin(a)*radius*.5],.024,m.trunk);
    crown(x,height-radius,z,radius*.88,radius*.9,radius*.86,random()*6,24);
    for(let i=0;i<4;i++){
      const a=i/4*Math.PI*2+random()*.25;
      crown(x+Math.cos(a)*radius*.5,height-radius+random()*.18,z+Math.sin(a)*radius*.5,
        radius*.45,radius*.53,radius*.45,a,8);
    }
    treePositions.push([x,z,bound]);foliageBounds.push({x,z,rx:bound,rz:bound,angle,kind:"lime"});return true;
  }
  function pavilion(x,z) {
    mesh(group,new T.CylinderGeometry(1.05,1.15,.16,8),marble,x,.08,z);
    for(let i=0;i<8;i++){
      const a=i/8*Math.PI*2;
      rod(group,[x+Math.cos(a)*.83,.16,z+Math.sin(a)*.83],[x+Math.cos(a)*.83,1.45,z+Math.sin(a)*.83],.035,marble);
    }
    mesh(group,new T.ConeGeometry(1.23,.58,8),copper,x,1.75,z);
    mesh(group,new T.ConeGeometry(.71,.56,8),copper,x,2.08,z);
    rod(group,[x,2.3,z],[x,2.55,z],.025,m.rim);
  }

  // Establish continuous hedges first. Trees must fit the finished contour,
  // including its corners, rather than punching gaps in it afterwards.
  for (const points of contours) {
    const lengths = [0];
    for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
    const total=lengths.at(-1), spacing=.44, count=Math.floor(total/spacing);
    let segment=1;
    for(let i=0;i<count;i++){
      const s=(total-(count-1)*spacing)/2+i*spacing;
      while(segment<points.length-1&&lengths[segment]<s)segment++;
      const a=points[segment-1],b=points[segment],t=(s-lengths[segment-1])/(lengths[segment]-lengths[segment-1]);
      const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
      bush(x,z,.76,.72,-Math.atan2(b[1]-a[1],b[0]-a[0]),spacing);
      if (i % 64 === 63) await yieldSetup();
    }
  }
  // One planting strip on each roadside, with a single hedge farther from
  // the gravel. There are no additional bosquet perimeter rows.
  const TREE_OFFSET = 2.65, HEDGE_OFFSET = 4.2;
  for (const [index, path] of roads.entries()) {
    // Joining avenues have complete tree rows behind the continuous hedge.
    const treeOffset = joinAvenues.some(z => path.pts.every(p => p[1] === z)) ? 6.5 : TREE_OFFSET;
    for(const [sideIndex,side] of [-1,1].entries()){
      // Centre each row within its path, including the short connecting roads.
      const count=Math.max(1,Math.floor(path.length/3.3));
      const start=(path.length-(count-1)*3.3)/2;
      for(let i=0;i<count;i++){
        const s=start+i*3.3;
        const p=path.at(s),a=path.at(s-.15),b=path.at(s+.15),angle=Math.atan2(b.z-a.z,b.x-a.x);
        if(tree(p.x-Math.sin(angle)*side*treeOffset,p.z+Math.cos(angle)*side*treeOffset,2.15,.55,-angle))roadPlanting[index].trees[sideIndex]++;
      }
      // At a junction, shift the short row away from the crossing road.
      if(!roadPlanting[index].trees[sideIndex])for(let fraction=.2;fraction<=.8;fraction+=.1){
        const s=path.length*fraction,p=path.at(s),a=path.at(s-.15),b=path.at(s+.15);
        const angle=Math.atan2(b.z-a.z,b.x-a.x);
        if(tree(p.x-Math.sin(angle)*side*treeOffset,p.z+Math.cos(angle)*side*treeOffset,2.15,.55,-angle)){
          roadPlanting[index].trees[sideIndex]++;break;
        }
      }
    }
    await yieldSetup();
  }
  // Keep the space between the digits clear of ornaments resembling a zero.
  pavilion(pavilionCenter.x,pavilionCenter.z);
  for(const [x,z] of [[-18,9],[-18,12.8],[-10,11],[-10,6],[19,4],[18,9],[18,12.5]])tree(x,z,2.4,.62);

  const garden=bake(group),dummy=new T.Object3D(),color=new T.Color();
  const coreMesh=new T.InstancedMesh(coreGeometry,foliage,cores.length);
  cores.forEach((p,i)=>{
    dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.sx,p.sy,p.sz);dummy.rotation.set(0,p.angle,0);dummy.updateMatrix();
    coreMesh.setMatrixAt(i,dummy.matrix);color.setRGB(p.shade,p.shade,p.shade*.94);coreMesh.setColorAt(i,color);
  });
  coreMesh.castShadow=true;coreMesh.receiveShadow=true;garden.add(coreMesh);
  const leafMesh=new T.InstancedMesh(new T.PlaneGeometry(1,1),leafMaterial,leaves.length);
  for (const [i, p] of leaves.entries()) {
    dummy.position.set(p.x,p.y,p.z);dummy.scale.setScalar(p.size);dummy.rotation.set(p.rx,p.ry,p.rz);dummy.updateMatrix();leafMesh.setMatrixAt(i,dummy.matrix);
    if (i % 1000 === 999) await yieldSetup();
  }
  leafMesh.receiveShadow=true;garden.add(leafMesh);
  garden.userData.foliageBounds=foliageBounds;garden.userData.roadPlanting=roadPlanting;
  garden.userData.pavilionCenter=pavilionCenter;
  garden.userData.hedgeOffset=HEDGE_OFFSET;
  return garden;
}


/* Build-time only. The live page uses the generated images, not Three.js. */
export async function bakeYears({ backgroundOnly = false } = {}) {
  const yieldSetup = () => new Promise(resolve => setTimeout(resolve, 0));
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  function lights(scene) {
    scene.add(new T.HemisphereLight(0xfff6e8, 0x879779, 2.4));
    const sun = new T.DirectionalLight(0xfff4e3, 2.2);
    sun.position.set(-18, 35, 20); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, {left:-50,right:50,top:42,bottom:-42,near:.5,far:100});
    sun.shadow.bias = -.0003; sun.shadow.normalBias = .035; sun.shadow.radius = 3;
    scene.add(sun); return sun;
  }
  const world = new T.Scene();
  lights(world);
  const {roads} = gardenRoutes();
  // Keep the shared ground palette independent of the 3D lighting.
  const terrain = new T.MeshBasicMaterial({ map: groundTexture(roads), toneMapped: false });
  const ground = mesh(world, new T.PlaneGeometry(MAP_W, MAP_D), terrain);
  ground.rotation.x = -Math.PI / 2; ground.castShadow = false;
  const gardenShadow = mesh(world, new T.PlaneGeometry(MAP_W, MAP_D),
    new T.ShadowMaterial({ color: 0x43523a, opacity: .16 }), 0, .012, 0);
  gardenShadow.rotation.x = -Math.PI / 2; gardenShadow.castShadow = false; gardenShadow.receiveShadow = true;
  const contours = hedgeContours(roads, 4.2, MAP_W, MAP_D);
  const garden = await landscaping(roads, contours, yieldSetup);
  world.add(garden);
  const camera = new T.OrthographicCamera(-80,80,95,-95,.1,280);
  camera.position.set(0,86,71.4); camera.lookAt(0,0,-.6);
  renderer.setSize(3200,3800,false);
  await renderer.compileAsync(world,camera);
  renderer.render(world,camera);
  const background = renderer.domElement.toDataURL("image/webp",.91);
  if (backgroundOnly) { renderer.dispose(); return { background }; }
  await yieldSetup();
  const count = 72, columns = 12, tile = 256, size = 6.5;
  const spriteCamera = new T.OrthographicCamera(-size/2,size/2,size/2,-size/2,.1,180);
  spriteCamera.position.set(0,43,36); spriteCamera.lookAt(0,0,0);
  renderer.setSize(tile,tile,false);
  const atlases = [];
  for (const trailer of [false,true]) {
    const scene = new T.Scene();
    const sun = lights(scene);
    Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5});
    sun.shadow.mapSize.set(512,512); sun.shadow.camera.updateProjectionMatrix();
    const vehicle = vehicleModel(trailer); vehicle.position.y = .025; scene.add(vehicle);
    const shadow = new T.Mesh(new T.PlaneGeometry(12,12),new T.ShadowMaterial({opacity:.22}));
    shadow.rotation.x = -Math.PI/2; shadow.receiveShadow = true; scene.add(shadow);
    const atlas = document.createElement("canvas"); atlas.width = tile*columns; atlas.height = tile*Math.ceil(count/columns);
    const context = atlas.getContext("2d");
    await renderer.compileAsync(scene,spriteCamera);
    for (let i=0;i<count;i++) {
      vehicle.rotation.y = i/count*Math.PI*2;
      renderer.render(scene,spriteCamera);
      context.drawImage(renderer.domElement,(i%columns)*tile,Math.floor(i/columns)*tile);
      await yieldSetup();
    }
    atlases.push(atlas.toDataURL("image/webp",.94));
  }
  renderer.dispose();
  return {background,car:atlases[0],trailer:atlases[1],
    metadata:{count,columns,tile,spriteWorldSize:size,backgroundWorldWidth:160,backgroundWorldHeight:190}};
}
