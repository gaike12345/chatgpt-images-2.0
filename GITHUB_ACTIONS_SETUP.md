# GitHub Actions 自动部署配置指南

## 🎯 概述

本项目使用 GitHub Actions 实现自动部署：
- **前端**: 自动部署到 Vercel
- **后端**: 自动部署到 Railway

## 📋 需要的 Secrets

你需要在 GitHub 仓库的 Settings → Secrets and variables → Actions 中添加以下密钥：

### 前端 (Vercel)

| Secret 名称 | 获取方法 | 说明 |
|------------|---------|------|
| `VERCEL_TOKEN` | [Vercel Token](https://vercel.com/account/tokens) | Vercel API Token |
| `VERCEL_ORG_ID` | `vercel inspect` 或项目设置 | 组织 ID |
| `VERCEL_PROJECT_ID` | Vercel 项目设置 | 项目 ID |
| `VITE_API_URL` | Railway 部署后的 URL | 后端 API 地址 |

### 后端 (Railway)

| Secret 名称 | 获取方法 | 说明 |
|------------|---------|------|
| `RAILWAY_TOKEN` | [Railway Token](https://railway.app/account) | Railway API Token |
| `RAILWAY_PROJECT_ID` | Railway 项目设置 | 项目 ID |
| `DUOMI_API_KEY` | 多米API控制台 | 多米 API 密钥 |
| `WIKE_API_KEY` | Wike API控制台 | Wike API 密钥（可选） |

---

## 📝 详细配置步骤

### 1. 配置 Vercel Secrets (前端)

#### 1.1 获取 Vercel Token
1. 访问 https://vercel.com/account/tokens
2. 点击 "Create Token"
3. 填写 Token 名称（如 "GitHub-Actions"）
4. 选择过期时间（建议 90 天）
5. 复制生成的 Token

#### 1.2 获取 Vercel Org ID 和 Project ID
```bash
# 安装 Vercel CLI（如果还没有）
npm install -g vercel

# 登录 Vercel
vercel login

# 进入项目目录
cd frontend

# 查看项目信息
vercel inspect
```

在输出中找到：
- `orgId` → `VERCEL_ORG_ID`
- `projectId` → `VERCEL_PROJECT_ID`

或者在 Vercel Dashboard → 项目 → Settings 中查看。

#### 1.3 添加 GitHub Secrets
1. 进入你的 GitHub 仓库
2. 点击 Settings → Secrets and variables → Actions
3. 点击 "New repository secret"
4. 添加以下 secrets：

```
VERCEL_TOKEN = vercel_xxxx...
VERCEL_ORG_ID = team_xxxx...
VERCEL_PROJECT_ID = prj_xxxx...
VITE_API_URL = https://your-app.up.railway.app
```

---

### 2. 配置 Railway Secrets (后端)

#### 2.1 获取 Railway Token
1. 访问 https://railway.app/account
2. 点击 "New Token"
3. 填写 Token 名称
4. 复制生成的 Token

#### 2.2 获取 Railway Project ID
1. 登录 Railway Dashboard
2. 选择你的项目
3. 在项目 URL 中找到 Project ID：`railway.app/project/xxxxx-xxxx-xxxx`
4. 或在项目 Settings 中查看

#### 2.3 添加 GitHub Secrets
在 GitHub 仓库的 Secrets 页面添加：

```
RAILWAY_TOKEN = railway_xxxx...
RAILWAY_PROJECT_ID = xxxxx-xxxx-xxxx
DUOMI_API_KEY = 你的多米API密钥
WIKE_API_KEY = 你的Wike API密钥（可选）
```

---

## 🔧 工作流说明

### 前端工作流 (frontend/.github/workflows/deploy.yml)

```yaml
触发条件:
  - push 到 main 分支的 frontend/ 目录
  - 提交 PR 到 main 分支

部署步骤:
  1. 检出代码
  2. 安装 Node.js 20
  3. 安装 npm 依赖
  4. 安装 Vercel CLI
  5. 拉取 Vercel 环境信息
  6. 构建生产版本
  7. 部署到 Vercel
```

### 后端工作流 (backend/.github/workflows/deploy.yml)

```yaml
触发条件:
  - push 到 main 分支的 backend/ 目录
  - 提交 PR 到 main 分支

部署步骤:
  1. 检出代码
  2. 安装 Node.js 20
  3. 安装 Railway CLI
  4. Railway 登录
  5. 部署到 Railway
  6. 获取部署 URL
```

---

## ⚙️ 自定义配置

### 修改触发分支

编辑 `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches:
      - main  # 修改为你的分支名
```

### 修改 Node.js 版本

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # 修改版本号
```

### 修改缓存策略

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
    cache-dependency-path: frontend/package-lock.json
```

---

## 🧪 测试工作流

### 手动触发部署

1. 进入 GitHub 仓库
2. 点击 Actions 标签
3. 选择工作流
4. 点击 "Run workflow"
5. 选择分支并运行

### 检查部署状态

1. 点击 Actions 标签
2. 查看工作流运行列表
3. 点击具体运行查看日志
4. 检查每个步骤的状态

---

## 🔍 常见问题

### Q: Secrets 配置正确但仍报错？

**A:** 检查以下几点：
1. Secret 名称是否完全匹配（包括大小写）
2. Token 是否过期
3. 是否有足够的权限

### Q: 部署失败，提示权限不足？

**A:**
1. 检查 Vercel Token 是否有部署权限
2. 检查 Railway Token 是否有项目访问权限
3. 确认 GitHub Secrets 已正确添加

### Q: 如何查看详细的部署日志？

**A:**
1. 进入 GitHub → Actions
2. 点击失败的 workflow run
3. 点击具体的 job
4. 展开每个 step 查看日志

### Q: 如何禁用自动部署？

**A:** 
1. 删除 `.github/workflows/` 目录
2. 或在 GitHub → Actions → 禁用工作流

---

## 📊 监控部署

### 查看 Vercel 部署

访问 https://vercel.com/dashboard

### 查看 Railway 部署

访问 https://railway.app/dashboard

### 查看 GitHub Actions

访问 https://github.com/你的用户名/仓库/actions

---

## 🎉 部署成功标志

自动部署成功后，你会收到：

1. **GitHub Actions** 显示绿色的 ✓
2. **Vercel** 显示新的部署
3. **Railway** 显示 "Service is running"
4. **前端应用** 可正常访问

---

## 🚨 故障排除

### 部署卡住不动

1. 检查网络连接
2. 重试部署
3. 查看详细日志

### 权限错误

1. 重新生成 Token
2. 更新 GitHub Secrets
3. 确认仓库权限

### 环境变量问题

1. 检查 Secrets 配置
2. 确认变量名称正确
3. 验证变量值

---

## 📞 获取帮助

- Vercel: https://vercel.com/docs
- Railway: https://docs.railway.app
- GitHub Actions: https://docs.github.com/en/actions

---

## 💡 最佳实践

1. **定期更新 Token**：建议每 90 天更新一次
2. **使用最小权限**：只授予必要的权限
3. **监控部署**：定期检查部署状态
4. **保留日志**：查看历史部署记录
5. **设置通知**：配置 Slack/Email 通知（可选）

---

## 🔗 快速链接

- GitHub 仓库: https://github.com/你的用户名/chatgpt-images-2.0
- Vercel Dashboard: https://vercel.com/dashboard
- Railway Dashboard: https://railway.app/dashboard
- GitHub Actions: https://github.com/你的用户名/chatgpt-images-2.0/actions

---

现在你可以在 GitHub 仓库中配置这些 Secrets，然后每次 push 代码都会自动部署了！🎉
