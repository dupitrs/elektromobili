import * as T from "./vendor/three.module.js";
import { materials, mesh, ball, rod } from "./years-models.js";
import { hedgeTexture } from "./years-bake.js";
import { gardens, gardenDimensions, gardenRoads } from "./journey-gardens.js";
import { roadDistance } from "./years-routes.js";

const K = 43 / Math.hypot(43, 36);

// Small transparent objects baked once. The page composes them with Canvas2D;
// this module and Three.js are used by the asset generation script only.
export async function bakeGardenDecor() {
  const names = ["hedge", "lime", "fountain", "pavilion", "roses", "parterre", "pergola", "urn"];
  const size = 256, worldSize = 10;
  const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(size, size, false);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  const atlas = document.createElement("canvas"); atlas.width = size * names.length; atlas.height = size;
  const ctx = atlas.getContext("2d"), frames = {};
  const leafMap = hedgeTexture();
  const foliage = new T.MeshStandardMaterial({ color: 0x718d48, map: leafMap, bumpMap: leafMap, bumpScale: .04, roughness: 1 });
  const lightLeaf = foliage.clone(); lightLeaf.color.setHex(0x92a868);
  const stone = new T.MeshStandardMaterial({ color: 0xded8c6, roughness: .85 });
  const copper = new T.MeshStandardMaterial({ color: 0x587d6c, roughness: .7, metalness: .2 });
  const gold = new T.MeshStandardMaterial({ color: 0xcaa54f, roughness: .4, metalness: .4 });
  const water = new T.MeshStandardMaterial({ color: 0x8bbdc4, roughness: .2, metalness: .15 });
  const spray = new T.MeshStandardMaterial({ color: 0xe0f0e8, transparent: true, opacity: .85, roughness: .2 });
  const roseColors = [0xb86773, 0xd89b9c, 0xe1c79e].map(color => new T.MeshStandardMaterial({ color, roughness: 1 }));
  function bush(root, x, y, z, rx, ry, rz, light = false) {
    const meshObject = ball(root, x, y, z, rx, ry, rz, light ? lightLeaf : foliage);
    // Each clump has a clipped, slightly irregular outline instead of a box.
    for (let j = 0; j < 5; j++) {
      const a = j * Math.PI * 2 / 5;
      ball(root, x + Math.cos(a) * rx * .65, y + ry * .04, z + Math.sin(a) * rz * .65,
        rx * .45, ry * .73, rz * .45, j % 3 ? foliage : lightLeaf);
    }
    return meshObject;
  }
  function urn(root, x = 0, z = 0, gilded = false) {
    const finish = gilded ? gold : stone;
    mesh(root, new T.CylinderGeometry(.44, .55, .16, 12), stone, x, .08, z);
    mesh(root, new T.CylinderGeometry(.23, .30, .7, 12), stone, x, .5, z);
    mesh(root, new T.CylinderGeometry(.36, .28, .18, 12), finish, x, .91, z);
    ball(root, x, 1.25, z, .46, .42, .46, finish);
    mesh(root, new T.CylinderGeometry(.48, .36, .12, 14), finish, x, 1.58, z);
    bush(root, x, 1.95, z, .59, .47, .59, true);
  }
  for (const [i, name] of names.entries()) {
    const scene = new T.Scene();
    scene.add(new T.HemisphereLight(0xfff6e8, 0x9aa788, 2.5));
    const sun = new T.DirectionalLight(0xfff4e3, 2.0);
    sun.position.set(-16, 35, 20); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: .1, far: 100 });
    sun.shadow.bias = -.0004; sun.shadow.normalBias = .025; sun.shadow.radius = 3; scene.add(sun);
    const shadow = mesh(scene, new T.PlaneGeometry(20, 20), new T.ShadowMaterial({ color: 0x43523a, opacity: .16 }));
    shadow.rotation.x = -Math.PI / 2; shadow.castShadow = false; shadow.receiveShadow = true;
    const root = new T.Group(); scene.add(root);
    if (name === "hedge") {
      bush(root, 0, .61, 0, .61, .61, .5);
    } else if (name === "lime") {
      rod(root, [0, 0, 0], [0, 2.65, 0], .085, materials.trunk);
      for (let j = 0; j < 4; j++) {
        const a = j * Math.PI / 2;
        rod(root, [0, 1.7, 0], [Math.cos(a) * .55, 2.75, Math.sin(a) * .55], .038, materials.trunk);
      }
      bush(root, 0, 2.85, 0, .98, .88, .98, true);
      bush(root, -.24, 3.1, .04, .76, .66, .72);
    } else if (name === "fountain") {
      mesh(root, new T.CylinderGeometry(2.28, 2.4, .22, 48), stone, 0, .11, 0);
      mesh(root, new T.CylinderGeometry(2.03, 2.03, .08, 48), water, 0, .26, 0);
      mesh(root, new T.CylinderGeometry(.24, .38, .6, 16), stone, 0, .55, 0);
      mesh(root, new T.CylinderGeometry(.82, .36, .17, 32), stone, 0, .92, 0);
      mesh(root, new T.CylinderGeometry(.65, .65, .025, 32), water, 0, 1.02, 0);
      rod(root, [0, 1.02, 0], [0, 2.18, 0], .043, spray);
      for (let j = 0; j < 10; j++) {
        const a = j * Math.PI / 5, points = [];
        for (let k = 0; k <= 14; k++) {
          const t = k / 14;
          points.push(new T.Vector3(Math.cos(a) * t * 1.22, 1.6 + Math.sin(t * Math.PI) * .6 - t * 1.31, Math.sin(a) * t * 1.22));
        }
        mesh(root, new T.TubeGeometry(new T.CatmullRomCurve3(points), 20, .023, 5, false), spray);
      }
    } else if (name === "pavilion") {
      mesh(root, new T.CylinderGeometry(1.86, 2.03, .2, 8), stone, 0, .1, 0);
      mesh(root, new T.CylinderGeometry(1.67, 1.84, .18, 8), stone, 0, .29, 0);
      for (let j = 0; j < 8; j++) {
        const a = j * Math.PI / 4, x = Math.cos(a) * 1.46, z = Math.sin(a) * 1.46;
        rod(root, [x, .38, z], [x, 2.53, z], .065, stone);
        mesh(root, new T.CylinderGeometry(.115, .09, .13, 8), stone, x, 2.42, z);
      }
      mesh(root, new T.CylinderGeometry(1.82, 1.82, .16, 8), stone, 0, 2.58, 0);
      mesh(root, new T.ConeGeometry(2.1, .8, 8), copper, 0, 3.0, 0);
      mesh(root, new T.ConeGeometry(.74, .35, 8), copper, 0, 3.51, 0);
      mesh(root, new T.CylinderGeometry(.1, .16, .24, 10), gold, 0, 3.75, 0);
      ball(root, 0, 3.99, 0, .26, .26, .26, gold);
      mesh(root, new T.CylinderGeometry(.24, .17, .07, 12), gold, 0, 4.2, 0);
    } else if (name === "roses") {
      const bed = mesh(root, new T.CylinderGeometry(1, 1, .1, 40), materials.soil, 0, .05, 0);
      bed.scale.set(2.3, 1, 1.35);
      for (let j = 0; j < 26; j++) {
        const a = j * 2.39996, r = Math.sqrt((j + .5) / 26);
        const x = Math.cos(a) * r * 2.08, z = Math.sin(a) * r * 1.15;
        ball(root, x, .28, z, .27, .23, .27, foliage);
        ball(root, x - .08, .5, z, .115, .1, .115, roseColors[j % 3]);
        ball(root, x + .11, .43, z + .09, .1, .1, .1, roseColors[j % 3]);
      }
    } else if (name === "parterre") {
      for (const side of [-1, 1]) for (let j = 0; j < 36; j++) {
        const a = j * Math.PI * 2 / 36;
        bush(root, side * 1.22 + Math.cos(a) * .98, .24, Math.sin(a) * 1.2, .18, .23, .18);
      }
      for (const side of [-1, 1]) {
        ball(root, side * 1.22, .23, 0, .64, .18, .85, materials.soil);
        for (let j = 0; j < 8; j++) {
          const a = j * Math.PI / 4;
          ball(root, side * 1.22 + Math.cos(a) * .48, .44, Math.sin(a) * .68, .14, .12, .14, roseColors[2]);
        }
      }
    } else if (name === "pergola") {
      for (const x of [-1.65, 1.65]) for (const z of [-1.25, 0, 1.25]) {
        rod(root, [x, 0, z], [x, 2.68, z], .07, copper);
        const curve = new T.EllipseCurve(0, 2.65, 1.65, .63, 0, Math.PI, false, 0);
        const points = curve.getPoints(18).map(p => new T.Vector3(p.x, p.y, z));
        mesh(root, new T.TubeGeometry(new T.CatmullRomCurve3(points), 20, .055, 6, false), copper);
      }
      for (const x of [-1.3, 0, 1.3]) rod(root, [x, 3.03, -1.5], [x, 3.03, 1.5], .05, copper);
      for (const x of [-1.6, 1.6]) for (const z of [-1.2, 0, 1.2]) {
        bush(root, x, 1.05, z, .29, 1.0, .29);
        bush(root, x * .8, 2.87, z, .7, .34, .5, true);
      }
    } else urn(root);
    const camera = new T.OrthographicCamera(-worldSize / 2, worldSize / 2, worldSize / 2, -worldSize / 2, .1, 200);
    camera.position.set(0, 43, 36); camera.lookAt(0, 0, 0);
    await renderer.compileAsync(scene, camera); renderer.render(scene, camera);
    ctx.drawImage(renderer.domElement, i * size, 0);
    frames[name] = { x: i * size, y: 0, width: size, height: size, worldWidth: worldSize, worldHeight: worldSize, anchorX: .5, anchorY: .5 };
    scene.traverse(object => { if (object.isMesh && object.geometry.type !== "SphereGeometry" && object.geometry.type !== "CylinderGeometry") object.geometry.dispose(); });
  }
  renderer.dispose();
  return { image: atlas.toDataURL("image/webp", .96), metadata: { version: 1, projection: K, frames } };
}

