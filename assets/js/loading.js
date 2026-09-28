(function () {
  const root = document.documentElement;
  const loader = document.getElementById("siteLoader");
  const percent = document.getElementById("siteLoaderPercent");
  const track = document.getElementById("siteLoaderTrack");
  const continueButton = document.getElementById("siteLoaderContinue");
  const started = performance.now();
  let domReady = document.readyState !== "loading";
  let fontsReady = false;
  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    clearInterval(timer);
    clearTimeout(slowTimer);
    clearTimeout(window.siteLoaderFailsafe);
    root.classList.remove("is-loading");
    setTimeout(() => loader.remove(), 500);
  }

  function check() {
    const journey = document.querySelector(".garden-journey");
    const bands = journey?.querySelectorAll(".journey-band") || [];
    const years = document.querySelector(".years");
    const hero = document.querySelector(".hero-fallback");
    const ready = Number(domReady) + Number(fontsReady) + Number(Boolean(hero?.complete && hero.naturalWidth)) +
      Number(Boolean(journey?.classList.contains("is-ready"))) +
      [...bands].filter(band => band.classList.contains("is-painted")).length +
      Number(Boolean(years?.classList.contains("is-3d-ready")));
    const amount = Math.min(100, Math.round(ready / 13 * 100));
    percent.textContent = amount + "%";
    track.style.setProperty("--progress", amount + "%");
    track.setAttribute("aria-valuenow", amount);
    if (ready === 13 && performance.now() - started >= 700) finish();
    else if (ready === 13) setTimeout(finish, 700 - (performance.now() - started));
  }

  const timer = setInterval(check, 120);
  const slowTimer = setTimeout(() => {
    if (finished) return;
    continueButton.hidden = false;
  }, 25000);
  continueButton.addEventListener("click", finish);
  document.addEventListener("erm:loader-failsafe", finish, { once: true });
  document.addEventListener("DOMContentLoaded", () => { domReady = true; check(); }, { once: true });
  document.fonts.ready.then(() => { fontsReady = true; check(); }, () => { fontsReady = true; check(); });
  check();
})();
