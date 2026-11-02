/* footer.js · 页尾年份 */

(function () {
  "use strict";

  var nodes = function (selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  };

  function initYear() {
    var year = String(new Date().getFullYear());
    nodes("[data-year]").forEach(function (el) {
      el.textContent = year;
    });
  }

  function boot() {
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
