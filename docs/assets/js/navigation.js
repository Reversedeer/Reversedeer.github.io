/* navigation.js · 顶栏状态和移动菜单 */

(function () {
  "use strict";

  var root = document.documentElement;

  function initNavCondense() {
    var nav = document.querySelector("[data-nav]");
    var sentinel = document.getElementById("nav-sentinel");
    if (!nav || !sentinel || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(
      function (entries) {
        var entry = entries[0];
        if (!entry) return;
        nav.classList.toggle("is-condensed", !entry.isIntersecting);
      },
      { threshold: 0 },
    );

    io.observe(sentinel);
  }

  function initMenu() {
    var nav = document.querySelector("[data-nav]");
    if (!nav) return;
    var toggle = nav.querySelector(".nav-toggle");
    var panel = document.getElementById("site-nav-panel");
    if (!toggle || !panel) return;

    var mq = window.matchMedia("(max-width: 768px)");

    function isOpen() {
      return nav.getAttribute("data-open") === "true";
    }

    function setOpen(open, animate) {
      nav.classList.toggle("is-menu-animating", animate !== false && mq.matches);
      nav.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
      root.classList.toggle("is-menu-open", open && mq.matches);
    }

    toggle.addEventListener("click", function () {
      setOpen(!isOpen());
    });

    panel.addEventListener("click", function (event) {
      var target = event.target;
      var link = target && target.closest ? target.closest("a") : null;
      if (link && mq.matches) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !isOpen()) return;
      setOpen(false);
      toggle.focus();
    });

    function onViewportChange() {
      setOpen(false, false);
    }
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onViewportChange);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(onViewportChange);
    }
  }

  function initMoreMenu() {
    var more = document.querySelector(".nav-more");
    if (!more) return;
    var button = more.querySelector(".nav-more__toggle");
    if (!button) return;
    var compact = window.matchMedia("(min-width: 769px) and (max-width: 1024px)");

    function setOpen(open) {
      more.setAttribute("data-more-open", open ? "true" : "false");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    }

    button.addEventListener("click", function () {
      setOpen(more.getAttribute("data-more-open") !== "true");
    });
    document.addEventListener("click", function (event) {
      if (!more.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || more.getAttribute("data-more-open") !== "true") return;
      setOpen(false);
      button.focus();
    });
    function reset() {
      setOpen(false);
    }
    if (typeof compact.addEventListener === "function") compact.addEventListener("change", reset);
    else if (typeof compact.addListener === "function") compact.addListener(reset);
  }

  function boot() {
    initNavCondense();
    initMenu();
    initMoreMenu();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
