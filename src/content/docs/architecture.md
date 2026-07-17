---
title: 网站架构
description: Reversedeer 网站的技术路线和部署边界。
slug: docs/architecture
---

## 当前架构

```text
Markdown / Astro / Starlight
            ↓
       GitHub Actions
            ↓
          dist/
            ↓
阿里云 ECS · 1Panel · OpenResty
            ↓
  /www/sites/reversedeer.com/index/dist
```

## 为什么静态优先？

博客、文档、项目页和个人介绍都适合在构建阶段生成。这样服务器只负责提供静态文件，资源占用小、故障面少，也便于备份与迁移。

以后需要登录、后台、表单或数据库时，再为少量功能增加服务端能力，不必推倒现有内容层。

## 部署原则

每次发布先在独立构建环境中得到完整的 `dist/`，确认构建成功后再同步到服务器。OpenResty 只服务发布目录，不参与项目构建。
