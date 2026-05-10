Set-Location 'C:\Users\Windows\Desktop\chatgpt-images-2.0\backend'
$env:CI = 'true'
$env:NODE_TLS_REJECT_UNAUTHORIZED = '0'
$log = "$env:TEMP\rw_up.log"
$err = "$env:TEMP\rw_up.err"
$railwayJs = "C:\Users\Windows\AppData\Roaming\QClaw\npm-global\node_modules\@railway\cli\bin\railway.js"
$p = Start-Process -FilePath 'node' -ArgumentList "`"$railwayJs`" up --detach" -NoNewWindow -PassThru -RedirectStandardOutput $log -RedirectStandardError $err
$null = $p.WaitForExit(60000)
Write-Host ('Exit: ' + $p.ExitCode)
if (Test-Path $log) { Write-Host 'OUT:'; Get-Content $log }
if (Test-Path $err) { Write-Host 'ERR:'; Get-Content $err }