path = r'C:\Users\Windows\Desktop\chatgpt-images-2.0\frontend\src\App.tsx'
with open(path, 'rb') as f:
    data = bytearray(f.read())

# Fix: missing { in {s.n} on line 526
# Current: 7d 3a 73 2e 6e 7d = }:s.n}
# Should be: 7d 3a 7b 73 2e 6e 7d = }:{s.n}
old = b'\x7d\x3a\x73\x2e\x6e\x7d'
new = b'\x7d\x3a\x7b\x73\x2e\x6e\x7d'

idx = data.find(old)
if idx != -1:
    print(f'Found at byte {idx}')
    data[idx:idx+len(old)] = new
    print('Fixed: restored missing { in {s.n}')
else:
    print('NOT FOUND - trying to locate the issue differently')
    # Search for the specific line context
    old2 = b'6e756d6265727d3a'
    idx2 = data.find(old2)
    if idx2 != -1:
        print(f'Found context at byte {idx2}')
        # bytes around: ...number}：s.n}
        # we want: ...number}:{s.n}
        # 3a is : (already correct), need to insert 7b before 73
        # After old2 (e9 94 9b...) the s.n should have {
        # Let's find the pattern around number}:s.n}
        pass

with open(path, 'wb') as f:
    f.write(data)
print('Saved.')
