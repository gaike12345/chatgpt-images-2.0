$ErrorActionPreference = "Continue"
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
$env:CI = "true"
$logFile = "$env:TEMP\rw_test.log"
$errFile = "$env:TEMP\rw_err.log"
$proc = Start-Process -FilePath "node" -ArgumentList "`"C:\Users\Windows\AppData\Roaming\QClaw\npm-global\node_modules\@railway\cli\bin\railway.js`" project list --json" -NoNewWindow -PassThru -RedirectStandardOutput $logFile -RedirectStandardError $errFile
$timedOut = $null
try {
    $completed = $proc.WaitForExit(15000)
    Write-Host "Completed: $completed, ExitCode: $($proc.ExitCode)"
} catch {
    Write-Host "Timeout or error: $_"
}
if (Test-Path $logFile) { Write-Host "STDOUT: $(Get-Content $logFile -Raw)" }
if (Test-Path $errFile) { Write-Host "STDERR: $(Get-Content $errFile -Raw)" }