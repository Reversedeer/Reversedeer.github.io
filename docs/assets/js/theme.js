/* theme.js · 深色模式切换和偏好保存 */

(function () {
  "use strict";

  function initTheme() {
    var toggle = document.querySelector("[data-theme-toggle]");
    var meta = document.querySelector('meta[name="theme-color"]');
    var root = document.documentElement;
    var transitionTimer = 0;
    var LIGHT = "#FFFFFF";
    var DARK = "#0F1115";

    function isDark() {
      return root.getAttribute("data-theme") === "dark";
    }

    function sync() {
      var dark = isDark();
      if (toggle) toggle.setAttribute("aria-checked", dark ? "true" : "false");
      if (meta) meta.setAttribute("content", dark ? DARK : LIGHT);
    }

    sync();
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.classList.add("theme-transition");
      window.clearTimeout(transitionTimer);
      transitionTimer = window.setTimeout(function () {
        root.classList.remove("theme-transition");
      }, 420);

      if (next === "dark") {
        root.setAttribute("data-theme", "dark");
      } else {
        root.removeAttribute("data-theme");
      }
      try {
        localStorage.setItem("theme", next);
      } catch (err) {}
      sync();
    });
  }

  function boot() {
    initTheme();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
