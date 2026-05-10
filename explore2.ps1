$body = @"
{"query":"{ __schema { types { name fields { name type { name kind } } } } }"}
"@
$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body $body -TimeoutSec 20
    $r.data.__schema.types | Where-Object { $_.name -match 'Service|Deployment|Project' } | ForEach-Object {
        Write-Host "=== $($_.name) ==="
        $_.fields | ForEach-Object { Write-Host "  $($_.name): $($_.type.name)" }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}