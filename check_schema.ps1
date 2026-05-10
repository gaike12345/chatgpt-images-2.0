$token = 'WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
    'railway-origin' = 'CLI'
}

# Check what input ArtifactCreateInput expects
$body = @"
{
  "query": "{ __type(name: \"ArtifactCreateInput\") { name inputFields { name type { name kind ofType { name kind } } } } }"
}
"@
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body $body -TimeoutSec 20
    $r | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}