$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

$envId = 'a5982d2a-2901-4363-9e08-d341b7b54526'
$svcId = '91e2a6fe-1b8d-446f-9a42-abb655a3f398'

Write-Host "=== 获取完整服务实例信息（Networking/域名）==="
# Try to get networking info
$queries = @(
    '{ serviceInstance(serviceId:"91e2a6fe-1b8d-446f-9a42-abb655a3f398",environmentId:"a5982d2a-2901-4363-9e08-d341b7b54526") { id serviceName isUpdatable } }',
    '{ service(id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398") { name serviceInstances { edges { node { id serviceName } } } } }',
    '{ environment(id:"a5982d2a-2901-4363-9e08-d341b7b54526") { id name serviceInstances { edges { node { id serviceName } } } } }'
)
foreach ($q in $queries) {
    $body = @{ query = $q }
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json -Compress) -TimeoutSec 15
    if ($r.data) {
        Write-Host "OK: $( $r.data | ConvertTo-Json -Compress)"
    } else {
        Write-Host "FAIL: $( $r | ConvertTo-Json -Compress)"
    }
}

Write-Host ""
Write-Host "=== 获取服务实例公共URL（通过各种可能字段）==="
# Check all service instance fields
$body2 = @{
    query = '{ __type(name:"ServiceInstance") { fields { name type { name kind } } } }'
}
$r2 = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body2 | ConvertTo-Json -Compress) -TimeoutSec 15
if ($r2.data) {
    $r2.data.__type.fields | ForEach-Object {
        Write-Host "  $($_.name): $($_.type.name) ($($_.type.kind))"
    }
}

Write-Host ""
Write-Host "=== Railway 代理测试（更多路径）==="
$paths = @(
    '/',
    '/api',
    '/api/health',
    '/api/v1',
    '/api/v1/health',
    '/health',
    '/ping',
    '/api/images/generate'
)
foreach ($p in $paths) {
    try {
        $r = Invoke-WebRequest -Uri "https://chatgpt-images-api.railway.app$p" -Method GET -TimeoutSec 5 -UseBasicParsing
        Write-Host "OK $($r.StatusCode): $p"
    } catch {
        $sc = $_.Exception.Response.StatusCode
        Write-Host "HTTP $sc : $p"
    }
}

Write-Host ""
Write-Host "=== 测试 railway.app 根域名的 API 路由 ==="
# Railway API is at backboard.railway.app, but chatgpt-images-api.railway.app should serve the app
# Let's see what happens with different subdomains
$subs = @(
    'd9e04a9e-2c7e-42a2-bca9-841fe03d54af',
    'chatgpt-images-api',
    'chatgpt-images-api-production',
    'chatgpt-images-api-4f29d041'
)
foreach ($sub in $subs) {
    $url = "https://$sub.up.railway.app/api/health"
    try {
        $r = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 6 -UseBasicParsing
        Write-Host "OK $($r.StatusCode): https://$sub.up.railway.app"
        Write-Host "  Content: $( $r.Content.Substring(0,150) )"
    } catch {
        Write-Host "FAIL: https://$sub.up.railway.app"
    }
}