---
title: 动效清单
description: 站点里用到的入场、滚动、背景交互和页面切换。
lede: 所有动效共用同一套驱动方式，并且在 reduced-motion 下降级。
---

## 驱动方式 {#drivers}

动效主要由三类驱动：IntersectionObserver、CSS scroll-driven animation、pointer 事件。正文页的浮动回顶按钮额外使用一个被动、rAF 节流的 `scroll` 监听判断滚动方向，不劫持滚动。

## 动效清单 {#motion-list}

- **首屏逐字入场**：animations.js 把主页标题拆成单字，错峰上升；拆字失败时退回整行入场。
- **滚动渐显**：`.reveal` 加 `--i` 错峰；`.reveal--blur` 模糊聚焦，`.reveal--clip` 裁切揭开。
- **背景交互**：点击或触摸扩散同心水波纹；鼠标移动时在指针后方不断冒出粉色爱心；没有常驻点阵，空闲时画布停止绘制。
- **倾斜卡片**：挂 `data-tilt` 的元素跟随指针倾斜，并用克莱因蓝色光斑标注指针位置。
- **磁性按钮**：挂 `data-magnetic`，最大位移 6px。
- **滚动进度条**：`scroll(root)` 驱动，顶部 2px 克莱因蓝线。
- **滚动漂移**：`.fx-drift` 用 `view()` 时间线做轻微平移，可用 `--fx-from` 等变量调方向。
- **页面切换**：View Transitions，同源导航淡入淡出，跨子域不生效。

所有动效在 `prefers-reduced-motion: reduce` 下退成静态，背景交互一个像素都不画。
