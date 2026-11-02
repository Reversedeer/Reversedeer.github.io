---
title: 开发与打包
description: 抖音视频解析器的 Node.js 环境、开发启动和 Windows 打包命令。
lede: Vue 构建界面，Electron 提供桌面能力与下载任务管理。
---

## 环境与启动 {#start}

项目要求 Node.js `>=24`。在源码根目录运行：

```powershell
npm ci
npm run prepare:binaries
npm run dev
```

`npm run dev` 同时启动 Vite 和 Electron。界面依赖 Electron 提供的接口，只打开 Vite 地址不能完整使用解析和下载功能。

## 媒体工具 {#tools}

| 工具 | 用途 |
| --- | --- |
| yt-dlp | 解析视频元数据及部分格式的下载 |
| aria2c | 多连接下载视频或音频流 |
| FFmpeg | 合并分离的音视频流 |

`npm run prepare:binaries` 将缺失的 Windows 工具补齐到 `resources/bin/`，需要联网。已有文件会保留，不会自动更新。

开发模式优先使用这个目录里的工具，找不到时再尝试系统路径。打包时，工具会复制到安装程序的资源目录。

## 构建命令 {#build}

| 命令 | 输出 |
| --- | --- |
| `npm run build` | 仅构建前端，输出到 `dist/` |
| `npm run package` | 准备工具并生成未打包安装的桌面程序目录 |
| `npm run dist` | 准备工具、构建前端并生成 Windows x64 安装包 |

桌面程序和安装包输出到 `release/`。安装包文件名遵循 `dy-video-parser-版本号-setup.exe`。

## 主要文件 {#files}

| 文件 | 职责 |
| --- | --- |
| `src/App.vue` | 解析、登录、画质选择和下载界面 |
| `electron/main.cjs` | 主窗口、会话、解析和下载流程 |
| `electron/preload.cjs` | 界面与 Electron 主进程的通信接口 |
| `electron/url-utils.cjs` | 提取和规范化抖音链接 |
| `scripts/prepare-binaries.mjs` | 准备媒体工具 |
