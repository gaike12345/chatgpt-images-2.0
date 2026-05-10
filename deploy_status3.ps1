$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

# Fix: use hashtable so ConvertTo-Json produces {"query":"..."} not just "..."
$body1 = @{ query = 'query { service(id: "91e2a6fe-1b8d-446f-9a42-abb655a3f398") { id name instances(first: 3) { edges { node { id status createdAt url staticUrl } } } } }' }
$r1 = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body1 | ConvertTo-Json -Depth 3) -TimeoutSec 20
Write-Host "=== service.instances ==="
$r1.data.service.instances.edges | ForEach-Object { Write-Host ($_.node | ConvertTo-Json) }

Write-Host ""
$body2 = @{ query = 'query { deployment(id: "4a2da2d6-b16e-488f-a92f-b7f9014f0dfb") { id status url staticUrl createdAt } }' }
$r2 = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body2 | ConvertTo-Json) -TimeoutSec 20
Write-Host "=== deployment ==="
Write-Host ($r2.data.deployment | ConvertTo-Json)

Write-Host ""
$body3 = @{ query = 'query { project(id: "4f29d041-9e60-45a1-8b96-839eac0fea6c") { name deployments(first: 5) { edges { node { id status url staticUrl createdAt } } } } }' }
$r3 = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body3 | ConvertTo-Json) -TimeoutSec 20
Write-Host "=== project.deployments ==="
$r3.data.project.deployments.edges | ForEach-Object { Write-Host ($_.node | ConvertTo-Json) }