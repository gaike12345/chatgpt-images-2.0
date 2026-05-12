# 环境配置和使用指南

## 🎯 问题说明

当前 AI 助手环境无法直接执行 `npm`、`git` 等命令，这是正常的沙箱限制。

## ✅ 解决方案

### 方法1：一键部署（推荐）✅

**步骤：**

1. **安装必要的工具**（如果还没有）
   - 右键点击 `install-tools.ps1`
   - 选择 "使用 PowerShell 运行"
   - 等待安装完成

2. **执行一键部署**
   - 右键点击 `deploy-all.ps1`
   - 选择 "使用 PowerShell 运行"
   - 等待部署完成

### 方法2：手动部署

#### 前端部署到 Vercel

```powershell
# 1. 进入前端目录
cd "c:\Users\Windows\Desktop\chatgpt-images-2.0\frontend"

# 2. 安装依赖
npm install

# 3. 构建项目
npm run build

# 4. 部署到 Vercel（如果没有 Vercel CLI，跳过此步）
vercel --prod
```

#### 后端部署到 Railway

```powershell
# 1. 进入后端目录
cd "c:\Users\Windows\Desktop\chatgpt-images-2.0\backend"

# 2. 使用 Railway CLI 部署
railway up --detach
```

### 方法3：使用 GitHub Actions 自动部署（推荐给持续集成）

需要我创建一个完整的 GitHub Actions 工作流吗？

## 🔧 手动安装工具

如果你想手动安装：

### 1. Node.js (必需)
- 下载地址: https://nodejs.org/
- 推荐版本: Node.js 20 LTS
- 安装后打开新的命令提示符窗口

### 2. Git (推荐)
- 下载地址: https://git-scm.com/download/win
- 安装时选择 "Use Git from Windows Command Prompt"

### 3. Railway CLI (后端部署)
```powershell
npm install -g @railway/cli
```

### 4. Vercel CLI (前端部署)
```powershell
npm install -g vercel
```

## 📋 部署后配置

### 1. 设置 Railway 环境变量

登录 https://railway.app，找到你的项目，添加：

```
DUOMI_API_KEY = 你的多米API密钥
WIKE_API_KEY = 你的Wike API密钥（可选，Midjourney用）
```

### 2. 获取 Railway URL

部署成功后，Railway 会分配一个 URL，类似：
```
https://chatgpt-images-api.up.railway.app
```

### 3. 更新前端配置

编辑 `frontend/.env.production`:

```
VITE_API_URL=https://你的-railway-app.up.railway.app
```

### 4. 重新部署前端

```powershell
cd frontend
vercel --prod
```

## 🧪 测试部署

部署完成后访问：

1. **前端地址**: Vercel 分配的 URL
2. **后端健康检查**: `https://你的-railway-app.up.railway.app/api/health`

## ❓ 常见问题

### Q: PowerShell 脚本无法运行？

**A:** 可能需要调整执行策略

```powershell
# 查看当前策略
Get-ExecutionPolicy

# 临时允许运行脚本（当前窗口）
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 永久允许（需要管理员权限）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q: npm 命令找不到？

**A:** 
1. 确保 Node.js 已正确安装
2. 关闭并重新打开 PowerShell/命令提示符
3. 检查 PATH 环境变量

### Q: Railway 部署失败？

**A:**
1. 确保已登录 Railway CLI: `railway login`
2. 检查项目 ID 是否正确
3. 查看错误日志

### Q: Vercel 部署失败？

**A:**
1. 确保已登录 Vercel CLI: `vercel login`
2. 检查网络连接
3. 查看 Vercel 控制台日志

## 📞 获取帮助

如果遇到问题：

1. 检查错误日志
2. 查看官方文档：
   - Vercel: https://vercel.com/docs
   - Railway: https://docs.railway.app
   - Node.js: https://nodejs.org/docs

2. 检查 AI 助手创建的详细日志：
   - `frontend/` - npm 和 Vercel 相关
   - `backend/` - Railway 相关

## 🎉 成功标志

部署成功后，你应该能看到：

1. ✅ Vercel 返回部署 URL
2. ✅ Railway 显示 "Service is running"
3. ✅ `https://你的-railway-app.up.railway.app/api/health` 返回 `{"status": "ok"}`
4. ✅ 前端页面正常显示
5. ✅ 可以成功调用图片生成 API

## 💡 小贴士

1. **持续部署**: 可以配置 GitHub Actions，每次 push 代码自动部署
2. **环境隔离**: 使用 `.env.production` 和 `.env.development` 区分生产/开发环境
3. **监控**: 在 Railway 开启监控和日志
4. **备份**: 定期备份重要配置文件

---

需要我帮你：
1. 创建 GitHub Actions 自动部署工作流？
2. 配置更详细的日志记录？
3. 编写测试脚本验证部署？

随时告诉我！
