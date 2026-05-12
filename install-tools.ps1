# AI图片生成工作流 - 工具安装脚本
# 运行此脚本安装所有必要的工具

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI图片生成工作流 - 工具安装" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Winget 检查
Write-Host "[1/4] 检查 Winget (Windows 包管理器)..." -ForegroundColor Yellow

$wingetExists = Get-Command winget -ErrorAction SilentlyContinue

if (-not $wingetExists) {
    Write-Host "⚠️  Winget 未找到，尝试其他方法..." -ForegroundColor Yellow
    
    # 检查是否通过 Microsoft Store 安装了应用安装器
    $appInstaller = Get-AppxPackage -Name "Microsoft.DesktopAppInstaller" -ErrorAction SilentlyContinue
    
    if (-not $appInstaller) {
        Write-Host "❌ 建议从 Microsoft Store 安装 'App Installer' 来启用 Winget" -ForegroundColor Red
        Write-Host "   链接: https://apps.microsoft.com/store/detail/app-installer/9NBLGGH4NNS1" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "✅ App Installer 已安装，Winget 应该可用" -ForegroundColor Green
        Write-Host "   请重启 PowerShell 后重新运行此脚本" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Winget 已安装" -ForegroundColor Green
    Write-Host ""

    # 安装 Node.js
    Write-Host "[2/4] 安装 Node.js..." -ForegroundColor Yellow
    Write-Host "   使用 Node.js 20 LTS (长期支持版本)" -ForegroundColor Gray
    
    try {
        winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements --silent
        
        Write-Host "✅ Node.js 安装成功！" -ForegroundColor Green
        Write-Host "   新开一个 PowerShell 窗口以使用新版 Node.js" -ForegroundColor Cyan
        Write-Host ""
    } catch {
        Write-Host "❌ Node.js 安装失败: $_" -ForegroundColor Red
        Write-Host "   请手动下载安装: https://nodejs.org/" -ForegroundColor Gray
    }

    # 安装 Git
    Write-Host "[3/4] 安装 Git..." -ForegroundColor Yellow
    
    try {
        winget install Git.Git --accept-package-agreements --accept-source-agreements --silent
        
        Write-Host "✅ Git 安装成功！" -ForegroundColor Green
        Write-Host "   新开一个 PowerShell 窗口以使用新版 Git" -ForegroundColor Cyan
        Write-Host ""
    } catch {
        Write-Host "⚠️  Git 安装失败: $_" -ForegroundColor Yellow
        Write-Host "   请手动下载安装: https://git-scm.com/download/win" -ForegroundColor Gray
    }

    # 安装 Railway CLI
    Write-Host "[4/4] 安装 Railway CLI..." -ForegroundColor Yellow
    
    try {
        npm install -g @railway/cli --silent
        
        Write-Host "✅ Railway CLI 安装成功！" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Railway CLI 安装失败: $_" -ForegroundColor Yellow
        Write-Host "   请手动执行: npm install -g @railway/cli" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 工具安装完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步:" -ForegroundColor Yellow
Write-Host "1. 新开一个 PowerShell 窗口（使新安装的工具生效）" -ForegroundColor Cyan
Write-Host "2. 运行 deploy-all.ps1 进行部署" -ForegroundColor Cyan
Write-Host "3. 或者运行 deploy-frontend.ps1 和 deploy-backend.ps1 分别部署" -ForegroundColor Cyan
Write-Host ""

Read-Host "按 Enter 退出"
