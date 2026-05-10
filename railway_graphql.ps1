$ErrorActionPreference = 'Continue'
$token = 'WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
    'railway-origin' = 'CLI'
}
$proj = '4f29d041-9e60-45a1-8b96-839eac0fea6c'
$envId = 'a5982d2a-2901-4363-9e08-d341b7b54526'

# Test: create a new service via GraphQL
$query = '{
  "query": "mutation { serviceCreate(input: { projectId: \"' + $proj + '\", name: \"chatgpt-images-api\", environmentId: \"' + $envId + '\" }) { id name } }"
}'

try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body $query -TimeoutSec 20
    Write-Host ('Result: ' + ($r | ConvertTo-Json -Depth 10))
} catch {
    Write-Host ('ERR: ' + $_.Exception.Message)
    Write-Host ('Status: ' + $_.Exception.Response.StatusCode)
}