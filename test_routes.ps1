Start-Sleep -Seconds 5
$base = 'https://chatgpt-images-api.railway.app'
foreach ($path in @('/', '/api/health', '/api/images/generate')) {
    try {
        if ($path -eq '/api/images/generate') {
            $body = '{"prompt":"test"}'
            $r = Invoke-WebRequest -Uri "$base$path" -Method POST -ContentType 'application/json' -Body $body -TimeoutSec 10 -UseBasicParsing
        } else {
            $r = Invoke-WebRequest -Uri "$base$path" -TimeoutSec 10 -UseBasicParsing
        }
        Write-Host "=== $path => $($r.StatusCode) ==="
        $content = $r.Content
        if ($content.Length -gt 300) { $content = $content.Substring(0, 300) + '...' }
        Write-Host $content
    } catch {
        $sc = $_.Exception.Response.StatusCode.value__
        Write-Host "=== $path => HTTP $sc ==="
    }
}
