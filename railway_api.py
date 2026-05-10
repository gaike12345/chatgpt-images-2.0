import urllib.request
import json

token = 'WC1FNXgOSy92WGUEqV3o4iLJ_WDllK1I-RYLs4m4d0e'
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

# Simple queries only (avoid complex nested ones that might 403)
queries = [
    ('service', '{ service(id: "91e2a6fe-1b8d-446f-9a42-abb655a3f398") { id name } }'),
    ('deployment', '{ deployment(id: "4a2da2d6-b16e-488f-a92f-b7f9014f0dfb") { id status createdAt } }'),
    ('project', '{ project(id: "4f29d041-9e60-45a1-8b96-839eac0fea6c") { id name } }'),
    # Try simple mutation (may 403)
    ('redepoly', 'mutation { serviceRedeploy(input: { serviceId: "91e2a6fe-1b8d-446f-9a42-abb655a3f398" }) { deployment { id status } } }'),
]

for label, query in queries:
    r = gql(query)
    if '_error' in r:
        print(f'=== {label} === HTTP {r["_error"]}: {r["_body"][:200]}')
    elif 'errors' in r:
        print(f'=== {label} === Error: {r["errors"][0]["message"]}')
    else:
        print(f'=== {label} === OK')