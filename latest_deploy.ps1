$token = (Get-Content C:\Users\Windows\.railway\config.json | ConvertFrom-Json).accessToken
$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}
$query = @{
    query = @"
    {
      project(id: "4f29d041-9e60-45a1-8b96-839eac0fea6c") {
        services {
          edges {
            node {
              id
              name
              deployments(first: 2) {
                edges {
                  node {
                    id
                    status
                    createdAt
                  }
                }
              }
            }
          }
        }
      }
    }
"@
} | ConvertTo-Json -Compress
$r = Invoke-RestMethod -Uri 'https://backboard.railway.app/graphql/v2' -Method POST -Headers $headers -Body $query
$r.data | ConvertTo-Json -Depth 6
