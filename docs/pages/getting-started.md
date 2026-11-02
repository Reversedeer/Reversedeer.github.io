---
title: 安装与登录
description: Windows 桌面版安装、源码运行及命令行入口。
lede: 使用桌面程序，或在 Python 3.10 环境中运行源码。
---

## Windows 桌面版 {#windows}

Windows 构建提供安装包和单文件程序，无需另行安装 Python。

| 文件 | 用途 |
| --- | --- |
| `URP-Tools-Setup-0.4.1.exe` | 64 位 Windows 安装包 |
| `URP-Tools.exe` | 直接运行桌面程序 |

发布文件以[版本发布页](https://github.com/Reversedeer/urp-academic-affairs-tools/releases)为准。

## 登录与账号切换 {#login}

启动程序，输入教务系统学号和密码登录。验证码自动识别，登录后从侧栏进入相应功能。

桌面版不要求预先配置 `.env`。侧栏“退出登录”可返回登录窗口；程序保留最近使用的 5 个学号，有多个历史账号时可点击“切换账号”。登录框输入的密码不会写入历史账号列表。

## 源码运行 {#source}

环境要求：Python `>=3.10,<3.11`、Poetry 2.x、Git。

```powershell
git clone https://github.com/Reversedeer/urp-academic-affairs-tools.git
cd urp-academic-affairs-tools
poetry env use 3.10
poetry install
poetry run urp-tools-gui
```

也可以通过模块启动桌面界面：

```powershell
poetry run python -m urp_academic_affairs_tools.gui
```

## 命令行入口 {#cli}

先按[配置参考](configuration.html#credentials)设置账号密码，再运行：

```powershell
poetry run urp-tools
```

主菜单提供以下功能：

```text
1. 导出课表
2. 教学评估
3. 选课
4. 退课
5. 成绩查询
0. 退出
```

输入对应数字进入功能，`Ctrl+C` 结束程序。
