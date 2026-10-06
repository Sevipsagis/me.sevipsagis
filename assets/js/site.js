// Progressive enhancement: without this file every section renders as one long page.
(function () {
  "use strict";

  var root = document.documentElement;
  var views = ["profile", "experience", "skills", "contact"];
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var wipe = document.querySelector(".wipe");
  var hero = document.querySelector(".hero");
  var menuLinks = Array.prototype.slice.call(document.querySelectorAll(".menu a"));
  var desc = document.querySelector(".menu-desc span");
  var current = null;
  var lastMenuLink = menuLinks[0];
  var busy = false;

  // Where the last click or key press happened; the ripple wipe spreads from there.
  var origin = null;

  document.addEventListener("pointerdown", function (event) {
    origin = { x: event.clientX, y: event.clientY };
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== "Escape") return;
    var el = event.key === "Enter" ? document.activeElement : null;
    if (el && el.getBoundingClientRect) {
      var r = el.getBoundingClientRect();
      origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    } else {
      origin = null;
    }
  }, true);

  function select(link) {
    menuLinks.forEach(function (a) {
      a.classList.toggle("is-active", a === link);
    });
    lastMenuLink = link;
    if (desc.textContent !== link.dataset.desc) {
      desc.textContent = link.dataset.desc;
      desc.classList.remove("is-new");
      void desc.offsetWidth;
      desc.classList.add("is-new");
    }
  }

  menuLinks.forEach(function (link) {
    link.addEventListener("mouseenter", function () { select(link); });
    link.addEventListener("focus", function () { select(link); });
  });

  function viewFromHash() {
    var id = window.location.hash.slice(1);
    return views.indexOf(id) === -1 ? "menu" : id;
  }

  function screenFor(view) {
    return view === "menu" ? hero : document.getElementById(view);
  }

  function replay(el) {
    el.classList.remove("is-entering");
    void el.offsetWidth;
    el.classList.add("is-entering");
  }

  function apply(view, focus) {
    root.dataset.view = view;
    window.scrollTo(0, 0);
    var screen = screenFor(view);
    replay(screen);
    if (!focus) return;
    if (view === "menu") {
      lastMenuLink.focus({ preventScroll: true });
    } else {
      screen.querySelector("h2").focus({ preventScroll: true });
    }
  }

  function show(view, focus) {
    if (view === current) return;
    var first = current === null;
    current = view;
    if (view !== "menu") {
      var link = menuLinks.filter(function (a) { return a.hash === "#" + view; })[0];
      if (link) select(link);
    }
    if (first || reduceMotion.matches) {
      apply(view, focus && !first);
      return;
    }
    busy = true;
    wipe.style.setProperty("--x", origin ? origin.x + "px" : "50%");
    wipe.style.setProperty("--y", origin ? origin.y + "px" : "50%");
    origin = null;
    wipe.classList.remove("is-out");
    wipe.classList.add("is-in");
    window.setTimeout(function () {
      apply(view, focus);
      wipe.classList.remove("is-in");
      wipe.classList.add("is-out");
      window.setTimeout(function () {
        wipe.classList.remove("is-out");
        busy = false;
      }, 560);
    }, 480);
  }

  window.addEventListener("hashchange", function () {
    show(viewFromHash(), true);
  });

  document.addEventListener("keydown", function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey || busy) return;
    if (event.key === "Escape" && current !== "menu") {
      event.preventDefault();
      window.location.hash = "menu";
      return;
    }
    if (current !== "menu") return;
    var step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    var index = menuLinks.indexOf(document.activeElement);
    if (index === -1) index = menuLinks.indexOf(lastMenuLink) - step;
    var next = menuLinks[(index + step + menuLinks.length) % menuLinks.length];
    next.focus();
  });

  select(menuLinks[0]);
  show(viewFromHash(), false);
})();
