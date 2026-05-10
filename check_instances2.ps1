$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

# Try with correct camelCase
$body = @{
    query = 'query { service(id: "91e2a6fe-1b8d-446f-9a42-abb655a3f398") { id name serviceInstances(first: 3) { edges { node { id status createdAt url staticUrl latestDeployment { id status url staticUrl } } } } } }'
}
$r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json -Depth 5) -TimeoutSec 20
Write-Host ($r | ConvertTo-Json -Depth 5)