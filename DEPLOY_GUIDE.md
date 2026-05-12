# 部署指南 - AI图片生成工作流应用

## 项目结构

```
chatgpt-images-2.0/
├── frontend/          # React + Vite 前端
│   ├── src/
│   │   ├── App.tsx              # 主应用组件
│   │   ├── WorkflowCanvas.tsx   # 工作流画布（已完善）
│   │   └── ...
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json    # Vercel 部署配置
│
└── backend/           # Express + TypeScript 后端
    ├── src/
    │   └── index.ts   # API 服务
    ├── package.json
    ├── Dockerfile     # Railway 部署配置
    └── tsconfig.json
```

## 已完善的功能

### 工作流画布 (WorkflowCanvas.tsx)
✅ 修复所有中文字符乱码
✅ 5种节点类型：文生图、图生图、放大、局部重绘、扩图
✅ 节点生成功能 - 点击按钮调用API
✅ 节点删除功能 - 点击✕按钮
✅ 节点下载功能 - 下载生成的图片
✅ 节点复制功能 - 复制描述词
✅ 图片上传功能 - 支持拖拽和点击上传
✅ 状态显示 - 运行中/完成/错误指示器
✅ 参数配置 - 尺寸选择、种子值、强度调节等
✅ 节点连接 - 拖拽连接线
✅ 右键菜单 - 创建节点
✅ 空画布提示

## 部署步骤

### 1. 前端部署到 Vercel

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 构建项目
npm run build

# 部署到 Vercel
vercel --prod
```

**Vercel 配置** (`vercel.json`):
```json
{
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 2. 后端部署到 Railway

```bash
# 进入后端目录
cd backend

# 使用 Railway CLI 部署
railway up --detach
```

**Dockerfile** 已配置好，Railway 会自动构建和部署。

**环境变量需要在 Railway 控制台设置：**
- `DUOMI_API_KEY` - 多米API密钥
- `WIKE_API_KEY` - Wike API密钥（用于Midjourney）
- `PORT` - 端口（Railway自动分配）

### 3. 更新前端 API URL

部署完成后，更新 `frontend/.env.production`:

```
VITE_API_URL=https://your-railway-app.up.railway.app
```

然后重新部署前端。

## API 端点

后端提供以下 API：

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/models` | GET | 获取可用模型列表 |
| `/api/images/generate` | POST | 提交图片生成任务 |
| `/api/images/task/:taskId` | GET | 查询任务状态 |
| `/api/kling/avatar` | POST | 可灵数字人视频生成 |
| `/api/kling/task/:taskId` | GET | 查询可灵任务状态 |
| `/api/mj/imagine` | POST | Midjourney 图片生成 |
| `/api/mj/task/:taskId` | GET | 查询MJ任务状态 |
| `/api/gpt-image/generate` | POST | GPT Image 2 生成 |
| `/api/gpt-image/task/:taskId` | GET | 查询GPT Image任务 |

## 工作流画布使用说明

### 创建节点
1. **右键点击**画布空白区域
2. 选择节点类型：
   - 🎨 文生图 - 根据文字生成图片
   - 🖼️ 图生图 - 编辑已有图片
   - 📈 图片放大 - 提高分辨率
   - 🎯 局部重绘 - 编辑特定区域
   - 🌅 图片扩展 - 扩展图片边界

### 上传图片
- **拖拽方式**：直接从文件夹拖入图片到画布
- **点击方式**：在图生图节点内点击上传按钮

### 连接节点
1. 从节点的**右侧输出点**拖拽
2. 连接到另一个节点的**左侧输入点**
3. 或拖拽到空白处创建新节点

### 生成图片
1. 在节点内输入**描述词**
2. 选择**尺寸**和**参数**
3. 点击**生成按钮**
4. 等待状态变为完成（绿色指示灯）

### 下载结果
- 点击图片右上角的**下载按钮** ⬇

### 删除节点
- 点击节点右上角的**删除按钮** ✕
- 或选中节点后按 **Delete/Backspace** 键

### 其他操作
- **复制描述词**：点击节点底部的"复制"按钮
- **适应画布**：点击右上角的"适应画布"按钮
- **清空画布**：右键菜单选择"清空画布"

## 支持的模型

1. **Nano-Banana** (Gemini) - 文生图、图生图
2. **GPT-Image-2** - 高质量图片生成
3. **Midjourney** - 艺术风格图片
4. **Kling Avatar** - 数字人视频生成

## 技术栈

- **前端**: React 19 + TypeScript + Vite + @xyflow/react
- **后端**: Express + TypeScript
- **部署**: Vercel (前端) + Railway (后端)
- **API**: 多米API (duomiapi.com)

## 注意事项

1. 确保后端环境变量 `DUOMI_API_KEY` 已设置
2. 前端构建时会读取 `.env.production` 中的 API URL
3. 工作流画布在"图生图"模式下自动显示
4. 节点生成图片需要等待 10-60 秒

## 故障排除

### 前端构建失败
```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 后端部署失败
```bash
# 检查 Dockerfile
# 确保 tsconfig.json 配置正确
# 查看 Railway 日志
railway logs
```

### API 调用失败
1. 检查 `VITE_API_URL` 是否正确
2. 确认后端服务运行正常
3. 检查浏览器控制台网络请求

## 更新日志

### 2025-05-12
- ✅ 重写 WorkflowCanvas.tsx，修复中文乱码
- ✅ 实现完整的节点交互功能
- ✅ 添加节点状态显示
- ✅ 支持图片上传和下载
- ✅ 完善图生图工作流
