import Lenis from "./vendor/lenis.mjs";
import { viewportHeight } from "./viewport.js?v=20260927-mobile-1";

// Smooth mouse/trackpad input; touch keeps the platform's native momentum.
// lerp .1 is the exponential follow used on itsoffbrand.com (the Lenis default):
// every frame closes about a tenth of the remaining distance, so one wheel tick
// eases out over roughly a second instead of stopping short. The damping is
// frame-rate independent, so 60 Hz and 144 Hz screens feel the same.
// Lenis updates native scroll positions, which also drive the journey and 17 scenes.

// A phone or tablet scrolls with its own compositor thread, which no script
// can beat. Lenis there only added a frame loop that reads the scroll offset
// back from layout on every tick, so the garden competed with the very
// gesture it was trying to follow. Touch devices get the browser's scrolling
// and this small stand-in, which reports the same events the scenes listen to.
const pointerCoarse = matchMedia("(pointer: coarse)").matches;
const motionReduced = matchMedia("(prefers-reduced-motion: reduce)");

function nativeScroll() {
  const listeners = new Set();
  // Browsers already fire scroll once per frame while a finger drags, and the
  // scenes only flag a redraw here, so there is nothing to throttle.
  addEventListener("scroll", () => { for (const listener of [...listeners]) listener(); }, { passive: true });
  return {
    get scroll() { return scrollY; },
    get limit() { return Math.max(0, document.documentElement.scrollHeight - viewportHeight()); },
    on(event, listener) { if (event === "scroll") listeners.add(listener); },
    off(event, listener) { listeners.delete(listener); },
    // The browser owns the layout; there is nothing to recompute or pause.
    resize() {}, stop() {}, start() {},
    scrollTo(target, { onComplete } = {}) {
      scrollTo({ top: target, behavior: motionReduced.matches ? "auto" : "smooth" });
      if (!onComplete) return;
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        removeEventListener("scrollend", finish);
        onComplete();
      };
      // Safari has no scrollend yet, so the timer is the one that usually runs.
      const timer = setTimeout(finish, 1000);
      addEventListener("scrollend", finish, { once: true });
    }
  };
}

export const scroll = pointerCoarse ? nativeScroll() : new Lenis({
  autoRaf: true,
  lerp: .1,
  smoothWheel: true,
  syncTouch: false,
  prevent: node => node.matches(".lang-menu, .lightbox"),
  respectReducedMotion: true
});

function anchorPosition(target) {
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const chapter = target.classList.contains("journey-stop") && target.closest(".journey-on") ? target.closest(".journey-chapter") : null;
  const top = chapter ? chapter.getBoundingClientRect().top + scrollY + target.offsetTop : target.getBoundingClientRect().top + scrollY;
  return Math.min(Math.max(0, top - margin), scroll.limit);
}

// Anchor travel eases in and out, and far sections get a little more time, so
// the car glides along the garden path instead of snapping to the destination.
const easeInOutQuart = t => t < .5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
function glide(target, onComplete) {
  const destination = anchorPosition(target);
  const distance = Math.abs(destination - scrollY);
  scroll.scrollTo(destination, {
    duration: Math.min(1.6, .7 + distance / 3200),
    easing: easeInOutQuart,
    onComplete
  });
}

// Keep hash links on the same animation, avoiding a simultaneous native jump.
document.addEventListener("click", event => {
  const link = event.target.closest("a[href]");
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
  const url = new URL(link.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
  const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!target) return;
  event.preventDefault();
  if (location.hash !== url.hash) history.pushState(null, "", url.hash);
  glide(target, () => {
    const hadTabIndex = target.hasAttribute("tabindex");
    if (!hadTabIndex) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    if (!hadTabIndex) target.removeAttribute("tabindex");
  });
});

// Address-bar fragments and history navigation need the same stable destination.
window.addEventListener("hashchange", () => {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) glide(target);
});

// The existing lightbox locks body scrolling. Stop any remaining momentum
// as soon as it opens, then return control when the dialog closes.
function syncScrollLock() {
  if (getComputedStyle(document.body).overflowY === "hidden") scroll.stop();
  else scroll.start();
}
new MutationObserver(syncScrollLock).observe(document.body, { attributes: true, attributeFilter: ["style"] });
syncScrollLock();
