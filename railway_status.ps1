$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

Write-Host "=== Railway 服务详情 ==="
$body = @{
    query = '{ service(id: "91e2a6fe-1b8d-446f-9a42-abb655a3f398") {
        id name
        tier
        serviceInstances(first: 5) {
            edges { node {
                id serviceName numReplicas isUpdatable
                source { type repo owner branch rootDirectory }
            } }
        }
        environments(first: 3) {
            edges { node {
                id name
                serviceInstances(first: 3) {
                    edges { node { id serviceName } }
                }
            } }
        }
    } }'
}
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json) -TimeoutSec 15
    $svc = $r.data.service
    Write-Host "Service: $($svc.id) / $($svc.name)"
    Write-Host "Tier: $($svc.tier)"
    Write-Host ""
    Write-Host "Service Instances:"
    $svc.serviceInstances.edges | ForEach-Object {
        $inst = $_.node
        Write-Host "  - $($inst.serviceName) [$($inst.id)] replicas=$($inst.numReplicas) updatable=$($inst.isUpdatable)"
    }
    Write-Host ""
    Write-Host "Environments:"
    $svc.environments.edges | ForEach-Object {
        $env = $_.node
        Write-Host "  $tier"
        Write-Host "  Env: $($env.name) ($($env.id))"
        $env.serviceInstances.edges | ForEach-Object {
            Write-Host "    SI: $($_.node.serviceName) [$($_.node.id)]"
        }
    }
} catch {
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "=== Railway 日志 ==="
# Try deployment events query
$body2 = @{
    query = '{ deployment(id: "4a2da2d6-b16e-488f-a92f-b7f9014f0dfb") {
        id status createdAt startedAt completedAt
        deployableId source commit
    } }'
}
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body2 | ConvertTo-Json) -TimeoutSec 15
    $dep = $r.data.deployment
    Write-Host "Deployment: $($dep.id)"
    Write-Host "Status: $($dep.status)"
    Write-Host "Created: $($dep.createdAt)"
    Write-Host "Started: $($dep.startedAt)"
    Write-Host "Completed: $($dep.completedAt)"
    Write-Host "Source: $($dep.source)"
    Write-Host "Commit: $($dep.commit)"
    Write-Host "DeployableId: $($dep.deployableId)"
} catch {
    Write-Host "Deployment query: $($_.Exception.Message)"
}