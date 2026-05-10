$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

Write-Host "=== Railway 环境配置 ==="
$body = @{
    query = '{ environment(id:"a5982d2a-2901-4363-9e08-d341b7b54526") { id name serviceInstances { edges { node { id serviceName serviceDomains { id domain suffix targetPort } } } } } } }'
}
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json) -TimeoutSec 15
    $env = $r.data.environment
    Write-Host "Env: $($env.name) [$($env.id)]"
    $env.serviceInstances.edges | ForEach-Object {
        $si = $_.node
        Write-Host "  Instance: $($si.serviceName) [$($si.id)]"
        $si.serviceDomains | ForEach-Object {
            Write-Host "    Domain: $($_.domain).$($_.suffix) port=$($_.targetPort)"
        }
    }
} catch {
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "=== Railway 根域名 API 路径测试 ==="
$base = 'https://chatgpt-images-api.railway.app'
$paths = @('/','/health','/api','/ping')
foreach ($p in $paths) {
    try {
        $r = Invoke-WebRequest -Uri "$base$p" -Method GET -TimeoutSec 6 -UseBasicParsing
        $content = $r.Content.Substring(0, 100)
        Write-Host "OK $($r.StatusCode) $p"
        Write-Host "  Content: $content"
    } catch {
        Write-Host "FAIL $p"
    }
}

Write-Host ""
Write-Host "=== Railway 官方 API 获取服务域名 ==="
try {
    $r = Invoke-RestMethod -Uri 'https://api.railway.app/v2/projects/4f29d041-9e60-45a1-8b96-839eac0fea6c' -Headers $headers -TimeoutSec 10
    Write-Host ($r | ConvertTo-Json -Depth 4)
} catch {
    Write-Host "Railway API: $($_.Exception.Message.Substring(0, 100))"
}

Write-Host ""
Write-Host "=== Dockerfile 检查（确认 PORT 设置）==="
Get-Content 'C:\Users\Windows\Desktop\chatgpt-images-2.0\backend\Dockerfile'