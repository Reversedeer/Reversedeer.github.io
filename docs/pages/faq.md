---
title: 常见问题
description: 文档页打开空白、截图布局异常等常见问题的排查。
lede: 先看控制台，再检查样式表路径和脚本加载。
---

## 打开是一片空白 {#faq-blank}

先看控制台。多数情况是样式表路径写错：样式表跟页面在同一层，路径应该是 assets/css/xxx.css。另外 head 里那段内联脚本不能删，它先给 html 挂 .js，三秒内没等到 animations.js 再撤掉。

## 截图里页面像是坏了 {#faq-shot}

那是 headless Chrome 的坑。`--headless=new` 的视口宽度有 500px 下限，写 390 会按 512 布局再裁到 390 输出，看起来就像内容被切断。要看真实的窄屏布局，用 CDP 的 `Emulation.setDeviceMetricsOverride` 设视口。
