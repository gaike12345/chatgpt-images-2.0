$token = 'WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

# Try different endpoint variations
foreach ($url in @(
    'https://backboard.railway.app/graphql/v2',
    'https://backboard.railway.app/graphql',
    'https://backboard.railway.app/api/projects/4f29d041-9e60-45a1-8b96-839eac0fea6c/services'
)) {
    Write-Host "Trying: $url"
    try {
        $body = @{ query = '{ me { id email } }' } | ConvertTo-Json
        $r = Invoke-RestMethod -Uri $url -Headers $headers -Method POST -Body $body -TimeoutSec 10
        $r | ConvertTo-Json -Depth 3
    } catch {
        Write-Host "  Error: $($_.Exception.Message)"
    }
}