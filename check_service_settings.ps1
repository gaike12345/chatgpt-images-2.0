$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

$body = @{ query = '{ service(id: "91e2a6fe-1b8d-446f-9a42-abb655a3f398") { id name serviceInstances(first: 3) { edges { node { id serviceName environmentId isUpdatable numReplicas dockerfilePath rootDirectory startCommand buildCommand healthcheckPath healthcheckTimeout nixpacksPlan } } } } }' }

try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json) -TimeoutSec 15
    $svc = $r.data.service
    Write-Host "Service: $($svc.name)"
    $svc.serviceInstances.edges | ForEach-Object {
        $inst = $_.node
        Write-Host ""
        Write-Host "  Instance: $($inst.serviceName) [$($inst.id)]"
        Write-Host "  environmentId: $($inst.environmentId)"
        Write-Host "  isUpdatable: $($inst.isUpdatable)"
        Write-Host "  numReplicas: $($inst.numReplicas)"
        Write-Host "  startCommand: $($inst.startCommand)"
        Write-Host "  buildCommand: $($inst.buildCommand)"
        Write-Host "  dockerfilePath: $($inst.dockerfilePath)"
        Write-Host "  rootDirectory: $($inst.rootDirectory)"
        Write-Host "  healthcheckPath: $($inst.healthcheckPath)"
        Write-Host "  healthcheckTimeout: $($inst.healthcheckTimeout)"
        Write-Host "  nixpacksPlan: $($inst.nixpacksPlan | ConvertTo-Json)"
    }
} catch {
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "=== Checking Railway docs via direct URL test ==="

# Railway default port behavior - try hitting with different ports via the instance ID
$instanceId = 'd9e04a9e-2c7e-42a2-bca9-841fe03d54af'
$ports = @(3001, 8080, 3000, 8000)
foreach ($port in $ports) {
    try {
        $r = Invoke-WebRequest -Uri "https://$instanceId.up.railway.app:$port/" -Method GET -TimeoutSec 5
        Write-Host "Port $port -> $($r.StatusCode)"
    } catch {
        $sc = $_.Exception.Response.StatusCode
        Write-Host "Port $port -> $sc"
    }
}