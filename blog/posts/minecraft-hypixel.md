---
title: Minecraft-Hypixel加速IP搭建教程
date: 2022-09-06
isShowComments: false    # 展示评论
categories:     # 分类
 - History 
tags:       # 标签
 - Blog
---



## **效果：**

- 国内服务器建议上海，延迟略低丝毫不丢包，十分流畅 ，~~开寄~~ 足矣 。PVP如果要求很高很高的肯定是不会满意的，但人是一点不瞬移。
- 海外推荐香港CN2，美国CN2服务器，延迟超低，非常NICE。
- 推荐腾讯云的香港竞价实例SA2型，0.05r/h （作者同款，~~现在用Golink~~）。

## **准备工作：**

- 一个可以加速的VPS （国内推荐上海 国外推荐美国 香港)
- ssh 推荐windows/Ubuntu/自带的cmd或终端
- 用法：ssh 用户名@服务器公网IP（例：ssh root@111.111.111.111）
- 安装CentOS7.6或者最近的版本最好一同安装BT

### **第一步:SSH连接主机 打开宝塔面板确保一切就绪**

### **第二步 分别输入如下指令 安装.NET**

```
sudo rpm -Uvh https://packages.microsoft.com/config/centos/7/packages-microsoft-prod.rpm  
sudo yum install dotnet-runtime-3.1
```



### **第三步 CentOS系统以及VPS服务商的后台面板的防火墙放行**

```
firewall-cmd --state  #  查看防火墙运行状态，放行端口必须开启防火墙
systemctl start firewalld.service  #  开启防火墙
systemctl stop firewalld.service   #  关闭防火墙 
```

#### **放行25565端口**

```
firewall-cmd --zone=public --add-port=25565/tcp --permanent  
```

#### **重载防火墙**

```
firewall-cmd --reload  
```

#### **以腾讯云为例 防火墙放行**

在服务器面板找到 **安全组** 字样 然后打开 `添加规则` 协议TCP 端口就写一个25565 其他不变

#### **安装**宝塔面板-不会安装[点这里](https://yangshaojie.com/bt-wordpress-linux/.html)

### **第四步 上传作者的脚本**

[点击下载](https://mc.yangshaojie.com/?f=/Hypixel加速IP)

#### 上传方法–使用宝塔面板

一种比较方便的是在宝塔面板上传 在 **首页→文件** 里面找到 `根目录**/opt**`
然后点击宝塔面板的上传 选择文件 把文件上传到这里


### **第五步 启用脚本**

打开你的SSH工具（cmd） 输入 `cd /opt` 来切换到opt目录
然后输入

```
dotnet ./MinecraftProxy2.dll
```

脚本开始运行


然后以Hypixel为例 其他服务器也行
在 `server` 后面输入 `mc.hypixel.ne`t
`port` 后面输入 `25565`
`local-port` 后面也输入 `25565`
至此 恭喜你 你的IP搭建完成了

## **重要提醒**

::: danger
脚本开始运行后 请保持终端持续运行 勿退出终端 否则加速失败
建议安装screen来让终端持续后台运行
:::

```
# 安装Screen  请先检查是否装有yum（输入yum以检查）
yum install screen -y
screen
dotnet ./MinecraftProxy2.dll
```

::: tip
一些screen 指令:
:::

```
 screen -S MC # 创建一个叫做MC的screen

 screen -ls  # 查看所有创建的窗口

 screen -r MC # 返回叫做MC的窗口

 quit # 结束并退出当前screen 或使用快捷键Ctrl-a-k

 screen -S MC -X quit # 将MC窗口强制关闭
```



> 本文章内容具体来自B站up:[多多-2333](https://space.bilibili.com/280675577)及脚本，视频来源：**https://www.bilibili.com/video/BV1sq4y1n7cD**



