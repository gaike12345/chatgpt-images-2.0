path = r'C:\Users\Windows\Desktop\chatgpt-images-2.0\frontend\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix line 741 (index 740): replace corrupted content with correct ✨
lines[740] = "                  <div style={{ fontSize: 52 }}>\u2728</div>\n"

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Fixed! Verifying...')

# Verify
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
new_lines = content.split('\n')
print(f'L741: {repr(new_lines[740][:80])}')
# Check for any remaining bad chars
bad = [f'U+{ord(c):04X}' for line in new_lines for c in line if ord(c) >= 0xE000 and ord(c) != 0x2728]
print(f'Remaining bad chars: {bad}')
