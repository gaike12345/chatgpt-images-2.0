path = r'C:\Users\Windows\Desktop\chatgpt-images-2.0\frontend\src\App.tsx'
with open(path, 'rb') as f:
    data = f.read()
content = data.decode('utf-8')
lines = content.split('\n')

# Find the i18n section header comment (line 3)
line3 = lines[2]  # 0-indexed
print('Line 3:', [hex(b) for b in line3.encode('utf-8')])
print('Line 3 chars:', [hex(ord(c)) for c in line3])

# Also check the TS errors - line 11, 12 etc.
for ln in [10, 11, 12, 13, 34, 35]:
    l = lines[ln]
    print(f'Line {ln+1}: {repr(l[:100])}')
