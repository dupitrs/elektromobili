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

/* Phones hold these three images in memory decoded, not compressed: the full
   garden and both sprite atlases come to 82 MB that way, which is what makes
   Safari and the Instagram browser stutter and reload the page. Half-scale
   copies cost 21 MB and are still sharper than the screen: the cars are drawn
   about 55 px wide on a phone, from tiles that remain 128 px. The worker gets
   the background URL from the page, so both stay on the same copy. */
// The short edge, so a phone turned sideways is still a phone and a tablet
// still gets the full-resolution garden.
const compact = typeof innerWidth === "number" && Math.min(innerWidth, innerHeight) < 700;

let sprites, yearsBackground;
export function loadYearsBackground() {
  const file = compact ? "background-mobile.webp" : "background.webp";
  return yearsBackground ||= decodeImage(new URL("../img/years/" + file + "?v=20260927-mobile-3", import.meta.url).href);
}

export function loadGardenSprites() {
  if (!sprites) {
    const asset = name => new URL("../img/years/" + name + "?v=20260927-mobile-3", import.meta.url).href;
    const variant = (stem, extension) => asset(stem + (compact ? "-mobile" : "") + extension);
    sprites = Promise.all([
      decodeSprite(variant("car", ".webp")), decodeSprite(variant("trailer", ".webp")),
      fetch(variant("frames", ".json")).then(response => {
        if (!response.ok) throw new Error("Garden frames unavailable");
        return response.json();
      })
    ]).then(([car, trailer, frames]) => ({ car, trailer, frames }));
  }
  return sprites;
}
