$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

Write-Host "=== 1. 健康检查 ==="
try {
    $r = Invoke-WebRequest -Uri 'https://chatgpt-images-api.railway.app/api/health' -Method GET -TimeoutSec 10 -UseBasicParsing
    Write-Host "HTTP $($r.StatusCode): $($r.Content.Substring(0, 300))"
} catch {
    Write-Host "API /api/health: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== 2. 测试图片生成（故意不传key看错误提示）==="
try {
    $r = Invoke-WebRequest -Uri 'https://chatgpt-images-api.railway.app/api/images/generate' -Method POST -TimeoutSec 10 -UseBasicParsing -ContentType 'application/json' -Body '{"prompt":"a cute cat"}'
    Write-Host "HTTP $($r.StatusCode): $($r.Content.Substring(0, 300))"
} catch {
    Write-Host "API /generate: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== 3. Railway GraphQL 查询 ==="
$body = @{ query = '{ service(id: "91e2a6fe-1b8d-446f-9a42-abb655a3f398") { id name serviceInstances(first: 3) { edges { node { id serviceName numReplicas isUpdatable } } } } }' }
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json) -TimeoutSec 15
    Write-Host ($r | ConvertTo-Json -Depth 4)
} catch {
    Write-Host "GraphQL query: $($_.Exception.Message)"
}