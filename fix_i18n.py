path = r'C:\Users\Windows\Desktop\chatgpt-images-2.0\frontend\src\App.tsx'
with open(path, 'rb') as f:
    data = f.read()
content = data.decode('utf-8')
lines = content.split('\n')

# Print ALL lines in i18n section (lines 5-90) as hex-repr to see exact bytes
import json
output = []
for i in range(4, 95):
    if i < len(lines):
        line = lines[i]
        # Show as printable ASCII or hex for non-ASCII
        safe = ''.join(c if (32 <= ord(c) < 127) else f'\\x{ord(c):02x}' for c in line)
        output.append(f'L{i+1}: {safe}')

with open(r'C:\Users\Windows\Desktop\chatgpt-images-2.0\i18n_dump.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))
print('Done, dumped to i18n_dump.txt')
