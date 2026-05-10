import urllib.request
import json
import sys

token = 'f5ftJR2Hz9DD6x4uFGilZS5Hih-LUxmBQwGn3_4YgIW'
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json',
}

def gql(query, variables=None):
    body = {'query': query}
    if variables:
        body['variables'] = variables
    req = urllib.request.Request(
        'https://backboard.railway.app/graphql/v2',
        data=json.dumps(body).encode(),
        headers=headers
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        return {'_error': e.code, '_body': e.read().decode()}

# Get latest deployment details including logs
dep_id = "6ca00552-b7f0-47ec-adf4-b3db9985f44e"

# Try to get deployment with build/deploy logs
query = '''
{
  deployment(id: "%s") {
    id
    status
    createdAt
    environmentId
    serviceId
    meta {
      buildLog
      deployLog
      startCommand
    }
  }
}
''' % dep_id

r = gql(query)
print(json.dumps(r, indent=2, ensure_ascii=False))
