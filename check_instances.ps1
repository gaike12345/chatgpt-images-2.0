[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$cfg = Get-Content C:\Users\Windows\.railway\config.json | ConvertFrom-Json
$token = $cfg.user.accessToken
$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

# Get deployments for our service with more detail
$body = '{"query":"{ serviceInstances(serviceId: \"91e2a6fe-1b8d-446f-9a42-abb655a3f398\") { edges { node { id deploymentId status source } } } }"}'

try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Method POST -Headers $headers -Body $body
    $r.data | ConvertTo-Json -Depth 6
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $sr = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host $sr.ReadToEnd()
        $sr.Close()
    }
}
