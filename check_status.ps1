$token = 'WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
$proj = '4f29d041-9e60-45a1-8b96-839eac0fea6c'
$serv = '91e2a6fe-1b8d-446f-9a42-abb655a3f398'

$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
    'railway-origin' = 'CLI'
}

$query = @"
{ project(id: "$proj") { services(first: 20) { edges { node { id name deployments(first: 3) { edges { node { id status createdAt updatedAt meta { hostname } } } } } } } }
"@
$body = @{ query = $query } | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body $body -TimeoutSec 20
    $svc = $r.data.project.services.edges | Where-Object { $_.node.id -eq $serv }
    if ($svc) {
        Write-Host "Service: $($svc.node.name)"
        $svc.node.deployments.edges | ForEach-Object {
            $d = $_.node
            Write-Host "  Deployment: $($d.id)"
            Write-Host "  Status: $($d.status)"
            Write-Host "  Created: $($d.createdAt)"
            Write-Host "  Host: $($d.meta.hostname)"
        }
    } else {
        Write-Host "Service $serv not found"
        $r.data.project.services.edges | ForEach-Object {
            Write-Host "  - $($_.node.id): $($_.node.name)"
        }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}