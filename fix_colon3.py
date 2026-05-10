path = r'C:\Users\Windows\Desktop\chatgpt-images-2.0\frontend\src\App.tsx'
with open(path, 'rb') as f:
    data = bytearray(f.read())

# Fix: replace U+FF1A fullwidth colon (ef bc 9a) with ASCII colon (3a)
# Pattern in line 526: 7d ef bc 9a 73 2e 6e 7d -> 7d 3a 73 2e 6e 7d
old = b'\x7d\xef\xbc\x9a\x73\x2e\x6e\x7d'
new = b'\x7d\x3a\x73\x2e\x6e\x7d'

idx = data.find(old)
if idx != -1:
    print(f'Found at byte {idx}')
    data[idx:idx+len(old)] = new
    print('Replaced!')
else:
    print('NOT FOUND')

with open(path, 'wb') as f:
    f.write(data)
print('Saved.')
