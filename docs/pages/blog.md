---
title: 新增一篇文章
description: 在 blog/posts 下写 Markdown，运行构建脚本生成文章页和列表。
lede: 文章只需要写 Markdown，构建脚本会生成页面、列表和上一篇下一篇。
---

## 写文章 {#write}

在 `blog/posts/` 下新建 Markdown 文件，开头写 frontmatter，正文直接写 Markdown。小节标题末尾可以加 `{#id}` 指定锚点，省略时按标题文字自动生成。

```markdown
---
title: 文章标题
date: 2026-11-01
description: 一句话摘要
tag: 工程
---

## 小节标题 {#section-id}

正文……
```

## 构建 {#build-post}

然后在仓库根目录运行 `npm run build:blog`。脚本会生成文章页、刷新博客列表与首页的最近在写，并按日期补上文末的上一篇 / 下一篇；`draft: true` 的文章会跳过。首次使用先运行 `npm install`，生成的 HTML 要和 Markdown 一起提交。
