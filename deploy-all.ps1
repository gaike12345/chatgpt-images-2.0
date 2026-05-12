# AI图片生成工作流 - 一键部署脚本
# 使用方法：右键 -> 使用 PowerShell 运行

$ErrorActionPreference = "Continue"
$ProjectRoot = "c:\Users\Windows\Desktop\chatgpt-images-2.0"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI图片生成工作流 - 自动化部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查必要的工具
Write-Host "[1/5] 检查必要的工具..." -ForegroundColor Yellow

$npmExists = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmExists) {
    Write-Host "❌ npm 未安装，请先安装 Node.js: https://nodejs.org/" -ForegroundColor Red
    Write-Host "   推荐安装 Node.js 20 LTS 版本" -ForegroundColor Yellow
    Read-Host "按 Enter 退出"
    exit 1
}

$gitExists = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitExists) {
    Write-Host "⚠️  git 未安装，某些功能可能受限" -ForegroundColor Yellow
}

Write-Host "✅ npm 已安装: $(npm --version)" -ForegroundColor Green

# Railway CLI 检查
$railwayExists = Get-Command railway -ErrorAction SilentlyContinue
if (-not $railwayExists) {
    Write-Host "⚠️  Railway CLI 未安装，后端部署将使用备用方法" -ForegroundColor Yellow
    Write-Host "   安装方法: npm install -g @railway/cli" -ForegroundColor Gray
}

# Vercel CLI 检查
$vercelExists = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelExists) {
    Write-Host "⚠️  Vercel CLI 未安装，前端部署将使用备用方法" -ForegroundColor Yellow
    Write-Host "   安装方法: npm install -g vercel" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[2/5] 部署前端到 Vercel..." -ForegroundColor Yellow

Set-Location "$ProjectRoot\frontend"

# 安装依赖
Write-Host "安装前端依赖..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install 失败" -ForegroundColor Red
    Read-Host "按 Enter 退出"
    exit 1
}

# 构建项目
Write-Host "构建前端项目..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm run build 失败" -ForegroundColor Red
    Read-Host "按 Enter 退出"
    exit 1
}

# 部署到 Vercel
Write-Host "部署到 Vercel..." -ForegroundColor Cyan
if ($vercelExists) {
    vercel --prod --yes
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Vercel 部署可能失败，请检查输出" -ForegroundColor Yellow
    }
} else {
    Write-Host "跳过 Vercel CLI 部署" -ForegroundColor Yellow
    Write-Host "请手动部署 dist 目录到 Vercel 或使用 GitHub Actions" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "[3/5] 部署后端到 Railway..." -ForegroundColor Yellow

Set-Location "$ProjectRoot\backend"

if ($railwayExists) {
    # Railway CLI 部署
    Write-Host "使用 Railway CLI 部署..." -ForegroundColor Cyan
    railway up --detach
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Railway CLI 部署失败" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Railway 部署成功" -ForegroundColor Green
    }
} else {
    # 备用方案：ZIP 包部署
    Write-Host "Railway CLI 未安装，使用备用方法..." -ForegroundColor Yellow
    
    # 创建 ZIP 包
    $zipFile = "backend_deploy_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"
    
    # 压缩文件
    Compress-Archive -Path ".", -DestinationPath $zipFile -Force
    
    Write-Host "✅ 已创建部署包: $zipFile" -ForegroundColor Green
    Write-Host "请在 Railway 控制台上传说这个文件" -ForegroundColor Cyan
    Write-Host "https://railway.app" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[4/5] 配置环境变量..." -ForegroundColor Yellow

Write-Host "请在 Railway 控制台设置以下环境变量:" -ForegroundColor Cyan
Write-Host "  - DUOMI_API_KEY: 你的多米API密钥" -ForegroundColor Gray
Write-Host "  - WIKE_API_KEY: 你的Wike API密钥" -ForegroundColor Gray
Write-Host "  - PORT: Railway会自动分配" -ForegroundColor Gray

Write-Host ""
Write-Host "[5/5] 更新前端 API URL..." -ForegroundColor Yellow

Write-Host "部署完成后，更新 frontend/.env.production 文件:" -ForegroundColor Cyan
Write-Host "  VITE_API_URL=https://your-railway-app.up.railway.app" -ForegroundColor Gray
Write-Host ""
Write-Host "然后重新部署前端" -ForegroundColor Yellow

Set-Location $ProjectRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 部署流程完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步:" -ForegroundColor Yellow
Write-Host "1. 在 Railway 设置环境变量" -ForegroundColor Cyan
Write-Host "2. 获取 Railway 分配的 URL" -ForegroundColor Cyan
Write-Host "3. 更新 frontend/.env.production" -ForegroundColor Cyan
Write-Host "4. 重新部署前端" -ForegroundColor Cyan
Write-Host ""

Read-Host "按 Enter 退出"
