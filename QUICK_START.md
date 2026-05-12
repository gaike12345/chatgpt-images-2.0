# 🚀 GitHub Actions 自动部署 - 快速入门

## ✨ 你将获得

每次你 push 代码到 GitHub，系统会自动：
- ✅ 部署前端到 Vercel
- ✅ 部署后端到 Railway
- ✅ 无需手动操作！

## 📋 配置步骤（只需一次）

### 第一步：上传代码到 GitHub

```bash
# 初始化 Git（如果还没有）
cd c:\Users\Windows\Desktop\chatgpt-images-2.0
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/chatgpt-images-2.0.git
git push -u origin main
```

### 第二步：配置 GitHub Secrets

#### 1. 访问你的 GitHub 仓库
```
https://github.com/你的用户名/chatgpt-images-2.0/settings/secrets/actions
```

#### 2. 添加 Vercel Secrets（前端）

点击 "New repository secret"，添加：

| Secret | 值 | 获取位置 |
|--------|-----|---------|
| `VERCEL_TOKEN` | vercel_xxxx... | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | team_xxxx... | `vercel inspect` 命令 |
| `VERCEL_PROJECT_ID` | prj_xxxx... | Vercel 项目设置 |
| `VITE_API_URL` | https://xxx.up.railway.app | 暂用临时值，后续更新 |

#### 3. 添加 Railway Secrets（后端）

继续添加：

| Secret | 值 | 获取位置 |
|--------|-----|---------|
| `RAILWAY_TOKEN` | railway_xxxx... | https://railway.app/account |
| `RAILWAY_PROJECT_ID` | xxxxx-xxxx-xxxx | Railway 项目设置 |
| `DUOMI_API_KEY` | 你的多米API密钥 | 多米API控制台 |
| `WIKE_API_KEY` | 你的Wike密钥（可选） | Wike控制台 |

### 第三步：推送代码触发部署

```bash
# 推送到 GitHub
git push origin main
```

### 第四步：检查部署状态

1. 访问 `https://github.com/你的用户名/chatgpt-images-2.0/actions`
2. 看到绿色的 ✓ = 部署成功！
3. 访问 Vercel URL = 前端地址
4. 访问 Railway URL/api/health = 后端地址

---

## 🎯 完整的自动化流程

```
你 push 代码
    ↓
GitHub 检测到变化
    ↓
自动运行工作流
    ├→ 前端 → Vercel
    └→ 后端 → Railway
    ↓
部署完成！
```

---

## 📝 详细配置指南

完整的配置说明文档：
- **中文版**: [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)
- **部署指南**: [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)
- **使用说明**: [README.md](README.md)

---

## 🔧 如果你想手动部署

查看详细的手动部署步骤：
- **PowerShell 脚本**: `deploy-all.ps1`
- **安装脚本**: `install-tools.ps1`

---

## ❓ 常见问题

### Q: 如何获取 Vercel Token？
访问 https://vercel.com/account/tokens 创建

### Q: 如何获取 Railway Token？
访问 https://railway.app/account 创建

### Q: 如何获取项目 ID？
- **Vercel**: `vercel inspect` 命令
- **Railway**: 项目 URL 中或 Settings 中

### Q: 部署失败了怎么办？
1. 查看 GitHub Actions 日志
2. 检查 Secrets 配置
3. 确认 Token 有效

### Q: 如何禁用自动部署？
删除 `.github/workflows/` 目录即可

---

## 🎉 恭喜！

完成以上配置后，你将拥有完整的 CI/CD 自动化流程！

**每次代码更新，只需：**
```bash
git add .
git commit -m "更新内容"
git push
```

**然后自动完成：**
- ✅ 代码检查
- ✅ 安装依赖
- ✅ 构建项目
- ✅ 部署上线
- ✅ 无需任何手动操作

---

## 📚 更多资源

- GitHub Actions 文档: https://docs.github.com/en/actions
- Vercel 文档: https://vercel.com/docs
- Railway 文档: https://docs.railway.app

---

**有问题随时问我！** 🚀
