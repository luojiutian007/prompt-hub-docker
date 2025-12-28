# 1. 选择一个超轻量的 Node.js 基础镜像 (基于 Linux Alpine)
# 这能保证打包出来的镜像很小，且运行速度快
FROM node:18-alpine

# 2. 设置容器内的工作目录
WORKDIR /app

# 3. 先复制 package.json，这是为了利用 Docker 的缓存层
# 如果你不修改依赖，下次构建时这一步会直接跳过，速度飞快
COPY package.json ./

# 4. 安装生产环境依赖 (不安装开发工具，减小体积)
# 这一步会自动安装 express, multer, sharp 等
RUN npm install --production

# 5. 复制所有源代码到容器里
COPY . .

# 6. 暴露 3000 端口 (这是我们后端服务的端口)
EXPOSE 3000

# 7. 创建数据挂载点的占位目录 (方便用户映射 NAS 文件夹)
# 这一步确保目录存在，防止权限问题
RUN mkdir -p /app/uploads /app/data

# 8. 启动服务
CMD ["node", "server/app.js"]