$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

# Key finding: isUpdatable=False means Railway can't figure out how to build/run the service
# All build config is empty → Railway likely failed to detect buildpack

# Try to redeploy with explicit start command via GraphQL mutation
# First let's check what createDeployment looks like
$body = @{ query = '{ __type(name: "Mutation") { fields { name description args { name type { name } } } } }' }
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json) -TimeoutSec 15
    $r.data.__type.fields | Where-Object { $_.name -match 'deploy' -or $_.name -match 'updat' -or $_.name -match 'restart' } | ForEach-Object {
        Write-Host "Mutation: $($_.name)"
        $_.args | ForEach-Object { Write-Host "  arg: $($_.name) : $($_.type.name)" }
    }
} catch {
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "=== Key insight ==="
Write-Host "isUpdatable=False → Railway doesn't know how to build/run this service"
Write-Host "All fields empty → no Dockerfile, no buildpack, no start command detected"
Write-Host "The 'npx railway up' upload succeeded but Railway couldn't build it"