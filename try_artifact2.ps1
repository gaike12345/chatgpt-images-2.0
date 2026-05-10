$token = 'WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
$proj = '4f29d041-9e60-45a1-8b96-839eac0fea6c'
$serv = '91e2a6fe-1b8d-446f-9a42-abb655a3f398'
$envId = 'a5982d2a-2901-4363-9e08-d341b7b54526'
$zipPath = 'C:\Users\Windows\Desktop\chatgpt-images-2.0\backend_deploy.zip'

$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
    'railway-origin' = 'CLI'
}

$size = (Get-Item $zipPath).Length

$body = @{
    query = 'mutation($pid: String!, $size: Int!) { artifactCreate(input: { projectId: $pid, size: $size, checksum: [] }) { artifact { id uploadUrl } } }'
    variables = @{
        pid = $proj
        size = $size
    }
} | ConvertTo-Json -Depth 10

Write-Host 'Trying GQL artifactCreate...'
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body $body -TimeoutSec 20
    $r | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    $s = $_.Exception.Response
    if ($s) {
        $sr = $s.GetResponseStream()
        $sr.Position = 0
        $reader = New-Object System.IO.StreamReader($sr)
        Write-Host "Response: $($reader.ReadToEnd())"
    }
}