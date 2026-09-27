// Run with a local server and Chrome installed; uses the existing CDP helper.
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const os = require("node:os");

async function checkScroll() {
  const tasks = [], gaps = [];
  const observer = new PerformanceObserver(list => tasks.push(...list.getEntries().map(e => Math.round(e.duration))));
  observer.observe({ type: "longtask" });
  const start = performance.now(), duration = 12000;
  const limit = document.documentElement.scrollHeight - innerHeight;
  await new Promise(resolve => {
    let previous = performance.now();
    function frame(now) {
      gaps.push(now - previous); previous = now;
      const progress = Math.min(1, (now - start) / duration);
      window.scrollTo({ top: limit * progress, behavior: "instant" });
      if (progress < 1) requestAnimationFrame(frame); else resolve();
    }
    requestAnimationFrame(frame);
  });
  await new Promise(resolve => setTimeout(resolve, 300));
  observer.disconnect();
  const painted = document.querySelectorAll(".journey-band.is-painted").length;
  if (painted !== 8) throw new Error(`Only ${painted}/8 gardens painted`);
  // Worker completion can precede compositing. Removing this backing image
  // creates a blank opening even though both loading/worker checks pass.
  const preview = document.querySelector(".journey-opening-preview");
  const previewStyle = getComputedStyle(preview);
  if (previewStyle.visibility !== "visible" || previewStyle.display === "none" || Number(previewStyle.opacity) === 0) {
    throw new Error("Opening preview disappears before Canvas presentation is guaranteed");
  }
  if (!document.querySelector(".garden-journey.is-ready")) throw new Error("Journey unavailable");
  if (!document.querySelector(".years.is-3d-ready")) throw new Error("Years scene unavailable");
  // Before the worker change, crossing sections triggered 100–550 ms tasks.
  if (tasks.some(ms => ms > 100)) throw new Error(`Scrolling blocked by long tasks: ${tasks.join(", ")} ms`);
  return { painted, longTasks: tasks, maxFrameGap: Math.round(Math.max(...gaps)), framesOver50ms: gaps.filter(ms => ms > 50).length };
}

const [url = "http://localhost:8000", width = "1440", height = "900"] = process.argv.slice(2);
execFileSync(process.execPath, [path.join(__dirname, "shot.cjs"), "--url", url,
  "--width", width, "--height", height, "--out", path.join(os.tmpdir(), `journey-scroll-${process.pid}.png`),
  "--eval", `(${checkScroll.toString()})()`], { stdio: "inherit" });
