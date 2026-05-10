Add-Type -AssemblyName System.IO.Compression.FileSystem
$ErrorActionPreference = 'Stop'
$zipPath = 'C:\Users\Windows\Desktop\chatgpt-images-2.0\backend_deploy.zip'
if (Test-Path $zipPath) { Remove-Item $zipPath }
[System.IO.Compression.ZipFile]::CreateFromDirectory('C:\Users\Windows\Desktop\chatgpt-images-2.0\backend', $zipPath)
Write-Host ('ZIP created: ' + (Get-Item $zipPath).Length)