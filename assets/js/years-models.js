import * as T from "./vendor/three.module.js";

/* Photo-led Melex approximation, in metres. Source: assets/img/exp-cars.webp.
   This is a handcrafted model, not a manufacturer CAD or measured scan. */
const mat = (color, roughness = .75, metalness = 0) => new T.MeshStandardMaterial({ color, roughness, metalness });
export const materials = {
  body: mat(0xf4f2e9, .38), frame: mat(0x242725, .52), rubber: mat(0x242622),
  rim: mat(0x94958b, .36, .65), seat: mat(0xe4d5b3), red: mat(0xda4937, .92),
  redEdge: mat(0xc34735), glass: new T.MeshStandardMaterial({ color: 0xc5dedc,
    transparent: true, opacity: .36, roughness: .12, metalness: .08, depthWrite: false, side: T.DoubleSide }),
  chrome: mat(0xe4e4d4, .2, .55), amber: mat(0xe09b35, .35), tail: mat(0xae3226, .3),
  skin: mat(0xd5a980), hair: mat(0x55463a), shirt: mat(0x7f9fa3), trousers: mat(0x555a5d),
  stone: mat(0xc7c1a7), hedge: mat(0x99ab7d), leaf: mat(0xb7c68f), trunk: mat(0x6b6248),
  rose: mat(0xc47978), flower: mat(0xe4cfb5), soil: mat(0x69684a), lawn: mat(0x8c9564)
};
const boxGeo = new T.BoxGeometry(1, 1, 1);
const sphereGeo = new T.SphereGeometry(1, 12, 8);
const cylinderGeo = new T.CylinderGeometry(1, 1, 1, 10);

export function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
  const object = new T.Mesh(geometry, material);
  object.position.set(x, y, z);
  object.castShadow = true; object.receiveShadow = true;
  parent.add(object); return object;
}
export function box(parent, x, y, z, w, h, d, material) {
  const object = mesh(parent, boxGeo, material, x, y, z);
  object.scale.set(w, h, d); return object;
}
export function ball(parent, x, y, z, sx, sy, sz, material) {
  const object = mesh(parent, sphereGeo, material, x, y, z);
  object.scale.set(sx, sy, sz); return object;
}
export function rod(parent, a, b, radius, material) {
  const start = new T.Vector3(...a), end = new T.Vector3(...b);
  const object = mesh(parent, cylinderGeo, material);
  object.position.copy(start).add(end).multiplyScalar(.5);
  object.scale.set(radius, start.distanceTo(end), radius);
  object.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), end.sub(start).normalize());
  return object;
}
function rounded(w, h, d, r = .05) {
  const shape = new T.Shape();
  const x = -w / 2, z = -d / 2;
  shape.moveTo(x + r, z);
  shape.lineTo(x + w - r, z); shape.quadraticCurveTo(x + w, z, x + w, z + r);
  shape.lineTo(x + w, z + d - r); shape.quadraticCurveTo(x + w, z + d, x + w - r, z + d);
  shape.lineTo(x + r, z + d); shape.quadraticCurveTo(x, z + d, x, z + d - r);
  shape.lineTo(x, z + r); shape.quadraticCurveTo(x, z, x + r, z);
  const bevel = Math.min(h * .18, r * .35);
  const geo = new T.ExtrudeGeometry(shape, { depth: h - bevel * 2, bevelEnabled: true,
    bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 4 });
  geo.rotateX(-Math.PI / 2); geo.translate(0, -h / 2 + bevel, 0);
  return geo;
}

/* Bake static components by material; all trains share the resulting meshes.
   This avoids thousands of draw calls from small model details. */
export function bake(root) {
  root.updateMatrixWorld(true);
  const buckets = new Map();
  root.traverse(object => {
    if (!object.isMesh) return;
    const source = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
    source.applyMatrix4(object.matrixWorld);
    let bucket = buckets.get(object.material);
    if (!bucket) { bucket = { position: [], normal: [], uv: [] }; buckets.set(object.material, bucket); }
    for (const key of ["position", "normal", "uv"]) {
      const attr = source.getAttribute(key);
      if (attr) for (const n of attr.array) bucket[key].push(n);
    }
    source.dispose();
  });
  const group = new T.Group();
  for (const [material, data] of buckets) {
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute(data.position, 3));
    geo.setAttribute("normal", new T.Float32BufferAttribute(data.normal, 3));
    if (data.uv.length === data.position.length / 3 * 2) geo.setAttribute("uv", new T.Float32BufferAttribute(data.uv, 2));
    geo.computeBoundingSphere(); mesh(group, geo, material);
  }
  return group;
}

