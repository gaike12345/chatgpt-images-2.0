# 盖可朋友圈 - AI图片生成

# 部署配置

## 项目概述

**项目名称**: 盖可朋友圈 - AI图片生成  
**技术栈**: React + TypeScript + Vite (前端) | Express + TypeScript (后端)  
**部署平台**: Vercel (前端) + Railway (后端)  
**CI/CD**: GitHub Actions

---

## 🚀 快速部署

### 前端部署到 Vercel

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖
npm install

# 3. 构建项目
npm run build

# 4. 部署到 Vercel（需要先安装 Vercel CLI）
npm install -g vercel
vercel --prod
```

### 后端部署到 Railway

```bash
# 1. 进入后端目录
cd backend

# 2. 安装 Railway CLI
npm install -g @railway/cli

# 3. 登录 Railway
railway login

# 4. 部署
railway up --detach
```

### 使用 GitHub Actions (推荐)

1. 配置 GitHub Secrets
2. Push 代码到 main 分支
3. 自动部署完成

---

## 📦 部署清单

### 前端 (Vercel)

#### 必需的环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VERCEL_TOKEN` | Vercel API Token | `vercel_xxxx...` |
| `VERCEL_ORG_ID` | 组织 ID | `team_xxxx...` |
| `VERCEL_PROJECT_ID` | 项目 ID | `prj_xxxx...` |
| `VITE_API_URL` | 后端 API 地址 | `https://api.gaikeai.com` |

#### 可选的环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VITE_APP_NAME` | 应用名称 | `盖可朋友圈` |
| `VITE_APP_VERSION` | 版本号 | `2.0.0` |
| `VITE_ANALYTICS_ID` | 分析 ID | `UA-XXXXXXXXX-X` |

---

### 后端 (Railway)

#### 必需的环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `RAILWAY_TOKEN` | Railway API Token | `railway_xxxx...` |
| `RAILWAY_PROJECT_ID` | 项目 ID | `xxxxx-xxxx-xxxx` |
| `DUOMI_API_KEY` | 多米 API 密钥 | `your_duomi_key` |

#### 可选的环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `WIKE_API_KEY` | Wike API 密钥 | `your_wike_key` |
| `PORT` | 端口（自动设置） | `3001` |
| `NODE_ENV` | 运行环境 | `production` |
| `CORS_ORIGIN` | 允许的源 | `https://gaikeai.com` |
| `RATE_LIMIT_MAX` | 限流最大值 | `100` |
| `RATE_LIMIT_WINDOW` | 限流窗口（ms） | `900000` |
| `LOG_LEVEL` | 日志级别 | `info` |

---

## 🌐 自定义域名配置

### 前端域名

#### Vercel 配置

1. 访问 Vercel Dashboard
2. 选择项目 → Settings → Domains
3. 添加域名：`gaikeai.com` 和 `www.gaikeai.com`
4. 配置 DNS 记录

#### DNS 配置

```
# A 记录
@    A    76.76.21.21

# CNAME 记录
www  CNAME  cname.vercel-dns.com
```

### 后端域名

#### Railway 配置

1. 访问 Railway Dashboard
2. 选择项目 → Settings → Networking
3. 添加域名：`api.gaikeai.com`

#### DNS 配置

```
api  CNAME  your-project.up.railway.app
```

---

## 🔒 HTTPS 配置

Vercel 和 Railway 都自动提供免费 HTTPS 证书。

### 自定义证书（可选）

如果使用自定义域名，可以上传自己的 SSL 证书：

#### Vercel

1. 项目 Settings → Domains → Certificate
2. 上传证书和私钥

#### Railway

1. 项目 Settings → Networking → HTTPS
2. 上传证书

---

## ⚙️ 环境变量配置

### 开发环境 (.env.development)

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=盖可朋友圈（开发）
VITE_APP_VERSION=2.0.0-dev
```

### 生产环境 (.env.production)

```env
VITE_API_URL=https://api.gaikeai.com
VITE_APP_NAME=盖可朋友圈
VITE_APP_VERSION=2.0.0
```

### 后端环境 (.env)

```env
NODE_ENV=production
PORT=3001
DUOMI_API_KEY=your_duomi_key
WIKE_API_KEY=your_wike_key
CORS_ORIGIN=https://gaikeai.com,https://www.gaikeai.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
LOG_LEVEL=info
```

---

## 🔧 GitHub Actions 工作流

### 前端工作流 (.github/workflows/deploy-frontend.yml)

```yaml
name: Deploy Frontend to Vercel

on:
  push:
    branches:
      - main
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: frontend

      - name: Install Vercel CLI
        run: npm install -g vercel@latest
        working-directory: frontend

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: frontend
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: frontend
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: frontend
```

### 后端工作流 (.github/workflows/deploy-backend.yml)

```yaml
name: Deploy Backend to Railway

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Railway Login
        run: railway login --token ${{ secrets.RAILWAY_TOKEN }}

      - name: Railway Deploy
        run: railway up --token ${{ secrets.RAILWAY_TOKEN }}
        working-directory: backend
        env:
          DUOMI_API_KEY: ${{ secrets.DUOMI_API_KEY }}
          WIKE_API_KEY: ${{ secrets.WIKE_API_KEY }}
          NODE_ENV: production
```

---

## 📊 监控和日志

### Vercel 监控

- Dashboard: https://vercel.com/dashboard
- Analytics: 项目 → Analytics
- Logs: 项目 → Logs

### Railway 监控

- Dashboard: https://railway.app/dashboard
- Logs: 服务 → Logs
- Metrics: 服务 → Metrics

### 健康检查

前端调用后端健康检查：

```
GET https://api.gaikeai.com/api/health

Response:
{
  "status": "ok",
  "timestamp": "2026-05-12T00:00:00.000Z",
  "uptime": 12345,
  "memory": { ... },
  "services": {
    "duomi": "ok",
    "wike": "ok"
  }
}
```

---

## 🔐 安全配置

### CORS 配置

后端已配置严格的 CORS：

```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
```

### Rate Limiting

已配置速率限制：

```typescript
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 100 请求/窗口
};
```

### 安全头部

```typescript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

---

## 🐛 故障排除

### 部署失败

1. 检查 GitHub Secrets 配置
2. 验证 Token 权限
3. 查看 Actions 日志
4. 检查环境变量

### API 无法访问

1. 检查 Railway 服务状态
2. 验证环境变量配置
3. 查看后端日志
4. 测试健康检查端点

### 前端无法连接后端

1. 检查 `VITE_API_URL` 配置
2. 验证 CORS 配置
3. 确认后端服务正常运行
4. 检查网络连接

---

## 📞 获取帮助

- **技术支持**: support@gaikeai.com
- **文档**: 查看项目 README.md
- **问题反馈**: https://github.com/your-repo/issues

---

## 📝 更新日志

### v2.0.0 (2026-05-12)

- ✅ 全新设计的工作流系统
- ✅ 优化用户界面和交互动效
- ✅ 增强性能和稳定性
- ✅ 完善部署和监控
- ✅ 添加自定义域名支持

---

**最后更新**: 2026-05-12  
**版本**: 2.0.0  
**状态**: ✅ 生产就绪
