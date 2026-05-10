path = r'C:\Users\Windows\Desktop\chatgpt-images-2.0\frontend\src\App.tsx'
with open(path, 'rb') as f:
    data = f.read()
content = data.decode('utf-8')
lines = content.split('\n')
print(f'Total lines: {len(lines)}')

# Find lines with em-dash (U+2014 = —, U+2013 = –, U+2500 = ─)
import re
matches = []
for i, l in enumerate(lines):
    for m in re.finditer('[\u2014\u2013\u2500\u2012]', l):
        matches.append((i+1, m.start(), l[:m.start()+20]))

print(f'Problematic chars: {len(matches)}')
for ln, pos, ctx in matches[:20]:
    print(f'  Line {ln} pos {pos}: {ctx}')

# Also check for the specific comment pattern
for i, l in enumerate(lines[:5], 1):
    print(f'Line {i}: bytes={[hex(b) for b in l.encode("utf-8")[:30]]}')
