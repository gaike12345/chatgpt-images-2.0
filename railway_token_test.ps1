$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

Write-Host "=== Railway Token 测试 ==="
# Simple query to test token
$r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ( @{ query = '{ me { id email } }' } | ConvertTo-Json -Compress) -TimeoutSec 15
if ($r.data) {
    Write-Host "Token OK: $($r.data.me.email)"
} else {
    Write-Host "Token issue: $( $r | ConvertTo-Json -Compress)"
}

Write-Host ""
Write-Host "=== 测试可用查询 ==="
$simpleQueries = @(
    'service(id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398"){id name}',
    'service(id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398"){id name tier}',
    'service(id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398"){name}',
    'service(id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398"){name tier plugin}'
)
foreach ($q in $simpleQueries) {
    $body = @{ query = "{ $q }" }
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json -Compress) -TimeoutSec 10
    if ($r.data) {
        Write-Host "OK: $q"
    } else {
        Write-Host "FAIL: $q -> $( $r | ConvertTo-Json -Compress)"
    }
}

Write-Host ""
Write-Host "=== Railway 服务配置（环境变量/启动命令）==="
# Try environment variable settings
$body = @{ query = '{ service(id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398") { id name files { name } } }' }
$r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json -Compress) -TimeoutSec 10
if ($r.data) { Write-Host "Files: $( $r.data.service.files | ConvertTo-Json )" } else { Write-Host "Files: FAIL" }

# Also check if there's a build settings query
$body2 = @{ query = '{ service(id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398") { buildCommand startCommand } }' }
$r2 = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body2 | ConvertTo-Json -Compress) -TimeoutSec 10
if ($r2.data) { Write-Host "BuildCmd: $( $r2.data.service | ConvertTo-Json )" } else { Write-Host "BuildCmd: FAIL" }