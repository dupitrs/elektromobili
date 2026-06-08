/* =====================================================================
   Elektromobilis Rundālē — interactions
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- English dictionary (LV is the source in the HTML) ---------- */
  var EN = {
    "a11y.skip": "Skip to content",
    "nav.experience": "Experience",
    "nav.included": "Included",
    "nav.languages": "Languages",
    "nav.gallery": "Gallery",
    "nav.visit": "Visit",
    "nav.contact": "Contact",
    "nav.book": "Book",

    "hero.eyebrow": "May – October · Rundāle Palace Garden",
    "hero.title": "Aristocratic leisure in the Rundāle Palace garden",
    "hero.sub": "Every year we invite you to enjoy an approximately 20-minute ride through the most beautiful places of the French garden, with commentary in 13 languages.",
    "hero.cta1": "Book a ride",
    "hero.priceUnit": "/ per person",

    "exp.eyebrow": "The experience",
    "exp.title": "A moment of royal serenity",
    "exp.p1": "Every year from May to October we invite you to enjoy aristocratic leisure in the Rundāle Palace garden, where a historic landscape meets beauty and silence.",
    "exp.p2": "Allow yourself a moment of royal serenity. Watch the garden's splendour and listen to stories of the garden and its history. We are here to make your visit to Rundāle special.",
    "exp.quote": "“Where history meets silence.”",
    "exp.years": "years' experience",
    "years.label": "years' experience",

    "offer.eyebrow": "In the offer",
    "offer.title": "Everything for an unhurried outing",
    "offer.lead": "A quiet, exclusive ride through Rundāle Palace's French garden. The tour starts and ends at the garden entrance.",
    "offer.i1t": "The finest garden spots",
    "offer.i1d": "A ride through Rundāle Palace's French garden.",
    "offer.i2t": "Commentary in 13 languages",
    "offer.i2d": "A tour almost everyone can understand. Clear narration for every guest.",
    "offer.i3t": "Royal serenity",
    "offer.i3d": "A calm outing, perfectly suited to couples, families and every guest.",

    "ticket.label": "Tour pass",
    "ticket.priceUnit": "per person",
    "ticket.r1l": "Duration",
    "ticket.r2l": "Languages",
    "ticket.r3l": "Hours",
    "ticket.r3v": "11:00–17:00",
    "ticket.r4l": "Start",
    "ticket.r4v": "at the garden entrance",
    "ticket.cta": "Get in touch",

    "lang.eyebrow": "13 languages",
    "lang.title": "Commentary in 13 languages",
    "lang.sub": "A tour almost everyone can understand, no matter which corner of the world you've come from.",
    "lang.lv1": "Latvian", "lang.lv2": "Estonian", "lang.lv3": "English", "lang.lv4": "Spanish",
    "lang.lv5": "Lithuanian", "lang.lv6": "French", "lang.lv7": "Italian", "lang.lv8": "Korean",
    "lang.lv9": "German", "lang.lv10": "Japanese", "lang.lv11": "Greek", "lang.lv12": "Finnish", "lang.lv13": "Russian",

    "gallery.eyebrow": "Gallery",
    "gallery.title": "Moments from the garden",

    "visit.eyebrow": "Visit",
    "visit.title": "Plan your ride",
    "visit.season": "Season",
    "visit.seasonV": "From May to October",
    "visit.hours": "Opening hours",
    "visit.hoursV": "Every day 11:00–17:00",
    "visit.price": "Price",
    "visit.priceV": "€5 per person",
    "visit.duration": "Duration",
    "visit.durationV": "About 20 minutes",
    "visit.place": "Place",
    "visit.placeV": "Rundāle Palace garden and surroundings",
    "visit.start": "Start and finish",
    "visit.startV": "At the garden entrance",
    "visit.rainTitle": "In rainy weather",
    "visit.rainText": "Tours are not held in rainy weather. We recommend keeping an eye on the forecast.",

    "contact.eyebrow": "Contact",
    "contact.title": "See you in the Rundāle Palace garden!",
    "contact.sub": "Get in touch to book a ride or ask a question. We'll be glad to make your visit to Rundāle special.",
    "contact.callLabel": "Phone",
    "contact.waLabel": "WhatsApp",
    "contact.emailLabel": "Email",
    "contact.addressLabel": "Address",
    "contact.ctaCall": "Call",
    "contact.ctaEmail": "Write an email",
    "contact.sign": "See you in the Rundāle Palace garden!",
    "contact.mapLink": "Open in Google Maps →",

    "footer.tagline": "Aristocratic leisure in the Rundāle Palace garden by electric car.",
    "footer.credit": "Made by"
  };

  var TITLES = {
    lv: "Elektromobilis Rundālē · ekskursijas ar elektromobili pa Rundāles pils dārzu",
    en: "Elektromobilis Rundālē · electric-car tours of the Rundāle Palace garden"
  };

  var i18nNodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n]"));
  // Capture the original Latvian text on each node.
  i18nNodes.forEach(function (el) { el.setAttribute("data-lv", el.textContent); });

  function applyLang(lang) {
    var en = lang === "en";
    i18nNodes.forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      el.textContent = en ? (EN[key] != null ? EN[key] : el.getAttribute("data-lv")) : el.getAttribute("data-lv");
    });
    document.documentElement.lang = lang;
    document.title = TITLES[lang] || TITLES.lv;
    document.querySelectorAll(".lang-toggle button").forEach(function (b) {
      var active = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });
    try { localStorage.setItem("erm-lang", lang); } catch (e) {}
  }

  document.querySelectorAll(".lang-toggle button").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
  });

  var savedLang = "lv";
  try { savedLang = localStorage.getItem("erm-lang") || "lv"; } catch (e) {}
  if (savedLang === "en") applyLang("en");

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 30) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");
  function closeNav() {
    nav.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
  navToggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Aizvērt izvēlni" : "Atvērt izvēlni");
  });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
  window.addEventListener("resize", function () { if (window.innerWidth > 860) closeNav(); });

  /* ---------- Reveal on scroll ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Active nav link ---------- */
  var sections = ["pieredze", "ieklauts", "valodas", "galerija", "apmeklejums", "kontakti"]
    .map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var navLinks = {};
  nav.querySelectorAll("a").forEach(function (a) {
    var id = a.getAttribute("href").replace("#", "");
    navLinks[id] = a;
  });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          Object.keys(navLinks).forEach(function (k) { navLinks[k].classList.remove("active"); });
          if (navLinks[e.target.id]) navLinks[e.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var galItems = Array.prototype.slice.call(document.querySelectorAll(".gal-item"));
  var slides = galItems.map(function (b) {
    var img = b.querySelector("img");
    return { src: b.getAttribute("data-full"), alt: img ? img.alt : "" };
  });
  var current = 0;
  var lastFocus = null;

  function showSlide(i) {
    current = (i + slides.length) % slides.length;
    lbImg.src = slides[current].src;
    lbImg.alt = slides[current].alt;
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    showSlide(i);
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("open"); });
    document.body.style.overflow = "hidden";
    document.getElementById("lbClose").focus();
  }
  function closeLb() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(function () { lb.hidden = true; lbImg.src = ""; }, 280);
    if (lastFocus) lastFocus.focus();
  }
  galItems.forEach(function (b, i) { b.addEventListener("click", function () { openLb(i); }); });
  document.getElementById("lbClose").addEventListener("click", closeLb);
  document.getElementById("lbPrev").addEventListener("click", function () { showSlide(current - 1); });
  document.getElementById("lbNext").addEventListener("click", function () { showSlide(current + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowLeft") showSlide(current - 1);
    else if (e.key === "ArrowRight") showSlide(current + 1);
  });

  /* ---------- Hero video + parallax scroll ---------- */
  var heroEl = document.querySelector(".hero");
  var heroMedia = document.querySelector(".hero-media");
  var heroContent = document.querySelector(".hero-content");
  var heroVideo = document.querySelector(".hero-video");
  if (heroVideo) {
    if (reduce) {
      heroVideo.removeAttribute("autoplay");
      try { heroVideo.pause(); } catch (e) {}
      document.body.classList.add("no-hero-video");
    } else {
      heroVideo.muted = true;
      var pp = heroVideo.play();
      if (pp && pp.catch) pp.catch(function () { document.body.classList.add("no-hero-video"); });
    }
  }
  if (!reduce && heroEl && heroMedia) {
    var hticking = false;
    var onHeroParallax = function () {
      if (hticking) return;
      hticking = true;
      requestAnimationFrame(function () {
        var h = heroEl.offsetHeight || window.innerHeight;
        var p = Math.min(1, Math.max(0, window.scrollY / h));
        heroMedia.style.transform = "scale(" + (1 + p * 0.12).toFixed(4) + ") translateY(" + (p * 4).toFixed(2) + "%)";
        if (heroContent) {
          heroContent.style.transform = "translateY(" + (p * -38).toFixed(1) + "px)";
          heroContent.style.opacity = Math.max(0, 1 - p * 1.15).toFixed(3);
        }
        hticking = false;
      });
    };
    window.addEventListener("scroll", onHeroParallax, { passive: true });
    onHeroParallax();
  }

  /* ---------- Languages: staggered reveal as you scroll ---------- */
  var langItems = document.querySelectorAll(".lang-list li");
  if (langItems.length && !reduce && "IntersectionObserver" in window) {
    langItems.forEach(function (li, i) {
      li.classList.add("reveal");
      li.style.transitionDelay = ((i % 3) * 70 + Math.floor(i / 3) * 55) + "ms";
    });
    var lio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target;
          el.classList.add("in");
          lio.unobserve(el);
          setTimeout(function () { el.classList.remove("reveal", "in"); el.style.transitionDelay = ""; }, 950);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    langItems.forEach(function (li) { lio.observe(li); });
  }

  /* ---------- Footer year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Background music ---------- */
  var audio = document.getElementById("bgAudio");
  var audioBtn = document.getElementById("audioToggle");
  if (audio && audioBtn) {
    audio.volume = 0.35;
    audio.loop = true;
    var AUDIO_LABEL = {
      lv: { on: "Izslēgt mūziku", off: "Ieslēgt mūziku" },
      en: { on: "Turn music off", off: "Turn music on" }
    };

    function audioUI() {
      var playing = !audio.paused && !audio.muted;
      audioBtn.classList.toggle("is-muted", !playing);
      audioBtn.classList.toggle("is-playing", playing);
      audioBtn.setAttribute("aria-pressed", playing ? "true" : "false");
      var lang = document.documentElement.lang === "en" ? "en" : "lv";
      audioBtn.setAttribute("aria-label", playing ? AUDIO_LABEL[lang].on : AUDIO_LABEL[lang].off);
    }

    function audioPlay() {
      audio.muted = false;
      if (audio.preload !== "auto") audio.preload = "auto"; // fetch the mp3 only now
      var pr = audio.play();
      if (pr && pr.catch) pr.catch(function () {});
    }

    // Browsers block sound until the visitor interacts, so start on the very
    // first gesture anywhere (scroll / tap / click / key). This is as close to
    // "plays on entry" as browser autoplay policy allows, and it keeps the mp3
    // out of the initial load (preload stays "none" until that first gesture).
    var GESTURES = ["pointerdown", "keydown", "touchstart", "wheel", "scroll"];
    function removeFirstGesture() {
      GESTURES.forEach(function (ev) { window.removeEventListener(ev, firstGesture, true); });
    }
    function firstGesture(e) {
      if (audioBtn.contains(e.target)) { removeFirstGesture(); return; }
      if (audio.paused) audioPlay();
      removeFirstGesture();
    }
    GESTURES.forEach(function (ev) { window.addEventListener(ev, firstGesture, true); });

    audioBtn.addEventListener("click", function () {
      if (audio.paused || audio.muted) audioPlay();
      else audio.pause();
    });

    audio.addEventListener("play", audioUI);
    audio.addEventListener("pause", audioUI);
    audio.addEventListener("volumechange", audioUI);
    // Keep the button's aria-label in sync when the language is switched.
    document.querySelectorAll(".lang-toggle button").forEach(function (b) {
      b.addEventListener("click", audioUI);
    });
    audioUI();
  }
})();