function roof(parent, length, offset = 0) {
  const canopy = new T.Group(); canopy.position.x = offset; parent.add(canopy); parent = canopy;
  // A stretched fabric canopy with a shallow crown, rounded corners and valance.
  const nx = 16, nz = 8, positions = [], indices = [], uvs = [];
  for (let i = 0; i <= nx; i++) {
    const x = (i / nx - .5) * length;
    const corner = Math.max(0, Math.abs(x) - (length / 2 - .18));
    const width = .72 - .18 + Math.sqrt(Math.max(0, .18 * .18 - corner * corner));
    for (let j = 0; j <= nz; j++) {
      const v = j / nz * 2 - 1;
      positions.push(x, 1.93 + .12 * (1 - v * v) * Math.sin(Math.PI * i / nx), v * width);
      uvs.push(i / nx, j / nz);
      if (i < nx && j < nz) {
        const a = i * (nz + 1) + j, b = a + nz + 1;
        indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new T.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices); geo.computeVertexNormals();
  mesh(parent, geo, materials.red);
  mesh(parent, rounded(length - .06, .045, 1.39, .17), materials.redEdge, 0, 1.91, 0);
  // Scallops are actual fabric geometry, not painted zigzags.
  const shape = new T.Shape();
  shape.moveTo(-.09, 0); shape.lineTo(.09, 0); shape.lineTo(.09, -.035);
  shape.quadraticCurveTo(0, -.085, -.09, -.035); shape.closePath();
  const fringe = new T.ShapeGeometry(shape, 5);
  const cloth = materials.redEdge.clone(); cloth.side = T.DoubleSide;
  for (const side of [-1, 1]) {
    for (let x = -length / 2 + .21; x < length / 2 - .1; x += .18) mesh(parent, fringe, cloth, x, 1.92, side * .716);
    for (let z = -.45; z < .6; z += .18) {
      const piece = mesh(parent, fringe, cloth, side * (length / 2 - .015), 1.92, z);
      piece.rotation.y = Math.PI / 2;
    }
    rod(parent, [-length / 2 + .18, 1.89, side * .64], [length / 2 - .18, 1.89, side * .64], .022, materials.frame);
  }
  // Subtle seams follow the actual fabric crown instead of intersecting it.
  for (const x of [-length * .3, length * .25]) {
    const points = [];
    for (let j = 0; j <= 16; j++) {
      const v = j / 8 - 1;
      points.push(new T.Vector3(x, 1.934 + .12 * (1 - v * v) * Math.sin(Math.PI * (x / length + .5)), v * .7));
    }
    mesh(parent, new T.TubeGeometry(new T.CatmullRomCurve3(points), 16, .003, 4, false), materials.redEdge);
  }
}

function wheel(parent, x, z) {
  const wheel = new T.Group(); parent.add(wheel); wheel.position.set(x, .31, z);
  // The torus has its axle along local Z, matching the vehicle's axle.
  mesh(wheel, new T.TorusGeometry(.23, .085, 8, 20), materials.rubber);
  const rim = mesh(wheel, new T.CylinderGeometry(.177, .177, .145, 16), materials.rim);
  rim.rotation.x = Math.PI / 2;
  for (const side of [-1, 1]) {
    const hub = mesh(wheel, new T.CylinderGeometry(.067, .073, .018, 16), materials.rim, 0, 0, side * .08);
    hub.rotation.x = Math.PI / 2;
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2;
      ball(wheel, Math.cos(a) * .107, Math.sin(a) * .107, side * .076, .022, .022, .009, materials.frame);
    }
  }
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2;
    const tread = box(wheel, Math.cos(a) * .312, Math.sin(a) * .312, 0, .022, .006, .105, materials.rubber);
    tread.rotation.z = a - Math.PI / 2;
  }
}

