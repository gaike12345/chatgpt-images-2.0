$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

Write-Host "=== 获取用户项目列表（找实际 service URL）==="
$body = @{ query = '{ me { id email projects(first:5) { edges { node { id name services { id name } } } } } }' }
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json -Compress) -TimeoutSec 15
    if ($r.data) {
        $r.data.me.projects.edges | ForEach-Object {
            $proj = $_.node
            Write-Host ""
            Write-Host "Project: $($proj.name) [$($proj.id)]"
            $proj.services | ForEach-Object {
                Write-Host "  Service: $($_.name) [$($_.id)]"
            }
        }
    } else {
        Write-Host ($r | ConvertTo-Json)
    }
} catch {
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "=== 尝试 serviceRedeploy 变体 ==="
# Try without input wrapper
$body2 = @{ query = 'mutation { serviceRedeploy(serviceId:"91e2a6fe-1b8d-446f-9a42-abb655a3f398") { deployment { id status } } }' }
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body2 | ConvertTo-Json -Compress) -TimeoutSec 20
    Write-Host ($r | ConvertTo-Json)
} catch {
    Write-Host "Variant1: $($_.Exception.Message)"
}

# Try another variant
$body3 = @{ query = 'mutation { redeployService(id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398") { id } }' }
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body3 | ConvertTo-Json -Compress) -TimeoutSec 20
    Write-Host ($r | ConvertTo-Json)
} catch {
    Write-Host "Variant2: $($_.Exception.Message)"
}