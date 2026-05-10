$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
$result = & "C:\Users\Windows\AppData\Roaming\QClaw\npm-global\railway.cmd" project list --json 2>&1
Write-Host "STDOUT: $($result | Out-String)"