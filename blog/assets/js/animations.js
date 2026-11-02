/* animations.js · 标题拆字、首屏入场和滚动渐显 */

(function () {
  "use strict";

  var root = document.documentElement;

  var nodes = function (selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  };

  var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  function prefersReduced() {
    return reduceQuery.matches;
  }

  // 接管页面动效，保留 head 内联脚本的失败兜底。
  root.dataset.motion = "on";
  root.classList.add("js");

  function initSplitHero() {
    var title = document.querySelector(".hero__title");
    if (!title || title.hasAttribute("data-split")) return;
    if (prefersReduced()) return;

    var lines = nodes(".hero__title .line");
    if (!lines.length) return;

    function wrapTextNodes(container) {
      var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
      var textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);

      textNodes.forEach(function (node) {
        var text = node.nodeValue;
        if (!text || !text.replace(/\s/g, "")) return;
        var frag = document.createDocumentFragment();
        for (var i = 0; i < text.length; i += 1) {
          var ch = text.charAt(i);
          if (/\s/.test(ch)) {
            frag.appendChild(document.createTextNode(ch));
            continue;
          }
          var outer = document.createElement("span");
          outer.className = "char";
          var inner = document.createElement("span");
          inner.className = "char__i";
          inner.textContent = ch;
          outer.appendChild(inner);
          frag.appendChild(outer);
        }
        node.parentNode.replaceChild(frag, node);
      });
    }

    try {
      lines.forEach(function (line) {
        wrapTextNodes(line);
      });
    } catch (err) {
      return;
    }

    var index = 0;
    nodes(".hero__title .char__i").forEach(function (el) {
      el.style.setProperty("--ci", String(index));
      index += 1;
    });

    title.setAttribute("data-split", "on");
    // H1 上有 aria-label，拆开的字对辅助技术隐藏，避免逐字朗读
    lines.forEach(function (line) {
      line.setAttribute("aria-hidden", "true");
    });
  }

  function initEntrance() {
    var done = false;
    function markLoaded() {
      if (done) return;
      done = true;
      document.body.classList.add("is-loaded");
      // 入场 900ms 结束，950ms 时兜底钉住终态：动画被打断也不会停在半截
      window.setTimeout(function () {
        document.body.classList.add("is-settled");
      }, 950);
    }
    if (document.readyState === "complete") {
      markLoaded();
    } else {
      window.addEventListener("load", markLoaded, { once: true });
      // 兜底：慢资源卡住时也要放行，避免首屏永远藏着
      window.setTimeout(markLoaded, 1200);
    }
  }

  function initReveal() {
    var items = nodes(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    items.forEach(function (el) {
      io.observe(el);
    });
  }

  function boot() {
    initSplitHero();
    initEntrance();
    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
