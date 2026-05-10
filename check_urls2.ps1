$urls = @(
    'https://chatgpt-images-api-4f29d041.up.railway.app/api/health',
    'https://chatgpt-images-api-4f29d041-9e60-45a1-8b96-839eac0fea6c.up.railway.app/api/health',
    'https://91e2a6fe-1b8d-446f-9a42-abb655a3f398.up.railway.app/api/health',
    'https://91e2a6fe.up.railway.app/',
    'https://chatgpt-images-api.a5982d2a-2901-4363-9e08-d341b7b54526.up.railway.app/api/health',
    'https://chatgpt-images-api-production.a5982d2a-2901-4363-9e08-d341b7b54526.up.railway.app/api/health'
)
foreach ($u in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $u -Method GET -TimeoutSec 8 -UseBasicParsing
        Write-Host "OK $($r.StatusCode): $u"
    } catch {
        Write-Host "FAIL: $u"
    }
}

Write-Host ""
Write-Host "=== Check Railway environments ==="
$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

# Try environments query
$body = @{ query = '{ service(id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398") { name environments(first:2) { edges { node { id name } } } } }' }
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json -Compress) -TimeoutSec 15
    Write-Host ($r | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "environments: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== Redeploy ==="
$body2 = @{ query = 'mutation { serviceRedeploy(input:{serviceId:"91e2a6fe-1b8d-446f-9a42-abb655a3f398"}){deployment{id status createdAt}} }' }
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body2 | ConvertTo-Json -Compress) -TimeoutSec 20
    Write-Host ($r | ConvertTo-Json)
} catch {
    Write-Host "redeploy: $($_.Exception.Message)"
}