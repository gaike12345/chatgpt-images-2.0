path = r'C:\Users\Windows\Desktop\chatgpt-images-2.0\frontend\src\App.tsx'
with open(path, 'rb') as f:
    data = bytearray(f.read())

# The corrupted line 526 has: 7d e9 94 9b e6 ad bf 73 2e 6e 7d
# Should be: 7d e5 85 be 73 2e 6e 7d (} : s . n })
# Fix: replace e9 94 9b e6 ad bf with e5 85 be
old = b'\x7d\xe9\x94\x9b\xe6\xad\xbf\x73\x2e\x6e\x7d'
new = b'\x7d\xe5\x85\xbe\x73\x2e\x6e\x7d'

idx = data.find(old)
if idx != -1:
    print(f'Found at byte {idx}')
    data[idx:idx+len(old)] = new
    print('Replaced!')
else:
    print('NOT FOUND - trying different pattern')
    # Try to find just the corrupted part
    old2 = b'\xe9\x94\x9b\xe6\xad\xbf'
    idx2 = data.find(old2)
    if idx2 != -1:
        print(f'Found corrupted bytes at {idx2}')
        data[idx2:idx2+len(old2)] = b'\xe5\x85\xbe'
        print('Replaced!')

with open(path, 'wb') as f:
    f.write(data)
print('Saved.')
