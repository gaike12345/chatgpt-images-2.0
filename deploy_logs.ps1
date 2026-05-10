[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$cfg = Get-Content C:\Users\Windows\.railway\config.json | ConvertFrom-Json
$token = $cfg.user.accessToken
$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

# Try to get deployment logs
$deployId = "e2a8adfd-01ae-4946-8b96-ba5716a925c6"
$query = '{"query":"{ deployment(id: \"' + $deployId + '\") { id status logs } }"}'

try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Method POST -Headers $headers -Body $query
    $r.data | ConvertTo-Json -Depth 6
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $sr = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host $sr.ReadToEnd()
        $sr.Close()
    }
}
