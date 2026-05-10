$token = 'WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
$serv = '91e2a6fe-1b8d-446f-9a42-abb655a3f398'
$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

# Explore available fields on Service type
$query = '{ __type(name: "Service") { fields { name type { name kind } } } }'
$body = @{ query = $query } | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body $body -TimeoutSec 20
    $r.data.__type.fields | ForEach-Object { Write-Host $_.name }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}