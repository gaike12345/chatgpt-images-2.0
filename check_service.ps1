$token = 'WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
$serv = '91e2a6fe-1b8d-446f-9a42-abb655a3f398'

$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

$query = @"
query { service(id: "$serv") { id name deployments(first: 5) { edges { node { id status createdAt updatedAt meta { hostname } } } } } }
"@
$body = @{ query = $query } | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body $body -TimeoutSec 20
    $svc = $r.data.service
    Write-Host "Service: $($svc.name) ($($svc.id))"
    $svc.deployments.edges | ForEach-Object {
        $d = $_.node
        Write-Host ""
        Write-Host "  Deployment: $($d.id)"
        Write-Host "  Status: $($d.status)"
        Write-Host "  Created: $($d.createdAt)"
        Write-Host "  Updated: $($d.updatedAt)"
        Write-Host "  Hostname: $($d.meta.hostname)"
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}