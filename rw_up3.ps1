$ErrorActionPreference = 'Continue'
$env:CI = 'true'
$env:RAILWAY_TOKEN = 'WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
$railwayJs = "C:\Users\Windows\AppData\Roaming\QClaw\npm-global\node_modules\@railway\cli\bin\railway.js"
$log = "$env:TEMP\rw_log.txt"
$err = "$env:TEMP\rw_err.txt"

Write-Host "Starting Railway upload from backend directory..."
Write-Host "Token: $($env:RAILWAY_TOKEN.Substring(0,10))..."

$p = Start-Process -FilePath 'node' -ArgumentList "`"$railwayJs`" up --detach" `
    -WorkingDirectory 'C:\Users\Windows\Desktop\chatgpt-images-2.0\backend' `
    -NoNewWindow -PassThru `
    -RedirectStandardOutput $log -RedirectStandardError $err

Write-Host "Process started: $($p.Id)"
Start-Sleep 5
Write-Host "HasExited: $($p.HasExited), ExitCode: $($p.ExitCode)"

if (-not $p.HasExited) {
    Write-Host "Waiting up to 300s..."
    $done = $p.WaitForExit(300000)
    Write-Host "Wait completed: $done, HasExited: $($p.HasExited)"
}

Start-Sleep 2
Write-Host "--- STDOUT ---"
if (Test-Path $log) { Get-Content $log }
Write-Host "--- STDERR ---"
if (Test-Path $err) { Get-Content $err }