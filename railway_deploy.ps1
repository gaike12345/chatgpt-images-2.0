$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

Write-Host "=== 正确mutation: serviceInstanceDeploy ==="
# Try deploying the service instance directly
$body = @{ query = 'mutation { serviceInstanceDeploy(serviceInstanceId:"d9e04a9e-2c7e-42a2-bca9-841fe03d54af") { id status } }' }
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json -Compress) -TimeoutSec 20
    Write-Host ($r | ConvertTo-Json)
} catch {
    Write-Host "serviceInstanceDeploy: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== 尝试项目中的服务列表 ==="
$body2 = @{ query = '{ project(id:"4f29d041-9e60-45a1-8b96-839eac0fea6c") { id name services { id name } } }' }
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body2 | ConvertTo-Json -Compress) -TimeoutSec 15
    Write-Host ($r | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "project services: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== 尝试服务详情含 instanceId ==="
$body3 = @{ query = '{ service(id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398") { id name serviceInstances { id serviceName } } }' }
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body3 | ConvertTo-Json -Compress) -TimeoutSec 15
    Write-Host ($r | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "serviceInstances: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== serviceUpdate 尝试（设置启动命令）==="
$body4 = @{ query = 'mutation { serviceUpdate(input:{id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398",startCommand:"node dist/index.js"}) { id } }' }
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body4 | ConvertTo-Json -Compress) -TimeoutSec 15
    Write-Host ($r | ConvertTo-Json)
} catch {
    Write-Host "serviceUpdate: $($_.Exception.Message)"
}