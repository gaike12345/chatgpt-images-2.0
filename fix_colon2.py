path = r'C:\Users\Windows\Desktop\chatgpt-images-2.0\frontend\src\App.tsx'
with open(path, 'rb') as f:
    data = bytearray(f.read())

# Fix: replace U+FF1A fullwidth colon (ef bc 9a) immediately before { with ASCII colon (3a)
# Pattern: 7d ef bc 9a 7b -> 7d 3a 7b  (} ： {  ->  } : {)
old = b'\x7d\xef\xbc\x9a\x7b'
new = b'\x7d\x3a\x7b'

idx = data.find(old)
if idx != -1:
    print(f'Found at byte {idx}')
    data[idx:idx+len(old)] = new
    print('Replaced fullwidth colon with ASCII colon!')
else:
    print('Pattern not found')

with open(path, 'wb') as f:
    f.write(data)
print('Saved.')
