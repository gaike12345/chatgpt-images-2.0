$body = @{
    prompt = "A cute cat"
    n = 1
    size = "1024x1024"
    quality = "high"
} | ConvertTo-Json -Compress

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/images/generate" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 120
    Write-Host "SUCCESS:"
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "ERROR: $_"
    Write-Host "Response: $($_.Exception.Response)"
}
