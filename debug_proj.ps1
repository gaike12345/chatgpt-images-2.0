$token = 'WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
$proj = '4f29d041-9e60-45a1-8b96-839eac0fea6c'
$serv = '91e2a6fe-1b8d-446f-9a42-abb655a3f398'

$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

# Try different project ID formats
$queries = @(
    "query { project(id: `"$proj`") { id name } }",
    "query { project(by: { id: `"$proj`" }) { id name } }",
    "query { project(id: { eq: `"$proj`" }) { id name } }",
    "query { service(id: `"$serv`") { id name } }"
)
foreach ($q in $queries) {
    Write-Host "Query: $q"
    $body = @{ query = $q } | ConvertTo-Json
    try {
        $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body $body -TimeoutSec 10
        Write-Host "  OK: $($r | ConvertTo-Json -Depth 3)"
    } catch {
        Write-Host "  Error: $($_.Exception.Message)"
    }
}