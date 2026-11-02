/* ==========================================================================
   background-effects.js · 背景画布 / 点击水波纹 / 指针后方不断冒出的粉色爱心拖尾
   ========================================================================== */
(function () {
  "use strict";

  var canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 点击水波纹读取 --canvas-accent，深色模式下自动换色
  function accentRgb() {
    var value = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--canvas-accent")
      .trim();
    return value || "0, 47, 167";
  }
  var RIPPLE_LIFE = 1200;
  var RIPPLE_MAX = 320;

  // 爱心拖尾：粉色系随机取用
  var PINKS = ["255,64,129", "246,51,122", "255,105,164", "255,143,188"];
  var HEART_LIFE = 600; // 单颗爱心存活时长（毫秒）
  var HEART_MAX = 120; // 同屏爱心上限
  var HEART_STEP = 12; // 快速移动时沿路径每隔多少像素冒一颗
  var HEART_INTERVAL = 70; // 慢速移动时的补发间隔（毫秒）
  var HEART_FOLLOW = 0.22; // 拖尾跟随指针的平滑系数
  var TAU = Math.PI * 2;

  var width = 0;
  var height = 0;
  var dpr = 1;
  var ripples = [];
  var hearts = [];
  var tail = null;
  var lastEmit = null;
  var lastHeartAt = 0;
  var rafId = 0;
  var running = false;
  var resizeTimer = 0;

  function drawRipples(now) {
    for (var r = 0; r < ripples.length; r += 1) {
      var ripple = ripples[r];
      var age = now - ripple.started;
      if (age < 0 || age > RIPPLE_LIFE) continue;
      var progress = age / RIPPLE_LIFE;
      var radius = progress * RIPPLE_MAX;

      for (var w = 0; w < 3; w += 1) {
        var ringRadius = radius - w * 24;
        if (ringRadius <= 0) continue;
        var alpha = 0.2 * (1 - progress) * (1 - w * 0.28);
        if (alpha <= 0) continue;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(" + ripple.color + "," + alpha.toFixed(3) + ")";
        ctx.lineWidth = w === 0 ? 1.6 : 1;
        ctx.arc(ripple.x, ripple.y, ringRadius, 0, TAU);
        ctx.stroke();
      }

      var halo = 0.1 * Math.max(0, 1 - progress * 4);
      if (halo > 0) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + ripple.color + "," + halo.toFixed(3) + ")";
        ctx.arc(ripple.x, ripple.y, 3 + progress * 6, 0, TAU);
        ctx.fill();
      }
    }
  }

  /* 爱心路径：视觉中心在 (75, 72.5)，半高约 47.5（绘制时按此归一化缩放） */
  function heartPath() {
    ctx.beginPath();
    ctx.moveTo(75, 40);
    ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
    ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
    ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
    ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
    ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
    ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
    ctx.closePath();
  }

  function drawHearts(now) {
    for (var i = 0; i < hearts.length; i += 1) {
      var heart = hearts[i];
      var age = now - heart.born;
      if (age < 0 || age > HEART_LIFE) continue;

      var k = age / HEART_LIFE;

      // 冒出：前 150ms 由小到大弹出，带轻微过冲
      var pop = Math.min(1, age / 150);
      var back = 1 + 2.70158 * Math.pow(pop - 1, 3) + 1.70158 * Math.pow(pop - 1, 2);
      var scale = (heart.r * back) / 47.5;

      // 快速淡入，尾段淡出
      var alpha = 0.85 * Math.min(1, age / 70) * Math.min(1, (1 - k) / 0.35);
      if (alpha <= 0) continue;

      // 缓缓上浮并左右轻摆
      var x = heart.x + heart.drift * age;
      var y = heart.y - heart.rise * age;
      var rot = heart.rot + Math.sin(age * 0.008 + heart.sway) * 0.16;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(scale, scale);
      ctx.translate(-75, -72.5);
      heartPath();
      ctx.fillStyle = "rgba(" + heart.color + "," + alpha.toFixed(3) + ")";
      ctx.fill();
      ctx.restore();
    }
  }

  function draw(now) {
    for (var i = ripples.length - 1; i >= 0; i -= 1) {
      if (now - ripples[i].started > RIPPLE_LIFE) ripples.splice(i, 1);
    }
    for (var j = hearts.length - 1; j >= 0; j -= 1) {
      if (now - hearts[j].born > HEART_LIFE) hearts.splice(j, 1);
    }

    ctx.clearRect(0, 0, width, height);
    drawRipples(now);
    drawHearts(now);
  }

  function frame(now) {
    draw(now);
    if (ripples.length || hearts.length) {
      rafId = window.requestAnimationFrame(frame);
    } else {
      running = false;
      rafId = 0;
    }
  }

  function start() {
    if (running) return;
    running = true;
    rafId = window.requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!running) ctx.clearRect(0, 0, width, height);
  }

  function onResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 140);
  }

  /* 在 (x,y) 附近随机位置冒出一颗爱心 */
  function spawnHeart(x, y, now) {
    hearts.push({
      x: x + (Math.random() - 0.5) * 14,
      y: y + (Math.random() - 0.5) * 14,
      r: 3.4 + Math.random() * 2,
      rot: (Math.random() - 0.5) * 0.5,
      sway: Math.random() * TAU,
      drift: (Math.random() - 0.5) * 0.03,
      rise: 0.02 + Math.random() * 0.03,
      color: PINKS[(Math.random() * PINKS.length) | 0],
      born: now,
    });
    if (hearts.length > HEART_MAX) hearts.shift();
  }

  function emitHearts(x, y, now) {
    var dx = x - lastEmit.x;
    var dy = y - lastEmit.y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    // 快速移动：沿拖尾路径等距补满
    if (dist >= HEART_STEP) {
      var ux = dx / dist;
      var uy = dy / dist;
      var travelled = 0;
      while (dist - travelled >= HEART_STEP) {
        travelled += HEART_STEP;
        spawnHeart(lastEmit.x + ux * travelled, lastEmit.y + uy * travelled, now);
      }
      lastEmit.x += ux * travelled;
      lastEmit.y += uy * travelled;
      lastHeartAt = now;
      start();
      return;
    }

    // 缓慢移动或几乎停下：按时间间隔继续冒出
    if (dist > 1.5 && now - lastHeartAt >= HEART_INTERVAL) {
      spawnHeart(x, y, now);
      lastEmit.x = x;
      lastEmit.y = y;
      lastHeartAt = now;
      start();
    }
  }

  function onPointerMove(event) {
    var type = event.pointerType || "mouse";
    if (type !== "mouse" && type !== "pen") return;

    var x = event.clientX;
    var y = event.clientY;
    var now = window.performance.now();

    if (!tail) {
      tail = { x: x, y: y };
      lastEmit = { x: x, y: y };
      lastHeartAt = now;
      return;
    }

    tail.x += (x - tail.x) * HEART_FOLLOW;
    tail.y += (y - tail.y) * HEART_FOLLOW;
    emitHearts(tail.x, tail.y, now);
  }

  function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;
    ripples.push({
      x: event.clientX,
      y: event.clientY,
      started: window.performance.now(),
      color: accentRgb(),
    });
    if (ripples.length > 3) ripples.shift();
    start();
  }

  function onPointerOut(event) {
    if (event.relatedTarget) return;
    tail = null;
    lastEmit = null;
  }

  function onVisibilityChange() {
    if (document.hidden) {
      stop();
    } else if (ripples.length || hearts.length) {
      start();
    }
  }

  resize();

  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointerout", onPointerOut);
  document.addEventListener("visibilitychange", onVisibilityChange);
})();
