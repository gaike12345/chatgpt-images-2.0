$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

$urls = @(
    'https://chatgpt-images-api-production.up.railway.app/',
    'https://chatgpt-images-api-production.up.railway.app/api/health',
    'https://chatgpt-images-api.railway.app/',
    'https://chatgpt-images-api.up.railway.app/'
)
foreach ($u in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $u -Method GET -TimeoutSec 8 -UseBasicParsing
        Write-Host "OK $($r.StatusCode): $u"
        Write-Host "  $($r.Content.Substring(0, [Math]::Min(200, $r.Content.Length)))"
    } catch {
        $sc = $_.Exception.Response.StatusCode
        Write-Host "HTTP $sc : $u"
    }
}

Write-Host ""
Write-Host "=== Redeploy mutation ==="
$bodyRedeploy = @{ query = 'mutation { serviceRedeploy(input: { serviceId: "91e2a6fe-1b8d-446f-9a42-abb655a3f398" }) { deployment { id status } } }' }
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($bodyRedeploy | ConvertTo-Json) -TimeoutSec 20
    Write-Host ($r | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "Redeploy error: $($_.Exception.Message)"
}