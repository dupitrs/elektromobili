// Render the first garden from the same geometry and atlas as the live worker.
// Usage: node scripts/bake-opening.cjs http://localhost:8000
// Embed the existing images without a browser: node scripts/bake-opening.cjs --embed-only
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

function embedOpening() {
  const file = path.join(__dirname, "../index.html");
  let html = fs.readFileSync(file, "utf8");
  for (const name of ["mobile", "desktop"]) {
    const picture = fs.readFileSync(path.join(__dirname, "../assets/img/journey/opening-" + name + ".webp"));
    const attribute = name === "mobile" ? "srcset" : "src";
    const pattern = new RegExp(`(<[^>]+data-opening="${name}"[^>]+${attribute}=")[^"]*(")`);
    if (!pattern.test(html)) throw new Error(`Missing ${name} opening image in index.html`);
    html = html.replace(pattern, (_, before, after) => before + "data:image/webp;base64," + picture.toString("base64") + after);
  }
  fs.writeFileSync(file, html);
  console.log("Opening images embedded in index.html; no separate image requests.");
}

if (process.argv[2] === "--embed-only") {
  embedOpening();
  process.exit(0);
}

async function renderOpening() {
  const { makeGardenBand } = await import("./assets/js/journey-formal-garden.js?v=20260917-loading-1");
  const { loadGardenDecor, drawGardenBand } = await import("./assets/js/journey-garden-renderer.js?v=20260917-worker-1");
  const band = document.querySelector(".journey-band"), section = document.querySelector("#pieredze");
  const width = band.clientWidth, height = band.getBoundingClientRect().height;
  const unit = Math.max(8, Math.min(16, width / 96));
  const a = section.querySelector(".exp-intro").getBoundingClientRect();
  const b = section.querySelector(".exp-scene").getBoundingClientRect();
  const left = section.querySelector(".container").getBoundingClientRect().left;
  const exitX = width >= 768 ? (a.right + b.left) / 2 : Math.max(unit * 3, left / 2);
  const plan = makeGardenBand({ index: 0, width, height, unit, entryX: width / 2, exitX });
  const canvas = document.createElement("canvas");
  drawGardenBand(canvas, plan, await loadGardenDecor(), 1);
  return canvas.toDataURL("image/webp", .82);
}

const url = process.argv[2] || "http://localhost:8000";
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "journey-opening-"));
try {
  for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
    const output = execFileSync(process.execPath, [path.join(__dirname, "shot.cjs"), "--url", url,
      "--width", String(width), "--height", String(height), "--out", path.join(temporary, name + ".png"),
      "--eval", `(${renderOpening.toString()})()`], { encoding: "utf8" });
    const line = output.split("\n").find(line => line.startsWith("eval → "));
    const data = JSON.parse(line.slice("eval → ".length));
    const file = path.join(__dirname, "../assets/img/journey/opening-" + name + ".webp");
    fs.writeFileSync(file, Buffer.from(data.split(",")[1], "base64"));
    console.log(`${name}: ${fs.statSync(file).size} bytes`);
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
embedOpening();
