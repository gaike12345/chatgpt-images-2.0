Start-Sleep -Seconds 3
$base = 'https://chatgpt-images-api.railway.app'
foreach ($path in @('/', '/api/health', '/health', '/api/v1/health')) {
    try {
        $r = Invoke-WebRequest -Uri "$base$path" -TimeoutSec 8 -UseBasicParsing
        Write-Host "OK $($r.StatusCode) $path"
        Write-Host "  $($r.Content.Substring(0, [Math]::Min(200, $r.Content.Length)))"
    } catch {
        $sc = $_.Exception.Response.StatusCode
        Write-Host "HTTP $sc $path"
    }
}

Write-Host ""
Write-Host "=== Railway logs (current) ==="
Set-Location 'C:\Users\Windows\Desktop\chatgpt-images-2.0\backend'
node_modules\.bin\railway logs 2>&1 | Select-Object -Last 20