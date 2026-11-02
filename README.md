# Reversedeer 的小站

用原生 HTML / CSS / JavaScript 手写的三个站点，没有框架、没有运行时依赖；博客和文档用 Markdown 编写，由本地脚本生成静态 HTML，部署端仍然不需要构建。

| 站点 | 目录 | 域名 |
| --- | --- | --- |
| 主页（含关于） | 根目录 | reversedeer.com |
| 博客 | blog/ | blog.reversedeer.com |
| 项目文档索引与使用文档 | docs/ | docs.reversedeer.com |

## 本地预览

在仓库根目录执行：

```bash
python -m http.server 8130
```

然后打开：

- 主页：http://127.0.0.1:8130/
- 博客：http://127.0.0.1:8130/blog/
- 文档：http://127.0.0.1:8130/docs/

每个站内部的样式、字体、脚本都是相对路径，可以离线跑。跨子域的导航在 HTML 里写的是线上绝对地址；本地（localhost、127.0.0.1、file://）由 local-links.js 自动改写成 /blog/、/docs/ 这样的本地路径，一个静态服务就能预览三个站。

## 目录结构

```text
Web/
|-- index.html          主页（reversedeer.com）
|-- about.html          关于页
|-- CNAME
|-- assets/             主站资源
|-- scripts/            博客与文档构建脚本
|-- blog/               blog.reversedeer.com
|   |-- index.html      博客列表（列表区域由脚本维护）
|   |-- posts/          Markdown 文章源文件
|   |-- post.html       由 Markdown 生成的文章页
|   |-- CNAME
|   `-- assets/
`-- docs/               docs.reversedeer.com
    |-- index.html      由 Markdown 生成的文档首页
    |-- *.html          由 Markdown 生成的其他文档页
    |-- pages/          Markdown 文档源文件与 nav.json
    |-- CNAME
    `-- assets/
```

每个子站的 assets 是完整副本，文件夹可以单独上传，不依赖根目录。公共样式与脚本按用途拆分，三个站点各带一份；修改 header.css、footer.css、theme.css 或对应脚本等公共资源时，需要三处同步。各站主题变量中的版心宽度和文章列表的响应式规则保留各自配置。

资源文件使用小写英文命名，多词之间用连字符连接，按内容或用途命名：

| CSS 文件 | 用途 |
| --- | --- |
| `fonts.css` | 自托管字体 |
| `theme.css` | 浅色、深色主题及颜色、尺寸、间距变量 |
| `reset.css` | 浏览器默认样式重置和页面基础行为 |
| `typography.css` | 标题、正文、等宽字和文字工具类 |
| `layout.css` | 公共版心、内容层级和间距 |
| `accessibility.css` | 键盘焦点、跳过导航、屏幕阅读器和减少动态效果 |
| `branding.css` | LOGO 与站点名称 |
| `controls.css` | 按钮、行内链接和通用图标 |
| `header.css` / `footer.css` | 顶栏与分级收纳菜单 / 分档居中的页尾内容区和版权区 |
| `theme-switch.css` | 主题开关及主题切换过渡 |
| `background-effects.css` | 背景画布 |
| `page-transitions.css` | 页面切换动画 |
| `animations.css` | 首屏入场与滚动渐显 |
| `scroll-effects.css` | 滚动漂移和阅读进度条 |
| `pointer-effects.css` | 磁性按钮与卡片倾斜 |
| `back-to-top.css` | 浮动回顶按钮 |
| `post-list.css` | 文章列表行、段落头及响应式规则 |
| `home.css` / `about.css` | 首页 / 关于页的专属内容与布局 |
| `blog-layout.css` / `blog-header.css` | 博客版心 / 博客及文章标题区域 |
| `blog-list.css` / `article.css` | 博客列表 / 文章正文与上一篇、下一篇 |
| `docs-layout.css` / `docs-header.css` | 文档分栏布局 / 标题与面包屑 |
| `docs-navigation.css` / `docs-content.css` | 文档目录 / 正文、代码和表格 |
| `docs-pagination.css` | 文档底部翻页卡片，顺序来自 docs/pages/nav.json |
| 文档首页 | 复用博客的 blog-layout.css、blog-header.css、blog-list.css 和 post-list.css |

| JavaScript 文件 | 用途 |
| --- | --- |
| `local-links.js` | 本地预览链接改写 |
| `animations.js` | 标题拆字、首屏入场和滚动渐显 |
| `navigation.js` | 顶栏状态与移动菜单 |
| `pointer-effects.js` | 磁性按钮与卡片倾斜 |
| `footer.js` | 页尾年份更新 |
| `back-to-top.js` | 回顶操作及浮动按钮显隐 |
| `theme.js` | 深色模式切换与偏好保存 |
| `background-effects.js` | 点击水波纹与爱心拖尾，共用同一张画布 |
| `docs-navigation.js` | 文档目录折叠与当前小节高亮 |

HTML 直接引用对应文件，无需额外打包。首帧主题初始化和动效加载失败兜底保留在页面 head 中；各脚本独立初始化，不依赖共享的全局对象。

## 发布博客文章

首次使用先安装构建依赖：

```bash
npm install
```

在 `blog/posts/` 下新建 `<slug>.md`，文件开头写 frontmatter：

```markdown
---
title: 文章标题
date: 2026-11-01
description: 列表与搜索引擎摘要用的一句话
lede: 正文开头的导语，可省略
note: 标题下方的补充说明，可省略
tag: 工程
draft: false
---

