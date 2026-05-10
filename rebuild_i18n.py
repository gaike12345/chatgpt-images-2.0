import os

path = r'C:\Users\Windows\Desktop\chatgpt-images-2.0\frontend\src\App.tsx'
with open(path, 'rb') as f:
    data = f.read()

# Remove BOM if present
if data[:3] == b'\xef\xbb\xbf':
    data = data[3:]

content = data.decode('utf-8')
lines = content.split('\n')

# Find the zh: { line (line 7 = index 6) and the en: { line (line 67 = index 66)
zh_start = None
en_start = None
for i, line in enumerate(lines):
    stripped = line.strip()
    if stripped == 'zh: {':
        zh_start = i
    elif stripped == 'en: {' and zh_start is not None:
        en_start = i
        break

print(f'zh starts at line {zh_start+1}, en starts at line {en_start+1}')

# Build correct zh section
zh_section = '''  zh: {
    appName: '盖可朋友圈 - AI图片生成',
    poweredBy: '多米API 驱动',
    mode: '模式',
    textToImage: '文生图',
    editImage: '图生图',
    prompt: '提示词',
    promptPlaceholderText: '描述你想要生成的图片...',
    promptPlaceholderEdit: '描述你对图片的期望修改...',
    refImage: '参考图片',
    refImageTip: '（上传参考图片进入图生图模式）',
    size: '图片尺寸',
    sizeCustom: '自定义尺寸',
    sizeCustomPlaceholder: '例如：1920×1080',
    quality: '生成质量',
    qualityStandard: '标准',
    qualityHigh: '高清',
    qualityUltra: '超高清',
    number: '数量',
    generate: '✨ 生成图片',
    cancel: '取消',
    submitting: '正在提交...',
    generating: '生成中...',
    generatedCount: '生成{n}张图片',
    clickToView: '点击查看原图',
    download: '下载',
    emptyTipTitle: '输入提示词开始创作',
    emptyTipSub: '支持文生图和图片编辑',
    generatingTitle: '图片生成中',
    generatingSub: '通常需要10-60秒，请耐心等待...',
    taskId: '任务ID',
    errorTitle: '生成失败',
    retry: '重试',
    downloadTip: '💡 提示',
    downloadTipText: '图片已就绪，点击下载按钮可保存到本地',
    downloadTipRetry: '点击上方「生成图片」继续创作',
    error: '请输入提示词',
    history: '历史记录',
    historyEmpty: '暂无历史记录',
    historyDelete: '删除',
    historyClear: '清空全部',
    historyConfirmClear: '确定清空全部历史记录？',
    // model
    modelApi: '后端接口地址',
    modelApiPlaceholder: '例如：http://localhost:3001',
    modelKey: 'API Key',
    modelKeyPlaceholder: '输入你的 API Key',
    modelSave: '保存',
    modelSaved: '✓ 已保存',
    modelTest: '测试',
    modelTestOk: '✓ 连接成功',
    modelTestFail: '✗ 连接失败',
    // sizes
    size_1k: '1K (1024×576)',
    size_2k: '2K (2048×1152)',
    size_4k: '4K (4096×2304)',
    size_1080p: '1080p (1920×1080)',
    size_720p: '720p (1280×720)',
    size_custom: '自定义',
  },'''

# Build replacement: keep lines before zh_start (inclusive), add new zh section, keep lines from en_start onwards
new_lines = lines[:zh_start] + zh_section.split('\n') + lines[en_start:]

new_content = '\n'.join(new_lines)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(new_content)

print('Done! Written back with correct encoding.')
print(f'New line count: {len(new_lines)}')
