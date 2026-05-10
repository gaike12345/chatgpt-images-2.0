Set-Location 'C:\Users\Windows\Desktop\chatgpt-images-2.0\backend'
$env:CI = 'true'
$env:NODE_TLS_REJECT_UNAUTHORIZED = '0'
$env:RAILWAY_TOKEN = 'WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
$log = "$env:TEMP\rw_up2.log"
$errLog = "$env:TEMP\rw_up2.err"
$railwayExe = "node"
$railwayJs = "C:\Users\Windows\AppData\Roaming\QClaw\npm-global\node_modules\@railway\cli\bin\railway.js"
$proc = Start-Process -FilePath $railwayExe -ArgumentList $railwayJs, 'up', '--detach' -NoNewWindow -PassThru -RedirectStandardOutput $log -RedirectStandardError $errLog -WorkingDirectory 'C:\Users\Windows\Desktop\chatgpt-images-2.0\backend'
Write-Host ("Started PID: " + $proc.Id)
Start-Sleep 3
Write-Host "Process running: " + (-not $proc.HasExited)
if (-not $proc.HasExited) {
    Write-Host "Waiting up to 120s..."
    $ok = $proc.WaitForExit(120000)
    Write-Host ("Exited: " + $proc.HasExited + " / Code: " + $proc.ExitCode)
}
if (Test-Path $log) { Write-Host "--- STDOUT ---"; Get-Content $log }
if (Test-Path $errLog) { Write-Host "--- STDERR ---"; Get-Content $errLog }