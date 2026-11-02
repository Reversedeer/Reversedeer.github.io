---
title: 配置参考
description: 配置文件、环境变量及账号、评教、持续抢课参数。
lede: 配置在启动时读取，环境变量优先于 .env 文件。
---

## 配置文件 {#location}

源码运行默认读取项目根目录的 `.env`。复制示例文件后修改：

```powershell
Copy-Item .env.example .env
```

每行一个 `KEY=VALUE`，以 `#` 开头的行作为注释。系统环境变量覆盖同名文件配置，修改后重新启动程序。

## 登录配置 {#credentials}

```dotenv
URP_BASE_URL=https://jws.qgxy.cn
URP_USERNAME=你的学号
URP_PASSWORD=你的教务密码
```

`URP_BASE_URL` 为教务站点基础地址。桌面版可直接在登录框输入账号密码，命令行版从配置读取。

## 指定配置路径 {#explicit-file}

通过 `URP_ENV_FILE` 指定 `.env` 的位置。桌面打包版建议显式指定路径：

```powershell
$env:URP_ENV_FILE = (Resolve-Path .env).Path
.\URP-Tools.exe
```

源码启动时，将最后一行换为 `poetry run urp-tools-gui` 或 `poetry run urp-tools`。环境变量传给从该终端启动的进程。

## 教学评估 {#evaluation}

| 配置名 | 默认值 | 说明 |
| --- | --- | --- |
| `URP_DEFAULT_CHOICE` | `A` | 评价选项，取值 `A`–`E` |
| `URP_DEFAULT_COMMENT` | `老师教学认真课程收获较大` | 评语 |
| `URP_EVALUATION_WAIT_SECONDS` | `120` | 提交前等待秒数，非负数 |
| `URP_EVALUATION_LIMIT` | 不限制 | 单次处理课程数，设置时须为正整数 |
| `URP_EVALUATION_CONCURRENCY` | `3` | 同时打开或提交任务的数量，正整数 |

## 持续抢课 {#snatching}

| 配置名 | 默认值 | 说明 |
| --- | --- | --- |
| `URP_COURSE_SNATCHING_ATTEMPTS` | `0` | 尝试次数上限，`0` 为不限次数 |
| `URP_COURSE_SNATCHING_CONCURRENCY` | `10` | 当前目标的并发请求数，正整数 |
| `URP_COURSE_SNATCHING_RETRY_INTERVAL` | `0.2` | 每轮请求后的间隔秒数，非负数 |

并发参数控制单个目标的请求数量，多课程任务仍按顺序执行。
