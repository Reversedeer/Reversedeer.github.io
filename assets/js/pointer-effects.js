/* pointer-effects.js · 磁性按钮和卡片倾斜 */

(function () {
  "use strict";

  var nodes = function (selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  };

  var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  function prefersReduced() {
    return reduceQuery.matches;
  }

  function initMagnetic() {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (prefersReduced()) return;

    var MAX = 6;
    var items = nodes("[data-magnetic]");
    if (!items.length) return;

    items.forEach(function (el) {
      el.classList.add("magnetic");

      el.addEventListener("pointermove", function (event) {
        if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen")
          return;
        var rect = el.getBoundingClientRect();
        var dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        var dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        dx = Math.max(-1, Math.min(1, dx));
        dy = Math.max(-1, Math.min(1, dy));
        el.classList.remove("is-settling");
        el.classList.add("is-tracking");
        el.style.transform =
          "translate3d(" + (dx * MAX).toFixed(2) + "px," + (dy * MAX).toFixed(2) + "px,0)";
      });

      el.addEventListener("pointerleave", function () {
        el.classList.remove("is-tracking");
        el.classList.add("is-settling");
        el.style.transform = "";
      });
    });
  }

  function initTilt() {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (prefersReduced()) return;

    var MAX = 5;
    var items = nodes("[data-tilt]");
    if (!items.length) return;

    items.forEach(function (el) {
      el.classList.add("tilt");

      var rafId = 0;
      var tiltX = 0;
      var tiltY = 0;
      var px = 0;
      var py = 0;

      function apply() {
        rafId = 0;
        el.style.transform =
          "perspective(900px) rotateX(" +
          tiltX.toFixed(2) +
          "deg) rotateY(" +
          tiltY.toFixed(2) +
          "deg)";
        el.style.setProperty("--mx", px.toFixed(1) + "px");
        el.style.setProperty("--my", py.toFixed(1) + "px");
      }

      el.addEventListener("pointermove", function (event) {
        if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen")
          return;
        var rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        px = event.clientX - rect.left;
        py = event.clientY - rect.top;
        tiltX = Math.max(-1, Math.min(1, 1 - (py / rect.height) * 2)) * MAX;
        tiltY = Math.max(-1, Math.min(1, (px / rect.width) * 2 - 1)) * MAX;
        el.classList.remove("is-settling");
        el.classList.add("is-tilting");
        if (!rafId) rafId = window.requestAnimationFrame(apply);
      });

      el.addEventListener("pointerleave", function () {
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
        el.classList.remove("is-tilting");
        el.classList.add("is-settling");
        el.style.transform = "";
        el.style.removeProperty("--mx");
        el.style.removeProperty("--my");
      });
    });
  }

  function boot() {
    initMagnetic();
    initTilt();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
