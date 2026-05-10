$token = 'WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
    'railway-origin' = 'CLI'
}

$body = @"
{
  "query": "{ me { id email } }"
}
"@
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body $body -TimeoutSec 20
    Write-Host "Me OK: $($r | ConvertTo-Json -Depth 5)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    $s = $_.Exception.Response
    if ($s) {
        $sr = $s.GetResponseStream()
        $sr.Position = 0
        $reader = New-Object System.IO.StreamReader($sr)
        $respBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "Response body: $respBody"
    }
}