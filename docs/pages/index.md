---
title: 概览
description: Reversedeer 三个站点的搭建说明：目录结构、子域名部署、设计令牌与动效约定。
lede: 三个站怎么分开部署、文件放在哪、动效怎么降级，都写在下面。
---

## 三个站点 {#sites}

站拆成了三个可以独立部署的站点：主页、博客、文档。它们共用同一套设计令牌与动效规则，但各自带一份资源，互不依赖。

<div class="docs-table-wrap">
  <table class="docs-table">
    <caption class="sr-only">三个站点与目录、域名的对应关系</caption>
    <thead>
      <tr><th scope="col">目录</th><th scope="col">域名</th><th scope="col">内容</th></tr>
    </thead>
    <tbody>
      <tr><td><code>根目录</code></td><td><code>reversedeer.com</code></td><td>首页与关于</td></tr>
      <tr><td><code>blog/</code></td><td><code>blog.reversedeer.com</code></td><td>博客列表与文章</td></tr>
      <tr><td><code>docs/</code></td><td><code>docs.reversedeer.com</code></td><td>这份文档</td></tr>
    </tbody>
  </table>
</div>

## 构建与部署 {#build}

1. 三个目录各自带 assets，可以单独打包上传。
2. 部署端没有构建步骤，改完 HTML 或 CSS，刷新浏览器即可看到结果；博客和文档先在本地运行 `npm run build` 生成再提交。
3. 站点之间用绝对地址互链，部署上线后自然生效。

博客和文档的源文件都在仓库里，生成的 HTML 要和 Markdown 一起提交。文档页由 `docs/pages/` 下的 Markdown 生成，改完运行 `npm run build:docs`。
