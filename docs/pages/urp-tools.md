---
title: URP Tools
date: "2026-11-02"
description: URP Tools 使用文档，涵盖安装、课表与成绩查询、选课退课、教学评估和配置。
lede: 面向 URP 教务系统的桌面与命令行工具。
---

## 概览 {#intro}

URP Tools 集成课表查询、成绩查询、选课、退课和教学评估，提供桌面界面与命令行入口。本文档对应 `0.4.1` 版本。

当前适配 `https://jws.qgxy.cn`。其他 URP 站点需要根据接口和登录方式单独适配。

## 功能 {#features}

| 功能 | 说明 |
| --- | --- |
| [课表](timetable.html) | 按星期、节次查看课程，导出 Excel |
| [成绩查询](scores.html) | 查询本学期、不及格和历年及格成绩，计算平均学分绩点 |
| [选课与持续抢课](course-selection.html) | 选择课程任务，普通提交或持续重试 |
| [退课](course-drop.html) | 查询已选课程，支持批量退课 |
| [教学评估](evaluation.html) | 查看评教状态，批量提交未完成任务 |

## 开始使用 {#start}

桌面版安装后即可登录，源码运行需要 Python 3.10 和 Poetry 2.x，详见[安装与登录](getting-started.html)。账号、评教和抢课参数见[配置参考](configuration.html)。
