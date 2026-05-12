FROM node:20-alpine
# Build timestamp: 2026-05-11T10:20:00 - build TypeScript in Docker
WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL deps (including devDependencies for tsc)
RUN npm ci

# Copy source code
COPY src/ ./src/

# Compile TypeScript in Docker
RUN npx tsc

# Remove devDependencies to reduce image size
RUN npm prune --production

# Railway provides PORT env var; our app reads process.env.PORT
# Railway 动态分配 PORT，不能用硬编码 8080
# EXPOSE 仅为文档用途，Railway 用 PORT 环境变量
# 移除 HEALTHCHECK — Railway 平台自己做健康检查，不需要镜像内 HEALTHCHECK

# Start the server
CMD ["node", "dist/index.js"]
