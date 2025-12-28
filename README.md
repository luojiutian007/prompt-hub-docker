请复制以下完整内容：
Markdown

# 🎨 AI Prompt Hub (Docker Edition)

![Docker Image Size](https://img.shields.io/docker/image-size/luojiutian007/prompt-hub/latest)
![Docker Pulls](https://img.shields.io/docker/pulls/luojiutian007/prompt-hub)
![License](https://img.shields.io/badge/license-MIT-blue)

> **"你的私人灵感库"**
> 
> 一个轻量级、私有化部署的 AI 提示词与素材管理工具。
> 专为 NAS 用户和个人开发者设计，数据完全掌握在自己手中。

---

## ✨ 核心亮点

- **🧘 沉浸体验**：精心设计的瀑布流与卡片视图，支持深色/磨砂玻璃拟态 UI，交互丝滑。
- **🔒 隐私模式**：支持给特定标签（如 "Private", "R18"）的内容加锁，需密码访问，保护你的秘密创意。
- **📂 本地存储**：所有图片、视频、提示词均存储在本地或 NAS 硬盘，不依赖任何云服务，无上传大小限制。
- **⚡️ 极速响应**：基于 Vue3 + Node.js (Express) 构建，轻量高效。
- **🐳 一键部署**：完美支持 Docker Compose，适配群晖、威联通、Unraid 等主流 NAS 系统。

---

## 🚀 极速部署指南 (Installation)

### 方式一：Docker Compose (推荐 ⭐⭐⭐⭐⭐)

这是最简单、最优雅的部署方式。你只需要创建一个文件，然后运行一行命令。

**1. 创建 `docker-compose.yml` 文件**

在任意目录下新建文件 `docker-compose.yml`，填入以下内容：

```yaml
version: '3.8'

services:
  prompt-hub:
    image: luojiutian007/prompt-hub:latest
    container_name: prompt-hub
    restart: unless-stopped
    ports:
      - "3000:3000"  # 左边是本地访问端口，可以按需修改
    volumes:
      - ./data:/app/data       # [重要] 挂载数据库文件，防止数据丢失
      - ./uploads:/app/uploads # [重要] 挂载媒体文件，图片视频存在这
    environment:
      - TZ=Asia/Shanghai       # 设置时区，保证记录时间正确
2. 启动服务

打开终端（Terminal），进入该文件所在目录，运行：

Bash

docker-compose up -d
3. 访问

打开浏览器访问：http://localhost:3000 (或你的 NAS IP:3000)

方式二：Docker 命令行 (CLI)
如果你不想创建文件，可以直接复制以下命令运行：

Bash

docker run -d \
  --name prompt-hub \
  -p 3000:3000 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/data:/app/data \
  -e TZ=Asia/Shanghai \
  --restart unless-stopped \
  luojiutian007/prompt-hub:latest
方式三：NAS 图形化部署 (群晖/威联通)
下载镜像：在 Docker/Container Manager 注册表中搜索 luojiutian007/prompt-hub 并下载 latest 版本。

端口设置：将容器端口 3000 映射到本地任意端口（如 3000）。

存储空间设置 (Volume) —— ⚠️ 关键步骤： 为防止重启容器后数据丢失，请务必在 NAS 上新建文件夹并挂载： | NAS 文件夹路径 (示例) | 容器内路径 (必须完全一致) | 说明 | | :--- | :--- | :--- | | /docker/prompt-hub/data | /app/data | 存放 database.json 数据库 | | /docker/prompt-hub/uploads | /app/uploads | 存放上传的图片/视频 |

🛠️ 常见问题 (FAQ)
Q: 数据存在哪里？ A: 所有提示词数据都在 /app/data/database.json 文件里，所有图片视频都在 /app/uploads 文件夹里。只要你挂载了这两个目录，怎么升级容器都不会丢数据。

Q: 如何备份？ A: 直接复制你挂载出来的 database.json 文件和 uploads 文件夹即可。

Q: 为什么上传大文件失败？ A: 目前默认支持 100MB 以内的文件上传。如果需要更大，请提交 Issue 反馈。

🏗️ 技术栈
Frontend: Vue.js 3, Tailwind CSS (CDN), FontAwesome

Backend: Node.js (Express), Multer

Database: LowDB (纯文件数据库)

Container: Alpine Linux Base

🤝 贡献与反馈
如果你喜欢这个项目，欢迎点个 ⭐ Star！ 如有问题，请提交 Issue 或 Pull Request。

Created with ❤️ by luojiutian007