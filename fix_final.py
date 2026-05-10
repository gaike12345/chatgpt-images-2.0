path = r'C:\Users\Windows\Desktop\chatgpt-images-2.0\frontend\src\App.tsx'
with open(path, 'rb') as f:
    data = bytearray(f.read())

# Fix 1: U+517E (e5 85 be) -> U+FF1A fullwidth colon (ef bc 9a)
old1 = b'\x7d\xe5\x85\xbe\x73\x2e\x6e\x7d'
new1 = b'\x7d\xef\xbc\x9a\x73\x2e\x6e\x7d'
idx1 = data.find(old1)
if idx1 != -1:
    print(f'Fix1: Found at byte {idx1}')
    data[idx1:idx1+len(old1)] = new1
    print('Fix1 applied!')
else:
    print('Fix1: NOT FOUND')

# Also scan for any remaining corrupted Chinese (non-BMP or unusual ranges)
corruptions = []
for i in range(len(data)):
    b = data[i]
    # Check for continuation byte appearing alone or at start
    if (0x80 <= b <= 0xBF):
        corruptions.append(('cont_byte', i, b))
    # Check for lone lead bytes
    if (0xC0 <= b <= 0xDF) or (0xE0 <= b <= 0xEF) or (0xF0 <= b <= 0xF7):
        corruptions.append(('lead_byte', i, b))

print(f'Potential corruptions: {len(corruptions)}')
for ctype, pos, byte_val in corruptions[:20]:
    print(f'  {ctype} at {pos}: 0x{byte_val:02x}')

with open(path, 'wb') as f:
    f.write(data)
print('Saved.')
