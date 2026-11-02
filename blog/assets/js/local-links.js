/* local-links.js · 本地预览时改写跨站链接 */

(function () {
  "use strict";

  var nodes = function (selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  };

  function initDevLinks() {
    var host = window.location.hostname;
    var isFile = window.location.protocol === "file:";
    var isLocal =
      isFile || host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "::1";
    if (!isLocal) return;

    var ORIGINS = {
      "reversedeer.com": "",
      "blog.reversedeer.com": "blog/",
      "docs.reversedeer.com": "docs/",
    };
    var inSubdir =
      /\/blog\//.test(window.location.pathname) || /\/docs\//.test(window.location.pathname);

    nodes("a[href]").forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href) return;
      var url;
      try {
        url = new URL(href, window.location.href);
      } catch (err) {
        return;
      }
      if (!Object.prototype.hasOwnProperty.call(ORIGINS, url.hostname)) return;

      var rest = url.pathname.replace(/^\//, "") || "index.html";
      var local;
      if (isFile) {
        local = (inSubdir ? "../" : "") + ORIGINS[url.hostname] + rest;
      } else {
        local = "/" + ORIGINS[url.hostname] + rest;
        if (local === "/") local = "/index.html";
      }
      if (url.search) local += url.search;
      if (url.hash) local += url.hash;
      link.setAttribute("href", local);
    });
  }

  function boot() {
    initDevLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
