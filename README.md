# Reversedeer 网站

基于 Astro + Starlight 的个人网站，包含首页、博客、文档、项目展示和 RSS。

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建产物位于 `dist/`。正式部署时，GitHub Actions 会构建并将该目录同步到服务器：

```text
/www/sites/reversedeer.com/index/dist
```

服务器由 1Panel 管理，OpenResty 直接提供静态文件服务。

## GitHub Actions 部署

工作流文件位于 `.github/workflows/deploy.yml`。推送到 `main` 后会自动完成类型检查、构建，并通过 SSH + rsync 发布到：

```text
/www/sites/reversedeer.com/index/dist
```

GitHub 仓库需要配置以下 Actions Secrets：

- `SERVER_HOST`：服务器公网地址
- `SERVER_PORT`：SSH 端口，可不填，默认 `22`
- `SERVER_USER`：有权写入站点目录的部署用户
- `SSH_PRIVATE_KEY`：与服务器部署用户公钥匹配的专用私钥

## 内容位置

- `src/content/blog/`：博客文章
- `src/content/docs/`：Starlight 文档
- `src/pages/`：首页及其他普通页面
