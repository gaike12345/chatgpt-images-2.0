[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$cfg = Get-Content C:\Users\Windows\.railway\config.json | ConvertFrom-Json
$token = $cfg.user.accessToken
$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

# Get all variables for the service
$envId = "a5982d2a-2901-4363-9e08-d341b7b54526"
$srvId = "91e2a6fe-1b8d-446f-9a42-abb655a3f398"

# Try to list variables via environment
$query = '{"query":"{ environment(id: \"' + $envId + '\") { id variables { edges { node { name value serviceId } } } } }"}'

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
