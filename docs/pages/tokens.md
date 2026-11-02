---
title: 设计令牌
description: 颜色、圆角、间距和字号都收在 theme.css 里。
lede: 页面只引用变量，不写死色值。
---

## 令牌表 {#tokens-table}

颜色、圆角、间距、字号全部收在各自站点的 assets/css/theme.css 里，页面只引用变量，不写死色值。三个站点的令牌保持一致。下面四个是最常打交道的。

<div class="docs-table-wrap">
  <table class="docs-table">
    <caption class="sr-only">文档页最常用的四个设计令牌</caption>
    <thead>
      <tr><th scope="col">令牌</th><th scope="col">值</th><th scope="col">用途</th></tr>
    </thead>
    <tbody>
      <tr><td><code>--bg</code></td><td><code>#FFFFFF</code></td><td>页面底色，全站最底层</td></tr>
      <tr><td><code>--fg</code></td><td><code>#24211D</code></td><td>标题与正文的文字色</td></tr>
      <tr><td><code>--accent</code></td><td><code>#002FA7</code></td><td>全站唯一的强调色，用于交互状态和重点标记</td></tr>
      <tr><td><code>--radius</code></td><td><code>8px</code></td><td>唯一一档圆角，按钮、代码块、表格边框都用它</td></tr>
    </tbody>
  </table>
</div>

## 使用原则 {#tokens-rules}

想加一个新色值之前先问一句：这个颜色能活到第三次使用吗。不能，就退回上面这几个。
