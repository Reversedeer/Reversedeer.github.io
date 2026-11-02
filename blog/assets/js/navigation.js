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

    function setOpen(open) {
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
      if (!mq.matches && isOpen()) setOpen(false);
    }
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onViewportChange);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(onViewportChange);
    }
  }

  function boot() {
    initNavCondense();
    initMenu();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
