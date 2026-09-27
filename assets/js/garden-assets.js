// Both garden scenes share the decoded atlases. No live 3D rendering is needed.
export async function decodeImage(url) {
  const picture = new Image();
  picture.decoding = "async";
  picture.src = url;
  await picture.decode();
  return picture;
}

async function decodeSprite(url) {
  const picture = await decodeImage(url);
  if (typeof createImageBitmap !== "function") return picture;
  // Retain decoded pixels across both canvases. HTML images can otherwise
  // trigger another large WebP decode on the first frame of the 17 scene.
  try { return await createImageBitmap(picture); }
  catch { return picture; }
}

let sprites, yearsBackground;
export function loadYearsBackground() {
  return yearsBackground ||= decodeImage(new URL("../img/years/background.webp?v=20260917-side-fountains-1", import.meta.url).href);
}

export function loadGardenSprites() {
  if (!sprites) {
    const asset = name => new URL("../img/years/" + name + "?v=20260917-side-fountains-1", import.meta.url).href;
    sprites = Promise.all([
      decodeSprite(asset("car.webp")), decodeSprite(asset("trailer.webp")),
      fetch(asset("frames.json")).then(response => {
        if (!response.ok) throw new Error("Garden frames unavailable");
        return response.json();
      })
    ]).then(([car, trailer, frames]) => ({ car, trailer, frames }));
  }
  return sprites;
}
