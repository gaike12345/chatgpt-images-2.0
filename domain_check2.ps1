$headers = @{
    'Authorization' = 'Bearer WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
    'Content-Type' = 'application/json'
}

$body = @{ query = '{ __type(name: "ServiceDomain") { fields { name type { name kind ofType { name kind } } } } }' }

try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json) -TimeoutSec 15
    $r.data.__type.fields | ForEach-Object {
        $t = $_.type
        Write-Host "$($_.name): $($t.name) ($($t.kind)) ofType=$($t.ofType.name)"
    }
} catch {
    Write-Host $_.Exception.Message
}

Write-Host ""

# Get domains through environment
$body.query = '{ project(id: "4f29d041-9e60-45a1-8b96-839eac0fea6c") { name environments(first: 3) { edges { node { id name serviceInstances(first: 3) { edges { node { id serviceName serviceDomains { id domain suffix targetPort } } } } } } } } }'
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body ($body | ConvertTo-Json) -TimeoutSec 15
    $envs = $r.data.project.environments.edges
    $envs | ForEach-Object {
        $env = $_.node
        Write-Host "Environment: $($env.name) ($($env.id))"
        $env.serviceInstances.edges | ForEach-Object {
            $inst = $_.node
            Write-Host "  Instance: $($inst.serviceName) ($($inst.id))"
            $inst.serviceDomains.psObject.properties | ForEach-Object {
                Write-Host "    Domain: $($_.value | ConvertTo-Json)"
            }
        }
    }
} catch {
    Write-Host "Environment domains: $($_.Exception.Message)"
}

Write-Host ""

# Also try to hit the actual backend URL
$uri = "https://d9e04a9e-2c7e-42a2-bca9-841fe03d54af.up.railway.app/api/images/generate"
try {
    $r = Invoke-WebRequest -Uri $uri -Method GET -TimeoutSec 10
    Write-Host "Backend: $($r.StatusCode)"
} catch {
    $status = $_.Exception.Response.StatusCode
    Write-Host "Backend response: $status"
}