$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

$body = @{
    query = '{ service(id: "91e2a6fe-1b8d-446f-9a42-abb655a3f398") { id name } }'
}

# Check if service instances have domains
$body.query = '{ service(id: "91e2a6fe-1b8d-446f-9a42-abb655a3f398") { id name serviceInstances(first: 3) { edges { node { id serviceName allDomains { id domain suffix targetPort } } } } } }'
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json) -TimeoutSec 15
    Write-Host ($r | ConvertTo-Json -Depth 4)
} catch {
    Write-Host "service.allDomains: $($_.Exception.Message)"
}

Write-Host ""

# Try serviceServiceDomains
$body.query = '{ service(id: "91e2a6fe-1b8d-446f-9a42-abb655a3f398") { id name serviceInstances(first: 3) { edges { node { id serviceName serviceDomains { id domain suffix targetPort } } } } } }'
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json) -TimeoutSec 15
    Write-Host ($r | ConvertTo-Json -Depth 4)
} catch {
    Write-Host "service.serviceDomains: $($_.Exception.Message)"
}

Write-Host ""

# Try service with domains field
$body.query = '{ service(id: "91e2a6fe-1b8d-446f-9a42-abb655a3f398") { id name domains { id domain suffix targetPort } } }'
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json) -TimeoutSec 15
    Write-Host ($r | ConvertTo-Json -Depth 4)
} catch {
    Write-Host "service.domains: $($_.Exception.Message)"
}

Write-Host ""

# Try to test the actual backend URL
$instanceId = 'd9e04a9e-2c7e-42a2-bca9-841fe03d54af'
try {
    $r = Invoke-WebRequest -Uri "https://$instanceId.up.railway.app" -Method GET -TimeoutSec 10 -MaximumRedirection 0 -PassThru
    Write-Host "Backend accessible: $($r.StatusCode)"
} catch {
    Write-Host "Backend check: $($_.Exception.Message)"
}