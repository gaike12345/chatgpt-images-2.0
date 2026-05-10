$token = 'WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
$proj = '4f29d041-9e60-45a1-8b96-839eac0fea6c'
$serv = '91e2a6fe-1b8d-446f-9a42-abb655a3f398'
$envId = 'a5982d2a-2901-4363-9e08-d341b7b54526'
$zipPath = 'C:\Users\Windows\Desktop\chatgpt-images-2.0\backend_deploy.zip'

$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
    'railway-origin' = 'CLI'
}

function Invoke-GQL($q, $v = @{}) {
    $body = @{ query = $q; variables = $v } | ConvertTo-Json -Depth 10 -Compress
    try {
        $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body $body -TimeoutSec 30
        return $r
    } catch {
        Write-Host "GQL Error: $($_.Exception.Message)"
        return $null
    }
}

# Get pre-signed upload URL
Write-Host 'Getting upload URL...'
$q = 'mutation artifactCreate($input: ArtifactCreateInput!) { artifactCreate(input: $input) { artifact { id uploadUrl } } }'
$v = @{
    input = @{
        projectId = $proj
        size = (Get-Item $zipPath).Length
        checksum = @()
    }
}
$result = Invoke-GQL $q $v
if (-not $result) { Write-Host "Failed"; exit 1 }

$artifactId = $result.data.artifactCreate.artifact.id
$uploadUrl = $result.data.artifactCreate.artifact.uploadUrl
Write-Host "Artifact ID: $artifactId"
Write-Host "Upload URL: $uploadUrl"

if ([string]::IsNullOrEmpty($uploadUrl)) {
    Write-Host "No upload URL returned - trying direct upload..."
    # Try as raw base64
    $bytes = [System.IO.File]::ReadAllBytes($zipPath)
    $b64 = [Convert]::ToBase64String($bytes)
    $v2 = @{ input = @{ projectId = $proj; size = $bytes.Length; checksum = @(); data = $b64 } }
    $result2 = Invoke-GQL $q $v2
    if ($result2.data.artifactCreate.artifact.id) {
        $artifactId = $result2.data.artifactCreate.artifact.id
        Write-Host "Direct upload OK, artifact: $artifactId"
        $uploadUrl = $null
    }
}

# Upload to S3 if we have a URL
if (-not [string]::IsNullOrEmpty($uploadUrl)) {
    Write-Host "Uploading to S3..."
    try {
        [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
        $bytes = [System.IO.File]::ReadAllBytes($zipPath)
        $r = Invoke-WebRequest -Uri $uploadUrl -Method PUT -Body $bytes -ContentType 'application/zip' -TimeoutSec 120
        Write-Host "Upload status: $($r.StatusCode)"
    } catch {
        Write-Host "S3 upload error: $($_.Exception.Message)"
    }
}

# Create deployment
Write-Host 'Creating deployment...'
$depQ = 'mutation deploymentCreate($input: DeploymentCreateInput!) { deploymentCreate(input: $input) { deployment { id status } } }'
$depV = @{
    input = @{
        projectId = $proj
        serviceId = $serv
        environmentId = $envId
        artifactId = $artifactId
    }
}
$dep = Invoke-GQL $depQ $depV
if ($dep.data) {
    $did = $dep.data.deploymentCreate.deployment.id
    $ds = $dep.data.deploymentCreate.deployment.status
    Write-Host "Deployment created: $did"
    Write-Host "Status: $ds"
    Write-Host "URL: https://railway.app/project/$proj/service/$serv"
} else {
    Write-Host "Deployment failed: $($dep | ConvertTo-Json -Depth 5)"
}