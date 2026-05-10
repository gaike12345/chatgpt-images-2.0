[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$cfg = Get-Content C:\Users\Windows\.railway\config.json | ConvertFrom-Json
$token = $cfg.user.accessToken
$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

# Check service variables via serviceInstances -> variables
$query = '{"query":"{ serviceInstances(serviceId: \"91e2a6fe-1b8d-446f-9a42-abb655a3f398\") { edges { node { id variables { name value } } } } }"}'

try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Method POST -Headers $headers -Body $query
    $r.data | ConvertTo-Json -Depth 6
} catch {
    Write-Host "Error1: $($_.Exception.Message)"
}

# Also try deployment meta
$query2 = '{"query":"{ deployment(id: \"e2a8adfd-01ae-4946-8b96-ba5716a925c6\") { id status meta } }"}'
try {
    $r2 = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Method POST -Headers $headers -Body $query2
    $r2.data | ConvertTo-Json -Depth 6
} catch {
    Write-Host "Error2: $($_.Exception.Message)"
}
