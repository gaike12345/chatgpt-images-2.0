$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

$depId = '28c9a937-3303-4a86-9a4f-464f9e83c600'

Write-Host "=== 检查新部署状态 ==="
$body = @{
    query = '{ service(id:"91e2a6fe-1b8d-446f-9a42-abb655a3f398") { deployments(first:3) { edges { node { id status createdAt updatedAt } } } } }'
}
$r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json) -TimeoutSec 15
if ($r.data) {
    $r.data.service.deployments.edges | ForEach-Object {
        $d = $_.node
        Write-Host "  $($d.id) - $($d.status) - $($d.createdAt)"
    }
} else {
    Write-Host ($r | ConvertTo-Json)
}

Write-Host ""
Write-Host "=== 测试后端是否已启动 ==="
$urls = @(
    'https://chatgpt-images-api.railway.app/',
    'https://chatgpt-images-api.railway.app/api/health',
    'https://chatgpt-images-api.railway.app/api/images/generate'
)
foreach ($u in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $u -Method GET -TimeoutSec 8 -UseBasicParsing
        Write-Host "OK $($r.StatusCode): $u"
        Write-Host "  $($r.Content.Substring(0, 200))"
    } catch {
        $e = $_.Exception
        if ($e.Response) {
            Write-Host "HTTP $($e.Response.StatusCode.value__): $u"
        } else {
            Write-Host "ERROR: $u - $($e.Message.Substring(0,80))"
        }
    }
}