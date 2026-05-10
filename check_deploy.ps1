$ErrorActionPreference = 'Continue'
$token = 'WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
    'railway-origin' = 'CLI'
}
$proj = '4f29d041-9e60-45a1-8b96-839eac0fea6c'
$serv = '91e2a6fe-1b8d-446f-9a42-abb655a3f398'

# Check deployments for the new service
$query = '{"query":"query { project(id: \"' + $proj + '\") { services.edges { node { id name deployments { edges { node { id status createdAt updatedAt } } } } } } }"}'
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body $query -TimeoutSec 20
    $r | ConvertTo-Json -Depth 20
} catch {
    Write-Host ('ERR: ' + $_.Exception.Message)
}