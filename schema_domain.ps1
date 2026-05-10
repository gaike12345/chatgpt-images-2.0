$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

# Check domain types in schema
$body = @{ query = '{ __type(name: "ServiceInstance") { fields { name type { name kind ofType { name kind } } } } }' }
$r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json) -TimeoutSec 20
$r.data.__type.fields | Where-Object { $_.name -match 'domain' -or $_.name -match 'url' -or $_.name -match 'static' } | ForEach-Object {
    Write-Host "$($_.name) -> $($_.type.name) ($($_.type.kind)) ofType=$($_.type.ofType.name)" 
}