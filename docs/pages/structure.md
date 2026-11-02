---
title: 目录结构
description: 三个站点的目录划分，以及各自独立的资源副本。
lede: 每个子站带一份完整资源，文件夹可以单独部署。
---

## 项目目录 {#tree}

```text
Web/
|-- index.html              主页 reversedeer.com
|-- about.html              关于页
|-- CNAME
|-- assets/                 主站资源
|-- scripts/                博客与文档构建脚本
|-- blog/                   blog.reversedeer.com
|   |-- index.html          博客列表（列表区域由脚本维护）
|   |-- posts/              Markdown 文章源文件
|   |-- post.html           由 Markdown 生成的文章页
|   |-- CNAME
|   `-- assets/             博客站独立资源
`-- docs/                   docs.reversedeer.com
    |-- index.html          由 Markdown 生成的文档首页
    |-- *.html              由 Markdown 生成的其他文档页
    |-- pages/              Markdown 文档源文件
    |-- CNAME
    `-- assets/             文档站独立资源
```

每个子站都有自己的 assets/css、assets/js、assets/fonts，复制粘贴即可单独部署，不依赖根目录。代价是共享文件有三份副本，改动要三处同步。

资源文件按用途拆分：顶栏改 `header.css`，页尾改 `footer.css`，配色和尺寸改 `theme.css`；主题切换在 `theme.js`，移动菜单在 `navigation.js`，本地链接在 `local-links.js`。博客列表使用 `blog-list.css`，文章正文使用 `article.css`；文档布局、目录和正文分别在 `docs-layout.css`、`docs-navigation.css`、`docs-content.css`。完整清单见仓库根目录 README.md。
