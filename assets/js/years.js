import { layoutYears } from "./years-layout.js?v=20260927-mobile-1";
import { onViewportChange } from "./viewport.js?v=20260927-mobile-1";

const section = document.querySelector(".years");
if (section) {
  const layout = () => layoutYears(section);
  layout();
  section.classList.add("is-scroll-scene");
  var stopWatching = onViewportChange(layout);

  async function load() {
    try {
      const module = await import("./years-scene.js?v=20260927-mobile-1");
      await module.createGarden(section);
    } catch (error) {
      section.classList.remove("is-scroll-scene");
      console.warn("Garden preview unavailable:", error);
    } finally {
      stopWatching();
    }
  }
  if (!("IntersectionObserver" in window)) load();
  else {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect(); load();
    }, { rootMargin: "320px" });
    observer.observe(section);
  }
}
