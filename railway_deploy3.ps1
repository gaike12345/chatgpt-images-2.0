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

# Step 1: Get pre-signed upload URL via GQL
$size = (Get-Item $zipPath).Length
$body = @"
{
  "query": "mutation ArtifactCreate(`$input: ArtifactCreateInput!) { artifactCreate(input: `$input) { artifact { id uploadUrl } } }",
  "variables": {
    "input": {
      "projectId": "$proj",
      "size": $size,
      "checksum": []
    }
  }
}
"@
Write-Host 'Step 1: Getting pre-signed upload URL...'
try {
    $r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body $body -TimeoutSec 30
    $artifactId = $r.data.artifactCreate.artifact.id
    $uploadUrl = $r.data.artifactCreate.artifact.uploadUrl
    Write-Host "Artifact ID: $artifactId"
    Write-Host "Upload URL present: $(-not [string]::IsNullOrEmpty($uploadUrl))"
} catch {
    Write-Host "Step 1 Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
    exit 1
}

if (-not $artifactId) {
    Write-Host "No artifact ID returned"
    exit 1
}

# Step 2: Upload ZIP to S3 pre-signed URL
if (-not [string]::IsNullOrEmpty($uploadUrl)) {
    Write-Host 'Step 2: Uploading to S3...'
    try {
        $bytes = [System.IO.File]::ReadAllBytes($zipPath)
        $wr = [System.Net.WebRequest]::Create($uploadUrl)
        $wr.Method = 'PUT'
        $wr.ContentType = 'application/zip'
        $wr.ContentLength = $bytes.Length
        $wr.AllowAutoRedirect = $true
        $st = $wr.GetRequestStream()
        $st.Write($bytes, 0, $bytes.Length)
        $st.Close()
        $resp = $wr.GetResponse()
        Write-Host "S3 Upload status: $($resp.StatusCode)"
        $resp.Close()
    } catch {
        Write-Host "S3 Upload error: $($_.Exception.Message)"
    }
}

# Step 3: Create deployment
Write-Host 'Step 3: Creating deployment...'
$depBody = @"
{
  "query": "mutation DeploymentCreate(`$input: DeploymentCreateInput!) { deploymentCreate(input: `$input) { deployment { id status } } }",
  "variables": {
    "input": {
      "projectId": "$proj",
      "serviceId": "$serv",
      "environmentId": "$envId",
      "artifactId": "$artifactId"
    }
  }
}
"@
try {
    $dep = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Headers $headers -Method POST -Body $depBody -TimeoutSec 30
    $did = $dep.data.deploymentCreate.deployment.id
    $ds = $dep.data.deploymentCreate.deployment.status
    Write-Host "Deployment: $did"
    Write-Host "Status: $ds"
    Write-Host "URL: https://railway.app/project/$proj/service/$serv"
} catch {
    Write-Host "Deployment Error: $($_.Exception.Message)"
}