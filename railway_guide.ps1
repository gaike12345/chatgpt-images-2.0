$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

Write-Host "=== 找实际 URL（环境/服务信息）==="
$body = @{ query = '{ me { email projects(first:3) { edges { node { id name } } } } }' }
$r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json -Compress) -TimeoutSec 15
if ($r.data) {
    Write-Host "Projects: $( $r.data.me.projects.edges | ConvertTo-Json -Compress)"
} else {
    Write-Host ($r | ConvertTo-Json)
}

Write-Host ""
Write-Host "=== 服务基本信息（简化版）==="
$body = @{ query = '{ service(id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398") { id name } }' }
$r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json -Compress) -TimeoutSec 15
Write-Host ($r | ConvertTo-Json)

Write-Host ""
Write-Host "=== Railway 仪表盘 URL ==="
Write-Host "打开浏览器访问: https://railway.app/project/4f29d041-9e60-45a1-8b96-839eac0fea6c"
Write-Host "找到 chatgpt-images-api 服务，点击后查看 Settings > Networking"
Write-Host "如果状态是 FAILED，点击 Redeploy"
Write-Host ""
Write-Host "=== 尝试触发 redeploy ==="
$body = @{ query = 'mutation { serviceRedeploy(serviceId:"91e2a6fe-1b8d-446f-9a42-abb655a3f398") { deployment { id status } } }' }
$r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json -Compress) -TimeoutSec 20
Write-Host ($r | ConvertTo-Json)