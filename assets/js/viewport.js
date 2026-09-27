/* One stable viewport height, shared by everything that measures the page.

   Mobile browsers change innerHeight while a finger is still on the screen:
   Safari and Chrome collapse their toolbars, and the Instagram and Facebook
   in-app browsers slide a bar in and out. Measuring the garden from
   innerHeight therefore re-ran the whole layout pass mid-scroll, which both
   stuttered and nudged the content. `100svh` is the smallest viewport the
   browser can present, so it holds still while those bars come and go, and it
   is the same number the stylesheet already uses for the opening and the 17
   stage. Reading it from a probe element keeps CSS and JS on exactly one
   height.

   The garden's geometry modules are shared with the painting worker, which has
   no document, so every DOM touch here stays behind that check. */

const onPage = typeof document === "object";
const supportsSvh = onPage && typeof CSS === "object" && Boolean(CSS.supports?.("height", "100svh"));
let probe;

function readHeight() {
  if (!onPage) return 0;
  if (!supportsSvh) return innerHeight;
  if (!probe) {
    probe = document.createElement("div");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText = "position:absolute;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none";
  }
  if (!probe.isConnected) (document.body || document.documentElement).append(probe);
  return probe.getBoundingClientRect().height || innerHeight;
}

let height = readHeight(), width = onPage ? innerWidth : 0;

// Cached: the value only changes on a real viewport change, and reading the
// probe forces layout, which no scroll frame should have to pay for.
export function viewportHeight() { return height; }

/* A phone by its short edge, so turning it sideways does not change the
   answer. Anything that has to behave differently there asks this. */
export const phone = onPage && Math.min(innerWidth, innerHeight) < 700;

const listeners = new Set();
let timer = 0;

function settle() {
  timer = 0;
  const nextWidth = innerWidth, nextHeight = readHeight();
  // A collapsing toolbar leaves both numbers alone. Rotating the phone,
  // resizing a window or opening a desktop sidebar changes them.
  if (nextWidth === width && Math.abs(nextHeight - height) < 2) return;
  width = nextWidth; height = nextHeight;
  for (const listener of [...listeners]) listener();
}

function schedule() { if (!timer) timer = setTimeout(settle, 120); }

if (onPage) {
  addEventListener("resize", schedule, { passive: true });
  addEventListener("orientationchange", schedule, { passive: true });
}

export function onViewportChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
