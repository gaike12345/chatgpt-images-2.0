[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$cfg = Get-Content C:\Users\Windows\.railway\config.json | ConvertFrom-Json
$token = $cfg.user.accessToken
Write-Host "Token found: $($token.Substring(0,10))..."

$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

$body = '{"query":"{ project(id: \"4f29d041-9e60-45a1-8b96-839eac0fea6c\") { services { edges { node { id name deployments(first: 2) { edges { node { id status createdAt } } } } } } } }"}'

try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Method POST -Headers $headers -Body $body
    $r.data | ConvertTo-Json -Depth 6
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
