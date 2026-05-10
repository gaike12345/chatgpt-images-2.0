$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

Write-Host "=== 查看部署详情 ==="
$body = @{
    query = '{ service(id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398") {
        deployments(first:3) {
            edges { node {
                id status createdAt startedAt completedAt
                runtime {
                    outputDir
                    buildCommand
                    startCommand
                }
            } }
        }
    } }'
}
$r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json) -TimeoutSec 15
if ($r.data) {
    $r.data.service.deployments.edges | ForEach-Object {
        $dep = $_.node
        Write-Host ""
        Write-Host "Deployment: $($dep.id)"
        Write-Host "  Status: $($dep.status)"
        Write-Host "  Created: $($dep.createdAt)"
        Write-Host "  Started: $($dep.startedAt)"
        Write-Host "  Completed: $($dep.completedAt)"
        if ($dep.runtime) {
            Write-Host "  BuildCmd: $($dep.runtime.buildCommand)"
            Write-Host "  StartCmd: $($dep.runtime.startCommand)"
            Write-Host "  OutputDir: $($dep.runtime.outputDir)"
        }
    }
} else {
    Write-Host ($r | ConvertTo-Json)
}

Write-Host ""
Write-Host "=== 查找 ServiceInstance 详情（含domain）==="
$body2 = @{
    query = '{ serviceInstance(id:"d9e04a9e-2c7e-42a2-bca9-841fe03d54af") {
        id serviceName isUpdatable
        serviceDomains { id domain suffix targetPort }
    } }'
}
$r2 = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body2 | ConvertTo-Json) -TimeoutSec 15
if ($r2.data) {
    $si = $r2.data.serviceInstance
    Write-Host "Instance: $($si.serviceName)"
    Write-Host "  isUpdatable: $($si.isUpdatable)"
    Write-Host "  Domains: $( $si.serviceDomains | ConvertTo-Json)"
} else {
    Write-Host ($r2 | ConvertTo-Json)
}

Write-Host ""
Write-Host "=== serviceInstanceDeploy 变体 ==="
$variants = @(
    'mutation { serviceInstanceDeploy(serviceInstanceId:"d9e04a9e-2c7e-42a2-bca9-841fe03d54af"){id status} }',
    'mutation { serviceInstanceDeploy(input:{serviceInstanceId:"d9e04a9e-2c7e-42a2-bca9-841fe03d54af"}){id status} }',
    'mutation { serviceInstanceDeploy(id:"d9e04a9e-2c7e-42a2-bca9-841fe03d54af"){id} }'
)
foreach ($v in $variants) {
    $body = @{ query = $v }
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json) -TimeoutSec 15
    Write-Host "$($v.Substring(0,60)): $( $r | ConvertTo-Json -Compress)"
}