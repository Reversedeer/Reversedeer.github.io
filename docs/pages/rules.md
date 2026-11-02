---
title: 命名与共享文件
description: 类名前缀、共享文件同步和动效钩子的命名约定。
lede: 页面自己加前缀，公共文件三处同步。
---

## 约定 {#rules-list}

- **命名前缀**：页面自己的类名一律带页面前缀，比如 docs-、blog-、about-。公共类名一个都不要改。
- **共享文件三处同步**：theme.css、header.css、footer.css、animations.css、navigation.js、theme.js 等公共文件 在根目录、blog/assets、docs/assets 各有一份，改完全部同步。
- **动效只挂钩子**：滚动渐显用 `.reveal` 加 `style="--i:n"`，想被磁化的元素挂 `data-magnetic`，想倾斜的挂 `data-tilt`，滚动渐显由 animations.js 处理，磁性与倾斜效果由 pointer-effects.js 处理。
- **断点只有一个**：768px 以下顶栏折叠成汉堡，页面 CSS 的窄屏规则跟着这一档走。