## 小节标题 {#section-id}

正文……
```

然后运行：

```bash
npm run build:blog
```

脚本会生成 `blog/<slug>.html`，刷新 `blog/index.html` 的文章列表与首页的最近在写，并按日期补上文末的上一篇 / 下一篇。`draft: true` 的文章会跳过。生成的 HTML 要和 Markdown 一起提交，托管平台不需要构建。

`slug` 默认取文件名，需要保留旧地址时可以在 frontmatter 里显式指定，例如样板文章用 `slug: post` 保持 `post.html` 不变。小节标题末尾的 `{#id}` 用来指定锚点，省略时按标题文字自动生成。

## 写文档

文档站也用 Markdown，源文件在 `docs/pages/`。`nav.json` 决定左侧文档目录的分组和页面顺序：

```json
[
  { "group": "文档中心", "pages": ["index"] },
  { "project": "urp-tools", "projectTitle": "URP Tools", "group": "开始使用", "pages": ["urp-tools", "getting-started"] },
  { "project": "dy-video-parser", "projectTitle": "抖音视频解析器", "group": "使用", "pages": ["dy-video-parser", "dy-download"] }
]
```

`project` 决定侧栏和翻页范围，项目之间不会相互串页。文档中心的 frontmatter 使用 `layout: index`，负责项目入口；项目首页的 frontmatter 使用 `date: "YYYY-MM-DD"` 标记文档更新日期，首页列表据此倒序排列。同日更新保持目录中的项目顺序。各项目页面继续使用原有 Markdown 格式。

每个页面是一个 md 文件，frontmatter 写标题、描述和导语，正文按二级标题分节：

```markdown
---
title: 本地预览
description: 一句话摘要
lede: 标题下方的一句话
---

## 启动静态服务 {#serve}

正文……
```

改完运行：

```bash
npm run build:docs
```

脚本会为每个页面生成 `docs/<slug>.html`，首页是 `docs/index.html`。文档首页使用独立模板，沿用博客的年份分组和文章行样式；文档页的左侧目录来自 `nav.json`，右侧本页目录来自当前页面的二级和三级标题，代码块、表格和步骤列表会自动补上文档页样式。`npm run build` 会同时构建博客和文档。

`docs/pages/` 是源文件，上传到服务器时不需要放进网站目录，只上传生成的 `docs/*.html` 和 `assets/`。

## 部署到三个子域名

1. 三个目录分别建一个托管项目。GitHub Pages 一个仓库只能绑定一个自定义域名，所以需要三个仓库；Cloudflare Pages、Netlify 这类平台可以在一个仓库里建三个项目，构建目录分别填根目录、blog/、docs/。
2. DNS 给 blog 和 docs 各加一条 CNAME，指向托管商提供的地址；根域名按托管商要求配置 A 记录或 CNAME。
3. 三个目录里的 CNAME 文件已经写好对应域名，GitHub Pages 会读取。

如果直接把整个仓库部署到 reversedeer.com，blog/ 和 docs/ 也会出现在 /blog/ 与 /docs/ 下，那只是副本，规范地址是子域名。

## 日常修改

| 要改什么 | 改哪里 |
| --- | --- |
| 站名、页脚 | 各页的 wordmark、title、页脚版权 |
| 导航 | 页面顶栏；跨站链接保持绝对地址 |
| 首页文案 | index.html 的 hero 与分站卡片；最近在写由脚本维护 |
| 关于页 | about.html 与 assets/css/about.css |
| 文章 | blog/posts/*.md，改完运行 npm run build:blog |
| 文档 | docs/pages/*.md，改完运行 npm run build:docs |
| 配色 / 圆角 / 间距 | 各站 assets/css/theme.css，三处同步 |
| 动效 | assets/css/animations.css 与 assets/js/animations.js，三处同步 |

## 动效一览

- 首屏逐字入场与强调词下划线（animations.js 拆字，失败时退回整行入场）
- 滚动渐显 `.reveal`，含 `.reveal--blur` 与 `.reveal--clip` 两个变体
- 背景交互：点击或触摸扩散同心水波纹，鼠标移动时在指针后方不断冒出粉色爱心拖尾；没有常驻点阵
- 3D 倾斜卡片：`data-tilt`
- 磁性按钮：`data-magnetic`
- 顶部滚动进度条与 `.fx-drift` 滚动漂移
- View Transitions 页面切换（同源生效）

动效主要由 IntersectionObserver、CSS scroll-driven animation、pointer 事件驱动；正文页的浮动回顶按钮用一个被动、rAF 节流的 scroll 监听判断方向，不劫持滚动。全部在 `prefers-reduced-motion: reduce` 下降级。

## 设计约束

- 只有一个强调色：克莱因蓝 `#002FA7`
- 圆角只有一个值：`--radius: 8px`
- 白底少用阴影，层级交给 1px 边框和留白
- 不监听 scroll；唯一例外是正文页浮动回顶按钮，用被动 rAF 节流监听判断方向
- 所有动效都要有 reduced-motion 降级

## 已知取舍

1. 共享文件三份副本，改一处要同步三处。
2. 博客和文档都由本地脚本从 Markdown 生成，生成的 HTML 需要一起提交；博客列表、首页最近在写、文档目录和文章上一篇 / 下一篇都由脚本维护，不要手改生成区域。
3. 根目录整仓部署时，/blog/ 与 /docs/ 是子域名站点的副本。
