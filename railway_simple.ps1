$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

# Try simplest possible queries
$tests = @(
    @{ name='me'; q='{ me { email } }' },
    @{ name='service-simple'; q='{ service(id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398"){name} }' },
    @{ name='deployments'; q='{ service(id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398"){deployments(first:1){edges{node{id status}}}} }' },
    @{ name='instances'; q='{ service(id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398"){serviceInstances{edges{node{id}}}} }' }
)

foreach ($t in $tests) {
    $body = @{ query = $t.q }
    try {
        $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json -Compress) -TimeoutSec 15
        if ($r.data) {
            Write-Host "[OK] $($t.name)"
        } else {
            Write-Host "[FAIL] $($t.name): $( $r | ConvertTo-Json -Compress)"
        }
    } catch {
        Write-Host "[ERR] $($t.name): $($_.Exception.Message.Substring(0,100))"
    }
}

Write-Host ""
Write-Host "=== redeploy with exact casing ==="
$bodyRedeploy = @{ query = 'mutation { serviceInstanceDeploy(input:{serviceInstanceId:"d9e04a9e-2c7e-42a2-bca9-841fe03d54af"}){id status} }' }
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($bodyRedeploy | ConvertTo-Json -Compress) -TimeoutSec 20
    Write-Host ($r | ConvertTo-Json)
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== npx railway status ==="
# Run railway status from backend dir
Set-Location 'C:\Users\Windows\Desktop\chatgpt-images-2.0\backend'
try {
    $out = npm run railway:status 2>&1
    Write-Host $out
} catch {
    Write-Host "npm run railway:status not found, trying npx"
    $out = npx railway status 2>&1
    Write-Host $out
}