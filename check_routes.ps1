$base = 'https://chatgpt-images-api.railway.app'
foreach ($path in @('/', '/health', '/api/health')) {
    try {
        $r = Invoke-WebRequest -Uri "$base$path" -TimeoutSec 10 -UseBasicParsing
        Write-Host "=== $path => $($r.StatusCode) ==="
        Write-Host $r.Content
        Write-Host ""
    } catch {
        $sc = $_.Exception.Response.StatusCode.value__
        Write-Host "=== $path => HTTP $sc ==="
        try {
            $sr = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            Write-Host $sr.ReadToEnd()
            $sr.Close()
        } catch {
            Write-Host "(no body)"
        }
        Write-Host ""
    }
}
