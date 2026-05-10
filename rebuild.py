path = r'C:\Users\Windows\Desktop\chatgpt-images-2.0\frontend\src\App.tsx'
with open(path, 'rb') as f:
    data = f.read()
content = data.decode('utf-8')
lines = content.split('\n')

# Check what line 129 comment looks like (line 129 in 1-indexed = index 128)
print(f'Total lines: {len(lines)}')
for i in range(126, 135):
    if i < len(lines):
        line = lines[i]
        safe = ''.join(c if (32 <= ord(c) < 127) else f'\\u{ord(c):04x}' for c in line)
        print(f'L{i+1}: {safe[:100]}')
