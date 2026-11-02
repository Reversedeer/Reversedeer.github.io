/* back-to-top.js · 回到顶部和浮动按钮显示 */

(function () {
  "use strict";

  var nodes = function (selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  };

  var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  function prefersReduced() {
    return reduceQuery.matches;
  }

  function initToTop() {
    nodes("[data-to-top]").forEach(function (el) {
      el.addEventListener("click", function () {
        var behavior = prefersReduced() ? "auto" : "smooth";
        try {
          window.scrollTo({ top: 0, left: 0, behavior: behavior });
        } catch (err) {
          window.scrollTo(0, 0);
        }
      });
    });
  }

  function initBackToTop() {
    var button = document.querySelector("[data-to-top-float]");
    if (!button) return;

    var lastY = window.scrollY || window.pageYOffset || 0;
    var ticking = false;

    function sync() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset || 0;
      var goingUp = y < lastY;
      lastY = y;
      if (y <= 0) {
        button.classList.remove("is-visible");
        return;
      }
      button.classList.toggle("is-visible", goingUp);
    }

    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(sync);
      },
      { passive: true },
    );
  }

  function boot() {
    initToTop();
    initBackToTop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
