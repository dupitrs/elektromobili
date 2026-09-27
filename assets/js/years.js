import { layoutYears } from "./years-layout.js?v=20260927-mobile-3";
import { onViewportChange } from "./viewport.js?v=20260927-mobile-3";

const section = document.querySelector(".years");
if (section) {
  const layout = () => layoutYears(section);
  layout();
  section.classList.add("is-scroll-scene");
  var stopWatching = onViewportChange(layout);

  async function load() {
    try {
      const module = await import("./years-scene.js?v=20260927-mobile-3");
      await module.createGarden(section);
    } catch (error) {
      section.classList.remove("is-scroll-scene");
      console.warn("Garden preview unavailable:", error);
    } finally {
      stopWatching();
    }
  }
  // The adjoining gardens share this image. Prepare the complete map before
  // it enters view, rather than replacing a photograph during a fast scroll.
  load();
}
