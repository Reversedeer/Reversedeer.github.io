---
title: 宝塔面板的安装
date: 2022-03-17
isShowComments: false    # 展示评论
categories:     # 分类
 - History 
tags:       # 标签
 - Blog
---

## 废话不多说，马上开始



## **宝塔Linux面板(7.9.0正式版)环境要求**

1. 内存：512M以上，推荐768M以上（纯面板约占系统60M内存）
2. 硬盘：300M以上可用硬盘空间（纯面板约占20M磁盘空间）
3. 系统：CentOS 7.1+ (Ubuntu16.04+.、Debian9.0+)，确保是干净的操作系统，**没有安装过其它环境带的Apache/Nginx/php/MySQL/pgsql/gitlab/java**（已有环境不可安装）
4. 架构：x86_64（主流服务器均是此架构），ARM不完整兼容（面板环境安装慢，部分软件可能安装不上）

## **系统兼容性推荐**

- Centos7.x > Debian10 > Ubuntu 20.04 > Centos8 stream > Ubuntu 18.04 > 其它系统
- 系统兼容支持状况详情：https://docs.qq.com/sheet/DUm54VUtyTVNlc21H
- 推荐浏览器：chrome、火狐、edge，国产浏览器请使用急速模式访问面板登录地址

## Linux安装宝塔面板方法

**以下云主机商必看（开端口教程，不开不能用）：**

腾讯云：https://www.bt.cn/bbs/thread-1229-1-1.html [腾讯云2折起](https://cloud.tencent.com/redirect.php?redirect=1014&cps_key=624d99e25c64927aef8353ed6cd5536c&from=console)

阿里云：https://www.bt.cn/bbs/thread-2897-1-1.html [阿里云2折起](https://promotion.aliyun.com/ntms/act/qwbk.html?userCode=wkpc565a)
华为云：https://www.bt.cn/bbs/thread-3923-1-1.html [华为云1折起](https://activity.huaweicloud.com/1111_promotion/index.html?utm_source=outside-BU&utm_medium=share-op&utm_adplace=AdPlace043175&domainid=4132515106334355b6670d57bcbbe971&fromacct=c25bfc10-c8ff-48f7-924d-792dd7706772&sharetype=0)

### **1.对硬盘进行挂载**

使用SSH工具连接到你的云服务器，运行挂载命令：

```vue
yum install wget -y && wget -O auto_disk.sh http://download.bt.cn/tools/auto_disk.sh && bash auto_disk.sh
```

出现提示按Y回车

### **2.执行宝塔安装命令**

**Centos安装命令**：

```
yum install -y wget && wget -O install.sh http://download.bt.cn/install/install_6.0.sh && sh install.sh 
```

**Ubuntu/Deepin安装命令**：

```
wget -O install.sh http://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh 
```

**Debian安装命令**：

```
wget -O install.sh http://download.bt.cn/install/install-ubuntu_6.0.sh && bash install.sh ed8484bec 
```

**Fedora安装命令:**

```
wget -O install.sh http://download.bt.cn/install/install_6.0.sh && bash install.sh
```

**Linux面板7.4.5升级命令：**

```
curl http://download.bt.cn/install/update6.sh|bash 
```

### **3.安装完成后,访问面板地址**

安装完成后，会出现面板地址及默认账号与密码。**访问ip:8888**

**输入账号与密码即可使用宝塔（若无法访问检查IP是否正确，防火墙安全组是否有放行8888端口）**
