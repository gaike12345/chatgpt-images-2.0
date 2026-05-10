path = r'C:\Users\Windows\Desktop\chatgpt-images-2.0\frontend\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Line 526 - fullwidth colon followed by { causes JSX parse error
content = content.replace('{t.number}\uff1a{s.n}', '{t.number}: {s.n}')
print('Fix 1 applied')

# Verify no more issues with curly braces followed by fullwidth chars
issues = []
for i, l in enumerate(content.split('\n'), 1):
    for j in range(len(l)-1):
        if l[j] in '\uff01\uff08\uff09\uff1a\uff1b\uff1f' and l[j+1] == '{':
            issues.append((i, j, repr(l[max(0,j-10):j+15])))
print(f'Potential JSX issues: {len(issues)}')
for item in issues[:10]:
    print(f'  L{item[0]} pos {item[1]}: {item[2]}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Saved.')