function seat(parent, x, direction = 1) {
  const group = new T.Group(); group.position.x = x; group.rotation.y = direction < 0 ? Math.PI : 0; parent.add(group);
  mesh(group, rounded(.48, .12, 1.02, .065), materials.seat, 0, .82, 0);
  const back = mesh(group, rounded(.095, .46, 1.04, .035), materials.seat, -.255, 1.06, 0);
  back.rotation.z = -.07;
  for (const s of [-1, 1]) {
    rod(group, [-.28, .69, s * .51], [-.28, 1.3, s * .51], .024, materials.frame);
    rod(group, [-.28, 1.14, s * .51], [.17, 1.1, s * .51], .023, materials.frame);
    rod(group, [.17, 1.1, s * .51], [.17, .84, s * .51], .021, materials.frame);
  }
}

function passenger(parent, x, z, direction, variant) {
  const person = new T.Group(); person.position.set(x, 0, z); person.rotation.y = direction < 0 ? Math.PI : 0; parent.add(person);
  const shirts = [materials.shirt, materials.seat, materials.redEdge];
  const shirt = shirts[variant % shirts.length];
  ball(person, -.03, 1.1, 0, .13, .26, .2, shirt);
    ball(person, -.015, 1.45, 0, .112, .14, .104, materials.skin);
    ball(person, -.04, 1.51, 0, .112, .093, .108, materials.hair);
  ball(person, .091, 1.44, 0, .031, .032, .028, materials.skin);
  for (const side of [-1, 1]) {
    rod(person, [-.01, .86, side * .1], [.28, .8, side * .1], .068, materials.trousers);
    rod(person, [.28, .8, side * .1], [.31, .48, side * .1], .05, materials.trousers);
    ball(person, .36, .455, side * .1, .11, .045, .065, materials.frame);
    rod(person, [0, 1.24, side * .18], [.14, 1.03, side * .21], .043, shirt);
    rod(person, [.14, 1.03, side * .21], [.29, 1.02, side * .13], .032, materials.skin);
  }
}

function windscreen(parent) {
  // The lower edge sits on the exposed bonnet; the top leans back under
  // the shortened canopy, matching exp-cars.webp (vehicle front is +X).
  const bottomX = 1.28, bottomY = .865, topX = .92, topY = 1.89;
  const glassX = y => bottomX + (topX - bottomX) * (y - bottomY) / (topY - bottomY);
  const a = [bottomX, bottomY, -.565], b = [topX, topY, -.565];
  const geo = new T.BufferGeometry();
  geo.setAttribute("position", new T.Float32BufferAttribute([
    ...a, bottomX, bottomY, .565, topX, topY, .565, ...a, topX, topY, .565, ...b
  ], 3)); geo.computeVertexNormals();
  mesh(parent, geo, materials.glass);
  for (const s of [-1, 1]) {
    rod(parent, [bottomX, bottomY, s * .58], [topX, topY, s * .58], .025, materials.frame);
    rod(parent, [glassX(1.18), 1.18, s * .59], [glassX(1.18) + .05, 1.18, s * .77], .018, materials.frame);
    mesh(parent, rounded(.065, .17, .13, .025), materials.frame, glassX(1.18) + .055, 1.2, s * .78);
  }
  rod(parent, [bottomX, bottomY, -.58], [bottomX, bottomY, .58], .027, materials.frame);
  rod(parent, [topX, topY, -.58], [topX, topY, .58], .024, materials.frame);
  rod(parent, [glassX(.94) + .014, .94, -.18], [glassX(1.25) + .014, 1.25, .12], .012, materials.frame);
  // Printed lettering on the actual glass plane.
  const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext("2d"); ctx.textAlign = "center"; ctx.fillStyle = "#fffef0";
  ctx.font = "bold 32px sans-serif"; ctx.fillText("EKSKURSIJA PA PARKU", 256, 49);
  ctx.font = "bold 25px sans-serif"; ctx.fillText("GUIDED PARK TOURS", 256, 84);
  const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace;
  const label = mesh(parent, new T.PlaneGeometry(.99, .25), new T.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: T.DoubleSide }), glassX(1.15) + .008, 1.15, 0);
  const across = new T.Vector3(0, 0, -1);
  const up = new T.Vector3(topX - bottomX, topY - bottomY, 0).normalize();
  label.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(across, up, across.clone().cross(up)));
}

