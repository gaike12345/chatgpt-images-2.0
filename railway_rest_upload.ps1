$token = 'WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
$proj = '4f29d041-9e60-45a1-8b96-839eac0fea6c'
$serv = '91e2a6fe-1b8d-446f-9a42-abb655a3f398'
$zipPath = 'C:\Users\Windows\Desktop\chatgpt-images-2.0\backend_deploy.zip'

Add-Type -AssemblyName System.Net.Http
Add-Type -AssemblyName System.IO

$handler = New-Object System.Net.Http.HttpClientHandler
$handler.ServerCertificateCustomValidationCallback = { $true }
$http = New-Object System.Net.Http.HttpClient($handler)
$http.DefaultRequestHeaders.Add('Authorization', "Bearer $token")
$http.DefaultRequestHeaders.Add('railway-origin', 'CLI')

$fs = [System.IO.File]::OpenRead($zipPath)
$content = New-Object System.Net.Http.StreamContent($fs)
$content.Headers.ContentType = New-Object System.Net.Http.Headers.MediaTypeHeaderValue('application/zip')

$size = (New-Object System.IO.FileInfo($zipPath)).Length
$content.Headers.ContentLength = $size

$uploadUrl = "https://backboard.railway.app/v1/upload?projectId=$proj"
Write-Host "Uploading to $uploadUrl ..."

try {
    $task = $http.PutAsync($uploadUrl, $content)
    $resp = $task.Wait(120000)
    if ($resp) {
        $result = $task.Result
        $body = $result.Content.ReadAsStringAsync().Result
        Write-Host "Status: $($result.StatusCode)"
        Write-Host "Body: $body"
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
$fs.Close()