/* Offline only: complete park tiles, including all avenue planting. */
export async function bakeBosquet(tall = false, index = 0) {
  const dimensions = gardenDimensions(tall), design = gardens[index];
  const { depth, spacing, worldWidth } = dimensions, roads = gardenRoads(index, tall);
  const worldHeight = spacing * K, pixelWidth = tall ? 896 : 1792;
  const pixelHeight = Math.round(pixelWidth * worldHeight / worldWidth);
  const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(pixelWidth, pixelHeight, false);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  scene.add(new T.HemisphereLight(0xfff6e8, 0x879779, 2.4));
  const sun = new T.DirectionalLight(0xfff4e3, 2.2);
  sun.position.set(-48, 100, 56); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -90, right: 90, top: spacing, bottom: -spacing, near: .5, far: 650 });
  sun.shadow.bias = -.0003; sun.shadow.normalBias = .035; sun.shadow.radius = 3; scene.add(sun);

  const groundDepth = spacing + 40;
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 1536; textureCanvas.height = Math.round(1536 * groundDepth / 140);
  const c = textureCanvas.getContext("2d"), density = textureCanvas.width / 140;
  c.fillStyle = "#a9b789"; c.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
  c.save(); c.translate(textureCanvas.width/2, textureCanvas.height/2); c.scale(density,density);
  // Quiet alternating lawn strips keep the areas between bosquets landscaped.
  c.fillStyle = "rgba(81,112,55,.055)";
  for (let x=-70;x<70;x+=12) c.fillRect(x,-groundDepth/2,6,groundDepth);
  for (const [width, color] of [[3.5,"#c9c7ad"],[3.12,"#e6dec8"]]) {
    c.strokeStyle=color; c.lineWidth=width; c.lineCap="round"; c.lineJoin="round";
    for (const path of roads) {
      c.beginPath(); path.pts.forEach(([x,z],i)=>i?c.lineTo(x,z):c.moveTo(x,z)); c.stroke();
    }
  }
  c.restore();
  const groundMap = new T.CanvasTexture(textureCanvas); groundMap.colorSpace=T.SRGBColorSpace;
  const lawn = new T.MeshStandardMaterial({ map:groundMap,roughness:1 }); lawn.color.setScalar(.9);
  const ground = mesh(scene,new T.PlaneGeometry(140,groundDepth),lawn);
  ground.rotation.x=-Math.PI/2; ground.castShadow=false; ground.receiveShadow=true;

  const hedgeMap=hedgeTexture();
  const green=new T.MeshStandardMaterial({color:0x9aac72,map:hedgeMap,bumpMap:hedgeMap,bumpScale:.055,roughness:1});
  green.color.multiplyScalar(.78);
  const leaf=materials.leaf.clone(); leaf.color.multiplyScalar(.78);
  const geometry=new T.SphereGeometry(1,9,6), position=geometry.getAttribute("position");
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),y=position.getY(i),z=position.getZ(i);
    const noise=1+.055*Math.sin(x*19+y*11)*Math.cos(z*17-y*13);
    position.setXYZ(i,Math.sign(x)*Math.pow(Math.abs(x),.83)*noise,
      Math.sign(y)*Math.pow(Math.abs(y),.86)*noise,Math.sign(z)*Math.pow(Math.abs(z),.83)*noise);
  }
  geometry.computeVertexNormals();
  const bushes=[], trunks=[], crowns=[], leaves=[], treePositions=[];
  const clearing=(x,z)=>Math.abs(x)<14.2&&Math.abs(z)<14.2*depth;
  function bush(x,z,tallHedge=false){
    if(clearing(x,z))return;
    bushes.push([x,tallHedge?.78:.48,z,.54,tallHedge?.83:.53,.54]);
  }
  function tree(x,z){
    if(clearing(x,z)||roadDistance(x,z,roads)<3.7||treePositions.some(p=>Math.hypot(p[0]-x,p[1]-z)<3.5))return;
    treePositions.push([x,z]);
    trunks.push([x,1.15,z,.095,2.3,.095]);
    crowns.push([x,2.65,z,1.02,1.14,1.02]);
    for(let j=0;j<3;j++){
      const angle=j*Math.PI*2/3;
      leaves.push([x+Math.cos(angle)*.55,2.65,z+Math.sin(angle)*.55,.57,.67,.57]);
    }
  }
  function hedge(x1,z1,x2,z2){
    z1*=depth;z2*=depth;
    const length=Math.hypot(x2-x1,z2-z1),count=Math.ceil(length/.48);
    for(let i=0;i<=count;i++){
      const x=x1+(x2-x1)*i/count,z=z1+(z2-z1)*i/count;
      if(roadDistance(x,z,roads)>2.3)bush(x,z,true);
    }
  }
  function outline(points){points.forEach((p,i)=>hedge(...p,...points[(i+1)%points.length]));}
  const ellipse=(x,z,rx,rz,n=64)=>Array.from({length:n},(_,i)=>[x+Math.cos(i*Math.PI*2/n)*rx,z+Math.sin(i*Math.PI*2/n)*rz]);
  const shapes={
    rectangle:[[-22,-22],[22,-22],[22,22],[-22,22]],
    diamond:[[0,-31],[29,0],[0,31],[-29,0]],
    octagon:[[-14,-26],[14,-26],[26,-14],[26,14],[14,26],[-14,26],[-26,14],[-26,-14]],
    avenue:[[-24,-25],[24,-25],[24,25],[-24,25]],
    circle:ellipse(0,0,27,25),
    labyrinth:[[-26,-24],[17,-24],[17,-20],[26,-20],[26,24],[-17,24],[-17,20],[-26,20]],
    crescent:Array.from({length:60},(_,i)=>{const a=Math.PI*.1+i/59*Math.PI*1.8;return[Math.cos(a)*28,Math.sin(a)*27];})
  };
  outline(shapes[design.shape]);
  // Different ornaments live outside each section's open central clearing.
  if(index===0){
    for(const side of [-1,1])for(const z of [-17,17])outline([[side*18-2,z-2],[side*18+2,z-2],[side*18+2,z+2],[side*18-2,z+2]]);
  }else if(index===1){
    for(const side of [-1,1])outline([[side*22,-5],[side*26,0],[side*22,5],[side*18,0]]);
  }else if(index===2){
    for(const side of [-1,1]){hedge(side*19,-13,side*19,13);outline(ellipse(side*20,19,3,3,24));}
  }else if(index===3){
    for(const side of [-1,1]){hedge(side*18,-20,side*18,20);for(let z=-18;z<=18;z+=6)tree(side*22,z*depth);}
  }else if(index===4){
    for(const side of [-1,1])for(const z of [-16,16])outline(ellipse(side*17,z,3,3,24));
  }else if(index===5){
    for(const side of [-1,1]){hedge(side*18,-18,side*18,18);hedge(side*18,18,side*23,18);hedge(side*23,18,side*23,-12);}
  }else{
    for(const side of [-1,1])outline(ellipse(side*21,0,3,11,40));
  }
  // Neighbouring bosquets fill the park beyond the seven main destinations.
  for(const side of [-1,1])for(const z of [-45,-18,18,45]){
    const x=side*44;
    if((index+Math.abs(z))%3===0)outline(ellipse(x,z,6,Math.abs(z)===45?4:10,32));
    else if((index+Math.abs(z))%3===1){const h=Math.abs(z)===45?4:7;outline([[x-6,z-h],[x+6,z-h],[x+6,z+h],[x-6,z+h]]);}
    else {const h=Math.abs(z)===45?4:9;outline([[x,z-h],[x+7,z],[x,z+h],[x-7,z]]);}
    if(Math.abs(z)===18){hedge(x-3,z-5,x-3,z+5);hedge(x+3,z-5,x+3,z+5);}
  }
  // Continuous hedge borders plus a separate row of pollarded lime trees.
  // Clearance against the complete road network keeps every junction open.
  for(const path of roads){
    for(let d=0;d<=path.length;d+=.48){
      const p=path.at(d),a=path.at(d-.15),b=path.at(d+.15),angle=Math.atan2(b.z-a.z,b.x-a.x);
      for(const side of [-1,1]){
        const x=p.x-Math.sin(angle)*2.8*side,z=p.z+Math.cos(angle)*2.8*side;
        if(Math.abs(z)<spacing/2-6&&roadDistance(x,z,roads)>2.45)bush(x,z);
      }
    }
    for(let d=2;d<path.length;d+=6){
      const p=path.at(d),a=path.at(d-.15),b=path.at(d+.15),angle=Math.atan2(b.z-a.z,b.x-a.x);
      for(const side of [-1,1]){
        const x=p.x-Math.sin(angle)*4.9*side,z=p.z+Math.cos(angle)*4.9*side;
        if(Math.abs(z)<spacing/2-12)tree(x,z);
      }
    }
  }
  // Render identical planting on both sides of every tile boundary, including
  // trees beyond the crop whose crowns and shadows extend into this image.
  for(const edge of [-spacing/2,spacing/2])for(const x of [-54,-34,0,34,54])for(const side of [-1,1]){
    for(let d=-12;d<=12;d+=.48){const z=edge+d;if(Math.abs(z)>=spacing/2-6)bush(x+side*2.8,z);}
    for(const d of [-9,-3,3,9])tree(x+side*4.9,edge+d);
  }
  function instances(geo,material,items){
    const batch=new T.InstancedMesh(geo,material,items.length),dummy=new T.Object3D();
    items.forEach(([x,y,z,sx,sy,sz],i)=>{dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});
    batch.castShadow=batch.receiveShadow=true;scene.add(batch);
  }
  instances(geometry,green,bushes);instances(new T.CylinderGeometry(1,1,1,8),materials.trunk,trunks);
  instances(geometry,green,crowns);instances(geometry,leaf,leaves);
  const stone=new T.MeshStandardMaterial({color:0xded8c5,roughness:.96});
  for(const side of [-1,1]){
    const x=design.entry+2.7*side,z=-18*depth;
    mesh(scene,new T.CylinderGeometry(.34,.42,.2,12),stone,x,.1,z);
    mesh(scene,new T.CylinderGeometry(.2,.24,1.05,12),stone,x,.72,z);
    mesh(scene,new T.SphereGeometry(.31,12,8),stone,x,1.35,z);
  }
  const camera=new T.OrthographicCamera(-worldWidth/2,worldWidth/2,worldHeight/2,-worldHeight/2,.1,1000);
  camera.position.set(0,344,288);camera.lookAt(0,0,0);
  await renderer.compileAsync(scene,camera);renderer.render(scene,camera);
  const output=document.createElement("canvas");output.width=pixelWidth;output.height=pixelHeight;
  const context=output.getContext("2d",{willReadFrequently:true});context.drawImage(renderer.domElement,0,0);
  const pixel=context.getImageData(Math.round(pixelWidth*(.5+12/worldWidth)),Math.round(pixelHeight/2),1,1).data;
  const result={image:output.toDataURL("image/webp",.91),metadata:{...dimensions,worldHeight,
    color:"rgb("+[...pixel].slice(0,3).join(",")+")",planting:{trees:trunks.length,hedges:bushes.length,roads:roads.length}}};
  scene.traverse(object=>{if(object.isMesh)object.geometry.dispose();});
  renderer.dispose();return result;
}
