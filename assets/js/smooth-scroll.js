import Lenis from "./vendor/lenis.mjs";

// Smooth mouse/trackpad input; touch keeps the platform's native momentum.
// lerp .1 is the exponential follow used on itsoffbrand.com (the Lenis default):
// every frame closes about a tenth of the remaining distance, so one wheel tick
// eases out over roughly a second instead of stopping short. The damping is
// frame-rate independent, so 60 Hz and 144 Hz screens feel the same.
// Lenis updates native scroll positions, which also drive the journey and 17 scenes.
export const scroll = new Lenis({
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
