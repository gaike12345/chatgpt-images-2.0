$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

Write-Host "=== railway status 确认服务在线 ==="
Set-Location 'C:\Users\Windows\Desktop\chatgpt-images-2.0\backend'
$out = node_modules\.bin\railway status 2>&1
Write-Host $out

Write-Host ""
Write-Host "=== 找出 Railway 分配的子域名 ==="
# Railway auto-assigns subdomain but it may not be shown in CLI
# The format is usually: <project-id>.<region>.railway.app
# But let's check if there's a way to get it via Railway REST API

# Try Railway's own API endpoint
$railwayProjectUrls = @(
    'https://api.railway.app/v2/projects/4f29d041-9e60-45a1-8b96-839eac0fea6c',
    'https://api.railway.app/v2/services/91e2a6fe-1b8d-446f-9a42-abb655a3f398'
)
foreach ($u in $railwayProjectUrls) {
    try {
        $r = Invoke-RestMethod -Uri $u -Headers $headers -TimeoutSec 8
        Write-Host "OK: $u"
        Write-Host ($r | ConvertTo-Json -Depth 3)
    } catch {
        Write-Host "FAIL $u: $($_.Exception.Message.Substring(0,80))"
    }
}

Write-Host ""
Write-Host "=== 获取 Railway 项目环境域名配置 ==="
# Check domains on the environment
$body = @{
    query = '{ environment(id:"a5982d2a-2901-4363-9e08-d341b7b54526") { id name serviceInstances { edges { node { id serviceName domains { domain } } } } } } }'
}
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json -Compress) -TimeoutSec 15
    Write-Host ($r | ConvertTo-Json -Depth 4)
} catch {
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "=== 测试根域名的 API 路径（Railway默认行为）==="
$paths = @(
    '/',
    '/health',
    '/api',
    '/api/health',
    '/api/v1/health',
    '/ping',
    '/status'
)
foreach ($p in $paths) {
    try {
        $r = Invoke-WebRequest -Uri "https://chatgpt-images-api.railway.app$p" -Method GET -TimeoutSec 6 -UseBasicParsing
        Write-Host "OK $($r.StatusCode): $p -> $( $r.Content.Substring(0,100) )"
    } catch {
        Write-Host "HTTP $($_.Exception.Response.StatusCode.value__): $p"
    }
}

Write-Host ""
Write-Host "=== Railway 服务实例端口 ==="
# Railway proxies port 80/443 to the app's PORT env var (default 3001 in Dockerfile)
# So https://<domain>/ should reach the Express server
# But the backend listens on 3001... 
# Let's check Railway's networking settings via GraphQL
$body2 = @{
    query = '{ project(id:"4f29d041-9e60-45a1-8b96-839eac0fea6c") { environments(first:1) { edges { node { id name serviceInstances { edges { node { id serviceName serviceDomains { domain } } } } } } } } } }'
}
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body2 | ConvertTo-Json -Compress) -TimeoutSec 15
    Write-Host ($r | ConvertTo-Json)
} catch {
    Write-Host $_.Exception.Message
}