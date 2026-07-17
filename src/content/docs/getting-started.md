---
title: 开始使用
description: 了解这个网站的内容组织方式和后续维护方法。
slug: docs/getting-started
---

## 这是一个什么网站？

这是一个静态优先的个人网站，包含首页、博客、项目展示和文档中心。内容以 Markdown 为主，修改后由 GitHub Actions 构建并发布到自有服务器。

## 内容如何组织？

- 博客放在 `src/content/blog/`，按发布时间和主题阅读。
- 文档放在 `src/content/docs/`，按目录结构和侧边栏查阅。
- 普通页面放在 `src/pages/`，用于首页、关于和项目展示。

## 如何发布？

本地完成修改后，将代码推送到 GitHub 的 `main` 分支。自动部署流程会构建 `dist/`，再同步到服务器的新站点目录。
