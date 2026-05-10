import sys
path = r'C:\Users\Windows\Desktop\chatgpt-images-2.0\frontend\src\App.tsx'
with open(path, 'rb') as f:
    data = f.read()
lines = data.decode('utf-8').split('\n')
print(f'Total lines: {len(lines)}')

# Check for truncated strings (lines ending with comma but missing closing quote)
issues = []
for i, line in enumerate(lines, 1):
    stripped = line.strip()
    # String literals that start with ' but end with comma instead of closing '
    if stripped.startswith("'") and not stripped.endswith("',") and not stripped.endswith("'") and "," in stripped:
        if "'" in stripped[1:]:
            issues.append((i, stripped[:80]))

print(f'Problematic lines: {len(issues)}')
for ln, content in issues:
    print(f'  Line {ln}: {repr(content)}')
