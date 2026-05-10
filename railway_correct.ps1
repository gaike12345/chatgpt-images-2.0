$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

$envId = 'a5982d2a-2901-4363-9e08-d341b7b54526'
$svcId = '91e2a6fe-1b8d-446f-9a42-abb655a3f398'

Write-Host "=== 正确Redeploy ==="
$bodyRedeploy = @{
    query = 'mutation { serviceInstanceDeploy(serviceId:"91e2a6fe-1b8d-446f-9a42-abb655a3f398",environmentId:"a5982d2a-2901-4363-9e08-d341b7b54526") }'
}
$r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($bodyRedeploy | ConvertTo-Json) -TimeoutSec 20
Write-Host ($r | ConvertTo-Json)

Write-Host ""
Write-Host "=== 获取 ServiceInstance URL ==="
$bodySI = @{
    query = '{ serviceInstance(serviceId:"91e2a6fe-1b8d-446f-9a42-abb655a3f398",environmentId:"a5982d2a-2901-4363-9e08-d341b7b54526") { id serviceName isUpdatable } }'
}
$r2 = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($bodySI | ConvertTo-Json) -TimeoutSec 15
if ($r2.data) {
    Write-Host "Instance: $( $r2.data.serviceInstance | ConvertTo-Json)"
} else {
    Write-Host ($r2 | ConvertTo-Json)
}

Write-Host ""
Write-Host "=== 获取环境列表 ==="
$bodyEnv = @{
    query = '{ project(id:"4f29d041-9e60-45a1-8b96-839eac0fea6c") { name environments(first:3) { edges { node { id name isDefault } } } } }'
}
$r3 = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($bodyEnv | ConvertTo-Json) -TimeoutSec 15
if ($r3.data) {
    Write-Host "Project: $($r3.data.project.name)"
    $r3.data.project.environments.edges | ForEach-Object {
        $e = $_.node
        Write-Host "  Env: $($e.name) [$($e.id)] default=$($e.isDefault)"
    }
} else {
    Write-Host ($r3 | ConvertTo-Json)
}

Write-Host ""
Write-Host "=== 部署状态 ==="
$bodyDep = @{
    query = '{ service(id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398") { deployments(first:2) { edges { node { id status createdAt } } } } }'
}
$r4 = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($bodyDep | ConvertTo-Json) -TimeoutSec 15
if ($r4.data) {
    $r4.data.service.deployments.edges | ForEach-Object {
        $d = $_.node
        Write-Host "  Deployment: $($d.id) - $($d.status) - created $($d.createdAt)"
    }
} else {
    Write-Host ($r4 | ConvertTo-Json)
}