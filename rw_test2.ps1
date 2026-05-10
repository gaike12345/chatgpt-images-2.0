$env:RAILWAY_TOKEN = 'WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
$railwayJs = "C:\Users\Windows\AppData\Roaming\QClaw\npm-global\node_modules\@railway\cli\bin\railway.js"

Write-Host "Testing Railway CLI..."
Write-Host "Exe: $railwayJs"

# Try simple command
$p = Start-Process -FilePath 'node' -ArgumentList $railwayJs, 'whoami' `
    -NoNewWindow -PassThru -Wait -RedirectStandardOutput "$env:TEMP\rw_who.txt" -RedirectStandardError "$env:TEMP\rw_who_err.txt"
Write-Host "Exit: $($p.ExitCode)"
Write-Host "OUT: $(Get-Content "$env:TEMP\rw_who.txt" -ErrorAction SilentlyContinue)"
Write-Host "ERR: $(Get-Content "$env:TEMP\rw_who_err.txt" -ErrorAction SilentlyContinue)"