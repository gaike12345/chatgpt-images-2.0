# 获取已部署的网站地址
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  获取已部署的网站地址" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 已找到的关键信息
$railwayToken = "WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e"
$railwayProjectId = "4f29d041-9e60-45a1-8b96-839eac0fea6c"
$railwayEnvId = "a5982d2a-2901-4363-9e08-d341b7b54526"
$railwayServiceId = "91e2a6fe-1b8d-446f-9a42-abb655a3f398"
$vercelOrgId = "team_yRi3o7iEMHn8KsrXuf1mRhSh"
$vercelProjectId = "prj_5iCMDGfsvS1tAJkMuij98K82quy"

Write-Host "📋 已配置的信息：" -ForegroundColor Yellow
Write-Host "   Railway Project ID: $railwayProjectId"
Write-Host "   Railway Service ID: $railwayServiceId"
Write-Host "   Vercel Project ID: $vercelProjectId"
Write-Host ""

Write-Host "🔍 正在获取 Railway 后端地址..." -ForegroundColor Yellow
$headers = @{
    'Authorization' = "Bearer $railwayToken"
    'Content-Type' = 'application/json'
}

# 查询 Railway 服务信息
$query = '{
  environment(id: "' + $railwayEnvId + '") {
    id
    name
    serviceInstances {
      edges {
        node {
          id
          serviceName
          serviceDomains {
            id
            domain
            suffix
            targetPort
          }
        }
      }
    }
  }
}'

$body = @{ query = $query }
$backendUrl = ""
$frontendUrl = ""

try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json) -TimeoutSec 10
    $env = $r.data.environment
    
    Write-Host "✅ Railway 环境: $($env.name)" -ForegroundColor Green
    
    $env.serviceInstances.edges | ForEach-Object {
        $si = $_.node
        Write-Host "  服务实例: $($si.serviceName)"
        
        $si.serviceDomains | ForEach-Object {
            $domain = "$($_.domain).$($_.suffix)"
            Write-Host "    域名: https://$domain" -ForegroundColor Green
            $backendUrl = "https://$domain"
        }
    }
} catch {
    Write-Host "⚠️  查询 Railway 失败: $($_.Exception.Message)" -ForegroundColor Yellow
    $backendUrl = "https://chatgpt-images-api.railway.app"
    Write-Host "使用备用地址: $backendUrl" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📱 前端地址 (Vercel):" -ForegroundColor Yellow
Write-Host "   请访问 Vercel Dashboard: https://vercel.com/dashboard"
Write-Host "   或查看项目: https://vercel.com/gaiike12345s-projects/frontend"
Write-Host ""

Write-Host "🔗 后端 API 地址 (Railway):" -ForegroundColor Yellow
if ($backendUrl) {
    Write-Host "   ✅ $backendUrl" -ForegroundColor Green
    Write-Host "   健康检查: $backendUrl/api/health" -ForegroundColor Cyan
} else {
    Write-Host "   ❓ 未获取到，尝试测试常见地址..." -ForegroundColor Yellow
    
    $testUrls = @(
        "https://chatgpt-images-api.railway.app",
        "https://$railwayServiceId.up.railway.app",
        "https://chatgpt-images-production.up.railway.app"
    )
    
    foreach ($url in $testUrls) {
        try {
            $r = Invoke-WebRequest -Uri "$url/api/health" -Method GET -TimeoutSec 5 -UseBasicParsing
            if ($r.StatusCode -eq 200) {
                Write-Host "   ✅ 找到可访问的地址: $url" -ForegroundColor Green
                $backendUrl = $url
                break
            }
        } catch {
            Write-Host "   ❌ $url - 无法访问" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🎉 汇总信息" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "🌐 前端地址 (Vercel):" -ForegroundColor Yellow
Write-Host "   请访问: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "   项目: https://vercel.com/gaiike12345s-projects/frontend" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔧 后端 API 地址 (Railway):" -ForegroundColor Yellow
if ($backendUrl) {
    Write-Host "   $backendUrl" -ForegroundColor Green
    Write-Host "   健康检查: $backendUrl/api/health" -ForegroundColor Gray
} else {
    Write-Host "   请访问: https://railway.app/dashboard" -ForegroundColor Cyan
    Write-Host "   项目: https://railway.app/project/$railwayProjectId" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  💡 提示" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. 访问 Vercel Dashboard 查看前端域名"
Write-Host "2. 访问 Railway Dashboard 查看后端域名"
Write-Host "3. 如果需要更新前端的后端地址，请修改 .env.production"
Write-Host ""

# 保存到文件
$output = @()
$output += "部署信息汇总"
$output += "============="
$output += ""
$output += "前端 (Vercel):"
$output += "  Dashboard: https://vercel.com/dashboard"
$output += "  项目: https://vercel.com/gaiike12345s-projects/frontend"
$output += ""
$output += "后端 (Railway):"
if ($backendUrl) {
    $output += "  API地址: $backendUrl"
    $output += "  健康检查: $backendUrl/api/health"
}
$output += "  Dashboard: https://railway.app/dashboard"
$output += "  项目: https://railway.app/project/$railwayProjectId"

$output | Out-File -FilePath "c:\Users\Windows\Desktop\chatgpt-images-2.0\部署信息.txt" -Encoding UTF8

Write-Host "✅ 信息已保存到: 部署信息.txt" -ForegroundColor Green
Write-Host ""
