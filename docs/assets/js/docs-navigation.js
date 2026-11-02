/* ==========================================================================
   docs-navigation.js · 文档页
   1. 窄屏把左侧文档目录折成一个可折叠的 details；
   2. 右侧本页目录用 IntersectionObserver 做 scroll-spy。
   不监听 scroll 事件；没有 IntersectionObserver 时静默降级。
   ========================================================================== */
(function () {
  "use strict";

  var nav = document.getElementById("docs-toc");
  var narrow = window.matchMedia("(max-width: 768px)");

  function syncNavMode() {
    if (nav) nav.open = !narrow.matches;
  }
  syncNavMode();
  if (typeof narrow.addEventListener === "function") {
    narrow.addEventListener("change", syncNavMode);
  } else if (typeof narrow.addListener === "function") {
    narrow.addListener(syncNavMode);
  }

  var pageToc = document.querySelector(".docs-page-toc");
  if (!pageToc || !("IntersectionObserver" in window)) return;

  var links = Array.prototype.slice.call(pageToc.querySelectorAll('a[href^="#"]'));
  if (!links.length) return;

  var targets = [];
  var linkById = Object.create(null);

  links.forEach(function (link) {
    var hash = link.getAttribute("href") || "";
    var id = hash.charAt(0) === "#" ? hash.slice(1) : "";
    var section = id ? document.getElementById(id) : null;
    if (!section || linkById[id]) return;
    linkById[id] = link;
    targets.push(section);
  });

  if (!targets.length) return;

  var currentId = "";

  function setCurrent(id) {
    if (id === currentId) return;
    currentId = id;
    links.forEach(function (link) {
      if (link === linkById[id]) {
        link.setAttribute("aria-current", "true");
        link.classList.add("is-current");
      } else {
        link.removeAttribute("aria-current");
        link.classList.remove("is-current");
      }
    });
  }

  // 视口上部 96px 到 30% 之间的一条带：小节标题穿过这条带就算当前
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        setCurrent(entry.target.id);
      });
    },
    { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
  );

  targets.forEach(function (section) {
    observer.observe(section);
  });

  // 点目录项时直接落定当前项：锚点跳转会停在顶栏下方，
  // 不一定会经过判定带，靠观察器等不到这一下
  pageToc.addEventListener("click", function (event) {
    var target = event.target;
    var link = target && target.closest ? target.closest('a[href^="#"]') : null;
    if (!link) return;
    var id = (link.getAttribute("href") || "").slice(1);
    if (id && linkById[id]) setCurrent(id);
  });

  // 带 #hash 打开（刷新、分享链接）时，直接从地址栏落定当前项
  function syncFromHash() {
    var id = (window.location.hash || "").slice(1);
    if (id && linkById[id]) setCurrent(id);
  }
  window.addEventListener("hashchange", syncFromHash);

  setCurrent(targets[0].id);
  syncFromHash();
})();