export function vehicleModel(trailer = false) {
  const root = new T.Group(), m = materials;
  const length = trailer ? 3 : 3.5, half = length / 2, axle = trailer ? .99 : 1.17;
  box(root, 0, .36, 0, length - .14, .14, .96, m.frame);
  mesh(root, rounded(length, .12, 1.16, .1), m.body, 0, .48, 0);
  for (const x of [-axle, axle]) {
    rod(root, [x, .3, -.6], [x, .3, .6], .055, m.frame);
    for (const side of [-1, 1]) {
      wheel(root, x, side * .54);
      // Wheel fenders and short side panels leave the foot wells open.
      mesh(root, rounded(.8, .11, .29, .1), m.body, x, .67, side * .47);
      box(root, x - .37, .56, side * .55, .075, .21, .085, m.body);
      box(root, x + .37, .56, side * .55, .075, .21, .085, m.body);
    }
  }
  for (const s of [-1, 1]) {
    box(root, 0, .39, s * .64, 1.55, .055, .19, m.frame);
    box(root, -.1, .59, s * .535, .27, .23, .1, m.body);
    ball(root, -.1, .64, s * .594, .038, .038, .009, m.amber);
    box(root, -half + .1, .43, s * .43, .13, .13, .23, m.frame);
    box(root, -half + .025, .62, s * .43, .028, .11, .18, m.tail);
  }
  box(root, -half + .05, .52, 0, .025, .08, .28, m.chrome);
  rod(root, [-half, .35, 0], [-half - .15, .35, 0], .045, m.frame);
  const rows = trailer ? [.86, .04, -.8] : [.36, -.43, -1.13];
  rows.forEach((x, i) => {
    const direction = i === 2 ? -1 : 1;
    seat(root, x, direction);
    // Leave some seats empty, as in the reference tour trains.
    if (i !== 1) passenger(root, x, -.27, direction, i);
    if (i === 1) passenger(root, x, .27, direction, i);
  });
  if (trailer) {
    mesh(root, rounded(.2, .31, 1.12), m.body, 1.37, .7, 0);
    rod(root, [1.35, .87, -.52], [1.35, .87, .52], .028, m.frame);
    for (const x of [-1.35, 1.35]) for (const s of [-1, 1]) rod(root, [x, .59, s * .57], [x, 1.91, s * .57], .022, m.frame);
  } else {
    // Sculpted sloping bonnet, rather than a solid rectangular body.
    const cross = new T.Shape(); cross.moveTo(.78, .49); cross.lineTo(1.73, .49);
    cross.quadraticCurveTo(1.84, .66, 1.6, .74); cross.lineTo(.89, .94); cross.lineTo(.78, .94); cross.closePath();
    const hood = new T.ExtrudeGeometry(cross, { depth: 1.08, bevelEnabled: true, bevelSize: .04, bevelThickness: .035, bevelSegments: 2, steps: 1, curveSegments: 6 });
    hood.translate(0, 0, -.54); mesh(root, hood, m.body);
    box(root, 1.71, .49, 0, .19, .095, 1.12, m.frame);
    for (const s of [-1, 1]) {
      box(root, 1.67, .77, s * .4, .16, .14, .25, m.frame);
      box(root, 1.758, .775, s * .4, .016, .095, .185, m.chrome);
      box(root, 1.769, .626, s * .4, .018, .05, .15, m.amber);
      rod(root, [-1.49, .59, s * .57], [-1.49, 1.91, s * .57], .023, m.frame);
    }
    box(root, .78, .91, 0, .11, .15, 1.08, m.frame);
    rod(root, [.78, .87, -.27], [.59, 1.03, -.27], .025, m.frame);
    const steering = mesh(root, new T.TorusGeometry(.145, .016, 6, 20), m.frame, .59, 1.03, -.27);
    steering.rotation.y = Math.PI / 2; steering.rotation.z = -.5;
    windscreen(root);
  }
  // Keep the rear overhang; remove 70 cm only from the car's front canopy.
  roof(root, trailer ? 3.22 : 2.84, trailer ? 0 : -.35);
  return bake(root);
}
