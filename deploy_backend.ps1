$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
$ErrorActionPreference = "Continue"
$proj = "4f29d041-9e60-45a1-8b96-839eac0fea6c"
$serv = "chatgpt-images-api"
$log = "$env:TEMP\rw_$PID.log"
$err = "$env:TEMP\rw_err_$PID.log"
Write-Host "=== Deploying backend to project $proj service $serv ==="
$proc = Start-Process -FilePath "C:\Users\Windows\AppData\Roaming\QClaw\npm-global\railway.cmd" -ArgumentList "up --detach --project $proj --service $serv" -NoNewWindow -PassThru -RedirectStandardOutput $log -RedirectStandardError $err -Wait
Write-Host "Exit code: $($proc.ExitCode)"
if (Test-Path $log) { Write-Host "STDOUT: $(Get-Content $log -Raw)" }
if (Test-Path $err) { Write-Host "STDERR: $(Get-Content $err -Raw)" }