// Start the garden worker while the rest of the page's module graph downloads.
// Both the head script and journey.js share this one module instance.
export const gardenPainter = { worker: null, error: null };
try {
  if (window.Worker && HTMLCanvasElement.prototype.transferControlToOffscreen) {
    gardenPainter.worker = new Worker(new URL("./journey-worker.js?v=20260927-mobile-3", import.meta.url), { type: "module" });
    gardenPainter.worker.onerror = event => {
      event.preventDefault();
      gardenPainter.error = new Error(event.message);
    };
  }
} catch (error) {
  gardenPainter.error = error;
}
