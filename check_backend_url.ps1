$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

# Get ServiceInstance with environmentId and all environment-related info
$body = @{
    query = '{ service(id: "91e2a6fe-1b8d-446f-9a42-abb655a3f398") { id name serviceInstances(first: 3) { edges { node { id serviceName environmentId upstreamUrl isUpdatable numReplicas } } } } }'
}
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json) -TimeoutSec 15
    Write-Host ($r | ConvertTo-Json -Depth 4)
} catch {
    Write-Host $_.Exception.Message
}

Write-Host ""

# Also try different domains field names from the schema we got earlier
# Schema showed: domain / suffix / targetPort fields exist on ServiceDomain type
# The "AllDomains" union might need a different approach
$body.query = '{ project(id: "4f29d041-9e60-45a1-8b96-839eac0fea6c") { name environments(first: 3) { edges { node { id name serviceInstances(first: 3) { edges { node { id serviceName allServiceDomains { ... on ServiceDomain { id domain suffix targetPort } } } } } } } } } }'
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json) -TimeoutSec 15
    Write-Host ($r | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "allServiceDomains: $($_.Exception.Message)"
}

Write-Host ""

# Try to get the actual railway.app URL for the service
$instanceId = 'd9e04a9e-2c7e-42a2-bca9-841fe03d54af'
$paths = @(
    "https://$instanceId.up.railway.app/",
    "https://$instanceId.up.railway.app/api",
    "https://$instanceId.up.railway.app/health",
    "https://$instanceId.up.railway.app/ping"
)
foreach ($p in $paths) {
    try {
        $r = Invoke-WebRequest -Uri $p -Method GET -TimeoutSec 8
        Write-Host "$p -> $($r.StatusCode)"
    } catch {
        Write-Host "$p -> $($_.Exception.Response.StatusCode)"
    }
}