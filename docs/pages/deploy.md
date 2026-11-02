---
title: 子域名与部署
description: 三个目录对应三个独立站点，配置子域名和 DNS。
lede: 三个目录可以分别托管，也可以放在同一台服务器上。
---

## 托管方式 {#hosting}

三个目录对应三个独立的托管项目。以 GitHub Pages 为例，一个仓库只能绑定一个自定义域名，所以三个子域需要三个仓库；用 Cloudflare Pages、Netlify 这类支持多项目的平台，也可以在一个仓库里建三个站点，构建目录分别填根目录、blog/、docs/。

## 域名 {#domains}

DNS 上给 blog 和 docs 各加一条 CNAME，指向托管商给的地址；根域名按托管商要求配置 A 记录或 CNAME。三个目录里的 CNAME 文件已经写好对应域名，GitHub Pages 会读取它：

```text
reversedeer.com
blog.reversedeer.com
docs.reversedeer.com
```

如果图省事把整个仓库部署到 reversedeer.com，blog/ 和 docs/ 也会出现在 reversedeer.com/blog/ 与 /docs/ 下。那只是副本，规范地址是子域名，页面里的 canonical 已经指向子域名。
