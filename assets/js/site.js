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

  // Ransom-note headings: the readable text stays for assistive tech,
  // the cut-out letters are decoration.
  function ransom(el) {
    var text = el.textContent.trim();
    var styled = document.createElement("span");
    styled.className = "ransom";
    styled.setAttribute("aria-hidden", "true");
    var n = 0;
    text.split(/\s+/).forEach(function (word) {
      var w = document.createElement("span");
      w.className = "ransom-word";
      Array.prototype.forEach.call(word, function (ch) {
        var seed = (ch.charCodeAt(0) * 31 + n * 17) % 97;
        var letter = document.createElement("span");
        letter.className = "ransom-letter ransom-letter--" + ((seed % 5) + 1);
        letter.style.setProperty("--r", ((seed % 13) - 6) + "deg");
        letter.style.setProperty("--y", ((seed % 5) - 2) * 0.03 + "em");
        letter.textContent = ch;
        w.appendChild(letter);
        n += 1;
      });
      styled.appendChild(w);
    });
    var plain = document.createElement("span");
    plain.className = "visually-hidden";
    plain.textContent = text;
    el.textContent = "";
    el.appendChild(plain);
    el.appendChild(styled);
  }

  document.querySelectorAll(".ransom-target").forEach(ransom);

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
    wipe.classList.remove("is-out");
    wipe.classList.add("is-in");
    window.setTimeout(function () {
      apply(view, focus);
      wipe.classList.remove("is-in");
      wipe.classList.add("is-out");
      window.setTimeout(function () {
        wipe.classList.remove("is-out");
        busy = false;
      }, 420);
    }, 320);
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
